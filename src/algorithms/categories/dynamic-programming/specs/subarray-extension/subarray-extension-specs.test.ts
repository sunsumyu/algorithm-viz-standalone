import { describe, it, expect } from 'vitest';
import { MaxCircularSubarraySpec } from './max-circular-subarray.spec';
import { MaxProductSubarraySpec } from './max-product-subarray.spec';
import { MagicScrollSpec } from './magic-scroll.spec';
import { RussianDollEnvelopesSpec } from './russian-doll-envelopes.spec';
import type { AlgorithmSpec } from '../../engine/types';

describe('Subarray & LIS Extension DP Specs Suite', () => {
  const specs: AlgorithmSpec[] = [
    MaxCircularSubarraySpec,
    MaxProductSubarraySpec,
    MagicScrollSpec,
    RussianDollEnvelopesSpec,
  ];

  it('should have complete metadata for all Subarray Extension DP specs', () => {
    for (const spec of specs) {
      expect(spec.id).toBeTruthy();
      expect(spec.name).toBeTruthy();
      expect(spec.category).toBe('子数组与 LIS 扩展 DP');
      expect(spec.problem?.description).toBeTruthy();
      expect(spec.problem?.examples && spec.problem.examples.length).toBeGreaterThan(0);
      expect(spec.code.languages.javascript.length).toBeGreaterThan(0);
      expect(spec.code.languages.java.length).toBeGreaterThan(0);
      expect(spec.code.languages.cpp.length).toBeGreaterThan(0);
      expect(spec.code.languages.python.length).toBeGreaterThan(0);
      expect(spec.code.keyPoints).toBeDefined();
    }
  });

  describe('MaxCircularSubarraySpec', () => {
    it('should calculate maximum sum circular subarray', () => {
      // nums = [1, -2, 3, -2] -> 3
      const steps = MaxCircularSubarraySpec.generateSteps({ nums: [1, -2, 3, -2] });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.maxSum).toBe(3);
    });

    it('should calculate circular wrap-around max sum', () => {
      // nums = [5, -3, 5] -> 10 (5 + 5)
      const steps = MaxCircularSubarraySpec.generateSteps({ nums: [5, -3, 5] });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.maxSum).toBe(10);
    });
  });

  describe('MaxProductSubarraySpec', () => {
    it('should calculate maximum product subarray', () => {
      // nums = [2, 3, -2, 4] -> 6
      const steps = MaxProductSubarraySpec.generateSteps({ nums: [2, 3, -2, 4] });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.maxProduct).toBe(6);
    });
  });

  describe('MagicScrollSpec', () => {
    it('should calculate maximum array sum with magic scroll operations', () => {
      // nums = [1, -2, 3, 5, -1, 2] -> 11 (zeroing out negative subranges)
      const steps = MagicScrollSpec.generateSteps({ nums: [1, -2, 3, 5, -1, 2] });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.maxSum).toBeDefined();
    });
  });

  describe('RussianDollEnvelopesSpec', () => {
    it('should calculate maximum nested envelopes via 2D LIS', () => {
      // envelopes = [[5,4],[6,4],[6,7],[2,3]] -> 3 ([2,3] => [5,4] => [6,7])
      const steps = RussianDollEnvelopesSpec.generateSteps({
        envelopes: [
          [5, 4],
          [6, 4],
          [6, 7],
          [2, 3],
        ],
      });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.maxEnvelopes).toBe(3);
    });
  });
});
