/**
 * Floyd-Warshall 全源最短路径算法 (左程云 class061) - 步进推演编译器
 */

import { StepBase } from '../../../core/step-visualizer';
import { HighlightTarget } from '../../../core/code-panel';
import { snapshotGrid2D } from '../../../core/strategies/grid-snapshot';

export interface FloydStep extends StepBase {
  matrix: number[][];
  k: number | null;
  i: number | null;
  j: number | null;
  relaxCount: number;
  action: 'init' | 'check' | 'update' | 'done';
  statusText: string;
  log: string;
  line?: number;
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

export const INF = 999999;

export function buildFloydSteps(): FloydStep[] {
  const steps: FloydStep[] = [];
  const n = FLOYD_NODES.length;

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
      matrix: snapshotGrid2D(dist),
      k,
      i,
      j,
      relaxCount,
      action,
      statusText,
      log,
      line: (codeLine as any)?.javascript || 1,
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

        makeStep(lines.checkRelax, canRelax ? 'update' : 'check', `    🔎 [状态转移方程核验] if (dist[${i}][${k}](${ikStr}) + dist[${k}][${j}](${kjStr}) < dist[${i}][${j}](${ijStr})) -> (${canRelax})。`, `核验转移: (${i} ➔ ${k} ➔ ${j})`, k, i, j);

        if (canRelax) {
          const oldVal = dist[i][j];
          dist[i][j] = dist[i][k] + dist[k][j];
          relaxCount++;
          makeStep(lines.updateDist, 'update', `    ⚡ [DP矩阵松弛更新] 发现更优中转路径！dist[${i}][${j}] 从 ${oldVal >= INF ? '∞' : oldVal} 缩短为 ${dist[i][j]}！`, `松弛更新: dist[${i}][${j}]=${dist[i][j]}`, k, i, j);
        }
      }
    }
  }

  makeStep(lines.returnDist, 'done', `🎉 [Floyd-Warshall 算法达成] return dist！所有顶点对之间的全局最短路径全部求解完毕，总松弛次数: ${relaxCount}。`, '算法完成: 返回全源最短路矩阵');

  return steps;
}
