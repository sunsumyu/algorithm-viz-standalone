/**
 * Class 186: 边分治与二叉树化重构 (Edge Decomposition) 领域视觉适配器
 * 核心：边分治重心边选择与左右连通块沙盘、当前算法阶段指示卡、分治二叉特性卡与重心边选择准则公式卡
 */

import { renderEdgeDecompBoard } from '../../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { EdgeDecompStep } from './edge-decomposition-186-step-compiler';

export function renderEdgeDecompCanvas(container: HTMLElement, step: EdgeDecompStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderEdgeDecompBoard(
      step.nodes,
      step.edges,
      step.activeEdgeId,
      step.blockA,
      step.blockB,
      step.stage
    ),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#b45309',
      },
      {
        label: '分治二叉特性',
        value: '左右严格二等分，便于凸包合并',
        color: '#059669',
      },
    ],
    formula: {
      title: '边分治重心边选择准则',
      equation: 'min_{e = (u, v)} |sz[u] - sz[v]| <= max(sz[u], sz[v]) <= ceil(2N / 3)',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
