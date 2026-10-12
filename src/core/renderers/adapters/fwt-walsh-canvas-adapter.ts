/**
 * Class 163: 快速沃尔什变换 (FWT / Fast Walsh-Hadamard Transform) 领域视觉适配器
 * 核心：位运算卷积展板、当前阶段卡、卷积类型卡与基变换法则公式卡
 */

import { FWTStep } from './fwt-walsh-step-compiler';
import { renderFWTBoard } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderFWTWalshCanvas(container: HTMLElement, step: FWTStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderFWTBoard(step.arrA, step.arrB, step.res, step.opType, step.stage)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #15803d;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">卷积类型</div>
          <div style="font-size: 16px; font-weight: 700; color: #0284c7;">${step.opType} 卷积</div>
        </div>
      </div>

      ${renderFormulaCard(
        'FWT 快速沃尔什变换基变换法则',
        `OR: (A_0, A_0 + A_1) | AND: (A_0 + A_1, A_1) | XOR: (A_0 + A_1, A_0 - A_1) | 逆变换: 乘逆矩阵还原`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
