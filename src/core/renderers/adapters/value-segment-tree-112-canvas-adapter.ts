/**
 * Class 112: 权值线段树与单点更新 (Value Segment Tree) 领域视觉适配器
 * 负责状态空间沙盘与指标卡、树形层级、决策公式卡片的渲染挂载
 */

import { ValueSegTreeStep } from './value-segment-tree-112-step-compiler';
import { renderSegmentTreeVisual } from '../../../algorithms/categories/tree/tree-108-116/tree-108-116-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderValueSegTreeCanvas(container: HTMLElement, step: ValueSegTreeStep): void {
  composeUnifiedCanvas(container, {
    metrics: [
      { label: '当前操作类型', value: step.curOp, color: '#0284c7' },
      { label: '目标排名 (K)', value: `第 ${step.queryK} 小`, color: '#8b5cf6' },
      { label: '当前聚焦节点', value: `节点 u=${step.activeNodeId}`, color: '#059669' },
      { label: '第 K 小最终结果', value: step.foundVal >= 0 ? step.foundVal : '计算中...', color: '#15803d' },
    ],
    mainBoardHtml: renderSegmentTreeVisual(step.nodes, step.activeNodeId),
    formula: {
      title: '权值二分判定准则',
      equation: 'if (k <= leftCount) u = u * 2; else { k -= leftCount; u = u * 2 + 1; }',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
