/**
 * 有依赖的背包 (洛谷 P1064 金明的预算方案) 四阶段演化推演引擎与四语言代码映射
 * 阶段 1: 暴力递归 (主附依赖转化为互斥方案的分组背包递归分治)
 * 阶段 2: 记忆化搜索 (备忘录 Cache Hit/Miss 追踪)
 * 阶段 3: 严格二维动态规划 (二维分组背包自底向上填表推导)
 * 阶段 4: 空间压缩 (一维滚动数组逆序更新)
 */

import { HighlightTarget } from '../../../../core/code-panel';
import { DependentItem } from './dependent-knapsack-renderer';

export const DEPENDENT_STAGE1_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'package class073;',
    '',
    '// 阶段 1: 暴力递归 (主附组合互斥展开为分组背包分治)',
    'public class Code05_DependentKnapsackRecursion {',
    '    public static int dfs(int[][] cost, int[][] val, int[] size, int g, int rem) {',
    '        if (g == size.length || rem <= 0) return 0;',
    '        int ans = dfs(cost, val, size, g + 1, rem);',
    '        for (int k = 0; k < size[g]; k++) {',
    '            if (rem >= cost[g][k]) {',
    '                ans = Math.max(ans, dfs(cost, val, size, g + 1, rem - cost[g][k]) + val[g][k]);',
    '            }',
    '        }',
    '        return ans;',
    '    }',
    '}',
  ],
  cpp: [
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 阶段 1: 暴力递归',
    'int dfs(const vector<vector<int>>& cost, const vector<vector<int>>& val, int g, int rem) {',
    '    if (g == (int)cost.size() || rem <= 0) return 0;',
    '    int ans = dfs(cost, val, g + 1, rem);',
    '    for (size_t k = 0; k < cost[g].size(); ++k) {',
    '        if (rem >= cost[g][k]) {',
    '            ans = max(ans, dfs(cost, val, g + 1, rem - cost[g][k]) + val[g][k]);',
    '        }',
    '    }',
    '    return ans;',
    '}',
  ],
  python: [
    '# 阶段 1: 暴力递归',
    'def dfs(cost: list[list[int]], val: list[list[int]], g: int, rem: int) -> int:',
    '    if g == len(cost) or rem <= 0:',
    '        return 0',
    '    ans = dfs(cost, val, g + 1, rem)',
    '    for c, v in zip(cost[g], val[g]):',
    '        if rem >= c:',
    '            ans = max(ans, dfs(cost, val, g + 1, rem - c) + v)',
    '    return ans',
  ],
  javascript: [
    '// 阶段 1: 暴力递归',
    'export function dfs(cost, val, g, rem) {',
    '  if (g === cost.length || rem <= 0) return 0;',
    '  let ans = dfs(cost, val, g + 1, rem);',
    '  for (let k = 0; k < cost[g].length; k++) {',
    '    if (rem >= cost[g][k]) {',
    '      ans = Math.max(ans, dfs(cost, val, g + 1, rem - cost[g][k]) + val[g][k]);',
    '    }',
    '  }',
    '  return ans;',
    '}',
  ],
};

export const DEPENDENT_STAGE2_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'package class073;',
    'import java.util.Arrays;',
    '',
    '// 阶段 2: 记忆化搜索',
    'public class Code05_DependentKnapsackMemo {',
    '    public static int dfs(int[][] cost, int[][] val, int[] size, int g, int rem, int[][] memo) {',
    '        if (g == size.length || rem <= 0) return 0;',
    '        if (memo[g][rem] != -1) return memo[g][rem];',
    '        int ans = dfs(cost, val, size, g + 1, rem, memo);',
    '        for (int k = 0; k < size[g]; k++) {',
    '            if (rem >= cost[g][k]) {',
    '                ans = Math.max(ans, dfs(cost, val, size, g + 1, rem - cost[g][k], memo) + val[g][k]);',
    '            }',
    '        }',
    '        return memo[g][rem] = ans;',
    '    }',
    '}',
  ],
  cpp: [
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 阶段 2: 记忆化搜索',
    'int dfs(const vector<vector<int>>& cost, const vector<vector<int>>& val, int g, int rem, vector<vector<int>>& memo) {',
    '    if (g == (int)cost.size() || rem <= 0) return 0;',
    '    if (memo[g][rem] != -1) return memo[g][rem];',
    '    int ans = dfs(cost, val, g + 1, rem, memo);',
    '    for (size_t k = 0; k < cost[g].size(); ++k) {',
    '        if (rem >= cost[g][k]) {',
    '            ans = max(ans, dfs(cost, val, g + 1, rem - cost[g][k], memo) + val[g][k]);',
    '        }',
    '    }',
    '    return memo[g][rem] = ans;',
    '}',
  ],
  python: [
    '# 阶段 2: 记忆化搜索',
    'def dfs(cost: list[list[int]], val: list[list[int]], g: int, rem: int, memo: list[list[int]]) -> int:',
    '    if g == len(cost) or rem <= 0:',
    '        return 0',
    '    if memo[g][rem] != -1:',
    '        return memo[g][rem]',
    '    ans = dfs(cost, val, g + 1, rem, memo)',
    '    for c, v in zip(cost[g], val[g]):',
    '        if rem >= c:',
    '            ans = max(ans, dfs(cost, val, g + 1, rem - c, memo) + v)',
    '    memo[g][rem] = ans',
    '    return ans',
  ],
  javascript: [
    '// 阶段 2: 记忆化搜索',
    'export function dfs(cost, val, g, rem, memo) {',
    '  if (g === cost.length || rem <= 0) return 0;',
    '  if (memo[g][rem] !== -1) return memo[g][rem];',
    '  let ans = dfs(cost, val, g + 1, rem, memo);',
    '  for (let k = 0; k < cost[g].length; k++) {',
    '    if (rem >= cost[g][k]) {',
    '      ans = Math.max(ans, dfs(cost, val, g + 1, rem - cost[g][k], memo) + val[g][k]);',
    '    }',
    '  }',
    '  return (memo[g][rem] = ans);',
    '}',
  ],
};

export const DEPENDENT_STAGE3_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'package class073;',
    '',
    '// 阶段 3: 严格二维位置依赖动态规划',
    'public class Code05_DependentKnapsack2D {',
    '    public static int compute2D(int[][] cost, int[][] val, int[] size, int groupCount, int budget) {',
    '        int[][] dp = new int[groupCount + 1][budget + 1];',
    '        for (int g = 1; g <= groupCount; g++) {',
    '            int kCount = size[g - 1];',
    '            for (int j = 0; j <= budget; j++) {',
    '                dp[g][j] = dp[g - 1][j];',
    '                for (int k = 0; k < kCount; k++) {',
    '                    int c = cost[g - 1][k];',
    '                    int v = val[g - 1][k];',
    '                    if (j >= c) {',
    '                        dp[g][j] = Math.max(dp[g][j], dp[g - 1][j - c] + v);',
    '                    }',
    '                }',
    '            }',
    '        }',
    '        return dp[groupCount][budget];',
    '    }',
    '}',
  ],
  cpp: [
    '#include <vector>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 阶段 3: 严格二维动态规划',
    'int compute2D(const vector<vector<int>>& cost, const vector<vector<int>>& val, int budget) {',
    '    int G = cost.size();',
    '    vector<vector<int>> dp(G + 1, vector<int>(budget + 1, 0));',
    '    for (int g = 1; g <= G; ++g) {',
    '        for (int j = 0; j <= budget; ++j) {',
    '            dp[g][j] = dp[g - 1][j];',
    '            for (size_t k = 0; k < cost[g - 1].size(); ++k) {',
    '                int c = cost[g - 1][k], v = val[g - 1][k];',
    '                if (j >= c) dp[g][j] = max(dp[g][j], dp[g - 1][j - c] + v);',
    '            }',
    '        }',
    '    }',
    '    return dp[G][budget];',
    '}',
  ],
  python: [
    '# 阶段 3: 严格二维动态规划',
    'def compute_2d(cost: list[list[int]], val: list[list[int]], budget: int) -> int:',
    '    G = len(cost)',
    '    dp = [[0] * (budget + 1) for _ in range(G + 1)]',
    '    for g in range(1, G + 1):',
    '        for j in range(budget + 1):',
    '            dp[g][j] = dp[g - 1][j]',
    '            for c, v in zip(cost[g - 1], val[g - 1]):',
    '                if j >= c:',
    '                    dp[g][j] = max(dp[g][j], dp[g - 1][j - c] + v)',
    '    return dp[G][budget]',
  ],
  javascript: [
    '// 阶段 3: 严格二维动态规划',
    'export function compute2D(cost, val, budget) {',
    '  const G = cost.length;',
    '  const dp = Array.from({ length: G + 1 }, () => new Array(budget + 1).fill(0));',
    '  for (let g = 1; g <= G; g++) {',
    '    for (let j = 0; j <= budget; j++) {',
    '      dp[g][j] = dp[g - 1][j];',
    '      for (let k = 0; k < cost[g - 1].length; k++) {',
    '        const c = cost[g - 1][k], v = val[g - 1][k];',
    '        if (j >= c) dp[g][j] = Math.max(dp[g][j], dp[g - 1][j - c] + v);',
    '      }',
    '    }',
    '  }',
    '  return dp[G][budget];',
    '}',
  ],
};

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

  const lineMap: Record<string, HighlightTarget> = {
    callRoot: { java: 6, cpp: 6, python: 3, javascript: 2 },
    fnEnter: { java: 6, cpp: 6, python: 3, javascript: 2 },
    baseCheck: { java: 6, cpp: 6, python: 3, javascript: 2 },
    branchNoPick: { java: 7, cpp: 7, python: 5, javascript: 3 },
    loopCombo: { java: 8, cpp: 8, python: 6, javascript: 4 },
    branchPick: { java: 10, cpp: 10, python: 8, javascript: 6 },
    returnMax: { java: 13, cpp: 14, python: 9, javascript: 9 },
  };

  const pushStep = (action: string, codeKey: string, g: number, rem: number, decision: string, message: string, retVal?: number) => {
    if (steps.length >= maxSteps) return;
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: lineMap[codeKey] || { java: 1 },
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

  const lineMap: Record<string, HighlightTarget> = {
    callRoot: { java: 6, cpp: 6, python: 3, javascript: 2 },
    fnEnter: { java: 6, cpp: 6, python: 3, javascript: 2 },
    baseCheck: { java: 6, cpp: 6, python: 3, javascript: 2 },
    memoCheck: { java: 7, cpp: 7, python: 5, javascript: 3 },
    branchNoPick: { java: 8, cpp: 8, python: 7, javascript: 4 },
    loopCombo: { java: 9, cpp: 9, python: 8, javascript: 5 },
    branchPick: { java: 11, cpp: 11, python: 10, javascript: 7 },
    memoStore: { java: 14, cpp: 15, python: 12, javascript: 11 },
  };

  const pushStep = (action: string, codeKey: string, g: number, rem: number, memoHit: boolean, decision: string, message: string, cachedVal?: number) => {
    if (steps.length >= maxSteps) return;
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: lineMap[codeKey] || { java: 1 },
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

  const lineMap: Record<string, HighlightTarget> = {
    initDp: { java: 6, cpp: 6, python: 3, javascript: 3 },
    outerLoopG: { java: 7, cpp: 7, python: 4, javascript: 4 },
    innerLoopJ: { java: 9, cpp: 9, python: 5, javascript: 5 },
    inheritNoPick: { java: 10, cpp: 10, python: 6, javascript: 6 },
    loopCombo: { java: 11, cpp: 11, python: 7, javascript: 7 },
    updatePick: { java: 15, cpp: 14, python: 9, javascript: 9 },
    returnAns: { java: 20, cpp: 18, python: 11, javascript: 12 },
  };

  const pushStep = (action: string, codeKey: string, curG: number, curJ: number, depCells: Array<{ label: string; val: number; r: number; c: number }>, decision: string, message: string) => {
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: lineMap[codeKey] || { java: 1 },
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
