import { assertStepStreamContract } from '../../../../core/testing/contract-assertions';
import { describe, it, expect } from 'vitest';
import { buildMinRefuelingStopsSteps } from './min-refueling-stops-step-compiler';
import { MIN_REFUELING_STOPS_CODES } from './greedy-092-stage-codes';

describe('MinRefuelingStopsStepCompiler', () => {
  it('should compile steps with valid 1-based codeLine mappings for LeetCode 871', () => {
    const target = 100;
    const startFuel = 10;
    const stations: [number, number][] = [
      [10, 60],
      [20, 30],
      [30, 30],
      [60, 40],
    ];
    const steps = buildMinRefuelingStopsSteps(target, startFuel, stations);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');
    assertStepStreamContract(steps, {
      codeArrays: MIN_REFUELING_STOPS_CODES,
      requireLine: true,
    });

    const last = steps[steps.length - 1];
    expect(last.stops).toBe(2);
  });
});
