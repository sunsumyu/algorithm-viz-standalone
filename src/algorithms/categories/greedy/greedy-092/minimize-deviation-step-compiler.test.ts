import { describe, it, expect } from 'vitest';
import { buildMinimizeDeviationSteps, parseMinimizeDeviationInputs } from './minimize-deviation-step-compiler';
import { MINIMIZE_DEVIATION_CODES } from './greedy-092-stage-codes';

describe('MinimizeDeviationStepCompiler', () => {
  it('should compile steps with valid 1-based codeLine mappings for LeetCode 1675', () => {
    const nums = [4, 1, 5, 20, 3];
    const steps = buildMinimizeDeviationSteps(nums);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');

    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
      for (const [lang, line] of Object.entries(step.codeLine)) {
        const codeArray = MINIMIZE_DEVIATION_CODES[lang];
        expect(codeArray, `Code array for ${lang} must exist`).toBeDefined();
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(codeArray.length);
      }
    }

    const last = steps[steps.length - 1];
    expect(last.ans).toBe(3);
  });

  it('correctly parses inputs', () => {
    const parsed = parseMinimizeDeviationInputs({ 'input-nums': '4, 1, 5, 20, 3' });
    expect(parsed).toEqual([4, 1, 5, 20, 3]);
  });
});
