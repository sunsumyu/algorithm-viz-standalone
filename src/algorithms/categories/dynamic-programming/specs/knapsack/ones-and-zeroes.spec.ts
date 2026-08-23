import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const OnesAndZeroesSpec: AlgorithmSpec = {
  id: 'ones-and-zeroes',
  name: '一和零 (Ones and Zeroes)',
  category: '背包 DP',
  description: '给你一个二进制字符串数组 strs 和两个整数 m 和 n 。请你找出并返回 strs 的最大子集的长度，该子集中 最多 有 m 个 0 和 n 个 1 。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 474,
    leetcodeUrl: 'https://leetcode.cn/problems/ones-and-zeroes/',
    difficulty: 'medium',
    tags: ['数组', '字符串', '动态规划', '二维费用背包'],
    description: '给你一个二进制字符串数组 <code>strs</code> 和两个整数 <code>m</code> 和 <code>n</code> 。<br/><br/>请你找出并返回 <code>strs</code> 的 <strong>最大子集的长度</strong> ，该子集中 <strong>最多</strong> 有 <code>m</code> 个 <code>0</code> 和 <code>n</code> 个 <code>1</code> 。<br/><br/><strong>二维费用 0-1 背包</strong>：每个字符串消耗 <code>zeros</code> 个 0 与 <code>ones</code> 个 1，价值为 1（集合大小加 1）。两维费用均需要倒序遍历！',
    examples: [
      {
        input: 'strs = ["10","0001","111001","1","0"], m = 5, n = 3',
        output: '4',
        explanation: '最多有 5 个 0 和 3 个 1 的最大子集是 {"10","0001","1","0"} ，因此长度为 4 。',
      },
      {
        input: 'strs = ["10","0","1"], m = 1, n = 1',
        output: '2',
      },
    ],
    constraints: [
      '1 <= strs.length <= 600',
      '1 <= strs[i].length <= 100',
      'strs[i] 仅由 \'0\' 和 \'1\' 组成',
      '1 <= m, n <= 100',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: 4, cpp: 4, python: 3, javascript: 2 },
    loopCheck: { java: 5, cpp: 5, python: 4, javascript: 3 },
    innerLoopCheck: { java: 11, cpp: 11, python: 7, javascript: 9 },
    stateTransfer: {
      java: { primary: 13, context: [11, 12] },
      cpp: { primary: 13, context: [11, 12] },
      python: { primary: 9, context: [7, 8] },
      javascript: { primary: 11, context: [9, 10] },
    },
    loopExit: { java: 5, cpp: 5, python: 4, javascript: 3 },
    returnResult: { java: 18, cpp: 18, python: 10, javascript: 16 },
  },
  code: {
    languages: {
      javascript: [
        'function findMaxForm(strs, m, n) {',
        '    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));',
        '    for (const str of strs) { // 遍历每个字符串物品',
        '        let zeros = 0, ones = 0;',
        '        for (const c of str) {',
        '            if (c === "0") zeros++;',
        '            else ones++;',
        '        }',
        '        for (let i = m; i >= zeros; i--) { // 倒序遍历 0 的容量上限',
        '            for (let j = n; j >= ones; j--) { // 倒序遍历 1 的容量上限',
        '                dp[i][j] = Math.max(dp[i][j], dp[i - zeros][j - ones] + 1);',
        '            }',
        '        }',
        '    }',
        '    return dp[m][n]; // 最多装入的字符串数量',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int findMaxForm(String[] strs, int m, int n) {',
        '        int[][] dp = new int[m + 1][n + 1];',
        '        for (String str : strs) {',
        '            int zeros = 0, ones = 0;',
        '            for (char c : str.toCharArray()) {',
        '                if (c == \'0\') zeros++;',
        '                else ones++;',
        '            }',
        '            for (int i = m; i >= zeros; i--) {',
        '                for (int j = n; j >= ones; j--) {',
        '                    dp[i][j] = Math.max(dp[i][j], dp[i - zeros][j - ones] + 1);',
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
        '    int findMaxForm(vector<string>& strs, int m, int n) {',
        '        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));',
        '        for (const string& str : strs) {',
        '            int zeros = 0, ones = 0;',
        '            for (char c : str) {',
        '                if (c == \'0\') zeros++;',
        '                else ones++;',
        '            }',
        '            for (int i = m; i >= zeros; i--) {',
        '                for (int j = n; j >= ones; j--) {',
        '                    dp[i][j] = max(dp[i][j], dp[i - zeros][j - ones] + 1);',
        '                }',
        '            }',
        '        }',
        '        return dp[m][n];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def findMaxForm(self, strs: List[str], m: int, n: int) -> int:',
        '        dp = [[0] * (n + 1) for _ in range(m + 1)]',
        '        for s in strs:',
        '            zeros, ones = s.count(\'0\'), s.count(\'1\')',
        '            for i in range(m, zeros - 1, -1):',
        '                for j in range(n, ones - 1, -1):',
        '                    dp[i][j] = max(dp[i][j], dp[i - zeros][j - ones] + 1)',
        '        return dp[m][n]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：二维费用背包求最大子集大小。',
        2: '初始化 dp[m+1][n+1] 表格：dp[i][j] 表示最多 i 个 0 和 j 个 1 时能选取的最大字符串数。',
        3: '外层遍历每个字符串。',
        4: '统计当前字符串中 0 和 1 的个数（消耗的两种费用）。',
        9: '倒序遍历 0 的费用维度 i。',
        10: '倒序遍历 1 的费用维度 j。',
        11: '0-1背包二维费用状态转移：max(不选, 选入当前串 dp[i-zeros][j-ones] + 1)。',
        15: '返回 dp[m][n]。',
      },
      java: {
        2: '函数入口。',
        4: '初始化二维状态表。',
        5: '遍历字符串。',
        6: '统计 0/1 字符数。',
        10: '双层倒序遍历费用。',
        12: '状态转移。',
        17: '返回 dp[m][n]。',
      },
      cpp: {
        3: '函数入口。',
        5: '初始化 dp 表。',
        6: '遍历字符串列表。',
        11: '双倒序维度。',
        13: '二维费用转移。',
        18: '返回答案。',
      },
      python: {
        2: '函数入口。',
        4: '列表初始化。',
        5: '遍历字符串。',
        7: '双倒序遍历。',
        8: '转移方程。',
        9: '返回结果。',
      },
    },
    keyPoints: {
      title: '🎯 一和零 (二维费用 0-1 背包) 5 步法系统精讲',
      summary: 'LeetCode 474。经典二维费用背包。普通 0-1 背包只有一种容量限制（重量），本题同时受限于「0 的最大数量 m」与「1 的最大数量 n」。',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i][j]</code>：最多有 <code>i</code> 个 0 和 <code>j</code> 个 1 时，能够选出的最大字符串子集长度。', icon: '🎯', badge: '二维费用' },
        { label: '二、状态转移方程', desc: '<code>dp[i][j] = max(dp[i][j], dp[i - zeros][j - ones] + 1)</code>。', icon: '⚡', badge: '双维度扣减' },
        { label: '三、双倒序遍历', desc: '两个容量维度 <code>i</code> (从 m 到 zeros) 和 <code>j</code> (从 n 到 ones) 均需<strong>从大到小倒序遍历</strong>，确保同一字符串不被重复累加。', icon: '🎬', badge: '双向倒序' },
        { label: '四、时空复杂度', desc: '• 时间复杂度：<code>O(L × m × n)</code>（L 为字符串数组长度）。<br>• 空间复杂度：<code>O(m × n)</code>。', icon: '⏱️', badge: 'O(Lmn)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let strs: string[] = ['10', '0001', '111001', '1', '0'];
    let m = 5;
    let n = 3;

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.strs)) strs = input.strs;
      if (typeof input.m === 'number') m = input.m;
      if (typeof input.n === 'number') n = input.n;
    }

    const dp: DpCell[][] = Array.from({ length: m + 1 }, () =>
      Array.from({ length: n + 1 }, () => 0)
    );

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      strIdx?: number | string;
      curStr?: string;
      cur0?: number | string;
      cur1?: number | string;
      i?: number | string;
      j?: number | string;
      curDp?: DpCell | number | string;
      changed?: string[];
    }) => {
      const sIdx = opts.strIdx ?? '-';
      const s = opts.curStr ?? '-';
      const c0 = opts.cur0 ?? '-';
      const c1 = opts.cur1 ?? '-';
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const cur = opts.curDp ?? (dp[m][n] as number);
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'strs (字符串序列)', value: `[${strs.join(', ')}]`, type: 'string' as const, changed: chSet.has('strs') },
        { name: 'm (最大允许 0)', value: String(m), type: 'number' as const, changed: chSet.has('m') },
        { name: 'n (最大允许 1)', value: String(n), type: 'number' as const, changed: chSet.has('n') },
        { name: '当前处理字符串', value: s, type: 'string' as const, changed: chSet.has('s') },
        { name: '当前串消耗 (0数, 1数)', value: `(${c0}, ${c1})`, type: 'string' as const, changed: chSet.has('c') },
        { name: '容量上限 (i个0, j个1)', value: `(${iVal}, ${jVal})`, type: 'string' as const, changed: chSet.has('ij') },
        { name: 'dp[i][j] (最大子集长度)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dp') },
      ];
    };

    // Step 0: Entry
    push({
      dp2d: clone2d(dp),
      source: strs,
      message: `🎯 函数入口：一和零（二维费用背包）。共有 ${strs.length} 个字符串，限制最多 ${m} 个 '0' 与 ${n} 个 '1'。`,
      log: `entry: m=${m}, n=${n}, strs=[${strs.join(',')}]`,
      vars: makeVars({ changed: ['strs', 'm', 'n'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    for (let k = 0; k < strs.length; k++) {
      const s = strs[k];
      let zeros = 0, ones = 0;
      for (const c of s) {
        if (c === '0') zeros++;
        else ones++;
      }

      for (let i = m; i >= zeros; i--) {
        for (let j = n; j >= ones; j--) {
          const prevVal = dp[i][j] as number;
          const takeVal = (dp[i - zeros][j - ones] as number) + 1;
          const best = Math.max(prevVal, takeVal);
          dp[i][j] = best;

          if (takeVal > prevVal) {
            push({
              dp2d: clone2d(dp),
              source: strs,
              current: { row: i, col: j },
              dependencies: [{ row: i - zeros, col: j - ones }],
              formula: `dp[${i}][${j}] = max(${prevVal}, dp[${i - zeros}][${j - ones}] + 1) = ${best}`,
              message: `⚡ 选入 "${s}" (含 ${zeros} 个 '0', ${ones} 个 '1')：在容量上限 (${i}, ${j}) 下，子集长度提升至 ${best}。`,
              log: `dp[${i}][${j}] = ${best}`,
              vars: makeVars({ strIdx: k, curStr: s, cur0: zeros, cur1: ones, i, j, curDp: best, changed: ['s', 'c', 'ij', 'dp'] }),
              codeLine: {
                java: { primary: 13, context: [11, 12] },
                cpp: { primary: 13, context: [11, 12] },
                python: { primary: 9, context: [7, 8] },
                javascript: { primary: 11, context: [9, 10] },
              },
            });
          }
        }
      }
    }

    const finalAns = dp[m][n] as number;
    push({
      dp2d: clone2d(dp),
      source: strs,
      current: { row: m, col: n },
      message: `🏁 算法结束：在最多 ${m} 个 0 和 ${n} 个 1 的约束下，最大子集长度为 dp[${m}][${n}] = ${finalAns}。`,
      log: `return: dp[${m}][${n}] = ${finalAns}`,
      vars: makeVars({ curDp: finalAns, changed: ['dp'] }),
      codeLine: { java: 18, cpp: 18, python: 10, javascript: 15 },
    });

    return steps;
  },
};
