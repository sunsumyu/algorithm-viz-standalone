/**
 * 算法可视化画板应用总协调器深度模块 (VisualizerAppController Deep Module)
 * 遵循深度模块原则：
 * 将模型装载、状态推导、时间轴播放、网格/槽位渲染、代码高亮联动与 URL Hash 状态保持
 * 彻底封装进一个自治的状态机控制器中。
 * 外部 HTML 仅需声明 DOM 容器骨架并调用 controller.init()。
 */

import { AlgorithmModelRepository } from './model-repository';
import { UniversalStageEngine, type UniversalStep } from './universal-stage-engine';
import { VisualizerStateRouter } from './state-router';

import { PlaybackTimelineController } from './playback-timeline-controller';
import { VisualThemeManager } from './theme/visual-theme-manager';
import { SplitterEngine } from './splitter-engine';
import { StateSpacePresenter } from './renderers/state-space-presenter';
import { ProblemDimensionResolver } from './resolvers/problem-dimension-resolver';
import { AnalysisKnowledgePresenter } from './renderers/analysis-knowledge-presenter';
import { VisualizerParamSynchronizer } from './controllers/visualizer-param-synchronizer';
import { StageNavigationCoordinator } from './controllers/stage-navigation-coordinator';
import { RightPanelTabCoordinator } from './controllers/right-panel-tab-coordinator';
import { VisualizerInteractionBinder } from './controllers/visualizer-interaction-binder';
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
  public is3DMode: boolean = false;

  constructor(options: VisualizerAppControllerOptions = {}) {
    this.mode = options.mode || 'lite';
    this.themeManager = VisualThemeManager.getInstance({ defaultTheme: options.defaultTheme });
    this.stage3SubView = (typeof localStorage !== 'undefined' && localStorage.getItem('algo-stage3-subview') === 'tree') ? 'tree' : 'matrix';
    this.activeRightTab = (typeof localStorage !== 'undefined' && (localStorage.getItem('algo-right-tab') as any)) || 'code';
    if (this.activeRightTab !== 'code' && this.activeRightTab !== 'problem' && this.activeRightTab !== 'analysis') {
      this.activeRightTab = 'code';
    }
    this.is3DMode = typeof localStorage !== 'undefined' ? localStorage.getItem('algo-grid-perspective-3d') === 'true' : false;
    
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

    if (!requestedId) {
      requestedId = 'unique-paths';
    }

    if (!AlgorithmModelRepository.hasModel(requestedId)) {
      const errMsg = `[VisualizerAppController] 算法模型 "${requestedId}" 未在仓储中找到！禁止错误回退至其他算法。`;
      console.error(errMsg);
      if (typeof document !== 'undefined') {
        const errDiv = document.createElement('div');
        errDiv.className = 'fixed inset-0 z-[9999] bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center';
        errDiv.innerHTML = `
          <div class="max-w-md p-6 bg-slate-800 border border-rose-500/50 rounded-2xl shadow-2xl">
            <div class="text-3xl mb-3 text-rose-500"><i class="fa-solid fa-triangle-exclamation"></i> 算法加载失败</div>
            <p class="text-sm text-slate-300 mb-4 font-mono">${errMsg}</p>
            <button onclick="window.history.back()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition">返回上一页</button>
          </div>
        `;
        document.body?.appendChild(errDiv);
      }
      throw new Error(errMsg);
    }

    this.modelId = requestedId;
    this.model = AlgorithmModelRepository.getModel(this.modelId);

    const resolved = ProblemDimensionResolver.resolve(this.modelId, this.model?.defaultParams);
    this.m = resolved.m;
    this.n = resolved.n;

    // 智能恢复阶段与方向记忆 (URL Hash > LocalStorage 本题记忆 > LocalStorage 全局偏好 > 模型默认)
    this.currentStage = this.getInitialStage(this.modelId);
    this.currentDirection = this.getInitialDirection(this.modelId);
  }

  /**
   * 计算初始阶段（具备多层记忆感知能力）
   */
  private getInitialStage(modelId?: string): string {
    const model = (modelId && AlgorithmModelRepository.hasModel(modelId))
      ? AlgorithmModelRepository.getModel(modelId)
      : this.model;
    return VisualizerParamSynchronizer.resolveInitialState(model).stage;
  }

  /**
   * 计算初始演化方向（具备多层记忆感知能力）
   */
  private getInitialDirection(modelId?: string): 'forward' | 'reverse' {
    const model = (modelId && AlgorithmModelRepository.hasModel(modelId))
      ? AlgorithmModelRepository.getModel(modelId)
      : this.model;
    return VisualizerParamSynchronizer.resolveInitialState(model).dir;
  }

  /**
   * 初始化应用控制器
   */
  public init(): void {
    if (typeof document === 'undefined') return;

    // 初始化代码字号配置
    this.initCodeFontSize();

    // 0. 从 URL Hash 与模型解析归一化初始状态
    const restored = VisualizerStateRouter.restore();
    const resolved = VisualizerParamSynchronizer.resolveInitialState(this.model, restored);

    this.currentStage = resolved.stage;
    this.currentDirection = resolved.dir;
    if (resolved.variant) this.currentStageVariant = resolved.variant;
    if (resolved.theme) this.themeManager.setTheme(resolved.theme, true);
    this.m = resolved.m;
    this.n = resolved.n;
    const targetStep = resolved.step;

    // 同步参数到 DOM 控件
    VisualizerParamSynchronizer.syncControlsToDom({ m: this.m, n: this.n }, resolved.is1D);

    // 应用主题并装配顶栏主题选择器
    this.themeManager.applyThemeToDom();
    this.renderThemeSelector();
    this.themeManager.subscribe(() => {
      if (this.steps.length > 0) {
        const curStep = this.timeline ? this.timeline.getCurrentStep() : 0;
        this.syncStateToHash(curStep);
      }
    });

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
    this.update3DPerspectiveUI();

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

    const dims = VisualizerParamSynchronizer.readInputDimensions(this.m, this.n);
    this.m = dims.m;
    this.n = dims.n;

    const inputM = document.getElementById('input-m') as HTMLInputElement | null;
    const inputN = document.getElementById('input-n') as HTMLInputElement | null;
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

    const stageNum = parseInt(this.currentStage.replace('stage-', ''), 10) || 1;
    this.steps = UniversalStageEngine.generateSteps(this.model, {
      stage: stageNum,
      m: this.m,
      n: this.n,
      direction: this.currentDirection,
      isMemo: stageNum === 2,
      stageVariant: this.currentStageVariant,
      anchorMap
    });

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
    this.codeFontSize = RightPanelTabCoordinator.initCodeFontSize(this.codeFontSize);
  }

  /**
   * 动态设置代码面板字号
   */
  public setCodeFontSize(size: number): void {
    this.codeFontSize = RightPanelTabCoordinator.setCodeFontSize(size);
  }

  // ================= 内部辅助渲染方法 =================

  private updateStepCounters(index: number): void {
    StateSpacePresenter.updateStepCounters(index, this.steps.length);
  }

  private renderLiteVisuals(step: UniversalStep, index: number, isReverse: boolean): void {
    StateSpacePresenter.renderLiteVisuals({
      currentStage: this.currentStage,
      stage3SubView: this.stage3SubView,
      step,
      m: this.m,
      n: this.n,
      isReverse,
      is3DMode: this.is3DMode,
      modelId: this.modelId
    }, this.steps, index);
  }

  private renderFullVisuals(step: UniversalStep, _index: number): void {
    StateSpacePresenter.renderFullVisuals(step, this.m, this.n, this.currentStage);
  }

  private updateCodeHighlight(line?: number, highlightText?: string): void {
    const container = document.getElementById('code-container-box') || document.getElementById('code-display-container');
    RightPanelTabCoordinator.updateCodeHighlight(container, line, highlightText, 'java');
  }

  private updateHeaderMeta(stageConfig: any): void {
    const effectiveM = (this.steps && this.steps[0]?.grid && this.steps[0].grid.length > 1) ? this.steps[0].grid.length : this.m;
    const effectiveN = (this.steps && this.steps[0]?.grid && this.steps[0].grid[0]?.length > 0) ? this.steps[0].grid[0].length : this.n;

    StageNavigationCoordinator.updateHeaderMeta(
      this.model,
      stageConfig,
      this.currentStage,
      this.currentDirection,
      effectiveM,
      effectiveN
    );

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
    const effectiveM = (this.steps && this.steps[0]?.grid && this.steps[0].grid.length > 1) ? this.steps[0].grid.length : this.m;
    const isStage32D = effectiveM > 1;
    StageNavigationCoordinator.updateStage3SubViewTabs(this.currentStage, this.stage3SubView, isStage32D);
  }

  /**
   * 切换 3D 立体沙盘 / 2D 经典平面透视模式
   */
  public toggle3DPerspective(force?: boolean): void {
    this.is3DMode = force !== undefined ? force : !this.is3DMode;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('algo-grid-perspective-3d', String(this.is3DMode));
    }
    this.update3DPerspectiveUI();
  }

  /**
   * 同步 3D 立体透视容器样式与按钮状态
   */
  public update3DPerspectiveUI(): void {
    const curStep = this.timeline ? this.timeline.getCurrentStep() : 0;
    StateSpacePresenter.update3DPerspectiveUI({
      is3DMode: this.is3DMode,
      modelId: this.modelId,
      m: this.m,
      n: this.n,
      currentStep: this.steps[curStep]
    });
  }

  private updateCodePanel(stageConfig: any): void {
    const variantKeys = stageConfig.variants ? Object.keys(stageConfig.variants) : [];
    if (stageConfig.variants && variantKeys.length > 1) {
      const savedVariant = VisualizerParamSynchronizer.getPreference(`algo-variant-${this.modelId}-${this.currentStage}`, '');
      if (savedVariant && stageConfig.variants[savedVariant]) {
        this.currentStageVariant = savedVariant;
      }
      if (!stageConfig.variants[this.currentStageVariant]) {
        this.currentStageVariant = variantKeys[0];
      }
    }

    RightPanelTabCoordinator.updateCodePanel(stageConfig, {
      modelId: this.modelId,
      currentStage: this.currentStage,
      currentVariant: this.currentStageVariant,
      onSelectVariant: (varKey) => {
        this.currentStageVariant = varKey;
        VisualizerParamSynchronizer.setPreference(`algo-variant-${this.modelId}-${this.currentStage}`, varKey);
        this.loadAndReset();
        this.syncStateToHash(0);
      }
    });
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
    VisualizerParamSynchronizer.setPreference('algo-right-tab', tab);

    const stageConfig = this.currentStage ? AlgorithmModelRepository.getCompiledStage(this.model.id, this.currentStage, this.currentDirection) : null;
    const hasMultipleVariants = !!(stageConfig?.variants && Object.keys(stageConfig.variants).length > 1);

    RightPanelTabCoordinator.switchRightTab(tab, {
      modelId: this.modelId,
      currentStage: this.currentStage,
      hasMultipleVariants,
      onRenderProblem: () => this.renderProblemView(),
      onRenderAnalysis: () => this.renderAnalysisView(),
      onHighlightCode: () => {
        const curStep = this.timeline ? this.timeline.getCurrentStep() : 0;
        if (this.steps[curStep]) {
          this.updateCodeHighlight(this.steps[curStep].line, this.steps[curStep].highlightText);
        }
      }
    });
  }

  /**
   * 生成并渲染力扣题目描述内容
   */
  public renderProblemView(): void {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('problem-view-container');
    const modalBody = document.getElementById('modal-problem-body');
    if (container) {
      AnalysisKnowledgePresenter.renderProblemView(container, this.model);
    }
    if (modalBody) {
      AnalysisKnowledgePresenter.renderProblemView(modalBody, this.model);
    }
  }

  /**
   * 生成并渲染递推 5 步法与 FAQs 分析内容
   */
  public renderAnalysisView(): void {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('analysis-view-container');
    if (!container) return;
    AnalysisKnowledgePresenter.renderAnalysisView(container, this.model, {
      currentStage: this.currentStage,
      m: this.m,
      n: this.n
    });
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
    const gridContainer = document.getElementById('grid-container');
    const isReverse = this.currentDirection === 'reverse';
    StateSpacePresenter.rebuildFullLayout(gridContainer, this.m, this.n, isReverse, this.currentStage);
  }

  private renderStageTabs(): void {
    const container = document.getElementById('stage-tabs-container');
    StageNavigationCoordinator.renderStageTabs(container, {
      model: this.model,
      currentStage: this.currentStage,
      onSelectStage: (stageKey) => {
        this.currentStage = stageKey;
        VisualizerParamSynchronizer.setPreference(`algo-stage-${this.modelId}`, stageKey);
        VisualizerParamSynchronizer.setPreference('algo-preferred-stage', stageKey);
        this.renderStageTabs();
        this.loadAndReset();
        this.syncStateToHash(0);
      }
    });
  }

  private renderDirectionTabs(): void {
    const container = document.getElementById('dir-tabs-container');
    StageNavigationCoordinator.renderDirectionTabs(container, {
      model: this.model,
      currentDirection: this.currentDirection,
      onSelectDirection: (dirKey) => {
        this.currentDirection = dirKey;
        VisualizerParamSynchronizer.setPreference(`algo-dir-${this.modelId}`, dirKey);
        VisualizerParamSynchronizer.setPreference('algo-preferred-dir', dirKey);
        this.renderDirectionTabs();
        this.loadAndReset();
        this.syncStateToHash(0);
      }
    });
  }

  /**
   * 构建视图切换参数并跳转 (DRY 提取，bindEvents 和 renderThemeSelector 共用)
   */
  private handleViewSwitch(targetType: 'full' | 'lite'): void {
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
  }

  private bindEvents(): void {
    VisualizerInteractionBinder.bind({
      onPlayToggle: () => this.timeline?.toggle(),
      onStepNext: () => this.timeline?.stepForward(),
      onStepPrev: () => this.timeline?.stepBackward(),
      onReset: () => this.timeline?.reset(),
      onGenerate: () => this.loadAndReset(),
      onSeek: (step) => this.timeline?.seek(step),
      onSpeedChange: (speed) => this.timeline?.setSpeed(speed),
      onFontScale: (delta) => this.setCodeFontSize(this.codeFontSize + delta),
      onStage3SubView: (view) => this.setStage3SubView(view),
      onToggle3D: () => this.toggle3DPerspective(),
      onReset3DCam: () => StateSpacePresenter.reset3DCamera(),
      onApplyPreset: (m, n) => {
        const inputM = document.getElementById('input-m') as HTMLInputElement | null;
        const inputN = document.getElementById('input-n') as HTMLInputElement | null;
        if (inputM) inputM.value = String(m);
        if (inputN) inputN.value = String(n);
        this.loadAndReset();
      },
      onSwitchView: (mode) => this.handleViewSwitch(mode),
      onSwitchRightTab: (tab) => this.switchRightTab(tab),
      onOpenProblemModal: () => this.openProblemModal(),
      onCloseProblemModal: () => this.closeProblemModal()
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
      this.themeManager.renderThemeSelector(container, {
        currentMode: this.mode,
        onSwitchMode: (mode) => this.handleViewSwitch(mode),
        onSpeedChange: (speedMs) => {
          if (this.timeline) this.timeline.setSpeed(speedMs);
        }
      });
    }
  }
}
