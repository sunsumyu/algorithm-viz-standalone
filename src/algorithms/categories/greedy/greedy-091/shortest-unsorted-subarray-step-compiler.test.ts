import { assertStepStreamContract } from '../../../../core/testing/contract-assertions';
import { describe, it, expect } from 'vitest';
import { buildShortestUnsortedSteps, parseShortestUnsortedInputs } from './shortest-unsorted-subarray-step-compiler';
import { SHORTEST_UNSORTED_CODES } from './greedy-091-stage-codes';

describe('ShortestUnsortedSubarrayStepCompiler', () => {
  it('should compile steps with valid 1-based codeLine mappings for LeetCode 581 case', () => {
    const nums = [2, 6, 4, 8, 10, 9, 15];
    const steps = buildShortestUnsortedSteps(nums);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');
    assertStepStreamContract(steps, {
      codeArrays: SHORTEST_UNSORTED_CODES,
      requireLine: true,
    });

    const last = steps[steps.length - 1];
    expect(last.decision).toContain('5');
  });

  it('correctly handles already sorted array', () => {
    const nums = [1, 2, 3, 4, 5];
    const steps = buildShortestUnsortedSteps(nums);
    const last = steps[steps.length - 1];
    expect(last.decision).toContain('已有序');
  });

  it('correctly parses inputs', () => {
    const parsed = parseShortestUnsortedInputs({ 'input-nums': '3, 2, 1' });
    expect(parsed).toEqual([3, 2, 1]);
  });
});
