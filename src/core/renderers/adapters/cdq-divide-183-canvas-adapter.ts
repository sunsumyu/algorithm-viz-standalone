/**
 * Class 183: CDQ 分治与多维偏序 (CDQ Divide and Conquer) 领域视觉适配器
 * 核心：三维点对区间归并沙盘、当前算法阶段指示卡、偏序降维技巧卡与降维定理公式卡
 */

import { renderCDQDivideBoard } from '../../../algorithms/categories/advanced-topics/advanced-179-184/advanced-179-184-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { CDQDivideStep } from './cdq-divide-183-step-compiler';

export function renderCDQDivideCanvas(container: HTMLElement, step: CDQDivideStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderCDQDivideBoard(
      step.points,
      step.l,
      step.r,
      step.mid,
      step.stage
    ),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#7e22ce',
      },
      {
        label: '偏序降维技巧',
        value: '第一维排序 + 归并第二维 + 树状数组第三维',
        color: '#059669',
      },
    ],
    formula: {
      title: '三维偏序 CDQ 降维法',
      equation: '第 1 维: 全局排序 => 第 2 维: 归并排序 => 第 3 维: 树状数组维护',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
