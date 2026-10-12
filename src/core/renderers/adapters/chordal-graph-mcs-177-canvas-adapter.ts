import { renderChordalMCSBoard } from '../../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { ChordalMCSStep } from './chordal-graph-mcs-177-step-compiler';

export function renderChordalMCSCanvas(container: HTMLElement, step: ChordalMCSStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderChordalMCSBoard(step.nodes, step.peo, step.deg, step.activePick, step.stage)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #6d28d9;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">完美图性质</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">最大团 = 团数 = 色数</div>
        </div>
      </div>

      ${renderFormulaCard(
        '弦图与 PEO 完美消除序列定理',
        `PEO 准则: &forall; v_i，其在序列后继中相连邻居诱导子图为团 (完全图) | 最大团 &omega;(G) = 色数 &chi;(G) | MCS 复杂度: O(N + M)`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
