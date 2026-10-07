import { describe, it, expect } from 'vitest';
import { buildSuperWashingMachinesSteps } from './super-washing-machines-093-step-compiler';
import { SUPER_WASHING_MACHINES_CODES } from '../../../algorithms/categories/greedy/greedy-093/greedy-093-stage-codes';

describe('SuperWashingMachines093StepCompiler', () => {
  it('should compile steps with valid 1-based codeLine mappings for LeetCode 517 case', () => {
    const machines = [1, 0, 5];
    const steps = buildSuperWashingMachinesSteps(machines);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');

    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
      expect(step.line).toBeDefined();
      expect(step.line).toBeGreaterThanOrEqual(1);

      for (const [lang, line] of Object.entries(step.codeLine)) {
        const codeArray = SUPER_WASHING_MACHINES_CODES[lang];
        expect(codeArray, `Code array for ${lang} must exist`).toBeDefined();
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(codeArray.length);
      }
    }

    const last = steps[steps.length - 1];
    expect(last.maxMoves).toBe(3);
  });

  it('handles cannot divide evenly case', () => {
    const steps = buildSuperWashingMachinesSteps([0, 3]);
    const impossibleStep = steps.find((s) => s.isImpossible);
    expect(impossibleStep).toBeDefined();
    expect(impossibleStep?.maxMoves).toBe(-1);
  });
});
