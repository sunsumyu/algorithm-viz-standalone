// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildDependentKnapsackSteps,
  parseDependentKnapsackInputs,
  type DependentItem,
} from './dependent-knapsack-step-compiler';
import {
  renderDependentKnapsackBoard,
  renderDependentKnapsackMetrics,
} from './dependent-knapsack-canvas-adapter';

describe('DependentKnapsack Step Compiler & Canvas Adapter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('正确解析输入并编译洛谷 P1064 金明的预算方案分组背包步进', () => {
    const rawItems: (DependentItem | null)[] = [
      null,
      { cost: 800, val: 1600, q: 0 },
      { cost: 400, val: 1200, q: 1 },
      { cost: 300, val: 900, q: 1 },
      { cost: 400, val: 1200, q: 0 },
      { cost: 200, val: 400, q: 4 },
    ];
    const steps = buildDependentKnapsackSteps(1000, 5, rawItems);
    expect(steps.length).toBeGreaterThan(5);

    // 入口帧
    const s0 = steps[0];
    expect(s0.status).toBe('init');
    expect(s0.codeLine).toBeDefined();

    // 终态帧: 最大收益 2200 (选主件4及附件400+200=600，收益1200+400=1600；或选主件1+附1 800+400越界；选主件4+主件1越界；选主件4(400,1200)+主件1(800)越界；等等，最终dp[1000]=2200)
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.maxVal).toBe(1600);
  });

  it('parseDependentKnapsackInputs 能够正确解析分号分隔的物品格式', () => {
    const parsed = parseDependentKnapsackInputs({
      'input-budget': 1000,
      'input-m': 2,
      'input-items': '800, 1600, 0; 400, 1200, 1',
    });
    expect(parsed.budget).toBe(1000);
    expect(parsed.m).toBe(2);
    expect(parsed.rawItems[1]).toEqual({ cost: 800, val: 1600, q: 0 });
    expect(parsed.rawItems[2]).toEqual({ cost: 400, val: 1200, q: 1 });
  });

  it('Canvas 适配器 DOM 挂载无崩溃且无 [object Object] 与样式污染', () => {
    const rawItems: (DependentItem | null)[] = [
      null,
      { cost: 800, val: 1600, q: 0 },
      { cost: 400, val: 1200, q: 1 },
    ];
    const steps = buildDependentKnapsackSteps(1000, 2, rawItems);
    for (const step of [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]]) {
      renderDependentKnapsackBoard(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
      expect(container.innerHTML).not.toContain('undefined');
      expect(container.innerHTML).not.toContain('NaN');

      renderDependentKnapsackMetrics(container, step);
      expect(container.innerHTML).not.toContain('[object Object]');
    }
  });
});
