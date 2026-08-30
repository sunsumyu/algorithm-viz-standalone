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

  class MockDomNode {
    public tagName: string;
    public id: string;
    public className: string = '';
    public value: string = '0';
    public max: string = '0';
    public textContent: string = '';
    public disabled: boolean = false;
    public children: MockDomNode[] = [];
    public parentNode: MockDomNode | null = null;
    public attributes: Record<string, string> = {};
    public oninput: ((e: any) => void) | null = null;
    public onchange: ((e: any) => void) | null = null;
    public onclick: ((e: any) => void) | null = null;
    private listeners: Record<string, Function[]> = {};

    constructor(tagName: string, id: string = '', textContent: string = '', className: string = '') {
      this.tagName = tagName.toUpperCase();
      this.id = id;
      this.textContent = textContent;
      this.className = className;
    }

    public appendChild(child: MockDomNode) {
      this.children.push(child);
      child.parentNode = this;
    }

    public querySelector(selector: string): MockDomNode | null {
      for (const child of this.children) {
        if (selector === `#${child.id}`) return child;
        if (selector.startsWith('#') && selector.includes(child.id)) return child;
        const found = child.querySelector(selector);
        if (found) return found;
      }
      return null;
    }

    public querySelectorAll(selector: string): MockDomNode[] {
      const res: MockDomNode[] = [];
      for (const child of this.children) {
        if (selector.includes(child.id)) res.push(child);
        res.push(...child.querySelectorAll(selector));
      }
      return res;
    }

    public click() {
      if (this.onclick) this.onclick({ target: this });
    }

    public dispatchEvent(event: { type: string }) {
      if (event.type === 'input' && this.oninput) {
        this.oninput({ target: this });
      }
      if (event.type === 'change' && this.onchange) {
        this.onchange({ target: this });
      }
    }
  }

  it('应该自动识别并绑定现代 4-Card 控制器（按钮、进度条、计数器与暗色终端）', async () => {

    const root = new MockDomNode('div', 'algo-view');
    const btnGen = new MockDomNode('button', 'btn-generate', '运行');
    const btnReset = new MockDomNode('button', 'btn-reset', '重置');
    const btnPrev = new MockDomNode('button', 'btn-step-prev', '上一步');
    const btnPlay = new MockDomNode('button', 'btn-play-pause', '▶ 播放');
    const btnNext = new MockDomNode('button', 'btn-step-next', '下一步');
    const slider = new MockDomNode('input', 'slider-progress');
    const speedSelect = new MockDomNode('select', 'select-speed');
    const counter = new MockDomNode('span', 'metric-step', '0 / 0');
    const liveText = new MockDomNode('span', 'step-live-text', '等待就绪');

    root.appendChild(btnGen);
    root.appendChild(btnReset);
    root.appendChild(btnPrev);
    root.appendChild(btnPlay);
    root.appendChild(btnNext);
    root.appendChild(slider);
    root.appendChild(speedSelect);
    root.appendChild(counter);
    root.appendChild(liveText);

    const highlightedLines: any[] = [];
    const mockTerminal = {
      highlightLine: (line: any) => highlightedLines.push(line),
      switchLanguage: () => {},
      switchTab: () => {},
      getCurrentLanguage: () => 'java',
      getFontSize: () => 12,
      destroy: vi.fn(),
    };

    const viz = new TestStepVisualizer();
    viz.setTerminal(mockTerminal as any);
    await viz.init({ root: root as unknown as HTMLElement, algorithmId: 'test-algo', viewId: 'algo-test-view' });

    // 验证初始状态同步
    expect(slider.max).toBe('2');
    expect(slider.value).toBe('0');
    expect(counter.textContent).toBe('1 / 3');
    expect(liveText.textContent).toBe('Step 1');
    expect(highlightedLines).toContain(1);

    // 模拟点击下一步
    btnNext.click();
    expect(slider.value).toBe('1');
    expect(counter.textContent).toBe('2 / 3');
    expect(liveText.textContent).toBe('Step 2');
    expect(highlightedLines).toContain(2);

    // 模拟拖动进度条跳转
    slider.value = '2';
    slider.dispatchEvent({ type: 'input' });
    expect(viz.getCurrentIndex()).toBe(2);
    expect(counter.textContent).toBe('3 / 3');
    expect(btnPlay.textContent).toContain('重播');

    // 模拟切换速度
    speedSelect.value = '300';
    speedSelect.dispatchEvent({ type: 'change' });
    expect(viz.getPlaybackSpeed()).toBe(300);

    // 验证 destroy 释放
    viz.destroy();
    expect(mockTerminal.destroy).toHaveBeenCalled();
  });

  it('圆形或纯图标播放按钮在播放与完成时应保持纯图标符号而不被注入文字', async () => {
    const root = new MockDomNode('div', 'algo-view-circle');
    const btnPlayCircle = new MockDomNode('button', 'btn-play-pause', '', 'rs-play-circle-btn');
    const playIconSpan = new MockDomNode('span', 'play-icon', '▶');
    btnPlayCircle.appendChild(playIconSpan);
    const btnPrev = new MockDomNode('button', 'btn-step-prev', '◀');
    const btnNext = new MockDomNode('button', 'btn-step-next', '▶');

    root.appendChild(btnPrev);
    root.appendChild(btnPlayCircle);
    root.appendChild(btnNext);

    const viz = new TestStepVisualizer();
    await viz.init({ root: root as unknown as HTMLElement, algorithmId: 'test-circle-algo', viewId: 'algo-circle-view' });

    // 初始状态：iconSpan 保持纯图标
    expect(playIconSpan.textContent).toBe('▶');

    // 下一步至末尾
    btnNext.click();
    btnNext.click();
    expect(viz.getCurrentIndex()).toBe(2);
    // 完成状态：iconSpan 为重播符号，且没有任何冗余文字
    expect(playIconSpan.textContent).toBe('↺');
    expect(btnPlayCircle.textContent).not.toContain('播放');
    expect(btnPlayCircle.textContent).not.toContain('重播');

    viz.destroy();
  });
});
