// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildMillerRabinSteps } from './large-prime-097-step-compiler';
import { largePrime097CanvasAdapter } from './large-prime-097-canvas-adapter';

describe('large-prime-097 StepCompiler & CanvasAdapter', () => {
  it('应当为大素数和合数正确生成推演步骤并满足行号要求', () => {
    // 1000000007 为质数
    const primeSteps = buildMillerRabinSteps(1000000007);
    expect(primeSteps.length).toBeGreaterThan(0);
    expect(primeSteps[primeSteps.length - 1].isResultPrime).toBe(true);

    for (const step of primeSteps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
    }

    // 1000000005 为合数
    const compSteps = buildMillerRabinSteps(1000000005);
    expect(compSteps[compSteps.length - 1].isResultPrime).toBe(false);

    // 边界特判: 1, 2, 4
    const steps1 = buildMillerRabinSteps(1);
    expect(steps1[steps1.length - 1].isResultPrime).toBe(false);
    const steps2 = buildMillerRabinSteps(2);
    expect(steps2[steps2.length - 1].isResultPrime).toBe(true);
    const steps4 = buildMillerRabinSteps(4);
    expect(steps4[steps4.length - 1].isResultPrime).toBe(false);
  });

  it('CanvasAdapter 能够稳定挂载与渲染 DOM', () => {
    const container = document.createElement('div');
    const steps = buildMillerRabinSteps(1000000007);
    largePrime097CanvasAdapter.render(container, steps[steps.length - 1]);
    expect(container.children.length).toBeGreaterThan(0);
  });
});
