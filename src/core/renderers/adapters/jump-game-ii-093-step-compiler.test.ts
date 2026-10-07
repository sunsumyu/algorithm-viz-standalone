import { describe, it, expect } from 'vitest';
import { buildJumpGameIISteps } from './jump-game-ii-093-step-compiler';
import { JUMP_GAME_II_CODES } from '../../../algorithms/categories/greedy/greedy-093/greedy-093-stage-codes';

describe('JumpGameII093StepCompiler', () => {
  it('should compile steps with valid 1-based codeLine mappings', () => {
    const nums = [2, 3, 1, 1, 4];
    const steps = buildJumpGameIISteps(nums);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');

    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
      expect(step.line).toBeDefined();
      expect(step.line).toBeGreaterThanOrEqual(1);

      for (const [lang, line] of Object.entries(step.codeLine)) {
        const codeArray = JUMP_GAME_II_CODES[lang];
        expect(codeArray, `Code array for ${lang} must exist`).toBeDefined();
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(codeArray.length);
      }
    }

    const last = steps[steps.length - 1];
    expect(last.stepsCount).toBe(2);
  });

  it('handles guard case when array length is 1', () => {
    const steps = buildJumpGameIISteps([0]);
    expect(steps.length).toBe(2);
    expect(steps[1].stepsCount).toBe(0);
  });
});
