/**
 * 左程云算法通关课 Class 061: 朴素 Dijkstra 算法 (Dijkstra Naive · O(V²)) - 步进推演编译器
 */

import { DIJKSTRA_BASIC_061_LINES } from './graph-061-stage-codes';
import { Graph061StepBase, Graph061NodeCoord } from './graph-061-shared';

export interface DijkstraBasicStep extends Graph061StepBase {
  nodes: Graph061NodeCoord[];
  edges: Array<{ from: number; to: number; w: number }>;
  dist: number[];
  visited: boolean[];
  curNode: number | null;
  activeEdge?: { from: number; to: number } | null;
  relaxCount: number;
}

export const DEFAULT_DIJKSTRA_BASIC_NODES: Graph061NodeCoord[] = [
  { id: 0, x: 70, y: 110, label: '0(源)' },
  { id: 1, x: 200, y: 50 },
  { id: 2, x: 200, y: 170 },
  { id: 3, x: 330, y: 110 },
  { id: 4, x: 430, y: 110 },
];

export const DEFAULT_DIJKSTRA_BASIC_EDGES = [
  { from: 0, to: 1, w: 4 },
  { from: 0, to: 2, w: 1 },
  { from: 2, to: 1, w: 2 },
  { from: 1, to: 3, w: 1 },
  { from: 2, to: 3, w: 5 },
  { from: 3, to: 4, w: 3 },
];

export function buildDijkstraBasic061Steps(preset: string = 'default_5nodes'): DijkstraBasicStep[] {
  const steps: DijkstraBasicStep[] = [];
  const lines = DIJKSTRA_BASIC_061_LINES;

  let nodes = DEFAULT_DIJKSTRA_BASIC_NODES;
  let edges = DEFAULT_DIJKSTRA_BASIC_EDGES;

  if (preset === 'dense_4nodes') {
    nodes = [
      { id: 0, x: 100, y: 60, label: '0(源)' },
      { id: 1, x: 350, y: 60 },
      { id: 2, x: 100, y: 160 },
      { id: 3, x: 350, y: 160 },
    ];
    edges = [
      { from: 0, to: 1, w: 3 },
      { from: 0, to: 2, w: 5 },
      { from: 1, to: 2, w: 1 },
      { from: 1, to: 3, w: 6 },
      { from: 2, to: 3, w: 2 },
    ];
  }

  const n = nodes.length;
  const s = 0;
  const dist = new Array(n).fill(Infinity);
  const visited = new Array(n).fill(false);
  dist[s] = 0;

  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n }, () => []);
  for (const e of edges) {
    adj[e.from].push({ to: e.to, w: e.w });
  }

  let relaxCount = 0;

  // 1. 初始化
  steps.push({
    nodes,
    edges,
    dist: [...dist],
    visited: [...visited],
    curNode: null,
    activeEdge: null,
    relaxCount: 0,
    decision: `1. 初始化朴素 Dijkstra 距离表：dist[${s}] = 0，其余所有顶点置为 ∞`,
    message: `准备进行 V 轮贪心寻优，每轮线性扫描寻找当前未收敛的最小距离顶点。`,
    log: `Init dist[${s}]=0`,
    line: lines.init.javascript,
    codeLine: lines.init,
    metrics: { '源点': `Node ${s}`, '顶点总数': n, '时间复杂度': 'O(V²)' },
    statusBadge: { text: `源点就绪: Node ${s}`, type: 'info' },
  });

  for (let i = 0; i < n; i++) {
    let u = -1;
    for (let j = 0; j < n; j++) {
      if (!visited[j] && (u === -1 || dist[j] < dist[u])) {
        u = j;
      }
    }

    if (u === -1 || dist[u] === Infinity) {
      steps.push({
        nodes,
        edges,
        dist: [...dist],
        visited: [...visited],
        curNode: null,
        activeEdge: null,
        relaxCount,
        decision: `所有剩余可达顶点均已收敛，或剩余顶点与源点不可达，提前退出`,
        message: `贪心算法完成主循环扫描。`,
        log: `Break -> no more reachable unvisited vertices`,
        line: lines.returnDist.javascript,
        codeLine: lines.returnDist,
        metrics: { '已锁定顶点数': visited.filter(Boolean).length },
        statusBadge: { text: '搜索收敛', type: 'info' },
      });
      break;
    }

    visited[u] = true;

    steps.push({
      nodes,
      edges,
      dist: [...dist],
      visited: [...visited],
      curNode: u,
      activeEdge: null,
      relaxCount,
      decision: `第 ${i + 1} 轮贪心选点：扫描锁定未访问中距离最小的 Node ${u} (dist=${dist[u]})`,
      message: `在非负权图中，Node ${u} 的最短距离已不可被更优路径松弛，状态定格。`,
      log: `Select min node u=${u}, dist=${dist[u]}`,
      line: lines.lockNode.javascript,
      codeLine: lines.lockNode,
      metrics: { '当前锁定': `Node ${u}`, '当前距离': dist[u], '已锁定数': `${visited.filter(Boolean).length}/${n}` },
      statusBadge: { text: `锁定: Node ${u}`, type: 'success' },
    });

    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        relaxCount++;

        steps.push({
          nodes,
          edges,
          dist: [...dist],
          visited: [...visited],
          curNode: u,
          activeEdge: { from: u, to: v },
          relaxCount,
          decision: `沿出边 (${u} ➔ ${v}, 权重 ${w}) 松弛成功：dist[${v}] 从旧值更新为更小的 ${dist[v]}`,
          message: `三角不等式成立：dist[${u}] (${dist[u]}) + ${w} < dist[${v}]。`,
          log: `Relax (${u}->${v}, w=${w}) -> dist[${v}]=${dist[v]}`,
          line: lines.relaxEdge.javascript,
          codeLine: lines.relaxEdge,
          metrics: { '松弛边': `${u}➔${v}`, '新距离': dist[v], '总松弛次数': relaxCount },
          statusBadge: { text: `松弛: ${u}➔${v}`, type: 'info' },
        });
      }
    }
  }

  // 终态
  steps.push({
    nodes,
    edges,
    dist: [...dist],
    visited: [...visited],
    curNode: null,
    activeEdge: null,
    relaxCount,
    decision: `朴素 Dijkstra 算法执行完毕：成功计算源点到所有顶点的全局最短路径`,
    message: `全部连通顶点已完成锁定，输出最终距离向量 [${dist.map((x) => (x === Infinity ? '∞' : x)).join(', ')}]。`,
    log: `Dijkstra basic finished -> dist=[${dist.join(', ')}]`,
    line: lines.returnDist.javascript,
    codeLine: lines.returnDist,
    metrics: { '全局最短路': dist.join(', '), '总松弛次数': relaxCount, '算法收敛': '100%' },
    statusBadge: { text: '计算完成', type: 'success' },
  });

  return steps;
}
