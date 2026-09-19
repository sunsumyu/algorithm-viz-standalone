import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../model-repository';
import { AlgorithmStrategyRegistry } from './algorithm-strategy-registry';
import { registerBuiltinStrategies } from './index';
import { UniversalPhysicsGate } from '../testing/universal-physics-gate';
import { UniversalStageEngine } from '../universal-stage-engine';

registerBuiltinStrategies();

describe('完全平方数 (Perfect Squares LC 279) 顶层 TDD 门禁测试', () => {
  const algoId = 'perfect-squares';

  it('模型必须能在 AlgorithmModelRepository 中成功加载，且具备 4 个完整演化阶段', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    expect(model, `未找到模型: ${algoId}`).toBeDefined();
    expect(model.stages['stage-1'], '缺少阶段 1 (递归树)').toBeDefined();
    expect(model.stages['stage-2'], '缺少阶段 2 (记忆化)').toBeDefined();
    expect(model.stages['stage-3'], '缺少阶段 3 (递推DP)').toBeDefined();
    expect(model.stages['stage-4'], '缺少阶段 4 (四平方和定理)').toBeDefined();
  });

  it('Stage 3 (一维完全平方数切分递推DP) 零位安全与 Card 2 决策天平断言', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    // 采用经典测例 n = 12 (4 + 4 + 4 => 3)
    const steps = UniversalStageEngine.generateStage3Steps(model, 12, 12, 'forward');

    // 1. 步数充足度断言
    expect(steps.length, '步骤过短，存在跳步').toBeGreaterThanOrEqual(25);

    // 2. 通用物理门禁断言
    UniversalPhysicsGate.assertStepInvariants(steps, {
      algorithmId: algoId,
      stage: 3,
      direction: 'forward',
      minSteps: 20,
      requireJump: false,
      requireZeroSlot: true, // dp[0] 必须严格为 0
      requireDecisions: true
    });

    // 3. 生命周期完整性物理断言
    expect(steps.some(s => s.type === 'init'), '缺少 init 分配数组帧').toBe(true);
    expect(steps.some(s => s.type === 'base'), '缺少 base 基础情况 dp[0]=0 帧').toBe(true);
    expect(steps.some(s => s.type === 'loop-outer'), '缺少 loop-outer 外层循环头帧').toBe(true);
    expect(steps.some(s => s.type === 'loop-inner'), '缺少 loop-inner 切分点枚举内循环帧').toBe(true);
    expect(steps.some(s => s.type === 'transfer'), '缺少 transfer 极值决策与赋值帧').toBe(true);
    expect(steps.some(s => s.type === 'return'), '缺少 return 最终收敛返回帧').toBe(true);

    // 4. Card 2 决策天平完整性物理断言
    const transferSteps = steps.filter(s => s.type === 'transfer');
    for (const step of transferSteps) {
      expect(Array.isArray(step.decisions) && step.decisions.length >= 2, `第 ${step.i} 阶切分点 j=${step.j} 缺少决策天平数据`).toBe(true);
      const decA = step.decisions![0];
      const decB = step.decisions![1];
      expect(decA.formula).toContain('dp[i]');
      expect(decB.formula).toContain('dp[i - j*j] + 1');
    }

    // 5. 结果正确性断言：n=12 时最少平方数个数必须为 3 (4 + 4 + 4)
    const returnStep = steps.find(s => s.type === 'return')!;
    const finalDp = returnStep.dp1d || returnStep.memo;
    expect(finalDp?.[0], 'dp[0] 必须等于 0').toBe(0);
    expect(finalDp?.[12], 'n=12 时最少平方数个数必须为 3').toBe(3);
  });

  it('Stage 4 (四平方和定理优化) 推导断言', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    const steps = UniversalStageEngine.generateStage4Steps(model, 12, 12, 'forward');

    expect(steps.length, 'Stage 4 步数过短').toBeGreaterThanOrEqual(4);
    expect(steps.some(s => s.type === 'return'), 'Stage 4 缺少 return 帧').toBe(true);
    const returnStep = steps.find(s => s.type === 'return')!;
    expect(returnStep.msg || returnStep.log).toContain('3');
  });
});
