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
            ? `<circle cx="${pos.x}" cy="${pos.y}" r="27" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="3 3" opacity="0.8">
                 <animateTransform attributeName="transform" type="rotate" from="0 ${pos.x} ${pos.y}" to="360 ${pos.x} ${pos.y}" dur="8s" repeatCount="indefinite" />
               </circle>`
            : ''
        }
        <circle cx="${pos.x}" cy="${pos.y}" r="22" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2.5" />
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
  const { adjMatrix, adjList, vCount, eCount, graphType, highlightEdge } = step;

  // 1. 邻接矩阵 5x5 表格
  let matrixRows = `
    <tr class="text-[9.5px] text-slate-400 font-mono">
      <th class="p-1">#</th>
      ${[0, 1, 2, 3, 4].map((j) => `<th class="p-1">${j}</th>`).join('')}
    </tr>
  `;

  for (let i = 0; i < 5; i++) {
    const cells = adjMatrix[i]
      .map((val, j) => {
        const isHlCell =
          highlightEdge !== null &&
          ((highlightEdge[0] === i && highlightEdge[1] === j) ||
            (highlightEdge[0] === j && highlightEdge[1] === i));

        const bg = isHlCell
          ? 'bg-amber-500/30 text-amber-300 font-extrabold border border-amber-500/60'
          : val === 1
          ? 'bg-sky-500/20 text-sky-300 font-bold'
          : 'text-slate-600';

        return `<td class="p-1 text-center font-mono ${bg} rounded">${val}</td>`;
      })
      .join('');

    matrixRows += `
      <tr class="text-[10px]">
        <td class="p-1 text-slate-400 font-mono font-bold text-center">${i}</td>
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
          ? '<span class="text-slate-500 text-[10px] italic">空</span>'
          : neighbors
              .map((v) => {
                const isHl =
                  highlightEdge !== null &&
                  ((highlightEdge[0] === u && highlightEdge[1] === v) ||
                    (highlightEdge[0] === v && highlightEdge[1] === u));
                return `
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isHl
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/60'
                      : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                  }">
                    ${v}
                  </span>
                `;
              })
              .join('');

      return `
        <div class="flex items-center gap-2 py-0.5 border-b border-slate-800/40 last:border-b-0">
          <span class="w-7 text-right font-mono font-bold text-sky-400 text-[10px]">Node ${u}:</span>
          <div class="flex flex-wrap items-center gap-1">${neighborPills}</div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="w-full flex flex-col gap-3 p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl text-xs">
      <!-- 双视舱对照网格 -->
      <div class="grid grid-cols-2 gap-3">
        <!-- 邻接矩阵视舱 -->
        <div class="flex flex-col gap-1.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
          <div class="flex items-center justify-between text-slate-300 font-semibold text-[11px]">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-sky-400"></span>
              邻接矩阵 (O(V²))
            </span>
            <span class="text-[9.5px] font-mono text-sky-300">5x5 对称</span>
          </div>
          <table class="w-full border-collapse">
            ${matrixRows}
          </table>
        </div>

        <!-- 邻接表视舱 -->
        <div class="flex flex-col gap-1.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
          <div class="flex items-center justify-between text-slate-300 font-semibold text-[11px]">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              邻接表 (O(V+E))
            </span>
            <span class="text-[9.5px] font-mono text-emerald-300">各点出边链</span>
          </div>
          <div class="flex flex-col justify-center">
            ${listRowsHtml}
          </div>
        </div>
      </div>

      <!-- 核心指标状态汇总 -->
      <div class="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/60 text-[11px]">
        <div class="p-1.5 rounded bg-slate-800/40 text-center">
          <div class="text-slate-400 text-[10px]">图状态</div>
          <div class="font-mono font-bold text-amber-400">${graphType}</div>
        </div>
        <div class="p-1.5 rounded bg-slate-800/40 text-center">
          <div class="text-slate-400 text-[10px]">顶点总数 (V)</div>
          <div class="font-mono font-bold text-sky-400">${vCount}</div>
        </div>
        <div class="p-1.5 rounded bg-slate-800/40 text-center">
          <div class="text-slate-400 text-[10px]">边总数 (E)</div>
          <div class="font-mono font-bold text-emerald-400">${eCount}</div>
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
