/**
 * Class 160: 快速傅里叶变换 (FFT / Fast Fourier Transform) 领域视觉适配器
 * 核心：多项式系数与卷积结果沙盘、当前算法阶段卡、卷积加速比率卡与蝶形分治信号流引擎卡
 */

import { FFTStep } from './fft-polynomial-step-compiler';
import { renderFFTBoard } from '../../../algorithms/categories/advanced-topics/advanced-155-160/advanced-155-160-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderFFTPolynomialCanvas(container: HTMLElement, step: FFTStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderFFTBoard(step.polyA, step.polyB, step.convResult, step.stage)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">卷积加速比率</div>
          <div style="font-size: 16px; font-weight: 700; color: #059669;">O(N^2) -&gt; O(N log N)</div>
        </div>
      </div>

      ${renderFormulaCard(
        'FFT 蝶形分治信号流引擎',
        `单位根折半引理: &omega;_{2n}^{2k} = &omega;_n^k | 蝶形运算: A(x) = A_1(x^2) + x A_2(x^2) | 卷积 = IDFT(DFT(A) &times; DFT(B))`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
