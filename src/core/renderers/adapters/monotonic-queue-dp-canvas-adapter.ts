import { MonotonicQueueDpStep } from './monotonic-queue-dp-step-compiler';
import { renderMonotonicQueueVisual } from '../../../algorithms/categories/advanced-topics/advanced-124-134/advanced-124-134-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderMonotonicQueueDpCanvas(container: HTMLElement, step: MonotonicQueueDpStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderMonotonicQueueVisual(step.val, step.dp, step.curI, step.q, step.L, step.R)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前推进到位置</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">i = ${step.curI}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前队头最优决策</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.q.length > 0 ? `j=${step.q[0]} (dp=${step.dp[step.q[0]]})` : '暂无'}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">终点最大收益</div>
          <div style="font-size: 18px; font-weight: 700; color: #d97706;">${step.bestAns !== undefined ? step.bestAns : step.dp[step.curI]}</div>
        </div>
      </div>

      ${renderFormulaCard(
        '单调队列决策排除状态',
        `当前队列: [${step.q.join(', ')}] | 窗口 [i-${step.R}, i-${step.L}]`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
