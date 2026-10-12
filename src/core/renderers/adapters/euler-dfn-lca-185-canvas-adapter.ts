import { renderEulerDfnBoard } from '../../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { EulerDfnStep } from './euler-dfn-lca-185-step-compiler';

export function renderEulerDfnCanvas(container: HTMLElement, step: EulerDfnStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderEulerDfnBoard(
        step.nodes,
        step.eulerTour,
        step.firstPos,
        step.u,
        step.v,
        step.lca,
        step.stage
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #0284c7;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">单次查询耗时</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">严格 O(1) 常数时间</div>
        </div>
      </div>

      ${renderFormulaCard(
        '欧拉序 RMQ LCA 核心映射',
        'LCA(u, v) = argmin_{i in [pos[u], pos[v]]} dep[euler[i]]',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
