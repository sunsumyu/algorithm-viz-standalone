/**
 * 树上启发式合并 (DSU on Tree · CF600E) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范，Card 1 输出 100% 纯净 SVG 拓扑沙盘，Card 2 承载重儿子保留与多数组状态监控
 */

import type { DSUTreeStep } from '../../../algorithms/categories/graph/dsu-on-tree-step-compiler';

export function renderDSUOnTreeCanvas(container: HTMLElement, step: DSUTreeStep): void {
  const isStar = step.szArray.length === 4;
  const nodeCoords: Record<number, { x: number; y: number }> = isStar
    ? {
        1: { x: 155, y: 45 },
        2: { x: 95, y: 155 },
        3: { x: 215, y: 155 },
      }
    : {
        1: { x: 155, y: 45 },
        2: { x: 85, y: 115 },
        3: { x: 225, y: 115 },
        4: { x: 225, y: 175 },
      };

  const treeEdges = isStar
    ? [[1, 2], [1, 3]]
    : [[1, 2], [1, 3], [3, 4]];

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

  const nodes = isStar ? [1, 2, 3] : [1, 2, 3, 4];
  const svgNodes = nodes
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';
      const isCur = step.curNode === u;
      const inSubtree = step.activeSubtree.includes(u);
      const isHeavySon = step.sonArray.includes(u);

      const bg = isCur ? '#f59e0b' : inSubtree ? '#065f46' : isHeavySon ? '#854d0e' : '#1e3a8a';
      const border = isCur ? '#facc15' : inSubtree ? '#10b981' : isHeavySon ? '#f59e0b' : '#38bdf8';

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="${isCur || inSubtree ? 3 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          <text x="${p.x}" y="${p.y + 28}" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">sz:${step.szArray[u] || 0}</text>
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

export function renderDSUOnTreeCustomMetrics(container: HTMLElement, step: DSUTreeStep): void {
  const isStar = step.szArray.length === 4;
  const indices = isStar ? [1, 2, 3] : [1, 2, 3, 4];

  const renderRow = (name: string, arr: number[], activeName: string, color: string) => {
    const cells = indices
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
        <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 95px; color: ${color};">${name}:</span>
        <div style="display: flex; gap: 4px;">${cells}</div>
      </div>
    `;
  };

  const szRow = renderRow('sz[] (子树大小)', step.szArray, 'sz', '#38bdf8');
  const sonRow = renderRow('son[] (重儿子)', step.sonArray, 'son', '#f59e0b');
  const ansRow = renderRow('ans[] (颜色数)', step.ansArray, 'ans', '#10b981');

  const bucketStr = Object.entries(step.preservedData)
    .map(([c, count]) => `色${c}:${count}`)
    .join(' , ') || '空桶';

  const lineStr = Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        ${szRow}
        ${sonRow}
        ${ansRow}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          <span style="color: #f59e0b; font-size: 10px; font-weight: 700;">当前全局颜色桶:</span>
          <strong style="color: #d97706; font-family: monospace; font-size: 10.5px;">[ ${bucketStr} ]</strong>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
        <strong style="color: #0284c7; font-family: monospace; font-size: 11px;">行 ${lineStr}: ${step.log}</strong>
      </div>
    </div>
  `;
}

export class DSUOnTreeCanvasAdapter {
  public mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  public updateStep(container: HTMLElement, step: DSUTreeStep): void {
    renderDSUOnTreeCanvas(container, step);
  }

  public renderCustomMetrics(container: HTMLElement, step: DSUTreeStep): void {
    renderDSUOnTreeCustomMetrics(container, step);
  }

  public dispose(): void {}
}
