/**
 * Dijkstra 图论画布渲染适配器 (DijkstraGraphCanvasAdapter)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 统一管理有向带权图 SVG 沙盘拓扑排布与状态监控表格渲染
 */

import { visualState } from '../visual-state-tokens';
import type { DJBStep } from '../../../algorithms/categories/graph/dijkstra-basic-step-compiler';
import type { DJHStep } from '../../../algorithms/categories/graph/dijkstra-heap-step-compiler';
import type { IndexHeapStep } from '../../../algorithms/categories/graph/dijkstra-index-heap-step-compiler';

export const DJB_NODES = [0, 1, 2, 3, 4];
export const DJB_EDGES = [
  { from: 0, to: 1, w: 4 },
  { from: 0, to: 2, w: 1 },
  { from: 2, to: 1, w: 2 },
  { from: 1, to: 3, w: 1 },
  { from: 2, to: 3, w: 5 },
  { from: 3, to: 4, w: 3 },
];

export const DJB_NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 70, y: 130 },
  { x: 210, y: 55 },
  { x: 210, y: 205 },
  { x: 350, y: 130 },
  { x: 440, y: 130 },
];

const INF = Infinity;

/**
 * 渲染朴素 Dijkstra 主视觉：有向带权图 SVG + dist 距离状态表
 */
export function renderDijkstraBasicCanvas(container: HTMLElement, step: DJBStep): void {
  const { dist, visited, currentNode, relaxEdge, action } = step;

  const idleStyle = visualState('idle');
  const comparingStyle = visualState('comparing');
  const sortedStyle = visualState('sorted');
  const pivotStyle = visualState('pivot');
  const discoveredStyle = visualState('discovered');
  const unvisitedStyle = visualState('unvisited');

  let svgHtml = `<svg viewBox="0 0 500 250" style="width:100%; height:100%; max-height:240px;">
    <defs>
      <marker id="arrow-djb" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${idleStyle.border}" />
      </marker>
      <marker id="arrow-djb-relax" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${discoveredStyle.border}" />
      </marker>
      <marker id="arrow-djb-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${comparingStyle.border}" />
      </marker>
    </defs>`;

  for (const e of DJB_EDGES) {
    const p1 = DJB_NODE_POSITIONS[e.from];
    const p2 = DJB_NODE_POSITIONS[e.to];
    const isCurrent = relaxEdge && relaxEdge.from === e.from && relaxEdge.to === e.to;
    const isRelaxed = isCurrent && action === 'relax';

    const strokeColor = isRelaxed ? discoveredStyle.border : isCurrent ? comparingStyle.border : idleStyle.border;
    const strokeWidth = isCurrent ? 3.5 : 1.8;
    const marker = isRelaxed ? 'url(#arrow-djb-relax)' : isCurrent ? 'url(#arrow-djb-active)' : 'url(#arrow-djb)';

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2 + (e.from === 2 && e.to === 1 ? -12 : 8);

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
    svgHtml += `<rect x="${midX - 10}" y="${midY - 8}" width="20" height="15" rx="3" fill="${idleStyle.bg}" stroke="${strokeColor}" stroke-width="1" />`;
    svgHtml += `<text x="${midX}" y="${midY + 3}" fill="${idleStyle.text}" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${e.w}</text>`;
  }

  DJB_NODES.forEach((node) => {
    const p = DJB_NODE_POSITIONS[node];
    const dVal = dist[node];
    const isVisited = visited.has(node);
    const isCurrent = currentNode === node;
    const isTarget = relaxEdge && relaxEdge.to === node;

    let fill = idleStyle.bg;
    let stroke = idleStyle.border;
    if (isCurrent) {
      fill = pivotStyle.bg;
      stroke = pivotStyle.border;
    } else if (isTarget && action === 'relax') {
      fill = discoveredStyle.bg;
      stroke = discoveredStyle.border;
    } else if (isVisited) {
      fill = sortedStyle.bg;
      stroke = sortedStyle.border;
    } else if (dVal !== INF) {
      fill = comparingStyle.bg;
      stroke = comparingStyle.border;
    }

    svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
    svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="${idleStyle.text}" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;
    svgHtml += `<text x="${p.x}" y="${p.y + 32}" fill="${dVal === INF ? unvisitedStyle.text : isVisited ? sortedStyle.text : comparingStyle.text}" font-size="11" font-family="monospace" font-weight="800" text-anchor="middle">${dVal === INF ? '∞' : dVal}</text>`;
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

/**
 * 渲染堆优化 Dijkstra 主视觉：有向带权图 SVG（堆成员着色）+ dist 距离状态表
 */
export function renderDijkstraHeapCanvas(container: HTMLElement, step: DJHStep): void {
  const { dist, pq, currentNode, relaxEdge, action } = step;

  const idleStyle = visualState('idle');
  const comparingStyle = visualState('comparing');
  const sortedStyle = visualState('sorted');
  const pivotStyle = visualState('pivot');
  const discoveredStyle = visualState('discovered');
  const unvisitedStyle = visualState('unvisited');

  let svgHtml = `<svg viewBox="0 0 500 250" style="width:100%; height:100%; max-height:240px;">
    <defs>
      <marker id="arrow-djh" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${idleStyle.border}" />
      </marker>
      <marker id="arrow-djh-relax" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${discoveredStyle.border}" />
      </marker>
      <marker id="arrow-djh-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${comparingStyle.border}" />
      </marker>
    </defs>`;

  for (const e of DJB_EDGES) {
    const p1 = DJB_NODE_POSITIONS[e.from];
    const p2 = DJB_NODE_POSITIONS[e.to];
    const isCurrent = relaxEdge && relaxEdge.from === e.from && relaxEdge.to === e.to;
    const isRelaxed = isCurrent && action === 'relax';

    const strokeColor = isRelaxed ? discoveredStyle.border : isCurrent ? comparingStyle.border : idleStyle.border;
    const strokeWidth = isCurrent ? 3.5 : 1.8;
    const marker = isRelaxed ? 'url(#arrow-djh-relax)' : isCurrent ? 'url(#arrow-djh-active)' : 'url(#arrow-djh)';

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2 + (e.from === 2 && e.to === 1 ? -12 : 8);

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
    svgHtml += `<rect x="${midX - 10}" y="${midY - 8}" width="20" height="15" rx="3" fill="#ffffff" stroke="${strokeColor}" stroke-width="1" />`;
    svgHtml += `<text x="${midX}" y="${midY + 3}" fill="${idleStyle.text}" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${e.w}</text>`;
  }

  DJB_NODES.forEach((node) => {
    const p = DJB_NODE_POSITIONS[node];
    const dVal = dist[node];
    const isCur = currentNode === node;
    const isTarget = relaxEdge && relaxEdge.to === node;
    const inPQ = pq.some((item) => item.u === node);

    let fill = idleStyle.bg;
    let stroke = idleStyle.border;
    if (isCur && action === 'skip-lazy') {
      fill = '#fee2e2';
      stroke = '#ef4444';
    } else if (isCur) {
      fill = pivotStyle.bg;
      stroke = pivotStyle.border;
    } else if (isTarget && action === 'relax') {
      fill = discoveredStyle.bg;
      stroke = discoveredStyle.border;
    } else if (inPQ) {
      fill = comparingStyle.bg;
      stroke = comparingStyle.border;
    }

    svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
    svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="${idleStyle.text}" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;
    svgHtml += `<text x="${p.x}" y="${p.y + 32}" fill="${dVal === INF ? '#94a3b8' : '#2563eb'}" font-size="11" font-family="monospace" font-weight="800" text-anchor="middle">${dVal === INF ? '∞' : dVal}</text>`;
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

/**
 * 渲染反向索引堆优化 Dijkstra 主视觉：有向带权图 SVG（where[] 三态着色）
 */
export function renderDijkstraIndexHeapCanvas(container: HTMLElement, step: IndexHeapStep): void {
  const isTriangle = step.whereArray.length === 3;
  const nodes = isTriangle ? [1, 2, 3] : [1, 2, 3, 4];

  const nodeCoords: Record<number, { x: number; y: number }> = isTriangle
    ? {
        1: { x: 60, y: 90 },
        2: { x: 260, y: 50 },
        3: { x: 160, y: 140 },
      }
    : {
        1: { x: 60, y: 90 },
        2: { x: 160, y: 45 },
        3: { x: 160, y: 135 },
        4: { x: 260, y: 90 },
      };

  const edges: Array<[number, number, number]> = isTriangle
    ? [
        [1, 2, 4],
        [1, 3, 1],
        [3, 2, 1],
      ]
    : [
        [1, 2, 4],
        [1, 3, 1],
        [3, 2, 1],
        [2, 4, 2],
        [3, 4, 5],
      ];

  const idleStyle = visualState('idle');
  const comparingStyle = visualState('comparing');
  const sortedStyle = visualState('sorted');
  const pivotStyle = visualState('pivot');
  const discoveredStyle = visualState('discovered');
  const unvisitedStyle = visualState('unvisited');

  let svgHtml = `<svg viewBox="0 0 320 180" style="width:100%; height:100%; max-height:240px;">
    <defs>
      <marker id="arrow-dj-index" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${idleStyle.border}" />
      </marker>
      <marker id="arrow-dj-index-relax" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${discoveredStyle.border}" />
      </marker>
      <marker id="arrow-dj-index-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${comparingStyle.border}" />
      </marker>
    </defs>`;

  for (const [u, v, w] of edges) {
    const p1 = nodeCoords[u];
    const p2 = nodeCoords[v];
    if (!p1 || !p2) continue;

    const isCurrent = step.curRelaxEdge && step.curRelaxEdge.u === u && step.curRelaxEdge.v === v;
    const isRelaxed = isCurrent && (step.status === 'relax' || step.status === 'decrease');

    const strokeColor = isRelaxed ? discoveredStyle.border : isCurrent ? comparingStyle.border : idleStyle.border;
    const strokeWidth = isCurrent ? 3.5 : 1.8;
    const marker = isRelaxed ? 'url(#arrow-dj-index-relax)' : isCurrent ? 'url(#arrow-dj-index-active)' : 'url(#arrow-dj-index)';

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2 + (u === 3 && v === 2 ? -10 : 8);

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
    svgHtml += `<rect x="${midX - 10}" y="${midY - 8}" width="20" height="15" rx="3" fill="#ffffff" stroke="${strokeColor}" stroke-width="1" />`;
    svgHtml += `<text x="${midX}" y="${midY + 3}" fill="${idleStyle.text}" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${w}</text>`;
  }

  nodes.forEach((node) => {
    const p = nodeCoords[node];
    if (!p) return;

    const isCur = step.curPop === node;
    const isSettled = step.settled.includes(node) || step.indexMap[node] === -2;
    const inHeap = (step.indexMap[node] ?? -1) >= 0;
    const isRelaxTarget = step.curRelaxEdge && step.curRelaxEdge.v === node;
    const dVal = step.distanceArray[node - 1];
    const dStr = dVal === 999 || dVal === undefined ? '∞' : `${dVal}`;

    let fill = idleStyle.bg;
    let stroke = idleStyle.border;
    if (isCur) {
      fill = pivotStyle.bg;
      stroke = pivotStyle.border;
    } else if (isRelaxTarget && step.status === 'decrease') {
      fill = discoveredStyle.bg;
      stroke = discoveredStyle.border;
    } else if (isSettled) {
      fill = sortedStyle.bg;
      stroke = sortedStyle.border;
    } else if (inHeap) {
      fill = comparingStyle.bg;
      stroke = comparingStyle.border;
    }

    svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
    svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="${idleStyle.text}" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;
    svgHtml += `<text x="${p.x}" y="${p.y + 32}" fill="${dStr === '∞' ? unvisitedStyle.text : isSettled ? sortedStyle.text : comparingStyle.text}" font-size="11" font-family="monospace" font-weight="800" text-anchor="middle">d:${dStr}</text>`;
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

export class DijkstraGraphCanvasAdapter {
  public static renderBasic(container: HTMLElement, step: DJBStep): void {
    renderDijkstraBasicCanvas(container, step);
  }

  public static renderHeap(container: HTMLElement, step: DJHStep): void {
    renderDijkstraHeapCanvas(container, step);
  }

  public static renderIndexHeap(container: HTMLElement, step: IndexHeapStep): void {
    renderDijkstraIndexHeapCanvas(container, step);
  }
}
