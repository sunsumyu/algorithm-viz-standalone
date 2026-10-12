/**
 * Hard 09: 股票交易全系列统一状态机 DP (Stock Trading State Machine)
 * LeetCode 309 (含冷冻期) / LeetCode 714 (含手续费) / LeetCode 123, 188 (多笔交易)
 * 核心原语：三状态机流转 (Hold / Rest / Sold) 消除后效性
 * 架构规范：轻量领域适配器 (Thin Domain Adapter, LOC < 70) 委托核心深模块
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  type StockStateStep,
  STOCK_TRADING_CODES,
  generateStockSteps,
} from '../../../../core/renderers/adapters/stock-state-machine-step-compiler';
import { renderStockCanvas } from '../../../../core/renderers/adapters/stock-state-machine-canvas-adapter';

export type { StockStateStep };
export { STOCK_TRADING_CODES, generateStockSteps, renderStockCanvas };

export const stockTradingStateMachineVisualizer = registerDeclarativeAlgorithm<StockStateStep>({
  id: 'stock-trading-state-machine',
  aliases: ['class084-code01', 'stock-trading-state-machine', 'leetcode-309', 'best-time-stock-cooldown'],
  name: '大厂高频真题: 股票交易全系列统一状态机 DP',
  category: 'dynamic-programming',
  icon: '📈',
  difficulty: 3,
  levelOrder: 309,
  learningGoal: '掌握股票交易各类变体题目的终极解法——将持股、卖出、冷冻期抽象为有限状态机，写出优雅高效的 O(N) 转移方程',
  metrics: [
    { id: 'dayPrice', label: '当天股价 (Price)', color: 'blue' },
    { id: 'holdVal', label: '持仓收益 (Hold)', color: 'amber' },
    { id: 'restVal', label: '观望收益 (Rest)', color: 'emerald' },
    { id: 'soldVal', label: '冷冻/卖出 (Sold)', color: 'purple' },
  ],
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 309 / 状态机 DP 统一模型)</h3>
      <p>给定一个整数数组 <code>prices</code>，其中 <code>prices[i]</code> 表示第 <code>i</code> 天的股票价格。</p>
      <p>设计一个算法计算出最大利润。在满足以下约束条件下，你可以尽可能地完成更多的交易：</p>
      <ul>
        <li>你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。</li>
        <li>卖出股票后，你无法在第二天买入股票 (即冷冻期为 1 天)。</li>
      </ul>
      <h4>三状态机转移：</h4>
      <ul>
        <li><code>hold[i] = max(hold[i-1], rest[i-1] - price[i])</code></li>
        <li><code>rest[i] = max(rest[i-1], sold[i-1])</code></li>
        <li><code>sold[i] = hold[i-1] + price[i]</code></li>
      </ul>
    </div>
  `,
  codeLanguages: STOCK_TRADING_CODES,
  inputs: [
    {
      id: 'prices',
      label: '股票每日价格序列 (逗号分隔)',
      type: 'text',
      defaultValue: '1, 2, 3, 0, 2',
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.prices || '1, 2, 3, 0, 2');
    const prices = raw
      .split(',')
      .map(s => Number(s.trim()))
      .filter(n => !isNaN(n));
    return generateStockSteps(prices.length > 0 ? prices : [1, 2, 3, 0, 2]);
  },
  renderCanvas: (container, step) => {
    renderStockCanvas(container, step);
  },
});
