import { describe, it, expect } from 'vitest';
import { buildLongestSameZerosOnesSteps } from './longest-same-zeros-ones-step-compiler';
import { LONGEST_SAME_ZEROS_ONES_CODES } from './greedy-091-stage-codes';

describe('LongestSameZerosOnesStepCompiler', () => {
  it('should compile steps with valid 1-based codeLine mappings for classic 01 case', () => {
    const arr = [0, 1, 0, 0, 1, 0];
    const steps = buildLongestSameZerosOnesSteps(arr);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');

    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
      expect(step.line).toBeDefined();
      expect(step.line).toBeGreaterThanOrEqual(1);

      for (const [lang, line] of Object.entries(step.codeLine)) {
        const codeArray = LONGEST_SAME_ZEROS_ONES_CODES[lang];
        expect(codeArray, `Code array for ${lang} must exist`).toBeDefined();
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(codeArray.length);
      }
    }

    const last = steps[steps.length - 1];
    expect(last.maxLen).toBe(5);
  });
});
