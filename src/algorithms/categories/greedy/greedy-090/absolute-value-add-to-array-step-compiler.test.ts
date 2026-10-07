import { describe, it, expect } from 'vitest';
import { buildAbsValueAddSteps } from './absolute-value-add-to-array-step-compiler';
import {
  ABS_VALUE_ADD_STAGE1_CODES,
  ABS_VALUE_ADD_STAGE2_CODES,
  ABS_VALUE_ADD_STAGE3_CODES,
} from './greedy-090-stage-codes';

describe('AbsoluteValueAddToArrayStepCompiler', () => {
  it('should compile valid steps with 1-based code lines across all 3 stages', () => {
    const s1 = buildAbsValueAddSteps('3, 9', 1);
    const s2 = buildAbsValueAddSteps('3, 9', 2);
    const s3 = buildAbsValueAddSteps('3, 9', 3);

    expect(s1.length).toBeGreaterThan(0);
    expect(s2.length).toBeGreaterThan(0);
    expect(s3.length).toBeGreaterThan(0);

    for (const step of s2) {
      expect(step.codeLine).toBeDefined();
      expect(step.line).toBeDefined();
      expect(step.line).toBeGreaterThanOrEqual(1);

      expect(step.codeLine.java).toBeLessThanOrEqual(ABS_VALUE_ADD_STAGE2_CODES.java.length);
      expect(step.codeLine.cpp).toBeLessThanOrEqual(ABS_VALUE_ADD_STAGE2_CODES.cpp.length);
      expect(step.codeLine.python).toBeLessThanOrEqual(ABS_VALUE_ADD_STAGE2_CODES.python.length);
      expect(step.codeLine.javascript).toBeLessThanOrEqual(ABS_VALUE_ADD_STAGE2_CODES.javascript.length);
    }

    expect(s2[s2.length - 1].theoreticalCount).toBe(3);
  });
});
