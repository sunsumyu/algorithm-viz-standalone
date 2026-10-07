// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildEulerSieveSteps } from './ehrlich-euler-sieve-097-step-compiler';
import { ehrlichEulerSieve097CanvasAdapter } from './ehrlich-euler-sieve-097-canvas-adapter';

describe('ehrlich-euler-sieve-097 StepCompiler & CanvasAdapter', () => {
  it('应当为给定范围正确生成欧拉筛步骤并满足行号要求', () => {
    // 30 以内质数有 10 个
    const steps30 = buildEulerSieveSteps(30);
    expect(steps30.length).toBeGreaterThan(0);
    const last = steps30[steps30.length - 1];
    expect(last.primesFound).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);

    for (const step of steps30) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
    }
  });

  it('CanvasAdapter 能够稳定挂载与渲染 DOM', () => {
    const container = document.createElement('div');
    const steps = buildEulerSieveSteps(30);
    ehrlichEulerSieve097CanvasAdapter.render(container, steps[steps.length - 1]);
    expect(container.children.length).toBeGreaterThan(0);
  });
});
