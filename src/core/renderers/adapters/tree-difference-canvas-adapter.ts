/**
 * Class 122: 树上差分 (Tree Difference - 点差分) 领域视觉适配器
 * 负责树形拓扑结构、节点差分状态与前缀和点权的渲染呈现
 */

import { TreeDiffStep } from './tree-difference-step-compiler';
import { renderTreeTopology } from '../../../algorithms/categories/tree/tree-117-123/tree-117-123-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderTreeDiffCanvas(container: HTMLElement, step: TreeDiffStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderTreeTopology(step.nodes, step.edges, step.activeNodeId, step.highlightNodes || [])}

      <div style="margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
        <div style="font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 8px;">
          ${step.stage === 'done' ? '📊 各节点最终路径覆盖点权 (子树前缀和)' : '📝 当前各节点点差分标记 diff[i]'}
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${step.nodes.map(node => `
            <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; font-size: 11px;">
              <span style="font-weight: 700; color: #1e293b;">#${node.id}</span>: 
              <span style="color: ${step.stage === 'done' ? '#059669' : '#6366f1'}; font-weight: 700;">
                ${step.stage === 'done' ? step.ansMap[node.id] : step.diffMap[node.id]}
              </span>
            </div>
          `).join('')}
        </div>
      </div>

      ${renderFormulaCard(
        '树上差分点权计算',
        `当前路径: ${step.curPath ? `(${step.curPath[0]} -> ${step.curPath[1]})` : '无'} | LCA: #${step.curLca || '-'}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
