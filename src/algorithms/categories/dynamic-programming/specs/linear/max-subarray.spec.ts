import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';

export const MaxSubarraySpec: AlgorithmSpec = {
  id: 'max-subarray-dp',
  name: '最大子数组和 (Maximum Subarray)',
  category: '线性 DP',
  description: '给你一个整数数组 nums ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 53,
    leetcodeUrl: 'https://leetcode.cn/problems/maximum-subarray/',
    difficulty: 'medium',
    tags: ['数组', '分治', '动态规划', '线性DP'],
    description: '给你一个整数数组 <code>nums</code> ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。<br/><br/><strong>子数组</strong> 是数组中的一个连续部分。<br/><br/><strong>状态转移核心</strong>：<code>dp[i]</code> 表示以 <code>nums[i]</code> 结尾的连续子数组的最大和。若 <code>dp[i-1] > 0</code> 则对当前和有增益，可接续 <code>dp[i] = dp[i-1] + nums[i]</code>；否则负增益抛弃，从自身重新开始 <code>dp[i] = nums[i]</code>！',
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: '连续子数组 [4,-1,2,1] 的和最大，为 6 。',
      },
      {
        input: 'nums = [1]',
        output: '1',
      },
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: [4, 5], cpp: [4, 5], python: [3, 4], javascript: [2, 3] },
    loopCheck: { java: 6, cpp: 6, python: 5, javascript: 4 },
    stateTransfer: {
      java: { primary: [7, 8], context: [6] },
      cpp: { primary: [7, 8], context: [6] },
      python: { primary: [6, 7], context: [5] },
      javascript: { primary: [5, 6], context: [4] },
    },
    loopExit: { java: 6, cpp: 6, python: 5, javascript: 4 },
    returnResult: { java: 11, cpp: 11, python: 8, javascript: 9 },
  },
  code: {
    languages: {
      javascript: [
        'function maxSubArray(nums) {',
        '    if (!nums || nums.length === 0) return 0;',
        '    const dp = new Array(nums.length).fill(0);',
        '    dp[0] = nums[0];',
        '    let maxSum = nums[0];',
        '    for (let i = 1; i < nums.length; i++) {',
        '        dp[i] = Math.max(nums[i], dp[i - 1] + nums[i]); // 重新起步 vs 接续前缀',
        '        maxSum = Math.max(maxSum, dp[i]);',
        '    }',
        '    return maxSum;',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int maxSubArray(int[] nums) {',
        '        if (nums == null || nums.length == 0) return 0;',
        '        int[] dp = new int[nums.length];',
        '        dp[0] = nums[0];',
        '        int maxSum = nums[0];',
        '        for (int i = 1; i < nums.length; i++) {',
        '            dp[i] = Math.max(nums[i], dp[i - 1] + nums[i]);',
        '            maxSum = Math.max(maxSum, dp[i]);',
        '        }',
        '        return maxSum;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int maxSubArray(vector<int>& nums) {',
        '        if (nums.empty()) return 0;',
        '        vector<int> dp(nums.size(), 0);',
        '        dp[0] = nums[0];',
        '        int maxSum = nums[0];',
        '        for (int i = 1; i < nums.size(); i++) {',
        '            dp[i] = max(nums[i], dp[i - 1] + nums[i]);',
        '            maxSum = max(maxSum, dp[i]);',
        '        }',
        '        return maxSum;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def maxSubArray(self, nums: List[int]) -> int:',
        '        if not nums: return 0',
        '        dp = [0] * len(nums)',
        '        dp[0] = nums[0]',
        '        max_sum = nums[0]',
        '        for i in range(1, len(nums)):',
        '            dp[i] = max(nums[i], dp[i - 1] + nums[i])',
        '            max_sum = max(max_sum, dp[i])',
        '        return max_sum',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：最大连续子数组和。',
        2: '空数组保护。',
        3: '开辟一维 dp 数组。',
        4: '初始化 dp[0] = nums[0]。',
        5: '初始化全局最大和 maxSum = nums[0]。',
        6: '遍历数组其余元素。',
        7: '核心状态转移：max(自身重新起步 nums[i], 接续前缀 dp[i-1] + nums[i])。',
        8: '维护全局最大子数组和。',
        10: '返回 maxSum。',
      },
      java: {
        2: '函数入口。',
        4: '初始化 dp 数组。',
        5: '首元素初始化。',
        7: '单层遍历。',
        8: '二选一状态转移。',
        11: '返回最大和。',
      },
      cpp: {
        3: '函数入口。',
        5: '初始化 dp 向量。',
        7: '循环递推。',
        8: '状态转移方程。',
        11: '返回 maxSum。',
      },
      python: {
        2: '函数入口。',
        4: '列表初始化。',
        6: '单层循环。',
        7: '状态转移。',
        9: '返回结果。',
      },
    },
    keyPoints: {
      title: '🎯 最大子数组和 5 步法系统精讲',
      summary: 'LeetCode 53。连续子数组的最值经典模型。每个位置面临选择：若前面的最大和为负数则果断丢弃从当前元素重新起步，若为正数则接续累加！',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i]</code>：以 <code>nums[i]</code> 结尾的连续子数组的最大和。', icon: '🎯', badge: '结尾最大和' },
        { label: '二、状态转移方程', desc: '<code>dp[i] = max(nums[i], dp[i - 1] + nums[i])</code>。', icon: '⚡', badge: '重起 vs 接续' },
        { label: '三、时空复杂度', desc: '• 时间复杂度：<code>O(n)</code>。<br>• 空间复杂度：<code>O(n)</code>，可压缩为 <code>O(1)</code>。', icon: '⏱️', badge: 'O(n)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let nums: number[] = [-2, 1, -3, 4, -1, 2, 1, -5, 4];

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.nums)) nums = input.nums;
      else if (typeof input.nums === 'string') nums = input.nums.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
    }

    const n = nums.length;
    const dp: DpCell[] = Array(n).fill(0);
    dp[0] = nums[0];
    let maxSum = nums[0];

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      curNum?: number | string;
      prevDp?: number | string;
      curDp?: DpCell | number | string;
      mx?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const nVal = opts.curNum ?? '-';
      const pVal = opts.prevDp ?? '-';
      const cur = opts.curDp ?? '-';
      const m = opts.mx ?? maxSum;
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'nums (数组)', value: `[${nums.join(', ')}]`, type: 'string' as const, changed: chSet.has('nums') },
        { name: 'i (当前下标)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'nums[i]', value: String(nVal), type: (typeof nVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('ni') },
        { name: 'dp[i-1] (前缀最大和)', value: String(pVal), type: (typeof pVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpPrev') },
        { name: 'dp[i] (当前结尾最大和)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpi') },
        { name: 'maxSum (全局最大子序和)', value: String(m), type: 'number' as const, changed: chSet.has('mx') },
      ];
    };

    // Step 0: Entry
    push({
      dp1d: clone1d(dp),
      source: nums.map((x, idx) => `[${idx}]:${x}`),
      message: `🎯 函数入口：最大子数组和。初始 nums: [${nums.join(', ')}]，dp[0] = ${nums[0]}。`,
      log: `entry: nums=[${nums.join(',')}]`,
      vars: makeVars({ i: 0, curNum: nums[0], curDp: nums[0], mx: nums[0], changed: ['nums', 'i', 'ni', 'dpi', 'mx'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    for (let i = 1; i < n; i++) {
      const prev = dp[i - 1] as number;
      const extend = prev + nums[i];
      const restart = nums[i];
      const best = Math.max(restart, extend);
      dp[i] = best;
      maxSum = Math.max(maxSum, best);

      const isExtend = extend >= restart;
      push({
        dp1d: clone1d(dp),
        source: nums.map((x, idx) => `[${idx}]:${x}`),
        current: { index: i },
        dependencies: [{ index: i - 1 }],
        formula: `dp[${i}] = max(自起:${restart}, 接续:${prev}+${nums[i]}=${extend}) = ${best}`,
        message: isExtend
          ? `✨ 接续前缀：前缀 dp[${i - 1}] (${prev}) > 0 为正增益，接续累加 dp[${i}] = ${best}。`
          : `🛑 重新起步：前缀 dp[${i - 1}] (${prev}) <= 0 为负增益，丢弃前缀从自身起步 dp[${i}] = ${best}。`,
        log: `dp[${i}] = ${best}`,
        vars: makeVars({ i, curNum: nums[i], prevDp: prev, curDp: best, mx: maxSum, changed: ['i', 'ni', 'dpPrev', 'dpi', 'mx'] }),
        codeLine: {
          java: { primary: [7, 8], context: [6] },
          cpp: { primary: [7, 8], context: [6] },
          python: { primary: [6, 7], context: [5] },
          javascript: { primary: [6, 7], context: [5] },
        },
      });
    }

    push({
      dp1d: clone1d(dp),
      source: nums.map((x, idx) => `[${idx}]:${x}`),
      message: `🏁 算法结束：全局最大连续子数组和为 ${maxSum}。`,
      log: `return: maxSum=${maxSum}`,
      vars: makeVars({ mx: maxSum, changed: ['mx'] }),
      codeLine: { java: 11, cpp: 11, python: 8, javascript: 9 },
    });

    return steps;
  },
};
