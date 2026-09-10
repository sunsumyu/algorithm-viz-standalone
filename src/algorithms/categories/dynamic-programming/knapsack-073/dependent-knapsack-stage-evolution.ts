/**
 * 有依赖的背包 (洛谷 P1064 金明的预算方案) 四阶段演化推演引擎与四语言代码映射
 * 阶段 1: 暴力递归 (主附依赖转化为互斥方案的分组背包递归分治)
 * 阶段 2: 记忆化搜索 (备忘录 Cache Hit/Miss 追踪)
 * 阶段 3: 严格二维动态规划 (二维分组背包自底向上填表推导)
 * 阶段 4: 空间压缩 (一维滚动数组逆序更新)
 */

import { HighlightTarget } from '../../../../core/code-panel';
import { DEPENDENT_STAGE1_CODE_LANGUAGES, DEPENDENT_STAGE2_CODE_LANGUAGES, DEPENDENT_STAGE3_CODE_LANGUAGES } from './knapsack-073-templates';
import { getKnapsack073Anchor } from './knapsack-073-stage-codes';
import { DependentItem } from './dependent-knapsack-renderer';




// ==========================================
// 步骤推演生成器
// ==========================================

export interface MainGroup {
  mainId: number;
  combos: Array<{ label: string; cost: number; val: number }>;
}

export function parseDependentGroups(m: number, rawItems: (DependentItem | null)[]): MainGroup[] {
  const isKing = new Array(m + 1).fill(false);
  const fans: number[][] = Array.from({ length: m + 1 }, () => []);

  for (let i = 1; i <= m; i++) {
    const it = rawItems[i];
    if (!it) continue;
    if (it.q === 0) isKing[i] = true;
    else fans[it.q].push(i);
  }

  const groups: MainGroup[] = [];
  for (let i = 1; i <= m; i++) {
    if (!isKing[i]) continue;
    const mainIt = rawItems[i]!;
    const c0 = mainIt.cost;
    const v0 = mainIt.val;
    const f = fans[i];
    const f1 = f.length >= 1 && rawItems[f[0]] ? rawItems[f[0]] : null;
    const f2 = f.length >= 2 && rawItems[f[1]] ? rawItems[f[1]] : null;

    const combos: Array<{ label: string; cost: number; val: number }> = [
      { label: `仅主件 #${i}`, cost: c0, val: v0 },
    ];
    if (f1) combos.push({ label: `主件#${i}+附1`, cost: c0 + f1.cost, val: v0 + f1.val });
    if (f2) combos.push({ label: `主件#${i}+附2`, cost: c0 + f2.cost, val: v0 + f2.val });
    if (f1 && f2) combos.push({ label: `主件#${i}+附1+附2`, cost: c0 + f1.cost + f2.cost, val: v0 + f1.val + f2.val });

    groups.push({ mainId: i, combos });
  }

  return groups;
}

export function buildDependentRecursionSteps(budget: number, m: number, rawItems: (DependentItem | null)[], maxSteps = 800) {
  const groups = parseDependentGroups(m, rawItems);
  const steps: any[] = [];
  const G = groups.length;
  const callStack: Array<{ g: number; rem: number; label: string }> = [];

  const resolveLine = (anchor: string) => getKnapsack073Anchor(1, 'dependent', anchor);

  const pushStep = (action: string, codeKey: string, g: number, rem: number, decision: string, message: string, retVal?: number) => {
    if (steps.length >= maxSteps) return;
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(codeKey),
      i: g,
      remCap: rem,
      n: G,
      callStack: [...callStack],
      decision,
      message,
      log: `[DFS] g=${g} remBudget=${rem} | ${action}: ${message}`,
      returnValue: retVal,
      metrics: {
        'metric-cur-state': g < G ? `dfs(g=${g}, rem=${rem})` : '边界触底',
        'metric-cur-group': g < G ? `#${groups[g].mainId} 主件组 (${groups[g].combos.length}方案)` : '—',
        'metric-stack-depth': `${callStack.length}`,
      },
    });
  };

  pushStep('callRoot', 'callRoot', 0, budget, '启动主附依赖递归', `🚀 启动有依赖背包递归分治：共 ${G} 个主件组，总预算 budget=${budget}。`);

  function dfs(g: number, rem: number): number {
    if (steps.length >= maxSteps) return 0;
    const label = `dfs(g=${g}, rem=${rem})`;
    callStack.push({ g, rem, label });
    pushStep('fnEnter', 'fnEnter', g, rem, '进入栈帧', `📥 进入栈帧 ${label}。`);

    if (g === G || rem <= 0) {
      pushStep('baseCheck', 'baseCheck', g, rem, '触底终止', `🛑 边界触底 (g>=${G} 或 rem<=0)，返回 0。`);
      callStack.pop();
      return 0;
    }

    const grp = groups[g];
    pushStep('baseCheck', 'baseCheck', g, rem, '考察主件组', `🔍 考察主件组 #${grp.mainId}，包含 ${grp.combos.length} 种互斥方案。`);

    let ans = dfs(g + 1, rem);
    pushStep('branchNoPick', 'branchNoPick', g, rem, '方案 0: 不买该主件组', `🌿 方案 0：不买主件组 #${grp.mainId} 中任何商品，后续收益 = ${ans}。`);

    for (let k = 0; k < grp.combos.length; k++) {
      const c = grp.combos[k];
      if (rem >= c.cost) {
        const p = dfs(g + 1, rem - c.cost) + c.val;
        pushStep('branchPick', 'branchPick', g, rem, `方案 ${k + 1}: ${c.label}`, `💎 方案 ${k + 1}【${c.label}】(耗资:${c.cost}, 价值:${c.val})，总收益 = ${p}。`);
        if (p > ans) ans = p;
      }
    }

    pushStep('returnMax', 'returnMax', g, rem, `返回最优决策收益: ${ans}`, `📤 栈帧 ${label} 汇聚：主件组 #${grp.mainId} 返回最优值 ${ans}。`, ans);
    callStack.pop();
    return ans;
  }

  dfs(0, budget);
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export function buildDependentMemoSteps(budget: number, m: number, rawItems: (DependentItem | null)[], maxSteps = 800) {
  const groups = parseDependentGroups(m, rawItems);
  const steps: any[] = [];
  const G = groups.length;
  const memo: (number | null)[][] = Array.from({ length: G + 1 }, () => new Array(budget + 1).fill(null));
  let hitCount = 0;
  let missCount = 0;

  const resolveLine = (anchor: string) => getKnapsack073Anchor(2, 'dependent', anchor);

  const pushStep = (action: string, codeKey: string, g: number, rem: number, memoHit: boolean, decision: string, message: string, cachedVal?: number) => {
    if (steps.length >= maxSteps) return;
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(codeKey),
      i: g,
      remCap: rem,
      memoHit,
      memoGrid: memo.map((row) => [...row]),
      hitCount,
      missCount,
      decision,
      message,
      log: `[MEMO] g=${g} remBudget=${rem} | ${action}: ${message}`,
      cachedVal,
      metrics: {
        'metric-cur-state': g < G ? `dfs(g=${g}, rem=${rem})` : '边界触底',
        'metric-cache-status': memoHit ? '🎯 Cache HIT' : '⚪ Cache MISS',
        'metric-hit-count': `${hitCount}`,
        'metric-miss-count': `${missCount}`,
      },
    });
  };

  pushStep('callRoot', 'callRoot', 0, budget, false, '启动记忆化搜索', `🚀 启动有依赖背包记忆化搜索：初始化备忘录 memo[${G + 1}][${budget + 1}]。`);

  function dfsMemo(g: number, rem: number): number {
    if (steps.length >= maxSteps) return 0;
    pushStep('fnEnter', 'fnEnter', g, rem, false, '进入栈帧', `📥 进入栈帧 dfs(g=${g}, rem=${rem})。`);

    if (g === G || rem <= 0) {
      pushStep('baseCheck', 'baseCheck', g, rem, false, '触底终止', `🛑 边界触底，返回 0。`);
      return 0;
    }

    if (memo[g][rem] !== null) {
      hitCount++;
      const val = memo[g][rem]!;
      pushStep('memoCheck', 'memoCheck', g, rem, true, `命中缓存 memo[${g}][${rem}] = ${val}`, `🎯 缓存命中！直接复用结果 ${val}，剪除冗余分支！`, val);
      return val;
    }

    missCount++;
    pushStep('memoCheck', 'memoCheck', g, rem, false, `未命中缓存 memo[${g}][${rem}]`, `⚪ 缓存未命中：首次访问主件组 #${groups[g].mainId}。`);

    const grp = groups[g];
    let ans = dfsMemo(g + 1, rem);
    pushStep('branchNoPick', 'branchNoPick', g, rem, false, '方案 0: 不买', `🌿 方案 0：不买该组任何商品，收益 ${ans}。`);

    for (let k = 0; k < grp.combos.length; k++) {
      const c = grp.combos[k];
      if (rem >= c.cost) {
        const p = dfsMemo(g + 1, rem - c.cost) + c.val;
        pushStep('branchPick', 'branchPick', g, rem, false, `方案 ${k + 1}: ${c.label}`, `💎 尝试【${c.label}】，总收益 ${p}。`);
        if (p > ans) ans = p;
      }
    }

    memo[g][rem] = ans;
    pushStep('memoStore', 'memoStore', g, rem, false, `写入缓存 memo[${g}][${rem}] = ${ans}`, `💾 写入缓存：memo[${g}][${rem}] = ${ans}，O(1) 返回。`, ans);
    return ans;
  }

  dfsMemo(0, budget);
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export function buildDependent2DSteps(budget: number, m: number, rawItems: (DependentItem | null)[]) {
  const groups = parseDependentGroups(m, rawItems);
  const steps: any[] = [];
  const G = groups.length;
  const dp: number[][] = Array.from({ length: G + 1 }, () => new Array(budget + 1).fill(0));

  const resolveLine = (anchor: string) => getKnapsack073Anchor(3, 'dependent', anchor);

  const pushStep = (action: string, codeKey: string, curG: number, curJ: number, depCells: Array<{ label: string; val: number; r: number; c: number }>, decision: string, message: string) => {
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: resolveLine(codeKey),
      curI: curG,
      curJ,
      dpTable: dp.map((row) => [...row]),
      depCells,
      decision,
      message,
      log: `[2D DP] g=${curG} budget=${curJ} | ${action}: ${message}`,
      metrics: {
        'metric-cur-cell': `dp[${curG}][${curJ}]`,
        'metric-cell-val': `${dp[curG][curJ]}`,
        'metric-dep-info': depCells.map((d) => `${d.label}=${d.val}`).join(', ') || '基底 0',
      },
    });
  };

  pushStep('initDp', 'initDp', 0, 0, [], '初始化二维 DP 状态表', `🚀 初始化二维动态规划表格 dp[${G + 1}][${budget + 1}]，第一行全为 0。`);

  for (let g = 1; g <= G; g++) {
    const grp = groups[g - 1];
    pushStep('outerLoopG', 'outerLoopG', g, 0, [], `考察主件组 #${grp.mainId}`, `📦 外层考察第 ${g} 个主件组 #${grp.mainId}，包含 ${grp.combos.length} 种互斥组合。`);

    for (let j = 0; j <= budget; j++) {
      dp[g][j] = dp[g - 1][j];
      const baseDep = { label: `dp[${g - 1}][${j}] (不选)`, val: dp[g - 1][j], r: g - 1, c: j };

      for (let k = 0; k < grp.combos.length; k++) {
        const c = grp.combos[k];
        if (j >= c.cost) {
          const prevBudget = j - c.cost;
          const candidate = dp[g - 1][prevBudget] + c.val;
          const isBetter = candidate > dp[g][j];
          if (isBetter) dp[g][j] = candidate;
          const pickDep = { label: `dp[${g - 1}][${prevBudget}] + ${c.val}`, val: candidate, r: g - 1, c: prevBudget };

          pushStep('updatePick', 'updatePick', g, j, [baseDep, pickDep], `尝试方案 ${k + 1}: ${c.label}`, isBetter ? `✨ 组合【${c.label}】更优，收益提升至 ${dp[g][j]}！` : `⏸️ 保持原值 ${dp[g][j]}。`);
        }
      }
    }
  }

  pushStep('returnAns', 'returnAns', G, budget, [{ label: `dp[${G}][${budget}]`, val: dp[G][budget], r: G, c: budget }], `最终最大总收益: dp[${G}][${budget}] = ${dp[G][budget]}`, `🎉 二维 DP 填表完毕！主件组全部决策完毕，最大收益为 ${dp[G][budget]}！`);

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}
