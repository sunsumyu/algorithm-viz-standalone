/**
 * 左神算法通关课 Class 185 ~ 190 共享沙盘与渲染助手
 * 提供：欧拉序/DFN序 LCA沙盘、边分治二叉重构沙盘、欧拉路径圈套圈沙盘、Tarjan SCC 缩点沙盘、边双连通割边沙盘、点双连通割点沙盘
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Advanced185Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

// ----------------------------------------------------
// 1. 欧拉序与 DFN 序求 LCA 沙盘
// ----------------------------------------------------
export function renderEulerDfnBoard(
  nodes: number[],
  eulerTour: number[],
  firstPos: Record<number, number>,
  u: number,
  v: number,
  lca: number,
  stage: string = 'RMQ 查询'
): string {
  const l = Math.min(firstPos[u] ?? 0, firstPos[v] ?? 0);
  const r = Math.max(firstPos[u] ?? 0, firstPos[v] ?? 0);

  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>📜 欧拉序 (Euler Tour) 与 ST 表 RMQ 检索沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #e0f2fe; color: #0284c7; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
        欧拉序列 (进入与回溯全程记录，长度 ${eulerTour.length})：
      </div>

      <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 12px;">
        ${eulerTour.map((node, idx) => {
          const inRange = idx >= l && idx <= r;
          const isLCA = node === lca && inRange;
          return `
            <div style="min-width: 32px; height: 36px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 6px; border: 1px solid ${isLCA ? '#ef4444' : (inRange ? '#3b82f6' : '#cbd5e1')}; background: ${isLCA ? '#fee2e2' : (inRange ? '#eff6ff' : '#f8fafc')};">
              <span style="font-size: 12px; font-weight: 800; color: ${isLCA ? '#b91c1c' : (inRange ? '#1d4ed8' : '#475569')};">${node}</span>
              <span style="font-size: 8px; color: #94a3b8;">${idx}</span>
            </div>
          `;
        }).join('')}
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
          <div style="font-size: 10px; color: #64748b;">待查询节点点对:</div>
          <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">
            Node ${u} (pos=${firstPos[u]}) & Node ${v} (pos=${firstPos[v]})
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
          <div style="font-size: 10px; color: #64748b;">ST 表 O(1) 深度极小点:</div>
          <div style="font-size: 13px; font-weight: 800; color: #b91c1c; margin-top: 2px;">
            LCA = ${lca !== -1 ? `节点 ${lca}` : '计算中...'}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 2. 边分治与边分树沙盘
// ----------------------------------------------------
export interface EdgeDecompEdge {
  id: number;
  u: number;
  v: number;
  w: number;
  isCentroid: boolean;
  isCut: boolean;
}

export function renderEdgeDecompBoard(
  nodes: number[],
  edges: EdgeDecompEdge[],
  activeEdgeId: number,
  blockA: number[],
  blockB: number[],
  stage: string = '寻找重心边'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>✂️ 树上边分治与严格二叉树沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #fef3c7; color: #b45309; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #1e40af; margin-bottom: 6px;">左连通块 A (${blockA.length} 点):</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${blockA.map(u => `<span style="padding: 2px 8px; background: #ffffff; border: 1px solid #93c5fd; border-radius: 4px; font-size: 11px; font-weight: 700; color: #1d4ed8;">V${u}</span>`).join('')}
          </div>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #166534; margin-bottom: 6px;">右连通块 B (${blockB.length} 点):</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${blockB.map(u => `<span style="padding: 2px 8px; background: #ffffff; border: 1px solid #86efac; border-radius: 4px; font-size: 11px; font-weight: 700; color: #15803d;">V${u}</span>`).join('')}
          </div>
        </div>
      </div>

      <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 6px;">当前边集状态:</div>
      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
        ${edges.map(e => {
          const isAct = e.id === activeEdgeId;
          return `
            <span style="padding: 3px 8px; border-radius: 6px; font-size: 11px; border: 1px solid ${isAct ? '#ef4444' : (e.isCut ? '#94a3b8' : '#cbd5e1')}; background: ${isAct ? '#fef2f2' : (e.isCut ? '#f1f5f9' : '#ffffff')}; color: ${isAct ? '#b91c1c' : (e.isCut ? '#64748b' : '#334155')}; font-weight: ${isAct ? '800' : 'normal'};">
              (${e.u} &harr; ${e.v}, w=${e.w}) ${isAct ? '⚡重心边' : (e.isCut ? '已割断' : '')}
            </span>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 3. 欧拉路径与欧拉回路沙盘
// ----------------------------------------------------
export interface EulerianEdge {
  u: number;
  v: number;
  used: boolean;
}

export function renderEulerianPathBoard(
  nodes: number[],
  edges: EulerianEdge[],
  inDeg: Record<number, number>,
  outDeg: Record<number, number>,
  pathStack: number[],
  stage: string = 'Hierholzer 深搜'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🔄 有向图欧拉路径 (Hierholzer 圈套圈) 沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #ecfdf5; color: #047857; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; margin-bottom: 12px;">
        ${nodes.map(u => `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; text-align: center;">
            <div style="font-size: 12px; font-weight: 800; color: #0f172a;">节点 ${u}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
              入度: ${inDeg[u] || 0} | 出度: ${outDeg[u] || 0}
            </div>
          </div>
        `).join('')}
      </div>

      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px;">
        <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">递归归途弹栈序列 (欧拉路径):</div>
        <div style="font-size: 13px; font-weight: 800; color: #047857;">
          ${pathStack.length > 0 ? pathStack.slice().reverse().map(u => `V${u}`).join(' &rarr; ') : '栈为空'}
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 4. 强连通分量与 Tarjan 缩点沙盘
// ----------------------------------------------------
export function renderTarjanSCCBoard(
  nodes: number[],
  dfn: Record<number, number>,
  low: Record<number, number>,
  inStack: Record<number, boolean>,
  sccs: number[][],
  stage: string = 'DFS 遍历'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🎯 有向图 Tarjan 强连通分量 (SCC) 缩点沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #fdf2f8; color: #be185d; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; margin-bottom: 12px;">
        ${nodes.map(u => {
          const ins = inStack[u];
          return `
            <div style="background: ${ins ? '#fff1f2' : '#f8fafc'}; border: 1px solid ${ins ? '#fca5a5' : '#cbd5e1'}; border-radius: 6px; padding: 6px; text-align: center;">
              <div style="font-size: 12px; font-weight: 800; color: ${ins ? '#b91c1c' : '#1e293b'};">
                V${u} ${ins ? '(在栈中)' : ''}
              </div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                dfn: ${dfn[u] ?? 0} | low: ${low[u] ?? 0}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
        <div style="font-size: 11px; font-weight: 700; color: #be185d; margin-bottom: 4px;">已缩点划分的极大 SCC 集合:</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${sccs.map((scc, i) => `
            <span style="padding: 4px 10px; background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 6px; font-size: 11px; font-weight: 800; color: #9d174d;">
              SCC #${i + 1}: { ${scc.map(u => `V${u}`).join(', ')} }
            </span>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 5. 割边与边双连通分量 e-BCC 沙盘
// ----------------------------------------------------
export interface BridgeEdgeView {
  u: number;
  v: number;
  isBridge: boolean;
}

export function renderEdgeBCCBoard(
  nodes: number[],
  edges: BridgeEdgeView[],
  ebccs: number[][],
  stage: string = '桥检测'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🌉 无向图割边 (桥) 与边双连通分量 (e-BCC) 沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #b91c1c; margin-bottom: 6px;">检测到的割边 (Bridges):</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${edges.filter(e => e.isBridge).map(e => `
              <span style="padding: 3px 8px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 4px; font-size: 11px; font-weight: 800; color: #b91c1c;">
                桥 (${e.u} &harr; ${e.v})
              </span>
            `).join('') || '<span style="font-size: 11px; color: #94a3b8;">暂无割边</span>'}
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #1d4ed8; margin-bottom: 6px;">边双连通分量 (e-BCCs):</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${ebccs.map((c, i) => `
              <span style="padding: 3px 8px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; font-size: 11px; font-weight: 800; color: #1e40af;">
                e-BCC #${i + 1}: { ${c.join(', ')} }
              </span>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 6. 割点与点双连通分量 v-BCC 沙盘
// ----------------------------------------------------
export function renderVertexBCCBoard(
  nodes: number[],
  cutVertices: number[],
  vbccs: number[][],
  stage: string = '割点判定'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>📍 无向图割点 (Cut Vertices) 与点双连通分量 (v-BCC) 沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #fef3c7; color: #b45309; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 12px; flex-wrap: wrap;">
        ${nodes.map(u => {
          const isCut = cutVertices.includes(u);
          return `
            <div style="border: 2px solid ${isCut ? '#ef4444' : '#3b82f6'}; background: ${isCut ? '#fee2e2' : '#eff6ff'}; border-radius: 9999px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: ${isCut ? '#b91c1c' : '#1e40af'}; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
              ${u} ${isCut ? '★' : ''}
            </div>
          `;
        }).join('')}
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
        <div style="font-size: 11px; font-weight: 700; color: #b45309; margin-bottom: 4px;">极大点双连通分量 (v-BCC 集合):</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${vbccs.map((c, i) => `
            <span style="padding: 4px 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; font-size: 11px; font-weight: 800; color: #92400e;">
              v-BCC #${i + 1}: { ${c.join(', ')} }
            </span>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
