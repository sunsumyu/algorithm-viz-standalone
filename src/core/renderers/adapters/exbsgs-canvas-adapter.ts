import { renderEXBSGSBoard } from '../../../algorithms/categories/advanced-topics/advanced-167-172/advanced-167-172-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { EXBSGSStep } from './exbsgs-step-compiler';

export function renderEXBSGSCanvas(container: HTMLElement, step: EXBSGSStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderEXBSGSBoard(
        step.a,
        step.b,
        step.p,
        step.reducedA,
        step.reducedB,
        step.reducedP,
        step.d,
        step.cnt,
        step.ans,
        step.stage
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #0369a1;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">公因子降模</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">累计剥离 ${step.cnt} 次因子</div>
        </div>
      </div>

      ${renderFormulaCard(
        'EXBSGS 降模核心方程',
        `提取公因子: g = gcd(a, p) > 1 | 转化方程: d &middot; a^{x-cnt} &equiv; b' (mod p') | 互质后标准 BSGS: m = &lceil;&radic;p'&rceil;`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
