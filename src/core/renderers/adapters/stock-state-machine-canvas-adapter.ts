/**
 * 股票交易状态机 DP
 * Canvas Adapter: 价格柱状图时间轴与 Hold/Rest/Sold 三状态机沙盘呈现
 */

import type { StockStateStep } from './stock-state-machine-step-compiler';

export function renderStockCanvas(container: HTMLElement, step: StockStateStep): void {
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
