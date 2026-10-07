import { describe, it, expect } from 'vitest';
import { buildIPOSteps } from './ipo-step-compiler';
import {
  IPO_STAGE1_CODES,
  IPO_STAGE2_CODES,
  IPO_STAGE3_CODES,
} from './greedy-090-stage-codes';

describe('IPOStepCompiler', () => {
  it('should compile valid steps with 1-based code lines across all 3 stages', () => {
    const s1 = buildIPOSteps(2, 0, '1, 2, 3', '0, 1, 1', 1);
    const s2 = buildIPOSteps(2, 0, '1, 2, 3', '0, 1, 1', 2);
    const s3 = buildIPOSteps(2, 0, '1, 2, 3', '0, 1, 1', 3);

    expect(s1.length).toBeGreaterThan(0);
    expect(s2.length).toBeGreaterThan(0);
    expect(s3.length).toBeGreaterThan(0);

    for (const step of s2) {
      expect(step.codeLine).toBeDefined();
      expect(step.line).toBeDefined();
      expect(step.line).toBeGreaterThanOrEqual(1);

      expect(step.codeLine.java).toBeLessThanOrEqual(IPO_STAGE2_CODES.java.length);
      expect(step.codeLine.cpp).toBeLessThanOrEqual(IPO_STAGE2_CODES.cpp.length);
      expect(step.codeLine.python).toBeLessThanOrEqual(IPO_STAGE2_CODES.python.length);
      expect(step.codeLine.javascript).toBeLessThanOrEqual(IPO_STAGE2_CODES.javascript.length);
    }

    expect(s2[s2.length - 1].capital).toBe(4);
  });
});
