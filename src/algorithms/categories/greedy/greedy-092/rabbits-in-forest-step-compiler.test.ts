import { describe, it, expect } from 'vitest';
import { buildRabbitsInForestSteps } from './rabbits-in-forest-step-compiler';
import { RABBITS_IN_FOREST_CODES } from './greedy-092-stage-codes';

describe('RabbitsInForestStepCompiler', () => {
  it('should compile steps with valid 1-based codeLine mappings for LeetCode 781', () => {
    const answers = [1, 1, 2];
    const steps = buildRabbitsInForestSteps(answers);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');

    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
      for (const [lang, line] of Object.entries(step.codeLine)) {
        const codeArray = RABBITS_IN_FOREST_CODES[lang];
        expect(codeArray, `Code array for ${lang} must exist`).toBeDefined();
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(codeArray.length);
      }
    }

    const last = steps[steps.length - 1];
    expect(last.totalRabbits).toBe(5);
  });
});
