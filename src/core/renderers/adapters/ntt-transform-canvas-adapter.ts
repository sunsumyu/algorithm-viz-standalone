/**
 * Class 161: 快速数论变换 (NTT / Number Theoretic Transform) 领域视觉适配器
 * 核心：模 998244353 多项式系数沙盘、当前算法阶段卡、模域特性卡与原根蝶形引擎卡
 */

import { NTTStep } from './ntt-transform-step-compiler';
import { renderNTTBoard } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderNTTTransformCanvas(container: HTMLElement, step: NTTStep): void {
  let limit = 1;
  while (limit < step.polyA.length + step.polyB.length - 1) limit <<= 1;

  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderNTTBoard(step.polyA, step.polyB, step.convResult, step.stage, limit)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #4338ca;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">模域特性</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">100% 整数无精度截断</div>
        </div>
      </div>

      ${renderFormulaCard(
        'NTT 原根同构蝶形引擎',
        `单位根替换: &omega;_n &equiv; g^{(P-1)/n} (mod P) | 模数 P = 998244353, g = 3 | 蝶形递推: A(x) = A_even(x^2) + x &middot; A_odd(x^2)`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
