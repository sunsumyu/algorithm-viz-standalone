/**
 * Class 173: Dinic 最大流与当前弧优化 (Dinic Max Flow) 领域视觉适配器
 * 核心：残量网络与层次分层沙盘、当前算法阶段指示卡、当前弧优化卡与最大流最小割公式卡
 */

import { renderDinicBoard } from '../../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { DinicStep } from './dinic-max-flow-173-step-compiler';

export function renderDinicCanvas(container: HTMLElement, step: DinicStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderDinicBoard(step.nodes, step.edges, step.dep, step.maxFlow, step.stage),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#0284c7',
      },
      {
        label: '当前弧优化',
        value: '避免重复无效深搜',
        color: '#059669',
      },
    ],
    formula: {
      title: 'Dinic 最大流与最大流最小割定理',
      equation: '层次边条件: dep[v] = dep[u] + 1 | 反向弧退流: cap[e] -= f, cap[e ^ 1] += f | 最大流 = 最小割容量',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
