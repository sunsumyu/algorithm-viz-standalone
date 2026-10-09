/**
 * 匈牙利二分图最大匹配 (Hungarian Maximum Matching) 领域视觉适配器
 * 核心：二分图左右部垂直拓扑、匹配边翡翠高亮、意向边虚线脉冲、腾位冲突节点警示
 * 规范：Matt Pocock 深模块架构，Card 1 零 HTML 表格污染，纯净矢量 SVG 画布
 */

import { HungarianStep } from '../../../algorithms/categories/graph/hungarian-matching-step-compiler';

export class HungarianMatchingCanvasAdapter {
  public static render(container: HTMLElement, step: HungarianStep): void {
    const is4 = step.matchArray.length === 4;
    const n = is4 ? 4 : 3;

    const leftX = 90;
    const rightX = 270;
    const startY = is4 ? 35 : 45;
    const gapY = is4 ? 42 : 55;

    const leftCoords: Record<number, { x: number; y: number }> = {};
    const rightCoords: Record<number, { x: number; y: number }> = {};

    for (let i = 0; i < n; i++) {
      leftCoords[i] = { x: leftX, y: startY + i * gapY };
      rightCoords[i] = { x: rightX, y: startY + i * gapY };
    }

    const graph: number[][] = is4
      ? [
          [0, 1],
          [0, 2],
          [1, 3],
          [2, 3],
        ]
      : [
          [0, 1],
          [0, 2],
          [1, 2],
        ];

    const isMatched = (u: number, v: number) => {
      return step.matchedEdges.some(([lu, rv]) => lu === `L${u}` && rv === `R${v}`);
    };

    const isActive = (u: number, v: number) => {
      return step.activeEdge && step.activeEdge[0] === `L${u}` && step.activeEdge[1] === `R${v}`;
    };

    const svgEdges: string[] = [];
    for (let u = 0; u < n; u++) {
      for (const v of graph[u]) {
        const p1 = leftCoords[u];
        const p2 = rightCoords[v];
        if (!p1 || !p2) continue;

        const matched = isMatched(u, v);
        const act = isActive(u, v);

        const color = act ? '#f59e0b' : matched ? '#10b981' : '#334155';
        const width = act ? 3.5 : matched ? 3 : 1.3;
        const dash = act ? '5,4' : 'none';

        svgEdges.push(`
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                stroke="${color}" stroke-width="${width}" stroke-dasharray="${dash}"
                class="graph-edge ${matched ? 'matched-edge' : ''}" />
        `);
      }
    }

    const svgNodes: string[] = [];
    for (let i = 0; i < n; i++) {
      const pl = leftCoords[i];
      const isCurL = step.curLeft === `L${i}`;
      const isConflict = step.conflictTarget === `L${i}`;
      const bgL = isCurL ? '#b45309' : isConflict ? '#831843' : '#1e293b';
      const borderL = isCurL ? '#facc15' : isConflict ? '#f43f5e' : '#38bdf8';

      svgNodes.push(`
        <g class="bipartite-left-node" data-node="L${i}">
          <circle cx="${pl.x}" cy="${pl.y}" r="15" fill="${bgL}" stroke="${borderL}" stroke-width="${isCurL || isConflict ? 2.5 : 1.5}" />
          <text x="${pl.x}" y="${pl.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">L${i}</text>
        </g>
      `);

      const pr = rightCoords[i];
      const matchU = step.matchArray[i];
      const isVis = step.visitedArray[i];
      const bgR = matchU !== -1 ? '#065f46' : isVis ? '#1e3a8a' : '#1e293b';
      const borderR = matchU !== -1 ? '#10b981' : isVis ? '#38bdf8' : '#475569';

      svgNodes.push(`
        <g class="bipartite-right-node ${matchU !== -1 ? 'matched-node' : ''}" data-node="R${i}">
          <circle cx="${pr.x}" cy="${pr.y}" r="15" fill="${bgR}" stroke="${borderR}" stroke-width="${matchU !== -1 ? 2.5 : 1.5}" />
          <text x="${pr.x}" y="${pr.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">R${i}</text>
          <text x="${pr.x + 22}" y="${pr.y + 4}" fill="${matchU !== -1 ? '#10b981' : '#64748b'}" font-size="9" font-family="monospace" font-weight="700" text-anchor="start">
            ${matchU !== -1 ? `💖 L${matchU}` : '未配'}
          </text>
        </g>
      `);
    }

    container.innerHTML = `
      <div class="w-full h-full flex items-center justify-center bg-slate-950 p-2 select-none overflow-hidden">
        <svg class="w-full h-full max-h-[220px]" viewBox="0 0 380 200">
          <text x="90" y="18" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">左部集合 (L)</text>
          <text x="270" y="18" fill="#10b981" font-size="10" font-weight="700" text-anchor="middle">右部集合 (R)</text>
          ${svgEdges.join('')}
          ${svgNodes.join('')}
        </svg>
      </div>
    `;
  }
}
