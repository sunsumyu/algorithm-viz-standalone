/**
 * DAG 支配树 (Dominator Tree) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范，Card 1 输出纯净 SVG 拓扑，Card 2 承载支配与倍增状态监视器
 */

import type { DominatorStep } from '../../../algorithms/categories/graph/dominator-tree-step-compiler';

export function renderDominatorTreeCanvas(container: HTMLElement, step: DominatorStep): void {
  const nodeCoords: Record<number, { x: number; y: number }> = {
    1: { x: 155, y: 40 },
    2: { x: 80, y: 105 },
    3: { x: 230, y: 105 },
    4: { x: 155, y: 175 },
  };

  const origEdges = [
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 4],
  ];

  const svgOrigEdges = origEdges
    .map(([u, v]) => {
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (!p1 || !p2) return '';
      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,2" />`;
    })
    .join('');

  const svgDomEdges = step.dominatorTreeEdges
    .map(({ u, v }) => {
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (!p1 || !p2) return '';
      return `
        <g>
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#a855f7" stroke-width="3" />
        </g>
      `;
    })
    .join('');

  const nodes = [1, 2, 3, 4];
  const svgNodes = nodes
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';
      const isCur = step.curNode === u;
      const isRoot = u === 1;
      const idomVal = step.idomMap[u];

      const bg = isCur ? '#f59e0b' : isRoot ? '#065f46' : idomVal ? '#581c87' : '#1e3a8a';
      const border = isCur ? '#facc15' : isRoot ? '#10b981' : idomVal ? '#a855f7' : '#38bdf8';

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="${isCur ? 3 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          <text x="${p.x}" y="${p.y + 28}" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">
            ${isRoot ? '根点' : `idom:${idomVal ?? '?'}`}
          </text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <svg style="width: 100%; height: 100%; min-height: 200px;" viewBox="0 0 310 200">
      ${svgOrigEdges}
      ${svgDomEdges}
      ${svgNodes}
    </svg>
  `;
}

export function renderDominatorTreeCustomMetrics(container: HTMLElement, step: DominatorStep): void {
  const indices = [1, 2, 3, 4];
  const renderRow = (name: string, map: Record<number, any>, activeName: string, color: string) => {
    const cells = indices
      .map((idx) => {
        const val = map[idx];
        const isActive = step.activeArray === activeName && step.activeSlot === idx;
        const displayVal = val === null || val === undefined ? '∅' : val;
        const bg = isActive ? '#fef08a' : '#1e293b';
        const textCol = isActive ? '#854d0e' : '#e2e8f0';
        const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';

        return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 32px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
          <span style="font-size: 7.5px; color: #64748b; line-height: 1;">[${idx}]</span>
          <span style="line-height: 1.1;">${displayVal}</span>
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

  const inDegRow = renderRow('inDegree[] (入度)', step.inDegreeMap, 'inDegree', '#38bdf8');
  const idomRow = renderRow('idom[] (支配点)', step.idomMap, 'idom', '#a855f7');
  const depthRow = renderRow('depth[] (树深度)', step.depthMap, 'depth', '#f59e0b');
  const qStr = step.topoQueue.length > 0 ? step.topoQueue.join(' ➔ ') : '空队列';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        ${inDegRow}
        ${idomRow}
        ${depthRow}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          <span style="color: #38bdf8; font-size: 10px; font-weight: 700;">拓扑排序队列:</span>
          <strong style="color: #38bdf8; font-family: monospace; font-size: 10.5px;">[ ${qStr} ]</strong>
        </div>
      </div>
    </div>
  `;
}
