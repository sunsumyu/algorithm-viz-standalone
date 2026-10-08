/**
 * 左程云算法通关课 Class 061: 堆优化 Dijkstra 算法 (Dijkstra Heap · O(E log V)) - 步进推演编译器
 */

import { DIJKSTRA_HEAP_061_LINES } from './graph-061-stage-codes';
import { Graph061StepBase, Graph061NodeCoord } from './graph-061-shared';

export interface DijkstraHeapStep extends Graph061StepBase {
  nodes: Graph061NodeCoord[];
  edges: Array<{ from: number; to: number; w: number }>;
  dist: number[];
  visited: boolean[];
  curNode: number | null;
  pqSnapshot: Array<{ u: number; d: number }>;
  activeEdge?: { from: number; to: number } | null;
}

export const DEFAULT_DIJKSTRA_HEAP_NODES: Graph061NodeCoord[] = [
  { id: 0, x: 70, y: 110, label: '0(源)' },
  { id: 1, x: 200, y: 50 },
  { id: 2, x: 200, y: 170 },
  { id: 3, x: 330, y: 110 },
  { id: 4, x: 430, y: 110 },
];

export const DEFAULT_DIJKSTRA_HEAP_EDGES = [
  { from: 0, to: 1, w: 2 },
  { from: 0, to: 2, w: 4 },
  { from: 1, to: 2, w: 1 },
  { from: 1, to: 3, w: 7 },
  { from: 2, to: 3, w: 3 },
  { from: 3, to: 4, w: 1 },
];

export function buildDijkstraHeap061Steps(preset: string = 'sparse_5nodes'): DijkstraHeapStep[] {
  const steps: DijkstraHeapStep[] = [];
  const lines = DIJKSTRA_HEAP_061_LINES;

  let nodes = DEFAULT_DIJKSTRA_HEAP_NODES;
  let edges = DEFAULT_DIJKSTRA_HEAP_EDGES;

  if (preset === 'branch_6nodes') {
    nodes = [
      { id: 0, x: 60, y: 110, label: '0(源)' },
      { id: 1, x: 180, y: 50 },
      { id: 2, x: 180, y: 170 },
      { id: 3, x: 300, y: 50 },
      { id: 4, x: 300, y: 170 },
      { id: 5, x: 420, y: 110 },
    ];
    edges = [
      { from: 0, to: 1, w: 1 },
      { from: 0, to: 2, w: 2 },
      { from: 1, to: 3, w: 3 },
      { from: 2, to: 4, w: 1 },
      { from: 3, to: 5, w: 2 },
      { from: 4, to: 5, w: 4 },
    ];
  }

  const n = nodes.length;
  const s = 0;
  const dist = new Array(n).fill(Infinity);
  const visited = new Array(n).fill(false);
  dist[s] = 0;

  const pq: Array<{ u: number; d: number }> = [{ u: s, d: 0 }];

  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n }, () => []);
  for (const e of edges) {
    adj[e.from].push({ to: e.to, w: e.w });
  }

  steps.push({
    nodes,
    edges,
    dist: [...dist],
    visited: [...visited],
    curNode: null,
    pqSnapshot: [...pq],
    activeEdge: null,
    decision: `1. 初始化堆优化 Dijkstra：源点 Node ${s} 初始距离 0 入堆，其余顶点置为 ∞`,
    message: `利用小根堆维护波前，寻优复杂度优化至 O(log V)。`,
    log: `Init pq=[(0, 0)]`,
    line: lines.init.javascript,
    codeLine: lines.init,
    metrics: { '源点': `Node ${s}`, '堆规模': 1, '时间复杂度': 'O(E log V)' },
    statusBadge: { text: `源点就绪: Node ${s}`, type: 'info' },
  });

  while (pq.length > 0) {
    pq.sort((a, b) => a.d - b.d);
    const top = pq.shift()!;
    const u = top.u;
    const d = top.d;

    if (visited[u]) {
      steps.push({
        nodes,
        edges,
        dist: [...dist],
        visited: [...visited],
        curNode: u,
        pqSnapshot: [...pq],
        activeEdge: null,
        decision: `弹出的堆顶 (Node ${u}, 记录距离 ${d}) 已经收敛（过期元素），执行惰性跳过`,
        message: `堆内存在多次入堆产生的冗余历史副本，直接丢弃。`,
        log: `Skip stale pq element u=${u}, d=${d}`,
        line: lines.skipVisited.javascript,
        codeLine: lines.skipVisited,
        metrics: { '过期丢弃': `Node ${u}`, '剩余堆规模': pq.length },
        statusBadge: { text: `跳过: Node ${u}`, type: 'warning' },
      });
      continue;
    }

    visited[u] = true;

    steps.push({
      nodes,
      edges,
      dist: [...dist],
      visited: [...visited],
      curNode: u,
      pqSnapshot: [...pq],
      activeEdge: null,
      decision: `堆顶出队：锁定当前最小波前 Node ${u} (真实最短路 dist=${dist[u]})`,
      message: `顶点 Node ${u} 正式完成永久收敛，准备考察其相邻出边。`,
      log: `Pop min (u=${u}, d=${d}), lock vertex`,
      line: lines.lockNode.javascript,
      codeLine: lines.lockNode,
      metrics: { '当前锁定': `Node ${u}`, '最短距离': dist[u], '已收敛数': `${visited.filter(Boolean).length}/${n}` },
      statusBadge: { text: `锁定: Node ${u}`, type: 'success' },
    });

    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push({ u: v, d: dist[v] });

        steps.push({
          nodes,
          edges,
          dist: [...dist],
          visited: [...visited],
          curNode: u,
          pqSnapshot: [...pq],
          activeEdge: { from: u, to: v },
          decision: `沿出边 (${u} ➔ ${v}, 权重 ${w}) 松弛成功：dist[${v}]=${dist[v]}，新二元组 (${v}, ${dist[v]}) 入堆`,
          message: `发现通往 Node ${v} 的更优前沿路径，小根堆波前更新。`,
          log: `Relax (${u}->${v}, w=${w}) -> push (${v}, ${dist[v]})`,
          line: lines.relaxEdge.javascript,
          codeLine: lines.relaxEdge,
          metrics: { '松弛边': `${u}➔${v}`, '新距离': dist[v], '堆规模': pq.length },
          statusBadge: { text: `松弛入堆: ${v}`, type: 'info' },
        });
      }
    }
  }

  steps.push({
    nodes,
    edges,
    dist: [...dist],
    visited: [...visited],
    curNode: null,
    pqSnapshot: [],
    activeEdge: null,
    decision: `堆优化 Dijkstra 算法执行完毕：小根堆已空，所有可达顶点最短路均已求解`,
    message: `最终距离向量 [${dist.map((x) => (x === Infinity ? '∞' : x)).join(', ')}]。`,
    log: `Dijkstra heap finished -> dist=[${dist.join(', ')}]`,
    line: lines.returnDist.javascript,
    codeLine: lines.returnDist,
    metrics: { '全局最短路': dist.join(', '), '算法状态': '已收敛' },
    statusBadge: { text: '计算完成', type: 'success' },
  });

  return steps;
}
