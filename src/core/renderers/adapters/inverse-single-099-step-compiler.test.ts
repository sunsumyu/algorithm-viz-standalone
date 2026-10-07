// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildInverseSingleSteps } from './inverse-single-099-step-compiler';
import { inverseSingle099CanvasAdapter } from './inverse-single-099-canvas-adapter';

describe('inverse-single-099 StepCompiler & CanvasAdapter', () => {
  it('应当为给定数字正确生成逆元步骤并满足行号要求', () => {
    // 3 * 333333336 = 1000000008 = 1 (mod 1000000007)
    const steps = buildInverseSingleSteps(3, 1000000007);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].finalValue).toBe(333333336);

    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('CanvasAdapter 能够稳定挂载与渲染 DOM', () => {
    const container = document.createElement('div');
    const steps = buildInverseSingleSteps(3, 1000000007);
    inverseSingle099CanvasAdapter.render(container, steps[steps.length - 1]);
    expect(container.children.length).toBeGreaterThan(0);
  });
});
