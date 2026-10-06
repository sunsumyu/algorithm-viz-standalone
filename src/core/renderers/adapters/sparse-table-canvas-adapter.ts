/**
 * ST 表 (Sparse Table) RMQ 画布呈现适配器深模块 (SparseTableCanvasAdapter)
 * 遵循 Matt Pocock 深模块哲学与单一职责原则
 */

import { renderSparseTableVisual } from '../../../algorithms/categories/tree/tree-117-123/tree-117-123-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { SparseTableStep } from './sparse-table-step-compiler';

export function renderSparseTableCanvas(container: HTMLElement, step: SparseTableStep): void {
  if (!container) return;
  const len = Math.max(1, step.queryR - step.queryL + 1);
  const k = Math.floor(Math.log2(len));
  const span = 1 << k;
  const rightStart = step.queryR - span + 1;

  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderSparseTableVisual(step.nums, step.st, step.activeI, step.activeJ)}

      ${renderFormulaCard(
        'ST 表 O(1) 查询公式',
        `k = log2(${len}) | max(ST[${step.queryL}][${k}], ST[${rightStart}][${k}]) = ${step.maxAns}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
