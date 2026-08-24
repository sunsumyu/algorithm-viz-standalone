/**
 * 算法可视化画板应用总协调器深度模块 (VisualizerAppController Deep Module)
 * 遵循深度模块原则：
 * 将模型装载、状态推导、时间轴播放、网格/槽位渲染、代码高亮联动与 URL Hash 状态保持
 * 彻底封装进一个自治的状态机控制器中。
 * 外部 HTML 仅需声明 DOM 容器骨架并调用 controller.init()。
 */

import { AlgorithmModelRepository } from './model-repository';
import { UniversalStageEngine, type UniversalStep } from './universal-stage-engine';
import { VisualizerStateRouter, type VisualizerState } from './state-router';
import { GridVisualAdapter, RecursionTreeAdapter } from './renderers/grid-visual-adapter';
import { PlaybackTimelineController } from './playback-timeline-controller';
import { VisualThemeManager } from './theme/visual-theme-manager';
import type { IYamlAlgorithmModel } from './interfaces';

export type VisualizerMode = 'lite' | 'full';

export interface VisualizerAppControllerOptions {
  /** 模式：lite (极速看板版) 或 full (全景精讲版) */
  mode?: VisualizerMode;
  /** 默认算法模型 ID (默认从 ?model= URL 参数读取，无则为 'unique-paths') */
  defaultModelId?: string;
  /** 默认视觉主题 ID */
  defaultTheme?: string;
}

export class VisualizerAppController {
  private mode: VisualizerMode;
  private modelId: string;
  private model: IYamlAlgorithmModel;
  private currentStage: string;
  private currentDirection: 'forward' | 'reverse' = 'forward';
  private currentStageVariant = 'if';
  private m = 3;
  private n = 4;
  private steps: UniversalStep[] = [];
  private timeline: PlaybackTimelineController | null = null;
  private themeManager: VisualThemeManager;
  private isDestroyed = false;

  constructor(options: VisualizerAppControllerOptions = {}) {
    this.mode = options.mode || 'lite';
    this.themeManager = VisualThemeManager.getInstance({ defaultTheme: options.defaultTheme });
    
    // 解析 URL 参数或全局变量获取 modelId
    let requestedId = options.defaultModelId;
    if (typeof window !== 'undefined') {
      if ((window as any).__DEFAULT_MODEL_ID) {
        requestedId = (window as any).__DEFAULT_MODEL_ID;
      }
      if (window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlModel = urlParams.get('model');
        if (urlModel) requestedId = urlModel;
      }
    }
    this.modelId = requestedId && AlgorithmModelRepository.hasModel(requestedId)
      ? requestedId
      : 'unique-paths';

    this.model = AlgorithmModelRepository.hasModel(this.modelId)
      ? AlgorithmModelRepository.getModel(this.modelId)
      : AlgorithmModelRepository.getModel('unique-paths');

    this.currentStage = this.model?.defaultStage || 'stage-1';
  }

  /**
   * 初始化应用控制器
   */
  public init(): void {
    if (typeof document === 'undefined') return;

    // 0. 从 URL Hash 恢复持久化状态与主题
    const restored = VisualizerStateRouter.restore();
    let targetStep = 0;
    if (restored) {
      if (restored.stage) this.currentStage = restored.stage;
      if (restored.dir) this.currentDirection = restored.dir;
      if (restored.variant) this.currentStageVariant = restored.variant;
      if (restored.theme) this.themeManager.setTheme(restored.theme, true);
      if (restored.m) {
        this.m = restored.m;
        const inputM = document.getElementById('input-m') as HTMLInputElement | null;
        if (inputM) inputM.value = String(restored.m);
      }
      if (restored.n) {
        this.n = restored.n;
        const inputN = document.getElementById('input-n') as HTMLInputElement | null;
        if (inputN) inputN.value = String(restored.n);
      }
      if (restored.step !== undefined) targetStep = restored.step;
    }

    // 应用主题并装配顶栏主题选择器
    this.themeManager.applyThemeToDom();
    this.renderThemeSelector();
    this.themeManager.subscribe(() => {
      if (this.steps.length > 0) {
        const curStep = this.timeline ? this.timeline.getCurrentStep() : 0;
        this.syncStateToHash(curStep);
      }
    });

    // 1. 从模型注入默认网格参数 (若未被 hash 覆盖)
    if (this.model.defaultParams && (!restored || (!restored.m && !restored.n))) {
      const inputM = document.getElementById('input-m') as HTMLInputElement | null;
      const inputN = document.getElementById('input-n') as HTMLInputElement | null;
      if (inputM && this.model.defaultParams.m !== undefined) {
        inputM.value = String(this.model.defaultParams.m);
        this.m = Number(this.model.defaultParams.m);
      }
      if (inputN && this.model.defaultParams.n !== undefined) {
        inputN.value = String(this.model.defaultParams.n);
        this.n = Number(this.model.defaultParams.n);
      }
    }

    // 2. 构建顶部导航选项卡
    this.renderStageTabs();
    this.renderDirectionTabs();

    // 4. 初始化 PlaybackTimelineController
    const playIcon = document.getElementById('play-icon');
    const textPlayState = document.getElementById('text-play-state');
    const iconPlayState = document.getElementById('icon-play-state');

    this.timeline = new PlaybackTimelineController({
      getTotalSteps: () => this.steps.length,
      onStep: (index) => this.renderStep(index),
      onStateChange: (isPlaying) => {
        if (playIcon) playIcon.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
        if (textPlayState) textPlayState.textContent = isPlaying ? '暂停播放' : '自动播放';
        if (iconPlayState) iconPlayState.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
      },
      defaultSpeed: 900,
      initialStep: targetStep
    });

    // 5. 绑定全局控制交互事件
    this.bindEvents();

    // 6. 初次装载与步骤推导计算
    this.loadAndReset();

    // 7. 定位到指定步数
    if (targetStep > 0 && targetStep < this.steps.length) {
      this.timeline.seek(targetStep);
    }
  }

  /**
   * 重新读取尺寸、派发步骤生成并重置播放
   */
  public loadAndReset(): void {
    if (this.isDestroyed || typeof document === 'undefined') return;

    const inputM = document.getElementById('input-m') as HTMLInputElement | null;
    const inputN = document.getElementById('input-n') as HTMLInputElement | null;
    this.m = parseInt(inputM?.value || String(this.m)) || 3;
    this.n = parseInt(inputN?.value || String(this.n)) || 4;
    this.m = Math.min(Math.max(this.m, 1), 8);
    this.n = Math.min(Math.max(this.n, 1), 8);

    if (inputM) inputM.value = String(this.m);
    if (inputN) inputN.value = String(this.n);

    const stageConfig = AlgorithmModelRepository.getCompiledStage(this.model.id, this.currentStage, this.currentDirection);
    if (!stageConfig) return;

    // 更新页面标题与描述信息
    this.updateHeaderMeta(stageConfig);

    // 更新代码面板与变体选项卡
    this.updateCodePanel(stageConfig);

    // 若为 Full 模式，重构 2D 初始网格及 1D 骨架
    if (this.mode === 'full') {
      this.rebuildFullLayout();
    }

    // 生成当前阶段的执行步骤
    const anchorMap = (stageConfig.variants?.[this.currentStageVariant])
      ? stageConfig.variants[this.currentStageVariant].anchorMap
      : stageConfig.anchorMap;

    if (this.currentStage === 'stage-1') {
      this.steps = UniversalStageEngine.generateStage1or2Steps(this.model, this.m, this.n, this.currentDirection, false, anchorMap, this.currentStageVariant);
    } else if (this.currentStage === 'stage-2') {
      this.steps = UniversalStageEngine.generateStage1or2Steps(this.model, this.m, this.n, this.currentDirection, true, anchorMap, this.currentStageVariant);
    } else if (this.currentStage === 'stage-3') {
      this.steps = UniversalStageEngine.generateStage3Steps(this.model, this.m, this.n, this.currentDirection, anchorMap);
    } else if (this.currentStage === 'stage-4') {
      this.steps = UniversalStageEngine.generateStage4Steps(this.model, this.m, this.n, this.currentDirection, (this.currentStageVariant === 'for' ? 'for' : 'if'), anchorMap);
    }

    if (this.timeline) {
      this.timeline.reset();
    } else {
      this.renderStep(0);
    }
  }

  /**
   * 渲染当前步骤
   */
  public renderStep(index: number): void {
    if (this.isDestroyed || index < 0 || index >= this.steps.length || typeof document === 'undefined') return;
    const step = this.steps[index];
    const isReverse = this.currentDirection === 'reverse';

    // 1. 步数与滑块更新
    this.updateStepCounters(index);

    // 2. 渲染主视觉区 (Lite / Full)
    if (this.mode === 'lite') {
      this.renderLiteVisuals(step, index, isReverse);
    } else {
      this.renderFullVisuals(step, index);
    }

    // 3. 代码逐行高亮与自动滚动
    this.updateCodeHighlight(step.line);

    // 4. URL Hash 状态持久化
    this.syncStateToHash(index);
  }

  private syncStateToHash(stepIndex?: number): void {
    const cur = stepIndex !== undefined ? stepIndex : (this.timeline ? this.timeline.getCurrentStep() : 0);
    VisualizerStateRouter.updateHash({
      stage: this.currentStage,
      dir: this.currentDirection,
      variant: this.currentStageVariant,
      m: this.m,
      n: this.n,
      step: cur,
      theme: this.themeManager.getCurrentThemeId()
    });
  }

  /**
   * 销毁控制器
   */
  public destroy(): void {
    this.isDestroyed = true;
    if (this.timeline) {
      this.timeline.destroy();
      this.timeline = null;
    }
  }

  // ================= 内部辅助渲染方法 =================

  private updateStepCounters(index: number): void {
    // Lite mode 计数器
    const curEl = document.getElementById('step-cur');
    const totEl = document.getElementById('step-total');
    if (curEl) curEl.textContent = String(index + 1);
    if (totEl) totEl.textContent = String(this.steps.length);
    const slider = document.getElementById('slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.max = String(Math.max(0, this.steps.length - 1));
      slider.value = String(index);
    }

    // Full mode 计数器
    const fullCurEl = document.getElementById('current-step-num');
    const fullTotEl = document.getElementById('total-steps-num');
    if (fullCurEl) fullCurEl.textContent = String(index + 1);
    if (fullTotEl) fullTotEl.textContent = String(this.steps.length);
  }

  private renderLiteVisuals(step: UniversalStep, index: number, isReverse: boolean): void {
    // 图例同步
    const legendRefEl = document.getElementById('legend-ref');
    if (legendRefEl) {
      legendRefEl.innerHTML = isReverse ? '🐱 参考下方/右方' : '🐱 参考上方/左方';
    }

    // 二维网格渲染
    const gridContainer = document.getElementById('grid-container');
    if (gridContainer) {
      GridVisualAdapter.renderGrid(gridContainer, step, { m: this.m, n: this.n, isReverse });
    }

    // 卡片 2 状态展示 (一维槽位 / 递归树 / 转移等式)
    const memoContainer = document.getElementById('memo-array-container') || document.getElementById('memo-slots-container');
    if (memoContainer) {
      if (this.currentStage === 'stage-4') {
        GridVisualAdapter.renderLiteMemoSlots(memoContainer, step, this.n);
      } else if (this.currentStage === 'stage-3') {
        GridVisualAdapter.renderTransferEquation(memoContainer, step, isReverse);
      } else if (this.currentStage === 'stage-1' || this.currentStage === 'stage-2') {
        RecursionTreeAdapter.renderRecursionTree(memoContainer, step.treeRoot, step.activeNodeId, this.currentStage === 'stage-2');
      }
    }

    // 执行日志渲染
    const logContainer = document.getElementById('log-container');
    if (logContainer) {
      logContainer.innerHTML = '';
      for (let k = 0; k <= index; k++) {
        const logStep = this.steps[k];
        const isLatest = k === index;
        const lineEl = document.createElement('div');
        lineEl.className = isLatest 
          ? 'text-blue-700 font-bold bg-blue-50/80 px-2 py-1 rounded border-l-2 border-blue-500' 
          : 'text-slate-600 px-2 py-0.5';
        lineEl.textContent = logStep.log || logStep.msg || '';
        logContainer.appendChild(lineEl);
      }
      logContainer.scrollTop = logContainer.scrollHeight;
      const logCountEl = document.getElementById('log-count');
      if (logCountEl) logCountEl.textContent = `${index + 1} / ${this.steps.length} 记录`;
    }
  }

  private renderFullVisuals(step: UniversalStep, _index: number): void {
    const explainer = document.getElementById('step-explainer-content');
    if (explainer) explainer.textContent = step.log || step.msg || '';
    const badge = document.getElementById('step-action-tag') || document.getElementById('step-action-badge');
    if (badge) {
      badge.textContent = step.type || '执行计算';
    }

    // 二维网格单元格着色与状态同步
    for (let r = 0; r < this.m; r++) {
      for (let c = 0; c < this.n; c++) {
        const cell = document.getElementById(`grid-cell-${r}-${c}`);
        if (!cell) continue;

        const isCurrent = step.i === r && step.j === c;
        const isTop = step.topI === r && step.topJ === c;
        const isLeft = step.leftI === r && step.leftJ === c;
        const val = step.grid?.[r]?.[c] ?? null;

        const valEl = cell.querySelector('.cell-val');
        const indEl = cell.querySelector('.cell-indicator');

        if (valEl) valEl.textContent = val !== null ? String(val) : '-';

        cell.className = 'w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 flex flex-col items-center justify-between p-1 relative transition-all duration-200';
        if (isCurrent) {
          cell.className += ' bg-blue-50/90 border-blue-500 shadow-md scale-105 z-10';
          if (indEl) indEl.className = 'h-1.5 w-8 rounded-full bg-blue-500';
        } else if (isTop) {
          cell.className += ' bg-purple-50/90 border-purple-400 shadow-xs';
          if (indEl) indEl.className = 'h-1.5 w-6 rounded-full bg-purple-400';
        } else if (isLeft) {
          cell.className += ' bg-amber-50/90 border-amber-400 shadow-xs';
          if (indEl) indEl.className = 'h-1.5 w-6 rounded-full bg-amber-400';
        } else if (val !== null) {
          cell.className += ' bg-slate-50 border-slate-200';
          if (indEl) indEl.className = 'h-1.5 w-6 rounded-full bg-emerald-400';
        } else {
          cell.className += ' bg-white border-slate-200';
          if (indEl) indEl.className = 'h-1.5 w-6 rounded-full bg-slate-100';
        }
      }
    }

    // 阶段 4: 一维数组槽位更新
    if (this.currentStage === 'stage-4' && step.memo) {
      const slotsContainer = document.getElementById('one-d-array-slots');
      GridVisualAdapter.updateFullMemoSlots(slotsContainer, step, this.n);
    }

    // Live variables watch 更新
    const varI = document.getElementById('var-i');
    const varJ = document.getElementById('var-j');
    const varDown = document.getElementById('var-down');
    const varRight = document.getElementById('var-right');
    const varMemoj = document.getElementById('var-memoj');
    const varReturn = document.getElementById('var-return');

    if (varI) varI.textContent = step.i !== undefined && step.i >= 0 ? String(step.i) : '-';
    if (varJ) varJ.textContent = step.j !== undefined && step.j >= 0 ? String(step.j) : '-';
    if (varDown) varDown.textContent = step.topI !== undefined ? String(step.grid?.[step.topI]?.[step.topJ || 0] ?? '-') : '-';
    if (varRight) varRight.textContent = step.leftI !== undefined ? String(step.grid?.[step.leftI]?.[step.leftJ || 0] ?? '-') : '-';
    if (varMemoj) varMemoj.textContent = step.grid?.[step.i]?.[step.j] !== undefined ? String(step.grid[step.i][step.j]) : '-';
    if (varReturn) varReturn.textContent = step.grid?.[this.m - 1]?.[this.n - 1] !== undefined ? String(step.grid[this.m - 1][this.n - 1]) : '-';
  }

  private updateCodeHighlight(line?: number): void {
    if (line === undefined) return;
    const container = document.getElementById('code-container-box') || document.getElementById('code-display-container');
    if (!container) return;

    container.querySelectorAll('.code-line').forEach(el => el.classList.remove('active-line'));
    const activeLineEl = container.querySelector(`.code-line[data-line="${line}"]`) as HTMLElement | null;
    if (activeLineEl) {
      activeLineEl.classList.add('active-line');
      if (line <= 6) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const lineOffsetTop = activeLineEl.offsetTop;
        const lineOffsetHeight = activeLineEl.offsetHeight;
        const boxHeight = container.clientHeight;
        const currentScroll = container.scrollTop;

        if (lineOffsetTop < currentScroll + 32) {
          container.scrollTo({ top: Math.max(0, lineOffsetTop - 40), behavior: 'smooth' });
        } else if (lineOffsetTop + lineOffsetHeight > currentScroll + boxHeight - 32) {
          container.scrollTo({ top: lineOffsetTop + lineOffsetHeight - boxHeight + 40, behavior: 'smooth' });
        }
      }
    }
  }

  private updateHeaderMeta(stageConfig: any): void {
    const mainTitleEl = document.getElementById('header-algo-main-title') || document.getElementById('main-algo-title');
    if (mainTitleEl && this.model) {
      const prefix = this.model.id === 'unique-paths-ii' ? '63. ' : this.model.id === 'unique-paths' ? '62. ' : '';
      mainTitleEl.textContent = `${prefix}${this.model.name}`;
    }
    const fullPageTitleEl = typeof document.querySelector === 'function' ? document.querySelector('header h1') : null;
    if (fullPageTitleEl && this.model) {
      const prefix = this.model.id === 'unique-paths-ii' ? '63. ' : this.model.id === 'unique-paths' ? '62. ' : '';
      fullPageTitleEl.textContent = `LeetCode ${prefix}${this.model.name}`;
    }

    const titleEl = document.getElementById('header-algo-title') || document.getElementById('stage-title-text');
    if (titleEl) {
      titleEl.textContent = stageConfig.name;
      titleEl.title = stageConfig.desc;
    }
    const descEl = document.getElementById('header-algo-desc') || document.getElementById('stage-desc-text');
    if (descEl) descEl.textContent = stageConfig.desc;

    const complexityBadge = document.getElementById('header-complexity-badge');
    if (complexityBadge) {
      complexityBadge.textContent = stageConfig.timeBadge;
      complexityBadge.className = `px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${stageConfig.badgeBg || 'bg-blue-100 text-blue-800'}`;
    }

    const card2TitleEl = document.getElementById('card2-title');
    if (card2TitleEl) card2TitleEl.innerHTML = `<i class="fa-solid fa-bars-staggered text-slate-500"></i> ${stageConfig.card2Title}`;
    const card2DescEl = document.getElementById('card2-desc');
    if (card2DescEl) card2DescEl.textContent = stageConfig.card2Desc;

    const memoLenBadge = document.getElementById('badge-memo-len');
    if (memoLenBadge) memoLenBadge.textContent = this.currentStage === 'stage-4' ? `长度: ${this.n}` : `${this.m} × ${this.n}`;
  }

  private updateCodePanel(stageConfig: any): void {
    const variantBar = document.getElementById('code-variant-bar');
    if (stageConfig.variants && Object.keys(stageConfig.variants).length > 0) {
      if (variantBar) {
        variantBar.classList.remove('hidden');
        variantBar.innerHTML = '';
        const variantKeys = Object.keys(stageConfig.variants);
        if (!stageConfig.variants[this.currentStageVariant]) {
          this.currentStageVariant = variantKeys[0];
        }
        variantKeys.forEach(varKey => {
          const v = stageConfig.variants[varKey];
          const btn = document.createElement('button');
          const isActive = varKey === this.currentStageVariant;
          btn.dataset.variant = varKey;
          btn.className = `variant-btn px-2 py-0.5 rounded text-[10px] transition ${
            isActive 
              ? 'font-bold bg-blue-600 text-white shadow-2xs' 
              : 'font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`;
          btn.textContent = v.variantLabel || v.title || varKey;
          btn.addEventListener('click', () => {
            this.currentStageVariant = varKey;
            this.loadAndReset();
          });
          variantBar.appendChild(btn);
        });
      }
      const variantConfig = stageConfig.variants[this.currentStageVariant] || Object.values(stageConfig.variants)[0];
      const codeTitleEl = document.getElementById('code-file-title') || document.getElementById('code-lang-title');
      if (codeTitleEl) codeTitleEl.textContent = variantConfig.title;
      const codeBox = document.getElementById('code-content') || document.getElementById('code-display-container');
      if (codeBox) codeBox.innerHTML = variantConfig.codeHtml || variantConfig.html;
    } else {
      if (variantBar) variantBar.classList.add('hidden');
      const codeTitleEl = document.getElementById('code-file-title') || document.getElementById('code-lang-title');
      if (codeTitleEl) codeTitleEl.textContent = stageConfig.codeTitle;
      const codeBox = document.getElementById('code-content') || document.getElementById('code-display-container');
      if (codeBox) codeBox.innerHTML = stageConfig.codeHtml;
    }

    const codeContainer = document.getElementById('code-container-box') || document.getElementById('code-display-container');
    if (codeContainer) codeContainer.scrollTop = 0;
  }

  private rebuildFullLayout(): void {
    const oneDSection = document.getElementById('one-d-array-section');
    const slotsContainer = document.getElementById('one-d-array-slots');

    if (this.currentStage === 'stage-4') {
      if (oneDSection) oneDSection.classList.remove('hidden');
      if (slotsContainer) GridVisualAdapter.build1DSlots(slotsContainer, this.n, 'dp');
    } else {
      if (oneDSection) oneDSection.classList.add('hidden');
    }

    const gridContainer = document.getElementById('grid-container');
    if (!gridContainer) return;
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${this.n}, minmax(0, 1fr))`;

    const isReverse = this.currentDirection === 'reverse';

    for (let r = 0; r < this.m; r++) {
      for (let c = 0; c < this.n; c++) {
        const cell = document.createElement('div');
        cell.id = `grid-cell-${r}-${c}`;
        cell.className = 'w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border-2 border-slate-200 flex flex-col items-center justify-between p-1 relative transition-all duration-200 shadow-xs';
        
        let marker = '';
        if (r === 0 && c === 0) marker = isReverse ? '<span class="absolute -top-2 -left-2 px-1 py-0.2 bg-amber-500 text-white text-[9px] font-bold rounded-full shadow-xs">🏆 Finish</span>' : '<span class="absolute -top-2 -left-2 px-1 py-0.2 bg-emerald-500 text-white text-[9px] font-bold rounded-full shadow-xs">🚩 Start</span>';
        if (r === this.m - 1 && c === this.n - 1) marker = isReverse ? '<span class="absolute -bottom-2 -right-2 px-1 py-0.2 bg-emerald-500 text-white text-[9px] font-bold rounded-full shadow-xs">🚩 Start</span>' : '<span class="absolute -bottom-2 -right-2 px-1 py-0.2 bg-amber-500 text-white text-[9px] font-bold rounded-full shadow-xs">🏆 Finish</span>';

        cell.innerHTML = `
          ${marker}
          <span class="text-[10px] font-mono-code text-slate-400">(${r},${c})</span>
          <span class="text-sm sm:text-base font-mono-code font-bold text-slate-700 cell-val">-</span>
          <div class="h-1.5 w-6 rounded-full bg-slate-100 cell-indicator"></div>
        `;
        gridContainer.appendChild(cell);
      }
    }
  }

  private renderStageTabs(): void {
    const container = document.getElementById('stage-tabs-container');
    if (!container || !this.model.stages) return;
    container.innerHTML = '';
    const stageEntries = Object.entries(this.model.stages);
    stageEntries.forEach(([stageKey, stageSpec], idx) => {
      const stageNum = idx + 1;
      const shortName = stageSpec.shortName || (typeof stageSpec.name === 'string' ? stageSpec.name.replace(/阶段\s*\d+:\s*/, '') : `阶段 ${stageNum}`);
      const timeBadge = stageSpec.timeBadge || '';
      const isActive = stageKey === this.currentStage;
      
      const btn = document.createElement('button');
      btn.dataset.stage = stageKey;
      btn.title = `${stageSpec.name || stageKey} ${timeBadge}`;
      const themeClass = stageKey === 'stage-4' 
        ? (isActive ? 'active bg-amber-500 text-white shadow-sm shadow-amber-500/20 border-amber-500 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-white border-transparent font-semibold')
        : stageKey === 'stage-3'
        ? (isActive ? 'active bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 border-emerald-600 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-white border-transparent font-semibold')
        : (isActive ? 'active bg-blue-600 text-white shadow-sm shadow-blue-500/20 border-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-white border-transparent font-semibold');

      btn.className = `stage-tab-btn px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs transition-all flex items-center justify-center gap-1 border ${themeClass}`;
      btn.innerHTML = `
        <span class="w-4 h-4 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'} text-[10px] flex items-center justify-center font-bold flex-shrink-0">${stageNum}</span>
        <span class="truncate max-w-[65px] sm:max-w-[85px] lg:max-w-none">${shortName}</span>
        ${timeBadge ? `<span class="text-[9px] px-1 py-0.2 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-500'} font-mono hidden 2xl:inline flex-shrink-0">${timeBadge}</span>` : ''}
      `;

      btn.addEventListener('click', () => {
        this.currentStage = stageKey;
        this.renderStageTabs();
        this.loadAndReset();
      });
      container.appendChild(btn);
    });
  }

  private renderDirectionTabs(): void {
    const container = document.getElementById('dir-tabs-container');
    if (!container || !this.model.directions) return;
    const dirEntries = Object.entries(this.model.directions);
    if (dirEntries.length <= 1) {
      container.classList.add('hidden');
      return;
    }
    container.classList.remove('hidden');
    container.innerHTML = '';
    dirEntries.forEach(([dirKey, dirSpec]) => {
      const isActive = dirKey === this.currentDirection;
      const btn = document.createElement('button');
      btn.dataset.dir = dirKey;
      btn.title = dirSpec.label || dirKey;
      const iconClass = dirKey === 'forward' ? 'fa-arrow-down-right-across' : 'fa-arrow-up-left-across';
      const label = dirSpec.label ? dirSpec.label.replace(/\(.*\)/, '') : dirKey;
      btn.className = `dir-tab-btn px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-xs transition-all flex items-center gap-1 border ${
        isActive ? 'active bg-blue-600 text-white shadow-sm font-bold border-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-white border-transparent font-semibold'
      }`;
      btn.innerHTML = `
        <i class="fa-solid ${iconClass} text-[9px]"></i>
        <span class="truncate">${label}</span>
      `;
      btn.addEventListener('click', () => {
        this.currentDirection = dirKey as 'forward' | 'reverse';
        this.renderDirectionTabs();
        this.loadAndReset();
      });
      container.appendChild(btn);
    });
  }

  private bindEvents(): void {
    const btnPlay = document.getElementById('btn-play-pause');
    const btnNext = document.getElementById('btn-step-next');
    const btnPrev = document.getElementById('btn-step-prev');
    const btnReset = document.getElementById('btn-reset');
    const btnGenerate = document.getElementById('btn-generate') || document.getElementById('btn-apply-size');
    const slider = document.getElementById('slider-progress');
    const selectSpeed = document.getElementById('select-speed');

    if (btnPlay) btnPlay.addEventListener('click', () => this.timeline?.toggle());
    if (btnNext) btnNext.addEventListener('click', () => this.timeline?.stepForward());
    if (btnPrev) btnPrev.addEventListener('click', () => this.timeline?.stepBackward());
    if (btnReset) btnReset.addEventListener('click', () => this.timeline?.reset());
    if (btnGenerate) btnGenerate.addEventListener('click', () => this.loadAndReset());
    if (slider) slider.addEventListener('input', (e) => this.timeline?.seek(parseInt((e.target as HTMLInputElement).value) || 0));
    if (selectSpeed) selectSpeed.addEventListener('change', (e) => this.timeline?.setSpeed(parseInt((e.target as HTMLSelectElement).value) || 900));

    // Preset buttons (Full mode)
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const inputM = document.getElementById('input-m') as HTMLInputElement | null;
        const inputN = document.getElementById('input-n') as HTMLInputElement | null;
        if (inputM) inputM.value = btn.getAttribute('data-m') || '3';
        if (inputN) inputN.value = btn.getAttribute('data-n') || '4';
        this.loadAndReset();
      });
    });

    // View switch button (Lite <-> Full)
    const btnSwitchFull = document.getElementById('btn-switch-full');
    const btnSwitchLite = document.getElementById('btn-switch-lite');

    const handleSwitch = (targetType: 'full' | 'lite') => {
      const isStageExplorer = window.location.pathname.includes('stage-explorer');
      const targetBase = targetType === 'full'
        ? (isStageExplorer ? 'stage-explorer.html' : 'unique-paths.html')
        : (isStageExplorer ? 'stage-explorer-lite.html' : 'unique-paths-lite.html');
      
      const queryParam = this.modelId !== 'unique-paths' ? `?model=${this.modelId}` : '';
      VisualizerStateRouter.switchView(`${targetBase}${queryParam}`, {
        stage: this.currentStage,
        dir: this.currentDirection,
        variant: this.currentStageVariant,
        m: this.m,
        n: this.n,
        step: this.timeline ? this.timeline.getCurrentStep() : 0,
        theme: this.themeManager.getCurrentThemeId()
      });
    };

    if (btnSwitchFull) btnSwitchFull.addEventListener('click', () => handleSwitch('full'));
    if (btnSwitchLite) btnSwitchLite.addEventListener('click', () => handleSwitch('lite'));

    // FAQ scroll
    const btnFaq = document.getElementById('btn-quick-faq');
    if (btnFaq) {
      btnFaq.addEventListener('click', () => {
        const faqEl = document.querySelector('footer') || document.body;
        faqEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  private renderThemeSelector(): void {
    let container = document.getElementById('theme-selector-container');
    if (!container) {
      // 智能寻找挂载点：在切换视图按钮或重置按钮旁插入
      const anchor = document.getElementById('btn-switch-lite') || 
                     document.getElementById('btn-switch-full') ||
                     document.getElementById('btn-quick-faq') ||
                     document.getElementById('btn-reset');
      if (anchor && anchor.parentElement) {
        container = document.createElement('div');
        container.id = 'theme-selector-container';
        container.className = 'inline-flex items-center';
        anchor.parentElement.insertBefore(container, anchor.nextSibling);
      }
    }
    if (container) {
      const handleSwitch = (targetType: 'full' | 'lite') => {
        const isStageExplorer = typeof window !== 'undefined' && window.location.pathname.includes('stage-explorer');
        const targetBase = targetType === 'full'
          ? (isStageExplorer ? 'stage-explorer.html' : 'unique-paths.html')
          : (isStageExplorer ? 'stage-explorer-lite.html' : 'unique-paths-lite.html');
        
        const queryParam = this.modelId !== 'unique-paths' ? `?model=${this.modelId}` : '';
        VisualizerStateRouter.switchView(`${targetBase}${queryParam}`, {
          stage: this.currentStage,
          dir: this.currentDirection,
          variant: this.currentStageVariant,
          m: this.m,
          n: this.n,
          step: this.timeline ? this.timeline.getCurrentStep() : 0,
          theme: this.themeManager.getCurrentThemeId()
        });
      };

      this.themeManager.renderThemeSelector(container, {
        currentMode: this.mode,
        onSwitchMode: (mode) => handleSwitch(mode),
        onSpeedChange: (speedMs) => {
          if (this.timeline) this.timeline.setSpeed(speedMs);
        }
      });
    }
  }
}
