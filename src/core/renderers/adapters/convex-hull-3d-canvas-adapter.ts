/**
 * 三维凸包增量法 (3D Convex Hull Canvas Adapter - 洛谷 P4724)
 * 遵循 Matt Pocock 深模块哲学与设计规范
 * 职责：渲染三维多面体投影、三角面可见性染色、地平线缝合与欧拉示性数监视卡片
 */

import type { Hull3DStep } from '../../../algorithms/categories/graph/convex-hull-3d-step-compiler';

export function renderConvexHull3DCanvas(container: HTMLElement, step: Hull3DStep): void {
  // 3D 投影像素点坐标
  const pts2D: Record<number, { x: number; y: number }> = {
    0: { x: 100, y: 140 },
    1: { x: 210, y: 140 },
    2: { x: 155, y: 55 },
    3: { x: 155, y: 105 },
    4: { x: 235, y: 80 },
  };

  const svgFaces = step.faces
    .map((f) => {
      const pA = pts2D[f.a];
      const pB = pts2D[f.b];
      const pC = pts2D[f.c];
      if (!pA || !pB || !pC) return '';

      let fill = 'rgba(56, 189, 248, 0.15)';
      let stroke = 'rgba(56, 189, 248, 0.7)';

      if (f.visible) {
        fill = 'rgba(239, 68, 68, 0.35)';
        stroke = '#ef4444';
      } else if (f.isNew) {
        fill = 'rgba(16, 185, 129, 0.35)';
        stroke = '#10b981';
      } else if (f.isTesting) {
        fill = 'rgba(250, 204, 21, 0.25)';
        stroke = '#facc15';
      }

      return `
        <polygon points="${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />
      `;
    })
    .join('');

  const svgHorizons = step.horizonEdges
    .map(([u, v]) => {
      const p1 = pts2D[u];
      const p2 = pts2D[v];
      if (!p1 || !p2) return '';
      return `
        <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#facc15" stroke-width="3" stroke-linecap="round" />
      `;
    })
    .join('');

  const nodes = [0, 1, 2, 3, 4];
  const svgNodes = nodes
    .map((u) => {
      if (u === 4 && step.status === 'base') return '';
      const p = pts2D[u];
      if (!p) return '';
      const isCur = step.activePointIdx === u;
      const bg = isCur ? '#facc15' : '#38bdf8';

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="${isCur ? 6 : 4}" fill="${bg}" stroke="#ffffff" stroke-width="1.5" />
          <text x="${p.x + 7}" y="${p.y - 4}" fill="#ffffff" font-size="10" font-weight="700" font-family="monospace">${u === 4 ? 'P4(新)' : `P${u}`}</text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 8px; box-sizing: border-box;">
      <svg style="width: 100%; height: 210px; max-width: 400px;" viewBox="0 0 310 200" preserveAspectRatio="xMidYMid meet">
        ${svgFaces}
        ${svgHorizons}
        ${svgNodes}
      </svg>
      <div style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 4px;">
        <span style="color: #ef4444; font-weight: 600;">🔴 可见面</span> (有向体积 > 0) · <span style="color: #facc15; font-weight: 600;">🟡 地平线</span> 回路 · <span style="color: #10b981; font-weight: 600;">🟢 新缝合面</span>
      </div>
    </div>
  `;

  // 同步更新 Card 2 监视器与顶部指标
  const root = container.closest('#algo-convex-hull-3d-view');
  if (root) {
    const vEl = root.querySelector('#metric-vertices') || root.querySelector('#vertices');
    const fEl = root.querySelector('#metric-faces') || root.querySelector('#faces');
    const eulerEl = root.querySelector('#metric-euler') || root.querySelector('#euler');

    if (vEl) vEl.textContent = `${step.numVertices}`;
    if (fEl) fEl.textContent = `${step.numFaces}`;
    if (eulerEl) eulerEl.textContent = step.numVertices > 0 ? `${step.numVertices} - ${step.numEdges} + ${step.numFaces} = 2` : '—';

    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; padding: 4px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 6px; padding: 6px 10px;">
            <span style="color: #93c5fd; font-weight: 700;">👑 有向体积判据:</span>
            <strong style="font-family: monospace; color: #60a5fa; font-size: 11px;">Volume(F, P) = (AB × AC) · AP > 0</strong>
          </div>
          <div style="display: flex; gap: 8px;">
            <div style="flex: 1; display: flex; justify-content: space-between; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 4px 8px;">
              <span style="color: #64748b;">顶点数 V:</span>
              <span style="color: #38bdf8; font-weight: 600;">${step.numVertices}</span>
            </div>
            <div style="flex: 1; display: flex; justify-content: space-between; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 4px 8px;">
              <span style="color: #64748b;">三角面 F:</span>
              <span style="color: #10b981; font-weight: 600;">${step.numFaces}</span>
            </div>
            <div style="flex: 1; display: flex; justify-content: space-between; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 4px 8px;">
              <span style="color: #64748b;">棱边数 E:</span>
              <span style="color: #f59e0b; font-weight: 600;">${step.numEdges}</span>
            </div>
          </div>
        </div>
      `;
    }
  }
}
