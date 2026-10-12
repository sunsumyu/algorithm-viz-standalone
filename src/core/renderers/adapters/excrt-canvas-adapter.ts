import { renderEXCRTBoard } from '../../../algorithms/categories/advanced-topics/advanced-167-172/advanced-167-172-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { EXCRTStep } from './excrt-step-compiler';

export function renderEXCRTCanvas(container: HTMLElement, step: EXCRTStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderEXCRTBoard(step.equations, step.mergedCount, step.currM, step.currR, step.stage)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #b45309;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">算法泛化能力</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">不要求模数互质 (真超集)</div>
        </div>
      </div>

      ${renderFormulaCard(
        'EXCRT 双方程合并方程',
        `合并方程: M &middot; t &equiv; r_k - R (mod m_k) | 可解判定: (r_k - R) mod gcd(M, m_k) == 0 | 模数更新: M' = lcm(M, m_k) = M / gcd * m_k`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
