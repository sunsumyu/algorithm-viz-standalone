import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 旅行商问题 TSP (Travelling Salesman Problem)
 * 左程云算法通关课 第080讲 状压DP上 Code04
 * 经典 NP-hard 问题，用状压DP加速暴力枚举：dp[S][i] = 从起点出发，经过集合 S 中所有城市，当前在 i 的最短距离。
 */
export const TspSpec: AlgorithmSpec = {
  id: 'tsp-bitmask-dp',
  name: '旅行商问题 TSP (状压DP)',
  category: '状压 DP',
  description:
    'n 个城市的完全图中求经过所有城市恰好一次再回到起点的最短回路。dp[S][i] 表示经过集合 S 且当前在 i 的最小代价。',
  difficulty: 'hard',
  problem: {
    leetcodeUrl: 'https://www.luogu.com.cn/problem/B3625',
    difficulty: 'hard',
    tags: ['位运算', '状压DP', '动态规划', '图论'],
    description:
      '给定 <code>n</code> 个城市之间的距离矩阵 <code>dist[i][j]</code>，求从城市 0 出发，经过所有城市恰好一次，最后回到城市 0 的最短路径长度。<br/><br/><strong>核心思路：</strong>用一个 <code>n</code> 位二进制数 <code>S</code> 表示已访问的城市集合。状态转移：<code>dp[S][i] = min(dp[S ^ (1<<i)][j] + dist[j][i])</code>，其中 j ∈ S 且 j ≠ i。最终答案 = min(dp[(1<<n)-1][i] + dist[i][0])。',
    examples: [
      {
        input: 'dist = [[0,10,15,20],[10,0,35,25],[15,35,0,30],[20,25,30,0]]',
        output: '80',
        explanation: '最优路径 0→1→3→2→0，总距离 10+25+30+15=80。',
      },
    ],
    constraints: [
      '2 <= n <= 20（演示用 4~6）',
      '1 <= dist[i][j] <= 10^6',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 4, cpp: 5, python: 4, javascript: 3 },
    init: { java: 6, cpp: 7, python: 5, javascript: 5 },
    stateTransfer: {
      java: [12, 13, 14, 15, 16],
      cpp: [13, 14, 15, 16, 17],
      python: [10, 11, 12, 13],
      javascript: [9, 10, 11, 12, 13],
    },
    returnResult: { java: 22, cpp: 21, python: 14, javascript: 22 },
  },
  code: {
    languages: {
      javascript: [
        'function tsp(dist) {',
        '    const n = dist.length;',
        '    const full = (1 << n) - 1;',
        '    // dp[S][i]: 从 0 出发经过集合 S 中的城市，当前在 i 的最短距离',
        '    const dp = Array.from({ length: 1 << n }, () =>',
        '        new Array(n).fill(Infinity));',
        '    dp[1][0] = 0; // 初始状态：只访问了城市 0',
        '    for (let S = 1; S <= full; S++) {',
        '        for (let i = 0; i < n; i++) {',
        '            if (!(S & (1 << i)) || dp[S][i] === Infinity) continue;',
        '            for (let j = 0; j < n; j++) {',
        '                if (S & (1 << j)) continue; // j 已在集合中',
        '                const nxt = S | (1 << j);',
        '                dp[nxt][j] = Math.min(dp[nxt][j], dp[S][i] + dist[i][j]);',
        '            }',
        '        }',
        '    }',
        '    let ans = Infinity;',
        '    for (let i = 1; i < n; i++) {',
        '        ans = Math.min(ans, dp[full][i] + dist[i][0]);',
        '    }',
        '    return ans;',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int tsp(int[][] dist) {',
        '        int n = dist.length;',
        '        int full = (1 << n) - 1;',
        '        int[][] dp = new int[1 << n][n];',
        '        for (int[] row : dp) Arrays.fill(row, Integer.MAX_VALUE / 2);',
        '        dp[1][0] = 0;',
        '        for (int S = 1; S <= full; S++) {',
        '            for (int i = 0; i < n; i++) {',
        '                if ((S & (1 << i)) == 0 || dp[S][i] >= Integer.MAX_VALUE / 2) continue;',
        '                for (int j = 0; j < n; j++) {',
        '                    if ((S & (1 << j)) != 0) continue;',
        '                    int nxt = S | (1 << j);',
        '                    dp[nxt][j] = Math.min(dp[nxt][j], dp[S][i] + dist[i][j]);',
        '                }',
        '            }',
        '        }',
        '        int ans = Integer.MAX_VALUE / 2;',
        '        for (int i = 1; i < n; i++) {',
        '            ans = Math.min(ans, dp[full][i] + dist[i][0]);',
        '        }',
        '        return ans;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int tsp(vector<vector<int>>& dist) {',
        '        int n = dist.size();',
        '        int full = (1 << n) - 1;',
        '        vector<vector<int>> dp(1 << n, vector<int>(n, INT_MAX / 2));',
        '        dp[1][0] = 0;',
        '        for (int S = 1; S <= full; S++) {',
        '            for (int i = 0; i < n; i++) {',
        '                if (!(S & (1 << i)) || dp[S][i] >= INT_MAX / 2) continue;',
        '                for (int j = 0; j < n; j++) {',
        '                    if (S & (1 << j)) continue;',
        '                    int nxt = S | (1 << j);',
        '                    dp[nxt][j] = min(dp[nxt][j], dp[S][i] + dist[i][j]);',
        '                }',
        '            }',
        '        }',
        '        int ans = INT_MAX / 2;',
        '        for (int i = 1; i < n; i++)',
        '            ans = min(ans, dp[full][i] + dist[i][0]);',
        '        return ans;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def tsp(self, dist: List[List[int]]) -> int:',
        '        n = len(dist)',
        '        full = (1 << n) - 1',
        '        dp = [[float("inf")] * n for _ in range(1 << n)]',
        '        dp[1][0] = 0',
        '        for S in range(1, full + 1):',
        '            for i in range(n):',
        '                if not (S & (1 << i)) or dp[S][i] == float("inf"): continue',
        '                for j in range(n):',
        '                    if S & (1 << j): continue',
        '                    nxt = S | (1 << j)',
        '                    dp[nxt][j] = min(dp[nxt][j], dp[S][i] + dist[i][j])',
        '        return min(dp[full][i] + dist[i][0] for i in range(1, n))',
      ],
    },
    lineExplanations: {
      java: {
        2: '🎯 <strong>函数入口</strong>。',
        5: 'DP 表：dp[S][i] = 经过集合 S 且在城市 i 的最短路。',
        7: '初始化：只访问了起点 0。',
        11: '💡 <strong>枚举下一个要访问的城市 j</strong>（不在 S 中）。',
        14: '💡 <strong>核心转移</strong>：dp[nxt][j] = min(dp[nxt][j], dp[S][i] + dist[i][j])。',
        20: '最终从 full 集合各终点回到 0 取最小。',
      },
      javascript: {
        1: '🎯 <strong>函数入口</strong>。',
        7: '初始化：dp[{0}][0] = 0。',
        12: 'j 不在当前集合 → 可以扩展。',
        14: '💡 <strong>核心转移</strong>：从 i 走到 j 更新。',
        20: '所有节点都访问后回到 0 取最小。',
      },
      cpp: { 3: '主函数。', 14: '核心转移。' },
      python: { 2: '主函数。', 13: '核心转移。' },
    },
    keyPoints: {
      thinking:
        'TSP 是经典 NP-hard 问题。暴力 n! 枚举所有排列，而状压DP 把复杂度降至 O(2^n · n^2)。关键洞察：只需记住"已访问城市的集合"和"当前所在城市"，中间走过的顺序不影响后续决策（无后效性）。',
      state: 'dp[S][i] = 从城市 0 出发，经过集合 S 中所有城市，当前位于城市 i 时的最短路径长度。',
      equation: 'dp[S | (1<<j)][j] = min(dp[S][i] + dist[i][j])，其中 i ∈ S，j ∉ S。',
      initAndBounds: 'dp[{0}][0] = 0（只访问了起点）。答案 = min(dp[全集][i] + dist[i][0])。',
    },
  },

  generateSteps: (input: { n?: number; graph?: number[][] } = {}): DpTraceStep[] => {
    const steps: DpTraceStep[] = [];
    const dist = input?.graph || [
      [0, 10, 15, 20],
      [10, 0, 35, 25],
      [15, 35, 0, 30],
      [20, 25, 30, 0],
    ];
    const n = input?.n || dist.length || 4;
    const full = (1 << n) - 1;

    steps.push(makeTraceStep({
      phase: 'init',
      description: `TSP: ${n} 个城市，距离矩阵 ${n}×${n}，全集掩码=${full.toString(2)}`,
      highlights: [],
    }));

    const dp = Array.from({ length: 1 << n }, () => new Array(n).fill(Infinity));
    dp[1][0] = 0;

    steps.push(makeTraceStep({
      phase: 'init',
      description: `初始化 dp[0001][0] = 0（仅访问城市0）`,
      highlights: [],
    }));

    let stepCount = 0;
    for (let S = 1; S <= full && stepCount < 30; S++) {
      for (let i = 0; i < n; i++) {
        if (!(S & (1 << i)) || dp[S][i] === Infinity) continue;
        for (let j = 0; j < n; j++) {
          if (S & (1 << j)) continue;
          const nxt = S | (1 << j);
          const newCost = dp[S][i] + dist[i][j];
          if (newCost < dp[nxt][j]) {
            dp[nxt][j] = newCost;
            steps.push(makeTraceStep({
              phase: 'transfer',
              description: `dp[${nxt.toString(2).padStart(n, '0')}][${j}] = dp[${S.toString(2).padStart(n, '0')}][${i}](${dp[S][i]}) + dist[${i}][${j}](${dist[i][j]}) = ${newCost}`,
              highlights: [],
            }));
            stepCount++;
          }
        }
      }
    }

    let ans = Infinity;
    let bestI = -1;
    for (let i = 1; i < n; i++) {
      const total = dp[full][i] + dist[i][0];
      if (total < ans) {
        ans = total;
        bestI = i;
      }
    }

    steps.push(makeTraceStep({
      phase: 'result',
      description: `最优：dp[${full.toString(2)}][${bestI}](${dp[full][bestI]}) + dist[${bestI}→0](${dist[bestI][0]}) = ${ans}`,
      highlights: [],
      result: ans,
    }));

    return steps;
  },
};

export const TspBitmaskDpSpec = TspSpec;

