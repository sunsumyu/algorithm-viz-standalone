import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../model-repository';
import { registerBuiltinStrategies } from './index';
import { UniversalPhysicsGate } from '../testing/universal-physics-gate';
import { UniversalStageEngine } from '../universal-stage-engine';

registerBuiltinStrategies();

describe('多重背包 (Multiple Knapsack) 顶层 TDD 门禁测试', () => {
  const algoId = 'multiple-knapsack';

  it('模型必须能在 AlgorithmModelRepository 中成功加载，且具备 4 个完整演化阶段', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    expect(model, `未找到模型: ${algoId}`).toBeDefined();
    expect(model.stages['stage-1'], '缺少阶段 1 (递归)').toBeDefined();
    expect(model.stages['stage-2'], '缺少阶段 2 (记忆化)').toBeDefined();
    expect(model.stages['stage-3'], '缺少阶段 3 (有界背包DP)').toBeDefined();
    expect(model.stages['stage-4'], '缺少阶段 4 (单调队列优化)').toBeDefined();
  });

  it('Stage 3 (有界背包二维填表) 零跳步与物理生命周期断言', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    // weights=[1,3,4], values=[15,20,30], nums=[2,3,2], bagWeight=10
    const steps = UniversalStageEngine.generateStage3Steps(model, 10, 10, 'forward');

    expect(steps.length, '步骤过短，存在跳步').toBeGreaterThanOrEqual(8);

    UniversalPhysicsGate.assertStepInvariants(steps, {
      algorithmId: algoId,
      stage: 3,
      direction: 'forward',
      minSteps: 6,
      requireJump: false,
      requireZeroSlot: false,
      requireDecisions: false
    });

    expect(steps.some(s => s.type === 'init'), '缺少 init 初始化帧').toBe(true);
    expect(steps.some(s => s.type === 'return'), '缺少 return 最终返回帧').toBe(true);
  });

  it('Stage 4 (单调队列优化 O(N×W)) 物理门禁与推导断言', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    const steps = UniversalStageEngine.generateStage4Steps(model, 10, 10, 'forward');

    expect(steps.length, 'Stage 4 步骤过短').toBeGreaterThanOrEqual(6);

    UniversalPhysicsGate.assertStepInvariants(steps, {
      algorithmId: algoId,
      stage: 4,
      direction: 'forward',
      minSteps: 4,
      requireJump: false,
      requireZeroSlot: false,
      requireDecisions: false
    });

    expect(steps.some(s => s.type === 'return'), '缺少 return 帧').toBe(true);
  });
});
