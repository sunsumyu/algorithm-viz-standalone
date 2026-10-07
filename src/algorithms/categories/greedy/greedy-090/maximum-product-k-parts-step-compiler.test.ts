import { describe, it, expect } from 'vitest';
import {
  buildMaxProductKStage1Steps,
  buildMaxProductKStage2Steps,
  buildMaxProductKStage3Steps,
} from './maximum-product-k-parts-step-compiler';
import {
  MAX_PRODUCT_K_STAGE1_CODES,
  MAX_PRODUCT_K_STAGE2_CODES,
  MAX_PRODUCT_K_STAGE3_CODES,
} from './greedy-090-stage-codes';

describe('MaximumProductKPartsStepCompiler', () => {
  it('should compile valid steps with 1-based code lines across all 3 stages', () => {
    const s1 = buildMaxProductKStage1Steps(14, 4);
    const s2 = buildMaxProductKStage2Steps(14, 4);
    const s3 = buildMaxProductKStage3Steps(14, 4);

    expect(s1.length).toBeGreaterThan(0);
    expect(s2.length).toBeGreaterThan(0);
    expect(s3.length).toBeGreaterThan(0);

    for (const step of s2) {
      expect(step.codeLine).toBeDefined();
      expect(step.line).toBeDefined();
      expect(step.line).toBeGreaterThanOrEqual(1);

      expect(step.codeLine.java).toBeLessThanOrEqual(MAX_PRODUCT_K_STAGE2_CODES.java.length);
      expect(step.codeLine.cpp).toBeLessThanOrEqual(MAX_PRODUCT_K_STAGE2_CODES.cpp.length);
      expect(step.codeLine.python).toBeLessThanOrEqual(MAX_PRODUCT_K_STAGE2_CODES.python.length);
      expect(step.codeLine.javascript).toBeLessThanOrEqual(MAX_PRODUCT_K_STAGE2_CODES.javascript.length);
    }

    expect(s2[s2.length - 1].currentProduct).toBe('144');
  });
});
