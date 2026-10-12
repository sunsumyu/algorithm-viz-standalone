/**
 * Class 153: 替罪羊树 (Scapegoat Tree) 领域视觉适配器
 * 核心：替罪羊树拓扑展板、alpha 阈值指示卡、暴力拍扁重建状态卡与不自旋重构引擎卡
 */

import { ScapegoatStep } from './scapegoat-tree-step-compiler';
import { renderScapegoatBoard } from '../../../algorithms/categories/advanced-topics/advanced-149-154/advanced-149-154-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderScapegoatTreeCanvas(container: HTMLElement, step: ScapegoatStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderScapegoatBoard(step.root, step.flattenBuffer, step.isRebuilding)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">失衡判定阈值 alpha</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">&alpha; = ${step.alpha}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前重构状态</div>
          <div style="font-size: 16px; font-weight: 700; color: ${step.isRebuilding ? '#ea580c' : '#059669'};">
            ${step.isRebuilding ? '正在暴力拍扁重建' : '树形维持稳定'}
          </div>
        </div>
      </div>

      ${renderFormulaCard(
        '替罪羊树不自旋重构引擎',
        `失衡充要条件: max(sz_L, sz_R) &gt; &alpha; * sz | 修复手段: 0 旋转，中序扁平化数组 + 分治二分构建`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
