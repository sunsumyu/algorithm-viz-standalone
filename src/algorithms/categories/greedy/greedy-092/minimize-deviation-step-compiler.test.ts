import { assertStepStreamContract } from '../../../../core/testing/contract-assertions';
import { describe, it, expect } from 'vitest';
import { buildMinimizeDeviationSteps, parseMinimizeDeviationInputs } from './minimize-deviation-step-compiler';
import { MINIMIZE_DEVIATION_CODES } from './greedy-092-stage-codes';

describe('MinimizeDeviationStepCompiler', () => {
  it('should compile steps with valid 1-based codeLine mappings for LeetCode 1675', () => {
    const nums = [4, 1, 5, 20, 3];
    const steps = buildMinimizeDeviationSteps(nums);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');
    assertStepStreamContract(steps, {
      codeArrays: MINIMIZE_DEVIATION_CODES,
      requireLine: true,
    });

    const last = steps[steps.length - 1];
    expect(last.ans).toBe(3);
  });

  it('correctly parses inputs', () => {
    const parsed = parseMinimizeDeviationInputs({ 'input-nums': '4, 1, 5, 20, 3' });
    expect(parsed).toEqual([4, 1, 5, 20, 3]);
  });
});
