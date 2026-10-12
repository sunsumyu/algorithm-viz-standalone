/**
 * Class 163: 快速沃尔什变换 (FWT / Fast Walsh-Hadamard Transform) 领域视觉适配器
 * 核心：位运算卷积展板、当前阶段卡、卷积类型卡与基变换法则公式卡
 */

import { FWTStep } from './fwt-walsh-step-compiler';
import { renderFWTBoard } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderFWTWalshCanvas(container: HTMLElement, step: FWTStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderFWTBoard(step.arrA, step.arrB, step.res, step.opType, step.stage),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#15803d',
      },
      {
        label: '卷积类型',
        value: `${step.opType} 卷积`,
        color: '#0284c7',
      },
    ],
    formula: {
      title: 'FWT 快速沃尔什变换基变换法则',
      equation: 'OR: (A_0, A_0 + A_1) | AND: (A_0 + A_1, A_1) | XOR: (A_0 + A_1, A_0 - A_1) | 逆变换: 乘逆矩阵还原',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
