/**
 * Class 162: 多项式求逆 (Polynomial Inverse) 领域视觉适配器
 * 核心：多项式系数与逆元展板、当前阶段卡、牛顿迭代二次收敛特性卡与倍增引擎卡
 */

import { PolyInvStep } from './polynomial-inverse-step-compiler';
import { renderPolyInvBoard } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderPolynomialInverseCanvas(container: HTMLElement, step: PolyInvStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderPolyInvBoard(step.polyA, step.polyB, step.targetDeg, step.currDeg, step.stage)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #b45309;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">牛顿迭代特性</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">二次收敛: 精度每轮翻倍</div>
        </div>
      </div>

      ${renderFormulaCard(
        '多项式牛顿迭代倍增引擎',
        `牛顿迭代公式: B(x) &equiv; B_0(x) &middot; (2 - A(x) &middot; B_0(x)) (mod x^n) | 边界: b_0 = a_0^{-1} mod P | 复杂度: T(n) = T(n/2) + O(n log n) = O(n log n)`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
