import { renderParallelBSBoard } from '../../../algorithms/categories/advanced-topics/advanced-179-184/advanced-179-184-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { ParallelBSStep } from './parallel-binary-search-184-step-compiler';

export function renderParallelBSCanvas(container: HTMLElement, step: ParallelBSStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderParallelBSBoard(
        step.l,
        step.r,
        step.mid,
        step.queries,
        step.stage
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #b91c1c;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">整体分流机制</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">单次中点判断批量拆分 Q_left 与 Q_right</div>
        </div>
      </div>

      ${renderFormulaCard(
        '整体二分核心机制',
        '二分值域 [l, r] => 批量执行 [l, mid] => 询问集合划分为 Q_left 与 Q_right',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
