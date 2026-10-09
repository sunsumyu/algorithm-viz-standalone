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
      <div class="w-full h-full flex flex-col justify-between items-stretch bg-slate-950/80 rounded-lg p-2.5 box-border select-none">
        <div class="flex justify-between items-center pb-1.5 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-300">🌊 残量网络拓扑 (流/容量)</span>
            <div class="flex bg-slate-900 border border-slate-700 rounded p-0.5 gap-0.5">
              <button id="btn-dinic-2d" class="text-[10px] font-bold px-1.5 py-0.5 rounded transition ${currentMode === '2d' ? 'bg-blue-600 text-white' : 'text-slate-400'}">🌐 2D</button>
              <button id="btn-dinic-3d" class="text-[10px] font-bold px-1.5 py-0.5 rounded transition ${currentMode === '3d' ? 'bg-blue-600 text-white' : 'text-slate-400'}">🪐 3D 沙盘</button>
            </div>
          </div>
          <span class="text-[11px] text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            全网最大流: <b class="text-emerald-400">${step.curMaxFlow}</b>
          </span>
        </div>

        <div id="dinic-view-mount" class="w-full min-h-[175px] h-[175px] bg-slate-950 rounded-md flex justify-center items-center border border-slate-800 relative overflow-hidden my-1">
          ${
            currentMode === '2d'
              ? `
            <svg class="w-full h-full" viewBox="0 0 310 160" preserveAspectRatio="xMidYMid meet">
              <defs>
                <marker id="dinic-arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
                </marker>
              </defs>
              ${svgEdges}
              ${svgNodes}
            </svg>
          `
              : `<div id="dinic-3d-canvas-container" class="w-full h-full"></div>
                 <div class="absolute bottom-1 right-2 text-[9px] text-slate-400 pointer-events-none bg-slate-900/80 px-1.5 py-0.5 rounded">🖱️ 拖拽旋转 / 滚轮缩放</div>`
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
