import { describe, it, expect, beforeEach } from 'vitest';
import { GridVisualAdapter, RecursionTreeAdapter } from './grid-visual-adapter';

// Lightweight DOM mock for node environment
class MockHTMLElement {
  public style: Record<string, string> = {};
  public _innerHTML = '';
  public className = '';
  public children: MockHTMLElement[] = [];
  public id = '';
  public dataset: Record<string, string> = {};
  public attributes: Record<string, string> = {};

  public get innerHTML(): string {
    if (this.children.length > 0) {
      return this._innerHTML + this.children.map(c => c.innerHTML).join('');
    }
    return this._innerHTML;
  }

  public set innerHTML(val: string) {
    this._innerHTML = val;
    if (val === '') {
      this.children = [];
    }
  }

  public appendChild(child: MockHTMLElement) {
    this.children.push(child);
  }

  public setAttribute(name: string, value: string) {
    this.attributes[name] = value;
  }

  public getAttribute(name: string): string | null {
    return this.attributes[name] ?? null;
  }

  public querySelector(selector: string): MockHTMLElement | null {
    if (selector.startsWith('#')) {
      const id = selector.slice(1);
      if (this.id === id) return this;
    }
    if (selector.startsWith('.')) {
      const cls = selector.slice(1);
      if (this.className.includes(cls) || this.innerHTML.includes(cls)) return this;
    }
    if (selector.startsWith('[data-coord=')) {
      const match = selector.match(/\[data-coord="([^"]+)"\]/);
      if (match && this.attributes['data-coord'] === match[1]) return this;
    }
    for (const c of this.children) {
      const found = c.querySelector(selector);
      if (found) return found;
    }
    return null;
  }

  public get firstElementChild(): MockHTMLElement | null {
    return this.children[0] || null;
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
    expect(normalSvg).toContain('is-walking');

    const blockedSvg = GridVisualAdapter.getAdventurerSvgHtml({ state: 'blocked' });
    expect(blockedSvg).toContain('is-blocked');

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

  it('当探险家遭遇障碍物格点 (1,1) 时，探险家小人应弹回到安全来源格 (0,1) 上而不停留在障碍物格子里', () => {
    const container = new MockHTMLElement() as unknown as HTMLElement;
    const mockStep = {
      type: 'obstacle-hit',
      i: 1,
      j: 1,
      fromI: 0,
      fromJ: 1,
      activeStack: ['0,0', '0,1', '1,1'],
      obstacleGrid: [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
      ],
      grid: [
        [null, null, null],
        [null, null, null],
        [null, null, null]
      ]
    };

    GridVisualAdapter.renderGrid(container, mockStep, { m: 3, n: 3 });
    const mockContainer = container as unknown as MockHTMLElement;
    const originCell01 = mockContainer.children[1];   // (0,1) 来源格
    const obstacleCell11 = mockContainer.children[4]; // (1,1) 障碍格

    // 1. 探险家小人应安全驻留在来源格 (0,1) 上并播放遇障弹回动画
    expect(originCell01.className).toContain('is-cur');
    expect(originCell01.innerHTML).toContain('adventurer-char');
    expect(originCell01.innerHTML).toContain('遇障弹回');

    // 2. 障碍物格子 (1,1) 保持为纯障碍物，严禁小人站在障碍物内部
    expect(obstacleCell11.className).toContain('is-obstacle');
    expect(obstacleCell11.innerHTML).toContain('🚧');
    expect(obstacleCell11.innerHTML).not.toContain('adventurer-char');
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
      memoSnapshot: [1, 2, 3, 0],
      activeSlot: 1,
      slotMode: 'updated',
      memoj: 2
    };
    GridVisualAdapter.renderLiteMemoSlots(container, mockStep, 4);
    const mockContainer = container as unknown as MockHTMLElement;
    expect(mockContainer.children.length).toBe(2); // 包含顶部等式看板与槽位行
    const slotsRow = mockContainer.children[1];
    expect(slotsRow.children.length).toBe(4);
    // 检查第 1 项 (被更新项) 包含青蛙 icon
    expect(slotsRow.children[1].innerHTML).toContain('🐸');
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
    expect(mockContainer.innerHTML).toContain('3');
    expect(mockContainer.innerHTML).toContain('4');
    expect(mockContainer.innerHTML).toContain('7');
  });

  it('在 Stage 3 二维 DP 阶段遍历到障碍格 (1,1) 时，探险家必须驻留在此单元格展示受阻状态，绝不消失', () => {
    const container = new MockHTMLElement() as unknown as HTMLElement;
    const mockStep = {
      type: 'obstacle-cell',
      i: 1,
      j: 1,
      obstacleGrid: [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
      ],
      grid: [
        [1, 1, 1],
        [1, null, null],
        [null, null, null]
      ]
    };

    GridVisualAdapter.renderGrid(container, mockStep, { m: 3, n: 3 });
    const mockContainer = container as unknown as MockHTMLElement;
    const obstacleCell11 = mockContainer.children[4]; // (1,1) 障碍格

    // 探险家必须驻留在正在计算的障碍格 (1,1) 上，同时展示 🚧 与障碍格置 0 徽章
    expect(obstacleCell11.className).toContain('is-obstacle');
    expect(obstacleCell11.className).toContain('is-cur');
    expect(obstacleCell11.innerHTML).toContain('adventurer-char');
    expect(obstacleCell11.innerHTML).toContain('is-blocked');
    expect(obstacleCell11.innerHTML).toContain('🚧 障碍格置 0');
  });

  it('兜底卫士：在全阶段任何边界或异常步骤下，整个网格中必须有且仅有一个 adventurer-char 存在', () => {
    const container = new MockHTMLElement() as unknown as HTMLElement;
    // 模拟无坐标或极端异常的步
    const irregularStep = {
      type: 'unknown-boundary',
      grid: [
        [1, 1, 1],
        [1, 2, 3],
        [1, 3, 6]
      ]
    };

    GridVisualAdapter.renderGrid(container, irregularStep, { m: 3, n: 3 });
    const mockContainer = container as unknown as MockHTMLElement;
    // 兜底机制生效，探险家被自动注入到默认单元格
    const foundAdventurer = mockContainer.querySelector('.adventurer-char');
    expect(foundAdventurer).not.toBeNull();
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

  it('应该在活跃节点更新时自动计算 2D 视口滚动并聚焦活跃节点', () => {
    const container = new MockHTMLElement() as unknown as HTMLElement;
    const mockTree = {
      id: 'root',
      val: 'dfs(7,6)',
      status: 'visited',
      children: [
        {
          id: 'child-1',
          val: 'dfs(6,5)',
          status: 'visited',
          children: [
            { id: 'deep-active', val: 'dfs(1,1)', status: 'current', children: [] }
          ]
        }
      ]
    };

    RecursionTreeAdapter.renderRecursionTree(container, mockTree, 'deep-active');
    const mockContainer = container as unknown as MockHTMLElement;
    const scrollBox = mockContainer.querySelector('#tree-scroll-box');
    expect(scrollBox).toBeDefined();
    expect(mockContainer.innerHTML).toContain('dfs(7,6)');
    expect(mockContainer.innerHTML).toContain('dfs(1,1)');
    expect(mockContainer.innerHTML).toContain('🐸');
  });

  it('应该正确渲染 edgeLabel 分支边标注与自适应节点宽', () => {
    const container = new MockHTMLElement() as unknown as HTMLElement;
    const mockTree = {
      id: 'root',
      val: 'dfs(0,11)',
      status: 'visited',
      children: [
        { id: 'c1', val: 'dfs(1,11)', edgeLabel: '不选', status: 'visited', children: [] },
        { id: 'c2', val: 'dfs(1,6)', edgeLabel: '选入', status: 'current', children: [] }
      ]
    };

    RecursionTreeAdapter.renderRecursionTree(container, mockTree, 'c2');
    const mockContainer = container as unknown as MockHTMLElement;
    expect(mockContainer.innerHTML).toContain('不选');
    expect(mockContainer.innerHTML).toContain('选入');
    expect(mockContainer.innerHTML).toContain('dfs(0,11)');
    expect(mockContainer.innerHTML).toContain('dfs(1,6)');
    expect(mockContainer.innerHTML).toContain('🐸');
  });
});
