import { renderEXLucasBoard } from '../../../algorithms/categories/advanced-topics/advanced-167-172/advanced-167-172-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { EXLucasStep } from './exlucas-step-compiler';

export function renderEXLucasCanvas(container: HTMLElement, step: EXLucasStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderEXLucasBoard(step.n, step.m, step.p, step.factors, step.ans, step.stage)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #991b1b;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">支持模数</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">任意正整数 (无需质数)</div>
        </div>
      </div>

      ${renderFormulaCard(
        'EXLucas 架构方程',
        `P = &prod; p_i^{k_i} | C(n, m) &equiv; a_i (mod p_i^{k_i}) | 剥离因子: cnt = &sum; &lfloor;n/p^k&rfloor; | CRT: x &equiv; &sum; a_i M_i inv(M_i) (mod P)`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
