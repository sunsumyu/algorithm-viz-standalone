/**
 * Class 111: 动态开点线段树 (Dynamic Segment Tree) 画布渲染适配器
 * 负责动态开点线段树的 SVG 拓扑及内存开销卡片渲染
 */

import { DynamicSegTreeStep } from './dynamic-segment-tree-step-compiler';
import { renderSegmentTreeVisual } from '../../../algorithms/categories/tree/tree-108-116/tree-108-116-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderDynamicSegmentTreeCanvas(container: HTMLElement, step: DynamicSegTreeStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderSegmentTreeVisual(step.nodes, step.activeNodeId, step.queryL, step.queryR),
    formula: {
      title: '动态开点内存监控',
      equation: `坐标空间: [1..${step.maxDomain}] | 目标区间: [${step.queryL}..${step.queryR}] | 当前已分配节点数: ${step.totalAllocated} 个 (传统线段树需 ${step.maxDomain * 4} 个)`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
