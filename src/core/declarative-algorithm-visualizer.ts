/**
 * 通用声明式算法可视化器基类 (DeclarativeAlgorithmVisualizer)
 * 封装通用 4-Card 交互、Scrubber 步进、代码终端挂载与多模式事件处理
 */

import { StepVisualizer } from './step-visualizer';
import {
  DeclarativeAlgorithmSpec,
  DeclarativeStagePresenter,
} from './renderers/declarative-stage-presenter';
import { SplitterEngine } from './splitter-engine';

export class DeclarativeAlgorithmVisualizer<TStep = any> extends StepVisualizer<TStep> {
  protected spec: DeclarativeAlgorithmSpec<TStep>;
  protected currentMode?: string;
  protected sandboxContainer: HTMLElement | null = null;
  protected customMetricsContainer: HTMLElement | null = null;
  protected liveTextEl: HTMLElement | null = null;
  protected logContainer: HTMLElement | null = null;
  protected logCountEl: HTMLElement | null = null;
  protected metricElements: Map<string, HTMLElement> = new Map();
  protected mainSplitter: SplitterEngine | null = null;
  protected leftSplitter: SplitterEngine | null = null;
  protected rightSplitter: SplitterEngine | null = null;

  constructor(spec: DeclarativeAlgorithmSpec<TStep>) {
    super();
    this.spec = spec;
    this.codeLanguages = spec.codeLanguages;
    this.codeLines = spec.codeLanguages['java'] || Object.values(spec.codeLanguages)[0] || [];
    this.codePanelTitle = `${spec.name} 代码调试`;
    if (spec.modes && spec.modes.length > 0) {
      this.currentMode = spec.modes[0].id;
    }
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
      const el = this.root?.querySelector(`#metric-${m.id}`) as HTMLElement | null;
      if (el) this.metricElements.set(m.id, el);
    });

    // 绑定标准播放控制
    this.bindPlaybackControls();

    // 绑定模式切换 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.dsp-mode-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.root?.querySelectorAll('.dsp-mode-chip').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentMode = btn.dataset.mode || '';
        this.start();
      });
    });

    // 绑定预设案例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.dsp-chip[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.root?.querySelectorAll('.dsp-chip[data-preset]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const raw = btn.dataset.preset;
        if (raw) {
          try {
            const values = JSON.parse(raw);
            Object.keys(values).forEach((k) => {
              const input = this.root?.querySelector(`#${k}`) as HTMLInputElement | HTMLSelectElement | null;
              if (input) input.value = values[k];
            });
          } catch (e) {
            console.error('[DeclarativeVisualizer] Failed to parse preset values:', e);
          }
        }
        this.start();
      });
    });

    // 挂载暗色代码终端
    this.mountTerminal({
      codeLanguages: this.spec.codeLanguages,
      problemHtml: this.spec.problemHtml,
      analysisHtml: this.spec.analysisHtml,
      initialLang: 'java',
    });

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

    if (leftSection && monitorCard) {
      try {
        this.leftSplitter?.destroy();
        this.leftSplitter = new SplitterEngine({
          id: 'dsp-monitor-card-height',
          direction: 'vertical',
          targetElement: monitorCard,
          containerElement: leftSection,
          defaultSize: 180,
          minSize: 140,
          maxRatio: 0.48,
          scope: this.spec.id,
          invert: true,
          mode: 'flex',
          attachPosition: 'before',
          className: 'algo-splitter-vertical',
          title: '上下拖拽调整沙盘与状态监控面板高度，双击恢复默认',
        });
      } catch (e) {
        console.warn('[DeclarativeVisualizer] Failed to setup left splitter:', e);
      }
    }

    if (rightSection && logCard) {
      try {
        this.rightSplitter?.destroy();
        this.rightSplitter = new SplitterEngine({
          id: 'dsp-log-card-height',
          direction: 'vertical',
          targetElement: logCard,
          containerElement: rightSection,
          defaultSize: 160,
          minSize: 90,
          maxRatio: 0.45,
          scope: this.spec.id,
          invert: true,
          mode: 'flex',
          attachPosition: 'before',
          className: 'algo-splitter-vertical',
          title: '上下拖拽调整执行日志面板高度，双击恢复默认',
        });
      } catch (e) {
        console.warn('[DeclarativeVisualizer] Failed to setup right splitter:', e);
      }
    }
  }

  /**
   * 从 UI 控件提取参数并调用 Spec 的纯推导函数
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

    return this.spec.buildSteps(inputs, this.currentMode);
  }

  /**
   * 渲染单步状态
   */
  protected renderStep(step: TStep): void {
    if (!step) return;

    // 1. 调用 Spec 的领域画布渲染器
    if (this.sandboxContainer && this.spec.renderCanvas) {
      this.spec.renderCanvas(this.sandboxContainer, step, {
        mode: this.currentMode,
        currentIndex: this.currentIndex,
      });
    }

    // 2. 更新通用实时解说文本
    const anyStep = step as any;
    const msg = anyStep.message || anyStep.msg || anyStep.log || '';
    if (this.liveTextEl && msg) {
      this.liveTextEl.textContent = `💡 ${msg}`;
    }

    // 3. 更新日志流
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st: any, idx: number) => {
        const action = st.action || 'step';
        const badgeColor =
          action === 'done' || action === 'success' ? '#16a34a' : action === 'pop' || action === 'visit' ? '#2563eb' : '#64748b';
        const badgeBg =
          action === 'done' || action === 'success' ? '#f0fdf4' : action === 'pop' || action === 'visit' ? '#eff6ff' : '#f8fafc';
        const logMsg = st.message || st.msg || st.log || `步骤 #${idx + 1}`;

        return `
          <div style="display: flex; align-items: flex-start; gap: 6px; padding: 2px 0; border-bottom: 1px solid #f8fafc; font-size: 10.5px;">
            <span style="color: #94a3b8; font-family: monospace; min-width: 22px;">#${idx + 1}</span>
            <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 0 4px; border-radius: 3px; font-weight: 700; font-size: 9.5px;">${action}</span>
            <span style="color: #334155; flex: 1;">${logMsg}</span>
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
    super.reset();
    if (this.sandboxContainer) this.sandboxContainer.innerHTML = '';
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
export function createDeclarativeVisualizer<TStep = any>(
  spec: DeclarativeAlgorithmSpec<TStep>
): {
  template: string;
  Visualizer: new () => StepVisualizer<TStep>;
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
