import { describe, it, expect } from 'vitest';
import { buildMinTapsSteps } from './min-taps-093-step-compiler';
import { MIN_TAPS_CODES } from '../../../algorithms/categories/greedy/greedy-093/greedy-093-stage-codes';

describe('MinTaps093StepCompiler', () => {
  it('should compile steps with valid 1-based codeLine mappings', () => {
    const n = 5;
    const ranges = [3, 4, 1, 1, 0, 0];
    const steps = buildMinTapsSteps(n, ranges);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');

    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
      expect(step.line).toBeDefined();
      expect(step.line).toBeGreaterThanOrEqual(1);

      for (const [lang, line] of Object.entries(step.codeLine)) {
        const codeArray = MIN_TAPS_CODES[lang];
        expect(codeArray, `Code array for ${lang} must exist`).toBeDefined();
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(codeArray.length);
      }
    }

    const last = steps[steps.length - 1];
    expect(last.stepsCount).toBe(1);
  });

  it('handles gap case where coverage is impossible', () => {
    const steps = buildMinTapsSteps(3, [0, 0, 0, 0]);
    const failedStep = steps.find((s) => s.isFailed);
    expect(failedStep).toBeDefined();
    expect(failedStep?.decision).toContain('灌溉断裂');
  });
});
