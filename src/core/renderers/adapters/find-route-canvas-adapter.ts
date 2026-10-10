/**
 * 寻找图中有效路径 (LC 1971) — 领域画布视觉适配器 (FindRouteCanvasAdapter)
 * 遵循 Matt Pocock 深模块哲学：Card 1 纯 SVG 渲染 + Card 2 遍历路径状态面板
 */

import type { FindRouteStep } from '../../../algorithms/categories/graph/find-route-step-compiler';
import { DEFAULT_FR_POSITIONS } from '../../../algorithms/categories/graph/find-route-step-compiler';

export function renderFindRouteCanvas(container: HTMLElement, step: FindRouteStep): void {
  const { nodes, edges, positions = DEFAULT_FR_POSITIONS, visited, currentNode, inspectingNeighbor, source, dest, path, found } = step;

  // 1. 构建最终路径边集合
  const pathEdgeSet = new Set<string>();
  if (path.length > 1) {
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];
      pathEdgeSet.add(`${Math.min(u, v)}-${Math.max(u, v)}`);
    }
  }

  // 2. 边渲染
  const edgesSvg = edges
    .map(([u, v]) => {
      const p1 = positions[u] || { x: 50 + u * 60, y: 120 };
      const p2 = positions[v] || { x: 50 + v * 60, y: 120 };
      const isPath = pathEdgeSet.has(`${Math.min(u, v)}-${Math.max(u, v)}`);
      const isExploring =
        (currentNode === u && inspectingNeighbor === v) ||
        (currentNode === v && inspectingNeighbor === u);

      let stroke = '#475569';
      let strokeWidth = 2;
      let strokeDasharray = 'none';

      if (isPath) {
        stroke = '#f59e0b';
        strokeWidth = 3.5;
      } else if (isExploring) {
        stroke = '#38bdf8';
        strokeWidth = 3;
        strokeDasharray = '4 3';
      }

      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDasharray}" />`;
    })
    .join('');

  // 3. 节点渲染
  const nodesSvg = nodes
    .map((u) => {
      const pos = positions[u] || { x: 50 + u * 60, y: 120 };
      const isCurrent = currentNode === u;
      const isInspecting = inspectingNeighbor === u;
      const isVisited = visited.has(u);
      const isSource = source === u;
      const isDest = dest === u;
      const inPath = path.includes(u);

      let fill = '#1e293b';
      let stroke = '#64748b';
      let textColor = '#cbd5e1';
      let ring = '';

      if (inPath) {
        fill = '#78350f';
        stroke = '#f59e0b';
        textColor = '#fef3c7';
      } else if (isCurrent) {
        fill = '#0369a1';
        stroke = '#38bdf8';
        textColor = '#f0f9ff';
        ring = `<circle cx="${pos.x}" cy="${pos.y}" r="24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 2" opacity="0.8" />`;
      } else if (isInspecting) {
        fill = '#1e3a8a';
        stroke = '#60a5fa';
        textColor = '#dbeafe';
      } else if (isVisited) {
        fill = '#064e3b';
        stroke = '#10b981';
        textColor = '#d1fae5';
      }

      const roleBadge = isSource
        ? `<text x="${pos.x}" y="${pos.y - 22}" text-anchor="middle" font-size="10" font-weight="700" fill="#34d399">起点 (S)</text>`
        : isDest
        ? `<text x="${pos.x}" y="${pos.y - 22}" text-anchor="middle" font-size="10" font-weight="700" fill="#f43f5e">终点 (D)</text>`
        : '';

      return `
        <g class="graph-node" data-node="${u}">
          ${ring}
          <circle cx="${pos.x}" cy="${pos.y}" r="17" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
          <text x="${pos.x}" y="${pos.y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="${textColor}" font-family="JetBrains Mono, monospace">${u}</text>
          ${roleBadge}
        </g>
      `;
    })
    .join('');

  // 4. 状态标签
  let statusBadgeText = 'BFS 遍历就绪';
  let statusBadgeColor = '#64748b';
  if (found === true) {
    statusBadgeText = '目标达成：两点连通';
    statusBadgeColor = '#10b981';
  } else if (found === false) {
    statusBadgeText = '搜索结束：两点不连通';
    statusBadgeColor = '#f43f5e';
  } else if (currentNode !== null) {
    statusBadgeText = `正在探测节点 ${currentNode}`;
    statusBadgeColor = '#0284c7';
  }

  const badgeSvg = `
    <g transform="translate(14, 16)">
      <rect x="0" y="0" width="160" height="24" rx="4" fill="#0f172a" stroke="${statusBadgeColor}" stroke-width="1.5" opacity="0.9" />
      <circle cx="12" cy="12" r="4" fill="${statusBadgeColor}" />
      <text x="24" y="16" font-size="11" font-weight="700" fill="#e2e8f0" font-family="system-ui, sans-serif">${statusBadgeText}</text>
    </g>
  `;

  // 5. 纯 SVG 注入 Card 1（严禁外层包装 div）
  container.innerHTML = `
    <svg viewBox="0 0 500 250" style="width:100%; height:100%; max-height:240px; display:block; background:#0b1120;">
      <defs>
        <pattern id="fr-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#1e293b" opacity="0.6"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#fr-grid)" />
      ${edgesSvg}
      ${nodesSvg}
      ${badgeSvg}
    </svg>
  `.trim();
}

export class FindRouteCanvasAdapter {
  mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  updateStep(container: HTMLElement, step: unknown): void {
    const frStep = step as FindRouteStep;
    if (!frStep) return;
    renderFindRouteCanvas(container, frStep);
  }

  dispose(container: HTMLElement): void {
    container.innerHTML = '';
  }
}
