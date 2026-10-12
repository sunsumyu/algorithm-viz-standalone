/**
 * Class 123: 树的直径 (Tree Diameter - 两遍 BFS/DFS) 领域视觉适配器
 * 负责两遍 BFS 搜索扩展、端点定位与直径路径高亮呈现
 */

import { TreeDiameterStep } from './tree-diameter-step-compiler';
import { renderTreeTopology } from '../../../algorithms/categories/tree/tree-117-123/tree-117-123-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderTreeDiameterCanvas(container: HTMLElement, step: TreeDiameterStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderTreeTopology(step.nodes, step.edges, step.activeNodeId, step.highlightNodes || []),
    metrics: [
      {
        label: '第一遍最远点 x',
        value: `#${step.farthestX ?? '-'}`,
        color: '#4338ca',
      },
      {
        label: '第二遍最远点 y',
        value: `#${step.farthestY ?? '-'}`,
        color: '#059669',
      },
      {
        label: '树的直径长度',
        value: `${step.diameter ?? '-'}`,
        color: '#d97706',
      },
    ],
    formula: {
      title: '树的直径两遍 BFS 进度',
      equation: `当前 BFS 阶段: 第 ${step.bfsRound} 遍 | 距离起点最大: ${Math.max(...Object.values(step.distMap), 0)} ${step.diameterPath ? `| 直径路径: [${step.diameterPath.join(' -> ')}]` : ''}`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
