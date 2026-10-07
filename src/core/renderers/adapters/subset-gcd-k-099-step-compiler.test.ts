// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildSubsetGcdSteps } from './subset-gcd-k-099-step-compiler';
import { subsetGcdK099CanvasAdapter } from './subset-gcd-k-099-canvas-adapter';

describe('subset-gcd-k-099 StepCompiler & CanvasAdapter', () => {
  it('应当为给定数组和 k 正确生成子集 GCD 步骤并满足行号要求', () => {
    const nums = [2, 4, 6, 8, 10];
    const steps = buildSubsetGcdSteps(nums, 2);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].finalValue).toBeGreaterThan(0);

    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('CanvasAdapter 能够稳定挂载与渲染 DOM', () => {
    const container = document.createElement('div');
    const steps = buildSubsetGcdSteps([2, 4, 6, 8, 10], 2);
    subsetGcdK099CanvasAdapter.render(container, steps[steps.length - 1]);
    expect(container.children.length).toBeGreaterThan(0);
  });
});
