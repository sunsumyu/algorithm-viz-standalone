/**
 * DAG 最小路径覆盖 (DAG Minimum Path Cover) 画布渲染适配器
 * 纯 SVG 呈现拆点二分图拓扑：左侧出点 u_out、右侧入点 v_in、匹配边高亮与路径合并关系
 * 严格遵循架构规范：Card 1 纯 SVG 呈现，杜绝 table 与指标套娃污染
 */

import type { PathCoverStep } from '../../../algorithms/categories/graph/min-path-cover-step-compiler';

export function renderMinPathCoverCanvas(container: HTMLElement, step: PathCoverStep): void {
  // 节点总数
  const n = step.currentMatchingCount + step.minPathsCount;
  const leftX = 80;
  const rightX = 230;
  const startY = 35;
  const gapY = Math.min(45, 150 / Math.max(n - 1, 1));

  // 匹配边渲染
  const svgLines = step.splitMatches
    .map(([u, v]) => {
      const y1 = startY + (u - 1) * gapY;
      const y2 = startY + (v - 1) * gapY;
      return `<line x1="${leftX}" y1="${y1}" x2="${rightX}" y2="${y2}" stroke="#10b981" stroke-width="3" />`;
    })
    .join('');

  // 节点集合
  const leftNodes = Array.from({ length: n }, (_, i) => i + 1).map((u) => {
    const y = startY + (u - 1) * gapY;
    const isCur = step.curU === u;
    return `
      <g>
        <circle cx="${leftX}" cy="${y}" r="15" fill="${isCur ? '#0284c7' : '#0f172a'}" stroke="${isCur ? '#38bdf8' : '#0284c7'}" stroke-width="2" />
        <text x="${leftX}" y="${y + 4}" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">${u}_out</text>
      </g>
    `;
  }).join('');

  const rightNodes = Array.from({ length: n }, (_, i) => i + 1).map((v) => {
    const y = startY + (v - 1) * gapY;
    return `
      <g>
        <circle cx="${rightX}" cy="${y}" r="15" fill="#0f172a" stroke="#f59e0b" stroke-width="2" />
        <text x="${rightX}" y="${y + 4}" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">${v}_in</text>
      </g>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
      <svg style="width: 100%; height: 205px;" viewBox="0 0 310 190">
        ${svgLines}
        ${leftNodes}
        ${rightNodes}
      </svg>
      <div style="font-size: 10.5px; color: #94a3b8; text-align: center; margin-top: 4px;">
        左侧为出点 u_out (蓝色) | 右侧为入点 v_in (黄色) | 绿色实线为匹配边，每匹配一条边合并一次路径链
      </div>
    </div>
  `;
}
