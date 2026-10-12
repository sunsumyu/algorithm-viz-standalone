import { renderVertexBCCBoard } from '../../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { VertexBCCStep } from './vertex-biconnected-components-190-step-compiler';

export function renderVertexBCCCanvas(container: HTMLElement, step: VertexBCCStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderVertexBCCBoard(
        step.nodes,
        step.cutVertices,
        step.vbccs,
        step.stage
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #b45309;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">点双特殊性质</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">一个割点可属于多个点双</div>
        </div>
      </div>

      ${renderFormulaCard(
        '割点判定准则',
        '非根节点: 存在子树 low[v] >= dfn[u] <=> u 为割点 | 根节点: 子树分支 >= 2 <=> 根为割点',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
