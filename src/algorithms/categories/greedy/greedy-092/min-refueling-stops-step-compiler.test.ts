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

    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
      for (const [lang, line] of Object.entries(step.codeLine)) {
        const codeArray = MIN_REFUELING_STOPS_CODES[lang];
        expect(codeArray, `Code array for ${lang} must exist`).toBeDefined();
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(codeArray.length);
      }
    }

    const last = steps[steps.length - 1];
    expect(last.stops).toBe(2);
  });
});
