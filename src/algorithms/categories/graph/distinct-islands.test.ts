import { describe, it, expect } from 'vitest';
import {
  buildDistinctIslandsSteps,
  withDistinctIslandsMetrics,
  DEFAULT_DISTINCT_GRID,
} from './distinct-islands-step-compiler';

describe('distinct-islands 步骤编译器测试', () => {
  it('应当为默认用例 (LeetCode 694 示例 1: 两个全等正方形) 正确计算出 1 种不同形态', () => {
    const steps = buildDistinctIslandsSteps(DEFAULT_DISTINCT_GRID);
    expect(steps.length).toBeGreaterThanOrEqual(5);

    const first = steps[0];
    expect(first.action).toBe('init');
    expect(first.codeLine).toBeDefined();

    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.totalIslands).toBe(2);
    expect(last.distinctCount).toBe(1);
  });

  it('应当为示例 2 正确计算出 3 种互不相同形态', () => {
    const grid = [
      [1, 1, 0, 1, 1],
      [1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1],
      [1, 1, 0, 1, 1],
    ];
    const steps = buildDistinctIslandsSteps(grid);
    const last = steps[steps.length - 1];
    expect(last.distinctCount).toBe(3);
  });

  it('应当为所有步骤绑定合法的指标字典与代码行号', () => {
    const steps = withDistinctIslandsMetrics(buildDistinctIslandsSteps(DEFAULT_DISTINCT_GRID));
    for (const step of steps) {
      expect(step.metrics).toBeDefined();
      expect(step.metrics!['metric-distinct-count']).toBeTruthy();
      expect(step.codeLine).toBeDefined();
    }
  });
});
