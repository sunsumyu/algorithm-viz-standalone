import { describe, it, expect } from 'vitest';
import { buildSmallestRangeSteps } from './smallest-range-step-compiler';
import { SMALLEST_RANGE_CODES } from './greedy-091-stage-codes';

describe('SmallestRangeStepCompiler', () => {
  it('should compile steps with valid 1-based codeLine mappings for LeetCode 632', () => {
    const lists = [
      [4, 10, 15, 24, 26],
      [0, 9, 12, 20],
      [5, 18, 22, 30],
    ];
    const steps = buildSmallestRangeSteps(lists);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');

    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
      expect(step.line).toBeDefined();
      expect(step.line).toBeGreaterThanOrEqual(1);

      for (const [lang, line] of Object.entries(step.codeLine)) {
        const codeArray = SMALLEST_RANGE_CODES[lang];
        expect(codeArray, `Code array for ${lang} must exist`).toBeDefined();
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(codeArray.length);
      }
    }

    const last = steps[steps.length - 1];
    expect(last.ansL).toBe(20);
    expect(last.ansR).toBe(24);
  });
});
