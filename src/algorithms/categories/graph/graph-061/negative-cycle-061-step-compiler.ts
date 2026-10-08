/**
 * 左程云算法通关课 Class 061: 负权环判定算法 (洛谷 P3385 · SPFA 计数法) - 步进推演编译器
 */

import { NEGATIVE_CYCLE_061_LINES } from './graph-061-stage-codes';
import { Graph061StepBase, Graph061NodeCoord } from './graph-061-shared';

export interface NegativeCycleStep extends Graph061StepBase {
  nodes: Graph061NodeCoord[];
  edges: Array<{ from: number; to: number; w: number }>;
  dist: number[];
  count: number[];
  inQueue: boolean[];
  queue: number[];
  curNode: number | null;
  activeEdge?: { from: number; to: number } | null;
  hasCycle: boolean;
}

export const DEFAULT_NEGATIVE_CYCLE_NODES: Graph061NodeCoord[] = [
  { id: 0, x: 80, y: 110, label: '0(源)' },
  { id: 1, x: 200, y: 60, label: '1' },
  { id: 2, x: 340, y: 60, label: '2' },
  { id: 3, x: 270, y: 170, label: '3' },
];

// 包含负权环: 1 -> 2 -> 3 -> 1 权值和: 2 + (-4) + (-1) = -3 < 0
export const CYCLE_EDGES = [
  { from: 0, to: 1, w: 1 },
  { from: 1, to: 2, w: 2 },
  { from: 2, to: 3, w: -4 },
  { from: 3, to: 1, w: -1 },
];

export const NO_CYCLE_EDGES = [
  { from: 0, to: 1, w: 3 },
  { from: 1, to: 2, w: -1 },
  { from: 2, to: 3, w: 2 },
  { from: 3, to: 1, w: 4 },
];

export function buildNegativeCycle061Steps(preset: string = 'has_cycle'): NegativeCycleStep[] {
  const steps: NegativeCycleStep[] = [];
  const lines = NEGATIVE_CYCLE_061_LINES;

  const nodes = DEFAULT_NEGATIVE_CYCLE_NODES;
  const edges = preset === 'no_cycle' ? NO_CYCLE_EDGES : CYCLE_EDGES;
  const n = nodes.length;

  const dist = new Array(n).fill(0);
  const count = new Array(n).fill(0);
  const inQueue = new Array(n).fill(true);
  const queue = Array.from({ length: n }, (_, i) => i);

  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n }, () => []);
  for (const e of edges) {
    adj[e.from].push({ to: e.to, w: e.w });
  }

  // 1. 初始化
  steps.push({
    nodes,
    edges,
    dist: [...dist],
    count: [...count],
    inQueue: [...inQueue],
    queue: [...queue],
    curNode: null,
    activeEdge: null,
    hasCycle: false,
    decision: `1. 初始化负环判定：全量顶点 0..${n - 1} 悉数入队，超级源点距离全部置为 0`,
    message: `设立超级源点概念（防止非连通图遗漏独立负环），count[i] 统计当前最短路所包含的边数。`,
    log: `Init Negative Cycle detection (all ${n} nodes into queue)`,
    line: lines.init.javascript,
    codeLine: lines.init,
    metrics: { '全图顶点数 n': n, '判定红线': `count[v] >= ${n}`, '当前队列': `[${queue.join(', ')}]` },
    statusBadge: { text: '全点入队初始化', type: 'info' },
  });

  let cycleDetected = false;

  while (queue.length > 0) {
    const u = queue.shift()!;
    inQueue[u] = false;

    steps.push({
      nodes,
      edges,
      dist: [...dist],
      count: [...count],
      inQueue: [...inQueue],
      queue: [...queue],
      curNode: u,
      activeEdge: null,
      hasCycle: false,
      decision: `队首出队：Node ${u} (当前入队边数 count[${u}]=${count[u]}) 出队考察出边`,
      message: `若其后续出边能继续松弛，出边终点的边数将更新为 count[${u}] + 1。`,
      log: `Pop u=${u}, count=${count[u]}`,
      line: lines.pollNode.javascript,
      codeLine: lines.pollNode,
      metrics: { '当前出队': `Node ${u}`, '最短路边数': count[u], '剩余队规': queue.length },
      statusBadge: { text: `出队: Node ${u}`, type: 'info' },
    });

    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;

      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        count[v] = count[u] + 1;

        // 核心检测准则：如果最短路径包含 >= n 条边，说明经过了至少 n+1 个点，由抽屉原理必有重复节点，即存在负权环
        if (count[v] >= n) {
          cycleDetected = true;

          steps.push({
            nodes,
            edges,
            dist: [...dist],
            count: [...count],
            inQueue: [...inQueue],
            queue: [...queue],
            curNode: u,
            activeEdge: { from: u, to: v },
            hasCycle: true,
            decision: `🚨 负权环警报触发！顶点 Node ${v} 的最短路边数达到 ${count[v]} (≥ 顶点数 ${n})！`,
            message: `根据抽屉原理，一条包含 ≥ ${n} 条边的简单路径必然包含至少 ${n + 1} 个顶点，必有顶点被重复访问，存在无限缩短的负权环！`,
            log: `Negative cycle detected at node ${v}! count=${count[v]} >= ${n}`,
            line: lines.detectCycle.javascript,
            codeLine: lines.detectCycle,
            metrics: { '违规节点': `Node ${v}`, '累计边数': count[v], '临界上限': n },
            statusBadge: { text: '发现负权环！', type: 'danger' },
          });

          return steps;
        }

        if (!inQueue[v]) {
          queue.push(v);
          inQueue[v] = true;
        }

        steps.push({
          nodes,
          edges,
          dist: [...dist],
          count: [...count],
          inQueue: [...inQueue],
          queue: [...queue],
          curNode: u,
          activeEdge: { from: u, to: v },
          hasCycle: false,
          decision: `边 (${u} ➔ ${v}, 权重 ${w}) 松弛成功：dist[${v}]=${dist[v]}，边数 count[${v}]=${count[v]} < ${n}`,
          message: `未达到抽屉原理报警红线，Node ${v} 正常入队参与下一轮波前传递。`,
          log: `Relax (${u}->${v}, w=${w}) -> count[${v}]=${count[v]}`,
          line: lines.relaxEdge.javascript,
          codeLine: lines.relaxEdge,
          metrics: { '松弛边': `${u}➔${v}`, '最新边数': `${count[v]}/${n}`, '队列长度': queue.length },
          statusBadge: { text: `松弛: ${u}➔${v}`, type: 'success' },
        });
      }
    }
  }

  // 终态 (无负环)
  steps.push({
    nodes,
    edges,
    dist: [...dist],
    count: [...count],
    inQueue: [...inQueue],
    queue: [],
    curNode: null,
    activeEdge: null,
    hasCycle: false,
    decision: `检测完成：队列自然清空，全网所有节点的最短路边数均严格 < ${n}，图中不存在任何负权回路，判定无负权环`,
    message: `判定结果：安全图（无负权环）。`,
    log: `No negative cycle found in graph`,
    line: lines.returnResult.javascript,
    codeLine: lines.returnResult,
    metrics: { '检测结论': '无负权环', '最大路径边数': Math.max(...count) },
    statusBadge: { text: '无负权环 (安全)', type: 'success' },
  });

  return steps;
}
