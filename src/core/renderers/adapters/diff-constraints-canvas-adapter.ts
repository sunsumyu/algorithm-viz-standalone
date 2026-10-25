/**
 * 差分约束系统 (System of Difference Constraints) 领域视觉适配器
 * 核心：不等式系统向有向带权图同构转换、超级源点 0 权边发散、SPFA 最短路松弛与负权回路警示
 * 规范：Matt Pocock 深模块架构，Card 1 零 HTML 表格与文字堆叠污染，纯净矢量 SVG 画布
 */

import { DiffConstraintStep } from '../../../algorithms/categories/graph/diff-constraints-step-compiler';

export class DiffConstraintsCanvasAdapter {
  public static render(container: HTMLElement, step: DiffConstraintStep): void {
    const coords: Record<number, { x: number; y: number }> = {
      0: { x: 60, y: 100 },
      1: { x: 165, y: 45 },
      2: { x: 285, y: 100 },
      3: { x: 165, y: 155 },
    };

    const isCyclePreset = step.hasNegativeCycle;

    // 边集定义
    const edgeList: Array<{ u: number; v: number; w: number; isSuper?: boolean }> = [
      { u: 0, v: 1, w: 0, isSuper: true },
      { u: 0, v: 2, w: 0, isSuper: true },
      { u: 0, v: 3, w: 0, isSuper: true },
    ];

    if (isCyclePreset) {
      edgeList.push({ u: 2, v: 1, w: -3 });
      edgeList.push({ u: 1, v: 2, w: 2 });
    } else {
      edgeList.push({ u: 1, v: 2, w: 3 });
      edgeList.push({ u: 1, v: 3, w: 1 });
      edgeList.push({ u: 3, v: 2, w: 1 });
    }

    const svgEdges = edgeList
      .map(({ u, v, w, isSuper }) => {
        const p1 = coords[u];
        const p2 = coords[v];
        if (!p1 || !p2) return '';

        const isActive = step.activeEdge && step.activeEdge[0] === u && step.activeEdge[1] === v;
        const isCycleEdge = step.hasNegativeCycle && ((u === 1 && v === 2) || (u === 2 && v === 1));

        const color = isCycleEdge ? '#ef4444' : isActive ? '#f59e0b' : isSuper ? '#475569' : '#0284c7';
        const strokeWidth = isActive || isCycleEdge ? 2.5 : 1.3;
        const dashArray = isSuper ? 'stroke-dasharray="3,3"' : '';

        // 双向边偏移防止重叠
        const offset = u === 2 && v === 1 ? -12 : u === 1 && v === 2 && isCyclePreset ? 12 : 0;
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 + offset;

        return `
          <g class="diff-edge" data-from="${u}" data-to="${v}">
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                  stroke="${color}" stroke-width="${strokeWidth}" ${dashArray} />
            <circle cx="${midX}" cy="${midY}" r="8" fill="#0f172a" stroke="${color}" stroke-width="1.2" />
            <text x="${midX}" y="${midY + 3.5}" fill="${color}" font-size="9" font-weight="800" font-family="monospace" text-anchor="middle">${w}</text>
          </g>
        `;
      })
      .join('');

    const svgNodes = [0, 1, 2, 3]
      .map((id) => {
        const p = coords[id];
        if (!p) return '';

        const isSuper = id === 0;
        const isCur = step.curU === id || step.curV === id;
        const inQueue = step.queue?.includes(id);

        let bg = isSuper ? '#581c87' : '#0f172a';
        let border = isSuper ? '#a855f7' : '#334155';
        if (inQueue) {
          bg = '#1e3a8a';
          border = '#38bdf8';
        }
        if (isCur) {
          border = '#facc15';
        }
        if (step.hasNegativeCycle && (id === 1 || id === 2)) {
          bg = '#7f1d1d';
          border = '#ef4444';
        }

        const label = isSuper ? 'S₀' : `x${id}`;
        const distVal = step.distMap[id];
        const distStr = distVal === 1000000000 || distVal === Infinity ? '∞' : `${distVal}`;

        return `
          <g class="diff-node ${isSuper ? 'super-node' : ''}" data-node="${id}">
            <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="${isCur ? 2.5 : 1.8}" />
            <text x="${p.x}" y="${p.y - 2}" fill="#ffffff" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${label}</text>
            <text x="${p.x}" y="${p.y + 10}" fill="${isSuper ? '#d8b4fe' : '#38bdf8'}" font-size="8" font-weight="700" font-family="monospace" text-anchor="middle">${distStr}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #020617; padding: 8px; user-select: none; overflow: hidden; box-sizing: border-box;">
        <svg style="width: 100%; height: 100%; max-height: 220px; display: block;" viewBox="0 0 350 200">
          <text x="60" y="24" fill="#a855f7" font-size="9.5" font-weight="700" text-anchor="middle">超级源点 (S₀=0)</text>
          <text x="225" y="24" fill="#38bdf8" font-size="9.5" font-weight="700" text-anchor="middle">差分约束变量节点 (x₁ ~ x₃)</text>
          ${svgEdges}
          ${svgNodes}
        </svg>
      </div>
    `;
  }
}
