// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildClimbingStairsSteps } from './climbing-stairs-matrix-098-step-compiler';
import { matrixPower098CanvasAdapter } from './matrix-power-098-canvas-adapter';

describe('climbing-stairs-matrix-098 StepCompiler & CanvasAdapter', () => {
  it('应当为给定台阶数正确生成爬楼梯矩阵快速幂步骤并满足行号要求', () => {
    // dp[4] = 5
    const steps = buildClimbingStairsSteps(4);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].finalValue).toBe(5);

    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
    }

    // 边界特判: 1, 2
    expect(buildClimbingStairsSteps(1)[1].finalValue).toBe(1);
    expect(buildClimbingStairsSteps(2)[1].finalValue).toBe(2);
  });

  it('CanvasAdapter 能够稳定挂载与渲染 DOM', () => {
    const container = document.createElement('div');
    const steps = buildClimbingStairsSteps(4);
    matrixPower098CanvasAdapter.render(container, steps[steps.length - 1]);
    expect(container.children.length).toBeGreaterThan(0);
  });
});
