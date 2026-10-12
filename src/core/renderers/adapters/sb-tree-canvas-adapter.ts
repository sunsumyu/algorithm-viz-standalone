/**
 * Class 149: Size Balanced Tree (SB 树) 领域视觉适配器
 * 核心：SB 树沙盘、当前键值状态指标卡、Maintain 状态指示与平衡公式卡
 */

import { SBStep } from './sb-tree-step-compiler';
import { renderSBTreeBoard } from '../../../algorithms/categories/advanced-topics/advanced-149-154/advanced-149-154-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderSBTreeCanvas(container: HTMLElement, step: SBStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderSBTreeBoard(step.root, step.activeKey, step.maintainType)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前操作键值</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">
            ${step.activeKey >= 0 ? `Key = ${step.activeKey}` : '操作就绪'}
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">Maintain 状态</div>
          <div style="font-size: 16px; font-weight: 700; color: ${step.maintainType !== 'None' ? '#b45309' : '#059669'};">
            ${step.maintainType !== 'None' ? step.maintainType : '子树平衡良好'}
          </div>
        </div>
      </div>

      ${renderFormulaCard(
        'SB 树 Maintain 平衡引擎',
        `平衡公理: size(t.left) &ge; max(size(t.right.left), size(t.right.right)) | 仅插入调整，删除 0 旋转`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
