import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../../../../../core/model-repository';
import { UniversalStageEngine } from '../../../../../core/universal-stage-engine';

/**
 * 🏆 [Golden Baseline Regression Guard]
 * 黄金基准守护测试：保护「分割等和子集 (Partition Equal Subset Sum)」规范与推导引擎，严防非预期代码修改
 */
describe('🏆 Partition Equal Subset Sum Golden Baseline Regression Guard', () => {
  it('should guarantee partition-equal-subset-sum model integrity and metadata', () => {
    expect(AlgorithmModelRepository.hasModel('partition-equal-subset-sum')).toBe(true);
    const model = AlgorithmModelRepository.getModel('partition-equal-subset-sum');

    expect(model.id).toBe('partition-equal-subset-sum');
    expect(model.name).toBe('分割等和子集');
    expect(model.category).toBe('dynamic-programming');
    expect(model.defaultParams?.nums).toEqual([1, 5, 11, 5]);
    expect(model.defaultStage).toBe('stage-1');
  });

  it('should guarantee all 4 complete evolution stages are defined', () => {
    const model = AlgorithmModelRepository.getModel('partition-equal-subset-sum');
    const stageIds = Object.keys(model.stages);

    expect(stageIds).toEqual(['stage-1', 'stage-2', 'stage-3', 'stage-4']);
    expect(model.stages['stage-1'].variants?.['standard']).toBeDefined();
    expect(model.stages['stage-2'].variants?.['standard']).toBeDefined();
    expect(model.stages['stage-3'].variants?.['standard']).toBeDefined();
    expect(model.stages['stage-4'].variants?.['rolling_1d']).toBeDefined();
  });

  it('should correctly partition [1, 5, 11, 5] (result=true, target=11) across all stages', () => {
    const model = AlgorithmModelRepository.getModel('partition-equal-subset-sum');

    // Stage 1 (Decision Tree DFS)
    const s1Steps = UniversalStageEngine.generateStage1or2Steps(model, 4, 12, 'forward', false);
    expect(s1Steps.length).toBeGreaterThan(0);
    const lastS1 = s1Steps[s1Steps.length - 1];
    expect(lastS1.log).toContain('true');

    // Stage 2 (Memoization)
    const s2Steps = UniversalStageEngine.generateStage1or2Steps(model, 4, 12, 'forward', true);
    expect(s2Steps.length).toBeGreaterThan(0);
    const lastS2 = s2Steps[s2Steps.length - 1];
    expect(lastS2.log).toContain('true');

    // Stage 3 (2D 0-1 Knapsack Tabulation)
    const s3Steps = UniversalStageEngine.generateStage3Steps(model);
    expect(s3Steps.length).toBeGreaterThan(0);
    const lastS3 = s3Steps[s3Steps.length - 1];
    expect(lastS3.log).toContain('true');
    expect(lastS3.grid?.[3][11]).toBe(11);

    // Stage 4 (1D Rolling Space Compression)
    const s4Steps = UniversalStageEngine.generateStage4Steps(model);
    expect(s4Steps.length).toBeGreaterThan(0);
    const lastS4 = s4Steps[s4Steps.length - 1];
    expect(lastS4.log).toContain('true');
    expect(lastS4.memoj).toBe(11);
  });

  it('should return false for [1, 2, 3, 5] (odd sum=11)', () => {
    const model = AlgorithmModelRepository.getModel('partition-equal-subset-sum');
    const customModel = {
      ...model,
      defaultParams: { nums: [1, 2, 3, 5] }
    };

    // Stage 1 (Odd check)
    const s1Steps = UniversalStageEngine.generateStage1or2Steps(customModel, 4, 6, 'forward', false);
    expect(s1Steps.length).toBeGreaterThan(0);
    const lastS1 = s1Steps[s1Steps.length - 1];
    expect(lastS1.log).toContain('false');

    // Stage 3 (Odd check)
    const s3Steps = UniversalStageEngine.generateStage3Steps(customModel);
    expect(s3Steps.length).toBeGreaterThan(0);
    const lastS3 = s3Steps[s3Steps.length - 1];
    expect(lastS3.log).toContain('false');

    // Stage 4 (Odd check)
    const s4Steps = UniversalStageEngine.generateStage4Steps(customModel);
    expect(s4Steps.length).toBeGreaterThan(0);
    const lastS4 = s4Steps[s4Steps.length - 1];
    expect(lastS4.log).toContain('false');
  });

  it('should return false for even sum but unpartitionable array [1, 2, 5] (sum=8, target=4)', () => {
    const model = AlgorithmModelRepository.getModel('partition-equal-subset-sum');
    const customModel = {
      ...model,
      defaultParams: { nums: [1, 2, 5] }
    };

    // Stage 1 (Decision Tree DFS)
    const s1Steps = UniversalStageEngine.generateStage1or2Steps(customModel, 3, 5, 'forward', false);
    expect(s1Steps.length).toBeGreaterThan(0);
    const lastS1 = s1Steps[s1Steps.length - 1];
    expect(lastS1.log).toContain('false');

    // Stage 3 (2D DP)
    const s3Steps = UniversalStageEngine.generateStage3Steps(customModel);
    expect(s3Steps.length).toBeGreaterThan(0);
    const lastS3 = s3Steps[s3Steps.length - 1];
    expect(lastS3.log).toContain('false');

    // Stage 4 (1D Compression)
    const s4Steps = UniversalStageEngine.generateStage4Steps(customModel);
    expect(s4Steps.length).toBeGreaterThan(0);
    const lastS4 = s4Steps[s4Steps.length - 1];
    expect(lastS4.log).toContain('false');
    expect(lastS4.memoj).toBeLessThan(4);
  });
});
