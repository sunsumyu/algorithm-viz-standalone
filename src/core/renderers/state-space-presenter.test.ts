import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateSpacePresenter } from './state-space-presenter';
import { GridVisualAdapter, RecursionTreeAdapter } from './grid-visual-adapter';
import type { UniversalStep } from '../universal-stage-engine';

class MockElement {
  public innerHTML = '';
  public scrollTop = 0;
  public scrollHeight = 200;
  public children: any[] = [];
  public textContent = '';
  public className = '';
  public parentElement: any = null;
  public style: Record<string, string> = {};
  public classList = {
    _set: new Set<string>(),
    add(cls: string) { this._set.add(cls); },
    remove(cls: string) { this._set.delete(cls); },
    contains(cls: string) { return this._set.has(cls); }
  };

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

describe('StateSpacePresenter (Deep Module Unit Tests)', () => {
  let card1El: any;
  let card2El: any;

  beforeEach(() => {
    card1El = new MockElement();
    card2El = new MockElement();
  });

  it('1. 成功统合渲染 Card 1 二维网格沙盘', () => {
    const spy = vi.spyOn(GridVisualAdapter, 'renderGrid').mockImplementation(() => {});
    const step: UniversalStep = {
      type: 'update',
      i: 1,
      j: 1,
      grid: [
        [1, 1],
        [1, 2]
      ]
    };

    StateSpacePresenter.renderCard1(card1El, {
      currentStage: 'stage-3',
      step,
      m: 2,
      n: 2,
      modelId: 'unique-paths'
    });

    expect(spy).toHaveBeenCalledWith(card1El, step, expect.objectContaining({
      m: 2,
      n: 2,
      modelId: 'unique-paths'
    }));
    spy.mockRestore();
  });

  it('2. 成功统合渲染 Card 2 阶段 3 二维 DP 状态表', () => {
    const spy = vi.spyOn(GridVisualAdapter, 'renderStage3DPTable').mockImplementation(() => {});
    const step: UniversalStep = {
      type: 'update',
      i: 1,
      j: 1,
      grid: [
        [1, 1],
        [1, 2]
      ]
    };

    StateSpacePresenter.renderCard2(card2El, {
      currentStage: 'stage-3',
      step,
      m: 2,
      n: 2,
      modelId: 'unique-paths'
    });

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('3. 成功统合渲染 Card 2 阶段 4 一维滚动数组槽位', () => {
    const spy = vi.spyOn(GridVisualAdapter, 'renderLiteMemoSlots').mockImplementation(() => {});
    const step: UniversalStep = {
      type: 'update-1d',
      i: 0,
      j: 1,
      dp1d: [1, 2, 0],
      activeSlot: 1
    };

    StateSpacePresenter.renderCard2(card2El, {
      currentStage: 'stage-4',
      step,
      m: 1,
      n: 3,
      modelId: 'climb-stairs'
    });

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('4. 成功渲染执行日志流', () => {
    const logEl = new MockElement();
    const steps: UniversalStep[] = [
      { type: 'init', i: 0, j: 0, log: '步骤 1: 初始化' },
      { type: 'update', i: 1, j: 1, log: '步骤 2: 状态转移' }
    ];

    StateSpacePresenter.renderStepLogStream(logEl as any, steps, 1);
    expect(logEl.children.length).toBe(1);
    expect(logEl.children[0].children.length).toBe(2);
  });

  it('5. 日志流对空步骤数组安全返回', () => {
    const logEl = new MockElement();
    StateSpacePresenter.renderStepLogStream(logEl as any, [], 0);
    expect(logEl.children.length).toBe(0);
  });

  it('6. 日志流对 null 容器安全返回', () => {
    expect(() => StateSpacePresenter.renderStepLogStream(null, [], 0)).not.toThrow();
  });

  it('7. updateStepCounters 更新 Lite 和 Full 模式计数器', () => {
    const stepCur = new MockElement();
    const stepTotal = new MockElement();
    const slider = Object.assign(new MockElement(), { max: '', value: '' });
    const fullCur = new MockElement();
    const fullTotal = new MockElement();

    (globalThis as any).document = {
      ...((globalThis as any).document),
      getElementById: (id: string) => {
        const map: Record<string, any> = {
          'step-cur': stepCur,
          'step-total': stepTotal,
          'slider-progress': slider,
          'current-step-num': fullCur,
          'total-steps-num': fullTotal
        };
        return map[id] || null;
      }
    };

    StateSpacePresenter.updateStepCounters(7, 25);

    expect(stepCur.textContent).toBe('8');
    expect(stepTotal.textContent).toBe('25');
    expect(slider.max).toBe('24');
    expect(slider.value).toBe('7');
    expect(fullCur.textContent).toBe('8');
    expect(fullTotal.textContent).toBe('25');
  });

  it('8. renderLiteVisuals 编排调用 renderCard1 + renderCard2 + renderStepLogStream', () => {
    const card1Wrapper = Object.assign(new MockElement(), { style: { display: 'none' } });
    const gridContainer = new MockElement();
    const memoContainer = new MockElement();
    const logContainer = new MockElement();
    const logCount = new MockElement();
    const legendRef = new MockElement();
    const btnToggle3d = Object.assign(new MockElement(), { style: { display: 'none' } });

    (globalThis as any).document = {
      createElement: (tag: string) => new MockElement(tag),
      getElementById: (id: string) => {
        const map: Record<string, any> = {
          'card1-wrapper': card1Wrapper,
          'btn-toggle-3d': btnToggle3d,
          'legend-ref': legendRef,
          'grid-container': gridContainer,
          'memo-array-container': memoContainer,
          'log-container': logContainer,
          'log-count': logCount
        };
        return map[id] || null;
      }
    };

    const spy1 = vi.spyOn(StateSpacePresenter, 'renderCard1').mockImplementation(() => {});
    const spy2 = vi.spyOn(StateSpacePresenter, 'renderCard2').mockImplementation(() => {});
    const spyLog = vi.spyOn(StateSpacePresenter, 'renderStepLogStream').mockImplementation(() => {});

    const step = { type: 'init', grid: [[1]] } as unknown as UniversalStep;

    StateSpacePresenter.renderLiteVisuals(
      { currentStage: 'stage-1', step, m: 3, n: 4, isReverse: false, is3DMode: false, modelId: 'unique-paths' },
      [step],
      0
    );

    expect(spy1).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(1);
    expect(spyLog).toHaveBeenCalledTimes(1);
    expect(legendRef.innerHTML).toBe('🐱 参考上方/左方');

    spy1.mockRestore();
    spy2.mockRestore();
    spyLog.mockRestore();
  });

  it('9. renderLiteVisuals 在 reverse 方向时更新图例文字', () => {
    const legendRef = new MockElement();

    (globalThis as any).document = {
      createElement: (tag: string) => new MockElement(tag),
      getElementById: (id: string) => id === 'legend-ref' ? legendRef : null
    };

    vi.spyOn(StateSpacePresenter, 'renderCard1').mockImplementation(() => {});
    vi.spyOn(StateSpacePresenter, 'renderCard2').mockImplementation(() => {});
    vi.spyOn(StateSpacePresenter, 'renderStepLogStream').mockImplementation(() => {});

    const step = { type: 'init' } as unknown as UniversalStep;
    StateSpacePresenter.renderLiteVisuals(
      { currentStage: 'stage-1', step, m: 3, n: 4, isReverse: true, is3DMode: false, modelId: 'min-path-sum' },
      [step],
      0
    );

    expect(legendRef.innerHTML).toBe('🐱 参考下方/右方');
    vi.restoreAllMocks();
  });

  it('10. update3DPerspectiveUI 在 3D 模式下正确设置按钮样式', () => {
    const btnToggle = new MockElement();
    const labelToggle = new MockElement();
    const boardWrapper = new MockElement();

    (globalThis as any).document = {
      ...((globalThis as any).document),
      getElementById: (id: string) => {
        const map: Record<string, any> = {
          'btn-toggle-3d': btnToggle,
          'label-toggle-3d': labelToggle,
          'grid-board-wrapper': boardWrapper
        };
        return map[id] || null;
      }
    };

    StateSpacePresenter.update3DPerspectiveUI({
      is3DMode: true,
      modelId: 'unique-paths',
      m: 3,
      n: 4
    });

    expect(btnToggle.className).toContain('bg-indigo-600');
    expect(labelToggle.textContent).toBe('3D立体');
    expect(boardWrapper.classList.contains('hidden')).toBe(true);
  });

  it('11. update3DPerspectiveUI 在 2D 模式下正确设置按钮样式', () => {
    const btnToggle = new MockElement();
    const labelToggle = new MockElement();
    const boardWrapper = new MockElement();
    boardWrapper.classList.add('hidden');

    (globalThis as any).document = {
      ...((globalThis as any).document),
      getElementById: (id: string) => {
        const map: Record<string, any> = {
          'btn-toggle-3d': btnToggle,
          'label-toggle-3d': labelToggle,
          'grid-board-wrapper': boardWrapper
        };
        return map[id] || null;
      }
    };

    StateSpacePresenter.update3DPerspectiveUI({
      is3DMode: false,
      modelId: 'unique-paths',
      m: 3,
      n: 4
    });

    expect(btnToggle.className).toContain('bg-slate-100');
    expect(labelToggle.textContent).toBe('2D平面');
    expect(boardWrapper.classList.contains('hidden')).toBe(false);
  });
});
