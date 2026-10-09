/**
 * 分层图最短路画布渲染适配器 (LayeredDijkstraCanvasAdapter)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 纯净 SVG 分层双层网络拓扑沙盘渲染、零内联标题、零镜像指标、统一 visualState 状态规范
 */

import { visualState } from '../visual-state-tokens';
import {
  LAYERED_PRESETS,
  type LayeredStep,
} from '../../../algorithms/categories/graph/layered-dijkstra-step-compiler';

export function renderLayeredDijkstraCanvas(container: HTMLElement, step: LayeredStep): void {
  const config = Object.keys(step.distGrid).length > 4 ? LAYERED_PRESETS.p4568_standard : LAYERED_PRESETS.simple_3node;
  const { n, edges, nodeCoords } = config;

  const idleStyle = visualState('idle');
  const comparingStyle = visualState('comparing');
  const sortedStyle = visualState('sorted');
  const pivotStyle = visualState('pivot');
  const discoveredStyle = visualState('discovered');

  const isPathEdge = (uStr: string, vStr: string) => {
    if (!step.pathEdgeKeys) return false;
    return (
      step.pathEdgeKeys.includes(`${uStr}->${vStr}`) ||
      step.pathEdgeKeys.includes(`${vStr}->${uStr}`)
    );
  };

  const svgEdgesList: string[] = [];
  for (const e of edges) {
    const p1 = nodeCoords[e.u];
    const p2 = nodeCoords[e.v];
    if (!p1 || !p2) continue;

    // Layer 0 regular edge
    const onPathL0 = isPathEdge(`${e.u},0`, `${e.v},0`);
    const isCurL0 =
      step.highlightEdge &&
      !step.highlightEdge.isFree &&
      step.highlightEdge.fromK === 0 &&
      ((step.highlightEdge.u === e.u && step.highlightEdge.v === e.v) ||
        (step.highlightEdge.u === e.v && step.highlightEdge.v === e.u));

    const colorL0 = onPathL0 ? discoveredStyle.border : isCurL0 ? comparingStyle.border : idleStyle.border;
    const widthL0 = onPathL0 ? 3.5 : isCurL0 ? 2.5 : 1.5;

    svgEdgesList.push(`
      <g>
        <line x1="${p1.x}" y1="${p1.y0}" x2="${p2.x}" y2="${p2.y0}" stroke="${colorL0}" stroke-width="${widthL0}" />
        <text x="${(p1.x + p2.x) / 2}" y="${(p1.y0 + p2.y0) / 2 - 5}" fill="${onPathL0 ? discoveredStyle.border : idleStyle.text}" font-size="8" font-family="monospace" text-anchor="middle">w:${e.w}</text>
      </g>
    `);

    // Layer 1 regular edge
    const onPathL1 = isPathEdge(`${e.u},1`, `${e.v},1`);
    const isCurL1 =
      step.highlightEdge &&
      !step.highlightEdge.isFree &&
      step.highlightEdge.fromK === 1 &&
      ((step.highlightEdge.u === e.u && step.highlightEdge.v === e.v) ||
        (step.highlightEdge.u === e.v && step.highlightEdge.v === e.u));

    const colorL1 = onPathL1 ? discoveredStyle.border : isCurL1 ? comparingStyle.border : idleStyle.border;
    const widthL1 = onPathL1 ? 3.5 : isCurL1 ? 2.5 : 1.5;

    svgEdgesList.push(`
      <g>
        <line x1="${p1.x}" y1="${p1.y1}" x2="${p2.x}" y2="${p2.y1}" stroke="${colorL1}" stroke-width="${widthL1}" />
        <text x="${(p1.x + p2.x) / 2}" y="${(p1.y1 + p2.y1) / 2 - 5}" fill="${onPathL1 ? discoveredStyle.border : idleStyle.text}" font-size="8" font-family="monospace" text-anchor="middle">w:${e.w}</text>
      </g>
    `);

    // Cross layer free edges (0->1 from u to v, and from v to u)
    const onPathCrossUV = isPathEdge(`${e.u},0`, `${e.v},1`);
    const isCurCrossUV =
      step.highlightEdge &&
      step.highlightEdge.isFree &&
      step.highlightEdge.u === e.u &&
      step.highlightEdge.v === e.v;

    const colorCross = onPathCrossUV ? discoveredStyle.border : isCurCrossUV ? comparingStyle.border : '#059669';

    svgEdgesList.push(`
      <g>
        <line x1="${p1.x}" y1="${p1.y0}" x2="${p2.x}" y2="${p2.y1}" stroke="${colorCross}" stroke-width="${onPathCrossUV ? 3.5 : 1.5}" stroke-dasharray="${onPathCrossUV ? 'none' : '3,3'}" />
        <text x="${(p1.x + p2.x) / 2 + 10}" y="${(p1.y0 + p2.y1) / 2}" fill="#059669" font-size="7.5" font-family="monospace" text-anchor="middle">免(0)</text>
      </g>
    `);
  }

  const svgNodesList: string[] = [];
  for (let u = 0; u < n; u++) {
    const p = nodeCoords[u];
    if (!p) continue;

    const id0 = `${u},0`;
    const isCur0 = step.curNode === u && step.curK === 0;
    const isVis0 = step.visitedSet.includes(id0);
    const d0 = step.distGrid[id0];

    const fill0 = isCur0 ? pivotStyle.bg : isVis0 ? '#0369a1' : idleStyle.bg;
    const stroke0 = isCur0 ? pivotStyle.border : isVis0 ? '#38bdf8' : idleStyle.border;

    svgNodesList.push(`
      <g>
        <circle cx="${p.x}" cy="${p.y0}" r="14" fill="${fill0}" stroke="${stroke0}" stroke-width="${isCur0 ? 2.5 : 1.5}" />
        <text x="${p.x}" y="${p.y0 + 4}" fill="${isVis0 || isCur0 ? '#ffffff' : idleStyle.text}" font-size="9.5" font-weight="800" font-family="monospace" text-anchor="middle">${u},0</text>
        <text x="${p.x}" y="${p.y0 + 24}" fill="${d0 !== undefined ? '#10b981' : '#64748b'}" font-size="8" font-weight="700" text-anchor="middle">d:${d0 !== undefined ? d0 : '∞'}</text>
      </g>
    `);

    const id1 = `${u},1`;
    const isCur1 = step.curNode === u && step.curK === 1;
    const isVis1 = step.visitedSet.includes(id1);
    const d1 = step.distGrid[id1];

    const fill1 = isCur1 ? pivotStyle.bg : isVis1 ? '#db2777' : idleStyle.bg;
    const stroke1 = isCur1 ? pivotStyle.border : isVis1 ? '#f472b6' : idleStyle.border;

    svgNodesList.push(`
      <g>
        <circle cx="${p.x}" cy="${p.y1}" r="14" fill="${fill1}" stroke="${stroke1}" stroke-width="${isCur1 ? 2.5 : 1.5}" />
        <text x="${p.x}" y="${p.y1 + 4}" fill="${isVis1 || isCur1 ? '#ffffff' : idleStyle.text}" font-size="9.5" font-weight="800" font-family="monospace" text-anchor="middle">${u},1</text>
        <text x="${p.x}" y="${p.y1 + 24}" fill="${d1 !== undefined ? '#10b981' : '#64748b'}" font-size="8" font-weight="700" text-anchor="middle">d:${d1 !== undefined ? d1 : '∞'}</text>
      </g>
    `);
  }

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 4px; box-sizing: border-box;">
      <div style="width: 100%; max-width: 600px; height: 100%; max-height: 250px; display: flex; align-items: center; justify-content: center;">
        <svg viewBox="0 0 310 200" style="width:100%; height:100%; max-height:240px;">
          ${svgEdgesList.join('')}
          ${svgNodesList.join('')}
        </svg>
      </div>
    </div>
  `;
}

export class LayeredDijkstraCanvasAdapter {
  public static render(container: HTMLElement, step: LayeredStep): void {
    renderLayeredDijkstraCanvas(container, step);
  }
}
