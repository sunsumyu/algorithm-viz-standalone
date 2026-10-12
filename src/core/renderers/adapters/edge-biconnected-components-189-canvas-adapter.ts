/**
 * Class 189: 边双连通分量 (Edge-Biconnected Components, e-BCC) 领域视觉适配器
 * 核心：无向图桥判定与边双分量沙盘、当前算法阶段指示卡、缩点树退化卡与割边判定定理卡
 */

import { renderEdgeBCCBoard } from '../../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { EdgeBCCStep } from './edge-biconnected-components-189-step-compiler';

export function renderEdgeBCCCanvas(container: HTMLElement, step: EdgeBCCStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderEdgeBCCBoard(
      step.nodes,
      step.edges,
      step.ebccs,
      step.stage
    ),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#1d4ed8',
      },
      {
        label: '缩点拓扑性质',
        value: '边双缩点后必然退化为树或森林',
        color: '#059669',
      },
    ],
    formula: {
      title: '割边 (桥) 判定定理',
      equation: 'low[v] > dfn[u] <=> 无向边 (u, v) 为割边 (删除后图分裂为两个连通块)',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
