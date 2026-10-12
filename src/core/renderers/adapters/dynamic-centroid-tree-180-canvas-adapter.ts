import { renderDynamicCentroidBoard } from '../../../algorithms/categories/advanced-topics/advanced-179-184/advanced-179-184-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import { DynamicCentroidStep } from './dynamic-centroid-tree-180-step-compiler';

export function renderDynamicCentroidCanvas(container: HTMLElement, step: DynamicCentroidStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderDynamicCentroidBoard(
        step.nodes,
        step.ctParent,
        step.activeJumpPath,
        step.stage
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #15803d;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">点分树高限制</div>
          <div style="font-size: 15px; font-weight: 700; color: #0284c7;">至多 log N 层上跳</div>
        </div>
      </div>

      ${renderFormulaCard(
        '点分树容斥核心公式',
        'Ans = tree1[u].query(k) + sum ( tree1[fa].query(k - d) - tree2[cur].query(k - d) )',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
