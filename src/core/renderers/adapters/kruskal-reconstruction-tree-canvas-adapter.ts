/**
 * Kruskal 重构树 (Kruskal Reconstruction Tree) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范，Card 1 输出 100% 纯净 SVG 拓扑沙盘，Card 2 承载并查集与点权大根堆监控
 */

import type { KruskalTreeStep } from '../../../algorithms/categories/graph/kruskal-reconstruction-tree-step-compiler';

export function renderKruskalTreeCanvas(container: HTMLElement, step: KruskalTreeStep): void {
  const is3Node = Object.keys(step.nodeWeights).length <= 2;
  const nodeCoords: Record<number, { x: number; y: number }> = is3Node
    ? {
        1: { x: 60, y: 165 },
        2: { x: 155, y: 165 },
        3: { x: 250, y: 165 },
        4: { x: 105, y: 105 },
        5: { x: 180, y: 45 },
      }
    : {
        1: { x: 45, y: 170 },
        2: { x: 115, y: 170 },
        3: { x: 185, y: 170 },
        4: { x: 255, y: 170 },
        5: { x: 80, y: 120 },
        6: { x: 135, y: 75 },
        7: { x: 195, y: 35 },
      };

  const svgEdges = step.treeEdges
    .map(({ u, v }) => {
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (!p1 || !p2) return '';
      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#10b981" stroke-width="2.5" />`;
    })
    .join('');

  const allKeys = Object.keys(nodeCoords).map(Number);
  const svgNodes = allKeys
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';
      const isVirtual = u > (is3Node ? 3 : 4);
      const wVal = step.nodeWeights[u] ?? 0;
      const isNew = step.newNodeId === u;
      const isActive = step.activeNodes && step.activeNodes.includes(u);

      const bg = isNew ? '#b45309' : isActive ? '#854d0e' : isVirtual ? '#581c87' : '#1e3a8a';
      const border = isNew ? '#facc15' : isActive ? '#f59e0b' : isVirtual ? '#a855f7' : '#38bdf8';

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="14" fill="${bg}" stroke="${border}" stroke-width="${isNew || isActive ? 2.5 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          <text x="${p.x}" y="${p.y + 24}" fill="${isVirtual ? '#f59e0b' : '#94a3b8'}" font-size="7.5" font-weight="700" text-anchor="middle">${isVirtual ? `w:${wVal}` : `原${u}`}</text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <svg style="width: 100%; height: 100%; min-height: 200px;" viewBox="0 0 310 190">
      ${svgEdges}
      ${svgNodes}
    </svg>
  `;
}

export function renderKruskalTreeCustomMetrics(container: HTMLElement, step: KruskalTreeStep): void {
  const is3Node = Object.keys(step.nodeWeights).length <= 2;
  const totalIndices = is3Node ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7];

  const renderRow = (name: string, arr: number[], activeName: string, color: string) => {
    const cells = totalIndices
      .map((idx) => {
        const val = arr[idx] ?? 0;
        const isActive = step.activeArray === activeName && step.activeSlot === idx;
        const bg = isActive ? '#fef08a' : '#1e293b';
        const textCol = isActive ? '#854d0e' : '#e2e8f0';
        const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';

        return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 32px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
          <span style="font-size: 7.5px; color: #64748b; line-height: 1;">[${idx}]</span>
          <span style="line-height: 1.1;">${val}</span>
        </div>`;
      })
      .join('');

    return `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 100px; color: ${color};">${name}:</span>
        <div style="display: flex; gap: 3px;">${cells}</div>
      </div>
    `;
  };

  const fatherRow = renderRow('father[] (并查集)', step.fatherArray, 'father', '#38bdf8');
  const valRow = renderRow('val[] (虚节点点权)', step.valArray, 'val', '#f59e0b');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        ${fatherRow}
        ${valRow}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          <span style="color: #10b981; font-size: 10px; font-weight: 700;">已生成重构树边数:</span>
          <strong style="color: #059669; font-family: monospace; font-size: 10.5px;">${step.treeEdges.length} 条 (已构建 ${Object.keys(step.nodeWeights).length} 个虚点)</strong>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
        <strong style="color: #0284c7; font-family: monospace; font-size: 11px;">行 ${step.codeLine}: ${step.log}</strong>
      </div>
    </div>
  `;
}

export class KruskalReconstructionTreeCanvasAdapter {
  public mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  public updateStep(container: HTMLElement, step: KruskalTreeStep): void {
    renderKruskalTreeCanvas(container, step);
  }

  public renderCustomMetrics(container: HTMLElement, step: KruskalTreeStep): void {
    renderKruskalTreeCustomMetrics(container, step);
  }

  public dispose(): void {}
}
