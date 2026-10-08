/**
 * Floyd-Warshall 全源最短路径可视化器 — 4-Card 标准现代架构
 * 领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  FLOYD_PROBLEM_HTML,
  FLOYD_ANALYSIS_HTML,
  FLOYD_CODE_LANGUAGES,
} from './floyd-problem-content';
import {
  FloydStep,
  FLOYD_NODES,
  FLOYD_EDGES,
  INF,
  buildFloydSteps,
} from './floyd-step-compiler';

export type { FloydStep };
export { FLOYD_NODES, FLOYD_EDGES, buildFloydSteps };

/** 主视觉：全源距离矩阵（k 行列高亮 + (i,j) 考察格追踪） */
export function renderFloydCanvas(container: HTMLElement, step: FloydStep): void {
  const { matrix, k, i: curI, j: curJ, action } = step;
  const n = FLOYD_NODES.length;

  let html = `<table style="border-collapse: collapse; width: 100%; max-width: 420px; text-align: center; font-family: monospace; font-size: 12px; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.1);"><thead><tr><th style="padding: 6px; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0;">from \\ to</th>`;
  for (let c = 0; c < n; c++) {
    const isKCol = k === c;
    html += `<th style="padding: 6px; border: 1px solid #e2e8f0; ${isKCol ? 'background: #fef3c7; color: #92400e; font-weight: 800;' : 'background: #f1f5f9; color: #334155; font-weight: 700;'}">${c}</th>`;
  }
  html += `</tr></thead><tbody>`;

  for (let r = 0; r < n; r++) {
    const isKRow = k === r;
    html += `<tr><th style="padding: 6px; border: 1px solid #e2e8f0; ${isKRow ? 'background: #fef3c7; color: #92400e; font-weight: 800;' : 'background: #f1f5f9; color: #334155; font-weight: 700;'}">${r}</th>`;

    for (let c = 0; c < n; c++) {
      const val = matrix[r][c];
      const isTarget = curI === r && curJ === c;
      const isIK = curI === r && k === c;
      const isKJ = k === r && curJ === c;

      let cellStyle = 'padding: 8px; border: 1px solid #e2e8f0; ';
      if (isTarget && action === 'update') {
        cellStyle += 'background: #d1fae5; color: #065f46; font-weight: 800; ';
      } else if (isTarget) {
        cellStyle += 'background: #dbeafe; color: #1e40af; font-weight: 700; ';
      } else if (isIK || isKJ) {
        cellStyle += 'background: #fffbeb; color: #78350f; font-weight: 600; ';
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

registerDeclarativeAlgorithm({
  id: 'floyd',
  name: 'Floyd 全源最短路',
  category: 'graph',
  icon: '🌐',
  difficulty: 3,
  levelOrder: 25,
  description: '左程云算法通关课 Class 061：基于动态规划思想的 O(V³) 全源最短路径算法，阶段枚举中转点 k 逐步松弛全局距离矩阵',
  learningGoal: '深刻理解动态规划在多源最短路中的阶段定义、空间压缩与状态转移方程',
  inputs: [],
  presets: [
    { label: '默认图 (4 节点)', values: {} },
  ],
  metrics: [
    { id: 'metric-floyd-k', label: '中转点 k', color: '#ea580c' },
    { id: 'metric-floyd-pair', label: '考察顶点对 (i ➔ j)', color: '#3b82f6' },
    { id: 'metric-floyd-relax', label: '松弛更新次数', color: '#a855f7' },
    { id: 'metric-floyd-dist', label: '当前 dist[i][j]', color: '#10b981' },
  ],
  legend: [
    { label: '中继点 k', color: '#fef08a' },
    { label: '考察格 (i, j)', color: '#fed7aa' },
    { label: '中转链 (i,k)/(k,j)', color: '#fef3c7' },
    { label: '成功更新更短路', color: '#bbf7d0' },
  ],
  codeLanguages: FLOYD_CODE_LANGUAGES,
  problemHtml: FLOYD_PROBLEM_HTML,
  analysisHtml: FLOYD_ANALYSIS_HTML,
  generateSteps: () => buildFloydSteps(),
  renderCanvas: (container, step) => renderFloydCanvas(container, step as FloydStep),
});
