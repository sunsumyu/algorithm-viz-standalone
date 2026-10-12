/**
 * 股票交易状态机 DP (LeetCode 309 等全系列)
 * Step Compiler: Hold / Rest / Sold 三状态流转与收益推演
 */

import { StepBase, HighlightTarget } from '../../step-visualizer';

export interface StockStateStep extends StepBase {
  stepIndex?: number;
  prices: number[];
  dayIndex: number;
  price: number;
  hold: number;
  rest: number;
  sold: number;
  bestProfit: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
}

export const STOCK_TRADING_CODES = {
  java: `public class StockTradingStateMachine {
    // LeetCode 309: 含冷冻期的最佳买卖时机 (三状态机)
    public static int maxProfitWithCooldown(int[] prices) {
        if (prices == null || prices.length <= 1) return 0;
        int hold = -prices[0]; // 持有股票
        int rest = 0;          // 空仓且不在冷冻期
        int sold = 0;          // 刚刚卖出，处于冷冻期

        for (int i = 1; i < prices.length; i++) {
            int p = prices[i];
            int nextHold = Math.max(hold, rest - p);
            int nextRest = Math.max(rest, sold);
            int nextSold = hold + p;

            hold = nextHold;
            rest = nextRest;
            sold = nextSold;
        }
        return Math.max(rest, sold);
    }
}`,
  cpp: `class StockTradingStateMachine {
public:
    static int maxProfitWithCooldown(const vector<int>& prices) {
        if (prices.size() <= 1) return 0;
        int hold = -prices[0];
        int rest = 0;
        int sold = 0;

        for (size_t i = 1; i < prices.size(); ++i) {
            int p = prices[i];
            int nextHold = max(hold, rest - p);
            int nextRest = max(rest, sold);
            int nextSold = hold + p;

            hold = nextHold;
            rest = nextRest;
            sold = nextSold;
        }
        return max(rest, sold);
    }
};`,
  python: `class StockTradingStateMachine:
    @staticmethod
    def max_profit_with_cooldown(prices: list[int]) -> int:
        if len(prices) <= 1: return 0
        hold = -prices[0]
        rest = 0
        sold = 0

        for p in prices[1:]:
            next_hold = max(hold, rest - p)
            next_rest = max(rest, sold)
            next_sold = hold + p

            hold, rest, sold = next_hold, next_rest, next_sold
        return max(rest, sold)`,
  typescript: `export class StockTradingStateMachine {
  static maxProfitWithCooldown(prices: number[]): number {
    if (prices.length <= 1) return 0;
    let hold = -prices[0];
    let rest = 0;
    let sold = 0;

    for (let i = 1; i < prices.length; i++) {
      const p = prices[i];
      const nextHold = Math.max(hold, rest - p);
      const nextRest = Math.max(rest, sold);
      const nextSold = hold + p;

      hold = nextHold;
      rest = nextRest;
      sold = nextSold;
    }
    return Math.max(rest, sold);
  }
}`
};

export const STOCK_TRADING_CODE_LINES = {
  empty: { java: 4, cpp: 4, python: 3, typescript: 3 },
  init: { java: 5, cpp: 5, python: 4, typescript: 4 },
  trans: { java: 12, cpp: 11, python: 9, typescript: 10 },
  finish: { java: 18, cpp: 17, python: 14, typescript: 16 },
};

export function generateStockSteps(prices: number[]): StockStateStep[] {
  const steps: StockStateStep[] = [];
  const n = prices.length;

  const makeMetrics = (dayIdx: number, p: number, h: number, r: number, s: number) => ({
    dayPrice: dayIdx >= 0 ? `Day ${dayIdx} (¥${p})` : '无数据',
    holdVal: `¥${h}`,
    restVal: `¥${r}`,
    soldVal: `¥${s}`,
  });
  const currentAns = (profit: number) => `¥${profit} (最高净利润)`;

  if (n === 0) {
    steps.push({
      stepIndex: 0,
      prices: [],
      dayIndex: -1,
      price: 0,
      hold: 0,
      rest: 0,
      sold: 0,
      bestProfit: 0,
      decision: '股票价格序列为空，收益为 0',
      message: '空序列',
      log: '价格为空',
      codeLine: STOCK_TRADING_CODE_LINES.empty,
      statusBadge: { text: '无数据', type: 'danger' },
      metrics: makeMetrics(-1, 0, 0, 0, 0),
      ans: currentAns(0),
    });
    return steps;
  }

  let hold = -prices[0];
  let rest = 0;
  let sold = 0;
  let stepIdx = 0;

  steps.push({
    stepIndex: stepIdx++,
    prices,
    dayIndex: 0,
    price: prices[0],
    hold,
    rest,
    sold,
    bestProfit: 0,
    decision: `第 1 天 (Day 0, 价格 ${prices[0]})：初始化三状态。hold = -${prices[0]} (买入), rest = 0 (观望), sold = 0`,
    message: `初始买入需支付 ${prices[0]}`,
    log: 'Day 0 初始化状态机',
    codeLine: STOCK_TRADING_CODE_LINES.init,
    statusBadge: { text: '初始买入', type: 'info' },
    metrics: makeMetrics(0, prices[0], hold, rest, sold),
    ans: currentAns(0),
  });

  for (let i = 1; i < n; i++) {
    const p = prices[i];
    const nextHold = Math.max(hold, rest - p);
    const nextRest = Math.max(rest, sold);
    const nextSold = hold + p;

    const action = nextHold > hold
      ? `在 Day ${i} (价格 ${p}) 执行买入`
      : nextSold > Math.max(rest, sold)
        ? `在 Day ${i} (价格 ${p}) 执行卖出`
        : '继续持有或保持观望';

    hold = nextHold;
    rest = nextRest;
    sold = nextSold;
    const currentMax = Math.max(rest, sold);

    steps.push({
      stepIndex: stepIdx++,
      prices,
      dayIndex: i,
      price: p,
      hold,
      rest,
      sold,
      bestProfit: currentMax,
      decision: `第 ${i + 1} 天 (价格 ${p})：${action}。hold: ${hold}, rest: ${rest}, sold: ${sold}。当前最高变现收益: ${currentMax}`,
      message: `Day ${i} 状态流转完毕`,
      log: `Day ${i}: p=${p}, max=${currentMax}`,
      codeLine: STOCK_TRADING_CODE_LINES.trans,
      statusBadge: { text: `Day ${i}: 收益 ${currentMax}`, type: 'warning' },
      metrics: makeMetrics(i, p, hold, rest, sold),
      ans: currentAns(currentMax),
    });
  }

  const finalProfit = Math.max(rest, sold);
  steps.push({
    stepIndex: stepIdx++,
    prices,
    dayIndex: n - 1,
    price: prices[n - 1],
    hold,
    rest,
    sold,
    bestProfit: finalProfit,
    decision: `全部交易日扫描结束！最大可获取净利润为 max(rest, sold) = ${finalProfit}`,
    message: `最终最高收益 ${finalProfit}`,
    log: `状态机计算完毕，最大收益 ${finalProfit}`,
    codeLine: STOCK_TRADING_CODE_LINES.finish,
    statusBadge: { text: `最终净利润: ${finalProfit}`, type: 'success' },
    metrics: makeMetrics(n - 1, prices[n - 1], hold, rest, sold),
    ans: currentAns(finalProfit),
  });

  return steps;
}
