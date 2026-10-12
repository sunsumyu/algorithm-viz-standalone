/**
 * Class 190: 点双连通分量 (Vertex-Biconnected Components, v-BCC) 领域视觉适配器
 * 核心：割点检测与圆方树构建沙盘、当前算法阶段指示卡、割点共享性质卡与割点判定定理卡
 */

import { renderVertexBCCBoard } from '../../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { VertexBCCStep } from './vertex-biconnected-components-190-step-compiler';

export function renderVertexBCCCanvas(container: HTMLElement, step: VertexBCCStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderVertexBCCBoard(
      step.nodes,
      step.cutVertices,
      step.vbccs,
      step.stage
    ),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#b45309',
      },
      {
        label: '点双特殊性质',
        value: '一个割点可属于多个点双',
        color: '#059669',
      },
    ],
    formula: {
      title: '割点判定准则',
      equation: '非根节点: 存在子树 low[v] >= dfn[u] <=> u 为割点 | 根节点: 子树分支 >= 2 <=> 根为割点',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
