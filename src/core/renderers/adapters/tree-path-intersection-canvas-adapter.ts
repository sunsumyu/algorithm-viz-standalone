/**
 * 树上路径相交判定与 LCA 包含定理 (Tree Path Intersection Canvas Adapter)
 * 遵循 Matt Pocock 深模块哲学与设计规范
 * 职责：渲染树形拓扑、路径覆盖染色、LCA 祖先标定以及充要定理监视卡片
 */

import type { TreeIntersectStep } from '../../../algorithms/categories/graph/tree-path-intersection-step-compiler';

export function renderTreePathIntersectionCanvas(container: HTMLElement, step: TreeIntersectStep): void {
  const nodeCoords: Record<number, { x: number; y: number }> = {
    1: { x: 160, y: 38 },
    2: { x: 96, y: 100 },
    3: { x: 224, y: 100 },
    4: { x: 64, y: 172 },
    5: { x: 128, y: 172 },
    6: { x: 192, y: 172 },
    7: { x: 256, y: 172 },
  };

  const treeEdges = [
    { u: 1, v: 2 },
    { u: 1, v: 3 },
    { u: 2, v: 4 },
    { u: 2, v: 5 },
    { u: 3, v: 6 },
    { u: 3, v: 7 },
  ];

  // 路径判定逻辑：检测边是否位于 P1 或 P2
  const isEdgeInP1 = (u: number, v: number): boolean => {
    // P1: (4,5) -> 4-2, 2-5
    const [p1u, p1v] = step.path1;
    if (p1u === 4 && p1v === 5) {
      return (u === 2 && (v === 4 || v === 5)) || (v === 2 && (u === 4 || u === 5));
    }
    return false;
  };

  const isEdgeInP2 = (u: number, v: number): boolean => {
    // P2: (4,6) -> 4-2, 2-1, 1-3, 3-6
    // P2: (6,7) -> 6-3, 3-7
    const [p2u, p2v] = step.path2;
    if (p2u === 4 && p2v === 6) {
      if ((u === 2 && v === 4) || (u === 1 && v === 2) || (u === 1 && v === 3) || (u === 3 && v === 6)) return true;
      if ((v === 2 && u === 4) || (v === 1 && u === 2) || (v === 1 && u === 3) || (v === 3 && u === 6)) return true;
    }
    if (p2u === 6 && p2v === 7) {
      if ((u === 3 && (v === 6 || v === 7)) || (v === 3 && (u === 6 || u === 7))) return true;
    }
    return false;
  };

  const svgEdges = treeEdges
    .map((e) => {
      const p1 = nodeCoords[e.u];
      const p2 = nodeCoords[e.v];
      if (!p1 || !p2) return '';
      const inP1 = isEdgeInP1(e.u, e.v);
      const inP2 = isEdgeInP2(e.u, e.v);
      let stroke = 'rgba(100, 116, 139, 0.45)';
      let strokeWidth = '2';
      let strokeDasharray = 'none';

      if (inP1 && inP2) {
        stroke = '#10b981'; // 路径重合段
        strokeWidth = '3.5';
      } else if (inP1) {
        stroke = '#38bdf8'; // P1 (天蓝色)
        strokeWidth = '3';
      } else if (inP2) {
        stroke = '#f59e0b'; // P2 (琥珀色)
        strokeWidth = '3';
        strokeDasharray = '4,3';
      }

      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDasharray}" stroke-linecap="round" />`;
    })
    .join('');

  const nodes = [1, 2, 3, 4, 5, 6, 7];
  const svgNodes = nodes
    .map((u) => {
      const p = nodeCoords[u];
      if (!p) return '';
      const isLCA1 = step.lca1 === u;
      const isLCA2 = step.lca2 === u;
      const isOverlap = step.overlapNodes && step.overlapNodes.includes(u);

      let bg = '#1e293b';
      let stroke = '#64748b';
      let glow = '';

      if (isOverlap) {
        bg = '#10b981';
        stroke = '#34d399';
        glow = `<circle cx="${p.x}" cy="${p.y}" r="18" fill="none" stroke="#10b981" stroke-width="2" opacity="0.4" stroke-dasharray="3,3" />`;
      } else if (isLCA1 && isLCA2) {
        bg = '#10b981';
        stroke = '#6ee7b7';
      } else if (isLCA1) {
        bg = '#0284c7';
        stroke = '#38bdf8';
      } else if (isLCA2) {
        bg = '#d97706';
        stroke = '#facc15';
      }

      return `
        <g>
          ${glow}
          <circle cx="${p.x}" cy="${p.y}" r="14" fill="${bg}" stroke="${stroke}" stroke-width="2" />
          <text x="${p.x}" y="${p.y + 4.5}" fill="#ffffff" font-size="11" font-weight="700" font-family="monospace" text-anchor="middle">${u}</text>
          ${isLCA1 ? `<text x="${p.x}" y="${p.y - 18}" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">LCA1</text>` : ''}
          ${isLCA2 ? `<text x="${p.x}" y="${p.y + 27}" fill="#facc15" font-size="9" font-weight="700" text-anchor="middle">LCA2</text>` : ''}
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 230px; background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 10px; box-sizing: border-box;">
      <svg style="width: 100%; height: 210px; max-width: 420px;" viewBox="0 0 320 220" preserveAspectRatio="xMidYMid meet">
        ${svgEdges}
        ${svgNodes}
      </svg>
      <div style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 4px;">
        充要条件：<span style="color: #38bdf8; font-weight: 600;">LCA(P1)</span> 位于 P2 上 <span style="color: #cbd5e1;">∨</span> <span style="color: #f59e0b; font-weight: 600;">LCA(P2)</span> 位于 P1 上
      </div>
    </div>
  `;

  // 同步更新 Card 2 指标与定制监视器
  const root = container.closest('#algo-tree-path-intersection-view');
  if (root) {
    const l1El = root.querySelector('#metric-lca-p1') || root.querySelector('#lca-p1');
    const l2El = root.querySelector('#metric-lca-p2') || root.querySelector('#lca-p2');
    const resEl = root.querySelector('#metric-intersect-result') || root.querySelector('#intersect-result');
    const ovEl = root.querySelector('#metric-overlap-nodes') || root.querySelector('#overlap-nodes');

    if (l1El) l1El.textContent = step.lca1 ? `Node ${step.lca1}` : '—';
    if (l2El) l2El.textContent = step.lca2 ? `Node ${step.lca2}` : '—';
    if (resEl) {
      const el = resEl as HTMLElement;
      if (step.status === 'done') {
        el.textContent = step.isIntersect ? '✓ 路径相交' : '❌ 路径不相交';
        el.style.color = step.isIntersect ? '#10b981' : '#ef4444';
      } else {
        el.textContent = '判定中...';
        el.style.color = '#38bdf8';
      }
    }
    if (ovEl) {
      ovEl.textContent =
        step.overlapNodes && step.overlapNodes.length > 0
          ? `[${step.overlapNodes.join(', ')}]`
          : step.status === 'done'
            ? '无'
            : '—';
    }

    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; padding: 4px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 6px; padding: 6px 10px;">
            <span style="color: #93c5fd; font-weight: 700;">👑 LCA 包含定理:</span>
            <strong style="font-family: monospace; color: #60a5fa; font-size: 11px;">isOnPath(LCA1, P2) || isOnPath(LCA2, P1)</strong>
          </div>
          <div style="display: flex; gap: 8px;">
            <div style="flex: 1; display: flex; justify-content: space-between; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 4px 8px;">
              <span style="color: #64748b;">P1 路径:</span>
              <span style="color: #38bdf8; font-weight: 600;">(${step.path1.join('➔')})</span>
            </div>
            <div style="flex: 1; display: flex; justify-content: space-between; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 4px 8px;">
              <span style="color: #64748b;">P2 路径:</span>
              <span style="color: #f59e0b; font-weight: 600;">(${step.path2.join('➔')})</span>
            </div>
          </div>
        </div>
      `;
    }
  }
}
