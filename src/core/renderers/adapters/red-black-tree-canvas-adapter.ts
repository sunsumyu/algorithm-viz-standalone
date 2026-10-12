/**
 * Class 150: 红黑树 (Red-Black Tree) 领域视觉适配器
 * 核心：红黑二叉树拓扑沙盘、当前键值指示卡、修复阶段卡与黑高五大公理卡
 */

import { RBStep } from './red-black-tree-step-compiler';
import { renderRBTreeBoard } from '../../../algorithms/categories/advanced-topics/advanced-149-154/advanced-149-154-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderRBTreeCanvas(container: HTMLElement, step: RBStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderRBTreeBoard(step.root, step.activeKey, step.actionType)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前操作键值</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">
            ${step.activeKey >= 0 ? `Key = ${step.activeKey}` : '调整就绪'}
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前修复阶段</div>
          <div style="font-size: 16px; font-weight: 700; color: #059669;">${step.actionType}</div>
        </div>
      </div>

      ${renderFormulaCard(
        '红黑树着色与黑高维护引擎',
        `公理4: 红色不能相连 | 公理5: 各路径黑色节点数相等 | 修复三部曲: 叔叔为红变色上推，叔叔为黑一字/之字旋转`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
