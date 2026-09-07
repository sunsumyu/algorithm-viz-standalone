/**
 * 目标和 (LeetCode 494) 四阶段演化推演引擎与四语言代码映射
 * 阶段 1: 暴力递归 (递归搜索与运行时调用栈)
 * 阶段 2: 记忆化搜索 (备忘录 Cache Hit/Miss 追踪)
 * 阶段 3: 严格二维动态规划 (二维方案数表格自底向上填表)
 * 阶段 4: 空间压缩 (一维滚动数组逆序更新)
 */

import { HighlightTarget } from '../../../../core/code-panel';

export const TARGET_SUM_STAGE1_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'package class073;',
    '',
    '// 阶段 1: 暴力递归 (目标和转子集和分治)',
    'public class Code03_TargetSumRecursion {',
    '    public static int findTargetSumWays(int[] nums, int target) {',
    '        int sum = 0;',
    '        for (int n : nums) sum += n;',
    '        if (sum < Math.abs(target) || ((target + sum) & 1) != 0) return 0;',
    '        int t = (target + sum) >> 1;',
    '        return dfs(nums, 0, t);',
    '    }',
    '    public static int dfs(int[] nums, int i, int rem) {',
    '        if (i == nums.length) return rem == 0 ? 1 : 0;',
    '        int p1 = dfs(nums, i + 1, rem);',
    '        int p2 = (rem >= nums[i]) ? dfs(nums, i + 1, rem - nums[i]) : 0;',
    '        return p1 + p2;',
    '    }',
    '}',
  ],
  cpp: [
    '#include <vector>',
    '#include <cmath>',
    'using namespace std;',
    '',
    '// 阶段 1: 暴力递归',
    'int dfs(const vector<int>& nums, int i, int rem) {',
    '    if (i == (int)nums.size()) return rem == 0 ? 1 : 0;',
    '    int p1 = dfs(nums, i + 1, rem);',
    '    int p2 = (rem >= nums[i]) ? dfs(nums, i + 1, rem - nums[i]) : 0;',
    '    return p1 + p2;',
    '}',
    'int findTargetSumWays(vector<int>& nums, int target) {',
    '    int sum = 0;',
    '    for (int x : nums) sum += x;',
    '    if (sum < abs(target) || ((target + sum) & 1)) return 0;',
    '    return dfs(nums, 0, (target + sum) / 2);',
    '}',
  ],
  python: [
    '# 阶段 1: 暴力递归',
    'def find_target_sum_ways(nums: list[int], target: int) -> int:',
    '    s = sum(nums)',
    '    if s < abs(target) or (s + target) % 2 != 0:',
    '        return 0',
    '    t = (s + target) // 2',
    '    def dfs(i: int, rem: int) -> int:',
    '        if i == len(nums):',
    '            return 1 if rem == 0 else 0',
    '        p1 = dfs(i + 1, rem)',
    '        p2 = dfs(i + 1, rem - nums[i]) if rem >= nums[i] else 0',
    '        return p1 + p2',
    '    return dfs(0, t)',
  ],
  javascript: [
    '// 阶段 1: 暴力递归',
    'export function findTargetSumWays(nums, target) {',
    '  const sum = nums.reduce((a, b) => a + b, 0);',
    '  if (sum < Math.abs(target) || (sum + target) % 2 !== 0) return 0;',
    '  const t = Math.floor((sum + target) / 2);',
    '  function dfs(i, rem) {',
    '    if (i === nums.length) return rem === 0 ? 1 : 0;',
    '    const p1 = dfs(i + 1, rem);',
    '    const p2 = rem >= nums[i] ? dfs(i + 1, rem - nums[i]) : 0;',
    '    return p1 + p2;',
    '  }',
    '  return dfs(0, t);',
    '}',
  ],
};

export const TARGET_SUM_STAGE2_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'package class073;',
    'import java.util.Arrays;',
    '',
    '// 阶段 2: 记忆化搜索',
    'public class Code03_TargetSumMemo {',
    '    public static int findTargetSumWays(int[] nums, int target) {',
    '        int sum = 0;',
    '        for (int n : nums) sum += n;',
    '        if (sum < Math.abs(target) || ((target + sum) & 1) != 0) return 0;',
    '        int t = (target + sum) >> 1;',
    '        int[][] memo = new int[nums.length + 1][t + 1];',
    '        for (int[] row : memo) Arrays.fill(row, -1);',
    '        return dfs(nums, 0, t, memo);',
    '    }',
    '    public static int dfs(int[] nums, int i, int rem, int[][] memo) {',
    '        if (i == nums.length) return rem == 0 ? 1 : 0;',
    '        if (memo[i][rem] != -1) return memo[i][rem];',
    '        int p1 = dfs(nums, i + 1, rem, memo);',
    '        int p2 = (rem >= nums[i]) ? dfs(nums, i + 1, rem - nums[i], memo) : 0;',
    '        return memo[i][rem] = p1 + p2;',
    '    }',
    '}',
  ],
  cpp: [
    '#include <vector>',
    '#include <cmath>',
    'using namespace std;',
    '',
    '// 阶段 2: 记忆化搜索',
    'int dfs(const vector<int>& nums, int i, int rem, vector<vector<int>>& memo) {',
    '    if (i == (int)nums.size()) return rem == 0 ? 1 : 0;',
    '    if (memo[i][rem] != -1) return memo[i][rem];',
    '    int p1 = dfs(nums, i + 1, rem, memo);',
    '    int p2 = (rem >= nums[i]) ? dfs(nums, i + 1, rem - nums[i], memo) : 0;',
    '    return memo[i][rem] = p1 + p2;',
    '}',
    'int findTargetSumWays(vector<int>& nums, int target) {',
    '    int sum = 0;',
    '    for (int x : nums) sum += x;',
    '    if (sum < abs(target) || ((target + sum) & 1)) return 0;',
    '    int t = (target + sum) / 2;',
    '    vector<vector<int>> memo(nums.size() + 1, vector<int>(t + 1, -1));',
    '    return dfs(nums, 0, t, memo);',
    '}',
  ],
  python: [
    '# 阶段 2: 记忆化搜索',
    'def find_target_sum_ways(nums: list[int], target: int) -> int:',
    '    s = sum(nums)',
    '    if s < abs(target) or (s + target) % 2 != 0:',
    '        return 0',
    '    t = (s + target) // 2',
    '    memo = [[-1] * (t + 1) for _ in range(len(nums) + 1)]',
    '    def dfs(i: int, rem: int) -> int:',
    '        if i == len(nums):',
    '            return 1 if rem == 0 else 0',
    '        if memo[i][rem] != -1:',
    '            return memo[i][rem]',
    '        p1 = dfs(i + 1, rem)',
    '        p2 = dfs(i + 1, rem - nums[i]) if rem >= nums[i] else 0',
    '        memo[i][rem] = p1 + p2',
    '        return memo[i][rem]',
    '    return dfs(0, t)',
  ],
  javascript: [
    '// 阶段 2: 记忆化搜索',
    'export function findTargetSumWays(nums, target) {',
    '  const sum = nums.reduce((a, b) => a + b, 0);',
    '  if (sum < Math.abs(target) || (sum + target) % 2 !== 0) return 0;',
    '  const t = Math.floor((sum + target) / 2);',
    '  const memo = Array.from({ length: nums.length + 1 }, () => new Array(t + 1).fill(-1));',
    '  function dfs(i, rem) {',
    '    if (i === nums.length) return rem === 0 ? 1 : 0;',
    '    if (memo[i][rem] !== -1) return memo[i][rem];',
    '    const p1 = dfs(i + 1, rem);',
    '    const p2 = rem >= nums[i] ? dfs(i + 1, rem - nums[i]) : 0;',
    '    return (memo[i][rem] = p1 + p2);',
    '  }',
    '  return dfs(0, t);',
    '}',
  ],
};

export const TARGET_SUM_STAGE3_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'package class073;',
    '',
    '// 阶段 3: 严格二维位置依赖动态规划',
    'public class Code03_TargetSum2D {',
    '    public static int findTargetSumWays(int[] nums, int target) {',
    '        int sum = 0;',
    '        for (int n : nums) sum += n;',
    '        if (sum < Math.abs(target) || ((target + sum) & 1) != 0) return 0;',
    '        int t = (target + sum) >> 1;',
    '        int n = nums.length;',
    '        int[][] dp = new int[n + 1][t + 1];',
    '        dp[0][0] = 1;',
    '        for (int i = 1; i <= n; i++) {',
    '            int num = nums[i - 1];',
    '            for (int j = 0; j <= t; j++) {',
    '                dp[i][j] = dp[i - 1][j];',
    '                if (j >= num) {',
    '                    dp[i][j] += dp[i - 1][j - num];',
    '                }',
    '            }',
    '        }',
    '        return dp[n][t];',
    '    }',
    '}',
  ],
  cpp: [
    '#include <vector>',
    '#include <cmath>',
    'using namespace std;',
    '',
    '// 阶段 3: 严格二维动态规划',
    'int findTargetSumWays(vector<int>& nums, int target) {',
    '    int sum = 0;',
    '    for (int x : nums) sum += x;',
    '    if (sum < abs(target) || ((target + sum) & 1)) return 0;',
    '    int t = (target + sum) / 2;',
    '    int n = nums.size();',
    '    vector<vector<int>> dp(n + 1, vector<int>(t + 1, 0));',
    '    dp[0][0] = 1;',
    '    for (int i = 1; i <= n; ++i) {',
    '        int num = nums[i - 1];',
    '        for (int j = 0; j <= t; ++j) {',
    '            dp[i][j] = dp[i - 1][j];',
    '            if (j >= num) dp[i][j] += dp[i - 1][j - num];',
    '        }',
    '    }',
    '    return dp[n][t];',
    '}',
  ],
  python: [
    '# 阶段 3: 严格二维动态规划',
    'def find_target_sum_ways(nums: list[int], target: int) -> int:',
    '    s = sum(nums)',
    '    if s < abs(target) or (s + target) % 2 != 0:',
    '        return 0',
    '    t = (s + target) // 2',
    '    n = len(nums)',
    '    dp = [[0] * (t + 1) for _ in range(n + 1)]',
    '    dp[0][0] = 1',
    '    for i in range(1, n + 1):',
    '        num = nums[i - 1]',
    '        for j in range(t + 1):',
    '            dp[i][j] = dp[i - 1][j]',
    '            if j >= num:',
    '                dp[i][j] += dp[i - 1][j - num]',
    '    return dp[n][t]',
  ],
  javascript: [
    '// 阶段 3: 严格二维动态规划',
    'export function findTargetSumWays(nums, target) {',
    '  const sum = nums.reduce((a, b) => a + b, 0);',
    '  if (sum < Math.abs(target) || (sum + target) % 2 !== 0) return 0;',
    '  const t = Math.floor((sum + target) / 2);',
    '  const n = nums.length;',
    '  const dp = Array.from({ length: n + 1 }, () => new Array(t + 1).fill(0));',
    '  dp[0][0] = 1;',
    '  for (let i = 1; i <= n; i++) {',
    '    const num = nums[i - 1];',
    '    for (let j = 0; j <= t; j++) {',
    '      dp[i][j] = dp[i - 1][j];',
    '      if (j >= num) dp[i][j] += dp[i - 1][j - num];',
    '    }',
    '  }',
    '  return dp[n][t];',
    '}',
  ],
};

// ==========================================
// 2. 步骤推演生成器
// ==========================================

export function buildTargetSumRecursionSteps(nums: number[], target: number, maxSteps = 800) {
  const steps: any[] = [];
  const sum = nums.reduce((a, b) => a + Math.abs(b), 0);
  const isValid = sum >= Math.abs(target) && (sum + target) % 2 === 0;
  const t = isValid ? Math.floor((sum + target) / 2) : -1;
  const n = nums.length;
  const callStack: Array<{ i: number; rem: number; label: string }> = [];

  const lineMap: Record<string, HighlightTarget> = {
    check: { java: 8, cpp: 16, python: 4, javascript: 3 },
    callRoot: { java: 10, cpp: 17, python: 13, javascript: 11 },
    fnEnter: { java: 12, cpp: 6, python: 7, javascript: 5 },
    baseCheck: { java: 13, cpp: 7, python: 8, javascript: 6 },
    branch1: { java: 14, cpp: 8, python: 10, javascript: 7 },
    branch2: { java: 15, cpp: 9, python: 11, javascript: 8 },
    returnSum: { java: 16, cpp: 10, python: 12, javascript: 9 },
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
      callStack: [...callStack],
      decision,
      message,
      log: `[DFS] i=${i} rem=${rem} | ${action}: ${message}`,
      returnValue: retVal,
      metrics: {
        'metric-cur-state': i < n ? `dfs(i=${i}, rem=${rem})` : '边界回溯',
        'metric-cur-num': i < n ? `nums[${i}]=${nums[i]}` : '—',
        'metric-stack-depth': `${callStack.length}`,
      },
    });
  };

  if (!isValid || t < 0) {
    pushStep('check', 'check', 0, 0, '校验失败', `🛑 奇偶性校验失败或绝对值越界：sum=${sum}, target=${target}，无整数解，返回 0 种方案。`, 0);
    return steps;
  }

  pushStep('callRoot', 'callRoot', 0, t, '启动暴力递归', `🚀 启动目标和暴力分治：转化正子集目标和 t=${t}，nums 长度=${n}。`);

  function dfs(i: number, rem: number): number {
    if (steps.length >= maxSteps) return 0;
    const label = `dfs(i=${i}, rem=${rem})`;
    callStack.push({ i, rem, label });
    pushStep('fnEnter', 'fnEnter', i, rem, '进入栈帧', `📥 进入栈帧 ${label}。`);

    if (i === n) {
      const ans = rem === 0 ? 1 : 0;
      pushStep('baseCheck', 'baseCheck', i, rem, `触底判定: rem=${rem}`, ans === 1 ? `✅ 恰好凑齐目标和！返回 1 种有效方案。` : `❌ 未能恰好凑齐 (剩余 rem=${rem})，返回 0。`, ans);
      callStack.pop();
      return ans;
    }

    pushStep('baseCheck', 'baseCheck', i, rem, '考察元素', `🔍 考察 nums[${i}]=${nums[i]}，剩余目标和 rem=${rem}。`);

    const p1 = dfs(i + 1, rem);
    pushStep('branch1', 'branch1', i, rem, '分支 1: 不选当前数字', `🌿 分支 1：不选 nums[${i}]=${nums[i]}，后续合法方案数 = ${p1}。`);

    let p2 = 0;
    if (rem >= nums[i]) {
      p2 = dfs(i + 1, rem - nums[i]);
      pushStep('branch2', 'branch2', i, rem, '分支 2: 选入当前数字', `💎 分支 2：选入 nums[${i}]=${nums[i]}，后续合法方案数 = ${p2}。`);
    }

    const totalWays = p1 + p2;
    pushStep('returnSum', 'returnSum', i, rem, `方案累加: p1+p2=${totalWays}`, `📤 栈帧 ${label} 汇聚：返回两分支方案和 ${p1} + ${p2} = ${totalWays} 种。`, totalWays);
    callStack.pop();
    return totalWays;
  }

  dfs(0, t);
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export function buildTargetSumMemoSteps(nums: number[], target: number, maxSteps = 800) {
  const steps: any[] = [];
  const sum = nums.reduce((a, b) => a + Math.abs(b), 0);
  const isValid = sum >= Math.abs(target) && (sum + target) % 2 === 0;
  const t = isValid ? Math.floor((sum + target) / 2) : -1;
  const n = nums.length;

  const lineMap: Record<string, HighlightTarget> = {
    check: { java: 8, cpp: 16, python: 4, javascript: 3 },
    callRoot: { java: 13, cpp: 19, python: 16, javascript: 12 },
    fnEnter: { java: 15, cpp: 6, python: 8, javascript: 6 },
    baseCheck: { java: 16, cpp: 7, python: 9, javascript: 7 },
    memoCheck: { java: 17, cpp: 8, python: 11, javascript: 8 },
    branch1: { java: 18, cpp: 9, python: 13, javascript: 9 },
    branch2: { java: 19, cpp: 10, python: 14, javascript: 10 },
    memoStore: { java: 20, cpp: 11, python: 15, javascript: 11 },
  };

  if (!isValid || t < 0) {
    steps.push({
      stepIndex: 1,
      totalSteps: 1,
      action: 'check',
      codeLine: lineMap.check,
      i: 0,
      remCap: 0,
      memoHit: false,
      memoGrid: [[0]],
      hitCount: 0,
      missCount: 0,
      decision: '无整数解',
      message: `🛑 奇偶性或越界无解，直接返回 0。`,
      log: 'check: invalid',
    });
    return steps;
  }

  const memo: (number | null)[][] = Array.from({ length: n + 1 }, () => new Array(t + 1).fill(null));
  let hitCount = 0;
  let missCount = 0;

  const pushStep = (action: string, codeKey: string, i: number, rem: number, memoHit: boolean, decision: string, message: string, cachedVal?: number) => {
    if (steps.length >= maxSteps) return;
    steps.push({
      stepIndex: steps.length + 1,
      totalSteps: 0,
      action,
      codeLine: lineMap[codeKey] || { java: 1 },
      i,
      remCap: rem,
      memoHit,
      memoGrid: memo.map((row) => [...row]),
      hitCount,
      missCount,
      decision,
      message,
      log: `[MEMO] i=${i} rem=${rem} | ${action}: ${message}`,
      cachedVal,
      metrics: {
        'metric-cur-state': i < n ? `dfs(i=${i}, rem=${rem})` : '边界触底',
        'metric-cache-status': memoHit ? '🎯 Cache HIT' : '⚪ Cache MISS',
        'metric-hit-count': `${hitCount}`,
        'metric-miss-count': `${missCount}`,
      },
    });
  };

  pushStep('callRoot', 'callRoot', 0, t, false, '启动记忆化搜索', `🚀 启动记忆化搜索：创建备忘录表格 memo[${n + 1}][${t + 1}]。`);

  function dfsMemo(i: number, rem: number): number {
    if (steps.length >= maxSteps) return 0;
    pushStep('fnEnter', 'fnEnter', i, rem, false, '进入栈帧', `📥 进入栈帧 dfs(i=${i}, rem=${rem})。`);

    if (i === n) {
      const ans = rem === 0 ? 1 : 0;
      pushStep('baseCheck', 'baseCheck', i, rem, false, '触底结算', ans === 1 ? `✅ 凑齐目标！返回 1。` : `❌ 未凑齐，返回 0。`, ans);
      return ans;
    }

    if (memo[i][rem] !== null) {
      hitCount++;
      const val = memo[i][rem]!;
      pushStep('memoCheck', 'memoCheck', i, rem, true, `命中缓存 memo[${i}][${rem}] = ${val}`, `🎯 缓存命中！复用已求方案数 ${val}，直接剪枝！`, val);
      return val;
    }

    missCount++;
    pushStep('memoCheck', 'memoCheck', i, rem, false, `未命中缓存 memo[${i}][${rem}]`, `⚪ 缓存未命中：首次探访，计算分支。`);

    const p1 = dfsMemo(i + 1, rem);
    pushStep('branch1', 'branch1', i, rem, false, '分支 1: 不选', `🌿 分支 1：不选 nums[${i}]=${nums[i]}，后续方案数 ${p1}。`);

    let p2 = 0;
    if (rem >= nums[i]) {
      p2 = dfsMemo(i + 1, rem - nums[i]);
      pushStep('branch2', 'branch2', i, rem, false, '分支 2: 选入', `💎 分支 2：选入 nums[${i}]=${nums[i]}，后续方案数 ${p2}。`);
    }

    const res = p1 + p2;
    memo[i][rem] = res;
    pushStep('memoStore', 'memoStore', i, rem, false, `写入缓存 memo[${i}][${rem}] = ${res}`, `💾 写入缓存：memo[${i}][${rem}] = ${res} 种方案，O(1) 向上返回。`, res);
    return res;
  }

  dfsMemo(0, t);
  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}

export function buildTargetSum2DSteps(nums: number[], target: number) {
  const steps: any[] = [];
  const sum = nums.reduce((a, b) => a + Math.abs(b), 0);
  const isValid = sum >= Math.abs(target) && (sum + target) % 2 === 0;
  const t = isValid ? Math.floor((sum + target) / 2) : 0;
  const n = nums.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(t + 1).fill(0));

  const lineMap: Record<string, HighlightTarget> = {
    initDp: { java: 11, cpp: 11, python: 8, javascript: 6 },
    outerLoopI: { java: 13, cpp: 13, python: 9, javascript: 7 },
    innerLoopJ: { java: 15, cpp: 15, python: 11, javascript: 9 },
    inheritNoPick: { java: 16, cpp: 16, python: 12, javascript: 10 },
    updatePick: { java: 18, cpp: 18, python: 14, javascript: 11 },
    returnAns: { java: 22, cpp: 21, python: 15, javascript: 14 },
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
        'metric-cell-val': `${dp[curI][curJ]} 种`,
        'metric-dep-info': depCells.map((d) => `${d.label}=${d.val}`).join(', ') || '基底 1',
      },
    });
  };

  if (!isValid) {
    pushStep('initDp', 'initDp', 0, 0, [], '无解返回 0', `🛑 奇偶性或绝对值不满足，无法凑出 target，直接返回 0。`);
    return steps;
  }

  dp[0][0] = 1;
  pushStep('initDp', 'initDp', 0, 0, [], '基底初始化 dp[0][0]=1', `🚀 初始化二维状态表 dp[${n + 1}][${t + 1}]，dp[0][0]=1 表示空集凑和为 0 有且仅有 1 种方案。`);

  for (let i = 1; i <= n; i++) {
    const num = nums[i - 1];
    pushStep('outerLoopI', 'outerLoopI', i, 0, [], `外层循环：考察 nums[${i - 1}]=${num}`, `📦 外层考察第 ${i} 个数字 nums[${i - 1}]=${num}。`);

    for (let j = 0; j <= t; j++) {
      dp[i][j] = dp[i - 1][j];
      const baseDep = { label: `dp[${i - 1}][${j}]`, val: dp[i - 1][j], r: i - 1, c: j };

      if (j < num) {
        pushStep('inheritNoPick', 'inheritNoPick', i, j, [baseDep], `容量不足，继承上行: dp[${i}][${j}]=${dp[i][j]}`, `⏸️ 容量 j=${j} < ${num}，无法选入，方案数继承上一行同列 ${dp[i - 1][j]} 种。`);
      } else {
        const prevCap = j - num;
        const addWays = dp[i - 1][prevCap];
        dp[i][j] += addWays;
        const pickDep = { label: `dp[${i - 1}][${prevCap}]`, val: addWays, r: i - 1, c: prevCap };

        pushStep('updatePick', 'updatePick', i, j, [baseDep, pickDep], `累加方案: dp[${i}][${j}] = ${baseDep.val} + ${addWays} = ${dp[i][j]}`, `✨ 状态累加：选入 nums[${i - 1}]=${num} 增加 ${addWays} 种方案，dp[${i}][${j}] 增至 ${dp[i][j]} 种！`);
      }
    }
  }

  pushStep('returnAns', 'returnAns', n, t, [{ label: `dp[${n}][${t}]`, val: dp[n][t], r: n, c: t }], `最终方案数: dp[${n}][${t}]=${dp[n][t]}`, `🎉 二维动态规划填表完毕！恰好凑齐正子集和 ${t} 的方案数（即目标和 ${target} 的表达式总数）为 ${dp[n][t]} 种！`);

  const total = steps.length;
  steps.forEach((s) => (s.totalSteps = total));
  return steps;
}
