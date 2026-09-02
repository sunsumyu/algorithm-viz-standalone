import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 骑士在棋盘上的概率 (Knight Probability in Chessboard)
 * LeetCode 688 / 左程云算法通关课 第069讲 三维DP
 * 状态定义：dp[step][r][c] 表示剩余 step 步，骑士从 (r, c) 出发停留在棋盘上的概率。
 */
export const KnightProbabilitySpec: AlgorithmSpec = {
  id: 'knight-probability',
  name: '骑士在棋盘上的概率 (Knight Probability in Chessboard)',
  category: '三维 DP',
  description:
    '在一个 n x n 的国际象棋棋盘上，骑士从 (row, column) 出发随机走 k 步，每次走8个方向等概率（各 1/8）。求骑士在走完 k 步后仍留在棋盘上的概率。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 688,
    leetcodeUrl: 'https://leetcode.cn/problems/knight-probability-in-chessboard/',
    difficulty: 'medium',
    tags: ['动态规划', '概率与期望', '三维DP'],
    description:
      '在一个 <code>n x n</code> 的国际象棋棋盘上，一个骑士从单元格 <code>(row, column)</code> 抓起出发，并尝试进行 <code>k</code> 次移动。<br/><br/>行和列的索引从 0 开始。在每次移动中，骑士有 8 种可能的走法（中国象棋的“马走日”），每种走法被选中的概率均为 <code>1/8</code>。<br/><br/>骑士每次只能移动到棋盘内的有效位置。如果骑士移出了棋盘，则不能再移回。求骑士在走完 <code>k</code> 步后仍留在棋盘上的概率。',
    examples: [
      {
        input: 'n = 3, k = 2, row = 0, column = 0',
        output: '0.06250',
        explanation: '走第1步留在棋盘概率为 2/8 = 0.25；第2步留在棋盘总概率为 0.0625。',
      },
      {
        input: 'n = 1, k = 0, row = 0, column = 0',
        output: '1.00000',
        explanation: '无需走步，骑士一开始就在棋盘上。',
      },
    ],
    constraints: [
      '1 <= n <= 25',
      '0 <= k <= 100',
      '0 <= row, column < n',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 4, cpp: 5, python: 3, javascript: 2 },
    init: { java: 9, cpp: 10, python: 8, javascript: 7 },
    loopCheck: { java: 12, cpp: 13, python: 11, javascript: 10 },
    innerLoopCheck: { java: 13, cpp: 14, python: 12, javascript: 11 },
    stateTransfer: {
      java: [18, 19, 20, 21, 22],
      cpp: [19, 20, 21, 22, 23],
      python: [16, 17, 18, 19, 20],
      javascript: [15, 16, 17, 18, 19],
    },
    loopExit: { java: 26, cpp: 27, python: 23, javascript: 23 },
    returnResult: { java: 28, cpp: 29, python: 24, javascript: 25 },
  },
  code: {
    languages: {
      javascript: [
        'function knightProbability(n, k, row, column) {',
        '  if (k === 0) return 1.0;',
        '  const moves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];',
        '  let dp = Array.from({ length: n }, () => Array(n).fill(1.0));',
        '  for (let step = 1; step <= k; step++) {',
        '    const nextDp = Array.from({ length: n }, () => Array(n).fill(0));',
        '    for (let r = 0; r < n; r++) {',
        '      for (let c = 0; c < n; c++) {',
        '        for (const [dr, dc] of moves) {',
        '          const nr = r + dr, nc = c + dc;',
        '          if (nr >= 0 && nr < n && nc >= 0 && nc < n) {',
        '            nextDp[r][c] += dp[nr][nc] / 8.0;',
        '          }',
        '        }',
        '      }',
        '    }',
        '    dp = nextDp;',
        '  }',
        '  return dp[row][column];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public double knightProbability(int n, int k, int row, int column) {',
        '        if (k == 0) return 1.0;',
        '        int[][] moves = {{-2,-1},{-2,1},{-1,-2},{-1,2},{1,-2},{1,2},{2,-1},{2,1}};',
        '        double[][] dp = new double[n][n];',
        '        for (int i = 0; i < n; i++) Arrays.fill(dp[i], 1.0);',
        '        for (int step = 1; step <= k; step++) {',
        '            double[][] nextDp = new double[n][n];',
        '            for (int r = 0; r < n; r++) {',
        '                for (int c = 0; c < n; c++) {',
        '                    for (int[] m : moves) {',
        '                        int nr = r + m[0], nc = c + m[1];',
        '                        if (nr >= 0 && nr < n && nc >= 0 && nc < n) {',
        '                            nextDp[r][c] += dp[nr][nc] / 8.0;',
        '                        }',
        '                    }',
        '                }',
        '            }',
        '            dp = nextDp;',
        '        }',
        '        return dp[row][column];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    double knightProbability(int n, int k, int row, int column) {',
        '        if (k == 0) return 1.0;',
        '        vector<pair<int,int>> moves = {{-2,-1},{-2,1},{-1,-2},{-1,2},{1,-2},{1,2},{2,-1},{2,1}};',
        '        vector<vector<double>> dp(n, vector<double>(n, 1.0));',
        '        for (int step = 1; step <= k; step++) {',
        '            vector<vector<double>> nextDp(n, vector<double>(n, 0.0));',
        '            for (int r = 0; r < n; r++) {',
        '                for (int c = 0; c < n; c++) {',
        '                    for (auto& m : moves) {',
        '                        int nr = r + m.first, nc = c + m.second;',
        '                        if (nr >= 0 && nr < n && nc >= 0 && nc < n) {',
        '                            nextDp[r][c] += dp[nr][nc] / 8.0;',
        '                        }',
        '                    }',
        '                }',
        '            }',
        '            dp = move(nextDp);',
        '        }',
        '        return dp[row][column];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def knightProbability(self, n: int, k: int, row: int, column: int) -> float:',
        '        if k == 0:',
        '            return 1.0',
        '        moves = [(-2,-1),(-2,1),(-1,-2),(-1,2),(1,-2),(1,2),(2,-1),(2,1)]',
        '        dp = [[1.0] * n for _ in range(n)]',
        '        for step in range(1, k + 1):',
        '            next_dp = [[0.0] * n for _ in range(n)]',
        '            for r in range(n):',
        '                for c in range(n):',
        '                    for dr, dc in moves:',
        '                        nr, nc = r + dr, c + dc',
        '                        if 0 <= nr < n and 0 <= nc < n:',
        '                            next_dp[r][c] += dp[nr][nc] / 8.0',
        '            dp = next_dp',
        '        return dp[row][column]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口，传入棋盘大小 n，移动步数 k，起始坐标 (row, column)。',
        2: '步数为 0 时骑士已在棋盘上，留在棋盘概率为 1.0。',
        3: '定义骑士在国际象棋中的 8 种跳跃方向。',
        4: '初始化 0 步状态表 dp[r][c] = 1.0（剩余 0 步无论在哪个合法位置都在棋盘上）。',
        5: '从 1 步到 k 步滚动递推。',
        11: '若跳跃后位置合法，累加下一状态概率贡献 (dp[nr][nc] / 8)。',
        19: '返回起始点 (row, column) 剩余 k 步留在棋盘上的总概率。',
      },
      java: {
        2: '方法入口。',
        6: '初始化 0 步留在棋盘的概率表。',
        7: '外层遍历步数 1 到 k。',
        13: '合法跳跃累加贡献。',
        20: '返回起始单元格结果。',
      },
      cpp: {
        3: '函数入口。',
        6: '初始化概率矩阵。',
        7: '三维状态滚动压缩推进步数。',
        15: '界内转移。',
        21: '返回起始坐标概率。',
      },
      python: {
        2: '方法入口。',
        6: '初始化 0 步概率表。',
        7: '外层遍历步数递推。',
        14: '8方向边界校验与概率均摊。',
        17: '返回目标坐标概率。',
      },
    },
    keyPoints: {
      thinking:
        '三维状态定义：dp[step][r][c] 表示剩余 step 步，从 (r, c) 出发最终留在棋盘上的概率。每个位置由 8 个后继状态均分概率转移而来。由于只依赖 step-1 层的二维状态，可做空间滚动压缩。',
      state: 'dp[step][r][c] 表示从 (r, c) 出发再走 step 步仍在棋盘内的概率。',
      equation: 'dp[step][r][c] = ∑_{8个有效后继(nr,nc)} (dp[step-1][nr][nc] / 8.0)',
      initAndBounds: 'dp[0][r][c] = 1.0（0 步留在棋盘内的概率为 100%）。出界位置概率为 0。',
      complexity: '时间复杂度 $O(k \\cdot n^2)$，空间复杂度滚动压缩后为 $O(n^2)$。',
    },
    faqList: [
      {
        tag: '概率转移方向',
        question: '为什么倒着定义“从当前点出发再走 step 步的存活概率”，而不是正着推？',
        answer:
          '倒着定义（从剩余 0 步反推至剩余 k 步）可以直接利用所有界内点的最终价值为 1.0，界外点价值为 0.0，无需维护每一步可能到达的所有分布点，代码结构清晰且可直接查询 dp[k][row][column]。',
      },
    ],
  },
  generateSteps: (input: { n?: number; k?: number; row?: number; column?: number } = {}): DpTraceStep[] => {
    const n = input?.n || 3;
    const k = input?.k || 2;
    const row = input?.row || 0;
    const col = input?.column || 0;
    const steps: DpTraceStep[] = [];

    const moves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];

    let dp: number[][] = Array.from({ length: n }, () => Array(n).fill(1.0));

    const toDp2d = (grid: number[][], activeR?: number, activeC?: number) =>
      grid.map((rArr, r) =>
        rArr.map((val, c) => ({
          value: Number(val.toFixed(4)),
          state: (r === activeR && c === activeC) ? ('active' as const) : val > 0 ? ('computed' as const) : ('default' as const),
        }))
      );

    steps.push(
      makeTraceStep({
        dp2d: toDp2d(dp, row, col),
        current: { row, col },
        message: `♟️ 棋盘大小 ${n}×${n}，目标计算骑士从 (${row}, ${col}) 出发走 ${k} 步仍留在棋盘的概率。初始化 step=0 时各位置存活概率为 1.0。`,
        log: `初始化 0 步状态表：所有单元格存活概率为 1.0`,
        vars: [
          { name: '步数 k', value: String(k) },
          { name: '起点 (row, col)', value: `(${row}, ${col})` },
          { name: '棋盘大小', value: `${n}×${n}` },
        ],
        metrics: { probability: 1.0 },
      })
    );

    for (let step = 1; step <= k; step++) {
      const nextDp: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          let sum = 0;
          let validCount = 0;
          for (const [dr, dc] of moves) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
              sum += dp[nr][nc] / 8.0;
              validCount++;
            }
          }
          nextDp[r][c] = sum;

          if (step === k && r === row && c === col) {
            steps.push(
              makeTraceStep({
                dp2d: toDp2d(nextDp, r, c),
                current: { row: r, col: c },
                message: `🎯 第 ${step} 步推导起点 (${r}, ${c})：可跳跃至 ${validCount} 个界内合法点，贡献概率累加值为 ${(sum).toFixed(5)}。`,
                log: `step=${step} at (${r}, ${c}): validMoves=${validCount}/8, prob=${sum.toFixed(5)}`,
                formula: 'dp[step][r][c] = ∑ (dp[step-1][nr][nc] / 8.0)',
                vars: [
                  { name: '当前剩余步数', value: String(step) },
                  { name: '当前单元格', value: `(${r}, ${c})` },
                  { name: '有效跳跃分支', value: `${validCount}/8` },
                ],
                metrics: { probability: Number(sum.toFixed(5)) },
              })
            );
          }
        }
      }
      dp = nextDp;
    }

    const finalProb = Number(dp[row][col].toFixed(5));

    steps.push(
      makeTraceStep({
        dp2d: toDp2d(dp, row, col),
        current: { row, col },
        message: `🏆 计算完成！骑士从 (${row}, ${col}) 出发走 ${k} 步后停留在棋盘上的概率为 <strong>${finalProb}</strong>。`,
        log: `推导结束：骑士走完 ${k} 步存活概率为 ${finalProb}`,
        vars: [
          { name: '最终概率', value: String(finalProb) },
        ],
        metrics: { probability: finalProb },
      })
    );

    return steps;
  },
};
