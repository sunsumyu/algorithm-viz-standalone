import { describe, it, expect } from 'vitest';
import {
  buildClosedIslandsSteps,
  withClosedIslandsMetrics,
  DEFAULT_CLOSED_GRID,
} from './closed-islands-step-compiler';

describe('closed-islands 步骤编译器测试', () => {
  it('应当为默认用例 (LeetCode 1254 示例 1) 生成完整步骤与正确封闭岛屿计数 (2 座)', () => {
    const rawSteps = buildClosedIslandsSteps(DEFAULT_CLOSED_GRID);
    expect(rawSteps.length).toBeGreaterThanOrEqual(5);

    const firstStep = rawSteps[0];
    expect(firstStep.phase).toBe('init');
    expect(firstStep.codeLine).toBeDefined();

    const lastStep = rawSteps[rawSteps.length - 1];
    expect(lastStep.phase).toBe('done');
    expect(lastStep.closedCount).toBe(2);
    expect(lastStep.borderSunkCount).toBeGreaterThan(0);
  });

  it('应当为双封闭岛用例正确计算出 2 座封闭岛', () => {
    const twoIslandsGrid = [
      [1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1],
    ];
    const steps = buildClosedIslandsSteps(twoIslandsGrid);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.closedCount).toBe(2);
    expect(lastStep.borderSunkCount).toBe(0);
  });

  it('应当为全边界连通网格计算出 0 座封闭岛', () => {
    const allBorderGrid = [
      [0, 0, 1, 1, 0],
      [1, 0, 1, 1, 0],
      [0, 0, 1, 1, 0],
    ];
    const steps = buildClosedIslandsSteps(allBorderGrid);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.closedCount).toBe(0);
    expect(lastStep.borderSunkCount).toBeGreaterThan(0);
  });

  it('应当为所有步骤绑定合法的指标字典与代码行号', () => {
    const steps = withClosedIslandsMetrics(buildClosedIslandsSteps(DEFAULT_CLOSED_GRID));
    for (const step of steps) {
      expect(step.metrics).toBeDefined();
      expect(step.metrics!['metric-phase']).toBeTruthy();
      expect(step.metrics!['metric-closed-count']).toBeTruthy();
      expect(step.codeLine).toBeDefined();
    }
  });
});
