/**
 * 左程云 Class 072 Code02: 使数组 K 递增的最少操作次数 (Minimum Operations to Make the Array K-Increasing · LeetCode 2111)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  K_INCREASING_ARRAY_072_CODES,
  K_INCREASING_ARRAY_072_HTML,
  K_INCREASING_ARRAY_072_LINES,
} from './dp-071-072-problem-content';
import { Dp071StepBase } from './dp-071-072-shared';

export interface KIncreasingStep extends Dp071StepBase {
  arr: number[];
  k: number;
  currentGroup: number;
  subSeq: number[];
  ends: number[];
  groupOps: number[];
  totalOps: number;
}

const PRESETS: Record<string, { arr: number[]; k: number }> = {
  standard: {
    arr: [5, 4, 3, 2, 1],
    k: 1,
  },
  k2: {
    arr: [4, 1, 5, 2, 6, 2],
    k: 2,
  },
  k3: {
    arr: [4, 1, 5, 2, 6, 2],
    k: 3,
  },
  alreadyIncreasing: {
    arr: [2, 2, 2, 2, 3, 3],
    k: 1,
  },
};

export function buildKIncreasingArray072Steps(arrInput?: number[], kInput?: number): KIncreasingStep[] {
  const arr = arrInput && arrInput.length > 0 ? arrInput : PRESETS.k2.arr;
  const k = kInput && kInput > 0 ? kInput : PRESETS.k2.k;
  const n = arr.length;
  const steps: KIncreasingStep[] = [];
  const lines = K_INCREASING_ARRAY_072_LINES;

  const groupOps = new Array(k).fill(0);
  let totalOps = 0;

  // Step 0: 算法初始化
  steps.push({
    title: '算法就绪与模 K 分组规划',
    description: `原数组长度 n=${n}，步长 k=${k}`,
    message: `🚀 初始化求解：使数组 K 递增的最少修改次数。`,
    explanation: '左神点拨：下标 i 与 i+k, i+2k... 之间有非严格递增约束，但不同余数组之间完全独立！因此可按模 k 划分为 k 个互不干扰的独立子序列。',
    line: lines.entry.javascript,
    codeLine: lines.entry,
    arr,
    k,
    currentGroup: -1,
    subSeq: [],
    ends: [],
    groupOps: [...groupOps],
    totalOps: 0,
    metrics: { '数组长度 n': n, '步长 k': k, '当前阶段': '初始化' },
  });

  // 遍历每一组
  for (let group = 0; group < k; group++) {
    const subSeq: number[] = [];
    const originalIndices: number[] = [];
    for (let j = group; j < n; j += k) {
      subSeq.push(arr[j]);
      originalIndices.push(j);
    }

    steps.push({
      title: `抽取第 ${group} 组子序列 (模 ${k} ≡ ${group})`,
      description: `提取下标 [${originalIndices.join(', ')}]，对应元素 [${subSeq.join(', ')}]`,
      message: `📂 抽取子序列：考察余数组 ${group}，提取元素 [${subSeq.join(', ')}]，子序列长度为 ${subSeq.length}。`,
      explanation: '该组内的元素必须满足非递减（arr[i] <= arr[i+k]）。为使修改次数最少，应尽可能保留最多的合法递增元素，即求最长不下降子序列。',
      line: lines.collectSubseq.javascript,
      codeLine: lines.collectSubseq,
      arr,
      k,
      currentGroup: group,
      subSeq: [...subSeq],
      ends: [],
      groupOps: [...groupOps],
      totalOps,
      metrics: { '当前组号': group, '子序列长度': subSeq.length, '总修改次数': totalOps },
    });

    // 计算当前子序列的最长不下降子序列 (利用 ends 数组 + upper_bound 贪心二分)
    const ends: number[] = [];

    steps.push({
      title: `开始求第 ${group} 组的最长不下降子序列`,
      description: '准备维护 ends 贪心数组',
      message: `🎯 贪心二分启动：准备构建 ends 数组。注意！允许元素相等，二分查找应使用 upper_bound（找首个严格大于目标的数）！`,
      explanation: '在严格递增 LIS 中二分用 lower_bound，而在非严格递增（不下降）LIS 中，遇到相等元素应往后扩充，故需 upper_bound 替换首个严格大于的位置。',
      line: lines.calcLis.javascript,
      codeLine: lines.calcLis,
      arr,
      k,
      currentGroup: group,
      subSeq: [...subSeq],
      ends: [],
      groupOps: [...groupOps],
      totalOps,
      metrics: { '当前组号': group, 'ends 长度': 0 },
    });

    for (let idx = 0; idx < subSeq.length; idx++) {
      const x = subSeq[idx];

      // 二分查找首个严格大于 x 的位置 (upper_bound)
      let l = 0;
      let r = ends.length - 1;
      let pos = ends.length;

      while (l <= r) {
        const m = (l + r) >> 1;
        if (ends[m] > x) {
          pos = m;
          r = m - 1;
        } else {
          l = m + 1;
        }
      }

      const isExtend = pos === ends.length;
      if (isExtend) {
        ends.push(x);
      } else {
        ends[pos] = x;
      }

      steps.push({
        title: `处理元素 subSeq[${idx}] = ${x}`,
        description: isExtend
          ? `x=${x} >= ends 尾部，追加到 ends[${pos}]，ends 长度扩展为 ${ends.length}`
          : `二分定位首个大于 ${x} 的位置 pos=${pos}，替换 ends[${pos}] 为 ${x}`,
        message: isExtend
          ? `📈 拓展长度：元素 ${x} 不小于当前 ends 尾部，直接追加到末尾！最长不下降长度扩展至 ${ends.length}。`
          : `⚡ 贪心替换：二分 upper_bound 找到首个大于 ${x} 的位置 ends[${pos}]，将其替换为更小更有潜力的 ${x}。`,
        explanation: '贪心二分的核心在于：较小的结尾元素能给后续元素提供更宽广的接力空间，同时不破坏已有的长度记录。',
        line: lines.binarySearchUpper.javascript,
        codeLine: lines.binarySearchUpper,
        arr,
        k,
        currentGroup: group,
        subSeq: [...subSeq],
        ends: [...ends],
        groupOps: [...groupOps],
        totalOps,
        metrics: { '当前元素 x': x, 'ends 长度': ends.length, '二分位置 pos': pos },
      });
    }

    const lisLen = ends.length;
    const ops = subSeq.length - lisLen;
    groupOps[group] = ops;
    totalOps += ops;

    steps.push({
      title: `第 ${group} 组求解完成: 需修改 ${ops} 次`,
      description: `子序列长 ${subSeq.length} - LIS长 ${lisLen} = 需修改 ${ops} 次`,
      message: `✨ 第 ${group} 组统计：子序列长度 ${subSeq.length}，最长不下降序列长度为 ${lisLen}。该组最少需修改 ${subSeq.length} - ${lisLen} = ${ops} 次！累计总操作数达到 ${totalOps}。`,
      explanation: '保留最长不下降子序列中的所有元素，其余元素均只需修改一次即可满足局部 K 递增。',
      line: lines.accumulateAns.javascript,
      codeLine: lines.accumulateAns,
      arr,
      k,
      currentGroup: group,
      subSeq: [...subSeq],
      ends: [...ends],
      groupOps: [...groupOps],
      totalOps,
      metrics: { '该组修改次数': ops, '当前累计总修改数': totalOps },
    });
  }

  // 终局步骤
  steps.push({
    title: '全数组 K 递增最小操作次数统计完成',
    description: `所有 ${k} 组累加，总修改次数为 ${totalOps}`,
    message: `🎉 全局计算达成：遍历所有 ${k} 组独立子序列，累加各自的最少修改次数，最终使得数组成为 K 递增的最少操作次数为 ${totalOps}！`,
    explanation: '时间复杂度为 O(N log(N/k))，结合模 k 分组与贪心二分 upper_bound，达到理论最优性能。',
    line: lines.returnTotal.javascript,
    codeLine: lines.returnTotal,
    arr,
    k,
    currentGroup: k - 1,
    subSeq: [],
    ends: [],
    groupOps: [...groupOps],
    totalOps,
    metrics: { '最终最小操作次数': totalOps, '状态': '求解完毕' },
  });

  return steps;
}

export function renderKIncreasingCanvas(container: HTMLElement, step: KIncreasingStep): void {
  const groupColors = ['#38bdf8', '#fbbf24', '#c084fc', '#4ade80', '#f43f5e', '#a855f7'];

  // 原数组卡片 (按模 k 着色)
  const arrayCards = step.arr
    .map((val, idx) => {
      const g = idx % step.k;
      const isCurrentGroup = g === step.currentGroup;
      const color = groupColors[g % groupColors.length];

      return `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          background: ${isCurrentGroup ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.5)'};
          border: 1.5px solid ${isCurrentGroup ? color : '#334155'};
          border-radius: 6px;
          padding: 6px 8px;
          min-width: 48px;
          opacity: isCurrentGroup ? 1 : 0.65;
          box-shadow: ${isCurrentGroup ? `0 0 10px ${color}44` : 'none'};
        ">
          <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">i=${idx}</div>
          <div style="font-size: 16px; font-weight: 800; color: ${color}; margin: 2px 0;">${val}</div>
          <div style="font-size: 10px; color: #cbd5e1; font-family: monospace;">mod ${g}</div>
        </div>
      `;
    })
    .join('');

  // 当前组 ends 数组卡片
  const endsCards = step.ends.length > 0
    ? step.ends
        .map((val, idx) => `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            background: rgba(14, 165, 233, 0.15);
            border: 1px solid #38bdf8;
            border-radius: 6px;
            padding: 4px 8px;
            min-width: 42px;
          ">
            <span style="font-size: 10px; color: #94a3b8; font-family: monospace;">ends[${idx}]</span>
            <span style="font-size: 15px; font-weight: 700; color: #38bdf8;">${val}</span>
          </div>
        `)
        .join('')
    : '<span style="color: #64748b; font-size: 13px;">当前尚未构建 ends 数组</span>';

  // 各组统计药丸条
  const groupStats = step.groupOps
    .map((ops, g) => {
      const color = groupColors[g % groupColors.length];
      const isCur = g === step.currentGroup;
      return `
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid ${isCur ? color : '#334155'};
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 12px;
        ">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${color};"></span>
          <span style="color: #94a3b8;">组 ${g}:</span>
          <strong style="color: #f8fafc; font-family: monospace;">修改 ${ops} 次</strong>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: #0f172a; color: #f8fafc; padding: 12px; box-sizing: border-box; overflow-y: auto;">
      <!-- 原数组按模着色轨道 -->
      <div style="margin-bottom: 12px;">
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">原数组元素 (按模 k 着色对应子序列):</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; padding: 10px; background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 8px;">
          ${arrayCards}
        </div>
      </div>

      <!-- 当前组的 ends 贪心数组沙盘 -->
      <div style="margin-bottom: 12px;">
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">当前组最长不下降子序列 ends 贪心数组 (upper_bound 维护):</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 10px; background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 8px; min-height: 48px;">
          ${endsCards}
        </div>
      </div>

      <!-- 各组修改统计 -->
      <div>
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">各组独立修改次数统计:</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${groupStats}
        </div>
      </div>
    </div>
  `;
}

export const kIncreasingArray072Visualizer = registerDeclarativeAlgorithm<KIncreasingStep>({
  id: 'k-increasing-array',
  aliases: ['class072-code02', 'k-increasing-array-2111', 'leetcode-2111'],
  name: '使数组 K 递增的最少操作次数 (K-Increasing Array)',
  category: 'dynamic-programming',
  icon: '🪜',
  difficulty: 3,
  levelOrder: 2111,
  learningGoal: '掌握模 k 分组解耦思想，以及在非严格递增约束下使用 upper_bound 维护 ends 数组的贪心二分技巧',
  metrics: [
    { id: 'totalOps', label: '总最少操作次数', color: 'rose' },
    { id: 'currentGroup', label: '当前组号', color: 'blue' },
  ],
  problemHtml: K_INCREASING_ARRAY_072_HTML,
  codeLanguages: K_INCREASING_ARRAY_072_CODES,
  presets: [
    { label: '步长 k=2: [4, 1, 5, 2, 6, 2]', values: { arr: '4, 1, 5, 2, 6, 2', k: 2 } },
    { label: '全逆序 k=1: [5, 4, 3, 2, 1]', values: { arr: '5, 4, 3, 2, 1', k: 1 } },
    { label: '步长 k=3: [4, 1, 5, 2, 6, 2]', values: { arr: '4, 1, 5, 2, 6, 2', k: 3 } },
    { label: '已有非递减: [2, 2, 2, 2, 3, 3]', values: { arr: '2, 2, 2, 2, 3, 3', k: 1 } },
  ],
  inputs: [
    {
      id: 'arr',
      label: '整数数组 (逗号分隔)',
      type: 'text',
      defaultValue: '4, 1, 5, 2, 6, 2',
    },
    {
      id: 'k',
      label: '递增步长 k',
      type: 'number',
      defaultValue: 2,
    },
  ],
  generateSteps: (input) => {
    const rawArr = String(input.arr || '4, 1, 5, 2, 6, 2');
    const parsedArr = rawArr
      .split(',')
      .map(s => Number(s.trim()))
      .filter(n => !isNaN(n));
    const k = Number(input.k) || 2;
    return buildKIncreasingArray072Steps(
      parsedArr.length > 0 ? parsedArr : PRESETS.k2.arr,
      k > 0 ? k : PRESETS.k2.k
    );
  },
  renderCanvas: (container, step) => {
    renderKIncreasingCanvas(container, step);
  },
});
