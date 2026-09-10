import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const MinScoreTriangulationSpec: AlgorithmSpec = {
  id: 'min-score-triangulation',
  name: '多边形三角剖分的最低得分 (Minimum Score Triangulation)',
  category: '区间 DP',
  description: '凸多边形三角剖分区间动态规划。每次将凸多边形分割为三角形，求剖分后所有三角形顶点乘积之和的最小值。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 1039,
    leetcodeUrl: 'https://leetcode.cn/problems/minimum-score-triangulation-of-polygon/',
    difficulty: 'medium',
    tags: ['动态规划', '区间 DP', '计算几何'],
    description: '你有一个凸 <code>n</code> 边形，其每个顶点都有一个权值。逆时针依次记录在数组 <code>values</code> 中。<br/><br/>假设你将多边形剖分为 <code>n - 2</code> 个三角形。每个三角形的得分是其三个顶点的权值乘积。多边形三角剖分的总得分是全部三角形得分之和。<br/><br/>返回多边形三角剖分的最低可能得分。',
    examples: [
      {
        input: 'values = [1, 2, 3]',
        output: '6',
        explanation: '已有 3 个顶点本身就是一个三角形，得分 = 1*2*3 = 6。',
      },
      {
        input: 'values = [3, 7, 4, 5]',
        output: '144',
        explanation: '有两种三角剖分方案：<br/>1. (3,7,5) + (7,4,5) = 105 + 140 = 245<br/>2. (3,7,4) + (3,4,5) = 84 + 60 = 144<br/>最低得分为 144。',
      },
    ],
    constraints: [
      'n == values.length',
      '3 <= n <= 50',
      '1 <= values[i] <= 100',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 4, python: 3, javascript: 2 },
    init: { java: 5, cpp: 6, python: 5, javascript: 4 },
    loopCheck: { java: 6, cpp: 7, python: 6, javascript: 5 },
    innerLoopCheck: { java: 7, cpp: 8, python: 7, javascript: 6 },
    stateTransfer: { java: [10, 11], cpp: [11, 12], python: [10, 11], javascript: [9, 10] },
    loopExit: { java: 6, cpp: 7, python: 6, javascript: 5 },
    returnResult: { java: 16, cpp: 17, python: 14, javascript: 15 },
  },
  code: {
    languages: {
      javascript: [
        'function minScoreTriangulation(values) {',
        '    const n = values.length;',
        '    if (n < 3) return 0;',
        '    const dp = Array.from({ length: n }, () => new Array(n).fill(0));',
        '    // len 为顶点跨度，从 3 开始（构成三角形）',
        '    for (let len = 3; len <= n; len++) {',
        '        for (let i = 0; i <= n - len; i++) {',
        '            const j = i + len - 1;',
        '            let minScore = Infinity;',
        '            // 枚举以边 (i, j) 为底边的第三个顶点 k',
        '            for (let k = i + 1; k < j; k++) {',
        '                const triangle = values[i] * values[k] * values[j];',
        '                minScore = Math.min(minScore, dp[i][k] + dp[k][j] + triangle);',
        '            }',
        '            dp[i][j] = minScore;',
        '        }',
        '    }',
        '    return dp[0][n - 1];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int minScoreTriangulation(int[] values) {',
        '        int n = values.length;',
        '        if (n < 3) return 0;',
        '        int[][] dp = new int[n][n];',
        '        for (int len = 3; len <= n; len++) {',
        '            for (int i = 0; i <= n - len; i++) {',
        '                int j = i + len - 1;',
        '                int minScore = Integer.MAX_VALUE;',
        '                for (int k = i + 1; k < j; k++) {',
        '                    int triangle = values[i] * values[k] * values[j];',
        '                    minScore = Math.min(minScore, dp[i][k] + dp[k][j] + triangle);',
        '                }',
        '                dp[i][j] = minScore;',
        '            }',
        '        }',
        '        return dp[0][n - 1];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int minScoreTriangulation(vector<int>& values) {',
        '        int n = values.size();',
        '        if (n < 3) return 0;',
        '        vector<vector<int>> dp(n, vector<int>(n, 0));',
        '        for (int len = 3; len <= n; len++) {',
        '            for (int i = 0; i <= n - len; i++) {',
        '                int j = i + len - 1;',
        '                int minScore = INT_MAX;',
        '                for (int k = i + 1; k < j; k++) {',
        '                    int triangle = values[i] * values[k] * values[j];',
        '                    minScore = min(minScore, dp[i][k] + dp[k][j] + triangle);',
        '                }',
        '                dp[i][j] = minScore;',
        '            }',
        '        }',
        '        return dp[0][n - 1];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def minScoreTriangulation(self, values: List[int]) -> int:',
        '        n = len(values)',
        '        if n < 3:',
        '            return 0',
        '        dp = [[0] * n for _ in range(n)]',
        '        for length in range(3, n + 1):',
        '            for i in range(n - length + 1):',
        '                j = i + length - 1',
        '                dp[i][j] = min(',
        '                    dp[i][k] + dp[k][j] + values[i] * values[k] * values[j]',
        '                    for k in range(i + 1, j)',
        '                )',
        '        return dp[0][n - 1]',
      ],
    },
    lineExplanations: {
      java: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>：求多边形三角剖分的最低得分。',
        4: '顶点数少于 3 无法形成多边形，得分为 0。',
        5: '二维 DP 表：$dp[i][j]$ 表示顶点子多边形 $i, i+1, \\dots, j$ 完成三角剖分的最低得分。',
        6: '按多边形顶点跨度 $len$ 从 3 增至 $n$。',
        7: '枚举子多边形起始顶点 $i$。',
        8: '确定子多边形终止顶点 $j = i + len - 1$。',
        9: '初始化当前子多边形最小得分为无穷大。',
        10: '🌟 <strong>核心分割</strong>：固定边 $(i, j)$，枚举内部第 3 个顶点 $k \\in [i+1, j-1]$ 组成三角形 $(i, k, j)$。',
        11: '该三角形将子多边形划分为两部分：左侧子多边形 $dp[i][k]$、右侧子多边形 $dp[k][j]$ 以及当前三角形贡献。',
        12: '取所有可能切分点 $k$ 中的最小值。',
        16: '返回 $dp[0][n-1]$，即整凸多边形三角剖分的最低得分。',
      },
      javascript: {
        1: '🎯 <strong>函数主入口</strong>。',
        4: '初始化 DP 表。',
        6: '跨度 len 从 3 开始（两点无法组成三角形）。',
        10: '枚举内部第三个顶点 k。',
        13: '状态转移累加左子多边形、右子多边形与当前三角形乘积。',
        18: '返回全局最优得分。',
      },
      cpp: {
        1: '类定义 Solution。',
        3: '🎯 <strong>函数主入口</strong>。',
        6: '二维 dp 数组。',
        7: '区间长度推进。',
        11: '枚举中间顶点 k 构造三角形 (i, k, j)。',
        17: '返回 $dp[0][n-1]$。',
      },
      python: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>。',
        5: '初始化 dp 列表。',
        6: '遍历顶点跨度 length。',
        9: '推导所有中间顶点 k 并取极小值。',
        14: '返回 dp[0][n-1]。',
      },
    },
    keyPoints: {
      thinking: '对于凸多边形子序列 i 到 j，边 (i, j) 必然属于剖分中的某一个三角形 (i, k, j)（其中 i < k < j）。该三角形将多边形完美拆分为两块更小规模的凸多边形。',
      state: 'dp[i][j] 表示由顶点 i, i+1, ..., j 组成的多边形进行三角剖分后的最小总得分。',
      equation: 'dp[i][j] = \\min_{i < k < j} (dp[i][k] + dp[k][j] + values[i] \\times values[k] \\times values[j])',
      initAndBounds: 'len < 3 时两点连线得分为 0；len 从 3 到 n。',
      complexity: '时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。',
    },
    faqList: [
      {
        tag: '模型相似性',
        question: '本题与“戳气球”和“石子合并”有什么本质共通点？',
        answer: '它们均属于经典区间 DP 范式：通过枚举区间内的核心决策点 k（石子合并的切分点、气球的最后戳破点、多边形的第三顶点），将大区间 [i, j] 递归划分为两个独立的子区间 [i, k] 与 [k, j]，并叠加当前决策产生的合并成本。',
      },
    ],
  },
  generateSteps: (input: { values?: number[] }): DpTraceStep[] => {
    const rawVals = input?.values && input.values.length > 0 ? input.values : [3, 7, 4, 5];
    const values = rawVals.slice(0, 6);
    const n = values.length;
    const steps: DpTraceStep[] = [];

    const dp: DpCell[][] = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => ({
        value: 0,
        state: 'empty',
      }))
    );

    steps.push(
      makeTraceStep({
        dp2d: clone2d(dp),
        message: `初始化凸多边形顶点权值: [${values.join(', ')}]，两相邻顶点（边）无法形成三角形，dp[i][i+1] = 0`,
        log: '初始化 DP 状态表，相邻边得分为 0',
        vars: [
          { name: 'n', value: String(n) },
        ],
        metrics: { minScore: 0 },
      })
    );

    for (let len = 3; len <= n; len++) {
      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;
        let minScore = Infinity;
        let bestK = i + 1;

        dp[i][j].state = 'current';

        for (let k = i + 1; k < j; k++) {
          const triangle = values[i] * values[k] * values[j];
          const total = Number(dp[i][k].value) + Number(dp[k][j].value) + triangle;
          if (total < minScore) {
            minScore = total;
            bestK = k;
          }
        }

        dp[i][j].value = minScore;
        dp[i][j].state = 'computed';

        const triScore = values[i] * values[bestK] * values[j];
        steps.push(
          makeTraceStep({
            dp2d: clone2d(dp),
            current: { row: i, col: j },
            dependencies: [
              { row: i, col: bestK },
              { row: bestK, col: j },
            ],
            message: `计算子多边形 [${i}..${j}] (长度 ${len}): 最佳三角形顶点选择 k=${bestK} -> 三角形(${values[i]}*${values[bestK]}*${values[j]}=${triScore}) + 左区${dp[i][bestK].value} + 右区${dp[bestK][j].value} = ${minScore}`,
            log: `dp[${i}][${j}] = dp[${i}][${bestK}](${dp[i][bestK].value}) + dp[${bestK}][${j}](${dp[bestK][j].value}) + ${triScore} = ${minScore}`,
            formula: 'dp[i][j] = min(dp[i][k] + dp[k][j] + val[i]*val[k]*val[j])',
            formulaSubstituted: `dp[${i}][${j}] = ${dp[i][bestK].value} + ${dp[bestK][j].value} + ${triScore} = ${minScore}`,
            vars: [
              { name: 'len', value: String(len) },
              { name: 'i', value: String(i) },
              { name: 'j', value: String(j) },
              { name: 'bestK', value: String(bestK) },
              { name: 'minScore', value: String(minScore) },
            ],
            metrics: { minScore },
          })
        );
      }
    }

    const answer = Number(dp[0][n - 1].value);
    steps.push(
      makeTraceStep({
        dp2d: clone2d(dp),
        current: { row: 0, col: n - 1 },
        message: `🎉 三角剖分推演完成！全多边形最低剖分总得分为 ${answer}`,
        log: `最终结果 dp[0][${n - 1}] = ${answer}`,
        vars: [
          { name: '最低总得分', value: String(answer) },
        ],
        metrics: { minScore: answer },
      })
    );

    return steps;
  },
};
