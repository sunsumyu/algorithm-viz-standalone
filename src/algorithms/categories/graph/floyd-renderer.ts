/**
 * Floyd-Warshall 全源最短路径可视化器 — 4-Card 标准现代架构
 * 动态规划阶段推进、全源距离矩阵实时更新与三重循环追踪 (左程云 class061)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（对角线初始化、直连边赋予、中转点k循环、起点i循环、终点j循环、松弛状态转移、矩阵更新均发射独立Step）、四语言行号映射
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import {
  FLOYD_PROBLEM_HTML,
  FLOYD_ANALYSIS_HTML,
  FLOYD_CODE_LANGUAGES,
} from './floyd-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface FloydStep extends StepBase {
  matrix: number[][];
  k: number | null;
  i: number | null;
  j: number | null;
  relaxCount: number;
  action: 'init' | 'check' | 'update' | 'done';
  statusText: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export const FLOYD_NODES = [0, 1, 2, 3];
export const FLOYD_EDGES = [
  { from: 0, to: 1, w: 5 },
  { from: 0, to: 3, w: 10 },
  { from: 1, to: 2, w: 3 },
  { from: 2, to: 3, w: 1 },
];

const INF = 999999;

export function buildFloydSteps(): FloydStep[] {
  const steps: FloydStep[] = [];
  const n = FLOYD_NODES.length;

  // 精准 10 处四语言映射行号字典 (cpp / java / python / javascript 数组 1-based 索引)
  const lines = {
    entry: { cpp: 1, java: 2, python: 1, javascript: 1 },
    initDist: { cpp: 2, java: 4, python: 2, javascript: 2 },
    diagZero: { cpp: 3, java: 5, python: 3, javascript: 3 },
    fillEdges: { cpp: 4, java: 6, python: 4, javascript: 4 },
    loopK: { cpp: 5, java: 7, python: 5, javascript: 5 },
    loopI: { cpp: 6, java: 8, python: 6, javascript: 6 },
    loopJ: { cpp: 7, java: 9, python: 7, javascript: 7 },
    checkRelax: { cpp: 8, java: 10, python: 8, javascript: 8 },
    updateDist: { cpp: 9, java: 11, python: 9, javascript: 9 },
    returnDist: { cpp: 14, java: 16, python: 10, javascript: 14 },
  };

  const dist: number[][] = Array.from({ length: n }, () => new Array(n).fill(INF));
  let relaxCount = 0;

  function makeStep(
    codeLine: HighlightTarget,
    action: 'init' | 'check' | 'update' | 'done',
    statusText: string,
    log: string,
    k: number | null = null,
    i: number | null = null,
    j: number | null = null
  ): void {
    steps.push({
      matrix: dist.map((row) => [...row]),
      k,
      i,
      j,
      relaxCount,
      action,
      statusText,
      log,
      codeLine,
      metrics: {
        'metric-floyd-k': k !== null ? `${k}` : '—',
        'metric-floyd-pair': i !== null && j !== null ? `(${i} ➔ ${j})` : '—',
        'metric-floyd-relax': `${relaxCount}`,
        'metric-floyd-dist': i !== null && j !== null ? `${dist[i][j] >= INF ? '∞' : dist[i][j]}` : '—',
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, 'init', '🚀 [算法启动] floydWarshall(n=4, edges)：初始化 Floyd-Warshall 全源最短路。', 'floydWarshall 入口');
  makeStep(lines.initDist, 'init', `📊 [初始化矩阵] int[][] dist = new int[4][4]，初始值全置为 ∞。`, 'init dist[][]');

  for (let i = 0; i < n; i++) dist[i][i] = 0;
  makeStep(lines.diagZero, 'init', '🌱 [对角线清零] dist[i][i] = 0；任意节点到自身距离为 0。', 'diag = 0');

  for (const e of FLOYD_EDGES) dist[e.from][e.to] = e.w;
  makeStep(lines.fillEdges, 'init', '➕ [填入直连边] 将图中已知的 4 条有向边权重录入矩阵。', 'fill direct edges');

  // 2. 三重循环阶段推进
  for (let k = 0; k < n; k++) {
    makeStep(lines.loopK, 'check', `🔄 [阶段推进] for (k = ${k}; k < ${n}; k++)：允许引入中间中转点 k = ${k} 进行松弛。`, `--- 中转点 k = ${k} 阶段 ---`, k);

    for (let i = 0; i < n; i++) {
      makeStep(lines.loopI, 'check', `  ↳ [枚举起点] for (i = ${i}; i < ${n}; i++)：考察以节点 ${i} 为起点的所有路径。`, `起点 i = ${i}`, k, i);

      for (let j = 0; j < n; j++) {
        makeStep(lines.loopJ, 'check', `    ↳ [枚举终点] for (j = ${j}; j < ${n}; j++)：测试路径 (${i} ➔ ${k} ➔ ${j})。`, `终点 j = ${j}`, k, i, j);

        const canRelax = dist[i][k] + dist[k][j] < dist[i][j];
        const ikStr = dist[i][k] >= INF ? '∞' : `${dist[i][k]}`;
        const kjStr = dist[k][j] >= INF ? '∞' : `${dist[k][j]}`;
        const ijStr = dist[i][j] >= INF ? '∞' : `${dist[i][j]}`;

        makeStep(lines.checkRelax, canRelax ? 'update' : 'check', `    🔎 [状态转移方程核验] if (dist[${i}][${k}](${ikStr}) + dist[${k}][${j}](${kjStr}) < dist[${i}][${j}](${ijStr})) -> (${canRelax})。`, `check (${i}->${k}->${j})`, k, i, j);

        if (canRelax) {
          const oldVal = dist[i][j];
          dist[i][j] = dist[i][k] + dist[k][j];
          relaxCount++;
          makeStep(lines.updateDist, 'update', `    ⚡ [DP矩阵松弛更新] 发现更优中转路径！dist[${i}][${j}] 从 ${oldVal >= INF ? '∞' : oldVal} 缩短为 ${dist[i][j]}！`, `dist[${i}][${j}]=${dist[i][j]}`, k, i, j);
        }
      }
    }
  }

  makeStep(lines.returnDist, 'done', `🎉 [Floyd-Warshall 算法达成] return dist！所有顶点对之间的全局最短路径全部求解完毕，总松弛次数: ${relaxCount}。`, 'return dist');

  return steps;
}

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
  generateSteps: (inputs) => buildFloydSteps(),
  renderCanvas: (container, step) => renderFloydCanvas(container, step as FloydStep),
});
