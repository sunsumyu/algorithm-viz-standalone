/**
 * 拓扑排序画布渲染适配器 (TopologicalSortCanvasAdapter)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 纯净 SVG 有向无环图沙盘渲染、零内联表格与芯片条、统一 visualState 状态规范
 */

import {
  TOPO_EDGES,
  TOPO_NODES,
  TOPO_NODE_POSITIONS,
  type TopoStep,
} from '../../../algorithms/categories/graph/topological-sort-step-compiler';

export function renderTopologicalSortCanvas(container: HTMLElement, step: TopoStep): void {
  const { inDegree, queue, order, currentNode, activeEdge } = step;

  // 1. 有向图 SVG 拓扑沙盘
  let svgHtml = `<svg viewBox="0 0 460 260" style="width:100%; height:100%; max-height:240px;">
    <defs>
      <marker id="arrow-topo" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
      </marker>
      <marker id="arrow-topo-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
      </marker>
    </defs>`;

  for (const e of TOPO_EDGES) {
    const p1 = TOPO_NODE_POSITIONS[e.from];
    const p2 = TOPO_NODE_POSITIONS[e.to];
    const isActive = activeEdge && activeEdge.from === e.from && activeEdge.to === e.to;

    const strokeColor = isActive ? '#2563eb' : '#cbd5e1';
    const strokeWidth = isActive ? 3.5 : 2;
    const marker = isActive ? 'url(#arrow-topo-active)' : 'url(#arrow-topo)';

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
  }

  const orderSet = new Set(order);
  const qSet = new Set(queue);

  TOPO_NODES.forEach((node) => {
    const p = TOPO_NODE_POSITIONS[node];
    const isCurrent = currentNode === node;
    const isOrdered = orderSet.has(node);
    const inQueue = qSet.has(node);

    let fill = '#ffffff';
    let stroke = '#cbd5e1';
    let textFill = '#0f172a';

    if (isCurrent) {
      fill = '#fef08a';
      stroke = '#eab308';
      textFill = '#854d0e';
    } else if (isOrdered) {
      fill = '#dcfce7';
      stroke = '#22c55e';
      textFill = '#166534';
    } else if (inQueue) {
      fill = '#dbeafe';
      stroke = '#3b82f6';
      textFill = '#1e40af';
    }

    svgHtml += `
      <g>
        <circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
        <text x="${p.x}" y="${p.y + 4.5}" fill="${textFill}" font-size="12" font-weight="800" text-anchor="middle" font-family="monospace">${node}</text>
        <rect x="${p.x - 16}" y="${p.y + 24}" width="32" height="13" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8" />
        <text x="${p.x}" y="${p.y + 33}" fill="${isOrdered ? '#15803d' : '#64748b'}" font-size="9" font-family="monospace" font-weight="700" text-anchor="middle">in:${inDegree[node]}</text>
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

export class TopologicalSortCanvasAdapter {
  public static render(container: HTMLElement, step: TopoStep): void {
    renderTopologicalSortCanvas(container, step);
  }
}
