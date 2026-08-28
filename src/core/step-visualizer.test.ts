import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { StepVisualizer, type StepBase } from './step-visualizer';

interface DummyStep extends StepBase {
  val: number;
}

class TestStepVisualizer extends StepVisualizer<DummyStep> {
  protected codeLines = ['int a = 1;', 'int b = 2;', 'return a + b;'];
  public renderedSteps: DummyStep[] = [];

  protected initDOMElements(): void {}

  protected buildSteps(): DummyStep[] {
    return [
      { val: 10, message: 'Step 1', codeLine: 1, log: 'init a' },
      { val: 20, message: 'Step 2', codeLine: 2, log: 'init b' },
      { val: 30, message: 'Step 3', codeLine: 3, log: 'return result' }
    ];
  }

  protected renderStep(step: DummyStep): void {
    this.renderedSteps.push(step);
  }

  public getStepsCount(): number {
    return this.steps.length;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getPlaybackSpeed(): number {
    return this.playbackSpeed;
  }

  public async runStart(): Promise<void> {
    await this.start();
  }

  public next(): void {
    this.nextStep();
  }

  public prev(): void {
    this.prevStep();
  }

  public startPlay(): void {
    this.play();
  }
}

describe('StepVisualizer Deep Module Guard', () => {
  let visualizer: TestStepVisualizer;

  beforeEach(() => {
    vi.useFakeTimers();
    visualizer = new TestStepVisualizer();
  });

  afterEach(() => {
    visualizer.destroy();
    vi.useRealTimers();
  });

  it('应该在 start() 后正确生成初始步骤并渲染第 0 步', async () => {
    await visualizer.runStart();
    expect(visualizer.getStepsCount()).toBe(3);
    expect(visualizer.getCurrentIndex()).toBe(0);
    expect(visualizer.renderedSteps.length).toBe(1);
    expect(visualizer.renderedSteps[0].val).toBe(10);
  });

  it('应该正确支持 nextStep 和 prevStep 单步调试', async () => {
    await visualizer.runStart();
    visualizer.next();
    expect(visualizer.getCurrentIndex()).toBe(1);
    expect(visualizer.renderedSteps[visualizer.renderedSteps.length - 1].val).toBe(20);

    visualizer.next();
    expect(visualizer.getCurrentIndex()).toBe(2);

    // 边界保护：到达末尾不再递增
    visualizer.next();
    expect(visualizer.getCurrentIndex()).toBe(2);

    // 回退
    visualizer.prev();
    expect(visualizer.getCurrentIndex()).toBe(1);
  });

  it('应该正确支持 play/pause 自动播放状态机与定时步进', async () => {
    await visualizer.runStart();
    visualizer.startPlay();
    expect(visualizer.getIsPlaying()).toBe(true);

    // 前进 1 步 (默认速度 900ms)
    vi.advanceTimersByTime(900);
    expect(visualizer.getCurrentIndex()).toBe(1);

    // 前进到终点
    vi.advanceTimersByTime(900);
    expect(visualizer.getCurrentIndex()).toBe(2);

    // 到达终点后自动暂停
    vi.advanceTimersByTime(900);
    expect(visualizer.getIsPlaying()).toBe(false);
  });

  it('调用 destroy() 时应安全清理定时器与状态', async () => {
    await visualizer.runStart();
    visualizer.startPlay();
    expect(visualizer.getIsPlaying()).toBe(true);

    visualizer.destroy();
    expect(visualizer.getIsPlaying()).toBe(false);
  });
});
