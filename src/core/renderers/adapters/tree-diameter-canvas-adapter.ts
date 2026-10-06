/**
 * Class 123: 树的直径 (Tree Diameter - 两遍 BFS/DFS) 领域视觉适配器
 * 负责两遍 BFS 搜索扩展、端点定位与直径路径高亮呈现
 */

import { TreeDiameterStep } from './tree-diameter-step-compiler';
import { renderTreeTopology } from '../../../algorithms/categories/tree/tree-117-123/tree-117-123-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderTreeDiameterCanvas(container: HTMLElement, step: TreeDiameterStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderTreeTopology(step.nodes, step.edges, step.activeNodeId, step.highlightNodes || [])}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">第一遍最远点 x</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">#${step.farthestX ?? '-'}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">第二遍最远点 y</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669;">#${step.farthestY ?? '-'}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">树的直径长度</div>
          <div style="font-size: 18px; font-weight: 700; color: #d97706;">${step.diameter ?? '-'}</div>
        </div>
      </div>

      ${renderFormulaCard(
        '树的直径两遍 BFS 进度',
        `当前 BFS 阶段: 第 ${step.bfsRound} 遍 | 距离起点最大: ${Math.max(...Object.values(step.distMap), 0)} ${step.diameterPath ? `| 直径路径: [${step.diameterPath.join(' -> ')}]` : ''}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
