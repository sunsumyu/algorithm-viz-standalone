import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../model-repository';
import { registerBuiltinStrategies } from './index';
import { UniversalPhysicsGate } from '../testing/universal-physics-gate';
import { UniversalStageEngine } from '../universal-stage-engine';

registerBuiltinStrategies();

describe('一和零 (Ones and Zeroes LC 474) 顶层 TDD 门禁测试', () => {
  const algoId = 'ones-and-zeroes';

  it('模型必须能在 AlgorithmModelRepository 中成功加载，且具备 4 个完整演化阶段', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    expect(model, `未找到模型: ${algoId}`).toBeDefined();
    expect(model.stages['stage-1'], '缺少阶段 1 (递归)').toBeDefined();
    expect(model.stages['stage-2'], '缺少阶段 2 (记忆化)').toBeDefined();
    expect(model.stages['stage-3'], '缺少阶段 3 (三维DP)').toBeDefined();
    expect(model.stages['stage-4'], '缺少阶段 4 (二维滚动压缩)').toBeDefined();
  });

  it('Stage 3 (三维 0-1 背包填表) 零跳步与物理生命周期断言', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    // strs=["10","0001","111001","1","0"], m=5, n=3 -> 答案 4
    const steps = UniversalStageEngine.generateStage3Steps(model, 5, 3, 'forward');

    // 步数充足度 (5 个字符串，至少 init + 5 * (eval+count+updates) + return)
    expect(steps.length, '步骤过短，存在跳步').toBeGreaterThanOrEqual(10);

    // 通用物理门禁
    UniversalPhysicsGate.assertStepInvariants(steps, {
      algorithmId: algoId,
      stage: 3,
      direction: 'forward',
      minSteps: 8,
      requireJump: false,
      requireZeroSlot: true,
      requireDecisions: false
    });

    // 生命周期完整性
    expect(steps.some(s => s.type === 'init'), '缺少 init 初始化帧').toBe(true);
    expect(steps.some(s => s.type === 'return'), '缺少 return 最终返回帧').toBe(true);

    // 结果正确性: strs=["10","0001","111001","1","0"], m=5, n=3 -> 4
    const returnStep = steps.find(s => s.type === 'return')!;
    expect(returnStep, '缺少 return 帧').toBeDefined();
    // 检查 msg 或 tag 中包含最终答案 4
    const resultText = returnStep.msg ?? returnStep.tag ?? '';
    expect(typeof resultText === 'string' ? resultText : String(resultText),
      `return 帧的 msg/tag 应当包含最终答案 4，实际值: ${JSON.stringify(returnStep)}`
    ).toContain('4');

  });

  it('Stage 4 (二维滚动数组空间压缩) 物理门禁与双倒序更新断言', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    const steps = UniversalStageEngine.generateStage4Steps(model, 5, 3, 'forward');

    expect(steps.length, 'Stage 4 步骤过短').toBeGreaterThanOrEqual(8);

    UniversalPhysicsGate.assertStepInvariants(steps, {
      algorithmId: algoId,
      stage: 4,
      direction: 'forward',
      minSteps: 6,
      requireJump: false,
      requireZeroSlot: true,
      requireDecisions: false
    });

    expect(steps.some(s => s.type === 'init'), '缺少 init 帧').toBe(true);
    expect(steps.some(s => s.type === 'return'), '缺少 return 帧').toBe(true);

    // Stage 4: dp[5][3] = 4
    const returnStep = steps.find(s => s.type === 'return')!;
    expect(returnStep.msg ?? returnStep.tag).toContain('4');
  });
});
