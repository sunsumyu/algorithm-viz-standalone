/**
 * 无向图割点与割边 (Tarjan Cut Vertices & Bridges) 领域视觉适配器
 * 核心：DFS 生成树结构、割点高亮标记、桥边黄金高亮与虚线脉冲
 * 规范：Matt Pocock 深模块架构，Card 1 零 HTML 表格污染，纯净矢量 SVG 画布
 */

import { BridgeStep } from '../../../algorithms/categories/graph/tarjan-bridge-step-compiler';

export class TarjanBridgeCanvasAdapter {
  public static render(container: HTMLElement, step: BridgeStep): void {
    const is5Node = Object.keys(step.dfnMap).length === 5;
    const n = is5Node ? 5 : 4;

    const nodeCoords: Record<number, { x: number; y: number }> = is5Node
      ? {
          1: { x: 70, y: 70 },
          2: { x: 170, y: 70 },
          3: { x: 120, y: 145 },
          4: { x: 235, y: 145 },
          5: { x: 330, y: 145 },
        }
      : {
          1: { x: 80, y: 70 },
          2: { x: 180, y: 70 },
          3: { x: 130, y: 145 },
          4: { x: 280, y: 145 },
        };

    const undirectedEdges = is5Node
      ? [
          [1, 2],
          [2, 3],
          [3, 1],
          [3, 4],
          [4, 5],
        ]
      : [
          [1, 2],
          [2, 3],
          [3, 1],
          [3, 4],
        ];

    const isBridgeEdge = (u: number, v: number) =>
      step.bridgeEdges.some(([a, b]) => (a === u && b === v) || (a === v && b === u));

    let svgEdges = '';
    let svgBridgeBadges = '';

    for (const [u, v] of undirectedEdges) {
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (!p1 || !p2) continue;

      const isAct =
        step.activeEdge &&
        ((step.activeEdge[0] === u && step.activeEdge[1] === v) ||
          (step.activeEdge[0] === v && step.activeEdge[1] === u));
      const isBridge = isBridgeEdge(u, v);

      const color = isAct ? '#facc15' : isBridge ? '#f59e0b' : 'rgba(100, 116, 139, 0.65)';
      const width = isBridge ? 3.5 : isAct ? 3 : 1.8;

      svgEdges += `
        <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
              stroke="${color}" stroke-width="${width}"
              class="graph-edge ${isBridge ? 'bridge-edge' : ''}"
              ${isBridge ? 'stroke-dasharray="6,3"' : ''} />
      `;

      if (isBridge) {
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        svgBridgeBadges += `
          <g class="bridge-tag">
            <rect x="${mx - 18}" y="${my - 8}" width="36" height="16" rx="4" fill="#78350f" stroke="#f59e0b" stroke-width="1" />
            <text x="${mx}" y="${my + 4}" fill="#fde047" font-size="8.5" font-weight="800" text-anchor="middle">桥边</text>
          </g>
        `;
      }
    }

    let svgNodes = '';
    for (let u = 1; u <= n; u++) {
      const p = nodeCoords[u];
      if (!p) continue;

      const isCur = step.curNode === u;
      const isCut = step.cutNodes.includes(u);

      const bg = isCur ? '#b45309' : isCut ? '#881337' : '#1e293b';
      const border = isCur ? '#facc15' : isCut ? '#f43f5e' : '#475569';

      svgNodes += `
        <g class="graph-node ${isCut ? 'cut-node' : ''}" data-node="${u}">
          <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="${isCur || isCut ? 3 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          <text x="${p.x}" y="${p.y + 26}" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">d:${step.dfnMap[u] || 0} l:${step.lowMap[u] || 0}</text>
          ${isCut ? `<text x="${p.x + 14}" y="${p.y - 12}" fill="#fb7185" font-size="10">🚩</text>` : ''}
        </g>
      `;
    }

    container.innerHTML = `
      <div class="w-full h-full flex items-center justify-center bg-slate-950 p-2 select-none overflow-hidden">
        <svg class="w-full h-full max-h-[220px]" viewBox="0 0 390 190">
          <text x="195" y="22" fill="#64748b" font-size="10.5" font-weight="700" text-anchor="middle">
            无向图 DFS 生成树 · 割点判定 (low[v] ≥ dfn[u]) · 割边桥判定 (low[v] > dfn[u])
          </text>
          ${svgEdges}
          ${svgBridgeBadges}
          ${svgNodes}
        </svg>
      </div>
    `;
  }
}
