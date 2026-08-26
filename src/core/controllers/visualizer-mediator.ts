import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { PlaybackTimelineController } from '../playback-timeline-controller';
import type { IVisualRenderer } from '../renderers/visual-renderer';

export interface VisualizerState {
  model: IYamlAlgorithmModel | null;
  stage: number;
  direction: 'forward' | 'reverse';
  stageVariant?: string;
  is3D: boolean;
  steps: UniversalStep[];
  currentStepIndex: number;
}

/**
 * 视图与时间轴中介者 (VisualizerMediator)
 * 遵循中介者模式 (Mediator Pattern)，解耦时间轴、视图渲染器与状态派发
 */
export class VisualizerMediator {
  private timeline: PlaybackTimelineController;
  private renderers: Map<string, IVisualRenderer> = new Map();
  private state: VisualizerState;
  private stateChangeListeners: ((state: VisualizerState) => void)[] = [];

  constructor() {
    this.state = {
      model: null,
      stage: 1,
      direction: 'forward',
      is3D: false,
      steps: [],
      currentStepIndex: 0
    };

    this.timeline = new PlaybackTimelineController({
      getTotalSteps: () => this.state.steps.length,
      onStep: (step: number) => {
        this.state.currentStepIndex = step;
        this.notifyRenderers();
        this.notifyStateChange();
      }
    });
  }

  public getTimeline(): PlaybackTimelineController {
    return this.timeline;
  }

  public getState(): Readonly<VisualizerState> {
    return this.state;
  }

  public setModel(model: IYamlAlgorithmModel | null): void {
    this.state.model = model;
    this.notifyStateChange();
  }

  public setStage(stage: number): void {
    this.state.stage = stage;
    this.notifyStateChange();
  }

  public setDirection(dir: 'forward' | 'reverse'): void {
    this.state.direction = dir;
    this.notifyStateChange();
  }

  public setIs3D(is3D: boolean): void {
    this.state.is3D = is3D;
    this.notifyStateChange();
  }

  public registerRenderer(renderer: IVisualRenderer): void {
    this.renderers.set(renderer.id, renderer);
  }

  public unregisterRenderer(id: string): void {
    this.renderers.delete(id);
  }

  public setSteps(steps: UniversalStep[]): void {
    this.state.steps = steps;
    this.timeline.reset();
  }

  public onStateChange(listener: (state: VisualizerState) => void): () => void {
    this.stateChangeListeners.push(listener);
    return () => {
      this.stateChangeListeners = this.stateChangeListeners.filter(l => l !== listener);
    };
  }

  private notifyRenderers(): void {
    const curStep = this.state.steps[this.state.currentStepIndex];
    if (!curStep) return;
    for (const renderer of this.renderers.values()) {
      renderer.updateStep(curStep, {
        stage: this.state.stage,
        direction: this.state.direction,
        is3D: this.state.is3D,
        modelId: this.state.model?.id
      });
    }
  }

  private notifyStateChange(): void {
    for (const listener of this.stateChangeListeners) {
      listener(this.state);
    }
  }

  public dispose(): void {
    this.timeline.destroy();
    for (const renderer of this.renderers.values()) {
      renderer.dispose();
    }
    this.renderers.clear();
    this.stateChangeListeners = [];
  }
}
