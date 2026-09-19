import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../model-repository';
import { AlgorithmStrategyRegistry } from './algorithm-strategy-registry';
import { registerBuiltinStrategies } from './index';
import { UniversalPhysicsGate } from '../testing/universal-physics-gate';
import { UniversalStageEngine } from '../universal-stage-engine';

registerBuiltinStrategies();

describe('交错字符串 (Interleaving String LC 97) 黄金基准 TDD 门禁测试', () => {
  const algoId = 'interleaving-string';

  it('模型必须能在 AlgorithmModelRepository 中成功加载，且具备 4 个完整演化阶段', () => {
    expect(AlgorithmModelRepository.hasModel(algoId)).toBe(true);
    const model = AlgorithmModelRepository.getModel(algoId);
    expect(model, `未找到模型: ${algoId}`).toBeDefined();
    expect(model.stages['stage-1'], '缺少阶段 1 (递归)').toBeDefined();
    expect(model.stages['stage-2'], '缺少阶段 2 (记忆化)').toBeDefined();
    expect(model.stages['stage-3'], '缺少阶段 3 (二维DP)').toBeDefined();
    expect(model.stages['stage-4'], '缺少阶段 4 (空间压缩)').toBeDefined();
  });

  it('策略注册中心必须正确匹配 interleaving-string', () => {
    const strategy = AlgorithmStrategyRegistry.get(algoId);
    expect(strategy).toBeDefined();
    expect(strategy!.canHandle(algoId)).toBe(true);
  });

  it('Stage 1 递归必须构建合法 DFS 树、调用栈与足迹', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    const steps = UniversalStageEngine.generateStage1or2Steps(model, 6, 6, 'forward', false);

    expect(steps.length).toBeGreaterThanOrEqual(10);
    expect(steps[0].treeRoot).toBeDefined();
    expect(steps[0].activeNodeId).toBeDefined();

    const inFlight = steps.filter(s => s.activeTrail && s.activeTrail.length >= 2);
    expect(inFlight.length, '深入探索时必须保留足迹 activeTrail').toBeGreaterThan(0);

    const deepStack = steps.filter(s => s.callStack && s.callStack.length >= 2);
    expect(deepStack.length, '深入探索时必须保留 callStack').toBeGreaterThan(0);

    const returnStep = steps[steps.length - 1];
    expect(returnStep.type).toBe('return');
  });

  it('Stage 2 记忆化搜索在遇到重叠子问题时必须能够记录 cache-hit 剪枝步骤', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    // 使用精准触发双向汇聚的测试用例 (s1='ab', s2='ab', s3='aabc')：
    // 分支 1 (s1->s2) 与 分支 2 (s2->s1) 均会到达 (1,1)，后者必然命中 memo[1][1] 缓存剪枝
    const overlapModel = {
      ...model,
      defaultParams: { s1: 'ab', s2: 'ab', s3: 'aabc' }
    };
    const steps = UniversalStageEngine.generateStage1or2Steps(overlapModel, 3, 3, 'forward', true);

    const hitSteps = steps.filter(s => s.type === 'cache-hit');
    expect(hitSteps.length, '记忆化阶段必须触发 cache-hit 剪枝').toBeGreaterThan(0);
  });

  it('Stage 3 严格二维表拓扑递推：Step 0 纯净 null 防御，生命周期完整且双向发散', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    const fSteps = UniversalStageEngine.generateStage3Steps(model, 6, 6, 'forward');
    const rSteps = UniversalStageEngine.generateStage3Steps(model, 6, 6, 'reverse');

    // 1. Step 0 纯净 null 防御
    const f0 = fSteps[0];
    expect(f0.type).toBe('init');
    const f0Grid = f0.grid!;
    const f0NonNulls = f0Grid.flatMap(r => r).filter(v => v !== null && v !== undefined);
    expect(f0NonNulls.length, '【架构死规矩拦截】Stage 3 (顺推) 首帧网格必须全为 null').toBe(0);

    const r0 = rSteps[0];
    expect(r0.type).toBe('init');
    const r0Grid = r0.grid!;
    const r0NonNulls = r0Grid.flatMap(r => r).filter(v => v !== null && v !== undefined);
    expect(r0NonNulls.length, '【架构死规矩拦截】Stage 3 (逆推) 首帧网格必须全为 null').toBe(0);

    // 2. 通用物理门禁与决策断言
    UniversalPhysicsGate.assertStepInvariants(fSteps, {
      algorithmId: algoId,
      stage: 3,
      direction: 'forward',
      minSteps: 20,
      requireJump: false,
      requireZeroSlot: true,
      requireDecisions: true
    });

    UniversalPhysicsGate.assertStepInvariants(rSteps, {
      algorithmId: algoId,
      stage: 3,
      direction: 'reverse',
      minSteps: 20,
      requireJump: false,
      requireZeroSlot: true,
      requireDecisions: true
    });

    // 3. 顺逆推差异性拓扑断言
    UniversalPhysicsGate.assertDivergence(fSteps, rSteps, algoId, { requireDecisions: true, requireJump: false });

    // 4. 最终答案断言 (aabcc + dbbca -> aadbbcbcac = true)
    const fReturn = fSteps[fSteps.length - 1];
    expect(fReturn.type).toBe('return');
    expect(fReturn.grid![5][5]).toBe(1);

    const rReturn = rSteps[rSteps.length - 1];
    expect(rReturn.type).toBe('return');
    expect(rReturn.grid![0][0]).toBe(1);
  });

  it('Stage 4 一维空间压缩优化：Step 0 纯净 null，网格严格降维至一维，物理实体跳跃有效', () => {
    const model = AlgorithmModelRepository.getModel(algoId);
    const fSteps = UniversalStageEngine.generateStage4Steps(model, 6, 6, 'forward');
    const rSteps = UniversalStageEngine.generateStage4Steps(model, 6, 6, 'reverse');

    // 1. Step 0 纯净 null 防御
    const f0 = fSteps[0];
    expect(f0.type).toBe('init');
    const f0Grid = f0.grid!;
    expect(f0Grid.length, 'Stage 4 必须严格压缩为 1 行').toBe(1);
    const f0NonNulls = f0Grid[0].filter(v => v !== null && v !== undefined);
    expect(f0NonNulls.length, '【架构死规矩拦截】Stage 4 (顺推) 首帧网格必须全为 null').toBe(0);

    const r0 = rSteps[0];
    expect(r0.type).toBe('init');
    const r0Grid = r0.grid!;
    expect(r0Grid.length, 'Stage 4 必须严格压缩为 1 行').toBe(1);
    const r0NonNulls = r0Grid[0].filter(v => v !== null && v !== undefined);
    expect(r0NonNulls.length, '【架构死规矩拦截】Stage 4 (逆推) 首帧网格必须全为 null').toBe(0);

    // 2. 空间压缩物理跳跃断言
    UniversalPhysicsGate.assertStepInvariants(fSteps, {
      algorithmId: `${algoId} Stage 4 [顺推]`,
      stage: 4,
      direction: 'forward',
      minSteps: 15,
      requireJump: true,
      requireZeroSlot: true,
      requireDecisions: true
    });

    UniversalPhysicsGate.assertStepInvariants(rSteps, {
      algorithmId: `${algoId} Stage 4 [逆推]`,
      stage: 4,
      direction: 'reverse',
      minSteps: 15,
      requireJump: true,
      requireZeroSlot: true,
      requireDecisions: true
    });

    // 3. 结果正确性
    const fReturn = fSteps[fSteps.length - 1];
    expect(fReturn.grid![0][5]).toBe(1);

    const rReturn = rSteps[rSteps.length - 1];
    expect(rReturn.grid![0][0]).toBe(1);
  });
});
