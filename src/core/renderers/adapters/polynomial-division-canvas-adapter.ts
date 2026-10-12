import { renderPolyDivBoard } from '../../../algorithms/categories/advanced-topics/advanced-167-172/advanced-167-172-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { PolyDivStep } from './polynomial-division-step-compiler';

export function renderPolyDivCanvas(container: HTMLElement, step: PolyDivStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderPolyDivBoard(step.polyA, step.polyB, step.polyQ, step.polyR, step.stage)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #7e22ce;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">消除余式技巧</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">翻转系数 mod x<sup>n-m+1</sup></div>
        </div>
      </div>

      ${renderFormulaCard(
        '多项式除法翻转核心方程',
        `A(x) = Q(x) B(x) + R(x) &rArr; A^R(x) &equiv; Q^R(x) &middot; B^R(x) (mod x^{n-m+1}) | Q^R = A^R &middot; (B^R)^{-1} | R = A - Q &middot; B`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
