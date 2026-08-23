import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const LongestPalindromicSubsequenceSpec: AlgorithmSpec = {
  id: 'longest-palindromic-subsequence',
  name: '最长回文子序列 (Longest Palindromic Subsequence)',
  category: '区间 DP',
  description: '给你一个字符串 s ，找出其中最长的回文子序列，并返回该序列的长度。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 516,
    leetcodeUrl: 'https://leetcode.cn/problems/longest-palindromic-subsequence/',
    difficulty: 'medium',
    tags: ['字符串', '动态规划', '区间DP'],
    description: '给你一个字符串 <code>s</code> ，找出其中最长的回文子序列，并返回该序列的长度。<br/><br/><strong>区间 DP 核心模型</strong>：<code>dp[i][j]</code> 表示字符串 <code>s[i..j]</code> 范围内的最长回文子序列长度。<br/>• 若 <code>s[i] === s[j]</code>：两端相等，向内收缩 <code>dp[i][j] = dp[i+1][j-1] + 2</code>。<br/>• 若 <code>s[i] !== s[j]</code>：两端不等，尝试放弃左端或右端 <code>dp[i][j] = max(dp[i+1][j], dp[i][j-1])</code>。<br/><br/><strong>遍历顺序</strong>：因为 <code>dp[i][j]</code> 依赖左下方 <code>dp[i+1][j-1]</code> 和下方 <code>dp[i+1][j]</code>，因此 <strong>行 i 必须从下到上倒序遍历</strong>，<strong>列 j 必须从左到右正序遍历</strong>！',
    examples: [
      {
        input: 's = "bbbab"',
        output: '4',
        explanation: '一个可能的最长回文子序列为 "bbbb" 。',
      },
      {
        input: 's = "cbbd"',
        output: '2',
        explanation: '一个可能的最长回文子序列为 "bb" 。',
      },
    ],
    constraints: [
      '1 <= s.length <= 1000',
      's 仅由小写英文字母组成',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: [4, 6], cpp: [4, 6], python: [3, 5], javascript: [3, 5] },
    loopCheck: { java: 7, cpp: 7, python: 6, javascript: 6 },
    innerLoopCheck: { java: 8, cpp: 8, python: 7, javascript: 7 },
    stateTransfer: {
      java: { primary: [10, 12], context: [8, 9] },
      cpp: { primary: [10, 12], context: [8, 9] },
      python: { primary: [8, 10], context: [6, 7] },
      javascript: { primary: [9, 11], context: [7, 8] },
    },
    loopExit: { java: 7, cpp: 7, python: 6, javascript: 6 },
    returnResult: { java: 16, cpp: 16, python: 11, javascript: 15 },
  },
  code: {
    languages: {
      javascript: [
        'function longestPalindromeSubseq(s) {',
        '    const n = s.length;',
        '    const dp = Array.from({ length: n }, () => new Array(n).fill(0));',
        '    for (let i = 0; i < n; i++) dp[i][i] = 1; // 单个字符自身是长度为 1 的回文串',
        '    for (let i = n - 1; i >= 0; i--) { // 区间 DP：行 i 倒序遍历（从下到上）',
        '        for (let j = i + 1; j < n; j++) { // 列 j 正序遍历（从左到右）',
        '            if (s[i] === s[j]) {',
        '                dp[i][j] = dp[i + 1][j - 1] + 2; // 两端字符相同，回文长度加 2',
        '            } else {',
        '                dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]); // 两端不同，各缩减一端取较大者',
        '            }',
        '        }',
        '    }',
        '    return dp[0][n - 1]; // 整个字符串 s[0..n-1] 的最长回文子序列',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int longestPalindromeSubseq(String s) {',
        '        int n = s.length();',
        '        int[][] dp = new int[n][n];',
        '        for (int i = 0; i < n; i++) dp[i][i] = 1;',
        '        for (int i = n - 1; i >= 0; i--) {',
        '            for (int j = i + 1; j < n; j++) {',
        '                if (s.charAt(i) == s.charAt(j)) {',
        '                    dp[i][j] = dp[i + 1][j - 1] + 2;',
        '                } else {',
        '                    dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);',
        '                }',
        '            }',
        '        }',
        '        return dp[0][n - 1];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int longestPalindromeSubseq(string s) {',
        '        int n = s.size();',
        '        vector<vector<int>> dp(n, vector<int>(n, 0));',
        '        for (int i = 0; i < n; i++) dp[i][i] = 1;',
        '        for (int i = n - 1; i >= 0; i--) {',
        '            for (int j = i + 1; j < n; j++) {',
        '                if (s[i] == s[j]) {',
        '                    dp[i][j] = dp[i + 1][j - 1] + 2;',
        '                } else {',
        '                    dp[i][j] = max(dp[i + 1][j], dp[i][j - 1]);',
        '                }',
        '            }',
        '        }',
        '        return dp[0][n - 1];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def longestPalindromeSubseq(self, s: str) -> int:',
        '        n = len(s)',
        '        dp = [[0] * n for _ in range(n)]',
        '        for i in range(n): dp[i][i] = 1',
        '        for i in range(n - 1, -1, -1):',
        '            for j in range(i + 1, n):',
        '                if s[i] == s[j]:',
        '                    dp[i][j] = dp[i + 1][j - 1] + 2',
        '                else:',
        '                    dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])',
        '        return dp[0][n - 1]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：最长回文子序列。',
        2: '获取字符串长度 n。',
        3: '开辟区间状态表格 dp[n][n]。',
        4: '初始化对角线 dp[i][i] = 1（单个字符回文长度为 1）。',
        5: '外层遍历 i 从 n-1 倒序递减到 0（因为状态依赖 i+1 下方行）。',
        6: '内层遍历 j 从 i+1 正序递增到 n-1。',
        7: '两端匹配判断：s[i] === s[j]。',
        8: '两端相同：由左下角内部子区间扩展，长度 + 2 (dp[i+1][j-1] + 2)。',
        10: '两端不同：分别尝试舍弃 s[i] 或 s[j]，取最大值 Math.max(dp[i+1][j], dp[i][j-1])。',
        14: '返回右上角终点 dp[0][n-1]。',
      },
      java: {
        2: '函数入口。',
        4: '定义二维 dp 矩阵。',
        5: '对角线初始化为 1。',
        6: 'i 倒序遍历。',
        7: 'j 正序遍历。',
        9: '两端相同加 2。',
        11: '两端不同取 max。',
        15: '返回 dp[0][n-1]。',
      },
      cpp: {
        3: '函数入口。',
        5: '初始化向量表。',
        6: '单字符初始化。',
        7: 'i 倒序外层循环。',
        8: 'j 正序内层循环。',
        10: '相等加 2 转移。',
        12: '不等取 max 转移。',
        16: '返回答案。',
      },
      python: {
        2: '函数入口。',
        4: '初始化二维列表。',
        5: '对角线赋 1。',
        6: '双层区间遍历。',
        8: '相等加 2。',
        10: '不等取 max。',
        11: '返回 dp[0][-1]。',
      },
    },
    keyPoints: {
      title: '🎯 最长回文子序列 (区间 DP) 5 步法系统精讲',
      summary: 'LeetCode 516。经典区间 DP 模型。核心在于状态依赖方向：dp[i][j] 依赖左下角 dp[i+1][j-1]、下方 dp[i+1][j] 和左方 dp[i][j-1]，决定了必须从下往上遍历行！',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i][j]</code>：字符串 <code>s[i..j]</code> 范围内的最长回文子序列长度。', icon: '🎯', badge: '区间范围状态' },
        { label: '二、状态转移方程', desc: '• <code>s[i] === s[j]</code>：<code>dp[i][j] = dp[i+1][j-1] + 2</code><br>• <code>s[i] !== s[j]</code>：<code>dp[i][j] = max(dp[i+1][j], dp[i][j-1])</code>', icon: '⚡', badge: '向内收缩' },
        { label: '三、遍历顺序 (关键！)', desc: '由于依赖 <code>dp[i+1]</code>（下一行），<strong>行 <code>i</code> 必须倒序遍历（从 n-1 到 0）</strong>；<strong>列 <code>j</code> 正序遍历（从 i+1 到 n-1）</strong>。', icon: '🎬', badge: '行倒数列正序' },
        { label: '四、时空复杂度', desc: '• 时间复杂度：<code>O(n²)</code>。<br>• 空间复杂度：<code>O(n²)</code>。', icon: '⏱️', badge: 'O(n²)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let s = 'bbbab';

    if (typeof input === 'object' && input) {
      if (typeof input.s === 'string') s = input.s;
      else if (typeof input.nums === 'string') s = input.nums;
    }

    const n = s.length;
    const dp: DpCell[][] = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => 0)
    );

    for (let i = 0; i < n; i++) dp[i][i] = 1;

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      j?: number | string;
      ci?: string;
      cj?: string;
      curDp?: DpCell | number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const chI = opts.ci ?? '-';
      const chJ = opts.cj ?? '-';
      const cur = opts.curDp ?? (dp[0][n - 1] as number);
      const chSet = new Set(opts.changed || []);

      return [
        { name: 's (字符串)', value: s, type: 'string' as const, changed: chSet.has('s') },
        { name: 'i (区间左端点)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 's[i]', value: chI, type: 'string' as const, changed: chSet.has('ci') },
        { name: 'j (区间右端点)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 's[j]', value: chJ, type: 'string' as const, changed: chSet.has('cj') },
        { name: 'dp[i][j] (区间最长回文)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dp') },
      ];
    };

    // Step 0: Entry
    push({
      dp2d: clone2d(dp),
      source: s.split(''),
      message: `🎯 函数入口：最长回文子序列。字符串 "${s}"，初始化对角线 dp[i][i] = 1。`,
      log: `entry: s="${s}", n=${n}`,
      vars: makeVars({ changed: ['s'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    for (let i = n - 1; i >= 0; i--) {
      for (let j = i + 1; j < n; j++) {
        const c1 = s[i];
        const c2 = s[j];
        if (c1 === c2) {
          const inner = (i + 1 <= j - 1) ? (dp[i + 1][j - 1] as number) : 0;
          const next = inner + 2;
          dp[i][j] = next;

          push({
            dp2d: clone2d(dp),
            source: s.split(''),
            current: { row: i, col: j },
            dependencies: (i + 1 <= j - 1) ? [{ row: i + 1, col: j - 1 }] : [],
            formula: `s[${i}] == s[${j}] ('${c1}') => dp[${i}][${j}] = dp[${i + 1}][${j - 1}] + 2 = ${next}`,
            message: `✨ 两端匹配加 2：s[${i}] 与 s[${j}] 均为 '${c1}'，由内层子序列 + 2 $\rightarrow$ dp[${i}][${j}] = ${next}。`,
            log: `match: dp[${i}][${j}] = ${next}`,
            vars: makeVars({ i, j, ci: c1, cj: c2, curDp: next, changed: ['i', 'j', 'ci', 'cj', 'dp'] }),
            codeLine: {
              java: { primary: 10, context: [8, 9] },
              cpp: { primary: 10, context: [8, 9] },
              python: { primary: 8, context: [6, 7] },
              javascript: { primary: 8, context: [6, 7] },
            },
          });
        } else {
          const d1 = dp[i + 1][j] as number;
          const d2 = dp[i][j - 1] as number;
          const best = Math.max(d1, d2);
          dp[i][j] = best;

          push({
            dp2d: clone2d(dp),
            source: s.split(''),
            current: { row: i, col: j },
            dependencies: [{ row: i + 1, col: j }, { row: i, col: j - 1 }],
            formula: `s[${i}] != s[${j}] => max(下方:${d1}, 左方:${d2}) = ${best}`,
            message: `⏩ 两端不同 ('${c1}' != '${c2}')：取【舍弃 s[${i}] (${d1})】与【舍弃 s[${j}] (${d2})】的最大值 $\rightarrow$ dp[${i}][${j}] = ${best}。`,
            log: `diff: dp[${i}][${j}] = ${best}`,
            vars: makeVars({ i, j, ci: c1, cj: c2, curDp: best, changed: ['i', 'j', 'ci', 'cj', 'dp'] }),
            codeLine: {
              java: { primary: 12, context: [8, 9] },
              cpp: { primary: 12, context: [8, 9] },
              python: { primary: 10, context: [6, 7] },
              javascript: { primary: 10, context: [6, 7] },
            },
          });
        }
      }
    }

    const finalAns = dp[0][n - 1] as number;
    push({
      dp2d: clone2d(dp),
      source: s.split(''),
      current: { row: 0, col: n - 1 },
      message: `🏁 算法结束：字符串 "${s}" 的最长回文子序列长度为 dp[0][${n - 1}] = ${finalAns}。`,
      log: `return: dp[0][${n - 1}] = ${finalAns}`,
      vars: makeVars({ curDp: finalAns, changed: ['dp'] }),
      codeLine: { java: 16, cpp: 16, python: 11, javascript: 14 },
    });

    return steps;
  },
};
