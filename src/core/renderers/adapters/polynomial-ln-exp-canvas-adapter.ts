import { renderPolyLnExpBoard } from '../../../algorithms/categories/advanced-topics/advanced-167-172/advanced-167-172-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { PolyLnExpStep } from './polynomial-ln-exp-step-compiler';

export function renderPolyLnExpCanvas(container: HTMLElement, step: PolyLnExpStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderPolyLnExpBoard(step.polyA, step.polyLn, step.polyExp, step.stage)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #1d4ed8;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">代数理论深度</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">EGF 指数型生成函数</div>
        </div>
      </div>

      ${renderFormulaCard(
        '多项式 ln / exp 微积分与牛顿迭代引擎',
        `ln A(x) = &int; (A'(x) / A(x)) dx | exp: B &equiv; B_0(1 - ln B_0 + A) (mod x^n) | 复杂度: O(n log n)`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
