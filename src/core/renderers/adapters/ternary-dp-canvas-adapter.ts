import { TernaryDpStep } from './ternary-dp-step-compiler';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderTernaryDpCanvas(container: HTMLElement, step: TernaryDpStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      <div style="margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
        <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px;">
          🔺 三进制状态活跃样本池 (0:自由, 1:受覆, 2:已放)
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${step.topStates.map(item => `
            <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; font-size: 11px;">
              <span style="font-weight: 700; color: #6366f1;">#${item.state} (${item.ternaryStr}_3)</span>: 
              <span style="color: #059669; font-weight: 700;">+${item.val} 装置</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前推进到行</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">第 ${step.curRow} 行</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">有效合法状态总数</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.validStateCount} / ${step.totalStates}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前最大放置装置数</div>
          <div style="font-size: 18px; font-weight: 700; color: #d97706;">${step.bestAns}</div>
        </div>
      </div>

      ${renderFormulaCard(
        '三进制状态转移',
        `当前最优解: ${step.bestAns} | 状态衰减法则: digit = max(0, digit - 1)`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

