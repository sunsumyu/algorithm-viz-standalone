// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildTribonacciSteps } from './tribonacci-matrix-098-step-compiler';
import { matrixPower098CanvasAdapter } from './matrix-power-098-canvas-adapter';

describe('tribonacci-matrix-098 StepCompiler & CanvasAdapter', () => {
  it('应当为给定项数正确生成泰波那契数矩阵快速幂步骤并满足行号要求', () => {
    // T(4) = 4
    const steps = buildTribonacciSteps(4);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].finalValue).toBe(4);

    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
    }

    // 边界特判: 0, 1, 2
    expect(buildTribonacciSteps(0)[1].finalValue).toBe(0);
    expect(buildTribonacciSteps(1)[1].finalValue).toBe(1);
    expect(buildTribonacciSteps(2)[1].finalValue).toBe(1);
  });

  it('CanvasAdapter 能够稳定挂载与渲染 DOM', () => {
    const container = document.createElement('div');
    const steps = buildTribonacciSteps(4);
    matrixPower098CanvasAdapter.render(container, steps[steps.length - 1]);
    expect(container.children.length).toBeGreaterThan(0);
  });
});
