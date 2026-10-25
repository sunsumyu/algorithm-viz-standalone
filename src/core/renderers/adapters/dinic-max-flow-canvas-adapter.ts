/**
 * Dinic 最大流与残量网络 (Dinic Max Flow) 领域视觉适配器
 * 核心：2D SVG 矢量残量拓扑网络 + 3D ThreeGraphTopologyAdapter 双模式沙盘呈现
 * 规范：Matt Pocock 深模块架构，Card 1 零 HTML 表格污染，保持纯净视口
 */

import { DinicStep } from '../../../algorithms/categories/graph/dinic-max-flow-step-compiler';
import { ThreeGraphTopologyAdapter } from '../three-graph-topology-adapter';

export class DinicMaxFlowCanvasAdapter {
  public static render(container: HTMLElement, step: DinicStep, rerenderCallback?: (step: DinicStep) => void): void {
    const nodeCoords: Record<string, { x: number; y: number }> = {
      S: { x: 50, y: 85 },
      A: { x: 155, y: 35 },
      B: { x: 155, y: 135 },
      T: { x: 260, y: 85 },
    };

    const isPathEdge = (u: string, v: string) => {
      if (!step.activePath || step.activePath.length < 2) return false;
      for (let i = 0; i < step.activePath.length - 1; i++) {
        if (step.activePath[i] === u && step.activePath[i + 1] === v) return true;
      }
      return false;
    };

    const svgEdges = step.flowEdges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';

        const onPath = isPathEdge(e.u, e.v);
        const isSaturated = e.flow === e.cap && e.cap > 0;
        const isFlowing = e.flow > 0 && e.flow < e.cap;

        const color = onPath ? '#f59e0b' : isSaturated ? '#ef4444' : isFlowing ? '#38bdf8' : '#64748b';
        const width = onPath ? 3.5 : isSaturated || isFlowing ? 2.5 : 1.5;

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        return `
          <g class="graph-edge">
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" marker-end="url(#dinic-arrow)" />
            <rect x="${mx - 14}" y="${my - 7}" width="28" height="12" rx="3" fill="#0f172a" stroke="#334155" />
            <text x="${mx}" y="${my + 2}" fill="${isSaturated ? '#f87171' : isFlowing ? '#38bdf8' : '#94a3b8'}" font-size="7.5" font-weight="700" text-anchor="middle">
              ${e.flow}/${e.cap}
            </text>
          </g>
        `;
      })
      .join('');

    const nodes = ['S', 'A', 'B', 'T'];
    const svgNodes = nodes
      .map((k) => {
        const p = nodeCoords[k];
        if (!p) return '';

        const lvl = step.levels[k];
        const isOnPath = step.activePath && step.activePath.includes(k);
        const bg = isOnPath ? '#b45309' : lvl > 0 ? '#1e3a8a' : '#1e293b';
        const border = isOnPath ? '#facc15' : lvl > 0 ? '#38bdf8' : '#475569';

        return `
          <g class="graph-node">
            <circle cx="${p.x}" cy="${p.y}" r="16" fill="${bg}" stroke="${border}" stroke-width="${isOnPath ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${k}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="${lvl > 0 ? '#38bdf8' : '#64748b'}" font-size="8" font-weight="700" text-anchor="middle">L:${lvl}</text>
          </g>
        `;
      })
      .join('');

    const currentMode = (container as any)._dinicMode || '2d';

    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; align-items: stretch; background: rgba(2, 6, 23, 0.85); border-radius: 8px; padding: 10px; box-sizing: border-box; user-select: none;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 6px; border-bottom: 1px solid #1e293b;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 12px; font-weight: 700; color: #cbd5e1;">🌊 残量网络拓扑 (流/容量)</span>
            <div style="display: flex; background: #0f172a; border: 1px solid #334155; border-radius: 4px; padding: 2px; gap: 2px;">
              <button id="btn-dinic-2d" style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; border: none; cursor: pointer; transition: all 0.2s; ${currentMode === '2d' ? 'background: #2563eb; color: #ffffff;' : 'background: transparent; color: #94a3b8;'}">🌐 2D</button>
              <button id="btn-dinic-3d" style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; border: none; cursor: pointer; transition: all 0.2s; ${currentMode === '3d' ? 'background: #2563eb; color: #ffffff;' : 'background: transparent; color: #94a3b8;'}">🪐 3D 沙盘</button>
            </div>
          </div>
          <span style="font-size: 11px; color: #cbd5e1; background: #0f172a; padding: 2px 8px; border-radius: 4px; border: 1px solid #1e293b;">
            全网最大流: <b style="color: #34d399;">${step.curMaxFlow}</b>
          </span>
        </div>

        <div id="dinic-view-mount" style="width: 100%; min-height: 175px; height: 175px; background: #020617; border-radius: 6px; display: flex; justify-content: center; align-items: center; border: 1px solid #1e293b; position: relative; overflow: hidden; margin: 4px 0;">
          ${
            currentMode === '2d'
              ? `
            <svg style="width: 100%; height: 100%; display: block;" viewBox="0 0 310 160" preserveAspectRatio="xMidYMid meet">
              <defs>
                <marker id="dinic-arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
                </marker>
              </defs>
              ${svgEdges}
              ${svgNodes}
            </svg>
          `
              : `<div id="dinic-3d-canvas-container" style="width: 100%; height: 100%;"></div>
                 <div style="position: absolute; bottom: 4px; right: 8px; font-size: 9px; color: #94a3b8; pointer-events: none; background: rgba(15, 23, 42, 0.85); padding: 2px 6px; border-radius: 4px;">🖱️ 拖拽旋转 / 滚轮缩放</div>`
          }
        </div>
      </div>
    `;

    // 绑定 2D / 3D 视图切换事件
    const btn2d = container.querySelector('#btn-dinic-2d') as HTMLButtonElement | null;
    const btn3d = container.querySelector('#btn-dinic-3d') as HTMLButtonElement | null;
    if (btn2d && btn3d) {
      btn2d.onclick = () => {
        (container as any)._dinicMode = '2d';
        if ((container as any)._dinic3dAdapter) {
          (container as any)._dinic3dAdapter.destroy();
          (container as any)._dinic3dAdapter = null;
        }
        rerenderCallback?.(step);
      };
      btn3d.onclick = () => {
        (container as any)._dinicMode = '3d';
        rerenderCallback?.(step);
      };
    }

    // 3D 空间图论沙盘挂载与渲染
    if (currentMode === '3d') {
      const mountEl = container.querySelector('#dinic-3d-canvas-container') as HTMLElement | null;
      if (mountEl) {
        let adapter: ThreeGraphTopologyAdapter = (container as any)._dinic3dAdapter;
        if (!adapter) {
          adapter = new ThreeGraphTopologyAdapter();
          adapter.mount(mountEl);
          (container as any)._dinic3dAdapter = adapter;
        }

        adapter.render({
          nodes: [
            { id: 'S', label: '源点 S', level: 0 },
            { id: 'A', label: '节点 A', level: step.levels.A || 1, status: step.levels.A > 0 ? 'visited' : 'default' },
            { id: 'B', label: '节点 B', level: step.levels.B || 1, status: step.levels.B > 0 ? 'visited' : 'default' },
            { id: 'T', label: '汇点 T', level: 2, status: step.levels.T > 0 ? 'current' : 'default' },
          ],
          edges: step.flowEdges.map((e) => ({
            from: e.u,
            to: e.v,
            flow: e.flow,
            cap: e.cap,
            isActivePath: isPathEdge(e.u, e.v),
            isSaturated: e.flow === e.cap && e.cap > 0,
          })),
          activePath: step.activePath,
          layoutMode: 'layered',
        });
      }
    }
  }
}
