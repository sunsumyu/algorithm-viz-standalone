/**
 * Class 144: 卢卡斯定理与大组合数求模 领域视觉适配器
 * 核心：递归调用栈跟踪、p 进制数位分解状态展示与大数求模状态卡
 */

import { Lucas144Step } from './lucas-theorem-144-step-compiler';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderLucas144Canvas(container: HTMLElement, step: Lucas144Step): void {
  const stackBoardHtml = `
    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; margin-bottom: 4px;">
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
  `;

  composeUnifiedCanvas(container, {
    metrics: [
      { label: '素数模数 p', value: `p = ${step.p}`, color: '#0284c7' },
      { label: '当前帧参数 (n, m)', value: `(${step.curN}, ${step.curM})`, color: '#8b5cf6' },
      { label: '当前调用栈深度', value: `${step.stack.length} 层`, color: '#059669' },
      { label: '当前结果 (mod p)', value: step.ans >= 0 ? step.ans : '计算中...', color: '#15803d' },
    ],
    mainBoardHtml: stackBoardHtml,
    formula: {
      title: '卢卡斯定理核心状态转移',
      equation: `C(n, m) ≡ C(⌊n/p⌋, ⌊m/p⌋) × C(n mod p, m mod p) (mod p)`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
