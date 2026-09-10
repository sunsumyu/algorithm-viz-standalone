/**
 * Hard 09: 股票交易全系列统一状态机 DP (Stock Trading State Machine)
 * LeetCode 188 / 309 / 714 核心统一状态机模型
 * 统一状态机 DP：持有股票 (Hold)、空仓观察 (Rest)、刚刚卖出/冷冻期 (Sold/Cooldown)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
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

export function generateStockSteps(prices: number[]): StockStateStep[] {
  const steps: StockStateStep[] = [];
  const n = prices.length;

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
      codeLine: 4,
      statusBadge: { text: '无数据', type: 'danger' }
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
    codeLine: 5,
    statusBadge: { text: '初始买入', type: 'info' }
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
      codeLine: 12,
      statusBadge: { text: `Day ${i}: 收益 ${currentMax}`, type: 'warning' }
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
    codeLine: 18,
    statusBadge: { text: `最终净利润: ${finalProfit}`, type: 'success' }
  });

  return steps;
}

export function renderStockCanvas(container: HTMLElement, step: StockStateStep) {
  const { prices, dayIndex, price, hold, rest, sold, bestProfit } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前天数 / 价格</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            Day ${dayIndex >= 0 ? dayIndex : 0} (¥${price})
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">持有股票 (Hold)</div>
          <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">
            ${hold}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">空仓观望 (Rest)</div>
          <div style="font-size: 14px; font-weight: bold; color: #10b981;">
            ${rest}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">刚卖出/冷冻 (Sold)</div>
          <div style="font-size: 14px; font-weight: bold; color: #ec4899;">
            ${sold}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前最佳利润</div>
          <div style="font-size: 14px; font-weight: bold; color: #a855f7;">
            ${bestProfit}
          </div>
        </div>
      </div>

      <!-- 价格序列时间轴 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;">
        <div style="display: flex; gap: 8px; justify-content: center; align-items: flex-end; min-width: 450px;">
          ${prices.map((p, idx) => {
            const isCurrent = idx === dayIndex;
            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="font-size: 10px; height: 14px; color: ${isCurrent ? '#38bdf8' : '#64748b'}; font-weight: bold;">
                  ${isCurrent ? 'TODAY' : ''}
                </div>
                <div style="
                  width: 48px;
                  height: ${30 + p * 8}px;
                  background: ${isCurrent ? 'rgba(56, 189, 248, 0.4)' : 'rgba(51, 65, 85, 0.4)'};
                  border: 2px solid ${isCurrent ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'};
                  border-radius: 6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 14px;
                  font-weight: bold;
                  color: #f8fafc;
                  box-shadow: ${isCurrent ? '0 0 12px rgba(56, 189, 248, 0.5)' : 'none'};
                  transition: all 0.2s ease;
                ">
                  ¥${p}
                </div>
                <div style="font-size: 10px; color: #64748b;">
                  Day ${idx}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 状态机转移原理核心卡片 -->
      ${renderFormulaCard(
        '三状态机核心转移方程 (State Machine Transitions)',
        'nextHold = max(hold, rest - price)；nextRest = max(rest, sold)；nextSold = hold + price (卖出后次日不可立即买入)',
        step.decision,
        step.statusBadge
      )}
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
