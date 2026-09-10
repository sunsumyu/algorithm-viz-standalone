/**
 * 左神算法通关课 Class 173 ~ 178 共享沙盘与渲染助手
 * 提供：Dinic 层次图残量网络沙盘、MCMF 费用流最短路沙盘、匈牙利交替轨增广沙盘、KM 顶标相等子图沙盘、MCS 最大势消除沙盘、圆方树点双拓扑沙盘
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Advanced173Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

// ----------------------------------------------------
// 1. Dinic 残量网络与层次图沙盘
// ----------------------------------------------------
export interface DinicEdgeView {
  u: number;
  v: number;
  cap: number;
  flow: number;
}

export function renderDinicBoard(
  nodes: number[],
  edges: DinicEdgeView[],
  dep: Record<number, number>,
  currentFlow: number,
  stage: string = '增广中'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🌊 网络最大流 Dinic 层次图残量网络沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #e0f2fe; color: #0284c7; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 12px; flex-wrap: wrap;">
        ${nodes.map(u => {
          const d = dep[u] !== undefined && dep[u] !== -1 ? `d=${dep[u]}` : '未达';
          return `
            <div style="border: 2px solid #38bdf8; background: #f0f9ff; border-radius: 8px; padding: 6px 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
              <div style="font-size: 13px; font-weight: 800; color: #0369a1;">V${u}</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${d}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; margin-bottom: 10px;">
        ${edges.map(e => {
          const isFull = e.flow >= e.cap;
          return `
            <div style="background: #f8fafc; border: 1px solid ${isFull ? '#fca5a5' : '#cbd5e1'}; border-radius: 6px; padding: 6px 10px;">
              <div style="font-size: 11px; font-weight: 700; color: #1e293b; display: flex; justify-content: space-between;">
                <span>V${e.u} &rarr; V${e.v}</span>
                <span style="color: ${isFull ? '#dc2626' : '#0284c7'};">${e.flow} / ${e.cap}</span>
              </div>
              <div style="height: 4px; background: #e2e8f0; border-radius: 2px; margin-top: 4px; overflow: hidden;">
                <div style="width: ${Math.min(100, Math.round((e.flow / (e.cap || 1)) * 100))}%; height: 100%; background: ${isFull ? '#ef4444' : '#0284c7'};"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 12px; font-weight: 700; color: #334155;">当前源汇最大流 MaxFlow:</span>
        <span style="font-size: 15px; font-weight: 800; color: #0284c7; padding: 2px 10px; background: #f0f9ff; border-radius: 6px;">
          ${currentFlow}
        </span>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 2. 最小费用最大流 MCMF 沙盘
// ----------------------------------------------------
export interface MCMFEdgeView {
  u: number;
  v: number;
  cap: number;
  flow: number;
  cost: number;
}

export function renderMCMFBoard(
  nodes: number[],
  edges: MCMFEdgeView[],
  totalFlow: number,
  totalCost: number,
  stage: string = '费用增广中'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>💰 最小费用最大流 (MCMF) 残量费用网络沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #fef3c7; color: #b45309; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 12px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">累计达成最大流</div>
          <div style="font-size: 16px; font-weight: 800; color: #0284c7; margin-top: 4px;">Flow = ${totalFlow}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">SPFA 每次沿单位费用最短路增广</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">当前最小总费用</div>
          <div style="font-size: 16px; font-weight: 800; color: #d97706; margin-top: 4px;">Cost = ${totalCost}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">反向边费用为相反数支持反悔</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px;">
        ${edges.map(e => `
          <div style="background: #fdfdfd; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px;">
            <div style="font-size: 11px; font-weight: 700; color: #1e293b; display: flex; justify-content: space-between;">
              <span>V${e.u} &rarr; V${e.v}</span>
              <span style="color: #b45309; font-size: 10px;">单价: ${e.cost}</span>
            </div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
              流量: <strong style="color: #0284c7;">${e.flow}</strong> / ${e.cap}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 3. 匈牙利算法二分图匹配沙盘
// ----------------------------------------------------
export function renderHungarianBoard(
  nLeft: number,
  nRight: number,
  edges: { u: number; v: number }[],
  matchRight: number[],
  activeLeft: number = -1,
  stage: string = '匹配中'
): string {
  const matchCount = matchRight.filter(u => u !== -1).length;

  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🎯 匈牙利算法二分图最大匹配沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #dcfce7; color: #15803d; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #4338ca; margin-bottom: 6px;">左部节点集合 (U, n=${nLeft})</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${Array.from({ length: nLeft }, (_, u) => {
              const isAct = u === activeLeft;
              const isMatched = matchRight.includes(u);
              return `
                <div style="padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 800; ${
                  isAct
                    ? 'background: #e0e7ff; border: 2px solid #6366f1; color: #312e81;'
                    : (isMatched ? 'background: #ecfdf5; border: 1px solid #86efac; color: #047857;' : 'background: #f1f5f9; border: 1px solid #cbd5e1; color: #64748b;')
                }">
                  U${u}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #b45309; margin-bottom: 6px;">右部节点集合 (V, n=${nRight})</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${Array.from({ length: nRight }, (_, v) => {
              const paired = matchRight[v];
              return `
                <div style="padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 800; ${
                  paired !== -1
                    ? 'background: #ecfdf5; border: 1px solid #86efac; color: #047857;'
                    : 'background: #f1f5f9; border: 1px solid #cbd5e1; color: #64748b;'
                }">
                  V${v} ${paired !== -1 ? `&harr; U${paired}` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 12px; font-weight: 700; color: #334155;">当前匹配总边数:</span>
        <span style="font-size: 15px; font-weight: 800; color: #16a34a; padding: 2px 10px; background: #ecfdf5; border-radius: 6px;">
          ${matchCount} 条匹配边
        </span>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 4. KM 算法二分图最大权完美匹配沙盘
// ----------------------------------------------------
export function renderKMBoard(
  n: number,
  w: number[][],
  lx: number[],
  ly: number[],
  matchRight: number[],
  totalWeight: number,
  stage: string = '顶标调整中'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>⚖️ KM 算法最大权完美匹配顶标沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #fdf2f8; color: #be185d; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 12px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">左部顶标 Lx[i]</div>
          <div style="font-size: 12px; font-weight: 700; color: #4338ca; margin-top: 4px;">
            ${lx.map((val, i) => `Lx[${i}]=${val}`).join(', ')}
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">右部顶标 Ly[j]</div>
          <div style="font-size: 12px; font-weight: 700; color: #be185d; margin-top: 4px;">
            ${ly.map((val, j) => `Ly[${j}]=${val}`).join(', ')}
          </div>
        </div>
      </div>

      <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 12px; font-weight: 700; color: #334155;">当前匹配边权总和:</span>
        <span style="font-size: 15px; font-weight: 800; color: #be185d; padding: 2px 10px; background: #fdf2f8; border-radius: 6px;">
          ${totalWeight}
        </span>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 5. 弦图与最大势算法 MCS 沙盘
// ----------------------------------------------------
export function renderChordalMCSBoard(
  nodes: number[],
  peo: number[],
  deg: number[],
  activePick: number = -1,
  stage: string = 'MCS 消除中'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🎻 弦图与最大势算法 (MCS) 消除沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #ede9fe; color: #6d28d9; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 6px;">各节点当前相邻势能 deg[u]:</div>
      <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
        ${nodes.map(u => `
          <div style="padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; ${
            u === activePick ? 'background: #f5f3ff; border: 2px solid #7c3aed; color: #6d28d9;' : 'background: #f8fafc; border: 1px solid #cbd5e1; color: #475569;'
          }">
            V${u} (deg=${deg[u]})
          </div>
        `).join('')}
      </div>

      <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px;">
        <div style="font-size: 11px; font-weight: 700; color: #6d28d9; margin-bottom: 4px;">完美消除序列 PEO (Perfect Elimination Ordering):</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${peo.map((u, i) => `
            <span style="padding: 3px 8px; background: #ede9fe; border: 1px solid #c4b5fd; border-radius: 6px; font-size: 11px; font-weight: 800; color: #5b21b6;">
              #${i + 1}: V${u}
            </span>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 6. 圆方树 Block-Cut Tree 沙盘
// ----------------------------------------------------
export interface BlockCutBlockView {
  squareId: number;
  circleMembers: number[];
}

export function renderBlockCutBoard(
  origNodes: number[],
  blocks: BlockCutBlockView[],
  stage: string = '点双缩点中'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🌵 圆方树 (Block-Cut Tree) 点双连通树状沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #ecfdf5; color: #047857; font-weight: 700;">
          ${stage}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 12px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">原图圆点 (Circles)</div>
          <div style="font-size: 13px; font-weight: 800; color: #047857; margin-top: 4px;">共 ${origNodes.length} 个顶点</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">割点连接多个方点</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 700;">点双方点 (Squares)</div>
          <div style="font-size: 13px; font-weight: 800; color: #4338ca; margin-top: 4px;">共 ${blocks.length} 个点双块</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">每个方点代表一个极大点双</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px;">
        ${blocks.map(b => `
          <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 8px;">
            <div style="font-size: 11px; font-weight: 800; color: #3730a3;">方点 S${b.squareId} (BCC Block)</div>
            <div style="font-size: 11px; color: #4338ca; margin-top: 4px;">
              包含圆点: <strong>${b.circleMembers.map(u => `V${u}`).join(', ')}</strong>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
