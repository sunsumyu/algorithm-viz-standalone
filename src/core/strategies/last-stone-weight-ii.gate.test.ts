import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../model-repository';
import { registerBuiltinStrategies } from './index';
import { UniversalPhysicsGate } from '../testing/universal-physics-gate';
import { UniversalStageEngine } from '../universal-stage-engine';

registerBuiltinStrategies();

describe('最后一块石头的重量 II (Last Stone Weight II LC 1049) 顶层 TDD 门禁测试', () => {
  const algoId = 'last-stone-weight-ii';

  it('模型必须能在 AlgorithmModelRepository 中成功加载，且具备 4 个完整演化阶段', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    expect(model, `未找到模型: ${algoId}`).toBeDefined();
    expect(model.stages['stage-1'], '缺少阶段 1 (递归)').toBeDefined();
    expect(model.stages['stage-2'], '缺少阶段 2 (记忆化)').toBeDefined();
    expect(model.stages['stage-3'], '缺少阶段 3 (二维DP)').toBeDefined();
    expect(model.stages['stage-4'], '缺少阶段 4 (一维滚动压缩)').toBeDefined();
  });

  it('Stage 3 (二维 0-1 背包填表) 零跳步与物理生命周期断言', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    const steps = UniversalStageEngine.generateStage3Steps(model, 6, 11, 'forward');

    // 1. 步数充足度断言 (6 个石头，容量 11，步骤数应当 >= 30)
    expect(steps.length, '步骤过短，存在跳步').toBeGreaterThanOrEqual(30);

    // 2. 通用物理门禁断言 (零值安全、代码行号、转移有效性)
    UniversalPhysicsGate.assertStepInvariants(steps, {
      algorithmId: algoId,
      stage: 3,
      direction: 'forward',
      minSteps: 25,
      requireJump: false,
      requireZeroSlot: true,
      requireDecisions: false
    });

    // 3. 生命周期完整性物理断言
    expect(steps.some(s => s.type === 'init'), '缺少 init 创建二维 DP 表帧').toBe(true);
    expect(steps.some(s => s.type === 'init-row'), '缺少 init-row 初始化第 0 行帧').toBe(true);
    expect(steps.some(s => s.type === 'loop-outer'), '缺少 loop-outer 外层循环头帧').toBe(true);
    expect(steps.some(s => s.type === 'loop-inner'), '缺少 loop-inner 内层容量循环头帧').toBe(true);
    expect(steps.some(s => s.type === 'cond'), '缺少 cond 容量比对帧').toBe(true);
    expect(steps.some(s => s.type === 'transfer'), '缺少 transfer 状态转移帧').toBe(true);
    expect(steps.some(s => s.type === 'return'), '缺少 return 最终返回帧').toBe(true);

    // 4. 最终结果断言：stones = [2, 7, 4, 1, 8, 1]，sum = 23, target = 11
    // 最大装载量为 11，差值为 23 - 2 * 11 = 1
    const returnStep = steps.find(s => s.type === 'return')!;
    expect(returnStep.grid).toBeDefined();
    const lastRow = returnStep.grid![returnStep.grid!.length - 1];
    expect(lastRow[11]).toBe(11);
    expect(returnStep.msg).toContain('1');
  });

  it('Stage 4 (一维倒序空间压缩) 物理门禁与逆序更新断言', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    const steps = UniversalStageEngine.generateStage4Steps(model, 6, 11, 'forward');

    expect(steps.length, 'Stage 4 步骤过短').toBeGreaterThanOrEqual(25);

    // 通用物理门禁断言
    UniversalPhysicsGate.assertStepInvariants(steps, {
      algorithmId: algoId,
      stage: 4,
      direction: 'forward',
      minSteps: 20,
      requireJump: false,
      requireZeroSlot: true,
      requireDecisions: false
    });

    expect(steps.some(s => s.type === 'init'), '缺少 init 帧').toBe(true);
    expect(steps.some(s => s.type === 'outer-loop'), '缺少 outer-loop 帧').toBe(true);
    expect(steps.some(s => s.type === 'update-1d'), '缺少 update-1d 帧').toBe(true);
    expect(steps.some(s => s.type === 'return'), '缺少 return 帧').toBe(true);

    const returnStep = steps.find(s => s.type === 'return')!;
    expect(returnStep.dp1d).toBeDefined();
    expect(returnStep.dp1d![11]).toBe(11);
    expect(returnStep.memoj).toBe(1); // 最终最小差值 23 - 2 * 11 = 1
  });
});
