/**
 * 左程云算法通关课 Class 061: Bellman-Ford 最短路算法 (V-1 轮全边松弛) - 步进推演编译器
 */

import { BELLMAN_FORD_061_LINES } from './graph-061-stage-codes';
import { Graph061StepBase, Graph061NodeCoord } from './graph-061-shared';

export interface BellmanFordStep extends Graph061StepBase {
  nodes: Graph061NodeCoord[];
  edges: Array<{ from: number; to: number; w: number }>;
  dist: number[];
  round: number;
  maxRounds: number;
  activeEdge?: { from: number; to: number } | null;
  relaxCount: number;
}

export const DEFAULT_BELLMAN_FORD_NODES: Graph061NodeCoord[] = [
  { id: 0, x: 70, y: 110, label: '0(源)' },
  { id: 1, x: 200, y: 50 },
  { id: 2, x: 200, y: 170 },
  { id: 3, x: 330, y: 60 },
  { id: 4, x: 420, y: 140 },
];

export const DEFAULT_BELLMAN_FORD_EDGES = [
  { from: 0, to: 1, w: 6 },
  { from: 0, to: 2, w: 4 },
  { from: 1, to: 3, w: -2 }, // 负权边
  { from: 2, to: 1, w: -1 }, // 负权边
  { from: 2, to: 3, w: 3 },
  { from: 3, to: 4, w: 2 },
  { from: 1, to: 4, w: 5 },
];

export function buildBellmanFord061Steps(preset: string = 'negative_weight'): BellmanFordStep[] {
  const steps: BellmanFordStep[] = [];
  const lines = BELLMAN_FORD_061_LINES;

  let nodes = DEFAULT_BELLMAN_FORD_NODES;
  let edges = DEFAULT_BELLMAN_FORD_EDGES;

  if (preset === 'positive_simple') {
    nodes = [
      { id: 0, x: 80, y: 110, label: '0(源)' },
      { id: 1, x: 220, y: 60 },
      { id: 2, x: 220, y: 160 },
      { id: 3, x: 380, y: 110 },
    ];
    edges = [
      { from: 0, to: 1, w: 2 },
      { from: 0, to: 2, w: 5 },
      { from: 1, to: 2, w: 1 },
      { from: 1, to: 3, w: 4 },
      { from: 2, to: 3, w: 1 },
    ];
  }

  const n = nodes.length;
  const s = 0;
  const maxRounds = n - 1;
  const dist = new Array(n).fill(Infinity);
  dist[s] = 0;

  let totalRelaxCount = 0;

  // 1. 初始化
  steps.push({
    nodes,
    edges,
    dist: [...dist],
    round: 0,
    maxRounds,
    activeEdge: null,
    relaxCount: 0,
    decision: `1. 初始化 Bellman-Ford 算法：源点 dist[${s}] = 0，其余置为 ∞`,
    message: `准备执行至多 V-1 = ${maxRounds} 轮的全边暴力扫描松弛。支持负权边存在。`,
    log: `Init dist[${s}]=0, maxRounds=${maxRounds}`,
    line: lines.init.javascript,
    codeLine: lines.init,
    metrics: { '源点': `Node ${s}`, '轮次上限': `${maxRounds} 轮`, '边总数': edges.length },
    statusBadge: { text: `源点就绪: Node ${s}`, type: 'info' },
  });

  // 2. 迭代至多 n - 1 轮
  for (let r = 1; r <= maxRounds; r++) {
    let hasUpdated = false;
    let roundRelaxCount = 0;

    steps.push({
      nodes,
      edges,
      dist: [...dist],
      round: r,
      maxRounds,
      activeEdge: null,
      relaxCount: totalRelaxCount,
      decision: `第 ${r}/${maxRounds} 轮松弛启动：全量遍历 ${edges.length} 条有向边`,
      message: `逐一测试所有边的三角不等式 dist[u] + w < dist[v]。`,
      log: `Start round ${r}/${maxRounds}`,
      line: lines.roundLoop.javascript,
      codeLine: lines.roundLoop,
      metrics: { '当前轮次': `第 ${r} 轮`, '已松弛累计': totalRelaxCount },
      statusBadge: { text: `第 ${r} 轮松弛`, type: 'info' },
    });

    for (const e of edges) {
      const u = e.from;
      const v = e.to;
      const w = e.w;

      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        hasUpdated = true;
        roundRelaxCount++;
        totalRelaxCount++;

        steps.push({
          nodes,
          edges,
          dist: [...dist],
          round: r,
          maxRounds,
          activeEdge: { from: u, to: v },
          relaxCount: totalRelaxCount,
          decision: `边 (${u} ➔ ${v}, 权值 ${w}) 松弛成功：dist[${v}] 更新为更优值 ${dist[v]}`,
          message: `松弛不等式成立：dist[${u}] (${dist[u]}) + (${w}) = ${dist[v]} < 原 dist[${v}]。`,
          log: `Relax edge (${u}->${v}, w=${w}) -> dist[${v}]=${dist[v]}`,
          line: lines.relaxEdge.javascript,
          codeLine: lines.relaxEdge,
          metrics: { '松弛边': `${u}➔${v}`, '权重': w, '本轮松弛数': roundRelaxCount },
          statusBadge: { text: `松弛: ${u}➔${v}`, type: 'success' },
        });
      }
    }

    if (!hasUpdated) {
      steps.push({
        nodes,
        edges,
        dist: [...dist],
        round: r,
        maxRounds,
        activeEdge: null,
        relaxCount: totalRelaxCount,
        decision: `第 ${r} 轮扫描中无任何边距离发生改变，早停优化触发！`,
        message: `所有可达节点最短路已提前完全收敛，无需继续后续多余轮次。`,
        log: `Early stopping triggered at round ${r}`,
        line: lines.earlyBreak.javascript,
        codeLine: lines.earlyBreak,
        metrics: { '早停轮次': `第 ${r} 轮`, '节省轮次': maxRounds - r },
        statusBadge: { text: '提前收敛', type: 'success' },
      });
      break;
    }
  }

  // 终态
  steps.push({
    nodes,
    edges,
    dist: [...dist],
    round: maxRounds,
    maxRounds,
    activeEdge: null,
    relaxCount: totalRelaxCount,
    decision: `Bellman-Ford 算法执行完毕：全网最短距离计算完成`,
    message: `输出最终单源最短路向量 [${dist.map((x) => (x === Infinity ? '∞' : x)).join(', ')}]。`,
    log: `Bellman-Ford finished -> dist=[${dist.join(', ')}]`,
    line: lines.returnDist.javascript,
    codeLine: lines.returnDist,
    metrics: { '最终距离': dist.join(', '), '总松弛次数': totalRelaxCount },
    statusBadge: { text: '计算完成', type: 'success' },
  });

  return steps;
}
