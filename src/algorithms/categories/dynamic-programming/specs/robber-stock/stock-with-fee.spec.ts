import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const StockWithFeeSpec: AlgorithmSpec = {
  id: 'best-time-to-buy-and-sell-stock-with-transaction-fee',
  name: '买卖股票的最佳时机含手续费 (Stock with Fee)',
  category: '股票 DP',
  description: '给定一个整数数组 prices，其中 prices[i] 表示第 i 天的股票价格 ；整数 fee 代表了交易股票的手续费用。你可以无限次地完成交易，但是你每笔交易都需要为手续费买单。返回获得利润的最大值。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 714,
    leetcodeUrl: 'https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/',
    difficulty: 'medium',
    tags: ['贪心', '数组', '动态规划', '状态机DP'],
    description: '给定一个整数数组 <code>prices</code>，其中 <code>prices[i]</code>表示第 <code>i</code> 天的股票价格 ；整数 <code>fee</code> 代表了交易股票的手续费用。<br/><br/>你可以无限次地完成交易，但是你 <strong>每笔交易都需要为手续费买单</strong>。如果你已经购买了一支股票，在卖出它之前你就不能再继续购买股票了。<br/><br/>返回获得利润的最大值。<br/><br/><strong>注意</strong>：这里的一笔交易指买入持有并卖出股票的完整过程，每笔交易你只需要为手续费支付一次（可以在买入时扣除，或在卖出时扣除）。',
    examples: [
      {
        input: 'prices = [1, 3, 2, 8, 4, 9], fee = 2',
        output: '8',
        explanation: '能够达到的最大利润: <br/>• 在此处买入 prices[0] = 1<br/>• 在此处卖出 prices[3] = 8<br/>• 在此处买入 prices[4] = 4<br/>• 在此处卖出 prices[5] = 9<br/>总利润: ((8 - 1) - 2) + ((9 - 4) - 2) = 8 。',
      },
      {
        input: 'prices = [1, 3, 7, 5, 10, 3], fee = 3',
        output: '6',
      },
    ],
    constraints: [
      '1 <= prices.length <= 5 * 10^4',
      '1 <= prices[i] < 5 * 10^4',
      '0 <= fee < 5 * 10^4',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 3, python: 3, javascript: 2 },
    init: { java: [5, 6], cpp: [5, 6], python: [4, 5], javascript: [4, 5] },
    loopCheck: { java: 7, cpp: 7, python: 6, javascript: 6 },
    stateTransfer: {
      java: { primary: [8, 9], context: [7] },
      cpp: { primary: [8, 9], context: [7] },
      python: { primary: [7, 8], context: [6] },
      javascript: { primary: [7, 8], context: [6] },
    },
    loopExit: { java: 7, cpp: 7, python: 6, javascript: 6 },
    returnResult: { java: 11, cpp: 11, python: 9, javascript: 10 },
  },
  code: {
    languages: {
      javascript: [
        'function maxProfit(prices, fee) {',
        '    if (!prices || prices.length <= 1) return 0;',
        '    const dp = Array.from({ length: prices.length }, () => [0, 0]);',
        '    dp[0][0] = -prices[0]; // 第 0 天买入持有',
        '    dp[0][1] = 0;          // 第 0 天不持有',
        '    for (let i = 1; i < prices.length; i++) {',
        '        dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][1] - prices[i]); // 保持持有 vs 买入',
        '        dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] + prices[i] - fee); // 保持不持有 vs 卖出（扣除手续费 fee）',
        '    }',
        '    return dp[prices.length - 1][1];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int maxProfit(int[] prices, int fee) {',
        '        if (prices == null || prices.length <= 1) return 0;',
        '        int[][] dp = new int[prices.length][2];',
        '        dp[0][0] = -prices[0];',
        '        dp[0][1] = 0;',
        '        for (int i = 1; i < prices.length; i++) {',
        '            dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][1] - prices[i]);',
        '            dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] + prices[i] - fee);',
        '        }',
        '        return dp[prices.length - 1][1];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int maxProfit(vector<int>& prices, int fee) {',
        '        if (prices.size() <= 1) return 0;',
        '        vector<vector<int>> dp(prices.size(), vector<int>(2, 0));',
        '        dp[0][0] = -prices[0];',
        '        dp[0][1] = 0;',
        '        for (int i = 1; i < prices.size(); i++) {',
        '            dp[i][0] = max(dp[i - 1][0], dp[i - 1][1] - prices[i]);',
        '            dp[i][1] = max(dp[i - 1][1], dp[i - 1][0] + prices[i] - fee);',
        '        }',
        '        return dp.back()[1];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def maxProfit(self, prices: List[int], fee: int) -> int:',
        '        if len(prices) <= 1: return 0',
        '        dp = [[0, 0] for _ in range(len(prices))]',
        '        dp[0][0], dp[0][1] = -prices[0], 0',
        '        for i in range(1, len(prices)):',
        '            dp[i][0] = max(dp[i - 1][0], dp[i - 1][1] - prices[i])',
        '            dp[i][1] = max(dp[i - 1][1], dp[i - 1][0] + prices[i] - fee)',
        '        return dp[-1][1]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：含交易手续费的股票最大利润求解。',
        2: '边界保护。',
        3: '开辟 dp[n][2] 状态矩阵。',
        4: '初始化首日持有：-prices[0]。',
        5: '初始化首日不持有：0。',
        6: '遍历交易日。',
        7: '持有状态：保持持有 vs 用累计利润买入 dp[i-1][1] - prices[i]。',
        8: '不持有状态：保持不持有 vs 今日卖出并扣除手续费 dp[i-1][0] + prices[i] - fee。',
        10: '返回最后一天不持有状态的最大净利润 dp[n-1][1]。',
      },
      java: {
        2: '函数入口。',
        4: '定义 dp 数组。',
        5: '首日状态。',
        7: '循环递推。',
        8: '买入持有转移。',
        9: '卖出扣费转移。',
        11: '返回 dp[n-1][1]。',
      },
      cpp: {
        3: '函数入口。',
        5: '初始化状态向量。',
        6: '首日状态。',
        8: '循环遍历。',
        9: '买入与卖出扣费转移。',
        12: '返回答案。',
      },
      python: {
        2: '函数入口。',
        4: '列表初始化。',
        5: '首日状态。',
        6: '遍历交易日。',
        7: '买入与卖出转移。',
        9: '返回最终利润。',
      },
    },
    keyPoints: {
      title: '🎯 股票买卖含手续费 5 步法系统精讲',
      summary: 'LeetCode 714。多次交易+手续费。仅需在股票 II 的基础上，在卖出结算时额外减去手续费 fee：dp[i][1] = max(dp[i-1][1], dp[i-1][0] + prices[i] - fee)！',
      points: [
        { label: '一、手续费结算契机', desc: '整笔交易（买入+卖出）只收取一次手续费 <code>fee</code>，统一定义在<strong>卖出时扣除</strong>。', icon: '🎯', badge: '卖出扣费' },
        { label: '二、状态转移方程', desc: '• 持有：<code>dp[i][0] = max(dp[i-1][0], dp[i-1][1] - prices[i])</code>。<br>• 卖出：<code>dp[i][1] = max(dp[i-1][1], dp[i-1][0] + prices[i] - fee)</code>。', icon: '⚡', badge: '状态机转移' },
        { label: '三、初始化', desc: '<code>dp[0][0] = -prices[0]</code>；<code>dp[0][1] = 0</code>。', icon: '🎬', badge: '首日初始化' },
        { label: '四、复杂度分析', desc: '• 时间复杂度：<code>O(n)</code>。<br>• 空间复杂度：<code>O(1)</code>。', icon: '⏱️', badge: 'O(n)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let prices: number[] = [1, 3, 2, 8, 4, 9];
    let fee = 2;

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.prices)) prices = input.prices;
      else if (typeof input.prices === 'string') prices = input.prices.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));

      if (typeof input.fee === 'number') fee = input.fee;
    }

    const n = prices.length;
    const dp: DpCell[][] = Array.from({ length: n }, () => ['-', '-']);

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      curP?: number | string;
      hold?: DpCell | number | string;
      unhold?: DpCell | number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const pVal = opts.curP ?? '-';
      const hVal = opts.hold ?? '-';
      const uVal = opts.unhold ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'prices (股价序列)', value: `[${prices.join(', ')}]`, type: 'string' as const, changed: chSet.has('prices') },
        { name: 'fee (交易手续费)', value: `$${fee}`, type: 'string' as const, changed: chSet.has('fee') },
        { name: 'i (交易日)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'prices[i] (当日股价)', value: String(pVal), type: (typeof pVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('p') },
        { name: 'dp[i][0] (持有股票现金)', value: String(hVal), type: (typeof hVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('h') },
        { name: 'dp[i][1] (不持有股票净利润)', value: String(uVal), type: (typeof uVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('u') },
      ];
    };

    // Step 0: Entry
    push({
      dp2d: clone2d(dp),
      source: prices.map((p, idx) => `第${idx}天($${p})`),
      message: `🎯 函数入口：买卖股票含手续费。股价序列 [${prices.join(', ')}]，每笔交易手续费 fee = $${fee}。`,
      log: `entry: prices=[${prices.join(',')}], fee=${fee}`,
      vars: makeVars({ changed: ['prices', 'fee'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    if (n <= 1) return steps;

    // Step 1: Init Day 0
    dp[0][0] = -prices[0];
    dp[0][1] = 0;

    push({
      dp2d: clone2d(dp),
      source: prices.map((p, idx) => `第${idx}天($${p})`),
      current: { row: 0, col: 0 },
      message: `🎬 初始化第 0 天：买入持有现金 dp[0][0] = -$${prices[0]}；不持有现金 dp[0][1] = $0。`,
      log: `init: hold=-${prices[0]}, unhold=0`,
      vars: makeVars({ i: 0, curP: prices[0], hold: -prices[0], unhold: 0, changed: ['h', 'u'] }),
      codeLine: { java: [5, 6], cpp: [6, 7], python: 5, javascript: [4, 5] },
    });

    // Loops
    for (let i = 1; i < n; i++) {
      const p = prices[i];
      const prevHold = dp[i - 1][0] as number;
      const prevUnhold = dp[i - 1][1] as number;

      // Hold state
      const buyToday = prevUnhold - p;
      const nextHold = Math.max(prevHold, buyToday);
      dp[i][0] = nextHold;

      // Unhold state (扣除手续费 fee)
      const sellToday = prevHold + p - fee;
      const nextUnhold = Math.max(prevUnhold, sellToday);
      dp[i][1] = nextUnhold;

      const isBuyBetter = buyToday > prevHold;
      const isSellBetter = sellToday > prevUnhold;

      push({
        dp2d: clone2d(dp),
        source: prices.map((px, idx) => `第${idx}天($${px})`),
        current: { row: i, col: 1 },
        dependencies: [{ row: i - 1, col: 0 }, { row: i - 1, col: 1 }],
        formula: `dp[${i}][0] = max(${prevHold}, ${prevUnhold}-${p}) = ${nextHold} | dp[${i}][1] = max(${prevUnhold}, ${prevHold}+${p}-${fee}) = ${nextUnhold}`,
        message: `⚡ 第 ${i} 天 (股价 $${p}, 手续费 $${fee})：\n• 持有状态：${isBuyBetter ? `今日买入更优 (现金 $${nextHold})` : `保持昨日持有 (现金 $${nextHold})`}\n• 不持有状态：${isSellBetter ? `今日卖出扣费最优 (昨日持有 $${prevHold} + 卖出 $${p} - 手续费 $${fee} = $${sellToday})` : `保持不持有 (净利润 $${prevUnhold})`} $\rightarrow$ dp[${i}][1] = $${nextUnhold}。`,
        log: `day ${i}: hold=${nextHold}, unhold=${nextUnhold}`,
        vars: makeVars({ i, curP: p, hold: nextHold, unhold: nextUnhold, changed: ['i', 'p', 'h', 'u'] }),
        codeLine: {
          java: { primary: [8, 9], context: [7] },
          cpp: { primary: [8, 9], context: [7] },
          python: { primary: [7, 8], context: [6] },
          javascript: { primary: [7, 8], context: [6] },
        },
      });
    }

    const ans = dp[n - 1][1] as number;
    push({
      dp2d: clone2d(dp),
      source: prices.map((px, idx) => `第${idx}天($${px})`),
      current: { row: n - 1, col: 1 },
      message: `🏁 算法结束：扣除所有交易手续费后的最大累计净利润为 dp[${n - 1}][1] = $${ans}。`,
      log: `return: dp[${n - 1}][1] = ${ans}`,
      vars: makeVars({ i: n - 1, hold: dp[n - 1][0], unhold: ans, changed: ['u'] }),
      codeLine: { java: 11, cpp: 12, python: 9, javascript: 10 },
    });

    return steps;
  },
};
