/**
 * Tarjan 强连通分量与 DAG 缩点 (Tarjan SCC & Condensation) 领域视觉适配器
 * 核心：原图有向弧拓扑、时间戳追溯值标注、强连通分量染色、右侧 DAG 缩点超节点与跨分量有向弧
 * 规范：Matt Pocock 深模块架构，Card 1 零 HTML 表格污染，纯净矢量 SVG 画布
 */

import { TarjanSCCStep } from '../../../algorithms/categories/graph/tarjan-scc-dag-step-compiler';

export class TarjanSCCDagCanvasAdapter {
  public static render(container: HTMLElement, step: TarjanSCCStep): void {
    const is5Node = Object.keys(step.dfnMap).length === 5;

    const nodeCoords: Record<number, { x: number; y: number }> = is5Node
      ? {
          1: { x: 50, y: 55 },
          2: { x: 130, y: 135 },
          3: { x: 50, y: 135 },
          4: { x: 210, y: 95 },
          5: { x: 275, y: 95 },
        }
      : {
          1: { x: 60, y: 55 },
          2: { x: 140, y: 135 },
          3: { x: 60, y: 135 },
          4: { x: 230, y: 95 },
        };

    const allEdges = is5Node
      ? [
          [1, 2],
          [2, 3],
          [3, 1],
          [3, 4],
          [4, 5],
          [5, 4],
        ]
      : [
          [1, 2],
          [2, 3],
          [3, 1],
          [3, 4],
        ];

    const svgEdges = allEdges
      .map(([u, v]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';

        const isAct = step.activeEdge && step.activeEdge[0] === u && step.activeEdge[1] === v;
        const color = isAct ? '#facc15' : 'rgba(100, 116, 139, 0.65)';
        const width = isAct ? 2.8 : 1.5;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const mx = (p1.x + p2.x) / 2 - dy * 0.16;
        const my = (p1.y + p2.y) / 2 + dx * 0.16;

        return `
          <g class="graph-edge">
            <path d="M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}" fill="none" stroke="${color}" stroke-width="${width}" marker-end="url(#tarjan-arrow)" />
          </g>
        `;
      })
      .join('');

    const nodes = is5Node ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isCur = step.curNode === u;
        const inStk = step.inStackMap[u];
        const sccVal = step.sccIdMap[u] || 0;

        const bg = isCur
          ? '#f59e0b'
          : sccVal === 1
            ? '#059669'
            : sccVal === 2
              ? '#7c3aed'
              : sccVal === 3
                ? '#0284c7'
                : '#1e293b';

        const border = isCur
          ? '#facc15'
          : inStk
            ? '#38bdf8'
            : sccVal === 1
              ? '#10b981'
              : sccVal === 2
                ? '#c084fc'
                : '#475569';

        return `
          <g class="graph-node" data-node="${u}">
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isCur || inStk ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 25}" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">d:${step.dfnMap[u] || 0} l:${step.lowMap[u] || 0}</text>
          </g>
        `;
      })
      .join('');

    // 右侧 DAG 缩点超节点与有向跨分量边
    const sccCenters: Record<number, { x: number; y: number }> = {
      1: { x: 360, y: 65 },
      2: { x: 425, y: 145 },
      3: { x: 360, y: 145 },
    };

    const dagSuperNodesHtml = step.sccList
      .map((comp, idx) => {
        const sccId = idx + 1;
        const center = sccCenters[sccId] || { x: 360 + idx * 40, y: 100 };
        const color = sccId === 1 ? '#059669' : sccId === 2 ? '#7c3aed' : '#0284c7';
        const borderColor = sccId === 1 ? '#10b981' : sccId === 2 ? '#c084fc' : '#38bdf8';

        return `
          <g class="dag-scc-node">
            <rect x="${center.x - 26}" y="${center.y - 18}" width="52" height="36" rx="8" fill="${color}" stroke="${borderColor}" stroke-width="1.8" />
            <text x="${center.x}" y="${center.y - 3}" fill="#ffffff" font-size="9" font-weight="800" font-family="monospace" text-anchor="middle">SCC #${sccId}</text>
            <text x="${center.x}" y="${center.y + 11}" fill="#cbd5e1" font-size="7.5" font-family="monospace" text-anchor="middle">{${comp.join(',')}}</text>
          </g>
        `;
      })
      .join('');

    const dagEdgesSvg = step.condensedEdges
      .map(([fu, fv]) => {
        const p1 = sccCenters[fu];
        const p2 = sccCenters[fv];
        if (!p1 || !p2) return '';

        return `
          <g class="dag-condensed-edge">
            <line x1="${p1.x}" y1="${p1.y + 18}" x2="${p2.x}" y2="${p2.y - 18}" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="4,2" marker-end="url(#dag-arrow)" />
          </g>
        `;
      })
      .join('');

    const dagEmptyPlaceholder =
      step.sccList.length === 0
        ? `
          <g class="dag-placeholder">
            <rect x="340" y="70" width="105" height="60" rx="8" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="4,4" />
            <text x="392" y="98" fill="#64748b" font-size="9" font-weight="600" text-anchor="middle">DAG 缩点待构建</text>
            <text x="392" y="114" fill="#475569" font-size="7.5" text-anchor="middle">(结算后呈现超节点)</text>
          </g>
        `
        : '';

    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #020617; padding: 8px; user-select: none; overflow: hidden; box-sizing: border-box;">
        <svg style="width: 100%; height: 100%; max-height: 220px;" viewBox="0 0 470 200">
          <defs>
            <marker id="tarjan-arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
            </marker>
            <marker id="dag-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>
          </defs>

          <!-- 分隔线与分区标题标注 -->
          <line x1="315" y1="20" x2="315" y2="185" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="4,4" />
          <text x="145" y="24" fill="#64748b" font-size="10" font-weight="700" text-anchor="middle">原图拓扑与 Tarjan 追溯 (dfn / low)</text>
          <text x="392" y="24" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">DAG 缩点拓扑超图</text>

          <!-- 原图有向弧与节点 -->
          ${svgEdges}
          ${svgNodes}

          <!-- 右侧 DAG 缩点产物 -->
          ${dagEdgesSvg}
          ${dagSuperNodesHtml}
          ${dagEmptyPlaceholder}
        </svg>
      </div>
    `;
  }
}
