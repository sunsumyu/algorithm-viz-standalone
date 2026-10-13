import { assertStepStreamContract } from '../../../../core/testing/contract-assertions';
import { describe, it, expect } from 'vitest';
import { buildMinimalBatteryPowerSteps } from './minimal-battery-power-step-compiler';
import { MINIMAL_BATTERY_POWER_CODES } from './greedy-091-stage-codes';

describe('MinimalBatteryPowerStepCompiler', () => {
  it('should compile steps with valid 1-based codeLine mappings for LeetCode 1665', () => {
    const tasks: [number, number][] = [
      [1, 2],
      [2, 4],
      [4, 8],
    ];
    const steps = buildMinimalBatteryPowerSteps(tasks);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');
    assertStepStreamContract(steps, {
      codeArrays: MINIMAL_BATTERY_POWER_CODES,
      requireLine: true,
    });

    const last = steps[steps.length - 1];
    expect(last.ans).toBe(11);
  });
});
