import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const MaximalSquareSpec: AlgorithmSpec = {
  id: 'maximal-square',
  name: '最大正方形 (Maximal Square)',
  category: '网格 DP',
  description: '在一个由 \'0\' 和 \'1\' 组成的二维矩阵内，找到只包含 \'1\' 的最大正方形，并返回其面积。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 221,
    leetcodeUrl: 'https://leetcode.cn/problems/maximal-square/',
    difficulty: 'medium',
    tags: ['数组', '动态规划', '矩阵', '网格DP'],
    description: '在一个由 <code>\'0\'</code> 和 <code>\'1\'</code> 组成的二维矩阵内，找到只包含 <code>\'1\'</code> 的最大正方形，并返回其面积。<br/><br/><strong>核心结论</strong>：若当前格子为 <code>\'1\'</code>，则以它为右下角的最大全 1 正方形边长等于左、上、左上三个方向边长的 <strong>最小值加 1</strong>（木桶短板原理）！',
    examples: [
      {
        input: 'matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]',
        output: '4',
        explanation: '最大正方形的边长为 2，面积为 2 * 2 = 4。',
      },
      {
        input: 'matrix = [["0","1"],["1","0"]]',
        output: '1',
      },
    ],
    constraints: [
      'm == matrix.length',
      'n == matrix[i].length',
      '1 <= m, n <= 300',
      'matrix[i][j] 为 \'0\' 或 \'1\'',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: 4, cpp: 4, python: 3, javascript: 3 },
    loopCheck: { java: 6, cpp: 6, python: 5, javascript: 5 },
    innerLoopCheck: { java: 7, cpp: 7, python: 6, javascript: 6 },
    stateTransfer: {
      java: { primary: [9, 10], context: [7, 8] },
      cpp: { primary: [9, 10], context: [7, 8] },
      python: { primary: [8, 9], context: [6, 7] },
      javascript: { primary: [8, 9], context: [6, 7] },
    },
    loopExit: { java: 6, cpp: 6, python: 5, javascript: 5 },
    returnResult: { java: 16, cpp: 16, python: 12, javascript: 15 },
  },
  code: {
    languages: {
      javascript: [
        'function maximalSquare(matrix) {',
        '    const m = matrix.length, n = matrix[0].length;',
        '    const dp = Array.from({ length: m }, () => new Array(n).fill(0));',
        '    let maxSide = 0;',
        '    for (let i = 0; i < m; i++) { // 遍历行',
        '        for (let j = 0; j < n; j++) { // 遍历列',
        '            if (matrix[i][j] === "1" || matrix[i][j] === 1) {',
        '                if (i === 0 || j === 0) dp[i][j] = 1; // 边界边长为 1',
        '                else dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;',
        '                maxSide = Math.max(maxSide, dp[i][j]);',
        '            }',
        '        }',
        '    }',
        '    return maxSide * maxSide; // 面积 = 边长平方',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int maximalSquare(char[][] matrix) {',
        '        int m = matrix.length, n = matrix[0].length;',
        '        int[][] dp = new int[m][n];',
        '        int maxSide = 0;',
        '        for (int i = 0; i < m; i++) {',
        '            for (int j = 0; j < n; j++) {',
        '                if (matrix[i][j] == \'1\') {',
        '                    if (i == 0 || j == 0) dp[i][j] = 1;',
        '                    else dp[i][j] = Math.min(Math.min(dp[i - 1][j], dp[i][j - 1]), dp[i - 1][j - 1]) + 1;',
        '                    maxSide = Math.max(maxSide, dp[i][j]);',
        '                }',
        '            }',
        '        }',
        '        return maxSide * maxSide;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int maximalSquare(vector<vector<char>>& matrix) {',
        '        int m = matrix.size(), n = matrix[0].size();',
        '        vector<vector<int>> dp(m, vector<int>(n, 0));',
        '        int maxSide = 0;',
        '        for (int i = 0; i < m; i++) {',
        '            for (int j = 0; j < n; j++) {',
        '                if (matrix[i][j] == \'1\') {',
        '                    if (i == 0 || j == 0) dp[i][j] = 1;',
        '                    else dp[i][j] = min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]}) + 1;',
        '                    maxSide = max(maxSide, dp[i][j]);',
        '                }',
        '            }',
        '        }',
        '        return maxSide * maxSide;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def maximalSquare(self, matrix: List[List[str]]) -> int:',
        '        m, n = len(matrix), len(matrix[0])',
        '        dp = [[0] * n for _ in range(m)]',
        '        max_side = 0',
        '        for i in range(m):',
        '            for j in range(n):',
        '                if matrix[i][j] == \'1\':',
        '                    if i == 0 or j == 0: dp[i][j] = 1',
        '                    else: dp[i][j] = min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1',
        '                    max_side = max(max_side, dp[i][j])',
        '        return max_side * max_side',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：寻找只包含 1 的最大正方形面积。',
        2: '获取网格行数 m 与列数 n。',
        3: '开辟 dp 状态网格：dp[i][j] 表示以 (i, j) 为右下角的最大正方形边长。',
        4: '初始化全局最大边长 maxSide = 0。',
        5: '外层遍历行。',
        6: '内层遍历列。',
        7: '有效格子判断：只有当 matrix[i][j] === 1 时才可能构成正方形右下角。',
        8: '边界处理：处于第 0 行或第 0 列且为 1 的格子，最大边长必为 1。',
        9: '三向短板效应：dp[i][j] = min(上方, 左方, 左上方) + 1。',
        10: '更新全局最大边长。',
        14: '返回正方形面积 maxSide * maxSide。',
      },
      java: {
        2: '函数入口。',
        4: '初始化 dp 数组。',
        6: '双层网格遍历。',
        8: '有效格子分支。',
        9: '边界与三向 min 状态转移。',
        11: '维护 maxSide。',
        15: '返回面积。',
      },
      cpp: {
        3: '函数入口。',
        5: '初始化 dp 向量。',
        7: '循环遍历。',
        9: '1 判定。',
        10: '三向短板转移。',
        15: '返回边长平方。',
      },
      python: {
        2: '函数入口。',
        4: '初始化列表。',
        6: '网格遍历。',
        8: '三向 min 转移。',
        10: '更新最大边长。',
        11: '返回面积。',
      },
    },
    keyPoints: {
      title: '🎯 最大正方形 5 步法系统精讲',
      summary: 'LeetCode 221。经典网格几何状态转移。核心在于木桶短板原理：右下角 (i, j) 能扩张的正方形受制于其正上方、正左方与左上方三个相邻子正方形的共同最小值！',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i][j]</code>：以 <code>(i, j)</code> 为<strong>右下角</strong>且只包含 <code>1</code> 的最大正方形的<strong>边长</strong>。', icon: '🎯', badge: '右下角边长' },
        { label: '二、状态转移方程 (三向木桶原理)', desc: '若 <code>matrix[i][j] == \'1\'</code>：<br><code>dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1</code>。<br>若为 <code>\'0\'</code> 则 <code>dp[i][j] = 0</code>。', icon: '⚡', badge: '三向求min+1' },
        { label: '三、初始化与边界条件', desc: '处于第 0 行或第 0 列的 1，由于无法形成 2x2 以上正方形，<code>dp</code> 值为 1。', icon: '🎬', badge: '边界为1' },
        { label: '四、面积计算', desc: '最终面积等于最大边长的平方 <code>maxSide × maxSide</code>。', icon: '⏱️', badge: 'maxSide^2' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let matrix: (string | number)[][] = [
      ['1', '0', '1', '0', '0'],
      ['1', '0', '1', '1', '1'],
      ['1', '1', '1', '1', '1'],
      ['1', '0', '0', '1', '0'],
    ];

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.matrix)) matrix = input.matrix;
      else if (Array.isArray(input.grid)) matrix = input.grid;
    }

    const m = matrix.length;
    const n = matrix[0].length;
    const dp: DpCell[][] = Array.from({ length: m }, () =>
      Array.from({ length: n }, () => '-')
    );

    let maxSide = 0;
    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      j?: number | string;
      curVal?: string | number;
      curDp?: number | string;
      curMax?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const mVal = opts.curVal ?? '-';
      const cur = opts.curDp ?? '-';
      const mx = opts.curMax ?? maxSide;
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'i (当前行)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'j (当前列)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 'matrix[i][j]', value: String(mVal), type: 'string' as const, changed: chSet.has('mat') },
        { name: 'dp[i][j] (边长)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpij') },
        { name: 'maxSide (最大边长)', value: String(mx), type: 'number' as const, changed: chSet.has('mx') },
        { name: 'm (行数)', value: String(m), type: 'number' as const, changed: chSet.has('m') },
        { name: 'n (列数)', value: String(n), type: 'number' as const, changed: chSet.has('n') },
      ];
    };

    // Step 0: Entry
    push({
      dp2d: clone2d(dp),
      message: `🎯 函数入口：最大正方形。网格规模 ${m} × ${n}，寻找只包含 1 的最大正方形面积。`,
      log: `entry: m=${m}, n=${n}`,
      vars: makeVars({ changed: ['m', 'n'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    // Loops
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        const val = matrix[i][j];
        const isOne = val === '1' || val === 1;

        if (!isOne) {
          dp[i][j] = 0;
          push({
            dp2d: clone2d(dp),
            current: { row: i, col: j },
            formula: `matrix[${i}][${j}] = '0' => dp[${i}][${j}] = 0`,
            message: `⚪ 元素为 '0'：坐标 (${i}, ${j}) 无法作为正方形右下角，dp[${i}][${j}] = 0。`,
            log: `dp[${i}][${j}] = 0`,
            vars: makeVars({ i, j, curVal: val, curDp: 0, changed: ['i', 'j', 'mat', 'dpij'] }),
            codeLine: {
              java: { primary: 7, context: [6] },
              cpp: { primary: 7, context: [6] },
              python: { primary: 6, context: [5] },
              javascript: { primary: 6, context: [5] },
            },
          });
        } else if (i === 0 || j === 0) {
          dp[i][j] = 1;
          maxSide = Math.max(maxSide, 1);
          push({
            dp2d: clone2d(dp),
            current: { row: i, col: j },
            formula: `边界元素 '1' => dp[${i}][${j}] = 1`,
            message: `🎬 边界 '1'：处于第 ${i === 0 ? '0 行' : '0 列'} 边缘，最大边长为 1。`,
            log: `boundary: dp[${i}][${j}] = 1`,
            vars: makeVars({ i, j, curVal: val, curDp: 1, curMax: maxSide, changed: ['i', 'j', 'mat', 'dpij', 'mx'] }),
            codeLine: {
              java: { primary: 9, context: [6, 7] },
              cpp: { primary: 9, context: [6, 7] },
              python: { primary: 8, context: [5, 6] },
              javascript: { primary: 8, context: [5, 6] },
            },
          });
        } else {
          const topVal = dp[i - 1][j] as number;
          const leftVal = dp[i][j - 1] as number;
          const topLeftVal = dp[i - 1][j - 1] as number;
          const minNeighbor = Math.min(topVal, leftVal, topLeftVal);
          const resultVal = minNeighbor + 1;
          dp[i][j] = resultVal;
          maxSide = Math.max(maxSide, resultVal);

          push({
            dp2d: clone2d(dp),
            current: { row: i, col: j },
            dependencies: [{ row: i - 1, col: j }, { row: i, col: j - 1 }, { row: i - 1, col: j - 1 }],
            formula: `dp[${i}][${j}] = min(上:${topVal}, 左:${leftVal}, 左上:${topLeftVal}) + 1 = ${minNeighbor} + 1 = ${resultVal}`,
            message: `⚡ 三向短板转移：比较【上:${topVal}】、【左:${leftVal}】、【左上:${topLeftVal}】，短板为 ${minNeighbor} $\rightarrow$ 扩张边长 dp[${i}][${j}] = ${resultVal}。当前最大边长 maxSide = ${maxSide}。`,
            log: `update: dp[${i}][${j}] = ${resultVal}, maxSide = ${maxSide}`,
            vars: makeVars({ i, j, curVal: val, curDp: resultVal, curMax: maxSide, changed: ['i', 'j', 'mat', 'dpij', 'mx'] }),
            codeLine: {
              java: { primary: 10, context: [6, 7] },
              cpp: { primary: 10, context: [6, 7] },
              python: { primary: 9, context: [5, 6] },
              javascript: { primary: 9, context: [5, 6] },
            },
          });
        }
      }
    }

    const maxArea = maxSide * maxSide;
    push({
      dp2d: clone2d(dp),
      message: `🏁 算法结束：只包含 1 的最大正方形边长为 ${maxSide}，最大面积为 ${maxSide} × ${maxSide} = ${maxArea}。`,
      log: `return: maxArea = ${maxArea}`,
      vars: makeVars({ curMax: maxSide, curDp: maxArea, changed: ['dpij', 'mx'] }),
      codeLine: { java: 15, cpp: 15, python: 12, javascript: 14 },
    });

    return steps;
  },
};
