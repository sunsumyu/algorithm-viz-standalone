/**
 * 两数相除 (Divide Two Integers) - 视觉适配器
 * LeetCode 29 (Medium / 左程云通关课 Class 032 进阶)
 */

import { DivideStep } from './divide-two-integers-step-compiler';

export function renderDivideCanvas(step: DivideStep): string {
  const { dividend, divisor, remaining, currentShift, currentMultiple, quotient, phase } = step;

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <!-- 上部 运算可视化面板 -->
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">二进制快速倍增减法剖面 (${dividend} ÷ ${divisor})</div>
          <div style="font-size: 11px; color: #fbbf24; font-weight: 700;">
            ${phase === 'find-shift' ? `探测中: 左移 ${currentShift} 位 (×${currentMultiple})` : phase === 'subtract' ? `已扣除: 余量 ${remaining}` : '运算就绪'}
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: center; gap: 16px; min-height: 80px;">
          <!-- 剩余被除数 -->
          <div style="display: flex; flex-direction: column; align-items: center; background: rgba(56, 189, 248, 0.15); border: 2px solid #38bdf8; border-radius: 8px; padding: 10px 16px;">
            <span style="font-size: 11px; color: #94a3b8;">当前余量 a</span>
            <span style="font-size: 24px; font-weight: 700; color: #38bdf8;">${remaining}</span>
          </div>

          <div style="font-size: 20px; color: #64748b; font-weight: 700;">−</div>

          <!-- 本轮倍增除数 -->
          <div style="display: flex; flex-direction: column; align-items: center; background: rgba(245, 158, 11, 0.15); border: 2px solid #f59e0b; border-radius: 8px; padding: 10px 16px;">
            <span style="font-size: 11px; color: #94a3b8;">扣除倍数 b × 2^${currentShift}</span>
            <span style="font-size: 24px; font-weight: 700; color: #fbbf24;">${Math.abs(divisor) * currentMultiple}</span>
          </div>

          <div style="font-size: 20px; color: #64748b; font-weight: 700;">=</div>

          <!-- 累积商 -->
          <div style="display: flex; flex-direction: column; align-items: center; background: rgba(16, 185, 129, 0.15); border: 2px solid #10b981; border-radius: 8px; padding: 10px 16px;">
            <span style="font-size: 11px; color: #94a3b8;">累计商 ans</span>
            <span style="font-size: 24px; font-weight: 700; color: #34d399;">${quotient}</span>
          </div>
        </div>
      </div>

      <!-- 底部指标卡片 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">被除数 / 除数</div>
          <div style="font-size: 16px; font-weight: 700; color: #60a5fa;">${dividend} / ${divisor}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">本轮左移位移 shift</div>
          <div style="font-size: 16px; font-weight: 700; color: #fbbf24;">${currentShift} 位</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前商增量 (1 << shift)</div>
          <div style="font-size: 16px; font-weight: 700; color: #38bdf8;">+${currentMultiple}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">最终结果 商</div>
          <div style="font-size: 18px; font-weight: 700; color: #34d399;">${quotient}</div>
        </div>
      </div>
    </div>
  `;
}
