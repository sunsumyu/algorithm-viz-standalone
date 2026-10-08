/**
 * 左程云算法通关课 Class 061: Floyd-Warshall 全源最短路算法 (O(V³) 动态规划) - 步进推演编译器
 */

import { snapshotGrid2D } from '../../../../core/strategies/grid-snapshot';
import { FLOYD_061_LINES } from './graph-061-stage-codes';
import { Graph061StepBase, Graph061NodeCoord } from './graph-061-shared';

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

export const DEFAULT_FLOYD_NODES: Graph061NodeCoord[] = [
  { id: 0, x: 120, y: 50, label: '0' },
  { id: 1, x: 380, y: 50, label: '1' },
  { id: 2, x: 120, y: 170, label: '2' },
  { id: 3, x: 380, y: 170, label: '3' },
];

export const DEFAULT_FLOYD_EDGES = [
  { from: 0, to: 1, w: 3 },
  { from: 0, to: 2, w: 8 },
  { from: 1, to: 2, w: 2 },
  { from: 1, to: 3, w: 5 },
  { from: 2, to: 3, w: 1 },
  { from: 3, to: 0, w: 2 },
];

export function buildFloyd061Steps(preset: string = 'default_4nodes'): FloydStep[] {
  const steps: FloydStep[] = [];
  const lines = FLOYD_061_LINES;

  let nodes = DEFAULT_FLOYD_NODES;
  let edges = DEFAULT_FLOYD_EDGES;

  if (preset === 'directed_cycle') {
    nodes = [
      { id: 0, x: 100, y: 50, label: '0' },
      { id: 1, x: 400, y: 50, label: '1' },
      { id: 2, x: 400, y: 170, label: '2' },
      { id: 3, x: 100, y: 170, label: '3' },
    ];
    edges = [
      { from: 0, to: 1, w: 1 },
      { from: 1, to: 2, w: 2 },
      { from: 2, to: 3, w: 3 },
      { from: 3, to: 0, w: 4 },
    ];
  }

  const n = nodes.length;
  const dp: number[][] = Array.from({ length: n }, () => new Array(n).fill(Infinity));

  for (let i = 0; i < n; i++) {
    dp[i][i] = 0;
  }
  for (const e of edges) {
    dp[e.from][e.to] = e.w;
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
    decision: `1. 初始化 Floyd 邻接距离矩阵：直连有向边写入对应权值，对角线置 0，其余为 ∞`,
    message: `准备执行三重嵌套循环：外层枚举中转跳板 k，内层枚举起点 i 与终点 j。`,
    log: `Init Floyd matrix (size ${n}x${n})`,
    line: lines.init.javascript,
    codeLine: lines.init,
    metrics: { '矩阵阶数': `${n}x${n}`, '算法复杂度': 'O(V³)', '外层枚举': '跳板 k' },
    statusBadge: { text: '矩阵初始化', type: 'info' },
  });

  // 三重循环
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
      decision: `枚举中转跳板 k = Node ${k}：考察全图所有点对 (i, j) 是否可借由 Node ${k} 缩短距离`,
      message: `状态转移方程：dp[i][j] = min(dp[i][j], dp[i][k] + dp[k][j])。`,
      log: `Outer loop k=${k}`,
      line: lines.kLoop.javascript,
      codeLine: lines.kLoop,
      metrics: { '当前跳板 k': `Node ${k}`, '累计更新次数': relaxCount },
      statusBadge: { text: `跳板: Node ${k}`, type: 'info' },
    });

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;

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
              decision: `经由跳板 ${k} 松弛点对 (${i} ➔ ${j}) 成功：距离从 ${oldVal === Infinity ? '∞' : oldVal} 缩短为 ${viaDist}`,
              message: `路径更优：(${i}➔${k}, ${dp[i][k]}) + (${k}➔${j}, ${dp[k][j]}) = ${viaDist} < ${oldVal === Infinity ? '∞' : oldVal}。`,
              log: `Relax (${i}->${j} via ${k}) -> dp[${i}][${j}]=${viaDist}`,
              line: lines.transition.javascript,
              codeLine: lines.transition,
              metrics: { '松弛点对': `${i}➔${j}`, '中转跳板': `Node ${k}`, '新距离': viaDist },
              statusBadge: { text: `松弛: ${i}➔${j}`, type: 'success' },
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
    decision: `Floyd-Warshall 算法执行完毕：成功获得全源任意点对之间的全局最短距离`,
    message: `全部 ${n} 个顶点的全排列路径闭包均已松弛完毕。`,
    log: `Floyd finished -> total updates=${relaxCount}`,
    line: lines.returnDp.javascript,
    codeLine: lines.returnDp,
    metrics: { '总松弛次数': relaxCount, '矩阵阶数': `${n}x${n}` },
    statusBadge: { text: '计算完成', type: 'success' },
  });

  return steps;
}
