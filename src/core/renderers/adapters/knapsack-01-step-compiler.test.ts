// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  buildKnapsack01Steps,
  parseKnapsack01Inputs,
} from './knapsack-01-step-compiler';

describe('Knapsack01 Step Compiler', () => {
  it('经典采药案例 (容量70, 3件物品) 能正确推导出最大价值并完成状态转移', () => {
    const steps = buildKnapsack01Steps(70, [71, 69, 1], [100, 1, 2]);
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.status).toBe('done');
    expect(last.currentVal).toBe(3);
    expect(last.dp[70]).toBe(3);
  });

  it('边界情况：容量为 0 返回价值 0', () => {
    const steps = buildKnapsack01Steps(0, [10, 20], [100, 200]);
    const last = steps[steps.length - 1];
    expect(last.currentVal).toBe(0);
    expect(last.dp[0]).toBe(0);
  });

  it('parseKnapsack01Inputs 能够正确解析输入', () => {
    const parsed = parseKnapsack01Inputs({
      'input-capacity': 70,
      'input-costs': '71, 69, 1',
      'input-vals': '100, 1, 2',
    });
    expect(parsed.t).toBe(70);
    expect(parsed.costs).toEqual([71, 69, 1]);
    expect(parsed.vals).toEqual([100, 1, 2]);
    expect(parsed.items.length).toBe(3);
  });
});
