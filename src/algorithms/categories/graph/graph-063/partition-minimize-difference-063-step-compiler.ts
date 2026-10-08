/**
 * 左程云算法通关课 Class 063: 分割数组使两个数组和的差值最小 (LeetCode 2035)
 * 步进推演编译器 (Step Compiler)
 */

import { PARTITION_MIN_DIFF_063_LINES } from './graph-063-stage-codes';
import { Graph063StepBase } from './graph-063-shared';

export interface PartitionMinDiffStep extends Graph063StepBase {
  nums: number[];
  n: number;
  totalSum: number;
  activeK?: number;
  curLeftVal?: number;
  curTarget?: number;
  matchedRightVal?: number;
  currentDiff?: number;
  bestDiff: number;
  lsumCounts: number[];
  rsumCounts: number[];
  status: 'init' | 'dfs_bucket' | 'sort_buckets' | 'pair_search' | 'done';
}

export function buildPartitionMinDiff063Steps(preset: string = 'leetcode_example_1'): PartitionMinDiffStep[] {
  const steps: PartitionMinDiffStep[] = [];
  const lines = PARTITION_MIN_DIFF_063_LINES;

  let nums = [3, 9, 7, 3];

  if (preset === 'leetcode_example_2') {
    nums = [-36, 36];
  } else if (preset === 'medium_6_elements') {
    nums = [2, -1, 0, 4, -2, -9];
  }

  const m = nums.length;
  const n = m >> 1;
  const totalSum = nums.reduce((a, b) => a + b, 0);

  // Step 0: 入口帧
  steps.push({
    nums: [...nums],
    n,
    totalSum,
    bestDiff: Infinity,
    lsumCounts: new Array(n + 1).fill(0),
    rsumCounts: new Array(n + 1).fill(0),
    status: 'init',
    line: lines.entry.java,
    codeLine: lines.entry,
    message: `🚀 算法初始化：分割数组使差最小。原数组长度 2n=${m} (n=${n})，数组总和=${totalSum}。目标各选 ${n} 个数使和差最小。`,
    metrics: { '元素总数': m, '各子集大小': n, '原数组和': totalSum },
  });

  // 分桶初始化
  const lsum: number[][] = Array.from({ length: n + 1 }, () => []);
  const rsum: number[][] = Array.from({ length: n + 1 }, () => []);

  steps.push({
    nums: [...nums],
    n,
    totalSum,
    bestDiff: Infinity,
    lsumCounts: new Array(n + 1).fill(0),
    rsumCounts: new Array(n + 1).fill(0),
    status: 'init',
    line: lines.initBuckets.java,
    codeLine: lines.initBuckets,
    message: `🗂️ 创建选数分桶：lsum[0..${n}] 与 rsum[0..${n}]，分别存放左半部和右半部恰好挑选 k 个数的所有累加和。`,
    metrics: { '左半区间': `[0..${n - 1}]`, '右半区间': `[${n}..${m - 1}]`, '分桶数': n + 1 },
  });

  // DFS 填充左半部分桶
  function dfsLeft(i: number, end: number, k: number, cur: number) {
    if (i === end) {
      lsum[k].push(cur);
      return;
    }
    dfsLeft(i + 1, end, k, cur);
    dfsLeft(i + 1, end, k + 1, cur + nums[i]);
  }
  dfsLeft(0, n, 0, 0);

  // DFS 填充右半部分桶
  function dfsRight(i: number, end: number, k: number, cur: number) {
    if (i === end) {
      rsum[k].push(cur);
      return;
    }
    dfsRight(i + 1, end, k, cur);
    dfsRight(i + 1, end, k + 1, cur + nums[i]);
  }
  dfsRight(n, m, 0, 0);

  const lsumCounts = lsum.map((arr) => arr.length);
  const rsumCounts = rsum.map((arr) => arr.length);

  steps.push({
    nums: [...nums],
    n,
    totalSum,
    bestDiff: Infinity,
    lsumCounts,
    rsumCounts,
    status: 'dfs_bucket',
    line: lines.dfsLeftCount.java,
    codeLine: lines.dfsLeftCount,
    message: `📦 双向分桶收集完毕！左侧选数统计: [${lsumCounts.map((c, k) => `选${k}个:${c}种`).join(', ')}]。`,
    metrics: { '左侧总生成': lsumCounts.reduce((a, b) => a + b, 0), '右侧总生成': rsumCounts.reduce((a, b) => a + b, 0) },
  });

  // 对每个右侧分桶排序
  for (let k = 0; k <= n; k++) {
    rsum[k].sort((a, b) => a - b);
  }

  steps.push({
    nums: [...nums],
    n,
    totalSum,
    bestDiff: Infinity,
    lsumCounts,
    rsumCounts,
    status: 'sort_buckets',
    line: lines.sortBuckets.java,
    codeLine: lines.sortBuckets,
    message: `📶 右半部每个分桶 rsum[0..${n}] 内部均已升序排序，支持快速对数级二分匹配。`,
    metrics: { '分桶排序': '全桶升序完成', '目标半和': Math.floor(totalSum / 2) },
  });

  // 二分辅助函数
  function bisect(list: number[], target: number): number {
    let l = 0, r = list.length - 1, res = list.length;
    while (l <= r) {
      const midVal = (l + r) >> 1;
      if (list[midVal] >= target) {
        res = midVal;
        r = midVal - 1;
      } else {
        l = midVal + 1;
      }
    }
    return res;
  }

  // 跨桶组合二分寻找最优差
  let ans = Infinity;
  const halfSum = Math.floor(totalSum / 2);

  for (let k = 0; k <= n; k++) {
    const leftList = lsum[k];
    const rightList = rsum[n - k];
    const targetK = n - k;

    steps.push({
      nums: [...nums],
      n,
      totalSum,
      activeK: k,
      bestDiff: ans,
      lsumCounts,
      rsumCounts,
      status: 'pair_search',
      line: lines.pairLoop.java,
      codeLine: lines.pairLoop,
      message: `🔄 考察组合配对：左侧选 ${k} 个数 (lsum[${k}] 有 ${leftList.length} 种和)，右侧必须选 ${targetK} 个数 (rsum[${targetK}] 有 ${rightList.length} 种和)。`,
      metrics: { '左选个数 k': k, '右选个数': targetK, '当前最佳差值': ans === Infinity ? '无' : ans },
    });

    for (const a of leftList) {
      const target = halfSum - a;
      const idx = bisect(rightList, target);

      // 考察 idx (>= target 的最小数)
      if (idx < rightList.length) {
        const b = rightList[idx];
        const sumPart1 = a + b;
        const diff = Math.abs(totalSum - 2 * sumPart1);
        if (diff < ans) {
          ans = diff;
          steps.push({
            nums: [...nums],
            n,
            totalSum,
            activeK: k,
            curLeftVal: a,
            curTarget: target,
            matchedRightVal: b,
            currentDiff: diff,
            bestDiff: ans,
            lsumCounts,
            rsumCounts,
            status: 'pair_search',
            line: lines.bisectBucket.java,
            codeLine: lines.bisectBucket,
            message: `✨ 刷新最优差！左选${k}数=${a}，右选${targetK}数=${b}，子集1和=${sumPart1}，两子集差值缩小为 |${totalSum} - 2*${sumPart1}| = ${diff}！`,
            metrics: { '左选和': a, '右选和': b, '子集1和': sumPart1, '刷新最小差': ans },
          });
        }
      }

      // 考察 idx - 1 (< target 的最大数)
      if (idx > 0) {
        const b = rightList[idx - 1];
        const sumPart1 = a + b;
        const diff = Math.abs(totalSum - 2 * sumPart1);
        if (diff < ans) {
          ans = diff;
          steps.push({
            nums: [...nums],
            n,
            totalSum,
            activeK: k,
            curLeftVal: a,
            curTarget: target,
            matchedRightVal: b,
            currentDiff: diff,
            bestDiff: ans,
            lsumCounts,
            rsumCounts,
            status: 'pair_search',
            line: lines.bisectBucket.java,
            codeLine: lines.bisectBucket,
            message: `✨ 刷新最优差 (前驱命中)！左选${k}数=${a}，右选${targetK}数=${b}，子集1和=${sumPart1}，两子集差值缩小为 |${totalSum} - 2*${sumPart1}| = ${diff}！`,
            metrics: { '左选和': a, '右选和': b, '子集1和': sumPart1, '刷新最小差': ans },
          });
        }
      }
    }
  }

  // 最终完成
  steps.push({
    nums: [...nums],
    n,
    totalSum,
    bestDiff: ans,
    lsumCounts,
    rsumCounts,
    status: 'done',
    line: lines.returnAns.java,
    codeLine: lines.returnAns,
    message: `🎉 分桶折半二分搜索圆满完成！将长度为 ${m} 的数组均分为两个长度为 ${n} 的子数组后，两子数组和的最小绝对差为 ${ans}！`,
    metrics: { '最终最小差': ans, '原数组和': totalSum, '状态': '求解完毕' },
  });

  return steps;
}
