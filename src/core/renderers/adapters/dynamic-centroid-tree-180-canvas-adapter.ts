/**
 * Class 180: 动态点分治与点分树 (Dynamic Centroid Tree) 领域视觉适配器
 * 核心：点分树拓扑与跳跃路径沙盘、当前算法阶段指示卡、树高限制卡与容斥公式卡
 */

import { renderDynamicCentroidBoard } from '../../../algorithms/categories/advanced-topics/advanced-179-184/advanced-179-184-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { DynamicCentroidStep } from './dynamic-centroid-tree-180-step-compiler';

export function renderDynamicCentroidCanvas(container: HTMLElement, step: DynamicCentroidStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderDynamicCentroidBoard(
      step.nodes,
      step.ctParent,
      step.activeJumpPath,
      step.stage
    ),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#15803d',
      },
      {
        label: '点分树高限制',
        value: '至多 log N 层上跳',
        color: '#0284c7',
      },
    ],
    formula: {
      title: '点分树容斥核心公式',
      equation: 'Ans = tree1[u].query(k) + sum ( tree1[fa].query(k - d) - tree2[cur].query(k - d) )',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
