/**
 * 拓扑 DP 画布渲染适配器 (TopoDPCanvasAdapter)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 纯净 SVG 有向无环工程网络沙盘渲染、零内联表格与芯片条、统一 visualState 状态规范
 */

import {
  type TopoDPStep,
  TOPO_DP_COORDS_4,
  TOPO_DP_COORDS_5,
  TOPO_DP_EDGES_4,
  TOPO_DP_EDGES_5,
} from '../../../algorithms/categories/graph/topo-dp-step-compiler';

export function renderTopoDPCanvas(container: HTMLElement, step: TopoDPStep): void {
  const is5Node = Object.keys(step.dpDist).length === 5;
  const n = is5Node ? 5 : 4;
  const nodeCoords = is5Node ? TOPO_DP_COORDS_5 : TOPO_DP_COORDS_4;
  const edges = is5Node ? TOPO_DP_EDGES_5 : TOPO_DP_EDGES_4;

  const isCriticalEdge = (u: number, v: number) => {
    if (!step.criticalPath) return false;
    const idx = step.criticalPath.indexOf(u);
    return idx !== -1 && step.criticalPath[idx + 1] === v;
  };

  const svgEdges = edges
    .map((e) => {
      const p1 = nodeCoords[e.u];
      const p2 = nodeCoords[e.v];
      if (!p1 || !p2) return '';

      const isAct = step.activeEdge && step.activeEdge.u === e.u && step.activeEdge.v === e.v;
      const isCrit = isCriticalEdge(e.u, e.v);

      const color = isAct ? '#facc15' : isCrit ? '#10b981' : '#94a3b8';
      const width = isCrit ? 3.5 : isAct ? 3 : 1.8;

      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;

      return `
        <g>
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" marker-end="url(#topo-dp-arrow)" />
          <rect x="${mx - 8}" y="${my - 7}" width="16" height="13" rx="3" fill="#ffffff" stroke="${color}" stroke-width="1" />
          <text x="${mx}" y="${my + 2.5}" fill="#0f172a" font-size="8.5" font-weight="800" font-family="monospace" text-anchor="middle">${e.w}</text>
        </g>
      `;
    })
    .join('');

  const nodes = is5Node ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];
  const svgNodes = nodes
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';

      const isCur = step.curNode === u && step.status !== 'done';
      const inQueue = step.topoQueue.includes(u);
      const isCritNode = step.criticalPath && step.criticalPath.includes(u);

      let fill = '#ffffff';
      let stroke = '#cbd5e1';
      let textFill = '#0f172a';

      if (isCur) {
        fill = '#fef08a';
        stroke = '#eab308';
        textFill = '#854d0e';
      } else if (isCritNode) {
        fill = '#dcfce7';
        stroke = '#10b981';
        textFill = '#166534';
      } else if (inQueue) {
        fill = '#dbeafe';
        stroke = '#3b82f6';
        textFill = '#1e40af';
      }

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="17" fill="${fill}" stroke="${stroke}" stroke-width="${isCur || isCritNode ? 2.5 : 1.8}" />
          <text x="${p.x}" y="${p.y + 4}" fill="${textFill}" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          <rect x="${p.x - 17}" y="${p.y + 22}" width="34" height="13" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8" />
          <text x="${p.x}" y="${p.y + 31}" fill="${isCritNode ? '#15803d' : '#64748b'}" font-size="8.5" font-family="monospace" font-weight="700" text-anchor="middle">dp:${step.dpDist[u] || 0}</text>
        </g>
      `;
    })
    .join('');

  const svgHtml = `
    <svg style="width: 100%; height: 100%; max-height: 240px;" viewBox="0 0 310 160">
      <defs>
        <marker id="topo-dp-arrow" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
        </marker>
      </defs>
      ${svgEdges}
      ${svgNodes}
    </svg>
  `;

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 4px; box-sizing: border-box;">
      <div style="width: 100%; max-width: 600px; height: 100%; max-height: 250px; display: flex; align-items: center; justify-content: center;">
        ${svgHtml}
      </div>
    </div>
  `;
}

export class TopoDPCanvasAdapter {
  public static render(container: HTMLElement, step: TopoDPStep): void {
    renderTopoDPCanvas(container, step);
  }
}
