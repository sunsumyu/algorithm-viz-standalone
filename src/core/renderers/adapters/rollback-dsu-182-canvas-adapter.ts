import { renderRollbackDSUBoard } from '../../../algorithms/categories/advanced-topics/advanced-179-184/advanced-179-184-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { RollbackDSUStep } from './rollback-dsu-182-step-compiler';

export function renderRollbackDSUCanvas(container: HTMLElement, step: RollbackDSUStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderRollbackDSUBoard(
        step.nodes,
        step.parent,
        step.rank,
        step.history,
        step.stage
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #0284c7;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">回退复杂度</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">历史栈弹栈 O(1) 精确还原</div>
        </div>
      </div>

      ${renderFormulaCard(
        '按秩合并树高定理',
        'h <= floor(log_2 N) + 1 | 严禁使用路径压缩，撤销时直接弹栈赋值，单步代价 O(1)',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
