/**
 * Class 142: 差分约束系统与负环判定 领域视觉适配器
 * 核心：约束状态网格、松弛状态指示、公式卡片与状态指示器
 */

import { DiffConstraintsStep } from './diff-constraints-system-step-compiler';
import { renderDiffConstraintsBoard } from '../../../algorithms/categories/advanced-topics/advanced-142-148/advanced-142-148-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderDiffConstraintsCanvas(container: HTMLElement, step: DiffConstraintsStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderDiffConstraintsBoard(
      step.n,
      step.dist,
      step.count,
      step.inQueue,
      step.activeNode,
      step.edges,
      step.hasNegativeCycle
    ),
    metrics: [
      {
        label: '当前松弛活跃节点',
        value: step.activeNode > 0 ? `变量 x${step.activeNode}` : '等待队列出队',
        color: '#4338ca',
      },
      {
        label: '约束系统状态',
        value: step.hasNegativeCycle ? '存在负权环 (矛盾)' : '约束正常满足',
        color: step.hasNegativeCycle ? '#dc2626' : '#059669',
      },
    ],
    formula: {
      title: '差分约束 SPFA 松弛引擎',
      equation: `三角不等式准则: dist[v] <= dist[u] + w | 负环充要条件: 某节点入队松弛次数 >= N(${step.n})`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
