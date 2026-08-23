import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';

export const CoinChangeSpec: AlgorithmSpec = {
  id: 'coin-change',
  name: '零钱兑换 (Coin Change)',
  category: '背包 DP',
  description: '给你一个整数数组 coins 表示不同面额的硬币，和一个整数 amount 表示总金额。计算并返回可以凑成总金额所需的最少的硬币个数。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 322,
    leetcodeUrl: 'https://leetcode.cn/problems/coin-change/',
    difficulty: 'medium',
    tags: ['广度优先搜索', '数组', '动态规划', '完全背包'],
    description: '给你一个整数数组 <code>coins</code> ，表示不同面额的硬币；以及一个整数 <code>amount</code> ，表示总金额。<br/><br/>计算并返回可以凑成总金额所需的 <strong>最少的硬币个数</strong> 。如果没有任何一种硬币组合能组成总金额，返回 <code>-1</code> 。<br/><br/>你可以认为每种硬币的数量是无限的（完全背包模型）。',
    examples: [
      {
        input: 'coins = [1, 2, 5], amount = 11',
        output: '3',
        explanation: '11 = 5 + 5 + 1，共 3 枚硬币。',
      },
      {
        input: 'coins = [2], amount = 3',
        output: '-1',
        explanation: '面额 2 无法凑出总金额 3。',
      },
      {
        input: 'coins = [1], amount = 0',
        output: '0',
      },
    ],
    constraints: [
      '1 <= coins.length <= 12',
      '1 <= coins[i] <= 2^31 - 1',
      '0 <= amount <= 10^4',
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
        'function coinChange(coins, amount) {',
        '    const max = amount + 1;',
        '    const dp = new Array(amount + 1).fill(max);',
        '    dp[0] = 0; // 凑成金额 0 需要 0 枚硬币',
        '    for (let i = 0; i < coins.length; i++) { // 遍历硬币面额',
        '        for (let j = coins[i]; j <= amount; j++) { // 正序遍历容量（完全背包）',
        '            dp[j] = Math.min(dp[j], dp[j - coins[i]] + 1);',
        '        }',
        '    }',
        '    return dp[amount] > amount ? -1 : dp[amount];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int coinChange(int[] coins, int amount) {',
        '        int max = amount + 1;',
        '        int[] dp = new int[amount + 1];',
        '        Arrays.fill(dp, max);',
        '        dp[0] = 0;',
        '        for (int i = 0; i < coins.length; i++) {',
        '            for (int j = coins[i]; j <= amount; j++) {',
        '                dp[j] = Math.min(dp[j], dp[j - coins[i]] + 1);',
        '            }',
        '        }',
        '        return dp[amount] > amount ? -1 : dp[amount];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int coinChange(vector<int>& coins, int amount) {',
        '        int maxVal = amount + 1;',
        '        vector<int> dp(amount + 1, maxVal);',
        '        dp[0] = 0;',
        '        for (int i = 0; i < coins.size(); i++) {',
        '            for (int j = coins[i]; j <= amount; j++) {',
        '                dp[j] = min(dp[j], dp[j - coins[i]] + 1);',
        '            }',
        '        }',
        '        return dp[amount] > amount ? -1 : dp[amount];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def coinChange(self, coins: List[int], amount: int) -> int:',
        '        dp = [float(\'inf\')] * (amount + 1)',
        '        dp[0] = 0',
        '        for coin in coins:',
        '            for j in range(coin, amount + 1):',
        '                dp[j] = min(dp[j], dp[j - coin] + 1)',
        '        return dp[amount] if dp[amount] != float(\'inf\') else -1',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：传入硬币面额数组 coins 与目标总金额 amount。',
        2: '设置极大值：max = amount + 1 作为不可达哨兵值。',
        3: '开辟一维状态数组 dp[amount + 1]，初始化为极大值。',
        4: '初始化基底：凑出总金额 0 需要 0 枚硬币 (dp[0] = 0)。',
        5: '外层遍历硬币种类。',
        6: '内层正序遍历容量：从当前硬币面额 coins[i] 到 amount（完全背包正序允许重复选择）。',
        7: '状态转移：dp[j] = Math.min(dp[j], dp[j - coins[i]] + 1)。',
        10: '返回答案：若 dp[amount] 仍为极大值说明无法凑出，返回 -1；否则返回最少硬币数。',
      },
      java: {
        2: '函数入口：计算最少硬币个数。',
        3: '定义极大值哨兵 max。',
        4: '开辟一维 dp 数组并填充 max。',
        6: '初始化 dp[0] = 0。',
        7: '外层遍历硬币。',
        8: '内层正序遍历金额。',
        9: '取最少枚数转移。',
        12: '返回结果或 -1。',
      },
      cpp: {
        3: '函数入口。',
        4: '初始化 dp 数组为 amount + 1。',
        6: 'dp[0] = 0。',
        7: '外层循环。',
        8: '内层正序循环。',
        9: '转移求最小值。',
        12: '返回判定。',
      },
      python: {
        2: '函数入口。',
        3: '初始化列表为无穷大。',
        4: 'dp[0] = 0。',
        5: '遍历硬币。',
        6: '正序遍历容量。',
        7: 'min 转移。',
        8: '返回 dp[amount] 或 -1。',
      },
    },
    keyPoints: {
      title: '🎯 零钱兑换 (Coin Change) 5 步法系统精讲',
      summary: 'LeetCode 322。完全背包求最小价值（硬币枚数）。核心在于内层容量必须正序遍历，允许同一种硬币无限次使用！',
      points: [
        { label: '一、状态定义', desc: '<code>dp[j]</code>：凑足金额为 <code>j</code> 所需的最少硬币枚数。', icon: '🎯', badge: '一维容量状态' },
        { label: '二、状态转移方程', desc: '<code>dp[j] = min(dp[j], dp[j - coin] + 1)</code>（保留当前枚数 vs 使用一枚当前硬币）。', icon: '⚡', badge: '求最小值' },
        { label: '三、初始化与边界', desc: '<code>dp[0] = 0</code>，其余位置初始化为不可达极大值（如 <code>amount + 1</code> 或 <code>Infinity</code>）。', icon: '🎬', badge: 'dp[0]=0 其余极大' },
        { label: '四、遍历推导顺序', desc: '外层遍历硬币，内层<strong>正序</strong>遍历金额 <code>j 从 coin 到 amount</code>（完全背包必须正序）。', icon: '🧭', badge: '完全背包正序' },
        { label: '五、复杂度分析', desc: '• 时间复杂度：<code>O(coins.length × amount)</code>。<br>• 空间复杂度：<code>O(amount)</code>。', icon: '⏱️', badge: 'O(N*amount)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let coins: number[] = [1, 2, 5];
    let amount = 11;

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.coins)) coins = input.coins;
      else if (typeof input.coins === 'string') coins = input.coins.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
      else if (typeof input.nums === 'string') coins = input.nums.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));

      if (typeof input.amount === 'number') amount = input.amount;
      else if (typeof input.target === 'number') amount = input.target;
      else if (typeof input.w === 'number') amount = input.w;
    }

    const max = amount + 1;
    const dp: DpCell[] = Array(amount + 1).fill('∞');
    dp[0] = 0;

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
        { name: 'dp[j] (最少枚数)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpj') },
      ];
    };

    // Step 0: Entry
    push({
      dp1d: clone1d(dp),
      source: coins.map(String),
      message: `🎯 函数入口：零钱兑换。硬币面额 [${coins.join(', ')}]，目标凑出金额 ${amount}。`,
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
      message: `🎬 初始化基底：凑出金额 0 需 0 枚硬币 (dp[0] = 0)，其余金额初始为 ∞。`,
      log: `init: dp[0]=0, others=inf`,
      vars: makeVars({ curAmt: 0, curDp: 0, changed: ['dpj'] }),
      thematicMeta: {
        type: 'coin',
        coin: {
          targetAmount: amount,
          currentAmount: 0,
          coins,
          action: 'match',
        },
      },
      codeLine: { java: 5, cpp: 5, python: 4, javascript: 4 },
    });

    // Loops (完全背包: 外层 coins, 内层 j 从 coin 到 amount)
    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i];

      push({
        dp1d: clone1d(dp),
        source: coins.map(String),
        current: { index: coin },
        message: `🔄 外层循环：考察面额 ${coin}（面额 ${coin} 可以无限次选取）。`,
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
        codeLine: { java: 6, cpp: 6, python: 5, javascript: 5 },
      });

      for (let j = coin; j <= amount; j++) {
        const prev = dp[j - coin];
        const canTransfer = prev !== '∞';

        push({
          dp1d: clone1d(dp),
          source: coins.map(String),
          current: { index: j },
          dependencies: [{ index: j - coin }],
          message: canTransfer
            ? `🔍 考察金额 ${j}：前驱金额 ${j - coin} 可达 (dp[${j - coin}] = ${prev})，使用一枚面额 ${coin} 需 ${Number(prev) + 1} 枚硬币。`
            : `🔍 考察金额 ${j}：前驱金额 ${j - coin} 当前不可达 (dp[${j - coin}] = ∞)。`,
          log: `check: coin=${coin}, j=${j}, prev=${prev}`,
          vars: makeVars({ coinIdx: i, curCoin: coin, curAmt: j, curDp: dp[j], changed: ['j'] }),
          codeLine: {
            java: { primary: 7, context: [6] },
            cpp: { primary: 7, context: [6] },
            python: { primary: 6, context: [5] },
            javascript: { primary: 6, context: [5] },
          },
        });

        if (canTransfer) {
          const currentVal = dp[j] === '∞' ? max : Number(dp[j]);
          const candidate = Number(prev) + 1;
          const nextVal = Math.min(currentVal, candidate);
          dp[j] = nextVal;

          const isUpdated = nextVal < currentVal;
          push({
            dp1d: clone1d(dp),
            source: coins.map(String),
            current: { index: j },
            dependencies: [{ index: j - coin }],
            formula: `dp[${j}] = min(${currentVal === max ? '∞' : currentVal}, dp[${j - coin}] + 1) = min(${currentVal === max ? '∞' : currentVal}, ${candidate}) = ${nextVal}`,
            message: isUpdated
              ? `⚡ 状态转移：发现更优硬币组合！dp[${j}] 由 ${currentVal === max ? '∞' : currentVal} 更新为 ${nextVal} 枚。`
              : `⏩ 状态保持：当前已有的 ${currentVal} 枚优于或等于新方案 (${candidate} 枚)，保持 dp[${j}] = ${currentVal}。`,
            log: `update: dp[${j}] = ${nextVal}`,
            vars: makeVars({ coinIdx: i, curCoin: coin, curAmt: j, curDp: nextVal, changed: isUpdated ? ['dpj'] : [] }),
            thematicMeta: {
              type: 'coin',
              coin: {
                targetAmount: amount,
                currentAmount: j,
                currentCoin: coin,
                coins,
                action: isUpdated ? 'match' : 'overflow',
              },
            },
            codeLine: {
              java: { primary: 8, context: [6, 7] },
              cpp: { primary: 8, context: [6, 7] },
              python: { primary: 7, context: [5, 6] },
              javascript: { primary: 7, context: [5, 6] },
            },
          });
        }
      }
    }

    const finalVal = dp[amount] === '∞' || Number(dp[amount]) > amount ? -1 : Number(dp[amount]);
    push({
      dp1d: clone1d(dp),
      source: coins.map(String),
      current: { index: amount },
      message: finalVal === -1
        ? `🏁 算法结束：无法使用给定面额凑出总金额 ${amount}，返回 -1。`
        : `🏁 算法结束：凑成金额 ${amount} 所需的最少硬币枚数为 dp[${amount}] = ${finalVal} 枚。`,
      log: `return: ans=${finalVal}`,
      vars: makeVars({ curAmt: amount, curDp: finalVal, changed: ['dpj'] }),
      thematicMeta: {
        type: 'coin',
        coin: {
          targetAmount: amount,
          currentAmount: amount,
          coins,
          action: finalVal === -1 ? 'overflow' : 'match',
        },
      },
      codeLine: { java: 11, cpp: 11, python: 9, javascript: 10 },
    });

    return steps;
  },
};
