/**
 * Class 108: 树状数组 (Fenwick Tree / BIT) 画布渲染适配器
 * 负责树状数组的二叉树状覆盖区间拓扑与状态看板渲染
 */

import { FenwickStep, lowbit } from './fenwick-tree-step-compiler';
import { renderFenwickTreeVisual } from '../../../algorithms/categories/tree/tree-108-116/tree-108-116-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderFenwickTreeCanvas(container: HTMLElement, step: FenwickStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderFenwickTreeVisual(step.nums, step.tree, step.curIdx, step.jumpPath, step.opType)}

      ${renderFormulaCard(
        '树状数组状态看板',
        `当前考察点: ${step.curIdx > 0 ? `Tree[${step.curIdx}] (lowbit=${lowbit(step.curIdx)})` : '空闲'} | 路径: [${step.jumpPath.join(' ➔ ') || '无'}] ${step.currentSum !== undefined ? `| 累计和: ${step.currentSum}` : ''}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
