/**
 * 0-1 分数规划 (0-1 Fractional Programming) 领域视觉适配器
 * 核心：性价比指标沙盘、二分区间卡、目标比率卡与 Dinkelbach 判定卡
 */

import { FractionalStep } from './fractional-programming-step-compiler';
import { renderFractionalVisual } from '../../../algorithms/categories/advanced-topics/advanced-134-140/advanced-134-140-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderFractionalProgrammingCanvas(container: HTMLElement, step: FractionalStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderFractionalVisual(step.a, step.b, step.mid, step.transformed, step.totalGain),
    metrics: [
      {
        label: '当前二分区间',
        value: `[${step.l.toFixed(3)}, ${step.r.toFixed(3)}]`,
        color: '#4338ca',
      },
      {
        label: '测试目标比率 mid',
        value: step.mid.toFixed(4),
        color: '#059669',
      },
      {
        label: '最终最大性价比',
        value: step.finalAns !== undefined ? step.finalAns.toFixed(4) : '二分逼近中',
        color: '#d97706',
      },
    ],
    formula: {
      title: 'Dinkelbach 二分判定状态',
      equation: `当前测试比率: ${step.mid.toFixed(4)} | 综合增益: ${step.totalGain.toFixed(4)} (${step.isFeasible ? '可达' : '过高'})`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
