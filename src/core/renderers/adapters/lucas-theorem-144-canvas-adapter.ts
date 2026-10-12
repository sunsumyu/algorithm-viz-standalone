/**
 * Class 144: 卢卡斯定理与大组合数求模 领域视觉适配器
 * 核心：递归调用栈跟踪、p 进制数位分解状态展示与大数求模状态卡
 */

import { Lucas144Step } from './lucas-theorem-144-step-compiler';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderLucas144Canvas(container: HTMLElement, step: Lucas144Step): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      <!-- 顶部指标卡 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">素数模数 p</div>
          <div style="font-size: 18px; font-weight: 700; color: #0284c7; margin-top: 4px;">p = ${step.p}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前帧参数 (n, m)</div>
          <div style="font-size: 18px; font-weight: 700; color: #8b5cf6; margin-top: 4px;">(${step.curN}, ${step.curM})</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前调用栈深度</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669; margin-top: 4px;">${step.stack.length} 层</div>
        </div>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #166534;">当前结果 (mod p)</div>
          <div style="font-size: 22px; font-weight: 800; color: #15803d; margin-top: 4px;">${step.ans >= 0 ? step.ans : '计算中...'}</div>
        </div>
      </div>

      <!-- 递归调用栈与 p 进制拆解展板 -->
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
        <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px;">
          📚 卢卡斯递归调用栈与 p 进制数位分解
        </div>
        ${step.stack.length === 0 ? `
          <div style="color: #94a3b8; font-size: 12px; padding: 8px; text-align: center;">调用栈处于初始/已清空状态</div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${step.stack.map((frame, idx) => `
              <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                <div>
                  <span style="font-weight: 700; color: #1e293b;">第 ${idx + 1} 层: C(${frame.n}, ${frame.m})</span>
                  <span style="color: #64748b; margin-left: 12px;">高位: C(${frame.nDivP}, ${frame.mDivP})</span>
                </div>
                <div style="font-family: monospace;">
                  <span style="color: #8b5cf6;">低位: C(${frame.nModP}, ${frame.mModP}) = ${frame.smallComb}</span>
                  ${frame.returnedVal !== undefined ? `<span style="margin-left: 12px; color: #059669; font-weight: 700;">➜ 返回 ${frame.returnedVal}</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- 决策卡片 -->
      ${renderFormulaCard(
        '卢卡斯定理核心状态转移',
        `C(n, m) ≡ C(⌊n/p⌋, ⌊m/p⌋) × C(n mod p, m mod p) (mod p)`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
