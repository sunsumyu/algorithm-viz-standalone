import { describe, it, expect } from 'vitest';
import { SuperEggDropSpec } from './super-egg-drop.spec';
import { SlidingWindowDpSpec } from './sliding-window-dp.spec';
import type { AlgorithmSpec } from '../../engine/types';

describe('Optimization & Observation DP Specs Suite', () => {
  const specs: AlgorithmSpec[] = [
    SuperEggDropSpec,
    SlidingWindowDpSpec,
  ];

  it('should have complete metadata for all Optimization DP specs', () => {
    for (const spec of specs) {
      expect(spec.id).toBeTruthy();
      expect(spec.name).toBeTruthy();
      expect(spec.category).toBe('优化与观察 DP');
      expect(spec.problem?.description).toBeTruthy();
      expect(spec.problem?.examples && spec.problem.examples.length).toBeGreaterThan(0);
      expect(spec.code.languages.javascript.length).toBeGreaterThan(0);
      expect(spec.code.languages.java.length).toBeGreaterThan(0);
      expect(spec.code.languages.cpp.length).toBeGreaterThan(0);
      expect(spec.code.languages.python.length).toBeGreaterThan(0);
      expect(spec.code.keyPoints).toBeDefined();
    }
  });

  describe('SuperEggDropSpec', () => {
    it('should calculate minimum moves to find critical floor with k eggs and n floors', () => {
      // k = 2, n = 6 -> 3
      const steps = SuperEggDropSpec.generateSteps({ k: 2, n: 6 });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.minMoves).toBe(3);
    });

    it('should handle single egg edge case', () => {
      // k = 1, n = 2 -> 2
      const steps = SuperEggDropSpec.generateSteps({ k: 1, n: 2 });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.minMoves).toBe(2);
    });
  });

  describe('SlidingWindowDpSpec', () => {
    it('should calculate max score jump game VI with monotonic queue optimization', () => {
      // nums = [1, -1, -2, 4, -7, 3], k = 2 -> 7 (1 -> -1 -> 4 -> 3 = 7)
      const steps = SlidingWindowDpSpec.generateSteps({ nums: [1, -1, -2, 4, -7, 3], k: 2 });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.maxScore).toBe(7);
    });
  });
});
