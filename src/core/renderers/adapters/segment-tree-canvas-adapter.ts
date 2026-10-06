/**
 * Class 110: 经典线段树与懒惰标记 (Segment Tree with Lazy Tag) 领域视觉适配器
 * 负责线段树节点二叉排布、Lazy 标记展示与状态卡片的挂载呈现
 */

import { SegmentTreeStep } from './segment-tree-step-compiler';
import { renderSegmentTreeVisual } from '../../../algorithms/categories/tree/tree-108-116/tree-108-116-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderSegmentTreeCanvas(container: HTMLElement, step: SegmentTreeStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderSegmentTreeVisual(step.nodes, step.activeNodeId, step.queryL, step.queryR)}

      ${renderFormulaCard(
        '线段树 Lazy Tag 运行状态',
        `当前处理节点: #${step.activeNodeId} | 目标区间: [${step.queryL}..${step.queryR}] (增加 +${step.addVal}) | 全树根节点总和: ${step.nodes.find(n => n.id === 1)?.val ?? 0}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
