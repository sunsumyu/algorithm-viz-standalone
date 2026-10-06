/**
 * Class 120: 树的重心 (Tree Centroid) 领域视觉适配器
 * 负责树形拓扑结构呈现、各节点子树大小/上方块评估及最终重心节点高亮
 */

import { TreeCentroidStep } from './tree-centroid-step-compiler';
import { renderTreeTopology } from '../../../algorithms/categories/tree/tree-117-123/tree-117-123-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderTreeCentroidCanvas(container: HTMLElement, step: TreeCentroidStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderTreeTopology(step.nodes, step.edges, step.activeNodeId, step.highlightNodes || [])}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前重心候选</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">#${step.currentCentroid > 0 ? step.currentCentroid : '-'}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">删除后最大连通块</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.bestMaxPart < 9999 ? step.bestMaxPart : '-'}</div>
        </div>
      </div>

      ${renderFormulaCard(
        '树重心树形 DP 评估',
        `当前考察点: #${step.activeNodeId} | size: ${step.nodeSizeMap[step.activeNodeId] || 1} | 最大连通块: ${step.maxPartMap[step.activeNodeId] || '-'}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
