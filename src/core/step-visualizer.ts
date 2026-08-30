/**
 * 步进式可视化器基类
 * 封装通用的播放/暂停/上一步/下一步/重置/速度控制逻辑，
 * 以及 CodePanel 的创建与高亮同步。
 * 子类只需实现 buildSteps / renderStep，专注于每题的算法与可视化。
 */

import {
  IVisualizer,
  VisualizerContext,
  StepVar,
  ExecutionStepMode,
  getSavedStepMode,
  saveStepMode,
  DpViewportMode,
  getSavedViewportMode,
  saveViewportMode,
} from './interfaces';
import { CodePanel, HighlightTarget } from './code-panel';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
  DarkCodeTerminalConfig,
} from './renderers/dark-code-terminal-presenter';

export interface StepBase {
  /** 语义锚点标识（如 'update', 'loop-outer', 'return'），优先用于代码高亮与多语言对齐 */
  anchor?: string;
  /** 该步对应的高亮代码行（支持数字、对象或多语言字典） */
  codeLine?: HighlightTarget;
  /** 该步的说明文字 */
  message?: string;
  /** 日志文本，用于日志面板显示 */
  log?: string;
  /** 当前步骤的变量快照，用于变量监视面板 */
  vars?: StepVar[];
}

export abstract class StepVisualizer<TStep extends StepBase> implements IVisualizer {
  protected root: HTMLElement | null = null;
  protected codePanel: CodePanel | null = null;
  protected codeTerminal: DarkCodeTerminalInstance | null = null;
  protected steps: TStep[] = [];
  protected currentIndex = 0;
  protected isPlaying = false;
  protected playbackSpeed = 900;
  protected timer: number | null = null;
  protected stepMode: ExecutionStepMode = getSavedStepMode();
  protected viewportMode: DpViewportMode = getSavedViewportMode();

  // 子类在 initDOMElements 中填充这些引用（或由 bindPlaybackControls 自动发现）
  protected btnStart: HTMLButtonElement | null = null;
  protected btnReset: HTMLButtonElement | null = null;
  protected btnPrev: HTMLButtonElement | null = null;
  protected btnPlay: HTMLButtonElement | null = null;
  protected btnNext: HTMLButtonElement | null = null;
  protected progressSlider: HTMLInputElement | null = null;
  protected speedSlider: HTMLInputElement | null = null;
  protected speedSelect: HTMLSelectElement | null = null;
  protected speedLabel: HTMLElement | null = null;
  protected stepCounter: HTMLElement | null = null;
  protected messageEl: HTMLElement | null = null;
  protected liveMessageEl: HTMLElement | null = null;
  protected modeSelectorEl: HTMLElement | null = null;
  protected viewportSelectorEl: HTMLElement | null = null;

  /** 代码行数组，子类需提供 */
  protected abstract codeLines: string[];
  /** 支持的多语言代码：{ java: [...], cpp: [...] } */
  protected codeLanguages: Record<string, string[]> = {};
  /** 默认代码语言（用于 token 高亮） */
  protected codeLanguage: string = 'java';
  /** 代码面板标题 */
  protected codePanelTitle = '代码联动';
  /** 逐行代码详细讲解映射表 */
  protected lineExplanations?: Record<number, string> | Record<string, Record<number, string>>;
  /** 算法核心要点讲解数据或文本 */
  protected keyPoints?: import('./code-panel').KeyPointsData | string;
  /** 日志容器 DOM 元素 ID（子类设置后自动绑定到 this.logEl） */
  protected logContainerId = '';
  /** 日志清除按钮 DOM 元素 ID（可选，设置后自动绑定点击清空） */
  protected clearLogButtonId = '';

  /** 当前算法标识 ID */
  protected algorithmId: string = '';
  /** 运行时上下文 */
  protected context: VisualizerContext | null = null;
  /** 用于去重绑定示例按钮，防止重复 addEventListener */
  private _exampleHandlers = new WeakMap<HTMLElement, () => void>();

  public async init(context?: VisualizerContext): Promise<void> {
    this.context = context || null;
    this.algorithmId = context?.algorithmId || '';
    this.root = context?.root || null;
    this.initDOMElements();
    this.bindLogContainer();
    this.initCodePanel();
    this.setupEvents();
    await this.start();
  }

  /** 子类实现：查询本算法的 DOM 元素 */
  protected abstract initDOMElements(): void;
  /** 子类实现：绑定本算法特有的事件（输入框、示例按钮等） */
  protected setupEvents(): void {
    if (!this.btnPlay && !this.btnNext && !this.btnPrev) {
      this.bindPlaybackControls();
    }
  }
  /** 子类实现：根据当前输入生成步骤 */
  protected abstract buildSteps(): TStep[];
  /** 子类实现：渲染某一步的可视化（不含消息/代码高亮，基类已处理） */
  protected abstract renderStep(step: TStep): void;

  protected initCodePanel(): void {
    const container = this.root?.querySelector('[data-code-panel]') as HTMLElement | null;
    if (container) {
      const hasLanguages = this.codeLanguages && Object.keys(this.codeLanguages).length > 0;
      this.codePanel = new CodePanel(container, {
        lines: this.codeLines,
        title: this.codePanelTitle,
        language: this.codeLanguage,
        lineExplanations: this.lineExplanations,
        keyPoints: this.keyPoints,
        scope: this.algorithmId || undefined,
        ...(hasLanguages ? { languages: this.codeLanguages } : {}),
      });
    }
  }

  /** 挂载并托管暗色代码终端深模块 */
  public mountTerminal(config: DarkCodeTerminalConfig): DarkCodeTerminalInstance {
    this.codeTerminal = DarkCodeTerminalPresenter.mount(this.root, config);
    return this.codeTerminal;
  }

  /** 手动设置暗色代码终端实例 */
  public setTerminal(instance: DarkCodeTerminalInstance | null): void {
    this.codeTerminal = instance;
  }

  /** 根据 logContainerId / clearLogButtonId 绑定 DOM 元素 */
  protected bindLogContainer(): void {
    if (this.clearLogButtonId) {
      const logEl = this.root?.querySelector(`#${this.logContainerId}`) as HTMLElement | null;
      if (logEl) {
        const btn = this.root?.querySelector(`#${this.clearLogButtonId}`) as HTMLElement | null;
        btn?.addEventListener('click', () => { logEl.innerHTML = ''; });
      }
    }
  }

  /**
   * 通用日志渲染：清空 → 遍历到当前步 → 调用 logFn 创建每行 DOM → 自动滚动
   * @param container 日志容器元素（通常为 this.querySelector(logContainerId)）
   * @param logFn 可选自定义渲染函数；默认使用单 div + active class + step.log
   */
  protected updateLog(
    container: HTMLElement | null,
    logFn?: (step: TStep, index: number, isCurrent: boolean) => HTMLElement
  ): void {
    if (!container) return;
    container.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const isCurrent = i === this.currentIndex;
      if (logFn) {
        container.appendChild(logFn(s, i, isCurrent));
      } else {
        const line = document.createElement('div');
        if (isCurrent) line.className = 'active';
        line.textContent = `${String(i + 1).padStart(2, '0')}. ${s.log}`;
        container.appendChild(line);
      }
    });
    container.scrollTop = container.scrollHeight;
  }

  /** 绑定通用播放控制按钮与进度条、速度选择器（支持现代与传统选择器智能匹配） */
  protected bindPlaybackControls(
    ids: {
      reset?: string;
      prev?: string;
      play?: string;
      next?: string;
      start?: string;
      speed?: string;
      speedLabel?: string;
      counter?: string;
      message?: string;
      progress?: string;
      liveText?: string;
      modeSelector?: string;
      viewportSelector?: string;
    } = {}
  ): void {
    if (!this.root) return;

    // 智能选择器匹配（优先使用自定义 ID，其次自适应现代 4-Card 选择器，最后回退传统 ID）
    const queryEl = <T extends HTMLElement>(customId: string | undefined, defaultSelectors: string[]): T | null => {
      if (customId) {
        return this.root!.querySelector(`#${customId}`) as T | null;
      }
      for (const selector of defaultSelectors) {
        const el = this.root!.querySelector(selector) as T | null;
        if (el) return el;
      }
      return null;
    };

    this.btnStart = queryEl<HTMLButtonElement>(ids.start, ['#btn-generate', '#btn-start', '#step-start']);
    this.btnReset = queryEl<HTMLButtonElement>(ids.reset, ['#btn-reset', '#step-reset']);
    this.btnPrev = queryEl<HTMLButtonElement>(ids.prev, ['#btn-step-prev', '#step-prev', '#btn-prev']);
    this.btnPlay = queryEl<HTMLButtonElement>(ids.play, ['#btn-play-pause', '#step-play', '#btn-play']);
    this.btnNext = queryEl<HTMLButtonElement>(ids.next, ['#btn-step-next', '#step-next', '#btn-next']);

    this.speedSlider = queryEl<HTMLInputElement>(ids.speed, ['#step-speed', '#slider-speed']);
    this.speedSelect = queryEl<HTMLSelectElement>(ids.speed, ['#select-speed', '#step-speed-select']);
    this.speedLabel = queryEl<HTMLElement>(ids.speedLabel, ['#step-speed-label', '#speed-value']);
    this.progressSlider = queryEl<HTMLInputElement>(ids.progress, ['#slider-progress', '#step-progress', '#timeline-slider']);
    this.stepCounter = queryEl<HTMLElement>(ids.counter, ['#metric-step', '#step-counter', '#step-count']);
    this.messageEl = queryEl<HTMLElement>(ids.message, ['#step-message', '#msg-box']);
    this.liveMessageEl = queryEl<HTMLElement>(ids.liveText, ['#step-live-text', '[id$="-live-text"]', '.live-text', '[data-live-text]']);
    this.modeSelectorEl = queryEl<HTMLElement>(ids.modeSelector, ['#step-mode-selector']);
    this.viewportSelectorEl = queryEl<HTMLElement>(ids.viewportSelector, ['#dp-viewport-selector']);

    if (this.btnStart) this.btnStart.onclick = () => this.start();
    if (this.btnReset) this.btnReset.onclick = () => this.reset();
    if (this.btnPrev) this.btnPrev.onclick = () => this.prevStep();
    if (this.btnPlay) this.btnPlay.onclick = () => this.togglePlay();
    if (this.btnNext) this.btnNext.onclick = () => this.nextStep();

    if (this.progressSlider) {
      this.progressSlider.oninput = (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val) && val >= 0 && val < this.steps.length) {
          this.goToStep(val);
        }
      };
    }

    if (this.speedSlider) {
      this.speedSlider.oninput = (e) => {
        this.playbackSpeed = parseInt((e.target as HTMLInputElement).value, 10);
        if (this.speedLabel) this.speedLabel.textContent = (this.playbackSpeed / 1000).toFixed(1) + 's';
      };
    }

    if (this.speedSelect) {
      this.speedSelect.onchange = (e) => {
        const val = parseInt((e.target as HTMLSelectElement).value, 10);
        if (!isNaN(val) && val > 0) {
          this.playbackSpeed = val;
        }
      };
    }

    if (this.speedLabel && this.speedSlider) {
      this.speedLabel.textContent = (this.playbackSpeed / 1000).toFixed(1) + 's';
    }

    this.bindModeSelector();
    this.bindViewportSelector();
  }

  protected bindModeSelector(): void {
    if (!this.modeSelectorEl) return;
    const buttons = this.modeSelectorEl.querySelectorAll<HTMLButtonElement>('[data-mode]');
    buttons.forEach((btn) => {
      const mode = btn.dataset.mode as ExecutionStepMode;
      btn.classList.toggle('is-active', mode === this.stepMode);
      btn.onclick = () => {
        if (mode && mode !== this.stepMode) {
          this.setStepMode(mode);
        }
      };
    });
  }

  public async setStepMode(mode: ExecutionStepMode): Promise<void> {
    this.stepMode = mode;
    saveStepMode(mode);
    if (this.modeSelectorEl) {
      const buttons = this.modeSelectorEl.querySelectorAll<HTMLButtonElement>('[data-mode]');
      buttons.forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.mode === mode);
      });
    }
    await this.start();
  }

  protected bindViewportSelector(): void {
    if (!this.viewportSelectorEl) return;
    const buttons = this.viewportSelectorEl.querySelectorAll<HTMLButtonElement>('[data-view]');
    buttons.forEach((btn) => {
      const view = btn.dataset.view as DpViewportMode;
      btn.classList.toggle('is-active', view === this.viewportMode);
      btn.onclick = () => {
        if (view && view !== this.viewportMode) {
          this.setViewportMode(view);
        }
      };
    });
    this.onViewportModeChanged(this.viewportMode);
  }

  public setViewportMode(mode: DpViewportMode): void {
    this.viewportMode = mode;
    saveViewportMode(mode);
    if (this.viewportSelectorEl) {
      const buttons = this.viewportSelectorEl.querySelectorAll<HTMLButtonElement>('[data-view]');
      buttons.forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.view === mode);
      });
    }
    this.onViewportModeChanged(mode);
    if (this.steps[this.currentIndex]) {
      this.renderStep(this.steps[this.currentIndex]);
    }
  }

  /** 视口模式变更时的钩子，供子类重写 */
  protected onViewportModeChanged(mode: DpViewportMode): void {
    if (this.root) {
      this.root.dataset.viewportMode = mode;
      const page = this.root.querySelector<HTMLElement>('.dp-demo-page');
      if (page) {
        page.dataset.viewportMode = mode;
      }
    }
  }

  /** 绑定示例按钮 */
  protected bindExamples(examples: Record<string, () => void>): void {
    if (!this.root) return;
    this.root.querySelectorAll<HTMLButtonElement>('[data-id]').forEach((btn) => {
      const id = btn.dataset.id;
      if (id && examples[id]) {
        // 移除旧监听器（如有），防止重复绑定
        const oldHandler = this._exampleHandlers.get(btn);
        if (oldHandler) btn.removeEventListener('click', oldHandler);
        const handler = examples[id];
        btn.addEventListener('click', handler);
        this._exampleHandlers.set(btn, handler);
      }
    });
  }

  protected async start(): Promise<void> {
    this.pause();
    this.steps = this.buildSteps();
    this.currentIndex = 0;
    this.render();
    this.updateButtons();
  }

  protected render(): void {
    if (this.steps.length === 0) return;
    const step = this.steps[this.currentIndex];
    this.renderStep(step);
    if (this.messageEl && step.message != null) this.messageEl.textContent = step.message;
    if (this.liveMessageEl && step.message != null) this.liveMessageEl.textContent = step.message;
    if (this.stepCounter) {
      const counterText = this.stepCounter.textContent || '';
      if (counterText.includes('步骤:') || counterText.includes('步骤：')) {
        this.stepCounter.textContent = `步骤: ${this.currentIndex + 1} / ${this.steps.length}`;
      } else {
        this.stepCounter.textContent = `${this.currentIndex + 1} / ${this.steps.length}`;
      }
    }
    if (this.progressSlider) {
      this.progressSlider.max = String(Math.max(0, this.steps.length - 1));
      this.progressSlider.value = String(this.currentIndex);
    }
    if (step.codeLine != null) {
      this.codePanel?.highlight(step.codeLine);
      this.codeTerminal?.highlightLine(step.codeLine);
    }
    // 更新代码面板下方变量监视器（支持 step.vars 与 step.metrics 双向同步）
    const stepAny = step as { vars?: StepVar[]; metrics?: Record<string, unknown> };
    const effectiveVars: StepVar[] | undefined = stepAny.vars || (
      stepAny.metrics
        ? Object.entries(stepAny.metrics).map(([name, value]) => ({
            name,
            value: String(value ?? '-'),
            type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string',
          }))
        : undefined
    );
    if (effectiveVars && effectiveVars.length > 0) {
      this.codePanel?.updateVars(effectiveVars);
    }
  }

  protected togglePlay(): void {
    if (this.currentIndex >= this.steps.length - 1) {
      this.goToStep(0);
      this.play();
      return;
    }
    this.isPlaying ? this.pause() : this.play();
  }

  protected play(): void {
    if (this.currentIndex >= this.steps.length - 1) {
      this.currentIndex = 0;
      this.render();
    }
    this.isPlaying = true;
    this.tick();
    this.updateButtons();
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.updateButtons();
  }

  protected tick(): void {
    if (!this.isPlaying) return;
    this.timer = setTimeout(() => {
      // 在回调中再次检查，防止 pause() 在 timer 触发和回调执行之间被调用
      if (!this.isPlaying) return;
      if (this.currentIndex < this.steps.length - 1) {
        this.nextStep();
        this.tick();
      } else {
        this.pause();
      }
    }, this.playbackSpeed) as unknown as number;
  }

  protected nextStep(): void {
    if (this.currentIndex >= this.steps.length - 1) return;
    this.currentIndex++;
    this.render();
    this.updateButtons();
  }

  protected prevStep(): void {
    if (this.currentIndex <= 0) return;
    this.currentIndex--;
    this.render();
    this.updateButtons();
  }

  public reset(): void {
    this.pause();
    this.currentIndex = 0;
    this.render();
    this.updateButtons();
  }

  /** 直接跳转到指定步骤索引（供时间轴/步骤选择器点击交互） */
  public goToStep(index: number): void {
    if (index < 0 || index >= this.steps.length) return;
    this.pause();
    this.currentIndex = index;
    this.render();
    this.updateButtons();
  }

  public get currentStepIndex(): number {
    return this.currentIndex;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  protected updateButtons(): void {
    const finished = this.currentIndex >= this.steps.length - 1;
    if (this.btnPrev) this.btnPrev.disabled = this.currentIndex === 0;
    if (this.btnNext) this.btnNext.disabled = finished;
    if (this.btnPlay) {
      this.btnPlay.disabled = false;
      const playText = this.isPlaying ? '暂停' : finished ? '重播' : '播放';
      const playIcon = this.isPlaying ? '⏸' : finished ? '↺' : '▶';

      let iconSpan: HTMLElement | null = null;
      try {
        iconSpan = this.btnPlay.querySelector?.<HTMLElement>('#play-icon, .play-icon, .icon, i') || null;
      } catch {
        iconSpan = null;
      }

      if (iconSpan) {
        const iconClasses = typeof iconSpan.className === 'string' ? iconSpan.className : '';
        if (iconSpan.tagName?.toLowerCase() === 'i' || iconClasses.includes('fa-solid') || iconClasses.includes('fas')) {
          iconSpan.className = this.isPlaying ? 'fa-solid fa-pause text-[12px]' : finished ? 'fa-solid fa-rotate-left text-[12px]' : 'fa-solid fa-play text-[12px]';
        } else {
          iconSpan.textContent = playIcon;
        }
      } else {
        const currentText = this.btnPlay.textContent?.trim() || '';
        const className = typeof this.btnPlay.className === 'string' ? this.btnPlay.className : (this.btnPlay.getAttribute?.('class') || '');
        const isCircle = className.includes('rounded-full') || className.includes('circle') || className.includes('icon');
        const hasChineseText = /[\u4e00-\u9fa5]/.test(currentText);

        if (isCircle || (!hasChineseText && (currentText === '▶' || currentText === '⏸' || currentText === '✓' || currentText === ''))) {
          // 纯圆形或纯图标按钮，仅显示图标符号
          this.btnPlay.textContent = playIcon;
        } else if (currentText.includes('▶') || currentText.includes('⏸') || currentText.includes('✓')) {
          // 图标 + 文字混合按钮 (如 "▶ 播放")
          this.btnPlay.textContent = `${playIcon} ${playText}`;
        } else {
          // 纯文字按钮 (如 "播放")
          this.btnPlay.textContent = playText;
        }
      }
      this.btnPlay.title = this.isPlaying ? '暂停' : finished ? '已完成' : '自动播放/暂停';
    }
  }

  public destroy(): void {
    this.pause();
    // 移除所有示例按钮监听器
    if (this.root) {
      this.root.querySelectorAll<HTMLElement>('[data-id]').forEach((btn) => {
        const handler = this._exampleHandlers.get(btn);
        if (handler) {
          btn.removeEventListener('click', handler);
          this._exampleHandlers.delete(btn);
        }
      });
    }
    this.steps = [];
    this.currentIndex = 0;
    this.codePanel?.destroy();
    this.codeTerminal?.destroy();
    this.codeTerminal = null;
  }
}
