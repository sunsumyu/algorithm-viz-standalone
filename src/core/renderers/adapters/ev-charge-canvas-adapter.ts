/**
 * 电动车充放电最短路画布渲染适配器 (EVChargeCanvasAdapter)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 纯净 SVG 城市路网拓扑沙盘渲染、零内联表格、统一 visualState 状态规范
 */

import { visualState } from '../visual-state-tokens';
import type { EVStep } from '../../../algorithms/categories/graph/ev-charge-dijkstra-step-compiler';

export function renderEVChargeCanvas(container: HTMLElement, step: EVStep): void {
  const nodeCoords: Record<number, { x: number; y: number }> = {
    0: { x: 65, y: 120 },
    1: { x: 160, y: 55 },
    2: { x: 255, y: 120 },
  };

  const edges = step.paths && step.paths.length > 0
    ? step.paths.map(([u, v, w]) => ({ u, v, w }))
    : [
        { u: 0, v: 1, w: 2 },
        { u: 1, v: 2, w: 2 },
      ];

  const charge = step.charge || [2, 1, 5];

  const idleStyle = visualState('idle');
  const comparingStyle = visualState('comparing');
  const pivotStyle = visualState('pivot');
  const discoveredStyle = visualState('discovered');

  const svgEdges = edges
    .map(({ u, v, w }) => {
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (!p1 || !p2) return '';

      const isRoadActive =
        step.status === 'move' &&
        (step.curCity === u || step.curCity === v);

      const stroke = isRoadActive ? comparingStyle.border : idleStyle.border;
      const strokeWidth = isRoadActive ? 3.5 : 1.5;
      const strokeDash = isRoadActive ? 'none' : '4,2';

      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2 - 6;

      return `
        <g>
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" />
          <rect x="${mx - 18}" y="${my - 9}" width="36" height="13" rx="3" fill="#ffffff" stroke="${stroke}" stroke-width="1" />
          <text x="${mx}" y="${my}" fill="${isRoadActive ? comparingStyle.border : idleStyle.text}" font-size="8" font-family="monospace" font-weight="700" text-anchor="middle">w:${w}格</text>
        </g>
      `;
    })
    .join('');

  const nodes = [0, 1, 2];
  const svgNodes = nodes
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';

      const isCur = step.curCity === u;
      const isCharging = isCur && step.status === 'charge';
      const isEnd = u === 2;

      const fill = isCharging
        ? '#10b981'
        : isCur
          ? pivotStyle.bg
          : isEnd
            ? '#eff6ff'
            : idleStyle.bg;

      const stroke = isCharging
        ? '#059669'
        : isCur
          ? pivotStyle.border
          : isEnd
            ? '#3b82f6'
            : idleStyle.border;

      const strokeWidth = isCur ? 3 : 1.5;

      const price = charge[u] ?? 2;

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
          <text x="${p.x}" y="${p.y + 4}" fill="${isCur || isCharging ? '#ffffff' : idleStyle.text}" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">C${u}</text>
          <text x="${p.x}" y="${p.y - 24}" fill="${isCur ? '#f59e0b' : '#64748b'}" font-size="8.5" font-weight="700" text-anchor="middle">
            ${isCur ? (isCharging ? '🔋充电中' : `⚡${step.curPower}/2格`) : ''}
          </text>
          <rect x="${p.x - 24}" y="${p.y + 24}" width="48" height="14" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8" />
          <text x="${p.x}" y="${p.y + 34}" fill="#475569" font-size="7.5" font-weight="600" text-anchor="middle">单价:${price}s/格</text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 4px; box-sizing: border-box;">
      <div style="width: 100%; max-width: 600px; height: 100%; max-height: 250px; display: flex; align-items: center; justify-content: center;">
        <svg viewBox="0 0 320 200" style="width:100%; height:100%; max-height:240px;">
          ${svgEdges}
          ${svgNodes}
        </svg>
      </div>
    </div>
  `;
}

export class EVChargeCanvasAdapter {
  public static render(container: HTMLElement, step: EVStep): void {
    renderEVChargeCanvas(container, step);
  }
}
