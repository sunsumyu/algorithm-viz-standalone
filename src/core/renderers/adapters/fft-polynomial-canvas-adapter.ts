/**
 * Class 160: 快速傅里叶变换 (FFT / Fast Fourier Transform) 领域视觉适配器
 * 核心：多项式系数与卷积结果沙盘、当前算法阶段卡、卷积加速比率卡与蝶形分治信号流引擎卡
 */

import { FFTStep } from './fft-polynomial-step-compiler';
import { renderFFTBoard } from '../../../algorithms/categories/advanced-topics/advanced-155-160/advanced-155-160-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderFFTPolynomialCanvas(container: HTMLElement, step: FFTStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderFFTBoard(step.polyA, step.polyB, step.convResult, step.stage),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#4338ca',
      },
      {
        label: '卷积加速比率',
        value: 'O(N^2) -> O(N log N)',
        color: '#059669',
      },
    ],
    formula: {
      title: 'FFT 蝶形分治信号流引擎',
      equation: '单位根折半引理: \u03C9_{2n}^{2k} = \u03C9_n^k | 蝶形运算: A(x) = A_1(x^2) + x A_2(x^2) | 卷积 = IDFT(DFT(A) \u00D7 DFT(B))',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
