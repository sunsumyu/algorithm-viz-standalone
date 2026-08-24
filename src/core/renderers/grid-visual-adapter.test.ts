import { describe, it, expect, beforeEach } from 'vitest';
import { GridVisualAdapter, RecursionTreeAdapter } from './grid-visual-adapter';

// Lightweight DOM mock for node environment
class MockHTMLElement {
  public style: Record<string, string> = {};
  public innerHTML = '';
  public className = '';
  public children: MockHTMLElement[] = [];
  public id = '';

  public appendChild(child: MockHTMLElement) {
    this.children.push(child);
  }

  public querySelector(selector: string): MockHTMLElement | null {
    if (selector.startsWith('#')) {
      const id = selector.slice(1);
      if (this.id === id) return this;
      for (const c of this.children) {
        const found = c.querySelector(selector);
        if (found) return found;
      }
    }
    return null;
  }

  public get textContent(): string {
    return this.innerHTML.replace(/<[^>]*>/g, '');
  }
}

describe('GridVisualAdapter Deep Module', () => {
  beforeEach(() => {
    (globalThis as any).document = {
      createElement: () => new MockHTMLElement()
    };
  });

  it('应该正确生成探险家小人矢量 SVG HTML', () => {
    const normalSvg = GridVisualAdapter.getAdventurerSvgHtml({ state: 'walking' });
    expect(normalSvg).toContain('<svg class="adventurer-char');
    expect(normalSvg).toContain('is-jumping');

    const cheerSvg = GridVisualAdapter.getAdventurerSvgHtml({ isFinish: true });
    expect(cheerSvg).toContain('is-cheering');
    expect(cheerSvg).toContain('🏆');
  });

  it('应该能构建并更新二维网格 DOM 元素', () => {
    const container = new MockHTMLElement() as unknown as HTMLElement;
    const mockStep = {
      i: 1,
      j: 1,
      topI: 0,
      topJ: 1,
      leftI: 1,
      leftJ: 0,
      grid: [
        [1, 1, 1],
        [1, 2, null],
        [1, null, null]
      ]
    };

    GridVisualAdapter.renderGrid(container, mockStep, { m: 3, n: 3 });
    const mockContainer = container as unknown as MockHTMLElement;
    expect(mockContainer.children.length).toBe(9);
    expect(mockContainer.style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');

    // 检查当前单元格 (1, 1) 是否具有 active 特征
    const curCell = mockContainer.children[4];
    expect(curCell.innerHTML).toContain('adventurer-char');
    expect(curCell.innerHTML).toContain('1,1');
  });

  it('应该在递归调用栈中正确渲染探索足迹 👣 (is-trail)', () => {
    const container = new MockHTMLElement() as unknown as HTMLElement;
    const mockStep = {
      i: 2,
      j: 0,
      activeStack: ['0,0', '1,0', '2,0'],
      grid: [
        [null, null, null],
        [null, null, null],
        [null, null, null]
      ]
    };

    GridVisualAdapter.renderGrid(container, mockStep, { m: 3, n: 3 });
    const mockContainer = container as unknown as MockHTMLElement;
    // 检查 (0, 0) 和 (1, 0) 是探索足迹 (is-trail) 并包含 👣
    const trailCell00 = mockContainer.children[0]; // (0,0)
    const trailCell10 = mockContainer.children[3]; // (1,0)
    const curCell20 = mockContainer.children[6];   // (2,0)

    expect(trailCell00.className).toContain('is-trail');
    expect(trailCell00.innerHTML).toContain('👣');
    expect(trailCell10.className).toContain('is-trail');
    expect(trailCell10.innerHTML).toContain('👣');
    // 当前点 (2,0) 则是探险家
    expect(curCell20.className).toContain('is-cur');
    expect(curCell20.innerHTML).toContain('adventurer-char');
  });

  it('当进入越界方法头 (dfs(3,0)) 时，探险家小人应驻留在父节点单元格 (2,0) 上而不消失', () => {
    const container = new MockHTMLElement() as unknown as HTMLElement;
    const mockStep = {
      type: 'dfs-call',
      i: 3,
      j: 0,
      fromI: 2,
      fromJ: 0,
      activeStack: ['0,0', '1,0', '2,0', '3,0'],
      grid: [
        [null, null, null],
        [null, null, null],
        [null, null, null]
      ]
    };

    GridVisualAdapter.renderGrid(container, mockStep, { m: 3, n: 3 });
    const mockContainer = container as unknown as MockHTMLElement;
    // 检查父节点单元格 (2,0) 是否依然持有探险家小人 (is-cur)
    const parentCell20 = mockContainer.children[6]; // (2,0)
    expect(parentCell20.className).toContain('is-cur');
    expect(parentCell20.innerHTML).toContain('adventurer-char');
  });

  it('应该能构建一维空间压缩槽位', () => {
    const container = new MockHTMLElement() as unknown as HTMLElement;
    GridVisualAdapter.build1DSlots(container, 4, 'dp');
    const mockContainer = container as unknown as MockHTMLElement;
    expect(mockContainer.children.length).toBe(4);
    expect(mockContainer.querySelector('#memo-slot-0')?.textContent).toContain('dp[0]');
    expect(mockContainer.querySelector('#memo-slot-3')?.textContent).toContain('dp[3]');
  });

  it('应该能渲染 Lite 模式下的 memo 槽位并标注活跃与参考项', () => {
    const container = new MockHTMLElement() as unknown as HTMLElement;
    const mockStep = {
      memo: [1, 2, 3, 0],
      memoUpdatedIndex: 1,
      memoRefLeftIndex: 0
    };
    GridVisualAdapter.renderLiteMemoSlots(container, mockStep, 4);
    const mockContainer = container as unknown as MockHTMLElement;
    expect(mockContainer.children.length).toBe(4);
    // 检查第 1 项 (被更新项) 包含青蛙 icon
    expect(mockContainer.children[1].innerHTML).toContain('🐸');
    // 检查第 0 项 (左侧参考项) 包含猫咪 icon
    expect(mockContainer.children[0].innerHTML).toContain('🐱');
  });

  it('应该能渲染 Stage-3 状态转移等式看板', () => {
    const container = new MockHTMLElement() as unknown as HTMLElement;
    const mockStep = {
      topVal: 3,
      leftVal: 4,
      sumVal: 7
    };
    GridVisualAdapter.renderTransferEquation(container, mockStep, false);
    const mockContainer = container as unknown as MockHTMLElement;
    expect(mockContainer.innerHTML).toContain('上方: 3');
    expect(mockContainer.innerHTML).toContain('左方: 4');
    expect(mockContainer.innerHTML).toContain('当前单元: 7');
  });
});

describe('RecursionTreeAdapter Deep Module', () => {
  it('应该正确渲染 SVG 递归树', () => {
    const container = new MockHTMLElement() as unknown as HTMLElement;
    const mockTree = {
      id: '0,0',
      val: '(0,0)=2',
      status: 'visited',
      children: [
        { id: '1,0', val: '(1,0)=1', status: 'base', children: [] },
        { id: '0,1', val: '(0,1)=1', status: 'base', children: [] }
      ]
    };

    RecursionTreeAdapter.renderRecursionTree(container, mockTree, '0,0');
    const mockContainer = container as unknown as MockHTMLElement;
    expect(mockContainer.innerHTML).toContain('<svg');
    expect(mockContainer.innerHTML).toContain('(0,0)=2');
    expect(mockContainer.innerHTML).toContain('(1,0)=1');
    expect(mockContainer.innerHTML).toContain('(0,1)=1');
    expect(mockContainer.innerHTML).toContain('🐸');
  });

  it('当没有递归树时展示友好提示', () => {
    const container = new MockHTMLElement() as unknown as HTMLElement;
    RecursionTreeAdapter.renderRecursionTree(container, null);
    const mockContainer = container as unknown as MockHTMLElement;
    expect(mockContainer.textContent).toContain('暂无递归调用树');
  });
});
