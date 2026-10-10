/**
 * 最小生成树算法 (MST - Kruskal & Prim) (Class 027) — 领域视觉适配器
 * 遵循 Matt Pocock 深模块哲学：
 * Card 1 纯 SVG 图拓扑沙盘 (带权无向图 + 候选/已选生成树边动态高亮)
 * Card 2 承载边权升序队列展板与 Kruskal 并查集贪心决策卡
 */

import type { Mst027Step } from '../../../algorithms/categories/graph/mst-kruskal-prim-027-step-compiler';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

const NODE_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: 90, y: 80 },
  2: { x: 250, y: 60 },
  3: { x: 140, y: 190 },
  4: { x: 370, y: 150 },
  5: { x: 250, y: 200 },
  6: { x: 410, y: 70 },
};

export function renderMst027Canvas(container: HTMLElement, step: Mst027Step): void {
  const { edges, activeEdge, selectedEdges, totalWeight, nodeCount } = step;

  // 1. 节点位置索引
  const getNodePos = (id: number) => {
    return NODE_POSITIONS[id] || { x: 50 + id * 70, y: 120 };
  };

  // 2. 边渲染
  const edgesSvg = edges
    .map((e) => {
      const p1 = getNodePos(e.u);
      const p2 = getNodePos(e.v);
      const isSelected = selectedEdges.some((se) => (se.u === e.u && se.v === e.v) || (se.u === e.v && se.v === e.u));
      const isActive = activeEdge && ((activeEdge.u === e.u && activeEdge.v === e.v) || (activeEdge.u === e.v && activeEdge.v === e.u));

      let stroke = '#475569';
      let strokeWidth = 2;
      let strokeDasharray = 'none';

      if (isSelected) {
        stroke = '#10b981';
        strokeWidth = 4;
      } else if (isActive) {
        stroke = '#f59e0b';
        strokeWidth = 3.5;
        strokeDasharray = '5 3';
      }

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      return `
        <g class="mst-edge">
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDasharray}" />
          <rect x="${midX - 10}" y="${midY - 9}" width="20" height="18" rx="4" fill="#0f172a" stroke="${stroke}" stroke-width="1" />
          <text x="${midX}" y="${midY + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#f8fafc" font-family="JetBrains Mono, monospace">${e.w}</text>
        </g>
      `;
    })
    .join('');

  // 3. 节点渲染
  const nodesSvg = Array.from({ length: nodeCount }, (_, i) => i + 1)
    .map((id) => {
      const pos = getNodePos(id);
      const isActiveNode = activeEdge && (activeEdge.u === id || activeEdge.v === id);
      const isConnected = selectedEdges.some((se) => se.u === id || se.v === id);

      let fill = '#1e293b';
      let stroke = '#64748b';
      let textColor = '#cbd5e1';
      let ring = '';

      if (isConnected) {
        fill = '#064e3b';
        stroke = '#10b981';
        textColor = '#d1fae5';
      }

      if (isActiveNode) {
        stroke = '#f59e0b';
        ring = `<circle cx="${pos.x}" cy="${pos.y}" r="24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 2" opacity="0.8" />`;
      }

      return `
        <g class="graph-node" data-node="${id}">
          ${ring}
          <circle cx="${pos.x}" cy="${pos.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
          <text x="${pos.x}" y="${pos.y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="${textColor}" font-family="JetBrains Mono, monospace">${id}</text>
        </g>
      `;
    })
    .join('');

  // 4. 状态标签
  const badgeSvg = `
    <g transform="translate(14, 16)">
      <rect x="0" y="0" width="180" height="24" rx="4" fill="#0f172a" stroke="#10b981" stroke-width="1.5" opacity="0.95" />
      <circle cx="12" cy="12" r="4" fill="#10b981" />
      <text x="24" y="16" font-size="11" font-weight="700" fill="#e2e8f0" font-family="system-ui, sans-serif">MST 权值: ${totalWeight} | 边: ${selectedEdges.length}/${nodeCount - 1}</text>
    </g>
  `;

  // 5. 纯 SVG 注入 Card 1（严禁外层包装 div）
  container.innerHTML = `
    <svg viewBox="0 0 460 250" style="width:100%; height:100%; max-height:240px; display:block; background:#0b1120;">
      <defs>
        <pattern id="mst-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#1e293b" opacity="0.6"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mst-grid)" />
      ${edgesSvg}
      ${nodesSvg}
      ${badgeSvg}
    </svg>
  `.trim();
}

export function renderMst027CustomMetrics(container: HTMLElement, step: Mst027Step): void {
  const edgeChips = step.edges
    .map((e) => {
      const isSelected = step.selectedEdges.some((se) => (se.u === e.u && se.v === e.v) || (se.u === e.v && se.v === e.u));
      const isActive = step.activeEdge && ((step.activeEdge.u === e.u && step.activeEdge.v === e.v) || (step.activeEdge.u === e.v && step.activeEdge.v === e.u));

      let border = '#334155';
      let bg = '#1e293b';
      let statusColor = '#94a3b8';
      let statusText = '⚪ 待考量';

      if (isSelected) {
        border = '#059669';
        bg = '#064e3b';
        statusColor = '#6ee7b7';
        statusText = '✅ 已入选';
      } else if (isActive) {
        border = '#d97706';
        bg = '#78350f';
        statusColor = '#fde68a';
        statusText = '⏳ 判定中';
      }

      return `
        <div style="padding: 6px 10px; border: 1.5px solid ${border}; background: ${bg}; border-radius: 6px; text-align: center; min-width: 64px;">
          <div style="font-size: 11px; font-weight: 700; color: #f1f5f9;">${e.u} ↔ ${e.v}</div>
          <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">w=${e.w}</div>
          <div style="font-size: 9px; font-weight: 700; color: ${statusColor}; margin-top: 2px;">${statusText}</div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:10px; padding:10px; background:#0f172a; border-radius:8px; border:1px solid #1e293b;">
      <div style="font-size:11px; font-weight:700; color:#cbd5e1;">🌐 边权升序队列 (Kruskal 贪心考量):</div>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">${edgeChips}</div>
      ${renderFormulaCard(
        'Kruskal 判定核心逻辑',
        'if (find(u) != find(v)) { union(u, v); total += w; }',
        step.decision,
        step.statusBadge
      )}
    </div>
  `.trim();
}

export class Mst027CanvasAdapter {
  mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  updateStep(container: HTMLElement, step: unknown): void {
    const mstStep = step as Mst027Step;
    if (!mstStep) return;
    renderMst027Canvas(container, mstStep);
  }

  dispose(container: HTMLElement): void {
    container.innerHTML = '';
  }
}
