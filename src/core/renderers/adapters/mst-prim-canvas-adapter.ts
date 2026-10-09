/**
 * Prim 最小生成树画布渲染适配器 (MstPrimCanvasAdapter)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 纯净 SVG 无向带权图沙盘渲染、零内联表格与芯片条、统一 visualState 状态规范
 */

import {
  MST_NODES,
  MST_EDGES,
  MST_NODE_POSITIONS,
} from '../../../algorithms/categories/graph/mst-kruskal-step-compiler';
import { type PrimStep } from '../../../algorithms/categories/graph/mst-prim-step-compiler';

const INF = Infinity;

export function renderMstPrimCanvas(container: HTMLElement, step: PrimStep): void {
  const { minDist, inMST, mstEdges, currentNode, activeEdge, action } = step;

  let svgHtml = `<svg viewBox="0 0 500 250" style="width:100%; height:100%; max-height:240px;">`;

  for (const e of MST_EDGES) {
    const p1 = MST_NODE_POSITIONS[e.u];
    const p2 = MST_NODE_POSITIONS[e.v];
    const isMst = mstEdges.some((me) => (me.u === e.u && me.v === e.v) || (me.u === e.v && me.v === e.u));
    const isActive = activeEdge && ((activeEdge.u === e.u && activeEdge.v === e.v) || (activeEdge.u === e.v && activeEdge.v === e.u));
    const isCut = (inMST[e.u] && !inMST[e.v]) || (!inMST[e.u] && inMST[e.v]);

    let strokeColor = '#cbd5e1';
    let strokeWidth = 1.8;
    let strokeDash = 'none';

    if (isMst) {
      strokeColor = '#10b981';
      strokeWidth = 3.5;
    } else if (isActive && action === 'update-edge') {
      strokeColor = '#3b82f6';
      strokeWidth = 3;
    } else if (isActive) {
      strokeColor = '#60a5fa';
      strokeWidth = 2.5;
    } else if (isCut) {
      strokeColor = '#f59e0b';
      strokeWidth = 2;
      strokeDash = '4,4';
    }

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2 - 8;

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" />`;
    svgHtml += `<rect x="${midX - 11}" y="${midY - 8}" width="22" height="15" rx="3" fill="#ffffff" stroke="${strokeColor}" stroke-width="1.2" />`;
    svgHtml += `<text x="${midX}" y="${midY + 3.5}" fill="#0f172a" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${e.w}</text>`;
  }

  MST_NODES.forEach((node) => {
    const p = MST_NODE_POSITIONS[node];
    const isIn = inMST[node];
    const isCur = currentNode === node;
    const dVal = minDist[node];
    const dText = dVal === INF ? '∞' : String(dVal);

    let fill = '#ffffff';
    let stroke = '#cbd5e1';
    let textFill = '#0f172a';

    if (isCur) {
      fill = '#fef08a';
      stroke = '#eab308';
      textFill = '#854d0e';
    } else if (isIn) {
      fill = '#dcfce7';
      stroke = '#10b981';
      textFill = '#166534';
    } else if (dVal !== INF) {
      fill = '#eff6ff';
      stroke = '#3b82f6';
      textFill = '#1e40af';
    }

    svgHtml += `
      <g>
        <circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
        <text x="${p.x}" y="${p.y + 4.5}" fill="${textFill}" font-size="12" font-weight="800" text-anchor="middle" font-family="monospace">${node}</text>
        <rect x="${p.x - 18}" y="${p.y + 24}" width="36" height="13" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8" />
        <text x="${p.x}" y="${p.y + 33}" fill="${dVal === INF ? '#94a3b8' : isIn ? '#15803d' : '#2563eb'}" font-size="9" font-family="monospace" font-weight="700" text-anchor="middle">d:${dText}</text>
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

export class MstPrimCanvasAdapter {
  public static render(container: HTMLElement, step: PrimStep): void {
    renderMstPrimCanvas(container, step);
  }
}
