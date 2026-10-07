import { describe, it, expect } from 'vitest';
import { buildCrossRiverSteps } from './cross-river-093-step-compiler';
import { CROSS_RIVER_CODES } from '../../../algorithms/categories/greedy/greedy-093/greedy-093-stage-codes';

describe('CrossRiver093StepCompiler', () => {
  it('should compile steps with valid 1-based codeLine mappings for classic POJ 1700 case', () => {
    const times = [1, 2, 5, 10];
    const steps = buildCrossRiverSteps(times);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');

    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
      expect(step.line).toBeDefined();
      expect(step.line).toBeGreaterThanOrEqual(1);

      for (const [lang, line] of Object.entries(step.codeLine)) {
        const codeArray = CROSS_RIVER_CODES[lang];
        expect(codeArray, `Code array for ${lang} must exist`).toBeDefined();
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(codeArray.length);
      }
    }

    const last = steps[steps.length - 1];
    expect(last.totalTime).toBe(17);
  });

  it('handles small groups of people', () => {
    const steps = buildCrossRiverSteps([1, 2]);
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.totalTime).toBe(2);
  });
});
