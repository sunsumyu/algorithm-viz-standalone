import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../../../../../core/model-repository';
import { AlgorithmStrategyRegistry } from '../../../../../core/strategies/algorithm-strategy-registry';
import { registerBuiltinStrategies } from '../../../../../core/strategies/index';

/**
 * 🏆 [Golden Baseline Regression Guard]
 * 黄金基准守护测试：保护「买卖股票全系列状态机 DP (Stock I, II, III)」规范与推导引擎
 */
describe('🏆 Stock Trading Family Golden Baseline Regression Guard', () => {
  registerBuiltinStrategies();

  describe('Stock I: Best Time to Buy and Sell Stock (LeetCode 121)', () => {
    it('should guarantee model integrity and metadata', () => {
      expect(AlgorithmModelRepository.hasModel('best-time-to-buy-and-sell-stock')).toBe(true);
      const model = AlgorithmModelRepository.getModel('best-time-to-buy-and-sell-stock');

      expect(model.id).toBe('best-time-to-buy-and-sell-stock');
      expect(model.name).toBe('买卖股票的最佳时机');
      expect(model.category).toBe('dynamic-programming');
      expect(model.defaultParams).toEqual({ prices: [7, 1, 5, 3, 6, 4] });
      expect(model.defaultStage).toBe('stage-1');
    });

    it('should guarantee all 4 complete evolution stages are defined', () => {
      const model = AlgorithmModelRepository.getModel('best-time-to-buy-and-sell-stock');
      const stageIds = Object.keys(model.stages);

      expect(stageIds).toEqual(['stage-1', 'stage-2', 'stage-3', 'stage-4']);
      expect(model.stages['stage-1'].variants?.['standard']).toBeDefined();
      expect(model.stages['stage-2'].variants?.['array_memo']).toBeDefined();
      expect(model.stages['stage-3'].variants?.['standard']).toBeDefined();
      expect(model.stages['stage-4'].variants?.['standard']).toBeDefined();
    });

    it('should generate valid steps across all 4 stages without freezing or skipping', () => {
      const model = AlgorithmModelRepository.getModel('best-time-to-buy-and-sell-stock');

      // Stage 1: Recursion
      const s1Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 1, isMemo: false });
      expect(s1Steps).toBeDefined();
      expect(s1Steps!.length).toBeGreaterThan(5);

      // Stage 2: Memoization
      const s2Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 2, isMemo: true });
      expect(s2Steps).toBeDefined();
      expect(s2Steps!.length).toBeGreaterThan(5);
      expect(s2Steps!.some(s => s.type === 'memo-hit')).toBe(true);

      // Stage 3: Tabulation 2D
      const s3Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 3 });
      expect(s3Steps).toBeDefined();
      expect(s3Steps!.length).toBeGreaterThanOrEqual(5);
      expect(s3Steps!.some(s => s.type === 'loop')).toBe(true);

      // Stage 4: Space Optimization O(1)
      const s4Steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage: 4 });
      expect(s4Steps).toBeDefined();
      expect(s4Steps!.length).toBeGreaterThanOrEqual(5);
      expect(s4Steps!.some(s => s.type === 'loop')).toBe(true);
    });
  });

  describe('Stock II: Best Time to Buy and Sell Stock II (LeetCode 122)', () => {
    it('should guarantee model integrity and metadata', () => {
      expect(AlgorithmModelRepository.hasModel('best-time-to-buy-and-sell-stock-ii')).toBe(true);
      const model = AlgorithmModelRepository.getModel('best-time-to-buy-and-sell-stock-ii');

      expect(model.id).toBe('best-time-to-buy-and-sell-stock-ii');
      expect(model.name).toBe('买卖股票的最佳时机 II');
      expect(model.category).toBe('dynamic-programming');
      expect(model.defaultStage).toBe('stage-1');
    });

    it('should generate valid steps across all 4 stages without freezing or skipping', () => {
      const model = AlgorithmModelRepository.getModel('best-time-to-buy-and-sell-stock-ii');

      for (const stage of [1, 2, 3, 4]) {
        const steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage, isMemo: stage === 2 });
        expect(steps).toBeDefined();
        expect(steps!.length, `Stage ${stage} steps must be non-empty`).toBeGreaterThan(5);
      }
    });
  });

  describe('Stock III: Best Time to Buy and Sell Stock III (LeetCode 123)', () => {
    it('should guarantee model integrity and metadata', () => {
      expect(AlgorithmModelRepository.hasModel('best-time-to-buy-and-sell-stock-iii')).toBe(true);
      const model = AlgorithmModelRepository.getModel('best-time-to-buy-and-sell-stock-iii');

      expect(model.id).toBe('best-time-to-buy-and-sell-stock-iii');
      expect(model.name).toBe('买卖股票的最佳时机 III');
      expect(model.category).toBe('dynamic-programming');
      expect(model.defaultStage).toBe('stage-1');
    });

    it('should generate valid steps across all 4 stages', () => {
      const model = AlgorithmModelRepository.getModel('best-time-to-buy-and-sell-stock-iii');

      for (const stage of [1, 2, 3, 4]) {
        const steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage, isMemo: stage === 2 });
        expect(steps).toBeDefined();
        expect(steps!.length, `Stage ${stage} steps must be non-empty`).toBeGreaterThan(5);
      }
    });
  });
});
