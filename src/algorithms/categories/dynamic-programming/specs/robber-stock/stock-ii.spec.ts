import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const StockIiSpec: AlgorithmSpec = {
  id: 'best-time-to-buy-and-sell-stock-ii',
  name: '买卖股票的最佳时机 II (Stock II)',
  category: '股票 DP',
  description: '给你一个整数数组 prices ，其中 prices[i] 表示某支股票第 i 天的价格。在每一天，你可以决定是否购买和/或出售股票。你在任何时候 最多 只能持有 一股 股票。你也可以先购买，然后在 同一天 出售。返回你能获得的最大利润。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 122,
    leetcodeUrl: 'https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-ii/',
    difficulty: 'medium',
    tags: ['贪心', '数组', '动态规划', '状态机DP'],
    description: '给你一个整数数组 <code>prices</code> ，其中 <code>prices[i]</code> 表示某支股票第 <code>i</code> 天的价格。<br/><br/>在每一天，你可以决定是否购买和/或出售股票。你在任何时候 <strong>最多</strong> 只能持有 <strong>一股</strong> 股票。你也可以先购买，然后在 <strong>同一天</strong> 出售。<br/><br/>返回你能获得的 <strong>最大利润</strong> 。<br/><br/><strong>与股票 I 的关键区别</strong>：股票 II 允许进行 <strong>无限次交易</strong>，因此今日买入的本金来自昨日不持有的累计利润 <code>dp[i-1][1] - prices[i]</code>，而非固定的 <code>-prices[i]</code>！',
    examples: [
      {
        input: 'prices = [7, 1, 5, 3, 6, 4]',
        output: '7',
        explanation: '在第 2 天（股票价格 = 1）的时候买入，在第 3 天（股票价格 = 5）的时候卖出, 这笔交易所能获得利润 = 5 - 1 = 4 。随后，在第 4 天（股票价格 = 3）的时候买入，在第 5 天（股票价格 = 6）的时候卖出, 这笔交易所能获得利润 = 6 - 3 = 3 。总利润为 4 + 3 = 7 。',
      },
      {
        input: 'prices = [1, 2, 3, 4, 5]',
        output: '4',
        explanation: '在第 1 天买入，在第 5 天卖出，总利润为 4 。',
      },
    ],
    constraints: [
      '1 <= prices.length <= 3 * 10^4',
      '0 <= prices[i] <= 10^4',
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
        'function maxProfit(prices) {',
        '    if (!prices || prices.length <= 1) return 0;',
        '    const dp = Array.from({ length: prices.length }, () => [0, 0]);',
        '    dp[0][0] = -prices[0]; // 第 0 天持有股票',
        '    dp[0][1] = 0;          // 第 0 天不持有股票',
        '    for (let i = 1; i < prices.length; i++) {',
        '        dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][1] - prices[i]); // 保持持有 vs 用昨日利润再买入',
        '        dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] + prices[i]); // 保持不持有 vs 今日卖出套现',
        '    }',
        '    return dp[prices.length - 1][1];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int maxProfit(int[] prices) {',
        '        if (prices == null || prices.length <= 1) return 0;',
        '        int[][] dp = new int[prices.length][2];',
        '        dp[0][0] = -prices[0];',
        '        dp[0][1] = 0;',
        '        for (int i = 1; i < prices.length; i++) {',
        '            dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][1] - prices[i]);',
        '            dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] + prices[i]);',
        '        }',
        '        return dp[prices.length - 1][1];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int maxProfit(vector<int>& prices) {',
        '        if (prices.size() <= 1) return 0;',
        '        vector<vector<int>> dp(prices.size(), vector<int>(2, 0));',
        '        dp[0][0] = -prices[0];',
        '        dp[0][1] = 0;',
        '        for (int i = 1; i < prices.size(); i++) {',
        '            dp[i][0] = max(dp[i - 1][0], dp[i - 1][1] - prices[i]);',
        '            dp[i][1] = max(dp[i - 1][1], dp[i - 1][0] + prices[i]);',
        '        }',
        '        return dp.back()[1];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def maxProfit(self, prices: List[int]) -> int:',
        '        if len(prices) <= 1: return 0',
        '        dp = [[0, 0] for _ in range(len(prices))]',
        '        dp[0][0], dp[0][1] = -prices[0], 0',
        '        for i in range(1, len(prices)):',
        '            dp[i][0] = max(dp[i - 1][0], dp[i - 1][1] - prices[i])',
        '            dp[i][1] = max(dp[i - 1][1], dp[i - 1][0] + prices[i])',
        '        return dp[-1][1]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：买卖股票的最佳时机 II（可多次交易）。',
        2: '边界保护。',
        3: '开辟 dp 状态数组。',
        4: '初始化第 0 天持有：-prices[0]。',
        5: '初始化第 0 天不持有：0。',
        6: '遍历交易日。',
        7: '持有转移：由于可以多次买卖，今日买入的本金可以来自昨日不持有时的收益 dp[i-1][1] - prices[i]！',
        8: '不持有转移：max(保持不持有 dp[i-1][1], 今日卖出 dp[i-1][0] + prices[i])。',
        10: '返回 dp[n-1][1]。',
      },
      java: {
        2: '函数入口。',
        4: '初始化 dp 数组。',
        5: '首日状态。',
        7: '循环递推。',
        8: '持有状态（利用前面积累利润再买入）。',
        9: '不持有状态（卖出）。',
        11: '返回最后一天不持有。',
      },
      cpp: {
        3: '函数入口。',
        5: '定义二维状态向量。',
        6: '首日初始化。',
        8: '循环遍历。',
        9: '多次交易状态转移。',
        12: '返回结果。',
      },
      python: {
        2: '函数入口。',
        4: '初始化二维列表。',
        5: '首日初始化。',
        6: '遍历交易日。',
        7: '多次买卖转移。',
        9: '返回最终利润。',
      },
    },
    keyPoints: {
      title: '🎯 股票买卖 II 状态机 5 步法系统精讲',
      summary: 'LeetCode 122。多次买卖股票。核心变化只有一行：dp[i][0] = max(dp[i-1][0], dp[i-1][1] - prices[i])！由于可以多次买入，买入时的本金由 0 变成了昨日积累的全部利润 dp[i-1][1]！',
      points: [
        { label: '一、单次 vs 多次买卖本质区别', desc: '• <strong>股票 I（单次）</strong>：<code>dp[i][0] = max(dp[i-1][0], -prices[i])</code>。<br>• <strong>股票 II（多次）</strong>：<code>dp[i][0] = max(dp[i-1][0], dp[i-1][1] - prices[i])</code>。', icon: '🎯', badge: '复利累积' },
        { label: '二、状态转移方程', desc: '• 持有：<code>dp[i][0] = max(dp[i-1][0], dp[i-1][1] - prices[i])</code>。<br>• 不持有：<code>dp[i][1] = max(dp[i-1][1], dp[i-1][0] + prices[i])</code>。', icon: '⚡', badge: '状态机转移' },
        { label: '三、初始化', desc: '<code>dp[0][0] = -prices[0]</code>；<code>dp[0][1] = 0</code>。', icon: '🎬', badge: '首日初始化' },
        { label: '四、复杂度分析', desc: '• 时间复杂度：<code>O(n)</code>。<br>• 空间复杂度：<code>O(n)</code>，可压缩为 <code>O(1)</code>。', icon: '⏱️', badge: 'O(n)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let prices: number[] = [7, 1, 5, 3, 6, 4];

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.prices)) prices = input.prices;
      else if (typeof input.prices === 'string') prices = input.prices.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
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
        { name: 'i (交易日)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'prices[i] (当日股价)', value: String(pVal), type: (typeof pVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('p') },
        { name: 'dp[i][0] (持有股票现金)', value: String(hVal), type: (typeof hVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('h') },
        { name: 'dp[i][1] (不持有股票现金)', value: String(uVal), type: (typeof uVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('u') },
      ];
    };

    // Step 0: Entry
    push({
      dp2d: clone2d(dp),
      source: prices.map((p, idx) => `第${idx}天($${p})`),
      message: `🎯 函数入口：买卖股票的最佳时机 II（多次交易）。股价序列 [${prices.join(', ')}]。`,
      log: `entry: prices=[${prices.join(',')}]`,
      vars: makeVars({ changed: ['prices'] }),
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
      log: `init day 0: hold=-${prices[0]}, unhold=0`,
      vars: makeVars({ i: 0, curP: prices[0], hold: -prices[0], unhold: 0, changed: ['h', 'u'] }),
      codeLine: { java: [5, 6], cpp: [6, 7], python: 5, javascript: [4, 5] },
    });

    // Loops
    for (let i = 1; i < n; i++) {
      const p = prices[i];

      // Hold state: max(dp[i-1][0], dp[i-1][1] - prices[i])
      const prevHold = dp[i - 1][0] as number;
      const prevUnhold = dp[i - 1][1] as number;
      const buyToday = prevUnhold - p;
      const nextHold = Math.max(prevHold, buyToday);
      dp[i][0] = nextHold;

      // Unhold state: max(dp[i-1][1], dp[i-1][0] + prices[i])
      const sellToday = prevHold + p;
      const nextUnhold = Math.max(prevUnhold, sellToday);
      dp[i][1] = nextUnhold;

      const isBuyBetter = buyToday > prevHold;
      const isSellBetter = sellToday > prevUnhold;

      push({
        dp2d: clone2d(dp),
        source: prices.map((px, idx) => `第${idx}天($${px})`),
        current: { row: i, col: 1 },
        dependencies: [{ row: i - 1, col: 0 }, { row: i - 1, col: 1 }],
        formula: `dp[${i}][0] = max(${prevHold}, ${prevUnhold}-${p}) = ${nextHold} | dp[${i}][1] = max(${prevUnhold}, ${prevHold}+${p}) = ${nextUnhold}`,
        message: `⚡ 第 ${i} 天 (股价 $${p})：\n• 持有状态：${isBuyBetter ? `用前期累计利润 $${prevUnhold} 今日买入最优 (现金 $${nextHold})` : `保持昨日持有 (现金 $${nextHold})`}\n• 不持有状态：${isSellBetter ? `今日卖出套现最优 (昨日持有 $${prevHold} + 卖出 $${p} = $${sellToday})` : `保持不持有 (利润 $${prevUnhold})`} $\rightarrow$ dp[${i}][1] = $${nextUnhold}。`,
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
      message: `🏁 算法结束：多次买卖股票的最大累计利润为 dp[${n - 1}][1] = $${ans}。`,
      log: `return: dp[${n - 1}][1] = ${ans}`,
      vars: makeVars({ i: n - 1, hold: dp[n - 1][0], unhold: ans, changed: ['u'] }),
      codeLine: { java: 11, cpp: 12, python: 9, javascript: 10 },
    });

    return steps;
  },
};
