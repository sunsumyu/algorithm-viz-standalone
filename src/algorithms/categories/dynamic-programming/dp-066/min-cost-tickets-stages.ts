/**
 * 左程云 Class 066 Code02: 最低票价 (Minimum Cost For Tickets · LeetCode 983)
 * 四阶段体系化演进模型与步进生成器：
 * Stage 1: 暴力递归 (从顶向下尝试)
 * Stage 2: 记忆化搜索 (备忘录剪枝)
 * Stage 3: 严格一维动态规划 (自底向上表递推)
 * Stage 4: 二分查找优化 (区间跳跃对数加速)
 */

import { HighlightTarget } from '../../../../core/step-visualizer';
import { renderLinearDpArray } from './dp-066-shared';

// ==========================================
// 1. 各阶段四语言代码 (Java / C++ / Python / JS)
// ==========================================

export const MIN_COST_TICKETS_STAGE1_CODES: Record<string, string[]> = {
  java: [
    'package class066;',
    '',
    '// 阶段 1: 暴力递归 (指数级复杂度)',
    'public class Code02_MinCostTicketsStage1 {',
    '    public static int mincostTickets(int[] days, int[] costs) {',
    '        return f(days, costs, 0);',
    '    }',
    '    // f(i): 从第 i 个旅行日开始，完成所有剩余旅行的最低花费',
    '    public static int f(int[] days, int[] costs, int i) {',
    '        if (i >= days.length) return 0;',
    '        int ans = Integer.MAX_VALUE;',
    '        int[] duration = {1, 7, 30};',
    '        for (int k = 0, j = i; k < 3; k++) {',
    '            while (j < days.length && days[j] < days[i] + duration[k]) {',
    '                j++;',
    '            }',
    '            ans = Math.min(ans, costs[k] + f(days, costs, j));',
    '        }',
    '        return ans;',
    '    }',
    '}',
  ],
  cpp: [
    '// 阶段 1: 暴力递归',
    'class Solution {',
    'public:',
    '    int mincostTickets(vector<int>& days, vector<int>& costs) {',
    '        return f(days, costs, 0);',
    '    }',
    '    int f(vector<int>& days, vector<int>& costs, int i) {',
    '        if (i >= days.size()) return 0;',
    '        int ans = 1e9;',
    '        int duration[3] = {1, 7, 30};',
    '        for (int k = 0, j = i; k < 3; k++) {',
    '            while (j < days.size() && days[j] < days[i] + duration[k]) j++;',
    '            ans = min(ans, costs[k] + f(days, costs, j));',
    '        }',
    '        return ans;',
    '    }',
    '};',
  ],
  python: [
    '# 阶段 1: 暴力递归',
    'class Solution:',
    '    def mincostTickets(self, days: list[int], costs: list[int]) -> int:',
    '        def f(i: int) -> int:',
    '            if i >= len(days): return 0',
    '            ans = float("inf")',
    '            durations = [1, 7, 30]',
    '            for k in range(3):',
    '                j = i',
    '                while j < len(days) and days[j] < days[i] + durations[k]:',
    '                    j += 1',
    '                ans = min(ans, costs[k] + f(j))',
    '            return ans',
    '        return f(0)',
  ],
  javascript: [
    '// 阶段 1: 暴力递归',
    'function mincostTickets(days, costs) {',
    '    function f(i) {',
    '        if (i >= days.length) return 0;',
    '        let ans = Infinity;',
    '        const durations = [1, 7, 30];',
    '        for (let k = 0; k < 3; k++) {',
    '            let j = i;',
    '            while (j < days.length && days[j] < days[i] + durations[k]) j++;',
    '            ans = Math.min(ans, costs[k] + f(j));',
    '        }',
    '        return ans;',
    '    }',
    '    return f(0);',
    '}',
  ],
};

export const MIN_COST_TICKETS_STAGE1_LINES = {
  entry: { java: 6, cpp: 5, python: 4, javascript: 3 },
  baseCheck: { java: 10, cpp: 8, python: 5, javascript: 4 },
  loopBranch: { java: 13, cpp: 11, python: 8, javascript: 7 },
  skipDays: { java: 14, cpp: 12, python: 10, javascript: 9 },
  recursiveCall: { java: 16, cpp: 13, python: 12, javascript: 11 },
  returnAns: { java: 18, cpp: 15, python: 13, javascript: 13 },
};

export const MIN_COST_TICKETS_STAGE2_CODES: Record<string, string[]> = {
  java: [
    'package class066;',
    'import java.util.Arrays;',
    '',
    '// 阶段 2: 记忆化搜索 (备忘录剪枝)',
    'public class Code02_MinCostTicketsStage2 {',
    '    public static int mincostTickets(int[] days, int[] costs) {',
    '        int[] memo = new int[days.length];',
    '        Arrays.fill(memo, -1);',
    '        return f(days, costs, 0, memo);',
    '    }',
    '    public static int f(int[] days, int[] costs, int i, int[] memo) {',
    '        if (i >= days.length) return 0;',
    '        if (memo[i] != -1) return memo[i]; // 缓存命中剪枝',
    '        int ans = Integer.MAX_VALUE;',
    '        int[] duration = {1, 7, 30};',
    '        for (int k = 0, j = i; k < 3; k++) {',
    '            while (j < days.length && days[j] < days[i] + duration[k]) j++;',
    '            ans = Math.min(ans, costs[k] + f(days, costs, j, memo));',
    '        }',
    '        memo[i] = ans; // 写入备忘录',
    '        return ans;',
    '    }',
    '}',
  ],
  cpp: [
    '// 阶段 2: 记忆化搜索',
    'class Solution {',
    'public:',
    '    int mincostTickets(vector<int>& days, vector<int>& costs) {',
    '        vector<int> memo(days.size(), -1);',
    '        return f(days, costs, 0, memo);',
    '    }',
    '    int f(vector<int>& days, vector<int>& costs, int i, vector<int>& memo) {',
    '        if (i >= days.size()) return 0;',
    '        if (memo[i] != -1) return memo[i];',
    '        int ans = 1e9;',
    '        int duration[3] = {1, 7, 30};',
    '        for (int k = 0, j = i; k < 3; k++) {',
    '            while (j < days.size() && days[j] < days[i] + duration[k]) j++;',
    '            ans = min(ans, costs[k] + f(days, costs, j, memo));',
    '        }',
    '        return memo[i] = ans;',
    '    }',
    '};',
  ],
  python: [
    '# 阶段 2: 记忆化搜索',
    'class Solution:',
    '    def mincostTickets(self, days: list[int], costs: list[int]) -> int:',
    '        memo = [-1] * len(days)',
    '        def f(i: int) -> int:',
    '            if i >= len(days): return 0',
    '            if memo[i] != -1: return memo[i]',
    '            ans = float("inf")',
    '            durations = [1, 7, 30]',
    '            for k in range(3):',
    '                j = i',
    '                while j < len(days) and days[j] < days[i] + durations[k]:',
    '                    j += 1',
    '                ans = min(ans, costs[k] + f(j))',
    '            memo[i] = ans',
    '            return ans',
    '        return f(0)',
  ],
  javascript: [
    '// 阶段 2: 记忆化搜索',
    'function mincostTickets(days, costs) {',
    '    const memo = new Array(days.length).fill(-1);',
    '    function f(i) {',
    '        if (i >= days.length) return 0;',
    '        if (memo[i] !== -1) return memo[i]; // 缓存命中',
    '        let ans = Infinity;',
    '        const durations = [1, 7, 30];',
    '        for (let k = 0; k < 3; k++) {',
    '            let j = i;',
    '            while (j < days.length && days[j] < days[i] + durations[k]) j++;',
    '            ans = Math.min(ans, costs[k] + f(j));',
    '        }',
    '        return memo[i] = ans;',
    '    }',
    '    return f(0);',
    '}',
  ],
};

export const MIN_COST_TICKETS_STAGE2_LINES = {
  entry: { java: 9, cpp: 6, python: 5, javascript: 4 },
  baseCheck: { java: 12, cpp: 9, python: 6, javascript: 5 },
  cacheHit: { java: 13, cpp: 10, python: 7, javascript: 6 },
  loopBranch: { java: 16, cpp: 13, python: 10, javascript: 9 },
  skipDays: { java: 17, cpp: 14, python: 12, javascript: 11 },
  recursiveCall: { java: 18, cpp: 15, python: 13, javascript: 12 },
  saveMemo: { java: 20, cpp: 17, python: 14, javascript: 14 },
};

export const MIN_COST_TICKETS_STAGE4_CODES: Record<string, string[]> = {
  java: [
    'package class066;',
    'import java.util.Arrays;',
    '',
    '// 阶段 4: 二分查找优化 (单次转移 O(log N))',
    'public class Code02_MinCostTicketsStage4 {',
    '    public static int mincostTickets(int[] days, int[] costs) {',
    '        int n = days.length;',
    '        int[] dp = new int[n + 1];',
    '        int[] duration = {1, 7, 30};',
    '        for (int i = n - 1; i >= 0; i--) {',
    '            int ans = Integer.MAX_VALUE;',
    '            for (int k = 0; k < 3; k++) {',
    '                int target = days[i] + duration[k];',
    '                int j = binarySearch(days, i, n, target); // 二分定位落点',
    '                ans = Math.min(ans, costs[k] + dp[j]);',
    '            }',
    '            dp[i] = ans;',
    '        }',
    '        return dp[0];',
    '    }',
    '    // 二分查找首个 days[m] >= target 的下标',
    '    private static int binarySearch(int[] days, int l, int r, int target) {',
    '        int ans = r;',
    '        while (l < r) {',
    '            int m = (l + r) / 2;',
    '            if (days[m] >= target) { ans = m; r = m; }',
    '            else { l = m + 1; }',
    '        }',
    '        return ans;',
    '    }',
    '}',
  ],
  cpp: [
    '// 阶段 4: 二分查找优化',
    'class Solution {',
    'public:',
    '    int mincostTickets(vector<int>& days, vector<int>& costs) {',
    '        int n = days.size();',
    '        vector<int> dp(n + 1, 0);',
    '        int duration[3] = {1, 7, 30};',
    '        for (int i = n - 1; i >= 0; i--) {',
    '            int ans = 1e9;',
    '            for (int k = 0; k < 3; k++) {',
    '                int target = days[i] + duration[k];',
    '                auto it = lower_bound(days.begin() + i, days.end(), target);',
    '                int j = it - days.begin();',
    '                ans = min(ans, costs[k] + dp[j]);',
    '            }',
    '            dp[i] = ans;',
    '        }',
    '        return dp[0];',
    '    }',
    '};',
  ],
  python: [
    'import bisect',
    '# 阶段 4: 二分查找优化',
    'class Solution:',
    '    def mincostTickets(self, days: list[int], costs: list[int]) -> int:',
    '        n = len(days)',
    '        dp = [0] * (n + 1)',
    '        durations = [1, 7, 30]',
    '        for i in range(n - 1, -1, -1):',
    '            ans = float("inf")',
    '            for k in range(3):',
    '                target = days[i] + durations[k]',
    '                j = bisect.bisect_left(days, target, lo=i)',
    '                ans = min(ans, costs[k] + dp[j])',
    '            dp[i] = ans',
    '        return dp[0]',
  ],
  javascript: [
    '// 阶段 4: 二分查找优化',
    'function mincostTickets(days, costs) {',
    '    const n = days.length;',
    '    const dp = new Array(n + 1).fill(0);',
    '    const durations = [1, 7, 30];',
    '    for (let i = n - 1; i >= 0; i--) {',
    '        let ans = Infinity;',
    '        for (let k = 0; k < 3; k++) {',
    '            const target = days[i] + durations[k];',
    '            let l = i, r = n, j = n;',
    '            while (l < r) {',
    '                const m = (l + r) >> 1;',
    '                if (days[m] >= target) { j = m; r = m; } else { l = m + 1; }',
    '            }',
    '            ans = Math.min(ans, costs[k] + dp[j]);',
    '        }',
    '        dp[i] = ans;',
    '    }',
    '    return dp[0];',
    '}',
  ],
};

export const MIN_COST_TICKETS_STAGE4_LINES = {
  entry: { java: 6, cpp: 5, python: 5, javascript: 3 },
  initDp: { java: 8, cpp: 7, python: 6, javascript: 4 },
  outerLoop: { java: 10, cpp: 9, python: 8, javascript: 6 },
  calcTarget: { java: 13, cpp: 12, python: 11, javascript: 9 },
  binarySearch: { java: 14, cpp: 13, python: 12, javascript: 11 },
  updateAns: { java: 15, cpp: 15, python: 13, javascript: 14 },
  saveDp: { java: 17, cpp: 17, python: 14, javascript: 16 },
  returnAns: { java: 19, cpp: 19, python: 15, javascript: 18 },
};

// ==========================================
// 2. 步骤定义与生成器 (Stage 1 / 2 / 4)
// ==========================================

export interface Stage1Step {
  message: string;
  explanation?: string;
  line: number;
  codeLine?: HighlightTarget;
  days: number[];
  costs: number[];
  dp: number[];
  callStack: number[];
  currentI: number;
  branch?: number; // 0: 1天, 1: 7天, 2: 30天
  targetJ?: number;
  returnedCost?: number;
  metrics: Record<string, string | number>;
}

export interface Stage2Step {
  message: string;
  explanation?: string;
  line: number;
  codeLine?: HighlightTarget;
  days: number[];
  costs: number[];
  dp: number[];
  memo: number[];
  currentI: number;
  status: 'hit' | 'miss' | 'calc' | 'store';
  hitCount: number;
  missCount: number;
  jumpIdx1?: number;
  jumpIdx7?: number;
  jumpIdx30?: number;
  metrics: Record<string, string | number>;
}

export interface Stage4Step {
  message: string;
  explanation?: string;
  line: number;
  codeLine?: HighlightTarget;
  days: number[];
  costs: number[];
  dp: number[];
  currentI: number;
  passType?: number; // 0, 1, 2
  targetDay?: number;
  bsLeft?: number;
  bsRight?: number;
  bsMid?: number;
  finalJ?: number;
  metrics: Record<string, string | number>;
}

export function buildMinCostTicketsStage1Steps(days: number[], costs: number[]): Stage1Step[] {
  const steps: Stage1Step[] = [];
  const lines = MIN_COST_TICKETS_STAGE1_LINES;
  const n = days.length;
  const durations = [1, 7, 30];

  steps.push({
    message: `🚀 暴力递归尝试启动：求解完成计划旅行日的最少总花费。`,
    explanation: `函数 f(i) 定义：从第 i 个旅行日开始，完成所有剩余旅行的最小花费。无备忘录，纯分支展开。`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    days,
    costs,
    dp: [],
    callStack: [0],
    currentI: 0,
    metrics: { '当前旅行日': `第${days[0]}天`, '调用栈深度': 1, '递归调用次数': 1 },
  });

  let totalCalls = 1;
  const stack: number[] = [0];

  function f(i: number, depth: number): number {
    if (steps.length > 25) return 0; // 避免步骤爆炸

    if (i >= n) {
      steps.push({
        message: `🏁 递归触底：i=${i} >= ${n}，无需继续旅行，返回 $0。`,
        explanation: `已越过最后旅行日，基准条件生效。`,
        line: lines.baseCheck.javascript,
        codeLine: lines.baseCheck,
        days,
        costs,
        dp: [],
        callStack: [...stack],
        currentI: i,
        returnedCost: 0,
        metrics: { '基准条件': 'i >= n', '返回值': '$0', '调用栈深度': stack.length },
      });
      return 0;
    }

    let minAns = Infinity;

    for (let k = 0; k < 3; k++) {
      let j = i;
      while (j < n && days[j] < days[i] + durations[k]) j++;

      totalCalls++;
      stack.push(j);

      steps.push({
        message: `🌿 递归尝试分支 ${k + 1} (${durations[k]}天票 $${costs[k]}): 从第 ${days[i]} 天跳至第 ${j < n ? days[j] : '终点'} 天 (i=${j})。`,
        explanation: `递归调用 f(${j})，探索第 ${j} 天起的后续最优策略。`,
        line: lines.recursiveCall.javascript,
        codeLine: lines.recursiveCall,
        days,
        costs,
        dp: [],
        callStack: [...stack],
        currentI: i,
        branch: k,
        targetJ: j,
        metrics: { '当前分支': `${durations[k]}天通行证`, '下个决策日': j < n ? `${days[j]}日` : '终点', '调用栈深': stack.length },
      });

      const nextCost = f(j, depth + 1);
      const curTotal = costs[k] + nextCost;
      minAns = Math.min(minAns, curTotal);
      stack.pop();
    }

    steps.push({
      message: `↩️ 回溯汇聚：第 ${days[i]} 天的三分支决策中，最小花费为 $${minAns}，向上层返回。`,
      explanation: `当前子树探索完毕，向上回溯。`,
      line: lines.returnAns.javascript,
      codeLine: lines.returnAns,
      days,
      costs,
      dp: [],
      callStack: [...stack],
      currentI: i,
      returnedCost: minAns,
      metrics: { '局部最优': `$${minAns}`, '调用栈深': stack.length, '总调用数': totalCalls },
    });

    return minAns;
  }

  f(0, 1);

  steps.push({
    message: `🎉 暴力递归求解完毕：得到最优解，但伴随大量重复子问题与指数级爆炸。`,
    explanation: `由于不同的买票组合会重复到达相同的第 j 天，导致同一子问题被无意义地重复计算多次，急需引入备忘录剪枝。`,
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    days,
    costs,
    dp: [],
    callStack: [],
    currentI: 0,
    metrics: { '最终结果': '求解完成', '复杂度': 'O(3^N) 指数爆炸' },
  });

  return steps;
}

export function buildMinCostTicketsStage2Steps(days: number[], costs: number[]): Stage2Step[] {
  const steps: Stage2Step[] = [];
  const lines = MIN_COST_TICKETS_STAGE2_LINES;
  const n = days.length;
  const durations = [1, 7, 30];
  const memo: number[] = new Array(n).fill(-1);

  let hits = 0;
  let misses = 0;

  steps.push({
    message: `🚀 记忆化搜索初始化：引入一维 memo[${n}] 数组，初值置 -1。`,
    explanation: `任何计算过的旅行日解立即写入 memo[i]，后续遇到直接 O(1) 返回，剪除整颗重复递归子树。`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    days,
    costs,
    dp: [...memo],
    memo: [...memo],
    currentI: 0,
    status: 'miss',
    hitCount: 0,
    missCount: 0,
    metrics: { '备忘录大小': n, '缓存命中数': 0, '未命中数': 0 },
  });

  // 自底向上或模拟记忆化填充
  for (let i = n - 1; i >= 0; i--) {
    misses++;
    steps.push({
      message: `🔍 探查 memo[${i}] (第 ${days[i]} 天): 值为 -1 (Cache Miss 未命中)，开始展开 3 分支计算。`,
      explanation: `首次到达该状态，需要计算 1天/7天/30天 通行证的最优解。`,
      line: lines.cacheHit.javascript,
      codeLine: lines.cacheHit,
      days,
      costs,
      dp: [...memo],
      memo: [...memo],
      currentI: i,
      status: 'miss',
      hitCount: hits,
      missCount: misses,
      metrics: { '当前状态': `第${days[i]}天`, '缓存状态': 'Miss (首次计算)', '未命中总数': misses },
    });

    let j1 = i; while (j1 < n && days[j1] < days[i] + 1) j1++;
    let j7 = i; while (j7 < n && days[j7] < days[i] + 7) j7++;
    let j30 = i; while (j30 < n && days[j30] < days[i] + 30) j30++;

    const c1 = costs[0] + (j1 < n ? memo[j1] : 0);
    const c7 = costs[1] + (j7 < n ? memo[j7] : 0);
    const c30 = costs[2] + (j30 < n ? memo[j30] : 0);
    const best = Math.min(c1, c7, c30);

    if (j7 < n && memo[j7] !== -1) hits++;
    if (j30 < n && memo[j30] !== -1) hits++;

    memo[i] = best;

    steps.push({
      message: `💾 写入 memo[${i}] = $${best}：第 ${days[i]} 天最优解锁定，后续若有其他分支跳到该日将直接命中！`,
      explanation: `成功把该子问题结果固化到备忘录中。`,
      line: lines.saveMemo.javascript,
      codeLine: lines.saveMemo,
      days,
      costs,
      dp: [...memo],
      memo: [...memo],
      currentI: i,
      status: 'store',
      hitCount: hits,
      missCount: misses,
      jumpIdx1: j1,
      jumpIdx7: j7,
      jumpIdx30: j30,
      metrics: { '缓存写入': `memo[${i}] = $${best}`, '剪枝累计命中': hits, '未命中数': misses },
    });
  }

  steps.push({
    message: `🎉 记忆化搜索完成！从第 ${days[0]} 天开始的全程最低票价为 memo[0] = $${memo[0]}。`,
    explanation: `状态数压缩到 O(N)，总时间复杂度从指数级骤降为 O(N)。`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    days,
    costs,
    dp: [...memo],
    memo: [...memo],
    currentI: 0,
    status: 'hit',
    hitCount: hits,
    missCount: misses,
    metrics: { '全局最低票价': `$${memo[0]}`, '总剪枝命中': hits, '复杂度': 'O(N)' },
  });

  return steps;
}

export function buildMinCostTicketsStage4Steps(days: number[], costs: number[]): Stage4Step[] {
  const steps: Stage4Step[] = [];
  const lines = MIN_COST_TICKETS_STAGE4_LINES;
  const n = days.length;
  const durations = [1, 7, 30];
  const dp: number[] = new Array(n + 1).fill(0);

  steps.push({
    message: `🚀 二分优化启动：将内层线性扫描优化为二分查找 upper_bound。`,
    explanation: `利用 days 数组严格单调递增的天然有序性，在 O(log N) 内精确定位首个无法被覆盖的旅行日。`,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    days,
    costs,
    dp: [...dp],
    currentI: n,
    metrics: { '优化核心': '有序数组二分查找', '单次转移': 'O(log N)' },
  });

  for (let i = n - 1; i >= 0; i--) {
    let ans = Infinity;

    for (let k = 0; k < 3; k++) {
      const target = days[i] + durations[k];
      let l = i, r = n, j = n;

      steps.push({
        message: `🎯 第 ${days[i]} 天考量 ${durations[k]} 天通行证：目标寻找首个 >= ${target} 的旅行日。`,
        explanation: `二分查找区间 [left=${l}, right=${r}]。`,
        line: lines.calcTarget.javascript,
        codeLine: lines.calcTarget,
        days,
        costs,
        dp: [...dp],
        currentI: i,
        passType: k,
        targetDay: target,
        bsLeft: l,
        bsRight: r,
        metrics: { '决策日': `${days[i]}日`, '目标天数': `>= ${target}`, '查找区间': `[${l}, ${r}]` },
      });

      while (l < r) {
        const m = (l + r) >> 1;
        if (days[m] >= target) {
          j = m;
          r = m;
        } else {
          l = m + 1;
        }
      }

      const branchCost = costs[k] + dp[j];
      ans = Math.min(ans, branchCost);

      steps.push({
        message: `⚡ 二分锁定落点：首个满足条件的下标为 j=${j} (${j < n ? `第${days[j]}天` : '终点'})，转移花费 $${costs[k]} + dp[${j}]($${dp[j]}) = $${branchCost}。`,
        explanation: `二分查找以 O(log N) 代替了最坏情况下的 O(N) 线性扫描。`,
        line: lines.binarySearch.javascript,
        codeLine: lines.binarySearch,
        days,
        costs,
        dp: [...dp],
        currentI: i,
        passType: k,
        targetDay: target,
        finalJ: j,
        metrics: { '锁定落点': `j=${j}`, '分支花费': `$${branchCost}`, '当前最优': `$${ans}` },
      });
    }

    dp[i] = ans;

    steps.push({
      message: `✅ 第 ${days[i]} 天更新完成：dp[${i}] = $${ans}。`,
      explanation: `三种二分跳跃分支综合求得局部最优。`,
      line: lines.saveDp.javascript,
      codeLine: lines.saveDp,
      days,
      costs,
      dp: [...dp],
      currentI: i,
      metrics: { '状态写入': `dp[${i}] = $${ans}`, '已完成天数': n - i },
    });
  }

  steps.push({
    message: `🎉 二分优化递推圆满完成！最终最低总花费为 dp[0] = $${dp[0]}。`,
    explanation: `全程总复杂度稳定在 O(N log N)，在超大天数规模下性能极其优异。`,
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    days,
    costs,
    dp: [...dp],
    currentI: 0,
    metrics: { '全局最低总花费': `$${dp[0]}`, '总旅行日': n, '算法效率': 'O(N log N)' },
  });

  return steps;
}

// ==========================================
// 3. 各阶段画布与监控渲染 (Card 1 & Card 2)
// ==========================================

export function renderStage1Card1(container: HTMLElement, step: Stage1Step): void {
  const { days, costs, callStack, currentI, branch, targetJ } = step;

  const stackBadges = callStack.map((idx, sIdx) => `
    <div style="display: flex; align-items: center; gap: 4px; background: #eff6ff; border: 1px solid #3b82f6; border-radius: 6px; padding: 4px 8px;">
      <span style="font-size: 11px; color: #1d4ed8; font-weight: 700;">帧 #${sIdx}</span>
      <span style="font-size: 12px; color: #0f172a; font-weight: 800;">f(${idx < days.length ? `第${days[idx]}天` : '终点'})</span>
    </div>
  `).join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; box-sizing: border-box;">
      <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px;">
        <span style="font-size: 12px; font-weight: 700; color: #334155;">🌲 递归调用栈 (Call Stack)</span>
        <span style="font-size: 11px; background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 999px; font-weight: 600;">深度: ${callStack.length}</span>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 8px; min-height: 44px; align-items: center; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 8px 12px;">
        ${stackBadges || '<span style="font-size: 12px; color: #94a3b8;">调用栈为空</span>'}
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        <div style="background: ${branch === 0 ? '#eff6ff' : '#ffffff'}; border: 1px solid ${branch === 0 ? '#3b82f6' : '#e2e8f0'}; border-radius: 8px; padding: 8px 12px;">
          <div style="font-size: 11px; color: #1d4ed8; font-weight: 700;">🎫 1 天票 ($${costs[0]})</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">递归至 i+1</div>
        </div>
        <div style="background: ${branch === 1 ? '#fdf4ff' : '#ffffff'}; border: 1px solid ${branch === 1 ? '#d946ef' : '#e2e8f0'}; border-radius: 8px; padding: 8px 12px;">
          <div style="font-size: 11px; color: #a21caf; font-weight: 700;">🎫 7 天票 ($${costs[1]})</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">跳过 7 天内日期</div>
        </div>
        <div style="background: ${branch === 2 ? '#fff7ed' : '#ffffff'}; border: 1px solid ${branch === 2 ? '#f97316' : '#e2e8f0'}; border-radius: 8px; padding: 8px 12px;">
          <div style="font-size: 11px; color: #c2410c; font-weight: 700;">🎫 30 天票 ($${costs[2]})</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">跳过 30 天内日期</div>
        </div>
      </div>
    </div>
  `;
}

export function renderStage2Card1(container: HTMLElement, step: Stage2Step): void {
  const { days, memo, currentI, status, hitCount, missCount } = step;

  const memoSlots = days.map((d, i) => {
    const val = memo[i];
    const isCur = i === currentI;
    const isCached = val !== -1;

    let bg = '#ffffff';
    let border = '#e2e8f0';
    let textColor = '#64748b';

    if (isCur) {
      bg = status === 'hit' ? '#ecfdf5' : '#eff6ff';
      border = status === 'hit' ? '#10b981' : '#3b82f6';
      textColor = status === 'hit' ? '#047857' : '#1d4ed8';
    } else if (isCached) {
      bg = '#f8fafc';
      border = '#94a3b8';
      textColor = '#0f172a';
    }

    return `
      <div style="display: flex; flex-direction: column; align-items: center; background: ${bg}; border: 1.5px solid ${border}; border-radius: 8px; padding: 6px 10px; min-width: 64px;">
        <span style="font-size: 10px; color: #94a3b8;">${d}日 (i=${i})</span>
        <span style="font-size: 13px; font-weight: 800; color: ${textColor}; margin-top: 2px;">${isCached ? `$${val}` : '未算'}</span>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
      <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px;">
        <span style="font-size: 12px; font-weight: 700; color: #334155;">💾 备忘录缓存条 memo[i]</span>
        <div style="display: flex; gap: 8px;">
          <span style="font-size: 11px; background: #ecfdf5; color: #047857; padding: 2px 8px; border-radius: 999px; font-weight: 600;">⚡ 剪枝命中: ${hitCount}</span>
          <span style="font-size: 11px; background: #eff6ff; color: #1e40af; padding: 2px 8px; border-radius: 999px; font-weight: 600;">首次计算: ${missCount}</span>
        </div>
      </div>
      <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
        ${memoSlots}
      </div>
    </div>
  `;
}

export function renderStage4Card1(container: HTMLElement, step: Stage4Step): void {
  const { days, costs, dp, currentI, targetDay, bsLeft, bsRight, finalJ } = step;

  const daysBadges = days.map((d, i) => {
    const isCur = i === currentI;
    const isTarget = i === finalJ;
    const inRange = bsLeft !== undefined && bsRight !== undefined && i >= bsLeft && i <= bsRight;

    let bg = '#ffffff';
    let border = '#e2e8f0';
    let color = '#334155';

    if (isCur) {
      bg = '#eff6ff';
      border = '#3b82f6';
      color = '#1d4ed8';
    } else if (isTarget) {
      bg = '#fef08a';
      border = '#ca8a04';
      color = '#854d0e';
    } else if (inRange) {
      bg = '#f8fafc';
      border = '#93c5fd';
      color = '#1e40af';
    }

    return `
      <div style="display: flex; flex-direction: column; align-items: center; background: ${bg}; border: 1.5px solid ${border}; border-radius: 8px; padding: 6px 10px; min-width: 60px;">
        <span style="font-size: 10px; color: #94a3b8;">${d}日</span>
        <span style="font-size: 12px; font-weight: 800; color: ${color};">i=${i}</span>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
      <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px;">
        <span style="font-size: 12px; font-weight: 700; color: #334155;">⚡ 二分查找区间游标 (Binary Search Span)</span>
        <span style="font-size: 11px; background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 999px; font-weight: 600;">目标: >= ${targetDay || '—'}天</span>
      </div>
      <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
        ${daysBadges}
      </div>
    </div>
  `;
}
