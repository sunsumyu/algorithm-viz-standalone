import { describe, it, expect, beforeEach } from 'vitest';
import {
  GridVisualAdapter,
  SpatialFlowVisualAdapter,
  DpTableVisualAdapter,
  MemoSlotVisualAdapter,
  renderMemoGridCard,
  renderDp2DCard1,
  renderDp2DCard2,
  renderSpecialMemoCard2,
  renderSpecial2DCard2,
  renderKnapsackMemoCard2,
  renderKnapsack2DCard1,
  renderStringDpMemoCard2,
  renderStringDp2DCard2,
  renderUniversalDpGrid,
  computeLcsMatchedIndices,
} from './dp-shared';

class MockHTMLElement {
  public style: Record<string, string> = {};
  public _innerHTML = '';
  public className = '';
  public children: MockHTMLElement[] = [];
  public childWrappers: Record<string, MockHTMLElement> = {};
  public id = '';
  public attributes: Record<string, string> = {};

  public get innerHTML(): string {
    let html = this._innerHTML;
    for (const [sel, el] of Object.entries(this.childWrappers)) {
      html = html.replace(`class="${sel.slice(1)}"`, `class="${sel.slice(1)}">${el.innerHTML}`);
    }
    return html;
  }

  public set innerHTML(val: string) {
    this._innerHTML = val;
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
    if (selector.startsWith('.')) {
      const cls = selector.slice(1);
      if (this._innerHTML.includes(cls)) {
        if (!this.childWrappers[selector]) {
          this.childWrappers[selector] = new MockHTMLElement();
        }
        return this.childWrappers[selector];
      }
    }
    return null;
  }
}

describe('dp-shared: 动态规划全类目统一视觉出口模块', () => {
  beforeEach(() => {
    (globalThis as any).document = {
      createElement: () => new MockHTMLElement(),
    };
  });

  it('应正确导出核心视觉表现适配器', () => {
    expect(GridVisualAdapter).toBeDefined();
    expect(typeof GridVisualAdapter.renderGrid).toBe('function');
    expect(SpatialFlowVisualAdapter).toBeDefined();
    expect(DpTableVisualAdapter).toBeDefined();
    expect(MemoSlotVisualAdapter).toBeDefined();
  });

  it('应正确导出 Class 067 经典 DP 渲染器与 LCS 算法计算助手', () => {
    expect(typeof renderMemoGridCard).toBe('function');
    expect(typeof renderDp2DCard1).toBe('function');
    expect(typeof renderDp2DCard2).toBe('function');

    const lcsRes = computeLcsMatchedIndices('abcde', 'ace');
    expect(lcsRes.lcsStr).toBe('ace');
    expect(lcsRes.matched1).toEqual([0, 2, 4]);
    expect(lcsRes.matched2).toEqual([0, 1, 2]);
  });

  it('应正确导出背包演化卡片渲染器', () => {
    expect(typeof renderSpecialMemoCard2).toBe('function');
    expect(typeof renderSpecial2DCard2).toBe('function');
    expect(typeof renderKnapsackMemoCard2).toBe('function');
    expect(typeof renderKnapsack2DCard1).toBe('function');
  });

  it('应正确导出字符串双串 DP 演化卡片渲染器', () => {
    expect(typeof renderStringDpMemoCard2).toBe('function');
    expect(typeof renderStringDp2DCard2).toBe('function');
  });

  it('renderUniversalDpGrid: 应正确装配顶层 Header、图例并委托渲染 2D 网格', () => {
    const container = new MockHTMLElement() as unknown as HTMLElement;
    renderUniversalDpGrid(container, {
      title: '统一状态表 dp[i][j]',
      badgeText: 'O(M×N)',
      grid: [
        [0, 1],
        [2, 3],
      ],
      activeI: 1,
      activeJ: 1,
      rowLabels: ['#0', '#1'],
      colLabels: ['c0', 'c1'],
      deps: [{ r: 0, c: 1, type: 'top', label: '上方' }],
      subTitle: '自底向上逐格递推',
    });

    expect(container.innerHTML).toContain('统一状态表 dp[i][j]');
    expect(container.innerHTML).toContain('O(M×N)');
    expect(container.innerHTML).toContain('自底向上逐格递推');
    expect(container.innerHTML).toContain('当前格');
    expect(container.innerHTML).toContain('依赖格');
    expect(container.innerHTML).toContain('universal-dp-grid-wrapper');
    expect(container.innerHTML).toContain('data-coord="1,1"');
  });
});
