import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../model-repository';
import { AlgorithmStrategyRegistry } from './algorithm-strategy-registry';
import { registerBuiltinStrategies } from './index';
import { UniversalPhysicsGate } from '../testing/universal-physics-gate';
import { UniversalStageEngine } from '../universal-stage-engine';

registerBuiltinStrategies();

describe('零钱兑换 II (Coin Change II LC 518) 顶层 TDD 门禁测试', () => {
  const algoId = 'coin-change-ii';

  it('模型必须能在 AlgorithmModelRepository 中成功加载，且具备 4 个完整演化阶段', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    expect(model, `未找到模型: ${algoId}`).toBeDefined();
    expect(model.stages['stage-1'], '缺少阶段 1 (递归树)').toBeDefined();
    expect(model.stages['stage-2'], '缺少阶段 2 (记忆化)').toBeDefined();
    expect(model.stages['stage-3'], '缺少阶段 3 (递推DP)').toBeDefined();
    expect(model.stages['stage-4'], '缺少阶段 4 (空间压缩)').toBeDefined();
  });

  it('Stage 3 (一维完全背包组合数累加递推DP) 零位安全与 Card 2 决策天平断言', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    // 采用经典测例 amount = 5, coins = [1, 2, 5] => 4
    const steps = UniversalStageEngine.generateStage3Steps(model, 5, 5, 'forward');

    // 1. 步数充足度断言
    expect(steps.length, '步骤过短，存在跳步').toBeGreaterThanOrEqual(15);

    // 2. 通用物理门禁断言
    UniversalPhysicsGate.assertStepInvariants(steps, {
      algorithmId: algoId,
      stage: 3,
      direction: 'forward',
      minSteps: 12,
      requireJump: false,
      requireZeroSlot: true, // dp[0] 必须等于 1 (1 种空方案)
      requireDecisions: true
    });

    // 3. 生命周期完整性物理断言
    expect(steps.some(s => s.type === 'init'), '缺少 init 分配数组帧').toBe(true);
    expect(steps.some(s => s.type === 'base'), '缺少 base 基础情况 dp[0]=1 帧').toBe(true);
    expect(steps.some(s => s.type === 'loop-outer'), '缺少 loop-outer 硬币枚举外层循环帧').toBe(true);
    expect(steps.some(s => s.type === 'loop-inner'), '缺少 loop-inner 金额枚举内循环帧').toBe(true);
    expect(steps.some(s => s.type === 'transfer'), '缺少 transfer 组合数累加赋值帧').toBe(true);
    expect(steps.some(s => s.type === 'return'), '缺少 return 最终收敛返回帧').toBe(true);

    // 4. Card 2 决策天平完整性物理断言
    const transferSteps = steps.filter(s => s.type === 'transfer');
    for (const step of transferSteps) {
      expect(Array.isArray(step.decisions) && step.decisions.length >= 2, `第 ${step.i} 阶金额 j=${step.j} 缺少决策天平数据`).toBe(true);
      const decA = step.decisions![0];
      const decB = step.decisions![1];
      expect(decA.formula).toContain('dp[i]');
      expect(decB.formula).toContain('dp[i - c]');
    }

    // 5. 结果正确性断言：amount=5 时组合数必须为 4
    const returnStep = steps.find(s => s.type === 'return')!;
    const finalDp = returnStep.dp1d || returnStep.memo;
    expect(finalDp?.[0], 'dp[0] 必须等于 1').toBe(1);
    expect(finalDp?.[5], 'amount=5 时组合数必须等于 4').toBe(4);
  });

  it('Stage 4 (空间压缩与循环顺序解析) 推导断言', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    const steps = UniversalStageEngine.generateStage4Steps(model, 5, 5, 'forward');

    expect(steps.length, 'Stage 4 步数过短').toBeGreaterThanOrEqual(4);
    expect(steps.some(s => s.type === 'return'), 'Stage 4 缺少 return 帧').toBe(true);
    const returnStep = steps.find(s => s.type === 'return')!;
    expect(returnStep.msg || returnStep.log).toContain('4');
  });
});
