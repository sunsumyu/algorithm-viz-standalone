/**
 * Class 118: 树上倍增求最近公共祖先 (LCA) 领域视觉适配器
 * 负责树形拓扑结构呈现、双指针深度二进制跳跃与 LCA 结果卡片展示
 */

import { TreeLcaStep } from './tree-lca-step-compiler';
import { renderTreeTopology } from '../../../algorithms/categories/tree/tree-117-123/tree-117-123-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderTreeLcaCanvas(container: HTMLElement, step: TreeLcaStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderTreeTopology(step.nodes, step.edges, -1, step.highlightNodes || [])}

      ${renderFormulaCard(
        'LCA 倍增搜索进度',
        `目标点: #${step.u} 与 #${step.v} | 当前游标: u=#${step.curU}, v=#${step.curV} ${step.lcaResult ? `| 最终 LCA = #${step.lcaResult}` : ''}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
