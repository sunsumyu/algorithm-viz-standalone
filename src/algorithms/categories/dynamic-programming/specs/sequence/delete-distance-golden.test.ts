import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../../../../../core/model-repository';
import { UniversalStageEngine } from '../../../../../core/universal-stage-engine';

/**
 * 🏆 [Golden Baseline Regression Guard]
 * 黄金基准守护测试：保护「两个字符串的删除操作 (Delete Operation for Two Strings)」规范与推导引擎，严防非预期代码修改
 */
describe('🏆 Delete Operation for Two Strings Golden Baseline Regression Guard', () => {
  it('should guarantee delete-operation-for-two-strings model integrity and metadata', () => {
    expect(AlgorithmModelRepository.hasModel('delete-operation-for-two-strings')).toBe(true);
    const model = AlgorithmModelRepository.getModel('delete-operation-for-two-strings');

    expect(model.id).toBe('delete-operation-for-two-strings');
    expect(model.name).toBe('两个字符串的删除操作');
    expect(model.category).toBe('dynamic-programming');
    expect(model.defaultParams?.word1).toBe('sea');
    expect(model.defaultParams?.word2).toBe('eat');
    expect(model.defaultStage).toBe('stage-1');
  });

  it('should guarantee all 4 complete evolution stages are defined', () => {
    const model = AlgorithmModelRepository.getModel('delete-operation-for-two-strings');
    const stageIds = Object.keys(model.stages);

    expect(stageIds).toEqual(['stage-1', 'stage-2', 'stage-3', 'stage-4']);
    expect(model.stages['stage-1'].variants?.['standard']).toBeDefined();
    expect(model.stages['stage-2'].variants?.['standard']).toBeDefined();
    expect(model.stages['stage-3'].variants?.['standard']).toBeDefined();
    expect(model.stages['stage-4'].variants?.['rolling_1d']).toBeDefined();
  });

  it('should calculate minimum deletion steps correctly for "sea" and "eat" (result=2) across stages', () => {
    const model = AlgorithmModelRepository.getModel('delete-operation-for-two-strings');

    // Stage 1 (Naive Recursion)
    const s1Steps = UniversalStageEngine.generateStage1or2Steps(model, 3, 3, 'forward', false);
    expect(s1Steps.length).toBeGreaterThan(0);
    const lastS1 = s1Steps[s1Steps.length - 1];
    expect(lastS1.log).toContain('2');

    // Stage 2 (Memoization)
    const s2Steps = UniversalStageEngine.generateStage1or2Steps(model, 3, 3, 'forward', true);
    expect(s2Steps.length).toBeGreaterThan(0);
    const cacheHit = s2Steps.find(s => s.type === 'cache-hit');
    expect(cacheHit).toBeDefined();
    const lastS2 = s2Steps[s2Steps.length - 1];
    expect(lastS2.log).toContain('2');

    // Stage 3 (2D DP Tabulation)
    const s3Steps = UniversalStageEngine.generateStage3Steps(model);
    expect(s3Steps.length).toBeGreaterThan(0);
    const lastS3 = s3Steps[s3Steps.length - 1];
    expect(lastS3.grid?.[3][3]).toBe(2);

    // Stage 4 (1D Rolling Space Compression)
    const s4Steps = UniversalStageEngine.generateStage4Steps(model);
    expect(s4Steps.length).toBeGreaterThan(0);
    const lastS4 = s4Steps[s4Steps.length - 1];
    expect(lastS4.memoj).toBe(2);
  });

  it('should calculate minimum deletion steps correctly for "leetcode" and "etco" (result=4)', () => {
    const model = AlgorithmModelRepository.getModel('delete-operation-for-two-strings');
    const customModel = {
      ...model,
      defaultParams: { word1: 'leetcode', word2: 'etco', s: 'leetcode', t: 'etco' }
    };

    const s3Steps = UniversalStageEngine.generateStage3Steps(customModel);
    expect(s3Steps.length).toBeGreaterThan(0);
    const lastS3 = s3Steps[s3Steps.length - 1];
    expect(lastS3.grid?.[8][4]).toBe(4);

    const s4Steps = UniversalStageEngine.generateStage4Steps(customModel);
    expect(s4Steps.length).toBeGreaterThan(0);
    const lastS4 = s4Steps[s4Steps.length - 1];
    expect(lastS4.memoj).toBe(4);
  });
});
