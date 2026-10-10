/**
 * 树上差分 (Tree Difference - 点差分与边差分) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范，Card 1 输出 100% 纯净 SVG 拓扑沙盘，Card 2 承载差分标记与前缀和还原监控
 */

import type { TreeDiffStep } from '../../../algorithms/categories/graph/tree-difference-step-compiler';

export function renderGraphTreeDiffCanvas(container: HTMLElement, step: TreeDiffStep): void {
  const nodeCoords: Record<number, { x: number; y: number }> = {
    1: { x: 155, y: 40 },
    2: { x: 95, y: 105 },
    3: { x: 215, y: 105 },
    4: { x: 55, y: 170 },
    5: { x: 135, y: 170 },
  };

  const treeEdges = [
    [1, 2],
    [1, 3],
    [2, 4],
    [2, 5],
  ];

  const svgEdges = treeEdges
    .map(([u, v]) => {
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (!p1 || !p2) return '';
      const isCovered = (u === 2 && v === 4) || (u === 4 && v === 2) || (u === 2 && v === 5) || (u === 5 && v === 2);
      const color = isCovered ? '#ef4444' : '#475569';
      const width = isCovered ? 3 : 1.5;

      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
    })
    .join('');

  const nodes = [1, 2, 3, 4, 5];
  const svgNodes = nodes
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';
      const isCur = step.activeNode === u;
      const isLca = step.activeLca === u;
      const isEndpoint = u === 4 || u === 5;
      const val = step.recoveredCounts[u] ?? 0;
      const diffVal = step.diffArray[u] ?? 0;

      const bg = isCur ? '#f59e0b' : isLca ? '#854d0e' : isEndpoint ? '#065f46' : val > 0 ? '#991b1b' : '#1e3a8a';
      const border = isCur ? '#facc15' : isLca ? '#f59e0b' : isEndpoint ? '#10b981' : val > 0 ? '#ef4444' : '#38bdf8';

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="${isCur || isLca || isEndpoint ? 3 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          <text x="${p.x}" y="${p.y + 28}" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">d:${diffVal > 0 ? `+${diffVal}` : diffVal} v:${val}</text>
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

export function renderGraphTreeDiffCustomMetrics(container: HTMLElement, step: TreeDiffStep): void {
  const indices = [1, 2, 3, 4, 5];

  const renderRow = (name: string, map: Record<number, number>, activeName: string, color: string) => {
    const cells = indices
      .map((idx) => {
        const val = map[idx] ?? 0;
        const isActive = step.activeArray === activeName && step.activeSlot === idx;
        const bg = isActive ? '#fef08a' : '#1e293b';
        const textCol = isActive ? '#854d0e' : '#e2e8f0';
        const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';

        return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 34px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
          <span style="font-size: 7.5px; color: #64748b; line-height: 1;">[${idx}]</span>
          <span style="line-height: 1.1;">${val > 0 && activeName === 'diff' ? `+${val}` : val}</span>
        </div>`;
      })
      .join('');

    return `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 95px; color: ${color};">${name}:</span>
        <div style="display: flex; gap: 4px;">${cells}</div>
      </div>
    `;
  };

  const depthRow = renderRow('depth[] (深度)', step.depthArray, 'depth', '#38bdf8');
  const diffRow = renderRow('diff[] (差分标记)', step.diffArray, 'diff', '#f59e0b');
  const valRow = renderRow('val[] (还原权值)', step.recoveredCounts, 'val', '#10b981');
  const lineStr = Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        ${depthRow}
        ${diffRow}
        ${valRow}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
        <strong style="color: #0284c7; font-family: monospace; font-size: 11px;">行 ${lineStr}: ${step.log}</strong>
      </div>
    </div>
  `;
}

export class GraphTreeDifferenceCanvasAdapter {
  public mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  public updateStep(container: HTMLElement, step: TreeDiffStep): void {
    renderGraphTreeDiffCanvas(container, step);
  }

  public renderCustomMetrics(container: HTMLElement, step: TreeDiffStep): void {
    renderGraphTreeDiffCustomMetrics(container, step);
  }

  public dispose(): void {}
}
