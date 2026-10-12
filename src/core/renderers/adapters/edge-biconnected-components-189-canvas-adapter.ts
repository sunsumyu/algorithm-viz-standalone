import { renderEdgeBCCBoard } from '../../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { EdgeBCCStep } from './edge-biconnected-components-189-step-compiler';

export function renderEdgeBCCCanvas(container: HTMLElement, step: EdgeBCCStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderEdgeBCCBoard(
        step.nodes,
        step.edges,
        step.ebccs,
        step.stage
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #1d4ed8;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">缩点拓扑性质</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">边双缩点后必然退化为树或森林</div>
        </div>
      </div>

      ${renderFormulaCard(
        '割边 (桥) 判定定理',
        'low[v] > dfn[u] <=> 无向边 (u, v) 为割边 (删除后图分裂为两个连通块)',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
