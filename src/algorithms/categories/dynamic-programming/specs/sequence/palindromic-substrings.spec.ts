import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const PalindromicSubstringsSpec: AlgorithmSpec = {
  id: 'pal-count',
  name: '回文子串 (Palindromic Substrings)',
  category: '子序列 DP',
  description: '给你一个字符串 s，请你统计并返回这个字符串中回文子串的数目。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 647,
    leetcodeUrl: 'https://leetcode.cn/problems/palindromic-substrings/',
    difficulty: 'medium',
    tags: ['双指针', '字符串', '动态规划'],
    description: '给你一个字符串 <code>s</code> ，请你统计并返回这个字符串中 <strong>回文子串</strong> 的数目。<br/><br/><strong>回文字符串</strong> 是正着读和倒过来读一样的字符串。<br/><br/><strong>子字符串</strong> 是字符串中的由连续字符组成的一个序列。<br/><br/>具有不同开始位置或结束位置的子串，即使是由相同的字符组成，也会被视作不同的子串。',
    examples: [
      {
        input: 's = "abc"',
        output: '3',
        explanation: '三个回文子串: "a", "b", "c"',
      },
      {
        input: 's = "aaa"',
        output: '6',
        explanation: '6个回文子串: "a", "a", "a", "aa", "aa", "aaa"',
      },
    ],
    constraints: [
      '1 <= s.length <= 1000',
      's 由小写英文字母组成',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: 4, cpp: 4, python: 4, javascript: 3 },
    loopCheck: { java: 5, cpp: 5, python: 5, javascript: 4 },
    innerLoopCheck: { java: 6, cpp: 6, python: 6, javascript: 5 },
    stateTransfer: {
      java: { primary: [8, 9], context: [5, 6] },
      cpp: { primary: [8, 9], context: [5, 6] },
      python: { primary: [8, 9], context: [5, 6] },
      javascript: { primary: [7, 8], context: [4, 5] },
    },
    loopExit: { java: 5, cpp: 5, python: 5, javascript: 4 },
    returnResult: { java: 14, cpp: 14, python: 11, javascript: 13 },
  },
  code: {
    languages: {
      javascript: [
        'function countSubstrings(s) {',
        '    const n = s.length;',
        '    let count = 0;',
        '    const dp = Array.from({ length: n }, () => new Array(n).fill(false));',
        '    for (let i = n - 1; i >= 0; i--) { // 倒序遍历左端点',
        '        for (let j = i; j < n; j++) {   // 正序遍历右端点',
        '            if (s[i] === s[j]) {',
        '                if (j - i <= 1 || dp[i + 1][j - 1]) {',
        '                    dp[i][j] = true;',
        '                    count++;',
        '                }',
        '            }',
        '        }',
        '    }',
        '    return count;',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int countSubstrings(String s) {',
        '        int n = s.length(), count = 0;',
        '        boolean[][] dp = new boolean[n][n];',
        '        for (int i = n - 1; i >= 0; i--) {',
        '            for (int j = i; j < n; j++) {',
        '                if (s.charAt(i) == s.charAt(j)) {',
        '                    if (j - i <= 1 || dp[i + 1][j - 1]) {',
        '                        dp[i][j] = true;',
        '                        count++;',
        '                    }',
        '                }',
        '            }',
        '        }',
        '        return count;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int countSubstrings(string s) {',
        '        int n = s.size(), count = 0;',
        '        vector<vector<bool>> dp(n, vector<bool>(n, false));',
        '        for (int i = n - 1; i >= 0; i--) {',
        '            for (int j = i; j < n; j++) {',
        '                if (s[i] == s[j]) {',
        '                    if (j - i <= 1 || dp[i + 1][j - 1]) {',
        '                        dp[i][j] = true;',
        '                        count++;',
        '                    }',
        '                }',
        '            }',
        '        }',
        '        return count;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def countSubstrings(self, s: str) -> int:',
        '        n, count = len(s), 0',
        '        dp = [[False] * n for _ in range(n)]',
        '        for i in range(n - 1, -1, -1):',
        '            for j in range(i, n):',
        '                if s[i] == s[j]:',
        '                    if j - i <= 1 or dp[i + 1][j - 1]:',
        '                        dp[i][j] = True',
        '                        count += 1',
        '        return count',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：传入字符串 s，统计其中回文子串的总数目。',
        2: '获取规模：n 为字符串长度。',
        3: '开辟二维布尔状态表 dp[n][n]，dp[i][j] 表示区间 s[i..j] 是否是回文串。',
        4: '外层倒序循环：i 从 n-1 到 0 倒序遍历左端点，保证依赖的 dp[i+1][j-1] 已先算好。',
        5: '内层正序循环：j 从 i 到 n-1 正序遍历右端点。',
        6: '两端字符比对：判断两端字符 s[i] 与 s[j] 是否相同。',
        7: '回文条件判定：若长度 <= 2 (j-i<=1) 或内层子串是回文 (dp[i+1][j-1])，则 s[i..j] 是回文串。',
        8: '记录状态与计数：dp[i][j] = true，同时回文计数 count 累加 1。',
        13: '返回全局计数：返回统计出的所有回文子串总数 count。',
      },
      java: {
        2: '函数入口：统计字符串 s 中回文子串的总数目。',
        3: '定义变量与布尔 DP 表。',
        4: '外层循环：i 倒序遍历区间左端点。',
        5: '内层循环：j 正序遍历区间右端点。',
        6: '比对两端字符 s.charAt(i) 与 s.charAt(j)。',
        7: '回文判断：单字符/双字符或内层子串为回文。',
        8: '标记 dp[i][j] = true，并累加 count。',
        14: '返回回文子串总数 count。',
      },
      cpp: {
        3: '函数入口：计算回文子串数量。',
        4: '初始化状态表与计数器。',
        5: '倒序遍历左端点 i。',
        6: '正序遍历右端点 j。',
        7: '判断两端字符是否相等。',
        8: '满足回文条件则更新 dp 并增加计数。',
        14: '返回 count。',
      },
      python: {
        2: '函数入口：统计回文子串数。',
        3: '初始化二维布尔列表。',
        4: '倒序遍历 i。',
        5: '正序遍历 j。',
        6: '比对 s[i] 与 s[j]。',
        7: '转移判定回文。',
        11: '返回 count。',
      },
    },
    keyPoints: {
      title: '🎯 回文子串 (Palindromic Substrings) 5 步法要点',
      summary: 'LeetCode 647。区间型动态规划。由于 dp[i][j] 依赖左下方的 dp[i+1][j-1]，遍历顺序必须 i 倒序、j 正序！',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i][j]</code>：布尔值，表示闭区间子串 <code>s[i..j]</code> 是否为回文串。', icon: '🎯', badge: '布尔区间状态' },
        { label: '二、状态转移方程', desc: '• 若 <code>s[i] != s[j]</code>：<code>dp[i][j] = false</code>。<br>• 若 <code>s[i] == s[j]</code>：<br>  - <code>j - i <= 1</code>（单字符或相邻同字符）：<code>dp[i][j] = true</code>；<br>  - <code>j - i > 1</code>：<code>dp[i][j] = dp[i+1][j-1]</code>（取决于内部子串）。', icon: '⚡', badge: '两端匹配看内层' },
        { label: '三、初始化与边界', desc: '全表默认初始化为 <code>false</code>。', icon: '🎬', badge: '默认 false' },
        { label: '四、遍历推导顺序 (极其关键)', desc: '由于 <code>dp[i][j]</code> 依赖其左下方 <code>dp[i+1][j-1]</code>，必须从下往上（<code>i 倒序</code>）、从左往右（<code>j 正序</code>）推导！', icon: '🧭', badge: 'i 倒序 / j 正序' },
        { label: '五、复杂度分析', desc: '• 时间复杂度：<code>O(n²)</code>。<br>• 空间复杂度：<code>O(n²)</code>。', icon: '⏱️', badge: 'O(n²)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    const s = typeof input === 'object' && input ? (input.s || 'aaa') : 'aaa';
    const n = s.length;
    const dp: DpCell[][] = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => '-')
    );

    let count = 0;
    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      j?: number | string;
      c1?: string;
      c2?: string;
      curDp?: boolean | string;
      curCount?: number;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const c1 = opts.c1 ?? '-';
      const c2 = opts.c2 ?? '-';
      const cur = opts.curDp ?? '-';
      const cnt = opts.curCount ?? count;
      const chSet = new Set(opts.changed || []);

      return [
        { name: 's (输入字符串)', value: `"${s}"`, type: 'string' as const, changed: chSet.has('s') },
        { name: 'n (长度)', value: String(n), type: 'number' as const, changed: chSet.has('n') },
        { name: 'count (回文总数)', value: String(cnt), type: 'number' as const, changed: chSet.has('count') },
        { name: 'i (左端点)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'j (右端点)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 's[i]', value: c1 === '-' ? '-' : `'${c1}'`, type: 'string' as const, changed: chSet.has('c1') },
        { name: 's[j]', value: c2 === '-' ? '-' : `'${c2}'`, type: 'string' as const, changed: chSet.has('c2') },
        { name: 'dp[i][j]', value: String(cur), type: (typeof cur === 'boolean' ? 'boolean' : 'string') as any, changed: chSet.has('dpij') },
      ];
    };

    // Step 0: Function entry
    push({
      dp2d: clone2d(dp),
      source: s.split(''),
      message: `🎯 函数入口：统计字符串 s = "${s}" 中所有回文子串的数目。`,
      log: `entry: s="${s}"`,
      vars: makeVars({ changed: ['s', 'n', 'count'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    // Loops (i backwards from n-1 to 0, j from i to n-1)
    for (let i = n - 1; i >= 0; i--) {
      const charI = s[i];

      // Loop Check outer
      push({
        dp2d: clone2d(dp),
        source: s.split(''),
        current: { row: i, col: i },
        message: `🔄 外层倒序循环：左端点 i = ${i} ('${charI}')，从右往左推进以满足状态依赖。`,
        log: `outer loop: i=${i}`,
        vars: makeVars({ i, c1: charI, changed: ['i', 'c1'] }),
        codeLine: { java: 4, cpp: 4, python: 4, javascript: 4 },
      });

      for (let j = i; j < n; j++) {
        const charJ = s[j];
        const sameChar = charI === charJ;
        const len = j - i + 1;
        const sub = s.slice(i, j + 1);

        // Inner Loop check & compare
        push({
          dp2d: clone2d(dp),
          source: s.split(''),
          current: { row: i, col: j },
          dependencies: (sameChar && len > 2) ? [{ row: i + 1, col: j - 1 }] : [],
          message: `🔍 考察区间 [${i}..${j}] ("${sub}")：两端字符 s[${i}] ('${charI}') 与 s[${j}] ('${charJ}') ${sameChar ? '相同 ✓' : '不同 ✗'}。`,
          log: `compare: s[${i}]='${charI}', s[${j}]='${charJ}'`,
          vars: makeVars({ i, j, c1: charI, c2: charJ, changed: ['j', 'c2'] }),
          codeLine: { java: 6, cpp: 6, python: 6, javascript: 6 },
        });

        // State Transfer
        let isPal = false;
        if (sameChar) {
          if (len <= 2) {
            isPal = true;
          } else {
            isPal = dp[i + 1][j - 1] === 1 || dp[i + 1][j - 1] === '1' || dp[i + 1][j - 1] === 'T';
          }
        }

        dp[i][j] = isPal ? 1 : 0;
        if (isPal) count++;

        push({
          dp2d: clone2d(dp),
          source: s.split(''),
          current: { row: i, col: j },
          dependencies: (sameChar && len > 2) ? [{ row: i + 1, col: j - 1 }] : [],
          formula: isPal
            ? (len <= 2 ? `两端相同且长度 <= 2 => dp[${i}][${j}] = true` : `s[${i}]==s[${j}] && dp[${i + 1}][${j - 1}] => dp[${i}][${j}] = true`)
            : `字符不匹配或内层非回文 => dp[${i}][${j}] = false`,
          message: isPal
            ? `🎉 【回文成立】"${sub}" 是回文子串！dp[${i}][${j}] = true，总回文计数 count = ${count}。`
            : `❌ 【非回文】"${sub}" 不是回文子串，dp[${i}][${j}] = false。`,
          log: `update: dp[${i}][${j}]=${isPal}, count=${count}`,
          vars: makeVars({ i, j, c1: charI, c2: charJ, curDp: isPal, curCount: count, changed: isPal ? ['dpij', 'count'] : ['dpij'] }),
          codeLine: {
            java: { primary: isPal ? 8 : 6, context: [4, 5] },
            cpp: { primary: isPal ? 8 : 6, context: [4, 5] },
            python: { primary: isPal ? 8 : 6, context: [4, 5] },
            javascript: { primary: isPal ? 8 : 6, context: [4, 5] },
          },
        });
      }
    }

    // Final Return
    push({
      dp2d: clone2d(dp),
      source: s.split(''),
      message: `🏁 算法结束：返回全局回文子串总数 count = ${count}。`,
      log: `return: count=${count}`,
      vars: makeVars({ curCount: count, changed: ['count'] }),
      codeLine: { java: 14, cpp: 14, python: 11, javascript: 13 },
    });

    return steps;
  },
};
