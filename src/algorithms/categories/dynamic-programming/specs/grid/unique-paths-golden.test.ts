import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../../../../../core/model-repository';
import { UniversalStageEngine } from '../../../../../core/universal-stage-engine';

/**
 * 🏆 [Golden Baseline Regression Guard]
 * 黄金基准守护测试：保护「不同路径 (Unique Paths)」规范与推导引擎，严防非预期代码修改
 */
describe('🏆 Unique Paths Golden Baseline Regression Guard', () => {
  it('should guarantee unique-paths model integrity and metadata', () => {
    expect(AlgorithmModelRepository.hasModel('unique-paths')).toBe(true);
    const model = AlgorithmModelRepository.getModel('unique-paths');

    expect(model.id).toBe('unique-paths');
    expect(model.name).toBe('不同路径');
    expect(model.category).toBe('dynamic-programming');
    expect(model.defaultParams).toEqual({ m: 3, n: 4 });
    expect(model.defaultStage).toBe('stage-1');
  });

  it('should guarantee all 4 complete evolution stages are defined', () => {
    const model = AlgorithmModelRepository.getModel('unique-paths');
    const stageIds = Object.keys(model.stages);

    expect(stageIds).toEqual(['stage-1', 'stage-2', 'stage-3', 'stage-4']);
    
    // 检查阶段 1: 朴素递归 (含顺推、逆推、变体)
    const s1 = model.stages['stage-1'];
    expect(s1.name.forward).toBeDefined();
    expect(s1.name.reverse).toBeDefined();
    expect(s1.variants?.['boundary']).toBeDefined();
    expect(s1.variants?.['terminal']).toBeDefined();

    // 检查阶段 2: 记忆化搜索
    const s2 = model.stages['stage-2'];
    expect(s2.name.forward).toBeDefined();
    expect(s2.name.reverse).toBeDefined();

    // 检查阶段 3: 二维动态规划
    const s3 = model.stages['stage-3'];
    expect(s3.name.forward).toBeDefined();
    expect(s3.name.reverse).toBeDefined();

    // 检查阶段 4: 一维空间压缩优化
    const s4 = model.stages['stage-4'];
    expect(s4.name.forward).toBeDefined();
    expect(s4.name.reverse).toBeDefined();
  });

  it('should guarantee deterministic step derivations for 3x4 grid across all stages', () => {
    const model = AlgorithmModelRepository.getModel('unique-paths');
    const m = 3;
    const n = 4;

    // Stage 1 Forward (Boundary default variant: 57 steps)
    const s1BoundarySteps = UniversalStageEngine.generateStage1or2Steps(model, m, n, 'forward', false, undefined, 'boundary');
    expect(s1BoundarySteps.length).toBe(57);
    expect(s1BoundarySteps[s1BoundarySteps.length - 1].log).toContain('uniquePaths(3, 4) = 10');

    // Stage 1 Forward (Terminal out-of-bounds river interception variant: 147 steps)
    const s1TerminalSteps = UniversalStageEngine.generateStage1or2Steps(model, m, n, 'forward', false, undefined, 'terminal');
    expect(s1TerminalSteps.length).toBe(147);
    const oobStep = s1TerminalSteps.find(s => s.type === 'out-of-bounds');
    expect(oobStep).toBeDefined();
    expect(oobStep?.outOfBoundsDir).toBeDefined();

    // Stage 2 Forward (Memoization terminal variant for 3x4 grid: 69 steps)
    const s2Steps = UniversalStageEngine.generateStage1or2Steps(model, m, n, 'forward', true);
    expect(s2Steps.length).toBe(69);
    expect(s2Steps[s2Steps.length - 1].log).toContain('uniquePaths(3, 4) = 10');

    // Stage 3 Forward (2D Tabulation: 14 steps)
    const s3Steps = UniversalStageEngine.generateStage3Steps(model, m, n, 'forward');
    expect(s3Steps.length).toBe(14);
    expect(s3Steps[s3Steps.length - 1].grid?.[2][3]).toBe(10);

    // Stage 4 Forward (1D Optimization: 26 steps)
    const s4Steps = UniversalStageEngine.generateStage4Steps(model, m, n, 'forward', 'if');
    expect(s4Steps.length).toBe(26);
    expect(s4Steps[s4Steps.length - 1].memoSnapshot?.[3]).toBe(10);
  });
});
