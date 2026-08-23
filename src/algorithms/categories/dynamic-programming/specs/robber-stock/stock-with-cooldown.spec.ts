import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const StockWithCooldownSpec: AlgorithmSpec = {
  id: 'best-time-to-buy-and-sell-stock-with-cooldown',
  name: '买卖股票的最佳时机含冷冻期 (Stock with Cooldown)',
  category: '股票 DP',
  description: '给定一个整数数组 prices，其中第 prices[i] 表示第 i 天的股票价格。卖出股票后，你无法在第二天买入股票 (即冷冻期为 1 天)。设计一个算法计算出最大利润。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 309,
    leetcodeUrl: 'https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-with-cooldown/',
    difficulty: 'medium',
    tags: ['数组', '动态规划', '状态机DP'],
    description: '给定一个整数数组 <code>prices</code>，其中第 <code>prices[i]</code> 表示第 <code>i</code> 天的股票价格。<br/><br/>设计一个算法计算出最大利润。在满足以下约束条件下，你可以尽可能地完成更多的交易（多次买卖）：<br/>• 卖出股票后，你无法在第二天买入股票 (即 <strong>冷冻期为 1 天</strong>)。<br/><br/><strong>三状态机模型</strong>：<br/>• <code>dp[i][0]</code>：<strong>持有股票</strong>状态（保持持有，或前天非冷冻期买入，或昨日冷冻期今日买入）<br/>• <code>dp[i][1]</code>：<strong>不持有股票且处于冷冻期</strong>（今日刚刚卖出股票）<br/>• <code>dp[i][2]</code>：<strong>不持有股票且非冷冻期</strong>（保持不持有，度过冷冻期）',
    examples: [
      {
        input: 'prices = [1, 2, 3, 0, 2]',
        output: '3',
        explanation: '对应的交易状态为: [买入, 卖出, 冷冻期, 买入, 卖出]，总利润为 3 。',
      },
      {
        input: 'prices = [1]',
        output: '0',
      },
    ],
    constraints: [
      '1 <= prices.length <= 5000',
      '0 <= prices[i] <= 1000',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 3, python: 3, javascript: 2 },
    init: { java: [5, 7], cpp: [5, 7], python: [4, 6], javascript: [4, 6] },
    loopCheck: { java: 8, cpp: 8, python: 7, javascript: 7 },
    stateTransfer: {
      java: { primary: [9, 11], context: [8] },
      cpp: { primary: [9, 11], context: [8] },
      python: { primary: [8, 10], context: [7] },
      javascript: { primary: [8, 10], context: [7] },
    },
    loopExit: { java: 8, cpp: 8, python: 7, javascript: 7 },
    returnResult: { java: 13, cpp: 13, python: 11, javascript: 12 },
  },
  code: {
    languages: {
      javascript: [
        'function maxProfit(prices) {',
        '    if (!prices || prices.length <= 1) return 0;',
        '    const dp = Array.from({ length: prices.length }, () => [0, 0, 0]);',
        '    dp[0][0] = -prices[0]; // 0: 持有股票',
        '    dp[0][1] = 0;          // 1: 今日刚卖出（处于冷冻期）',
        '    dp[0][2] = 0;          // 2: 保持不持有（非冷冻期）',
        '    for (let i = 1; i < prices.length; i++) {',
        '        dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][2] - prices[i]); // 保持持有 vs 自由不持有状态买入',
        '        dp[i][1] = dp[i - 1][0] + prices[i]; // 今日卖出（触发明日冷冻期）',
        '        dp[i][2] = Math.max(dp[i - 1][2], dp[i - 1][1]); // 保持非冷冻 vs 冷冻期解冻',
        '    }',
        '    return Math.max(dp[prices.length - 1][1], dp[prices.length - 1][2]);',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int maxProfit(int[] prices) {',
        '        if (prices == null || prices.length <= 1) return 0;',
        '        int[][] dp = new int[prices.length][3];',
        '        dp[0][0] = -prices[0];',
        '        dp[0][1] = 0;',
        '        dp[0][2] = 0;',
        '        for (int i = 1; i < prices.length; i++) {',
        '            dp[i][0] = Math.max(dp[i - 1][0], dp[i - 1][2] - prices[i]);',
        '            dp[i][1] = dp[i - 1][0] + prices[i];',
        '            dp[i][2] = Math.max(dp[i - 1][2], dp[i - 1][1]);',
        '        }',
        '        return Math.max(dp[prices.length - 1][1], dp[prices.length - 1][2]);',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int maxProfit(vector<int>& prices) {',
        '        if (prices.size() <= 1) return 0;',
        '        vector<vector<int>> dp(prices.size(), vector<int>(3, 0));',
        '        dp[0][0] = -prices[0];',
        '        dp[0][1] = 0;',
        '        dp[0][2] = 0;',
        '        for (int i = 1; i < prices.size(); i++) {',
        '            dp[i][0] = max(dp[i - 1][0], dp[i - 1][2] - prices[i]);',
        '            dp[i][1] = dp[i - 1][0] + prices[i];',
        '            dp[i][2] = max(dp[i - 1][2], dp[i - 1][1]);',
        '        }',
        '        return max(dp.back()[1], dp.back()[2]);',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def maxProfit(self, prices: List[int]) -> int:',
        '        if len(prices) <= 1: return 0',
        '        dp = [[0, 0, 0] for _ in range(len(prices))]',
        '        dp[0][0] = -prices[0]',
        '        for i in range(1, len(prices)):',
        '            dp[i][0] = max(dp[i - 1][0], dp[i - 1][2] - prices[i])',
        '            dp[i][1] = dp[i - 1][0] + prices[i]',
        '            dp[i][2] = max(dp[i - 1][2], dp[i - 1][1])',
        '        return max(dp[-1][1], dp[-1][2])',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：含冷冻期的股票最大利润求解。',
        2: '边界保护。',
        3: '开辟 dp[n][3] 三状态机矩阵。',
        4: '初始化状态 0（持有股票）：-prices[0]。',
        5: '初始化状态 1（刚卖出冷冻）：0。',
        6: '初始化状态 2（非冷冻不持有）：0。',
        7: '遍历交易日。',
        8: '持有状态：保持持有 vs 从「非冷冻不持有状态」买入 dp[i-1][2] - prices[i]（冷冻期无法买入）。',
        9: '刚卖出状态：昨日持有股票今日抛售 dp[i-1][0] + prices[i]。',
        10: '非冷冻状态：保持非冷冻 vs 昨日冷冻期自然解冻 Math.max(dp[i-1][2], dp[i-1][1])。',
        12: '返回最后一天不持有状态（状态 1 与状态 2）的较大值。',
      },
      java: {
        2: '函数入口。',
        4: '定义 3 状态机数组。',
        5: '首日状态。',
        8: '循环递推。',
        9: '持有状态转移。',
        10: '冷冻期触发转移。',
        11: '解冻与保持转移。',
        13: '返回两种不持有的 max。',
      },
      cpp: {
        3: '函数入口。',
        5: '初始化 3 状态向量。',
        6: '首日持有赋值。',
        9: '遍历交易日。',
        10: '三状态方程。',
        14: '返回两者较大值。',
      },
      python: {
        2: '函数入口。',
        4: '初始化列表。',
        5: '首日持有。',
        6: '遍历交易日。',
        7: '三状态转移。',
        10: '返回最终利润。',
      },
    },
    keyPoints: {
      title: '🎯 股票买卖含冷冻期 3 状态机精讲',
      summary: 'LeetCode 309。引入冷冻期将「不持有」细分为两种状态：① 今日刚卖出（处于冷冻期）；② 保持不持有（非冷冻期，随时可买入）。',
      points: [
        { label: '一、3 状态机拆分', desc: '• <code>0</code>: 持有股票<br>• <code>1</code>: 今日刚卖出（明日进入冷冻期）<br>• <code>2</code>: 保持不持有（已度过冷冻期，可随时买入）', icon: '🎯', badge: '冷冻期状态机' },
        { label: '二、核心转移逻辑', desc: '• 买入必须从<strong>非冷冻状态 2</strong>买入：<code>dp[i][0] = max(dp[i-1][0], dp[i-1][2] - prices[i])</code>。<br>• 状态 1 只能由<strong>持有状态卖出</strong>进入：<code>dp[i][1] = dp[i-1][0] + prices[i]</code>。<br>• 状态 2 可由<strong>冷冻期自然解冻</strong>进入：<code>dp[i][2] = max(dp[i-1][2], dp[i-1][1])</code>。', icon: '⚡', badge: '精准状态流转' },
        { label: '三、时空复杂度', desc: '• 时间复杂度：<code>O(n)</code>。<br>• 空间复杂度：<code>O(n)</code>，可优化为 <code>O(1)</code>。', icon: '⏱️', badge: 'O(n)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let prices: number[] = [1, 2, 3, 0, 2];

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.prices)) prices = input.prices;
      else if (typeof input.prices === 'string') prices = input.prices.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
    }

    const n = prices.length;
    const dp: DpCell[][] = Array.from({ length: n }, () => ['-', '-', '-']);

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      curP?: number | string;
      s0?: DpCell | number | string;
      s1?: DpCell | number | string;
      s2?: DpCell | number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const pVal = opts.curP ?? '-';
      const s0Val = opts.s0 ?? '-';
      const s1Val = opts.s1 ?? '-';
      const s2Val = opts.s2 ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'prices (股价序列)', value: `[${prices.join(', ')}]`, type: 'string' as const, changed: chSet.has('prices') },
        { name: 'i (天数)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: '当日股价', value: String(pVal), type: (typeof pVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('p') },
        { name: 'dp[i][0] (持有股票)', value: String(s0Val), type: (typeof s0Val === 'number' ? 'number' : 'string') as any, changed: chSet.has('s0') },
        { name: 'dp[i][1] (刚卖出冷冻)', value: String(s1Val), type: (typeof s1Val === 'number' ? 'number' : 'string') as any, changed: chSet.has('s1') },
        { name: 'dp[i][2] (非冷冻不持有)', value: String(s2Val), type: (typeof s2Val === 'number' ? 'number' : 'string') as any, changed: chSet.has('s2') },
      ];
    };

    // Step 0: Entry
    push({
      dp2d: clone2d(dp),
      source: prices.map((p, idx) => `第${idx}天($${p})`),
      message: `🎯 函数入口：买卖股票含冷冻期。股价 [${prices.join(', ')}]。卖出次日为冷冻期，不可买入。`,
      log: `entry: prices=[${prices.join(',')}]`,
      vars: makeVars({ changed: ['prices'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    if (n <= 1) return steps;

    // Step 1: Init Day 0
    dp[0][0] = -prices[0];
    dp[0][1] = 0;
    dp[0][2] = 0;

    push({
      dp2d: clone2d(dp),
      source: prices.map((p, idx) => `第${idx}天($${p})`),
      current: { row: 0, col: 0 },
      message: `🎬 初始化第 0 天：买入持有 dp[0][0] = -$${prices[0]}；冷冻与非冷冻均为 $0。`,
      log: `init: s0=-${prices[0]}, s1=0, s2=0`,
      vars: makeVars({ i: 0, curP: prices[0], s0: -prices[0], s1: 0, s2: 0, changed: ['s0', 's1', 's2'] }),
      codeLine: { java: [5, 7], cpp: [6, 8], python: 5, javascript: [4, 6] },
    });

    // Loops
    for (let i = 1; i < n; i++) {
      const p = prices[i];
      const prev0 = dp[i - 1][0] as number;
      const prev1 = dp[i - 1][1] as number;
      const prev2 = dp[i - 1][2] as number;

      // 0: Hold
      dp[i][0] = Math.max(prev0, prev2 - p);
      // 1: Just sold (cooldown)
      dp[i][1] = prev0 + p;
      // 2: Free unhold
      dp[i][2] = Math.max(prev2, prev1);

      push({
        dp2d: clone2d(dp),
        source: prices.map((px, idx) => `第${idx}天($${px})`),
        current: { row: i, col: 2 },
        dependencies: [{ row: i - 1, col: 0 }, { row: i - 1, col: 1 }, { row: i - 1, col: 2 }],
        formula: `dp[${i}][0]=max(${prev0}, ${prev2}-${p})=${dp[i][0]} | dp[${i}][1]=${prev0}+${p}=${dp[i][1]} | dp[${i}][2]=max(${prev2}, ${prev1})=${dp[i][2]}`,
        message: `⚡ 第 ${i} 天 (股价 $${p})：\n• 持有状态：dp[${i}][0] = $${dp[i][0]}\n• 刚卖出冷冻：dp[${i}][1] = $${dp[i][1]}\n• 非冷冻自由：dp[${i}][2] = $${dp[i][2]}。`,
        log: `day ${i}: s0=${dp[i][0]}, s1=${dp[i][1]}, s2=${dp[i][2]}`,
        vars: makeVars({ i, curP: p, s0: dp[i][0], s1: dp[i][1], s2: dp[i][2], changed: ['i', 'p', 's0', 's1', 's2'] }),
        codeLine: {
          java: { primary: [9, 11], context: [8] },
          cpp: { primary: [10, 12], context: [9] },
          python: { primary: [8, 10], context: [7] },
          javascript: { primary: [8, 10], context: [7] },
        },
      });
    }

    const finalAns = Math.max(dp[n - 1][1] as number, dp[n - 1][2] as number);
    push({
      dp2d: clone2d(dp),
      source: prices.map((px, idx) => `第${idx}天($${px})`),
      current: { row: n - 1, col: 2 },
      message: `🏁 算法结束：含冷冻期最大利润为 Math.max(${dp[n - 1][1]}, ${dp[n - 1][2]}) = $${finalAns}。`,
      log: `return: ans=${finalAns}`,
      vars: makeVars({ i: n - 1, s1: dp[n - 1][1], s2: dp[n - 1][2], changed: ['s2'] }),
      codeLine: { java: 13, cpp: 14, python: 11, javascript: 12 },
    });

    return steps;
  },
};
