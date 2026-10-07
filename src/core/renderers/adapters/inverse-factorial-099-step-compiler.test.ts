// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildFactorialSteps } from './inverse-factorial-099-step-compiler';
import { inverseFactorial099CanvasAdapter } from './inverse-factorial-099-canvas-adapter';

describe('inverse-factorial-099 StepCompiler & CanvasAdapter', () => {
  it('应当为给定 n, m 正确生成阶乘逆元组合数步骤并满足行号要求', () => {
    // C(10, 3) = 120
    const steps = buildFactorialSteps(10, 3, 1000000007);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].finalValue).toBe(120);

    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
    }

    // 边界特判: m > n -> 0
    expect(buildFactorialSteps(3, 5)[1].finalValue).toBe(0);
  });

  it('CanvasAdapter 能够稳定挂载与渲染 DOM', () => {
    const container = document.createElement('div');
    const steps = buildFactorialSteps(10, 3);
    inverseFactorial099CanvasAdapter.render(container, steps[steps.length - 1]);
    expect(container.children.length).toBeGreaterThan(0);
  });
});
