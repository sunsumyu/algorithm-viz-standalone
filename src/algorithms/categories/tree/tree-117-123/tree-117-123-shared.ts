/**
 * 左神算法通关课 Class 117 ~ 123 倍增与树上高阶问题专题共享沙盘组件
 * 提供 ST 表二阶矩阵、树拓扑节点深度与重链高亮渲染组件
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Tree117Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  activeNode?: number;
  highlightNodes?: number[];
  highlightEdges?: [number, number][];
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export interface TreeNodeData {
  id: number;
  depth: number;
  parent: number;
  size?: number;
  heavyChild?: number;
  top?: number;
  dfn?: number;
  val?: number;
}

/**
 * 渲染 ST 表 (Sparse Table) 二维倍增矩阵
 */
export function renderSparseTableVisual(
  nums: number[],
  st: number[][],
  activeI: number = -1,
  activeJ: number = -1,
  coverRange1?: [number, number],
  coverRange2?: [number, number]
): string {
  const n = nums.length;
  const maxK = st.length > 0 ? st[0].length : 0;

  return `
    <div style="margin-bottom: 16px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
        <span>📊 ST 表倍增矩阵 (ST[i][j] 代表从 i 开始长度为 2^j 的最值)</span>
        <span style="font-size: 11px; color: #64748b;">N=${n}, maxK=${maxK - 1}</span>
      </div>

      <div style="overflow-x: auto; scrollbar-width: thin; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px;">
        <table style="border-collapse: collapse; width: 100%; text-align: center; font-family: monospace; font-size: 12px;">
          <thead>
            <tr style="border-bottom: 2px solid #e2e8f0; background: #f8fafc;">
              <th style="padding: 6px; color: #64748b;">起始 i</th>
              <th style="padding: 6px; color: #64748b;">数值</th>
              ${Array.from({ length: maxK }).map((_, j) => `
                <th style="padding: 6px; color: ${j === activeJ ? '#6366f1' : '#64748b'}; font-weight: 700;">
                  2^${j} (跨${1 << j})
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${nums.map((val, i) => `
              <tr style="border-bottom: 1px solid #f1f5f9; background: ${i === activeI ? '#eff6ff' : 'transparent'};">
                <td style="padding: 4px; font-weight: 700; color: #64748b;">${i}</td>
                <td style="padding: 4px; font-weight: 700; color: #1e293b;">${val}</td>
                ${Array.from({ length: maxK }).map((_, j) => {
                  const isCur = i === activeI && j === activeJ;
                  const v = st[i]?.[j] ?? '-';
                  return `
                    <td style="padding: 4px; font-weight: ${isCur ? '700' : 'normal'}; color: ${isCur ? '#ffffff' : '#334155'}; background: ${isCur ? '#6366f1' : 'transparent'}; border-radius: ${isCur ? '4px' : '0'};">
                      ${v}
                    </td>
                  `;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * 渲染树结构节点图表 (支持重链与 LCA 标识)
 */
export function renderTreeTopology(
  nodes: TreeNodeData[],
  edges: [number, number][],
  activeNodeId: number = -1,
  highlightNodes: number[] = [],
  heavyEdges: [number, number][] = []
): string {
  // 按深度分组节点
  const depthGroups = new Map<number, TreeNodeData[]>();
  for (const n of nodes) {
    if (!depthGroups.has(n.depth)) depthGroups.set(n.depth, []);
    depthGroups.get(n.depth)!.push(n);
  }
  const maxDepth = Math.max(...nodes.map(n => n.depth), 0);

  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🌳 树形层级拓扑沙盘 (共 ${nodes.length} 个节点)</span>
        <span style="font-size: 11px; color: #64748b;">最大深度: ${maxDepth}</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 14px; align-items: center;">
        ${Array.from({ length: maxDepth + 1 }).map((_, d) => {
          const group = depthGroups.get(d) || [];
          return `
            <div style="display: flex; align-items: center; gap: 16px;">
              <span style="font-size: 10px; color: #94a3b8; font-family: monospace; width: 44px; text-align: right;">深度 ${d}:</span>
              <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
                ${group.map((node) => {
                  const isCur = node.id === activeNodeId;
                  const isHl = highlightNodes.includes(node.id);
                  let bg = '#ffffff';
                  let border = '#cbd5e1';
                  let color = '#1e293b';

                  if (isCur) {
                    bg = '#e0e7ff';
                    border = '#6366f1';
                    color = '#3730a3';
                  } else if (isHl) {
                    bg = '#dcfce7';
                    border = '#22c55e';
                    color = '#15803d';
                  }

                  return `
                    <div style="display: flex; flex-direction: column; align-items: center;">
                      <div style="width: 44px; height: 44px; border-radius: 50%; background: ${bg}; border: 2px solid ${border}; color: ${color}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; box-shadow: ${isCur ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none'};">
                        <span>#${node.id}</span>
                        ${node.val !== undefined ? `<span style="font-size: 9px; color: #64748b;">v:${node.val}</span>` : ''}
                      </div>
                      ${node.size !== undefined ? `<span style="font-size: 9px; color: #64748b; margin-top: 2px;">sz:${node.size}</span>` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
