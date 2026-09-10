/**
 * 最后一块石头的重量 II (LeetCode 1049) 四阶段演化推演引擎与四语言代码映射
 * 阶段 1: 暴力递归 (两堆石头差值最小化 -> 选出总重不超过 sum/2 的最大子集)
 * 阶段 2: 记忆化搜索 (备忘录 Cache Hit/Miss 追踪)
 * 阶段 3: 严格二维动态规划 (二维表格填表推导)
 * 阶段 4: 空间压缩 (一维滚动数组逆序更新)
 */

import { HighlightTarget } from '../../../../core/code-panel';

export const LAST_STONE_STAGE1_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'package class073;',
    '',
    '// 阶段 1: 暴力递归 (选出最接近 sum/2 的子集最大重量)',
    'public class Code04_LastStoneWeightIIRecursion {',
    '    public static int lastStoneWeightII(int[] stones) {',
    '        int sum = 0;',
    '        for (int s : stones) sum += s;',
    '        int t = sum / 2;',
    '        int near = dfs(stones, 0, t);',
    '        return sum - 2 * near;',
    '    }',
    '    public static int dfs(int[] stones, int i, int remCap) {',
    '        if (i == stones.length || remCap <= 0) return 0;',
    '        int p1 = dfs(stones, i + 1, remCap);',
    '        int p2 = (remCap >= stones[i]) ? dfs(stones, i + 1, remCap - stones[i]) + stones[i] : 0;',
    '        return Math.max(p1, p2);',
    '    }',
    '}',
  ],
  cpp: [
    '#include <vector>',
    '#include <numeric>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 阶段 1: 暴力递归',
    'int dfs(const vector<int>& stones, int i, int remCap) {',
    '    if (i == (int)stones.size() || remCap <= 0) return 0;',
    '    int p1 = dfs(stones, i + 1, remCap);',
    '    int p2 = (remCap >= stones[i]) ? dfs(stones, i + 1, remCap - stones[i]) + stones[i] : 0;',
    '    return max(p1, p2);',
    '}',
    'int lastStoneWeightII(vector<int>& stones) {',
    '    int sum = 0;',
    '    for (int s : stones) sum += s;',
    '    int near = dfs(stones, 0, sum / 2);',
    '    return sum - 2 * near;',
    '}',
  ],
  python: [
    '# 阶段 1: 暴力递归',
    'def last_stone_weight_ii(stones: list[int]) -> int:',
    '    s = sum(stones)',
    '    t = s // 2',
    '    def dfs(i: int, rem_cap: int) -> int:',
    '        if i == len(stones) or rem_cap <= 0:',
    '            return 0',
    '        p1 = dfs(i + 1, rem_cap)',
    '        p2 = dfs(i + 1, rem_cap - stones[i]) + stones[i] if rem_cap >= stones[i] else 0',
    '        return max(p1, p2)',
    '    near = dfs(0, t)',
    '    return s - 2 * near',
  ],
  javascript: [
    '// 阶段 1: 暴力递归',
    'export function lastStoneWeightII(stones) {',
    '  const sum = stones.reduce((a, b) => a + b, 0);',
    '  const t = Math.floor(sum / 2);',
    '  function dfs(i, remCap) {',
    '    if (i === stones.length || remCap <= 0) return 0;',
    '    const p1 = dfs(i + 1, remCap);',
    '    const p2 = remCap >= stones[i] ? dfs(i + 1, remCap - stones[i]) + stones[i] : 0;',
    '    return Math.max(p1, p2);',
    '  }',
    '  const near = dfs(0, t);',
    '  return sum - 2 * near;',
    '}',
  ],
};

export const LAST_STONE_STAGE2_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'package class073;',
    'import java.util.Arrays;',
    '',
    '// 阶段 2: 记忆化搜索',
    'public class Code04_LastStoneWeightIIMemo {',
    '    public static int lastStoneWeightII(int[] stones) {',
    '        int sum = 0;',
    '        for (int s : stones) sum += s;',
    '        int t = sum / 2;',
    '        int[][] memo = new int[stones.length + 1][t + 1];',
    '        for (int[] row : memo) Arrays.fill(row, -1);',
    '        int near = dfs(stones, 0, t, memo);',
    '        return sum - 2 * near;',
    '    }',
    '    public static int dfs(int[] stones, int i, int remCap, int[][] memo) {',
    '        if (i == stones.length || remCap <= 0) return 0;',
    '        if (memo[i][remCap] != -1) return memo[i][remCap];',
    '        int p1 = dfs(stones, i + 1, remCap, memo);',
    '        int p2 = (remCap >= stones[i]) ? dfs(stones, i + 1, remCap - stones[i], memo) + stones[i] : 0;',
    '        return memo[i][remCap] = Math.max(p1, p2);',
    '    }',
    '}',
  ],
  cpp: [
    '#include <vector>',
    '#include <numeric>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 阶段 2: 记忆化搜索',
    'int dfs(const vector<int>& stones, int i, int remCap, vector<vector<int>>& memo) {',
    '    if (i == (int)stones.size() || remCap <= 0) return 0;',
    '    if (memo[i][remCap] != -1) return memo[i][remCap];',
    '    int p1 = dfs(stones, i + 1, remCap, memo);',
    '    int p2 = (remCap >= stones[i]) ? dfs(stones, i + 1, remCap - stones[i], memo) + stones[i] : 0;',
    '    return memo[i][remCap] = max(p1, p2);',
    '}',
    'int lastStoneWeightII(vector<int>& stones) {',
    '    int sum = 0;',
    '    for (int s : stones) sum += s;',
    '    int t = sum / 2;',
    '    vector<vector<int>> memo(stones.size() + 1, vector<int>(t + 1, -1));',
    '    int near = dfs(stones, 0, t, memo);',
    '    return sum - 2 * near;',
    '}',
  ],
  python: [
    '# 阶段 2: 记忆化搜索',
    'def last_stone_weight_ii(stones: list[int]) -> int:',
    '    s = sum(stones)',
    '    t = s // 2',
    '    memo = [[-1] * (t + 1) for _ in range(len(stones) + 1)]',
    '    def dfs(i: int, rem_cap: int) -> int:',
    '        if i == len(stones) or rem_cap <= 0:',
    '            return 0',
    '        if memo[i][rem_cap] != -1:',
    '            return memo[i][rem_cap]',
    '        p1 = dfs(i + 1, rem_cap)',
    '        p2 = dfs(i + 1, rem_cap - stones[i]) + stones[i] if rem_cap >= stones[i] else 0',
    '        memo[i][rem_cap] = max(p1, p2)',
    '        return memo[i][rem_cap]',
    '    near = dfs(0, t)',
    '    return s - 2 * near',
  ],
  javascript: [
    '// 阶段 2: 记忆化搜索',
    'export function lastStoneWeightII(stones) {',
    '  const sum = stones.reduce((a, b) => a + b, 0);',
    '  const t = Math.floor(sum / 2);',
    '  const memo = Array.from({ length: stones.length + 1 }, () => new Array(t + 1).fill(-1));',
    '  function dfs(i, remCap) {',
    '    if (i === stones.length || remCap <= 0) return 0;',
    '    if (memo[i][remCap] !== -1) return memo[i][remCap];',
    '    const p1 = dfs(i + 1, remCap);',
    '    const p2 = remCap >= stones[i] ? dfs(i + 1, remCap - stones[i]) + stones[i] : 0;',
    '    return (memo[i][remCap] = Math.max(p1, p2));',
    '  }',
    '  const near = dfs(0, t);',
    '  return sum - 2 * near;',
    '}',
  ],
};

export const LAST_STONE_STAGE3_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'package class073;',
    '',
    '// 阶段 3: 严格二维位置依赖动态规划',
    'public class Code04_LastStoneWeightII2D {',
    '    public static int lastStoneWeightII(int[] stones) {',
    '        int sum = 0;',
    '        for (int s : stones) sum += s;',
    '        int t = sum / 2;',
    '        int n = stones.length;',
    '        int[][] dp = new int[n + 1][t + 1];',
    '        for (int i = 1; i <= n; i++) {',
    '            int weight = stones[i - 1];',
    '            for (int j = 0; j <= t; j++) {',
    '                dp[i][j] = dp[i - 1][j];',
    '                if (j >= weight) {',
    '                    dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - weight] + weight);',
    '                }',
    '            }',
    '        }',
    '        return sum - 2 * dp[n][t];',
    '    }',
    '}',
  ],
  cpp: [
    '#include <vector>',
    '#include <numeric>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    '// 阶段 3: 严格二维动态规划',
    'int lastStoneWeightII(vector<int>& stones) {',
    '    int sum = 0;',
    '    for (int s : stones) sum += s;',
    '    int t = sum / 2;',
    '    int n = stones.size();',
    '    vector<vector<int>> dp(n + 1, vector<int>(t + 1, 0));',
    '    for (int i = 1; i <= n; ++i) {',
    '        int weight = stones[i - 1];',
    '        for (int j = 0; j <= t; ++j) {',
    '            dp[i][j] = dp[i - 1][j];',
    '            if (j >= weight) dp[i][j] = max(dp[i][j], dp[i - 1][j - weight] + weight);',
    '        }',
    '    }',
    '    return sum - 2 * dp[n][t];',
    '}',
  ],
  python: [
    '# 阶段 3: 严格二维动态规划',
    'def last_stone_weight_ii(stones: list[int]) -> int:',
    '    s = sum(stones)',
    '    t = s // 2',
    '    n = len(stones)',
    '    dp = [[0] * (t + 1) for _ in range(n + 1)]',
    '    for i in range(1, n + 1):',
    '        w = stones[i - 1]',
    '        for j in range(t + 1):',
    '            dp[i][j] = dp[i - 1][j]',
    '            if j >= w:',
    '                dp[i][j] = max(dp[i][j], dp[i - 1][j - w] + w)',
    '    return s - 2 * dp[n][t]',
  ],
  javascript: [
    '// 阶段 3: 严格二维动态规划',
    'export function lastStoneWeightII(stones) {',
    '  const sum = stones.reduce((a, b) => a + b, 0);',
    '  const t = Math.floor(sum / 2);',
    '  const n = stones.length;',
    '  const dp = Array.from({ length: n + 1 }, () => new Array(t + 1).fill(0));',
    '  for (let i = 1; i <= n; i++) {',
    '    const w = stones[i - 1];',
    '    for (let j = 0; j <= t; j++) {',
    '      dp[i][j] = dp[i - 1][j];',
    '      if (j >= w) dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - w] + w);',
    '    }',
    '  }',
    '  return sum - 2 * dp[n][t];',
    '}',
  ],
};

// ==========================================
// 步骤推演生成器
// ==========================================

export function buildLastStoneRecursionSteps(stones: number[], maxSteps = 800) {
  const steps: any[] = [];
  const sum = stones.reduce((a, b) => a + b, 0);
  const t = Math.floor(sum / 2);
  const n = stones.length;
  const callStack: Array<{ i: number; rem: number; label: string }> = [];

  const lineMap: Record<string, HighlightTarget> = {
    callRoot: { java: 9, cpp: 16, python: 10, javascript: 9 },
    fnEnter: { java: 12, cpp: 7, python: 5, javascript: 4 },
    baseCheck: { java: 13, cpp: 8, python: 6, javascript: 5 },
    branch1: { java: 14, cpp: 9, python: 8, javascript: 6 },
    branch2: { java: 15, cpp: 10, python: 9, javascript: 7 },
    returnMax: { java: 16, cpp: 11, python: 10, javascript: 8 },
  };

  const pushStep = (action: string, codeKey: string, i: number, rem: number, decision: string, message: string, retVal?: number) => {
    if (steps.length >= maxSteps) return;
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: lineMap[codeKey] || { java: 1 },
      i,
      remCap: rem,
      n,
      stones: [...stones],
      callStack: [...callStack],
      decision,
      message,
      log: `[DFS] i=${i} remCap=${rem} | ${action}: ${message}`,
      returnValue: retVal,
      metrics: {
        'metric-cur-state': i < n ? `dfs(i=${i}, remCap=${rem})` : '边界触底',
        'metric-cur-stone': i < n ? `stones[${i}]=${stones[i]}` : '—',
        'metric-stack-depth': `${callStack.length}`,
      },
    });
  };

  pushStep('callRoot', 'callRoot', 0, t, '启动暴力递归', `🚀 启动最后一块石头暴力分治：总重量 sum=${sum}，目标上限 t=floor(sum/2)=${t}。`);

  function dfs(i: number, remCap: number): number {
    if (steps.length >= maxSteps) return 0;
    const label = `dfs(i=${i}, remCap=${remCap})`;
    callStack.push({ i, rem: remCap, label });
    pushStep('fnEnter', 'fnEnter', i, remCap, '进入栈帧', `📥 进入栈帧 ${label}。`);

    if (i === n || remCap <= 0) {
      pushStep('baseCheck', 'baseCheck', i, remCap, '触底终止', `🛑 边界触底 (i>=${n} 或 remCap<=0)，返回 0。`);
      callStack.pop();
      return 0;
    }

    pushStep('baseCheck', 'baseCheck', i, remCap, '考察石头', `🔍 考察石头 #${i + 1} (重:${stones[i]})，剩余容量 remCap=${remCap}。`);

    const p1 = dfs(i + 1, remCap);
    pushStep('branch1', 'branch1', i, remCap, '分支 1: 不选当前石头', `🌿 分支 1：不选石头 #${i + 1}，后续收益 = ${p1}。`);

    let p2 = 0;
    if (remCap >= stones[i]) {
      p2 = dfs(i + 1, remCap - stones[i]) + stones[i];
      pushStep('branch2', 'branch2', i, remCap, '分支 2: 选入当前石头', `💎 分支 2：选入石头 #${i + 1} (重:${stones[i]})，总收益 = ${p2}。`);
    }

    const res = Math.max(p1, p2);
    pushStep('returnMax', 'returnMax', i, remCap, `返回最优解 max(${p1}, ${p2}) = ${res}`, `📤 栈帧 ${label} 汇聚：返回两分支最优值 ${res}。`, res);
    callStack.pop();
    return res;
  }

  dfs(0, t);
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export function buildLastStoneMemoSteps(stones: number[], maxSteps = 800) {
  const steps: any[] = [];
  const sum = stones.reduce((a, b) => a + b, 0);
  const t = Math.floor(sum / 2);
  const n = stones.length;
  const memo: (number | null)[][] = Array.from({ length: n + 1 }, () => new Array(t + 1).fill(null));
  let hitCount = 0;
  let missCount = 0;

  const lineMap: Record<string, HighlightTarget> = {
    callRoot: { java: 11, cpp: 18, python: 11, javascript: 10 },
    fnEnter: { java: 14, cpp: 7, python: 6, javascript: 5 },
    baseCheck: { java: 15, cpp: 8, python: 7, javascript: 6 },
    memoCheck: { java: 16, cpp: 9, python: 9, javascript: 7 },
    branch1: { java: 17, cpp: 10, python: 11, javascript: 8 },
    branch2: { java: 18, cpp: 11, python: 12, javascript: 9 },
    memoStore: { java: 19, cpp: 12, python: 13, javascript: 10 },
  };

  const pushStep = (action: string, codeKey: string, i: number, remCap: number, memoHit: boolean, decision: string, message: string, cachedVal?: number) => {
    if (steps.length >= maxSteps) return;
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: lineMap[codeKey] || { java: 1 },
      i,
      remCap,
      memoHit,
      memoGrid: memo.map((row) => [...row]),
      hitCount,
      missCount,
      decision,
      message,
      log: `[MEMO] i=${i} remCap=${remCap} | ${action}: ${message}`,
      cachedVal,
      metrics: {
        'metric-cur-state': i < n ? `dfs(i=${i}, remCap=${remCap})` : '边界触底',
        'metric-cache-status': memoHit ? '🎯 Cache HIT' : '⚪ Cache MISS',
        'metric-hit-count': `${hitCount}`,
        'metric-miss-count': `${missCount}`,
      },
    });
  };

  pushStep('callRoot', 'callRoot', 0, t, false, '启动记忆化搜索', `🚀 启动最后一块石头记忆化搜索：初始化备忘录 memo[${n + 1}][${t + 1}]。`);

  function dfsMemo(i: number, remCap: number): number {
    if (steps.length >= maxSteps) return 0;
    pushStep('fnEnter', 'fnEnter', i, remCap, false, '进入栈帧', `📥 进入栈帧 dfs(i=${i}, remCap=${remCap})。`);

    if (i === n || remCap <= 0) {
      pushStep('baseCheck', 'baseCheck', i, remCap, false, '触底终止', `🛑 边界触底，返回 0。`);
      return 0;
    }

    if (memo[i][remCap] !== null) {
      hitCount++;
      const val = memo[i][remCap]!;
      pushStep('memoCheck', 'memoCheck', i, remCap, true, `命中缓存 memo[${i}][${remCap}] = ${val}`, `🎯 缓存命中！直接复用最接近重量 ${val}，避免重复递归！`, val);
      return val;
    }

    missCount++;
    pushStep('memoCheck', 'memoCheck', i, remCap, false, `未命中缓存 memo[${i}][${remCap}]`, `⚪ 缓存未命中：首次访问，开始分支。`);

    const p1 = dfsMemo(i + 1, remCap);
    pushStep('branch1', 'branch1', i, remCap, false, '分支 1: 不选', `🌿 分支 1：不选石头 #${i + 1}，后续收益 ${p1}。`);

    let p2 = 0;
    if (remCap >= stones[i]) {
      p2 = dfsMemo(i + 1, remCap - stones[i]) + stones[i];
      pushStep('branch2', 'branch2', i, remCap, false, '分支 2: 选入', `💎 分支 2：选入石头 #${i + 1}，总收益 ${p2}。`);
    }

    const res = Math.max(p1, p2);
    memo[i][remCap] = res;
    pushStep('memoStore', 'memoStore', i, remCap, false, `写入缓存 memo[${i}][${remCap}] = ${res}`, `💾 写入缓存：memo[${i}][${remCap}] = ${res}，O(1) 返回。`, res);
    return res;
  }

  dfsMemo(0, t);
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export function buildLastStone2DSteps(stones: number[]) {
  const steps: any[] = [];
  const sum = stones.reduce((a, b) => a + b, 0);
  const t = Math.floor(sum / 2);
  const n = stones.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(t + 1).fill(0));

  const lineMap: Record<string, HighlightTarget> = {
    initDp: { java: 10, cpp: 12, python: 6, javascript: 6 },
    outerLoopI: { java: 11, cpp: 13, python: 7, javascript: 7 },
    innerLoopJ: { java: 13, cpp: 15, python: 9, javascript: 9 },
    inheritNoPick: { java: 14, cpp: 16, python: 10, javascript: 10 },
    updatePick: { java: 16, cpp: 17, python: 12, javascript: 11 },
    returnAns: { java: 20, cpp: 20, python: 13, javascript: 14 },
  };

  const pushStep = (action: string, codeKey: string, curI: number, curJ: number, depCells: Array<{ label: string; val: number; r: number; c: number }>, decision: string, message: string) => {
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: lineMap[codeKey] || { java: 1 },
      curI,
      curJ,
      dpTable: dp.map((row) => [...row]),
      depCells,
      decision,
      message,
      log: `[2D DP] i=${curI} j=${curJ} | ${action}: ${message}`,
      metrics: {
        'metric-cur-cell': `dp[${curI}][${curJ}]`,
        'metric-cell-val': `${dp[curI][curJ]}`,
        'metric-dep-info': depCells.map((d) => `${d.label}=${d.val}`).join(', ') || '基底 0',
      },
    });
  };

  pushStep('initDp', 'initDp', 0, 0, [], '初始化二维 DP 状态表', `🚀 初始化二维状态表 dp[${n + 1}][${t + 1}]，第一行全为 0。`);

  for (let i = 1; i <= n; i++) {
    const weight = stones[i - 1];
    pushStep('outerLoopI', 'outerLoopI', i, 0, [], `考察第 ${i} 块石头 (重:${weight})`, `📦 外层考察第 ${i} 块石头 (重:${weight})。`);

    for (let j = 0; j <= t; j++) {
      dp[i][j] = dp[i - 1][j];
      const baseDep = { label: `dp[${i - 1}][${j}]`, val: dp[i - 1][j], r: i - 1, c: j };

      if (j < weight) {
        pushStep('inheritNoPick', 'inheritNoPick', i, j, [baseDep], `容量不足，继承上行: dp[${i}][${j}]=${dp[i][j]}`, `⏸️ 容量 j=${j} < ${weight}，无法选入，继承上一行 ${dp[i - 1][j]}。`);
      } else {
        const prevCap = j - weight;
        const candidate = dp[i - 1][prevCap] + weight;
        const isBetter = candidate > dp[i][j];
        if (isBetter) dp[i][j] = candidate;
        const pickDep = { label: `dp[${i - 1}][${prevCap}] + ${weight}`, val: candidate, r: i - 1, c: prevCap };

        pushStep('updatePick', 'updatePick', i, j, [baseDep, pickDep], `试算选入: max(${dp[i - 1][j]}, ${candidate}) = ${dp[i][j]}`, isBetter ? `✨ 选入石头更接近容量上限，价值提升至 ${dp[i][j]}！` : `⏸️ 保持原值 ${dp[i][j]}。`);
      }
    }
  }

  const finalNear = dp[n][t];
  const ans = sum - 2 * finalNear;
  pushStep('returnAns', 'returnAns', n, t, [{ label: `dp[${n}][${t}]`, val: finalNear, r: n, c: t }], `最终碰撞剩余: ${sum} - 2*${finalNear} = ${ans}`, `🎉 二维 DP 填表完毕！最接近半和的最大子集重为 ${finalNear}，粉碎后最小剩余重量为 ${ans}！`);

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}
