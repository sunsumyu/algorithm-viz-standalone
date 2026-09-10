import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StageViewPresenter } from './stage-view-presenter';
import { GridVisualAdapter } from './grid-visual-adapter';

// Lightweight Mock DOM
class MockElement {
  public innerHTML = '';
  public scrollTop = 0;
  public scrollHeight = 200;
  public children: any[] = [];
  public textContent = '';
  public className = '';
  public parentElement: any = null;

  constructor(public tagName = 'div') {}

  public appendChild(child: any) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }
}

(globalThis as any).document = {
  createElement: (tag: string) => new MockElement(tag)
};

describe('StageViewPresenter Strategy Pattern Deep Module Guard', () => {
  let mockContainer: any;

  beforeEach(() => {
    mockContainer = new MockElement();
  });

  it('should route to renderLiteMemoSlots when stage is stage-4', () => {
    const spy = vi.spyOn(GridVisualAdapter, 'renderLiteMemoSlots').mockImplementation(() => {});
    const step: any = { type: 'update', memo: [0, 1, 2] };

    StageViewPresenter.presentStageCard2(mockContainer, {
      currentStage: 'stage-4',
      stage3SubView: 'matrix',
      step,
      m: 3,
      n: 4,
      isReverse: false
    });

    expect(spy).toHaveBeenCalledWith(mockContainer, step, 4);
    spy.mockRestore();
  });

  it('should route to renderStage3DPTable when stage is stage-3 and subview is matrix', () => {
    const spy = vi.spyOn(GridVisualAdapter, 'renderStage3DPTable').mockImplementation(() => {});
    const step: any = { type: 'update' };

    StageViewPresenter.presentStageCard2(mockContainer, {
      currentStage: 'stage-3',
      stage3SubView: 'matrix',
      step,
      m: 3,
      n: 4,
      isReverse: false
    });

    expect(spy).toHaveBeenCalledWith(mockContainer, step, { m: 3, n: 4, isReverse: false });
    spy.mockRestore();
  });

  it('should render step log stream up to currentIndex correctly', () => {
    const steps: any[] = [
      { log: 'Step 0 initialized' },
      { log: 'Step 1 calculating dp[0][0]' },
      { log: 'Step 2 calculating dp[0][1]' }
    ];
    const logCountEl: any = new MockElement();

    StageViewPresenter.renderStepLogStream(mockContainer, steps, 1, logCountEl);

    expect(mockContainer.children.length).toBe(2);
    expect(logCountEl.textContent).toBe('2 / 3 记录');
  });
});
