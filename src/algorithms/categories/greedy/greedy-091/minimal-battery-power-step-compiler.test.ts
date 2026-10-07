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

    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
      expect(step.line).toBeDefined();
      expect(step.line).toBeGreaterThanOrEqual(1);

      for (const [lang, line] of Object.entries(step.codeLine)) {
        const codeArray = MINIMAL_BATTERY_POWER_CODES[lang];
        expect(codeArray, `Code array for ${lang} must exist`).toBeDefined();
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(codeArray.length);
      }
    }

    const last = steps[steps.length - 1];
    expect(last.ans).toBe(11);
  });
});
