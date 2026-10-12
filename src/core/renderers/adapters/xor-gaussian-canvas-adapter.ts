import { XorGaussianStep } from './xor-gaussian-step-compiler';
import { renderXorMatrix } from '../../../algorithms/categories/advanced-topics/advanced-134-140/advanced-134-140-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderXorGaussianCanvas(container: HTMLElement, step: XorGaussianStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderXorMatrix(step.matrix, step.n, step.curCol, step.activeRow, step.solution)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前消元列</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">${step.curCol >= 0 ? `第 ${step.curCol} 列` : '消元完成'}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">操作活跃行</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.activeRow >= 0 ? `E${step.activeRow}` : '-'}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前解向量 x</div>
          <div style="font-size: 14px; font-weight: 700; color: #d97706;">
            ${step.solution ? step.solution.map((v, i) => `x${i}=${v}`).join(', ') : '消元中'}
          </div>
        </div>
      </div>

      ${renderFormulaCard(
        '异或高斯消元推进引擎',
        `当前状态: ${step.curCol >= 0 ? `主元列 ${step.curCol}` : '回代结束'} | GF(2) 异或运算规则: 1 ^ 1 = 0, 1 ^ 0 = 1`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
