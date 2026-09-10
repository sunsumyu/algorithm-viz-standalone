import { describe, it, expect } from 'vitest';
import { CountDigitOneSpec } from './count-digit-one.spec';
import { NonNegativeConsecutiveOnesSpec } from './non-negative-consecutive-ones.spec';
import type { AlgorithmSpec } from '../../engine/types';

describe('Digit DP Specs Suite', () => {
  const specs: AlgorithmSpec[] = [
    CountDigitOneSpec,
    NonNegativeConsecutiveOnesSpec,
  ];

  it('should have complete metadata for all Digit DP specs', () => {
    for (const spec of specs) {
      expect(spec.id).toBeTruthy();
      expect(spec.name).toBeTruthy();
      expect(spec.category).toBe('数位 DP');
      expect(spec.problem?.description).toBeTruthy();
      expect(spec.problem?.examples && spec.problem.examples.length).toBeGreaterThan(0);
      expect(spec.code.languages.javascript.length).toBeGreaterThan(0);
      expect(spec.code.languages.java.length).toBeGreaterThan(0);
      expect(spec.code.languages.cpp.length).toBeGreaterThan(0);
      expect(spec.code.languages.python.length).toBeGreaterThan(0);
      expect(spec.code.keyPoints).toBeDefined();
    }
  });

  describe('CountDigitOneSpec', () => {
    it('should calculate total occurrences of digit 1 up to n', () => {
      // n = 13 -> 6 (1, 10, 11, 12, 13, note that 11 has two 1s)
      const steps = CountDigitOneSpec.generateSteps({ n: 13 });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.totalOnes).toBe(6);
    });
  });

  describe('NonNegativeConsecutiveOnesSpec', () => {
    it('should calculate count of non-negative integers <= n without consecutive ones', () => {
      // n = 5 -> 5 (0:000, 1:001, 2:010, 3:011[x], 4:100, 5:101)
      const steps = NonNegativeConsecutiveOnesSpec.generateSteps({ n: 5 });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.validCount).toBe(5);
    });
  });
});
