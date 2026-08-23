import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const DeleteDistanceSpec: AlgorithmSpec = {
  id: 'delete-operation-for-two-strings',
  name: '两个字符串的删除操作 (Delete Operation for Two Strings)',
  category: '序列 DP',
  description: '给定两个单词 word1 和 word2 ，返回使得 word1 和 word2 相同所需的最小步数。每步可以删除任意一个字符串中的一个字符。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 583,
    leetcodeUrl: 'https://leetcode.cn/problems/delete-operation-for-two-strings/',
    difficulty: 'medium',
    tags: ['字符串', '动态规划', '双串DP'],
    description: '给定两个单词 <code>word1</code> 和 <code>word2</code> ，返回使得 <code>word1</code> 和  <code>word2</code> <strong>相同所需的最小步数</strong> 。<br/><br/>每步可以删除任意一个字符串中的一个字符。<br/><br/><strong>两路思维</strong>：<br/>• <strong>方法一（LCS 间接求法）</strong>：两串相同部分即为 LCS，最少删除次数等于 <code>word1.length + word2.length - 2 * LCS(word1, word2)</code>。<br/>• <strong>方法二（直接 DP 转移）</strong>：<code>dp[i][j]</code> 为使 <code>word1[0..i-1]</code> 与 <code>word2[0..j-1]</code> 相同所需最少删除次数。字符相同 <code>dp[i][j] = dp[i-1][j-1]</code>；字符不同 <code>dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + 1</code>。',
    examples: [
      {
        input: 'word1 = "sea", word2 = "eat"',
        output: '2',
        explanation: '第一步将 "sea" 变为 "ea" ，第二步将 "eat" 变为 "ea" 。',
      },
      {
        input: 'word1 = "leetcode", word2 = "etco"',
        output: '4',
      },
    ],
    constraints: [
      '1 <= word1.length, word2.length <= 500',
      'word1 和 word2 只包含小写英文字母',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: [4, 7], cpp: [4, 7], python: [3, 6], javascript: [3, 5] },
    loopCheck: { java: 8, cpp: 8, python: 7, javascript: 6 },
    innerLoopCheck: { java: 9, cpp: 9, python: 8, javascript: 7 },
    stateTransfer: {
      java: { primary: [11, 13], context: [9, 10] },
      cpp: { primary: [11, 13], context: [9, 10] },
      python: { primary: [9, 11], context: [7, 8] },
      javascript: { primary: [8, 10], context: [6, 7] },
    },
    loopExit: { java: 8, cpp: 8, python: 7, javascript: 6 },
    returnResult: { java: 17, cpp: 17, python: 12, javascript: 14 },
  },
  code: {
    languages: {
      javascript: [
        'function minDistance(word1, word2) {',
        '    const m = word1.length, n = word2.length;',
        '    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));',
        '    for (let i = 0; i <= m; i++) dp[i][0] = i; // word2 为空，需删除 word1 全部 i 个字符',
        '    for (let j = 0; j <= n; j++) dp[0][j] = j; // word1 为空，需删除 word2 全部 j 个字符',
        '    for (let i = 1; i <= m; i++) {',
        '        for (let j = 1; j <= n; j++) {',
        '            if (word1[i - 1] === word2[j - 1]) {',
        '                dp[i][j] = dp[i - 1][j - 1]; // 字符相同，无需删除',
        '            } else {',
        '                dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + 1; // 删 word1[i-1] 或 删 word2[j-1]',
        '            }',
        '        }',
        '    }',
        '    return dp[m][n];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int minDistance(String word1, String word2) {',
        '        int m = word1.length(), n = word2.length();',
        '        int[][] dp = new int[m + 1][n + 1];',
        '        for (int i = 0; i <= m; i++) dp[i][0] = i;',
        '        for (int j = 0; j <= n; j++) dp[0][j] = j;',
        '        for (int i = 1; i <= m; i++) {',
        '            for (int j = 1; j <= n; j++) {',
        '                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {',
        '                    dp[i][j] = dp[i - 1][j - 1];',
        '                } else {',
        '                    dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + 1;',
        '                }',
        '            }',
        '        }',
        '        return dp[m][n];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int minDistance(string word1, string word2) {',
        '        int m = word1.size(), n = word2.size();',
        '        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));',
        '        for (int i = 0; i <= m; i++) dp[i][0] = i;',
        '        for (int j = 0; j <= n; j++) dp[0][j] = j;',
        '        for (int i = 1; i <= m; i++) {',
        '            for (int j = 1; j <= n; j++) {',
        '                if (word1[i - 1] == word2[j - 1]) {',
        '                    dp[i][j] = dp[i - 1][j - 1];',
        '                } else {',
        '                    dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + 1;',
        '                }',
        '            }',
        '        }',
        '        return dp[m][n];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def minDistance(self, word1: str, word2: str) -> int:',
        '        m, n = len(word1), len(word2)',
        '        dp = [[0] * (n + 1) for _ in range(m + 1)]',
        '        for i in range(m + 1): dp[i][0] = i',
        '        for j in range(n + 1): dp[0][j] = j',
        '        for i in range(1, m + 1):',
        '            for j in range(1, n + 1):',
        '                if word1[i - 1] == word2[j - 1]:',
        '                    dp[i][j] = dp[i - 1][j - 1]',
        '                else:',
        '                    dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + 1',
        '        return dp[m][n]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：两个字符串的删除操作。',
        2: '获取两个单词长度。',
        3: '开辟二维状态矩阵 dp[m+1][n+1]。',
        4: '初始化首列：word2 为空时需连续删除 word1 前 i 个字符。',
        5: '初始化首行：word1 为空时需连续删除 word2 前 j 个字符。',
        6: '双层循环递推。',
        8: '字符相同：直接继承左上方状态 dp[i-1][j-1]（无需任何删除）。',
        10: '字符不同：从删 word1[i-1] (dp[i-1][j]) 与 删 word2[j-1] (dp[i][j-1]) 取较小值加 1。',
        14: '返回 dp[m][n]。',
      },
      java: {
        2: '函数入口。',
        4: '定义二维数组。',
        5: '初始化边界行列。',
        7: '循环遍历。',
        10: '相等零代价转移。',
        12: '不等单向删除转移。',
        16: '返回答案。',
      },
      cpp: {
        3: '函数入口。',
        5: '初始化 dp 向量。',
        6: '边界初始化。',
        8: '双层遍历。',
        10: '字符匹配。',
        12: '删除取 min+1。',
        17: '返回结果。',
      },
      python: {
        2: '函数入口。',
        4: '列表初始化。',
        5: '边界初始化。',
        7: '双层循环。',
        9: '字符相同。',
        11: '字符不同取 min+1。',
        12: '返回结果。',
      },
    },
    keyPoints: {
      title: '🎯 两个字符串的删除操作 5 步法系统精讲',
      summary: 'LeetCode 583。编辑距离的简化版（只允许删除操作）。核心在于：相同字符零代价直接继承，不同字符在删 word1 与删 word2 之间取最小值加 1。',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i][j]</code>：使 <code>word1[0..i-1]</code> 与 <code>word2[0..j-1]</code> 相同所需的最少删除次数。', icon: '🎯', badge: '最少删除数' },
        { label: '二、状态转移方程', desc: '• <code>word1[i-1] === word2[j-1]</code>：<code>dp[i][j] = dp[i-1][j-1]</code><br>• <code>word1[i-1] !== word2[j-1]</code>：<code>dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + 1</code>', icon: '⚡', badge: '双分支转移' },
        { label: '三、初始化', desc: '<code>dp[i][0] = i</code>，<code>dp[0][j] = j</code>（与空串匹配必须全部删除）。', icon: '🎬', badge: '线性边界' },
        { label: '四、时空复杂度', desc: '• 时间复杂度：<code>O(m × n)</code>。<br>• 空间复杂度：<code>O(m × n)</code>。', icon: '⏱️', badge: 'O(mn)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let word1 = 'sea';
    let word2 = 'eat';

    if (typeof input === 'object' && input) {
      if (typeof input.word1 === 'string') word1 = input.word1;
      else if (typeof input.s === 'string') word1 = input.s;

      if (typeof input.word2 === 'string') word2 = input.word2;
      else if (typeof input.t === 'string') word2 = input.t;
    }

    const m = word1.length;
    const n = word2.length;
    const dp: DpCell[][] = Array.from({ length: m + 1 }, () =>
      Array.from({ length: n + 1 }, () => 0)
    );

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      j?: number | string;
      c1?: string;
      c2?: string;
      curDp?: DpCell | number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const ch1 = opts.c1 ?? '-';
      const ch2 = opts.c2 ?? '-';
      const cur = opts.curDp ?? (dp[m][n] as number);
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'word1', value: word1, type: 'string' as const, changed: chSet.has('w1') },
        { name: 'word2', value: word2, type: 'string' as const, changed: chSet.has('w2') },
        { name: 'i (word1前缀)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'word1[i-1]', value: ch1, type: 'string' as const, changed: chSet.has('c1') },
        { name: 'j (word2前缀)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 'word2[j-1]', value: ch2, type: 'string' as const, changed: chSet.has('c2') },
        { name: 'dp[i][j] (最少删除步数)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dp') },
      ];
    };

    // Step 0: Entry
    push({
      dp2d: clone2d(dp),
      source: [...word1.split(''), '|', ...word2.split('')],
      message: `🎯 函数入口：两个字符串的删除操作。word1: "${word1}"，word2: "${word2}"。`,
      log: `entry: m=${m}, n=${n}`,
      vars: makeVars({ changed: ['w1', 'w2'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const c1 = word1[i - 1];
        const c2 = word2[j - 1];
        if (c1 === c2) {
          const next = dp[i - 1][j - 1] as number;
          dp[i][j] = next;

          push({
            dp2d: clone2d(dp),
            source: [...word1.split(''), '|', ...word2.split('')],
            current: { row: i, col: j },
            dependencies: [{ row: i - 1, col: j - 1 }],
            formula: `'${c1}' == '${c2}' => dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${next}`,
            message: `✨ 字符匹配：word1[${i - 1}] 与 word2[${j - 1}] 均为 '${c1}'，无需任何删除操作，直接继承 ${next}。`,
            log: `match: dp[${i}][${j}] = ${next}`,
            vars: makeVars({ i, j, c1, c2, curDp: next, changed: ['i', 'j', 'c1', 'c2', 'dp'] }),
            codeLine: {
              java: { primary: 11, context: [9, 10] },
              cpp: { primary: 11, context: [9, 10] },
              python: { primary: 9, context: [7, 8] },
              javascript: { primary: 8, context: [6, 7] },
            },
          });
        } else {
          const del1 = dp[i - 1][j] as number;
          const del2 = dp[i][j - 1] as number;
          const best = Math.min(del1, del2) + 1;
          dp[i][j] = best;

          push({
            dp2d: clone2d(dp),
            source: [...word1.split(''), '|', ...word2.split('')],
            current: { row: i, col: j },
            dependencies: [{ row: i - 1, col: j }, { row: i, col: j - 1 }],
            formula: `'${c1}' != '${c2}' => min(删word1:${del1}, 删word2:${del2}) + 1 = ${best}`,
            message: `🗑️ 字符不同 ('${c1}' != '${c2}')：取【删 word1[${i - 1}] (${del1})】与【删 word2[${j - 1}] (${del2})】的最小值加 1 $\rightarrow$ dp[${i}][${j}] = ${best}。`,
            log: `delete: dp[${i}][${j}] = ${best}`,
            vars: makeVars({ i, j, c1, c2, curDp: best, changed: ['i', 'j', 'c1', 'c2', 'dp'] }),
            codeLine: {
              java: { primary: 13, context: [9, 10] },
              cpp: { primary: 13, context: [9, 10] },
              python: { primary: 11, context: [7, 8] },
              javascript: { primary: 10, context: [6, 7] },
            },
          });
        }
      }
    }

    const finalAns = dp[m][n] as number;
    push({
      dp2d: clone2d(dp),
      source: [...word1.split(''), '|', ...word2.split('')],
      message: `🏁 算法结束：使两个字符串相同的最少删除次数为 dp[${m}][${n}] = ${finalAns}。`,
      log: `return: dp[${m}][${n}] = ${finalAns}`,
      vars: makeVars({ curDp: finalAns, changed: ['dp'] }),
      codeLine: { java: 17, cpp: 17, python: 12, javascript: 14 },
    });

    return steps;
  },
};
