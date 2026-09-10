import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const StrangePrinterSpec: AlgorithmSpec = {
  id: 'strange-printer',
  name: '奇怪的打印机 (Strange Printer)',
  category: '区间 DP',
  description: '经典区间动态规划。每次可以打印由同一个字符构成的任意长度序列并覆盖已有字符，求打印目标字符串的最少操作次数。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 664,
    leetcodeUrl: 'https://leetcode.cn/problems/strange-printer/',
    difficulty: 'hard',
    tags: ['动态规划', '区间 DP', '字符串'],
    description: '有台奇怪的打印机满足以下两个条件：<br/>1. 打印机每次只能打印由 <strong>同一个字符</strong> 组成的连续序列。<br/>2. 每次可以在任意起始和结束位置打印新字符，并且会 <strong>覆盖</strong> 掉原来存在的所有字符。<br/><br/>给你一个字符串 <code>s</code> ，你的任务是计算这个打印机打印出它需要的最少打印次数。',
    examples: [
      {
        input: 's = "aaabbb"',
        output: '2',
        explanation: '首先打印 "aaa"，然后打印 "bbb"。总共 2 次。',
      },
      {
        input: 's = "aba"',
        output: '2',
        explanation: '首先打印 "aaa"，然后在中间覆盖打印 "b" 得到 "aba"。总共 2 次。',
      },
    ],
    constraints: [
      '1 <= s.length <= 100 (演示推荐 <= 8)',
      's 由小写英文字母组成',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 4, python: 3, javascript: 2 },
    init: { java: [5, 6], cpp: [6, 7], python: [5, 6], javascript: [4, 5] },
    loopCheck: { java: 7, cpp: 8, python: 7, javascript: 6 },
    innerLoopCheck: { java: 8, cpp: 9, python: 8, javascript: 7 },
    stateTransfer: { java: [10, 11, 12, 13], cpp: [11, 12, 13, 14], python: [10, 11, 12, 13], javascript: [9, 10, 11, 12] },
    loopExit: { java: 7, cpp: 8, python: 7, javascript: 6 },
    returnResult: { java: 17, cpp: 18, python: 15, javascript: 16 },
  },
  code: {
    languages: {
      javascript: [
        'function strangePrinter(s) {',
        '    const n = s.length;',
        '    if (n <= 1) return n;',
        '    const dp = Array.from({ length: n }, () => new Array(n).fill(0));',
        '    for (let i = 0; i < n; i++) dp[i][i] = 1; // 单个字符需 1 次打印',
        '    for (let len = 2; len <= n; len++) {',
        '        for (let i = 0; i <= n - len; i++) {',
        '            const j = i + len - 1;',
        '            if (s[i] === s[j]) {',
        '                dp[i][j] = dp[i][j - 1]; // 首尾相同，打印首字符时顺便拉长到底部',
        '            } else {',
        '                let minTurns = Infinity;',
        '                for (let k = i; k < j; k++) {',
        '                    minTurns = Math.min(minTurns, dp[i][k] + dp[k + 1][j]);',
        '                }',
        '                dp[i][j] = minTurns;',
        '            }',
        '        }',
        '    }',
        '    return dp[0][n - 1];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int strangePrinter(String s) {',
        '        int n = s.length();',
        '        if (n <= 1) return n;',
        '        int[][] dp = new int[n][n];',
        '        for (int i = 0; i < n; i++) dp[i][i] = 1;',
        '        for (int len = 2; len <= n; len++) {',
        '            for (int i = 0; i <= n - len; i++) {',
        '                int j = i + len - 1;',
        '                if (s.charAt(i) == s.charAt(j)) {',
        '                    dp[i][j] = dp[i][j - 1];',
        '                } else {',
        '                    int minTurns = Integer.MAX_VALUE;',
        '                    for (int k = i; k < j; k++) {',
        '                        minTurns = Math.min(minTurns, dp[i][k] + dp[k + 1][j]);',
        '                    }',
        '                    dp[i][j] = minTurns;',
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
        '    int strangePrinter(string s) {',
        '        int n = s.length();',
        '        if (n <= 1) return n;',
        '        vector<vector<int>> dp(n, vector<int>(n, 0));',
        '        for (int i = 0; i < n; i++) dp[i][i] = 1;',
        '        for (int len = 2; len <= n; len++) {',
        '            for (int i = 0; i <= n - len; i++) {',
        '                int j = i + len - 1;',
        '                if (s[i] == s[j]) {',
        '                    dp[i][j] = dp[i][j - 1];',
        '                } else {',
        '                    int minTurns = INT_MAX;',
        '                    for (int k = i; k < j; k++) {',
        '                        minTurns = min(minTurns, dp[i][k] + dp[k + 1][j]);',
        '                    }',
        '                    dp[i][j] = minTurns;',
        '                }',
        '            }',
        '        }',
        '        return dp[0][n - 1];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def strangePrinter(self, s: str) -> int:',
        '        n = len(s)',
        '        if n <= 1:',
        '            return n',
        '        dp = [[0] * n for _ in range(n)]',
        '        for i in range(n):',
        '            dp[i][i] = 1',
        '        for length in range(2, n + 1):',
        '            for i in range(n - length + 1):',
        '                j = i + length - 1',
        '                if s[i] == s[j]:',
        '                    dp[i][j] = dp[i][j - 1]',
        '                else:',
        '                    dp[i][j] = min(dp[i][k] + dp[k + 1][j] for k in range(i, j))',
        '        return dp[0][n - 1]',
      ],
    },
    lineExplanations: {
      java: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>：求打印出目标字符串 s 所需的最少打印次数。',
        4: '长度为 0 或 1 特判。',
        5: '定义 DP 表：$dp[i][j]$ 为打印子串 $s[i..j]$ 所需的最少操作次数。',
        6: '长度为 1 的子串打印只需 1 次。',
        7: '按子串长度 $len$ 递增遍历。',
        8: '枚举子串起始下标 $i$。',
        9: '子串终止下标 $j = i + len - 1$。',
        10: '💡 <strong>巧妙贪心合并</strong>：若首字符 $s[i] == s[j]$，在第一次打印 $s[i]$ 时可以直接一路涂刷到 $j$ 位置，后续在中间局部覆盖，末尾无需多花一次！所以 $dp[i][j] = dp[i][j-1]$。',
        13: '若首尾不同，则枚举分割点 $k \\in [i, j-1]$，将区间拆分为 $dp[i][k] + dp[k+1][j]$ 寻找极小值。',
        17: '返回 $dp[0][n-1]$。',
      },
      javascript: {
        1: '🎯 <strong>函数主入口</strong>。',
        5: '单字符需 1 次。',
        6: '外层循环区间长度。',
        9: '首尾字符相同优化。',
        13: '分割点最优极值转移。',
        19: '返回全局最优打印次数。',
      },
      cpp: {
        1: '类定义 Solution。',
        3: '🎯 <strong>函数主入口</strong>。',
        7: '对角线初始化为 1。',
        8: '区间递推。',
        11: '首尾匹配直接复用 $dp[i][j-1]$。',
        14: '枚举分割点 $k$。',
        19: '返回结果。',
      },
      python: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>。',
        8: '单字符初始化 1。',
        9: '遍历长度。',
        12: '首尾字符相同分支。',
        14: '首尾字符不同生成式取最小值。',
        15: '返回 dp[0][n-1]。',
      },
    },
    keyPoints: {
      thinking: '由于打印机可以覆盖字符，当一个区间的首尾字符相同时（s[i] == s[j]），我们可以先一次性将从 i 到 j 全部刷成 s[i]，之后在内部进行覆盖打印，尾部的 s[j] 相当于“顺便”被打印出来了，次数与 dp[i][j-1] 相同！',
      state: 'dp[i][j] 表示打印子串 s[i..j] 所需的最少操作次数。',
      equation: '若 s[i] == s[j] 则 dp[i][j] = dp[i][j-1]；否则 dp[i][j] = \\min_{i \\le k < j} (dp[i][k] + dp[k+1][j])',
      initAndBounds: 'dp[i][i] = 1；len 从 2 到 n。',
      complexity: '时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。',
    },
    faqList: [
      {
        tag: '首尾相同的原理',
        question: '为什么 s[i] == s[j] 时 dp[i][j] = dp[i][j-1] 必然是最优的？',
        answer: '因为打印 s[i..j-1] 的第一笔操作必然是将区间 [i, m]（某 m >= i）刷成字符 s[i]。我们只需将这一笔的涂刷右端点直接延伸到 j，其间所有覆盖过程完全不变，末尾的 s[j] 就免费成型了，不会增加任何额外操作。',
      },
    ],
  },
  generateSteps: (input: { s?: string }): DpTraceStep[] => {
    const rawS = input?.s && input.s.length > 0 ? input.s : 'aaabbb';
    const s = rawS.slice(0, 8);
    const n = s.length;
    const steps: DpTraceStep[] = [];

    const dp: DpCell[][] = Array.from({ length: n }, (_, r) =>
      Array.from({ length: n }, (_, c) => ({
        value: r === c ? 1 : 0,
        state: r === c ? 'computed' : 'empty',
      }))
    );

    steps.push(
      makeTraceStep({
        dp2d: clone2d(dp),
        message: `初始化待打印字符串: "${s}"，单字符区间 dp[i][i] = 1`,
        log: '初始化对角线状态为 1',
        vars: [
          { name: 'n', value: String(n) },
          { name: 's', value: `"${s}"` },
        ],
        metrics: { minTurns: 1 },
      })
    );

    for (let len = 2; len <= n; len++) {
      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;
        dp[i][j].state = 'current';

        if (s[i] === s[j]) {
          const val = Number(dp[i][j - 1].value);
          dp[i][j].value = val;
          dp[i][j].state = 'computed';

          steps.push(
            makeTraceStep({
              dp2d: clone2d(dp),
              current: { row: i, col: j },
              dependencies: [{ row: i, col: j - 1 }],
              message: `计算子串 "${s.slice(i, j + 1)}" [${i}..${j}]: 首尾字符相同 s[${i}] == s[${j}] == '${s[i]}'，首部打印顺延至尾部 -> dp[${i}][${j}] = dp[${i}][${j - 1}] = ${val}`,
              log: `dp[${i}][${j}] = dp[${i}][${j - 1}] = ${val} (首尾匹配 '${s[i]}')`,
              formula: 'dp[i][j] = dp[i][j-1]',
              formulaSubstituted: `dp[${i}][${j}] = dp[${i}][${j - 1}] = ${val}`,
              vars: [
                { name: 'len', value: String(len) },
                { name: 'i', value: String(i) },
                { name: 'j', value: String(j) },
                { name: 'minTurns', value: String(val) },
              ],
              metrics: { minTurns: val },
            })
          );
        } else {
          let minTurns = Infinity;
          let bestK = i;

          for (let k = i; k < j; k++) {
            const total = Number(dp[i][k].value) + Number(dp[k + 1][j].value);
            if (total < minTurns) {
              minTurns = total;
              bestK = k;
            }
          }

          dp[i][j].value = minTurns;
          dp[i][j].state = 'computed';

          steps.push(
            makeTraceStep({
              dp2d: clone2d(dp),
              current: { row: i, col: j },
              dependencies: [
                { row: i, col: bestK },
                { row: bestK + 1, col: j },
              ],
              message: `计算子串 "${s.slice(i, j + 1)}" [${i}..${j}]: 首尾不同 ('${s[i]}' != '${s[j]}')，最佳分割点 k=${bestK} -> 左段"${s.slice(i, bestK + 1)}"(${dp[i][bestK].value}) + 右段"${s.slice(bestK + 1, j + 1)}"(${dp[bestK + 1][j].value}) = ${minTurns}`,
              log: `dp[${i}][${j}] = dp[${i}][${bestK}](${dp[i][bestK].value}) + dp[${bestK + 1}][${j}](${dp[bestK + 1][j].value}) = ${minTurns}`,
              formula: 'dp[i][j] = min(dp[i][k] + dp[k+1][j])',
              formulaSubstituted: `dp[${i}][${j}] = ${dp[i][bestK].value} + ${dp[bestK + 1][j].value} = ${minTurns}`,
              vars: [
                { name: 'len', value: String(len) },
                { name: 'i', value: String(i) },
                { name: 'j', value: String(j) },
                { name: 'bestK', value: String(bestK) },
                { name: 'minTurns', value: String(minTurns) },
              ],
              metrics: { minTurns },
            })
          );
        }
      }
    }

    const answer = Number(dp[0][n - 1].value);
    steps.push(
      makeTraceStep({
        dp2d: clone2d(dp),
        current: { row: 0, col: n - 1 },
        message: `🎉 打印计算完成！打印字符串 "${s}" 的最少操作次数为 ${answer}`,
        log: `最终结果 dp[0][${n - 1}] = ${answer}`,
        vars: [
          { name: '最少打印次数', value: String(answer) },
        ],
        metrics: { minTurns: answer },
      })
    );

    return steps;
  },
};
