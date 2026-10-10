/**
 * 并查集理论基础 (Union-Find Theory) — 领域视觉适配器
 * 遵循 Matt Pocock 深模块哲学：
 * Card 1: 100% 纯 SVG 并查集森林拓扑图 (Disjoint-Set Forest Canvas)
 * Card 2: Parent / Rank 数组监视舱与集合状态诊断
 */

import {
  type UFStep,
  UF_NODE_POSITIONS,
} from '../../../algorithms/categories/graph/union-find-theory-step-compiler';

export function renderUnionFindTheoryCanvas(container: HTMLElement, step: UFStep): void {
  const { parent, activeNodes, action } = step;
  const n = parent.length;
  const activeSet = new Set(activeNodes);

  const width = 640;
  const height = 300;

  // 1. 绘制父子指向有向边
  let edgesSvg = '';
  for (let i = 0; i < n; i++) {
    const p = parent[i];
    if (p !== i) {
      const from = UF_NODE_POSITIONS[i];
      const to = UF_NODE_POSITIONS[p];
      const isActive = activeSet.has(i) && activeSet.has(p);
      const isCompress = action === 'compress' && activeSet.has(i);

      const stroke = isCompress ? '#06b6d4' : isActive ? '#f59e0b' : '#34d399';
      const strokeWidth = isActive || isCompress ? 2.5 : 1.8;
      const strokeDash = isCompress ? 'stroke-dasharray="4 3"' : '';

      // 缩进起点与终点，避免与节点圆圈重叠 (r=20)
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 30) {
        const sx = from.x + (dx / dist) * 20;
        const sy = from.y + (dy / dist) * 20;
        const ex = to.x - (dx / dist) * 22;
        const ey = to.y - (dy / dist) * 22;

        const markerId = isCompress ? 'uft-arr-compress' : isActive ? 'uft-arr-active' : 'uft-arr-normal';
        edgesSvg += `
          <line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="${stroke}" stroke-width="${strokeWidth}" ${strokeDash} marker-end="url(#${markerId})" opacity="0.85" />
        `;
      }
    }
  }

  // 2. 绘制节点
  let nodesSvg = '';
  for (let i = 0; i < n; i++) {
    const pos = UF_NODE_POSITIONS[i];
    const isRoot = parent[i] === i;
    const isActive = activeSet.has(i);

    const fill = isActive ? '#78350f' : isRoot ? '#064e3b' : '#0f172a';
    const stroke = isActive ? '#f59e0b' : isRoot ? '#10b981' : '#475569';
    const strokeW = isActive ? 3 : isRoot ? 2.5 : 1.5;

    nodesSvg += `
      <g class="uft-node">
        ${isActive ? `<circle cx="${pos.x}" cy="${pos.y}" r="26" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.75" />` : ''}
        <circle cx="${pos.x}" cy="${pos.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" />
        <text x="${pos.x}" y="${pos.y + 5}" text-anchor="middle" fill="${isActive ? '#fde047' : '#f8fafc'}" font-size="13" font-weight="800" font-family="monospace">${i}</text>
        ${isRoot ? `<text x="${pos.x}" y="${pos.y - 25}" text-anchor="middle" fill="#34d399" font-size="9" font-weight="700" font-family="sans-serif">👑 ROOT</text>` : ''}
        <text x="${pos.x}" y="${pos.y + 35}" text-anchor="middle" fill="#94a3b8" font-size="9.5" font-family="monospace">p:${parent[i]} rk:${step.rank[i]}</text>
      </g>
    `;
  }

  // 3. 箭头标记定义
  const defsSvg = `
    <defs>
      <marker id="uft-arr-normal" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399" />
      </marker>
      <marker id="uft-arr-active" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
      </marker>
      <marker id="uft-arr-compress" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4" />
      </marker>
    </defs>
  `;

  // Card 1 强制纯 SVG 渲染
  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block; background:#020617;">
      ${defsSvg}
      ${edgesSvg}
      ${nodesSvg}
    </svg>
  `.trim();
}

export function renderUnionFindTheoryCustomMetrics(container: HTMLElement, step: UFStep): void {
  const { parent, rank, activeNodes, opLabel, setsCount, mergesCount, message } = step;
  const activeSet = new Set(activeNodes);

  const parentCells = parent
    .map((p, i) => {
      const isAct = activeSet.has(i);
      const isRoot = p === i;
      const bg = isAct ? '#78350f' : isRoot ? '#064e3b' : '#1e293b';
      const textCol = isAct ? '#fde047' : isRoot ? '#34d399' : '#cbd5e1';
      const border = isAct ? '1.5px solid #f59e0b' : '1px solid #334155';
      return `
        <div style="display:flex; flex-direction:column; align-items:center; min-width:32px; background:${bg}; border:${border}; border-radius:4px; padding:2px 4px; font-family:monospace; font-size:11px;">
          <span style="font-size:8px; color:#64748b;">${i}</span>
          <span style="color:${textCol}; font-weight:700;">${p}</span>
        </div>
      `;
    })
    .join('');

  const rankCells = rank
    .map((r, i) => {
      const isAct = activeSet.has(i);
      return `
        <div style="display:flex; flex-direction:column; align-items:center; min-width:32px; background:#1e293b; border:1px solid #334155; border-radius:4px; padding:2px 4px; font-family:monospace; font-size:11px;">
          <span style="font-size:8px; color:#64748b;">${i}</span>
          <span style="color:${isAct ? '#f59e0b' : '#38bdf8'}; font-weight:700;">${r}</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:8px; padding:10px; background:#0f172a; border-radius:8px; border:1px solid #1e293b;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="padding:2px 7px; border-radius:4px; background:rgba(56,189,248,0.15); color:#38bdf8; font-weight:700; font-size:11px; border:1px solid rgba(56,189,248,0.3);">${opLabel}</span>
          <span style="font-size:11px; color:#94a3b8;">集合数: <strong style="color:#34d399;">${setsCount}</strong></span>
          <span style="font-size:11px; color:#94a3b8;">合并次数: <strong style="color:#f59e0b;">${mergesCount}</strong></span>
        </div>
        <div style="font-size:10.5px; font-family:monospace; color:#10b981; font-weight:700;">
          O(α(n)) 均摊常数
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap:4px; border-top:1px dashed #334155; padding-top:6px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-family:monospace; font-size:10px; color:#94a3b8; width:70px;">parent[]:</span>
          <div style="display:flex; gap:4px;">${parentCells}</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-family:monospace; font-size:10px; color:#94a3b8; width:70px;">rank[]:</span>
          <div style="display:flex; gap:4px;">${rankCells}</div>
        </div>
      </div>
      <div style="font-size:11px; color:#cbd5e1; line-height:1.4; border-top:1px dashed #334155; padding-top:4px;">
        ${message}
      </div>
    </div>
  `.trim();
}

export class UnionFindTheoryCanvasAdapter {
  mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  updateStep(container: HTMLElement, step: unknown): void {
    const uStep = step as UFStep;
    if (!uStep) return;
    renderUnionFindTheoryCanvas(container, uStep);
  }

  dispose(container: HTMLElement): void {
    container.innerHTML = '';
  }
}
