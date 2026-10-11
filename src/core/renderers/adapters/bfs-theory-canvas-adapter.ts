/**
 * 广度优先搜索理论基础 (BFS Theory) — 领域视觉适配器
 * 遵循 Matt Pocock 深模块哲学：
 * Card 1: 100% 纯 SVG 层序波纹拓扑沙盘 (Zero Outer Div)
 * Card 2: FIFO 队列监视舱与分层序列诊断 (FIFO Queue & Level Monitor)
 */

import {
  type BFSStep,
  BFS_NODE_POSITIONS,
} from '../../../algorithms/categories/graph/bfs-theory-step-compiler';

export function renderBFSTheoryCanvas(container: HTMLElement, step: BFSStep): void {
  const { nodes, edges, visited, currentNode, currentEdge, queue } = step;
  const queueSet = new Set(queue);

  const width = 600;
  const height = 300;

  // 1. 边连线层
  let edgesSvg = '';
  for (const [u, v] of edges) {
    const p1 = BFS_NODE_POSITIONS[u];
    const p2 = BFS_NODE_POSITIONS[v];
    if (!p1 || !p2) continue;

    const isCurrentEdge =
      currentEdge !== null &&
      ((currentEdge[0] === u && currentEdge[1] === v) || (currentEdge[0] === v && currentEdge[1] === u));

    const isTraversed = visited.has(u) && visited.has(v);

    const stroke = isCurrentEdge
      ? '#f59e0b'
      : isTraversed
      ? '#06b6d4'
      : '#334155';

    const strokeWidth = isCurrentEdge ? 3.5 : isTraversed ? 2.2 : 1.8;
    const strokeDash = isCurrentEdge ? 'stroke-dasharray="4 2"' : '';

    edgesSvg += `
      <line
        x1="${p1.x}" y1="${p1.y}"
        x2="${p2.x}" y2="${p2.y}"
        stroke="${stroke}"
        stroke-width="${strokeWidth}"
        ${strokeDash}
        stroke-linecap="round"
        opacity="${isCurrentEdge ? '1' : isTraversed ? '0.85' : '0.5'}"
      />
    `;
  }

  // 2. 节点图元层
  let nodesSvg = '';
  for (const u of nodes) {
    const pos = BFS_NODE_POSITIONS[u];
    if (!pos) continue;

    const isCurrent = currentNode === u;
    const inQueue = queueSet.has(u);
    const isVisited = visited.has(u);

    const fillColor = isCurrent
      ? '#78350f'
      : inQueue
      ? '#083344'
      : isVisited
      ? '#064e3b'
      : '#0f172a';

    const strokeColor = isCurrent
      ? '#f59e0b'
      : inQueue
      ? '#22d3ee'
      : isVisited
      ? '#10b981'
      : '#475569';

    const strokeWidth = isCurrent ? 3 : inQueue ? 2.5 : 1.8;

    nodesSvg += `
      <g class="bfs-node-group">
        ${
          isCurrent
            ? `<circle cx="${pos.x}" cy="${pos.y}" r="28" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 3" opacity="0.8">
                 <animateTransform attributeName="transform" type="rotate" from="0 ${pos.x} ${pos.y}" to="360 ${pos.x} ${pos.y}" dur="8s" repeatCount="indefinite" />
               </circle>`
            : inQueue
            ? `<circle cx="${pos.x}" cy="${pos.y}" r="26" fill="none" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.7" />`
            : ''
        }
        <circle cx="${pos.x}" cy="${pos.y}" r="22" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
        <text x="${pos.x}" y="${pos.y + 6}" text-anchor="middle" fill="${isCurrent ? '#fef08a' : inQueue ? '#a5f3fc' : isVisited ? '#a7f3d0' : '#f8fafc'}" font-size="15" font-weight="800" font-family="monospace">${u}</text>
        ${
          isCurrent
            ? `<text x="${pos.x}" y="${pos.y - 28}" text-anchor="middle" fill="#f59e0b" font-size="9" font-weight="800" font-family="sans-serif">● 当前扫描</text>`
            : inQueue
            ? `<text x="${pos.x}" y="${pos.y - 28}" text-anchor="middle" fill="#22d3ee" font-size="8.5" font-weight="700" font-family="sans-serif">队列等待 (Q)</text>`
            : isVisited
            ? `<text x="${pos.x}" y="${pos.y - 28}" text-anchor="middle" fill="#34d399" font-size="8.5" font-weight="700" font-family="sans-serif">✓ 已遍历</text>`
            : ''
        }
      </g>
    `;
  }

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-full select-none" style="max-height: 320px;" preserveAspectRatio="xMidYMid meet">
      <!-- 层级分水岭辅助线 -->
      <g opacity="0.12">
        <line x1="0" y1="45" x2="${width}" y2="45" stroke="#06b6d4" stroke-dasharray="3 4" />
        <line x1="0" y1="135" x2="${width}" y2="135" stroke="#06b6d4" stroke-dasharray="3 4" />
        <line x1="0" y1="235" x2="${width}" y2="235" stroke="#06b6d4" stroke-dasharray="3 4" />
        <text x="12" y="42" fill="#22d3ee" font-size="9" font-family="monospace">Level 0 (源起点)</text>
        <text x="12" y="132" fill="#22d3ee" font-size="9" font-family="monospace">Level 1 (距离 1)</text>
        <text x="12" y="232" fill="#22d3ee" font-size="9" font-family="monospace">Level 2 (距离 2)</text>
      </g>
      <!-- 边连线层 -->
      <g class="bfs-edges-layer">
        ${edgesSvg}
      </g>
      <!-- 顶点图元层 -->
      <g class="bfs-nodes-layer">
        ${nodesSvg}
      </g>
    </svg>
  `;
}

export function renderBFSTheoryCustomMetrics(container: HTMLElement, step: BFSStep): void {
  const { queue, traversalOrder, visited, levelMarkers, action, level } = step;

  // 1. FIFO 队列卡槽
  const queueItemsHtml =
    queue.length === 0
      ? '<span class="text-xs text-slate-500 italic">（队列当前为空）</span>'
      : queue
          .map((node, idx) => {
            const isHead = idx === 0;
            return `
              <div class="px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 ${
                isHead
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm shadow-cyan-900/40'
                  : 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
              }">
                <span class="text-[10px] text-slate-400">#${idx + 1}</span>
                <span>Node ${node}</span>
                ${isHead ? '<span class="text-[9px] bg-cyan-500/30 text-cyan-200 px-1 rounded">HEAD</span>' : ''}
              </div>
            `;
          })
          .join('');

  // 2. 分层遍历流水（带层级竖线）
  const levelSet = new Set(levelMarkers);
  let orderHtml = '';
  if (traversalOrder.length === 0) {
    orderHtml = '<span class="text-xs text-slate-500 italic">（尚未遍历任何节点）</span>';
  } else {
    traversalOrder.forEach((node, idx) => {
      if (levelSet.has(idx) && idx > 0) {
        orderHtml += `
          <span class="text-xs text-cyan-500 font-bold px-1 select-none">|</span>
        `;
      }
      orderHtml += `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
          <span class="text-[9px] opacity-60">${idx + 1}.</span>
          <span>${node}</span>
        </span>
      `;
    });
  }

  container.innerHTML = `
    <div class="w-full flex flex-col gap-3 p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl text-xs">
      <!-- FIFO 队列舱 -->
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between text-slate-300 font-semibold text-[11px]">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
            先进先出队列 (FIFO Queue)
          </span>
          <span class="text-[10px] font-mono text-cyan-300">队列长度: ${queue.length}</span>
        </div>
        <div class="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 min-h-[38px]">
          ${queueItemsHtml}
        </div>
      </div>

      <!-- 分层访问流水 -->
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between text-slate-300 font-semibold text-[11px]">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            分层遍历序列 (Layered Order)
          </span>
          <span class="text-[10px] font-mono text-emerald-300">已遍历: ${visited.size} / 6</span>
        </div>
        <div class="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 min-h-[38px]">
          ${orderHtml}
        </div>
      </div>

      <!-- 指标汇总仪表板 -->
      <div class="grid grid-cols-4 gap-2 pt-1 border-t border-slate-800/60 text-[11px]">
        <div class="p-1.5 rounded bg-slate-800/40 text-center">
          <div class="text-slate-400 text-[10px]">当前动作</div>
          <div class="font-mono font-bold text-amber-400 uppercase">${action}</div>
        </div>
        <div class="p-1.5 rounded bg-slate-800/40 text-center">
          <div class="text-slate-400 text-[10px]">当前层级</div>
          <div class="font-mono font-bold text-cyan-400">Level ${level}</div>
        </div>
        <div class="p-1.5 rounded bg-slate-800/40 text-center">
          <div class="text-slate-400 text-[10px]">队列待办</div>
          <div class="font-mono font-bold text-purple-400">${queue.length}</div>
        </div>
        <div class="p-1.5 rounded bg-slate-800/40 text-center">
          <div class="text-slate-400 text-[10px]">已染节点</div>
          <div class="font-mono font-bold text-emerald-400">${visited.size} / 6</div>
        </div>
      </div>
    </div>
  `;
}

export class BFSTheoryCanvasAdapter {
  mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  updateStep(container: HTMLElement, step: unknown): void {
    const bfsStep = step as BFSStep;
    if (!bfsStep) return;
    renderBFSTheoryCanvas(container, bfsStep);
  }

  dispose(container: HTMLElement): void {
    container.innerHTML = '';
  }
}
