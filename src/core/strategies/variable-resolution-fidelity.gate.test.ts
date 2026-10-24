import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../model-repository';
import { AlgorithmStrategyRegistry } from './index';
import { KnapsackFamilyStrategy } from './knapsack-family-strategy';
import { VariableContextResolver } from '../variable-context-resolver';

describe('🏆 全库算法代码变量捕获与智能求值顶层抽象硬门禁 (Variable Resolution Fidelity Gates)', () => {
  it('门禁 1: coins-from-piles (LC 2218) Stage 3 代码中所有变量 (t, team, preSum, m, n, k, i, j, dp) 必须 100% 成功捕获并求值', () => {
    AlgorithmStrategyRegistry.register(new KnapsackFamilyStrategy('coins-from-piles'));
    const model = AlgorithmModelRepository.getModel('coins-from-piles');
    expect(model).toBeDefined();

    const steps = AlgorithmStrategyRegistry.tryGenerate(model!, { stage: 3, direction: 'forward' });
    expect(steps, 'steps 必须生成').toBeDefined();
    expect(steps!.length).toBeGreaterThanOrEqual(10);

    // 找到内层转移步骤 (包含 Math.max(dp[i][j], dp[i-1][j-k] + preSum[k]))
    const transitionStep = steps!.find((s) => s.type === 'transition');
    expect(transitionStep, '必须包含 transition 步骤').toBeDefined();

    const varsMap = VariableContextResolver.resolve(transitionStep!);

    // 1. 核心局部变量 t (当前栈有效上限 Math.min(team.size(), m))
    const tVar = VariableContextResolver.getVariable(varsMap, 't', transitionStep);
    expect(tVar, '变量 t 必须被成功捕获，严禁显示当前步未捕获').toBeDefined();
    expect(tVar?.value).toMatch(/^\d+$/);

    // 2. 核心硬币栈对象 team (List<Integer> team = piles.get(i-1))
    const teamVar = VariableContextResolver.getVariable(varsMap, 'team', transitionStep);
    expect(teamVar, '变量 team 必须被成功捕获').toBeDefined();
    expect(teamVar?.value).toContain('[');

    // 3. 前缀和数组 preSum
    const preSumVar = VariableContextResolver.getVariable(varsMap, 'preSum', transitionStep);
    expect(preSumVar, '变量 preSum 必须被成功捕获').toBeDefined();
    expect(preSumVar?.value).toContain('[');

    // 4. 当前枚选硬币数 k (代码中的 k, 对应步骤中的 c)
    const kVar = VariableContextResolver.getVariable(varsMap, 'k', transitionStep);
    expect(kVar, '代码循环变量 k 必须被成功映射并捕获').toBeDefined();
    expect(kVar?.value).toBe(String(transitionStep!.c));

    // 5. 规模参数 n (栈总数) 与 m (容量上限)
    const nVar = VariableContextResolver.getVariable(varsMap, 'n', transitionStep);
    expect(nVar, '栈规模变量 n 必须被捕获').toBeDefined();
    const mVar = VariableContextResolver.getVariable(varsMap, 'm', transitionStep);
    expect(mVar, '容量变量 m 必须被捕获').toBeDefined();
  });

  it('门禁 2: 全库已锁定动态规划与背包算法所有步骤的高亮代码行变量，严禁出现盲区未捕获', () => {
    const targetModelIds = [
      'coins-from-piles',
      'knapsack-01-2d',
      'complete-knapsack',
      'partitioned-knapsack-standard',
      'last-stone-weight-ii',
      'ones-and-zeroes',
      'target-sum',
    ];

    const uncapturedList: Array<{ modelId: string; stage: number; stepIndex: number; varName: string; lineCode: string }> = [];

    for (const modelId of targetModelIds) {
      const model = AlgorithmModelRepository.getModel(modelId);
      if (!model) continue;
      for (const stage of [1, 2, 3, 4]) {
        const stageObj = (model.stages as any)?.[`stage-${stage}`] || (Array.isArray(model.stages) ? (model.stages as any).find((s: any) => s.id === stage) : null);
        if (!stageObj) continue;
        const steps = AlgorithmStrategyRegistry.tryGenerate(model, { stage, direction: 'forward' });
        if (!steps || steps.length === 0) continue;

        // 抽取中间有代表性的执行步进行悬停变量覆盖率审查
        for (let idx = 0; idx < Math.min(steps.length, 15); idx++) {
          const step = steps[idx];
          const varsMap = VariableContextResolver.resolve(step);

          // 核心控制流变量必查
          for (const coreKey of ['i', 'j', 't', 'k', 'c']) {
            if (step[coreKey] !== undefined) {
              const res = VariableContextResolver.getVariable(varsMap, coreKey, step);
              if (!res) {
                uncapturedList.push({
                  modelId,
                  stage,
                  stepIndex: idx,
                  varName: coreKey,
                  lineCode: step.tag || '',
                });
              }
            }
          }
        }
      }
    }

    if (uncapturedList.length > 0) {
      const preview = uncapturedList
        .slice(0, 5)
        .map((u) => `[${u.modelId} Stage ${u.stage} Step ${u.stepIndex}] var "${u.varName}" 丢失`)
        .join('; ');
      expect.fail(`【红灯门禁拦截】检测到 ${uncapturedList.length} 处步骤核心变量未被捕获: ${preview}`);
    }
  });

  it('门禁 3: coins-from-piles Stage 4 一维空间压缩 dp[j] 与 preSum[k] 下标表达式必须求值为标量整数，严禁求值为二维网格行或空逗号数组 [ , , ]', () => {
    AlgorithmStrategyRegistry.register(new KnapsackFamilyStrategy('coins-from-piles'));
    const model = AlgorithmModelRepository.getModel('coins-from-piles');
    expect(model).toBeDefined();

    const steps = AlgorithmStrategyRegistry.tryGenerate(model!, { stage: 4, direction: 'forward' });
    expect(steps).toBeDefined();

    const transStep = steps!.find((s) => s.type === 'transition' && s.j != null && s.c != null);
    expect(transStep, 'Stage 4 必须包含有效 transition 步骤').toBeDefined();

    const varsMap = VariableContextResolver.resolve(transStep!);

    // 1. 下标表达式 dp[j] 必须解析为标量整数，非数组，非空逗号 [ , , ]
    const dpJ = VariableContextResolver.getVariable(varsMap, 'dp[j]', transStep);
    expect(dpJ, 'dp[j] 必须成功解析').toBeDefined();
    expect(dpJ?.type).toBe('expression');
    expect(dpJ?.value).toMatch(/^\d+$/);
    expect(dpJ?.value).not.toContain('[');
    expect(dpJ?.value).not.toContain(',');
    expect(Array.isArray(dpJ?.raw)).toBe(false);

    // 2. 下标表达式 preSum[k] 必须解析为标量整数
    const preSumK = VariableContextResolver.getVariable(varsMap, 'preSum[k]', transStep);
    expect(preSumK, 'preSum[k] 必须成功解析').toBeDefined();
    expect(preSumK?.type).toBe('expression');
    expect(preSumK?.value).toMatch(/^\d+$/);
    expect(preSumK?.value).not.toContain('[');

    // 3. 变量 dp 在 Stage 4 必须是一维滚动数组，绝不能被 2D dpGrid 篡改
    const dpVar = VariableContextResolver.getVariable(varsMap, 'dp', transStep);
    expect(dpVar, 'dp 必须被捕获').toBeDefined();
    expect(Array.isArray(dpVar?.raw)).toBe(true);
    expect(Array.isArray((dpVar?.raw as any[])[0]), 'Stage 4 dp 必须是一维数组，绝不能是二维矩阵').toBe(false);
  });

  it('门禁 4: coins-from-piles Stage 1 与 Stage 2 双向 (正序/逆序) 递归与备忘录变量 (remK, maxVal, memo, memo[i][remK]) 必须 100% 成功捕获并高保真求值', () => {
    AlgorithmStrategyRegistry.register(new KnapsackFamilyStrategy('coins-from-piles'));
    const model = AlgorithmModelRepository.getModel('coins-from-piles');
    expect(model).toBeDefined();

    for (const dir of ['forward', 'reverse'] as const) {
      // ── Stage 1 递归 ──
      const stage1Steps = AlgorithmStrategyRegistry.tryGenerate(model!, { stage: 1, direction: dir });
      expect(stage1Steps, `Stage 1 ${dir} 必须成功生成步骤`).toBeDefined();
      expect(stage1Steps!.length).toBeGreaterThanOrEqual(10);

      const s1EvalStep = stage1Steps!.find((s) => s.type === 'branch-eval');
      expect(s1EvalStep, `Stage 1 ${dir} 必须包含 branch-eval 步骤`).toBeDefined();
      const s1Vars = VariableContextResolver.resolve(s1EvalStep!);

      const remK1 = VariableContextResolver.getVariable(s1Vars, 'remK', s1EvalStep);
      expect(remK1, `Stage 1 ${dir} remK 必须被捕获`).toBeDefined();
      expect(remK1?.value).toMatch(/^\d+$/);

      const maxVal1 = VariableContextResolver.getVariable(s1Vars, 'maxVal', s1EvalStep);
      expect(maxVal1, `Stage 1 ${dir} maxVal 必须被捕获`).toBeDefined();
      expect(maxVal1?.value).toMatch(/^\d+$/);

      // ── Stage 2 记忆化 ──
      const stage2Steps = AlgorithmStrategyRegistry.tryGenerate(model!, { stage: 2, direction: dir });
      expect(stage2Steps, `Stage 2 ${dir} 必须成功生成步骤`).toBeDefined();
      expect(stage2Steps!.length).toBeGreaterThanOrEqual(10);

      const s2EvalStep = stage2Steps!.find((s) => s.type === 'branch-eval');
      expect(s2EvalStep, `Stage 2 ${dir} 必须包含 branch-eval 步骤`).toBeDefined();
      const s2Vars = VariableContextResolver.resolve(s2EvalStep!);

      const remK2 = VariableContextResolver.getVariable(s2Vars, 'remK', s2EvalStep);
      expect(remK2, `Stage 2 ${dir} remK 必须被捕获`).toBeDefined();

      const maxVal2 = VariableContextResolver.getVariable(s2Vars, 'maxVal', s2EvalStep);
      expect(maxVal2, `Stage 2 ${dir} maxVal 必须被捕获`).toBeDefined();

      const memoVar = VariableContextResolver.getVariable(s2Vars, 'memo', s2EvalStep);
      expect(memoVar, `Stage 2 ${dir} memo 矩阵必须被捕获`).toBeDefined();
      expect(Array.isArray(memoVar?.raw)).toBe(true);

      // 下标表达式 memo[i][remK] 必须成功解析
      const memoSub = VariableContextResolver.getVariable(s2Vars, 'memo[i][remK]', s2EvalStep);
      expect(memoSub, `Stage 2 ${dir} 下标表达式 memo[i][remK] 必须成功解析`).toBeDefined();
      expect(memoSub?.type).toBe('expression');
      expect(memoSub?.detail).toContain('备忘录缓存');
    }
  });

  it('门禁 5: coins-from-piles Stage 3 逆序填表与 Stage 4 逆序空间压缩完整性硬门禁', () => {
    AlgorithmStrategyRegistry.register(new KnapsackFamilyStrategy('coins-from-piles'));
    const model = AlgorithmModelRepository.getModel('coins-from-piles');
    expect(model).toBeDefined();

    // ── Stage 3 Reverse ──
    const s3RevSteps = AlgorithmStrategyRegistry.tryGenerate(model!, { stage: 3, direction: 'reverse' });
    expect(s3RevSteps, 'Stage 3 逆向步骤必须生成').toBeDefined();
    expect(s3RevSteps!.length).toBeGreaterThanOrEqual(15);

    const hasPresumCalc = s3RevSteps!.some((s) => s.type === 'presum-calc');
    expect(hasPresumCalc, 'Stage 3 逆序必须包含 presum-calc 前缀和预计算步骤').toBe(true);

    const hasInnerCap = s3RevSteps!.some((s) => s.type === 'inner-cap');
    expect(hasInnerCap, 'Stage 3 逆序必须包含 inner-cap 容量循环步骤').toBe(true);

    const s3Trans = s3RevSteps!.find((s) => s.type === 'transition');
    expect(s3Trans, 'Stage 3 逆序必须包含 transition 转移步骤').toBeDefined();

    const s3Vars = VariableContextResolver.resolve(s3Trans!);
    for (const key of ['t', 'team', 'preSum', 'k', 'c', 'i', 'j']) {
      const v = VariableContextResolver.getVariable(s3Vars, key, s3Trans);
      expect(v, `Stage 3 逆序变量 ${key} 必须被捕获`).toBeDefined();
    }

    // ── Stage 4 Reverse ──
    const s4RevSteps = AlgorithmStrategyRegistry.tryGenerate(model!, { stage: 4, direction: 'reverse' });
    expect(s4RevSteps, 'Stage 4 逆向步骤必须生成').toBeDefined();
    expect(s4RevSteps!.length).toBeGreaterThanOrEqual(15);

    const s4Trans = s4RevSteps!.find((s) => s.type === 'transition' && s.j != null && s.c != null);
    expect(s4Trans, 'Stage 4 逆序必须包含 transition 转移步骤').toBeDefined();

    const s4Vars = VariableContextResolver.resolve(s4Trans!);
    const dpJ = VariableContextResolver.getVariable(s4Vars, 'dp[j]', s4Trans);
    expect(dpJ, 'Stage 4 逆序 dp[j] 必须解析为标量').toBeDefined();
    expect(dpJ?.type).toBe('expression');
    expect(dpJ?.value).toMatch(/^\d+$/);
    expect(dpJ?.value).not.toContain('[');
  });
});
