/**
 * 树链剖分 (Heavy-Light Decomposition) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范，Card 1 输出 100% 纯净 SVG 拓扑沙盘，Card 2 承载重儿子、链头与连续 DFN 监控
 */

import type { HLDStep } from '../../../algorithms/categories/graph/heavy-light-decomposition-step-compiler';

export function renderHLDCanvas(container: HTMLElement, step: HLDStep): void {
  const isLine = Object.keys(step.topNodes).length === 4;
  const nodeCoords: Record<number, { x: number; y: number }> = isLine
    ? {
        1: { x: 155, y: 35 },
        2: { x: 155, y: 85 },
        3: { x: 155, y: 135 },
        4: { x: 155, y: 185 },
      }
    : {
        1: { x: 155, y: 35 },
        2: { x: 95, y: 95 },
        3: { x: 215, y: 95 },
        4: { x: 65, y: 165 },
        5: { x: 125, y: 165 },
        6: { x: 215, y: 165 },
      };

  const treeEdges = isLine
    ? [
        [1, 2],
        [2, 3],
        [3, 4],
      ]
    : [
        [1, 2],
        [1, 3],
        [2, 4],
        [2, 5],
        [3, 6],
      ];

  const svgEdges = treeEdges
    .map(([u, v]) => {
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (!p1 || !p2) return '';
      const isHeavy = step.heavyEdges.some(([a, b]) => (a === u && b === v) || (a === v && b === u));
      const color = isHeavy ? '#facc15' : '#475569';
      const width = isHeavy ? 3.5 : 1.5;

      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isHeavy ? '' : 'stroke-dasharray="4,2"'} />`;
    })
    .join('');

  const nodes = isLine ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6];
  const svgNodes = nodes
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';
      const isTop = step.topNodes[u] === u;
      const isAct = step.activeNodes && step.activeNodes.includes(u);
      const topVal = step.topNodes[u] ?? 0;
      const dfnVal = step.dfnSeq[u] ?? 0;

      const bg = isAct ? '#065f46' : isTop ? '#b45309' : '#1e3a8a';
      const border = isAct ? '#10b981' : isTop ? '#facc15' : '#38bdf8';

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isTop || isAct ? 3 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          <text x="${p.x}" y="${p.y + 24}" fill="#94a3b8" font-size="7.5" font-weight="700" text-anchor="middle">top:${topVal} dfn:${dfnVal}</text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <svg style="width: 100%; height: 100%; min-height: 200px;" viewBox="0 0 310 195">
      ${svgEdges}
      ${svgNodes}
    </svg>
  `;
}

export function renderHLDCustomMetrics(container: HTMLElement, step: HLDStep): void {
  const isLine = Object.keys(step.topNodes).length === 4;
  const nodes = isLine ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6];

  const renderRow = (name: string, arr: number[], activeName: string, color: string) => {
    const cells = nodes
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

  const sizeRow = renderRow('size[] (子树大小)', step.sizeArray, 'size', '#38bdf8');
  const sonRow = renderRow('son[] (重儿子)', step.sonArray, 'son', '#f59e0b');
  const topRow = renderRow('top[] (重链链头)', step.topArray, 'top', '#10b981');
  const dfnRow = renderRow('dfn[] (时间戳)', step.dfnArray, 'dfn', '#a855f7');

  const segStr = step.pathSegments ? JSON.stringify(step.pathSegments) : '待查询';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        ${sizeRow}
        ${sonRow}
        ${topRow}
        ${dfnRow}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          <span style="color: #10b981; font-size: 10px; font-weight: 700;">转化线段树区间集:</span>
          <strong style="color: #059669; font-family: monospace; font-size: 10.5px;">${segStr}</strong>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
        <strong style="color: #0284c7; font-family: monospace; font-size: 11px;">行 ${step.codeLine}: ${step.log}</strong>
      </div>
    </div>
  `;
}

export class HeavyLightDecompositionCanvasAdapter {
  public mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  public updateStep(container: HTMLElement, step: HLDStep): void {
    renderHLDCanvas(container, step);
  }

  public renderCustomMetrics(container: HTMLElement, step: HLDStep): void {
    renderHLDCustomMetrics(container, step);
  }

  public dispose(): void {}
}
