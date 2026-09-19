import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../../../../../core/model-repository';
import { UniversalStageEngine } from '../../../../../core/universal-stage-engine';

/**
 * 🏆 [Golden Baseline Regression Guard]
 * 黄金基准守护测试：保护「不同的子序列 (Distinct Subsequences)」规范与推导引擎，严防非预期代码修改
 */
describe('🏆 Distinct Subsequences Golden Baseline Regression Guard', () => {
  it('should guarantee distinct-subsequences model integrity and metadata', () => {
    expect(AlgorithmModelRepository.hasModel('distinct-subsequences')).toBe(true);
    const model = AlgorithmModelRepository.getModel('distinct-subsequences');

    expect(model.id).toBe('distinct-subsequences');
    expect(model.name).toBe('不同的子序列');
    expect(model.category).toBe('dynamic-programming');
    expect(model.defaultParams).toEqual({ s: 'rabbbit', t: 'rabbit' });
    expect(model.defaultStage).toBe('stage-1');
  });

  it('should guarantee all 4 complete evolution stages are defined', () => {
    const model = AlgorithmModelRepository.getModel('distinct-subsequences');
    const stageIds = Object.keys(model.stages);

    expect(stageIds).toEqual(['stage-1', 'stage-2', 'stage-3', 'stage-4']);
    expect(model.stages['stage-1'].variants?.['standard']).toBeDefined();
    expect(model.stages['stage-2'].variants?.['matrix_memo']).toBeDefined();
    expect(model.stages['stage-3'].variants?.['if']).toBeDefined();
    expect(model.stages['stage-3'].variants?.['for']).toBeDefined();
    expect(model.stages['stage-4'].variants?.['reverse_1d']).toBeDefined();
    expect(model.stages['stage-4'].variants?.['leftup_1d']).toBeDefined();
    expect(model.stages['stage-4'].variants?.['pruned_1d']).toBeDefined();
  });

  it('should calculate distinct subsequences correctly for "rabbbit" and "rabbit" (result=3) across stages', () => {
    const model = AlgorithmModelRepository.getModel('distinct-subsequences');

    // Stage 1 (Naive Recursion)
    const s1Steps = UniversalStageEngine.generateStage1or2Steps(model, 7, 6, 'forward', false);
    expect(s1Steps.length).toBeGreaterThan(0);
    const lastS1 = s1Steps[s1Steps.length - 1];
    expect(lastS1.log).toContain('3');

    // Stage 2 (Memoization)
    const s2Steps = UniversalStageEngine.generateStage1or2Steps(model, 7, 6, 'forward', true);
    expect(s2Steps.length).toBeGreaterThan(0);
    const cacheHit = s2Steps.find(s => s.type === 'cache-hit');
    expect(cacheHit).toBeDefined();
    const lastS2 = s2Steps[s2Steps.length - 1];
    expect(lastS2.log).toContain('3');

    // Stage 3 (2D DP Tabulation - for and if variants)
    const s3ForSteps = UniversalStageEngine.generateStage3Steps(model, 7, 6, 'forward', undefined, 'for');
    expect(s3ForSteps.length).toBeGreaterThan(0);
    expect(s3ForSteps[s3ForSteps.length - 1].grid?.[7][6]).toBe(3);

    const s3IfSteps = UniversalStageEngine.generateStage3Steps(model, 7, 6, 'forward', undefined, 'if');
    expect(s3IfSteps.length).toBeGreaterThan(0);
    expect(s3IfSteps[s3IfSteps.length - 1].grid?.[7][6]).toBe(3);

    const s3ForRev = UniversalStageEngine.generateStage3Steps(model, 7, 6, 'reverse', undefined, 'for');
    expect(s3ForRev[s3ForRev.length - 1].grid?.[0][0]).toBe(3);

    const s3IfRev = UniversalStageEngine.generateStage3Steps(model, 7, 6, 'reverse', undefined, 'if');
    expect(s3IfRev[s3IfRev.length - 1].grid?.[0][0]).toBe(3);

    // Stage 4 (1D Reverse Space Compression)
    const s4Steps = UniversalStageEngine.generateStage4Steps(model);
    expect(s4Steps.length).toBeGreaterThan(0);
    const lastS4 = s4Steps[s4Steps.length - 1];
    expect(lastS4.memoj).toBe(3);
  });

  it('should calculate distinct subsequences correctly for "babgbag" and "bag" (result=5)', () => {
    const model = AlgorithmModelRepository.getModel('distinct-subsequences');
    const customModel = {
      ...model,
      defaultParams: { s: 'babgbag', t: 'bag' }
    };

    const s3Steps = UniversalStageEngine.generateStage3Steps(customModel);
    expect(s3Steps.length).toBeGreaterThan(0);
    const lastS3 = s3Steps[s3Steps.length - 1];
    expect(lastS3.grid?.[7][3]).toBe(5);

    const s4Steps = UniversalStageEngine.generateStage4Steps(customModel);
    expect(s4Steps.length).toBeGreaterThan(0);
    const lastS4 = s4Steps[s4Steps.length - 1];
    expect(lastS4.memoj).toBe(5);
  });

  it('should compile distinct forward and reverse codes without inversion', () => {
    AlgorithmModelRepository.clearCache();
    const fStage1 = AlgorithmModelRepository.getCompiledStage('distinct-subsequences', 'stage-1', 'forward');
    const rStage1 = AlgorithmModelRepository.getCompiledStage('distinct-subsequences', 'stage-1', 'reverse');

    expect(fStage1.codeHtml).toContain('dfs(s, t, 0, 0)');
    expect(rStage1.codeHtml).toContain('dfs(s, t, s.length(), t.length())');

    const fStage3 = AlgorithmModelRepository.getCompiledStage('distinct-subsequences', 'stage-3', 'forward');
    const rStage3 = AlgorithmModelRepository.getCompiledStage('distinct-subsequences', 'stage-3', 'reverse');

    expect(fStage3.codeHtml).toContain('return dp[m][n]');
    expect(rStage3.codeHtml).toContain('return dp[0][0]');
  });

  it('should enforce full one-line-one-step granularity in Stage 4 without silent skips', () => {
    const model = AlgorithmModelRepository.getModel('distinct-subsequences');

    // 1. 顺推 Stage 4 粒度核验 (s="rabbbit", t="rabbit", m=7, n=6)
    const forwardSteps = UniversalStageEngine.generateStage4Steps(model, 7, 6, 'forward');
    // 必须包含初始化、外层循环 7 轮、内层循环 42 轮求值、累计更新、最终返回
    expect(forwardSteps.length).toBeGreaterThanOrEqual(90);

    const forwardTypes = new Set(forwardSteps.map(s => s.type));
    expect(forwardTypes.has('init')).toBe(true);
    expect(forwardTypes.has('init_val')).toBe(true);
    expect(forwardTypes.has('loop_i')).toBe(true);
    expect(forwardTypes.has('loop_j')).toBe(true);
    expect(forwardTypes.has('cond')).toBe(true);
    expect(forwardTypes.has('accumulate')).toBe(true);
    expect(forwardTypes.has('return')).toBe(true);

    const condSteps = forwardSteps.filter(s => s.type === 'cond');
    expect(condSteps.length).toBe(7 * 6); // 严格比对 42 次

    // 2. 逆推 Stage 4 粒度核验
    const reverseSteps = UniversalStageEngine.generateStage4Steps(model, 7, 6, 'reverse');
    expect(reverseSteps.length).toBeGreaterThanOrEqual(90);

    const reverseTypes = new Set(reverseSteps.map(s => s.type));
    expect(reverseTypes.has('init')).toBe(true);
    expect(reverseTypes.has('init_val')).toBe(true);
    expect(reverseTypes.has('loop_i')).toBe(true);
    expect(reverseTypes.has('cache_pre')).toBe(true);
    expect(reverseTypes.has('loop_j')).toBe(true);
    expect(reverseTypes.has('cond')).toBe(true);
    expect(reverseTypes.has('accumulate')).toBe(true);
    expect(reverseTypes.has('return')).toBe(true);

    const reverseCondSteps = reverseSteps.filter(s => s.type === 'cond');
    expect(reverseCondSteps.length).toBe(7 * 6); // 严格比对 42 次
  });
});
