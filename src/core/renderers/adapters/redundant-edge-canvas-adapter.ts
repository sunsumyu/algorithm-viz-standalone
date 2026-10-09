/**
 * 冗余连接画布渲染适配器 (RedundantEdgeCanvasAdapter)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 纯净 SVG 拓扑网络沙盘渲染、零内联表格与芯片条、统一 visualState 状态规范
 */

import {
  RE_EDGES,
  RE_NODES,
  RE_NODE_POSITIONS,
  type RedundantStep,
} from '../../../algorithms/categories/graph/redundant-edge-step-compiler';

export function renderRedundantEdgeCanvas(container: HTMLElement, step: RedundantStep): void {
  const { currentEdge, treeEdges, redundantEdge, parent, action } = step;

  let svgHtml = `<svg viewBox="0 0 460 250" style="width:100%; height:100%; max-height:240px;">
    <defs>
      <filter id="re-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>`;

  // 1. 绘制边
  for (const e of RE_EDGES) {
    const p1 = RE_NODE_POSITIONS[e[0] - 1];
    const p2 = RE_NODE_POSITIONS[e[1] - 1];
    const isCurrent = currentEdge && currentEdge[0] === e[0] && currentEdge[1] === e[1];
    const isTree = treeEdges.some((te) => (te[0] === e[0] && te[1] === e[1]) || (te[0] === e[1] && te[1] === e[0]));
    const isRedundant = redundantEdge && redundantEdge[0] === e[0] && redundantEdge[1] === e[1];

    let strokeColor = '#cbd5e1';
    let strokeWidth = 2;
    let strokeDash = 'none';

    if (isRedundant) {
      strokeColor = '#ef4444';
      strokeWidth = 4;
      strokeDash = '5,5';
    } else if (isCurrent && action === 'found-redundant') {
      strokeColor = '#ef4444';
      strokeWidth = 4;
      strokeDash = '5,5';
    } else if (isTree) {
      strokeColor = '#10b981';
      strokeWidth = 3.5;
    } else if (isCurrent) {
      strokeColor = '#3b82f6';
      strokeWidth = 3;
    }

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" />`;
  }

  // 2. 绘制节点
  RE_NODES.forEach((node) => {
    const p = RE_NODE_POSITIONS[node - 1];
    const isCurrentNode = currentEdge && (currentEdge[0] === node || currentEdge[1] === node);

    let fill = '#ffffff';
    let stroke = '#cbd5e1';
    let textFill = '#0f172a';

    if (isCurrentNode && (action === 'found-redundant' || action === 'done')) {
      fill = '#fee2e2';
      stroke = '#ef4444';
      textFill = '#991b1b';
    } else if (isCurrentNode) {
      fill = '#dbeafe';
      stroke = '#3b82f6';
      textFill = '#1e40af';
    }

    svgHtml += `
      <g>
        <circle cx="${p.x}" cy="${p.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
        <text x="${p.x}" y="${p.y + 4.5}" fill="${textFill}" font-size="12" font-weight="800" text-anchor="middle" font-family="monospace">${node}</text>
        <rect x="${p.x - 16}" y="${p.y + 22}" width="32" height="13" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8" />
        <text x="${p.x}" y="${p.y + 31}" fill="#64748b" font-size="9" font-family="monospace" font-weight="700" text-anchor="middle">p:${parent[node]}</text>
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

export class RedundantEdgeCanvasAdapter {
  public static render(container: HTMLElement, step: RedundantStep): void {
    renderRedundantEdgeCanvas(container, step);
  }
}
