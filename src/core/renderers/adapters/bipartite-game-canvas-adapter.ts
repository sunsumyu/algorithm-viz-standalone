/**
 * 二分图博弈 (Game on Bipartite Graph) 领域视觉适配器
 * 核心：二分图左右部垂直拓扑排布、基准匹配边实线标红、交错轨脉冲探索、先手必胜点金冠徽标
 * 规范：Matt Pocock 深模块哲学，Card 1 零 HTML 表格污染，纯净矢量 SVG 画布
 */

import { BipartiteGameStep } from '../../../algorithms/categories/graph/bipartite-game-step-compiler';

export class BipartiteGameCanvasAdapter {
  public static render(container: HTMLElement, step: BipartiteGameStep): void {
    const isSixNode = step.matchRightArray.length > 5;
    const nodeCoords: Record<number, { x: number; y: number }> = isSixNode
      ? {
          1: { x: 85, y: 50 },
          2: { x: 85, y: 110 },
          3: { x: 85, y: 170 },
          4: { x: 265, y: 50 },
          5: { x: 265, y: 110 },
          6: { x: 265, y: 170 },
        }
      : {
          1: { x: 85, y: 50 },
          2: { x: 85, y: 110 },
          5: { x: 85, y: 170 },
          3: { x: 265, y: 80 },
          4: { x: 265, y: 140 },
        };

    const allEdges = isSixNode
      ? [[1, 4], [2, 4], [3, 5]]
      : [[1, 3], [2, 3], [2, 4], [5, 4]];

    const svgEdges = allEdges
      .map(([u, v]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';

        const isMatched = step.matchedPairs.some(
          ([a, b]) => (a === u && b === v) || (a === v && b === u)
        );
        const isAct =
          step.activeEdge &&
          ((step.activeEdge[0] === u && step.activeEdge[1] === v) ||
            (step.activeEdge[0] === v && step.activeEdge[1] === u));

        const color = isAct ? '#f59e0b' : isMatched ? '#f43f5e' : '#475569';
        const width = isAct ? 3.5 : isMatched ? 2.8 : 1.4;
        const dash = isMatched ? 'none' : '4,3';

        return `
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                stroke="${color}" stroke-width="${width}" stroke-dasharray="${dash}"
                class="bipartite-edge ${isMatched ? 'matched-edge' : ''}" />
        `;
      })
      .join('');

    const nodes = isSixNode ? [1, 2, 3, 4, 5, 6] : [1, 2, 5, 3, 4];
    const leftSet = isSixNode ? [1, 2, 3] : [1, 2, 5];

    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isLeft = leftSet.includes(u);
        const isWin = step.winningStartNodes.includes(u);
        const isCur = step.curStartNode === u;
        const canUnm = isLeft && step.canBeUnmatchedArray[u];

        const bg = isCur
          ? '#b45309'
          : isWin
            ? '#78350f'
            : canUnm
              ? '#334155'
              : isLeft
                ? '#0369a1'
                : '#581c87';

        const border = isCur
          ? '#facc15'
          : isWin
            ? '#f59e0b'
            : canUnm
              ? '#64748b'
              : isLeft
                ? '#38bdf8'
                : '#c084fc';

        const roleText = isWin
          ? '👑 必胜'
          : isLeft
            ? (canUnm ? '可非配' : '匹配中')
            : (step.matchRightArray[u] ? `💖 L${step.matchRightArray[u]}` : '未配');

        return `
          <g class="game-node" data-node="${u}">
            <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="${isCur || isWin ? 2.8 : 1.6}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 30}" fill="${isWin ? '#facc15' : '#94a3b8'}" font-size="9" font-weight="700" font-family="monospace" text-anchor="middle">${roleText}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #020617; padding: 8px; user-select: none; overflow: hidden; box-sizing: border-box;">
        <svg style="width: 100%; height: 100%; max-height: 220px; display: block;" viewBox="0 0 350 215">
          <text x="85" y="22" fill="#38bdf8" font-size="10.5" font-weight="700" text-anchor="middle">左部博弈集合 (L)</text>
          <text x="265" y="22" fill="#c084fc" font-size="10.5" font-weight="700" text-anchor="middle">右部博弈集合 (R)</text>
          ${svgEdges}
          ${svgNodes}
        </svg>
      </div>
    `;
  }
}
