import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const PredictTheWinnerSpec: AlgorithmSpec = {
  id: 'predict-the-winner',
  name: '预测赢家 (Predict the Winner / 博弈区间 DP)',
  category: '区间 DP',
  description: '经典博弈论区间动态规划。两位玩家轮流从数组的两端取走数字，求先手玩家是否能赢得比赛或打平。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 486,
    leetcodeUrl: 'https://leetcode.cn/problems/predict-the-winner/',
    difficulty: 'medium',
    tags: ['动态规划', '区间 DP', '博弈论', '极小化极大'],
    description: '给你一个整数数组 <code>nums</code> 。玩家 1 和玩家 2 基于这个数组设计了一个游戏。<br/><br/>玩家 1 和玩家 2 轮流进行，玩家 1 先手。开始时，两个玩家的得分均为 0 。每个回合，玩家只能从数组的开头或结尾拿走一个数，并将该数的值加到自己的得分中。这一过程持续到没有数字可选。<br/><br/>如果玩家 1 的最终得分大于或等于玩家 2 的总得分，则玩家 1 获胜。判断在双方均采取最优策略的情况下，玩家 1 是否能成为赢家。',
    examples: [
      {
        input: 'nums = [1, 5, 2]',
        output: 'false',
        explanation: '玩家 1 只能选 1 或 2。<br/>若玩家 1 选 1，数组剩 [5, 2]，玩家 2 选 5 得 5 分，玩家 1 再选 2 得 2 分，最终玩家 1 得 3 分，玩家 2 得 5 分，玩家 1 输。<br/>若玩家 1 选 2，数组剩 [1, 5]，玩家 2 选 5 得 5 分，玩家 1 再选 1 得 1 分，最终玩家 1 得 3 分，玩家 2 得 5 分，玩家 1 输。因此返回 false。',
      },
      {
        input: 'nums = [1, 5, 233, 7]',
        output: 'true',
        explanation: '玩家 1 一开始选择 1。玩家 2 只能从 5 和 7 中选。无论选哪个，玩家 1 随后都能拿到 233，稳操胜券。',
      },
    ],
    constraints: [
      '1 <= nums.length <= 20',
      '0 <= nums[i] <= 10^7',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 4, python: 3, javascript: 2 },
    init: { java: [5, 6], cpp: [6, 7], python: [5, 6], javascript: [4, 5] },
    loopCheck: { java: 8, cpp: 9, python: 8, javascript: 7 },
    innerLoopCheck: { java: 9, cpp: 10, python: 9, javascript: 8 },
    stateTransfer: { java: 11, cpp: 12, python: 11, javascript: 10 },
    loopExit: { java: 8, cpp: 9, python: 8, javascript: 7 },
    returnResult: { java: 15, cpp: 16, python: 13, javascript: 14 },
  },
  code: {
    languages: {
      javascript: [
        'function predictTheWinner(nums) {',
        '    const n = nums.length;',
        '    if (n % 2 === 0) return true; // 偶数长度先手必胜',
        '    const dp = Array.from({ length: n }, () => new Array(n).fill(0));',
        '    for (let i = 0; i < n; i++) dp[i][i] = nums[i]; // 只有一个数时净胜分即本身',
        '    // len 为区间长度，从 2 到 n',
        '    for (let len = 2; len <= n; len++) {',
        '        for (let i = 0; i <= n - len; i++) {',
        '            const j = i + len - 1;',
        '            // 选左端 nums[i] 减去对手在 (i+1, j) 的净胜分，或选右端 nums[j] 减去对手在 (i, j-1) 的净胜分',
        '            dp[i][j] = Math.max(nums[i] - dp[i + 1][j], nums[j] - dp[i][j - 1]);',
        '        }',
        '    }',
        '    return dp[0][n - 1] >= 0;',
        '}',
      ],
      java: [
        'class Solution {',
        '    public boolean predictTheWinner(int[] nums) {',
        '        int n = nums.length;',
        '        if (n % 2 == 0) return true;',
        '        int[][] dp = new int[n][n];',
        '        for (int i = 0; i < n; i++) dp[i][i] = nums[i];',
        '        for (int len = 2; len <= n; len++) {',
        '            for (int i = 0; i <= n - len; i++) {',
        '                int j = i + len - 1;',
        '                dp[i][j] = Math.max(nums[i] - dp[i + 1][j], nums[j] - dp[i][j - 1]);',
        '            }',
        '        }',
        '        return dp[0][n - 1] >= 0;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int predictTheWinner(vector<int>& nums) {',
        '        int n = nums.size();',
        '        if (n % 2 == 0) return true;',
        '        vector<vector<int>> dp(n, vector<int>(n, 0));',
        '        for (int i = 0; i < n; i++) dp[i][i] = nums[i];',
        '        for (int len = 2; len <= n; len++) {',
        '            for (int i = 0; i <= n - len; i++) {',
        '                int j = i + len - 1;',
        '                dp[i][j] = max(nums[i] - dp[i + 1][j], nums[j] - dp[i][j - 1]);',
        '            }',
        '        }',
        '        return dp[0][n - 1] >= 0;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def predictTheWinner(self, nums: List[int]) -> bool:',
        '        n = len(nums)',
        '        if n % 2 == 0:',
        '            return True',
        '        dp = [[0] * n for _ in range(n)]',
        '        for i in range(n):',
        '            dp[i][i] = nums[i]',
        '        for length in range(2, n + 1):',
        '            for i in range(n - length + 1):',
        '                j = i + length - 1',
        '                dp[i][j] = max(nums[i] - dp[i + 1][j], nums[j] - dp[i][j - 1])',
        '        return dp[0][n - 1] >= 0',
      ],
    },
    lineExplanations: {
      java: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>：判断先手是否必胜或打平。',
        4: '数学特性优化：偶数长度先手可通过控制奇数位/偶数位选择策略必胜。',
        5: '二维 DP 表定义：$dp[i][j]$ 表示在区间 $[i, j]$ 内当前行动玩家能领先对手的【最大相对净胜分】。',
        6: '初始化对角线：当只有一个数时，当前玩家直接拿走，净胜分就是 $nums[i]$。',
        7: '外层按区间长度 $len$ 从 2 递增到 $n$。',
        8: '枚举区间起点 $i$。',
        9: '计算区间终点 $j = i + len - 1$。',
        10: '🌟 <strong>零和博弈状态转移</strong>：选左端得 $nums[i] - dp[i+1][j]$，选右端得 $nums[j] - dp[i][j-1]$，取两者最大值。',
        13: '返回 $dp[0][n-1] \\ge 0$，若先手净胜分大于等于 0 则获胜。',
      },
      javascript: {
        1: '🎯 <strong>函数主入口</strong>。',
        3: '偶数特判。',
        4: '初始化二维状态表。',
        5: '长度为 1 区间初始化。',
        7: '按区间跨度递推。',
        11: '博弈转移方程比较。',
        14: '返回净胜分是否非负。',
      },
      cpp: {
        1: '类定义 Solution。',
        3: '🎯 <strong>函数主入口</strong>。',
        7: '对角线基准状态。',
        8: '递推填表。',
        11: '选左与选右的最大化比较。',
        14: '最终判定。',
      },
      python: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>。',
        8: '初始化对角线。',
        9: '按区间长度循环。',
        12: '状态转移方程。',
        13: '返回 dp[0][n-1] >= 0。',
      },
    },
    keyPoints: {
      thinking: '博弈论中的相对净胜分建模。设当前玩家能比对方多拿的分数为 dp[i][j]。不管当前是谁的回合，面对区间 [i, j] 的最优决策模式完全对称一致。',
      state: 'dp[i][j] 表示在剩余区间为 [i, j] 时，当前行动者相对于另一方的最大净胜分差值。',
      equation: 'dp[i][j] = \\max(nums[i] - dp[i+1][j],\\; nums[j] - dp[i][j-1])',
      initAndBounds: 'dp[i][i] = nums[i]；len 从 2 到 n。',
      complexity: '时间复杂度 $O(n^2)$，空间复杂度 $O(n^2)$（可空间压缩至 $O(n)$）。',
    },
    faqList: [
      {
        tag: '为什么是减去 dp',
        question: '为什么状态转移中是减去子区间的 dp 值而不是加上？',
        answer: '因为子区间的值 dp[i+1][j] 是对手在剩下数字中能够领先当前玩家的分数。因此当前玩家的净胜分为本次所选分值减去对手后续的净领先值。',
      },
      {
        tag: '偶数必胜定理',
        question: '为什么当 n 为偶数时先手必然获胜？',
        answer: '因为偶数个数字时，先手可以选择拿走全部奇数索引的数字，或者全部偶数索引的数字。先手只需在游戏开始前计算奇数位之和与偶数位之和，选择总和较大的一组策略，即可强行锁定胜利。',
      },
    ],
  },
  generateSteps: (input: { nums?: number[] }): DpTraceStep[] => {
    const rawNums = input?.nums && input.nums.length > 0 ? input.nums : [1, 5, 2];
    const nums = rawNums.slice(0, 8);
    const n = nums.length;
    const steps: DpTraceStep[] = [];

    const dp: DpCell[][] = Array.from({ length: n }, (_, r) =>
      Array.from({ length: n }, (_, c) => ({
        value: r === c ? nums[r] : 0,
        state: r === c ? 'computed' : 'empty',
      }))
    );

    steps.push(
      makeTraceStep({
        dp2d: clone2d(dp),
        message: `初始化博弈数组: [${nums.join(', ')}]，单数字区间 dp[i][i] = nums[i]`,
        log: '初始化对角线净胜分',
        vars: [
          { name: 'n', value: String(n) },
        ],
        metrics: { player1Advantage: 0 },
      })
    );

    for (let len = 2; len <= n; len++) {
      for (let i = 0; i <= n - len; i++) {
        const j = i + len - 1;
        dp[i][j].state = 'current';

        const pickLeft = nums[i] - Number(dp[i + 1][j].value);
        const pickRight = nums[j] - Number(dp[i][j - 1].value);
        const best = Math.max(pickLeft, pickRight);
        const chosen = pickLeft >= pickRight ? '左端' : '右端';

        dp[i][j].value = best;
        dp[i][j].state = 'computed';

        steps.push(
          makeTraceStep({
            dp2d: clone2d(dp),
            current: { row: i, col: j },
            dependencies: [
              { row: i + 1, col: j },
              { row: i, col: j - 1 },
            ],
            message: `计算区间 [${i}..${j}] (长度 ${len}): 选左端(${nums[i]} - ${dp[i + 1][j].value} = ${pickLeft}) vs 选右端(${nums[j]} - ${dp[i][j - 1].value} = ${pickRight}) -> 最优选${chosen}，净胜分差 = ${best}`,
            log: `dp[${i}][${j}] = max(${nums[i]} - ${dp[i + 1][j].value}, ${nums[j]} - ${dp[i][j - 1].value}) = ${best}`,
            formula: 'dp[i][j] = max(nums[i] - dp[i+1][j], nums[j] - dp[i][j-1])',
            formulaSubstituted: `dp[${i}][${j}] = max(${pickLeft}, ${pickRight}) = ${best}`,
            vars: [
              { name: 'len', value: String(len) },
              { name: 'i', value: String(i) },
              { name: 'j', value: String(j) },
              { name: '净胜分差', value: String(best) },
            ],
            metrics: { player1Advantage: best },
          })
        );
      }
    }

    const finalAdvantage = Number(dp[0][n - 1].value);
    const canWin = finalAdvantage >= 0;

    steps.push(
      makeTraceStep({
        dp2d: clone2d(dp),
        current: { row: 0, col: n - 1 },
        message: `🏁 博弈决策推演完成！先手最终最大相对净胜分差为 ${finalAdvantage}，先手${canWin ? '【获胜/打平 🎉】' : '【落败 ❌】'}`,
        log: `最终判定：dp[0][${n - 1}] = ${finalAdvantage} >= 0 -> ${canWin}`,
        vars: [
          { name: '最终净胜分', value: String(finalAdvantage) },
          { name: '先手是否获胜', value: canWin ? 'true (胜)' : 'false (负)' },
        ],
        metrics: {
          player1Advantage: finalAdvantage,
          canWin,
        },
      })
    );

    return steps;
  },
};
