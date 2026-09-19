import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { snapshotGrid2D } from './grid-snapshot';

/**
 * 合并石子的最低成本 (Minimum Cost to Merge Stones, LC 1000, 左程云 84 课)
 * 相邻石子合并区间 DP：
 * 预处理前缀和 sum 数组，区间 [i, j] 重量为 sum[j + 1] - sum[i]。
 * 状态定义：dp[i][j] 表示将区间 [i, j] 内石子合并为一堆的最低总成本。
 * 转移方程：dp[i][j] = min_{k \in [i, j-1]} (dp[i][k] + dp[k+1][j]) + sum[i..j]
 */
export function compileMergeStones(
  _model: IYamlAlgorithmModel,
  params: StageExecutionParams
): UniversalStep[] {
  const stones: number[] = (params.params?.stones as number[]) || [3, 2, 4, 1];
  const n = stones.length;
  const anchorMap = params.anchorMap;

  const lineEntry = anchorMap?.entry || 2;
  const lineInitN = anchorMap?.init_n || 3;
  const lineGuardLess = anchorMap?.guard_less || 4;
  const lineInitSum = anchorMap?.init_sum || 5;
  const lineFillSum = anchorMap?.fill_sum || 6;
  const lineInitDp = anchorMap?.init_dp || 7;
  const lineLoopLen = anchorMap?.loop_len || 8;
  const lineLoopI = anchorMap?.loop_i || 9;
  const lineCalcJ = anchorMap?.calc_j || 10;
  const lineInitMin = anchorMap?.init_min || 11;
  const lineLoopK = anchorMap?.loop_k || 12;
  const lineCalcCost = anchorMap?.calc_cost || 13;
  const lineUpdateMin = anchorMap?.update_min || 14;
  const lineTransfer = anchorMap?.transfer || 16;
  const lineReturn = anchorMap?.return || 19;

  const steps: UniversalStep[] = [];

  // 二维表格：大小 n * n
  const grid: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null));

  // Step 0: 函数入口帧
  steps.push({
    type: 'entry',
    flowPhase: 'forward',
    line: lineEntry,
    i: 0,
    j: 0,
    grid: snapshotGrid2D(grid),
    dp1d: [...stones],
    memo: {},
    activeSlot: 0,
    tag: `mergeStones(stones) 堆数 n=${n}`,
    log: `🎯 进入 mergeStones：石子序列 stones=[${stones.join(', ')}]`,
    msg: `主函数入口：给定 <code>${n}</code> 堆排成一列的石子 <code>[${stones.join(', ')}]</code>。每次合并相邻两堆，成本为两堆重量之和。`,
  });

  // Step 1: 特判
  if (n <= 1) {
    steps.push({
      type: 'return',
      flowPhase: 'backtrack',
      line: lineGuardLess,
      i: 0,
      j: 0,
      grid: snapshotGrid2D(grid),
      dp1d: [...stones],
      memo: {},
      activeSlot: 0,
      tag: '石子堆数 <= 1，无需合并，返回 0',
      log: '| 石子数量 <= 1，总成本 = 0',
      msg: '石子只有 1 堆或没有石子，已成一堆，合并成本为 <strong>0</strong>。',
    });
    return steps;
  }

  // Step 2: 预处理前缀和
  const sum = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) sum[i + 1] = sum[i] + stones[i]!;

  steps.push({
    type: 'init',
    flowPhase: 'forward',
    line: lineFillSum,
    i: 0,
    j: n - 1,
    grid: snapshotGrid2D(grid),
    dp1d: [...sum],
    memo: {},
    activeSlot: 0,
    tag: `预处理前缀和数组 sum=[${sum.join(', ')}]`,
    log: `| 🧮 前缀和计算完毕：任意区间 [i, j] 重量 = sum[j+1] - sum[i]`,
    msg: `预处理前缀和数组 <code>sum</code>，用于在 $O(1)$ 时间获取区间合并的基础重量开销。`,
  });

  // Step 3: 分配 DP 表格
  steps.push({
    type: 'init',
    flowPhase: 'forward',
    line: lineInitDp,
    i: 0,
    j: n - 1,
    grid: snapshotGrid2D(grid),
    dp1d: [...stones],
    memo: {},
    activeSlot: 0,
    tag: `分配 dp[${n}][${n}] 状态矩阵`,
    log: `| 📊 初始化上三角区间 DP 矩阵：对角线 dp[i][i] = 0`,
    msg: `分配状态表 <code>dp = new int[${n}][${n}]</code>。单堆石子无需合并，基底 <code>dp[i][i] = 0</code>。`,
  });

  for (let i = 0; i < n; i++) grid[i]![i] = 0;

  steps.push({
    type: 'init_val',
    flowPhase: 'forward',
    line: lineInitDp,
    i: 0,
    j: 0,
    grid: snapshotGrid2D(grid),
    dp1d: [...stones],
    memo: {},
    activeSlot: 0,
    tag: '基础条件: 单堆石子成本 0',
    log: '| 📋 单堆石子无需合并，dp[i][i] = 0',
    msg: '基础条件：单堆石子（长度为 1）自身已成一堆，合并成本 <code>dp[i][i] = 0</code>。',
  });

  // Step 4: 按区间长度 len 从 2 到 n 递推
  for (let len = 2; len <= n; len++) {
    steps.push({
      type: 'loop_len',
      flowPhase: 'forward',
      line: lineLoopLen,
      i: 0,
      j: len - 1,
      grid: snapshotGrid2D(grid),
      dp1d: [...stones],
      memo: {},
      activeSlot: len,
      tag: `--- 递推区间长度 len = ${len} ---`,
      log: `| 📏 计算所有长度为 ${len} 的石子区间合并`,
      msg: `外层递推推进：当前计算长度为 <code>len = ${len}</code> 的石子连续合并。`,
    });

    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      let minCost = Infinity;
      let bestK = -1;

      // 枚举分割点 k ∈ [i, j-1]
      for (let k = i; k < j; k++) {
        const leftCost = grid[i]![k] ?? 0;
        const rightCost = grid[k + 1]![j] ?? 0;
        const total = leftCost + rightCost;
        if (total < minCost) {
          minCost = total;
          bestK = k;
        }
      }

      const rangeWeight = sum[j + 1]! - sum[i]!;
      const finalCost = minCost + rangeWeight;
      grid[i]![j] = finalCost;

      steps.push({
        type: 'transfer',
        flowPhase: 'backtrack',
        line: lineTransfer,
        i,
        j,
        grid: snapshotGrid2D(grid),
        dp1d: [...stones],
        memo: {},
        activeSlot: j,
        gridHighlight: { i, j },
        deps: bestK !== -1 ? [
          { r: i, c: bestK, type: 'left', label: `dp[${i}][${bestK}]=${grid[i]![bestK]}` },
          { r: bestK + 1, c: j, type: 'bottom' as any, label: `dp[${bestK+1}][${j}]=${grid[bestK+1]![j]}` },
        ] : [],
        tag: `区间 [${i}, ${j}] 最优分割 k=${bestK} (值[${stones.slice(i, j + 1).join(',')}]) ➔ 成本 ${finalCost}`,
        log: `| 🪨 区间 [${i}, ${j}]：在 k=${bestK} 分割为 [${i}..${bestK}] 与 [${bestK+1}..${j}]，子区间合并=${grid[i]![bestK]}+${grid[bestK+1]![j]}=${minCost}，区间总重=${rangeWeight} ➔ 最终成本 = ${finalCost}`,
        msg: `计算区间 <code>[${i}, ${j}]</code>：在位置 <code>k = ${bestK}</code> 处分割最优，子区间合并成本 <code>${grid[i]![bestK]} + ${grid[bestK+1]![j]}</code>，加上最后合并全区间的总重量 <code>${rangeWeight}</code>，总成本为 <code><strong>${finalCost}</strong></code>。`,
      });
    }
  }

  // Step 5: 全局最优解收敛
  const ans = grid[0]![n - 1] ?? 0;
  steps.push({
    type: 'return',
    flowPhase: 'backtrack',
    line: lineReturn,
    i: 0,
    j: n - 1,
    grid: snapshotGrid2D(grid),
    dp1d: [...stones],
    memo: {},
    activeSlot: n - 1,
    gridHighlight: { i: 0, j: n - 1 },
    tag: `🎉 全部合并为一堆最低总成本: ${ans}`,
    log: `| 🏆 推导收敛：dp[0][${n - 1}] = ${ans}`,
    msg: `🎉 推导完成！将所有 <code>${n}</code> 堆石子合并为一堆的最低总成本为 <strong>${ans}</strong>。`,
  });

  return steps;
}
