import { assertStepStreamContract } from '../../../../core/testing/contract-assertions';
import { describe, it, expect } from 'vitest';
import { buildRabbitsInForestSteps } from './rabbits-in-forest-step-compiler';
import { RABBITS_IN_FOREST_CODES } from './greedy-092-stage-codes';

describe('RabbitsInForestStepCompiler', () => {
  it('should compile steps with valid 1-based codeLine mappings for LeetCode 781', () => {
    const answers = [1, 1, 2];
    const steps = buildRabbitsInForestSteps(answers);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');
    assertStepStreamContract(steps, {
      codeArrays: RABBITS_IN_FOREST_CODES,
      requireLine: true,
    });

    const last = steps[steps.length - 1];
    expect(last.totalRabbits).toBe(5);
  });
});
