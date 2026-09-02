import { describe, it, expect } from 'vitest';
import { CanIWinSpec } from './can-i-win.spec';
import { MatchsticksToSquareSpec } from './matchsticks-to-square.spec';
import { PartitionKEqualSubsetsSpec } from './partition-k-equal-subsets.spec';
import { TspBitmaskDpSpec } from './tsp-bitmask-dp.spec';
import { NumberOfWaysWearHatsSpec } from './number-of-ways-wear-hats.spec';
import { OptimalAccountBalancingSpec } from './optimal-account-balancing.spec';
import { GoodSubsetsSpec } from './good-subsets.spec';
import { DistributeRepeatingIntegersSpec } from './distribute-repeating-integers.spec';
import type { AlgorithmSpec } from '../../engine/types';

describe('Bitmask DP Specs Suite', () => {
  const specs: AlgorithmSpec[] = [
    CanIWinSpec,
    MatchsticksToSquareSpec,
    PartitionKEqualSubsetsSpec,
    TspBitmaskDpSpec,
    NumberOfWaysWearHatsSpec,
    OptimalAccountBalancingSpec,
    GoodSubsetsSpec,
    DistributeRepeatingIntegersSpec,
  ];

  it('should have complete metadata for all Bitmask DP specs', () => {
    for (const spec of specs) {
      expect(spec.id).toBeTruthy();
      expect(spec.name).toBeTruthy();
      expect(spec.category).toBe('状压 DP');
      expect(spec.problem.description).toBeTruthy();
      expect(spec.problem.examples && spec.problem.examples.length).toBeGreaterThan(0);
      expect(spec.code.languages.javascript.length).toBeGreaterThan(0);
      expect(spec.code.languages.java.length).toBeGreaterThan(0);
      expect(spec.code.languages.cpp.length).toBeGreaterThan(0);
      expect(spec.code.languages.python.length).toBeGreaterThan(0);
      expect(spec.code.keyPoints).toBeDefined();
    }
  });

  describe('CanIWinSpec', () => {
    it('should generate steps for Can I Win', () => {
      const steps = CanIWinSpec.generateSteps({ n: 4, m: 6 });
      expect(steps.length).toBeGreaterThan(0);
    });
  });

  describe('MatchsticksToSquareSpec', () => {
    it('should generate steps for Matchsticks to Square', () => {
      const steps = MatchsticksToSquareSpec.generateSteps({ matchsticks: [1, 1, 2, 2, 2] });
      expect(steps.length).toBeGreaterThan(0);
    });
  });

  describe('PartitionKEqualSubsetsSpec', () => {
    it('should generate steps for Partition to K Equal Sum Subsets', () => {
      const steps = PartitionKEqualSubsetsSpec.generateSteps({ nums: [4, 3, 2, 3, 5, 2, 1], k: 4 });
      expect(steps.length).toBeGreaterThan(0);
    });
  });

  describe('TspBitmaskDpSpec', () => {
    it('should generate steps for TSP Bitmask DP', () => {
      const steps = TspBitmaskDpSpec.generateSteps({
        n: 4,
        graph: [
          [0, 10, 15, 20],
          [10, 0, 35, 25],
          [15, 35, 0, 30],
          [20, 25, 30, 0],
        ],
      });
      expect(steps.length).toBeGreaterThan(0);
    });
  });

  describe('NumberOfWaysWearHatsSpec', () => {
    it('should generate steps for Number of Ways to Wear Hats', () => {
      const steps = NumberOfWaysWearHatsSpec.generateSteps({
        hats: [[3, 4], [4, 5], [5]],
      });
      expect(steps.length).toBeGreaterThan(0);
    });
  });

  describe('OptimalAccountBalancingSpec', () => {
    it('should generate steps for Optimal Account Balancing', () => {
      const steps = OptimalAccountBalancingSpec.generateSteps({
        transactions: [
          [0, 1, 10],
          [2, 0, 5],
        ],
      });
      expect(steps.length).toBeGreaterThan(0);
    });
  });

  describe('GoodSubsetsSpec', () => {
    it('should generate steps for Good Subsets', () => {
      const steps = GoodSubsetsSpec.generateSteps({
        nums: [4, 2, 3, 15],
      });
      expect(steps.length).toBeGreaterThan(0);
    });
  });

  describe('DistributeRepeatingIntegersSpec', () => {
    it('should generate steps for Distribute Repeating Integers', () => {
      const steps = DistributeRepeatingIntegersSpec.generateSteps({
        nums: [1, 2, 3, 4],
        quantity: [2],
      });
      expect(steps.length).toBeGreaterThan(0);
    });
  });
});
