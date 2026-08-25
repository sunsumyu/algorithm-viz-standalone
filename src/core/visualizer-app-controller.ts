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
import { SplitterEngine } from './splitter-engine';
import { highlightTokens } from './code-highlighter';
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
  private codeFontSize = 11.5;
  private steps: UniversalStep[] = [];
  private timeline: PlaybackTimelineController | null = null;
  private splitterEngine: SplitterEngine | null = null;
  private themeManager: VisualThemeManager;
  private isDestroyed = false;
  public stage3SubView: 'matrix' | 'tree' = 'matrix';
  public activeRightTab: 'code' | 'problem' | 'analysis' = 'code';

  constructor(options: VisualizerAppControllerOptions = {}) {
    this.mode = options.mode || 'lite';
    this.themeManager = VisualThemeManager.getInstance({ defaultTheme: options.defaultTheme });
    this.stage3SubView = (typeof localStorage !== 'undefined' && localStorage.getItem('algo-stage3-subview') === 'tree') ? 'tree' : 'matrix';
    this.activeRightTab = (typeof localStorage !== 'undefined' && (localStorage.getItem('algo-right-tab') as any)) || 'code';
    if (this.activeRightTab !== 'code' && this.activeRightTab !== 'problem' && this.activeRightTab !== 'analysis') {
      this.activeRightTab = 'code';
    }
    
    // 解析 options, URL 参数或全局变量获取 modelId
    let requestedId = options.defaultModelId;
    if (!requestedId && typeof window !== 'undefined') {
      if ((window as any).__DEFAULT_MODEL_ID) {
        requestedId = (window as any).__DEFAULT_MODEL_ID;
      } else if (window.location) {
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

    if (this.model?.defaultParams) {
      if (this.model.defaultParams.m !== undefined) {
        this.m = Number(this.model.defaultParams.m);
      } else if (this.model.defaultParams.word1 !== undefined) {
        this.m = String(this.model.defaultParams.word1).length + 1;
      } else if (this.model.defaultParams.s !== undefined) {
        this.m = this.model.defaultParams.t !== undefined
          ? String(this.model.defaultParams.s).length + 1
          : String(this.model.defaultParams.s).length;
      } else if (this.model.defaultParams.nums !== undefined) {
        const nums = Array.isArray(this.model.defaultParams.nums)
          ? this.model.defaultParams.nums
          : String(this.model.defaultParams.nums).split(',').map(Number);
        this.m = nums.length;
      }
      if (this.model.defaultParams.n !== undefined) {
        this.n = Number(this.model.defaultParams.n);
      } else if (this.model.defaultParams.word2 !== undefined) {
        this.n = String(this.model.defaultParams.word2).length + 1;
      } else if (this.model.defaultParams.t !== undefined) {
        this.n = String(this.model.defaultParams.t).length + 1;
      } else if (this.model.defaultParams.s !== undefined) {
        this.n = String(this.model.defaultParams.s).length;
      } else if (this.model.defaultParams.nums !== undefined) {
        const nums = Array.isArray(this.model.defaultParams.nums)
          ? this.model.defaultParams.nums
          : String(this.model.defaultParams.nums).split(',').map(Number);
        const sum = nums.reduce((a: number, b: number) => a + b, 0);
        this.n = Math.floor(sum / 2) + 1;
      }
    }

    // 智能恢复阶段与方向记忆 (URL Hash > LocalStorage 本题记忆 > LocalStorage 全局偏好 > 模型默认)
    this.currentStage = this.getInitialStage(this.modelId);
    this.currentDirection = this.getInitialDirection(this.modelId);
  }

  /**
   * 计算初始阶段（具备多层记忆感知能力）
   */
  private getInitialStage(modelId?: string): string {
    const id = modelId || this.modelId;
    const model = AlgorithmModelRepository.hasModel(id)
      ? AlgorithmModelRepository.getModel(id)
      : this.model;

    // 1. URL Hash 最高优先级
    const restored = VisualizerStateRouter.restore();
    if (restored && restored.stage && model?.stages?.[restored.stage]) {
      return restored.stage;
    }

    // 2. 本题专属 LocalStorage 记忆
    if (typeof localStorage !== 'undefined') {
      const savedModelStage = localStorage.getItem(`algo-stage-${id}`);
      if (savedModelStage && model?.stages?.[savedModelStage]) {
        return savedModelStage;
      }
      // 3. 全局通用阶段偏好记忆 (例如用户偏好浏览二维 DP)
      const savedGlobalStage = localStorage.getItem('algo-preferred-stage');
      if (savedGlobalStage && model?.stages?.[savedGlobalStage]) {
        return savedGlobalStage;
      }
    }

    // 4. 算法模型默认阶段兜底
    return model?.defaultStage || 'stage-1';
  }

  /**
   * 计算初始演化方向（具备多层记忆感知能力）
   */
  private getInitialDirection(modelId?: string): 'forward' | 'reverse' {
    const id = modelId || this.modelId;
    const model = AlgorithmModelRepository.hasModel(id)
      ? AlgorithmModelRepository.getModel(id)
      : this.model;

    // 1. URL Hash
    const restored = VisualizerStateRouter.restore();
    if (restored && (restored.dir === 'forward' || restored.dir === 'reverse') && model?.directions?.[restored.dir]) {
      return restored.dir;
    }

    // 2. LocalStorage 记忆
    if (typeof localStorage !== 'undefined') {
      const savedModelDir = localStorage.getItem(`algo-dir-${id}`) as any;
      if ((savedModelDir === 'forward' || savedModelDir === 'reverse') && model?.directions?.[savedModelDir]) {
        return savedModelDir;
      }
      const savedGlobalDir = localStorage.getItem('algo-preferred-dir') as any;
      if ((savedGlobalDir === 'forward' || savedGlobalDir === 'reverse') && model?.directions?.[savedGlobalDir]) {
        return savedGlobalDir;
      }
    }

    return 'forward';
  }

  /**
   * 初始化应用控制器
   */
  public init(): void {
    if (typeof document === 'undefined') return;

    // 初始化代码字号配置
    this.initCodeFontSize();

    // 0. 从 URL Hash 恢复持久化状态与主题
    const restored = VisualizerStateRouter.restore();
    let targetStep = 0;
    const isSameAlgo = !restored?.algo || restored.algo === this.modelId;
    if (restored && isSameAlgo) {
      if (restored.stage && this.model?.stages?.[restored.stage]) this.currentStage = restored.stage;
      if ((restored.dir === 'forward' || restored.dir === 'reverse') && this.model?.directions?.[restored.dir]) this.currentDirection = restored.dir;
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
    } else {
      this.currentStage = this.getInitialStage();
      this.currentDirection = this.getInitialDirection();
      if (restored?.theme) this.themeManager.setTheme(restored.theme, true);
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

    // 1. 从模型注入默认网格参数 (若未被同题 hash 覆盖)
    if (this.model.defaultParams && (!restored || !isSameAlgo || (!restored.m && !restored.n))) {
      const inputM = document.getElementById('input-m') as HTMLInputElement | null;
      const inputN = document.getElementById('input-n') as HTMLInputElement | null;
      if (this.model.defaultParams.m !== undefined) {
        this.m = Number(this.model.defaultParams.m);
        if (inputM) inputM.value = String(this.model.defaultParams.m);
      } else if (this.model.defaultParams.word1 !== undefined) {
        this.m = String(this.model.defaultParams.word1).length + 1;
        if (inputM) inputM.value = String(this.m);
      } else if (this.model.defaultParams.s !== undefined) {
        this.m = this.model.defaultParams.t !== undefined
          ? String(this.model.defaultParams.s).length + 1
          : String(this.model.defaultParams.s).length;
        if (inputM) inputM.value = String(this.m);
      } else if (this.model.defaultParams.nums !== undefined) {
        const nums = Array.isArray(this.model.defaultParams.nums)
          ? this.model.defaultParams.nums
          : String(this.model.defaultParams.nums).split(',').map(Number);
        this.m = nums.length;
        if (inputM) inputM.value = String(this.m);
      }
      if (this.model.defaultParams.n !== undefined) {
        this.n = Number(this.model.defaultParams.n);
        if (inputN) inputN.value = String(this.model.defaultParams.n);
      } else if (this.model.defaultParams.word2 !== undefined) {
        this.n = String(this.model.defaultParams.word2).length + 1;
        if (inputN) inputN.value = String(this.n);
      } else if (this.model.defaultParams.t !== undefined) {
        this.n = String(this.model.defaultParams.t).length + 1;
        if (inputN) inputN.value = String(this.n);
      } else if (this.model.defaultParams.s !== undefined) {
        this.n = String(this.model.defaultParams.s).length;
        if (inputN) inputN.value = String(this.n);
      } else if (this.model.defaultParams.nums !== undefined) {
        const nums = Array.isArray(this.model.defaultParams.nums)
          ? this.model.defaultParams.nums
          : String(this.model.defaultParams.nums).split(',').map(Number);
        const sum = nums.reduce((a: number, b: number) => a + b, 0);
        this.n = Math.floor(sum / 2) + 1;
        if (inputN) inputN.value = String(this.n);
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

    // 6. 装配左右拖拽分栏调节条 (Splitter)
    this.setupSplitter();

    // 7. 初次装载与步骤推导计算
    this.loadAndReset();

    // 8. 装配右侧选项卡初始视图 (代码 / 题目 / 精讲)
    this.switchRightTab(this.activeRightTab);

    // 9. 定位到指定步数
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

    // 3. 代码逐行高亮与行内局部表达式聚焦
    this.updateCodeHighlight(step.line, step.highlightText);

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
    if (this.splitterEngine) {
      this.splitterEngine.destroy();
      this.splitterEngine = null;
    }
  }

  /**
   * 初始化左右拖拽分割条
   */
  private setupSplitter(): void {
    if (typeof document === 'undefined') return;
    const leftPane = document.getElementById('left-visual-section');
    const mainContainer = document.getElementById('main-content-layout');
    if (!leftPane || !mainContainer) return;

    this.splitterEngine?.destroy();
    this.splitterEngine = new SplitterEngine({
      id: 'grid-dp-split',
      direction: 'horizontal',
      targetElement: leftPane,
      containerElement: mainContainer,
      defaultRatio: 0.5,
      defaultSize: 520,
      minSize: 320,
      minRatio: 0.28,
      maxRatio: 0.72,
      mode: 'flex',
      attachPosition: 'after',
      invert: false,
      className: 'algo-layout-splitter',
      title: '拖拽调节左右面板宽度（双击复原 50:50）'
    });
  }

  /**
   * 初始化代码字号配置
   */
  private initCodeFontSize(): void {
    if (typeof localStorage !== 'undefined') {
      const saved = parseFloat(localStorage.getItem('algo-code-font-size') || '');
      if (Number.isFinite(saved) && saved >= 9 && saved <= 18) {
        this.codeFontSize = saved;
      }
    }
    this.applyCodeFontSize();
  }

  /**
   * 动态设置代码面板字号
   */
  public setCodeFontSize(size: number): void {
    const clamped = Math.min(Math.max(size, 9.5), 16);
    this.codeFontSize = clamped;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('algo-code-font-size', String(clamped));
    }
    this.applyCodeFontSize();
  }

  /**
   * 应用代码面板字号到 DOM
   */
  private applyCodeFontSize(): void {
    if (typeof document === 'undefined') return;
    const rounded = Math.round(this.codeFontSize * 10) / 10;
    if (document.documentElement) {
      document.documentElement.style.setProperty('--viz-code-font-size', `${rounded}px`);
    }
    const indicator = document.getElementById('code-font-indicator');
    if (indicator) {
      indicator.textContent = String(rounded);
    }
    const codeBox = document.getElementById('code-container-box');
    if (codeBox) {
      codeBox.style.fontSize = `${rounded}px`;
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
      const isGridProblem = ['unique-paths', 'unique-paths-ii', 'min-path-sum'].includes(this.modelId);
      GridVisualAdapter.renderGrid(gridContainer, step, {
        m: this.m,
        n: this.n,
        isReverse,
        modelId: this.modelId,
        isGridProblem
      });
    }

    // 卡片 2 状态展示 (一维槽位 / 递归树 / 转移等式)
    const memoContainer = document.getElementById('memo-array-container') || document.getElementById('memo-slots-container');
    if (memoContainer) {
      if (this.currentStage === 'stage-4') {
        GridVisualAdapter.renderLiteMemoSlots(memoContainer, step, this.n);
      } else if (this.currentStage === 'stage-3') {
        if (this.stage3SubView === 'tree') {
          RecursionTreeAdapter.renderRecursionTree(memoContainer, step.treeRoot, step.activeNodeId, true);
        } else {
          GridVisualAdapter.renderStage3DPTable(memoContainer, step, { m: this.m, n: this.n, isReverse });
        }
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

  private updateCodeHighlight(line?: number, highlightText?: string): void {
    if (line === undefined) return;
    const container = document.getElementById('code-container-box') || document.getElementById('code-display-container');
    if (!container) return;

    // 1. 清理上一高亮行与局部聚焦状态（基于纯文本源码单向恢复）
    container.querySelectorAll('.code-line').forEach(el => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.dataset.isDirty === 'true' && htmlEl.dataset.rawCode) {
        htmlEl.innerHTML = highlightTokens(htmlEl.dataset.rawCode, 'java');
        delete htmlEl.dataset.isDirty;
      }
      htmlEl.classList.remove('active-line');
    });

    const activeLineEl = container.querySelector(`.code-line[data-line="${line}"]`) as HTMLElement | null;
    if (activeLineEl) {
      activeLineEl.classList.add('active-line');

      // 2. 若存在行内目标子串，通过纯文本 Lexer 重新生成带聚焦状态的 HTML（单向数据流，零 DOM 破坏）
      const rawCode = activeLineEl.dataset.rawCode;
      if (rawCode && highlightText) {
        activeLineEl.innerHTML = highlightTokens(rawCode, 'java', highlightText);
        activeLineEl.dataset.isDirty = 'true';
      }

      // 3. 自动滚动居中
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

    const isGridProblem = ['unique-paths', 'unique-paths-ii', 'min-path-sum'].includes(this.model.id);
    const card1TitleEl = document.getElementById('card1-title');
    if (card1TitleEl) {
      card1TitleEl.innerHTML = isGridProblem
        ? `<i class="fa-solid fa-table-cells text-slate-500"></i> 二维网格 (虚拟地图 m×n)`
        : `<i class="fa-solid fa-table-cells text-slate-500"></i> 二维状态网格 (${this.m}×${this.n})`;
    }

    const legendBar = document.getElementById('grid-legend-bar');
    if (legendBar && !isGridProblem) {
      legendBar.innerHTML = `
        <span class="flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-sm bg-blue-100 border border-blue-500"></span> 当前计算</span>
        <span class="flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-300"></span> 已求解</span>
        <span class="flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-sm bg-purple-100 border border-purple-400"></span> 参考上方</span>
        <span class="flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-400"></span> 参考左方</span>
      `;
    }

    const card2TitleEl = document.getElementById('card2-title');
    if (card2TitleEl) card2TitleEl.innerHTML = `<i class="fa-solid fa-bars-staggered text-slate-500"></i> ${stageConfig.card2Title}`;
    const card2DescEl = document.getElementById('card2-desc');
    if (card2DescEl) card2DescEl.textContent = stageConfig.card2Desc;

    const memoLenBadge = document.getElementById('badge-memo-len');
    if (memoLenBadge) memoLenBadge.textContent = this.currentStage === 'stage-4' ? `长度: ${this.n}` : `${this.m} × ${this.n}`;

    this.updateStage3SubViewTabs();
  }

  /**
   * 设置阶段 3 的子视图模式 (DP 矩阵 vs 状态依赖树)
   */
  public setStage3SubView(view: 'matrix' | 'tree'): void {
    this.stage3SubView = view;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('algo-stage3-subview', view);
    }
    this.updateStage3SubViewTabs();
    const curStep = this.timeline ? this.timeline.getCurrentStep() : 0;
    if (this.steps[curStep]) {
      const isReverse = this.currentDirection === 'reverse';
      if (this.mode === 'lite') {
        this.renderLiteVisuals(this.steps[curStep], curStep, isReverse);
      }
    }
  }

  /**
   * 同步阶段 3 子视图切换按钮高亮状态
   */
  public updateStage3SubViewTabs(): void {
    const bar = document.getElementById('stage3-subview-bar');
    if (!bar) return;
    if (this.currentStage === 'stage-3') {
      bar.classList.remove('hidden');
      bar.classList.add('flex');
    } else {
      bar.classList.remove('flex');
      bar.classList.add('hidden');
    }
    const btnMatrix = document.getElementById('btn-subview-matrix');
    const btnTree = document.getElementById('btn-subview-tree');
    if (btnMatrix) {
      btnMatrix.className = this.stage3SubView === 'matrix'
        ? 'px-2 py-0.5 rounded-md transition shadow-2xs bg-white text-blue-700 font-extrabold flex items-center gap-1'
        : 'px-2 py-0.5 rounded-md transition text-slate-600 hover:text-slate-900 flex items-center gap-1';
    }
    if (btnTree) {
      btnTree.className = this.stage3SubView === 'tree'
        ? 'px-2 py-0.5 rounded-md transition shadow-2xs bg-white text-emerald-700 font-extrabold flex items-center gap-1'
        : 'px-2 py-0.5 rounded-md transition text-slate-600 hover:text-slate-900 flex items-center gap-1';
    }
  }

  private updateCodePanel(stageConfig: any): void {
    const variantBar = document.getElementById('code-variant-bar');
    const variantKeys = stageConfig.variants ? Object.keys(stageConfig.variants) : [];
    
    if (stageConfig.variants && variantKeys.length > 1) {
      if (variantBar) {
        variantBar.classList.remove('hidden');
        variantBar.classList.add('flex-shrink-0', 'whitespace-nowrap');
        variantBar.innerHTML = '';
        
        // 尝试从 localStorage 恢复该题该阶段的代码变体偏好
        if (typeof localStorage !== 'undefined') {
          const savedVariant = localStorage.getItem(`algo-variant-${this.modelId}-${this.currentStage}`);
          if (savedVariant && stageConfig.variants[savedVariant]) {
            this.currentStageVariant = savedVariant;
          }
        }

        if (!stageConfig.variants[this.currentStageVariant]) {
          this.currentStageVariant = variantKeys[0];
        }

        variantKeys.forEach(varKey => {
          const v = stageConfig.variants[varKey];
          const btn = document.createElement('button');
          const isActive = varKey === this.currentStageVariant;
          btn.dataset.variant = varKey;
          btn.className = `variant-btn whitespace-nowrap px-2 py-0.5 rounded text-[10px] transition ${
            isActive 
              ? 'font-bold bg-blue-600 text-white shadow-2xs' 
              : 'font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`;
          btn.textContent = v.variantLabel || v.title || varKey;
          btn.addEventListener('click', () => {
            this.currentStageVariant = varKey;
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(`algo-variant-${this.modelId}-${this.currentStage}`, varKey);
            }
            this.loadAndReset();
            this.syncStateToHash(0);
          });
          variantBar.appendChild(btn);
        });
      }
      const variantConfig = stageConfig.variants ? (stageConfig.variants[this.currentStageVariant] || Object.values(stageConfig.variants)[0]) : null;
      const codeTitleEl = document.getElementById('code-file-title') || document.getElementById('code-lang-title');
      if (codeTitleEl) codeTitleEl.textContent = variantConfig?.title || stageConfig.codeTitle || '';
      const codeBox = document.getElementById('code-content') || document.getElementById('code-display-container');
      if (codeBox) codeBox.innerHTML = variantConfig?.codeHtml || (variantConfig as any)?.html || stageConfig.codeHtml || '';
    } else {
      if (variantBar) variantBar.classList.add('hidden');
      const variantConfig = stageConfig.variants ? (stageConfig.variants[this.currentStageVariant] || Object.values(stageConfig.variants)[0]) : null;
      const codeTitleEl = document.getElementById('code-file-title') || document.getElementById('code-lang-title');
      if (codeTitleEl) codeTitleEl.textContent = variantConfig?.title || stageConfig.codeTitle || '';
      const codeBox = document.getElementById('code-content') || document.getElementById('code-display-container');
      if (codeBox) codeBox.innerHTML = variantConfig?.codeHtml || (variantConfig as any)?.html || stageConfig.codeHtml || '';
    }

    const codeContainer = document.getElementById('code-container-box') || document.getElementById('code-display-container');
    if (codeContainer) codeContainer.scrollTop = 0;
  }

  /**
   * 将当前控制器状态同步到 URL Hash
   */
  public syncStateToHash(step: number): void {
    VisualizerStateRouter.updateHash({
      algo: this.modelId,
      stage: this.currentStage,
      dir: this.currentDirection,
      variant: this.currentStageVariant,
      m: this.m,
      n: this.n,
      step,
      theme: this.themeManager.getCurrentThemeId()
    });
  }

  /**
   * 切换右侧面板展示视图 (代码调试 / 题目描述 / 递推精讲)
   */
  public switchRightTab(tab: 'code' | 'problem' | 'analysis'): void {
    this.activeRightTab = tab;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('algo-right-tab', tab);
    }
    if (typeof document === 'undefined') return;

    const btnCode = document.getElementById('btn-tab-code');
    const btnProblem = document.getElementById('btn-tab-problem');
    const btnAnalysis = document.getElementById('btn-tab-analysis');

    const setActiveClass = (btn: HTMLElement | null, isActive: boolean) => {
      if (!btn) return;
      btn.className = isActive
        ? 'tab-btn active px-2.5 py-0.5 rounded text-[11px] font-bold transition bg-blue-600 text-white shadow-2xs flex items-center gap-1.5'
        : 'tab-btn px-2.5 py-0.5 rounded text-[11px] font-medium transition text-slate-400 hover:text-slate-200 hover:bg-slate-800 flex items-center gap-1.5';
    };

    setActiveClass(btnCode, tab === 'code');
    setActiveClass(btnProblem, tab === 'problem');
    setActiveClass(btnAnalysis, tab === 'analysis');

    const viewCode = document.getElementById('code-view-container');
    const viewProblem = document.getElementById('problem-view-container');
    const viewAnalysis = document.getElementById('analysis-view-container');
    const variantBar = document.getElementById('code-variant-bar');
    const fontControls = document.getElementById('code-font-container') || document.getElementById('btn-code-font-dec')?.parentElement?.parentElement;

    if (viewCode) {
      if (tab === 'code') viewCode.classList.remove('hidden');
      else viewCode.classList.add('hidden');
    }
    if (viewProblem) {
      if (tab === 'problem') viewProblem.classList.remove('hidden');
      else viewProblem.classList.add('hidden');
    }
    if (viewAnalysis) {
      if (tab === 'analysis') viewAnalysis.classList.remove('hidden');
      else viewAnalysis.classList.add('hidden');
    }

    // 变体选择器与字号缩放只在代码视图显示（且仅当存在 2 个及以上变体可选时才显示）
    if (variantBar && this.currentStage) {
      const stageConfig = AlgorithmModelRepository.getCompiledStage(this.model.id, this.currentStage, this.currentDirection);
      if (stageConfig?.variants && Object.keys(stageConfig.variants).length > 1) {
        if (tab === 'code') variantBar.classList.remove('hidden');
        else variantBar.classList.add('hidden');
      } else {
        variantBar.classList.add('hidden');
      }
    }
    if (fontControls) {
      if (tab === 'code') fontControls.classList.remove('hidden');
      else fontControls.classList.add('hidden');
    }

    if (tab === 'problem') {
      this.renderProblemView();
    } else if (tab === 'analysis') {
      this.renderAnalysisView();
    } else if (tab === 'code') {
      const curStep = this.timeline ? this.timeline.getCurrentStep() : 0;
      if (this.steps[curStep]) {
        this.updateCodeHighlight(this.steps[curStep].line, this.steps[curStep].highlightText);
      }
    }
  }

  /**
   * 生成并渲染力扣题目描述内容
   */
  public renderProblemView(): void {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('problem-view-container');
    const problem = this.model.problem;
    
    const difficultyMap: Record<string, { label: string; class: string }> = {
      'easy': { label: '简单', class: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' },
      '简单': { label: '简单', class: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' },
      'medium': { label: '中等', class: 'bg-amber-500/20 text-amber-400 border border-amber-500/40' },
      '中等': { label: '中等', class: 'bg-amber-500/20 text-amber-400 border border-amber-500/40' },
      'hard': { label: '困难', class: 'bg-rose-500/20 text-rose-400 border border-rose-500/40' },
      '困难': { label: '困难', class: 'bg-rose-500/20 text-rose-400 border border-rose-500/40' },
    };

    const diffInfo = difficultyMap[String(problem?.difficulty || this.model.difficulty)] || {
      label: '中等',
      class: 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
    };

    const title = problem?.title || this.model.name;
    const lcId = problem?.leetcodeId ? `LeetCode ${problem.leetcodeId}. ` : '';
    const desc = problem?.description || this.model.description || '暂无详细描述。';
    const tags = problem?.tags || [this.model.category, '动态规划'];
    const leetcodeUrl = problem?.leetcodeUrl;

    let examplesHtml = '';
    if (problem?.examples && problem.examples.length > 0) {
      examplesHtml = `
        <div class="mt-4 space-y-3">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-vial text-blue-400"></i> 示例用例 (Examples)
          </h4>
          ${problem.examples.map((ex, idx) => `
            <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono-code space-y-1.5">
              <div class="font-bold text-slate-300 font-sans flex items-center justify-between">
                <span>示例 ${idx + 1}</span>
              </div>
              <div class="text-slate-300"><span class="text-slate-500 font-sans">输入：</span><code class="text-blue-300">${ex.input}</code></div>
              <div class="text-slate-300"><span class="text-slate-500 font-sans">输出：</span><code class="text-emerald-400 font-bold">${ex.output}</code></div>
              ${ex.explanation ? `<div class="text-slate-400 font-sans text-[11px] leading-relaxed pt-1 border-t border-slate-800/60"><span class="text-slate-500">解释：</span>${ex.explanation}</div>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }

    let constraintsHtml = '';
    if (problem?.constraints && problem.constraints.length > 0) {
      constraintsHtml = `
        <div class="mt-4 space-y-2">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-triangle-exclamation text-amber-400"></i> 提示与数据约束 (Constraints)
          </h4>
          <ul class="list-disc list-inside space-y-1 text-xs text-slate-400 font-mono-code bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            ${problem.constraints.map(c => `<li><span class="text-slate-300">${c}</span></li>`).join('')}
          </ul>
        </div>
      `;
    }

    const contentHtml = `
      <div class="space-y-4">
        <!-- 题目标题与徽章 -->
        <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-sm font-bold text-white">${lcId}${title}</h3>
            <span class="px-2 py-0.5 text-[10px] font-bold rounded-md ${diffInfo.class}">${diffInfo.label}</span>
            ${tags.map(t => `<span class="px-2 py-0.5 text-[10px] rounded-md bg-slate-800 text-slate-300 border border-slate-700">${t}</span>`).join('')}
          </div>
          ${leetcodeUrl ? `
            <a href="${leetcodeUrl}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition flex items-center gap-1">
              <span>力扣原题</span>
              <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
            </a>
          ` : ''}
        </div>

        <!-- 题目正文描述 -->
        <div class="text-xs leading-relaxed text-slate-300 space-y-2">
          ${desc}
        </div>

        <!-- 示例 -->
        ${examplesHtml}

        <!-- 约束条件 -->
        ${constraintsHtml}
      </div>
    `;

    if (container) {
      container.innerHTML = contentHtml;
    }

    const modalBody = document.getElementById('modal-problem-body');
    if (modalBody) {
      modalBody.innerHTML = contentHtml;
    }
  }

  /**
   * 生成并渲染递推 5 步法与 FAQs 分析内容
   */
  public renderAnalysisView(): void {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('analysis-view-container');
    if (!container) return;

    const analysis = this.model.analysis;
    const faqs = this.model.faqs;

    let analysisHtml = '';
    if (analysis && Object.keys(analysis).length > 0) {
      analysisHtml = `
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
            <i class="fa-solid fa-stairs text-emerald-400"></i> 动态规划标准 5 步递推分析
          </h4>
          <div class="space-y-2.5">
            ${Object.values(analysis).map((item, idx) => `
              <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div class="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span class="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">${idx + 1}</span>
                  <span>${item.title || `步骤 ${idx + 1}`}</span>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed pl-5">${item.content || ''}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    let faqsHtml = '';
    if (faqs && faqs.length > 0) {
      faqsHtml = `
        <div class="mt-4 space-y-3">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
            <i class="fa-solid fa-circle-question text-blue-400"></i> 常见易错疑问与核心要点 (FAQs)
          </h4>
          <div class="space-y-2">
            ${faqs.map(faq => `
              <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div class="text-xs font-bold text-slate-200 flex items-start gap-1.5">
                  <span class="text-amber-400 font-mono">Q:</span>
                  <span>${faq.q}</span>
                </div>
                <div class="text-xs text-slate-400 leading-relaxed flex items-start gap-1.5 pl-3 border-l-2 border-slate-800">
                  <span class="text-blue-400 font-mono">A:</span>
                  <span>${faq.a}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="space-y-4">
        ${analysisHtml}
        ${faqsHtml}
      </div>
    `;
  }

  /**
   * 打开题目描述弹窗
   */
  public openProblemModal(): void {
    if (typeof document === 'undefined') return;
    const modal = document.getElementById('modal-problem');
    if (!modal) return;
    this.renderProblemView();
    modal.classList.remove('hidden');
  }

  /**
   * 关闭题目描述弹窗
   */
  public closeProblemModal(): void {
    if (typeof document === 'undefined') return;
    const modal = document.getElementById('modal-problem');
    if (modal) modal.classList.add('hidden');
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

    const defaultShortNames: Record<string, string> = {
      'stage-1': '递归',
      'stage-2': '记忆化',
      'stage-3': '二维DP',
      'stage-4': '一维优化',
    };

    const stageEntries = Object.entries(this.model.stages);
    stageEntries.forEach(([stageKey, stageSpec], idx) => {
      const stageNum = idx + 1;
      const shortName = stageSpec.shortName || defaultShortNames[stageKey] || `阶段 ${stageNum}`;
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

      btn.className = `stage-tab-btn px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 border whitespace-nowrap ${themeClass}`;
      btn.innerHTML = `
        <span class="w-4 h-4 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'} text-[10px] flex items-center justify-center font-bold flex-shrink-0">${stageNum}</span>
        <span class="whitespace-nowrap font-medium text-xs">${shortName}</span>
        ${timeBadge ? `<span class="text-[9px] px-1 py-0.2 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-500'} font-mono hidden 2xl:inline flex-shrink-0">${timeBadge}</span>` : ''}
      `;

      btn.addEventListener('click', () => {
        this.currentStage = stageKey;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(`algo-stage-${this.modelId}`, stageKey);
          localStorage.setItem('algo-preferred-stage', stageKey);
        }
        this.renderStageTabs();
        this.loadAndReset();
        this.syncStateToHash(0);
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
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(`algo-dir-${this.modelId}`, dirKey);
          localStorage.setItem('algo-preferred-dir', dirKey);
        }
        this.renderDirectionTabs();
        this.loadAndReset();
        this.syncStateToHash(0);
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

    // Code font size scaling
    const btnFontDec = document.getElementById('btn-code-font-dec');
    const btnFontInc = document.getElementById('btn-code-font-inc');
    if (btnFontDec) {
      btnFontDec.addEventListener('click', () => {
        this.setCodeFontSize(this.codeFontSize - 0.5);
      });
    }
    if (btnFontInc) {
      btnFontInc.addEventListener('click', () => {
        this.setCodeFontSize(this.codeFontSize + 0.5);
      });
    }

    // Stage-3 Subview switcher
    const btnSubMatrix = document.getElementById('btn-subview-matrix');
    const btnSubTree = document.getElementById('btn-subview-tree');
    if (btnSubMatrix) btnSubMatrix.addEventListener('click', () => this.setStage3SubView('matrix'));
    if (btnSubTree) btnSubTree.addEventListener('click', () => this.setStage3SubView('tree'));

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

    // Right-panel tabs (Code / Problem / Analysis)
    const btnTabCode = document.getElementById('btn-tab-code');
    const btnTabProblem = document.getElementById('btn-tab-problem');
    const btnTabAnalysis = document.getElementById('btn-tab-analysis');
    if (btnTabCode) btnTabCode.addEventListener('click', () => this.switchRightTab('code'));
    if (btnTabProblem) btnTabProblem.addEventListener('click', () => this.switchRightTab('problem'));
    if (btnTabAnalysis) btnTabAnalysis.addEventListener('click', () => this.switchRightTab('analysis'));

    // Problem Modal (Open / Close)
    const btnOpenProblemModal = document.getElementById('btn-open-problem-modal') || document.getElementById('btn-problem-meta-badge');
    const btnCloseProblemModal = document.getElementById('btn-close-problem-modal');
    const modalProblem = document.getElementById('modal-problem');

    if (btnOpenProblemModal) {
      btnOpenProblemModal.addEventListener('click', () => this.openProblemModal());
    }
    if (btnCloseProblemModal) {
      btnCloseProblemModal.addEventListener('click', () => this.closeProblemModal());
    }
    if (modalProblem) {
      modalProblem.addEventListener('click', (e) => {
        if (e.target === modalProblem) {
          this.closeProblemModal();
        }
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalProblem && !modalProblem.classList.contains('hidden')) {
        this.closeProblemModal();
      }
    });
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
