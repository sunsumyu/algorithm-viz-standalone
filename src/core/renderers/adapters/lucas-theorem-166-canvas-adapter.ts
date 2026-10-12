/**
 * Class 166: 卢卡斯定理 (Lucas Theorem) 领域视觉适配器
 * 核心：p 进制数位分解展板、数位分治机制卡与核心公式卡
 */

import { LucasStep } from './lucas-theorem-166-step-compiler';
import { renderLucasBoard } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderLucasTheorem166Canvas(container: HTMLElement, step: LucasStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderLucasBoard(step.n, step.m, step.p, step.digits, step.ans, step.stage)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #b91c1c;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">数位分治机制</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">p 进制数位独立乘积</div>
        </div>
      </div>

      ${renderFormulaCard(
        '卢卡斯定理核心公式',
        `C(n, m) &equiv; C(&lfloor;n/p&rfloor;, &lfloor;m/p&rfloor;) &times; C(n mod p, m mod p) (mod p) | &prod; C(n_i, m_i) mod p | 复杂度: O(p + log_p n)`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
