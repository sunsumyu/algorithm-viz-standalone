import { GaussianStep } from './gaussian-elimination-step-compiler';
import { renderGaussianMatrix } from '../../../algorithms/categories/advanced-topics/advanced-124-134/advanced-124-134-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderGaussianEliminationCanvas(container: HTMLElement, step: GaussianStep): void {
  composeUnifiedCanvas(container, {
    metrics: [
      {
        label: '当前主元处理列',
        value: step.curCol >= 0 ? `第 ${step.curCol} 列` : '回代阶段',
        color: '#4338ca',
      },
      {
        label: '当前操作活跃行',
        value: step.activeRow >= 0 ? `r${step.activeRow}` : '-',
        color: '#059669',
      },
      {
        label: '当前解向量 x',
        value: step.solution ? step.solution.map((v, i) => `x${i}=${v.toFixed(2)}`).join(', ') : '消元中',
        color: '#d97706',
      },
    ],
    mainBoardHtml: renderGaussianMatrix(step.matrix, step.n, step.curCol, step.activeRow, step.solution),
    formula: {
      title: '高斯消元算法推进',
      equation: `当前状态: ${step.curCol >= 0 ? `消元列 ${step.curCol}` : '回代完成'} | 矩阵规模: ${step.n} x ${step.n + 1}`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
