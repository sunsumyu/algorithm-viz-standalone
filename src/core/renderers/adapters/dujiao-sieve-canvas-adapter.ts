/**
 * Class 164: 杜教筛 (Dujiao Sieve) 领域视觉适配器
 * 核心：数论分块与前缀和沙盘、当前算法阶段卡、亚线性复杂度突破卡与狄利克雷卷积恒等式卡
 */

import { DujiaoStep } from './dujiao-sieve-step-compiler';
import { renderDujiaoBoard } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderDujiaoSieveCanvas(container: HTMLElement, step: DujiaoStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderDujiaoBoard(step.n, step.preLimit, step.blocks, step.memoCount, step.finalAns, step.stage)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #7e22ce;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">复杂度突破</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">O(N) -&gt; O(N<sup>2/3</sup>) 亚线性</div>
        </div>
      </div>

      ${renderFormulaCard(
        '杜教筛狄利克雷卷积恒等式',
        `恒等式: g(1) S(n) = &sum;_{i=1}^n (f * g)(i) - &sum;_{d=2}^n g(d) S(&lfloor;n/d&rfloor;) | &mu; * 1 = e &rArr; S_&mu;(n) = 1 - &sum;_{d=2}^n S_&mu;(&lfloor;n/d&rfloor;)`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
