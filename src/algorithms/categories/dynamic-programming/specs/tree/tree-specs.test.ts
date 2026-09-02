import { describe, it, expect } from 'vitest';
import { MaxDistanceInTreeSpec } from './max-distance-in-tree.spec';
import { LargestBstSubtreeSpec } from './largest-bst-subtree.spec';
import { MaxPathSumSpec } from './max-path-sum.spec';
import { TreeDiameterSpec } from './tree-diameter.spec';
import { BinaryTreeCamerasSpec } from './binary-tree-cameras.spec';
import { CourseSelectionSpec } from './course-selection.spec';
import { MinimumFuelCostSpec } from './minimum-fuel-cost.spec';
import { LongestPathDifferentCharactersSpec } from './longest-path-different-characters.spec';
import { PartyWithoutBossSpec } from './party-without-boss.spec';
import { HeightRemovalQueriesSpec } from './height-removal-queries.spec';
import { MinimumScoreAfterRemovalsSpec } from './minimum-score-after-removals.spec';
import type { AlgorithmSpec } from '../../engine/types';
import { TreeDpStrategy } from '../../../../../core/strategies/tree-dp-strategy';
import { AlgorithmModelRepository } from '../../../../../core/model-repository';

describe('Tree DP Specs Suite', () => {
  const specs: AlgorithmSpec[] = [
    MaxDistanceInTreeSpec,
    LargestBstSubtreeSpec,
    MaxPathSumSpec,
    TreeDiameterSpec,
    BinaryTreeCamerasSpec,
    CourseSelectionSpec,
    MinimumFuelCostSpec,
    LongestPathDifferentCharactersSpec,
    PartyWithoutBossSpec,
    HeightRemovalQueriesSpec,
    MinimumScoreAfterRemovalsSpec,
  ];

  it('should have complete metadata for all Tree DP specs', () => {
    for (const spec of specs) {
      expect(spec.id).toBeTruthy();
      expect(spec.name).toBeTruthy();
      expect(spec.category).toBe('树型 DP');
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

  describe('MaxPathSumSpec', () => {
    it('should calculate binary tree maximum path sum', () => {
      // Tree: [-10, 9, 20, null, null, 15, 7] -> 42 (15 + 20 + 7)
      const steps = MaxPathSumSpec.generateSteps({ root: [-10, 9, 20, null, null, 15, 7] });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.maxPathSum).toBe(42);
    });
  });

  describe('BinaryTreeCamerasSpec', () => {
    it('should calculate minimum cameras to monitor tree', () => {
      // Tree: [0, 0, null, 0, 0] -> 1
      const steps = BinaryTreeCamerasSpec.generateSteps({ root: [0, 0, null, 0, 0] });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.cameras).toBe(1);
    });
  });

  describe('TreeDiameterSpec', () => {
    it('should calculate tree diameter length', () => {
      // Tree: [1, 2, 3, 4, 5] -> 3
      const steps = TreeDiameterSpec.generateSteps({ root: [1, 2, 3, 4, 5] });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.diameter).toBe(3);
    });
  });

  describe('CourseSelectionSpec', () => {
    it('should solve tree knapsack course selection', () => {
      // Courses: 3 courses, max 2 to choose. Prerequisites tree.
      const steps = CourseSelectionSpec.generateSteps({
        n: 3,
        m: 2,
        courses: [
          { id: 1, cost: 1, score: 2, parent: 0 },
          { id: 2, cost: 1, score: 3, parent: 1 },
          { id: 3, cost: 1, score: 4, parent: 0 },
        ],
      });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.maxScore).toBe(6); // choose course 1 (2) + course 3 (4) = 6
    });
  });

  describe('MaxDistanceInTreeSpec', () => {
    it('should compute maximum distance in tree', () => {
      const steps = MaxDistanceInTreeSpec.generateSteps({ root: [1, 2, 3, 4, 5] });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.maxDistance).toBe(3);
    });
  });

  describe('PartyWithoutBossSpec', () => {
    it('should compute maximum party happiness', () => {
      const steps = PartyWithoutBossSpec.generateSteps({
        n: 3,
        happy: [4, 5, 6],
        edges: [
          [1, 0],
          [2, 0],
        ],
      });
      expect(steps.length).toBeGreaterThan(0);
    });
  });

  describe('HeightRemovalQueriesSpec', () => {
    it('should compute tree height after removing subtrees', () => {
      // Tree: [1, 3, 4, 2, null, 6, 5, null, null, null, null, null, 7], queries: [4]
      // Removing subtree at 4 leaves root 1, child 3, child 2 -> max height = 2
      const steps = HeightRemovalQueriesSpec.generateSteps({
        root: [1, 3, 4, 2, null, 6, 5, null, null, null, null, null, 7],
        queries: [4],
      });
      expect(steps.length).toBeGreaterThan(0);
      const queryStep = steps.find((s) => s.metrics?.currentQuery === 4);
      expect(queryStep?.metrics?.treeHeight).toBe(2);
    });

    it('TreeDpStrategy 生成的步骤行号必须严格在 Java 代码合法行内，且第 3 步对应 return ans', () => {
      const model = AlgorithmModelRepository.getModel('height-removal-queries');
      const compiled = AlgorithmModelRepository.getCompiledStage('height-removal-queries', 'stage-3', 'forward');
      const strategy = new TreeDpStrategy('height-removal-queries');
      const steps = strategy.generateSteps(model, {
        stage: 3,
        m: 6,
        n: 6,
        anchorMap: compiled.anchorMap || compiled.variants?.standard?.anchorMap,
      });

      expect(steps.length).toBeGreaterThanOrEqual(70);
      const javaTotalLines = HeightRemovalQueriesSpec.code.languages.java.length;
      expect(javaTotalLines).toBe(28);

      for (const s of steps) {
        expect(s.line).toBeGreaterThan(0);
        expect(s.line).toBeLessThanOrEqual(javaTotalLines);
      }

      // Step 1: entry (8)
      expect(steps[0].line).toBe(8);
      // Last Step: return ans (19)
      expect(steps[steps.length - 1].line).toBe(19);
    });
  });

  describe('MinimumScoreAfterRemovalsSpec', () => {
    it('should compute minimum score after removing two edges', () => {
      // nums = [1, 5, 5, 4, 11], edges = [[0, 1], [1, 2], [1, 3], [3, 4]] -> score = 9
      const steps = MinimumScoreAfterRemovalsSpec.generateSteps({
        nums: [1, 5, 5, 4, 11],
        edges: [
          [0, 1],
          [1, 2],
          [1, 3],
          [3, 4],
        ],
      });
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.minScore).toBe(9);
    });

    it('TreeDpStrategy 生成的步骤行号必须严格在 Java 代码合法行内 (LC 2322)', () => {
      const model = AlgorithmModelRepository.getModel('minimum-score-after-removals');
      const compiled = AlgorithmModelRepository.getCompiledStage('minimum-score-after-removals', 'stage-3', 'forward');
      const strategy = new TreeDpStrategy('minimum-score-after-removals');
      const steps = strategy.generateSteps(model, {
        stage: 3,
        m: 5,
        n: 5,
        anchorMap: compiled.anchorMap || compiled.variants?.standard?.anchorMap,
      });

      expect(steps.length).toBe(3);
      const javaTotalLines = MinimumScoreAfterRemovalsSpec.code.languages.java.length;
      expect(javaTotalLines).toBe(45);

      for (const s of steps) {
        expect(s.line).toBeGreaterThan(0);
        expect(s.line).toBeLessThanOrEqual(javaTotalLines);
      }

      expect(steps[0].line).toBe(3);
      expect(steps[1].line).toBe(31);
      expect(steps[2].line).toBe(34);
    });
  });
});

