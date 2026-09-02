import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 环形子数组的最大和 (Maximum Sum Circular Subarray)
 * LeetCode 918 / 左程云算法通关课 第070讲 子数组最大累加和扩展
 * 双向 Kadane 算法：环形最大和 = max(常规最大子数组和, 总和 - 最小子数组和)。全负数时直接返回常规最大子数组和。
 */
export const MaxCircularSubarraySpec: AlgorithmSpec = {
  id: 'max-circular-subarray',
  name: '环形子数组的最大和 (Maximum Sum Circular Subarray)',
  category: '子数组与 LIS 扩展 DP',
  description:
    '给定一个由整数组成的环形数组 nums，求 nums 的非空子数组的最大可能和。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 918,
    leetcodeUrl: 'https://leetcode.cn/problems/maximum-sum-circular-subarray/',
    difficulty: 'medium',
    tags: ['动态规划', '数组', '分治', '单调队列'],
    description:
      '给定一个长度为 <code>n</code> 的环形整数数组 <code>nums</code>，返回 <code>nums</code> 的非空子数组的最大可能和。<br/><br/>环形数组意味着数组的首尾相连。<br/><br/><strong>双向 Kadane 核心思想：</strong><br/>1. <strong>情况 1（不跨越首尾）：</strong>最大子数组在数组内部，就是标准的 Kadane 最大子数组和 <code>maxSum</code>；<br/>2. <strong>情况 2（跨越首尾）：</strong>等于数组总和 <code>totalSum</code> 减去中间未选部分的最小子数组和 <code>minSum</code>；<br/>3. <strong>特殊情况：</strong>如果数组中所有元素全为负数（<code>maxSum < 0</code>），此时 <code>totalSum - minSum = 0</code>（相当于选了空数组），必须直接返回 <code>maxSum</code>。',
    examples: [
      {
        input: 'nums = [1, -2, 3, -2]',
        output: '3',
        explanation: '从子数组 [3] 获得最大和 3。',
      },
      {
        input: 'nums = [5, -3, 5]',
        output: '10',
        explanation: '从子数组 [5, 5] 跨越首尾获得最大和 5 + 5 = 10。',
      },
      {
        input: 'nums = [-3, -2, -3]',
        output: '-2',
        explanation: '全为负数，从子数组 [-2] 获得最大和 -2。',
      },
    ],
    constraints: [
      'n == nums.length',
      '1 <= n <= 3 * 10^4',
      '-3 * 10^4 <= nums[i] <= 3 * 10^4',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 4, python: 3, javascript: 2 },
    init: { java: 5, cpp: 6, python: 4, javascript: 3 },
    loopCheck: { java: 8, cpp: 9, python: 7, javascript: 6 },
    stateTransfer: {
      java: [9, 10, 11, 12, 13],
      cpp: [10, 11, 12, 13, 14],
      python: [8, 9, 10, 11, 12],
      javascript: [7, 8, 9, 10, 11],
    },
    loopExit: { java: 15, cpp: 16, python: 14, javascript: 13 },
    returnResult: { java: 16, cpp: 17, python: 15, javascript: 14 },
  },
  code: {
    languages: {
      javascript: [
        'function maxSubarraySumCircular(nums) {',
        '  let total = 0;',
        '  let maxSum = nums[0], curMax = 0;',
        '  let minSum = nums[0], curMin = 0;',
        '  for (const x of nums) {',
        '    curMax = Math.max(x, curMax + x);',
        '    maxSum = Math.max(maxSum, curMax);',
        '    curMin = Math.min(x, curMin + x);',
        '    minSum = Math.min(minSum, curMin);',
        '    total += x;',
        '  }',
        '  return maxSum > 0 ? Math.max(maxSum, total - minSum) : maxSum;',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int maxSubarraySumCircular(int[] nums) {',
        '        int total = 0;',
        '        int maxSum = nums[0], curMax = 0;',
        '        int minSum = nums[0], curMin = 0;',
        '        for (int x : nums) {',
        '            curMax = Math.max(x, curMax + x);',
        '            maxSum = Math.max(maxSum, curMax);',
        '            curMin = Math.min(x, curMin + x);',
        '            minSum = Math.min(minSum, curMin);',
        '            total += x;',
        '        }',
        '        return maxSum > 0 ? Math.max(maxSum, total - minSum) : maxSum;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int maxSubarraySumCircular(vector<int>& nums) {',
        '        int total = 0;',
        '        int maxSum = nums[0], curMax = 0;',
        '        int minSum = nums[0], curMin = 0;',
        '        for (int x : nums) {',
        '            curMax = max(x, curMax + x);',
        '            maxSum = max(maxSum, curMax);',
        '            curMin = min(x, curMin + x);',
        '            minSum = min(minSum, curMin);',
        '            total += x;',
        '        }',
        '        return maxSum > 0 ? max(maxSum, total - minSum) : maxSum;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def maxSubarraySumCircular(self, nums: list[int]) -> int:',
        '        total = 0',
        '        max_sum, cur_max = nums[0], 0',
        '        min_sum, cur_min = nums[0], 0',
        '        for x in nums:',
        '            cur_max = max(x, cur_max + x)',
        '            max_sum = max(max_sum, cur_max)',
        '            cur_min = min(x, cur_min + x)',
        '            min_sum = min(min_sum, cur_min)',
        '            total += x',
        '        return max(max_sum, total - min_sum) if max_sum > 0 else max_sum',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口，传入环形数组 nums。',
        2: 'total 记录整个数组所有元素之和。',
        3: 'maxSum 记录最大子数组和，curMax 记录以当前元素结尾的最大连续和。',
        4: 'minSum 记录最小子数组和，curMin 记录以当前元素结尾的最小连续和。',
        5: '单次遍历数组同时运行两个方向的 Kadane 算法。',
        6: '更新当前最大前缀和：选单独 x 或拼入之前 curMax + x。',
        8: '更新当前最小前缀和：选单独 x 或拼入之前 curMin + x。',
        12: '全负数时返回 maxSum，否则返回内部最大与跨首尾最大(total - minSum)的较大值。',
      },
      java: {
        2: '方法入口。',
        3: '初始化累计和与双轨极值变量。',
        6: '一次遍历执行正反 Kadane。',
        13: '三目运算符判断全负数边界并返回最优解。',
      },
      cpp: {
        3: '函数入口。',
        6: '初始化状态。',
        7: '单循环双极值推进。',
        14: '返回正反最大值。',
      },
      python: {
        2: '方法入口。',
        4: '初始化极值跟踪器。',
        7: '单遍线性扫描。',
        12: '全负特判与返回。',
      },
    },
    keyPoints: {
      thinking:
        '环形子数组只有两种形态：1. 不跨越边界，即常规连续子数组；2. 跨越首尾两端，此时中间剩下的未选部分必为一段连续子数组。要使两端和最大，等价于使中间连续段和最小，即 total - minSum。',
      state: 'curMax 为以当前结尾的最大子数组和，curMin 为以当前结尾的最小子数组和。',
      equation: 'curMax = max(x, curMax + x), curMin = min(x, curMin + x)',
      initAndBounds: 'maxSum = minSum = nums[0], curMax = curMin = 0。全负数时 total - minSum = 0 对应空集，必须舍弃。',
      complexity: '时间复杂度 $O(N)$，空间复杂度 $O(1)$。',
    },
    faqList: [
      {
        tag: '全负数特判',
        question: '为什么 maxSum < 0 时不能用 total - minSum？',
        answer:
          '当数组全为负数时，最小子数组就是整个数组（minSum = totalSum），此时 totalSum - minSum = 0 对应于“选择 0 个元素”，但题目明确要求子数组必须“非空”，因此必须直接返回最大单个负数 maxSum。',
      },
    ],
  },
  generateSteps: (input: { nums?: number[] } = {}): DpTraceStep[] => {
    const nums = input?.nums || [1, -2, 3, -2];
    const steps: DpTraceStep[] = [];

    let total = 0;
    let maxSum = nums[0];
    let curMax = 0;
    let minSum = nums[0];
    let curMin = 0;

    steps.push(
      makeTraceStep({
        dp1d: nums.map((v) => ({ value: v, state: 'default' })),
        message: `🔄 环形数组 nums = [${nums.join(', ')}]，启动双向 Kadane 算法：同步寻找数组内最大子段和与最小子段和。`,
        log: `初始化: nums = [${nums.join(', ')}]`,
        vars: [
          { name: '数组长度', value: String(nums.length) },
          { name: '初始 maxSum', value: String(maxSum) },
          { name: '初始 minSum', value: String(minSum) },
        ],
        metrics: { maxSum },
      })
    );

    for (let i = 0; i < nums.length; i++) {
      const x = nums[i];
      curMax = Math.max(x, curMax + x);
      maxSum = Math.max(maxSum, curMax);
      curMin = Math.min(x, curMin + x);
      minSum = Math.min(minSum, curMin);
      total += x;

      steps.push(
        makeTraceStep({
          dp1d: nums.map((v, idx) => ({
            value: v,
            state: idx === i ? 'active' : 'computed',
          })),
          current: { index: i },
          message: `👉 处理索引 <strong>i=${i}</strong> (元素 ${x})：<br/>• 最大子段和：curMax=${curMax}, 全局 maxSum=${maxSum}；<br/>• 最小子段和：curMin=${curMin}, 全局 minSum=${minSum}；<br/>• 当前总和 total=${total}。`,
          log: `step i=${i} (val=${x}): curMax=${curMax}, maxSum=${maxSum}, curMin=${curMin}, minSum=${minSum}, total=${total}`,
          vars: [
            { name: '当前元素', value: String(x) },
            { name: '全局 maxSum', value: String(maxSum) },
            { name: '全局 minSum', value: String(minSum) },
            { name: '数组累加和 total', value: String(total) },
          ],
          metrics: { maxSum },
        })
      );
    }

    const wrapAround = total - minSum;
    const ans = maxSum > 0 ? Math.max(maxSum, wrapAround) : maxSum;

    steps.push(
      makeTraceStep({
        dp1d: nums.map((v) => ({ value: v, state: 'computed' })),
        message: `🏆 双向扫描完成！<br/>• 内部最大子段和 maxSum = <strong>${maxSum}</strong>；<br/>• 跨首尾环形子段和 total - minSum = ${total} - (${minSum}) = <strong>${wrapAround}</strong>；<br/>• 最终环形最大子数组和为 <strong>${ans}</strong>。`,
        log: `计算结束：内部和=${maxSum}, 跨界和=${wrapAround} -> 最终答案=${ans}`,
        vars: [
          { name: '内部最大和', value: String(maxSum) },
          { name: '跨界最大和', value: String(wrapAround) },
          { name: '最终结果', value: String(ans) },
        ],
        metrics: { maxSum: ans },
      })
    );

    return steps;
  },
};
