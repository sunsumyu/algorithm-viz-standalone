/**
 * 虚树与树形 DP (Virtual Tree) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范，Card 1 输出 100% 纯净 SVG 拓扑沙盘，Card 2 承载单调栈与虚树浓缩监控
 */

import type { VirtualTreeStep } from '../../../algorithms/categories/graph/virtual-tree-step-compiler';

export function renderVirtualTreeCanvas(container: HTMLElement, step: VirtualTreeStep): void {
  const isChain = step.keyNodes.length === 2;
  const nodeCoords: Record<number, { x: number; y: number }> = isChain
    ? {
        1: { x: 155, y: 35 },
        2: { x: 155, y: 85 },
        3: { x: 155, y: 135 },
        4: { x: 155, y: 185 },
      }
    : {
        1: { x: 155, y: 35 },
        2: { x: 85, y: 95 },
        3: { x: 225, y: 95 },
        4: { x: 55, y: 165 },
        5: { x: 115, y: 165 },
        6: { x: 195, y: 165 },
        7: { x: 255, y: 165 },
      };

  const origEdges = isChain
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
        [3, 7],
      ];

  const svgOrigEdges = origEdges
    .map(([u, v]) => {
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (!p1 || !p2) return '';
      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,2" />`;
    })
    .join('');

  const svgVtreeEdges = step.virtualTreeEdges
    .map(({ u, v }) => {
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (!p1 || !p2) return '';
      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#10b981" stroke-width="3" />`;
    })
    .join('');

  const totalNodes = isChain ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6, 7];
  const svgNodes = totalNodes
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';
      const isKey = step.keyNodes.includes(u);
      const inVTree = step.virtualTreeNodes.includes(u);
      const isCur = step.activeNode === u;
      const inStack = step.monoStack.includes(u);

      const bg = isCur ? '#f59e0b' : isKey ? '#991b1b' : inVTree ? '#581c87' : '#1e3a8a';
      const border = isCur ? '#facc15' : inStack ? '#38bdf8' : isKey ? '#ef4444' : inVTree ? '#a855f7' : '#475569';

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="16" fill="${bg}" stroke="${border}" stroke-width="${isCur || inStack ? 3 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          <text x="${p.x}" y="${p.y + 26}" fill="${isKey ? '#f87171' : inVTree ? '#c084fc' : '#94a3b8'}" font-size="8" font-weight="700" text-anchor="middle">${isKey ? '⭐关键' : inVTree ? '虚树点' : `dfn:${step.dfnArray[u] || 0}`}</text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <svg style="width: 100%; height: 100%; min-height: 200px;" viewBox="0 0 320 200">
      ${svgOrigEdges}
      ${svgVtreeEdges}
      ${svgNodes}
    </svg>
  `;
}

export function renderVirtualTreeCustomMetrics(container: HTMLElement, step: VirtualTreeStep): void {
  const isChain = step.keyNodes.length === 2;
  const indices = isChain ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6, 7];

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
        <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 100px; color: ${color};">${name}:</span>
        <div style="display: flex; gap: 4px;">${cells}</div>
      </div>
    `;
  };

  const dfnRow = renderRow('dfn[] (时间戳)', step.dfnArray, 'dfn', '#38bdf8');
  const depthRow = renderRow('depth[] (树深度)', step.depthArray, 'depth', '#f59e0b');
  const stackStr = step.monoStack.length > 0 ? step.monoStack.join(' ➔ ') : '空栈';
  const vtreeStr = step.virtualTreeNodes.length > 0 ? `{ ${step.virtualTreeNodes.join(', ')} }` : '尚未构建';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        ${dfnRow}
        ${depthRow}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          <span style="color: #0284c7; font-size: 10px; font-weight: 700;">单调栈维护最右链:</span>
          <strong style="color: #0284c7; font-family: monospace; font-size: 10.5px;">[ ${stackStr} ]</strong>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 2px;">
          <span style="color: #7c3aed; font-size: 10px; font-weight: 700;">当前虚树浓缩节点集:</span>
          <strong style="color: #7c3aed; font-family: monospace; font-size: 10.5px;">${vtreeStr}</strong>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
        <strong style="color: #0284c7; font-family: monospace; font-size: 11px;">行 ${step.codeLine}: ${step.log}</strong>
      </div>
    </div>
  `;
}

export class VirtualTreeCanvasAdapter {
  public mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  public updateStep(container: HTMLElement, step: VirtualTreeStep): void {
    renderVirtualTreeCanvas(container, step);
  }

  public renderCustomMetrics(container: HTMLElement, step: VirtualTreeStep): void {
    renderVirtualTreeCustomMetrics(container, step);
  }

  public dispose(): void {}
}
