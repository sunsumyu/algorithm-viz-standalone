import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const LongestRepeatedSubarraySpec: AlgorithmSpec = {
  id: 'longest-repeated-subarray',
  name: '最长重复子数组 (Longest Repeated Subarray)',
  category: '序列 DP',
  description: '给两个整数数组 nums1 和 nums2 ，返回两个数组中 公共的 、长度最长的子数组的长度。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 718,
    leetcodeUrl: 'https://leetcode.cn/problems/maximum-length-of-repeated-subarray/',
    difficulty: 'medium',
    tags: ['数组', '二分查找', '动态规划', '滑动窗口', '双串DP'],
    description: '给两个整数数组 <code>nums1</code> 和 <code>nums2</code> ，返回 两个数组中 <strong>公共的</strong> 、长度最长的子数组的长度。<br/><br/><strong>子数组连续性要求</strong>：<code>dp[i][j]</code> 表示以 <code>nums1[i-1]</code> 和 <code>nums2[j-1]</code> 结尾的最长公共子数组长度。<br/>• 若 <code>nums1[i-1] === nums2[j-1]</code>：<code>dp[i][j] = dp[i-1][j-1] + 1</code>。<br/>• 若不同：子数组必须连续，故直接断开 <code>dp[i][j] = 0</code>！',
    examples: [
      {
        input: 'nums1 = [1,2,3,2,1], nums2 = [3,2,1,4,7]',
        output: '3',
        explanation: '长度最长的公共子数组是 [3,2,1] 。',
      },
      {
        input: 'nums1 = [0,0,0,0,0], nums2 = [0,0,0,0,0]',
        output: '5',
      },
    ],
    constraints: [
      '1 <= nums1.length, nums2.length <= 1000',
      '0 <= nums1[i], nums2[i] <= 100',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: [3, 5], cpp: [3, 5], python: [3, 4], javascript: [2, 3] },
    loopCheck: { java: 6, cpp: 6, python: 5, javascript: 4 },
    innerLoopCheck: { java: 7, cpp: 7, python: 6, javascript: 5 },
    stateTransfer: {
      java: { primary: 9, context: [7, 8] },
      cpp: { primary: 9, context: [7, 8] },
      python: { primary: 8, context: [6, 7] },
      javascript: { primary: 7, context: [5, 6] },
    },
    loopExit: { java: 6, cpp: 6, python: 5, javascript: 4 },
    returnResult: { java: 15, cpp: 15, python: 10, javascript: 13 },
  },
  code: {
    languages: {
      javascript: [
        'function findLength(nums1, nums2) {',
        '    const m = nums1.length, n = nums2.length;',
        '    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));',
        '    let maxLen = 0;',
        '    for (let i = 1; i <= m; i++) {',
        '        for (let j = 1; j <= n; j++) {',
        '            if (nums1[i - 1] === nums2[j - 1]) {',
        '                dp[i][j] = dp[i - 1][j - 1] + 1; // 仅来自左上方对角线',
        '                maxLen = Math.max(maxLen, dp[i][j]);',
        '            }',
        '        }',
        '    }',
        '    return maxLen;',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int findLength(int[] nums1, int[] nums2) {',
        '        int m = nums1.length, n = nums2.length;',
        '        int[][] dp = new int[m + 1][n + 1];',
        '        int maxLen = 0;',
        '        for (int i = 1; i <= m; i++) {',
        '            for (int j = 1; j <= n; j++) {',
        '                if (nums1[i - 1] == nums2[j - 1]) {',
        '                    dp[i][j] = dp[i - 1][j - 1] + 1;',
        '                    maxLen = Math.max(maxLen, dp[i][j]);',
        '                }',
        '            }',
        '        }',
        '        return maxLen;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int findLength(vector<int>& nums1, vector<int>& nums2) {',
        '        int m = nums1.size(), n = nums2.size();',
        '        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));',
        '        int maxLen = 0;',
        '        for (int i = 1; i <= m; i++) {',
        '            for (int j = 1; j <= n; j++) {',
        '                if (nums1[i - 1] == nums2[j - 1]) {',
        '                    dp[i][j] = dp[i - 1][j - 1] + 1;',
        '                    maxLen = max(maxLen, dp[i][j]);',
        '                }',
        '            }',
        '        }',
        '        return maxLen;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def findLength(self, nums1: List[int], nums2: List[int]) -> int:',
        '        m, n = len(nums1), len(nums2)',
        '        dp = [[0] * (n + 1) for _ in range(m + 1)]',
        '        max_len = 0',
        '        for i in range(1, m + 1):',
        '            for j in range(1, n + 1):',
        '                if nums1[i - 1] == nums2[j - 1]:',
        '                    dp[i][j] = dp[i - 1][j - 1] + 1',
        '                    max_len = max(max_len, dp[i][j])',
        '        return max_len',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：最长重复子数组。',
        2: '获取两个数组长度。',
        3: '开辟 dp[m+1][n+1] 状态表并初始化为 0。',
        4: '初始化最大长度为 0。',
        5: '外层遍历 nums1。',
        6: '内层遍历 nums2。',
        7: '相等判断：当前元素相同时才可接续对角线。',
        8: '对角线转移：dp[i][j] = dp[i-1][j-1] + 1。',
        9: '更新全局 maxLen。',
        13: '返回最大公共子数组长度。',
      },
      java: {
        2: '函数入口。',
        4: '定义二维 dp 表。',
        6: '双层循环遍历。',
        8: '元素相等判定。',
        9: '左上对角线累加。',
        14: '返回结果。',
      },
      cpp: {
        3: '函数入口。',
        5: '初始化向量表。',
        7: '双层遍历。',
        9: '对角线转移。',
        15: '返回 maxLen。',
      },
      python: {
        2: '函数入口。',
        4: '列表初始化。',
        6: '双层循环。',
        8: '相等转移。',
        10: '返回全局最大。',
      },
    },
    keyPoints: {
      title: '🎯 最长重复子数组 5 步法系统精讲',
      summary: 'LeetCode 718。要求子数组连续。因此不同于 LCS 的三方向转移，本题仅在元素相等时从左上对角线 dp[i-1][j-1] 转移过来，不相等则直接断开为 0！',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i][j]</code>：以 <code>nums1[i-1]</code> 和 <code>nums2[j-1]</code> 为结尾的最长公共子数组的长度。', icon: '🎯', badge: '双结尾子数组' },
        { label: '二、状态转移方程', desc: '若 <code>nums1[i-1] === nums2[j-1]</code>：<code>dp[i][j] = dp[i-1][j-1] + 1</code>；否则 <code>dp[i][j] = 0</code>。', icon: '⚡', badge: '仅对角线转移' },
        { label: '三、时空复杂度', desc: '• 时间复杂度：<code>O(m × n)</code>。<br>• 空间复杂度：<code>O(m × n)</code>，可滚动压缩为 <code>O(n)</code>。', icon: '⏱️', badge: 'O(mn)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let nums1: (string | number)[] = [1, 2, 3, 2, 1];
    let nums2: (string | number)[] = [3, 2, 1, 4, 7];

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.nums1)) nums1 = input.nums1;
      else if (typeof input.s === 'string') nums1 = input.s.split(/[,，\s]+/).filter(Boolean);

      if (Array.isArray(input.nums2)) nums2 = input.nums2;
      else if (typeof input.t === 'string') nums2 = input.t.split(/[,，\s]+/).filter(Boolean);
    }

    const m = nums1.length;
    const n = nums2.length;
    const dp: DpCell[][] = Array.from({ length: m + 1 }, () =>
      Array.from({ length: n + 1 }, () => 0)
    );

    let maxLen = 0;
    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      j?: number | string;
      v1?: string | number;
      v2?: string | number;
      curDp?: DpCell | number | string;
      mx?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const val1 = opts.v1 ?? '-';
      const val2 = opts.v2 ?? '-';
      const cur = opts.curDp ?? '-';
      const mxVal = opts.mx ?? maxLen;
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'nums1', value: `[${nums1.join(', ')}]`, type: 'string' as const, changed: chSet.has('n1') },
        { name: 'nums2', value: `[${nums2.join(', ')}]`, type: 'string' as const, changed: chSet.has('n2') },
        { name: 'i (nums1下标)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'nums1[i-1]', value: String(val1), type: 'string' as const, changed: chSet.has('v1') },
        { name: 'j (nums2下标)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 'nums2[j-1]', value: String(val2), type: 'string' as const, changed: chSet.has('v2') },
        { name: 'dp[i][j] (公共长度)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dp') },
        { name: 'maxLen (全局最长)', value: String(mxVal), type: 'number' as const, changed: chSet.has('mx') },
      ];
    };

    // Step 0: Entry
    push({
      dp2d: clone2d(dp),
      source: [...nums1.map(String), '|', ...nums2.map(String)],
      message: `🎯 函数入口：最长重复子数组。nums1: [${nums1.join(', ')}]，nums2: [${nums2.join(', ')}]。`,
      log: `entry: m=${m}, n=${n}`,
      vars: makeVars({ changed: ['n1', 'n2'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const a = String(nums1[i - 1]);
        const b = String(nums2[j - 1]);
        if (a === b) {
          const next = (dp[i - 1][j - 1] as number) + 1;
          dp[i][j] = next;
          maxLen = Math.max(maxLen, next);

          push({
            dp2d: clone2d(dp),
            source: [...nums1.map(String), '|', ...nums2.map(String)],
            current: { row: i, col: j },
            dependencies: [{ row: i - 1, col: j - 1 }],
            formula: `nums1[${i - 1}] == nums2[${j - 1}] ('${a}') => dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${next}`,
            message: `✨ 元素相等匹配：nums1[${i - 1}] 与 nums2[${j - 1}] 均为 '${a}'，连续子数组长度累加至 ${next}。`,
            log: `match: dp[${i}][${j}] = ${next}`,
            vars: makeVars({ i, j, v1: a, v2: b, curDp: next, mx: maxLen, changed: ['i', 'j', 'v1', 'v2', 'dp', 'mx'] }),
            codeLine: {
              java: { primary: 9, context: [7, 8] },
              cpp: { primary: 9, context: [7, 8] },
              python: { primary: 8, context: [6, 7] },
              javascript: { primary: 8, context: [5, 6] },
            },
          });
        }
      }
    }

    push({
      dp2d: clone2d(dp),
      source: [...nums1.map(String), '|', ...nums2.map(String)],
      message: `🏁 算法结束：最长公共连续子数组长度为 ${maxLen}。`,
      log: `return: maxLen=${maxLen}`,
      vars: makeVars({ mx: maxLen, changed: ['mx'] }),
      codeLine: { java: 15, cpp: 15, python: 10, javascript: 13 },
    });

    return steps;
  },
};
