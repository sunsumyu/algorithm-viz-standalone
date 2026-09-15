import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../../../../../core/model-repository';
import { AlgorithmStrategyRegistry } from '../../../../../core/strategies/algorithm-strategy-registry';
import { registerBuiltinStrategies } from '../../../../../core/strategies/index';

/**
 * 🏆 [Golden Baseline Regression Guard]
 * 黄金基准守护测试：保护「打家劫舍全系列 (House Robber I, II, III)」规范与推导引擎
 */
describe('🏆 House Robber Family Golden Baseline Regression Guard', () => {
  registerBuiltinStrategies();

  describe('House Robber I (LeetCode 198)', () => {
    it('should guarantee model integrity and metadata', () => {
      expect(AlgorithmModelRepository.hasModel('house-robber')).toBe(true);
      const model = AlgorithmModelRepository.getModel('house-robber');

      expect(model.id).toBe('house-robber');
      expect(model.name).toBe('打家劫舍');
      expect(model.category).toBe('dynamic-programming');
      expect(model.defaultParams).toEqual({ nums: [2, 7, 9, 3, 1] });
      expect(model.defaultStage).toBe('stage-1');
    });

    it('should guarantee all 4 complete evolution stages are defined', () => {
      const model = AlgorithmModelRepository.getModel('house-robber');
      const stageIds = Object.keys(model.stages);

      expect(stageIds).toEqual(['stage-1', 'stage-2', 'stage-3', 'stage-4']);
      expect(model.stages['stage-1'].variants?.['standard']).toBeDefined();
      expect(model.stages['stage-2'].variants?.['array_memo']).toBeDefined();
      expect(model.stages['stage-3'].variants?.['standard']).toBeDefined();
      expect(model.stages['stage-4'].variants?.['standard']).toBeDefined();
    });

    it('should generate valid steps across all 4 stages without freezing or skipping', () => {
      const model = AlgorithmModelRepository.getModel('house-robber');

      // Stage 1: Recursion
      const s1Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 1, isMemo: false });
      expect(s1Steps).toBeDefined();
      expect(s1Steps!.length).toBeGreaterThan(5);

      // Stage 2: Memoization
      const s2Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 2, isMemo: true });
      expect(s2Steps).toBeDefined();
      expect(s2Steps!.length).toBeGreaterThan(5);
      expect(s2Steps!.some(s => s.type === 'memo-hit')).toBe(true);

      // Stage 3: Tabulation 1D
      const s3Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 3 });
      expect(s3Steps).toBeDefined();
      expect(s3Steps!.length).toBeGreaterThanOrEqual(5);

      // Stage 4: Space Optimization O(1)
      const s4Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 4 });
      expect(s4Steps).toBeDefined();
      expect(s4Steps!.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('House Robber II (LeetCode 213)', () => {
    it('should guarantee model integrity and metadata', () => {
      expect(AlgorithmModelRepository.hasModel('house-robber-ii')).toBe(true);
      const model = AlgorithmModelRepository.getModel('house-robber-ii');

      expect(model.id).toBe('house-robber-ii');
      expect(model.name).toBe('打家劫舍 II');
      expect(model.category).toBe('dynamic-programming');
      expect(model.defaultStage).toBe('stage-1');
    });

    it('should generate steps correctly across stages', () => {
      const model = AlgorithmModelRepository.getModel('house-robber-ii');
      for (const stage of [1, 2, 3, 4]) {
        const steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage, isMemo: stage === 2 });
        expect(steps).toBeDefined();
        expect(steps!.length, `Stage ${stage} steps must be non-empty`).toBeGreaterThan(0);
      }
    });
  });

  describe('House Robber III (LeetCode 337)', () => {
    it('should guarantee model integrity and metadata', () => {
      expect(AlgorithmModelRepository.hasModel('house-robber-iii')).toBe(true);
      const model = AlgorithmModelRepository.getModel('house-robber-iii');

      expect(model.id).toBe('house-robber-iii');
      expect(model.name).toBe('打家劫舍 III');
      expect(model.category).toBe('dynamic-programming');
      expect(model.defaultStage).toBe('stage-1');
    });

    it('should generate tree DP steps correctly', () => {
      const model = AlgorithmModelRepository.getModel('house-robber-iii');
      const steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 1, isMemo: false });
      expect(steps).toBeDefined();
      expect(steps!.length).toBeGreaterThan(0);
    });
  });
});
