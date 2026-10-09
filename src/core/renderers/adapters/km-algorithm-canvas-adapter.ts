/**
 * 二分图最大权完美匹配与 KM 算法 (Kuhn-Munkres Algorithm) 画布渲染适配器
 * 纯 SVG 拓扑沙盘呈现：左右部节点、顶标数值 (lx / ly)、权值连线、相等子图边与最佳匹配边高亮
 * 严格遵循架构规范：Card 1 纯 SVG 呈现，杜绝标题嵌入与指标镜像套娃
 */

import type { KMStep } from '../../../algorithms/categories/graph/km-algorithm-step-compiler';

export function renderKMAlgorithmCanvas(container: HTMLElement, step: KMStep): void {
  const isSimple = Object.keys(step.lx).length === 2;
  const n = isSimple ? 2 : 3;

  const leftX = 70;
  const rightX = 240;
  const startY = isSimple ? 55 : 40;
  const gapY = isSimple ? 70 : 50;

  const leftCoords: Record<string, { x: number; y: number }> = {};
  const rightCoords: Record<string, { x: number; y: number }> = {};

  for (let i = 1; i <= n; i++) {
    leftCoords[`L${i}`] = { x: leftX, y: startY + (i - 1) * gapY };
    rightCoords[`R${i}`] = { x: rightX, y: startY + (i - 1) * gapY };
  }

  const isMatched = (u: string, v: string) => {
    return step.matchedEdges.some(([mu, mv]) => mu === u && mv === v);
  };

  const isActive = (u: string, v: string) => {
    return step.activeEdge && step.activeEdge[0] === u && step.activeEdge[1] === v;
  };

  const svgEdges: string[] = [];
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= n; j++) {
      const u = `L${i}`;
      const v = `R${j}`;
      const p1 = leftCoords[u];
      const p2 = rightCoords[v];
      if (!p1 || !p2) continue;

      const matched = isMatched(u, v);
      const active = isActive(u, v);

      const color = matched ? '#10b981' : active ? '#f59e0b' : '#334155';
      const width = matched ? 3 : active ? 2 : 1;
      const dash = matched || active ? '' : 'stroke-dasharray="3,3"';

      svgEdges.push(`
        <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${dash} />
      `);
    }
  }

  const svgNodes: string[] = [];
  for (let i = 1; i <= n; i++) {
    const u = `L${i}`;
    const v = `R${i}`;
    const lp = leftCoords[u];
    const rp = rightCoords[v];

    // 左节点
    const isCurL = step.curLeft === u;
    svgNodes.push(`
      <g>
        <circle cx="${lp.x}" cy="${lp.y}" r="16" fill="${isCurL ? '#0284c7' : '#0f172a'}" stroke="${isCurL ? '#38bdf8' : '#0284c7'}" stroke-width="2" />
        <text x="${lp.x}" y="${lp.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" text-anchor="middle">${u}</text>
        <text x="${lp.x - 24}" y="${lp.y + 4}" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="end">lx:${step.lx[u] ?? 0}</text>
      </g>
    `);

    // 右节点
    svgNodes.push(`
      <g>
        <circle cx="${rp.x}" cy="${rp.y}" r="16" fill="#0f172a" stroke="#db2777" stroke-width="2" />
        <text x="${rp.x}" y="${rp.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" text-anchor="middle">R${i}</text>
        <text x="${rp.x + 24}" y="${rp.y + 4}" fill="#f472b6" font-size="9" font-weight="700" text-anchor="start">ly:${step.ly[`R${i}`] ?? 0}</text>
      </g>
    `);
  }

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
      <svg style="width: 100%; height: 205px;" viewBox="0 0 310 190">
        ${svgEdges.join('')}
        ${svgNodes.join('')}
      </svg>
      <div style="font-size: 10.5px; color: #94a3b8; text-align: center; margin-top: 4px;">
        绿色实线为最佳匹配边 | 黄色为当前探查边 | 节点两侧显示当前可行顶标 (lx / ly)
      </div>
    </div>
  `;
}
