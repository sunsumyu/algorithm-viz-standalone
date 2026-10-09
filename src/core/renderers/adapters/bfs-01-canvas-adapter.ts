import { BFS01Step } from '../../../algorithms/categories/graph/bfs-01-step-compiler';

export class BFS01CanvasAdapter {
  public static render(container: HTMLElement, step: BFS01Step): void {
    const is5 = step.distArray.length === 5;
    const n = is5 ? 5 : 4;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 420;

    const nodeCoords: Record<number, { x: number; y: number }> = is5
      ? {
          1: { x: 70, y: 110 },
          2: { x: 200, y: 55 },
          3: { x: 200, y: 165 },
          4: { x: 330, y: 110 },
          5: { x: 440, y: 110 },
        }
      : {
          1: { x: 80, y: 110 },
          2: { x: 210, y: 55 },
          3: { x: 210, y: 165 },
          4: { x: 360, y: 110 },
        };

    const edges: Array<{ u: number; v: number; w: number }> = is5
      ? [
          { u: 1, v: 2, w: 0 },
          { u: 1, v: 3, w: 1 },
          { u: 2, v: 4, w: 1 },
          { u: 3, v: 4, w: 0 },
          { u: 4, v: 5, w: 0 },
        ]
      : [
          { u: 1, v: 2, w: 0 },
          { u: 1, v: 3, w: 1 },
          { u: 2, v: 4, w: 1 },
          { u: 3, v: 4, w: 0 },
        ];

    const isPathEdge = (u: number, v: number) => {
      if (!step.shortestPath || step.shortestPath.length < 2) return false;
      for (let i = 0; i < step.shortestPath.length - 1; i++) {
        if (step.shortestPath[i] === u && step.shortestPath[i + 1] === v) return true;
      }
      return false;
    };

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';

        const isAct = step.activeEdge && step.activeEdge.u === e.u && step.activeEdge.v === e.v;
        const onPath = isPathEdge(e.u, e.v);

        let strokeColor = e.w === 0 ? '#10b981' : '#38bdf8';
        let strokeWidth = 2;
        let marker = 'url(#bfs01-arrow)';

        if (onPath) {
          strokeColor = '#c084fc';
          strokeWidth = 3.5;
          marker = 'url(#bfs01-arrow-purple)';
        } else if (isAct) {
          strokeColor = '#facc15';
          strokeWidth = 3;
          marker = 'url(#bfs01-arrow-yellow)';
        }

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        return `
          <g class="graph-edge">
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                  stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />
            <circle cx="${mx}" cy="${my}" r="9" fill="#090d16" stroke="${strokeColor}" stroke-width="1.5" />
            <text x="${mx}" y="${my + 3.5}" fill="${e.w === 0 ? '#34d399' : '#38bdf8'}"
                  font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">
              ${e.w}
            </text>
          </g>
        `;
      })
      .join('');

    const nodes = is5 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';

        const isCur = step.curU === u && step.status !== 'done';
        const onPath = step.shortestPath && step.shortestPath.includes(u);
        const dVal = step.distArray[u - 1];
        const dStr = dVal === 999 || dVal === undefined ? '∞' : `${dVal}`;

        const bg = onPath ? '#581c87' : isCur ? '#b45309' : dVal < 999 ? '#065f46' : '#0f172a';
        const border = onPath ? '#c084fc' : isCur ? '#facc15' : dVal < 999 ? '#10b981' : '#475569';
        const strokeWidth = onPath || isCur ? 3 : 2;

        const halo = isCur
          ? `<circle cx="${p.x}" cy="${p.y}" r="27" fill="none" stroke="#facc15" stroke-width="2" stroke-dasharray="4 3" opacity="0.85" />`
          : '';

        return `
          <g class="graph-node" data-node="${u}">
            ${halo}
            <circle cx="${p.x}" cy="${p.y}" r="19" fill="${bg}" stroke="${border}" stroke-width="${strokeWidth}" />
            <text x="${p.x}" y="${p.y + 4.5}" fill="#ffffff" font-size="12" font-weight="800" font-family="monospace" text-anchor="middle">
              ${u}
            </text>
            <rect x="${p.x - 20}" y="${p.y + 24}" width="40" height="15" rx="3" fill="rgba(15, 23, 42, 0.9)" stroke="${border}" stroke-width="1" />
            <text x="${p.x}" y="${p.y + 35}" fill="${dVal < 999 ? '#34d399' : '#94a3b8'}" font-size="9" font-weight="700" text-anchor="middle">
              d:${dStr}
            </text>
          </g>
        `;
      })
      .join('');

    // 双端队列 Deque 槽位纯 SVG 投影
    const dequeX = 50;
    const dequeY = 220;
    const dequeSlotsHtml = step.dequeList.length > 0
      ? step.dequeList.map((item, idx) => {
          const slotX = dequeX + idx * 76;
          const isFirst = idx === 0;
          const slotBorder = isFirst ? '#facc15' : '#38bdf8';
          const slotBg = isFirst ? 'rgba(234, 179, 8, 0.15)' : 'rgba(15, 23, 42, 0.8)';
          return `
            <g class="deque-slot" transform="translate(${slotX}, ${dequeY})">
              <rect width="68" height="38" rx="6" fill="${slotBg}" stroke="${slotBorder}" stroke-width="${isFirst ? 2 : 1}" />
              <text x="34" y="14" fill="${isFirst ? '#facc15' : '#94a3b8'}" font-size="8.5" font-weight="700" text-anchor="middle">
                ${isFirst ? '队头 First' : `Slot ${idx}`}
              </text>
              <text x="34" y="29" fill="#f8fafc" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">
                N${item.u} (d=${item.dist})
              </text>
            </g>
          `;
        }).join('')
      : `
        <text x="160" y="${dequeY + 24}" fill="#64748b" font-size="12" font-weight="600" text-anchor="middle">
          (双端队列为空)
        </text>
      `;

    container.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%; min-height: 380px; background: #090d16; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
        <div style="position: absolute; top: 12px; left: 16px; display: flex; gap: 8px; align-items: center; z-index: 10; pointer-events: none;">
          <span style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(16, 185, 129, 0.4); padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; color: #34d399; font-weight: 700;">
            到达终点耗费: ${step.distArray[n - 1] === 999 ? '∞' : step.distArray[n - 1]}
          </span>
          <span style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.4); padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; color: #38bdf8; font-weight: 600;">
            Deque 队列: ${step.dequeList.length} 个元素
          </span>
        </div>

        <svg width="100%" height="100%" viewBox="0 0 520 280" style="flex: 1; display: block;">
          <defs>
            <marker id="bfs01-arrow" viewBox="0 0 10 10" refX="23" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>
            <marker id="bfs01-arrow-yellow" viewBox="0 0 10 10" refX="23" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#facc15" />
            </marker>
            <marker id="bfs01-arrow-purple" viewBox="0 0 10 10" refX="23" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#c084fc" />
            </marker>
          </defs>
          ${svgEdges}
          ${svgNodes}

          <!-- 双端队列背景导轨与槽位 -->
          <g class="deque-dock">
            <line x1="30" y1="210" x2="490" y2="210" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />
            <text x="35" y="202" fill="#94a3b8" font-size="10" font-weight="700">📦 双端队列 Deque 导轨</text>
            ${dequeSlotsHtml}
          </g>
        </svg>
      </div>
    `;
  }
}
