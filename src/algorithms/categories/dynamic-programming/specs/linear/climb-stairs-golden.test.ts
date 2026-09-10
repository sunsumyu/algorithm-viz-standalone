import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../../../../../core/model-repository';
import { UniversalStageEngine } from '../../../../../core/universal-stage-engine';

/**
 * 🏆 [Golden Baseline Regression Guard]
 * 黄金基准守护测试：保护「爬楼梯 (Climbing Stairs)」规范与推导引擎，严防非预期代码修改
 */
describe('🏆 Climb Stairs Golden Baseline Regression Guard', () => {
  it('should guarantee climb-stairs model integrity and metadata', () => {
    expect(AlgorithmModelRepository.hasModel('climb-stairs')).toBe(true);
    const model = AlgorithmModelRepository.getModel('climb-stairs');

    expect(model.id).toBe('climb-stairs');
    expect(model.name).toBe('爬楼梯');
    expect(model.category).toBe('dynamic-programming');
    expect(model.defaultParams).toEqual({ n: 5 });
    expect(model.defaultStage).toBe('stage-1');
  });

  it('should guarantee all 4 complete evolution stages are defined', () => {
    const model = AlgorithmModelRepository.getModel('climb-stairs');
    const stageIds = Object.keys(model.stages);

    expect(stageIds).toEqual(['stage-1', 'stage-2', 'stage-3', 'stage-4']);
    expect(model.stages['stage-1'].variants?.['standard']).toBeDefined();
    expect(model.stages['stage-2'].variants?.['array_memo']).toBeDefined();
    expect(model.stages['stage-3'].variants?.['standard']).toBeDefined();
    expect(model.stages['stage-4'].variants?.['two_vars']).toBeDefined();
  });

  it('should calculate climbing stairs correctly for n=5 across stages', () => {
    const model = AlgorithmModelRepository.getModel('climb-stairs');
    const n = 5;
    // For n=5: dp[0]=1, dp[1]=1, dp[2]=2, dp[3]=3, dp[4]=5, dp[5]=8

    // Stage 1 (Recursive)
    const s1Steps = UniversalStageEngine.generateStage1or2Steps(model, 1, n, 'forward', false);
    expect(s1Steps.length).toBeGreaterThan(0);
    const lastS1 = s1Steps[s1Steps.length - 1];
    expect(lastS1.log).toContain('8');

    // Stage 2 (Memoization)
    const s2Steps = UniversalStageEngine.generateStage1or2Steps(model, 1, n, 'forward', true);
    expect(s2Steps.length).toBeGreaterThan(0);
    const lastS2 = s2Steps[s2Steps.length - 1];
    expect(lastS2.log).toContain('8');

    // Stage 3 (1D DP Array)
    const s3Steps = UniversalStageEngine.generateStage3Steps(model, 1, n, 'forward');
    expect(s3Steps.length).toBeGreaterThan(0);
    const lastS3 = s3Steps[s3Steps.length - 1];
    expect(lastS3.memo?.[5]).toBe(8);

    // Stage 4 (O(1) Rolling Variables)
    const s4Steps = UniversalStageEngine.generateStage4Steps(model, 1, n, 'forward');
    expect(s4Steps.length).toBeGreaterThan(0);
    const lastS4 = s4Steps[s4Steps.length - 1];
    expect(lastS4.memoj).toBe(8);
  });
});
