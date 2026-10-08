/**
 * Floyd-Warshall 全源最短路径矩阵画布渲染适配器 (FloydCanvasAdapter)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 统一管理 N×N 距离状态矩阵、中转点 k 交叉线与 (i,j) 考察单元格渲染
 */

import {
  type FloydStep,
  FLOYD_NODES,
  FLOYD_EDGES,
  INF,
} from '../../../algorithms/categories/graph/floyd-step-compiler';
import { visualState } from '../visual-state-tokens';

export { FLOYD_NODES, FLOYD_EDGES, INF };

/**
 * 渲染 Floyd 主视觉：全源距离矩阵（k 行列高亮 + (i,j) 考察格追踪）
 */
export function renderFloydCanvas(container: HTMLElement, step: FloydStep): void {
  const { matrix, k, i: curI, j: curJ, action } = step;
  const n = FLOYD_NODES.length;

  const idleStyle = visualState('idle');
  const comparingStyle = visualState('comparing');
  const discoveredStyle = visualState('discovered');
  const pivotStyle = visualState('pivot');

  let html = `<table style="border-collapse: collapse; width: 100%; max-width: 420px; text-align: center; font-family: monospace; font-size: 12px; background: ${idleStyle.bg}; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.1);"><thead><tr><th style="padding: 6px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0;">from \\ to</th>`;
  for (let c = 0; c < n; c++) {
    const isKCol = k === c;
    html += `<th style="padding: 6px; border: 1px solid #e2e8f0; ${isKCol ? `background: ${pivotStyle.bg}; color: ${pivotStyle.text}; font-weight: 800;` : 'background: #f1f5f9; color: #334155; font-weight: 700;'}">${c}</th>`;
  }
  html += `</tr></thead><tbody>`;

  for (let r = 0; r < n; r++) {
    const isKRow = k === r;
    html += `<tr><th style="padding: 6px; border: 1px solid #e2e8f0; ${isKRow ? `background: ${pivotStyle.bg}; color: ${pivotStyle.text}; font-weight: 800;` : 'background: #f1f5f9; color: #334155; font-weight: 700;'}">${r}</th>`;

    for (let c = 0; c < n; c++) {
      const val = matrix[r][c];
      const isTarget = curI === r && curJ === c;
      const isIK = curI === r && k === c;
      const isKJ = k === r && curJ === c;

      let cellStyle = 'padding: 8px; border: 1px solid #e2e8f0; ';
      if (isTarget && action === 'update') {
        cellStyle += `background: ${discoveredStyle.bg}; color: ${discoveredStyle.text}; font-weight: 800; `;
      } else if (isTarget) {
        cellStyle += `background: ${comparingStyle.bg}; color: ${comparingStyle.text}; font-weight: 700; `;
      } else if (isIK || isKJ) {
        cellStyle += `background: #fffbeb; color: #78350f; font-weight: 600; `;
      } else if (r === c) {
        cellStyle += 'background: #f8fafc; color: #94a3b8; font-weight: 600; ';
      } else {
        cellStyle += 'color: #1e293b; ';
      }

      html += `<td style="${cellStyle}">${val >= INF ? '∞' : val}</td>`;
    }
    html += `</tr>`;
  }
  html += `</tbody></table>`;

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 8px; box-sizing: border-box;">
      ${html}
    </div>
  `;
}

/**
 * Floyd 矩阵画布门面类
 */
export class FloydCanvasAdapter {
  static render(container: HTMLElement, step: FloydStep): void {
    renderFloydCanvas(container, step);
  }
}
