/**
 * Class 165: 莫比乌斯反演 (Möbius Inversion) 领域视觉适配器
 * 核心：数论分块表格与互质统计展板、当前算法阶段卡、加速幅度卡与反演求和引擎卡
 */

import { MobiusStep } from './mobius-inversion-step-compiler';
import { renderMobiusBoard } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderMobiusInversionCanvas(container: HTMLElement, step: MobiusStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderMobiusBoard(step.n, step.m, step.blocks, step.currentSum, step.stage)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #0369a1;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">算法加速幅度</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">O(N&middot;M) -&gt; O(&radic;N + &radic;M)</div>
        </div>
      </div>

      ${renderFormulaCard(
        '莫比乌斯反演互质双曲求和引擎',
        `核心性质: &sum;_{d|n} &mu;(d) = [n=1] | 双元整除分块: r = min(&lfloor;n/&lfloor;n/l&rfloor;&rfloor;, &lfloor;m/&lfloor;m/l&rfloor;&rfloor;) | 单次询问复杂度: O(&radic;N + &radic;M)`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
