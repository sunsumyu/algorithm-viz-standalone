/**
 * 二分图最小点覆盖与 König 定理 (König's Theorem) 画布渲染适配器
 * 纯 SVG 拓扑沙盘呈现：左部集合、右部集合、匹配边 (实线)、非匹配边 (虚线)、交错路高亮与最小覆盖点集高亮
 * 严格遵循架构规范：Card 1 纯 SVG 呈现，杜绝 table 与指标卡套娃污染
 */

import type { KonigStep } from '../../../algorithms/categories/graph/konig-min-vertex-cover-step-compiler';

export function renderKonigMinVertexCoverCanvas(container: HTMLElement, step: KonigStep): void {
  const isClassic = step.visLArray.length > 4;
  const leftCount = isClassic ? 4 : 3;
  const rightCount = isClassic ? 3 : 2;

  const leftNodes = Array.from({ length: leftCount }, (_, i) => `L${i + 1}`);
  const rightNodes = Array.from({ length: rightCount }, (_, i) => `R${i + 1}`);

  const nodeCoords: Record<string, { x: number; y: number }> = {};
  leftNodes.forEach((id, i) => {
    nodeCoords[id] = { x: 75, y: 35 + i * (170 / Math.max(leftCount - 1, 1)) };
  });
  rightNodes.forEach((id, i) => {
    nodeCoords[id] = { x: 235, y: 45 + i * (150 / Math.max(rightCount - 1, 1)) };
  });

  const allEdges = isClassic
    ? [
        ['L1', 'R1'],
        ['L2', 'R1'],
        ['L2', 'R2'],
        ['L3', 'R2'],
        ['L4', 'R3'],
      ]
    : [
        ['L1', 'R1'],
        ['L2', 'R2'],
        ['L3', 'R1'],
      ];

  const svgEdges = allEdges
    .map(([u, v]) => {
      const p1 = nodeCoords[u];
      const p2 = nodeCoords[v];
      if (!p1 || !p2) return '';
      const isMatched = step.matchedEdges.some(([a, b]) => a === u && b === v);
      const isAct = step.activeEdge && step.activeEdge[0] === u && step.activeEdge[1] === v;
      const color = isAct ? '#f59e0b' : isMatched ? '#10b981' : '#475569';
      const width = isAct ? 3.5 : isMatched ? 2.5 : 1.5;

      return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isMatched ? '' : 'stroke-dasharray="4,2"'} />`;
    })
    .join('');

  const allNodes = [...leftNodes, ...rightNodes];
  const svgNodes = allNodes
    .map((id) => {
      const p = nodeCoords[id];
      if (!p) return '';
      const isLeft = id.startsWith('L');
      const inCover = step.coverSet.includes(id);
      const inVisL = isLeft && step.visitedLeft.includes(id);
      const inVisR = !isLeft && step.visitedRight.includes(id);

      const bg = inCover ? '#991b1b' : isLeft ? '#0284c7' : '#581c87';
      const border = inCover ? '#ef4444' : inVisL || inVisR ? '#f59e0b' : isLeft ? '#38bdf8' : '#a855f7';

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="${inCover ? 3 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${id}</text>
          <text x="${p.x}" y="${p.y + 28}" fill="${inCover ? '#f87171' : '#94a3b8'}" font-size="8" font-weight="700" text-anchor="middle">${inCover ? '🛡️覆盖' : isLeft ? (inVisL ? '交错访问' : '未访问') : inVisR ? '交错访问' : '未访问'}</text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
      <svg style="width: 100%; height: 205px;" viewBox="0 0 310 200">
        ${svgEdges}
        ${svgNodes}
      </svg>
      <div style="font-size: 10.5px; color: #94a3b8; text-align: center; margin-top: 4px;">
        绿色实线为匹配边 | 红色为最小覆盖点：左部未被交错路访问点 (!visL) ∪ 右部已被交错路访问点 (visR)
      </div>
    </div>
  `;
}
