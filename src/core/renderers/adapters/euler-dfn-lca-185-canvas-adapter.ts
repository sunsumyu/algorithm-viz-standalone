/**
 * Class 185: 欧拉序结合 RMQ 求 LCA (Euler Tour LCA) 领域视觉适配器
 * 核心：树拓扑与欧拉序序列沙盘、当前算法阶段指示卡、单次查询耗时卡与 RMQ 映射公式卡
 */

import { renderEulerDfnBoard } from '../../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { EulerDfnStep } from './euler-dfn-lca-185-step-compiler';

export function renderEulerDfnCanvas(container: HTMLElement, step: EulerDfnStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderEulerDfnBoard(
      step.nodes,
      step.eulerTour,
      step.firstPos,
      step.u,
      step.v,
      step.lca,
      step.stage
    ),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#0284c7',
      },
      {
        label: '单次查询耗时',
        value: '严格 O(1) 常数时间',
        color: '#059669',
      },
    ],
    formula: {
      title: '欧拉序 RMQ LCA 核心映射',
      equation: 'LCA(u, v) = argmin_{i in [pos[u], pos[v]]} dep[euler[i]]',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
