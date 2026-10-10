/**
 * 基环树 DP (Pseudotree DP · 洛谷 P1453 / P2607 骑士) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范：
 * Card 1 输出 100% 纯净 SVG 拓扑沙盘 (基环节点、外挂子树与破环断边)
 * Card 2 承载树形 DP 状态转移 (dp[0], dp[1]) 与两次独立集最优合并
 */

import type { PseudotreeStep } from '../../../algorithms/categories/graph/pseudotree-dp-step-compiler';

export function renderPseudotreeDPCanvas(container: HTMLElement, step: PseudotreeStep): void {
  const is6Node = step.dp0Array.length === 7;
  const nodeCoords: Record<number, { x: number; y: number }> = is6Node
    ? {
        1: { x: 105, y: 75 },
        2: { x: 205, y: 75 },
        3: { x: 155, y: 145 },
        4: { x: 55, y: 45 },
        5: { x: 255, y: 45 },
        6: { x: 155, y: 195 },
      }
    : {
        1: { x: 105, y: 85 },
        2: { x: 205, y: 85 },
        3: { x: 155, y: 155 },
        4: { x: 55, y: 55 },
        5: { x: 155, y: 195 },
      };

  const edges = is6Node
    ? [
        { u: 1, v: 2 },
        { u: 2, v: 3 },
        { u: 3, v: 1, isBroken: step.brokenEdge !== null },
        { u: 1, v: 4 },
        { u: 2, v: 5 },
        { u: 3, v: 6 },
      ]
    : [
        { u: 1, v: 2 },
        { u: 2, v: 3 },
        { u: 3, v: 1, isBroken: step.brokenEdge !== null },
        { u: 1, v: 4 },
        { u: 3, v: 5 },
      ];

  const svgEdges = edges
    .map(({ u, v, isBroken }) => {
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (!p1 || !p2) return '';
      const color = isBroken ? '#ef4444' : '#38bdf8';
      const width = isBroken ? 2.5 : 1.5;

      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isBroken ? 'stroke-dasharray="4,2"' : ''} />`;
    })
    .join('');

  const nodes = is6Node ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];
  const svgNodes = nodes
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';
      const isCycle = step.cycleNodes.includes(u);
      const isSelected = step.selectedNodes && step.selectedNodes.includes(u);
      const isAct = step.activeNodes && step.activeNodes.includes(u);

      const bg = isSelected ? '#065f46' : isCycle ? '#78350f' : isAct ? '#0369a1' : '#1e3a8a';
      const border = isSelected ? '#10b981' : isCycle ? '#f59e0b' : isAct ? '#38bdf8' : '#475569';

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isSelected || isAct ? 3 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          <text x="${p.x}" y="${p.y + 25}" fill="${isSelected ? '#10b981' : '#94a3b8'}" font-size="7.5" font-weight="700" text-anchor="middle">${isSelected ? '★已选' : isCycle ? '环点' : '树点'}</text>
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

export function renderPseudotreeDPCustomMetrics(container: HTMLElement, step: PseudotreeStep): void {
  const is6Node = step.dp0Array.length === 7;
  const nodes = is6Node ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];

  const renderRow = (name: string, arr: any[], activeName: string, color: string) => {
    const cells = nodes
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
        <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 105px; color: ${color};">${name}:</span>
        <div style="display: flex; gap: 3px;">${cells}</div>
      </div>
    `;
  };

  const dp0Row = renderRow('dp[u][0] (不选)', step.dp0Array, 'dp0', '#38bdf8');
  const dp1Row = renderRow('dp[u][1] (选)', step.dp1Array, 'dp1', '#f59e0b');
  const selStr = step.selectedNodes ? `[ ${step.selectedNodes.join(', ')} ]` : '计算中...';
  const lineStr = Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        ${dp0Row}
        ${dp1Row}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          <span style="color: #10b981; font-size: 10px; font-weight: 700;">最优独立集节点集合:</span>
          <strong style="color: #10b981; font-family: monospace; font-size: 10.5px;">${selStr}</strong>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
        <span style="color: #64748b; font-size: 10.5px;">当前执行语句:</span>
        <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${lineStr}: ${step.log}</strong>
      </div>
    </div>
  `;
}

export class PseudotreeDPCanvasAdapter {
  public mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  public updateStep(container: HTMLElement, step: PseudotreeStep): void {
    renderPseudotreeDPCanvas(container, step);
  }

  public renderCustomMetrics(container: HTMLElement, step: PseudotreeStep): void {
    renderPseudotreeDPCustomMetrics(container, step);
  }

  public dispose(): void {}
}
