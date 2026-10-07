import { describe, it, expect } from 'vitest';
import { buildSplitMinAvgSumSteps } from './split-min-avg-sum-step-compiler';
import { SPLIT_MIN_AVG_SUM_CODES } from './greedy-091-stage-codes';

describe('SplitMinAvgSumStepCompiler', () => {
  it('should compile steps with valid 1-based codeLine mappings', () => {
    const arr = [9, 1, 8, 2, 7, 3, 6];
    const k = 3;
    const steps = buildSplitMinAvgSumSteps(arr, k);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');

    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
      expect(step.line).toBeDefined();
      expect(step.line).toBeGreaterThanOrEqual(1);

      for (const [lang, line] of Object.entries(step.codeLine)) {
        const codeArray = SPLIT_MIN_AVG_SUM_CODES[lang];
        expect(codeArray, `Code array for ${lang} must exist`).toBeDefined();
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(codeArray.length);
      }
    }

    const last = steps[steps.length - 1];
    expect(last.totalAvgSum).toBe(9);
  });
});
