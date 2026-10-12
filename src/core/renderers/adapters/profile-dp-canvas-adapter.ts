import { ProfileDpStep } from './profile-dp-step-compiler';
import { renderProfileGrid } from '../../../algorithms/categories/advanced-topics/advanced-124-134/advanced-124-134-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderProfileDpCanvas(container: HTMLElement, step: ProfileDpStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderProfileGrid(step.n, step.m, step.curR, step.curC, step.activeMask, step.finalAns !== undefined ? step.finalAns : step.validStatesCount)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前单元格坐标</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">(${step.curR}, ${step.curC})</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前有效轮廓数</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.validStatesCount}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">最终铺满方案数</div>
          <div style="font-size: 18px; font-weight: 700; color: #d97706;">${step.finalAns !== undefined ? step.finalAns : '计算中'}</div>
        </div>
      </div>

      ${renderFormulaCard(
        '轮廓线 DP 转移引擎',
        `当前状态掩码: ${step.activeMask.toString(2).padStart(step.m, '0')} ${step.finalAns !== undefined ? `| 最终铺满总方案 = ${step.finalAns}` : ''}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

