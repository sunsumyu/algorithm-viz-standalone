import { assertStepStreamContract } from '../../../../core/testing/contract-assertions';
import { describe, it, expect } from 'vitest';
import { buildMinOperationsSimilarSteps } from './min-operations-similar-step-compiler';
import { MIN_OPERATIONS_SIMILAR_CODES } from './greedy-092-stage-codes';

describe('MinOperationsSimilarStepCompiler', () => {
  it('should compile steps with valid 1-based codeLine mappings for LeetCode 2449', () => {
    const nums = [8, 12, 6];
    const target = [2, 14, 10];
    const steps = buildMinOperationsSimilarSteps(nums, target);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');
    assertStepStreamContract(steps, {
      codeArrays: MIN_OPERATIONS_SIMILAR_CODES,
      requireLine: true,
    });

    const last = steps[steps.length - 1];
    expect(last.totalOps).toBe(2);
  });
});
