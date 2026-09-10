import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../../../../../core/model-repository';
import { UniversalStageEngine } from '../../../../../core/universal-stage-engine';

/**
 * 🏆 [Golden Baseline Regression Guard]
 * 黄金基准守护测试：保护「最小路径和 (Minimum Path Sum)」规范与推导引擎，严防非预期代码修改
 */
describe('🏆 Minimum Path Sum Golden Baseline Regression Guard', () => {
  it('should guarantee min-path-sum model integrity and metadata', () => {
    expect(AlgorithmModelRepository.hasModel('min-path-sum')).toBe(true);
    const model = AlgorithmModelRepository.getModel('min-path-sum');

    expect(model.id).toBe('min-path-sum');
    expect(model.name).toBe('最小路径和');
    expect(model.category).toBe('dynamic-programming');
    expect(model.defaultParams).toEqual({
      m: 3,
      n: 3,
      grid: [
        [1, 3, 1],
        [1, 5, 1],
        [4, 2, 1]
      ]
    });
    expect(model.defaultStage).toBe('stage-1');
  });

  it('should guarantee all 4 complete evolution stages are defined', () => {
    const model = AlgorithmModelRepository.getModel('min-path-sum');
    const stageIds = Object.keys(model.stages);

    expect(stageIds).toEqual(['stage-1', 'stage-2', 'stage-3', 'stage-4']);

    // 检查阶段 1: 朴素递归
    const s1 = model.stages['stage-1'];
    expect(typeof s1.name).toBe('object');
    const s1Name = s1.name as { forward: string; reverse: string };
    expect(s1Name.forward).toBeDefined();
    expect(s1Name.reverse).toBeDefined();

    // 检查阶段 2: 记忆化搜索
    const s2 = model.stages['stage-2'];
    expect(typeof s2.name).toBe('object');
    const s2Name = s2.name as { forward: string; reverse: string };
    expect(s2Name.forward).toBeDefined();
    expect(s2Name.reverse).toBeDefined();

    // 检查阶段 3: 二维 DP 填表
    const s3 = model.stages['stage-3'];
    expect(typeof s3.name).toBe('object');
    const s3Name = s3.name as { forward: string; reverse: string };
    expect(s3Name.forward).toBeDefined();
    expect(s3Name.reverse).toBeDefined();

    // 检查阶段 4: 一维空间压缩
    const s4 = model.stages['stage-4'];
    expect(typeof s4.name).toBe('object');
    const s4Name = s4.name as { forward: string; reverse: string };
    expect(s4Name.forward).toBeDefined();
    expect(s4Name.reverse).toBeDefined();
  });

  it('should calculate minimum path sum correctly for 3x3 grid across stages', () => {
    const model = AlgorithmModelRepository.getModel('min-path-sum');
    const m = 3;
    const n = 3;
    // [[1,3,1],[1,5,1],[4,2,1]] -> 1+3+1+1+1 = 7

    // Stage 1 Forward (Terminal)
    const s1Steps = UniversalStageEngine.generateStage1or2Steps(model, m, n, 'forward', false);
    expect(s1Steps.length).toBeGreaterThan(0);
    const lastS1 = s1Steps[s1Steps.length - 1];
    expect(lastS1.log).toContain('7');

    // Stage 2 Forward (Memoization)
    const s2Steps = UniversalStageEngine.generateStage1or2Steps(model, m, n, 'forward', true);
    expect(s2Steps.length).toBeGreaterThan(0);
    const lastS2 = s2Steps[s2Steps.length - 1];
    expect(lastS2.log).toContain('7');

    // Stage 3 Forward (2D DP Tabulation)
    const s3Steps = UniversalStageEngine.generateStage3Steps(model, m, n, 'forward');
    expect(s3Steps.length).toBeGreaterThan(0);
    const lastS3 = s3Steps[s3Steps.length - 1];
    expect(lastS3.grid?.[2][2]).toBe(7);

    // Stage 4 Forward (1D Space Optimization)
    const s4Steps = UniversalStageEngine.generateStage4Steps(model, m, n, 'forward', 'if');
    expect(s4Steps.length).toBeGreaterThan(0);
    const lastS4 = s4Steps[s4Steps.length - 1];
    expect(lastS4.memoSnapshot?.[2]).toBe(7);
  });

  it('should calculate reverse minimum path sum correctly for 3x3 grid', () => {
    const model = AlgorithmModelRepository.getModel('min-path-sum');
    const m = 3;
    const n = 3;

    // Stage 3 Reverse
    const s3Reverse = UniversalStageEngine.generateStage3Steps(model, m, n, 'reverse');
    expect(s3Reverse.length).toBeGreaterThan(0);
    const lastS3Reverse = s3Reverse[s3Reverse.length - 1];
    expect(lastS3Reverse.grid?.[0][0]).toBe(7);

    // Stage 4 Reverse
    const s4Reverse = UniversalStageEngine.generateStage4Steps(model, m, n, 'reverse', 'if');
    expect(s4Reverse.length).toBeGreaterThan(0);
    const lastS4Reverse = s4Reverse[s4Reverse.length - 1];
    expect(lastS4Reverse.memoSnapshot?.[0]).toBe(7);
  });
});
