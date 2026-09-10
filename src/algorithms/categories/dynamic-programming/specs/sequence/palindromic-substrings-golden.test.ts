import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../../../../../core/model-repository';
import { UniversalStageEngine } from '../../../../../core/universal-stage-engine';

/**
 * 🏆 [Golden Baseline Regression Guard]
 * 黄金基准守护测试：保护「回文子串 (Palindromic Substrings)」规范与推导引擎，严防非预期代码修改
 */
describe('🏆 Palindromic Substrings Golden Baseline Regression Guard', () => {
  it('should guarantee palindromic-substrings model integrity and metadata', () => {
    expect(AlgorithmModelRepository.hasModel('palindromic-substrings')).toBe(true);
    const model = AlgorithmModelRepository.getModel('palindromic-substrings');

    expect(model.id).toBe('palindromic-substrings');
    expect(model.name).toBe('回文子串');
    expect(model.category).toBe('dynamic-programming');
    expect(model.defaultParams?.s).toBe('aaa');
    expect(model.defaultStage).toBe('stage-1');
  });

  it('should guarantee all 4 complete evolution stages are defined', () => {
    const model = AlgorithmModelRepository.getModel('palindromic-substrings');
    const stageIds = Object.keys(model.stages);

    expect(stageIds).toEqual(['stage-1', 'stage-2', 'stage-3', 'stage-4']);
    expect(model.stages['stage-1'].variants?.['standard']).toBeDefined();
    expect(model.stages['stage-2'].variants?.['standard']).toBeDefined();
    expect(model.stages['stage-3'].variants?.['standard']).toBeDefined();
    expect(model.stages['stage-4'].variants?.['center_spread']).toBeDefined();
  });

  it('should calculate palindromic substrings correctly for "aaa" (result=6) across stages', () => {
    const model = AlgorithmModelRepository.getModel('palindromic-substrings');

    // Stage 1 (Interval Recursion)
    const s1Steps = UniversalStageEngine.generateStage1or2Steps(model, 3, 3, 'forward', false);
    expect(s1Steps.length).toBeGreaterThan(0);
    const lastS1 = s1Steps[s1Steps.length - 1];
    expect(lastS1.log).toContain('6');

    // Stage 2 (Memoization)
    const s2Steps = UniversalStageEngine.generateStage1or2Steps(model, 3, 3, 'forward', true);
    expect(s2Steps.length).toBeGreaterThan(0);
    const lastS2 = s2Steps[s2Steps.length - 1];
    expect(lastS2.log).toContain('6');

    // Stage 3 (2D Upper Triangular DP Tabulation)
    const s3Steps = UniversalStageEngine.generateStage3Steps(model);
    expect(s3Steps.length).toBeGreaterThan(0);
    const lastS3 = s3Steps[s3Steps.length - 1];
    expect(lastS3.log).toContain('6');

    // Stage 4 (Center Expansion)
    const s4Steps = UniversalStageEngine.generateStage4Steps(model);
    expect(s4Steps.length).toBeGreaterThan(0);
    const lastS4 = s4Steps[s4Steps.length - 1];
    expect(lastS4.memoj).toBe(6);
  });

  it('should verify memoization cache hit and result for "aaaa" (result=10)', () => {
    const model = AlgorithmModelRepository.getModel('palindromic-substrings');
    const customModel = {
      ...model,
      defaultParams: { s: 'aaaa' }
    };

    const s2Steps = UniversalStageEngine.generateStage1or2Steps(customModel, 4, 4, 'forward', true);
    expect(s2Steps.length).toBeGreaterThan(0);
    const cacheHit = s2Steps.find(s => s.type === 'cache-hit');
    expect(cacheHit).toBeDefined();
    const lastS2 = s2Steps[s2Steps.length - 1];
    expect(lastS2.log).toContain('10');

    const s3Steps = UniversalStageEngine.generateStage3Steps(customModel);
    expect(s3Steps.length).toBeGreaterThan(0);
    const lastS3 = s3Steps[s3Steps.length - 1];
    expect(lastS3.log).toContain('10');

    const s4Steps = UniversalStageEngine.generateStage4Steps(customModel);
    expect(s4Steps.length).toBeGreaterThan(0);
    const lastS4 = s4Steps[s4Steps.length - 1];
    expect(lastS4.memoj).toBe(10);
  });

  it('should calculate palindromic substrings correctly for "abc" (result=3)', () => {
    const model = AlgorithmModelRepository.getModel('palindromic-substrings');
    const customModel = {
      ...model,
      defaultParams: { s: 'abc' }
    };

    const s3Steps = UniversalStageEngine.generateStage3Steps(customModel);
    expect(s3Steps.length).toBeGreaterThan(0);
    const lastS3 = s3Steps[s3Steps.length - 1];
    expect(lastS3.log).toContain('3');

    const s4Steps = UniversalStageEngine.generateStage4Steps(customModel);
    expect(s4Steps.length).toBeGreaterThan(0);
    const lastS4 = s4Steps[s4Steps.length - 1];
    expect(lastS4.memoj).toBe(3);
  });
});
