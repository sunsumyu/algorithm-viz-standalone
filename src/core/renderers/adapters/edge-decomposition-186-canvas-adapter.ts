import { renderEdgeDecompBoard } from '../../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { EdgeDecompStep } from './edge-decomposition-186-step-compiler';

export function renderEdgeDecompCanvas(container: HTMLElement, step: EdgeDecompStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderEdgeDecompBoard(
        step.nodes,
        step.edges,
        step.activeEdgeId,
        step.blockA,
        step.blockB,
        step.stage
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #b45309;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">分治二叉特性</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">左右严格二等分，便于凸包合并</div>
        </div>
      </div>

      ${renderFormulaCard(
        '边分治重心边选择准则',
        'min_{e = (u, v)} |sz[u] - sz[v]| <= max(sz[u], sz[v]) <= ceil(2N / 3)',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
