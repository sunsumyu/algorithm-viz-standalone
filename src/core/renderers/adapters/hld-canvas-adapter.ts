/**
 * Class 121: 树链剖分 / 重链剖分 (Heavy-Light Decomposition, HLD) 领域视觉适配器
 * 负责重链与轻边拓扑结构、重儿子/top/dfn 分配表及状态呈现
 */

import { HldStep } from './hld-step-compiler';
import { renderTreeTopology } from '../../../algorithms/categories/tree/tree-117-123/tree-117-123-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderHldCanvas(container: HTMLElement, step: HldStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderTreeTopology(step.nodes, step.edges, step.activeNodeId, step.highlightNodes || [])}

      <div style="margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
        <div style="font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 8px;">⛓️ 重儿子与重链顶端分配表</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${step.nodes.map(node => `
            <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; font-size: 11px;">
              <span style="font-weight: 700; color: #1e293b;">#${node.id}</span>: 
              <span style="color: #6366f1;">重儿:${step.heavyChildMap[node.id] ? `#${step.heavyChildMap[node.id]}` : '无'}</span> | 
              <span style="color: #059669;">top:${step.topMap[node.id] ? `#${step.topMap[node.id]}` : '-'}</span> | 
              <span style="color: #d97706;">dfn:${step.dfnMap[node.id] ?? '-'}</span>
            </div>
          `).join('')}
        </div>
      </div>

      ${renderFormulaCard(
        '重链剖分状态',
        `当前节点: #${step.activeNodeId} | 已识别重边: ${step.heavyEdges.map(([u, v]) => `${u}->${v}`).join(', ') || '暂无'}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
