import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const StockIiiSpec: AlgorithmSpec = {
  id: 'best-time-to-buy-and-sell-stock-iii',
  name: '买卖股票的最佳时机 III (Stock III)',
  category: '股票 DP',
  description: '给定一个数组 prices，它的第 i 个元素 prices[i] 表示一支给定股票第 i 天的价格。设计一个算法来计算你所能获取的最大利润。你最多可以完成 两笔 交易。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 123,
    leetcodeUrl: 'https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-iii/',
    difficulty: 'hard',
    tags: ['数组', '动态规划', '五状态机DP'],
    description: '给定一个数组，它的第 <code>i</code> 个元素是一支给定的股票在第 <code>i</code> 天的价格。<br/><br/>设计一个算法来计算你所能获取的最大利润。你 <strong>最多可以完成 两笔 交易</strong>。<br/><br/><strong>注意</strong>：你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。<br/><br/><strong>五状态机模型</strong>：<br/>• 状态 0：无操作（未进行任何交易）<br/>• 状态 1：第一次买入持有<br/>• 状态 2：第一次卖出不持有<br/>• 状态 3：第二次买入持有<br/>• 状态 4：第二次卖出不持有',
    examples: [
      {
        input: 'prices = [3, 3, 5, 0, 0, 3, 1, 4]',
        output: '6',
        explanation: '在第 4 天（股票价格 = 0）买入，在第 6 天（股票价格 = 3）卖出，利润 = 3-0 = 3 。随后在第 7 天（股票价格 = 1）买入，在第 8 天 （股票价格 = 4）卖出，利润 = 4-1 = 3 。两笔交易总利润 = 3 + 3 = 6 。',
      },
      {
        input: 'prices = [1, 2, 3, 4, 5]',
        output: '4',
        explanation: '在第 1 天买入，在第 5 天卖出，总利润 = 4 。',
      },
    ],
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^5',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 3, python: 3, javascript: 2 },
    init: { java: [5, 8], cpp: [5, 8], python: [4, 7], javascript: [4, 7] },
    loopCheck: { java: 9, cpp: 9, python: 8, javascript: 8 },
    stateTransfer: {
      java: { primary: [10, 13], context: [9] },
      cpp: { primary: [10, 13], context: [9] },
      python: { primary: [9, 12], context: [8] },
      javascript: { primary: [9, 12], context: [8] },
    },
    loopExit: { java: 9, cpp: 9, python: 8, javascript: 8 },
    returnResult: { java: 15, cpp: 15, python: 13, javascript: 14 },
  },
  code: {
    languages: {
      javascript: [
        'function maxProfit(prices) {',
        '    if (!prices || prices.length <= 1) return 0;',
        '    const dp = Array.from({ length: prices.length }, () => new Array(5).fill(0));',
        '    dp[0][1] = -prices[0]; // 第一次持有',
        '    dp[0][2] = 0;          // 第一次卖出',
        '    dp[0][3] = -prices[0]; // 第二次持有',
        '    dp[0][4] = 0;          // 第二次卖出',
        '    for (let i = 1; i < prices.length; i++) {',
        '        dp[i][1] = Math.max(dp[i - 1][1], -prices[i]); // 第一次买入',
        '        dp[i][2] = Math.max(dp[i - 1][2], dp[i - 1][1] + prices[i]); // 第一次卖出',
        '        dp[i][3] = Math.max(dp[i - 1][3], dp[i - 1][2] - prices[i]); // 第二次买入',
        '        dp[i][4] = Math.max(dp[i - 1][4], dp[i - 1][3] + prices[i]); // 第二次卖出',
        '    }',
        '    return dp[prices.length - 1][4];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int maxProfit(int[] prices) {',
        '        if (prices == null || prices.length <= 1) return 0;',
        '        int[][] dp = new int[prices.length][5];',
        '        dp[0][1] = -prices[0];',
        '        dp[0][2] = 0;',
        '        dp[0][3] = -prices[0];',
        '        dp[0][4] = 0;',
        '        for (int i = 1; i < prices.length; i++) {',
        '            dp[i][1] = Math.max(dp[i - 1][1], -prices[i]);',
        '            dp[i][2] = Math.max(dp[i - 1][2], dp[i - 1][1] + prices[i]);',
        '            dp[i][3] = Math.max(dp[i - 1][3], dp[i - 1][2] - prices[i]);',
        '            dp[i][4] = Math.max(dp[i - 1][4], dp[i - 1][3] + prices[i]);',
        '        }',
        '        return dp[prices.length - 1][4];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int maxProfit(vector<int>& prices) {',
        '        if (prices.size() <= 1) return 0;',
        '        vector<vector<int>> dp(prices.size(), vector<int>(5, 0));',
        '        dp[0][1] = -prices[0];',
        '        dp[0][2] = 0;',
        '        dp[0][3] = -prices[0];',
        '        dp[0][4] = 0;',
        '        for (int i = 1; i < prices.size(); i++) {',
        '            dp[i][1] = max(dp[i - 1][1], -prices[i]);',
        '            dp[i][2] = max(dp[i - 1][2], dp[i - 1][1] + prices[i]);',
        '            dp[i][3] = max(dp[i - 1][3], dp[i - 1][2] - prices[i]);',
        '            dp[i][4] = max(dp[i - 1][4], dp[i - 1][3] + prices[i]);',
        '        }',
        '        return dp.back()[4];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def maxProfit(self, prices: List[int]) -> int:',
        '        if len(prices) <= 1: return 0',
        '        dp = [[0] * 5 for _ in range(len(prices))]',
        '        dp[0][1], dp[0][3] = -prices[0], -prices[0]',
        '        for i in range(1, len(prices)):',
        '            dp[i][1] = max(dp[i - 1][1], -prices[i])',
        '            dp[i][2] = max(dp[i - 1][2], dp[i - 1][1] + prices[i])',
        '            dp[i][3] = max(dp[i - 1][3], dp[i - 1][2] - prices[i])',
        '            dp[i][4] = max(dp[i - 1][4], dp[i - 1][3] + prices[i])',
        '        return dp[-1][4]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：最多两笔交易的股票最大利润求解。',
        2: '边界保护。',
        3: '开辟 dp[n][5] 五状态机表格。',
        4: '初始化首日第 1 次买入：-prices[0]。',
        6: '初始化首日第 2 次买入：-prices[0]（当日买入卖出后再买入）。',
        8: '遍历后续交易日。',
        9: '状态 1（第 1 次持有）：max(保持 dp[i-1][1], 首次买入 -prices[i])。',
        10: '状态 2（第 1 次卖出）：max(保持 dp[i-1][2], 卖出 dp[i-1][1] + prices[i])。',
        11: '状态 3（第 2 次持有）：max(保持 dp[i-1][3], 用第 1 次卖出的钱买入 dp[i-1][2] - prices[i])。',
        12: '状态 4（第 2 次卖出）：max(保持 dp[i-1][4], 卖出 dp[i-1][3] + prices[i])。',
        14: '返回最后一天第二次卖出后的最大累计利润 dp[n-1][4]。',
      },
      java: {
        2: '函数入口。',
        4: '定义 5 状态表。',
        5: '初始化状态 1 和状态 3 为 -prices[0]。',
        9: '循环遍历。',
        10: '四种活跃状态转移。',
        15: '返回 dp[n-1][4]。',
      },
      cpp: {
        3: '函数入口。',
        5: '定义二维状态向量。',
        6: '首日状态设定。',
        10: '四状态递推。',
        15: '返回答案。',
      },
      python: {
        2: '函数入口。',
        4: '列表初始化。',
        5: '首日买入状态赋值。',
        6: '遍历交易日。',
        7: '四状态转移。',
        11: '返回结果。',
      },
    },
    keyPoints: {
      title: '🎯 股票买卖 III (最多两笔) 5 状态机精讲',
      summary: 'LeetCode 123。交易次数限制为 2 次。每天有 5 种状态：0 无操作、1 第一次持有、2 第一次卖出、3 第二次持有、4 第二次卖出。后一笔交易依赖前一笔交易的结算利润！',
      points: [
        { label: '一、5 状态机映射', desc: '• <code>0</code>: 尚未操作<br>• <code>1</code>: 第一次持有 (<code>-prices[i]</code>)<br>• <code>2</code>: 第一次卖出 (<code>dp[i-1][1] + prices[i]</code>)<br>• <code>3</code>: 第二次持有 (<code>dp[i-1][2] - prices[i]</code>)<br>• <code>4</code>: 第二次卖出 (<code>dp[i-1][3] + prices[i]</code>)', icon: '🎯', badge: '5 状态机' },
        { label: '二、初始化', desc: '<code>dp[0][1] = -prices[0]</code>；<code>dp[0][3] = -prices[0]</code>；其余状态为 0。', icon: '🎬', badge: '首日初始化' },
        { label: '三、复杂度分析', desc: '• 时间复杂度：<code>O(n)</code>。<br>• 空间复杂度：<code>O(n)</code>，可压缩为 <code>O(1)</code>。', icon: '⏱️', badge: 'O(n)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let prices: number[] = [3, 3, 5, 0, 0, 3, 1, 4];

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.prices)) prices = input.prices;
      else if (typeof input.prices === 'string') prices = input.prices.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
    }

    const n = prices.length;
    const dp: DpCell[][] = Array.from({ length: n }, () => ['-', '-', '-', '-', '-']);

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      curP?: number | string;
      b1?: DpCell | number | string;
      s1?: DpCell | number | string;
      b2?: DpCell | number | string;
      s2?: DpCell | number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const pVal = opts.curP ?? '-';
      const b1Val = opts.b1 ?? '-';
      const s1Val = opts.s1 ?? '-';
      const b2Val = opts.b2 ?? '-';
      const s2Val = opts.s2 ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'prices (股价)', value: `[${prices.join(', ')}]`, type: 'string' as const, changed: chSet.has('prices') },
        { name: 'i (天数)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: '当日股价', value: String(pVal), type: (typeof pVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('p') },
        { name: 'dp[i][1] (买1持有)', value: String(b1Val), type: (typeof b1Val === 'number' ? 'number' : 'string') as any, changed: chSet.has('b1') },
        { name: 'dp[i][2] (卖1不持有)', value: String(s1Val), type: (typeof s1Val === 'number' ? 'number' : 'string') as any, changed: chSet.has('s1') },
        { name: 'dp[i][3] (买2持有)', value: String(b2Val), type: (typeof b2Val === 'number' ? 'number' : 'string') as any, changed: chSet.has('b2') },
        { name: 'dp[i][4] (卖2不持有)', value: String(s2Val), type: (typeof s2Val === 'number' ? 'number' : 'string') as any, changed: chSet.has('s2') },
      ];
    };

    // Step 0: Entry
    push({
      dp2d: clone2d(dp),
      source: prices.map((p, idx) => `第${idx}天($${p})`),
      message: `🎯 函数入口：买卖股票的最佳时机 III（最多 2 笔交易）。采用 5 状态机模型。`,
      log: `entry: prices=[${prices.join(',')}]`,
      vars: makeVars({ changed: ['prices'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    if (n <= 1) return steps;

    // Step 1: Init Day 0
    dp[0][0] = 0;
    dp[0][1] = -prices[0];
    dp[0][2] = 0;
    dp[0][3] = -prices[0];
    dp[0][4] = 0;

    push({
      dp2d: clone2d(dp),
      source: prices.map((p, idx) => `第${idx}天($${p})`),
      current: { row: 0, col: 1 },
      message: `🎬 初始化第 0 天：买1持有 dp[0][1] = -$${prices[0]}；买2持有 dp[0][3] = -$${prices[0]}。其余状态为 0。`,
      log: `init: b1=-${prices[0]}, s1=0, b2=-${prices[0]}, s2=0`,
      vars: makeVars({ i: 0, curP: prices[0], b1: -prices[0], s1: 0, b2: -prices[0], s2: 0, changed: ['b1', 'b2'] }),
      codeLine: { java: [5, 8], cpp: [6, 9], python: 5, javascript: [4, 7] },
    });

    // Loops
    for (let i = 1; i < n; i++) {
      const p = prices[i];
      dp[i][0] = 0;

      // 1. Buy 1
      const pb1 = dp[i - 1][1] as number;
      dp[i][1] = Math.max(pb1, -p);

      // 2. Sell 1
      const ps1 = dp[i - 1][2] as number;
      dp[i][2] = Math.max(ps1, pb1 + p);

      // 3. Buy 2
      const pb2 = dp[i - 1][3] as number;
      dp[i][3] = Math.max(pb2, ps1 - p);

      // 4. Sell 2
      const ps2 = dp[i - 1][4] as number;
      dp[i][4] = Math.max(ps2, (dp[i - 1][3] as number) + p);

      push({
        dp2d: clone2d(dp),
        source: prices.map((px, idx) => `第${idx}天($${px})`),
        current: { row: i, col: 4 },
        dependencies: [{ row: i - 1, col: 1 }, { row: i - 1, col: 2 }, { row: i - 1, col: 3 }, { row: i - 1, col: 4 }],
        formula: `dp[${i}][1]=max(${pb1}, -${p}) | dp[${i}][2]=max(${ps1}, ${pb1}+${p}) | dp[${i}][3]=max(${pb2}, ${ps1}-${p}) | dp[${i}][4]=max(${ps2}, ${dp[i - 1][3]}+${p})`,
        message: `⚡ 第 ${i} 天 (股价 $${p})：\n• 第一次买入：dp[${i}][1] = $${dp[i][1]}\n• 第一次卖出：dp[${i}][2] = $${dp[i][2]}\n• 第二次买入：dp[${i}][3] = $${dp[i][3]}\n• 第二次卖出：dp[${i}][4] = $${dp[i][4]}。`,
        log: `day ${i}: b1=${dp[i][1]}, s1=${dp[i][2]}, b2=${dp[i][3]}, s2=${dp[i][4]}`,
        vars: makeVars({ i, curP: p, b1: dp[i][1], s1: dp[i][2], b2: dp[i][3], s2: dp[i][4], changed: ['i', 'p', 'b1', 's1', 'b2', 's2'] }),
        codeLine: {
          java: { primary: [10, 13], context: [9] },
          cpp: { primary: [11, 14], context: [10] },
          python: { primary: [7, 10], context: [6] },
          javascript: { primary: [9, 12], context: [8] },
        },
      });
    }

    const ans = dp[n - 1][4] as number;
    push({
      dp2d: clone2d(dp),
      source: prices.map((px, idx) => `第${idx}天($${px})`),
      current: { row: n - 1, col: 4 },
      message: `🏁 算法结束：最多完成 2 笔交易的最大利润为 dp[${n - 1}][4] = $${ans}。`,
      log: `return: ans=${ans}`,
      vars: makeVars({ i: n - 1, s2: ans, changed: ['s2'] }),
      codeLine: { java: 15, cpp: 15, python: 11, javascript: 14 },
    });

    return steps;
  },
};
