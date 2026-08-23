import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const StockIvSpec: AlgorithmSpec = {
  id: 'best-time-to-buy-and-sell-stock-iv',
  name: '买卖股票的最佳时机 IV (Stock IV)',
  category: '股票 DP',
  description: '给定一个整数数组 prices 和一个整数 k，其中 prices[i] 是股票在第 i 天的价格。设计一个算法来计算你所能获取的最大利润。你最多可以完成 k 笔交易。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 188,
    leetcodeUrl: 'https://leetcode.cn/problems/best-time-to-buy-and-sell-stock-iv/',
    difficulty: 'hard',
    tags: ['数组', '动态规划', '2k+1状态机DP'],
    description: '给定一个整数数组 <code>prices</code> 和一个整数 <code>k</code> ，其中 <code>prices[i]</code> 是股票在第 <code>i</code> 天的价格。<br/><br/>设计一个算法来计算你所能获取的最大利润。你 <strong>最多可以完成 k 笔交易</strong> 。也就是说，你最多可以买 <code>k</code> 次，卖 <code>k</code> 次。<br/><br/><strong>2k+1 状态机模型</strong>：<br/>• 偶数状态 <code>2j + 1</code>：第 <code>j+1</code> 次买入持有<br/>• 奇数状态 <code>2j + 2</code>：第 <code>j+1</code> 次卖出不持有',
    examples: [
      {
        input: 'k = 2, prices = [2, 4, 1]',
        output: '2',
        explanation: '在第 1 天 (价格 = 2) 买入，在第 2 天 (价格 = 4) 卖出，这笔交易所能获得利润 = 4-2 = 2 。',
      },
      {
        input: 'k = 2, prices = [3, 2, 6, 5, 0, 3]',
        output: '7',
        explanation: '在第 2 天 (价格 = 2) 买入，在第 3 天 (价格 = 6) 卖出, 利润 = 4 。随后在第 5 天 (价格 = 0) 买入，在第 6 天 (价格 = 3) 卖出, 利润 = 3 。两笔交易总利润 = 4 + 3 = 7 。',
      },
    ],
    constraints: [
      '1 <= k <= 100',
      '1 <= prices.length <= 1000',
      '0 <= prices[i] <= 1000',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 3, python: 3, javascript: 2 },
    init: { java: [5, 8], cpp: [5, 8], python: [4, 6], javascript: [4, 7] },
    loopCheck: { java: 9, cpp: 9, python: 7, javascript: 8 },
    stateTransfer: {
      java: { primary: [11, 12], context: [9, 10] },
      cpp: { primary: [11, 12], context: [9, 10] },
      python: { primary: [9, 10], context: [7, 8] },
      javascript: { primary: [10, 11], context: [8, 9] },
    },
    loopExit: { java: 9, cpp: 9, python: 7, javascript: 8 },
    returnResult: { java: 16, cpp: 16, python: 11, javascript: 15 },
  },
  code: {
    languages: {
      javascript: [
        'function maxProfit(k, prices) {',
        '    if (!prices || prices.length <= 1 || k === 0) return 0;',
        '    const n = prices.length;',
        '    const dp = Array.from({ length: n }, () => new Array(2 * k + 1).fill(0));',
        '    for (let j = 0; j < k; j++) {',
        '        dp[0][2 * j + 1] = -prices[0]; // 所有买入状态首日初始化为 -prices[0]',
        '    }',
        '    for (let i = 1; i < n; i++) {',
        '        for (let j = 0; j < k; j++) {',
        '            dp[i][2 * j + 1] = Math.max(dp[i - 1][2 * j + 1], dp[i - 1][2 * j] - prices[i]); // 买入持有',
        '            dp[i][2 * j + 2] = Math.max(dp[i - 1][2 * j + 2], dp[i - 1][2 * j + 1] + prices[i]); // 卖出不持有',
        '        }',
        '    }',
        '    return dp[n - 1][2 * k]; // 第 k 次卖出的最终最大利润',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int maxProfit(int k, int[] prices) {',
        '        if (prices == null || prices.length <= 1 || k == 0) return 0;',
        '        int n = prices.length;',
        '        int[][] dp = new int[n][2 * k + 1];',
        '        for (int j = 0; j < k; j++) {',
        '            dp[0][2 * j + 1] = -prices[0];',
        '        }',
        '        for (int i = 1; i < n; i++) {',
        '            for (int j = 0; j < k; j++) {',
        '                dp[i][2 * j + 1] = Math.max(dp[i - 1][2 * j + 1], dp[i - 1][2 * j] - prices[i]);',
        '                dp[i][2 * j + 2] = Math.max(dp[i - 1][2 * j + 2], dp[i - 1][2 * j + 1] + prices[i]);',
        '            }',
        '        }',
        '        return dp[n - 1][2 * k];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int maxProfit(int k, vector<int>& prices) {',
        '        if (prices.size() <= 1 || k == 0) return 0;',
        '        int n = prices.size();',
        '        vector<vector<int>> dp(n, vector<int>(2 * k + 1, 0));',
        '        for (int j = 0; j < k; j++) {',
        '            dp[0][2 * j + 1] = -prices[0];',
        '        }',
        '        for (int i = 1; i < n; i++) {',
        '            for (int j = 0; j < k; j++) {',
        '                dp[i][2 * j + 1] = max(dp[i - 1][2 * j + 1], dp[i - 1][2 * j] - prices[i]);',
        '                dp[i][2 * j + 2] = max(dp[i - 1][2 * j + 2], dp[i - 1][2 * j + 1] + prices[i]);',
        '            }',
        '        }',
        '        return dp[n - 1][2 * k];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def maxProfit(self, k: int, prices: List[int]) -> int:',
        '        if len(prices) <= 1 or k == 0: return 0',
        '        n = len(prices)',
        '        dp = [[0] * (2 * k + 1) for _ in range(n)]',
        '        for j in range(k):',
        '            dp[0][2 * j + 1] = -prices[0]',
        '        for i in range(1, n):',
        '            for j in range(k):',
        '                dp[i][2 * j + 1] = max(dp[i - 1][2 * j + 1], dp[i - 1][2 * j] - prices[i])',
        '                dp[i][2 * j + 2] = max(dp[i - 1][2 * j + 2], dp[i - 1][2 * j + 1] + prices[i])',
        '        return dp[n - 1][2 * k]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：最多完成 k 笔交易的股票最大利润。',
        2: '边界特判。',
        4: '开辟 dp[n][2k+1] 状态表。',
        5: '初始化所有第 j 笔买入持有状态为 -prices[0]。',
        8: '外层遍历交易日。',
        9: '内层遍历各笔交易编号 j (0..k-1)。',
        10: '买入持有转移：max(保持持有, 用前一笔卖出利润买入)。',
        11: '卖出不持有转移：max(保持不持有, 今日卖出套现)。',
        14: '返回最后一天第 k 次卖出的利润 dp[n-1][2k]。',
      },
      java: {
        2: '函数入口。',
        5: '定义 2k+1 维状态表。',
        6: '首日所有买入初始化为 -prices[0]。',
        9: '双层循环遍历。',
        11: '第 j 笔买卖双状态转移。',
        15: '返回 dp[n-1][2k]。',
      },
      cpp: {
        3: '函数入口。',
        6: '向量初始化。',
        7: '首日状态。',
        10: '双层循环递推。',
        12: '双状态转移。',
        16: '返回答案。',
      },
      python: {
        2: '函数入口。',
        5: '列表初始化。',
        6: '首日持有赋值。',
        8: '遍历交易日与交易轮次。',
        10: '状态机转移。',
        11: '返回最终利润。',
      },
    },
    keyPoints: {
      title: '🎯 股票买卖 IV (最多 k 笔) 2k+1 状态机精讲',
      summary: 'LeetCode 188。股票 III 的通用泛化版本。交易上限拓展为 k 次，状态机自然拓展为 2k+1 个状态：0 无操作，奇数 2j+1 为第 j 笔买入，偶数 2j+2 为第 j 笔卖出！',
      points: [
        { label: '一、2k+1 状态定义', desc: '• <code>dp[i][2j+1]</code>：第 <code>j</code> 笔买入持有。<br>• <code>dp[i][2j+2]</code>：第 <code>j</code> 笔卖出不持有。', icon: '🎯', badge: '2k+1 状态' },
        { label: '二、状态转移方程', desc: '• <code>dp[i][2j+1] = max(dp[i-1][2j+1], dp[i-1][2j] - prices[i])</code><br>• <code>dp[i][2j+2] = max(dp[i-1][2j+2], dp[i-1][2j+1] + prices[i])</code>', icon: '⚡', badge: '链式状态转移' },
        { label: '三、时空复杂度', desc: '• 时间复杂度：<code>O(n × k)</code>。<br>• 空间复杂度：<code>O(n × k)</code>，可滚动压缩为 <code>O(k)</code>。', icon: '⏱️', badge: 'O(nk)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let prices: number[] = [3, 2, 6, 5, 0, 3];
    let k = 2;

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.prices)) prices = input.prices;
      if (typeof input.k === 'number') k = input.k;
    }

    const n = prices.length;
    const dp: DpCell[][] = Array.from({ length: n }, () =>
      Array.from({ length: 2 * k + 1 }, () => 0)
    );

    for (let j = 0; j < k; j++) {
      dp[0][2 * j + 1] = -prices[0];
    }

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      curP?: number | string;
      ans?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const pVal = opts.curP ?? '-';
      const a = opts.ans ?? (dp[n - 1][2 * k] as number);
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'prices (股价)', value: `[${prices.join(', ')}]`, type: 'string' as const, changed: chSet.has('prices') },
        { name: 'k (最大交易次数)', value: String(k), type: 'number' as const, changed: chSet.has('k') },
        { name: 'i (天数)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: '当日股价', value: String(pVal), type: (typeof pVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('p') },
        { name: '当前累计最大利润', value: String(a), type: (typeof a === 'number' ? 'number' : 'string') as any, changed: chSet.has('ans') },
      ];
    };

    // Step 0: Entry
    push({
      dp2d: clone2d(dp),
      source: prices.map((p, idx) => `第${idx}天($${p})`),
      message: `🎯 函数入口：买卖股票 IV。最多允许完成 k = ${k} 笔交易，构建 2k+1 = ${2 * k + 1} 状态机。`,
      log: `entry: k=${k}, prices=[${prices.join(',')}]`,
      vars: makeVars({ changed: ['prices', 'k'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    for (let i = 1; i < n; i++) {
      const p = prices[i];
      for (let j = 0; j < k; j++) {
        dp[i][2 * j + 1] = Math.max(dp[i - 1][2 * j + 1] as number, (dp[i - 1][2 * j] as number) - p);
        dp[i][2 * j + 2] = Math.max(dp[i - 1][2 * j + 2] as number, (dp[i - 1][2 * j + 1] as number) + p);
      }

      push({
        dp2d: clone2d(dp),
        source: prices.map((px, idx) => `第${idx}天($${px})`),
        current: { row: i, col: 2 * k },
        message: `⚡ 第 ${i} 天 (股价 $${p})：完成 ${k} 组买卖状态递推，当前最大净利润为 $${dp[i][2 * k]}。`,
        log: `day ${i}: ans=${dp[i][2 * k]}`,
        vars: makeVars({ i, curP: p, ans: (dp[i][2 * k] as number), changed: ['i', 'p', 'ans'] }),
        codeLine: {
          java: { primary: [11, 12], context: [9, 10] },
          cpp: { primary: [11, 12], context: [9, 10] },
          python: { primary: [9, 10], context: [7, 8] },
          javascript: { primary: [10, 11], context: [8, 9] },
        },
      });
    }

    const finalAns = dp[n - 1][2 * k] as number;
    push({
      dp2d: clone2d(dp),
      source: prices.map((px, idx) => `第${idx}天($${px})`),
      current: { row: n - 1, col: 2 * k },
      message: `🏁 算法结束：最多完成 ${k} 笔交易的最大利润为 dp[${n - 1}][${2 * k}] = $${finalAns}。`,
      log: `return: ans=${finalAns}`,
      vars: makeVars({ ans: finalAns, changed: ['ans'] }),
      codeLine: { java: 16, cpp: 16, python: 11, javascript: 14 },
    });

    return steps;
  },
};
