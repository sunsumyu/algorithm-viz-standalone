import type { IYamlAlgorithmModel } from '../interfaces';
import { AlgorithmModelRepository } from '../model-repository';
import { UniversalStageEngine, type UniversalStep } from '../universal-stage-engine';
import { PlaybackTimelineController } from '../playback-timeline-controller';
import type { IVisualRenderer, VisualRendererContext } from '../renderers/visual-renderer';
import { eventHub } from './visualizer-event-hub';

export interface VisualizerState {
  model: IYamlAlgorithmModel | null;
  modelId: string;
  stage: string;
  stageNum: number;
  direction: 'forward' | 'reverse';
  stageVariant: string;
  m: number;
  n: number;
  is3D: boolean;
  steps: UniversalStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;
}

export interface VisualizerMediatorOptions {
  modelId?: string;
  stage?: string | number;
  direction?: 'forward' | 'reverse';
  stageVariant?: string;
  m?: number;
  n?: number;
  is3D?: boolean;
}

/**
 * 视图与时间轴协调中枢深模块 (VisualizerMediator Deep Module)
 * 遵循中介者模式 (Mediator Pattern) 与状态机模式 (State Pattern)：
 * 封装模型加载、参数提取、阶段/变体演化推导、播放状态机与多模态渲染派发
 */
export class VisualizerMediator {
  private timeline: PlaybackTimelineController;
  private renderers: Map<string, IVisualRenderer> = new Map();
  private state: VisualizerState;
  private stateChangeListeners: ((state: VisualizerState) => void)[] = [];
  private isDisposed = false;

  constructor(options: VisualizerMediatorOptions = {}) {
    const defaultModelId = options.modelId || 'unique-paths';
    if (!AlgorithmModelRepository.hasModel(defaultModelId)) {
      throw new Error(`[VisualizerMediator] 未在仓储中找到模型: "${defaultModelId}"`);
    }
    const model = AlgorithmModelRepository.getModel(defaultModelId);

    const initialDims = this.extractDimensions(model, options.m, options.n);
    const initialStage = this.normalizeStage(options.stage || model?.defaultStage || 'stage-1');

    this.state = {
      model,
      modelId: defaultModelId,
      stage: initialStage.str,
      stageNum: initialStage.num,
      direction: options.direction || 'forward',
      stageVariant: options.stageVariant || 'if',
      m: initialDims.m,
      n: initialDims.n,
      is3D: Boolean(options.is3D),
      steps: [],
      currentStepIndex: 0,
      isPlaying: false,
      speed: 1
    };

    this.timeline = new PlaybackTimelineController({
      getTotalSteps: () => this.state.steps.length,
      onStep: (step: number) => {
        this.state.currentStepIndex = step;
        this.state.isPlaying = this.timeline.getIsPlaying();
        this.state.speed = this.timeline.getSpeed();
        this.notifyRenderers();
        this.notifyStateChange();
      },
      onStateChange: (isPlaying: boolean) => {
        this.state.isPlaying = isPlaying;
        this.notifyStateChange();
      }
    });

    if (model) {
      this.recalculateSteps();
    }
  }

  public getTimeline(): PlaybackTimelineController {
    return this.timeline;
  }

  public getState(): Readonly<VisualizerState> {
    return this.state;
  }

  public getCurrentStep(): UniversalStep | undefined {
    return this.state.steps[this.state.currentStepIndex];
  }

  /**
   * 加载并切换指定算法模型
   */
  public loadModel(modelId: string, m?: number, n?: number): void {
    if (this.isDisposed) return;
    if (!AlgorithmModelRepository.hasModel(modelId)) {
      console.warn(`[VisualizerMediator] 未知算法模型 ID: ${modelId}`);
      return;
    }

    const model = AlgorithmModelRepository.getModel(modelId);
    this.state.model = model;
    this.state.modelId = modelId;

    const dims = this.extractDimensions(model, m, n);
    this.state.m = dims.m;
    this.state.n = dims.n;

    const stageNormalized = this.normalizeStage(model.defaultStage || 'stage-1');
    this.state.stage = stageNormalized.str;
    this.state.stageNum = stageNormalized.num;

    this.recalculateSteps();
    this.notifyStateChange();

    eventHub.emit('algorithm:switch', {
      algorithmId: modelId,
      model
    });
  }

  public setModel(model: IYamlAlgorithmModel | null): void {
    if (this.isDisposed) return;
    this.state.model = model;
    if (model) {
      this.state.modelId = model.id;
      const dims = this.extractDimensions(model);
      this.state.m = dims.m;
      this.state.n = dims.n;
      this.recalculateSteps();
      eventHub.emit('algorithm:switch', {
        algorithmId: model.id,
        model
      });
    }
    this.notifyStateChange();
  }

  /**
   * 切换算法演化阶段 (1..4)
   */
  public setStage(stage: number | string, variant?: string): void {
    if (this.isDisposed) return;
    const stageNormalized = this.normalizeStage(stage);
    this.state.stage = stageNormalized.str;
    this.state.stageNum = stageNormalized.num;
    if (variant !== undefined) {
      this.state.stageVariant = variant;
    }
    this.recalculateSteps();
    this.notifyStateChange();

    eventHub.emit('stage:change', {
      stage: this.state.stageNum,
      isMemo: this.state.stageVariant === 'memo' || this.state.stageNum === 2,
      direction: this.state.direction
    });
  }

  /**
   * 切换顺推 / 逆推演化方向
   */
  public setDirection(dir: 'forward' | 'reverse'): void {
    if (this.isDisposed) return;
    if (this.state.direction === dir) return;
    this.state.direction = dir;
    this.recalculateSteps();
    this.notifyStateChange();

    eventHub.emit('stage:change', {
      stage: this.state.stageNum,
      isMemo: this.state.stageVariant === 'memo' || this.state.stageNum === 2,
      direction: this.state.direction
    });
  }

  /**
   * 切换阶段代码实现变体 (例如 'if' | 'for' | 'terminal')
   */
  public setStageVariant(variant: string): void {
    if (this.isDisposed) return;
    if (this.state.stageVariant === variant) return;
    this.state.stageVariant = variant;
    this.recalculateSteps();
    this.notifyStateChange();
  }

  /**
   * 调整算法维度/数据规模参数 (如 m, n)
   */
  public setDimensions(m: number, n: number): void {
    if (this.isDisposed) return;
    this.state.m = Math.max(1, m);
    this.state.n = Math.max(1, n);
    this.recalculateSteps();
    this.notifyStateChange();
  }

  /**
   * 切换 2D DOM / 3D WebGL 渲染视角
   */
  public setIs3D(is3D: boolean): void {
    if (this.isDisposed) return;
    this.state.is3D = is3D;
    this.notifyRenderers();
    this.notifyStateChange();

    eventHub.emit('view-mode:change', {
      mode: is3D ? '3d' : '2d'
    });
  }

  /**
   * 注册视觉表现适配器 (IVisualRenderer Bridge)
   */
  public registerRenderer(renderer: IVisualRenderer): void {
    if (this.isDisposed) return;
    this.renderers.set(renderer.id, renderer);
    const curStep = this.getCurrentStep();
    if (curStep) {
      renderer.updateStep(curStep, this.buildRendererContext());
    }
  }

  /**
   * 注销视觉表现适配器
   */
  public unregisterRenderer(id: string): void {
    this.renderers.delete(id);
  }

  /**
   * 直接设置预先计算好的执行步骤
   */
  public setSteps(steps: UniversalStep[]): void {
    if (this.isDisposed) return;
    this.state.steps = steps;
    this.timeline.reset();
    this.state.currentStepIndex = 0;
    this.state.isPlaying = false;
    this.notifyRenderers();
    this.notifyStateChange();
  }

  // =========================================================================
  // 播放控制与步进调度
  // =========================================================================
  public nextStep(): void {
    if (this.isDisposed) return;
    this.timeline.stepForward();
  }

  public prevStep(): void {
    if (this.isDisposed) return;
    this.timeline.stepBackward();
  }

  public seekStep(index: number): void {
    if (this.isDisposed) return;
    this.timeline.seek(index);
  }

  public play(): void {
    if (this.isDisposed) return;
    this.timeline.play();
  }

  public pause(): void {
    if (this.isDisposed) return;
    this.timeline.pause();
  }

  public togglePlay(): void {
    if (this.isDisposed) return;
    this.timeline.toggle();
  }

  public setSpeed(speed: number): void {
    if (this.isDisposed) return;
    this.timeline.setSpeed(speed);
    this.state.speed = speed;
    this.notifyStateChange();
  }

  public reset(): void {
    if (this.isDisposed) return;
    this.timeline.reset();
  }

  public onStateChange(listener: (state: VisualizerState) => void): () => void {
    this.stateChangeListeners.push(listener);
    return () => {
      this.stateChangeListeners = this.stateChangeListeners.filter(l => l !== listener);
    };
  }

  /**
   * 自动重新推导演算步骤序列 (Automated Derivation Pipeline)
   */
  public recalculateSteps(): void {
    if (!this.state.model) {
      this.state.steps = [];
      this.timeline.reset();
      return;
    }

    const model = this.state.model;
    const stageNum = this.state.stageNum;
    const dir = this.state.direction;
    const variant = this.state.stageVariant;
    const m = this.state.m;
    const n = this.state.n;

    const stageConfig = AlgorithmModelRepository.getCompiledStage(model.id, this.state.stage, dir);
    const anchorMap = stageConfig?.variants?.[variant]?.anchorMap || stageConfig?.anchorMap;

    let computedSteps: UniversalStep[] = [];
    switch (stageNum) {
      case 1:
        computedSteps = UniversalStageEngine.generateStage1or2Steps(model, m, n, dir, false, anchorMap, variant);
        break;
      case 2:
        computedSteps = UniversalStageEngine.generateStage1or2Steps(model, m, n, dir, true, anchorMap, variant);
        break;
      case 3:
        computedSteps = UniversalStageEngine.generateStage3Steps(model, m, n, dir, anchorMap);
        break;
      case 4:
        computedSteps = UniversalStageEngine.generateStage4Steps(model, m, n, dir, (variant === 'for' ? 'for' : 'if'), anchorMap);
        break;
      default:
        computedSteps = [];
    }

    this.state.steps = computedSteps;
    this.timeline.reset();
    this.state.currentStepIndex = 0;
    this.state.isPlaying = false;
    this.notifyRenderers();
  }

  private extractDimensions(model: IYamlAlgorithmModel | null, fallbackM?: number, fallbackN?: number): { m: number; n: number } {
    let m = fallbackM ?? 3;
    let n = fallbackN ?? 3;

    if (model?.defaultParams) {
      if (model.defaultParams.m !== undefined) {
        m = Number(model.defaultParams.m);
      } else if (model.defaultParams.word1 !== undefined) {
        m = String(model.defaultParams.word1).length + 1;
      } else if (model.defaultParams.s !== undefined) {
        m = model.defaultParams.t !== undefined
          ? String(model.defaultParams.s).length + 1
          : String(model.defaultParams.s).length;
      } else if (model.defaultParams.nums !== undefined) {
        const nums = Array.isArray(model.defaultParams.nums)
          ? model.defaultParams.nums
          : String(model.defaultParams.nums).split(',').map(Number);
        m = nums.length;
      }

      if (model.defaultParams.n !== undefined) {
        n = Number(model.defaultParams.n);
      } else if (model.defaultParams.word2 !== undefined) {
        n = String(model.defaultParams.word2).length + 1;
      } else if (model.defaultParams.t !== undefined) {
        n = String(model.defaultParams.t).length + 1;
      } else if (model.defaultParams.s !== undefined) {
        n = String(model.defaultParams.s).length;
      } else if (model.defaultParams.nums !== undefined) {
        const nums = Array.isArray(model.defaultParams.nums)
          ? model.defaultParams.nums
          : String(model.defaultParams.nums).split(',').map(Number);
        const sum = nums.reduce((a: number, b: number) => a + b, 0);
        n = Math.floor(sum / 2) + 1;
      }
    }

    return { m: Math.max(1, m), n: Math.max(1, n) };
  }

  private normalizeStage(stage: string | number): { str: string; num: number } {
    if (typeof stage === 'number') {
      const clamped = Math.max(1, Math.min(4, stage));
      return { str: `stage-${clamped}`, num: clamped };
    }
    const num = parseInt(stage.replace('stage-', ''), 10);
    const validNum = isNaN(num) ? 1 : Math.max(1, Math.min(4, num));
    return { str: `stage-${validNum}`, num: validNum };
  }

  private buildRendererContext(): VisualRendererContext {
    return {
      m: this.state.m,
      n: this.state.n,
      stage: this.state.stageNum,
      direction: this.state.direction,
      is3D: this.state.is3D,
      modelId: this.state.modelId
    };
  }

  private notifyRenderers(): void {
    const curStep = this.getCurrentStep();
    if (!curStep) return;
    const context = this.buildRendererContext();
    for (const renderer of this.renderers.values()) {
      renderer.updateStep(curStep, context);
    }
  }

  private notifyStateChange(): void {
    for (const listener of this.stateChangeListeners) {
      listener(this.state);
    }
  }

  /**
   * 刷新当前帧渲染（例如主题切换或视口尺寸重算时）
   */
  public refreshRender(): void {
    if (this.isDisposed) return;
    this.notifyRenderers();
  }

  public dispose(): void {
    this.isDisposed = true;
    this.timeline.destroy();
    for (const renderer of this.renderers.values()) {
      renderer.dispose();
    }
    this.renderers.clear();
    this.stateChangeListeners = [];
  }
}
