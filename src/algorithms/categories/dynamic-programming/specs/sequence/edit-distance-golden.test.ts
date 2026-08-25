import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../../../../../core/model-repository';
import { UniversalStageEngine } from '../../../../../core/universal-stage-engine';

/**
 * 🏆 [Golden Baseline Regression Guard]
 * 黄金基准守护测试：保护「编辑距离 (Edit Distance)」规范与推导引擎，严防非预期代码修改
 */
describe('🏆 Edit Distance Golden Baseline Regression Guard', () => {
  it('should guarantee edit-distance model integrity and metadata', () => {
    expect(AlgorithmModelRepository.hasModel('edit-distance')).toBe(true);
    const model = AlgorithmModelRepository.getModel('edit-distance');

    expect(model.id).toBe('edit-distance');
    expect(model.name).toBe('编辑距离');
    expect(model.category).toBe('dynamic-programming');
    expect(model.defaultParams?.word1).toBe('horse');
    expect(model.defaultParams?.word2).toBe('ros');
    expect(model.defaultStage).toBe('stage-1');
  });

  it('should guarantee all 4 complete evolution stages are defined', () => {
    const model = AlgorithmModelRepository.getModel('edit-distance');
    const stageIds = Object.keys(model.stages);

    expect(stageIds).toEqual(['stage-1', 'stage-2', 'stage-3', 'stage-4']);
    expect(model.stages['stage-1'].variants?.['standard']).toBeDefined();
    expect(model.stages['stage-2'].variants?.['standard']).toBeDefined();
    expect(model.stages['stage-3'].variants?.['standard']).toBeDefined();
    expect(model.stages['stage-4'].variants?.['rolling_1d']).toBeDefined();
  });

  it('should calculate edit distance correctly for "horse" and "ros" (result=3) across stages', () => {
    const model = AlgorithmModelRepository.getModel('edit-distance');

    // Stage 1 (Naive Recursion)
    const s1Steps = UniversalStageEngine.generateStage1or2Steps(model, 5, 3, 'forward', false);
    expect(s1Steps.length).toBeGreaterThan(0);
    const lastS1 = s1Steps[s1Steps.length - 1];
    expect(lastS1.log).toContain('3');

    // Stage 2 (Memoization)
    const s2Steps = UniversalStageEngine.generateStage1or2Steps(model, 5, 3, 'forward', true);
    expect(s2Steps.length).toBeGreaterThan(0);
    const cacheHit = s2Steps.find(s => s.type === 'cache-hit');
    expect(cacheHit).toBeDefined();
    const lastS2 = s2Steps[s2Steps.length - 1];
    expect(lastS2.log).toContain('3');

    // Stage 3 (2D DP Tabulation)
    const s3Steps = UniversalStageEngine.generateStage3Steps(model);
    expect(s3Steps.length).toBeGreaterThan(0);
    const lastS3 = s3Steps[s3Steps.length - 1];
    expect(lastS3.grid?.[5][3]).toBe(3);

    // Stage 4 (1D Rolling Space Compression)
    const s4Steps = UniversalStageEngine.generateStage4Steps(model);
    expect(s4Steps.length).toBeGreaterThan(0);
    const lastS4 = s4Steps[s4Steps.length - 1];
    expect(lastS4.memoj).toBe(3);
  });

  it('should calculate edit distance correctly for "intention" and "execution" (result=5)', () => {
    const model = AlgorithmModelRepository.getModel('edit-distance');
    const customModel = {
      ...model,
      defaultParams: { word1: 'intention', word2: 'execution', s: 'intention', t: 'execution' }
    };

    const s3Steps = UniversalStageEngine.generateStage3Steps(customModel);
    expect(s3Steps.length).toBeGreaterThan(0);
    const lastS3 = s3Steps[s3Steps.length - 1];
    expect(lastS3.grid?.[9][9]).toBe(5);

    const s4Steps = UniversalStageEngine.generateStage4Steps(customModel);
    expect(s4Steps.length).toBeGreaterThan(0);
    const lastS4 = s4Steps[s4Steps.length - 1];
    expect(lastS4.memoj).toBe(5);
  });
});
