import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';

export const CoinChangeIiSpec: AlgorithmSpec = {
  id: 'coin-change-ii',
  name: '零钱兑换 II (Coin Change II)',
  category: '背包 DP',
  description: '给你一个整数数组 coins 表示不同面额的硬币，和一个整数 amount 表示总金额。请计算可以凑成总金额的硬币组合数。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 518,
    leetcodeUrl: 'https://leetcode.cn/problems/coin-change-ii/',
    difficulty: 'medium',
    tags: ['数组', '动态规划', '完全背包'],
    description: '给你一个整数数组 <code>coins</code> 表示不同面额的硬币，另给一个整数 <code>amount</code> 表示总金额。<br/><br/>请你计算并返回可以凑成总金额的 <strong>硬币组合数</strong> 。如果任何硬币组合都都无法凑出总金额，返回 <code>0</code> 。<br/><br/>假设每一种面额的硬币有无限个。<br/><br/>题目数据保证结果符合 32 位带符号整数。',
    examples: [
      {
        input: 'amount = 5, coins = [1, 2, 5]',
        output: '4',
        explanation: '有 4 种方式可以凑成总金额 5：<br/>5=5<br/>5=2+2+1<br/>5=2+1+1+1<br/>5=1+1+1+1+1',
      },
      {
        input: 'amount = 3, coins = [2]',
        output: '0',
        explanation: '面额 2 的硬币不能凑成金额 3。',
      },
      {
        input: 'amount = 10, coins = [10]',
        output: '1',
      },
    ],
    constraints: [
      '1 <= coins.length <= 300',
      '1 <= coins[i] <= 5000',
      '0 <= amount <= 5000',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: [4, 5], cpp: [4, 5], python: [3, 4], javascript: [3, 4] },
    loopCheck: { java: 6, cpp: 6, python: 5, javascript: 5 },
    innerLoopCheck: { java: 7, cpp: 7, python: 6, javascript: 6 },
    stateTransfer: {
      java: { primary: 8, context: [6, 7] },
      cpp: { primary: 8, context: [6, 7] },
      python: { primary: 7, context: [5, 6] },
      javascript: { primary: 7, context: [5, 6] },
    },
    loopExit: { java: 6, cpp: 6, python: 5, javascript: 5 },
    returnResult: { java: 11, cpp: 11, python: 9, javascript: 10 },
  },
  code: {
    languages: {
      javascript: [
        'function change(amount, coins) {',
        '    const dp = new Array(amount + 1).fill(0);',
        '    dp[0] = 1; // 凑出金额 0 有 1 种方法（不选任何硬币）',
        '    for (let i = 0; i < coins.length; i++) { // 遍历硬币（求组合数：先物品后容量）',
        '        for (let j = coins[i]; j <= amount; j++) { // 正序遍历容量',
        '            dp[j] += dp[j - coins[i]];',
        '        }',
        '    }',
        '    return dp[amount];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int change(int amount, int[] coins) {',
        '        int[] dp = new int[amount + 1];',
        '        dp[0] = 1;',
        '        for (int i = 0; i < coins.length; i++) {',
        '            for (int j = coins[i]; j <= amount; j++) {',
        '                dp[j] += dp[j - coins[i]];',
        '            }',
        '        }',
        '        return dp[amount];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int change(int amount, vector<int>& coins) {',
        '        vector<uint64_t> dp(amount + 1, 0);',
        '        dp[0] = 1;',
        '        for (int i = 0; i < coins.size(); i++) {',
        '            for (int j = coins[i]; j <= amount; j++) {',
        '                dp[j] += dp[j - coins[i]];',
        '            }',
        '        }',
        '        return dp[amount];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def change(self, amount: int, coins: List[int]) -> int:',
        '        dp = [0] * (amount + 1)',
        '        dp[0] = 1',
        '        for coin in coins:',
        '            for j in range(coin, amount + 1):',
        '                dp[j] += dp[j - coin]',
        '        return dp[amount]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：计算凑成总金额 amount 的全部不同硬币组合数。',
        2: '开辟一维状态数组 dp[amount + 1]。',
        3: '初始化：dp[0] = 1（凑出金额 0 只有 1 种选法：什么硬币都不取）。',
        4: '外层遍历硬币面额：先物品后容量，确保生成的是无序的【组合数】（如 [1, 2] 与 [2, 1] 视为同一种）。',
        5: '内层正序遍历容量：从 coins[i] 到 amount。',
        6: '状态转移累加：dp[j] += dp[j - coins[i]]。',
        9: '返回全局组合总数 dp[amount]。',
      },
      java: {
        2: '函数入口。',
        4: '初始化 dp 数组。',
        5: 'dp[0] = 1。',
        6: '外层遍历硬币（求组合）。',
        7: '内层正序遍历金额。',
        8: '累加方案数。',
        11: '返回 dp[amount]。',
      },
      cpp: {
        3: '函数入口。',
        5: '初始化 dp 表与 dp[0] = 1。',
        6: '外层循环遍历硬币。',
        7: '内层正序循环。',
        8: '累加方案数。',
        11: '返回结果。',
      },
      python: {
        2: '函数入口。',
        3: '初始化列表。',
        4: 'dp[0] = 1。',
        5: '遍历硬币。',
        6: '正序遍历。',
        7: '累加组合数。',
        8: '返回 dp[amount]。',
      },
    },
    keyPoints: {
      title: '🎯 零钱兑换 II 5 步法系统精讲',
      summary: 'LeetCode 518。完全背包求组合数。遍历顺序是本题灵魂：必须先遍历硬币、再正序遍历背包容量，才能保证结果是「无序的组合数」而非「有序的排列数」！',
      points: [
        { label: '一、状态定义', desc: '<code>dp[j]</code>：凑出总金额为 <code>j</code> 的硬币组合总数。', icon: '🎯', badge: '一维组合状态' },
        { label: '二、状态转移方程', desc: '<code>dp[j] += dp[j - coins[i]]</code>。', icon: '⚡', badge: '加和累加' },
        { label: '三、初始化', desc: '<code>dp[0] = 1</code>（凑成金额 0 有 1 种方法），其余为 0。', icon: '🎬', badge: 'dp[0]=1' },
        { label: '四、组合数遍历铁律', desc: '• <strong>求组合数</strong>：外层遍历物品，内层遍历容量（物品先后顺序固定，不会出现 [1,2] 和 [2,1] 重复）。<br>• <strong>求排列数</strong>：外层遍历容量，内层遍历物品。', icon: '🧭', badge: '先物品后容量' },
        { label: '五、复杂度分析', desc: '• 时间复杂度：<code>O(coins.length × amount)</code>。<br>• 空间复杂度：<code>O(amount)</code>。', icon: '⏱️', badge: 'O(N*amount)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let coins: number[] = [1, 2, 5];
    let amount = 5;

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.coins)) coins = input.coins;
      else if (typeof input.coins === 'string') coins = input.coins.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));

      if (typeof input.amount === 'number') amount = input.amount;
      else if (typeof input.target === 'number') amount = input.target;
    }

    const dp: DpCell[] = Array(amount + 1).fill(0);
    dp[0] = 1;

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      coinIdx?: number | string;
      curCoin?: number | string;
      curAmt?: number | string;
      curDp?: DpCell | number | string;
      changed?: string[];
    }) => {
      const cIdx = opts.coinIdx ?? '-';
      const coinVal = opts.curCoin ?? '-';
      const amtVal = opts.curAmt ?? '-';
      const cur = opts.curDp ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'coins (硬币面额)', value: `[${coins.join(', ')}]`, type: 'string' as const, changed: chSet.has('coins') },
        { name: 'amount (目标金额)', value: String(amount), type: 'number' as const, changed: chSet.has('amount') },
        { name: 'i (硬币索引)', value: String(cIdx), type: (typeof cIdx === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'coins[i] (当前面额)', value: String(coinVal), type: (typeof coinVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('coin') },
        { name: 'j (当前金额)', value: String(amtVal), type: (typeof amtVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 'dp[j] (组合数)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpj') },
      ];
    };

    // Step 0: Entry
    push({
      dp1d: clone1d(dp),
      source: coins.map(String),
      message: `🎯 函数入口：零钱兑换 II。求面额 [${coins.join(', ')}] 凑成金额 ${amount} 的全部组合数。`,
      log: `entry: coins=[${coins.join(',')}], amount=${amount}`,
      vars: makeVars({ changed: ['coins', 'amount'] }),
      thematicMeta: {
        type: 'coin',
        coin: {
          targetAmount: amount,
          currentAmount: 0,
          coins,
          action: 'idle',
        },
      },
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    // Step 1: Init
    push({
      dp1d: clone1d(dp),
      source: coins.map(String),
      current: { index: 0 },
      message: `🎬 初始化基底：dp[0] = 1（凑出金额 0 有 1 种方法：不取任何硬币）。`,
      log: `init: dp[0]=1`,
      vars: makeVars({ curAmt: 0, curDp: 1, changed: ['dpj'] }),
      thematicMeta: {
        type: 'coin',
        coin: {
          targetAmount: amount,
          currentAmount: 0,
          coins,
          action: 'match',
        },
      },
      codeLine: { java: 5, cpp: 5, python: 4, javascript: 3 },
    });

    // Loops (完全背包组合数: 外层 coins, 内层 j 从 coin 到 amount)
    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i];

      push({
        dp1d: clone1d(dp),
        source: coins.map(String),
        current: { index: coin <= amount ? coin : 0 },
        message: `🔄 外层循环：考察面额 ${coin}（先物品后容量，计算无序组合数）。`,
        log: `outer loop: coin=${coin}`,
        vars: makeVars({ coinIdx: i, curCoin: coin, changed: ['i', 'coin'] }),
        thematicMeta: {
          type: 'coin',
          coin: {
            targetAmount: amount,
            currentCoin: coin,
            coins,
            action: 'drop',
          },
        },
        codeLine: { java: 6, cpp: 6, python: 5, javascript: 4 },
      });

      for (let j = coin; j <= amount; j++) {
        const prev = dp[j - coin] as number;
        const oldVal = dp[j] as number;
        dp[j] = oldVal + prev;

        push({
          dp1d: clone1d(dp),
          source: coins.map(String),
          current: { index: j },
          dependencies: [{ index: j - coin }],
          formula: `dp[${j}] += dp[${j - coin}] (${prev}) => ${dp[j]}`,
          message: `⚡ 组合数累加：使用面额 ${coin}，金额 ${j} 的组合方案由 ${oldVal} 累加 ${prev} 变为 ${dp[j]} 种。`,
          log: `update: dp[${j}] = ${dp[j]}`,
          vars: makeVars({ coinIdx: i, curCoin: coin, curAmt: j, curDp: dp[j], changed: ['dpj'] }),
          thematicMeta: {
            type: 'coin',
            coin: {
              targetAmount: amount,
              currentAmount: j,
              currentCoin: coin,
              coins,
              action: prev > 0 ? 'match' : 'idle',
            },
          },
          codeLine: {
            java: { primary: 8, context: [6, 7] },
            cpp: { primary: 8, context: [6, 7] },
            python: { primary: 7, context: [5, 6] },
            javascript: { primary: 6, context: [4, 5] },
          },
        });
      }
    }

    const ans = dp[amount] as number;
    push({
      dp1d: clone1d(dp),
      source: coins.map(String),
      current: { index: amount },
      message: `🏁 算法结束：凑成总金额 ${amount} 共有 dp[${amount}] = ${ans} 种不同硬币组合方案。`,
      log: `return: dp[${amount}] = ${ans}`,
      vars: makeVars({ curAmt: amount, curDp: ans, changed: ['dpj'] }),
      thematicMeta: {
        type: 'coin',
        coin: {
          targetAmount: amount,
          currentAmount: amount,
          coins,
          action: 'match',
        },
      },
      codeLine: { java: 11, cpp: 11, python: 9, javascript: 9 },
    });

    return steps;
  },
};
