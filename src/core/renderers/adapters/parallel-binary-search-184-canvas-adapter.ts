/**
 * Class 184: 整体二分 (Parallel Binary Search) 领域视觉适配器
 * 核心：值域二分与询问集分流沙盘、当前算法阶段指示卡、整体分流机制卡与核心机制公式卡
 */

import { renderParallelBSBoard } from '../../../algorithms/categories/advanced-topics/advanced-179-184/advanced-179-184-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { ParallelBSStep } from './parallel-binary-search-184-step-compiler';

export function renderParallelBSCanvas(container: HTMLElement, step: ParallelBSStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderParallelBSBoard(
      step.l,
      step.r,
      step.mid,
      step.queries,
      step.stage
    ),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#b91c1c',
      },
      {
        label: '整体分流机制',
        value: '单次中点判断批量拆分 Q_left 与 Q_right',
        color: '#059669',
      },
    ],
    formula: {
      title: '整体二分核心机制',
      equation: '二分值域 [l, r] => 批量执行 [l, mid] => 询问集合划分为 Q_left 与 Q_right',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
