/**
 * 最小费用最大流 (Minimum Cost Maximum Flow - MCMF) 领域视觉适配器
 * 核心：网络流残量网络拓扑排布、弧容量/实时流量与单位费用标注、当前最低费用增广路径高亮、饱和弧警示
 * 规范：Matt Pocock 深模块架构，Card 1 零 HTML 表格污染，纯净矢量 SVG 画布
 */

import { MCMFStep } from '../../../algorithms/categories/graph/min-cost-max-flow-step-compiler';

export class MinCostMaxFlowCanvasAdapter {
  public static render(container: HTMLElement, step: MCMFStep): void {
    const coords: Record<string, { x: number; y: number }> = {
      S: { x: 50, y: 100 },
      A: { x: 170, y: 50 },
      B: { x: 170, y: 150 },
      T: { x: 290, y: 100 },
    };

    const isPathEdge = (u: string, v: string) => {
      if (!step.activePath || step.activePath.length < 2) return false;
      for (let i = 0; i < step.activePath.length - 1; i++) {
        if (step.activePath[i] === u && step.activePath[i + 1] === v) return true;
      }
      return false;
    };

    const svgEdges = step.curPath
      .map(({ u, v, cap, flow, cost }) => {
        const p1 = coords[u];
        const p2 = coords[v];
        if (!p1 || !p2) return '';

        const onPath = isPathEdge(u, v);
        const isSaturated = flow === cap && cap > 0;

        const color = onPath ? '#10b981' : isSaturated ? '#ef4444' : '#475569';
        const width = onPath ? 3.2 : isSaturated ? 2.4 : 1.4;

        // 中继弧 A->B 或 S->T 偏移
        const offset = u === 'A' && v === 'B' ? 12 : u === 'S' && v === 'T' ? -12 : 0;
        const midX = (p1.x + p2.x) / 2 + offset;
        const midY = (p1.y + p2.y) / 2;

        return `
          <g class="mcmf-edge" data-from="${u}" data-to="${v}">
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                  stroke="${color}" stroke-width="${width}" />
            <rect x="${midX - 25}" y="${midY - 8}" width="50" height="16" rx="4"
                  fill="#0f172a" stroke="${color}" stroke-width="1.2" />
            <text x="${midX}" y="${midY + 3.5}" fill="${color}"
                  font-size="8.5" font-weight="800" font-family="monospace" text-anchor="middle">
              ${flow}/${cap} c:${cost}
            </text>
          </g>
        `;
      })
      .join('');

    const nodes = ['S', 'A', 'B', 'T'];
    const svgNodes = nodes
      .map((id) => {
        const p = coords[id];
        if (!p) return '';

        const isSrc = id === 'S';
        const isSink = id === 'T';
        const onPath = step.activePath?.includes(id);

        let bg = isSrc || isSink ? '#581c87' : '#0f172a';
        let border = isSrc || isSink ? '#a855f7' : '#334155';
        if (onPath) {
          border = '#10b981';
          if (!isSrc && !isSink) bg = '#064e3b';
        }

        const dVal = step.distMap?.[id];
        const dStr = dVal === Infinity || dVal === undefined ? '∞' : `${dVal}`;
        const label = isSrc ? 'S(源)' : isSink ? 'T(汇)' : id;

        return `
          <g class="mcmf-node ${isSrc ? 'src-node' : ''} ${isSink ? 'sink-node' : ''}" data-node="${id}">
            <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="${onPath ? 2.8 : 1.8}" />
            <text x="${p.x}" y="${p.y - 1}" fill="#ffffff" font-size="9.5" font-weight="800" font-family="monospace" text-anchor="middle">${label}</text>
            <text x="${p.x}" y="${p.y + 11}" fill="${isSrc || isSink ? '#d8b4fe' : '#38bdf8'}" font-size="8" font-weight="700" font-family="monospace" text-anchor="middle">d:${dStr}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #020617; padding: 8px; user-select: none; overflow: hidden; box-sizing: border-box;">
        <svg style="width: 100%; height: 100%; max-height: 220px;" viewBox="0 0 340 200">
          <text x="50" y="24" fill="#a855f7" font-size="9.5" font-weight="700" text-anchor="middle">网络源点 (S)</text>
          <text x="170" y="24" fill="#38bdf8" font-size="9.5" font-weight="700" text-anchor="middle">中继节点 (A, B)</text>
          <text x="290" y="24" fill="#a855f7" font-size="9.5" font-weight="700" text-anchor="middle">网络汇点 (T)</text>
          ${svgEdges}
          ${svgNodes}
        </svg>
      </div>
    `;
  }
}
