/**
 * 上下界网络流 (Bounded Flow) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范，Card 1 输出纯净 SVG 拓扑，Card 2 承载差额与分层状态多行矩阵
 */

import type { BoundedFlowStep } from '../../../algorithms/categories/graph/bounded-flow-step-compiler';

export function renderBoundedFlowCanvas(container: HTMLElement, step: BoundedFlowStep): void {
  const isTriangle = Object.keys(step.deltaValues).length === 3;
  const nodeCoords: Record<string, { x: number; y: number }> = isTriangle
    ? {
        1: { x: 155, y: 55 },
        2: { x: 95, y: 155 },
        3: { x: 215, y: 155 },
        SS: { x: 40, y: 105 },
        TT: { x: 270, y: 105 },
      }
    : {
        1: { x: 95, y: 55 },
        2: { x: 215, y: 55 },
        3: { x: 215, y: 155 },
        4: { x: 95, y: 155 },
        SS: { x: 40, y: 105 },
        TT: { x: 270, y: 105 },
      };

  const svgEdges = step.edges
    .map((e) => {
      const p1 = nodeCoords[`${e.u}`];
      const p2 = nodeCoords[`${e.v}`];
      if (!p1 || !p2) return '';
      const isSuper = e.isSuper;
      const isActive =
        step.activeEdge &&
        step.activeEdge[0] === `${e.u}` &&
        step.activeEdge[1] === `${e.v}`;

      const color = isActive ? '#f59e0b' : isSuper ? '#a855f7' : '#10b981';
      const width = isActive ? 3 : 2;

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const label = isSuper
        ? `补流:${e.freeCap}`
        : step.phase === 'ALL_DONE'
        ? `流:${e.flow}[${e.low},${e.up}]`
        : `[${e.low},${e.up}] 容:${e.freeCap}`;

      return `
        <g>
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                stroke="${color}" stroke-width="${width}"
                ${isSuper ? 'stroke-dasharray="4,3"' : ''} />
          <rect x="${midX - 28}" y="${midY - 7}" width="56" height="14" rx="3" fill="#0f172a" fill-opacity="0.75" />
          <text x="${midX}" y="${midY + 3.5}" fill="${color}" font-size="8" font-family="monospace" font-weight="700" text-anchor="middle">${label}</text>
        </g>
      `;
    })
    .join('');

  const regularNodes = isTriangle ? ['1', '2', '3'] : ['1', '2', '3', '4'];
  const allNodeKeys = step.showSuperNodes ? [...regularNodes, 'SS', 'TT'] : regularNodes;

  const svgNodes = allNodeKeys
    .map((k) => {
      const p = nodeCoords[k];
      if (!p) return '';
      const isSuper = k === 'SS' || k === 'TT';
      const bg = isSuper ? '#b45309' : '#1e3a8a';
      const border = isSuper ? '#f59e0b' : '#38bdf8';
      const dVal = step.deltaValues[Number(k)] ?? 0;

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="16" fill="${bg}" stroke="${border}" stroke-width="2" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${k}</text>
          <text x="${p.x}" y="${p.y + 27}" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">
            ${isSuper ? '超源汇' : `Δ:${dVal > 0 ? `+${dVal}` : dVal}`}
          </text>
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

export function renderBoundedFlowCustomMetrics(container: HTMLElement, step: BoundedFlowStep): void {
  const isTriangle = Object.keys(step.deltaValues).length === 3;
  const indices = isTriangle ? [1, 2, 3] : [1, 2, 3, 4];

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
          <span style="line-height: 1.1;">${val > 0 ? `+${val}` : val}</span>
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

  const deltaRow = renderRow('delta[] (净收支)', step.deltaValues, 'delta', '#38bdf8');
  const levelRow = step.levelValues ? renderRow('level[] (层次深)', step.levelValues, 'level', '#f59e0b') : '';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #374151; padding: 2px 0;">
      <div style="display: flex; flex-direction: column; gap: 4px; background: #f8fafc; padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        ${deltaRow}
        ${levelRow}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          <span style="color: #10b981; font-size: 10px; font-weight: 700;">伴随网络满流进度:</span>
          <strong style="color: #10b981; font-family: monospace; font-size: 10.5px;">${step.totalPushed} / ${step.sumPositiveDelta} (${step.isFeasible ? '✓ 达成满流' : '推流求解中'})</strong>
        </div>
      </div>
    </div>
  `;
}
