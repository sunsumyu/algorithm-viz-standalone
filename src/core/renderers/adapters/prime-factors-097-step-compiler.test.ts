// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildPrimeFactorsSteps } from './prime-factors-097-step-compiler';
import { primeFactors097CanvasAdapter } from './prime-factors-097-canvas-adapter';

describe('prime-factors-097 StepCompiler & CanvasAdapter', () => {
  it('应当为合数和质数正确生成分解步骤并满足行号要求', () => {
    // 360 = 2^3 * 3^2 * 5^1
    const steps360 = buildPrimeFactorsSteps(360);
    expect(steps360.length).toBeGreaterThan(0);
    const last360 = steps360[steps360.length - 1];
    expect(last360.factors).toEqual([
      { prime: 2, power: 3 },
      { prime: 3, power: 2 },
      { prime: 5, power: 1 },
    ]);

    for (const step of steps360) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.codeLine).toBeDefined();
    }

    // 质数 97 的分解: 97 = 97^1
    const steps97 = buildPrimeFactorsSteps(97);
    const last97 = steps97[steps97.length - 1];
    expect(last97.factors).toEqual([{ prime: 97, power: 1 }]);
  });

  it('CanvasAdapter 能够稳定挂载与渲染 DOM', () => {
    const container = document.createElement('div');
    const steps = buildPrimeFactorsSteps(360);
    primeFactors097CanvasAdapter.render(container, steps[steps.length - 1]);
    expect(container.children.length).toBeGreaterThan(0);
  });
});
