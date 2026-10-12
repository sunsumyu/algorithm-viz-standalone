import { LinearBasisStep } from './linear-basis-136-step-compiler';
import { renderLinearBasisVisual } from '../../../algorithms/categories/advanced-topics/advanced-134-140/advanced-134-140-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderLinearBasis136Canvas(container: HTMLElement, step: LinearBasisStep): void {
  composeUnifiedCanvas(container, {
    metrics: [
      {
        label: '当前被考查数值',
        value: step.curNum > 0 ? `${step.curNum} (0b${step.curNum.toString(2)})` : '查询阶段',
        color: '#4338ca',
      },
      {
        label: '已构建基向量总数',
        value: `${step.insertedCount} 个基底`,
        color: '#059669',
      },
      {
        label: '当前最大异或和',
        value: step.maxXor,
        color: '#d97706',
      },
    ],
    mainBoardHtml: renderLinearBasisVisual(step.basis, step.curBit, step.curNum, step.maxXor),
    formula: {
      title: '线性基操作日志',
      equation: `当前探测二进制位: ${step.curBit >= 0 ? `第 ${step.curBit} 位` : '无'} ${step.finalAns !== undefined ? `| 最终最大异或和 = ${step.finalAns}` : ''}`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
