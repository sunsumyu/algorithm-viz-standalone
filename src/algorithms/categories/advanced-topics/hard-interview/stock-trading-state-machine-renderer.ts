/**
 * Hard 09: 股票交易全系列统一状态机 DP (Stock Trading State Machine)
 * LeetCode 188 / 309 / 714 核心统一状态机模型
 * 统一状态机 DP：持有股票 (Hold)、空仓观察 (Rest)、刚刚卖出/冷冻期 (Sold/Cooldown)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../../core/step-visualizer';

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

export function renderStockCanvas(container: HTMLElement, step: StockStateStep) {
  const { prices, dayIndex, price, hold, rest, sold } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%; height: 100%; padding: 4px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 价格序列时间轴柱状图 -->
      <div style="background: rgba(15, 23, 42, 0.4); padding: 16px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); flex: 1; display: flex; flex-direction: column; min-height: 0; overflow-y: auto;">
        <div style="font-size: 13px; font-weight: 600; color: var(--text-color, #cbd5e1); margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span>每日价格走势与决策推进 (Stock Price Sequence)</span>
          <span style="font-size: 11px; color: #38bdf8;">当前: Day ${dayIndex >= 0 ? dayIndex : 0} (¥${price})</span>
        </div>
        <div style="display: flex; gap: 12px; justify-content: center; align-items: flex-end; flex: 1; min-height: 120px; overflow-x: auto; padding: 10px 4px;">
          ${prices.map((p, idx) => {
            const isCurrent = idx === dayIndex;
            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="font-size: 10px; height: 14px; color: ${isCurrent ? '#38bdf8' : 'transparent'}; font-weight: bold;">
                  ${isCurrent ? 'TODAY' : ''}
                </div>
                <div style="
                  width: 44px;
                  height: ${36 + Math.min(p * 14, 100)}px;
                  background: ${isCurrent ? 'rgba(56, 189, 248, 0.35)' : 'rgba(30, 41, 59, 0.5)'};
                  border: 2px solid ${isCurrent ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'};
                  border-radius: 6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 14px;
                  font-weight: bold;
                  color: #f8fafc;
                  box-shadow: ${isCurrent ? '0 0 12px rgba(56, 189, 248, 0.4)' : 'none'};
                  transition: all 0.2s ease;
                ">
                  ¥${p}
                </div>
                <div style="font-size: 10px; color: #64748b; font-family: monospace;">
                  Day ${idx}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 三状态机图解 -->
      <div style="background: rgba(15, 23, 42, 0.4); padding: 14px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
        <!-- Hold 状态 -->
        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; font-weight: bold; color: #fbbf24;">📦 Hold (持仓)</span>
            <span style="font-size: 14px; font-weight: 800; color: #fbbf24;">¥${hold}</span>
          </div>
          <div style="font-size: 10px; color: #94a3b8;">
            max(hold, rest - price)
          </div>
        </div>

        <!-- Rest 状态 -->
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; font-weight: bold; color: #34d399;">☕ Rest (观望)</span>
            <span style="font-size: 14px; font-weight: 800; color: #34d399;">¥${rest}</span>
          </div>
          <div style="font-size: 10px; color: #94a3b8;">
            max(rest, sold)
          </div>
        </div>

        <!-- Sold 状态 -->
        <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; font-weight: bold; color: #c084fc;">❄️ Sold (冷冻/刚卖)</span>
            <span style="font-size: 14px; font-weight: 800; color: #c084fc;">¥${sold}</span>
          </div>
          <div style="font-size: 10px; color: #94a3b8;">
            hold + price
          </div>
        </div>
      </div>
    </div>
  `;
}

export const stockTradingVisualizer = registerDeclarativeAlgorithm<StockStateStep>({
  id: 'stock-trading-state-machine',
  name: '大厂高频真题: 股票交易全系列状态机 DP (Stock Trading)',
  category: 'dynamic-programming',
  icon: '📈',
  difficulty: 3,
  levelOrder: 188,
  learningGoal: '统一解构 LeetCode 股票买卖全部变种题，建立 Hold、Rest、Sold 规范三状态机转移模型',
  metrics: [
    { id: 'dayPrice', label: '当日标的 (Day / Price)', color: 'blue' },
    { id: 'holdVal', label: '持有股票 (Hold 收益)', color: 'amber' },
    { id: 'restVal', label: '空仓观望 (Rest 收益)', color: 'emerald' },
    { id: 'soldVal', label: '冷冻/卖出 (Sold 收益)', color: 'purple' },
  ],
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 309 / 188 综合)</h3>
      <p>给定一个整数数组 <code>prices</code>，其中第 <code>i</code> 个元素代表了第 <code>i</code> 天的股票价格：</p>
      <ul>
        <li>设计一个算法计算出最大利润。在满足<strong>含冷冻期</strong>（卖出股票后，你无法在第二天买入股票）的约束下：</li>
        <li><strong>持有 (Hold)</strong>：由“昨日持有”或“昨日休息并今日买入”转移。</li>
        <li><strong>休息 (Rest)</strong>：由“昨日休息”或“昨日刚卖出度过冷冻期”转移。</li>
        <li><strong>卖出 (Sold)</strong>：由“昨日持有并在今日按现价卖出”转移。</li>
      </ul>
    </div>
  `,
  codeLanguages: STOCK_TRADING_CODES,
  inputs: [
    {
      id: 'prices',
      label: '每日价格序列 (以逗号分隔)',
      type: 'text',
      defaultValue: '1, 2, 3, 0, 2',
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.prices || '1, 2, 3, 0, 2');
    const prices = raw.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    return generateStockSteps(prices.length > 0 ? prices : [1, 2, 3, 0, 2]);
  },
  renderCanvas: (container, step) => {
    renderStockCanvas(container, step);
  },
});
