import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../../../../../core/model-repository';
import { UniversalStageEngine } from '../../../../../core/universal-stage-engine';

/**
 * 🏆 [Golden Baseline Regression Guard]
 * 黄金基准守护测试：保护「斐波那契数 (Fibonacci Number)」规范与推导引擎，严防非预期代码修改
 */
describe('🏆 Fibonacci Golden Baseline Regression Guard', () => {
  it('should guarantee fibonacci model integrity and metadata', () => {
    expect(AlgorithmModelRepository.hasModel('fibonacci')).toBe(true);
    const model = AlgorithmModelRepository.getModel('fibonacci');

    expect(model.id).toBe('fibonacci');
    expect(model.name).toBe('斐波那契数');
    expect(model.category).toBe('dynamic-programming');
    expect(model.defaultParams).toEqual({ n: 6 });
    expect(model.defaultStage).toBe('stage-1');
  });

  it('should guarantee all 4 complete evolution stages are defined', () => {
    const model = AlgorithmModelRepository.getModel('fibonacci');
    const stageIds = Object.keys(model.stages);

    expect(stageIds).toEqual(['stage-1', 'stage-2', 'stage-3', 'stage-4']);
    expect(model.stages['stage-1'].variants?.['standard']).toBeDefined();
    expect(model.stages['stage-2'].variants?.['array_memo']).toBeDefined();
    expect(model.stages['stage-3'].variants?.['standard']).toBeDefined();
    expect(model.stages['stage-4'].variants?.['two_vars']).toBeDefined();
  });

  it('should calculate fibonacci numbers correctly for n=6 across stages', () => {
    const model = AlgorithmModelRepository.getModel('fibonacci');
    const n = 6;
    // For n=6: F(0)=0, F(1)=1, F(2)=1, F(3)=2, F(4)=3, F(5)=5, F(6)=8

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
    expect(lastS3.memo?.[6]).toBe(8);

    // Stage 4 (O(1) Rolling Variables)
    const s4Steps = UniversalStageEngine.generateStage4Steps(model, 1, n, 'forward');
    expect(s4Steps.length).toBeGreaterThan(0);
    const lastS4 = s4Steps[s4Steps.length - 1];
    expect(lastS4.memoj).toBe(8);
  });
});
