import { FractionalStep } from './fractional-programming-step-compiler';
import { renderFractionalVisual } from '../../../algorithms/categories/advanced-topics/advanced-134-140/advanced-134-140-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderFractionalProgrammingCanvas(container: HTMLElement, step: FractionalStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderFractionalVisual(step.a, step.b, step.mid, step.transformed, step.totalGain)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前二分区间</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">[${step.l.toFixed(3)}, ${step.r.toFixed(3)}]</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">测试目标比率 mid</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.mid.toFixed(4)}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">最终最大性价比</div>
          <div style="font-size: 18px; font-weight: 700; color: #d97706;">${step.finalAns !== undefined ? step.finalAns.toFixed(4) : '二分逼近中'}</div>
        </div>
      </div>

      ${renderFormulaCard(
        'Dinkelbach 二分判定状态',
        `当前测试比率: ${step.mid.toFixed(4)} | 综合增益: ${step.totalGain.toFixed(4)} (${step.isFeasible ? '可达' : '过高'})`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
