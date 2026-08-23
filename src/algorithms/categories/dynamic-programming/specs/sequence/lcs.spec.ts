import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const LcsSpec: AlgorithmSpec = {
  id: 'lcs',
  name: '最长公共子序列 (Longest Common Subsequence)',
  category: '子序列 DP',
  description: '给定两个字符串 text1 和 text2，返回这两个字符串的最长公共子序列的长度。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 1143,
    leetcodeUrl: 'https://leetcode.cn/problems/longest-common-subsequence/',
    difficulty: 'medium',
    tags: ['字符串', '动态规划', '二维DP'],
    description: '给定两个字符串 <code>text1</code> 和 <code>text2</code>，返回这两个字符串的最长 <strong>公共子序列</strong> 的长度。如果不存在 <strong>公共子序列</strong> ，返回 <code>0</code> 。<br/><br/>一个字符串的 <strong>子序列</strong> 是指这样一个新的字符串：它是由原字符串在不改变字符相对顺序的情况下删除某些字符（也可以不删除任何字符）后组成的新字符串。<br/><br/>例如，<code>"ace"</code> 是 <code>"abcde"</code> 的子序列，但 <code>"aec"</code> 不是 <code>"abcde"</code> 的子序列。两个字符串的 <strong>公共子序列</strong> 是这两个字符串所共同拥有的子序列。',
    examples: [
      {
        input: 'text1 = "abcde", text2 = "ace"',
        output: '3',
        explanation: '最长公共子序列是 "ace" ，它的长度为 3 。',
      },
      {
        input: 'text1 = "abc", text2 = "abc"',
        output: '3',
        explanation: '最长公共子序列是 "abc" ，它的长度为 3 。',
      },
      {
        input: 'text1 = "abc", text2 = "def"',
        output: '0',
        explanation: '两个字符串没有公共子序列，返回 0 。',
      },
    ],
    constraints: [
      '1 <= text1.length, text2.length <= 1000',
      'text1 和 text2 仅由小写英文字符组成。',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: 4, cpp: 4, python: 4, javascript: 3 },
    loopCheck: { java: 5, cpp: 5, python: 5, javascript: 4 },
    innerLoopCheck: { java: 6, cpp: 6, python: 6, javascript: 5 },
    stateTransfer: {
      java: { primary: [8, 10], context: [5, 6] },
      cpp: { primary: [8, 10], context: [5, 6] },
      python: { primary: [8, 10], context: [5, 6] },
      javascript: { primary: [7, 9], context: [4, 5] },
    },
    loopExit: { java: 5, cpp: 5, python: 5, javascript: 4 },
    returnResult: { java: 14, cpp: 14, python: 12, javascript: 13 },
  },
  code: {
    languages: {
      javascript: [
        'function longestCommonSubsequence(text1, text2) {',
        '    const m = text1.length, n = text2.length;',
        '    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));',
        '    for (let i = 1; i <= m; i++) {',
        '        for (let j = 1; j <= n; j++) {',
        '            if (text1[i - 1] === text2[j - 1]) {',
        '                dp[i][j] = dp[i - 1][j - 1] + 1; // 字符匹配：沿左上角 +1',
        '            } else {',
        '                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]); // 不匹配：取上/左最大',
        '            }',
        '        }',
        '    }',
        '    return dp[m][n];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int longestCommonSubsequence(String text1, String text2) {',
        '        int m = text1.length(), n = text2.length();',
        '        int[][] dp = new int[m + 1][n + 1];',
        '        for (int i = 1; i <= m; i++) {',
        '            for (int j = 1; j <= n; j++) {',
        '                if (text1.charAt(i - 1) == text2.charAt(j - 1)) {',
        '                    dp[i][j] = dp[i - 1][j - 1] + 1;',
        '                } else {',
        '                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);',
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
        '    int longestCommonSubsequence(string text1, string text2) {',
        '        int m = text1.size(), n = text2.size();',
        '        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));',
        '        for (int i = 1; i <= m; i++) {',
        '            for (int j = 1; j <= n; j++) {',
        '                if (text1[i - 1] == text2[j - 1]) {',
        '                    dp[i][j] = dp[i - 1][j - 1] + 1;',
        '                } else {',
        '                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);',
        '                }',
        '            }',
        '        }',
        '        return dp[m][n];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def longestCommonSubsequence(self, text1: str, text2: str) -> int:',
        '        m, n = len(text1), len(text2)',
        '        dp = [[0] * (n + 1) for _ in range(m + 1)]',
        '        for i in range(1, m + 1):',
        '            for j in range(1, n + 1):',
        '                if text1[i - 1] == text2[j - 1]:',
        '                    dp[i][j] = dp[i - 1][j - 1] + 1',
        '                else:',
        '                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])',
        '        return dp[m][n]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：传入两个字符串 text1 和 text2，计算它们的最长公共子序列长度。',
        2: '获取规模：m 为 text1 长度，n 为 text2 长度。',
        3: '开辟二维状态网格：dp[i][j] 存 text1[0..i-1] 与 text2[0..j-1] 的 LCS 长度。',
        4: '外层循环：从 1 到 m 逐一遍历 text1 的每个字符。',
        5: '内层循环：从 1 到 n 逐一遍历 text2 的每个字符。',
        6: '字符比对：判断当前结尾字符 text1[i-1] 与 text2[j-1] 是否相同。',
        7: '字符匹配成功：共同贡献 1 个长度，由左上角状态转移：dp[i][j] = dp[i-1][j-1] + 1。',
        8: '字符不匹配分支。',
        9: '字符不匹配：分别尝试舍弃 text1[i-1] 或 text2[j-1]，取两者最大值：dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])。',
        13: '返回全局最优解：dp[m][n] 即为整个串的最长公共子序列长度。',
      },
      java: {
        2: '函数入口：传入两个字符串 text1 和 text2，计算它们的最长公共子序列长度。',
        3: '获取规模：m 为 text1 长度，n 为 text2 长度。',
        4: '开辟二维状态网格：dp[i][j] 存 text1[0..i-1] 与 text2[0..j-1] 的 LCS 长度。',
        5: '外层循环：从 1 到 m 逐一遍历 text1 的每个字符。',
        6: '内层循环：从 1 到 n 逐一遍历 text2 的每个字符。',
        7: '字符比对：判断当前结尾字符 text1.charAt(i-1) 与 text2.charAt(j-1) 是否相同。',
        8: '字符匹配成功：共同贡献 1 个长度，由左上角状态转移：dp[i][j] = dp[i-1][j-1] + 1。',
        10: '字符不匹配：分别尝试舍弃 text1 结尾或 text2 结尾，取较大者：dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])。',
        14: '返回全局最优解：dp[m][n] 即为整个串的最长公共子序列长度。',
      },
      cpp: {
        3: '函数入口：计算两字符串 text1 和 text2 的最长公共子序列。',
        4: '规模提取：m 和 n 为字符串长度。',
        5: '初始化二维 vector 状态表。',
        6: '外层循环遍历 text1。',
        7: '内层循环遍历 text2。',
        8: '字符相同：dp[i][j] = dp[i-1][j-1] + 1。',
        10: '字符不同：dp[i][j] = max(dp[i-1][j], dp[i][j-1])。',
        14: '返回 dp[m][n]。',
      },
      python: {
        2: '函数入口：计算最长公共子序列 LCS 长度。',
        3: '获取长度 m, n。',
        4: '初始化 (m+1) x (n+1) 的二维列表。',
        5: '遍历 i 从 1 到 m。',
        6: '遍历 j 从 1 到 n。',
        7: '字符相等：dp[i][j] = dp[i-1][j-1] + 1。',
        9: '字符不相等：dp[i][j] = max(dp[i-1][j], dp[i][j-1])。',
        11: '返回 dp[m][n]。',
      },
    },
    keyPoints: {
      title: '🎯 最长公共子序列 (LCS) 5 步法要点',
      summary: 'LeetCode 1143。经典双串二维动态规划。字符相同走对角线 +1，字符不同取上方和左方最大值。',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i][j]</code>：字符串 <code>text1[0..i-1]</code> 与 <code>text2[0..j-1]</code> 的最长公共子序列长度。', icon: '🎯', badge: '双串二维状态' },
        { label: '二、状态转移方程', desc: '• <code>text1[i-1] == text2[j-1]</code>：<code>dp[i][j] = dp[i-1][j-1] + 1</code>（匹配成功，对角线转移）。<br>• <code>text1[i-1] != text2[j-1]</code>：<code>dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])</code>（不匹配，取上/左最大）。', icon: '⚡', badge: '双分支转移' },
        { label: '三、初始化与边界', desc: '<code>dp[i][0] = 0</code> 且 <code>dp[0][j] = 0</code>：任何字符串与空串的公共子序列长度均为 0。', icon: '🎬', badge: '空串边界为 0' },
        { label: '四、遍历推导顺序', desc: '双层正序循环：从左到右、从上到下填充网格。', icon: '🧭', badge: '从左上到右下' },
        { label: '五、复杂度分析', desc: '• 时间复杂度：<code>O(m × n)</code>。<br>• 空间复杂度：<code>O(m × n)</code>，可滚动数组优化至 <code>O(min(m, n))</code>。', icon: '⏱️', badge: 'O(m*n)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    const s1 = typeof input === 'object' && input ? (input.s || input.text1 || 'abcde') : 'abcde';
    const s2 = typeof input === 'object' && input ? (input.t || input.text2 || 'ace') : 'ace';

    const m = s1.length;
    const n = s2.length;
    const dp: DpCell[][] = Array.from({ length: m + 1 }, () =>
      Array.from({ length: n + 1 }, () => '-')
    );

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      j?: number | string;
      char1?: string;
      char2?: string;
      curDp?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const c1 = opts.char1 ?? '-';
      const c2 = opts.char2 ?? '-';
      const cur = opts.curDp ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'text1', value: `"${s1}"`, type: 'string' as const, changed: chSet.has('text1') },
        { name: 'text2', value: `"${s2}"`, type: 'string' as const, changed: chSet.has('text2') },
        { name: 'm (长度1)', value: String(m), type: 'number' as const, changed: chSet.has('m') },
        { name: 'n (长度2)', value: String(n), type: 'number' as const, changed: chSet.has('n') },
        { name: 'i (当前索引1)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'j (当前索引2)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 'text1[i-1]', value: c1 === '-' ? '-' : `'${c1}'`, type: 'string' as const, changed: chSet.has('c1') },
        { name: 'text2[j-1]', value: c2 === '-' ? '-' : `'${c2}'`, type: 'string' as const, changed: chSet.has('c2') },
        { name: 'dp[i][j]', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpij') },
      ];
    };

    // Step 0: Function entry
    push({
      dp2d: clone2d(dp),
      source: s1.split(''),
      target: s2.split(''),
      message: `🎯 函数入口：计算 text1 = "${s1}" 与 text2 = "${s2}" 的最长公共子序列 (LCS)。`,
      log: `entry: text1="${s1}", text2="${s2}"`,
      vars: makeVars({ changed: ['text1', 'text2', 'm', 'n'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    // Step 1: Initialize boundaries
    for (let i = 0; i <= m; i++) dp[i][0] = 0;
    for (let j = 0; j <= n; j++) dp[0][j] = 0;

    push({
      dp2d: clone2d(dp),
      source: s1.split(''),
      target: s2.split(''),
      message: '🎬 边界初始化：空前缀与任何字符串的公共子序列长度均为 0 (dp[i][0] = 0, dp[0][j] = 0)。',
      log: 'init: dp[i][0]=0, dp[0][j]=0',
      vars: makeVars({ changed: ['dpij'] }),
      codeLine: { java: 4, cpp: 4, python: 4, javascript: 3 },
    });

    // Loops
    for (let i = 1; i <= m; i++) {
      const char1 = s1[i - 1];

      // Loop Check outer
      push({
        dp2d: clone2d(dp),
        source: s1.split(''),
        target: s2.split(''),
        current: { row: i, col: 0 },
        message: `🔄 外层循环：i = ${i}，当前考察 text1[${i - 1}] = '${char1}' (前缀 "${s1.slice(0, i)}")。`,
        log: `outer loop: i=${i}, char1='${char1}'`,
        vars: makeVars({ i, char1, changed: ['i', 'c1'] }),
        codeLine: { java: 5, cpp: 5, python: 5, javascript: 4 },
      });

      for (let j = 1; j <= n; j++) {
        const char2 = s2[j - 1];
        const isMatch = char1 === char2;

        // Inner Loop check & compare
        push({
          dp2d: clone2d(dp),
          source: s1.split(''),
          target: s2.split(''),
          current: { row: i, col: j },
          dependencies: isMatch
            ? [{ row: i - 1, col: j - 1 }]
            : [{ row: i - 1, col: j }, { row: i, col: j - 1 }],
          message: isMatch
            ? `🔍 比对字符：text1[${i - 1}] ('${char1}') === text2[${j - 1}] ('${char2}') 【字符匹配 ✓】！`
            : `🔍 比对字符：text1[${i - 1}] ('${char1}') !== text2[${j - 1}] ('${char2}') 【不匹配 ✗】。`,
          log: `compare: text1[${i-1}]='${char1}', text2[${j-1}]='${char2}' => match=${isMatch}`,
          vars: makeVars({ i, j, char1, char2, changed: ['j', 'c2'] }),
          codeLine: {
            java: { primary: 7, context: [5, 6] },
            cpp: { primary: 7, context: [5, 6] },
            python: { primary: 6, context: [5] },
            javascript: { primary: 6, context: [4, 5] },
          },
        });

        // State Transfer
        let resultVal: number;
        if (isMatch) {
          const prev = (dp[i - 1][j - 1] as number) || 0;
          resultVal = prev + 1;
          dp[i][j] = resultVal;

          push({
            dp2d: clone2d(dp),
            source: s1.split(''),
            target: s2.split(''),
            current: { row: i, col: j },
            dependencies: [{ row: i - 1, col: j - 1 }],
            formula: `dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${prev} + 1 = ${resultVal}`,
            message: `⚡ 状态转移 (匹配)：由左上角 dp[${i - 1}][${j - 1}] (${prev}) + 1 = ${resultVal} 写入 dp[${i}][${j}]。`,
            log: `match update: dp[${i}][${j}] = ${resultVal}`,
            vars: makeVars({ i, j, char1, char2, curDp: resultVal, changed: ['dpij'] }),
            codeLine: {
              java: { primary: 8, context: [5, 6] },
              cpp: { primary: 8, context: [5, 6] },
              python: { primary: 7, context: [5] },
              javascript: { primary: 7, context: [4, 5] },
            },
          });
        } else {
          const up = (dp[i - 1][j] as number) || 0;
          const left = (dp[i][j - 1] as number) || 0;
          resultVal = Math.max(up, left);
          dp[i][j] = resultVal;

          push({
            dp2d: clone2d(dp),
            source: s1.split(''),
            target: s2.split(''),
            current: { row: i, col: j },
            dependencies: [{ row: i - 1, col: j }, { row: i, col: j - 1 }],
            formula: `dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = max(${up}, ${left}) = ${resultVal}`,
            message: `⚡ 状态转移 (不匹配)：取上方 dp[${i - 1}][${j}] (${up}) 与左方 dp[${i}][${j - 1}] (${left}) 较大者 = ${resultVal}。`,
            log: `nomatch update: dp[${i}][${j}] = ${resultVal}`,
            vars: makeVars({ i, j, char1, char2, curDp: resultVal, changed: ['dpij'] }),
            codeLine: {
              java: { primary: 10, context: [5, 6] },
              cpp: { primary: 10, context: [5, 6] },
              python: { primary: 9, context: [5] },
              javascript: { primary: 9, context: [4, 5] },
            },
          });
        }
      }
    }

    // Final Return
    const ans = dp[m][n] as number;
    push({
      dp2d: clone2d(dp),
      source: s1.split(''),
      target: s2.split(''),
      current: { row: m, col: n },
      message: `🏁 算法结束：返回全局最优解 dp[${m}][${n}] = ${ans}（"${s1}" 与 "${s2}" 的最长公共子序列长度为 ${ans}）。`,
      log: `return: dp[${m}][${n}]=${ans}`,
      vars: makeVars({ curDp: ans, changed: ['dpij'] }),
      codeLine: { java: 14, cpp: 14, python: 12, javascript: 13 },
    });

    return steps;
  },
};
