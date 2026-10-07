// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildBuyGoodsDiscountSteps,
  parseBuyGoodsInputs,
} from './buy-goods-discount-step-compiler';
import {
  renderBuyGoodsBoard,
  renderBuyGoodsStage1Canvas,
  renderBuyGoodsStage1Metrics,
  renderBuyGoodsStage4Metrics,
} from './buy-goods-discount-canvas-adapter';

describe('BuyGoodsDiscount Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('正确解析输入并编译白嫖贪心与 01 背包两阶段步进', () => {
    const { initialBudget, a, b, w } = parseBuyGoodsInputs({
      'input-budget': 10,
      'input-a': '10, 10, 20',
      'input-b': '3, 8, 12',
      'input-w': '5, 10, 12',
    });
    expect(initialBudget).toBe(10);
    expect(a).toEqual([10, 10, 20]);

    const steps = buildBuyGoodsDiscountSteps(initialBudget, a, b, w);
    expect(steps.length).toBeGreaterThan(5);

    // 入口帧
    const s0 = steps[0];
    expect(s0.phase).toBe('init');
    expect(s0.codeLine).toBeDefined();

    // 终态帧: 总快乐值 27
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.totalHappy).toBe(27);
  });

  it('边界情况：预算不足且无法白嫖时总快乐值为 0', () => {
    const steps = buildBuyGoodsDiscountSteps(2, [10], [9], [100]);
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.totalHappy).toBe(0);
  });

  it('Canvas 适配器 DOM 挂载无崩溃且无 [object Object] 与样式污染', () => {
    const steps = buildBuyGoodsDiscountSteps(10, [10, 10, 20], [3, 8, 12], [5, 10, 12]);
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      renderBuyGoodsBoard(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
      expect(container.innerHTML).not.toContain('NaN');

      renderBuyGoodsStage4Metrics(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
    }

    renderBuyGoodsStage1Canvas(container, {
      i: 0,
      n: 2,
      normalGames: [{ id: 1, cost: 6, val: 10 }],
      decision: '考察游戏 1',
      message: '测试',
      callStack: [{ name: 'dfs', args: 'i=0, rem=10' }],
    });
    expect(container.innerHTML).not.toContain('[object Object]');

    renderBuyGoodsStage1Metrics(container, {
      callStack: [{ name: 'dfs' }],
      n: 2,
    });
    expect(container.innerHTML).not.toContain('[object Object]');
  });
});
