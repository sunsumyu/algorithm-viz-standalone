import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 盈利计划 (Profitable Schemes)
 * LeetCode 879 / 左程云算法通关课 第069讲 三维DP
 * 状态定义：三维背包计数DP。dp[i][j][k] 表示前 i 个任务中，消耗人数不超过 j，产生利润至少为 k 的合法计划数。
 */
export const ProfitableSchemesSpec: AlgorithmSpec = {
  id: 'profitable-schemes',
  name: '盈利计划 (Profitable Schemes)',
  category: '三维 DP',
  description:
    '集团有 n 名成员，提供多项可能产生利润的工作。每项工作需要 group[i] 名成员并产生 profit[i] 利润。求总成员不超过 n 且总利润至少为 minProfit 的不同盈利计划总数（对 10^9 + 7 取模）。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 879,
    leetcodeUrl: 'https://leetcode.cn/problems/profitable-schemes/',
    difficulty: 'hard',
    tags: ['动态规划', '背包问题', '三维DP', '计数DP'],
    description:
      '集团有 <code>n</code> 名员工，他们可以完成一些工作。第 <code>i</code> 项工作产生 <code>profit[i]</code> 的利润，并且需要 <code>group[i]</code> 名成员共同参与。<br/><br/>如果成员参与了其中一项工作，就不能参与另一项工作。<br/><br/>工作的任何至少产生 <code>minProfit</code> 利润且成员总数不超过 <code>n</code> 的子集称为<strong>盈利计划</strong>。<br/><br/>求可选取的不同盈利计划数目。答案可能很大，返回对 <code>10^9 + 7</code> 取模的结果。',
    examples: [
      {
        input: 'n = 5, minProfit = 3, group = [2, 2], profit = [2, 3]',
        output: '2',
        explanation: '至少产生利润 3：计划选择第 2 项（2人，利润3），或者选择两项都要（4人，利润5）。共 2 种方案。',
      },
      {
        input: 'n = 10, minProfit = 5, group = [2, 3, 5], profit = [6, 7, 8]',
        output: '7',
        explanation: '至少产生 5 利润且人数 ≤ 10 的方案共有 7 种。',
      },
    ],
    constraints: [
      '1 <= n <= 100',
      '0 <= minProfit <= 100',
      '1 <= group.length <= 100',
      '1 <= group[i] <= 100',
      '0 <= profit[i] <= 100',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 4, cpp: 5, python: 3, javascript: 2 },
    init: { java: 7, cpp: 8, python: 6, javascript: 5 },
    loopCheck: { java: 9, cpp: 10, python: 8, javascript: 7 },
    innerLoopCheck: { java: 12, cpp: 13, python: 11, javascript: 10 },
    stateTransfer: {
      java: [14, 15, 16],
      cpp: [15, 16, 17],
      python: [13, 14],
      javascript: [12, 13],
    },
    loopExit: { java: 19, cpp: 20, python: 16, javascript: 17 },
    returnResult: { java: 21, cpp: 22, python: 17, javascript: 19 },
  },
  code: {
    languages: {
      javascript: [
        'function profitableSchemes(n, minProfit, group, profit) {',
        '  const MOD = 1000000007;',
        '  const len = group.length;',
        '  const dp = Array.from({ length: n + 1 }, () => Array(minProfit + 1).fill(0));',
        '  for (let j = 0; j <= n; j++) dp[j][0] = 1;',
        '  for (let i = 0; i < len; i++) {',
        '    const g = group[i], p = profit[i];',
        '    for (let j = n; j >= g; j--) {',
        '      for (let k = minProfit; k >= 0; k--) {',
        '        const prevProfit = Math.max(0, k - p);',
        '        dp[j][k] = (dp[j][k] + dp[j - g][prevProfit]) % MOD;',
        '      }',
        '    }',
        '  }',
        '  return dp[n][minProfit];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int profitableSchemes(int n, int minProfit, int[] group, int[] profit) {',
        '        int MOD = 1000000007;',
        '        int len = group.length;',
        '        int[][] dp = new int[n + 1][minProfit + 1];',
        '        for (int j = 0; j <= n; j++) dp[j][0] = 1;',
        '        for (int i = 0; i < len; i++) {',
        '            int g = group[i], p = profit[i];',
        '            for (int j = n; j >= g; j--) {',
        '                for (int k = minProfit; k >= 0; k--) {',
        '                    int prevProfit = Math.max(0, k - p);',
        '                    dp[j][k] = (dp[j][k] + dp[j - g][prevProfit]) % MOD;',
        '                }',
        '            }',
        '        }',
        '        return dp[n][minProfit];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int profitableSchemes(int n, int minProfit, vector<int>& group, vector<int>& profit) {',
        '        int MOD = 1e9 + 7;',
        '        int len = group.size();',
        '        vector<vector<int>> dp(n + 1, vector<int>(minProfit + 1, 0));',
        '        for (int j = 0; j <= n; j++) dp[j][0] = 1;',
        '        for (int i = 0; i < len; i++) {',
        '            int g = group[i], p = profit[i];',
        '            for (int j = n; j >= g; j--) {',
        '                for (int k = minProfit; k >= 0; k--) {',
        '                    int prevProfit = max(0, k - p);',
        '                    dp[j][k] = (dp[j][k] + dp[j - g][prevProfit]) % MOD;',
        '                }',
        '            }',
        '        }',
        '        return dp[n][minProfit];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def profitableSchemes(self, n: int, minProfit: int, group: list[int], profit: list[int]) -> int:',
        '        MOD = 10**9 + 7',
        '        length = len(group)',
        '        dp = [[0] * (minProfit + 1) for _ in range(n + 1)]',
        '        for j in range(n + 1):',
        '            dp[j][0] = 1',
        '        for i in range(length):',
        '            g, p = group[i], profit[i]',
        '            for j in range(n, g - 1, -1):',
        '                for k in range(minProfit, -1, -1):',
        '                    prev_profit = max(0, k - p)',
        '                    dp[j][k] = (dp[j][k] + dp[j - g][prev_profit]) % MOD',
        '        return dp[n][minProfit]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口，传入可用员工上限 n，最低利润 minProfit，员工需求数组 group 与利润数组 profit。',
        4: 'dp[j][k] 表示人数不超过 j，产生利润至少为 k 的计划数（空间压缩为二维）。',
        5: '初始化：无论允许多少人（j >= 0），达到 0 利润的方案都至少有 1 个（即空计划）。',
        6: '外层遍历每一个可选工作任务 i。',
        8: '倒序遍历人数 j 从 n 到 g（避免同任务重复选取，类似 01 背包）。',
        9: '倒序遍历所需利润 k 从 minProfit 到 0。',
        10: '当利润溢出时截断在 0（Math.max(0, k - p)），因为所需负利润即相当于无限制。',
        11: '状态转移累加：选取当前任务方案数 = dp[j - g][max(0, k - p)]。',
        15: '返回总人数不超过 n 且总利润至少为 minProfit 的合法计划数。',
      },
      java: {
        2: '方法入口。',
        6: '初始化 0 利润基准方案数。',
        7: '外层遍历各项任务。',
        9: '人数倒序 01 背包循环。',
        10: '利润倒序遍历。',
        12: '三维压缩转移方程。',
        16: '返回终态方案数。',
      },
      cpp: {
        3: '函数入口。',
        7: '初始化基准行。',
        8: '遍历任务集。',
        10: '人数逆序枚举。',
        11: '利润逆序枚举。',
        13: '模运算状态转移。',
        17: '返回方案总数。',
      },
      python: {
        2: '方法入口。',
        6: '0利润行初始化为 1。',
        8: '遍历各项工作任务。',
        10: '人数逆序。',
        11: '利润逆序。',
        13: '累加转移。',
        15: '返回最终结果。',
      },
    },
    keyPoints: {
      thinking:
        '三维背包计数DP：每个工作有“人数消耗”和“利润收益”两个维度。利润维度只需达到 minProfit，因此超过 minProfit 的部分均等价映射到 minProfit 状态，有效将无限维度收敛为有界的 minProfit + 1。',
      state: 'dp[j][k] 表示至多消耗 j 个人且产生利润至少为 k 的合法盈利计划数。',
      equation: 'dp[j][k] = dp[j][k] + dp[j - group[i]][max(0, k - profit[i])]',
      initAndBounds: 'dp[j][0] = 1 (0 <= j <= n)。',
      complexity: '时间复杂度 $O(len \\cdot n \\cdot minProfit)$，空间复杂度滚动压缩为 $O(n \\cdot minProfit)$。',
    },
    faqList: [
      {
        tag: '至少利润与截断',
        question: '为什么利润转移时可以使用 Math.max(0, k - p)？',
        answer:
          '因为题目要求的是利润“至少”为 minProfit，而不是“恰好”。如果选择当前工作后单项利润已经超过了需求 k，那么之前只需提供 ≥ 0 的利润即可满足条件，因此下界截断在 0。',
      },
    ],
  },
  generateSteps: (input: { n?: number; minProfit?: number; group?: number[]; profit?: number[] } = {}): DpTraceStep[] => {
    const n = input?.n || 5;
    const minProfit = input?.minProfit || 3;
    const group = input?.group || [2, 2];
    const profit = input?.profit || [2, 3];
    const steps: DpTraceStep[] = [];
    const MOD = 1000000007;

    const dp: number[][] = Array.from({ length: n + 1 }, () => Array(minProfit + 1).fill(0));
    for (let j = 0; j <= n; j++) dp[j][0] = 1;

    const toDp2d = (grid: number[][], activeJ?: number, activeK?: number) =>
      grid.map((rArr, j) =>
        rArr.map((val, k) => ({
          value: val,
          state: (j === activeJ && k === activeK) ? ('active' as const) : val > 0 ? ('computed' as const) : ('default' as const),
        }))
      );

    steps.push(
      makeTraceStep({
        dp2d: toDp2d(dp),
        message: `💼 盈利计划初始化：员工总数 n=${n}，目标最低利润 minProfit=${minProfit}，工作列表项数=${group.length}。任何人数达到 0 利润的基准方案数均为 1。`,
        log: `初始化 01 三维压缩背包：n=${n}, minProfit=${minProfit}, tasks=${group.length}`,
        vars: [
          { name: '员工总数 n', value: String(n) },
          { name: '目标利润', value: String(minProfit) },
          { name: '工作项数', value: String(group.length) },
        ],
        metrics: { totalSchemes: 1 },
      })
    );

    for (let i = 0; i < group.length; i++) {
      const g = group[i];
      const p = profit[i];
      for (let j = n; j >= g; j--) {
        for (let k = minProfit; k >= 0; k--) {
          const prevProfit = Math.max(0, k - p);
          dp[j][k] = (dp[j][k] + dp[j - g][prevProfit]) % MOD;
        }
      }

      steps.push(
        makeTraceStep({
          dp2d: toDp2d(dp, n, minProfit),
          current: { row: n, col: minProfit },
          message: `⚙️ 处理第 ${i + 1} 项工作（需 ${g} 人，创收 ${p} 利润）：逆序完成 01 背包更新，当前可用全部 ${n} 人达标方案数为 <strong>${dp[n][minProfit]}</strong>。`,
          log: `任务 #${i + 1} (g=${g}, p=${p}) 完成更新 -> dp[${n}][${minProfit}] = ${dp[n][minProfit]}`,
          formula: `dp[j][k] = dp[j][k] + dp[j - ${g}][max(0, k - ${p})]`,
          vars: [
            { name: '当前任务', value: `#${i + 1} (需${g}人/赚${p})` },
            { name: '达标方案数', value: String(dp[n][minProfit]) },
          ],
          metrics: { totalSchemes: dp[n][minProfit] },
        })
      );
    }

    const ans = dp[n][minProfit];

    steps.push(
      makeTraceStep({
        dp2d: toDp2d(dp, n, minProfit),
        current: { row: n, col: minProfit },
        message: `🏆 计算完成！在 ${n} 名员工限制下产生至少 ${minProfit} 利润的盈利计划总数为 <strong>${ans}</strong>。`,
        log: `计算结束：合法盈利计划总数 = ${ans}`,
        vars: [
          { name: '最终方案数', value: String(ans) },
        ],
        metrics: { totalSchemes: ans },
      })
    );

    return steps;
  },
};
