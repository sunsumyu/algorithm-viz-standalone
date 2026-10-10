/**
 * 树分治与点分治 (Tree Centroid Decomposition · POJ 1741 / 洛谷 P3806) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范：
 * Card 1 输出 100% 纯净 SVG 树形拓扑、重心皇冠高亮与虚线隔离边
 * Card 2 承载 sz[]、maxSubtree[]、vis[] 多数组状态监视器与路径统计
 */

import type { StaticCentroidStep } from '../../../algorithms/categories/graph/tree-centroid-decomposition-step-compiler';

export function renderTreeCentroidCanvas(container: HTMLElement, step: StaticCentroidStep): void {
  const isLine = step.szArray.length === 6;
  const nodeCoords: Record<number, { x: number; y: number }> = isLine
    ? {
        1: { x: 45, y: 105 },
        2: { x: 100, y: 105 },
        3: { x: 155, y: 105 },
        4: { x: 210, y: 105 },
        5: { x: 265, y: 105 },
      }
    : {
        1: { x: 155, y: 35 },
        2: { x: 95, y: 95 },
        3: { x: 215, y: 95 },
        4: { x: 65, y: 165 },
        5: { x: 125, y: 165 },
        6: { x: 185, y: 165 },
        7: { x: 245, y: 165 },
      };

  const treeEdges = isLine
    ? [
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
      ]
    : [
        [1, 2],
        [1, 3],
        [2, 4],
        [2, 5],
        [3, 6],
        [3, 7],
      ];

  const svgEdges = treeEdges
    .map(([u, v]) => {
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (!p1 || !p2) return '';
      const isCut =
        (step.visitedNodes.includes(u) && !step.visitedNodes.includes(v)) ||
        (step.visitedNodes.includes(v) && !step.visitedNodes.includes(u));
      const color = isCut ? '#475569' : '#38bdf8';
      const width = isCut ? 1.5 : 2;

      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isCut ? 'stroke-dasharray="3,2"' : ''} />`;
    })
    .join('');

  const nodes = isLine ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7];
  const svgNodes = nodes
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';
      const isCentroid = step.curCentroid === u;
      const isVis = step.visitedNodes.includes(u);
      const isAct = step.activeNodes && step.activeNodes.includes(u);

      const bg = isCentroid ? '#b45309' : isVis ? '#065f46' : isAct ? '#0369a1' : '#1e3a8a';
      const border = isCentroid ? '#facc15' : isVis ? '#10b981' : isAct ? '#38bdf8' : '#475569';

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isCentroid || isVis ? 3 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          <text x="${p.x}" y="${p.y + 25}" fill="${isCentroid ? '#facc15' : '#94a3b8'}" font-size="7.5" font-weight="700" text-anchor="middle">${isCentroid ? '👑重心' : `sz:${step.szArray[u] || 0}`}</text>
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

export function renderTreeCentroidCustomMetrics(container: HTMLElement, step: StaticCentroidStep): void {
  const isLine = step.szArray.length === 6;
  const nodes = isLine ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7];

  const renderRow = (name: string, arr: any[], activeName: string, color: string) => {
    const cells = nodes
      .map((idx) => {
        const val = arr[idx] ?? 0;
        const isActive = step.activeArray === activeName && step.activeSlot === idx;
        const displayVal = typeof val === 'boolean' ? (val ? 'T' : 'F') : val;
        const bg = isActive ? '#fef08a' : '#1e293b';
        const textCol = isActive ? '#854d0e' : '#e2e8f0';
        const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';

        return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 30px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
          <span style="font-size: 7.5px; color: #64748b; line-height: 1;">[${idx}]</span>
          <span style="line-height: 1.1;">${displayVal}</span>
        </div>`;
      })
      .join('');

    return `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 105px; color: ${color};">${name}:</span>
        <div style="display: flex; gap: 3px;">${cells}</div>
      </div>
    `;
  };

  const szRow = renderRow('sz[] (子树大小)', step.szArray, 'sz', '#38bdf8');
  const maxSubRow = renderRow('maxSubtree[] (最大块)', step.maxSubtreeArray, 'maxSubtree', '#f59e0b');
  const visRow = renderRow('vis[] (重心隔离)', step.visArray, 'vis', '#10b981');

  const lineStr = Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        ${szRow}
        ${maxSubRow}
        ${visRow}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          <span style="color: #10b981; font-size: 10px; font-weight: 700;">当前已隔离重心集合:</span>
          <strong style="color: #10b981; font-family: monospace; font-size: 10.5px;">{ ${step.visitedNodes.join(', ') || '无'} }</strong>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
        <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${lineStr}: ${step.log}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #475569; font-size: 10.5px;">👑 重心定理:</span>
        <strong style="color: #0369a1; font-size: 10.5px;">删除重心后任意子连通块规模 ≤ ⌊N / 2⌋</strong>
      </div>
    </div>
  `;
}

export class TreeCentroidDecompositionCanvasAdapter {
  public mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  public updateStep(container: HTMLElement, step: StaticCentroidStep): void {
    renderTreeCentroidCanvas(container, step);
  }

  public renderCustomMetrics(container: HTMLElement, step: StaticCentroidStep): void {
    renderTreeCentroidCustomMetrics(container, step);
  }

  public dispose(): void {}
}
