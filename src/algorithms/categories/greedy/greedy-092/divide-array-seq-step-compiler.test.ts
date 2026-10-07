import { describe, it, expect } from 'vitest';
import { buildDivideArraySeqSteps, parseDivideArraySeqInputs } from './divide-array-seq-step-compiler';
import { DIVIDE_ARRAY_SEQ_CODES } from './greedy-092-stage-codes';

describe('DivideArraySeqStepCompiler', () => {
  it('should compile steps with valid 1-based codeLine mappings for LeetCode 1121', () => {
    const nums = [1, 2, 2, 3, 3, 4, 4];
    const k = 3;
    const steps = buildDivideArraySeqSteps(nums, k);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');

    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
      for (const [lang, line] of Object.entries(step.codeLine)) {
        const codeArray = DIVIDE_ARRAY_SEQ_CODES[lang];
        expect(codeArray, `Code array for ${lang} must exist`).toBeDefined();
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(codeArray.length);
      }
    }

    const last = steps[steps.length - 1];
    expect(last.canDivide).toBe(true);
  });

  it('correctly parses inputs', () => {
    const parsed = parseDivideArraySeqInputs({ 'input-nums': '1,2,3', 'input-k': '2' });
    expect(parsed.nums).toEqual([1, 2, 3]);
    expect(parsed.k).toBe(2);
  });
});
