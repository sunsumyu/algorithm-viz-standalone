import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 乘积最大子数组 (Maximum Product Subarray)
 * LeetCode 152 / 左程云算法通关课 第070讲 子数组最大累加和扩展
 * 正负双状态 DP：由于负负得正，每个位置必须同时维护以当前元素结尾的最大乘积与最小乘积。
 */
export const MaxProductSubarraySpec: AlgorithmSpec = {
  id: 'max-product-subarray',
  name: '乘积最大子数组 (Maximum Product Subarray)',
  category: '子数组与 LIS 扩展 DP',
  description:
    '给定一个整数数组 nums，找出具有最大乘积的非空连续子数组，并返回该子数组对应的乘积。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 152,
    leetcodeUrl: 'https://leetcode.cn/problems/maximum-product-subarray/',
    difficulty: 'medium',
    tags: ['数组', '动态规划'],
    description:
      '给你一个整数数组 <code>nums</code>，请你找出数组中乘积最大的非空连续子数组（该子数组中至少包含一个数字），并返回该子数组所对应的乘积。<br/><br/><strong>正负双轨 DP：</strong><br/>乘法中“负负得正”，之前的极小负数乘以当前负数会一跃成为极大正数。因此在遍历数组时，必须在每个位置同时记录：<br/>1. 以 <code>nums[i]</code> 结尾的<strong>最大乘积</strong> <code>maxDp</code>；<br/>2. 以 <code>nums[i]</code> 结尾的<strong>最小乘积</strong> <code>minDp</code>。<br/><br/>当遇到负数时，交换 <code>maxDp</code> 和 <code>minDp</code> 后再进行常规转移。',
    examples: [
      {
        input: 'nums = [2, 3, -2, 4]',
        output: '6',
        explanation: '子数组 [2, 3] 有最大乘积 6。',
      },
      {
        input: 'nums = [-2, 0, -1]',
        output: '0',
        explanation: '结果不能为 2，因为 [-2, -1] 不是连续子数组。最大乘积为 [0] 对应的 0。',
      },
    ],
    constraints: [
      '1 <= nums.length <= 2 * 10^4',
      '-10 <= nums[i] <= 10',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 4, python: 3, javascript: 2 },
    init: { java: 4, cpp: 5, python: 4, javascript: 3 },
    loopCheck: { java: 5, cpp: 6, python: 5, javascript: 4 },
    stateTransfer: {
      java: [6, 7, 8, 9, 10],
      cpp: [7, 8, 9, 10, 11],
      python: [6, 7, 8, 9],
      javascript: [5, 6, 7, 8, 9],
    },
    loopExit: { java: 12, cpp: 13, python: 10, javascript: 11 },
    returnResult: { java: 13, cpp: 14, python: 11, javascript: 12 },
  },
  code: {
    languages: {
      javascript: [
        'function maxProduct(nums) {',
        '  let ans = nums[0];',
        '  let maxDp = nums[0], minDp = nums[0];',
        '  for (let i = 1; i < nums.length; i++) {',
        '    const x = nums[i];',
        '    if (x < 0) [maxDp, minDp] = [minDp, maxDp];',
        '    maxDp = Math.max(x, maxDp * x);',
        '    minDp = Math.min(x, minDp * x);',
        '    ans = Math.max(ans, maxDp);',
        '  }',
        '  return ans;',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int maxProduct(int[] nums) {',
        '        int ans = nums[0];',
        '        int maxDp = nums[0], minDp = nums[0];',
        '        for (int i = 1; i < nums.length; i++) {',
        '            int x = nums[i];',
        '            if (x < 0) { int t = maxDp; maxDp = minDp; minDp = t; }',
        '            maxDp = Math.max(x, maxDp * x);',
        '            minDp = Math.min(x, minDp * x);',
        '            ans = Math.max(ans, maxDp);',
        '        }',
        '        return ans;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int maxProduct(vector<int>& nums) {',
        '        int ans = nums[0];',
        '        int maxDp = nums[0], minDp = nums[0];',
        '        for (size_t i = 1; i < nums.size(); i++) {',
        '            int x = nums[i];',
        '            if (x < 0) swap(maxDp, minDp);',
        '            maxDp = max(x, maxDp * x);',
        '            minDp = min(x, minDp * x);',
        '            ans = max(ans, maxDp);',
        '        }',
        '        return ans;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def maxProduct(self, nums: list[int]) -> int:',
        '        ans = max_dp = min_dp = nums[0]',
        '        for x in nums[1:]:',
        '            if x < 0:',
        '                max_dp, min_dp = min_dp, max_dp',
        '            max_dp = max(x, max_dp * x)',
        '            min_dp = min(x, min_dp * x)',
        '            ans = max(ans, max_dp)',
        '        return ans',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口，传入数组 nums。',
        2: 'ans 初始化为 nums[0]，记录全局最大乘积。',
        3: 'maxDp/minDp 分别维护以当前位置结尾的最大与最小乘积。',
        4: '从第 1 个元素开始向后遍历。',
        6: '遇到负数时，最大与最小乘积在乘上负数后角色互换，提前交换两者。',
        7: '更新 maxDp：要么从当前单独 x 开始，要么接在之前 maxDp 后面相乘。',
        8: '更新 minDp：要么从当前单独 x 开始，要么接在之前 minDp 后面相乘。',
        9: '更新全局答案 ans。',
        12: '返回最大子数组乘积。',
      },
      java: {
        2: '方法入口。',
        4: '初始化状态双轨极值。',
        7: '遇到负数交换极值。',
        8: '递推最大乘积与最小乘积。',
        12: '返回结果。',
      },
      cpp: {
        3: '函数入口。',
        5: '初始化极值追踪。',
        8: '负数状态翻转。',
        12: '返回最大乘积。',
      },
      python: {
        2: '方法入口。',
        4: '遍历数组切片。',
        6: '元组解包交换极值。',
        9: '返回 ans。',
      },
    },
    keyPoints: {
      thinking:
        '乘法与加法的本质区别在于负数的反转效应。Kadane 算法只记录最大值，而乘法问题中过去的“极小负数”乘上“当前负数”会变成“极大正数”，因此必须同时维护正负两个维度的极限状态。',
      state: 'maxDp 和 minDp 分别是以当前元素结尾的最大乘积与最小乘积。',
      equation: '遇到负数 swap(maxDp, minDp); maxDp = max(x, maxDp * x); minDp = min(x, minDp * x)',
      initAndBounds: 'maxDp = minDp = ans = nums[0]。',
      complexity: '时间复杂度 $O(N)$，空间复杂度 $O(1)$。',
    },
    faqList: [
      {
        tag: '遇到 0 的处理',
        question: '当数组中出现 0 时，maxDp 和 minDp 会变成 0，后续怎么继续？',
        answer:
          '当下一个数字 x 不为 0 时，maxDp = max(x, 0 * x) = max(x, 0) = x，这相当于自动舍弃了之前的 0 前缀，重新以 x 为起点开启新的子数组，因此无需对 0 做额外复杂的特殊处理。',
      },
    ],
  },
  generateSteps: (input: { nums?: number[] } = {}): DpTraceStep[] => {
    const nums = input?.nums || [2, 3, -2, 4];
    const steps: DpTraceStep[] = [];

    let ans = nums[0];
    let maxDp = nums[0];
    let minDp = nums[0];

    steps.push(
      makeTraceStep({
        dp1d: nums.map((v, i) => ({ value: v, state: i === 0 ? 'active' : 'default' })),
        message: `✖️ 数组 nums = [${nums.join(', ')}]，初始化 maxDp = minDp = ans = <strong>${nums[0]}</strong>。`,
        log: `初始化: nums = [${nums.join(', ')}], 起始乘积 = ${nums[0]}`,
        vars: [
          { name: '全局 ans', value: String(ans) },
          { name: '以当前结尾 maxDp', value: String(maxDp) },
          { name: '以当前结尾 minDp', value: String(minDp) },
        ],
        metrics: { maxProduct: ans },
      })
    );

    for (let i = 1; i < nums.length; i++) {
      const x = nums[i];
      let swapped = false;
      if (x < 0) {
        const temp = maxDp;
        maxDp = minDp;
        minDp = temp;
        swapped = true;
      }
      maxDp = Math.max(x, maxDp * x);
      minDp = Math.min(x, minDp * x);
      ans = Math.max(ans, maxDp);

      steps.push(
        makeTraceStep({
          dp1d: nums.map((v, idx) => ({
            value: v,
            state: idx === i ? 'active' : 'computed',
          })),
          current: { index: i },
          message: `👉 处理 <strong>i=${i}</strong> (元素 ${x})：${swapped ? '💡 遇到负数，交换上一轮 maxDp 与 minDp 后计算。' : ''}<br/>• 当前最大乘积 maxDp = <strong>${maxDp}</strong>；<br/>• 当前最小乘积 minDp = <strong>${minDp}</strong>；<br/>• 全局最大乘积更新为 <strong>${ans}</strong>。`,
          log: `step i=${i} (x=${x}): maxDp=${maxDp}, minDp=${minDp}, ans=${ans}`,
          formula: 'maxDp = max(x, maxDp * x), minDp = min(x, minDp * x)',
          vars: [
            { name: '当前元素 x', value: String(x) },
            { name: '是否遇到负数翻转', value: swapped ? '是' : '否' },
            { name: '以i结尾 maxDp', value: String(maxDp) },
            { name: '以i结尾 minDp', value: String(minDp) },
            { name: '全局 ans', value: String(ans) },
          ],
          metrics: { maxProduct: ans },
        })
      );
    }

    steps.push(
      makeTraceStep({
        dp1d: nums.map((v) => ({ value: v, state: 'computed' })),
        message: `🏆 乘积最大子数组扫描完成！全局最大连续子数组乘积为 <strong>${ans}</strong>。`,
        log: `计算结束：最大乘积 = ${ans}`,
        vars: [
          { name: '最终最大乘积', value: String(ans) },
        ],
        metrics: { maxProduct: ans },
      })
    );

    return steps;
  },
};
