/**
 * 图论理论基础 (Graph Theory) — 领域视觉适配器
 * 遵循 Matt Pocock 深模块哲学：
 * Card 1: 100% 纯 SVG 五边形环状拓扑沙盘 (Zero Outer Div)
 * Card 2: 邻接矩阵与邻接表双视舱监视器 (Dual Representation Monitor)
 */

import {
  type GTStep,
  GRAPH_THEORY_NODE_POSITIONS,
} from '../../../algorithms/categories/graph/graph-theory-step-compiler';

export function renderGraphTheoryCanvas(container: HTMLElement, step: GTStep): void {
  const { nodes, edges, highlightEdge, highlightAction, adjList } = step;

  const width = 600;
  const height = 300;

  // 1. 边连线层
  let edgesSvg = '';
  const edgeKeys = new Set<string>();

  for (const [u, v] of edges) {
    edgeKeys.add(`${Math.min(u, v)}-${Math.max(u, v)}`);
    const p1 = GRAPH_THEORY_NODE_POSITIONS[u];
    const p2 = GRAPH_THEORY_NODE_POSITIONS[v];
    if (!p1 || !p2) continue;

    const isHl =
      highlightEdge !== null &&
      ((highlightEdge[0] === u && highlightEdge[1] === v) ||
        (highlightEdge[0] === v && highlightEdge[1] === u));

    let stroke = '#475569';
    let strokeWidth = 2;
    let strokeDash = '';

    if (isHl) {
      if (highlightAction === 'add') {
        stroke = '#10b981';
        strokeWidth = 3.5;
        strokeDash = 'stroke-dasharray="5 3"';
      } else if (highlightAction === 'remove') {
        stroke = '#ef4444';
        strokeWidth = 3.5;
        strokeDash = 'stroke-dasharray="4 4"';
      }
    } else {
      stroke = '#38bdf8';
    }

    edgesSvg += `
      <line
        x1="${p1.x}" y1="${p1.y}"
        x2="${p2.x}" y2="${p2.y}"
        stroke="${stroke}"
        stroke-width="${strokeWidth}"
        ${strokeDash}
        stroke-linecap="round"
        opacity="${isHl ? '1' : '0.75'}"
      />
    `;
  }

  // 渲染正在被删除的边缘动态残影 (红色虚线)
  if (highlightAction === 'remove' && highlightEdge !== null) {
    const [ru, rv] = highlightEdge;
    const rKey = `${Math.min(ru, rv)}-${Math.max(ru, rv)}`;
    if (!edgeKeys.has(rKey)) {
      const p1 = GRAPH_THEORY_NODE_POSITIONS[ru];
      const p2 = GRAPH_THEORY_NODE_POSITIONS[rv];
      if (p1 && p2) {
        edgesSvg += `
          <line
            x1="${p1.x}" y1="${p1.y}"
            x2="${p2.x}" y2="${p2.y}"
            stroke="#ef4444"
            stroke-width="3.5"
            stroke-dasharray="4 4"
            stroke-linecap="round"
            opacity="1"
          />
        `;
      }
    }
  }

  // 2. 节点图元层
  let nodesSvg = '';
  for (const u of nodes) {
    const pos = GRAPH_THEORY_NODE_POSITIONS[u];
    if (!pos) continue;

    const degree = adjList[u]?.length ?? 0;
    const isIncident =
      highlightEdge !== null && (highlightEdge[0] === u || highlightEdge[1] === u);

    const strokeColor = isIncident ? '#f59e0b' : '#38bdf8';
    const fillColor = isIncident ? '#78350f' : '#0f172a';

    nodesSvg += `
      <g class="gt-node-group">
        ${
          isIncident
            ? `<circle cx="${pos.x}" cy="${pos.y}" r="30" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3 3" opacity="0.8">
                 <animateTransform attributeName="transform" type="rotate" from="0 ${pos.x} ${pos.y}" to="360 ${pos.x} ${pos.y}" dur="8s" repeatCount="indefinite" />
               </circle>`
            : ''
        }
        <circle cx="${pos.x}" cy="${pos.y}" r="24" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2.5" />
        <text x="${pos.x}" y="${pos.y + 6}" text-anchor="middle" fill="${isIncident ? '#fef08a' : '#f8fafc'}" font-size="15" font-weight="800" font-family="monospace">${u}</text>
        <text x="${pos.x}" y="${pos.y - 28}" text-anchor="middle" fill="#94a3b8" font-size="9" font-weight="700" font-family="sans-serif">度数: ${degree}</text>
      </g>
    `;
  }

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-full select-none" style="max-height: 320px;" preserveAspectRatio="xMidYMid meet">
      <!-- 环状五边形外轮廓导引 -->
      <polygon
        points="300,50 470,130 420,250 180,250 130,130"
        fill="rgba(56, 189, 248, 0.03)"
        stroke="rgba(148, 163, 184, 0.15)"
        stroke-dasharray="3 4"
      />
      <!-- 边连线层 -->
      <g class="gt-edges-layer">
        ${edgesSvg}
      </g>
      <!-- 顶点图元层 -->
      <g class="gt-nodes-layer">
        ${nodesSvg}
      </g>
    </svg>
  `;
}

export function renderGraphTheoryCustomMetrics(container: HTMLElement, step: GTStep): void {
  const { adjMatrix, adjList, highlightEdge } = step;

  // 1. 邻接矩阵 5x5 表格
  let matrixRows = `
    <tr style="font-size: 9px; color: #64748b; font-family: monospace;">
      <th style="padding: 2px;">#</th>
      ${[0, 1, 2, 3, 4].map((j) => `<th style="padding: 2px;">${j}</th>`).join('')}
    </tr>
  `;

  for (let i = 0; i < 5; i++) {
    const cells = adjMatrix[i]
      .map((val, j) => {
        const isHlCell =
          highlightEdge !== null &&
          ((highlightEdge[0] === i && highlightEdge[1] === j) ||
            (highlightEdge[0] === j && highlightEdge[1] === i));

        const cellStyle = isHlCell
          ? 'background: #fef3c7; color: #b45309; font-weight: 800; border: 1.5px solid #f59e0b; border-radius: 4px;'
          : val === 1
          ? 'background: #e0f2fe; color: #0369a1; font-weight: 700; border-radius: 4px;'
          : 'color: #94a3b8; font-weight: 400;';

        return `<td style="padding: 2px 4px; text-align: center; font-family: monospace; font-size: 10px; ${cellStyle}">${val}</td>`;
      })
      .join('');

    matrixRows += `
      <tr>
        <td style="padding: 2px; color: #64748b; font-family: monospace; font-weight: 700; text-align: center; font-size: 9.5px;">${i}</td>
        ${cells}
      </tr>
    `;
  }

  // 2. 邻接表行
  const listRowsHtml = [0, 1, 2, 3, 4]
    .map((u) => {
      const neighbors = adjList[u] ?? [];
      const neighborPills =
        neighbors.length === 0
          ? '<span style="color: #94a3b8; font-size: 9.5px; font-style: italic;">空</span>'
          : neighbors
              .map((v) => {
                const isHl =
                  highlightEdge !== null &&
                  ((highlightEdge[0] === u && highlightEdge[1] === v) ||
                    (highlightEdge[0] === v && highlightEdge[1] === u));
                return `
                  <span style="display: inline-flex; align-items: center; padding: 1px 5px; border-radius: 4px; font-size: 9.5px; font-family: monospace; font-weight: 700; ${
                    isHl
                      ? 'background: #fef3c7; color: #b45309; border: 1px solid #f59e0b;'
                      : 'background: #ecfdf5; color: #065f46; border: 1px solid #6ee7b7;'
                  }">
                    ${v}
                  </span>
                `;
              })
              .join('');

      return `
        <div style="display: flex; align-items: center; gap: 6px; padding: 2px 0; border-bottom: 1px dashed #f1f5f9;">
          <span style="width: 48px; text-align: right; font-family: monospace; font-weight: 700; color: #0284c7; font-size: 9.5px;">Node ${u}:</span>
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 3px;">${neighborPills}</div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; box-sizing: border-box;">
      <!-- 邻接矩阵视舱 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 5px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 5px;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #0284c7;"></span>
            邻接矩阵 (O(V²))
          </span>
          <span style="font-size: 9.5px; font-family: monospace; color: #0284c7; font-weight: 700;">5×5 对称</span>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 2px;">
          ${matrixRows}
        </table>
      </div>

      <!-- 邻接表视舱 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 5px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 5px;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #059669;"></span>
            邻接表 (O(V+E))
          </span>
          <span style="font-size: 9.5px; font-family: monospace; color: #059669; font-weight: 700;">出边链表</span>
        </div>
        <div style="display: flex; flex-direction: column; justify-content: center; margin-top: 2px;">
          ${listRowsHtml}
        </div>
      </div>
    </div>
  `;
}

export class GraphTheoryCanvasAdapter {
  mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  updateStep(container: HTMLElement, step: unknown): void {
    const gtStep = step as GTStep;
    if (!gtStep) return;
    renderGraphTheoryCanvas(container, gtStep);
  }

  dispose(container: HTMLElement): void {
    container.innerHTML = '';
  }
}
