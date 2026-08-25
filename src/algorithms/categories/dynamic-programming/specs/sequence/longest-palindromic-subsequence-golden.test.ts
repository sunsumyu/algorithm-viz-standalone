import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../../../../../core/model-repository';
import { UniversalStageEngine } from '../../../../../core/universal-stage-engine';

/**
 * 🏆 [Golden Baseline Regression Guard]
 * 黄金基准守护测试：保护「最长回文子序列 (Longest Palindromic Subsequence)」规范与推导引擎，严防非预期代码修改
 */
describe('🏆 Longest Palindromic Subsequence Golden Baseline Regression Guard', () => {
  it('should guarantee longest-palindromic-subsequence model integrity and metadata', () => {
    expect(AlgorithmModelRepository.hasModel('longest-palindromic-subsequence')).toBe(true);
    const model = AlgorithmModelRepository.getModel('longest-palindromic-subsequence');

    expect(model.id).toBe('longest-palindromic-subsequence');
    expect(model.name).toBe('最长回文子序列');
    expect(model.category).toBe('dynamic-programming');
    expect(model.defaultParams?.s).toBe('bbbab');
    expect(model.defaultStage).toBe('stage-1');
  });

  it('should guarantee all 4 complete evolution stages are defined', () => {
    const model = AlgorithmModelRepository.getModel('longest-palindromic-subsequence');
    const stageIds = Object.keys(model.stages);

    expect(stageIds).toEqual(['stage-1', 'stage-2', 'stage-3', 'stage-4']);
    expect(model.stages['stage-1'].variants?.['standard']).toBeDefined();
    expect(model.stages['stage-2'].variants?.['standard']).toBeDefined();
    expect(model.stages['stage-3'].variants?.['standard']).toBeDefined();
    expect(model.stages['stage-4'].variants?.['rolling_1d']).toBeDefined();
  });

  it('should calculate longest palindromic subsequence correctly for "bbbab" (result=4) across stages', () => {
    const model = AlgorithmModelRepository.getModel('longest-palindromic-subsequence');

    // Stage 1 (Interval Recursion)
    const s1Steps = UniversalStageEngine.generateStage1or2Steps(model, 5, 5, 'forward', false);
    expect(s1Steps.length).toBeGreaterThan(0);
    const lastS1 = s1Steps[s1Steps.length - 1];
    expect(lastS1.log).toContain('4');

    // Stage 2 (Memoization)
    const s2Steps = UniversalStageEngine.generateStage1or2Steps(model, 5, 5, 'forward', true);
    expect(s2Steps.length).toBeGreaterThan(0);
    const lastS2 = s2Steps[s2Steps.length - 1];
    expect(lastS2.log).toContain('4');

    // Stage 3 (2D Upper Triangular DP Tabulation)
    const s3Steps = UniversalStageEngine.generateStage3Steps(model);
    expect(s3Steps.length).toBeGreaterThan(0);
    const lastS3 = s3Steps[s3Steps.length - 1];
    expect(lastS3.grid?.[0][4]).toBe(4);

    // Stage 4 (1D Rolling Space Compression)
    const s4Steps = UniversalStageEngine.generateStage4Steps(model);
    expect(s4Steps.length).toBeGreaterThan(0);
    const lastS4 = s4Steps[s4Steps.length - 1];
    expect(lastS4.memoj).toBe(4);
  });

  it('should verify memoization cache hit on overlapping subproblems for "abcde" (result=1)', () => {
    const model = AlgorithmModelRepository.getModel('longest-palindromic-subsequence');
    const customModel = {
      ...model,
      defaultParams: { s: 'abcde' }
    };

    const s2Steps = UniversalStageEngine.generateStage1or2Steps(customModel, 5, 5, 'forward', true);
    expect(s2Steps.length).toBeGreaterThan(0);
    const cacheHit = s2Steps.find(s => s.type === 'cache-hit');
    expect(cacheHit).toBeDefined();
    const lastS2 = s2Steps[s2Steps.length - 1];
    expect(lastS2.log).toContain('1');
  });

  it('should calculate longest palindromic subsequence correctly for "cbbd" (result=2)', () => {
    const model = AlgorithmModelRepository.getModel('longest-palindromic-subsequence');
    const customModel = {
      ...model,
      defaultParams: { s: 'cbbd' }
    };

    const s3Steps = UniversalStageEngine.generateStage3Steps(customModel);
    expect(s3Steps.length).toBeGreaterThan(0);
    const lastS3 = s3Steps[s3Steps.length - 1];
    expect(lastS3.grid?.[0][3]).toBe(2);

    const s4Steps = UniversalStageEngine.generateStage4Steps(customModel);
    expect(s4Steps.length).toBeGreaterThan(0);
    const lastS4 = s4Steps[s4Steps.length - 1];
    expect(lastS4.memoj).toBe(2);
  });
});
