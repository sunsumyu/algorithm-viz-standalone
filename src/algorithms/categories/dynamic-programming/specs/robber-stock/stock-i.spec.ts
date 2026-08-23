import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const StockISpec: AlgorithmSpec = {
  id: 'best-time-to-buy-and-sell-stock',
  name: '买卖股票的最佳时机 (Stock I)',
  category: '股票 DP',
  description: '给定一个数组 prices ，它的第 i 个元素 prices[i] 表示一支给定股票第 i 天的价格。你只能选择 某一天 买入这只股票，并选择在 未来的某一个不同的日子 卖出。设计一个算法计算所能获取的最大利润。',
  difficulty: 'easy',
  problem: {
    leetcodeId: 121,
    leetcodeUrl: 'https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/',
    difficulty: 'easy',
    tags: ['数组', '动态规划', '状态机DP'],
    description: '给定一个数组 <code>prices</code> ，它的第 <code>i</code> 个元素 <code>prices[i]</code> 表示一支给定股票第 <code>i</code> 天的价格。<br/><br/>你只能选择 <strong>某一天</strong> 买入这只股票，并选择在 <strong>未来的某一个不同的日子</strong> 卖出该股票。设计一个算法来计算你所能获取的最大利润。<br/><br/>返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 <code>0</code> 。',
    examples: [
      {
        input: 'prices = [7, 1, 5, 3, 6, 4]',
        output: '5',
        explanation: '在第 2 天（股票价格 = 1）的时候买入，在第 5 天（股票价格 = 6）的时候卖出，最大利润 = 6 - 1 = 5 。',
      },
      {
        input: 'prices = [7, 6, 4, 3, 1]',
        output: '0',
        explanation: '在这种情况下, 没有交易完成, 所以最大利润为 0。',
      },
    ],
    constraints: [
      '1 <= prices.length <= 10^5',
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
        '    dp[0][0] = -prices[0]; // 第 0 天持有股票现金',
        '    dp[0][1] = 0;          // 第 0 天不持有股票现金',
        '    for (let i = 1; i < prices.length; i++) {',
        '        dp[i][0] = Math.max(dp[i - 1][0], -prices[i]); // 保持持有 vs 首次买入',
        '        dp[i][1] = Math.max(dp[i - 1][1], dp[i - 1][0] + prices[i]); // 保持不持有 vs 今日卖出',
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
        '            dp[i][0] = Math.max(dp[i - 1][0], -prices[i]);',
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
        '            dp[i][0] = max(dp[i - 1][0], -prices[i]);',
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
        '            dp[i][0] = max(dp[i - 1][0], -prices[i])',
        '            dp[i][1] = max(dp[i - 1][1], dp[i - 1][0] + prices[i])',
        '        return dp[-1][1]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：买卖股票的最佳时机（单次交易）。',
        2: '边界保护：天数不足无法完成买卖，利润为 0。',
        3: '开辟二维状态表：dp[i][0] 表示第 i 天持有股票的最大现金，dp[i][1] 表示第 i 天不持有股票的最大现金。',
        4: '初始化第 0 天持有：花费 prices[0] 买入，现金为 -prices[0]。',
        5: '初始化第 0 天不持有：不进行任何操作，现金为 0。',
        6: '循环遍历后续各交易日。',
        7: '持有状态转移：max(保持持有 dp[i-1][0], 本次买入 -prices[i])。',
        8: '不持有状态转移：max(保持不持有 dp[i-1][1], 今日卖出 dp[i-1][0] + prices[i])。',
        10: '返回最后一天不持有股票的累计最大利润 dp[n-1][1]。',
      },
      java: {
        2: '函数入口。',
        4: '开辟 dp[n][2] 状态机。',
        5: '初始化第 0 天持有现金。',
        6: '初始化第 0 天不持有现金。',
        7: '遍历交易日。',
        8: '持有转移。',
        9: '不持有转移。',
        11: '返回最后一天不持有。',
      },
      cpp: {
        3: '函数入口。',
        5: '初始化状态向量。',
        6: '首日买入持有。',
        7: '首日不持有。',
        8: '循环递推。',
        9: '双状态转移。',
        12: '返回结果。',
      },
      python: {
        2: '函数入口。',
        4: '列表初始化。',
        5: '首日状态。',
        6: '遍历交易日。',
        7: '持有与不持有转移。',
        9: '返回最终利润。',
      },
    },
    keyPoints: {
      title: '🎯 股票买卖 I 状态机 5 步法系统精讲',
      summary: 'LeetCode 121。整个股票 DP 系列的基石状态机模型！每天只有 2 种状态：持有股票 (State 0) 与 不持有股票 (State 1)。单次交易的特征在于买入前利润强制为 0！',
      points: [
        { label: '一、二元状态机定义', desc: '• <code>dp[i][0]</code>：第 <code>i</code> 天<strong>持有股票</strong>的最大现金。<br>• <code>dp[i][1]</code>：第 <code>i</code> 天<strong>不持有股票</strong>的最大现金。', icon: '🎯', badge: '持有 vs 不持有' },
        { label: '二、状态转移方程', desc: '• <code>dp[i][0] = max(dp[i-1][0], -prices[i])</code>（单次交易，买入前资金为 0）。<br>• <code>dp[i][1] = max(dp[i-1][1], dp[i-1][0] + prices[i])</code>（卖出套现）。', icon: '⚡', badge: '状态机转移' },
        { label: '三、初始化', desc: '<code>dp[0][0] = -prices[0]</code>；<code>dp[0][1] = 0</code>。', icon: '🎬', badge: '首日初始化' },
        { label: '四、复杂度分析', desc: '• 时间复杂度：<code>O(n)</code>。<br>• 空间复杂度：<code>O(n)</code>，可滚动压缩为 <code>O(1)</code>。', icon: '⏱️', badge: 'O(n)' },
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
      message: `🎯 函数入口：买卖股票的最佳时机 I（单次交易）。股价序列 [${prices.join(', ')}]。`,
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

      // Hold state
      const prevHold = dp[i - 1][0] as number;
      const buyToday = -p;
      const nextHold = Math.max(prevHold, buyToday);
      dp[i][0] = nextHold;

      // Unhold state
      const prevUnhold = dp[i - 1][1] as number;
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
        formula: `dp[${i}][0] = max(${prevHold}, -${p}) = ${nextHold} | dp[${i}][1] = max(${prevUnhold}, ${prevHold}+${p}) = ${nextUnhold}`,
        message: `⚡ 第 ${i} 天 (股价 $${p})：\n• 持有状态：${isBuyBetter ? `今日更低价买入最优 (-$${p})` : `保持昨日持有 (-$${-prevHold})`} $\rightarrow$ dp[${i}][0] = $${nextHold}。\n• 不持有状态：${isSellBetter ? `今日卖出获利最优 (昨日持有 $${prevHold} + 卖出 $${p} = $${sellToday})` : `保持不持有 (利润 $${prevUnhold})`} $\rightarrow$ dp[${i}][1] = $${nextUnhold}。`,
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
      message: `🏁 算法结束：最后一天不持有股票的最大利润为 dp[${n - 1}][1] = $${ans}。`,
      log: `return: dp[${n - 1}][1] = ${ans}`,
      vars: makeVars({ i: n - 1, hold: dp[n - 1][0], unhold: ans, changed: ['u'] }),
      codeLine: { java: 11, cpp: 12, python: 9, javascript: 10 },
    });

    return steps;
  },
};
