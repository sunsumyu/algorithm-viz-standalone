/**
 * 广义圆方树 (Block-Cut Tree) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范，Card 1 输出 100% 纯净 SVG 拓扑沙盘，Card 2 承载多数组与点双状态监控
 */

import type { BlockCutStep } from '../../../algorithms/categories/graph/block-cut-tree-step-compiler';

export function renderBlockCutTreeCanvas(container: HTMLElement, step: BlockCutStep): void {
  const is6Node = step.roundNodes.length === 6;
  const nodeCoords: Record<string, { x: number; y: number }> = is6Node
    ? {
        1: { x: 45, y: 55 },
        2: { x: 45, y: 155 },
        3: { x: 105, y: 105 },
        4: { x: 205, y: 105 },
        5: { x: 265, y: 55 },
        6: { x: 265, y: 155 },
        S1: { x: 75, y: 105 },
        S2: { x: 155, y: 105 },
        S3: { x: 235, y: 105 },
      }
    : {
        1: { x: 65, y: 55 },
        2: { x: 65, y: 155 },
        3: { x: 155, y: 105 },
        4: { x: 255, y: 105 },
        S1: { x: 105, y: 105 },
        S2: { x: 205, y: 105 },
      };

  const origEdges: Array<[number, number]> = is6Node
    ? [
        [1, 2],
        [2, 3],
        [1, 3],
        [3, 4],
        [4, 5],
        [5, 6],
        [4, 6],
      ]
    : [
        [1, 2],
        [2, 3],
        [1, 3],
        [3, 4],
      ];

  const origSvg = origEdges
    .map(([u, v]) => {
      const p1 = nodeCoords[`${u}`];
      const p2 = nodeCoords[`${v}`];
      if (!p1 || !p2) return '';
      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.6" />`;
    })
    .join('');

  const treeSvg = step.treeEdges
    .map(({ u, v }) => {
      const p1 = nodeCoords[`${u}`];
      const p2 = nodeCoords[`${v}`];
      if (!p1 || !p2) return '';
      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#10b981" stroke-width="2.5" />`;
    })
    .join('');

  const roundSvg = step.roundNodes
    .map((u) => {
      const p = nodeCoords[`${u}`];
      if (!p) return '';
      const isCut = step.cutVertices && step.cutVertices.includes(u);
      const isCur = step.curNode === u;
      const inStack = step.stackArray.includes(u);

      const bg = isCur ? '#b45309' : isCut ? '#7f1d1d' : inStack ? '#1e3a8a' : '#1e293b';
      const border = isCur ? '#facc15' : isCut ? '#ef4444' : inStack ? '#38bdf8' : '#475569';

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isCur || isCut ? 2.5 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          <text x="${p.x}" y="${p.y + 25}" fill="${isCut ? '#f87171' : '#94a3b8'}" font-size="7.5" font-weight="700" text-anchor="middle">${isCut ? '割点' : `d:${step.dfnArray[u] || 0}`}</text>
        </g>
      `;
    })
    .join('');

  const squareSvg = step.squareNodes
    .map((id) => {
      const p = nodeCoords[id];
      if (!p) return '';
      return `
        <g>
          <rect x="${p.x - 13}" y="${p.y - 13}" width="26" height="26" fill="#78350f" stroke="#f59e0b" stroke-width="2" rx="3" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${id}</text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <svg style="width: 100%; height: 100%; min-height: 200px;" viewBox="0 0 310 190">
      ${origSvg}
      ${treeSvg}
      ${roundSvg}
      ${squareSvg}
    </svg>
  `;
}

export function renderBlockCutTreeCustomMetrics(container: HTMLElement, step: BlockCutStep): void {
  const totalIndices = step.roundNodes;

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
        <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 95px; color: ${color};">${name}:</span>
        <div style="display: flex; gap: 3px;">${cells}</div>
      </div>
    `;
  };

  const dfnRow = renderRow('dfn[] (时间戳)', step.dfnArray, 'dfn', '#38bdf8');
  const lowRow = renderRow('low[] (追溯值)', step.lowArray, 'low', '#10b981');
  const stStr = step.stackArray.length > 0 ? `[ ${step.stackArray.join(', ')} ]` : '空栈';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        ${dfnRow}
        ${lowRow}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          <span style="color: #f59e0b; font-size: 10px; font-weight: 700;">Tarjan 点双辅助栈:</span>
          <strong style="color: #b45309; font-family: monospace; font-size: 10.5px;">${stStr}</strong>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
        <strong style="color: #0284c7; font-family: monospace; font-size: 11px;">行 ${step.codeLine}: ${step.log}</strong>
      </div>
    </div>
  `;
}

export class BlockCutTreeCanvasAdapter {
  public mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  public updateStep(container: HTMLElement, step: BlockCutStep): void {
    renderBlockCutTreeCanvas(container, step);
  }

  public renderCustomMetrics(container: HTMLElement, step: BlockCutStep): void {
    renderBlockCutTreeCustomMetrics(container, step);
  }

  public dispose(): void {}
}
