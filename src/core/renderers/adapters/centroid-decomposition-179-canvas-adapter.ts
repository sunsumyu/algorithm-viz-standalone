/**
 * Class 179: 点分治与树上路径统计 (Centroid Decomposition) 领域视觉适配器
 * 核心：重心树拓扑沙盘、当前算法阶段指示卡、递归深度保障卡与复杂度公式卡
 */

import { renderCentroidBoard } from '../../../algorithms/categories/advanced-topics/advanced-179-184/advanced-179-184-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { CentroidStep } from './centroid-decomposition-179-step-compiler';

export function renderCentroidCanvas(container: HTMLElement, step: CentroidStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderCentroidBoard(
      step.nodes,
      step.centroid,
      step.visitedCentroids,
      step.validPaths,
      step.stage
    ),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#0284c7',
      },
      {
        label: '递归深度保障',
        value: '重心子树 <= N/2, 深度 <= log N',
        color: '#059669',
      },
    ],
    formula: {
      title: '点分治复杂度保证',
      equation: '递归深度: O(log N) | 每层统计: O(N) | 总时间复杂度: O(N log N)',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
