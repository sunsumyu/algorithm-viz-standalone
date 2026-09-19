import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../model-repository';
import { AlgorithmStrategyRegistry } from '../strategies/algorithm-strategy-registry';
import { registerBuiltinStrategies } from '../strategies/index';
import { UniversalStageEngine } from '../universal-stage-engine';
import { UniversalPhysicsGate } from './universal-physics-gate';

registerBuiltinStrategies();

describe('通用物理语义与测试驱动（TDD）双层门禁 (Universal DP Physics Gate)', () => {
  it('min-cost-climbing-stairs 应当严格通过通用物理门禁与顺逆推差异性断言', () => {
    const algoId = 'min-cost-climbing-stairs';
    const model = AlgorithmModelRepository.getModel(algoId);
    expect(model, `未找到模型: ${algoId}`).toBeDefined();

    // 运行 Stage 3 (经典递推 DP)
    const fSteps = UniversalStageEngine.generateStage3Steps(model, 3, 3, 'forward');
    const rSteps = UniversalStageEngine.generateStage3Steps(model, 3, 3, 'reverse');

    // 1. 顺推与逆推严格差异断言
    UniversalPhysicsGate.assertDivergence(fSteps, rSteps, algoId);

    // 2. Stage 4 (空间压缩物理跳跃实体) 断言
    const f4Steps = UniversalStageEngine.generateStage4Steps(model, 3, 3, 'forward');
    const r4Steps = UniversalStageEngine.generateStage4Steps(model, 3, 3, 'reverse');

    UniversalPhysicsGate.assertStepInvariants(f4Steps, {
      algorithmId: `${algoId} Stage 4 [顺推]`,
      stage: 4,
      direction: 'forward',
      requireJump: true,
      requireZeroSlot: true,
      requireDecisions: false
    });

    UniversalPhysicsGate.assertStepInvariants(r4Steps, {
      algorithmId: `${algoId} Stage 4 [逆推]`,
      stage: 4,
      direction: 'reverse',
      requireJump: true,
      requireZeroSlot: true,
      requireDecisions: false
    });
  });

  it('distinct-subsequences (LeetCode 115 标杆) 应当严格通过二维网格与决策完整性断言', () => {
    const algoId = 'distinct-subsequences';
    const model = AlgorithmModelRepository.getModel(algoId);
    expect(model, `未找到模型: ${algoId}`).toBeDefined();

    const steps = UniversalStageEngine.generateStage3Steps(model, 3, 3, 'forward');

    UniversalPhysicsGate.assertStepInvariants(steps, {
      algorithmId: algoId,
      stage: 3,
      direction: 'forward',
      minSteps: 10,
      requireJump: false, // 115 是二维矩阵填表，非 1D 抛物线跳跃
      requireDecisions: true
    });
  });

  it('integer-break (LeetCode 343 切分族标杆) 应当严格通过通用物理门禁与决策断言', () => {
    const algoId = 'integer-break';
    const model = AlgorithmModelRepository.getModel(algoId);
    expect(model, `未找到模型: ${algoId}`).toBeDefined();

    const steps = UniversalStageEngine.generateStage3Steps(model, 6, 6, 'forward');

    UniversalPhysicsGate.assertStepInvariants(steps, {
      algorithmId: algoId,
      stage: 3,
      direction: 'forward',
      minSteps: 20,
      requireJump: false,
      requireZeroSlot: false,
      requireDecisions: true
    });
  });

  it('perfect-squares (LeetCode 279 完全平方数) 应当严格通过通用物理门禁与决策断言', () => {
    const algoId = 'perfect-squares';
    const model = AlgorithmModelRepository.getModel(algoId);
    expect(model, `未找到模型: ${algoId}`).toBeDefined();

    const steps = UniversalStageEngine.generateStage3Steps(model, 12, 12, 'forward');

    UniversalPhysicsGate.assertStepInvariants(steps, {
      algorithmId: algoId,
      stage: 3,
      direction: 'forward',
      minSteps: 20,
      requireJump: false,
      requireZeroSlot: true,
      requireDecisions: true
    });
  });

  it('coin-change (LeetCode 322 零钱兑换) 应当严格通过通用物理门禁与决策断言', () => {
    const algoId = 'coin-change';
    const model = AlgorithmModelRepository.getModel(algoId);
    expect(model, `未找到模型: ${algoId}`).toBeDefined();

    const steps = UniversalStageEngine.generateStage3Steps(model, 11, 11, 'forward');

    UniversalPhysicsGate.assertStepInvariants(steps, {
      algorithmId: algoId,
      stage: 3,
      direction: 'forward',
      minSteps: 20,
      requireJump: false,
      requireZeroSlot: true,
      requireDecisions: true
    });
  });

  it('word-break (LeetCode 139 单词拆分) 应当严格通过通用物理门禁与决策断言', () => {
    const algoId = 'word-break';
    const model = AlgorithmModelRepository.getModel(algoId);
    expect(model, `未找到模型: ${algoId}`).toBeDefined();

    const steps = UniversalStageEngine.generateStage3Steps(model, 8, 8, 'forward');

    UniversalPhysicsGate.assertStepInvariants(steps, {
      algorithmId: algoId,
      stage: 3,
      direction: 'forward',
      minSteps: 15,
      requireJump: false,
      requireZeroSlot: true,
      requireDecisions: true
    });
  });

  it('coin-change-ii (LeetCode 518 零钱兑换 II) 应当严格通过通用物理门禁与决策断言', () => {
    const algoId = 'coin-change-ii';
    const model = AlgorithmModelRepository.getModel(algoId);
    expect(model, `未找到模型: ${algoId}`).toBeDefined();

    const steps = UniversalStageEngine.generateStage3Steps(model, 5, 5, 'forward');

    UniversalPhysicsGate.assertStepInvariants(steps, {
      algorithmId: algoId,
      stage: 3,
      direction: 'forward',
      minSteps: 12,
      requireJump: false,
      requireZeroSlot: true,
      requireDecisions: true
    });
  });

  it('last-stone-weight-ii (LeetCode 1049 最后一块石头 II) 应当严格通过 0-1 背包物理门禁与生命周期断言', () => {
    const algoId = 'last-stone-weight-ii';
    const model = AlgorithmModelRepository.getModel(algoId);
    expect(model, `未找到模型: ${algoId}`).toBeDefined();

    // Stage 3: 二维 0-1 背包填表（stones=[2,7,4,1,8,1], sum=23, target=11）
    const steps = UniversalStageEngine.generateStage3Steps(model, 6, 11, 'forward');

    UniversalPhysicsGate.assertStepInvariants(steps, {
      algorithmId: algoId,
      stage: 3,
      direction: 'forward',
      minSteps: 30,
      requireJump: false,
      requireZeroSlot: true,
      requireDecisions: false
    });

    // 结果正确性：最大装载量 11，差值 sum-2*11 = 1
    const returnStep = steps.find(s => s.type === 'return')!;
    expect(returnStep, '缺少 return 帧').toBeDefined();
    expect(returnStep.msg, '最终消息必须包含差值 1').toContain('1');
  });

  it('ones-and-zeroes (LeetCode 474 一和零) 应当严格通过二维费用背包物理门禁与生命周期断言', () => {
    const algoId = 'ones-and-zeroes';
    const model = AlgorithmModelRepository.getModel(algoId);
    expect(model, `未找到模型: ${algoId}`).toBeDefined();

    // Stage 3: 三维 0-1 背包填表（strs=["10","0001","111001","1","0"], m=5, n=3 -> 4）
    const steps = UniversalStageEngine.generateStage3Steps(model, 5, 3, 'forward');

    UniversalPhysicsGate.assertStepInvariants(steps, {
      algorithmId: algoId,
      stage: 3,
      direction: 'forward',
      minSteps: 8,
      requireJump: false,
      requireZeroSlot: true,
      requireDecisions: false
    });

    // 结果正确性：m=5, n=3 下最大子集 4
    const returnStep = steps.find(s => s.type === 'return')!;
    expect(returnStep, '缺少 return 帧').toBeDefined();
    const resultText = returnStep.msg ?? returnStep.tag ?? '';
    expect(typeof resultText === 'string' ? resultText : String(resultText)).toContain('4');
  });

  it('multiple-knapsack (多重背包) 应当严格通过有界背包物理门禁与生命周期断言', () => {
    const algoId = 'multiple-knapsack';
    const model = AlgorithmModelRepository.getModel(algoId);
    expect(model, `未找到模型: ${algoId}`).toBeDefined();

    // Stage 3: weights=[1,3,4], values=[15,20,30], nums=[2,3,2], bagWeight=10
    const steps = UniversalStageEngine.generateStage3Steps(model, 10, 10, 'forward');

    UniversalPhysicsGate.assertStepInvariants(steps, {
      algorithmId: algoId,
      stage: 3,
      direction: 'forward',
      minSteps: 6,
      requireJump: false,
      requireZeroSlot: false,
      requireDecisions: false
    });

    expect(steps.some(s => s.type === 'init'), '缺少 init 帧').toBe(true);
    expect(steps.some(s => s.type === 'return'), '缺少 return 帧').toBe(true);
  });

  it('profitable-schemes (LeetCode 879 盈利计划) 应当严格通过三维计数 DP 物理门禁与生命周期断言', () => {
    const algoId = 'profitable-schemes';
    const model = AlgorithmModelRepository.getModel(algoId);
    expect(model, `未找到模型: ${algoId}`).toBeDefined();

    // Stage 3: n=5, minProfit=3, group=[2,2], profit=[2,3] -> 2
    const steps = UniversalStageEngine.generateStage3Steps(model, 5, 3, 'forward');

    UniversalPhysicsGate.assertStepInvariants(steps, {
      algorithmId: algoId,
      stage: 3,
      direction: 'forward',
      minSteps: 6,
      requireJump: false,
      requireZeroSlot: false,
      requireDecisions: false
    });

    expect(steps.some(s => s.type === 'init'), '缺少 init 帧').toBe(true);
    expect(steps.some(s => s.type === 'return'), '缺少 return 帧').toBe(true);

    // 结果正确性：答案 2
    const returnStep = steps.find(s => s.type === 'return')!;
    expect(returnStep, '缺少 return 帧').toBeDefined();
    const resultText = returnStep.msg ?? returnStep.tag ?? '';
    expect(typeof resultText === 'string' ? resultText : String(resultText)).toContain('2');
  });
});
