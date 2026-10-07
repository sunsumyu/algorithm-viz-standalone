/**
 * 左程云 Class 072 Code02: 使数组 K 递增的最少操作次数 StepCompiler
 * 职责：纯粹的模 K 解耦子序列提取、ends 贪心数组与 upper_bound 二分推演
 */

import {
  K_INCREASING_ARRAY_072_LINES,
} from '../../../algorithms/categories/dynamic-programming/dp-071-072/dp-071-072-problem-content';
import { Dp071StepBase } from '../../../algorithms/categories/dynamic-programming/dp-071-072/dp-071-072-shared';

export interface KIncreasingStep extends Dp071StepBase {
  arr: number[];
  k: number;
  currentGroup: number;
  subSeq: number[];
  ends: number[];
  groupOps: number[];
  totalOps: number;
}

export const K_INCREASING_PRESETS: Record<string, { arr: number[]; k: number }> = {
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
  const arr = arrInput && arrInput.length > 0 ? arrInput : K_INCREASING_PRESETS.k2.arr;
  const k = kInput && kInput > 0 ? kInput : K_INCREASING_PRESETS.k2.k;
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
      let find = -1;

      while (l <= r) {
        const mid = (l + r) >> 1;
        if (ends[mid] > x) {
          find = mid;
          r = mid - 1;
        } else {
          l = mid + 1;
        }
      }

      if (find === -1) {
        // x 大于等于当前所有末尾元素，合法追加在末尾
        ends.push(x);
        steps.push({
          title: `元素 ${x} 追加至 ends 末尾 (长度 ➔ ${ends.length})`,
          description: `subSeq[${idx}] = ${x} >= 当前所有 ends 元素，追加生成 ends = [${ends.join(', ')}]`,
          message: `📈 贪心扩展：元素 ${x} 可以接在当前最长不下降子序列之后，ends 数组长度扩充至 ${ends.length}。`,
          explanation: '因为没有找到比 x 严格更大的位置，说明 x 可以继续延长子序列，直接压入 ends 尾部。',
          line: lines.calcLis.javascript,
          codeLine: lines.calcLis,
          arr,
          k,
          currentGroup: group,
          subSeq: [...subSeq],
          ends: [...ends],
          groupOps: [...groupOps],
          totalOps,
          metrics: { '当前元素 x': x, 'ends 扩展至': ends.length },
        });
      } else {
        // 贪心替换首个严格大于 x 的元素，压低末尾潜力
        const oldVal = ends[find];
        ends[find] = x;
        steps.push({
          title: `upper_bound 替换: ends[${find}] (${oldVal} ➔ ${x})`,
          description: `找到首个 > ${x} 的位置 ${find}，用更小的 ${x} 替换原值 ${oldVal}`,
          message: `🔄 贪心压低：在 ends 中找到首个大于 ${x} 的元素 ${oldVal}（下标 ${find}），将其替换为 ${x}，为后续接纳更多数值创造更优潜力。`,
          explanation: '保持子序列长度不变的同时尽可能降低结尾值，这是贪心求 LIS 的核心灵魂。',
          line: lines.calcLis.javascript,
          codeLine: lines.calcLis,
          arr,
          k,
          currentGroup: group,
          subSeq: [...subSeq],
          ends: [...ends],
          groupOps: [...groupOps],
          totalOps,
          metrics: { '被替换位置': find, '原值': oldVal, '新值': x },
        });
      }
    }

    const lisLen = ends.length;
    const ops = subSeq.length - lisLen;
    groupOps[group] = ops;
    totalOps += ops;

    steps.push({
      title: `第 ${group} 组统计完毕: 最长不下降序列长度 ${lisLen}，需修改 ${ops} 次`,
      description: `子序列总长 ${subSeq.length} - LIS 长度 ${lisLen} = 需要修改 ${ops} 次`,
      message: `✅ 本组锁定：第 ${group} 组最长不下降长度为 ${lisLen}，最少只需修改 ${ops} 次！累计总操作数达到 ${totalOps} 次。`,
      explanation: '保留最长合法不下降子序列中的所有元素，将其余位置全部修改，所花费代价必然最少。',
      line: lines.accumulateAns.javascript,
      codeLine: lines.accumulateAns,
      arr,
      k,
      currentGroup: group,
      subSeq: [...subSeq],
      ends: [...ends],
      groupOps: [...groupOps],
      totalOps,
      metrics: { '本组修改次数': ops, '累计总修改次数': totalOps },
    });
  }

  // 终局步骤
  steps.push({
    title: '使数组 K 递增的最少操作次数求解完成',
    description: `遍历完成所有 ${k} 组，最少修改总次数为 ${totalOps}`,
    message: `🎉 求解完成：所有 ${k} 个互不相交的模 k 子序列均已完成独立最长不下降子序列计算，全局最少修改总次数为 ${totalOps} 次！`,
    explanation: '时间复杂度 O(N * log(N/k))，结合模 k 分组与贪心二分优雅达成最优。',
    line: lines.returnTotal.javascript,
    codeLine: lines.returnTotal,
    arr,
    k,
    currentGroup: -1,
    subSeq: [],
    ends: [],
    groupOps: [...groupOps],
    totalOps,
    metrics: { '最终最小操作次数': totalOps, '状态': '求解完毕' },
  });

  return steps;
}
