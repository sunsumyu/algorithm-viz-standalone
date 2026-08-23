import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const MinimumPathSumSpec: AlgorithmSpec = {
  id: 'min-path-sum',
  name: '最小路径和 (Minimum Path Sum)',
  category: '网格 DP',
  description: '给定一个包含非负整数的 m x n 网格 grid ，请找出一条从左上角到右下角的路径，使得路径上的数字总和为最小。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 64,
    leetcodeUrl: 'https://leetcode.cn/problems/minimum-path-sum/',
    difficulty: 'medium',
    tags: ['数组', '动态规划', '矩阵', '网格DP'],
    description: '给定一个包含非负整数的 <code>m x n</code> 网格 <code>grid</code> ，请找出一条从左上角到右下角的路径，使得路径上的数字总和为最小。<br/><br/><strong>说明</strong>：每次只能向下或者向右移动一步。',
    examples: [
      {
        input: 'grid = [[1,3,1],[1,5,1],[4,2,1]]',
        output: '7',
        explanation: '因为路径 1 -> 3 -> 1 -> 1 -> 1 的总和最小，最小和为 7。',
      },
      {
        input: 'grid = [[1,2,3],[4,5,6]]',
        output: '12',
      },
    ],
    constraints: [
      'm == grid.length',
      'n == grid[i].length',
      '1 <= m, n <= 200',
      '0 <= grid[i][j] <= 200',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: [4, 7], cpp: [4, 7], python: [3, 6], javascript: [3, 6] },
    loopCheck: { java: 8, cpp: 8, python: 7, javascript: 7 },
    innerLoopCheck: { java: 9, cpp: 9, python: 8, javascript: 8 },
    stateTransfer: {
      java: { primary: 10, context: [8, 9] },
      cpp: { primary: 10, context: [8, 9] },
      python: { primary: 9, context: [7, 8] },
      javascript: { primary: 9, context: [7, 8] },
    },
    loopExit: { java: 8, cpp: 8, python: 7, javascript: 7 },
    returnResult: { java: 13, cpp: 13, python: 11, javascript: 12 },
  },
  code: {
    languages: {
      javascript: [
        'function minPathSum(grid) {',
        '    const m = grid.length, n = grid[0].length;',
        '    const dp = Array.from({ length: m }, () => new Array(n).fill(0));',
        '    dp[0][0] = grid[0][0]; // 起点自身权重',
        '    for (let i = 1; i < m; i++) dp[i][0] = dp[i - 1][0] + grid[i][0]; // 首列累加前缀和',
        '    for (let j = 1; j < n; j++) dp[0][j] = dp[0][j - 1] + grid[0][j]; // 首行累加前缀和',
        '    for (let i = 1; i < m; i++) { // 遍历行',
        '        for (let j = 1; j < n; j++) { // 遍历列',
        '            dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j]; // min(上方, 左方) + 当前权重',
        '        }',
        '    }',
        '    return dp[m - 1][n - 1];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int minPathSum(int[][] grid) {',
        '        int m = grid.length, n = grid[0].length;',
        '        int[][] dp = new int[m][n];',
        '        dp[0][0] = grid[0][0];',
        '        for (int i = 1; i < m; i++) dp[i][0] = dp[i - 1][0] + grid[i][0];',
        '        for (int j = 1; j < n; j++) dp[0][j] = dp[0][j - 1] + grid[0][j];',
        '        for (int i = 1; i < m; i++) {',
        '            for (int j = 1; j < n; j++) {',
        '                dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j];',
        '            }',
        '        }',
        '        return dp[m - 1][n - 1];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int minPathSum(vector<vector<int>>& grid) {',
        '        int m = grid.size(), n = grid[0].size();',
        '        vector<vector<int>> dp(m, vector<int>(n, 0));',
        '        dp[0][0] = grid[0][0];',
        '        for (int i = 1; i < m; i++) dp[i][0] = dp[i - 1][0] + grid[i][0];',
        '        for (int j = 1; j < n; j++) dp[0][j] = dp[0][j - 1] + grid[0][j];',
        '        for (int i = 1; i < m; i++) {',
        '            for (int j = 1; j < n; j++) {',
        '                dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j];',
        '            }',
        '        }',
        '        return dp[m - 1][n - 1];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def minPathSum(self, grid: List[List[int]]) -> int:',
        '        m, n = len(grid), len(grid[0])',
        '        dp = [[0] * n for _ in range(m)]',
        '        dp[0][0] = grid[0][0]',
        '        for i in range(1, m): dp[i][0] = dp[i - 1][0] + grid[i][0]',
        '        for j in range(1, n): dp[0][j] = dp[0][j - 1] + grid[0][j]',
        '        for i in range(1, m):',
        '            for j in range(1, n):',
        '                dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j]',
        '        return dp[m - 1][n - 1]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：求解从左上角到右下角的最小路径权值和。',
        2: '获取规模 m 和 n。',
        3: '开辟二维状态表 dp[m][n]。',
        4: '初始化起点：dp[0][0] = grid[0][0]。',
        5: '初始化首列前缀和：首列只能从正上方走下来。',
        6: '初始化首行前缀和：首行只能从正左方走过来。',
        7: '外层遍历行。',
        8: '内层遍历列。',
        9: '状态转移：选择【来自上方】与【来自左方】中较小的一条，加上当前格子自身的权值 grid[i][j]。',
        12: '返回终点最小路径和 dp[m-1][n-1]。',
      },
      java: {
        2: '函数入口。',
        4: '初始化 dp 表。',
        5: '起点初始化。',
        6: '首列前缀累加。',
        7: '首行前缀累加。',
        8: '网格遍历。',
        10: '取 min 转移并加上当前格子权重。',
        13: '返回终点值。',
      },
      cpp: {
        3: '函数入口。',
        5: '初始化 dp 向量。',
        6: '起点值设定。',
        7: '首列累加。',
        8: '首行累加。',
        9: '双层循环。',
        11: 'min 转移。',
        14: '返回答案。',
      },
      python: {
        2: '函数入口。',
        4: '初始化列表。',
        5: '起点初始化。',
        6: '首列累加。',
        7: '首行累加。',
        8: '遍历网格。',
        10: '取 min 加当前权值。',
        11: '返回终点。',
      },
    },
    keyPoints: {
      title: '🎯 最小路径和 5 步法系统精讲',
      summary: 'LeetCode 64。网格路径求极值最优解。核心在于取来自上方与左方的最小值加上当前格自身权重！',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i][j]</code>：从左上角起点 <code>(0, 0)</code> 走到 <code>(i, j)</code> 的最小路径数字总和。', icon: '🎯', badge: '最小累加和' },
        { label: '二、状态转移方程', desc: '<code>dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j]</code>。', icon: '⚡', badge: 'min(上, 左) + w' },
        { label: '三、初始化与边界条件', desc: '• <code>dp[0][0] = grid[0][0]</code>。<br>• 首行：<code>dp[0][j] = dp[0][j - 1] + grid[0][j]</code>。<br>• 首列：<code>dp[i][0] = dp[i - 1][0] + grid[i][0]</code>。', icon: '🎬', badge: '前缀和初始化' },
        { label: '四、复杂度分析', desc: '• 时间复杂度：<code>O(m × n)</code>。<br>• 空间复杂度：<code>O(m × n)</code>。', icon: '⏱️', badge: 'O(m*n)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let grid: number[][] = [
      [1, 3, 1],
      [1, 5, 1],
      [4, 2, 1],
    ];

    if (typeof input === 'object' && input && Array.isArray(input.grid)) {
      grid = input.grid;
    }

    const m = grid.length;
    const n = grid[0].length;
    const dp: DpCell[][] = Array.from({ length: m }, () =>
      Array.from({ length: n }, () => '-')
    );

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      j?: number | string;
      curVal?: number | string;
      curDp?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const gVal = opts.curVal ?? '-';
      const cur = opts.curDp ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'i (当前行)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'j (当前列)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 'grid[i][j] (格子权重)', value: String(gVal), type: (typeof gVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('grid') },
        { name: 'dp[i][j] (最小路径和)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpij') },
        { name: 'm (行数)', value: String(m), type: 'number' as const, changed: chSet.has('m') },
        { name: 'n (列数)', value: String(n), type: 'number' as const, changed: chSet.has('n') },
      ];
    };

    // Step 0: Entry
    push({
      dp2d: clone2d(dp),
      message: `🎯 函数入口：最小路径和。输入网格规模 ${m} × ${n}。`,
      log: `entry: m=${m}, n=${n}`,
      vars: makeVars({ changed: ['m', 'n'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    // Step 1: Init boundaries
    dp[0][0] = grid[0][0];
    for (let r = 1; r < m; r++) dp[r][0] = (dp[r - 1][0] as number) + grid[r][0];
    for (let c = 1; c < n; c++) dp[0][c] = (dp[0][c - 1] as number) + grid[0][c];

    push({
      dp2d: clone2d(dp),
      message: `🎬 初始化边界：起点 dp[0][0] = ${grid[0][0]}，首行首列只能单向直行，累加前缀权重。`,
      log: `init: start=${grid[0][0]}`,
      vars: makeVars({ i: 0, j: 0, curVal: grid[0][0], curDp: grid[0][0], changed: ['dpij'] }),
      codeLine: { java: [5, 6, 7], cpp: [6, 7, 8], python: [5, 6, 7], javascript: [4, 5, 6] },
    });

    // Loops
    for (let i = 1; i < m; i++) {
      for (let j = 1; j < n; j++) {
        const topVal = dp[i - 1][j] as number;
        const leftVal = dp[i][j - 1] as number;
        const cellWeight = grid[i][j];
        const minPrev = Math.min(topVal, leftVal);
        const resultVal = minPrev + cellWeight;
        dp[i][j] = resultVal;

        const isFromTop = topVal <= leftVal;
        push({
          dp2d: clone2d(dp),
          current: { row: i, col: j },
          dependencies: [{ row: i - 1, col: j }, { row: i, col: j - 1 }],
          formula: `dp[${i}][${j}] = min(上方:${topVal}, 左方:${leftVal}) + ${cellWeight} = ${minPrev} + ${cellWeight} = ${resultVal}`,
          message: `⚡ 状态转移：比较【来自上方 (${topVal})】vs【来自左方 (${leftVal})】，选择较优的【${isFromTop ? '上方' : '左方'}】+ 当前格子权值 ${cellWeight} $\rightarrow$ dp[${i}][${j}] = ${resultVal}。`,
          log: `update: dp[${i}][${j}] = ${resultVal}`,
          vars: makeVars({ i, j, curVal: cellWeight, curDp: resultVal, changed: ['i', 'j', 'grid', 'dpij'] }),
          codeLine: {
            java: { primary: 10, context: [8, 9] },
            cpp: { primary: 10, context: [8, 9] },
            python: { primary: 9, context: [7, 8] },
            javascript: { primary: 9, context: [7, 8] },
          },
        });
      }
    }

    const ans = dp[m - 1][n - 1] as number;
    push({
      dp2d: clone2d(dp),
      current: { row: m - 1, col: n - 1 },
      message: `🏁 算法结束：到达右下角 (${m - 1}, ${n - 1}) 的最小路径总和为 dp[${m - 1}][${n - 1}] = ${ans}。`,
      log: `return: dp[${m - 1}][${n - 1}] = ${ans}`,
      vars: makeVars({ i: m - 1, j: n - 1, curDp: ans, changed: ['dpij'] }),
      codeLine: { java: 13, cpp: 13, python: 11, javascript: 12 },
    });

    return steps;
  },
};
