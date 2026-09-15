import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../model-repository';
import { StageNavigationCoordinator } from '../controllers/stage-navigation-coordinator';
import { YamlModelLoader } from '../yaml-model-loader';
import { AlgorithmStrategyRegistry } from './algorithm-strategy-registry';
import { registerBuiltinStrategies } from './index';
import type { IYamlAlgorithmModel } from '../interfaces';

registerBuiltinStrategies();

/**
 * 算法推导方向真实性与差异性物理门禁测试 (Direction Divergence Architecture Gate)
 * 
 * 核心架构约束与防线：
 * 1. 杜绝伪双向欺骗：任何在 directions 中声明了多方向（如 forward 与 reverse）的模型，
 *    严禁在各阶段复制代码做 100% 字符同构（Copy-Paste 坏味道）。
 * 2. 差异性物理阻断：通过 StageNavigationCoordinator.areDirectionsIsomorphic 进行源码级结构审计，
 *    若顺推与逆推代码完全同构，门禁强制失败，阻断 CI 合并。
 * 3. 步骤流拓扑差异：若策略层支持多方向，生成的执行步骤在起点/终点或关键拓扑转移上必须存在差异，
 *    杜绝“代码微改但生成器丢弃 direction 参数永远跑单向”的隐形 Bug。
 * 4. 规范提倡：单向推导完全合法，不应为形式主义制造虚假的 reverse 分支。
 */
describe('算法推导方向真实性与差异性物理门禁 (Direction Divergence Architecture Gate)', () => {
  it('门禁检测函数 StageNavigationCoordinator.areDirectionsIsomorphic 应当能准确识别同构代码', () => {
    const fakeDualModel: IYamlAlgorithmModel = {
      id: 'fake-dual-test',
      name: '伪双向测试模型',
      category: 'dynamic-programming',
      stages: {
        'stage-1': {
          type: 'recursion',
          name: '阶段 1',
          desc: '测试',
          code: {
            forward: { title: 'A.java', source: 'class Solution { public int test() { return 1; } }' },
            reverse: { title: 'A.java', source: 'class Solution { public int test() { return 1; } }' },
          }
        },
        'stage-3': {
          type: 'tabulation-2d',
          name: '阶段 3',
          desc: '测试',
          code: {
            forward: { title: 'B.java', source: 'for (int i = 0; i < n; i++) dp[i] = 1;' },
            reverse: { title: 'B.java', source: 'for (int i = 0; i < n; i++) dp[i] = 1;' },
          }
        }
      },
      directions: {
        forward: { label: '顺推', branches: [] },
        reverse: { label: '逆推', branches: [] }
      }
    } as unknown as IYamlAlgorithmModel;

    // 应该准确判定为假双向同构
    expect(StageNavigationCoordinator.areDirectionsIsomorphic(fakeDualModel)).toBe(true);

    // 制造真实差异
    const trueDualModel: IYamlAlgorithmModel = {
      ...fakeDualModel,
      stages: {
        ...fakeDualModel.stages,
        'stage-3': {
          type: 'tabulation-2d',
          name: '阶段 3',
          desc: '测试',
          code: {
            forward: { title: 'B.java', source: 'for (int i = 0; i < n; i++) dp[i] = 1;' },
            reverse: { title: 'B.java', source: 'for (int i = n - 1; i >= 0; i--) dp[i] = 1;' },
          }
        }
      }
    } as unknown as IYamlAlgorithmModel;

    expect(StageNavigationCoordinator.areDirectionsIsomorphic(trueDualModel)).toBe(false);
  });

  it('全库已注册 YAML 模型审计：严禁任何多方向模型存在顺推与逆推代码完全同构的虚假实现', () => {
    const modelIds = AlgorithmModelRepository.getAllIds();
    const violationModels: { id: string; reason: string }[] = [];

    for (const id of modelIds) {
      const model = AlgorithmModelRepository.getModel(id);
      if (!model.directions) continue;

      const dirKeys = Object.keys(model.directions);
      const isMultiDir = dirKeys.includes('forward') && dirKeys.includes('reverse');

      if (isMultiDir) {
        const isIsomorphic = StageNavigationCoordinator.areDirectionsIsomorphic(model);
        if (isIsomorphic) {
          violationModels.push({
            id,
            reason: `声明了 forward 与 reverse 两个方向，但所有阶段的代码完全同构！请提供真实逆推实现，或收敛为单向 forward。`
          });
        }
      }
    }

    if (violationModels.length > 0) {
      const report = violationModels
        .map(v => `  - [${v.id}]: ${v.reason}`)
        .join('\n');
      throw new Error(`[DirectionDivergenceGate] 发现 ${violationModels.length} 个虚假双向模型：\n${report}`);
    }

    expect(violationModels.length).toBe(0);
  });

  it('真正的双向模型 (如 unique-paths) 的代码与步骤必须具有显著差异性', () => {
    const upModel = AlgorithmModelRepository.getModel('unique-paths');
    expect(StageNavigationCoordinator.areDirectionsIsomorphic(upModel)).toBe(false);

    // 步骤流验证
    const strategy = AlgorithmStrategyRegistry.get('unique-paths')!;
    expect(strategy).toBeDefined();
    const fSteps = strategy.generateSteps(upModel, { stage: 3, direction: 'forward' });
    const rSteps = strategy.generateSteps(upModel, { stage: 3, direction: 'reverse' });

    expect(fSteps.length).toBeGreaterThan(0);
    expect(rSteps.length).toBeGreaterThan(0);

    // 顺推起点在 (0, 0) 或顶行，逆推起点在终点 (m-1, n-1)
    const fCoords = fSteps.filter(s => s.i !== undefined && s.j !== undefined).map(s => `${s.i},${s.j}`);
    const rCoords = rSteps.filter(s => s.i !== undefined && s.j !== undefined).map(s => `${s.i},${s.j}`);

    expect(fCoords.length).toBeGreaterThan(0);
    expect(rCoords.length).toBeGreaterThan(0);

    // 两向的步骤首个填表格点必不相同 (顺推左上 vs 逆推右下)
    expect(fCoords[0]).not.toEqual(rCoords[0]);
  });

  it('不同的子序列 (distinct-subsequences) 作为真双向模型，顺推与逆推在代码与步骤上必须具备显著差异', () => {
    const distinctModel = AlgorithmModelRepository.getModel('distinct-subsequences');
    const dirKeys = Object.keys(distinctModel.directions || {});
    expect(dirKeys).toContain('forward');
    expect(dirKeys).toContain('reverse');

    // 1. 代码差异断言（前缀递推 vs 后缀递推）
    expect(StageNavigationCoordinator.areDirectionsIsomorphic(distinctModel)).toBe(false);

    // 2. 步骤流差异断言（顺推填表向右下 vs 逆推填表向左上）
    const strategy = AlgorithmStrategyRegistry.get('distinct-subsequences')!;
    expect(strategy).toBeDefined();

    const fSteps = strategy.generateSteps(distinctModel, { stage: 3, direction: 'forward' });
    const rSteps = strategy.generateSteps(distinctModel, { stage: 3, direction: 'reverse' });

    expect(fSteps.length).toBeGreaterThan(0);
    expect(rSteps.length).toBeGreaterThan(0);

    const fTransfers = fSteps.filter(s => s.type === 'transfer');
    const rTransfers = rSteps.filter(s => s.type === 'transfer');

    expect(fTransfers.length).toBeGreaterThan(0);
    expect(rTransfers.length).toBeGreaterThan(0);

    // 顺推首个转移格为 (1, 1)，逆推首个转移格为右下角 (m-1, n-1) 即 (6, 5)
    expect(`${fTransfers[0].i},${fTransfers[0].j}`).toBe('1,1');
    expect(`${rTransfers[0].i},${rTransfers[0].j}`).toBe('6,5');

    // 3. Stage 1/2 顺推从 (0, 0) 开始向后探索，逆推从 (m, n) 开始向前寻源
    const f1Steps = strategy.generateSteps(distinctModel, { stage: 1, direction: 'forward' });
    const r1Steps = strategy.generateSteps(distinctModel, { stage: 1, direction: 'reverse' });
    expect(f1Steps[0].i).toBe(0);
    expect(f1Steps[0].j).toBe(0);
    expect(r1Steps[0].i).toBe(7);
    expect(r1Steps[0].j).toBe(6);

    // 4. Card 2 留痕完整性与回溯栈断言：在搜索路径与 Base Case 上，走过的匹配字符必须保留痕迹，且回溯时出栈
    const matchSteps = f1Steps.filter(s => (s as any).matchedIndices1 && (s as any).matchedIndices1.length > 0);
    expect(matchSteps.length).toBeGreaterThan(0);
    // 当找到一个目标串完全匹配的叶子节点时（Base Case 达成有效方案），matchedIndices2 必须包含全部目标串字符索引 [0..5]
    const successStep = f1Steps.find(s => s.log?.includes('目标串已全部匹配完毕') || s.msg?.includes('成功寻得 1 种有效子序列方案'));
    expect(successStep).toBeDefined();
    expect((successStep as any).matchedIndices2).toEqual([0, 1, 2, 3, 4, 5]);
    expect((successStep as any).matchedIndices1.length).toBe(6);
  });

  it('最长公共子序列 (longest-common-subsequence) 黄金基准双向模型，顺推与逆推在代码、转移格与复合视图元数据上必须具备严格差异', () => {
    const lcsModel = AlgorithmModelRepository.getModel('longest-common-subsequence');
    const dirKeys = Object.keys(lcsModel.directions || {});
    expect(dirKeys).toContain('forward');
    expect(dirKeys).toContain('reverse');

    // 1. 代码非同构断言
    expect(StageNavigationCoordinator.areDirectionsIsomorphic(lcsModel)).toBe(false);

    // 2. 步骤流拓扑差异断言
    const strategy = AlgorithmStrategyRegistry.get('longest-common-subsequence')!;
    expect(strategy).toBeDefined();

    const fSteps = strategy.generateSteps(lcsModel, { stage: 3, direction: 'forward' });
    const rSteps = strategy.generateSteps(lcsModel, { stage: 3, direction: 'reverse' });
    expect(fSteps.length).toBeGreaterThan(0);
    expect(rSteps.length).toBeGreaterThan(0);

    const fTransfers = fSteps.filter(s => s.type === 'transfer');
    const rTransfers = rSteps.filter(s => s.type === 'transfer');
    expect(fTransfers.length).toBeGreaterThan(0);
    expect(rTransfers.length).toBeGreaterThan(0);

    // 顺推从 (1, 1) 开始，逆推从 (m-1, n-1) 即 (4, 2) 开始
    expect(`${fTransfers[0].i},${fTransfers[0].j}`).toBe('1,1');
    expect(`${rTransfers[0].i},${rTransfers[0].j}`).toBe('4,2');

    // 3. 递归起点对偶断言
    const f1 = strategy.generateSteps(lcsModel, { stage: 1, direction: 'forward' });
    const r1 = strategy.generateSteps(lcsModel, { stage: 1, direction: 'reverse' });
    expect(f1[0].i).toBe(0);
    expect(f1[0].j).toBe(0);
    expect(r1[0].i).toBe(5);
    expect(r1[0].j).toBe(3);

    // 4. Card 2 复合子视图元数据字段完整性断言
    expect((f1[0] as any).s1).toBeDefined();
    expect((f1[0] as any).s2).toBeDefined();
    expect((f1[0] as any).curI).toBeDefined();
    expect((f1[0] as any).curJ).toBeDefined();
    expect((f1[0] as any).callStack).toBeDefined();
  });

  it('编辑距离 (edit-distance) 双向模型，顺推与逆推在代码与步骤上必须具备显著对偶差异', () => {
    const editModel = AlgorithmModelRepository.getModel('edit-distance');
    const dirKeys = Object.keys(editModel.directions || {});
    expect(dirKeys).toContain('forward');
    expect(dirKeys).toContain('reverse');

    // 1. 代码非同构断言
    expect(StageNavigationCoordinator.areDirectionsIsomorphic(editModel)).toBe(false);

    // 2. 步骤流拓扑差异断言
    const strategy = AlgorithmStrategyRegistry.get('edit-distance')!;
    expect(strategy).toBeDefined();

    const fSteps = strategy.generateSteps(editModel, { stage: 3, direction: 'forward' });
    const rSteps = strategy.generateSteps(editModel, { stage: 3, direction: 'reverse' });
    expect(fSteps.length).toBeGreaterThan(0);
    expect(rSteps.length).toBeGreaterThan(0);

    const fTransfers = fSteps.filter(s => s.type === 'transfer');
    const rTransfers = rSteps.filter(s => s.type === 'transfer');
    expect(fTransfers.length).toBeGreaterThan(0);
    expect(rTransfers.length).toBeGreaterThan(0);

    // 顺推首格为 (1, 1)，逆推首格为 (4, 2)
    expect(`${fTransfers[0].i},${fTransfers[0].j}`).toBe('1,1');
    expect(`${rTransfers[0].i},${rTransfers[0].j}`).toBe('4,2');

    // 3. 递归起点对偶断言
    const f1 = strategy.generateSteps(editModel, { stage: 1, direction: 'forward' });
    const r1 = strategy.generateSteps(editModel, { stage: 1, direction: 'reverse' });
    expect(f1[0].i).toBe(0);
    expect(f1[0].j).toBe(0);
    expect(r1[0].i).toBe(5);
    expect(r1[0].j).toBe(3);

    // 4. Card 2 复合子视图元数据字段完整性断言
    expect((f1[0] as any).s1).toBeDefined();
    expect((f1[0] as any).s2).toBeDefined();
    expect((f1[0] as any).callStack).toBeDefined();
  });

  it('两个字符串的删除操作 (delete-operation-for-two-strings) 双向模型，顺推与逆推在代码与步骤上必须具备显著对偶差异', () => {
    const delModel = AlgorithmModelRepository.getModel('delete-operation-for-two-strings');
    const dirKeys = Object.keys(delModel.directions || {});
    expect(dirKeys).toContain('forward');
    expect(dirKeys).toContain('reverse');

    // 1. 代码非同构断言
    expect(StageNavigationCoordinator.areDirectionsIsomorphic(delModel)).toBe(false);

    // 2. 步骤流拓扑差异断言
    const strategy = AlgorithmStrategyRegistry.get('delete-operation-for-two-strings')!;
    expect(strategy).toBeDefined();

    const fSteps = strategy.generateSteps(delModel, { stage: 3, direction: 'forward' });
    const rSteps = strategy.generateSteps(delModel, { stage: 3, direction: 'reverse' });
    expect(fSteps.length).toBeGreaterThan(0);
    expect(rSteps.length).toBeGreaterThan(0);

    const fTransfers = fSteps.filter(s => s.type === 'transfer');
    const rTransfers = rSteps.filter(s => s.type === 'transfer');
    expect(fTransfers.length).toBeGreaterThan(0);
    expect(rTransfers.length).toBeGreaterThan(0);

    // 顺推首格为 (1, 1)，逆推首格为 (2, 2) ('sea' vs 'eat', m=3, n=3 -> m-1=2, n-1=2)
    expect(`${fTransfers[0].i},${fTransfers[0].j}`).toBe('1,1');
    expect(`${rTransfers[0].i},${rTransfers[0].j}`).toBe('2,2');

    // 3. 递归起点对偶断言
    const f1 = strategy.generateSteps(delModel, { stage: 1, direction: 'forward' });
    const r1 = strategy.generateSteps(delModel, { stage: 1, direction: 'reverse' });
    expect(f1[0].i).toBe(0);
    expect(f1[0].j).toBe(0);
    expect(r1[0].i).toBe(3);
    expect(r1[0].j).toBe(3);

    // 4. Card 2 复合子视图元数据字段完整性断言
    expect((f1[0] as any).s1).toBeDefined();
    expect((f1[0] as any).s2).toBeDefined();
    expect((f1[0] as any).callStack).toBeDefined();
  });

  it('顶层零跳步门禁 (Zero Skipping Invariant Gate)：四大序列DP算法阶段3必须严格包含 loop_i, loop_j, cond 步骤，物理杜绝跳步', () => {
    const sequenceAlgoIds = [
      'distinct-subsequences',
      'longest-common-subsequence',
      'edit-distance',
      'delete-operation-for-two-strings'
    ];

    for (const algoId of sequenceAlgoIds) {
      const model = AlgorithmModelRepository.getModel(algoId);
      const strategy = AlgorithmStrategyRegistry.get(algoId)!;
      expect(strategy).toBeDefined();

      for (const direction of ['forward', 'reverse'] as const) {
        const steps = strategy.generateSteps(model, { stage: 3, direction });
        expect(steps.length).toBeGreaterThan(0);

        // 1. 生命周期步骤完整性物理断言
        const hasInit = steps.some(s => s.type === 'init');
        const hasInitLoop = steps.some(s => s.type === 'init-loop');
        const hasInitCol = steps.some(s => s.type === 'init-col' || s.type === 'init-row');
        const hasLoopOuter = steps.some(s => s.type === 'loop-outer');
        const hasLoopInner = steps.some(s => s.type === 'loop-inner');
        const hasCond = steps.some(s => s.type === 'cond');
        const hasTransfer = steps.some(s => s.type === 'transfer');
        const hasReturn = steps.some(s => s.type === 'return');

        expect(hasInit, `${algoId} (${direction}) 缺少 init 表格分配帧`).toBe(true);
        expect(hasInitLoop, `${algoId} (${direction}) 缺少 init-loop 边界循环头帧`).toBe(true);
        expect(hasInitCol, `${algoId} (${direction}) 缺少 init-col/init-row 边界循环体赋值帧`).toBe(true);
        expect(hasLoopOuter, `${algoId} (${direction}) 缺少 loop-outer 外层循环头帧`).toBe(true);
        expect(hasLoopInner, `${algoId} (${direction}) 缺少 loop-inner 内层循环头帧`).toBe(true);
        expect(hasCond, `${algoId} (${direction}) 缺少 cond 字符比对条件判断帧`).toBe(true);
        expect(hasTransfer, `${algoId} (${direction}) 缺少 transfer 状态转移帧`).toBe(true);
        expect(hasReturn, `${algoId} (${direction}) 缺少 return 最终收敛返回帧`).toBe(true);

        // 2. 循环进入物理断言（杜绝高亮冻结在 for 循环头不进入循环体）：
        // 边界循环头 (init-loop) 与循环体赋值 (init-col) 的代码高亮行号绝不能相同
        const firstLoopStep = steps.find(s => s.type === 'init-loop');
        const firstValStep = steps.find(s => s.type === 'init-col' || s.type === 'init-row');
        if (firstLoopStep && firstValStep && firstLoopStep.line !== undefined && firstValStep.line !== undefined) {
          expect(
            firstLoopStep.line,
            `${algoId} (${direction}) 边界循环头与赋值语句行号重合（高亮冻结未进循环体）: loopLine=${firstLoopStep.line}, valLine=${firstValStep.line}`
          ).not.toBe(firstValStep.line);
        }

        // 3. 局部相对顺序物理断言：每一个 transfer 步骤前必有对应单元格的 cond 条件判断帧
        const condCoords = new Set(steps.filter(s => s.type === 'cond').map(s => `${s.i},${s.j}`));
        const transferSteps = steps.filter(s => s.type === 'transfer');
        for (const ts of transferSteps) {
          expect(condCoords.has(`${ts.i},${ts.j}`), `${algoId} (${direction}) 单元格 (${ts.i}, ${ts.j}) 转移前未执行 cond 判定`).toBe(true);
        }
      }
    }
  });

  it('顶层区间 DP 零跳步门禁 (Interval DP Zero Skipping Gate)：最长回文子序列与回文子串阶段 3 必须严格包含 loop-outer, loop-inner, cond 帧，物理杜绝跳步', () => {
    const intervalAlgoIds = [
      'longest-palindromic-subsequence',
      'palindromic-substrings'
    ];

    for (const algoId of intervalAlgoIds) {
      const model = AlgorithmModelRepository.getModel(algoId);
      const strategy = AlgorithmStrategyRegistry.get(algoId)!;
      expect(strategy, `未找到算法策略: ${algoId}`).toBeDefined();

      const steps = strategy.generateSteps(model, { stage: 3 });
      expect(steps.length).toBeGreaterThan(0);

      // 1. 生命周期步骤完整性物理断言
      const hasInit = steps.some(s => s.type === 'init');
      const hasLoopOuter = steps.some(s => s.type === 'loop-outer');
      const hasLoopInner = steps.some(s => s.type === 'loop-inner');
      const hasCond = steps.some(s => s.type === 'cond');
      const hasTransfer = steps.some(s => s.type === 'transfer');
      const hasReturn = steps.some(s => s.type === 'return');

      expect(hasInit, `${algoId} 缺少 init 上三角表格分配帧`).toBe(true);
      expect(hasLoopOuter, `${algoId} 缺少 loop-outer 倒序外层循环头帧`).toBe(true);
      expect(hasLoopInner, `${algoId} 缺少 loop-inner 正序内层循环头帧`).toBe(true);
      expect(hasCond, `${algoId} 缺少 cond 端点字符比对条件判断帧`).toBe(true);
      expect(hasTransfer, `${algoId} 缺少 transfer 状态转移与赋值帧`).toBe(true);
      expect(hasReturn, `${algoId} 缺少 return 最终收敛返回帧`).toBe(true);

      // 2. 局部相对顺序物理断言：每一个 transfer 步骤前必有对应单元格的 cond 条件判断帧
      const condCoords = new Set(steps.filter(s => s.type === 'cond').map(s => `${s.i},${s.j}`));
      const transferSteps = steps.filter(s => s.type === 'transfer');
      for (const ts of transferSteps) {
        expect(condCoords.has(`${ts.i},${ts.j}`), `${algoId} 单元格 (${ts.i}, ${ts.j}) 转移前未执行 cond 判定`).toBe(true);
      }
    }
  });

  it('顶层背包 DP 零跳步门禁 (Knapsack DP Zero Skipping Gate)：背包族群阶段 3 必须严格包含 loop-outer, loop-inner, cond 帧，物理杜绝跳步', () => {
    const knapsackAlgoIds = [
      'knapsack-01',
      'partition-equal-subset-sum'
    ];

    for (const algoId of knapsackAlgoIds) {
      const model = AlgorithmModelRepository.getModel(algoId);
      const strategy = AlgorithmStrategyRegistry.get(algoId)!;
      expect(strategy, `未找到算法策略: ${algoId}`).toBeDefined();

      const steps = strategy.generateSteps(model, { stage: 3 });
      expect(steps.length).toBeGreaterThan(0);

      // 1. 生命周期步骤完整性物理断言
      const hasInit = steps.some(s => s.type === 'init');
      const hasLoopOuter = steps.some(s => s.type === 'loop-outer');
      const hasLoopInner = steps.some(s => s.type === 'loop-inner');
      const hasCond = steps.some(s => s.type === 'cond');
      const hasTransfer = steps.some(s => s.type === 'transfer');
      const hasReturn = steps.some(s => s.type === 'return');

      expect(hasInit, `${algoId} 缺少 init 表格分配帧`).toBe(true);
      expect(hasLoopOuter, `${algoId} 缺少 loop-outer 物品外层循环头帧`).toBe(true);
      expect(hasLoopInner, `${algoId} 缺少 loop-inner 容量内层循环头帧`).toBe(true);
      expect(hasCond, `${algoId} 缺少 cond 容量充分性条件判断帧`).toBe(true);
      expect(hasTransfer, `${algoId} 缺少 transfer 状态转移与赋值帧`).toBe(true);
      expect(hasReturn, `${algoId} 缺少 return 最终收敛返回帧`).toBe(true);

      // 2. 局部相对顺序物理断言：每一个 transfer 步骤前必有对应单元格的 cond 条件判断帧
      const condCoords = new Set(steps.filter(s => s.type === 'cond').map(s => `${s.i},${s.j}`));
      const transferSteps = steps.filter(s => s.type === 'transfer');
      for (const ts of transferSteps) {
        expect(condCoords.has(`${ts.i},${ts.j}`), `${algoId} 单元格 (${ts.i}, ${ts.j}) 转移前未执行 cond 判定`).toBe(true);
      }
    }
  });

  it('真正单向的模型 (如 climb-stairs) 不应暴露伪逆推分支', () => {
    const climbModel = AlgorithmModelRepository.getModel('climb-stairs');
    const climbDirKeys = Object.keys(climbModel.directions || {});
    expect(climbDirKeys).not.toContain('reverse');
    expect(climbDirKeys).toContain('forward');
  });
});
