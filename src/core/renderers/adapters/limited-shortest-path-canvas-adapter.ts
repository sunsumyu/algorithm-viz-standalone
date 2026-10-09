/**
 * 有限最短路画布渲染适配器 (LimitedShortestPathCanvasAdapter)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 纯净 SVG 航班拓扑沙盘渲染、零内联表格与芯片条、统一 visualState 状态规范
 */

import { visualState } from '../visual-state-tokens';
import {
  LSP_EDGES,
  LSP_NODES,
  LSP_NODE_POS,
  LSP_SOURCE,
  type LSPStep,
} from '../../../algorithms/categories/graph/limited-shortest-path-step-compiler';

export function renderLimitedShortestPathCanvas(container: HTMLElement, step: LSPStep): void {
  const { dist, currentEdge, relaxedEdge, target } = step;

  const idleStyle = visualState('idle');
  const comparingStyle = visualState('comparing');
  const discoveredStyle = visualState('discovered');

  let svgHtml = `<svg viewBox="0 0 460 250" style="width:100%; height:100%; max-height:240px;">
    <defs>
      <marker id="lsp-arrow-gray" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" />
      </marker>
      <marker id="lsp-arrow-blue" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="${comparingStyle.border}" />
      </marker>
      <marker id="lsp-arrow-green" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="${discoveredStyle.border}" />
      </marker>
    </defs>`;

  // 绘制边与权重
  for (const e of LSP_EDGES) {
    const p1 = LSP_NODE_POS[e.u];
    const p2 = LSP_NODE_POS[e.v];
    const isCurrent = currentEdge && currentEdge.u === e.u && currentEdge.v === e.v;

    const stroke = isCurrent ? (relaxedEdge ? discoveredStyle.border : comparingStyle.border) : idleStyle.border;
    const strokeWidth = isCurrent ? 3.5 : 1.8;
    const marker = isCurrent ? (relaxedEdge ? 'url(#lsp-arrow-green)' : 'url(#lsp-arrow-blue)') : 'url(#lsp-arrow-gray)';

    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2 - 6;

    svgHtml += `
      <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${stroke}" stroke-width="${strokeWidth}" marker-end="${marker}" />
      <rect x="${mx - 9}" y="${my - 7}" width="18" height="13" rx="2" fill="#ffffff" stroke="${stroke}" stroke-width="0.8" />
      <text x="${mx}" y="${my + 3}" fill="${isCurrent ? stroke : idleStyle.text}" font-size="10" font-weight="700" font-family="monospace" text-anchor="middle">${e.w}</text>
    `;
  }

  // 绘制节点
  for (const u of LSP_NODES) {
    const pos = LSP_NODE_POS[u];
    const d = dist[u] >= 999999 ? '∞' : dist[u];
    const isSrc = u === LSP_SOURCE;
    const isDst = u === target;

    let fill = idleStyle.bg;
    let stroke = idleStyle.border;
    let textColor = idleStyle.text;

    if (currentEdge && (currentEdge.u === u || currentEdge.v === u)) {
      fill = relaxedEdge && currentEdge.v === u ? '#f0fdf4' : '#eff6ff';
      stroke = relaxedEdge && currentEdge.v === u ? discoveredStyle.border : comparingStyle.border;
      textColor = relaxedEdge && currentEdge.v === u ? '#15803d' : '#1d4ed8';
    } else if (isSrc) {
      fill = '#eff6ff';
      stroke = '#3b82f6';
    } else if (isDst) {
      fill = '#fef2f2';
      stroke = '#ef4444';
    }

    const badge = isSrc ? ' (S)' : isDst ? ' (D)' : '';

    svgHtml += `
      <g>
        <circle cx="${pos.x}" cy="${pos.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
        <text x="${pos.x}" y="${pos.y + 4.5}" text-anchor="middle" font-size="11" font-weight="800" fill="${textColor}" font-family="monospace">${u}${badge}</text>
        <rect x="${pos.x - 18}" y="${pos.y + 22}" width="36" height="13" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8" />
        <text x="${pos.x}" y="${pos.y + 31}" text-anchor="middle" font-size="8.5" font-weight="700" fill="#64748b" font-family="monospace">d:${d}</text>
      </g>
    `;
  }

  svgHtml += `</svg>`;

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 4px; box-sizing: border-box;">
      <div style="width: 100%; max-width: 600px; height: 100%; max-height: 250px; display: flex; align-items: center; justify-content: center;">
        ${svgHtml}
      </div>
    </div>
  `;
}

export class LimitedShortestPathCanvasAdapter {
  public static render(container: HTMLElement, step: LSPStep): void {
    renderLimitedShortestPathCanvas(container, step);
  }
}
