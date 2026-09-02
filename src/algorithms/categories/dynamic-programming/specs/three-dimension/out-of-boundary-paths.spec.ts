import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 出界的路径数 (Out of Boundary Paths)
 * LeetCode 576 / 左程云算法通关课 第069讲 三维DP
 * 状态定义：dp[step][r][c] 表示剩余 step 步，从坐标 (r, c) 移动能够移出网格边界的所有可能路径数（对 10^9 + 7 取模）。
 */
export const OutOfBoundaryPathsSpec: AlgorithmSpec = {
  id: 'out-of-boundary-paths',
  name: '出界的路径数 (Out of Boundary Paths)',
  category: '三维 DP',
  description:
    '给定 m x n 网格与最大移动步数 maxMove。球从 (startRow, startColumn) 出发，每次向上下左右之一移动一格。求能够将球移出网格边界的路径总数（结果模 10^9 + 7）。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 576,
    leetcodeUrl: 'https://leetcode.cn/problems/out-of-boundary-paths/',
    difficulty: 'medium',
    tags: ['动态规划', '三维DP', '计数DP'],
    description:
      '给你一个大小为 <code>m x n</code> 的网格和一个球。球的起始坐标为 <code>(startRow, startColumn)</code>。你可以将球移到相邻的单元格（上下左右）。<br/><br/>你最多可以移动 <code>maxMove</code> 次球。只要球在某一步被移出了网格边界，这条路径就算一条出界路径。<br/><br/>给你五个整数 <code>m</code>、<code>n</code>、<code>maxMove</code>、<code>startRow</code> 以及 <code>startColumn</code>，请你返回可以将球移出网格边界的路径总数。因为答案可能很大，返回对 <code>10^9 + 7</code> 取余后的结果。',
    examples: [
      {
        input: 'm = 2, n = 2, maxMove = 2, startRow = 0, startColumn = 0',
        output: '6',
        explanation: '第1步出界有2条（向上/向左）；第2步出界有4条（向下后出界2条，向右后出界2条），总计 6 条。',
      },
      {
        input: 'm = 1, n = 3, maxMove = 3, startRow = 0, startColumn = 1',
        output: '12',
        explanation: '在 1x3 网格中中间格子出发，3步内出界路径数为 12。',
      },
    ],
    constraints: [
      '1 <= m, n <= 50',
      '0 <= maxMove <= 50',
      '0 <= startRow < m',
      '0 <= startColumn < n',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 4, python: 3, javascript: 2 },
    init: { java: 6, cpp: 7, python: 6, javascript: 5 },
    loopCheck: { java: 8, cpp: 9, python: 8, javascript: 7 },
    innerLoopCheck: { java: 9, cpp: 10, python: 9, javascript: 8 },
    stateTransfer: {
      java: [13, 14, 15, 16, 17, 18],
      cpp: [14, 15, 16, 17, 18, 19],
      python: [12, 13, 14, 15, 16],
      javascript: [11, 12, 13, 14, 15],
    },
    loopExit: { java: 22, cpp: 23, python: 18, javascript: 19 },
    returnResult: { java: 24, cpp: 25, python: 19, javascript: 21 },
  },
  code: {
    languages: {
      javascript: [
        'function findPaths(m, n, maxMove, startRow, startColumn) {',
        '  if (maxMove === 0) return 0;',
        '  const MOD = 1000000007;',
        '  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];',
        '  let dp = Array.from({ length: m }, () => Array(n).fill(0));',
        '  for (let step = 1; step <= maxMove; step++) {',
        '    const nextDp = Array.from({ length: m }, () => Array(n).fill(0));',
        '    for (let r = 0; r < m; r++) {',
        '      for (let c = 0; c < n; c++) {',
        '        for (const [dr, dc] of dirs) {',
        '          const nr = r + dr, nc = c + dc;',
        '          if (nr < 0 || nr >= m || nc < 0 || nc >= n) {',
        '            nextDp[r][c] = (nextDp[r][c] + 1) % MOD;',
        '          } else {',
        '            nextDp[r][c] = (nextDp[r][c] + dp[nr][nc]) % MOD;',
        '          }',
        '        }',
        '      }',
        '    }',
        '    dp = nextDp;',
        '  }',
        '  return dp[startRow][startColumn];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int findPaths(int m, int n, int maxMove, int startRow, int startColumn) {',
        '        if (maxMove == 0) return 0;',
        '        int MOD = 1000000007;',
        '        int[][] dirs = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};',
        '        int[][] dp = new int[m][n];',
        '        for (int step = 1; step <= maxMove; step++) {',
        '            int[][] nextDp = new int[m][n];',
        '            for (int r = 0; r < m; r++) {',
        '                for (int c = 0; c < n; c++) {',
        '                    for (int[] d : dirs) {',
        '                        int nr = r + d[0], nc = c + d[1];',
        '                        if (nr < 0 || nr >= m || nc < 0 || nc >= n) {',
        '                            nextDp[r][c] = (nextDp[r][c] + 1) % MOD;',
        '                        } else {',
        '                            nextDp[r][c] = (nextDp[r][c] + dp[nr][nc]) % MOD;',
        '                        }',
        '                    }',
        '                }',
        '            }',
        '            dp = nextDp;',
        '        }',
        '        return dp[startRow][startColumn];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int findPaths(int m, int n, int maxMove, int startRow, int startColumn) {',
        '        if (maxMove == 0) return 0;',
        '        const int MOD = 1e9 + 7;',
        '        vector<pair<int,int>> dirs = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};',
        '        vector<vector<int>> dp(m, vector<int>(n, 0));',
        '        for (int step = 1; step <= maxMove; step++) {',
        '            vector<vector<int>> nextDp(m, vector<int>(n, 0));',
        '            for (int r = 0; r < m; r++) {',
        '                for (int c = 0; c < n; c++) {',
        '                    for (auto& d : dirs) {',
        '                        int nr = r + d.first, nc = c + d.second;',
        '                        if (nr < 0 || nr >= m || nc < 0 || nc >= n) {',
        '                            nextDp[r][c] = (nextDp[r][c] + 1) % MOD;',
        '                        } else {',
        '                            nextDp[r][c] = (nextDp[r][c] + dp[nr][nc]) % MOD;',
        '                        }',
        '                    }',
        '                }',
        '            }',
        '            dp = move(nextDp);',
        '        }',
        '        return dp[startRow][startColumn];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def findPaths(self, m: int, n: int, maxMove: int, startRow: int, startColumn: int) -> int:',
        '        if maxMove == 0:',
        '            return 0',
        '        MOD = 10**9 + 7',
        '        dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]',
        '        dp = [[0] * n for _ in range(m)]',
        '        for step in range(1, maxMove + 1):',
        '            next_dp = [[0] * n for _ in range(m)]',
        '            for r in range(m):',
        '                for c in range(n):',
        '                    for dr, dc in dirs:',
        '                        nr, nc = r + dr, c + dc',
        '                        if nr < 0 or nr >= m or nc < 0 or nc >= n:',
        '                            next_dp[r][c] = (next_dp[r][c] + 1) % MOD',
        '                        else:',
        '                            next_dp[r][c] = (next_dp[r][c] + dp[nr][nc]) % MOD',
        '            dp = next_dp',
        '        return dp[startRow][startColumn]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口，传入网格尺寸 m, n，步数 maxMove，起点 (startRow, startColumn)。',
        2: '步数为 0 时无法移出边界，直接返回 0。',
        5: '初始化 0 步状态表 dp[r][c] = 0。',
        6: '外层遍历步数 step 从 1 到 maxMove。',
        12: '移出边界的移动直接贡献 1 条出界路径。',
        14: '界内的移动累加 step-1 步后继单元格的出界路径数。',
        21: '返回起始单元格剩余 maxMove 步的出界路径总数。',
      },
      java: {
        2: '方法入口。',
        6: '初始化 0 步状态表。',
        7: '外层遍历步数。',
        13: '越界直接 +1。',
        15: '界内累加子状态。',
        23: '返回起点答案。',
      },
      cpp: {
        3: '函数入口。',
        7: '初始化二维状态。',
        8: '滚动三维状态。',
        15: '越界累加 1。',
        24: '返回起点结果。',
      },
      python: {
        2: '方法入口。',
        7: '初始化 0 步矩阵。',
        8: '递增剩余步数。',
        14: '出界 +1，界内 +dp[nr][nc]。',
        18: '返回起点计数。',
      },
    },
    keyPoints: {
      thinking:
        '三维状态定义：dp[step][r][c] 表示剩余 step 步，从 (r, c) 出发能出界的总路径数。4个方向转移时，若移出边界则产生 1 条有效出界路径；若仍在界内则依赖于 dp[step-1][nr][nc]。',
      state: 'dp[step][r][c] 为从 (r, c) 出发最多走 step 步移出边界的路径数。',
      equation: 'dp[step][r][c] = ∑ (移出边界 ? 1 : dp[step-1][nr][nc])',
      initAndBounds: 'dp[0][r][c] = 0（0 步无法出界）。',
      complexity: '时间复杂度 $O(maxMove \\cdot m \\cdot n)$，空间复杂度滚动压缩为 $O(m \\cdot n)$。',
    },
    faqList: [
      {
        tag: '同点多次出界',
        question: '同一个路径中如果提前出界，是否还会继续走？',
        answer:
          '题目规定只要球在某一步出界，该序列即算一条完整的出界路径并立刻终止，后续不可再走入网格。我们的转移公式中越界直接贡献 +1 条独立出界路径，完全符合题意。',
      },
    ],
  },
  generateSteps: (input: { m?: number; n?: number; maxMove?: number; startRow?: number; startColumn?: number } = {}): DpTraceStep[] => {
    const m = input?.m || 2;
    const n = input?.n || 2;
    const maxMove = input?.maxMove || 2;
    const startRow = input?.startRow || 0;
    const startCol = input?.startColumn || 0;
    const steps: DpTraceStep[] = [];
    const MOD = 1000000007;

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    let dp: number[][] = Array.from({ length: m }, () => Array(n).fill(0));

    const toDp2d = (grid: number[][], activeR?: number, activeC?: number) =>
      grid.map((rArr, r) =>
        rArr.map((val, c) => ({
          value: val,
          state: (r === activeR && c === activeC) ? ('active' as const) : val > 0 ? ('computed' as const) : ('default' as const),
        }))
      );

    steps.push(
      makeTraceStep({
        dp2d: toDp2d(dp, startRow, startCol),
        current: { row: startRow, col: startCol },
        message: `🏁 网格大小 ${m}×${n}，球在 (${startRow}, ${startCol})，最大移动 ${maxMove} 步。初始化 step=0 时出界路径数均为 0。`,
        log: `初始化：网格 ${m}x${n}, maxMove=${maxMove}, start=(${startRow},${startCol})`,
        vars: [
          { name: 'maxMove', value: String(maxMove) },
          { name: '起始位置', value: `(${startRow}, ${startCol})` },
          { name: '网格规格', value: `${m}×${n}` },
        ],
        metrics: { pathsCount: 0 },
      })
    );

    for (let step = 1; step <= maxMove; step++) {
      const nextDp: number[][] = Array.from({ length: m }, () => Array(n).fill(0));
      for (let r = 0; r < m; r++) {
        for (let c = 0; c < n; c++) {
          let paths = 0;
          let directOut = 0;
          for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) {
              paths = (paths + 1) % MOD;
              directOut++;
            } else {
              paths = (paths + dp[nr][nc]) % MOD;
            }
          }
          nextDp[r][c] = paths;

          if (r === startRow && c === startCol) {
            steps.push(
              makeTraceStep({
                dp2d: toDp2d(nextDp, r, c),
                current: { row: r, col: c },
                message: `🚶 步数 step=${step} 计算起点 (${r}, ${c})：直接越界 ${directOut} 条路径，经由界内后继累加 ${paths - directOut} 条，当前总出界路径数为 <strong>${paths}</strong>。`,
                log: `step=${step} at (${r}, ${c}): directOut=${directOut}, totalPaths=${paths}`,
                formula: 'dp[step][r][c] = ∑ (越界 ? 1 : dp[step-1][nr][nc])',
                vars: [
                  { name: '当前步数', value: String(step) },
                  { name: '直接出界', value: String(directOut) },
                  { name: '当前出界总数', value: String(paths) },
                ],
                metrics: { pathsCount: paths },
              })
            );
          }
        }
      }
      dp = nextDp;
    }

    const ans = dp[startRow][startCol];

    steps.push(
      makeTraceStep({
        dp2d: toDp2d(dp, startRow, startCol),
        current: { row: startRow, col: startCol },
        message: `🏆 计算完成！球从 (${startRow}, ${startCol}) 出发在 ${maxMove} 步内出界的路径总数为 <strong>${ans}</strong>。`,
        log: `计算结束：出界路径总数 = ${ans}`,
        vars: [
          { name: '最终出界路径数', value: String(ans) },
        ],
        metrics: { pathsCount: ans },
      })
    );

    return steps;
  },
};
