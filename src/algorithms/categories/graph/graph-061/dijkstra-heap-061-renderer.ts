/**
 * 左程云算法通关课 Class 061: 堆优化 Dijkstra 算法 (Dijkstra Heap · O(E log V))
 * 优先队列小根堆维护波前、惰性删除策略与稀疏图高效求解
 *
 * 🏆 架构收拢与单一事实来源 (Single Source of Truth & Bi-Version Synthesis):
 * 深度综合整合：
 * 1. 经典版本的优先队列状态、拓扑连通图 (sparse_5nodes, branch_6nodes)；
 * 2. 声明式规范、名师讲义与四语言 1-based 精准行号联动。
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GRAPH_061_PROBLEMS } from './graph-061-problem-content';
import {
  DIJKSTRA_HEAP_061_CODES,
  DIJKSTRA_HEAP_061_LINES,
} from './graph-061-stage-codes';
import {
  Graph061StepBase,
  renderGraph061SvgTopology,
  renderGraph061DistGrid,
  renderGraph061PriorityQueue,
  Graph061NodeCoord,
} from './graph-061-shared';

export interface DijkstraHeapStep extends Graph061StepBase {
  nodes: Graph061NodeCoord[];
  edges: Array<{ from: number; to: number; w: number }>;
  dist: number[];
  visited: boolean[];
  curNode: number | null;
  pqSnapshot: Array<{ u: number; d: number }>;
  activeEdge?: { from: number; to: number } | null;
}

const DEFAULT_HEAP_NODES: Graph061NodeCoord[] = [
  { id: 0, x: 70, y: 110, label: '0(源)' },
  { id: 1, x: 200, y: 50 },
  { id: 2, x: 200, y: 170 },
  { id: 3, x: 330, y: 110 },
  { id: 4, x: 430, y: 110 },
];

const DEFAULT_HEAP_EDGES = [
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

  let nodes = DEFAULT_HEAP_NODES;
  let edges = DEFAULT_HEAP_EDGES;

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
    log: `Init dist[${s}]=0, push (0, ${s})`,
    codeLine: lines.init,
    metrics: { '源点': `Node ${s}`, '堆规模': 1, '时间复杂度': 'O(E log V)' },
    statusBadge: { text: `源点就绪: Node ${s}`, type: 'info' },
  });

  while (pq.length > 0) {
    pq.sort((a, b) => a.d - b.d);
    const { u, d } = pq.shift()!;

    if (visited[u]) {
      steps.push({
        nodes,
        edges,
        dist: [...dist],
        visited: [...visited],
        curNode: u,
        pqSnapshot: [...pq],
        activeEdge: null,
        decision: `弹出顶点 Node ${u}，但该点先前已被锁定收敛 (visited[${u}]=true)，执行惰性丢弃`,
        message: `同一个点可能因多次松弛在堆中有多个副本，非全局最优的副本被丢弃。`,
        log: `Lazy delete duplicate -> Node ${u}`,
        codeLine: lines.skipVisited,
        metrics: { '当前节点': `Node ${u}`, '状态': '惰性丢弃' },
        statusBadge: { text: `跳过副本: N${u}`, type: 'warning' },
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
      decision: `堆顶贪心弹出全局最小距离点 Node ${u} (dist=${d})，成功锁定最短路`,
      message: `该点距离已确定，开始向外出边发起波前扩散。`,
      log: `Poll min -> Node ${u} with dist=${d}`,
      codeLine: lines.lockNode,
      metrics: { '锁定节点': `Node ${u}`, '最短距离': d, '堆剩余元素': pq.length },
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
          decision: `沿出边 (${u} ➔ ${v}, 权重 ${w}) 松弛成功：dist[${v}] 更新为 ${dist[v]} 并入堆`,
          message: `发现更短路径，新状态 (Node ${v}, dist=${dist[v]}) 推入优先队列。`,
          log: `Relax (${u}->${v}) -> dist[${v}]=${dist[v]}`,
          codeLine: lines.relaxEdge,
          metrics: { '松弛边': `${u}➔${v}`, '新距离': dist[v], '堆规模': pq.length },
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
    pqSnapshot: [],
    activeEdge: null,
    decision: `堆优化 Dijkstra 算法执行完毕：堆已排空，源点到所有顶点的最短路全部求得`,
    message: `最终距离向量：[${dist.map((x) => (x === Infinity ? '∞' : x)).join(', ')}]。`,
    log: `Dijkstra heap finished -> dist=[${dist.join(', ')}]`,
    codeLine: lines.returnDist,
    metrics: { '全局最短路': dist.join(', '), '算法状态': '100% 收敛' },
    statusBadge: { text: '计算完成', type: 'success' },
  });

  return steps;
}

export const dijkstraHeap061Visualizer = registerDeclarativeAlgorithm<DijkstraHeapStep>({
  id: 'dijkstra-heap-061',
  aliases: ['dijkstra-heap', 'class061-code02', 'dijkstra-priority-queue'],
  name: 'Dijkstra 堆优化最短路算法 (Class 061)',
  category: 'graph',
  icon: '⛰️',
  difficulty: 2,
  levelOrder: 6102,
  learningGoal: '掌握优先队列小根堆维护波前、惰性删除策略与稀疏图高效求解',
  problemHtml: GRAPH_061_PROBLEMS.dijkstraHeap061.html,
  codeLanguages: DIJKSTRA_HEAP_061_CODES,
  inputs: [
    {
      id: 'preset',
      label: '拓扑预设选择',
      type: 'select',
      defaultValue: 'sparse_5nodes',
      options: [
        { label: '5 节点稀疏拓扑图 (典型稀疏网)', value: 'sparse_5nodes' },
        { label: '6 节点双分支网络 (双通道寻优)', value: 'branch_6nodes' },
      ],
    },
  ],
  presets: [
    { label: '5 节点稀疏图', values: { preset: 'sparse_5nodes' } },
    { label: '6 节点双分支图', values: { preset: 'branch_6nodes' } },
  ],
  generateSteps: (inputs) => buildDijkstraHeap061Steps(inputs?.preset),
  renderCanvas: (container, step) => {
    const pqItems = step.pqSnapshot.map((x) => ({
      label: `Node ${x.u}`,
      priority: `${x.d}`,
      highlight: step.curNode === x.u,
    }));

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 12px; gap: 10px;">
        ${renderGraph061SvgTopology(step.nodes, step.edges, {
          currentNode: step.curNode,
          visitedNodes: step.visited,
          activeEdge: step.activeEdge,
          distMap: step.dist,
        })}
        <div style="display: flex; gap: 10px; width: 100%; max-width: 520px; flex-wrap: wrap; justify-content: center;">
          ${renderGraph061DistGrid(step.dist, step.visited, step.curNode, '全网节点距离表 dist[]')}
          <div style="width: 100%;">
            ${renderGraph061PriorityQueue(pqItems, '小根堆优先队列波前')}
          </div>
        </div>
      </div>
    `;
  },
});
