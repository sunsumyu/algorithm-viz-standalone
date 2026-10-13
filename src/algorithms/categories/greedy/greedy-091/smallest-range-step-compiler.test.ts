import { assertStepStreamContract } from '../../../../core/testing/contract-assertions';
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
    assertStepStreamContract(steps, {
      codeArrays: SMALLEST_RANGE_CODES,
      requireLine: true,
    });

    const last = steps[steps.length - 1];
    expect(last.ansL).toBe(20);
    expect(last.ansR).toBe(24);
  });
});
