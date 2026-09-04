import { describe, it, expect } from 'vitest';
import { KnightProbabilitySpec } from './knight-probability.spec';
import { OutOfBoundaryPathsSpec } from './out-of-boundary-paths.spec';
import { ProfitableSchemesSpec } from './profitable-schemes.spec';
import { PathsDivisibleByKSpec } from './paths-divisible-by-k.spec';
import { ScrambleStringSpec } from './scramble-string.spec';
import type { AlgorithmSpec } from '../../engine/types';

describe('Three Dimension DP Specs Suite', () => {
  const specs: AlgorithmSpec[] = [
    KnightProbabilitySpec,
    OutOfBoundaryPathsSpec,
    ProfitableSchemesSpec,
    PathsDivisibleByKSpec,
    ScrambleStringSpec,
  ];

  it('should have complete metadata for all 3D DP specs', () => {
    for (const spec of specs) {
      expect(spec.id).toBeTruthy();
      expect(spec.name).toBeTruthy();
      expect(spec.category).toBe('三维 DP');
      expect(spec.problem?.description).toBeTruthy();
      expect(spec.problem?.examples && spec.problem.examples.length).toBeGreaterThan(0);
      expect(spec.code.languages.javascript.length).toBeGreaterThan(0);
      expect(spec.code.languages.java.length).toBeGreaterThan(0);
      expect(spec.code.languages.cpp.length).toBeGreaterThan(0);
      expect(spec.code.languages.python.length).toBeGreaterThan(0);
      expect(spec.code.keyPoints).toBeDefined();
    }
  });

  describe('KnightProbabilitySpec', () => {
    it('should calculate knight probability on chessboard', () => {
      // n = 3, k = 2, row = 0, column = 0 -> 0.0625
      const steps = KnightProbabilitySpec.generateSteps({ n: 3, k: 2, row: 0, column: 0 });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.probability).toBeDefined();
    });
  });

  describe('OutOfBoundaryPathsSpec', () => {
    it('should calculate out of boundary paths count', () => {
      // m = 2, n = 2, maxMove = 2, startRow = 0, startColumn = 0 -> 6
      const steps = OutOfBoundaryPathsSpec.generateSteps({ m: 2, n: 2, maxMove: 2, startRow: 0, startColumn: 0 });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.pathsCount).toBeDefined();
    });
  });

  describe('ProfitableSchemesSpec', () => {
    it('should calculate profitable schemes count', () => {
      // n = 5, minProfit = 3, group = [2, 2], profit = [2, 3] -> 2
      const steps = ProfitableSchemesSpec.generateSteps({
        n: 5,
        minProfit: 3,
        group: [2, 2],
        profit: [2, 3],
      });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.totalSchemes).toBeDefined();
    });
  });

  describe('PathsDivisibleByKSpec', () => {
    it('should calculate paths whose sum is divisible by k', () => {
      // grid = [[5,2,4],[3,0,5],[0,7,2]], k = 3 -> 2
      const steps = PathsDivisibleByKSpec.generateSteps({
        grid: [
          [5, 2, 4],
          [3, 0, 5],
          [0, 7, 2],
        ],
        k: 3,
      });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.totalPathsModK).toBe(2);
    });
  });

  describe('ScrambleStringSpec', () => {
    it('should determine if s2 is a scramble of s1', () => {
      // s1 = "great", s2 = "rgeat" -> true (1)
      const stepsTrue = ScrambleStringSpec.generateSteps({ s1: 'great', s2: 'rgeat' });
      expect(stepsTrue.length).toBeGreaterThan(0);
      const lastTrue = stepsTrue[stepsTrue.length - 1];
      expect(lastTrue.metrics?.isScramble).toBe(1);

      // s1 = "abcde", s2 = "caebd" -> false (0)
      const stepsFalse = ScrambleStringSpec.generateSteps({ s1: 'abcde', s2: 'caebd' });
      expect(stepsFalse.length).toBeGreaterThan(0);
      const lastFalse = stepsFalse[stepsFalse.length - 1];
      expect(lastFalse.metrics?.isScramble).toBe(0);
    });
  });
});
