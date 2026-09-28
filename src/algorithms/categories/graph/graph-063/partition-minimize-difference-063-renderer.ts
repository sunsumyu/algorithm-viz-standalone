/**
 * 左程云算法通关课 Class 063: 分割数组使两个数组和的差值最小 (LeetCode 2035 · Partition Array to Minimize Difference)
 * 选数约束下的折半搜索 (Meet in the Middle with Count Buckets) + 二分查找
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_063_PROBLEMS } from './graph-063-problem-content';
import {
  PARTITION_MIN_DIFF_063_CODES,
  PARTITION_MIN_DIFF_063_LINES,
} from './graph-063-stage-codes';
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
    message: `🎉 分桶折半二分搜索圆满完成！将长度为 ${m} 的数组均分为两个长度为 ${n} 的子数组后，两子数组和的最小绝对差为 ${ans}！`,
    metrics: { '最终最小差': ans, '原数组和': totalSum, '状态': '求解完毕' },
  });

  return steps;
}

registerDeclarativeAlgorithm({
  id: 'partition-minimize-difference-063',
  name: '分割数组使差最小 (分桶折半搜索)',
  category: 'graph',
  difficulty: '困难',
  description: '左程云 Class 063 Code04：选数约束下的折半搜索 Meet in the Middle，按选数个数 k 分桶 + 二分逼近目标半和 (LeetCode 2035)',
  aliases: ['class063-code04', 'partition-minimize-difference-063', 'partition-minimize-diff-2035', 'partition-array-min-diff', 'leetcode-2035'],
  problemHtml: GRAPH_063_PROBLEMS['partition-minimize-difference-063'].problemHtml,
  analysisHtml: GRAPH_063_PROBLEMS['partition-minimize-difference-063'].complexityHtml,
  codeLanguages: PARTITION_MIN_DIFF_063_CODES,
  inputs: [
    {
      id: 'preset',
      label: '用例选择',
      type: 'select',
      defaultValue: 'leetcode_example_1',
      options: [
        { label: '经典用例 ([3, 9, 7, 3], 最小差 2)', value: 'leetcode_example_1' },
        { label: '对偶负数 ([-36, 36], 最小差 72)', value: 'leetcode_example_2' },
        { label: '6元素用例 ([2, -1, 0, 4, -2, -9])', value: 'medium_6_elements' },
      ],
    },
  ],
  presets: [
    { label: '经典用例 ([3, 9, 7, 3], 最小差 2)', values: { preset: 'leetcode_example_1' } },
    { label: '对偶负数 ([-36, 36], 最小差 72)', values: { preset: 'leetcode_example_2' } },
    { label: '6元素用例 ([2, -1, 0, 4, -2, -9])', values: { preset: 'medium_6_elements' } },
  ],
  generateSteps: (inputs: Record<string, any>) => buildPartitionMinDiff063Steps(inputs?.preset),
  renderCanvas: (container: HTMLElement, step: PartitionMinDiffStep) => {
    const bucketCards = step.lsumCounts.map((lCount, k) => {
      const rCount = step.rsumCounts[step.n - k] ?? 0;
      const isActive = step.activeK === k;
      return `
        <div style="
          padding: 6px 10px;
          border-radius: 6px;
          background: ${isActive ? '#eff6ff' : '#f8fafc'};
          border: 1px solid ${isActive ? '#3b82f6' : '#e2e8f0'};
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 11px;
        ">
          <div style="display:flex; justify-content:space-between; font-weight:700; color:${isActive ? '#1d4ed8' : '#334155'};">
            <span>左选 ${k} 个数</span>
            <span style="color:#7c3aed;">右选 ${step.n - k} 个数</span>
          </div>
          <div style="color:#64748b; font-size:10px;">
            左侧 ${lCount} 种和 ↔ 右侧 ${rCount} 种和
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px; padding:12px; background:#ffffff; border-radius:8px; border:1px solid #e2e8f0;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-weight:700; font-size:13px; color:#1e293b;">⚖️ 选数约束分桶折半二分沙盘</span>
          <span style="font-size:11px; padding:2px 8px; border-radius:4px; background:#f1f5f9; color:#475569;">
            理想目标半和: <strong style="color:#0f172a;">${Math.floor(step.totalSum / 2)}</strong> (总和 ${step.totalSum})
          </span>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:6px;">
          ${bucketCards}
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px; display:flex; flex-direction:column; gap:4px; font-size:11px;">
          <div style="display:flex; justify-content:space-between;">
            <span>当前左侧累加和: <strong style="color:#0284c7; font-family:monospace; font-size:12px;">${step.curLeftVal !== undefined ? step.curLeftVal : '-'}</strong></span>
            <span>二分目标 $(S/2 - a)$: <strong style="color:#db2777; font-family:monospace; font-size:12px;">${step.curTarget !== undefined ? step.curTarget : '-'}</strong></span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>右侧最接近匹配值: <strong style="color:#7c3aed; font-family:monospace; font-size:12px;">${step.matchedRightVal !== undefined ? step.matchedRightVal : '-'}</strong></span>
            <span>本次匹配和差: <strong style="color:#059669; font-family:monospace; font-size:12px;">${step.currentDiff !== undefined ? step.currentDiff : '-'}</strong></span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; background:#ecfdf5; border:1px solid #a7f3d0; padding:8px 12px; border-radius:6px;">
          <span style="font-size:11.5px; font-weight:700; color:#065f46;">🎯 全局最小数组和绝对差:</span>
          <strong style="font-size:16px; font-family:monospace; color:#047857;">${step.bestDiff === Infinity ? '-' : step.bestDiff}</strong>
        </div>
      </div>
    `;
  },
});
