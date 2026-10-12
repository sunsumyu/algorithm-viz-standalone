import { renderKMBoard } from '../../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { KMStep } from './km-matching-176-step-compiler';

export function renderKMCanvas(container: HTMLElement, step: KMStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderKMBoard(step.n, step.w, step.lx, step.ly, step.matchRight, step.totalWeight, step.stage)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #be185d;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">线性规划对偶</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">&sum; W = &sum; Lx + &sum; Ly</div>
        </div>
      </div>

      ${renderFormulaCard(
        'KM 算法顶标理论与相等子图',
        `可行顶标: Lx[i] + Ly[j] &ge; W[i][j] | 相等边: Lx[i] + Ly[j] = W[i][j] | 松弛量调整: &Delta; = min(Lx + Ly - W), Lx -= &Delta;, Ly += &Delta;`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
