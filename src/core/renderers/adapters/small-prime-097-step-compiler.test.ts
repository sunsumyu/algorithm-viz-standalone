// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildSmallPrimeSteps } from './small-prime-097-step-compiler';
import { smallPrime097CanvasAdapter } from './small-prime-097-canvas-adapter';

describe('small-prime-097 StepCompiler & CanvasAdapter', () => {
  it('应当为素数和合数正确生成推演步骤并满足行号要求', () => {
    const primeSteps = buildSmallPrimeSteps(97);
    expect(primeSteps.length).toBeGreaterThan(0);
    expect(primeSteps[primeSteps.length - 1].isResultPrime).toBe(true);

    for (const step of primeSteps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
    }

    const compSteps = buildSmallPrimeSteps(100);
    expect(compSteps[compSteps.length - 1].isResultPrime).toBe(false);

    // 边界特判: 1, 2, 3
    const steps1 = buildSmallPrimeSteps(1);
    expect(steps1[steps1.length - 1].isResultPrime).toBe(false);
    const steps2 = buildSmallPrimeSteps(2);
    expect(steps2[steps2.length - 1].isResultPrime).toBe(true);
    const steps3 = buildSmallPrimeSteps(3);
    expect(steps3[steps3.length - 1].isResultPrime).toBe(true);
  });

  it('CanvasAdapter 能够稳定挂载与渲染 DOM', () => {
    const container = document.createElement('div');
    const steps = buildSmallPrimeSteps(97);
    smallPrime097CanvasAdapter.render(container, steps[steps.length - 1]);
    expect(container.children.length).toBeGreaterThan(0);
  });
});
