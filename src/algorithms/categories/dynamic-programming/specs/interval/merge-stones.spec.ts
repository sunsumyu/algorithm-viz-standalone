import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const MergeStonesSpec: AlgorithmSpec = {
  id: 'merge-stones',
  name: '合并石子的最低成本 (Merge Stones)',
  category: '区间 DP',
  description: '经典区间动态规划。每次合并相邻的两堆石子，合并成本为两堆石子重量之和，求将所有石子合并为一堆的最低总成本。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 1000,
    leetcodeUrl: 'https://leetcode.cn/problems/minimum-cost-to-merge-stones/',
    difficulty: 'medium',
    tags: ['动态规划', '区间 DP', '前缀和'],
    description: '有 <code>n</code> 堆连续排开的石子，每堆石子的重量记录在数组 <code>stones</code> 中。<br/><br/>每次操作可以选择相邻的 <code>2</code> 堆石子合并为一堆，合并的成本为这两堆石子的重量和。求将所有石子合并成一堆的最低总成本。',
    examples: [
      {
        input: 'stones = [3, 2, 4, 1]',
        output: '20',
        explanation: '合并步骤：<br/>1. 合并 [3, 2] -> 5，成本 5，剩余 [5, 4, 1]<br/>2. 合并 [4, 1] -> 5，成本 5，剩余 [5, 5]<br/>3. 合并 [5, 5] -> 10，成本 10，总成本 = 5 + 5 + 10 = 20',
      },
      {
        input: 'stones = [3, 5, 1, 2, 6]',
        output: '38',
        explanation: '最优合并策略得到最低合并总成本为 38。',
      },
    ],
    constraints: [
      '1 <= stones.length <= 30',
      '1 <= stones[i] <= 100',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 4, python: 3, javascript: 2 },
    init: { java: [5, 6, 7], cpp: [6, 7, 8], python: [5, 6, 7], javascript: [4, 5, 6] },
    loopCheck: { java: 9, cpp: 10, python: 9, javascript: 8 },
    innerLoopCheck: { java: 10, cpp: 11, python: 10, javascript: 9 },
    stateTransfer: { java: [12, 13], cpp: [13, 14], python: [12, 13], javascript: [11, 12] },
    loopExit: { java: 9, cpp: 10, python: 9, javascript: 8 },
    returnResult: { java: 17, cpp: 18, python: 15, javascript: 16 },
  },
  code: {
    languages: {
      javascript: [
        'function mergeStones(stones) {',
        '    const n = stones.length;',
        '    if (n <= 1) return 0;',
        '    const sum = new Array(n + 1).fill(0);',
        '    for (let i = 0; i < n; i++) sum[i + 1] = sum[i] + stones[i];',
        '    const dp = Array.from({ length: n }, () => new Array(n).fill(0));',
        '    // len 为区间跨度，从 2 到 n',
        '    for (let len = 2; len <= n; len++) {',
        '        for (let i = 0; i <= n - len; i++) {',
        '            const j = i + len - 1;',
        '            let minCost = Infinity;',
        '            for (let k = i; k < j; k++) {',
        '                minCost = Math.min(minCost, dp[i][k] + dp[k + 1][j]);',
        '            }',
        '            dp[i][j] = minCost + (sum[j + 1] - sum[i]);',
        '        }',
        '    }',
        '    return dp[0][n - 1];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int mergeStones(int[] stones) {',
        '        int n = stones.length;',
        '        if (n <= 1) return 0;',
        '        int[] sum = new int[n + 1];',
        '        for (int i = 0; i < n; i++) sum[i + 1] = sum[i] + stones[i];',
        '        int[][] dp = new int[n][n];',
        '        for (int len = 2; len <= n; len++) {',
        '            for (int i = 0; i <= n - len; i++) {',
        '                int j = i + len - 1;',
        '                int minCost = Integer.MAX_VALUE;',
        '                for (int k = i; k < j; k++) {',
        '                    minCost = Math.min(minCost, dp[i][k] + dp[k + 1][j]);',
        '                }',
        '                dp[i][j] = minCost + (sum[j + 1] - sum[i]);',
        '            }',
        '        }',
        '        return dp[0][n - 1];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int mergeStones(vector<int>& stones) {',
        '        int n = stones.size();',
        '        if (n <= 1) return 0;',
        '        vector<int> sum(n + 1, 0);',
        '        for (int i = 0; i < n; i++) sum[i + 1] = sum[i] + stones[i];',
        '        vector<vector<int>> dp(n, vector<int>(n, 0));',
        '        for (int len = 2; len <= n; len++) {',
        '            for (int i = 0; i <= n - len; i++) {',
        '                int j = i + len - 1;',
        '                int minCost = INT_MAX;',
        '                for (int k = i; k < j; k++) {',
        '                    minCost = min(minCost, dp[i][k] + dp[k + 1][j]);',
        '                }',
        '                dp[i][j] = minCost + (sum[j + 1] - sum[i]);',
        '            }',
        '        }',
        '        return dp[0][n - 1];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def mergeStones(self, stones: List[int]) -> int:',
        '        n = len(stones)',
        '        if n <= 1:',
        '            return 0',
        '        prefix = [0] * (n + 1)',
        '        for i in range(n):',
        '            prefix[i + 1] = prefix[i] + stones[i]',
        '        dp = [[0] * n for _ in range(n)]',
        '        for length in range(2, n + 1):',
        '            for i in range(n - length + 1):',
        '                j = i + length - 1',
        '                dp[i][j] = min(dp[i][k] + dp[k + 1][j] for k in range(i, j)) + (prefix[j + 1] - prefix[i])',
        '        return dp[0][n - 1]',
      ],
    },
    lineExplanations: {
      java: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>：计算合并全部石子的最低成本。',
        3: '获取石子堆数 n。',
        4: '边界特判：若石子堆数小于等于 1，无需合并，成本为 0。',
        5: '前缀和数组初始化，便于 $O(1)$ 快速查询任意区间 $[i, j]$ 的石子总重。',
        6: '遍历计算前缀和：$sum[i+1] = sum[i] + stones[i]$。',
        7: '创建 $n \\times n$ 的二维 DP 表，$dp[i][j]$ 表示将区间 $[i, j]$ 合并为一堆的最小代价。',
        8: '🌟 <strong>区间 DP 核心遍历</strong>：外层按区间长度 $len$ 从 2 递增到 $n$。',
        9: '枚举区间左端点 $i$。',
        10: '计算对应区间右端点 $j = i + len - 1$。',
        11: '初始化局部最小成本为无穷大。',
        12: '遍历切分点 $k \\in [i, j-1]$，寻找最优分割位置。',
        13: '状态转移比较：$minCost = \\min(minCost, dp[i][k] + dp[k+1][j])$。',
        14: '最终加上本次大合并消耗的总石子重量 $(sum[j+1] - sum[i])$。',
        17: '返回 $dp[0][n-1]$，即整条石子序列合并的最优解。',
      },
      javascript: {
        1: '🎯 <strong>函数主入口</strong>：计算合并全部石子的最低成本。',
        2: '获取石子堆数 n。',
        3: '边界特判：当 $n \\le 1$ 时无需合并，返回 0。',
        4: '前缀和数组初始化。',
        5: '构建前缀和。',
        6: '创建二维 DP 表，初始填充为 0。',
        8: '🌟 <strong>按区间长度从 2 到 n 枚举</strong>。',
        9: '枚举区间起点 $i$ 与终点 $j$。',
        11: '枚举分割点 $k$，寻找左半部 $dp[i][k]$ 与右半部 $dp[k+1][j]$ 的最小合并代价。',
        15: '累加区间 $[i, j]$ 权值和，写入 $dp[i][j]$。',
        17: '返回将整个区间 $[0, n-1]$ 合并为一堆的最小代价。',
      },
      cpp: {
        1: '类定义 Solution。',
        2: '公共成员函数声明。',
        3: '🎯 <strong>函数主入口</strong>：返回最小合并代价。',
        7: '前缀和计算完成。',
        8: '定义二维动态规划表 $dp$。',
        9: '按照区间长度 $len$ 升序推进。',
        13: '分割点最优极值转移。',
        15: '更新 $dp[i][j]$。',
        18: '返回 $dp[0][n-1]$。',
      },
      python: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>。',
        3: '获取石子长度。',
        6: '计算前缀和数组 prefix。',
        9: '初始化二维列表 dp。',
        10: '遍历区间长度 length。',
        13: '列表生成式推导最小切分值并累加区间和。',
        14: '返回结果 dp[0][n-1]。',
      },
    },
    keyPoints: {
      thinking: '经典的区间 DP 问题。合并连续区间的石子堆，最后一步必然是由某两个相邻子区间 $[i, k]$ 与 $[k+1, j]$ 合并而成。',
      state: 'dp[i][j] 表示将下标从 i 到 j 的石子合并成一堆所花费的最小总代价。',
      equation: 'dp[i][j] = min_{i \\le k < j} (dp[i][k] + dp[k+1][j]) + \\sum_{m=i}^j stones[m]',
      initAndBounds: '长度为 1 的区间 dp[i][i] = 0（自身无需合并）。len 从 2 遍历至 n。',
      complexity: '时间复杂度 $O(n^3)$（三层循环：长度、起点、分割点），空间复杂度 $O(n^2)$。',
    },
    faqList: [
      {
        tag: '区间遍历顺序',
        question: '为什么区间 DP 必须先循环区间长度 len，而不是传统的 i, j 循环？',
        answer: '因为计算大区间 [i, j] 的状态依赖于所有严格更短的子区间 [i, k] 与 [k+1, j]。只有先算完较短区间，大区间查表时子状态才保证已就绪。',
      },
      {
        tag: '前缀和优化',
        question: '为什么需要提前构建前缀和数组？',
        answer: '最后一步两堆合并需要加上区间内所有石子的总重。利用前缀和可以在 $O(1)$ 时间内得到任意区间和，避免在最内层重复遍历求和。',
      },
    ],
  },
  generateSteps: (input: { stones?: number[] }): DpTraceStep[] => {
    const rawStones = input?.stones && input.stones.length > 0 ? input.stones : [3, 2, 4, 1];
    const stones = rawStones.slice(0, 8); // 限制展示长度
    const n = stones.length;
    const steps: DpTraceStep[] = [];

    const sum = new Array(n + 1).fill(0);
    for (let i = 0; i < n; i++) sum[i + 1] = sum[i] + stones[i];

    const dp: DpCell[][] = Array.from({ length: n }, (_, r) =>
      Array.from({ length: n }, (_, c) => ({
        value: r === c ? 0 : 0,
        state: r === c ? 'computed' : 'empty',
      }))
    );

    // Initial step
    steps.push(
      makeTraceStep({
        dp2d: clone2d(dp),
        message: `初始化石子序列: [${stones.join(', ')}]，单堆合并成本为 0 (dp[i][i] = 0)`,
        log: '初始化前缀和数组与对角线状态',
        vars: [
          { name: 'n', value: String(n) },
          { name: 'len', value: '-' },
        ],
        metrics: { totalStones: n },
      })
    );

    for (let len = 2; len <= n; len++) {
      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;
        let minCost = Infinity;
        let bestK = i;

        dp[i][j].state = 'current';

        for (let k = i; k < j; k++) {
          const cost = Number(dp[i][k].value) + Number(dp[k + 1][j].value);
          if (cost < minCost) {
            minCost = cost;
            bestK = k;
          }
        }

        const totalIntervalWeight = sum[j + 1] - sum[i];
        const finalCost = minCost + totalIntervalWeight;
        dp[i][j].value = finalCost;
        dp[i][j].state = 'computed';

        steps.push(
          makeTraceStep({
            dp2d: clone2d(dp),
            current: { row: i, col: j },
            dependencies: [
              { row: i, col: bestK },
              { row: bestK + 1, col: j },
            ],
            message: `计算区间 [${i}..${j}] (长度 ${len}): 最优切分点 k=${bestK}，子区间代价 ${minCost} + 区间重量和 ${totalIntervalWeight} = ${finalCost}`,
            log: `dp[${i}][${j}] = dp[${i}][${bestK}](${dp[i][bestK].value}) + dp[${bestK + 1}][${j}](${dp[bestK + 1][j].value}) + ${totalIntervalWeight} = ${finalCost}`,
            formula: 'dp[i][j] = min(dp[i][k] + dp[k+1][j]) + sum(stones[i..j])',
            formulaSubstituted: `dp[${i}][${j}] = ${dp[i][bestK].value} + ${dp[bestK + 1][j].value} + ${totalIntervalWeight} = ${finalCost}`,
            vars: [
              { name: 'len', value: String(len) },
              { name: 'i', value: String(i) },
              { name: 'j', value: String(j) },
              { name: 'bestK', value: String(bestK) },
              { name: 'minCost', value: String(finalCost) },
            ],
            metrics: { minMergeCost: finalCost },
          })
        );
      }
    }

    const answer = Number(dp[0][n - 1].value);
    steps.push(
      makeTraceStep({
        dp2d: clone2d(dp),
        current: { row: 0, col: n - 1 },
        message: `🎉 合并完成！将所有石子合并为一堆的最低总成本为 ${answer}`,
        log: `最终结果 dp[0][${n - 1}] = ${answer}`,
        vars: [
          { name: '最终最小成本', value: String(answer) },
        ],
        metrics: { minMergeCost: answer },
      })
    );

    return steps;
  },
};
