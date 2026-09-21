/**
 * 目标和 (LeetCode 494) 四阶段演化推演引擎
 *
 * 阶段 1: 暴力递归 —— 直接对每个 nums[i] 做 +/− 分治（状态 i, curSum）
 * 阶段 2: 记忆化搜索 —— 嵌套 HashMap 缓存（curSum 可负，无法用二维数组）
 * 阶段 3: 二维 DP —— offset 平移将 [-totalSum, +totalSum] 映射到 [0, 2·totalSum]
 * 阶段 4: 空间压缩 —— 转化为子集和 (target+sum)/2 的 01 背包一维滚动数组
 *         （阶段 4 的 buildTargetSumSteps 位于 target-sum-renderer.ts）
 */

import { type RecursionStepBase, type MemoStepBase, type Dp2DStepBase } from '../../../../core/step-types';
import { TARGET_SUM_STAGE1_CODE_LANGUAGES, TARGET_SUM_STAGE2_CODE_LANGUAGES, TARGET_SUM_STAGE3_CODE_LANGUAGES } from './knapsack-073-templates';
import { getKnapsack073Anchor } from './knapsack-073-stage-codes';
import { MemoTraceTracker, Dp2DTraceTracker } from '../../../../core/strategies/table-step-engine';
import { snapshotGrid2D } from '../../../../core/strategies/grid-snapshot';
import { RecursionTraceTracker } from '../../../../core/strategies/recursion-trace-tracker';

type CallFrame = { i: number; curSum: number; label: string };

/** 阶段 1 步骤：暴力递归 +/- 分治 */
interface TargetSumRecursionStep extends RecursionStepBase<CallFrame> {
  i: number;
  curSum: number;
  n: number;
  /** 向后兼容旧渲染字段；新流程下与 curSum 同值 */
  remCap: number;
}

/** 阶段 2 步骤：HashMap 记忆化 */
interface TargetSumMemoStep extends MemoStepBase {
  curSum: number;
  memoHit: boolean;
  /** 可视化快照：行=已处理元素数 i，列=sum+totalSum 偏移；未访问格 = null */
  memoGrid: (number | null)[][];
  cachedVal?: number;
  /** 向后兼容 */
  remCap: number;
}

/** 阶段 3 步骤：offset 二维 DP */
interface TargetSum2DStep extends Dp2DStepBase {
  /** dp 表：行 [0..n]，列 [0..2·totalSum]，列 j 代表实际和 j - totalSum */
  dpTable: number[][];
  depCells: Array<{ label: string; val: number; r: number; c: number }>;
  totalSum: number;
  offset: number;
}

// ==========================================
// 阶段 1: 暴力递归 (+/− 直接分治)
// ==========================================

export function buildTargetSumRecursionSteps(nums: number[], target: number, maxSteps = 800): TargetSumRecursionStep[] {
  const n = nums.length;

  const tracker = new RecursionTraceTracker<TargetSumRecursionStep, CallFrame>({
    maxSteps,
    resolveLine: (anchor) => getKnapsack073Anchor(1, 'target-sum', anchor),
  });

  const pushStep = (action: string, codeKey: string, i: number, curSum: number, decision: string, message: string, retVal?: number) => {
    tracker.pushStep(action, codeKey, {
      i,
      curSum,
      remCap: curSum,
      n,
      decision,
      message,
      log: `[DFS] i=${i} curSum=${curSum} | ${action}: ${message}`,
      returnValue: retVal,
      metrics: {
        'metric-cur-state': i < n ? `f(i=${i}, sum=${curSum})` : '边界触底',
        'metric-cur-num': i < n ? `nums[${i}]=${nums[i]}` : '—',
        'metric-stack-depth': `${tracker.depth}`,
      },
    });
  };

  pushStep('callRoot', 'callRoot', 0, 0, '启动暴力递归',
    `🚀 启动目标和暴力递归：对每个 nums[i] 依次尝试 '+' / '−'，当前累加和 curSum=0，目标 target=${target}。`);

  function dfs(i: number, curSum: number): number {
    if (tracker.exhausted) return 0;
    const label = `f(i=${i}, sum=${curSum})`;
    tracker.enterFrame({ i, curSum, label });
    pushStep('fnEnter', 'fnEnter', i, curSum, '进入栈帧',
      `📥 进入栈帧 ${label}，准备对 nums[${i}]=${nums[i]} 做 +/− 分支。`);

    if (i === n) {
      const ways = curSum === target ? 1 : 0;
      pushStep('baseCheck', 'baseCheck', i, curSum,
        `触底判定: curSum=${curSum} vs target=${target}`,
        ways === 1
          ? `✅ 累加和恰好等于 target=${target}！返回 1 种有效表达式。`
          : `❌ 累加和 ${curSum} ≠ target=${target}，返回 0。`,
        ways);
      tracker.exitFrame();
      return ways;
    }

    // 分支 1: +nums[i]
    const plusWays = dfs(i + 1, curSum + nums[i]);
    pushStep('branch1', 'branch1', i, curSum,
      `分支 1: +${nums[i]} → curSum=${curSum}+${nums[i]}=${curSum + nums[i]}`,
      `🌿 '+' 分支：给 nums[${i}]=${nums[i]} 添加正号，后续方案数 = ${plusWays}。`);

    // 分支 2: −nums[i]
    const minusWays = dfs(i + 1, curSum - nums[i]);
    pushStep('branch2', 'branch2', i, curSum,
      `分支 2: −${nums[i]} → curSum=${curSum}−${nums[i]}=${curSum - nums[i]}`,
      `💥 '−' 分支：给 nums[${i}]=${nums[i]} 添加负号，后续方案数 = ${minusWays}。`);

    const totalWays = plusWays + minusWays;
    pushStep('returnSum', 'returnSum', i, curSum,
      `方案累加: ${plusWays}+${minusWays}=${totalWays}`,
      `📤 栈帧 ${label} 汇聚：+ 分支 ${plusWays} + − 分支 ${minusWays} = ${totalWays} 种。`,
      totalWays);
    tracker.exitFrame();
    return totalWays;
  }

  dfs(0, 0);
  return tracker.finalize();
}

// ==========================================
// 阶段 2: HashMap 记忆化搜索
// ==========================================

/**
 * 将嵌套 HashMap 快照为二维可视化网格。
 * 行 = 已处理元素数 i (0..n)，列 = sum+totalSum 偏移 (0..2·totalSum)。
 * 未访问格 = null。
 */
function buildMemoSnapshotGrid(
  memo: Map<number, Map<number, number>>,
  n: number,
  totalSum: number,
): (number | null)[][] {
  const cols = 2 * totalSum + 1;
  const grid: (number | null)[][] = Array.from({ length: n + 1 }, () =>
    new Array<number | null>(cols).fill(null),
  );
  for (const [i, inner] of memo.entries()) {
    for (const [sum, val] of inner.entries()) {
      const col = sum + totalSum;
      if (col >= 0 && col < cols) {
        grid[i][col] = val;
      }
    }
  }
  return grid;
}

export function buildTargetSumMemoSteps(nums: number[], target: number, maxSteps = 800): TargetSumMemoStep[] {
  const n = nums.length;
  const totalSum = nums.reduce((a, b) => a + Math.abs(b), 0);

  // 嵌套 HashMap：memo.get(i).get(curSum) = 方案数
  const memo = new Map<number, Map<number, number>>();
  for (let k = 0; k <= n; k++) memo.set(k, new Map());

  const resolveLine = (anchor: string) => getKnapsack073Anchor(2, 'target-sum', anchor);

  const tracker = new MemoTraceTracker<TargetSumMemoStep>({
    maxSteps,
    resolveLine,
  });

  const pushStep = (
    action: string, codeKey: string,
    i: number, curSum: number, memoHit: boolean,
    decision: string, message: string,
    cachedVal?: number,
  ) => {
    tracker.pushStep(action, codeKey, {
      i,
      curSum,
      remCap: curSum,
      memoHit,
      memoGrid: buildMemoSnapshotGrid(memo, n, totalSum),
      decision,
      message,
      log: `[MEMO] i=${i} curSum=${curSum} | ${action}: ${message}`,
      cachedVal,
      metrics: {
        'metric-cur-state': i < n ? `f(i=${i}, sum=${curSum})` : '边界触底',
        'metric-cache-status': memoHit ? '🎯 Cache HIT' : '⚪ Cache MISS',
        'metric-hit-count': `${tracker.hitCount}`,
        'metric-miss-count': `${tracker.missCount}`,
      },
    });
  };

  pushStep('callRoot', 'callRoot', 0, 0, false, '启动 HashMap 记忆化',
    `🚀 启动记忆化搜索：用嵌套 HashMap 缓存 (i, curSum) → 方案数。curSum 可为负数，因此不能使用二维数组，改用 HashMap。`);

  function dfs(i: number, curSum: number): number {
    if (tracker.exhausted) return 0;

    pushStep('fnEnter', 'fnEnter', i, curSum, false, '进入栈帧',
      `📥 进入栈帧 f(i=${i}, curSum=${curSum})。`);

    if (i === n) {
      const ways = curSum === target ? 1 : 0;
      pushStep('baseCheck', 'baseCheck', i, curSum, false, '触底结算',
        ways === 1 ? `✅ curSum=${curSum} == target=${target}，返回 1。` : `❌ curSum=${curSum} ≠ target=${target}，返回 0。`,
        ways);
      return ways;
    }

    // 查 HashMap 缓存
    const inner = memo.get(i)!;
    if (inner.has(curSum)) {
      tracker.registerHit();
      const val = inner.get(curSum)!;
      pushStep('memoCheck', 'memoCheck', i, curSum, true,
        `命中缓存 HashMap[${i}][${curSum}] = ${val}`,
        `🎯 缓存命中！(i=${i}, curSum=${curSum}) 已计算过，复用方案数 ${val}，直接剪枝！`,
        val);
      return val;
    }

    tracker.registerMiss();
    pushStep('memoCheck', 'memoCheck', i, curSum, false,
      `缓存未命中 HashMap[${i}][${curSum}]`,
      `⚪ 缓存未命中：(i=${i}, curSum=${curSum}) 首次探访，开始递归。`);

    // 分支 1: +nums[i]
    const plusWays = dfs(i + 1, curSum + nums[i]);
    pushStep('branch1', 'branch1', i, curSum, false,
      `分支 1: +${nums[i]} → 后续方案数 ${plusWays}`,
      `🌿 '+' 分支：给 nums[${i}]=${nums[i]} 添加正号，后续方案数 = ${plusWays}。`);

    // 分支 2: −nums[i]
    const minusWays = dfs(i + 1, curSum - nums[i]);
    pushStep('branch2', 'branch2', i, curSum, false,
      `分支 2: −${nums[i]} → 后续方案数 ${minusWays}`,
      `💥 '−' 分支：给 nums[${i}]=${nums[i]} 添加负号，后续方案数 = ${minusWays}。`);

    const res = plusWays + minusWays;
    inner.set(curSum, res);
    pushStep('memoStore', 'memoStore', i, curSum, false,
      `写入缓存 HashMap[${i}][${curSum}] = ${res}`,
      `💾 写入缓存：HashMap[${i}][${curSum}] = ${res} 种方案，O(1) 返回。`,
      res);
    return res;
  }

  dfs(0, 0);
  return tracker.finalize();
}

// ==========================================
// 阶段 3: offset 平移二维 DP
// ==========================================

export function buildTargetSum2DSteps(nums: number[], target: number): TargetSum2DStep[] {
  const n = nums.length;
  const totalSum = nums.reduce((a, b) => a + Math.abs(b), 0);
  const offset = totalSum;
  const cols = 2 * totalSum + 1;

  // dp[i][j]: 用前 i 个数凑出实际和 (j − offset) 的方案数
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(cols).fill(0));

  const resolveLine = (anchor: string) => getKnapsack073Anchor(3, 'target-sum', anchor);
  const tracker = new Dp2DTraceTracker<TargetSum2DStep>({ resolveLine });

  const pushStep = (
    action: string, codeKey: string,
    curI: number, curJ: number,
    depCells: Array<{ label: string; val: number; r: number; c: number }>,
    decision: string, message: string,
  ) => {
    tracker.pushStep(action, codeKey, {
      curI,
      curJ,
      dpTable: snapshotGrid2D(dp),
      depCells,
      totalSum,
      offset,
      decision,
      message,
      log: `[2D DP] i=${curI} j=${curJ} (sum=${curJ - offset}) | ${action}: ${message}`,
      metrics: {
        'metric-cur-cell': `dp[${curI}][${curJ}] (sum=${curJ - offset})`,
        'metric-cell-val': `${dp[curI][curJ]} 种`,
        'metric-dep-info': depCells.map((d) => `${d.label}=${d.val}`).join(', ') || '基底 1',
      },
    });
  };

  // 基底：dp[0][offset] = 1（0 个数凑出和 0 有 1 种方案）
  dp[0][offset] = 1;
  pushStep('initDp', 'initDp', 0, offset, [],
    '基底初始化 dp[0][offset]=1',
    `🚀 初始化二维状态表 dp[${n + 1}][${cols}]。offset=${offset}，列 j 代表实际和 j−${offset}。dp[0][${offset}] = 1：0 个数凑出和 0 有 1 种方案。`);

  for (let i = 1; i <= n; i++) {
    const num = nums[i - 1];
    pushStep('outerLoopI', 'outerLoopI', i, 0, [],
      `外层循环：考察 nums[${i - 1}]=${num}`,
      `📦 外层考察第 ${i} 个数字 nums[${i - 1}]=${num}。`);

    for (let j = 0; j < cols; j++) {
      const actualSum = j - offset;
      const depCells: Array<{ label: string; val: number; r: number; c: number }> = [];

      // '+' 分支来源：dp[i−1][j − num]，即 dp[i−1][(actualSum − num) + offset]
      const plusCol = j - num;
      const plusWays = plusCol >= 0 && plusCol < cols ? dp[i - 1][plusCol] : 0;
      if (plusCol >= 0 && plusCol < cols) {
        depCells.push({
          label: `dp[${i - 1}][${plusCol}] (sum=${actualSum - num})`,
          val: plusWays,
          r: i - 1, c: plusCol,
        });
      }

      // '−' 分支来源：dp[i−1][j + num]，即 dp[i−1][(actualSum + num) + offset]
      const minusCol = j + num;
      const minusWays = minusCol >= 0 && minusCol < cols ? dp[i - 1][minusCol] : 0;
      if (minusCol >= 0 && minusCol < cols) {
        depCells.push({
          label: `dp[${i - 1}][${minusCol}] (sum=${actualSum + num})`,
          val: minusWays,
          r: i - 1, c: minusCol,
        });
      }

      dp[i][j] = plusWays + minusWays;

      pushStep('updateCell', 'updateCell', i, j, depCells,
        `dp[${i}][${j}] = ${dp[i][j]} (sum=${actualSum})`,
        depCells.length === 0
          ? `📍 dp[${i}][${j}]：sum=${actualSum}，无有效来源，方案数 = 0。`
          : `✨ dp[${i}][${j}] = ${plusWays}(+${num}) + ${minusWays}(−${num}) = ${dp[i][j]} 种方案（实际和 = ${actualSum}）。`);
    }
  }

  const targetCol = target + offset;
  const ans = targetCol >= 0 && targetCol < cols ? dp[n][targetCol] : 0;
  pushStep('returnAns', 'returnAns', n, targetCol,
    [{ label: `dp[${n}][${targetCol}] (sum=${target})`, val: ans, r: n, c: targetCol }],
    `最终方案数: dp[${n}][${targetCol}]=${ans}`,
    `🎉 offset 二维 DP 填表完毕！dp[${n}][${target + offset}] = ${ans}，即通过 +/− 凑出 target=${target} 的表达式总数！`);

  return tracker.finalize();
}
