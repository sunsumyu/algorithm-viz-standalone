import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const IsSubsequenceSpec: AlgorithmSpec = {
  id: 'is-subseq',
  name: '判断子序列 (Is Subsequence)',
  category: '子序列 DP',
  description: '给定字符串 s 和 t ，判断 s 是否为 t 的子序列。',
  difficulty: 'easy',
  problem: {
    leetcodeId: 392,
    leetcodeUrl: 'https://leetcode.cn/problems/is-subsequence/',
    difficulty: 'easy',
    tags: ['双指针', '字符串', '动态规划'],
    description: '给定字符串 <code>s</code> 和 <code>t</code> ，判断 <code>s</code> 是否为 <code>t</code> 的子序列。<br/><br/>字符串的一个子序列是原始字符串删除一些（也可以不删除）字符而不改变剩余字符相对位置形成的新字符串。（例如，<code>"ace"</code>是<code>"abcde"</code>的一个子序列，而<code>"aec"</code>不是）。',
    examples: [
      {
        input: 's = "abc", t = "ahbgdc"',
        output: 'true',
        explanation: '"abc" 可以通过在 "ahbgdc" 中按顺序选取 \'a\', \'b\', \'c\' 得到。',
      },
      {
        input: 's = "axc", t = "ahbgdc"',
        output: 'false',
        explanation: '在 "ahbgdc" 中找不到 \'x\'，因此不是子序列。',
      },
    ],
    constraints: [
      '0 <= s.length <= 100',
      '0 <= t.length <= 10^4',
      '两个字符串都只由小写字符组成。',
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
        'function isSubsequence(s, t) {',
        '    const m = s.length, n = t.length;',
        '    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));',
        '    for (let i = 1; i <= m; i++) {',
        '        for (let j = 1; j <= n; j++) {',
        '            if (s[i - 1] === t[j - 1]) {',
        '                dp[i][j] = dp[i - 1][j - 1] + 1; // 字符匹配，长度 +1',
        '            } else {',
        '                dp[i][j] = dp[i][j - 1]; // 字符不匹配：跳过 t[j-1]',
        '            }',
        '        }',
        '    }',
        '    return dp[m][n] === m;',
        '}',
      ],
      java: [
        'class Solution {',
        '    public boolean isSubsequence(String s, String t) {',
        '        int m = s.length(), n = t.length();',
        '        int[][] dp = new int[m + 1][n + 1];',
        '        for (int i = 1; i <= m; i++) {',
        '            for (int j = 1; j <= n; j++) {',
        '                if (s.charAt(i - 1) == t.charAt(j - 1)) {',
        '                    dp[i][j] = dp[i - 1][j - 1] + 1;',
        '                } else {',
        '                    dp[i][j] = dp[i][j - 1]; // 只能跳过 t',
        '                }',
        '            }',
        '        }',
        '        return dp[m][n] == m;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    bool isSubsequence(string s, string t) {',
        '        int m = s.size(), n = t.size();',
        '        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));',
        '        for (int i = 1; i <= m; i++) {',
        '            for (int j = 1; j <= n; j++) {',
        '                if (s[i - 1] == t[j - 1]) {',
        '                    dp[i][j] = dp[i - 1][j - 1] + 1;',
        '                } else {',
        '                    dp[i][j] = dp[i][j - 1];',
        '                }',
        '            }',
        '        }',
        '        return dp[m][n] == m;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def isSubsequence(self, s: str, t: str) -> bool:',
        '        m, n = len(s), len(t)',
        '        dp = [[0] * (n + 1) for _ in range(m + 1)]',
        '        for i in range(1, m + 1):',
        '            for j in range(1, n + 1):',
        '                if s[i - 1] == t[j - 1]:',
        '                    dp[i][j] = dp[i - 1][j - 1] + 1',
        '                else:',
        '                    dp[i][j] = dp[i][j - 1]',
        '        return dp[m][n] == m',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：判断 s 是否为 t 的子序列。',
        2: '获取规模：m 为 s 长度，n 为 t 长度。',
        3: '开辟 DP 数组：dp[i][j] 表示 s[0..i-1] 与 t[0..j-1] 的最长公共子序列长度。',
        4: '外层循环遍历 s。',
        5: '内层循环遍历 t。',
        6: '字符比对：s[i-1] 与 t[j-1] 是否匹配。',
        7: '匹配成功：dp[i][j] = dp[i-1][j-1] + 1。',
        9: '字符不同：只能在长串 t 中跳过当前字符，dp[i][j] = dp[i][j-1]。',
        13: '返回判定：若最终公共子序列长度等于 s 的完整长度 m，则说明 s 全部字符均被匹配成功（返回 true）。',
      },
      java: {
        2: '函数入口：判断 s 是否为 t 的子序列。',
        3: '获取长度。',
        4: '开辟网格。',
        5: '外层遍历 s。',
        6: '内层遍历 t。',
        7: '字符比对。',
        8: '匹配：继承左上方 +1。',
        10: '不匹配：继承左方（跳过 t 中字符）。',
        14: '返回 dp[m][n] == m。',
      },
      cpp: {
        3: '函数入口。',
        4: '获取长度。',
        5: '初始化二维表。',
        6: '外层循环。',
        7: '内层循环。',
        8: '字符匹配。',
        10: '字符不匹配。',
        14: '返回判定。',
      },
      python: {
        2: '函数入口。',
        3: '获取长度。',
        4: '初始化二维表。',
        5: '外层循环。',
        6: '内层循环。',
        7: '匹配。',
        9: '不匹配。',
        11: '返回 dp[m][n] == m。',
      },
    },
    keyPoints: {
      title: '🎯 判断子序列 (Is Subsequence) 5 步法要点',
      summary: 'LeetCode 392。区别于编辑距离或常规 LCS，由于 s 必须全保留，当字符不同时只能跳过长串 t（即 dp[i][j] = dp[i][j-1]）。',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i][j]</code>：表示 <code>s[0..i-1]</code> 与 <code>t[0..j-1]</code> 的相同公共字符长度。', icon: '🎯', badge: '单向匹配' },
        { label: '二、状态转移方程 (核心区别)', desc: '• <code>s[i-1] == t[j-1]</code>：<code>dp[i][j] = dp[i-1][j-1] + 1</code>。<br>• <code>s[i-1] != t[j-1]</code>：<code>dp[i][j] = dp[i][j-1]</code>（只能在 t 中寻找匹配，不能删除 s）。', icon: '⚡', badge: '仅向左转移' },
        { label: '三、初始化与边界', desc: '<code>dp[i][0] = 0, dp[0][j] = 0</code>。', icon: '🎬', badge: '全 0 边界' },
        { label: '四、遍历推导顺序', desc: '从左上到右下正序填充。', icon: '🧭', badge: '左上到右下' },
        { label: '五、判定条件', desc: '最终检查 <code>dp[m][n] == m</code>：若公共长度恰好等于 s 长度，则 s 是 t 的子序列。', icon: '⏱️', badge: '全匹配判断' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    const s1 = typeof input === 'object' && input ? (input.s || 'abc') : 'abc';
    const s2 = typeof input === 'object' && input ? (input.t || 'ahbgdc') : 'ahbgdc';

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
        { name: 's (子序列待选)', value: `"${s1}"`, type: 'string' as const, changed: chSet.has('s') },
        { name: 't (源长字符串)', value: `"${s2}"`, type: 'string' as const, changed: chSet.has('t') },
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
      message: `🎯 函数入口：判断 s = "${s1}" 是否为 t = "${s2}" 的子序列。`,
      log: `entry: s="${s1}", t="${s2}"`,
      vars: makeVars({ changed: ['s', 't', 'm', 'n'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    // Step 1: Boundaries
    for (let i = 0; i <= m; i++) dp[i][0] = 0;
    for (let j = 0; j <= n; j++) dp[0][j] = 0;

    push({
      dp2d: clone2d(dp),
      source: s1.split(''),
      target: s2.split(''),
      message: '🎬 边界初始化：空前缀匹配长度均为 0 (dp[i][0]=0, dp[0][j]=0)。',
      log: 'init: dp[i][0]=0, dp[0][j]=0',
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
        message: `🔄 外层循环：i = ${i}，考察 s[${i - 1}] = '${char1}'。`,
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
          dependencies: isMatch ? [{ row: i - 1, col: j - 1 }] : [{ row: i, col: j - 1 }],
          message: isMatch
            ? `🔍 比对字符：s[${i - 1}] ('${char1}') === t[${j - 1}] ('${char2}') 【字符匹配成功 ✓】！`
            : `🔍 比对字符：s[${i - 1}] ('${char1}') !== t[${j - 1}] ('${char2}') 【不匹配，跳过 t 字符 ✗】。`,
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
            message: `⚡ 状态转移 (匹配)：由左上方 dp[${i - 1}][${j - 1}] (${prev}) + 1 = ${resultVal}。`,
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
          const left = (dp[i][j - 1] as number) || 0;
          resultVal = left;
          dp[i][j] = resultVal;

          push({
            dp2d: clone2d(dp),
            source: s1.split(''),
            target: s2.split(''),
            current: { row: i, col: j },
            dependencies: [{ row: i, col: j - 1 }],
            formula: `dp[${i}][${j}] = dp[${i}][${j - 1}] = ${left}`,
            message: `⚡ 状态转移 (跳过 t)：继承左方状态 dp[${i}][${j - 1}] = ${left}。`,
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

    const matchedLen = dp[m][n] as number;
    const isSub = matchedLen === m;
    push({
      dp2d: clone2d(dp),
      source: s1.split(''),
      target: s2.split(''),
      current: { row: m, col: n },
      message: `🏁 算法结束：匹配长度 dp[${m}][${n}] = ${matchedLen}（s 长度为 ${m}）$\rightarrow$ 【${isSub ? '是子序列 (true) 🎉' : '不是子序列 (false) ❌'}】。`,
      log: `return: dp[${m}][${n}]==${m} => ${isSub}`,
      vars: makeVars({ curDp: matchedLen, changed: ['dpij'] }),
      codeLine: { java: 14, cpp: 14, python: 12, javascript: 13 },
    });

    return steps;
  },
};
