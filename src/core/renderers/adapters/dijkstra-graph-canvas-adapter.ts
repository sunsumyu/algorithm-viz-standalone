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

  // 拓扑节点坐标规范化：给予顶部/底部充裕纵深，规避箭头与标签碰撞
  const nodeCoords: Record<number, { x: number; y: number }> = isTriangle
    ? {
        1: { x: 60, y: 95 },
        2: { x: 275, y: 55 },
        3: { x: 170, y: 145 },
      }
    : {
        1: { x: 55, y: 95 },
        2: { x: 170, y: 52 },
        3: { x: 170, y: 142 },
        4: { x: 285, y: 95 },
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

  let svgHtml = `<svg viewBox="0 0 340 190" style="width:100%; height:100%; max-height:240px; overflow:visible;">
    <defs>
      <filter id="dj-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#0f172a" flood-opacity="0.08" />
      </filter>
      <marker id="arrow-dj-index" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${idleStyle.border}" />
      </marker>
      <marker id="arrow-dj-index-relax" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${discoveredStyle.border}" />
      </marker>
      <marker id="arrow-dj-index-active" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${comparingStyle.border}" />
      </marker>
    </defs>`;

  // 1. 渲染有向边与权重胶囊 (智能侧向避让，规避与竖直轴或节点距离标签重叠)
  for (const [u, v, w] of edges) {
    const p1 = nodeCoords[u];
    const p2 = nodeCoords[v];
    if (!p1 || !p2) continue;

    const isCurrent = step.curRelaxEdge && step.curRelaxEdge.u === u && step.curRelaxEdge.v === v;
    const isRelaxed = isCurrent && (step.status === 'relax' || step.status === 'decrease');

    const strokeColor = isRelaxed ? discoveredStyle.border : isCurrent ? comparingStyle.border : idleStyle.border;
    const strokeWidth = isCurrent ? 3.2 : 1.8;
    const marker = isRelaxed ? 'url(#arrow-dj-index-relax)' : isCurrent ? 'url(#arrow-dj-index-active)' : 'url(#arrow-dj-index)';

    // 垂直边 (3 -> 2) 权重胶囊向左水平偏移 20px，彻底释放垂直箭头走廊
    const isVertical = u === 3 && v === 2;
    const midX = (p1.x + p2.x) / 2 + (isVertical ? -20 : 0);
    const midY = (p1.y + p2.y) / 2 + (isVertical ? 0 : u === 1 && v === 2 ? -9 : u === 1 && v === 3 ? 9 : u === 2 && v === 4 ? -9 : 9);

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" marker-end="${marker}" />`;
    svgHtml += `<rect x="${midX - 11}" y="${midY - 8}" width="22" height="16" rx="4" fill="#ffffff" stroke="${strokeColor}" stroke-width="1.2" filter="url(#dj-shadow)" />`;
    svgHtml += `<text x="${midX}" y="${midY + 3.5}" fill="#334155" font-size="10" font-weight="800" font-family="'JetBrains Mono', Consolas, monospace" text-anchor="middle">${w}</text>`;
  }

  // 2. 渲染节点与状态胶囊 (顶部节点 2 的距离标签置于节点上方，其余置于下方，彻底防碰撞)
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
    let badgeBg = '#f8fafc';
    let badgeBorder = '#cbd5e1';
    let badgeText = '#64748b';

    if (isCur) {
      fill = '#fffbeb';
      stroke = '#f59e0b';
      badgeBg = '#fef3c7';
      badgeBorder = '#f59e0b';
      badgeText = '#b45309';
    } else if (isRelaxTarget && step.status === 'decrease') {
      fill = '#e0f2fe';
      stroke = '#0284c7';
      badgeBg = '#bae6fd';
      badgeBorder = '#0284c7';
      badgeText = '#0369a1';
    } else if (isSettled) {
      fill = '#ecfdf5';
      stroke = '#10b981';
      badgeBg = '#d1fae5';
      badgeBorder = '#10b981';
      badgeText = '#047857';
    } else if (inHeap) {
      fill = '#f0f9ff';
      stroke = '#38bdf8';
      badgeBg = '#e0f2fe';
      badgeBorder = '#38bdf8';
      badgeText = '#0284c7';
    }

    // 活跃代表元外侧脉冲光环
    if (isCur) {
      svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="27" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 2" opacity="0.9" />`;
    } else if (isSettled) {
      svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="25" fill="none" stroke="#10b981" stroke-width="1.5" opacity="0.4" />`;
    }

    // 节点主圆盘
    svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" filter="url(#dj-shadow)" />`;
    svgHtml += `<text x="${p.x}" y="${p.y + 4.5}" fill="#0f172a" font-size="13" font-weight="800" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">${node}</text>`;

    // 距离标签胶囊 (顶部节点置于上方 y-36，底部节点置于下方 y+24，彻底避免重叠)
    const isTopNode = node === 2;
    const badgeW = 44;
    const badgeH = 17;
    const badgeX = p.x - badgeW / 2;
    const badgeY = isTopNode ? p.y - 36 : p.y + 24;

    svgHtml += `<rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="${badgeH}" rx="8.5" fill="${badgeBg}" stroke="${badgeBorder}" stroke-width="1.2" filter="url(#dj-shadow)" />`;
    svgHtml += `<text x="${p.x}" y="${badgeY + 11.5}" fill="${badgeText}" font-size="9.5" font-family="'JetBrains Mono', Consolas, monospace" font-weight="700" text-anchor="middle">d:${dStr}</text>`;
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

export function renderDijkstraIndexHeapMetrics(container: HTMLElement, step: IndexHeapStep): void {
  const isTriangle = step.whereArray.length === 3;
  const n = isTriangle ? 3 : 4;
  const indices = Array.from({ length: n }, (_, i) => i);

  const renderRow = (name: string, arr: any[], activeName: string, color: string, prefix: string) => {
    const cells = indices
      .map((idx) => {
        const val = arr[idx] ?? 0;
        const isActive = step.activeArray === activeName && step.activeSlot === idx;
        const displayVal = val === 999 ? '∞' : `${val}`;
        const bg = isActive ? '#fef3c7' : '#ffffff';
        const textCol = isActive ? '#b45309' : '#0f172a';
        const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';
        return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:34px;height:32px;background:${bg};border:${border};border-radius:4px;color:${textCol};font-family:monospace;font-size:11px;font-weight:700;"><span style="font-size:8px;color:#64748b;line-height:1;">${prefix}[${idx + 1}]</span><span style="line-height:1.1;">${displayVal}</span></div>`;
      })
      .join('');
    return `<div style="display:flex;align-items:center;gap:8px;"><span style="font-family:monospace;font-size:11px;font-weight:700;width:135px;color:${color};">${name}:</span><div style="display:flex;gap:4px;">${cells}</div></div>`;
  };

  const wRow = renderRow('where[] (堆下标)', step.whereArray, 'where', '#38bdf8', 'N');
  const dRow = renderRow('distance[] (距离)', step.distanceArray, 'distance', '#f59e0b', 'N');

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:8px;font-size:11px;color:#374151;padding:4px 8px;box-sizing:border-box;">
      <div style="display:flex;flex-direction:column;gap:6px;background:#f8fafc;padding:10px;border-radius:6px;border:1px solid #e2e8f0;">
        ${wRow}${dRow}
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;border-top:1px dashed #cbd5e1;padding-top:4px;">
          <span style="color:#10b981;font-size:10px;font-weight:700;">反向索引状态机:</span>
          <strong style="color:#64748b;font-family:monospace;font-size:10px;">-1: 未入堆 | >=0: 堆中位置 | -2: 已结算锁定</strong>
        </div>
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

  public static renderIndexHeapMetrics(container: HTMLElement, step: IndexHeapStep): void {
    renderDijkstraIndexHeapMetrics(container, step);
  }
}
