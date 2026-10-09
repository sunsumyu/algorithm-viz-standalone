/**
 * 严格次小生成树画布渲染适配器 (SecondMstCanvasAdapter)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 纯净 SVG 无向带权图与破圈换边沙盘渲染、零内联表格与芯片条、统一 visualState 状态规范
 */

import {
  type SecondMstStep,
  SMST_COORDS_4,
  SMST_COORDS_5,
  SMST_EDGES_4,
  SMST_EDGES_5,
} from '../../../algorithms/categories/graph/second-mst-step-compiler';

export function renderSecondMstCanvas(container: HTMLElement, step: SecondMstStep): void {
  const is5Node = step.parentArray.length > 5;
  const nodeCoords = is5Node ? SMST_COORDS_5 : SMST_COORDS_4;
  const edges = is5Node ? SMST_EDGES_5 : SMST_EDGES_4;

  const svgEdges = edges
    .map((e) => {
      const p1 = nodeCoords[e.u];
      const p2 = nodeCoords[e.v];
      if (!p1 || !p2) return '';
      const isTested = step.testedNonTreeEdge && step.testedNonTreeEdge.u === e.u && step.testedNonTreeEdge.v === e.v;
      const isReplaced = step.replacedMstEdge && ((step.replacedMstEdge.u === e.u && step.replacedMstEdge.v === e.v) || (step.replacedMstEdge.u === e.v && step.replacedMstEdge.v === e.u));

      const color = isTested ? '#facc15' : isReplaced ? '#ef4444' : '#10b981';
      const width = isTested || isReplaced ? 3.5 : 2;

      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;

      return `
        <g>
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isTested ? 'stroke-dasharray="4,2"' : ''} />
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
      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="17" fill="#ffffff" stroke="#3b82f6" stroke-width="2" />
          <text x="${p.x}" y="${p.y + 4.5}" fill="#1e40af" font-size="11.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
        </g>
      `;
    })
    .join('');

  const svgHtml = `
    <svg style="width: 100%; height: 100%; max-height: 240px;" viewBox="0 0 310 200">
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

export class SecondMstCanvasAdapter {
  public static render(container: HTMLElement, step: SecondMstStep): void {
    renderSecondMstCanvas(container, step);
  }
}
