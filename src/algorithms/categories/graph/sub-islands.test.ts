import { describe, it, expect } from 'vitest';
import {
  buildSubIslandsSteps,
  withSubIslandsMetrics,
  DEFAULT_GRID1,
  DEFAULT_GRID2,
} from './sub-islands-step-compiler';

describe('sub-islands 步骤编译器测试', () => {
  it('应当为默认用例 (LeetCode 1905 示例 1) 正确计算出 3 座合法子岛屿', () => {
    const steps = buildSubIslandsSteps(DEFAULT_GRID1, DEFAULT_GRID2);
    expect(steps.length).toBeGreaterThanOrEqual(5);

    const first = steps[0];
    expect(first.phase).toBe('init');
    expect(first.codeLine).toBeDefined();

    const last = steps[steps.length - 1];
    expect(last.phase).toBe('done');
    expect(last.subIslandCount).toBe(3);
    expect(last.excludedIslandCount).toBeGreaterThan(0);
  });

  it('应当为示例 2 正确计算出 2 座合法子岛屿', () => {
    const grid1 = [
      [1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1],
    ];
    const grid2 = [
      [0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1],
      [0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0],
      [1, 0, 0, 0, 1],
    ];
    const steps = buildSubIslandsSteps(grid1, grid2);
    const last = steps[steps.length - 1];
    expect(last.subIslandCount).toBe(2);
    expect(last.excludedIslandCount).toBeGreaterThan(0);
  });

  it('应当为所有步骤绑定合法的指标字典与代码行号', () => {
    const steps = withSubIslandsMetrics(buildSubIslandsSteps(DEFAULT_GRID1, DEFAULT_GRID2));
    for (const step of steps) {
      expect(step.metrics).toBeDefined();
      expect(step.metrics!['metric-phase']).toBeTruthy();
      expect(step.metrics!['metric-sub-island-count']).toBeTruthy();
      expect(step.codeLine).toBeDefined();
    }
  });
});
