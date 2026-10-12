/**
 * Class 181: 线段树分治 (Segment Tree Divide and Conquer) 领域视觉适配器
 * 核心：时间轴区间拓扑展板、当前阶段卡、离线化优势卡与核心范式公式卡
 */

import { renderSegmentTreeDivideBoard } from '../../../algorithms/categories/advanced-topics/advanced-179-184/advanced-179-184-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { SegmentTreeDivideStep } from './segment-tree-divide-181-step-compiler';

export function renderSegmentTreeDivideCanvas(container: HTMLElement, step: SegmentTreeDivideStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderSegmentTreeDivideBoard(
      step.totalTime,
      step.curTime,
      step.edges,
      step.activeEdges,
      step.isBipartite,
      step.stage
    ),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#b45309',
      },
      {
        label: '离线化优势',
        value: '将删边转化为只增不减+回退',
        color: '#059669',
      },
    ],
    formula: {
      title: '线段树分治核心范式',
      equation: '每条边挂载在 O(log T) 个区间节点 | 前序遍历 DFS + 历史栈回滚',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
