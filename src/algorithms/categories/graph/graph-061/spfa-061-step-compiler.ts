/**
 * 左程云算法通关课 Class 061: SPFA 算法 (Shortest Path Faster Algorithm · 队列优化的 Bellman-Ford) - 步进推演编译器
 */

import { SPFA_061_LINES } from './graph-061-stage-codes';
import { Graph061StepBase, Graph061NodeCoord } from './graph-061-shared';

export interface SpfaStep extends Graph061StepBase {
  nodes: Graph061NodeCoord[];
  edges: Array<{ from: number; to: number; w: number }>;
  dist: number[];
  inQueue: boolean[];
  queue: number[];
  curNode: number | null;
  activeEdge?: { from: number; to: number } | null;
  relaxCount: number;
}

export const DEFAULT_SPFA_NODES: Graph061NodeCoord[] = [
  { id: 0, x: 70, y: 110, label: '0(源)' },
  { id: 1, x: 200, y: 50 },
  { id: 2, x: 200, y: 170 },
  { id: 3, x: 330, y: 60 },
  { id: 4, x: 420, y: 140 },
];

export const DEFAULT_SPFA_EDGES = [
  { from: 0, to: 1, w: 2 },
  { from: 0, to: 2, w: 5 },
  { from: 1, to: 2, w: -2 }, // 负权边
  { from: 1, to: 3, w: 4 },
  { from: 2, to: 3, w: 3 },
  { from: 3, to: 4, w: 2 },
  { from: 2, to: 4, w: 7 },
];

export function buildSpfa061Steps(preset: string = 'negative_chain'): SpfaStep[] {
  const steps: SpfaStep[] = [];
  const lines = SPFA_061_LINES;

  let nodes = DEFAULT_SPFA_NODES;
  let edges = DEFAULT_SPFA_EDGES;

  if (preset === 'dense_positive') {
    nodes = [
      { id: 0, x: 80, y: 110, label: '0(源)' },
      { id: 1, x: 220, y: 60 },
      { id: 2, x: 220, y: 160 },
      { id: 3, x: 380, y: 110 },
    ];
    edges = [
      { from: 0, to: 1, w: 3 },
      { from: 0, to: 2, w: 4 },
      { from: 1, to: 2, w: 1 },
      { from: 1, to: 3, w: 5 },
      { from: 2, to: 3, w: 2 },
    ];
  }

  const n = nodes.length;
  const s = 0;
  const dist = new Array(n).fill(Infinity);
  const inQueue = new Array(n).fill(false);
  const queue: number[] = [];

  dist[s] = 0;
  queue.push(s);
  inQueue[s] = true;

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
    inQueue: [...inQueue],
    queue: [...queue],
    curNode: null,
    activeEdge: null,
    relaxCount: 0,
    decision: `1. 初始化 SPFA：源点 dist[${s}] = 0，源点 Node ${s} 入队并标记 inQueue=true`,
    message: `仅维护可能促使后续顶点距离缩短的活跃节点集合，避免全边无谓空转。`,
    log: `Init SPFA dist[${s}]=0, queue=[${s}]`,
    line: lines.init.javascript,
    codeLine: lines.init,
    metrics: { '源点': `Node ${s}`, '初始队列': `[${queue.join(', ')}]` },
    statusBadge: { text: `源点就绪: Node ${s}`, type: 'info' },
  });

  while (queue.length > 0) {
    const u = queue.shift()!;
    inQueue[u] = false;

    steps.push({
      nodes,
      edges,
      dist: [...dist],
      inQueue: [...inQueue],
      queue: [...queue],
      curNode: u,
      activeEdge: null,
      relaxCount,
      decision: `队列弹出头结点 Node ${u}：准备考察其所有出边，标记 inQueue[${u}]=false`,
      message: `若在后续松弛中 Node ${u} 距离再度缩短，其仍可再次重新入队。`,
      log: `Pop queue front u=${u}, inQueue=false`,
      line: lines.pollNode.javascript,
      codeLine: lines.pollNode,
      metrics: { '当前出队': `Node ${u}`, '当前距离': dist[u], '剩余队列长': queue.length },
      statusBadge: { text: `出队: Node ${u}`, type: 'info' },
    });

    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;

      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        relaxCount++;

        let pushMsg = '';
        if (!inQueue[v]) {
          queue.push(v);
          inQueue[v] = true;
          pushMsg = `，Node ${v} 尚不在队中，成功入队激活后续松弛`;
        } else {
          pushMsg = `，Node ${v} 已在队中，无需重复入队`;
        }

        steps.push({
          nodes,
          edges,
          dist: [...dist],
          inQueue: [...inQueue],
          queue: [...queue],
          curNode: u,
          activeEdge: { from: u, to: v },
          relaxCount,
          decision: `出边 (${u} ➔ ${v}, 权重 ${w}) 松弛成功：dist[${v}] 更新为 ${dist[v]}${pushMsg}`,
          message: `三角不等式成立：dist[${u}] (${dist[u]}) + (${w}) < 旧 dist[${v}]。`,
          log: `Relax (${u}->${v}, w=${w}) -> dist[${v}]=${dist[v]}, queue=[${queue.join(',')}]`,
          line: lines.relaxEdge.javascript,
          codeLine: lines.relaxEdge,
          metrics: { '松弛边': `${u}➔${v}`, '新距离': dist[v], '队列长度': queue.length },
          statusBadge: { text: `松弛: ${u}➔${v}`, type: 'success' },
        });
      }
    }
  }

  // 终态
  steps.push({
    nodes,
    edges,
    dist: [...dist],
    inQueue: [...inQueue],
    queue: [],
    curNode: null,
    activeEdge: null,
    relaxCount,
    decision: `SPFA 算法执行完毕：松弛队列已空，所有可达顶点最短路计算完成`,
    message: `输出最终单源最短路向量 [${dist.map((x) => (x === Infinity ? '∞' : x)).join(', ')}]。`,
    log: `SPFA finished -> dist=[${dist.join(', ')}]`,
    line: lines.returnDist.javascript,
    codeLine: lines.returnDist,
    metrics: { '最终距离': dist.join(', '), '总松弛次数': relaxCount },
    statusBadge: { text: '计算完成', type: 'success' },
  });

  return steps;
}
