/**
 * Class 154: 非旋 Treap / FHQ-Treap 领域视觉适配器
 * 核心：分裂合并双树展板、当前分裂操作卡、范式指示卡与极简无旋引擎卡
 */

import { FHQStep } from './treap-fhq-step-compiler';
import { renderFHQTreapBoard } from '../../../algorithms/categories/advanced-topics/advanced-149-154/advanced-149-154-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderFHQTreapCanvas(container: HTMLElement, step: FHQStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderFHQTreapBoard(step.rootL, step.rootR, step.mergedRoot, step.splitKey)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前操作类型</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">
            ${step.splitKey !== undefined ? `按 Key &le; ${step.splitKey} 分裂` : '合并 / 就绪'}
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">核心操作范式</div>
          <div style="font-size: 16px; font-weight: 700; color: #059669;">无旋 Split / Merge</div>
        </div>
      </div>

      ${renderFormulaCard(
        'FHQ-Treap 极简无旋引擎',
        `二叉搜索律: val(L) &le; key &lt; val(R) | 随机堆序律: pri(root) &le; min(pri(L), pri(R)) | 0 旋转自平衡`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
