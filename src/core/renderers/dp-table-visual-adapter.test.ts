import { describe, it, expect, beforeEach } from 'vitest';
import { DpTableVisualAdapter } from './dp-table-visual-adapter';

// Lightweight Mock DOM
class MockElement {
  public id = '';
  public _innerHTML = '';
  public className = '';
  public textContent = '';
  public children: MockElement[] = [];

  constructor(public tagName = 'div') {}

  get innerHTML(): string {
    if (this._innerHTML) return this._innerHTML;
    return this.children.map(c => c.innerHTML).join('\n');
  }

  set innerHTML(val: string) {
    this._innerHTML = val;
    this.children = [];
  }

  public appendChild(child: MockElement) {
    this.children.push(child);
    return child;
  }
}

describe('DpTableVisualAdapter (Deep Module) Unit Tests', () => {
  let container: MockElement;

  beforeEach(() => {
    container = new MockElement();
    (globalThis as any).document = {
      createElement: (tag: string) => new MockElement(tag)
    };
  });

  it('1. 成功渲染 Stage-3 二维 DP 状态表与转移看板', () => {
    const mockStep = {
      type: 'transfer',
      i: 1,
      j: 1,
      topI: 0,
      topJ: 1,
      leftI: 1,
      leftJ: 0,
      topVal: 1,
      leftVal: 1,
      sumVal: 2,
      grid: [
        [1, 1],
        [1, 2]
      ]
    };

    DpTableVisualAdapter.renderStage3DPTable(container as any, mockStep, { m: 2, n: 2, isReverse: false });
    expect(container.innerHTML).toContain('上方:');
    expect(container.innerHTML).toContain('左方:');
    expect(container.innerHTML).toContain('dp[1][1]:');
    expect(container.innerHTML).toContain('j=0');
    expect(container.innerHTML).toContain('i=0');
  });

  it('2. 障碍格阻断提示渲染', () => {
    const mockStep = {
      type: 'obstacle-cell',
      i: 1,
      j: 1,
      obstacleGrid: [
        [0, 0],
        [0, 1]
      ]
    };

    DpTableVisualAdapter.renderStage3DPTable(container as any, mockStep, { m: 2, n: 2, isReverse: false });
    expect(container.innerHTML).toContain('障碍格阻断');
    expect(container.innerHTML).toContain('dp[1][1] = 0');
  });

  it('3. 成功渲染 max() 决策等式与背包行列表头', () => {
    const mockStep = {
      type: 'transfer',
      msg: 'max(不放, 放入)',
      tag: 'max-select',
      i: 1,
      j: 3,
      topI: 0,
      topJ: 3,
      leftI: 1,
      leftJ: 1,
      topVal: 15,
      leftVal: 35,
      sumVal: 35,
      grid: [
        [0, 15, 15, 15],
        [0, 20, 20, 35]
      ]
    };

    DpTableVisualAdapter.renderStage3DPTable(container as any, mockStep, {
      m: 2,
      n: 4,
      isReverse: false,
      rowLabels: ['物0(w:1,v:15)', '物1(w:2,v:20)'],
      colLabels: ['容0', '容1', '容2', '容3'],
      cornerLabel: '物品(i) \\ 容量(j)'
    });

    expect(container.innerHTML).toContain('max(');
    expect(container.innerHTML).toContain('上方:');
    expect(container.innerHTML).toContain('左方:');
    expect(container.innerHTML).toContain('dp[1][3]:');
    expect(container.innerHTML).toContain('物0(w:1,v:15)');
    expect(container.innerHTML).toContain('物1(w:2,v:20)');
    expect(container.innerHTML).toContain('容3');
    expect(container.innerHTML).toContain('物品(i) \\ 容量(j)');
  });

  it('4. 成功渲染自定义结构化网格对象与贪心状态矩阵', () => {
    const mockStep = {
      i: 0,
      j: 0,
      grid: {
        rows: 2,
        cols: 3,
        rowHeaders: ['M1', 'M2'],
        colHeaders: ['区间', '指针', '决策'],
        cornerLabel: '会议编号',
        values: [
          ['[1, 2]', '2', '选入'],
          ['[2, 3]', '3', '选入']
        ],
        activeRow: 1,
        activeCol: 2
      }
    };

    DpTableVisualAdapter.renderStage3DPTable(container as any, mockStep, {
      m: 2,
      n: 3,
      category: 'greedy'
    });

    expect(container.innerHTML).toContain('二维决策演进表 matrix');
    expect(container.innerHTML).toContain('会议编号');
    expect(container.innerHTML).toContain('M1');
    expect(container.innerHTML).toContain('M2');
    expect(container.innerHTML).toContain('区间');
    expect(container.innerHTML).toContain('指针');
    expect(container.innerHTML).toContain('决策');
    expect(container.innerHTML).toContain('[1, 2]');
    expect(container.innerHTML).toContain('选入');
  });
});
