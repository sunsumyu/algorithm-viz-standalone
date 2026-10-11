/**
 * Class 101: KMP 循环节与周期串检测
 * Canvas Adapter
 */

import {
  renderCharSequence,
  renderAuxArrayTable,
  renderFormulaCard,
} from './string-100-105-shared';
import { KmpPeriodStep } from './kmp-period-step-compiler';

export function renderKmpPeriodCanvas(container: HTMLElement, step: KmpPeriodStep): void {
  const highlightIndices: number[] = [];
  if (step.isDivisible && step.periodLen > 0) {
    for (let i = 0; i < step.periodLen; i++) highlightIndices.push(i);
  }

  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderCharSequence(
        '待分析字符串 (String s)',
        step.s,
        step.periodLen > 0 && step.periodLen < step.n ? step.periodLen : -1,
        highlightIndices,
        [],
        -1,
        '周期断点'
      )}

      ${step.nextArr.length > 0 ? renderAuxArrayTable('Next 数组 (包含 next[n])', step.s + '∅', step.nextArr, step.n, 'next[i]') : ''}

      ${renderFormulaCard(
        '周期定理几何展开',
        `n = ${step.n} | next[n] = ${step.maxPrefixSuffix} | period = n - next[n] = ${step.periodLen} | ${step.n} % ${step.periodLen} == ${step.n % step.periodLen}`,
        step.decision,
        step.statusBadge
      )}

      ${step.isDivisible && step.periodLen < step.n ? `
        <div style="margin-top: 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 12px 14px;">
          <div style="font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 6px;">
            🔄 周期瓦片平铺示意 (共 ${step.repeatCount} 组)
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${Array.from({ length: step.repeatCount }).map((_, idx) => `
              <div style="background: #ffffff; border: 2px dashed #22c55e; border-radius: 8px; padding: 6px 14px; font-family: monospace; font-size: 14px; font-weight: 700; color: #15803d; box-shadow: 0 2px 4px rgba(34, 197, 94, 0.1);">
                ${step.s.slice(0, step.periodLen)}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}
