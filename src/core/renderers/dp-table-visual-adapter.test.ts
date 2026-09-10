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
});
