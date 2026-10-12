/**
 * Class 182: 可撤销并查集 (Rollback DSU) 领域视觉适配器
 * 核心：树形拓扑与历史操作栈沙盘、阶段指示卡、复杂度定理与公式卡
 */

import { renderRollbackDSUBoard } from '../../../algorithms/categories/advanced-topics/advanced-179-184/advanced-179-184-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { RollbackDSUStep } from './rollback-dsu-182-step-compiler';

export function renderRollbackDSUCanvas(container: HTMLElement, step: RollbackDSUStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderRollbackDSUBoard(
      step.nodes,
      step.parent,
      step.rank,
      step.history,
      step.stage
    ),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#0284c7',
      },
      {
        label: '回退复杂度',
        value: '历史栈弹栈 O(1) 精确还原',
        color: '#059669',
      },
    ],
    formula: {
      title: '按秩合并树高定理',
      equation: 'h <= floor(log_2 N) + 1 | 严禁使用路径压缩，撤销时直接弹栈赋值，单步代价 O(1)',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
