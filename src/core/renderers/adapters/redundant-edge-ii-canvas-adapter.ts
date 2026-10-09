/**
 * 冗余连接 II 画布渲染适配器 (RedundantEdgeIICanvasAdapter)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 纯净 SVG 有向拓扑沙盘渲染、零内联表格与芯片条、统一 visualState 状态规范
 */

import {
  RE2_EDGES,
  RE2_NODES,
  RE2_NODE_POSITIONS,
  type RedundantIIStep,
} from '../../../algorithms/categories/graph/redundant-edge-ii-step-compiler';

export function renderRedundantEdgeIICanvas(container: HTMLElement, step: RedundantIIStep): void {
  const { edges, inDegree, conflictIndex, cycleIndex, currentEdgeIndex, resultEdge } = step;

  let svgHtml = `<svg viewBox="0 0 460 250" style="width:100%; height:100%; max-height:240px;">
    <defs>
      <marker id="re2-arrow-normal" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
      </marker>
      <marker id="re2-arrow-cur" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#3b82f6" />
      </marker>
      <marker id="re2-arrow-red" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
      </marker>
    </defs>`;

  edges.forEach((e, idx) => {
    const p1 = RE2_NODE_POSITIONS[e[0] - 1];
    const p2 = RE2_NODE_POSITIONS[e[1] - 1];
    const isCur = currentEdgeIndex === idx;
    const isResult = resultEdge && resultEdge[0] === e[0] && resultEdge[1] === e[1];
    const isConflict = conflictIndex === idx;
    const isCycle = cycleIndex === idx;

    let strokeColor = '#94a3b8';
    let strokeWidth = 2;
    let strokeDash = 'none';
    let marker = 'url(#re2-arrow-normal)';

    if (isResult) {
      strokeColor = '#ef4444';
      strokeWidth = 4;
      strokeDash = '5,5';
      marker = 'url(#re2-arrow-red)';
    } else if (isConflict) {
      strokeColor = '#f59e0b';
      strokeWidth = 3;
      strokeDash = '4,4';
    } else if (isCycle) {
      strokeColor = '#ec4899';
      strokeWidth = 3;
    } else if (isCur) {
      strokeColor = '#3b82f6';
      strokeWidth = 3.5;
      marker = 'url(#re2-arrow-cur)';
    }

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" marker-end="${marker}" />`;
  });

  RE2_NODES.forEach((node) => {
    const p = RE2_NODE_POSITIONS[node - 1];
    const isCurNode = currentEdgeIndex >= 0 && (edges[currentEdgeIndex][0] === node || edges[currentEdgeIndex][1] === node);

    let fill = '#ffffff';
    let stroke = '#cbd5e1';
    let textFill = '#0f172a';

    if (isCurNode) {
      fill = '#dbeafe';
      stroke = '#3b82f6';
      textFill = '#1e40af';
    }

    svgHtml += `
      <g>
        <circle cx="${p.x}" cy="${p.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
        <text x="${p.x}" y="${p.y + 4.5}" fill="${textFill}" font-size="12" font-weight="800" text-anchor="middle" font-family="monospace">${node}</text>
        <rect x="${p.x - 16}" y="${p.y + 22}" width="32" height="13" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8" />
        <text x="${p.x}" y="${p.y + 31}" fill="#64748b" font-size="9" font-family="monospace" font-weight="700" text-anchor="middle">in:${inDegree[node]}</text>
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

export class RedundantEdgeIICanvasAdapter {
  public static render(container: HTMLElement, step: RedundantIIStep): void {
    renderRedundantEdgeIICanvas(container, step);
  }
}
