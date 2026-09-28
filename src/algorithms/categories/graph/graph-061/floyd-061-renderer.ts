import { snapshotGrid2D } from '../../../../core/strategies/grid-snapshot';
/**
 * 左程云算法通关课 Class 061: Floyd-Warshall 全源最短路算法 (O(V³) 动态规划)
 * 以中间点 k 作为最外层循环，动态规划求解全图任意两点间的最短路径
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_061_PROBLEMS } from './graph-061-problem-content';
import {
  FLOYD_061_CODES,
  FLOYD_061_LINES,
} from './graph-061-stage-codes';
import {
  Graph061StepBase,
  renderGraph061SvgTopology,
  Graph061NodeCoord,
} from './graph-061-shared';

export interface FloydStep extends Graph061StepBase {
  nodes: Graph061NodeCoord[];
  edges: Array<{ from: number; to: number; w: number }>;
  dp: number[][];
  k: number | null;
  i: number | null;
  j: number | null;
  activePath?: { from: number; via: number; to: number } | null;
  relaxCount: number;
}

const DEFAULT_NODES: Graph061NodeCoord[] = [
  { id: 0, x: 120, y: 50, label: '0' },
  { id: 1, x: 380, y: 50, label: '1' },
  { id: 2, x: 120, y: 170, label: '2' },
  { id: 3, x: 380, y: 170, label: '3' },
];

const DEFAULT_EDGES = [
  { from: 0, to: 1, w: 3 },
  { from: 0, to: 2, w: 8 },
  { from: 1, to: 2, w: 2 },
  { from: 1, to: 3, w: 5 },
  { from: 2, to: 3, w: 1 },
  { from: 3, to: 0, w: 2 },
];

function renderFloydMatrix(dp: number[][], currentK: number | null, curI: number | null, curJ: number | null): string {
  const n = dp.length;
  const headerCols = Array.from({ length: n }, (_, j) => `
    <th style="padding: 4px 8px; font-size: 11px; color: ${curJ === j ? '#8b5cf6' : '#64748b'}; font-weight: 700; background: #f8fafc; border: 1px solid #e2e8f0;">
      ➔ ${j}
    </th>
  `).join('');

  const rows = dp.map((row, i) => {
    const cells = row.map((val, j) => {
      const isTarget = curI === i && curJ === j;
      const isFromK = curI === i && currentK === j;
      const isKTo = currentK === i && curJ === j;
      const isDiagonal = i === j;

      let bg = '#ffffff';
      let border = '1px solid #e2e8f0';
      let col = '#1e293b';

      if (isTarget) {
        bg = '#fef3c7';
        border = '2px solid #f59e0b';
        col = '#b45309';
      } else if (isFromK || isKTo) {
        bg = '#ede9fe';
        border = '1px solid #8b5cf6';
        col = '#6d28d9';
      } else if (isDiagonal) {
        bg = '#f1f5f9';
        col = '#94a3b8';
      }

      return `
        <td style="padding: 4px 8px; text-align: center; font-size: 11px; font-weight: 800; font-family: monospace; background: ${bg}; border: ${border}; color: ${col};">
          ${val === Infinity ? '∞' : val}
        </td>
      `;
    }).join('');

    return `
      <tr>
        <th style="padding: 4px 8px; font-size: 11px; color: ${curI === i ? '#3b82f6' : '#64748b'}; font-weight: 700; background: #f8fafc; border: 1px solid #e2e8f0; text-align: right;">
          ${i} ➔
        </th>
        ${cells}
      </tr>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
      <span style="font-size: 11px; font-weight: 700; color: #475569;">全源距离矩阵 DP[i][j] (中转点 k=${currentK !== null ? currentK : '-'})</span>
      <table style="border-collapse: collapse; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; background: #ffffff;">
        <thead>
          <tr>
            <th style="background: #f1f5f9; border: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; padding: 4px;">起点\\终点</th>
            ${headerCols}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

export function buildFloyd061Steps(preset: string = 'default_4nodes'): FloydStep[] {
  const steps: FloydStep[] = [];
  const lines = FLOYD_061_LINES;

  let nodes = DEFAULT_NODES;
  let edges = DEFAULT_EDGES;

  if (preset === 'directed_cycle') {
    nodes = [
      { id: 0, x: 120, y: 50, label: '0' },
      { id: 1, x: 380, y: 50, label: '1' },
      { id: 2, x: 120, y: 170, label: '2' },
      { id: 3, x: 380, y: 170, label: '3' },
    ];
    edges = [
      { from: 0, to: 1, w: 1 },
      { from: 1, to: 2, w: 2 },
      { from: 2, to: 3, w: 3 },
      { from: 3, to: 0, w: 4 },
      { from: 0, to: 2, w: 5 },
    ];
  }

  const n = nodes.length;
  const dp: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity))
  );

  for (const e of edges) {
    dp[e.from][e.to] = Math.min(dp[e.from][e.to], e.w);
  }

  let relaxCount = 0;

  // 1. 初始化
  steps.push({
    nodes,
    edges,
    dp: snapshotGrid2D(dp),
    k: null,
    i: null,
    j: null,
    activePath: null,
    relaxCount: 0,
    decision: `1. 初始化 Floyd 距离矩阵：直连有向边写入权重，对角线置为 0，不可达置为 ∞`,
    message: `Floyd 三重循环核心：最外层 k 枚举允许借道的中转顶点集合 {0, 1, ..., k}。`,
    log: `Init Floyd matrix (n=${n})`,
    codeLine: lines.init,
    metrics: { '顶点规模': `${n} 顶点`, '时间复杂度': 'O(V³)', '已松弛': 0 },
    statusBadge: { text: '初始化矩阵', type: 'info' },
  });

  // 2. 枚举中转点 k
  for (let k = 0; k < n; k++) {
    steps.push({
      nodes,
      edges,
      dp: snapshotGrid2D(dp),
      k,
      i: null,
      j: null,
      activePath: null,
      relaxCount,
      decision: `最外层中转点推进至 k = ${k}：考察所有点对 (i, j) 借道 Node ${k} 是否能缩短距离`,
      message: `状态转移方程：dp[i][j] = min(dp[i][j], dp[i][${k}] + dp[${k}][j])。`,
      log: `Enter k=${k} loop`,
      codeLine: lines.kLoop,
      metrics: { '当前中转点': `Node ${k}`, '已松弛次数': relaxCount },
      statusBadge: { text: `中转点 k=${k}`, type: 'info' },
    });

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j || i === k || j === k) continue;
        if (dp[i][k] !== Infinity && dp[k][j] !== Infinity) {
          const viaDist = dp[i][k] + dp[k][j];
          if (viaDist < dp[i][j]) {
            const oldVal = dp[i][j];
            dp[i][j] = viaDist;
            relaxCount++;

            steps.push({
              nodes,
              edges,
              dp: snapshotGrid2D(dp),
              k,
              i,
              j,
              activePath: { from: i, via: k, to: j },
              relaxCount,
              decision: `借道中转点 Node ${k} 成功优化：dp[${i}][${j}] 由 ${oldVal === Infinity ? '∞' : oldVal} 缩短为 ${dp[i][j]}`,
              message: `路径 ${i} ➔ ${k} (${dp[i][k]}) + ${k} ➔ ${j} (${dp[k][j]}) = ${viaDist}，优于当前距离 ${oldVal === Infinity ? '∞' : oldVal}！`,
              log: `Relax dp[${i}][${j}] via ${k} -> ${dp[i][j]}`,
              codeLine: lines.transition,
              metrics: { '优化点对': `${i} ➔ ${j}`, '中转点': `Node ${k}`, '新距离': dp[i][j] },
              statusBadge: { text: `优化: ${i}➔${k}➔${j}`, type: 'warning' },
            });
          }
        }
      }
    }
  }

  // 终态
  steps.push({
    nodes,
    edges,
    dp: snapshotGrid2D(dp),
    k: null,
    i: null,
    j: null,
    activePath: null,
    relaxCount,
    decision: `Floyd-Warshall 算法执行完毕：成功求得全源任意点对之间的最短路径`,
    message: `全部 ${n} 个顶点之间的全源最短距离已完全收敛，可直接以 O(1) 查询任意点对距离。`,
    log: `Floyd finished with relaxCount=${relaxCount}`,
    codeLine: lines.returnDp,
    metrics: { '总松弛次数': relaxCount, '查询复杂度': 'O(1)', '全源收敛': '100%' },
    statusBadge: { text: '计算完成', type: 'success' },
  });

  return steps;
}

export const floyd061Visualizer = registerDeclarativeAlgorithm<FloydStep>({
  id: 'floyd-061',
  aliases: ['floyd', 'floyd-warshall', 'class061-code05'],
  name: 'Floyd-Warshall 全源最短路算法 (Class 061)',
  category: 'graph',
  icon: '🌐',
  difficulty: 3,
  levelOrder: 6105,
  learningGoal: '掌握中转点 k 最外层的动规状态转移方程与全源最短距离矩阵更新本质',
  problemHtml: GRAPH_061_PROBLEMS.floyd061.html,
  codeLanguages: FLOYD_061_CODES,
  inputs: [
    {
      id: 'preset',
      label: '拓扑预设选择',
      type: 'select',
      defaultValue: 'default_4nodes',
      options: [
        { label: '4 节点经典交叉图 (丰富中转点松弛)', value: 'default_4nodes' },
        { label: '4 节点环路图 (环形连通传播)', value: 'directed_cycle' },
      ],
    },
  ],
  presets: [
    { label: '4 节点交叉图', values: { preset: 'default_4nodes' } },
    { label: '4 节点环路图', values: { preset: 'directed_cycle' } },
  ],
  generateSteps: (inputs) => buildFloyd061Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 12px;">
        <div style="display: flex; gap: 16px; align-items: center; font-size: 11px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 14px; border-radius: 6px;">
          <span>当前借道中转点: <strong style="color: #8b5cf6;">Node ${step.k !== null ? step.k : '无'}</strong></span>
          <span>当前优化点对: <strong style="color: #f59e0b;">${step.i !== null && step.j !== null ? `${step.i} ➔ ${step.j}` : '无'}</strong></span>
          <span>累计更新: <strong style="color: #10b981;">${step.relaxCount} 次</strong></span>
        </div>
        <div style="display: flex; gap: 20px; align-items: center; justify-content: center; flex-wrap: wrap; width: 100%;">
          <div style="flex: 1; min-width: 260px; max-width: 360px;">
            ${renderGraph061SvgTopology(step.nodes, step.edges, {
              currentNode: step.k ?? undefined,
            })}
          </div>
          <div style="flex: 1; min-width: 260px; max-width: 360px; display: flex; justify-content: center;">
            ${renderFloydMatrix(step.dp, step.k, step.i, step.j)}
          </div>
        </div>
      </div>
    `;
  },
});
