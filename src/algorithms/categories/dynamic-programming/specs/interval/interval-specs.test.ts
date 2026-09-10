import { describe, it, expect } from 'vitest';
import { MergeStonesSpec } from './merge-stones.spec';
import { BurstBalloonsSpec } from './burst-balloons.spec';
import { PredictTheWinnerSpec } from './predict-the-winner.spec';
import { MinScoreTriangulationSpec } from './min-score-triangulation.spec';
import { StrangePrinterSpec } from './strange-printer.spec';
import type { AlgorithmSpec } from '../../engine/types';

describe('Interval DP Specs Suite', () => {
  const specs: AlgorithmSpec[] = [
    MergeStonesSpec,
    BurstBalloonsSpec,
    PredictTheWinnerSpec,
    MinScoreTriangulationSpec,
    StrangePrinterSpec,
  ];

  it('should have complete metadata for all interval DP specs', () => {
    for (const spec of specs) {
      expect(spec.id).toBeTruthy();
      expect(spec.name).toBeTruthy();
      expect(spec.category).toBe('区间 DP');
      expect(spec.problem.description).toBeTruthy();
      expect(spec.problem.examples && spec.problem.examples.length).toBeGreaterThan(0);
      expect(spec.code.languages.javascript.length).toBeGreaterThan(0);
      expect(spec.code.languages.java.length).toBeGreaterThan(0);
      expect(spec.code.languages.cpp.length).toBeGreaterThan(0);
      expect(spec.code.languages.python.length).toBeGreaterThan(0);
      expect(spec.code.keyPoints).toBeDefined();
      expect(spec.code.faqList && spec.code.faqList.length).toBeGreaterThan(0);
    }
  });

  describe('MergeStonesSpec', () => {
    it('should generate valid DP steps for stone merging', () => {
      const steps = MergeStonesSpec.generateSteps({ stones: [3, 2, 4, 1] });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.message).toContain('合并');
      expect(lastStep.dp2d).toBeDefined();
    });
  });

  describe('BurstBalloonsSpec', () => {
    it('should compute optimal balloon bursting score', () => {
      const steps = BurstBalloonsSpec.generateSteps({ nums: [3, 1, 5, 8] });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.dp2d).toBeDefined();
      // LeetCode 312: [3,1,5,8] -> 167
      expect(lastStep.metrics?.maxCoins).toBe(167);
    });
  });

  describe('PredictTheWinnerSpec', () => {
    it('should evaluate whether player 1 can win', () => {
      const steps = PredictTheWinnerSpec.generateSteps({ nums: [1, 5, 2] });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.dp2d).toBeDefined();
      expect(lastStep.metrics?.canWin).toBe(false);
    });
  });

  describe('MinScoreTriangulationSpec', () => {
    it('should calculate minimum score triangulation of polygon', () => {
      const steps = MinScoreTriangulationSpec.generateSteps({ values: [1, 2, 3] });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.dp2d).toBeDefined();
      expect(lastStep.metrics?.minScore).toBe(6);
    });
  });

  describe('StrangePrinterSpec', () => {
    it('should calculate minimum turns for strange printer', () => {
      const steps = StrangePrinterSpec.generateSteps({ s: 'aaabbb' });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.dp2d).toBeDefined();
      expect(lastStep.metrics?.minTurns).toBe(2);
    });
  });
});
