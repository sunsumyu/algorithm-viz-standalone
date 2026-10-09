/**
 * K 短路与 A* 搜索画布渲染适配器 (KShortestPathCanvasAdapter)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 纯净 SVG 有向图拓扑沙盘渲染、零内联表格、统一 visualState 状态规范
 */

import { visualState } from '../visual-state-tokens';
import type { KPathStep } from '../../../algorithms/categories/graph/k-shortest-path-step-compiler';

export function renderKShortestPathCanvas(container: HTMLElement, step: KPathStep): void {
  const nodeCoords: Record<number, { x: number; y: number }> = {
    1: { x: 50, y: 105 },
    2: { x: 155, y: 45 },
    3: { x: 155, y: 165 },
    4: { x: 265, y: 105 },
  };

  const edges = [
    { u: 1, v: 2, w: 1 },
    { u: 1, v: 3, w: 2 },
    { u: 1, v: 4, w: 6 },
    { u: 2, v: 4, w: 3 },
    { u: 3, v: 4, w: 3 },
  ];

  const idleStyle = visualState('idle');
  const comparingStyle = visualState('comparing');
  const pivotStyle = visualState('pivot');

  const svgEdges = edges
    .map((e) => {
      const p1 = nodeCoords[e.u];
      const p2 = nodeCoords[e.v];
      if (!p1 || !p2) return '';

      const isAct =
        step.activeEdge &&
        step.activeEdge[0] === e.u &&
        step.activeEdge[1] === e.v;

      const stroke = isAct ? comparingStyle.border : idleStyle.border;
      const strokeWidth = isAct ? 3.5 : 1.5;

      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2 + (e.u === 1 && e.v === 4 ? -8 : 0);

      return `
        <g>
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${stroke}" stroke-width="${strokeWidth}" />
          <rect x="${mx - 8}" y="${my - 7}" width="16" height="13" fill="#ffffff" stroke="${stroke}" stroke-width="0.8" rx="2" />
          <text x="${mx}" y="${my + 3}" fill="${isAct ? comparingStyle.border : idleStyle.text}" font-size="8.5" font-family="monospace" font-weight="700" text-anchor="middle">${e.w}</text>
        </g>
      `;
    })
    .join('');

  const nodes = [1, 2, 3, 4];
  const svgNodes = nodes
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';

      const isCur = step.curNode === u;
      const isT = u === 4;
      const isS = u === 1;
      const hVal = step.hArray[u] === 999 ? '∞' : step.hArray[u];

      const fill = isCur
        ? pivotStyle.bg
        : isT
          ? '#fee2e2'
          : isS
            ? '#eff6ff'
            : idleStyle.bg;

      const stroke = isCur
        ? pivotStyle.border
        : isT
          ? '#ef4444'
          : isS
            ? '#3b82f6'
            : idleStyle.border;

      const strokeWidth = isCur ? 3.5 : 1.5;

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="17" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
          <text x="${p.x}" y="${p.y + 4}" fill="${isCur ? '#ffffff' : isT ? '#dc2626' : idleStyle.text}" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          <rect x="${p.x - 16}" y="${p.y + 21}" width="32" height="13" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8" />
          <text x="${p.x}" y="${p.y + 30}" fill="#64748b" font-size="8" font-weight="700" text-anchor="middle">h:${hVal}</text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 4px; box-sizing: border-box;">
      <div style="width: 100%; max-width: 600px; height: 100%; max-height: 250px; display: flex; align-items: center; justify-content: center;">
        <svg viewBox="0 0 310 200" style="width:100%; height:100%; max-height:240px;">
          ${svgEdges}
          ${svgNodes}
        </svg>
      </div>
    </div>
  `;
}

export class KShortestPathCanvasAdapter {
  public static render(container: HTMLElement, step: KPathStep): void {
    renderKShortestPathCanvas(container, step);
  }
}
