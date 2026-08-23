import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const UniquePathsSpec: AlgorithmSpec = {
  id: 'unique-paths',
  name: '不同路径 (Unique Paths)',
  category: '网格 DP',
  description: '一个机器人位于一个 m x n 网格的左上角。机器人每次只能向下或向右移动一步。机器人试图达到网格的右下角。问总共有多少条不同的路径？',
  difficulty: 'medium',
  problem: {
    leetcodeId: 62,
    leetcodeUrl: 'https://leetcode.cn/problems/unique-paths/',
    difficulty: 'medium',
    tags: ['数学', '动态规划', '组合数学', '网格DP'],
    description: '一个机器人位于一个 <code>m x n</code> 网格的左上角 （起始点在下图中标记为 “Start” ）。<br/><br/>机器人每次只能 <strong>向下</strong> 或 <strong>向右</strong> 移动一步。机器人试图达到网格的右下角（在下图中标记为 “Finish” ）。<br/><br/>问总共有多少条不同的路径？',
    examples: [
      {
        input: 'm = 3, n = 7',
        output: '28',
      },
      {
        input: 'm = 3, n = 2',
        output: '3',
        explanation: '从左上角开始，总共有 3 条路径可以到达右下角：<br/>1. 向右 -> 向下 -> 向下<br/>2. 向下 -> 向下 -> 向右<br/>3. 向下 -> 向右 -> 向下',
      },
    ],
    constraints: [
      '1 <= m, n <= 100',
      '题目数据保证答案小于等于 2 * 10^9',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: [4, 5], cpp: [4, 5], python: [3, 4], javascript: [3, 4] },
    loopCheck: { java: 6, cpp: 6, python: 5, javascript: 5 },
    innerLoopCheck: { java: 7, cpp: 7, python: 6, javascript: 6 },
    stateTransfer: {
      java: { primary: 8, context: [6, 7] },
      cpp: { primary: 8, context: [6, 7] },
      python: { primary: 7, context: [5, 6] },
      javascript: { primary: 7, context: [5, 6] },
    },
    loopExit: { java: 6, cpp: 6, python: 5, javascript: 5 },
    returnResult: { java: 11, cpp: 11, python: 8, javascript: 10 },
  },
  code: {
    languages: {
      javascript: [
        'function uniquePaths(m, n) {',
        '    const dp = Array.from({ length: m }, () => new Array(n).fill(1));',
        '    // 第一行与第一列由于只能单向走，路径数均初始化为 1',
        '    for (let i = 1; i < m; i++) { // 遍历网格行',
        '        for (let j = 1; j < n; j++) { // 遍历网格列',
        '            dp[i][j] = dp[i - 1][j] + dp[i][j - 1]; // 来自上方 + 来自左方',
        '        }',
        '    }',
        '    return dp[m - 1][n - 1];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int uniquePaths(int m, int n) {',
        '        int[][] dp = new int[m][n];',
        '        for (int i = 0; i < m; i++) dp[i][0] = 1;',
        '        for (int j = 0; j < n; j++) dp[0][j] = 1;',
        '        for (int i = 1; i < m; i++) {',
        '            for (int j = 1; j < n; j++) {',
        '                dp[i][j] = dp[i - 1][j] + dp[i][j - 1];',
        '            }',
        '        }',
        '        return dp[m - 1][n - 1];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int uniquePaths(int m, int n) {',
        '        vector<vector<int>> dp(m, vector<int>(n, 1));',
        '        for (int i = 1; i < m; i++) {',
        '            for (int j = 1; j < n; j++) {',
        '                dp[i][j] = dp[i - 1][j] + dp[i][j - 1];',
        '            }',
        '        }',
        '        return dp[m - 1][n - 1];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def uniquePaths(self, m: int, n: int) -> int:',
        '        dp = [[1] * n for _ in range(m)]',
        '        for i in range(1, m):',
        '            for j in range(1, n):',
        '                dp[i][j] = dp[i - 1][j] + dp[i][j - 1]',
        '        return dp[m - 1][n - 1]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：计算 m × n 网格从 (0,0) 到 (m-1,n-1) 的不同路径总数。',
        2: '开辟二维状态网格 dp[m][n]，全部初始化为 1。',
        3: '边界解释：第一行只能一路向右走（1 种），第一列只能一路向下走（1 种）。',
        4: '外层循环：从第 1 行遍历至第 m-1 行。',
        5: '内层循环：从第 1 列遍历至第 n-1 列。',
        6: '状态转移方程：到达 (i, j) 的路径数 = 来自上方 (i-1, j) 的路径数 + 来自左方 (i, j-1) 的路径数。',
        9: '返回右下角终点值 dp[m-1][n-1]。',
      },
      java: {
        2: '函数入口。',
        3: '开辟 dp 表。',
        4: '第一列初始化为 1。',
        5: '第一行初始化为 1。',
        6: '遍历行。',
        7: '遍历列。',
        8: '上方 + 左方加和转移。',
        11: '返回终点路径数。',
      },
      cpp: {
        3: '函数入口。',
        4: '定义二维向量并全初始化为 1。',
        5: '外层循环。',
        6: '内层循环。',
        7: '状态加和转移。',
        10: '返回答案。',
      },
      python: {
        2: '函数入口。',
        3: '初始化二维列表。',
        4: '遍历行。',
        5: '遍历列。',
        6: '状态转移。',
        7: '返回终点。',
      },
    },
    keyPoints: {
      title: '🎯 不同路径 5 步法系统精讲',
      summary: 'LeetCode 62。网格 DP 最经典入门母题。机器人在任意格子 (i, j) 的路径数等于其两个前驱格子（上方与左方）的路径数之和！',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i][j]</code>：从起点 <code>(0, 0)</code> 出发到达网格 <code>(i, j)</code> 的不同路径总数。', icon: '🎯', badge: '网格坐标状态' },
        { label: '二、状态转移方程', desc: '<code>dp[i][j] = dp[i - 1][j] + dp[i][j - 1]</code>（由于机器人只能向右或向下，因此只能从左边或上边到达当前格）。', icon: '⚡', badge: '左方+上方' },
        { label: '三、初始化与边界', desc: '第一行 <code>dp[0][j] = 1</code>，第一列 <code>dp[i][0] = 1</code>（单向直行只有唯一 1 种路径）。', icon: '🎬', badge: '边缘全为1' },
        { label: '四、遍历推导顺序', desc: '从左到右、从上到下逐行扫描，确保每次计算 <code>(i, j)</code> 时上方与左方状态均已就绪。', icon: '🧭', badge: '逐行逐列' },
        { label: '五、复杂度分析', desc: '• 时间复杂度：<code>O(m × n)</code>。<br>• 空间复杂度：<code>O(m × n)</code>，可滚动数组压缩至 <code>O(n)</code>。', icon: '⏱️', badge: 'O(m*n)' },
      ],
    },
    faqList: [
      {
        tag: '思维模型',
        question: '为什么不同路径的递归/记忆化演示有“倒序推导”和“正向探索”两种方式？',
        answer: '• <strong>倒序推导（推荐）</strong>：从终点 <code>(m-1, n-1)</code> 逆推回到起点 <code>(0, 0)</code>，子问题定义为“到达 <code>(i, j)</code> 的路径数等于到达左方 <code>(i, j-1)</code> 与上方 <code>(i-1, j)</code> 之和” (<code>dfs(i, j) = dfs(i, j-1) + dfs(i-1, j)</code>)。这与 DP 递推方程 <code>dp[i][j] = dp[i][j-1] + dp[i-1][j]</code> 形式完全一致！<br/>• <strong>正向探索</strong>：从起点 <code>(0, 0)</code> 出发向下 <code>(i+1, j)</code> 和向右 <code>(i, j+1)</code> 探索直到终点。两种思路等价，但倒序推导是建立 DP 状态转移方程式的最直接桥梁。',
      },
      {
        tag: '边界条件',
        question: '倒序递归中为什么满足 i == 0 || j == 0 时直接返回 1？',
        answer: '因为在第 0 行时只能一直向左走回到起点 (0, 0)，在第 0 列时只能一直向上走回到起点 (0, 0)，单向直达路线只有唯 1 种。这正好对应了迭代 DP 表中第一行和第一列全部初始化为 1。',
      },
      {
        tag: '空间优化',
        question: '为什么空间复杂度可以从 O(m×n) 压缩为 O(n)？',
        answer: '观察状态转移方程 <code>dp[i][j] = dp[i-1][j] + dp[i][j-1]</code>，计算当前行第 <code>j</code> 列时，只需要上方旧值 <code>dp[i-1][j]</code>（即更新前的 <code>dp[j]</code>）和左方新值 <code>dp[i][j-1]</code>（即刚刚计算好的 <code>dp[j-1]</code>），更早的历史行数据已不再需要，因此只需维护一维行数组 <code>dp[j] += dp[j-1]</code>。',
      },
    ],
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let m = 3;
    let n = 4;

    if (typeof input === 'object' && input) {
      if (typeof input.m === 'number') m = input.m;
      if (typeof input.n === 'number') n = input.n;
    }

    const dp: DpCell[][] = Array.from({ length: m }, () =>
      Array.from({ length: n }, () => '-')
    );

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      j?: number | string;
      curDp?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const cur = opts.curDp ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'i (当前行)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'j (当前列)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 'dp[i][j] (到达路径数)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpij') },
        { name: 'm (网格行数)', value: String(m), type: 'number' as const, changed: chSet.has('m') },
        { name: 'n (网格列数)', value: String(n), type: 'number' as const, changed: chSet.has('n') },
      ];
    };

    // Step 0: Entry
    push({
      dp2d: clone2d(dp),
      thematicMeta: { type: 'grid', grid: { rows: m, cols: n, curRow: 0, curCol: 0, pathCount: 1 } },
      current: { row: 0, col: 0 },
      message: `🎯 函数入口：计算 ${m} × ${n} 网格从左上角起点 (0, 0) 🚩 到右下角终点 (${m - 1}, ${n - 1}) 🏆 的不同路径数。`,
      log: `entry: m=${m}, n=${n}`,
      vars: makeVars({ i: 0, j: 0, curDp: 1, changed: ['m', 'n', 'i', 'j'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    // Step 1: Initialize boundaries
    for (let r = 0; r < m; r++) dp[r][0] = 1;
    for (let c = 0; c < n; c++) dp[0][c] = 1;

    push({
      dp2d: clone2d(dp),
      thematicMeta: { type: 'grid', grid: { rows: m, cols: n, curRow: 0, curCol: 0, pathCount: 1 } },
      current: { row: 0, col: 0 },
      message: `🎬 边界初始化：第一行只能一路向右（路径数均为 1），第一列只能一路向下（路径数均为 1）。`,
      log: `init: dp[i][0]=1, dp[0][j]=1`,
      vars: makeVars({ i: 0, j: 0, curDp: 1, changed: ['dpij'] }),
      codeLine: { java: [4, 5], cpp: 4, python: 3, javascript: 2 },
    });

    // Loops
    for (let i = 1; i < m; i++) {
      for (let j = 1; j < n; j++) {
        const fromTop = (dp[i - 1][j] as number) || 0;
        const fromLeft = (dp[i][j - 1] as number) || 0;
        const sum = fromTop + fromLeft;
        dp[i][j] = sum;

        push({
          dp2d: clone2d(dp),
          thematicMeta: { type: 'grid', grid: { rows: m, cols: n, curRow: i, curCol: j, pathCount: sum } },
          current: { row: i, col: j },
          dependencies: [{ row: i - 1, col: j }, { row: i, col: j - 1 }],
          formula: `dp[${i}][${j}] = dp[${i - 1}][${j}] (${fromTop}) + dp[${i}][${j - 1}] (${fromLeft}) = ${sum}`,
          message: `⚡ 状态转移：到达 (${i}, ${j}) = 来自上方 (${fromTop} 条) + 来自左方 (${fromLeft} 条) $\rightarrow$ dp[${i}][${j}] = ${sum} 条路径。`,
          log: `update: dp[${i}][${j}] = ${sum}`,
          vars: makeVars({ i, j, curDp: sum, changed: ['i', 'j', 'dpij'] }),
          codeLine: {
            java: { primary: 8, context: [6, 7] },
            cpp: { primary: 7, context: [5, 6] },
            python: { primary: 6, context: [4, 5] },
            javascript: { primary: 6, context: [4, 5] },
          },
        });
      }
    }

    const ans = dp[m - 1][n - 1] as number;
    push({
      dp2d: clone2d(dp),
      thematicMeta: { type: 'grid', grid: { rows: m, cols: n, curRow: m - 1, curCol: n - 1, pathCount: ans } },
      current: { row: m - 1, col: n - 1 },
      message: `🏁 算法结束：到达右下角终点 (${m - 1}, ${n - 1}) 的不同路径总数为 dp[${m - 1}][${n - 1}] = ${ans} 条。`,
      log: `return: dp[${m - 1}][${n - 1}] = ${ans}`,
      vars: makeVars({ i: m - 1, j: n - 1, curDp: ans, changed: ['dpij'] }),
      codeLine: { java: 11, cpp: 10, python: 7, javascript: 9 },
    });

    return steps;
  },
};
