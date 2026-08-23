import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const DistinctSubsequencesSpec: AlgorithmSpec = {
  id: 'distinct-sub',
  name: '不同的子序列 (Distinct Subsequences)',
  category: '子序列 DP',
  description: '给定字符串 s 和 t ，计算在 s 的子序列中 t 出现的个数。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 115,
    leetcodeUrl: 'https://leetcode.cn/problems/distinct-subsequences/',
    difficulty: 'hard',
    tags: ['字符串', '动态规划'],
    description: '给你两个字符串 <code>s</code> 和 <code>t</code> ，统计并返回在 <code>s</code> 的 <strong>子序列</strong> 中 <code>t</code> 出现的个数。<br/><br/>题目数据保证答案符合 32 位带符号整数范围。',
    examples: [
      {
        input: 's = "rabbbit", t = "rabbit"',
        output: '3',
        explanation: '有 3 种可以从 s 中得到 "rabbit" 的方案：<br/>1. <u>rabb</u>b<u>it</u><br/>2. <u>rab</u>b<u>bit</u><br/>3. <u>ra</u>b<u>bbit</u>',
      },
      {
        input: 's = "babgbag", t = "bag"',
        output: '5',
        explanation: '有 5 种可以从 s 中得到 "bag" 的方案。',
      },
    ],
    constraints: [
      '1 <= s.length, t.length <= 1000',
      's 和 t 由英文字母组成',
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
        'function numDistinct(s, t) {',
        '    const m = s.length, n = t.length;',
        '    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));',
        '    for (let i = 0; i <= m; i++) dp[i][0] = 1; // t 为空串，必有 1 种选法',
        '    for (let i = 1; i <= m; i++) {',
        '        for (let j = 1; j <= n; j++) {',
        '            if (s[i - 1] === t[j - 1]) {',
        '                dp[i][j] = dp[i - 1][j - 1] + dp[i - 1][j]; // 用 s[i-1] 匹配 + 不用 s[i-1] 匹配',
        '            } else {',
        '                dp[i][j] = dp[i - 1][j]; // 只能不用 s[i-1]',
        '            }',
        '        }',
        '    }',
        '    return dp[m][n];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int numDistinct(String s, String t) {',
        '        int m = s.length(), n = t.length();',
        '        int[][] dp = new int[m + 1][n + 1];',
        '        for (int i = 0; i <= m; i++) dp[i][0] = 1;',
        '        for (int i = 1; i <= m; i++) {',
        '            for (int j = 1; j <= n; j++) {',
        '                if (s.charAt(i - 1) == t.charAt(j - 1)) {',
        '                    dp[i][j] = dp[i - 1][j - 1] + dp[i - 1][j];',
        '                } else {',
        '                    dp[i][j] = dp[i - 1][j];',
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
        '    int numDistinct(string s, string t) {',
        '        int m = s.size(), n = t.size();',
        '        vector<vector<unsigned long long>> dp(m + 1, vector<unsigned long long>(n + 1, 0));',
        '        for (int i = 0; i <= m; i++) dp[i][0] = 1;',
        '        for (int i = 1; i <= m; i++) {',
        '            for (int j = 1; j <= n; j++) {',
        '                if (s[i - 1] == t[j - 1]) {',
        '                    dp[i][j] = dp[i - 1][j - 1] + dp[i - 1][j];',
        '                } else {',
        '                    dp[i][j] = dp[i - 1][j];',
        '                }',
        '            }',
        '        }',
        '        return dp[m][n];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def numDistinct(self, s: str, t: str) -> int:',
        '        m, n = len(s), len(t)',
        '        dp = [[0] * (n + 1) for _ in range(m + 1)]',
        '        for i in range(m + 1): dp[i][0] = 1',
        '        for i in range(1, m + 1):',
        '            for j in range(1, n + 1):',
        '                if s[i - 1] == t[j - 1]:',
        '                    dp[i][j] = dp[i - 1][j - 1] + dp[i - 1][j]',
        '                else:',
        '                    dp[i][j] = dp[i - 1][j]',
        '        return dp[m][n]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：计算在 s 的子序列中 t 出现的不同方案总数。',
        2: '获取规模：m 为 s 长度，n 为 t 长度。',
        3: '开辟二维状态表 dp[m+1][n+1]。',
        4: '第一列初始化：当 t 为空串时，从 s[0..i-1] 删除所有字符即可得到 1 种空串匹配方案，故 dp[i][0] = 1。',
        5: '外层循环遍历 s 前缀。',
        6: '内层循环遍历 t 前缀。',
        7: '字符比对：检查 s[i-1] 是否与 t[j-1] 相同。',
        8: '字符相同：包含【用 s[i-1] 匹配: dp[i-1][j-1]】和【不用 s[i-1] 匹配: dp[i-1][j]】两种方案之和。',
        10: '字符不同：不能用 s[i-1] 匹配，方案数等于 dp[i-1][j]。',
        14: '返回答案：dp[m][n] 即为全部不同子序列方案数。',
      },
      java: {
        2: '函数入口：计算不同子序列出现方案数。',
        3: '获取长度。',
        4: '开辟网格。',
        5: '第一列初始化为 1。',
        6: '外层遍历 s。',
        7: '内层遍历 t。',
        8: '字符相同：dp[i][j] = dp[i-1][j-1] + dp[i-1][j]。',
        10: '字符不同：dp[i][j] = dp[i-1][j]。',
        14: '返回 dp[m][n]。',
      },
      cpp: {
        3: '函数入口。',
        4: '获取长度。',
        5: '初始化 dp 表。',
        6: '列初始化。',
        7: '外层循环。',
        8: '内层循环。',
        9: '字符匹配转移（加和）。',
        11: '字符不匹配转移。',
        14: '返回答案。',
      },
      python: {
        2: '函数入口。',
        3: '获取长度。',
        4: '初始化二维列表。',
        5: '第一列初始化为 1。',
        6: '外层循环。',
        7: '内层循环。',
        8: '字符匹配。',
        10: '字符不匹配。',
        12: '返回 dp[m][n]。',
      },
    },
    keyPoints: {
      title: '🎯 不同的子序列 (Distinct Subsequences) 5 步法要点',
      summary: 'LeetCode 115 困难题。双串计数型 DP。核心在于当字符相同时，要将「用当前字符匹配」与「不用当前字符匹配」的方案数相加！',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i][j]</code>：表示 <code>s[0..i-1]</code> 的子序列中出现 <code>t[0..j-1]</code> 的不同组合种数。', icon: '🎯', badge: '计数型状态' },
        { label: '二、状态转移方程 (核心要点)', desc: '• <code>s[i-1] == t[j-1]</code>：<code>dp[i][j] = dp[i-1][j-1] + dp[i-1][j]</code>（用 s[i-1] 匹配 + 不用 s[i-1] 匹配）。<br>• <code>s[i-1] != t[j-1]</code>：<code>dp[i][j] = dp[i-1][j]</code>（只能不用 s[i-1] 匹配）。', icon: '⚡', badge: '两分支求和' },
        { label: '三、初始化与边界条件', desc: '• <code>dp[i][0] = 1</code>：t 为空串时必有 1 种删除全空匹配方案。<br>• <code>dp[0][j] = 0 (j>0)</code>：s 为空但 t 非空时方案数为 0。', icon: '🎬', badge: '第一列为 1' },
        { label: '四、遍历推导顺序', desc: '从左上到右下正序双层递推。', icon: '🧭', badge: '左上到右下' },
        { label: '五、复杂度分析', desc: '• 时间复杂度：<code>O(m × n)</code>。<br>• 空间复杂度：<code>O(m × n)</code>。', icon: '⏱️', badge: 'O(m*n)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    const s1 = typeof input === 'object' && input ? (input.s || 'rabbbit') : 'rabbbit';
    const s2 = typeof input === 'object' && input ? (input.t || 'rabbit') : 'rabbit';

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
      c1?: string;
      c2?: string;
      curDp?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const c1 = opts.c1 ?? '-';
      const c2 = opts.c2 ?? '-';
      const cur = opts.curDp ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 's (源字符串)', value: `"${s1}"`, type: 'string' as const, changed: chSet.has('s') },
        { name: 't (目标匹配串)', value: `"${s2}"`, type: 'string' as const, changed: chSet.has('t') },
        { name: 'm (s 长度)', value: String(m), type: 'number' as const, changed: chSet.has('m') },
        { name: 'n (t 长度)', value: String(n), type: 'number' as const, changed: chSet.has('n') },
        { name: 'i (当前索引1)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'j (当前索引2)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 's[i-1]', value: c1 === '-' ? '-' : `'${c1}'`, type: 'string' as const, changed: chSet.has('c1') },
        { name: 't[j-1]', value: c2 === '-' ? '-' : `'${c2}'`, type: 'string' as const, changed: chSet.has('c2') },
        { name: 'dp[i][j]', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpij') },
      ];
    };

    // Step 0: Entry
    push({
      dp2d: clone2d(dp),
      source: s1.split(''),
      target: s2.split(''),
      message: `🎯 函数入口：计算在 s = "${s1}" 的子序列中 t = "${s2}" 出现的总方案数。`,
      log: `entry: s="${s1}", t="${s2}"`,
      vars: makeVars({ changed: ['s', 't', 'm', 'n'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    // Step 1: Boundaries (first col = 1, first row = 0 except [0][0])
    for (let i = 0; i <= m; i++) dp[i][0] = 1;
    for (let j = 1; j <= n; j++) dp[0][j] = 0;

    push({
      dp2d: clone2d(dp),
      source: s1.split(''),
      target: s2.split(''),
      message: '🎬 边界初始化：当目标 t 为空串时，从 s[0..i-1] 均有 1 种全删方案匹配空串 (dp[i][0] = 1)。',
      log: 'init: dp[i][0]=1, dp[0][j]=0',
      vars: makeVars({ changed: ['dpij'] }),
      codeLine: { java: 4, cpp: 4, python: 4, javascript: 3 },
    });

    // Loops
    for (let i = 1; i <= m; i++) {
      const char1 = s1[i - 1];

      push({
        dp2d: clone2d(dp),
        source: s1.split(''),
        target: s2.split(''),
        current: { row: i, col: 0 },
        message: `🔄 外层循环：i = ${i}，考察 s[${i - 1}] = '${char1}' (前缀 "${s1.slice(0, i)}")。`,
        log: `outer loop: i=${i}, char1='${char1}'`,
        vars: makeVars({ i, c1: char1, changed: ['i', 'c1'] }),
        codeLine: { java: 5, cpp: 5, python: 5, javascript: 4 },
      });

      for (let j = 1; j <= n; j++) {
        const char2 = s2[j - 1];
        const isMatch = char1 === char2;

        push({
          dp2d: clone2d(dp),
          source: s1.split(''),
          target: s2.split(''),
          current: { row: i, col: j },
          dependencies: isMatch
            ? [{ row: i - 1, col: j - 1 }, { row: i - 1, col: j }]
            : [{ row: i - 1, col: j }],
          message: isMatch
            ? `🔍 比对字符：s[${i - 1}] ('${char1}') === t[${j - 1}] ('${char2}') 【字符匹配，两分支方案相加】！`
            : `🔍 比对字符：s[${i - 1}] ('${char1}') !== t[${j - 1}] ('${char2}') 【不匹配，只能不用 s[${i - 1}]】。`,
          log: `compare: s[${i-1}]='${char1}', t[${j-1}]='${char2}'`,
          vars: makeVars({ i, j, c1: char1, c2: char2, changed: ['j', 'c2'] }),
          codeLine: {
            java: { primary: 7, context: [5, 6] },
            cpp: { primary: 7, context: [5, 6] },
            python: { primary: 6, context: [5] },
            javascript: { primary: 6, context: [4, 5] },
          },
        });

        let resultVal: number;
        if (isMatch) {
          const diag = (dp[i - 1][j - 1] as number) || 0; // 用 s[i-1] 匹配
          const up = (dp[i - 1][j] as number) || 0;       // 不用 s[i-1] 匹配
          resultVal = diag + up;
          dp[i][j] = resultVal;

          push({
            dp2d: clone2d(dp),
            source: s1.split(''),
            target: s2.split(''),
            current: { row: i, col: j },
            dependencies: [{ row: i - 1, col: j - 1 }, { row: i - 1, col: j }],
            formula: `dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + dp[${i - 1}][${j}] = ${diag} + ${up} = ${resultVal}`,
            message: `⚡ 状态转移 (匹配)：【用 s[${i - 1}] 匹配方案 (${diag})】+ 【不用 s[${i - 1}] 方案 (${up})】= ${resultVal} 种方案。`,
            log: `match update: dp[${i}][${j}] = ${resultVal}`,
            vars: makeVars({ i, j, c1: char1, c2: char2, curDp: resultVal, changed: ['dpij'] }),
            codeLine: {
              java: { primary: 8, context: [5, 6] },
              cpp: { primary: 8, context: [5, 6] },
              python: { primary: 7, context: [5] },
              javascript: { primary: 7, context: [4, 5] },
            },
          });
        } else {
          const up = (dp[i - 1][j] as number) || 0;
          resultVal = up;
          dp[i][j] = resultVal;

          push({
            dp2d: clone2d(dp),
            source: s1.split(''),
            target: s2.split(''),
            current: { row: i, col: j },
            dependencies: [{ row: i - 1, col: j }],
            formula: `dp[${i}][${j}] = dp[${i - 1}][${j}] = ${up}`,
            message: `⚡ 状态转移 (不匹配)：继承上方不用当前字符的方案数 dp[${i - 1}][${j}] = ${up}。`,
            log: `nomatch update: dp[${i}][${j}] = ${resultVal}`,
            vars: makeVars({ i, j, c1: char1, c2: char2, curDp: resultVal, changed: ['dpij'] }),
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

    const ans = dp[m][n] as number;
    push({
      dp2d: clone2d(dp),
      source: s1.split(''),
      target: s2.split(''),
      current: { row: m, col: n },
      message: `🏁 算法结束：返回在 "${s1}" 的子序列中出现 "${s2}" 的不同方案总数 dp[${m}][${n}] = ${ans} 种。`,
      log: `return: dp[${m}][${n}]=${ans}`,
      vars: makeVars({ curDp: ans, changed: ['dpij'] }),
      codeLine: { java: 14, cpp: 14, python: 12, javascript: 13 },
    });

    return steps;
  },
};
