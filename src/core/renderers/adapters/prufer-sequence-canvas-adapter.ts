/**
 * Prufer 序列与 Cayley 公式 (Prufer Sequence) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范，Card 1 输出 100% 纯净 SVG 拓扑沙盘，Card 2 承载父节点、度数与序列状态监控
 */

import type { PruferStep } from '../../../algorithms/categories/graph/prufer-sequence-step-compiler';

export function renderPruferSequenceCanvas(container: HTMLElement, step: PruferStep): void {
  const isLine = step.parentMap[1] === 2;
  const nodeCoords: Record<number, { x: number; y: number }> = isLine
    ? {
        1: { x: 60, y: 105 },
        2: { x: 125, y: 105 },
        3: { x: 190, y: 105 },
        4: { x: 255, y: 105 },
      }
    : {
        1: { x: 155, y: 105 },
        2: { x: 75, y: 60 },
        3: { x: 75, y: 150 },
        4: { x: 245, y: 105 },
      };

  const initialEdges = isLine
    ? [
        [1, 2],
        [2, 3],
        [3, 4],
      ]
    : [
        [2, 1],
        [3, 1],
        [1, 4],
      ];

  const svgEdges = initialEdges
    .map(([u, v]) => {
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (!p1 || !p2) return '';
      const isRemoved = step.removedEdges.some((re) => (re.u === u && re.v === v) || (re.u === v && re.v === u));
      const isAct = step.activeEdge && ((step.activeEdge[0] === u && step.activeEdge[1] === v) || (step.activeEdge[0] === v && step.activeEdge[1] === u));

      const color = isAct ? '#f59e0b' : isRemoved ? '#ef4444' : '#38bdf8';
      const width = isAct ? 3.5 : isRemoved ? 1.5 : 2;

      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isRemoved ? 'stroke-dasharray="3,2"' : ''} />`;
    })
    .join('');

  const nodes = [1, 2, 3, 4];
  const svgNodes = nodes
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';
      const isLeaf = step.curLeaf === u;
      const degVal = step.degMap[u] ?? 0;
      const bg = isLeaf ? '#065f46' : '#1e3a8a';
      const border = isLeaf ? '#10b981' : '#38bdf8';

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="${isLeaf ? 3 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          <text x="${p.x}" y="${p.y + 28}" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">deg:${degVal}</text>
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

export function renderPruferSequenceCustomMetrics(container: HTMLElement, step: PruferStep): void {
  const indices = [1, 2, 3, 4];

  const renderRow = (name: string, arr: any[], activeName: string, color: string) => {
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

  const parentRow = renderRow('parent[] (父节点)', step.parentArray, 'parent', '#38bdf8');
  const degRow = renderRow('deg[] (子树度数)', step.degArray, 'deg', '#10b981');
  const pSeqStr = step.pruferSequence.length > 0 ? `[ ${step.pruferSequence.join(', ')} ]` : '[ ]';
  const lineStr = Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        ${parentRow}
        ${degRow}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          <span style="color: #f59e0b; font-size: 10px; font-weight: 700;">Prufer 序列输出:</span>
          <strong style="color: #d97706; font-family: monospace; font-size: 10.5px;">${pSeqStr}</strong>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
        <strong style="color: #0284c7; font-family: monospace; font-size: 11px;">行 ${lineStr}: ${step.log}</strong>
      </div>
    </div>
  `;
}

export class PruferSequenceCanvasAdapter {
  public mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  public updateStep(container: HTMLElement, step: PruferStep): void {
    renderPruferSequenceCanvas(container, step);
  }

  public renderCustomMetrics(container: HTMLElement, step: PruferStep): void {
    renderPruferSequenceCustomMetrics(container, step);
  }

  public dispose(): void {}
}
