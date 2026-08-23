import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';

export const LcisSpec: AlgorithmSpec = {
  id: 'longest-continuous-increasing-subsequence',
  name: '最长连续递增序列 (LCIS)',
  category: '序列 DP',
  description: '给定一个未经排序的整数数组，找到最长且 连续递增的子序列，并返回该序列的长度。',
  difficulty: 'easy',
  problem: {
    leetcodeId: 674,
    leetcodeUrl: 'https://leetcode.cn/problems/longest-continuous-increasing-subsequence/',
    difficulty: 'easy',
    tags: ['数组', '动态规划', '序列DP'],
    description: '给定一个未经排序的整数数组，找到最长且 <strong>连续递增的子序列</strong>，并返回该序列的长度。<br/><br/><strong>连续递增的子序列</strong> 可以由两个下标 <code>l</code> 和 <code>r</code>（<code>l < r</code>）表示，如果对于每个 <code>l <= i < r</code>，都有 <code>nums[i] < nums[i+1]</code> ，那么子序列 <code>[nums[l], nums[l+1], ..., nums[r]]</code> 就是连续递增子序列。<br/><br/><strong>与 LIS 的区别</strong>：强调<strong>严格相邻连续</strong>，状态转移只依赖前一位 <code>dp[i-1]</code>，即 <code>dp[i] = nums[i] > nums[i-1] ? dp[i-1] + 1 : 1</code>！',
    examples: [
      {
        input: 'nums = [1,3,5,4,7]',
        output: '3',
        explanation: '最长连续递增序列是 [1,3,5], 长度为 3 。',
      },
      {
        input: 'nums = [2,2,2,2,2]',
        output: '1',
      },
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
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
        'function findLengthOfLCIS(nums) {',
        '    if (!nums || nums.length === 0) return 0;',
        '    const dp = new Array(nums.length).fill(1);',
        '    let maxLen = 1;',
        '    for (let i = 1; i < nums.length; i++) {',
        '        if (nums[i] > nums[i - 1]) dp[i] = dp[i - 1] + 1; // 仅依赖前一个相邻元素',
        '        maxLen = Math.max(maxLen, dp[i]);',
        '    }',
        '    return maxLen;',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int findLengthOfLCIS(int[] nums) {',
        '        if (nums == null || nums.length == 0) return 0;',
        '        int[] dp = new int[nums.length];',
        '        Arrays.fill(dp, 1);',
        '        int maxLen = 1;',
        '        for (int i = 1; i < nums.length; i++) {',
        '            if (nums[i] > nums[i - 1]) dp[i] = dp[i - 1] + 1;',
        '            maxLen = Math.max(maxLen, dp[i]);',
        '        }',
        '        return maxLen;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int findLengthOfLCIS(vector<int>& nums) {',
        '        if (nums.empty()) return 0;',
        '        vector<int> dp(nums.size(), 1);',
        '        int maxLen = 1;',
        '        for (int i = 1; i < nums.size(); i++) {',
        '            if (nums[i] > nums[i - 1]) dp[i] = dp[i - 1] + 1;',
        '            maxLen = max(maxLen, dp[i]);',
        '        }',
        '        return maxLen;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def findLengthOfLCIS(self, nums: List[int]) -> int:',
        '        if not nums: return 0',
        '        dp = [1] * len(nums)',
        '        for i in range(1, len(nums)):',
        '            if nums[i] > nums[i - 1]:',
        '                dp[i] = dp[i - 1] + 1',
        '        return max(dp)',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：最长连续递增序列。',
        2: '空数组保护。',
        3: '初始化全 1 数组。',
        4: '初始化最大长度为 1。',
        5: '单层遍历数组。',
        6: '连续递增判断：若 nums[i] > nums[i-1]，直接继承前一项 dp[i] = dp[i-1] + 1。',
        7: '更新全局最大长度。',
        9: '返回结果。',
      },
      java: {
        2: '函数入口。',
        4: '初始化 dp 数组。',
        7: '单层递推。',
        8: '相邻递增转移。',
        11: '返回最大值。',
      },
      cpp: {
        3: '函数入口。',
        5: '初始化向量。',
        7: '单层遍历。',
        8: '相邻递增方程。',
        11: '返回 maxLen。',
      },
      python: {
        2: '函数入口。',
        4: '初始化列表。',
        5: '单层遍历。',
        6: '相邻递增转移。',
        8: '返回 max(dp)。',
      },
    },
    keyPoints: {
      title: '🎯 最长连续递增序列 (LCIS) 5 步法系统精讲',
      summary: 'LeetCode 674。相比 LIS，因为要求必须连续，所以状态转移只需向前看一位 dp[i-1]，时间复杂度降为 O(n)！',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i]</code>：以 <code>nums[i]</code> 结尾的最长连续递增子序列长度。', icon: '🎯', badge: '连续结尾' },
        { label: '二、状态转移方程', desc: '若 <code>nums[i] > nums[i-1]</code>：<code>dp[i] = dp[i-1] + 1</code>；否则 <code>dp[i] = 1</code>。', icon: '⚡', badge: '仅看相邻前一位' },
        { label: '三、时空复杂度', desc: '• 时间复杂度：<code>O(n)</code>。<br>• 空间复杂度：<code>O(n)</code>，可滚动优化为 <code>O(1)</code>。', icon: '⏱️', badge: 'O(n)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let nums: number[] = [1, 3, 5, 4, 7];

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.nums)) nums = input.nums;
      else if (typeof input.nums === 'string') nums = input.nums.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
    }

    const n = nums.length;
    const dp: DpCell[] = Array(n).fill(1);
    let maxLen = 1;

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      curNum?: number | string;
      prevNum?: number | string;
      curDp?: DpCell | number | string;
      mx?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const nVal = opts.curNum ?? '-';
      const pVal = opts.prevNum ?? '-';
      const cur = opts.curDp ?? '-';
      const m = opts.mx ?? maxLen;
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'nums (数组)', value: `[${nums.join(', ')}]`, type: 'string' as const, changed: chSet.has('nums') },
        { name: 'i (当前下标)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'nums[i]', value: String(nVal), type: (typeof nVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('ni') },
        { name: 'nums[i-1]', value: String(pVal), type: (typeof pVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('np') },
        { name: 'dp[i] (连续递增长度)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpi') },
        { name: 'maxLen (最长连续长度)', value: String(m), type: 'number' as const, changed: chSet.has('mx') },
      ];
    };

    // Step 0: Entry
    push({
      dp1d: clone1d(dp),
      source: nums.map((x, idx) => `[${idx}]:${x}`),
      message: `🎯 函数入口：最长连续递增序列 (LCIS)。数组 [${nums.join(', ')}]。`,
      log: `entry: nums=[${nums.join(',')}]`,
      vars: makeVars({ changed: ['nums'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    for (let i = 1; i < n; i++) {
      if (nums[i] > nums[i - 1]) {
        const next = (dp[i - 1] as number) + 1;
        dp[i] = next;
        maxLen = Math.max(maxLen, next);

        push({
          dp1d: clone1d(dp),
          source: nums.map((x, idx) => `[${idx}]:${x}`),
          current: { index: i },
          dependencies: [{ index: i - 1 }],
          formula: `nums[${i}](${nums[i]}) > nums[${i - 1}](${nums[i - 1]}) => dp[${i}] = dp[${i - 1}] + 1 = ${next}`,
          message: `✨ 相邻递增延续：nums[${i}](${nums[i]}) > nums[${i - 1}](${nums[i - 1]})，连续长度累加 dp[${i}] = ${next}。`,
          log: `dp[${i}] = ${next}`,
          vars: makeVars({ i, curNum: nums[i], prevNum: nums[i - 1], curDp: next, mx: maxLen, changed: ['i', 'ni', 'np', 'dpi', 'mx'] }),
          codeLine: {
            java: { primary: [7, 8], context: [6] },
            cpp: { primary: [7, 8], context: [6] },
            python: { primary: [6, 7], context: [5] },
            javascript: { primary: [5, 6], context: [4] },
          },
        });
      } else {
        push({
          dp1d: clone1d(dp),
          source: nums.map((x, idx) => `[${idx}]:${x}`),
          current: { index: i },
          formula: `nums[${i}](${nums[i]}) <= nums[${i - 1}](${nums[i - 1]}) => dp[${i}] = 1`,
          message: `🛑 连续递增中断：nums[${i}](${nums[i]}) <= nums[${i - 1}](${nums[i - 1]})，重新重置长度 dp[${i}] = 1。`,
          log: `reset: dp[${i}] = 1`,
          vars: makeVars({ i, curNum: nums[i], prevNum: nums[i - 1], curDp: 1, mx: maxLen, changed: ['i', 'ni', 'np', 'dpi'] }),
          codeLine: {
            java: { primary: 8, context: [6] },
            cpp: { primary: 8, context: [6] },
            python: { primary: 7, context: [5] },
            javascript: { primary: 6, context: [4] },
          },
        });
      }
    }

    push({
      dp1d: clone1d(dp),
      source: nums.map((x, idx) => `[${idx}]:${x}`),
      message: `🏁 算法结束：最长连续递增子序列长度为 ${maxLen}。`,
      log: `return: maxLen=${maxLen}`,
      vars: makeVars({ mx: maxLen, changed: ['mx'] }),
      codeLine: { java: 11, cpp: 11, python: 8, javascript: 9 },
    });

    return steps;
  },
};
