import { renderTarjanSCCBoard } from '../../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { TarjanSCCStep } from './tarjan-scc-condensation-188-step-compiler';

export function renderTarjanSCCCanvas(container: HTMLElement, step: TarjanSCCStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderTarjanSCCBoard(
        step.nodes,
        step.dfn,
        step.low,
        step.inStack,
        step.sccs,
        step.stage
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #be185d;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">缩点转化</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">有向有环图 => 有向无环图 (DAG)</div>
        </div>
      </div>

      ${renderFormulaCard(
        'Tarjan SCC 根判定准则',
        'dfn[u] == low[u] <=> u 为其所属极大强连通分量在搜索树上的最早根节点',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
