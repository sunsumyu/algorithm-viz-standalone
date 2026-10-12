import { GaussianStep } from './gaussian-elimination-step-compiler';
import { renderGaussianMatrix } from '../../../algorithms/categories/advanced-topics/advanced-124-134/advanced-124-134-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderGaussianEliminationCanvas(container: HTMLElement, step: GaussianStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderGaussianMatrix(step.matrix, step.n, step.curCol, step.activeRow, step.solution)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前主元处理列</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">${step.curCol >= 0 ? `第 ${step.curCol} 列` : '回代阶段'}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前操作活跃行</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.activeRow >= 0 ? `r${step.activeRow}` : '-'}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前解向量 x</div>
          <div style="font-size: 14px; font-weight: 700; color: #d97706;">
            ${step.solution ? step.solution.map((v, i) => `x${i}=${v.toFixed(2)}`).join(', ') : '消元中'}
          </div>
        </div>
      </div>

      ${renderFormulaCard(
        '高斯消元算法推进',
        `当前状态: ${step.curCol >= 0 ? `消元列 ${step.curCol}` : '回代完成'} | 矩阵规模: ${step.n} x ${step.n + 1}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

