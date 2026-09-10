import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../../../../../core/model-repository';
import { UniversalStageEngine } from '../../../../../core/universal-stage-engine';
import { YamlModelLoader } from '../../../../../core/yaml-model-loader';

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
    expect(model.defaultParams).toEqual({
      m: 3,
      n: 3,
      obstacleGrid: [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
      ]
    });
    expect(model.defaultStage).toBe('stage-1');
  });

  it('should guarantee all 4 complete evolution stages are defined for unique-paths-ii', () => {
    const model = AlgorithmModelRepository.getModel('unique-paths-ii');
    const stageIds = Object.keys(model.stages);

    expect(stageIds).toEqual(['stage-1', 'stage-2', 'stage-3', 'stage-4']);

    // 检查阶段 1: 朴素递归 (含顺推、逆推、变体)
    const s1 = model.stages['stage-1'];
    expect(typeof s1.name).toBe('object');
    const s1Name = s1.name as { forward: string; reverse: string };
    expect(s1Name.forward).toBeDefined();
    expect(s1Name.reverse).toBeDefined();
    expect(s1.variants?.['terminal']).toBeDefined();
    expect(s1.variants?.['boundary']).toBeDefined();

    // 检查阶段 2: 记忆化搜索
    const s2 = model.stages['stage-2'];
    expect(typeof s2.name).toBe('object');
    const s2Name = s2.name as { forward: string; reverse: string };
    expect(s2Name.forward).toBeDefined();
    expect(s2Name.reverse).toBeDefined();
    expect(s2.variants?.['terminal']).toBeDefined();
    expect(s2.variants?.['boundary']).toBeDefined();

    // 检查阶段 3: 二维动态规划
    const s3 = model.stages['stage-3'];
    expect(typeof s3.name).toBe('object');
    const s3Name = s3.name as { forward: string; reverse: string };
    expect(s3Name.forward).toBeDefined();
    expect(s3Name.reverse).toBeDefined();
    expect(s3.variants?.['if']).toBeDefined();
    expect(s3.variants?.['for']).toBeDefined();

    // 检查阶段 4: 一维空间压缩优化
    const s4 = model.stages['stage-4'];
    expect(typeof s4.name).toBe('object');
    const s4Name = s4.name as { forward: string; reverse: string };
    expect(s4Name.forward).toBeDefined();
    expect(s4Name.reverse).toBeDefined();
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

  it('should guarantee pedagogical 3-step granularity (calc-top, calc-left, transfer) in Stage 3 2D DP', () => {
    const model = AlgorithmModelRepository.getModel('unique-paths-ii');
    const s3Variant = model.stages['stage-3'].variants?.['if'];
    expect(s3Variant).toBeDefined();

    // 顺推教学细分步测试
    const compiledForward = YamlModelLoader.compileSource(s3Variant?.code?.forward as any);
    const forwardSteps = UniversalStageEngine.generateStage3Steps(model, 3, 3, 'forward', compiledForward.anchorMap);

    const calcTopSteps = forwardSteps.filter(s => s.type === 'calc-top');
    const calcLeftSteps = forwardSteps.filter(s => s.type === 'calc-left');
    const transferSteps = forwardSteps.filter(s => s.type === 'transfer');

    expect(calcTopSteps.length).toBeGreaterThan(0);
    expect(calcLeftSteps.length).toBeGreaterThan(0);
    expect(transferSteps.length).toBeGreaterThan(0);
    expect(forwardSteps[forwardSteps.length - 1].grid?.[2][2]).toBe(2);

    // 验证行内局部表达式聚焦属性 (Inline highlightText)
    expect(calcTopSteps[0].highlightText).toBeDefined();
    expect(calcLeftSteps[0].highlightText).toBeDefined();
    expect(transferSteps[0].highlightText).toBe('fromTop + fromLeft');

    // 逆推教学细分步测试
    const compiledReverse = YamlModelLoader.compileSource(s3Variant?.code?.reverse as any);
    const reverseSteps = UniversalStageEngine.generateStage3Steps(model, 3, 3, 'reverse', compiledReverse.anchorMap);

    const calcDownSteps = reverseSteps.filter(s => s.type === 'calc-down');
    const calcRightSteps = reverseSteps.filter(s => s.type === 'calc-right');
    const reverseTransferSteps = reverseSteps.filter(s => s.type === 'transfer');

    expect(calcDownSteps.length).toBeGreaterThan(0);
    expect(calcRightSteps.length).toBeGreaterThan(0);
    expect(reverseTransferSteps.length).toBeGreaterThan(0);
    expect(reverseSteps[reverseSteps.length - 1].grid?.[0][0]).toBe(2);

    expect(calcDownSteps[0].highlightText).toBeDefined();
    expect(calcRightSteps[0].highlightText).toBeDefined();
    expect(reverseTransferSteps[0].highlightText).toBe('fromDown + fromRight');
  });

  it('should support dynamic custom dimensions (e.g. 4x4) and calculate all cells to completion', () => {
    const model = AlgorithmModelRepository.getModel('unique-paths-ii');
    const m = 4;
    const n = 4;

    // Stage 3 Forward on 4x4
    const s3Steps = UniversalStageEngine.generateStage3Steps(model, m, n, 'forward');
    expect(s3Steps.length).toBeGreaterThan(0);
    const lastStep = s3Steps[s3Steps.length - 1];
    // With obstacle at (1, 1), 4x4 grid has target dp[3][3] = 8
    expect(lastStep.grid?.[3]?.[3]).toBe(8);
    expect(lastStep.i).toBe(3);
    expect(lastStep.j).toBe(3);
    // Tree root should be dp[3][3]
    expect(lastStep.treeRoot?.val).toBe('dp[3][3]');

    // Stage 4 Forward on 4x4
    const s4Steps = UniversalStageEngine.generateStage4Steps(model, m, n, 'forward', 'if');
    expect(s4Steps.length).toBeGreaterThan(0);
    const lastS4 = s4Steps[s4Steps.length - 1];
    expect(lastS4.memoSnapshot?.[3]).toBe(8);
  });
});
