/**
 * Kruskal 最小生成树画布渲染适配器 (MstKruskalCanvasAdapter)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 纯净 SVG 无向带权图沙盘渲染、零内联表格与芯片条、统一 visualState 状态规范
 */

import {
  MST_NODES,
  MST_EDGES,
  MST_NODE_POSITIONS,
  type KruskalStep,
} from '../../../algorithms/categories/graph/mst-kruskal-step-compiler';

export function renderMstKruskalCanvas(container: HTMLElement, step: KruskalStep): void {
  const { mstEdges, rejectedEdges, currentEdge, parent, action } = step;

  let svgHtml = `<svg viewBox="0 0 500 250" style="width:100%; height:100%; max-height:240px;">`;

  for (const e of MST_EDGES) {
    const p1 = MST_NODE_POSITIONS[e.u];
    const p2 = MST_NODE_POSITIONS[e.v];
    const isMst = mstEdges.some((me) => (me.u === e.u && me.v === e.v) || (me.u === e.v && me.v === e.u));
    const isRejected = rejectedEdges.some((re) => (re.u === e.u && re.v === e.v) || (re.u === e.v && re.v === e.u));
    const isCurrent = currentEdge && ((currentEdge.u === e.u && currentEdge.v === e.v) || (currentEdge.u === e.v && currentEdge.v === e.u));

    let strokeColor = '#cbd5e1';
    let strokeWidth = 1.8;
    let strokeDash = 'none';

    if (isMst) {
      strokeColor = '#10b981';
      strokeWidth = 3.5;
    } else if (isCurrent && action === 'accept') {
      strokeColor = '#10b981';
      strokeWidth = 4;
    } else if (isCurrent && action === 'reject') {
      strokeColor = '#ef4444';
      strokeWidth = 3;
      strokeDash = '4,4';
    } else if (isCurrent) {
      strokeColor = '#3b82f6';
      strokeWidth = 3.5;
    } else if (isRejected) {
      strokeColor = '#fca5a5';
      strokeWidth = 1.5;
      strokeDash = '3,3';
    }

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2 - 8;

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" />`;
    svgHtml += `<rect x="${midX - 11}" y="${midY - 8}" width="22" height="15" rx="3" fill="#ffffff" stroke="${strokeColor}" stroke-width="1.2" />`;
    svgHtml += `<text x="${midX}" y="${midY + 3.5}" fill="#0f172a" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${e.w}</text>`;
  }

  MST_NODES.forEach((node) => {
    const p = MST_NODE_POSITIONS[node];
    const isCurrentNode = currentEdge && (currentEdge.u === node || currentEdge.v === node);

    let fill = '#ffffff';
    let stroke = '#cbd5e1';
    let textFill = '#0f172a';

    if (isCurrentNode && action === 'accept') {
      fill = '#dcfce7';
      stroke = '#10b981';
      textFill = '#166534';
    } else if (isCurrentNode) {
      fill = '#dbeafe';
      stroke = '#3b82f6';
      textFill = '#1e40af';
    }

    svgHtml += `
      <g>
        <circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
        <text x="${p.x}" y="${p.y + 4.5}" fill="${textFill}" font-size="12" font-weight="800" text-anchor="middle" font-family="monospace">${node}</text>
        <rect x="${p.x - 16}" y="${p.y + 24}" width="32" height="13" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8" />
        <text x="${p.x}" y="${p.y + 33}" fill="#64748b" font-size="9" font-family="monospace" font-weight="700" text-anchor="middle">p:${parent[node]}</text>
      </g>
    `;
  });

  svgHtml += `</svg>`;

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 4px; box-sizing: border-box;">
      <div style="width: 100%; max-width: 600px; height: 100%; max-height: 250px; display: flex; align-items: center; justify-content: center;">
        ${svgHtml}
      </div>
    </div>
  `;
}

export class MstKruskalCanvasAdapter {
  public static render(container: HTMLElement, step: KruskalStep): void {
    renderMstKruskalCanvas(container, step);
  }
}
