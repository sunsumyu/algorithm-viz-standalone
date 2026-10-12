import { renderPolySqrtBoard } from '../../../algorithms/categories/advanced-topics/advanced-167-172/advanced-167-172-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { PolySqrtStep } from './polynomial-sqrt-step-compiler';

export function renderPolySqrtCanvas(container: HTMLElement, step: PolySqrtStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderPolySqrtBoard(step.polyA, step.polyB, step.targetDeg, step.currDeg, step.stage)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #047857;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">迭代收敛比</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">B &equiv; B<sub>0</sub>/2 + A/(2B<sub>0</sub>)</div>
        </div>
      </div>

      ${renderFormulaCard(
        '多项式牛顿倍增开方引擎',
        `牛顿迭代公式: B(x) &equiv; (B_0^2(x) + A(x)) / (2 B_0(x)) (mod x^n) | 边界: b_0 = &radic;a_0 | 复杂度: O(n log n)`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
