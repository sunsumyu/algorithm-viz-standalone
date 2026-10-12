import { XorGaussianStep } from './xor-gaussian-step-compiler';
import { renderXorMatrix } from '../../../algorithms/categories/advanced-topics/advanced-134-140/advanced-134-140-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderXorGaussianCanvas(container: HTMLElement, step: XorGaussianStep): void {
  composeUnifiedCanvas(container, {
    metrics: [
      {
        label: '当前消元列',
        value: step.curCol >= 0 ? `第 ${step.curCol} 列` : '消元完成',
        color: '#4338ca',
      },
      {
        label: '操作活跃行',
        value: step.activeRow >= 0 ? `E${step.activeRow}` : '-',
        color: '#059669',
      },
      {
        label: '当前解向量 x',
        value: step.solution ? step.solution.map((v, i) => `x${i}=${v}`).join(', ') : '消元中',
        color: '#d97706',
      },
    ],
    mainBoardHtml: renderXorMatrix(step.matrix, step.n, step.curCol, step.activeRow, step.solution),
    formula: {
      title: '异或高斯消元推进引擎',
      equation: `当前状态: ${step.curCol >= 0 ? `主元列 ${step.curCol}` : '回代结束'} | GF(2) 异或运算规则: 1 ^ 1 = 0, 1 ^ 0 = 1`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
