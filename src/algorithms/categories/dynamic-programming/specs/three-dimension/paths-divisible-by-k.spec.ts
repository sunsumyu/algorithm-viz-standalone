import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 矩阵中和能被 K 整除的路径 (Paths in Matrix Whose Sum Is Divisible by K)
 * LeetCode 2435 / 左程云算法通关课 第069讲 三维DP Code04
 * 状态定义：dp[i][j][r] 表示从 (i, j) 移动到终点 (n-1, m-1)，路径累计和模 k 余数为 r 的路径条数。
 */
export const PathsDivisibleByKSpec: AlgorithmSpec = {
  id: 'paths-divisible-by-k',
  name: '矩阵中和能被 K 整除的路径 (Paths Divisible by K)',
  category: '三维 DP',
  description:
    '给定一个大小为 n x m 的网格和一个整数 k。从起点 (0,0) 出发只能向右或向下到达 (n-1, m-1)。求所有路径中单元格数值之和能够被 k 整除的路径数目（对 10^9 + 7 取模）。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 2435,
    leetcodeUrl: 'https://leetcode.cn/problems/paths-in-matrix-whose-sum-is-divisible-by-k/',
    difficulty: 'medium',
    tags: ['动态规划', '矩阵', '三维DP', '数论与同余'],
    description:
      '给你一个下标从 0 开始的 <code>n x m</code> 整数矩阵 <code>grid</code> 和一个整数 <code>k</code>。<br/><br/>你从 <code>(0, 0)</code> 出发，每一步只能向<strong>右</strong>或者向<strong>下</strong>移动。你想到达终点 <code>(n - 1, m - 1)</code>。<br/><br/>请你返回路径和能被 <code>k</code> 整除的路径数目。由于答案可能很大，返回对 <code>10^9 + 7</code> 取模的结果。',
    examples: [
      {
        input: 'grid = [[5,2,4],[3,0,5],[0,7,2]], k = 3',
        output: '2',
        explanation:
          '两条和被 3 整除的有效路径为：(0,0) -> (0,1) -> (0,2) -> (1,2) -> (2,2)，和为 5+2+4+5+2 = 18；以及 (0,0) -> (1,0) -> (1,1) -> (1,2) -> (2,2)，和为 5+3+0+5+2 = 15。',
      },
      {
        input: 'grid = [[0,0]], k = 5',
        output: '1',
        explanation: '唯一路径和为 0，0 能被 5 整除，结果为 1。',
      },
      {
        input: 'grid = [[7,3,4,9],[2,3,6,2],[2,3,7,0]], k = 1',
        output: '10',
        explanation: '任何整数都能被 1 整除，答案即为从 (0,0) 到 (2,3) 的总路径数 C(2+3, 2) = 10。',
      },
    ],
    constraints: [
      '1 <= n, m <= 50',
      '1 <= n * m <= 5 * 10^4',
      '0 <= grid[i][j] <= 100',
      '1 <= k <= 50',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 4, cpp: 5, python: 3, javascript: 2 },
    init: { java: 6, cpp: 7, python: 6, javascript: 5 },
    loopCheck: { java: 7, cpp: 8, python: 7, javascript: 6 },
    innerLoopCheck: { java: 17, cpp: 18, python: 13, javascript: 16 },
    stateTransfer: {
      java: [20, 21, 22],
      cpp: [21, 22, 23],
      python: [16, 17, 18],
      javascript: [19, 20, 21],
    },
    loopExit: { java: 25, cpp: 26, python: 19, javascript: 24 },
    returnResult: { java: 26, cpp: 27, python: 20, javascript: 25 },
  },
  code: {
    languages: {
      javascript: [
        'function numberOfPaths(grid, k) {',
        '  const MOD = 1000000007;',
        '  const n = grid.length, m = grid[0].length;',
        '  const dp = Array.from({ length: n }, () => Array.from({ length: m }, () => Array(k).fill(0)));',
        '  dp[n - 1][m - 1][grid[n - 1][m - 1] % k] = 1;',
        '  for (let i = n - 2; i >= 0; i--) {',
        '    for (let r = 0; r < k; r++) {',
        '      dp[i][m - 1][r] = dp[i + 1][m - 1][(k + r - (grid[i][m - 1] % k)) % k];',
        '    }',
        '  }',
        '  for (let j = m - 2; j >= 0; j--) {',
        '    for (let r = 0; r < k; r++) {',
        '      dp[n - 1][j][r] = dp[n - 1][j + 1][(k + r - (grid[n - 1][j] % k)) % k];',
        '    }',
        '  }',
        '  for (let i = n - 2; i >= 0; i--) {',
        '    for (let j = m - 2; j >= 0; j--) {',
        '      const rem = grid[i][j] % k;',
        '      for (let r = 0; r < k; r++) {',
        '        const need = (k + r - rem) % k;',
        '        dp[i][j][r] = (dp[i + 1][j][need] + dp[i][j + 1][need]) % MOD;',
        '      }',
        '    }',
        '  }',
        '  return dp[0][0][0];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int numberOfPaths(int[][] grid, int k) {',
        '        int mod = 1000000007;',
        '        int n = grid.length, m = grid[0].length;',
        '        int[][][] dp = new int[n][m][k];',
        '        dp[n - 1][m - 1][grid[n - 1][m - 1] % k] = 1;',
        '        for (int i = n - 2; i >= 0; i--) {',
        '            for (int r = 0; r < k; r++) {',
        '                dp[i][m - 1][r] = dp[i + 1][m - 1][(k + r - grid[i][m - 1] % k) % k];',
        '            }',
        '        }',
        '        for (int j = m - 2; j >= 0; j--) {',
        '            for (int r = 0; r < k; r++) {',
        '                dp[n - 1][j][r] = dp[n - 1][j + 1][(k + r - grid[n - 1][j] % k) % k];',
        '            }',
        '        }',
        '        for (int i = n - 2; i >= 0; i--) {',
        '            for (int j = m - 2; j >= 0; j--) {',
        '                int rem = grid[i][j] % k;',
        '                for (int r = 0; r < k; r++) {',
        '                    int need = (k + r - rem) % k;',
        '                    dp[i][j][r] = (dp[i + 1][j][need] + dp[i][j + 1][need]) % mod;',
        '                }',
        '            }',
        '        }',
        '        return dp[0][0][0];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int numberOfPaths(vector<vector<int>>& grid, int k) {',
        '        const int MOD = 1e9 + 7;',
        '        int n = grid.size(), m = grid[0].size();',
        '        vector<vector<vector<int>>> dp(n, vector<vector<int>>(m, vector<int>(k, 0)));',
        '        dp[n - 1][m - 1][grid[n - 1][m - 1] % k] = 1;',
        '        for (int i = n - 2; i >= 0; --i) {',
        '            for (int r = 0; r < k; ++r) {',
        '                dp[i][m - 1][r] = dp[i + 1][m - 1][(k + r - grid[i][m - 1] % k) % k];',
        '            }',
        '        }',
        '        for (int j = m - 2; j >= 0; --j) {',
        '            for (int r = 0; r < k; ++r) {',
        '                dp[n - 1][j][r] = dp[n - 1][j + 1][(k + r - grid[n - 1][j] % k) % k];',
        '            }',
        '        }',
        '        for (int i = n - 2; i >= 0; --i) {',
        '            for (int j = m - 2; j >= 0; --j) {',
        '                int rem = grid[i][j] % k;',
        '                for (int r = 0; r < k; ++r) {',
        '                    int need = (k + r - rem) % k;',
        '                    dp[i][j][r] = (dp[i + 1][j][need] + dp[i][j + 1][need]) % MOD;',
        '                }',
        '            }',
        '        }',
        '        return dp[0][0][0];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def numberOfPaths(self, grid: List[List[int]], k: int) -> int:',
        '        MOD = 10**9 + 7',
        '        n, m = len(grid), len(grid[0])',
        '        dp = [[[0] * k for _ in range(m)] for _ in range(n)]',
        '        dp[n - 1][m - 1][grid[n - 1][m - 1] % k] = 1',
        '        for i in range(n - 2, -1, -1):',
        '            for r in range(k):',
        '                dp[i][m - 1][r] = dp[i + 1][m - 1][(k + r - grid[i][m - 1] % k) % k]',
        '        for j in range(m - 2, -1, -1):',
        '            for r in range(k):',
        '                dp[n - 1][j][r] = dp[n - 1][j + 1][(k + r - grid[n - 1][j] % k) % k]',
        '        for i in range(n - 2, -1, -1):',
        '            for j in range(m - 2, -1, -1):',
        '                rem = grid[i][j] % k',
        '                for r in range(k):',
        '                    need = (k + r - rem) % k',
        '                    dp[i][j][r] = (dp[i + 1][j][need] + dp[i][j + 1][need]) % MOD',
        '        return dp[0][0][0]',
      ],
    },
    keyPoints: {
      thinking:
        '三维状态设计：设 dp[i][j][r] 表示从 (i, j) 走到终点 (n-1, m-1)，累加和模 k 余数恰好为 r 的合法路径数。当前格权值占用 rem = grid[i][j] % k，因此后续移动必须凑出的余数为 need = (k + r - rem) % k。由于只向右或向下，自底向上逆推非常自然。',
      state: 'dp[i][j][r] 表示从 (i, j) 出发到达右下角终点且路径总和 % k == r 的路径数。',
      equation:
        'dp[i][j][r] = (dp[i+1][j][(k + r - grid[i][j]%k)%k] + dp[i][j+1][(k + r - grid[i][j]%k)%k]) % 1000000007',
      initAndBounds:
        '终点初始状态：dp[n-1][m-1][grid[n-1][m-1] % k] = 1，其余余数为 0。最后一行与最后一列各只有一种单向移动选择。',
      complexity: '时间复杂度 O(n * m * k)，空间复杂度 O(n * m * k)。',
    },
    faqList: [
      {
        tag: '同余逆推技巧',
        question: '为什么转移时需要用 (k + r - rem) % k？',
        answer:
          '若从当前点 (i, j) 经过其值为 grid[i][j]，并希望整体路径和模 k 余数达到 r，则后继路径的累加和 sum_rest 必须满足 (sum_rest + rem) % k = r。通过同余式两边移项可得 sum_rest % k = (r - rem + k) % k，故后继状态的查询目标就是 need。',
      },
    ],
  },
  generateSteps: (input: { grid?: number[][]; k?: number } = {}): DpTraceStep[] => {
    const grid = input?.grid || [
      [5, 2, 4],
      [3, 0, 5],
      [0, 7, 2],
    ];
    const k = input?.k || 3;
    const MOD = 1000000007;
    const n = grid.length;
    const m = grid[0].length;
    const steps: DpTraceStep[] = [];

    const dp: number[][][] = Array.from({ length: n }, () =>
      Array.from({ length: m }, () => Array(k).fill(0))
    );

    const toDp2d = (activeI?: number, activeJ?: number) =>
      dp.map((rowArr, i) =>
        rowArr.map((remArr, j) => {
          const val = remArr[0]; // 优先展示整除余数 0 的方案数
          const totalWays = remArr.reduce((a, b) => a + b, 0);
          return {
            value: val,
            state:
              i === activeI && j === activeJ
                ? ('active' as const)
                : totalWays > 0
                ? ('computed' as const)
                : ('default' as const),
          };
        })
      );

    const endRem = grid[n - 1][m - 1] % k;
    dp[n - 1][m - 1][endRem] = 1;

    steps.push(
      makeTraceStep({
        dp2d: toDp2d(n - 1, m - 1),
        current: { row: n - 1, col: m - 1 },
        message: `🏁 初始化终点 (${n - 1}, ${m - 1})：数值为 ${grid[n - 1][m - 1]}，模 ${k} 余数 = ${endRem}。置 dp[${n - 1}][${m - 1}][${endRem}] = 1。`,
        log: `终点 (${n - 1}, ${m - 1}) 初始化完成`,
        vars: [
          { name: '网格规格', value: `${n} × ${m}` },
          { name: '除数 k', value: String(k) },
          { name: '终点余数', value: String(endRem) },
        ],
        metrics: { totalPathsModK: dp[0][0][0] },
      })
    );

    // 填充最右一列
    for (let i = n - 2; i >= 0; i--) {
      const rem = grid[i][m - 1] % k;
      for (let r = 0; r < k; r++) {
        const need = (k + r - rem) % k;
        dp[i][m - 1][r] = dp[i + 1][m - 1][need];
      }
      steps.push(
        makeTraceStep({
          dp2d: toDp2d(i, m - 1),
          current: { row: i, col: m - 1 },
          message: `⬇️ 最右列 (${i}, ${m - 1}) 仅能向下转移，数值 ${grid[i][m - 1]} (模 ${k} 余 ${rem})。余数 0 方案数 = ${dp[i][m - 1][0]}。`,
          log: `计算单元格 (${i}, ${m - 1})`,
          vars: [
            { name: '当前坐标', value: `(${i}, ${m - 1})` },
            { name: '单元格权值', value: String(grid[i][m - 1]) },
            { name: '整除(r=0)路径数', value: String(dp[i][m - 1][0]) },
          ],
          metrics: { totalPathsModK: dp[0][0][0] },
        })
      );
    }

    // 填充最下一行
    for (let j = m - 2; j >= 0; j--) {
      const rem = grid[n - 1][j] % k;
      for (let r = 0; r < k; r++) {
        const need = (k + r - rem) % k;
        dp[n - 1][j][r] = dp[n - 1][j + 1][need];
      }
      steps.push(
        makeTraceStep({
          dp2d: toDp2d(n - 1, j),
          current: { row: n - 1, col: j },
          message: `➡️ 最底行 (${n - 1}, ${j}) 仅能向右转移，数值 ${grid[n - 1][j]} (模 ${k} 余 ${rem})。余数 0 方案数 = ${dp[n - 1][j][0]}。`,
          log: `计算单元格 (${n - 1}, ${j})`,
          vars: [
            { name: '当前坐标', value: `(${n - 1}, ${j})` },
            { name: '单元格权值', value: String(grid[n - 1][j]) },
            { name: '整除(r=0)路径数', value: String(dp[n - 1][j][0]) },
          ],
          metrics: { totalPathsModK: dp[0][0][0] },
        })
      );
    }

    // 填充剩余主网格
    for (let i = n - 2; i >= 0; i--) {
      for (let j = m - 2; j >= 0; j--) {
        const rem = grid[i][j] % k;
        for (let r = 0; r < k; r++) {
          const need = (k + r - rem) % k;
          dp[i][j][r] = (dp[i + 1][j][need] + dp[i][j + 1][need]) % MOD;
        }

        steps.push(
          makeTraceStep({
            dp2d: toDp2d(i, j),
            current: { row: i, col: j },
            message: `🔀 综合下方 (${i + 1}, ${j}) 与右方 (${i}, ${j + 1}) 转移到 (${i}, ${j})，数值 ${grid[i][j]}。余数0方案数 = ${dp[i][j][0]}。`,
            log: `完成 (${i}, ${j}) 全部 k 种同余转移`,
            vars: [
              { name: '当前位置', value: `(${i}, ${j})` },
              { name: '当前格余数', value: String(rem) },
              { name: '整除余数0路径', value: String(dp[i][j][0]) },
            ],
            metrics: { totalPathsModK: dp[0][0][0] },
          })
        );
      }
    }

    steps.push(
      makeTraceStep({
        dp2d: toDp2d(0, 0),
        current: { row: 0, col: 0 },
        message: `🎉 递归与三维DP填表完毕！从起点 (0, 0) 出发到达终点且路径总和能被 ${k} 整除的路径总数为：${dp[0][0][0]}。`,
        log: `搜索完成，输出 dp[0][0][0] = ${dp[0][0][0]}`,
        vars: [
          { name: '起点 (0, 0)', value: `整除方案: ${dp[0][0][0]}` },
          { name: '模数', value: '1000000007' },
        ],
        metrics: { totalPathsModK: dp[0][0][0] },
      })
    );

    return steps;
  },
};
