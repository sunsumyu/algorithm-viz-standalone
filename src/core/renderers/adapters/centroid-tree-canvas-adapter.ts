/**
 * 动态点分树 (Dynamic Centroid Tree · 洛谷 P6329 / SP1437) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范：
 * Card 1 输出 100% 纯净 SVG 拓扑沙盘 (原树拓扑与点分重构树关系)
 * Card 2 承载点分重构树祖先链映射与对数级复杂度监控
 */

import type { CentroidTreeStep } from '../../../algorithms/categories/graph/centroid-tree-step-compiler';

export function renderCentroidTreeCanvas(container: HTMLElement, step: CentroidTreeStep): void {
  const isLine =
    Object.keys(step.centroidParents).length === 5 &&
    step.centroidParents[2] !== null &&
    step.centroidParents[3] !== null &&
    step.centroidParents[4] !== null;

  const nodeCoords5star: Record<number, { x: number; y: number }> = {
    1: { x: 155, y: 35 },
    2: { x: 95, y: 100 },
    3: { x: 215, y: 100 },
    4: { x: 75, y: 165 },
    5: { x: 235, y: 165 },
  };

  const nodeCoords5line: Record<number, { x: number; y: number }> = {
    1: { x: 50, y: 100 },
    2: { x: 105, y: 100 },
    3: { x: 160, y: 100 },
    4: { x: 215, y: 100 },
    5: { x: 270, y: 100 },
  };

  const nodeCoords = isLine ? nodeCoords5line : nodeCoords5star;

  const originalEdges5star: [number, number][] = [
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 5],
  ];
  const originalEdges5line: [number, number][] = [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
  ];
  const originalEdges = isLine ? originalEdges5line : originalEdges5star;

  const svgEdges = originalEdges
    .map(([u, v]) => {
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (!p1 || !p2) return '';
      const isCentroidEdge = step.centroidParents[v] === u || step.centroidParents[u] === v;
      const color = isCentroidEdge ? '#10b981' : '#475569';
      const width = isCentroidEdge ? 2.5 : 1.5;
      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
    })
    .join('');

  const svgNodes = Object.keys(nodeCoords)
    .map(Number)
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';
      const isRootCentroid = step.centroidParents[u] === null && step.status !== 'init';
      const isCur = step.activeNode === u;
      const bg = isCur ? '#f59e0b' : isRootCentroid ? '#065f46' : '#1e3a8a';
      const border = isCur ? '#facc15' : isRootCentroid ? '#10b981' : '#38bdf8';
      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="14" fill="${bg}" stroke="${border}" stroke-width="${isCur || isRootCentroid ? 2.5 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <svg style="width: 100%; height: 100%; min-height: 200px;" viewBox="0 0 310 200">
      ${svgEdges}
      ${svgNodes}
    </svg>
  `;
}

export function renderCentroidTreeCustomMetrics(container: HTMLElement, step: CentroidTreeStep): void {
  const faItems = Object.entries(step.centroidParents)
    .map(([u, fa]) => `<span style="background: #1e293b; border: 1px solid #334155; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10px;">fa[N${u}] = ${fa !== null ? `N${fa}` : '根'}</span>`)
    .join(' ');

  const lineStr = Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 4px;">
          <span style="font-weight: 700; color: #1e293b;">点分树父子关系映射:</span>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">${faItems}</div>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #1e40af; font-weight: 700;">👑 单次修改/查询时间复杂度:</span>
        <strong style="font-family: monospace; color: #2563eb;">O(log² N) 严格上界</strong>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
        <strong style="color: #0284c7; font-family: monospace; font-size: 11px;">行 ${lineStr}: ${step.log}</strong>
      </div>
    </div>
  `;
}

export class CentroidTreeCanvasAdapter {
  public mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  public updateStep(container: HTMLElement, step: CentroidTreeStep): void {
    renderCentroidTreeCanvas(container, step);
  }

  public renderCustomMetrics(container: HTMLElement, step: CentroidTreeStep): void {
    renderCentroidTreeCustomMetrics(container, step);
  }

  public dispose(): void {}
}
