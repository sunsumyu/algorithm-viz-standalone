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
            ? `<circle cx="${pos.x}" cy="${pos.y}" r="30" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 3" opacity="0.8">
                 <animateTransform attributeName="transform" type="rotate" from="0 ${pos.x} ${pos.y}" to="360 ${pos.x} ${pos.y}" dur="8s" repeatCount="indefinite" />
               </circle>`
            : inQueue
            ? `<circle cx="${pos.x}" cy="${pos.y}" r="27" fill="none" stroke="#06b6d4" stroke-width="1.8" stroke-dasharray="3 3" opacity="0.8" />`
            : ''
        }
        <circle cx="${pos.x}" cy="${pos.y}" r="24" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
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
  const { queue, traversalOrder, visited, levelMarkers } = step;

  // 1. FIFO 队列卡槽
  const queueItemsHtml =
    queue.length === 0
      ? '<span style="font-size: 11px; color: #94a3b8; font-style: italic;">（队列当前为空）</span>'
      : queue
          .map((node, idx) => {
            const isHead = idx === 0;
            return `
              <div style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-family: monospace; font-weight: 700; ${
                isHead
                  ? 'background: #ecfeff; color: #0e7490; border: 1.5px solid #06b6d4; box-shadow: 0 1px 3px rgba(6, 182, 212, 0.15);'
                  : 'background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1;'
              }">
                <span style="font-size: 9.5px; color: ${isHead ? '#0891b2' : '#64748b'};">#${idx + 1}</span>
                <span>Node ${node}</span>
                ${isHead ? '<span style="font-size: 8.5px; background: #06b6d4; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-weight: 800;">HEAD</span>' : ''}
              </div>
            `;
          })
          .join('');

  // 2. 分层遍历流水（带层级竖线）
  const levelSet = new Set(levelMarkers);
  let orderHtml = '';
  if (traversalOrder.length === 0) {
    orderHtml = '<span style="font-size: 11px; color: #94a3b8; font-style: italic;">（尚未遍历任何节点）</span>';
  } else {
    traversalOrder.forEach((node, idx) => {
      if (levelSet.has(idx) && idx > 0) {
        orderHtml += `
          <span style="font-size: 9px; color: #0891b2; font-weight: 800; padding: 1px 4px; background: #e0f2fe; border-radius: 4px; user-select: none;">Level</span>
        `;
      }
      orderHtml += `
        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; border-radius: 6px; font-size: 11px; font-family: monospace; font-weight: 700; background: #ecfdf5; color: #065f46; border: 1px solid #6ee7b7;">
          <span style="font-size: 9.5px; color: #059669; opacity: 0.8;">${idx + 1}.</span>
          <span>Node ${node}</span>
        </span>
      `;
    });
  }

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; box-sizing: border-box;">
      <!-- FIFO 队列舱 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11.5px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #06b6d4;"></span>
            先进先出队列 (FIFO Queue)
          </span>
          <span style="font-size: 11px; font-weight: 700; color: #0891b2; font-family: monospace;">队列长度: ${queue.length}</span>
        </div>
        <div style="display: flex; flex-wrap: wrap; items-center; gap: 5px; min-height: 32px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 6px; padding: 4px 8px; box-sizing: border-box;">
          ${queueItemsHtml}
        </div>
      </div>

      <!-- 分层访问流水 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11.5px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #059669;"></span>
            分层遍历序列 (Layered Order) · Level ${step.level}
          </span>
          <span style="font-size: 11px; font-weight: 700; color: #059669; font-family: monospace;">已遍历: ${visited.size} / 6</span>
        </div>
        <div style="display: flex; flex-wrap: wrap; items-center; gap: 5px; min-height: 32px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 6px; padding: 4px 8px; box-sizing: border-box;">
          ${orderHtml}
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
