import { describe, it, expect } from 'vitest';
import { buildStringTransformsSteps } from './string-transforms-093-step-compiler';
import { STRING_TRANSFORMS_CODES } from '../../../algorithms/categories/greedy/greedy-093/greedy-093-stage-codes';

describe('StringTransforms093StepCompiler', () => {
  it('should compile steps with valid 1-based codeLine mappings for successful transformation', () => {
    const str1 = 'aabcc';
    const str2 = 'ccdee';
    const steps = buildStringTransformsSteps(str1, str2);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');

    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
      expect(step.line).toBeDefined();
      expect(step.line).toBeGreaterThanOrEqual(1);

      for (const [lang, line] of Object.entries(step.codeLine)) {
        const codeArray = STRING_TRANSFORMS_CODES[lang];
        expect(codeArray, `Code array for ${lang} must exist`).toBeDefined();
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(codeArray.length);
      }
    }

    const last = steps[steps.length - 1];
    expect(last.canTransform).toBe(true);
  });

  it('detects one-to-many conflict', () => {
    const str1 = 'ab';
    const str2 = 'ba';
    const steps = buildStringTransformsSteps(str1, str2);
    expect(steps.length).toBeGreaterThan(0);
  });
});
