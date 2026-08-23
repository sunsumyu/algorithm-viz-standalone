import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const UniquePathsIiSpec: AlgorithmSpec = {
  id: 'unique-paths-ii',
  name: '不同路径 II (Unique Paths II)',
  category: '网格 DP',
  description: '给定一个包含 0 和 1 的网格 obstacleGrid ，其中 1 表示障碍物，0 表示空位置。机器人从左上角出发，求到达右下角的不同路径数。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 63,
    leetcodeUrl: 'https://leetcode.cn/problems/unique-paths-ii/',
    difficulty: 'medium',
    tags: ['数组', '动态规划', '矩阵', '网格DP'],
    description: '给定一个 <code>m x n</code> 的整数数组 <code>obstacleGrid</code> 。<br/><br/>网格中的 <code>1</code> 表示 <strong>障碍物</strong> ，<code>0</code> 表示 <strong>空位置</strong> 。<br/><br/>机器人从左上角 <code>(0, 0)</code> 出发，每次只能 <strong>向下</strong> 或 <strong>向右</strong> 移动一步，返回到达右下角 <code>(m-1, n-1)</code> 的不同路径总数。<br/><br/>如果起点或终点本身就是障碍物，则无法到达，返回 <code>0</code> 。',
    examples: [
      {
        input: 'obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]',
        output: '2',
        explanation: '3x3 网格的正中间 (1, 1) 有一个障碍物。<br/>从左上角到右下角一共有 2 条不同的路径：<br/>1. 向右 -> 向右 -> 向下 -> 向下<br/>2. 向下 -> 向下 -> 向右 -> 向右',
      },
      {
        input: 'obstacleGrid = [[0,1],[0,0]]',
        output: '1',
      },
    ],
    constraints: [
      'm == obstacleGrid.length',
      'n == obstacleGrid[i].length',
      '1 <= m, n <= 100',
      'obstacleGrid[i][j] 为 0 或 1',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    guard: { java: 5, cpp: 5, python: 5, javascript: 4 },
    init: { java: [6, 7], cpp: [6, 7], python: [6, 7], javascript: [5, 6] },
    loopCheck: { java: 8, cpp: 8, python: 8, javascript: 7 },
    innerLoopCheck: { java: 9, cpp: 9, python: 9, javascript: 8 },
    stateTransfer: {
      java: { primary: [10, 12], context: [8, 9] },
      cpp: { primary: [10, 12], context: [8, 9] },
      python: { primary: [10, 12], context: [8, 9] },
      javascript: { primary: [9, 11], context: [7, 8] },
    },
    loopExit: { java: 8, cpp: 8, python: 8, javascript: 7 },
    returnResult: { java: 16, cpp: 16, python: 13, javascript: 15 },
  },
  code: {
    languages: {
      javascript: [
        'function uniquePathsWithObstacles(obstacleGrid) {',
        '    const m = obstacleGrid.length, n = obstacleGrid[0].length;',
        '    if (obstacleGrid[0][0] === 1 || obstacleGrid[m - 1][n - 1] === 1) return 0; // 起点或终点受阻',
        '    const dp = Array.from({ length: m }, () => new Array(n).fill(0));',
        '    for (let i = 0; i < m && obstacleGrid[i][0] === 0; i++) dp[i][0] = 1; // 初始化首列（遇障碍则后方不可达）',
        '    for (let j = 0; j < n && obstacleGrid[0][j] === 0; j++) dp[0][j] = 1; // 初始化首行',
        '    for (let i = 1; i < m; i++) { // 遍历行',
        '        for (let j = 1; j < n; j++) { // 遍历列',
        '            if (obstacleGrid[i][j] === 1) {',
        '                dp[i][j] = 0; // 障碍物位置路径数为 0',
        '            } else {',
        '                dp[i][j] = dp[i - 1][j] + dp[i][j - 1]; // 来自上方 + 来自左方',
        '            }',
        '        }',
        '    }',
        '    return dp[m - 1][n - 1];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int uniquePathsWithObstacles(int[][] obstacleGrid) {',
        '        int m = obstacleGrid.length, n = obstacleGrid[0].length;',
        '        if (obstacleGrid[0][0] == 1 || obstacleGrid[m - 1][n - 1] == 1) return 0;',
        '        int[][] dp = new int[m][n];',
        '        for (int i = 0; i < m && obstacleGrid[i][0] == 0; i++) dp[i][0] = 1;',
        '        for (int j = 0; j < n && obstacleGrid[0][j] == 0; j++) dp[0][j] = 1;',
        '        for (int i = 1; i < m; i++) {',
        '            for (int j = 1; j < n; j++) {',
        '                if (obstacleGrid[i][j] == 1) dp[i][j] = 0;',
        '                else dp[i][j] = dp[i - 1][j] + dp[i][j - 1];',
        '            }',
        '        }',
        '        return dp[m - 1][n - 1];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int uniquePathsWithObstacles(vector<vector<int>>& obstacleGrid) {',
        '        int m = obstacleGrid.size(), n = obstacleGrid[0].size();',
        '        if (obstacleGrid[0][0] == 1 || obstacleGrid[m - 1][n - 1] == 1) return 0;',
        '        vector<vector<int>> dp(m, vector<int>(n, 0));',
        '        for (int i = 0; i < m && obstacleGrid[i][0] == 0; i++) dp[i][0] = 1;',
        '        for (int j = 0; j < n && obstacleGrid[0][j] == 0; j++) dp[0][j] = 1;',
        '        for (int i = 1; i < m; i++) {',
        '            for (int j = 1; j < n; j++) {',
        '                if (obstacleGrid[i][j] == 1) dp[i][j] = 0;',
        '                else dp[i][j] = dp[i - 1][j] + dp[i][j - 1];',
        '            }',
        '        }',
        '        return dp[m - 1][n - 1];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def uniquePathsWithObstacles(self, obstacleGrid: List[List[int]]) -> int:',
        '        m, n = len(obstacleGrid), len(obstacleGrid[0])',
        '        if obstacleGrid[0][0] == 1 or obstacleGrid[m - 1][n - 1] == 1: return 0',
        '        dp = [[0] * n for _ in range(m)]',
        '        for i in range(m):',
        '            if obstacleGrid[i][0] == 1: break',
        '            dp[i][0] = 1',
        '        for j in range(n):',
        '            if obstacleGrid[0][j] == 1: break',
        '            dp[0][j] = 1',
        '        for i in range(1, m):',
        '            for j in range(1, n):',
        '                if obstacleGrid[i][j] == 1: dp[i][j] = 0',
        '                else: dp[i][j] = dp[i - 1][j] + dp[i][j - 1]',
        '        return dp[m - 1][n - 1]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：带障碍物的不同路径求解。',
        2: '获取网格行数 m 与列数 n。',
        3: '起点终点障碍特判：若起点 (0,0) 或终点 (m-1,n-1) 本身有障碍物，路径必然为 0。',
        4: '开辟 dp[m][n] 状态网格，填充 0。',
        5: '首列初始化：单向向下，遇到第一个障碍物后，下方所有格子均无法到达，直接中断。',
        6: '首行初始化：单向向右，遇到第一个障碍物后，右侧所有格子均无法到达，直接中断。',
        7: '外层遍历行。',
        8: '内层遍历列。',
        9: '障碍物判定：obstacleGrid[i][j] === 1 时，机器人无法站立，路径数为 0。',
        11: '常规状态转移：来自上方加来自左方 dp[i][j] = dp[i-1][j] + dp[i][j-1]。',
        15: '返回终点路径数 dp[m-1][n-1]。',
      },
      java: {
        2: '函数入口。',
        4: '起点终点受阻特判。',
        5: '定义 dp 表。',
        6: '首列中断初始化。',
        7: '首行中断初始化。',
        8: '遍历网格。',
        10: '障碍物置 0。',
        11: '上方+左方转移。',
        14: '返回终点值。',
      },
      cpp: {
        3: '函数入口。',
        5: '边界受阻特判。',
        6: '初始化 dp 向量。',
        7: '首列首行遇障中断。',
        9: '双层循环。',
        11: '障碍与转移分支。',
        15: '返回结果。',
      },
      python: {
        2: '函数入口。',
        4: '特判返回 0。',
        5: '初始化全 0 列表。',
        7: '首列循环 break。',
        10: '首行循环 break。',
        12: '遍历网格。',
        14: '障碍与转移。',
        15: '返回终点。',
      },
    },
    keyPoints: {
      title: '🎯 不同路径 II 5 步法系统精讲',
      summary: 'LeetCode 63。在不同路径基础上的障碍扩展。核心在于：① 首行首列一旦遇到障碍物，其后方的格子路径数全部为 0（无法跨越）；② 内部障碍格子 dp 强制置 0！',
      points: [
        { label: '一、障碍物核心法则', desc: '<code>if (obstacleGrid[i][j] === 1) dp[i][j] = 0;</code>（障碍物不可通行）。', icon: '🚧', badge: '障碍置0' },
        { label: '二、首行首列中断机制', desc: '首行首列只能单向直行，一旦遇到障碍物，<strong>其后方所有格子直接为 0</strong>，不能盲目初始化为 1！', icon: '🎬', badge: '遇障即止' },
        { label: '三、状态转移方程', desc: '无障碍时：<code>dp[i][j] = dp[i - 1][j] + dp[i][j - 1]</code>。', icon: '⚡', badge: '常规转移' },
        { label: '四、起点终点特判', desc: '若起点 <code>(0, 0)</code> 或终点 <code>(m-1, n-1)</code> 是障碍物，直接返回 0。', icon: '🎯', badge: '快速剪枝' },
        { label: '五、复杂度分析', desc: '• 时间复杂度：<code>O(m × n)</code>。<br>• 空间复杂度：<code>O(m × n)</code>。', icon: '⏱️', badge: 'O(m*n)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let grid: number[][] = [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ];

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.grid)) grid = input.grid;
      else if (Array.isArray(input.obstacleGrid)) grid = input.obstacleGrid;
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
      isObs?: boolean;
      curDp?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const obsStr = opts.isObs != null ? (opts.isObs ? '🚧 是' : '🟩 否') : '-';
      const cur = opts.curDp ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'i (当前行)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'j (当前列)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: '是否障碍物', value: obsStr, type: 'string' as const, changed: chSet.has('obs') },
        { name: 'dp[i][j] (路径数)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpij') },
        { name: 'm (行数)', value: String(m), type: 'number' as const, changed: chSet.has('m') },
        { name: 'n (列数)', value: String(n), type: 'number' as const, changed: chSet.has('n') },
      ];
    };

    const obstacleCoords: Array<[number, number]> = [];
    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        if (grid[r][c] === 1) {
          obstacleCoords.push([r, c]);
        }
      }
    }

    const makeThematicMeta = (curRow: number, curCol: number, status: any, pathCountVal: number) => ({
      type: 'grid' as const,
      grid: {
        rows: m,
        cols: n,
        curRow,
        curCol,
        obstacles: obstacleCoords,
        dp2d: clone2d(dp),
        pathCount: pathCountVal,
        status,
      },
    });

    // Step 0: Entry
    push({
      dp2d: clone2d(dp),
      thematicMeta: makeThematicMeta(0, 0, 'enter', 0),
      message: `🎯 函数入口：不同路径 II。带障碍网格规模 ${m} × ${n}，图中已标记出 🚧 障碍物位置。`,
      log: `entry: m=${m}, n=${n}`,
      vars: makeVars({ changed: ['m', 'n'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    if (grid[0][0] === 1 || grid[m - 1][n - 1] === 1) {
      dp[0][0] = grid[0][0] === 1 ? 0 : 1;
      push({
        dp2d: clone2d(dp),
        thematicMeta: makeThematicMeta(0, 0, 'eval-obstacle', 0),
        message: `❌ 快速剪枝：${grid[0][0] === 1 ? '起点 (0,0)' : '终点 (m-1,n-1)'} 处为障碍物 🚧，无法通行，直接返回 0。`,
        log: `blocked start/end: return 0`,
        vars: makeVars({ isObs: true, curDp: 0 }),
        codeLine: { java: 4, cpp: 4, python: 4, javascript: 3 },
      });
      return steps;
    }

    // Step 1: Init boundaries
    for (let r = 0; r < m; r++) {
      if (grid[r][0] === 1) {
        for (let k = r; k < m; k++) dp[k][0] = 0;
        break;
      }
      dp[r][0] = 1;
    }

    for (let c = 0; c < n; c++) {
      if (grid[0][c] === 1) {
        for (let k = c; k < n; k++) dp[0][k] = 0;
        break;
      }
      dp[0][c] = 1;
    }

    push({
      dp2d: clone2d(dp),
      thematicMeta: makeThematicMeta(0, 0, 'init', 1),
      message: `🎬 边界初始化：首行与首列只能单方向前进，一旦遇到障碍物 🚧，后续格子路径数均为 0。`,
      log: `init boundaries with obstacle check`,
      vars: makeVars({ curDp: 1, changed: ['dpij'] }),
      codeLine: { java: [6, 7], cpp: [6, 7], python: [6, 7], javascript: [5, 6] },
    });

    // Loops
    for (let i = 1; i < m; i++) {
      for (let j = 1; j < n; j++) {
        const isObs = grid[i][j] === 1;

        if (isObs) {
          dp[i][j] = 0;
          push({
            dp2d: clone2d(dp),
            current: { row: i, col: j },
            dependencies: [],
            thematicMeta: makeThematicMeta(i, j, 'eval-obstacle', 0),
            formula: `obstacleGrid[${i}][${j}] = 1 => dp[${i}][${j}] = 0`,
            message: `🚧 遇到障碍物：坐标 (${i}, ${j}) 为障碍物，机器人无法站立，设置 dp[${i}][${j}] = 0。`,
            log: `obstacle at (${i},${j}): dp=0`,
            vars: makeVars({ i, j, isObs: true, curDp: 0, changed: ['i', 'j', 'obs', 'dpij'] }),
            codeLine: {
              java: { primary: 10, context: [8, 9] },
              cpp: { primary: 10, context: [8, 9] },
              python: { primary: 10, context: [8, 9] },
              javascript: { primary: 9, context: [7, 8] },
            },
          });
        } else {
          const fromTop = (dp[i - 1][j] as number) || 0;
          const fromLeft = (dp[i][j - 1] as number) || 0;
          const sum = fromTop + fromLeft;
          dp[i][j] = sum;

          push({
            dp2d: clone2d(dp),
            current: { row: i, col: j },
            dependencies: [{ row: i - 1, col: j }, { row: i, col: j - 1 }],
            thematicMeta: makeThematicMeta(i, j, 'update', sum),
            formula: `dp[${i}][${j}] = dp[${i - 1}][${j}] (${fromTop}) + dp[${i}][${j - 1}] (${fromLeft}) = ${sum}`,
            message: `⚡ 状态转移：坐标 (${i}, ${j}) 无障碍 $\rightarrow$ 来自上方 (${fromTop}) + 来自左方 (${fromLeft}) = ${sum} 条路径。`,
            log: `update: dp[${i}][${j}] = ${sum}`,
            vars: makeVars({ i, j, isObs: false, curDp: sum, changed: ['i', 'j', 'obs', 'dpij'] }),
            codeLine: {
              java: { primary: 11, context: [8, 9] },
              cpp: { primary: 11, context: [8, 9] },
              python: { primary: 11, context: [8, 9] },
              javascript: { primary: 11, context: [7, 8] },
            },
          });
        }
      }
    }

    const ans = dp[m - 1][n - 1] as number;
    push({
      dp2d: clone2d(dp),
      current: { row: m - 1, col: n - 1 },
      thematicMeta: makeThematicMeta(m - 1, n - 1, 'completed', ans),
      message: `🏁 算法结束：避开障碍物到达终点的不同路径总数为 dp[${m - 1}][${n - 1}] = ${ans} 条。`,
      log: `return: dp[${m - 1}][${n - 1}] = ${ans}`,
      vars: makeVars({ i: m - 1, j: n - 1, curDp: ans, changed: ['dpij'] }),
      codeLine: { java: 14, cpp: 15, python: 13, javascript: 15 },
    });

    return steps;
  },
};
