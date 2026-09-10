/**
 * 通用声明式算法可视化器基类 (DeclarativeAlgorithmVisualizer)
 * 封装通用 4-Card 交互、Scrubber 步进、代码终端挂载与多模式事件处理
 */

import { StepVisualizer, StepBase } from './step-visualizer';
import {
  DeclarativeAlgorithmSpec,
  DeclarativeStagePresenter,
  VisualSlot,
  PresetCaseDef,
} from './renderers/declarative-stage-presenter';
import { PresetCasePresenter } from './renderers/preset-case-presenter';
import { ThreeViewControlsAdapter } from './renderers/three-view-controls-adapter';
import { SplitterEngine, SplitterStorage } from './splitter-engine';
import { panelCollapseCoordinator } from './controllers/panel-collapse-coordinator';
import { registerAlgorithm } from './registry';

export class DeclarativeAlgorithmVisualizer<TStep extends StepBase = any> extends StepVisualizer<TStep> {
  protected codeLines: string[] = [];
  protected spec: DeclarativeAlgorithmSpec<TStep>;
  protected currentMode?: string;
  protected currentStageId?: string;
  protected sandboxContainer: HTMLElement | null = null;
  protected customMetricsContainer: HTMLElement | null = null;
  protected liveTextEl: HTMLElement | null = null;
  protected logContainer: HTMLElement | null = null;
  protected logCountEl: HTMLElement | null = null;
  protected metricElements: Map<string, HTMLElement> = new Map();
  protected mainSplitter: SplitterEngine | null = null;
  protected leftSplitter: SplitterEngine | null = null;
  protected rightSplitter: SplitterEngine | null = null;
  public is3DMode: boolean = false;

  constructor(spec: DeclarativeAlgorithmSpec<TStep>) {
    super();
    this.spec = spec;
    if (spec.stages && spec.stages.length > 0) {
      let initialStage = spec.defaultStage || spec.stages[0].id;
      if (typeof localStorage !== 'undefined') {
        try {
          const savedStage = localStorage.getItem(`algo-stage-${spec.id}`);
          if (savedStage && spec.stages.some((s) => s.id === savedStage)) {
            initialStage = savedStage;
          }
        } catch {}
      }
      if (spec.modes && spec.modes.length > 0) {
        this.currentMode = spec.modes[0].id;
      }
      this.currentStageId = initialStage;
      const curStage = spec.stages.find((s) => s.id === this.currentStageId) || spec.stages[0];
      let targetCodeLangs = curStage.codeLanguages;
      if (curStage.modeCodeLanguages && this.currentMode && curStage.modeCodeLanguages[this.currentMode]) {
        targetCodeLangs = curStage.modeCodeLanguages[this.currentMode];
      }
      this.codeLanguages = targetCodeLangs;
      this.codeLines = targetCodeLangs['java'] || Object.values(targetCodeLangs)[0] || [];
    } else {
      if (spec.modes && spec.modes.length > 0) {
        this.currentMode = spec.modes[0].id;
      }
      const langs = spec.codeLanguages || spec.sourceCodes || {};
      this.codeLanguages = langs;
      this.codeLines = langs['java'] || Object.values(langs)[0] || [];
    }
    this.codePanelTitle = `${spec.name} 代码调试`;
  }

  protected initDOMElements(): void {
    if (!this.root) return;

    this.sandboxContainer = this.root.querySelector('#dsp-sandbox-container');
    this.customMetricsContainer = this.root.querySelector('#dsp-custom-metrics-container');
    this.liveTextEl = this.root.querySelector('#dsp-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 缓存指标卡片 DOM 引用
    this.metricElements.clear();
    (this.spec.metrics || []).forEach((m) => {
      const metricId = m.id.startsWith('metric-') ? m.id : `metric-${m.id}`;
      const el = this.root?.querySelector(`#${metricId}`) as HTMLElement | null;
      if (el) {
        this.metricElements.set(m.id, el);
        this.metricElements.set(metricId, el);
        const bareId = m.id.startsWith('metric-') ? m.id.slice(7) : m.id;
        this.metricElements.set(bareId, el);
      }
    });

    // 绑定标准播放控制
    this.bindPlaybackControls();

    // 绑定模式切换 (顺推 / 逆推 dir-tab-btn)
    this.root.querySelectorAll<HTMLButtonElement>('.dir-tab-btn, .dsp-mode-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.root?.querySelectorAll('.dir-tab-btn, .dsp-mode-chip').forEach((b) => {
          b.classList.remove('active', 'bg-blue', 'bg-blue-600', 'text-white', 'shadow-sm', 'font-bold', 'border-blue-600');
          b.classList.add('text-slate-600', 'hover:text-slate-900', 'hover:bg-white', 'border-transparent', 'font-semibold');
        });
        btn.classList.add('active', 'bg-blue-600', 'text-white', 'shadow-sm', 'font-bold', 'border-blue-600');
        btn.classList.remove('text-slate-600', 'hover:text-slate-900', 'hover:bg-white', 'border-transparent', 'font-semibold');
        this.currentMode = btn.dataset.mode || btn.dataset.dir || '';
        this.syncTerminalCode();
        this.start();
      });
    });

    // 绑定 Shared 预设案例下拉选框交互
    PresetCasePresenter.bindSelect(this.root, this.spec.presets, () => {
      this.start();
    });

    // 绑定顶栏自定义输入控件事件 (实时响应输入，支持 input 防抖、change、Enter 键自动重新推导)
    (this.spec.inputs || []).forEach((inputDef) => {
      const el = this.root?.querySelector(`#${inputDef.id}`) as HTMLInputElement | HTMLSelectElement | null;
      if (!el) return;

      if (inputDef.type === 'select') {
        el.addEventListener('change', () => {
          this.start();
        });
      } else {
        el.addEventListener('change', () => {
          this.start();
        });
        el.addEventListener('keydown', (e) => {
          if ((e as KeyboardEvent).key === 'Enter') {
            this.start();
          }
        });
        let debounceTimer: any = null;
        el.addEventListener('input', () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            this.start();
          }, 250);
        });
      }
    });

    // 绑定阶段演化切换 Tabs
    this.root.querySelectorAll<HTMLButtonElement>('.dsp-stage-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const stageId = btn.dataset.stage;
        if (stageId && stageId !== this.currentStageId) {
          this.switchStage(stageId);
        }
      });
    });

    // 绑定 3D 立体 / 2D 平面沙盘视角切换按钮 (100% 委托系统公共适配器)
    const btnToggle3D = this.root.querySelector('#btn-toggle-3d') as HTMLButtonElement | null;
    if (btnToggle3D) {
      btnToggle3D.addEventListener('click', (e) => {
        e.stopPropagation();
        this.is3DMode = !this.is3DMode;
        ThreeViewControlsAdapter.syncToggleButtonState(btnToggle3D, this.is3DMode);
        if (this.steps[this.currentIndex]) {
          this.renderStep(this.steps[this.currentIndex]);
        }
      });
    }

    // 初始化时同步当前活跃阶段的徽章、标题与图例
    if (this.currentStageId) {
      this.applyStageUI(this.currentStageId);
    }

    // 挂载暗色代码终端 (精准对齐当前阶段与顺推/逆推 modeCodeLanguages)
    this.syncTerminalCode();

    // 挂载左右拖拽分栏与右侧上下高度分栏 (Splitter)
    const mainLayout = this.root.querySelector('.dsp-main-layout') as HTMLElement | null;
    const rightSection = this.root.querySelector('.dsp-right-section') as HTMLElement | null;
    const logCard = this.root.querySelector('.dsp-log-card') as HTMLElement | null;

    if (mainLayout && rightSection) {
      try {
        this.mainSplitter?.destroy();
        this.mainSplitter = new SplitterEngine({
          id: 'dsp-main-aside-width',
          direction: 'horizontal',
          targetElement: rightSection,
          containerElement: mainLayout,
          defaultSize: 450,
          minSize: 340,
          maxRatio: 0.60,
          scope: 'global',
          invert: true,
          mode: 'grid',
          attachPosition: 'before',
          className: 'algo-splitter-horizontal',
          title: '左右拖拽调整代码面板宽度，双击恢复默认',
        });
      } catch (e) {
        console.warn('[DeclarativeVisualizer] Failed to setup main splitter:', e);
      }
    }

    const leftSection = this.root.querySelector('.dsp-left-section') as HTMLElement | null;
    const monitorCard = this.root.querySelector('.dsp-left-section .dsp-card:last-child') as HTMLElement | null;

    // 左右下方面板（Card 2 状态监控 & Card 4 执行日志）支持完全独立调整高度与各自记忆偏好
    const monitorHeightKey = 'dsp-monitor-card-height';
    const logHeightKey = 'dsp-log-card-height';
    const defaultBottomHeight = 240;

    const savedMonitorHeight = SplitterStorage.get(monitorHeightKey, this.spec.id, defaultBottomHeight) || defaultBottomHeight;
    const savedLogHeight = SplitterStorage.get(logHeightKey, this.spec.id, defaultBottomHeight) || defaultBottomHeight;

    const setMonitorCardHeight = (size: number) => {
      const clampedSize = Math.max(140, Math.round(size));
      if (monitorCard) {
        monitorCard.style.height = `${clampedSize}px`;
        monitorCard.style.flex = `0 0 ${clampedSize}px`;
      }
    };

    const setLogCardHeight = (size: number) => {
      const clampedSize = Math.max(140, Math.round(size));
      if (logCard) {
        logCard.style.height = `${clampedSize}px`;
        logCard.style.flex = `0 0 ${clampedSize}px`;
      }
    };

    // 初始分别应用各自保存的独立高度
    setMonitorCardHeight(savedMonitorHeight);
    setLogCardHeight(savedLogHeight);

    if (leftSection && monitorCard) {
      try {
        this.leftSplitter?.destroy();
        this.leftSplitter = new SplitterEngine({
          id: monitorHeightKey,
          direction: 'vertical',
          targetElement: monitorCard,
          containerElement: leftSection,
          defaultSize: defaultBottomHeight,
          minSize: 140,
          maxRatio: 0.60,
          scope: this.spec.id,
          invert: true,
          mode: 'flex',
          attachPosition: 'before',
          className: 'algo-splitter-vertical',
          title: '上下拖拽调整状态监视器面板高度，双击恢复默认',
          onResize: (size) => setMonitorCardHeight(size),
          onDragEnd: (size) => {
            setMonitorCardHeight(size);
            SplitterStorage.set(monitorHeightKey, size, this.spec.id, true);
          },
        });
      } catch (e) {
        console.warn('[DeclarativeVisualizer] Failed to setup left splitter:', e);
      }
    }

    if (rightSection && logCard) {
      try {
        this.rightSplitter?.destroy();
        this.rightSplitter = new SplitterEngine({
          id: logHeightKey,
          direction: 'vertical',
          targetElement: logCard,
          containerElement: rightSection,
          defaultSize: defaultBottomHeight,
          minSize: 140,
          maxRatio: 0.60,
          scope: this.spec.id,
          invert: true,
          mode: 'flex',
          attachPosition: 'before',
          className: 'algo-splitter-vertical',
          title: '上下拖拽调整执行日志面板高度，双击恢复默认',
          onResize: (size) => setLogCardHeight(size),
          onDragEnd: (size) => {
            setLogCardHeight(size);
            SplitterStorage.set(logHeightKey, size, this.spec.id, true);
          },
        });
      } catch (e) {
        console.warn('[DeclarativeVisualizer] Failed to setup right splitter:', e);
      }
    }

    // 绑定所有面板双击标题折叠/展开
    panelCollapseCoordinator.bind(this.root);
  }

  /**
   * 同步阶段专属 UI 元素 (按钮主题、徽章、Card 1/Card 2 标题和图例)
   */
  public applyStageUI(stageId: string): void {
    if (!this.spec.stages || this.spec.stages.length === 0) return;
    const stage = this.spec.stages.find((s) => s.id === stageId);
    if (!stage) return;

    // 1. 更新阶段 Tab 按钮样式与主题色
    this.root?.querySelectorAll<HTMLButtonElement>('.dsp-stage-tab-btn').forEach((btn) => {
      btn.classList.remove('active', 'bg-blue', 'bg-emerald', 'bg-amber');
      if (btn.dataset.stage === stageId) {
        const isStage4 = stageId === 'stage-4' || stageId === 'stage4' || stage.num === 4;
        const isStage3 = stageId === 'stage-3' || stageId === 'stage3' || stage.num === 3;
        const theme = isStage4 ? 'bg-amber' : isStage3 ? 'bg-emerald' : 'bg-blue';
        btn.classList.add('active', theme);
      }
    });

    // 2. 更新顶栏徽章
    const modeBadgeEl = this.root?.querySelector('#dsp-badge-mode');
    if (modeBadgeEl) {
      modeBadgeEl.textContent = stage.badge?.mode || stage.name;
    }
    const complexityBadgeEl = this.root?.querySelector('#dsp-badge-complexity');
    if (complexityBadgeEl) {
      complexityBadgeEl.textContent = stage.badge?.complexity || stage.timeBadge || '';
    }

    // 3. 更新 Card 1 / Card 2 标题与描述 (优先使用 primaryVisual / auxiliaryVisual 结构定义)
    const c1TitleText = stage.primaryVisual?.title || stage.card1Title;
    if (c1TitleText) {
      const c1Title = this.root?.querySelector('.dsp-left-section .dsp-card:first-child .dsp-card-title span');
      if (c1Title) c1Title.textContent = c1TitleText;
    }
    const c2TitleText = stage.auxiliaryVisual?.title || stage.card2Title;
    if (c2TitleText) {
      const c2Title = this.root?.querySelector('.dsp-left-section .dsp-card:last-child .dsp-card-title');
      if (c2Title) c2Title.textContent = c2TitleText;
    }
    const c2DescText = stage.auxiliaryVisual?.desc || stage.card2Desc;
    if (c2DescText) {
      const c2Desc = this.root?.querySelector('.dsp-left-section .dsp-card:last-child .dsp-card-desc');
      if (c2Desc) c2Desc.textContent = c2DescText;
    }

    // 3.1 更新 Card 1 图例 (若阶段提供或回退全局)
    const legendBar = this.root?.querySelector('.dsp-left-section .dsp-card:first-child .dsp-legend-bar');
    if (legendBar) {
      const activeLegend = stage.legend || this.spec.legend || [];
      legendBar.innerHTML = activeLegend
        .map((lg) => `<div><span class="dsp-legend-dot" style="background: ${lg.color};"></span> ${lg.label}</div>`)
        .join('');
    }

    // 3.2 同步 Card 1 3D 切换按钮可见性与外观 (若阶段声明 has3D)
    const btnToggle3D = this.root?.querySelector('#btn-toggle-3d') as HTMLButtonElement | null;
    if (btnToggle3D) {
      if (stage.has3D) {
        btnToggle3D.style.display = 'inline-flex';
        ThreeViewControlsAdapter.syncToggleButtonState(btnToggle3D, this.is3DMode);
      } else {
        btnToggle3D.style.display = 'none';
      }
    }
  }

  /**
   * 阶段演化切换控制器 (Stage Navigation)
   */
  public switchStage(stageId: string): void {
    if (!this.spec.stages || this.spec.stages.length === 0) return;
    const stage = this.spec.stages.find((s) => s.id === stageId);
    if (!stage) return;
    this.currentStageId = stageId;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`algo-stage-${this.spec.id}`, stageId);
      } catch {}
    }

    this.applyStageUI(stageId);

    // 4. 更新暗色代码终端源码
    this.syncTerminalCode();

    // 5. 重新从当前阶段构建步骤并重置播放状态
    this.start();
  }

  /**
   * 同步暗色终端源码 (根据当前阶段与当前模式 mode 智能匹配)
   */
  protected syncTerminalCode(): void {
    const curStage = this.spec.stages?.find((s) => s.id === this.currentStageId);
    let targetCodeLangs = curStage?.codeLanguages || this.spec.codeLanguages || this.spec.sourceCodes || {};
    if (curStage?.modeCodeLanguages && this.currentMode && curStage.modeCodeLanguages[this.currentMode]) {
      targetCodeLangs = curStage.modeCodeLanguages[this.currentMode];
    }
    const curLang = this.codeTerminal?.getCurrentLanguage() || 'java';
    this.codeLanguages = targetCodeLangs;
    this.codeLines = targetCodeLangs[curLang] || Object.values(targetCodeLangs)[0] || [];
    this.mountTerminal({
      codeLanguages: targetCodeLangs,
      problemHtml: this.spec.problemHtml,
      analysisHtml: this.spec.analysisHtml,
      initialLang: curLang,
    });
  }

  public getCurrentStage(): string | undefined {
    return this.currentStageId;
  }

  /**
   * 从 UI 控件提取参数并调用 Spec 或当前阶段的纯推导函数
   */
  protected buildSteps(): TStep[] {
    const inputs: Record<string, any> = {};
    (this.spec.inputs || []).forEach((input) => {
      const el = this.root?.querySelector(`#${input.id}`) as HTMLInputElement | HTMLSelectElement | null;
      if (el) {
        inputs[input.id] = el.value;
      } else {
        inputs[input.id] = input.defaultValue;
      }
    });

    if (this.spec.stages && this.spec.stages.length > 0 && this.currentStageId) {
      const stage = this.spec.stages.find((s) => s.id === this.currentStageId);
      const stageFn = stage?.buildSteps || stage?.generateSteps;
      if (typeof stageFn === 'function') {
        return stageFn(inputs, this.currentMode);
      }
    }

    const stepFn = this.spec.buildSteps || this.spec.generateSteps;
    if (typeof stepFn === 'function') {
      return stepFn(inputs, this.currentMode);
    }
    return [];
  }

  /**
   * 确保关键沙盘与指标容器引用始终有效且处于 DOM 连接状态 (防白板防御)
   */
  protected ensureContainers(): void {
    if (!this.root) return;
    if (!this.sandboxContainer || !this.sandboxContainer.isConnected) {
      this.sandboxContainer = this.root.querySelector('#dsp-sandbox-container');
    }
    if (!this.customMetricsContainer || !this.customMetricsContainer.isConnected) {
      this.customMetricsContainer = this.root.querySelector('#dsp-custom-metrics-container');
    }
    if (!this.liveTextEl || !this.liveTextEl.isConnected) {
      this.liveTextEl = this.root.querySelector('#dsp-live-text');
    }
    if (!this.logContainer || !this.logContainer.isConnected) {
      this.logContainer = this.root.querySelector('#log-container');
    }
  }

  /**
   * 渲染单步状态
   */
  protected renderStep(step: TStep): void {
    if (!step) return;
    this.ensureContainers();

    const stage = this.spec.stages?.find((s) => s.id === this.currentStageId);

    // 1. 调用 Spec / Stage 的 Card 1 主视觉沙盘渲染器 (优先 primaryVisual.render，兼容 renderCanvas)
    const primaryRender =
      stage?.primaryVisual?.render ||
      stage?.renderCanvas ||
      this.spec.primaryVisual?.render ||
      this.spec.renderCanvas;
    if (this.sandboxContainer && primaryRender) {
      primaryRender(this.sandboxContainer, step, {
        mode: this.currentMode,
        currentIndex: this.currentIndex,
        stageId: this.currentStageId,
        is3DMode: this.is3DMode,
      });
    }

    // 1.5 调用 Spec / Stage 的 Card 2 辅助视觉/调用栈/决策树渲染器 (优先 auxiliaryVisual.render，兼容 renderCustomMetrics)
    const auxRender =
      stage?.auxiliaryVisual?.render ||
      stage?.renderCustomMetrics ||
      this.spec.auxiliaryVisual?.render ||
      this.spec.renderCustomMetrics;
    if (this.customMetricsContainer && auxRender) {
      auxRender(this.customMetricsContainer, step, {
        mode: this.currentMode,
        currentIndex: this.currentIndex,
        stageId: this.currentStageId,
      });
    }

    // 2. 更新通用实时解说文本与指标卡片
    const anyStep = step as any;
    if (anyStep.metrics && typeof anyStep.metrics === 'object') {
      Object.entries(anyStep.metrics).forEach(([key, val]) => {
        const metricEl =
          this.metricElements.get(key) ||
          (this.root?.querySelector(`#metric-${key}`) as HTMLElement | null) ||
          (this.root?.querySelector(`#${key}`) as HTMLElement | null);
        if (metricEl) {
          metricEl.textContent = String(val);
        }
      });
    }

    const msg = anyStep.message || anyStep.msg || anyStep.log || '';
    if (this.liveTextEl && msg) {
      this.liveTextEl.textContent = `💡 ${msg}`;
    }

    // 2.5 驱动暗色代码终端行高亮与变量监控 (每一行都是一步，绝不跳步)
    if (this.codeTerminal) {
      if (anyStep.codeLine != null) {
        this.codeTerminal.highlightLine(anyStep.codeLine);
      }
      // 保证代码框纯净，绝不将 Card 2 外部 metrics 泄露悬浮至代码终端内
      this.codeTerminal.updateVars(anyStep.vars && anyStep.vars.length > 0 ? anyStep.vars : [], anyStep);
    }

    // 3. 更新日志流 (严格对齐 StateSpacePresenter 标准树形日志模板)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st: any, idx: number) => {
        const isCurrent = idx === this.currentIndex;
        const logMsg = st.log || st.msg || st.message || `步骤 #${idx + 1}`;

        const baseStyle = isCurrent
          ? 'padding: 3px 8px; border-radius: 6px; background: #eff6ff; color: #1e3a8a; font-weight: 700; border-left: 2.5px solid #3b82f6; display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-bottom: 2px; font-family: monospace; box-shadow: 0 1px 2px rgba(59, 130, 246, 0.08);'
          : 'padding: 2px 8px; border-radius: 4px; color: #64748b; font-size: 11px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; font-family: monospace;';

        return `
          <div style="${baseStyle}">
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; margin-right: 8px;">${logMsg}</span>
            <span style="color: #94a3b8; font-size: 10px; font-weight: normal; flex-shrink: 0;">#${idx + 1}</span>
          </div>
        `;
      });
      this.logContainer.innerHTML = logs.join('');
      this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    if (this.logCountEl) {
      this.logCountEl.textContent = `${this.currentIndex + 1} / ${this.steps.length} 记录`;
    }

    // 4. 更新贯穿式 Scrubber 步数指示器与进度条
    const stepCurEl = this.root?.querySelector('#step-cur');
    const stepTotalEl = this.root?.querySelector('#step-total');
    if (stepCurEl) stepCurEl.textContent = String(this.currentIndex + 1);
    if (stepTotalEl) stepTotalEl.textContent = String(this.steps.length);

    if (this.progressSlider) {
      this.progressSlider.max = String(Math.max(0, this.steps.length - 1));
      this.progressSlider.value = String(this.currentIndex);
    }
  }

  public reset(): void {
    this.pause();
    (this.spec.inputs || []).forEach((input) => {
      const el = this.root?.querySelector(`#${input.id}`) as HTMLInputElement | HTMLSelectElement | null;
      if (el && input.defaultValue !== undefined) {
        el.value = String(input.defaultValue);
      }
    });

    // 重置后必须从阶段 1 开始并持久化为阶段 1
    if (this.spec.stages && this.spec.stages.length > 0) {
      const firstStageId = this.spec.stages[0].id;
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(`algo-stage-${this.spec.id}`, firstStageId);
        } catch {}
      }
      if (this.currentStageId !== firstStageId) {
        this.switchStage(firstStageId);
        return;
      }
    }

    this.start();
  }

  public destroy(): void {
    this.mainSplitter?.destroy();
    this.mainSplitter = null;
    this.leftSplitter?.destroy();
    this.leftSplitter = null;
    this.rightSplitter?.destroy();
    this.rightSplitter = null;
    super.destroy();
  }
}

/**
 * 辅助工厂函数：直接根据 Spec 创建并注册算法
 */
export function createDeclarativeVisualizer<TStep extends StepBase = any>(
  spec: DeclarativeAlgorithmSpec<TStep>
): {
  template: string;
  Visualizer: new () => DeclarativeAlgorithmVisualizer<TStep>;
} {
  const template = DeclarativeStagePresenter.generateTemplate(spec);

  class GeneratedVisualizer extends DeclarativeAlgorithmVisualizer<TStep> {
    constructor() {
      super(spec);
    }
  }

  return {
    template,
    Visualizer: GeneratedVisualizer,
  };
}

/**
 * 高杠杆一站式声明式算法注册入口 (Deep Module Seam)
 * 接受纯粹的领域算法声明式规范 (DeclarativeAlgorithmSpec)，
 * 内部自动完成 HTML 骨架编译、Card 1/Card 2 视觉层级绑定以及 AlgorithmRegistry 注册。
 */
export function registerDeclarativeAlgorithm<TStep extends StepBase = any>(
  spec: DeclarativeAlgorithmSpec<TStep>
): {
  template: string;
  Visualizer: new () => DeclarativeAlgorithmVisualizer<TStep>;
} {
  const result = createDeclarativeVisualizer(spec);
  registerAlgorithm({
    id: spec.id,
    name: spec.name || spec.title || spec.id,
    viewId: spec.viewId || `algo-${spec.id}-view`,
    category: spec.category,
    description: spec.description || spec.name || spec.title || spec.id,
    icon: spec.icon || '📊',
    difficulty: (typeof spec.difficulty === 'number' ? spec.difficulty : (spec.difficulty === 'easy' ? 1 : spec.difficulty === 'hard' ? 3 : 2)) as 1 | 2 | 3,
    levelOrder: spec.levelOrder || 99,
    learningGoal: spec.learningGoal || '',
    template: result.template,
    Visualizer: result.Visualizer,
  });
  return result;
}

