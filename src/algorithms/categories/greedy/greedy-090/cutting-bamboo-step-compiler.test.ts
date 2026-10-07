import { describe, it, expect } from 'vitest';
import {
  buildBambooStage1Steps,
  buildBambooStage2Steps,
  buildBambooStage3Steps,
} from './cutting-bamboo-step-compiler';
import {
  CUTTING_BAMBOO_STAGE1_CODES,
  CUTTING_BAMBOO_STAGE2_CODES,
  CUTTING_BAMBOO_STAGE3_CODES,
} from './greedy-090-stage-codes';

describe('CuttingBambooStepCompiler', () => {
  it('should compile valid steps with 1-based code lines across all 3 stages', () => {
    const s1 = buildBambooStage1Steps(10);
    const s2 = buildBambooStage2Steps(10);
    const s3 = buildBambooStage3Steps(10);

    expect(s1.length).toBeGreaterThan(0);
    expect(s2.length).toBeGreaterThan(0);
    expect(s3.length).toBeGreaterThan(0);

    for (const step of s2) {
      expect(step.codeLine).toBeDefined();
      expect(step.line).toBeDefined();
      expect(step.line).toBeGreaterThanOrEqual(1);

      expect(step.codeLine.java).toBeLessThanOrEqual(CUTTING_BAMBOO_STAGE2_CODES.java.length);
      expect(step.codeLine.cpp).toBeLessThanOrEqual(CUTTING_BAMBOO_STAGE2_CODES.cpp.length);
      expect(step.codeLine.python).toBeLessThanOrEqual(CUTTING_BAMBOO_STAGE2_CODES.python.length);
      expect(step.codeLine.javascript).toBeLessThanOrEqual(CUTTING_BAMBOO_STAGE2_CODES.javascript.length);
    }

    expect(s2[s2.length - 1].currentProduct).toBe('36');
  });
});
