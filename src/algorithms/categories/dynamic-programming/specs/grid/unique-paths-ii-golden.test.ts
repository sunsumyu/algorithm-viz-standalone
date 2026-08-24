import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../../../../../core/model-repository';
import { UniversalStageEngine } from '../../../../../core/universal-stage-engine';

/**
 * 🏆 [Golden Baseline Regression Guard - Unique Paths II]
 * 黄金基准守护测试：保护「不同路径 II (Unique Paths II)」规范与推导引擎，严防非预期代码修改
 */
describe('🏆 Unique Paths II Golden Baseline Regression Guard', () => {
  it('should guarantee unique-paths-ii model integrity and metadata', () => {
    expect(AlgorithmModelRepository.hasModel('unique-paths-ii')).toBe(true);
    const model = AlgorithmModelRepository.getModel('unique-paths-ii');

    expect(model.id).toBe('unique-paths-ii');
    expect(model.name).toBe('不同路径 II');
    expect(model.category).toBe('dynamic-programming');
    expect(model.defaultParams.m).toBe(3);
    expect(model.defaultParams.n).toBe(3);
    expect(model.defaultParams.obstacleGrid).toEqual([
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0]
    ]);
    expect(model.defaultStage).toBe('stage-1');
  });

  it('should guarantee all 4 complete evolution stages are defined for unique-paths-ii', () => {
    const model = AlgorithmModelRepository.getModel('unique-paths-ii');
    const stageIds = Object.keys(model.stages);

    expect(stageIds).toEqual(['stage-1', 'stage-2', 'stage-3', 'stage-4']);

    // 检查阶段 1: 朴素递归 (含顺推、逆推、变体)
    const s1 = model.stages['stage-1'];
    expect(s1.name.forward).toBeDefined();
    expect(s1.name.reverse).toBeDefined();
    expect(s1.variants?.['terminal']).toBeDefined();
    expect(s1.variants?.['boundary']).toBeDefined();

    // 检查阶段 2: 记忆化搜索
    const s2 = model.stages['stage-2'];
    expect(s2.name.forward).toBeDefined();
    expect(s2.name.reverse).toBeDefined();
    expect(s2.variants?.['terminal']).toBeDefined();
    expect(s2.variants?.['boundary']).toBeDefined();

    // 检查阶段 3: 二维动态规划
    const s3 = model.stages['stage-3'];
    expect(s3.name.forward).toBeDefined();
    expect(s3.name.reverse).toBeDefined();
    expect(s3.variants?.['if']).toBeDefined();
    expect(s3.variants?.['for']).toBeDefined();

    // 检查阶段 4: 一维空间压缩优化
    const s4 = model.stages['stage-4'];
    expect(s4.name.forward).toBeDefined();
    expect(s4.name.reverse).toBeDefined();
    expect(s4.variants?.['if']).toBeDefined();
    expect(s4.variants?.['for']).toBeDefined();
  });

  it('should guarantee deterministic step derivations for 3x3 grid with obstacle across all stages', () => {
    const model = AlgorithmModelRepository.getModel('unique-paths-ii');
    const m = 3;
    const n = 3;

    // Stage 1 Forward (Terminal out-of-bounds & obstacle interception variant)
    const s1TerminalSteps = UniversalStageEngine.generateStage1or2Steps(model, m, n, 'forward', false, undefined, 'terminal');
    expect(s1TerminalSteps.length).toBeGreaterThan(0);
    const obsStep = s1TerminalSteps.find(s => s.type === 'obstacle-hit');
    expect(obsStep).toBeDefined();
    expect(obsStep?.isBlockedStep).toBe(true);
    expect(s1TerminalSteps[s1TerminalSteps.length - 1].log).toContain('= 2');

    // Stage 1 Forward (Boundary variant with obstacle)
    const s1BoundarySteps = UniversalStageEngine.generateStage1or2Steps(model, m, n, 'forward', false, undefined, 'boundary');
    expect(s1BoundarySteps.length).toBeGreaterThan(0);
    expect(s1BoundarySteps[s1BoundarySteps.length - 1].log).toContain('= 2');

    // Stage 2 Forward (Memoization terminal variant)
    const s2Steps = UniversalStageEngine.generateStage1or2Steps(model, m, n, 'forward', true, undefined, 'terminal');
    expect(s2Steps.length).toBeGreaterThan(0);
    expect(s2Steps[s2Steps.length - 1].log).toContain('= 2');

    // Stage 3 Forward (2D Tabulation)
    const s3Steps = UniversalStageEngine.generateStage3Steps(model, m, n, 'forward');
    expect(s3Steps.length).toBeGreaterThan(0);
    expect(s3Steps[s3Steps.length - 1].grid?.[2][2]).toBe(2);

    // Stage 4 Forward (1D Optimization)
    const s4Steps = UniversalStageEngine.generateStage4Steps(model, m, n, 'forward', 'if');
    expect(s4Steps.length).toBeGreaterThan(0);
    expect(s4Steps[s4Steps.length - 1].memoSnapshot?.[2]).toBe(2);
  });
});
