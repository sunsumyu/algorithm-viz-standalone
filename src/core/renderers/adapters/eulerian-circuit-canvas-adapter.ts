/**
 * 欧拉回路 (Eulerian Circuit) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范，Card 1 输出纯净 SVG 拓扑沙盘，Card 2 承载当前弧与轨迹监视器
 */

import type { EulerianStep } from '../../../algorithms/categories/graph/eulerian-circuit-step-compiler';

export function renderEulerianCircuitCanvas(container: HTMLElement, step: EulerianStep): void {
  const isTriangle = step.headArray.length === 4;

  const nodeCoords: Record<number, { x: number; y: number }> = isTriangle
    ? {
        1: { x: 155, y: 45 },
        2: { x: 85, y: 135 },
        3: { x: 225, y: 135 },
      }
    : {
        1: { x: 75, y: 55 },
        2: { x: 235, y: 55 },
        3: { x: 235, y: 135 },
        4: { x: 75, y: 135 },
      };

  const allEdges = isTriangle
    ? [[1, 2], [2, 3], [3, 1]]
    : [[1, 2], [2, 3], [3, 4], [4, 1]];

  const svgEdges = allEdges
    .map(([u, v]) => {
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (!p1 || !p2) return '';

      const isAct = step.activeEdge && step.activeEdge[0] === u && step.activeEdge[1] === v;
      const isVisited = step.visitedEdges.some(([fu, fv]) => fu === u && fv === v);

      const color = isAct ? '#facc15' : isVisited ? '#10b981' : '#64748b';
      const width = isAct ? 3.5 : isVisited ? 2.5 : 1.5;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const mx = (p1.x + p2.x) / 2 - dy * 0.12;
      const my = (p1.y + p2.y) / 2 + dx * 0.12;

      return `
        <g>
          <path d="M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}" fill="none" stroke="${color}" stroke-width="${width}" marker-end="url(#euler-arrow)" />
        </g>
      `;
    })
    .join('');

  const nodes = isTriangle ? [1, 2, 3] : [1, 2, 3, 4];
  const svgNodes = nodes
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';
      const isCur = step.curNode === u;
      const inStack = step.activeStack.includes(u);
      const bg = isCur ? '#b45309' : inStack ? '#1e3a8a' : '#1e293b';
      const border = isCur ? '#facc15' : inStack ? '#38bdf8' : '#475569';

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="16" fill="${bg}" stroke="${border}" stroke-width="${isCur || inStack ? 2.5 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          <text x="${p.x}" y="${p.y + 25}" fill="#94a3b8" font-size="7.5" font-weight="700" text-anchor="middle">弧:${step.headArray[u]}</text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <svg style="width: 100%; height: 100%; min-height: 200px;" viewBox="0 0 310 180">
      <defs>
        <marker id="euler-arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
        </marker>
      </defs>
      ${svgEdges}
      ${svgNodes}
    </svg>
  `;
}

export function renderEulerianCircuitCustomMetrics(container: HTMLElement, step: EulerianStep): void {
  const isTriangle = step.headArray.length === 4;
  const indices = isTriangle ? [1, 2, 3] : [1, 2, 3, 4];

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

  const headRow = renderRow('head[] (当前弧)', step.headArray, 'head', '#38bdf8');
  const degRow = renderRow('outDeg[] (出度)', step.degArray, 'deg', '#10b981');
  const stackStr = step.activeStack.length > 0 ? step.activeStack.join(' ➔ ') : '空栈';
  const pathBadges = step.circuitPath.length > 0
    ? step.circuitPath.map((u, idx) => `<span style="background: #1e293b; border: 1px solid #10b981; border-radius: 4px; padding: 1px 6px; font-size: 10.5px; color: #a7f3d0; font-family: monospace; font-weight: 700;">${idx === 0 ? '' : '➔ '}${u}</span>`).join(' ')
    : '<span style="font-size: 10px; color: #64748b;">(回路构建中...)</span>';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        ${headRow}
        ${degRow}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          <span style="color: #a855f7; font-size: 10px; font-weight: 700;">DFS 调用栈:</span>
          <strong style="color: #a855f7; font-family: monospace; font-size: 10.5px;">[ ${stackStr} ]</strong>
        </div>
        <div style="display: flex; flex-direction: column; gap: 2px; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          <span style="color: #10b981; font-size: 10px; font-weight: 700;">一笔画欧拉回路轨迹:</span>
          <div style="display: flex; flex-wrap: wrap; gap: 4px; align-items: center; margin-top: 2px;">
            ${pathBadges}
          </div>
        </div>
      </div>
    </div>
  `;
}
