/**
 * Class 120: 树的重心 (Tree Centroid) 领域视觉适配器
 * 负责树形拓扑结构呈现、各节点子树大小/上方块评估及最终重心节点高亮
 */

import { TreeCentroidStep } from './tree-centroid-step-compiler';
import { renderTreeTopology } from '../../../algorithms/categories/tree/tree-117-123/tree-117-123-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderTreeCentroidCanvas(container: HTMLElement, step: TreeCentroidStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderTreeTopology(step.nodes, step.edges, step.activeNodeId, step.highlightNodes || []),
    metrics: [
      {
        label: '当前重心候选',
        value: `#${step.currentCentroid > 0 ? step.currentCentroid : '-'}`,
        color: '#4338ca',
      },
      {
        label: '删除后最大连通块',
        value: `${step.bestMaxPart < 9999 ? step.bestMaxPart : '-'}`,
        color: '#059669',
      },
    ],
    formula: {
      title: '树重心树形 DP 评估',
      equation: `当前考察点: #${step.activeNodeId} | size: ${step.nodeSizeMap[step.activeNodeId] || 1} | 最大连通块: ${step.maxPartMap[step.activeNodeId] || '-'}`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
