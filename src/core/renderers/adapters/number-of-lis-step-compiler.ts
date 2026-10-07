/**
 * 左程云 Class 071 Code02: 最长递增子序列的个数 StepCompiler
 * 职责：纯粹的状态机推演，严密计算 LIS 长度与方案数双轨转移
 */

import {
  NUMBER_OF_LIS_071_LINES,
} from '../../../algorithms/categories/dynamic-programming/dp-071-072/dp-071-072-problem-content';
import { Dp071StepBase } from '../../../algorithms/categories/dynamic-programming/dp-071-072/dp-071-072-shared';

export interface NumberOfLisStep extends Dp071StepBase {
  nums: number[];
  dp: number[];
  count: number[];
  currentIdx: number;
  compareIdx?: number;
  maxLen: number;
  totalWays?: number;
}

export const NUMBER_OF_LIS_PRESETS: Record<string, number[]> = {
  standard: [1, 3, 5, 4, 7],
  allEqual: [2, 2, 2, 2, 2],
  branching: [1, 2, 4, 3, 5, 4, 7, 2],
  single: [10],
};

export function buildNumberOfLis071Steps(numsInput?: number[]): NumberOfLisStep[] {
  const nums = numsInput && numsInput.length > 0 ? numsInput : NUMBER_OF_LIS_PRESETS.standard;
  const n = nums.length;
  const steps: NumberOfLisStep[] = [];
  const lines = NUMBER_OF_LIS_071_LINES;

  const dp = new Array(n).fill(1);
  const count = new Array(n).fill(1);
  let maxLen = 1;

  // Step 0: 算法入口
  steps.push({
    title: '算法初始化',
    description: `输入数组 nums = [${nums.join(', ')}]，长度 n = ${n}`,
    message: `🚀 初始化求解：求 nums 中最长递增子序列的个数。`,
    explanation: '左神点拨：单纯求 LIS 长度只需一维 dp，但求方案数需要同步维护 count[i]，记录以 nums[i] 结尾能达到的 LIS 路径总数。',
    line: lines.entry.javascript,
    codeLine: lines.entry,
    nums,
    dp: [...dp],
    count: [...count],
    currentIdx: -1,
    maxLen: 1,
    metrics: { '数组长度 n': n, '全局最长 LIS': 1, '当前阶段': '初始化' },
  });

  if (n <= 1) {
    steps.push({
      title: '单元素边界',
      description: '数组长度小于等于 1，直接返回 n',
      message: `🎉 边界情况：长度为 ${n}，直接返回方案数 ${n}。`,
      explanation: '长度不超过 1 时，最长递增子序列即为自身，方案数为自身长度。',
      line: lines.sumResult.javascript,
      codeLine: lines.sumResult,
      nums,
      dp: [...dp],
      count: [...count],
      currentIdx: 0,
      maxLen: n,
      totalWays: n,
      metrics: { '最终结果': n, '全局最长 LIS': n, '当前阶段': '结束' },
    });
    return steps;
  }

  // Step 1: 初始化数组
  steps.push({
    title: '初始化 DP 与 Count 数组',
    description: '每个位置默认自身成一段长度为 1，方案数为 1',
    message: `📊 状态定义：dp[i]=1（以 nums[i] 结尾的最短长度为 1），count[i]=1（方案数为 1）。`,
    explanation: '任何单个数字本身都是一个合法的递增子序列，故基础长度与方案数均赋初值 1。',
    line: lines.initDp.javascript,
    codeLine: lines.initDp,
    nums,
    dp: [...dp],
    count: [...count],
    currentIdx: -1,
    maxLen: 1,
    metrics: { '初始最长长度': 1, '当前阶段': '基础状态就绪' },
  });

  // 主循环
  for (let i = 0; i < n; i++) {
    steps.push({
      title: `考察位置 i=${i}`,
      description: `nums[${i}] = ${nums[i]}`,
      message: `🔍 遍历外层：选定当前元素 nums[${i}] = ${nums[i]}，准备向前扫描所有可能的前驱 j。`,
      explanation: '我们需要在 0 <= j < i 中寻找所有满足 nums[j] < nums[i] 的前驱节点进行状态转移。',
      line: lines.outerLoop.javascript,
      codeLine: lines.outerLoop,
      nums,
      dp: [...dp],
      count: [...count],
      currentIdx: i,
      maxLen,
      metrics: { '当前元素 nums[i]': nums[i], '当前下标 i': i, '全局最长 LIS': maxLen },
    });

    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        if (dp[j] + 1 > dp[i]) {
          dp[i] = dp[j] + 1;
          count[i] = count[j]; // 发现更长路径，重置方案数
          steps.push({
            title: `发现更长递增链: nums[${j}]=${nums[j]} ➔ nums[${i}]=${nums[i]}`,
            description: `dp[${j}] + 1 (${dp[j] + 1}) > dp[${i}]，更新长度为 ${dp[i]}，继承 count = ${count[i]}`,
            message: `✨ 突破更长：nums[${j}]=${nums[j]} < nums[${i}]=${nums[i]}，且 dp[${j}]+1 = ${dp[i]} > 原 dp[${i}]！更新 dp[${i}]=${dp[i]}，方案数重置为 count[${j}]=${count[j]}。`,
            explanation: '由于找到了能拼凑出更长子序列的前驱，原先较短路径全部作废，方案数完全继承该前驱的方案数。',
            line: lines.longerFound.javascript,
            codeLine: lines.longerFound,
            nums,
            dp: [...dp],
            count: [...count],
            currentIdx: i,
            compareIdx: j,
            maxLen: Math.max(maxLen, dp[i]),
            metrics: { '当前 LIS 长度': dp[i], '当前方案数': count[i], '前驱下标 j': j },
          });
        } else if (dp[j] + 1 === dp[i]) {
          count[i] += count[j]; // 发现等长路径，累加方案数
          steps.push({
            title: `发现等长备选路径: nums[${j}]=${nums[j]} ➔ nums[${i}]=${nums[i]}`,
            description: `dp[${j}] + 1 (${dp[j] + 1}) == dp[${i}]，累计 count[${i}] += count[${j}] (${count[j]}) ➔ ${count[i]}`,
            message: `➕ 分支汇聚：nums[${j}]=${nums[j]} < nums[${i}]=${nums[i]}，且拼接后长度同为 ${dp[i]}！累计方案数 count[${i}] += count[${j}] ➔ ${count[i]}。`,
            explanation: '存在不同的前驱能够提供相同长度的递增子序列，根据加法原理，总方案数应累加各分支的组合数。',
            line: lines.equalLength.javascript,
            codeLine: lines.equalLength,
            nums,
            dp: [...dp],
            count: [...count],
            currentIdx: i,
            compareIdx: j,
            maxLen: Math.max(maxLen, dp[i]),
            metrics: { '当前 LIS 长度': dp[i], '累计方案数': count[i], '前驱下标 j': j },
          });
        }
      }
    }

    if (dp[i] > maxLen) {
      maxLen = dp[i];
      steps.push({
        title: `刷新全局最大 LIS 长度 ➔ ${maxLen}`,
        description: `maxLen 更新为 ${maxLen}`,
        message: `🏆 全局刷新：以 nums[${i}]=${nums[i]} 结尾的递增子序列长度达到 ${maxLen}，刷新全局记录！`,
        explanation: '持续维护全局最大递增子序列长度，后续将汇总所有达到该最大长度的位置方案数。',
        line: lines.updateMax.javascript,
        codeLine: lines.updateMax,
        nums,
        dp: [...dp],
        count: [...count],
        currentIdx: i,
        maxLen,
        metrics: { '全局最长 LIS': maxLen },
      });
    }
  }

  // 最终汇总
  let totalAns = 0;
  for (let i = 0; i < n; i++) {
    if (dp[i] === maxLen) {
      totalAns += count[i];
    }
  }

  steps.push({
    title: '统计并返回总方案数',
    description: `全局最大长度为 ${maxLen}，总方案数 = ${totalAns}`,
    message: `🎉 汇总达成：全局最长递增子序列长度为 ${maxLen}，遍历所有 dp[i] === ${maxLen} 的位置累加方案数，最终得到最长递增子序列的个数为 ${totalAns}！`,
    explanation: '所有等于全局最长 LIS 长度的结尾点，其对应的 count[i] 之和即为全数组中不同最长递增子序列的总个数。',
    line: lines.sumResult.javascript,
    codeLine: lines.sumResult,
    nums,
    dp: [...dp],
    count: [...count],
    currentIdx: n - 1,
    maxLen,
    totalWays: totalAns,
    metrics: { '最终方案总数': totalAns, '全局最长 LIS': maxLen, '状态': '求解完成' },
  });

  return steps;
}
