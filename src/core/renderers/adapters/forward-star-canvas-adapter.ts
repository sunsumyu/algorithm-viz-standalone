import { ForwardStarStep } from '../../../algorithms/categories/graph/forward-star-step-compiler';

const NODE_COORDINATES: Record<number, { x: number; y: number }> = {
  1: { x: 60, y: 60 },
  2: { x: 170, y: 40 },
  3: { x: 80, y: 170 },
  4: { x: 190, y: 160 },
  5: { x: 130, y: 105 },
  6: { x: 220, y: 90 },
};

export class ForwardStarCanvasAdapter {
  public static render(container: HTMLElement, step: ForwardStarStep): void {
    const {
      head,
      edges,
      curEdgeIndex,
      curNode,
      targetNode,
      traversedEdges,
      allNodes,
      allRawEdges,
      startNode,
      mode,
    } = step;

    // 1. 左侧 SVG 拓扑网络边
    const svgEdges = allRawEdges
      .map((e, idx) => {
        const from = NODE_COORDINATES[e.u] || { x: 50 + (e.u * 35) % 150, y: 50 + (e.u * 25) % 150 };
        const to = NODE_COORDINATES[e.v] || { x: 50 + (e.v * 35) % 150, y: 50 + (e.v * 25) % 150 };
        const isCurrent = curEdgeIndex !== null && edges[curEdgeIndex] && edges[curEdgeIndex].u === e.u && edges[curEdgeIndex].to === e.v;
        const isTraversed = traversedEdges.some((tIdx) => edges[tIdx] && edges[tIdx].u === e.u && edges[tIdx].to === e.v);
        const isExistingInBuild = mode === 'build' ? idx <= (curEdgeIndex ?? -1) : true;

        if (!isExistingInBuild) {
          return '';
        }

        let strokeColor = 'rgba(148, 163, 184, 0.4)';
        let strokeWidth = 1.8;
        let marker = 'url(#fs-arrow-default)';

        if (isCurrent) {
          strokeColor = '#facc15';
          strokeWidth = 3;
          marker = 'url(#fs-arrow-active)';
        } else if (isTraversed) {
          strokeColor = '#34d399';
          strokeWidth = 2.5;
          marker = 'url(#fs-arrow-traversed)';
        }

        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;

        return `
          <g class="graph-edge">
            <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"
                  stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />
            <circle cx="${mx}" cy="${my}" r="7.5" fill="#090d16" stroke="${strokeColor}" stroke-width="1.2" />
            <text x="${mx}" y="${my + 3}" font-size="8.5" font-family="monospace" font-weight="700"
                  text-anchor="middle" fill="${strokeColor}">${e.w}</text>
          </g>
        `;
      })
      .join('');

    // 左侧 SVG 拓扑节点
    const svgNodes = allNodes
      .map((u) => {
        const pos = NODE_COORDINATES[u] || { x: 50 + (u * 35) % 150, y: 50 + (u * 25) % 150 };
        const isSource = curNode === u;
        const isTarget = targetNode === u;
        const isStart = startNode === u && mode === 'traverse';

        let fill = '#0f172a';
        let stroke = '#475569';
        let textFill = '#f8fafc';

        if (isSource) {
          fill = '#1e3a8a';
          stroke = '#38bdf8';
          textFill = '#bae6fd';
        } else if (isTarget) {
          fill = '#064e3b';
          stroke = '#34d399';
          textFill = '#a7f3d0';
        } else if (isStart) {
          fill = '#78350f';
          stroke = '#facc15';
          textFill = '#fef08a';
        }

        const halo = isSource || isStart
          ? `<circle cx="${pos.x}" cy="${pos.y}" r="22" fill="none" stroke="${stroke}" stroke-width="2" stroke-dasharray="3 3" opacity="0.8" />`
          : '';

        return `
          <g class="graph-node" data-node="${u}">
            ${halo}
            <circle cx="${pos.x}" cy="${pos.y}" r="15" fill="${fill}" stroke="${stroke}" stroke-width="2" />
            <text x="${pos.x}" y="${pos.y + 4.5}" font-size="11" font-weight="800" font-family="monospace"
                  text-anchor="middle" fill="${textFill}">${u}</text>
          </g>
        `;
      })
      .join('');

    // 右侧 SVG: head 数组槽位与 edge 内存池轻量可视化
    const headBoxes = allNodes.slice(0, 6).map((u, i) => {
      const hVal = head[u] ?? -1;
      const isCur = curNode === u;
      const boxX = 270 + i * 44;
      const boxY = 40;
      const border = isCur ? '#38bdf8' : '#334155';
      const bg = isCur ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.7)';
      return `
        <g transform="translate(${boxX}, ${boxY})">
          <rect width="40" height="34" rx="5" fill="${bg}" stroke="${border}" stroke-width="${isCur ? 2 : 1}" />
          <text x="20" y="12" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">u=${u}</text>
          <text x="20" y="27" fill="${hVal === -1 ? '#64748b' : '#38bdf8'}" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">
            ${hVal === -1 ? '-1' : `#${hVal}`}
          </text>
        </g>
      `;
    }).join('');

    // edge 静态链表池展示 (最多前 5 条边)
    const edgeBoxes = edges.slice(0, 5).map((ed, i) => {
      const isCur = curEdgeIndex === i;
      const isTraversed = traversedEdges.includes(i);
      const eY = 105 + i * 26;
      let border = '#334155';
      let bg = 'rgba(15, 23, 42, 0.6)';
      if (isCur) {
        border = '#facc15';
        bg = 'rgba(234, 179, 8, 0.15)';
      } else if (isTraversed) {
        border = '#34d399';
        bg = 'rgba(52, 211, 153, 0.15)';
      }

      return `
        <g transform="translate(270, ${eY})">
          <rect width="250" height="22" rx="4" fill="${bg}" stroke="${border}" stroke-width="1" />
          <text x="8" y="15" fill="${isCur ? '#facc15' : '#94a3b8'}" font-size="9" font-family="monospace" font-weight="700">#${i}</text>
          <text x="40" y="15" fill="#f8fafc" font-size="9.5" font-family="monospace">${ed.u} ➔ ${ed.to}</text>
          <text x="110" y="15" fill="#a78bfa" font-size="9" font-family="monospace">next: ${ed.next === -1 ? '-1' : `#${ed.next}`}</text>
          <text x="180" y="15" fill="#34d399" font-size="9" font-family="monospace">w: ${ed.weight}</text>
        </g>
      `;
    }).join('');

    container.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%; min-height: 380px; background: #090d16; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
        <div style="position: absolute; top: 12px; left: 16px; display: flex; gap: 8px; align-items: center; z-index: 10; pointer-events: none;">
          <span style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.4); padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; color: #38bdf8; font-weight: 700;">
            模式: ${mode === 'build' ? '⚡ 头插建图' : '🔍 出边遍历'}
          </span>
          <span style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(52, 211, 153, 0.4); padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; color: #34d399; font-weight: 700;">
            已录入边数: ${edges.length}
          </span>
        </div>

        <svg width="100%" height="100%" viewBox="0 0 540 240" style="flex: 1; display: block;">
          <defs>
            <marker id="fs-arrow-default" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8" />
            </marker>
            <marker id="fs-arrow-active" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#facc15" />
            </marker>
            <marker id="fs-arrow-traversed" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#34d399" />
            </marker>
          </defs>

          <!-- 左侧：图拓扑网络 -->
          <g class="topology-layer">
            ${svgEdges}
            ${svgNodes}
          </g>

          <!-- 右侧：head[] 数组与 edge[] 内存池图示 -->
          <g class="memory-pool-layer">
            <line x1="250" y1="20" x2="250" y2="230" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />
            <text x="270" y="30" fill="#94a3b8" font-size="10" font-weight="700">📌 head[u] 入口数组</text>
            ${headBoxes}
            <text x="270" y="96" fill="#94a3b8" font-size="10" font-weight="700">🥞 edge[] 静态链表内存池 (to, next, weight)</text>
            ${edgeBoxes}
          </g>
        </svg>
      </div>
    `;
  }
}
