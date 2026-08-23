import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';

export const LisSpec: AlgorithmSpec = {
  id: 'longest-increasing-subsequence',
  name: '最长递增子序列 (Longest Increasing Subsequence)',
  category: '序列 DP',
  description: '给你一个整数数组 nums ，找到其中最长严格递增子序列的长度。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 300,
    leetcodeUrl: 'https://leetcode.cn/problems/longest-increasing-subsequence/',
    difficulty: 'medium',
    tags: ['数组', '二分查找', '动态规划', '序列DP'],
    description: '给你一个整数数组 <code>nums</code> ，找到其中最长严格递增子序列的长度。<br/><br/><strong>子序列</strong> 是由数组派生而来的序列，删除（或不删除）数组中的元素而不改变其余元素的顺序。<br/><br/><strong>状态定义与转移</strong>：<code>dp[i]</code> 表示以 <code>nums[i]</code> 结尾的最长递增子序列长度。对于所有 <code>j < i</code>，若 <code>nums[i] > nums[j]</code>，则 <code>dp[i] = max(dp[i], dp[j] + 1)</code>。',
    examples: [
      {
        input: 'nums = [10, 9, 2, 5, 3, 7, 101, 18]',
        output: '4',
        explanation: '最长递增子序列是 [2, 3, 7, 101]，因此长度为 4 。',
      },
      {
        input: 'nums = [0, 1, 0, 3, 2, 3]',
        output: '4',
      },
    ],
    constraints: [
      '1 <= nums.length <= 2500',
      '-10^4 <= nums[i] <= 10^4',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: [4, 5], cpp: [4, 5], python: [3, 4], javascript: [2, 3] },
    loopCheck: { java: 6, cpp: 6, python: 5, javascript: 4 },
    innerLoopCheck: { java: 7, cpp: 7, python: 6, javascript: 5 },
    stateTransfer: {
      java: { primary: 8, context: [6, 7] },
      cpp: { primary: 8, context: [6, 7] },
      python: { primary: 7, context: [5, 6] },
      javascript: { primary: 6, context: [4, 5] },
    },
    loopExit: { java: 6, cpp: 6, python: 5, javascript: 4 },
    returnResult: { java: 12, cpp: 12, python: 9, javascript: 10 },
  },
  code: {
    languages: {
      javascript: [
        'function lengthOfLIS(nums) {',
        '    if (!nums || nums.length === 0) return 0;',
        '    const dp = new Array(nums.length).fill(1); // 每个元素自身构成长度为 1 的子序列',
        '    let maxLen = 1;',
        '    for (let i = 1; i < nums.length; i++) { // 遍历当前终点',
        '        for (let j = 0; j < i; j++) {       // 遍历前驱起点',
        '            if (nums[i] > nums[j]) {',
        '                dp[i] = Math.max(dp[i], dp[j] + 1);',
        '            }',
        '        }',
        '        maxLen = Math.max(maxLen, dp[i]);',
        '    }',
        '    return maxLen;',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int lengthOfLIS(int[] nums) {',
        '        if (nums == null || nums.length == 0) return 0;',
        '        int[] dp = new int[nums.length];',
        '        Arrays.fill(dp, 1);',
        '        int maxLen = 1;',
        '        for (int i = 1; i < nums.length; i++) {',
        '            for (int j = 0; j < i; j++) {',
        '                if (nums[i] > nums[j]) {',
        '                    dp[i] = Math.max(dp[i], dp[j] + 1);',
        '                }',
        '            }',
        '            maxLen = Math.max(maxLen, dp[i]);',
        '        }',
        '        return maxLen;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int lengthOfLIS(vector<int>& nums) {',
        '        if (nums.empty()) return 0;',
        '        vector<int> dp(nums.size(), 1);',
        '        int maxLen = 1;',
        '        for (int i = 1; i < nums.size(); i++) {',
        '            for (int j = 0; j < i; j++) {',
        '                if (nums[i] > nums[j]) {',
        '                    dp[i] = max(dp[i], dp[j] + 1);',
        '                }',
        '            }',
        '            maxLen = max(maxLen, dp[i]);',
        '        }',
        '        return maxLen;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def lengthOfLIS(self, nums: List[int]) -> int:',
        '        if not nums: return 0',
        '        dp = [1] * len(nums)',
        '        for i in range(1, len(nums)):',
        '            for j in range(i):',
        '                if nums[i] > nums[j]:',
        '                    dp[i] = max(dp[i], dp[j] + 1)',
        '        return max(dp)',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：最长递增子序列。',
        2: '边界特判。',
        3: '初始化 dp 数组为 1（每个元素单独作为一个递增子序列）。',
        4: '初始化全局最长长度 maxLen = 1。',
        5: '外层遍历当前结尾元素 nums[i]。',
        6: '内层遍历前驱元素 nums[j] (0..i-1)。',
        7: '严格递增条件：若 nums[i] > nums[j]，则可将 nums[i] 接在 nums[j] 之后。',
        8: '更新 dp[i] = max(dp[i], dp[j] + 1)。',
        11: '维护全局最大值。',
        13: '返回全局最长长度。',
      },
      java: {
        2: '函数入口。',
        4: '开辟 dp 数组并全填充 1。',
        7: '双层循环遍历。',
        9: '递增转移方程。',
        13: '更新 maxLen。',
        15: '返回结果。',
      },
      cpp: {
        3: '函数入口。',
        5: '初始化 dp 向量。',
        7: '双层遍历。',
        9: '条件状态转移。',
        15: '返回 maxLen。',
      },
      python: {
        2: '函数入口。',
        4: '列表全初始化为 1。',
        5: '双层循环。',
        7: '状态转移。',
        8: '返回 max(dp)。',
      },
    },
    keyPoints: {
      title: '🎯 最长递增子序列 (LIS) 5 步法系统精讲',
      summary: 'LeetCode 300。经典序列 DP 母题。核心在于以 nums[i] 为结尾考察所有前驱 j，只要 nums[i] > nums[j] 就能实现子序列延伸！',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i]</code>：以 <code>nums[i]</code> 结尾的最长严格递增子序列长度。', icon: '🎯', badge: '结尾长度' },
        { label: '二、状态转移方程', desc: '<code>dp[i] = max(dp[i], dp[j] + 1)</code>（对所有 <code>j < i && nums[i] > nums[j]</code>）。', icon: '⚡', badge: '接续前驱' },
        { label: '三、初始化', desc: '<code>dp</code> 数组所有位置必须全部初始化为 <code>1</code>。', icon: '🎬', badge: '全1初始化' },
        { label: '四、时空复杂度', desc: '• 动态规划时间复杂度：<code>O(n²)</code>，空间复杂度 <code>O(n)</code>。<br>• 进阶（贪心+二分查找）：<code>O(n log n)</code>。', icon: '⏱️', badge: 'O(n²)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let nums: number[] = [10, 9, 2, 5, 3, 7, 101, 18];

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
      j?: number | string;
      curNum?: number | string;
      prevNum?: number | string;
      curDp?: DpCell | number | string;
      mx?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const nVal = opts.curNum ?? '-';
      const pVal = opts.prevNum ?? '-';
      const cur = opts.curDp ?? '-';
      const m = opts.mx ?? maxLen;
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'nums (输入数组)', value: `[${nums.join(', ')}]`, type: 'string' as const, changed: chSet.has('nums') },
        { name: 'i (当前终点)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'nums[i]', value: String(nVal), type: (typeof nVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('ni') },
        { name: 'j (前驱起点)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 'nums[j]', value: String(pVal), type: (typeof pVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('nj') },
        { name: 'dp[i] (当前最长长度)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpi') },
        { name: 'maxLen (全局最大)', value: String(m), type: 'number' as const, changed: chSet.has('mx') },
      ];
    };

    // Step 0: Entry
    push({
      dp1d: clone1d(dp),
      source: nums.map((x, idx) => `[${idx}]:${x}`),
      message: `🎯 函数入口：最长递增子序列 (LIS)。数组 [${nums.join(', ')}]，dp 全部初始化为 1。`,
      log: `entry: nums=[${nums.join(',')}]`,
      vars: makeVars({ changed: ['nums'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    for (let i = 1; i < n; i++) {
      for (let j = 0; j < i; j++) {
        if (nums[i] > nums[j]) {
          const old = dp[i] as number;
          const next = Math.max(old, (dp[j] as number) + 1);
          dp[i] = next;
          maxLen = Math.max(maxLen, next);

          push({
            dp1d: clone1d(dp),
            source: nums.map((x, idx) => `[${idx}]:${x}`),
            current: { index: i },
            dependencies: [{ index: j }],
            formula: `nums[${i}](${nums[i]}) > nums[${j}](${nums[j]}) => dp[${i}] = max(${old}, dp[${j}]+1) = ${next}`,
            message: `✨ 接续递增：nums[${i}](${nums[i]}) > nums[${j}](${nums[j]})，接在 [${j}] 之后使得以 [${i}] 结尾的最长长度提升至 ${next}。`,
            log: `dp[${i}] = ${next}`,
            vars: makeVars({ i, j, curNum: nums[i], prevNum: nums[j], curDp: next, mx: maxLen, changed: ['i', 'j', 'ni', 'nj', 'dpi', 'mx'] }),
            codeLine: {
              java: { primary: 8, context: [6, 7] },
              cpp: { primary: 8, context: [6, 7] },
              python: { primary: 7, context: [5, 6] },
              javascript: { primary: 6, context: [4, 5] },
            },
          });
        }
      }
    }

    push({
      dp1d: clone1d(dp),
      source: nums.map((x, idx) => `[${idx}]:${x}`),
      message: `🏁 算法结束：最长严格递增子序列的长度为 ${maxLen}。`,
      log: `return: maxLen=${maxLen}`,
      vars: makeVars({ mx: maxLen, changed: ['mx'] }),
      codeLine: { java: 12, cpp: 12, python: 9, javascript: 10 },
    });

    return steps;
  },
};
