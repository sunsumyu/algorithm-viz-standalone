import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../model-repository';
import { AlgorithmStrategyRegistry } from './algorithm-strategy-registry';
import { registerBuiltinStrategies } from './index';
import { UniversalPhysicsGate } from '../testing/universal-physics-gate';
import { UniversalStageEngine } from '../universal-stage-engine';

registerBuiltinStrategies();

describe('整数拆分 (Integer Break LC 343) 顶层 TDD 门禁测试', () => {
  const algoId = 'integer-break';

  it('模型必须能在 AlgorithmModelRepository 中成功加载，且具备 4 个完整演化阶段', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    expect(model, `未找到模型: ${algoId}`).toBeDefined();
    expect(model.stages['stage-1'], '缺少阶段 1 (递归)').toBeDefined();
    expect(model.stages['stage-2'], '缺少阶段 2 (记忆化)').toBeDefined();
    expect(model.stages['stage-3'], '缺少阶段 3 (递推DP)').toBeDefined();
    expect(model.stages['stage-4'], '缺少阶段 4 (数学贪心)').toBeDefined();
  });

  it('Stage 3 (一维切分递推DP) 零跳步与 Card 2 决策天平断言', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    const steps = UniversalStageEngine.generateStage3Steps(model, 6, 6, 'forward');

    // 1. 步数充足度断言 (n=6 双层循环，步骤数应当 >= 20)
    expect(steps.length, '步骤过短，存在跳步').toBeGreaterThanOrEqual(20);

    // 2. 通用物理门禁断言 (零值安全、代码行号、转移有效性)
    UniversalPhysicsGate.assertStepInvariants(steps, {
      algorithmId: algoId,
      stage: 3,
      direction: 'forward',
      minSteps: 15,
      requireJump: false, // 1D 网格内循环扫描，非抛物线跳跃
      requireZeroSlot: false, // 整数拆分从 i=2 开始
      requireDecisions: true
    });

    // 3. 生命周期完整性物理断言
    expect(steps.some(s => s.type === 'init'), '缺少 init 分配数组帧').toBe(true);
    expect(steps.some(s => s.type === 'base'), '缺少 base 基础情况 dp[2]=1 帧').toBe(true);
    expect(steps.some(s => s.type === 'loop-outer'), '缺少 loop-outer 外层循环头帧').toBe(true);
    expect(steps.some(s => s.type === 'loop-inner'), '缺少 loop-inner 切分点枚举内循环帧').toBe(true);
    expect(steps.some(s => s.type === 'transfer'), '缺少 transfer 极值决策与赋值帧').toBe(true);
    expect(steps.some(s => s.type === 'return'), '缺少 return 最终收敛返回帧').toBe(true);

    // 4. Card 2 决策天平完整性物理断言：每个 transfer 必须包含两路分支比对
    const transferSteps = steps.filter(s => s.type === 'transfer');
    for (const step of transferSteps) {
      expect(Array.isArray(step.decisions) && step.decisions.length >= 2, `第 ${step.i} 阶切分点 j=${step.j} 缺少决策天平数据`).toBe(true);
      const decA = step.decisions![0];
      const decB = step.decisions![1];
      expect(decA.formula).toContain('j * (i - j)');
      expect(decB.formula).toContain('j * dp[i - j]');
    }

    // 5. 结果正确性断言：n=6 时最大拆分乘积必须为 9 (3 * 3)
    const returnStep = steps.find(s => s.type === 'return')!;
    const finalDp = returnStep.dp1d || returnStep.memo;
    expect(finalDp?.[6], 'n=6 时最大拆分乘积必须为 9').toBe(9);
  });

  it('Stage 4 (数学贪心 O(1) 优化) 极值推导断言', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    const steps = UniversalStageEngine.generateStage4Steps(model, 6, 6, 'forward');

    expect(steps.length, 'Stage 4 步数过短').toBeGreaterThanOrEqual(4);
    expect(steps.some(s => s.type === 'return'), 'Stage 4 缺少 return 帧').toBe(true);
  });
});
