/**
 * 左神算法通关课 Class 196 ~ 200 共享沙盘与渲染助手
 * 提供：双线段树优化建图沙盘、主席树可持久化建图沙盘、CDQ分治多维偏序建图沙盘、基环树拓扑破环DP沙盘、仙人掌图单调队列环形DP沙盘
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Advanced196Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

// ----------------------------------------------------
// 1. 双线段树优化建图沙盘 (Class 196)
// ----------------------------------------------------
export function renderSegmentTreeGraphBoard(
  inTreeNodes: { id: string; range: string; active: boolean }[],
  outTreeNodes: { id: string; range: string; active: boolean }[],
  leaves: { id: number; dist: number; active: boolean }[],
  activeEdge: { from: string; to: string; weight: number; desc: string } | null,
  edgeCountStats: { bruteForce: number; optimized: number }
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🌳 出树 (Out-Tree) 与 入树 (In-Tree) 双树优化建图架构</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 700;">
          边数压缩: ${edgeCountStats.optimized} (暴力 $O(N^2)$: ${edgeCountStats.bruteForce})
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <!-- 出树 (Out-Tree) -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #0369a1; margin-bottom: 6px;">
            🔺 出树 (Out-Tree): 子节点向父节点连 0 权边 (负责从区间发射信息)
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${outTreeNodes.map(n => `
              <div style="padding: 4px 8px; border-radius: 6px; font-size: 11px; border: 1px solid ${n.active ? '#0284c7' : '#cbd5e1'}; background: ${n.active ? '#e0f2fe' : '#ffffff'}; color: ${n.active ? '#0369a1' : '#64748b'}; font-weight: ${n.active ? '700' : '500'};">
                ${n.range}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 入树 (In-Tree) -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #15803d; margin-bottom: 6px;">
            🔻 入树 (In-Tree): 父节点向子节点连 0 权边 (负责接收流入区间的信息)
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${inTreeNodes.map(n => `
              <div style="padding: 4px 8px; border-radius: 6px; font-size: 11px; border: 1px solid ${n.active ? '#16a34a' : '#cbd5e1'}; background: ${n.active ? '#dcfce7' : '#ffffff'}; color: ${n.active ? '#15803d' : '#64748b'}; font-weight: ${n.active ? '700' : '500'};">
                ${n.range}
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 叶子实体原点层 -->
      <div style="margin-bottom: 10px; background: #f1f5f9; border-radius: 8px; padding: 8px;">
        <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 6px;">
          🌿 实体叶子原点 (桥接双树):
        </div>
        <div style="display: flex; gap: 8px; justify-content: space-around;">
          ${leaves.map(l => `
            <div style="padding: 6px 12px; border-radius: 6px; border: 2px solid ${l.active ? '#f59e0b' : '#94a3b8'}; background: ${l.active ? '#fef3c7' : '#ffffff'}; text-align: center;">
              <div style="font-size: 12px; font-weight: 800; color: #1e293b;">原点 ${l.id}</div>
              <div style="font-size: 10px; color: #64748b;">dist: ${l.dist === 999999 ? '∞' : l.dist}</div>
            </div>
          `).join('')}
        </div>
      </div>

      ${activeEdge ? `
        <div style="background: #fdf4ff; border: 1px solid #f0abfc; border-radius: 6px; padding: 6px 10px; font-size: 11px; color: #86198f;">
          ⚡ <strong>正在建立跨树连接</strong>: 从 <code>${activeEdge.from}</code> 连向 <code>${activeEdge.to}</code> (权值 $w=${activeEdge.weight}$) — ${activeEdge.desc}
        </div>
      ` : ''}
    </div>
  `;
}

// ----------------------------------------------------
// 2. 主席树/可持久化优化建图沙盘 (Class 197)
// ----------------------------------------------------
export function renderPersistentGraphBoard(
  versions: { ver: number; rootId: string; newNodes: string[]; sharedNodes: string[] }[],
  activeVer: number,
  linkedTarget: { fromPoint: number; targetRange: string; hitNodes: string[] } | null,
  statusDesc: string
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>⏳ 主席树版本树演进与历史区间连边沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #faf5ff; color: #7e22ce; font-weight: 700;">
          当前活跃版本: Root[${activeVer}]
        </span>
      </div>

      <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 12px;">
        ${versions.map(v => {
          const isCurr = v.ver === activeVer;
          return `
            <div style="min-width: 140px; padding: 8px 10px; border-radius: 8px; border: 2px solid ${isCurr ? '#9333ea' : '#e2e8f0'}; background: ${isCurr ? '#f3e8ff' : '#f8fafc'};">
              <div style="font-size: 12px; font-weight: 800; color: ${isCurr ? '#6b21a8' : '#475569'};">
                版本 ${v.ver} (${v.rootId})
              </div>
              <div style="font-size: 10px; color: #16a34a; margin-top: 4px;">
                +动态新建: ${v.newNodes.join(', ')}
              </div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                =沿用共享: ${v.sharedNodes.join(', ')}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      ${linkedTarget ? `
        <div style="background: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 8px 12px; font-size: 11px; color: #1e40af; margin-bottom: 6px;">
          🔗 <strong>历史前缀连边</strong>: 点 ${linkedTarget.fromPoint} 跨版本连向历史前缀树中处于区间 <code>${linkedTarget.targetRange}</code> 的虚点:
          <span style="font-weight: 700; color: #1d4ed8;">[${linkedTarget.hitNodes.join(', ')}]</span>
        </div>
      ` : ''}

      <div style="font-size: 11px; color: #64748b; background: #f1f5f9; padding: 6px 10px; border-radius: 6px;">
        💡 <strong>机制说明</strong>: ${statusDesc}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 3. CDQ 分治优化建图沙盘 (Class 198)
// ----------------------------------------------------
export function renderCDQGraphBoard(
  l: number,
  r: number,
  mid: number,
  leftElements: { id: number; a: number; b: number }[],
  rightElements: { id: number; a: number; b: number }[],
  prefixNodes: string[],
  activeConnections: { from: number; to: string }[],
  stats: { totalEdges: number; bruteForceEdges: number }
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>⚡ CDQ 分治区间 [$l=${l}, r=${r}$] (分治中点 mid=${mid}) 偏序建边</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #ecfdf5; color: #047857; font-weight: 700;">
          已建边数: ${stats.totalEdges} (暴力: ${stats.bruteForceEdges})
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <!-- 左半区 (提供条件 a_i <= a_j) -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #2563eb; margin-bottom: 6px;">
            ◀ 左半区 [$l \\dots mid$] (起点集合):
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${leftElements.map(e => `
              <div style="padding: 4px 8px; border-radius: 6px; font-size: 11px; border: 1px solid #93c5fd; background: #eff6ff; color: #1e40af;">
                P${e.id} (a=${e.a}, b=${e.b})
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 右半区 (接收边) -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #d97706; margin-bottom: 6px;">
            ▶ 右半区 [$mid+1 \\dots r$] (终点集合):
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${rightElements.map(e => `
              <div style="padding: 4px 8px; border-radius: 6px; font-size: 11px; border: 1px solid #fde68a; background: #fffbeb; color: #92400e;">
                P${e.id} (a=${e.a}, b=${e.b})
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 前缀虚点链中继 -->
      <div style="margin-bottom: 8px; background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 8px; padding: 8px;">
        <div style="font-size: 11px; font-weight: 700; color: #9d174d; margin-bottom: 4px;">
          🔗 按第二维排布的前缀虚点传递链:
        </div>
        <div style="font-size: 11px; color: #be185d;">
          ${prefixNodes.length > 0 ? prefixNodes.join(' ➔ ') : '尚未建立前缀链'}
        </div>
      </div>

      <div style="font-size: 11px; color: #64748b;">
        当前批次连边: ${activeConnections.map(c => `P${c.from} ➔ ${c.to}`).join(', ') || '无跨区新增边'}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 4. 基环树拓扑破环成链 DP 沙盘 (Class 199)
// ----------------------------------------------------
export function renderPseudotreeDPBoard(
  nodes: { id: number; val: number; degree: number; inCycle: boolean; dp0: number; dp1: number }[],
  cycleNodes: number[],
  brokenEdge: { u: number; v: number } | null,
  schemes: { planA: { forceNot: number; bestVal: number }; planB: { forceNot: number; bestVal: number } } | null,
  phase: string
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🔄 基环树拓扑剥皮找环与环上破环成链 DP 沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 700;">
          阶段: ${phase}
        </span>
      </div>

      <!-- 节点展示 -->
      <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 12px; flex-wrap: wrap;">
        ${nodes.map(n => {
          const isCycle = n.inCycle;
          return `
            <div style="padding: 6px 10px; border-radius: 8px; border: 2px solid ${isCycle ? '#ef4444' : '#94a3b8'}; background: ${isCycle ? '#fef2f2' : '#f8fafc'}; text-align: center; min-width: 90px;">
              <div style="font-size: 12px; font-weight: 800; color: ${isCycle ? '#b91c1c' : '#334155'};">
                节点 ${n.id} ${isCycle ? '(环)' : ''}
              </div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                权值: ${n.val} | 度数: ${n.degree}
              </div>
              <div style="font-size: 10px; color: #2563eb; margin-top: 2px;">
                不选=${n.dp0} / 选=${n.dp1}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- 环上拓扑与断边分析 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px;">
          <div style="font-size: 10px; color: #64748b;">基环核心节点序列:</div>
          <div style="font-size: 13px; font-weight: 800; color: #b91c1c; margin-top: 2px;">
            [ ${cycleNodes.join(' ➔ ')} ➔ ${cycleNodes[0] || ''} ]
          </div>
          ${brokenEdge ? `
            <div style="font-size: 11px; color: #b45309; margin-top: 4px;">
              ✂ 断开环边: (${brokenEdge.u}, ${brokenEdge.v}) 破环成链
            </div>
          ` : ''}
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px;">
          <div style="font-size: 10px; color: #64748b;">断边两次 DP 方案对比:</div>
          ${schemes ? `
            <div style="font-size: 11px; color: #1e293b; margin-top: 2px;">
              方案 1 (强制不选 ${schemes.planA.forceNot}): <strong>${schemes.planA.bestVal}</strong>
            </div>
            <div style="font-size: 11px; color: #1e293b; margin-top: 2px;">
              方案 2 (强制不选 ${schemes.planB.forceNot}): <strong>${schemes.planB.bestVal}</strong>
            </div>
            <div style="font-size: 12px; font-weight: 800; color: #15803d; margin-top: 4px;">
              全局最大权独立集 = ${Math.max(schemes.planA.bestVal, schemes.planB.bestVal)}
            </div>
          ` : '<div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">等待子树 DP 完成后断环计算</div>'}
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 5. 仙人掌图单调队列环形 DP 沙盘 (Class 200)
// ----------------------------------------------------
export function renderCactusGraphDPBoard(
  dfsStates: { u: number; dfn: number; low: number; f: number }[],
  currentCycle: { nodes: number[]; len: number; cycleSeq: number[] } | null,
  monotonicQueue: { pos: number; val: number }[],
  globalDiameter: number,
  phase: string
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🌵 仙人掌图 DFS 树边转移与返祖环单调队列 DP 沙盘 (Class 200 终极收官)</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #fef2f2; color: #dc2626; font-weight: 800;">
          全局最大直径: ${globalDiameter}
        </span>
      </div>

      <!-- DFS 节点状态 -->
      <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 12px;">
        ${dfsStates.map(s => `
          <div style="padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1; background: #f8fafc; min-width: 80px; text-align: center;">
            <div style="font-size: 12px; font-weight: 800; color: #1e293b;">点 ${s.u}</div>
            <div style="font-size: 10px; color: #64748b;">dfn/low: ${s.dfn}/${s.low}</div>
            <div style="font-size: 10px; color: #059669; font-weight: 700;">最长链 f=${s.f}</div>
          </div>
        `).join('')}
      </div>

      <!-- 环形单调队列求解区 -->
      <div style="background: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; padding: 10px;">
        ${currentCycle ? `
          <div style="font-size: 11px; font-weight: 700; color: #d97706; margin-bottom: 6px;">
            🌀 正在处理简单环: [${currentCycle.nodes.join(' ➔ ')}] (环长 L=${currentCycle.len}, 倍长破环成链)
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
            倍增链序列: [ ${currentCycle.cycleSeq.join(', ')} ]
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 11px; font-weight: 700; color: #2563eb;">单调队列窗口 (维护 f[i] - i 最大值):</span>
            <div style="display: flex; gap: 4px;">
              ${monotonicQueue.map(q => `
                <div style="padding: 2px 6px; background: #dbeafe; border: 1px solid #60a5fa; border-radius: 4px; font-size: 10px; color: #1e40af; font-weight: 700;">
                  idx:${q.pos} (val:${q.val})
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div style="font-size: 11px; color: #64748b;">
            🌲 当前处理树枝边，按普通树形 DP 更新子树最长链与直径...
          </div>
        `}
      </div>
    </div>
  `;
}
