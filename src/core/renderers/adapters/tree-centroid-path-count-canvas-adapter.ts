/**
 * 点分治路径计数与容斥去重 (Tree Divide and Conquer Path Count · POJ 1741 / 洛谷 P3806) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范：
 * Card 1 输出 100% 纯净 SVG 树形拓扑、边权与重心高亮
 * Card 2 承载距离池升序状态、双指针扫描与容斥去重公式监控
 */

import type { TreePathStep } from '../../../algorithms/categories/graph/tree-centroid-path-count-step-compiler';

export function renderTreeCentroidPathCountCanvas(container: HTMLElement, step: TreePathStep): void {
  const nodeCoords: Record<number, { x: number; y: number }> = {
    1: { x: 155, y: 35 },
    2: { x: 90, y: 95 },
    3: { x: 220, y: 95 },
    4: { x: 55, y: 165 },
    5: { x: 125, y: 165 },
    6: { x: 185, y: 165 },
    7: { x: 255, y: 165 },
  };

  const treeEdges = [
    { u: 1, v: 2, w: 2 },
    { u: 1, v: 3, w: 3 },
    { u: 2, v: 4, w: 1 },
    { u: 2, v: 5, w: 2 },
    { u: 3, v: 6, w: 1 },
    { u: 3, v: 7, w: 2 },
  ];

  const svgEdges = treeEdges
    .map((e) => {
      const p1 = nodeCoords[e.u];
      const p2 = nodeCoords[e.v];
      if (!p1 || !p2) return '';
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      return `
        <g>
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#475569" stroke-width="2" />
          <circle cx="${midX}" cy="${midY}" r="7" fill="#0f172a" stroke="#334155" />
          <text x="${midX}" y="${midY + 3}" fill="#facc15" font-size="8.5" font-weight="700" font-family="monospace" text-anchor="middle">${e.w}</text>
        </g>
      `;
    })
    .join('');

  const nodes = [1, 2, 3, 4, 5, 6, 7];
  const svgNodes = nodes
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';
      const isCentroid = step.centroidNode === u;
      const bg = isCentroid ? '#f59e0b' : '#0284c7';

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="${isCentroid ? 15 : 13}" fill="${bg}" stroke="#ffffff" stroke-width="2" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          ${isCentroid ? `<text x="${p.x}" y="${p.y - 18}" fill="#facc15" font-size="9" font-weight="700" text-anchor="middle">👑重心</text>` : ''}
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

export function renderTreeCentroidPathCountCustomMetrics(container: HTMLElement, step: TreePathStep): void {
  const lineStr =
    typeof step.codeLine === 'object' && step.codeLine !== null && 'java' in step.codeLine
      ? (step.codeLine as any).java
      : Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine;

  const poolItems = step.distPool.length > 0
    ? step.distPool
        .map((d) => `<span style="background: #1e293b; color: #38bdf8; border: 1px solid #334155; padding: 2px 5px; border-radius: 4px; font-family: monospace; font-size: 10px; font-weight: 700;">N${d.node}(${d.dist})</span>`)
        .join(' ')
    : '<span style="color: #94a3b8; font-style: italic;">暂无</span>';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; color: #1e293b;">当前分治重心:</span>
          <span style="background: #78350f; color: #fde68a; border: 1px solid #d97706; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 11px; font-weight: 700;">Node ${step.centroidNode}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          <span style="font-weight: 700; color: #1e293b;">距离池升序:</span>
          <div style="display: flex; flex-wrap: wrap; gap: 3px; justify-content: flex-end;">${poolItems}</div>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #1e40af; font-weight: 700;">👑 容斥去重公式:</span>
        <strong style="font-family: monospace; color: #2563eb;">合法点对 = ${step.rawPairs} - ${step.deductPairs} = ${step.validPairs} 对</strong>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #64748b; font-size: 10.5px;">当前执行语句:</span>
        <strong style="color: #0284c7; font-family: monospace; font-size: 11px;">行 ${lineStr}: ${step.log}</strong>
      </div>
    </div>
  `;
}

export class TreeCentroidPathCountCanvasAdapter {
  public mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  public updateStep(container: HTMLElement, step: TreePathStep): void {
    renderTreeCentroidPathCountCanvas(container, step);
  }

  public renderCustomMetrics(container: HTMLElement, step: TreePathStep): void {
    renderTreeCentroidPathCountCustomMetrics(container, step);
  }

  public dispose(): void {}
}
