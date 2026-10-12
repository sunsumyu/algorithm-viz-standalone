/**
 * 俄罗斯套娃信封问题 (LeetCode 354)
 * Canvas Adapter: 排序信封序列高亮沙盘与 LIS ends 尾数数组可视化呈现
 */

import type { EnvelopeStep } from './russian-doll-step-compiler';

export function renderRussianDollCanvas(container: HTMLElement, step: EnvelopeStep): void {
  const { envelopes, currentEnvIndex, ends } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%; height: 100%; padding: 4px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 信封卡片排布容器 -->
      <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px; flex: 1; display: flex; flex-direction: column; min-height: 0;">
        <div style="font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 8px; display: flex; justify-content: space-between;">
          <span>信封序列 (宽升序，同宽高降序):</span>
          <span>当前处理: ${currentEnvIndex >= 0 && currentEnvIndex < envelopes.length ? `[${envelopes[currentEnvIndex][0]}, ${envelopes[currentEnvIndex][1]}]` : '-'}</span>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; overflow-y: auto; align-content: flex-start; padding: 4px;">
          ${envelopes.map(([w, h], idx) => {
            const isCur = idx === currentEnvIndex;
            return `
              <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
              ">
                <div style="
                  width: 52px;
                  height: 40px;
                  border: ${isCur ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)'};
                  background: ${isCur ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.5)'};
                  box-shadow: ${isCur ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none'};
                  border-radius: 6px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  font-family: monospace;
                  font-weight: 700;
                  transition: all 0.2s ease;
                ">
                  <div style="color: #94a3b8; font-size: 10px;">w:${w}</div>
                  <div style="color: #38bdf8; font-size: 12px;">h:${h}</div>
                </div>
                <div style="font-size: 10px; color: #64748b; font-family: monospace;">
                  [${idx}]
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- ends 数组展示 -->
      <div style="background: rgba(15, 23, 42, 0.4); padding: 12px 14px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #34d399; font-weight: 600;">LIS 贪心 ends 尾数数组 (各长度递增子序列最小末尾高度):</span>
          <span style="font-size: 11px; color: #94a3b8;">二分定位 O(log N)</span>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${ends.length === 0 ? '<span style="color: #64748b; font-size: 11px;">(待推入首个信封)</span>' : ''}
          ${ends.map((hVal, i) => `
            <div style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 4px; padding: 4px 10px; font-size: 12px; color: #f8fafc; display: flex; align-items: center; gap: 4px;">
              <span style="color: #94a3b8; font-size: 10px;">长度 ${i + 1}:</span> <strong style="color: #34d399;">h=${hVal}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
