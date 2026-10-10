/**
 * 所有可能的路径 (LC 797) — 领域视觉适配器 (ReachablePathsCanvasAdapter)
 * 遵循 Matt Pocock 深模块规范：
 * Card 1 纯 SVG DAG 拓扑与回溯搜索沙盘
 * Card 2 承载回溯栈监视与已收集路径芯片舱
 */

import type { ReachablePathsStep } from '../../../algorithms/categories/graph/reachable-paths-step-compiler';
import { DAG_POSITIONS } from '../../../algorithms/categories/graph/reachable-paths-step-compiler';

export function renderReachablePathsCanvas(container: HTMLElement, step: ReachablePathsStep): void {
  const { nodes, edges, currentNode, currentPath, allPaths, action } = step;

  const positions = nodes.map(
    (_, i) => DAG_POSITIONS[i] || { x: 70 + (i % 3) * 140, y: 60 + Math.floor(i / 3) * 70 }
  );

  // 1. 当前路径边的集合
  const curEdgeSet = new Set<string>();
  if (currentPath.length > 1) {
    for (let i = 0; i < currentPath.length - 1; i++) {
      curEdgeSet.add(`${currentPath[i]}->${currentPath[i + 1]}`);
    }
  }

  // 2. 绘制有向边
  const edgesSvg = edges
    .map(([u, v]) => {
      const p1 = positions[u] || { x: 50, y: 50 };
      const p2 = positions[v] || { x: 150, y: 150 };
      const isCurEdge = curEdgeSet.has(`${u}->${v}`);

      const stroke = isCurEdge ? '#38bdf8' : '#475569';
      const strokeWidth = isCurEdge ? 3.5 : 2;
      const marker = isCurEdge ? 'url(#arrow-rp-blue)' : 'url(#arrow-rp-gray)';

      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${stroke}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
    })
    .join('');

  // 3. 绘制节点
  const nodesSvg = nodes
    .map((u) => {
      const pos = positions[u] || { x: 50, y: 50 };
      const isCurrent = currentNode === u;
      const inPath = currentPath.includes(u);
      const isTarget = u === nodes.length - 1;
      const isSource = u === 0;

      let fill = '#1e293b';
      let stroke = '#64748b';
      let textColor = '#cbd5e1';
      let ring = '';

      if (action === 'target-reached' && inPath) {
        fill = '#064e3b';
        stroke = '#10b981';
        textColor = '#d1fae5';
      } else if (isCurrent) {
        fill = '#0369a1';
        stroke = '#38bdf8';
        textColor = '#f0f9ff';
        ring = `<circle cx="${pos.x}" cy="${pos.y}" r="24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 2" opacity="0.85" />`;
      } else if (inPath) {
        fill = '#78350f';
        stroke = '#f59e0b';
        textColor = '#fef3c7';
      }

      const roleBadge = isSource
        ? `<text x="${pos.x}" y="${pos.y - 22}" text-anchor="middle" font-size="10" font-weight="700" fill="#34d399">源点 (0)</text>`
        : isTarget
        ? `<text x="${pos.x}" y="${pos.y - 22}" text-anchor="middle" font-size="10" font-weight="700" fill="#f43f5e">目标 (${isTarget ? u : ''})</text>`
        : '';

      return `
        <g class="graph-node" data-node="${u}">
          ${ring}
          <circle cx="${pos.x}" cy="${pos.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
          <text x="${pos.x}" y="${pos.y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="${textColor}" font-family="JetBrains Mono, monospace">${u}</text>
          ${roleBadge}
        </g>
      `;
    })
    .join('');

  // 4. 状态标签
  let statusBadgeText = 'DFS 回溯遍历中';
  let statusBadgeColor = '#38bdf8';
  if (action === 'target-reached') {
    statusBadgeText = `命中终点！找到第 ${allPaths.length} 条路径`;
    statusBadgeColor = '#10b981';
  } else if (action === 'backtrack') {
    statusBadgeText = '回溯弹出，恢复现场';
    statusBadgeColor = '#f59e0b';
  } else if (action === 'done') {
    statusBadgeText = `搜索完成，共 ${allPaths.length} 条全路径`;
    statusBadgeColor = '#a855f7';
  }

  const badgeSvg = `
    <g transform="translate(14, 16)">
      <rect x="0" y="0" width="180" height="24" rx="4" fill="#0f172a" stroke="${statusBadgeColor}" stroke-width="1.5" opacity="0.9" />
      <circle cx="12" cy="12" r="4" fill="${statusBadgeColor}" />
      <text x="24" y="16" font-size="11" font-weight="700" fill="#e2e8f0" font-family="system-ui, sans-serif">${statusBadgeText}</text>
    </g>
  `;

  // 5. 纯 SVG 注入 Card 1（严禁包装外层 div）
  container.innerHTML = `
    <svg viewBox="0 0 460 250" style="width:100%; height:100%; max-height:240px; display:block; background:#0b1120;">
      <defs>
        <pattern id="rp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#1e293b" opacity="0.6"/>
        </pattern>
        <marker id="arrow-rp-gray" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#64748b" />
        </marker>
        <marker id="arrow-rp-blue" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#38bdf8" />
        </marker>
        <marker id="arrow-rp-green" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#10b981" />
        </marker>
      </defs>
      <rect width="100%" height="100%" fill="url(#rp-grid)" />
      ${edgesSvg}
      ${nodesSvg}
      ${badgeSvg}
    </svg>
  `.trim();
}

/** Card 2 自定义指标面板：已收集路径芯片展示 */
export function renderReachablePathsCustomMetrics(container: HTMLElement, step: ReachablePathsStep): void {
  const { allPaths, currentPath } = step;

  const pathChips =
    allPaths.length > 0
      ? allPaths
          .map(
            (p, idx) =>
              `<span style="padding: 4px 10px; border-radius: 999px; background: #064e3b; border: 1px solid #059669; color: #6ee7b7; font-family: monospace; font-size: 11px; font-weight: 700;">#${idx + 1} [${p.join('➔')}]</span>`
          )
          .join('')
      : `<span style="padding: 4px 10px; border-radius: 999px; background: #1e293b; border: 1px solid #334155; color: #94a3b8; font-family: monospace; font-size: 11px; font-weight: 700;">暂无完成路径</span>`;

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:8px; padding:8px; background:#0f172a; border-radius:6px; border:1px solid #1e293b;">
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px;">
        <span style="color:#94a3b8; font-weight:600;">当前搜索栈:</span>
        <span style="color:#38bdf8; font-family:monospace; font-weight:700;">[${currentPath.join(' ➔ ')}]</span>
      </div>
      <div style="font-size:11px; color:#94a3b8; font-weight:600;">已收集路径 (${allPaths.length}):</div>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">${pathChips}</div>
    </div>
  `.trim();
}

export class ReachablePathsCanvasAdapter {
  mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  updateStep(container: HTMLElement, step: unknown): void {
    const rpStep = step as ReachablePathsStep;
    if (!rpStep) return;
    renderReachablePathsCanvas(container, rpStep);
  }

  dispose(container: HTMLElement): void {
    container.innerHTML = '';
  }
}
