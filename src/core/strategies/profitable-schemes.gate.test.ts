import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../model-repository';
import { registerBuiltinStrategies } from './index';
import { UniversalPhysicsGate } from '../testing/universal-physics-gate';
import { UniversalStageEngine } from '../universal-stage-engine';

registerBuiltinStrategies();

describe('盈利计划 (Profitable Schemes LC 879) 顶层 TDD 门禁测试', () => {
  const algoId = 'profitable-schemes';

  it('模型必须能在 AlgorithmModelRepository 中成功加载，且具备 4 个完整演化阶段', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    expect(model, `未找到模型: ${algoId}`).toBeDefined();
    expect(model.stages['stage-1'], '缺少阶段 1 (递归)').toBeDefined();
    expect(model.stages['stage-2'], '缺少阶段 2 (记忆化)').toBeDefined();
    expect(model.stages['stage-3'], '缺少阶段 3 (三维DP)').toBeDefined();
    expect(model.stages['stage-4'], '缺少阶段 4 (二维滚动压缩)').toBeDefined();
  });

  it('Stage 3 (三维 DP 填表) 零跳步与物理生命周期断言', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    // n=5, minProfit=3, group=[2,2], profit=[2,3] -> 答案 2
    const steps = UniversalStageEngine.generateStage3Steps(model, 5, 3, 'forward');

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

    // 结果正确性：答案 2
    const returnStep = steps.find(s => s.type === 'return')!;
    expect(returnStep, '缺少 return 帧').toBeDefined();
    const resultText = returnStep.msg ?? returnStep.tag ?? '';
    expect(typeof resultText === 'string' ? resultText : String(resultText),
      `return 帧应当包含答案 2`
    ).toContain('2');
  });

  it('Stage 4 (二维滚动数组空间压缩 + 取模) 物理门禁与推导断言', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    const steps = UniversalStageEngine.generateStage4Steps(model, 5, 3, 'forward');

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

    const returnStep = steps.find(s => s.type === 'return')!;
    const resultText = returnStep.msg ?? returnStep.tag ?? '';
    expect(typeof resultText === 'string' ? resultText : String(resultText)).toContain('2');
  });
});
