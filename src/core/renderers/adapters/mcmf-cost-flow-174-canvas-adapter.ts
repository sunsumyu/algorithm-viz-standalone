/**
 * Class 174: 最小费用最大流 (MCMF) 领域视觉适配器
 * 核心：费用残量网络展板、当前阶段卡、费用最优化准则卡与 SPFA 增广定理卡
 */

import { renderMCMFBoard } from '../../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { MCMFStep } from './mcmf-cost-flow-174-step-compiler';

export function renderMCMFCanvas(container: HTMLElement, step: MCMFStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderMCMFBoard(step.nodes, step.edges, step.totalFlow, step.totalCost, step.stage),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#b45309',
      },
      {
        label: '费用最优化准则',
        value: '无负费用增广圈',
        color: '#059669',
      },
    ],
    formula: {
      title: 'MCMF 最小费用流定理',
      equation: '增广准则: 每次沿残量网络中以单位费用为边权的单源最短路增广 | 反向费用: cost(v, u) = -cost(u, v) | 终止条件: 不存在增广路',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
