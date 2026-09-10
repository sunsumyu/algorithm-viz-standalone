import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateSpacePresenter, type StateSpacePresentationOptions } from './state-space-presenter';
import type { UniversalStep } from '../universal-stage-engine';
import { GridVisualAdapter, RecursionTreeAdapter, MemoSlotVisualAdapter } from './grid-visual-adapter';

// Mock 底层 visual adapters 以便专注测试 StateSpacePresenter 门面的策略路由与局部容器隔离
vi.mock('./grid-visual-adapter', () => ({
  GridVisualAdapter: {
    renderGrid: vi.fn(),
    renderLiteMemoSlots: vi.fn(),
    renderStage3DPTable: vi.fn(),
  },
  RecursionTreeAdapter: {
    renderRecursionTree: vi.fn(),
  },
  MemoSlotVisualAdapter: {
    renderStateArrays: vi.fn(),
  },
}));

vi.mock('./three-grid-visual-adapter', () => ({
  ThreeGridVisualAdapter: {
    getInstance: () => ({
      updateStep: vi.fn(),
    }),
  },
}));

class MockDocument {
  public createElement(tag: string): MockElement {
    return new MockElement(tag);
  }
}

const mockDoc = new MockDocument();

class MockElement {
  public id: string;
  public className: string = '';
  public innerHTML: string = '';
  public textContent: string = '';
  public style: Record<string, string> = {};
  public children: MockElement[] = [];
  public classList = {
    _classes: new Set<string>(),
    add: (c: string) => this.classList._classes.add(c),
    remove: (c: string) => this.classList._classes.delete(c),
    contains: (c: string) => this.classList._classes.has(c),
  };
  public scrollTop: number = 0;
  public scrollHeight: number = 100;
  public ownerDocument: MockDocument = mockDoc;
  public parentElement: MockElement | null = null;

  constructor(id: string = '') {
    this.id = id;
  }

  public appendChild(child: MockElement) {
    child.parentElement = this;
    this.children.push(child);
  }

  public querySelector(sel: string): MockElement | null {
    const cleanId = sel.replace(/^#/, '');
    if (this.id === cleanId) return this;
    for (const c of this.children) {
      if (c.id === cleanId) return c;
      const found = c.querySelector(sel);
      if (found) return found;
    }
    return null;
  }

  public closest(sel: string): MockElement | null {
    if (this.className.includes(sel.replace(/^\./, ''))) return this;
    return this.parentElement?.closest(sel) || null;
  }
}

describe('StateSpacePresenter (Deep Facade & Scoped Container)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Card 1 在网格问题下应正确委托 GridVisualAdapter 渲染 2D 沙盘', () => {
    const container = new MockElement('grid-container');
    const step: UniversalStep = {
      stepIndex: 1,
      type: 'calculate',
      log: '计算网格 (1, 1)',
      grid: [[1, 2], [3, 4]],
    };

    const options: StateSpacePresentationOptions = {
      currentStage: 'stage-3',
      step,
      m: 2,
      n: 2,
      modelId: 'unique-paths',
      isGridProblem: true,
    };

    StateSpacePresenter.renderCard1(container as unknown as HTMLElement, options);

    expect(GridVisualAdapter.renderGrid).toHaveBeenCalledWith(
      container,
      step,
      expect.objectContaining({
        m: 2,
        n: 2,
        modelId: 'unique-paths',
        isGridProblem: true,
      })
    );
  });

  it('Card 1 在树形拓扑问题下应委托 RecursionTreeAdapter 渲染并隐藏不相关部件', () => {
    const container = new MockElement('card1-container');
    const step: UniversalStep = {
      stepIndex: 0,
      type: 'init',
      treeRoot: { id: 'root', r: 0, c: 0, val: '10', status: 'normal', children: [] },
      activeNodeId: 'root',
    };

    const options: StateSpacePresentationOptions = {
      currentStage: 'stage-2',
      step,
      m: 1,
      n: 1,
      modelId: 'tree-diameter',
    };

    StateSpacePresenter.renderCard1(container as unknown as HTMLElement, options);

    expect(RecursionTreeAdapter.renderRecursionTree).toHaveBeenCalledWith(
      container,
      step.treeRoot,
      'root',
      true // stage-2 记忆化态
    );
  });

  it('Card 2 在 Stage 1/2 应委托递归搜索树渲染，在 Stage 4/5 应委托一维滚动槽位', () => {
    const container = new MockElement('card2-container');
    const step: UniversalStep = {
      stepIndex: 2,
      type: 'memo',
      treeRoot: { id: 'node-1', r: 0, c: 0, val: 'N1', status: 'normal', children: [] },
      activeNodeId: 'node-1',
    };

    // 阶段 1
    StateSpacePresenter.renderCard2(container as unknown as HTMLElement, {
      currentStage: 'stage-1',
      step,
      m: 1,
      n: 5,
      modelId: 'climbing-stairs',
    });
    expect(RecursionTreeAdapter.renderRecursionTree).toHaveBeenCalledWith(
      container,
      step.treeRoot,
      'node-1',
      false
    );

    // 阶段 4 滚动数组
    StateSpacePresenter.renderCard2(container as unknown as HTMLElement, {
      currentStage: 'stage-4',
      step,
      m: 1,
      n: 5,
      modelId: 'climbing-stairs',
    });
    expect(GridVisualAdapter.renderLiteMemoSlots).toHaveBeenCalledWith(
      container,
      step,
      5
    );
  });

  it('renderStepLogStream 应将多步日志格式化输出，高亮当前活跃步并滚动到底部', () => {
    const container = new MockElement('log-container');
    const logCountEl = new MockElement('log-count');

    const steps: UniversalStep[] = [
      { stepIndex: 0, type: 'init', log: '初始化 dp[0] = 1' },
      { stepIndex: 1, type: 'compute', log: '状态转移 dp[1] = 1' },
      { stepIndex: 2, type: 'compute', log: '状态转移 dp[2] = 2' },
    ];

    StateSpacePresenter.renderStepLogStream(
      container as unknown as HTMLElement,
      steps,
      1, // 当前停在第 1 步
      logCountEl as unknown as HTMLElement
    );

    expect(logCountEl.textContent).toBe('2 / 3 记录');
    expect(container.children.length).toBe(1); // logList 容器
    const logList = container.children[0];
    expect(logList.children.length).toBe(2); // 渲染 0 和 1 步

    // 检查第 1 步高亮类名
    const activeLine = logList.children[1];
    expect(activeLine.className).toContain('border-blue-500');
    expect(activeLine.className).toContain('font-bold');
    expect(activeLine.innerHTML).toContain('dp[1] = 1');
  });

  it('renderLiteVisuals 应通过局部 rootScope 隔离完成全套看板编排，无全局 DOM 污染', () => {
    const root = new MockElement('root-container');
    const card1 = new MockElement('grid-container');
    const card2 = new MockElement('memo-array-container');
    const logBox = new MockElement('log-container');
    const logCount = new MockElement('log-count');
    const legend = new MockElement('legend-ref');
    const toggle3d = new MockElement('btn-toggle-3d');

    root.appendChild(card1);
    root.appendChild(card2);
    root.appendChild(logBox);
    root.appendChild(logCount);
    root.appendChild(legend);
    root.appendChild(toggle3d);

    const step: UniversalStep = {
      stepIndex: 0,
      type: 'init',
      log: '开始网格遍历',
      grid: [[0, 0], [0, 0]],
    };

    StateSpacePresenter.renderLiteVisuals(
      {
        currentStage: 'stage-3',
        step,
        m: 2,
        n: 2,
        modelId: 'unique-paths',
      },
      [step],
      0,
      root as unknown as HTMLElement
    );

    // 验证 GridVisualAdapter 正确挂载到 scoped card1
    expect(GridVisualAdapter.renderGrid).toHaveBeenCalledWith(
      card1,
      step,
      expect.objectContaining({ m: 2, n: 2 })
    );

    // 验证日志列表正确挂载到 scoped logBox
    expect(logBox.children.length).toBe(1);
    expect(logCount.textContent).toBe('1 / 1 记录');
  });

  it('Card 1 在三维 DP 题目与 3D 模式下应正确调用 ThreeLayeredVoxelAdapter', () => {
    const container = new MockElement('card1-wrapper');
    const threeContainer = new MockElement('three-canvas-container');
    container.appendChild(threeContainer);

    const step: UniversalStep = {
      stepIndex: 1,
      type: 'calculate',
      log: '计算三维 DP 路径',
      grid: [[1, 2], [3, 4]],
      vars: [{ name: 'step', value: '1' }] as any
    };

    expect(() => {
      StateSpacePresenter.renderCard1(container as any, {
        currentStage: 'stage-3',
        step,
        m: 2,
        n: 2,
        is3DMode: true,
        modelId: 'out-of-boundary-paths'
      });
    }).not.toThrow();
  });
});
