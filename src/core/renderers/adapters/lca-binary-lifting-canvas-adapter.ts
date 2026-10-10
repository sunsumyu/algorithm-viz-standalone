/**
 * 最近公共祖先 LCA (Binary Lifting LCA) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范，Card 1 输出 100% 纯净 SVG 拓扑沙盘，Card 2 承载树深度与倍增表跳转监控
 */

import type { LCAStep } from '../../../algorithms/categories/graph/lca-binary-lifting-step-compiler';

export function renderLCABinaryLiftingCanvas(container: HTMLElement, step: LCAStep): void {
  const isFork = step.nodeU === 4 && step.nodeV === 5;
  const nodeCoords: Record<number, { x: number; y: number }> = isFork
    ? {
        1: { x: 155, y: 35 },
        2: { x: 95, y: 105 },
        3: { x: 215, y: 105 },
        4: { x: 95, y: 175 },
        5: { x: 215, y: 175 },
      }
    : {
        1: { x: 155, y: 35 },
        2: { x: 95, y: 85 },
        3: { x: 215, y: 85 },
        4: { x: 65, y: 135 },
        5: { x: 125, y: 135 },
        6: { x: 65, y: 185 },
        7: { x: 215, y: 135 },
      };

  const edges = isFork
    ? [
        [1, 2],
        [1, 3],
        [2, 4],
        [3, 5],
      ]
    : [
        [1, 2],
        [1, 3],
        [2, 4],
        [2, 5],
        [4, 6],
        [3, 7],
      ];

  const svgEdges = edges
    .map(([u, v]) => {
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (!p1 || !p2) return '';
      const inPath = step.activePath && step.activePath.includes(u) && step.activePath.includes(v);
      const color = inPath ? '#10b981' : '#475569';
      const width = inPath ? 3.5 : 1.5;

      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
    })
    .join('');

  const nodes = isFork ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7];
  const svgNodes = nodes
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';
      const isLCA = step.lcaResult === u;
      const isCur = step.curU === u || step.curV === u;
      const isQuery = step.nodeU === u || step.nodeV === u;

      const bg = isLCA ? '#b45309' : isCur ? '#065f46' : isQuery ? '#991b1b' : '#1e3a8a';
      const border = isLCA ? '#f59e0b' : isCur ? '#10b981' : isQuery ? '#ef4444' : '#38bdf8';

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isLCA || isCur ? 3 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          <text x="${p.x}" y="${p.y + 25}" fill="${isLCA ? '#f59e0b' : '#94a3b8'}" font-size="7.5" font-weight="700" text-anchor="middle">${isLCA ? '👑LCA' : `d:${step.depthArray[u] || 0}`}</text>
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

export function renderLCABinaryLiftingCustomMetrics(container: HTMLElement, step: LCAStep): void {
  const isFork = step.nodeU === 4 && step.nodeV === 5;
  const totalIndices = isFork ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7];

  const renderRow = (name: string, arr: any[], activeName: string, color: string) => {
    const cells = totalIndices
      .map((idx) => {
        const val = arr[idx] ?? 0;
        const isActive = step.activeArray === activeName && step.activeSlot === idx;
        const bg = isActive ? '#fef08a' : '#1e293b';
        const textCol = isActive ? '#854d0e' : '#e2e8f0';
        const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';

        return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 30px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
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

  const depthRow = renderRow('depth[] (树深度)', step.depthArray, 'depth', '#38bdf8');
  const up0Row = renderRow('up[u][0] (父节点)', step.up0Array, 'up0', '#10b981');
  const up1Row = renderRow('up[u][1] (祖先2步)', step.up1Array, 'up1', '#f59e0b');

  const distStr = step.treeDist !== undefined ? `dist = ${step.treeDist}` : '计算中...';
  const lineStr = Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        ${depthRow}
        ${up0Row}
        ${up1Row}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          <span style="color: #10b981; font-size: 10px; font-weight: 700;">两点树上最短距离:</span>
          <strong style="color: #059669; font-family: monospace; font-size: 10.5px;">${distStr}</strong>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
        <strong style="color: #0284c7; font-family: monospace; font-size: 11px;">行 ${lineStr}: ${step.log}</strong>
      </div>
    </div>
  `;
}

export class LCABinaryLiftingCanvasAdapter {
  public mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  public updateStep(container: HTMLElement, step: LCAStep): void {
    renderLCABinaryLiftingCanvas(container, step);
  }

  public renderCustomMetrics(container: HTMLElement, step: LCAStep): void {
    renderLCABinaryLiftingCustomMetrics(container, step);
  }

  public dispose(): void {}
}
