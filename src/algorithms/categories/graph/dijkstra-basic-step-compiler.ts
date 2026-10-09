/**
 * 朴素 Dijkstra (O(V^2)) 步进编译器 (DijkstraBasicStepCompiler)
 * 贪心选点、邻接边松弛、距离数组实时追踪与拓扑高亮 (左程云 class061)
 */

import { StepBase } from '../../../core/step-visualizer';
import { HighlightTarget } from '../../../core/code-panel';

export interface DJBStep extends StepBase {
  nodes: number[];
  edges: { from: number; to: number; w: number }[];
  dist: number[];
  prevDist: number[];
  visited: Set<number>;
  currentNode: number | null;
  relaxEdge: { from: number; to: number } | null;
  relaxCount: number;
  action: 'init' | 'select' | 'relax' | 'skip' | 'done';
  statusText: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export const DJB_NODES = [0, 1, 2, 3, 4];
export const DJB_EDGES = [
  { from: 0, to: 1, w: 4 },
  { from: 0, to: 2, w: 1 },
  { from: 2, to: 1, w: 2 },
  { from: 1, to: 3, w: 1 },
  { from: 2, to: 3, w: 5 },
  { from: 3, to: 4, w: 3 },
];

export const DJB_NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 70, y: 130 },
  { x: 210, y: 55 },
  { x: 210, y: 205 },
  { x: 350, y: 130 },
  { x: 440, y: 130 },
];

const INF = Infinity;

export function buildDJBSteps(): DJBStep[] {
  const steps: DJBStep[] = [];
  const n = DJB_NODES.length;
  const source = 0;

  // 精准 12 处四语言映射行号字典 (cpp / java / python / javascript 数组 1-based 索引)
  const lines = {
    entry: { cpp: 1, java: 2, python: 1, javascript: 1 },
    initDist: { cpp: 2, java: 4, python: 2, javascript: 2 },
    setSrc: { cpp: 4, java: 5, python: 4, javascript: 4 },
    initVisited: { cpp: 3, java: 6, python: 3, javascript: 3 },
    forStep: { cpp: 5, java: 7, python: 5, javascript: 5 },
    initU: { cpp: 6, java: 8, python: 6, javascript: 6 },
    findMinU: { cpp: 7, java: 9, python: 7, javascript: 7 },
    checkReachable: { cpp: 9, java: 11, python: 9, javascript: 9 },
    lockU: { cpp: 10, java: 12, python: 10, javascript: 10 },
    forAdj: { cpp: 11, java: 13, python: 11, javascript: 11 },
    relaxEdge: { cpp: 13, java: 15, python: 12, javascript: 12 },
    returnDist: { cpp: 16, java: 18, python: 14, javascript: 15 },
  };

  const dist = new Array(n).fill(INF);
  dist[source] = 0;
  const visited = new Set<number>();
  let relaxCount = 0;
  let prevDistSnapshot = [...dist];

  // 邻接表
  const adj: { to: number; w: number }[][] = Array.from({ length: n }, () => []);
  for (const e of DJB_EDGES) {
    adj[e.from].push({ to: e.to, w: e.w });
  }

  function makeStep(
    codeLine: HighlightTarget,
    action: 'init' | 'select' | 'relax' | 'skip' | 'done',
    statusText: string,
    log: string,
    currentNode: number | null = null,
    relaxEdge: { from: number; to: number } | null = null
  ): void {
    const dStr = dist.map((d, i) => `${i}:${d === INF ? '∞' : d}`).join(', ');
    const visStr = visited.size > 0 ? Array.from(visited).join(', ') : '无';

    steps.push({
      nodes: DJB_NODES,
      edges: DJB_EDGES,
      dist: [...dist],
      prevDist: [...prevDistSnapshot],
      visited: new Set(visited),
      currentNode,
      relaxEdge,
      relaxCount,
      action,
      statusText,
      log,
      codeLine,
      metrics: {
        'metric-cur-node': currentNode !== null ? `${currentNode}` : '—',
        'metric-visited-nodes': `[${visStr}]`,
        'metric-relax-count': `${relaxCount}`,
        'metric-dist-info': `[${dStr}]`,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, 'init', '🚀 [算法启动] dijkstra(n=5, edges, src=0)：启动朴素 Dijkstra 最短路径算法。', 'dijkstra 入口');
  makeStep(lines.initDist, 'init', '📊 [初始化距离表] Arrays.fill(dist, INF)；除源点外全部设为正无穷。', 'init dist[]');

  dist[source] = 0;
  prevDistSnapshot = [...dist];
  makeStep(lines.setSrc, 'init', '🌱 [设置源点] dist[0] = 0；从源点 0 出发开始贪心探索。', 'dist[0] = 0');
  makeStep(lines.initVisited, 'init', '🏷️ [初始化访问标记] boolean[] visited = new boolean[5]；记录最短路已确定的点。', 'init visited[]');

  // 2. V 轮贪心探索
  for (let step = 0; step < n; step++) {
    makeStep(lines.forStep, 'select', `🔁 [外层探索轮次] 正在执行第 ${step + 1} / ${n} 次顶点锁定。`, `--- 第 ${step + 1} 轮 ---`);

    makeStep(lines.initU, 'select', '🔍 [初始化选点指针] int u = -1；准备在未访问顶点中寻找 dist 最小者。', 'u = -1');

    let u = -1;
    for (let j = 0; j < n; j++) {
      if (!visited.has(j) && (u === -1 || dist[j] < dist[u])) {
        u = j;
      }
    }
    makeStep(lines.findMinU, 'select', `💡 [贪心确定最小点] 选出未访问节点 u = ${u}，当前 dist[${u}] = ${dist[u] === INF ? '∞' : dist[u]} 为全局最小！`, `选点: u = ${u}`);

    makeStep(lines.checkReachable, 'select', `🔎 [检查连通可达性] if (dist[${u}] == INF) -> (${dist[u] === INF})。`, `check dist[${u}]`);
    if (dist[u] === INF) {
      break;
    }

    visited.add(u);
    makeStep(lines.lockU, 'select', `🔒 [锁定最短路径] visited[${u}] = true；源点到节点 ${u} 的最短路径已确定为 ${dist[u]}！`, `锁定: visited[${u}] = true`, u);

    // 松弛 u 的出边
    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;
      const canRelax = dist[u] + w < dist[v];
      const curEdge = { from: u, to: v };

      makeStep(lines.forAdj, canRelax ? 'relax' : 'skip', `  ↳ [考察出边] 考察边 (${u} ➔ ${v}, 权重 w=${w})。`, `edge (${u}->${v}, w=${w})`, u, curEdge);

      if (canRelax) {
        const oldVal = dist[v];
        dist[v] = dist[u] + w;
        relaxCount++;
        makeStep(lines.relaxEdge, 'relax', `  ⚡ [松弛更新] if (dist[${u}] + ${w} < dist[${v}]) 成立！dist[${v}] 从 ${oldVal === INF ? '∞' : oldVal} 缩短为 ${dist[v]}！`, `dist[${v}]=${dist[v]}`, u, curEdge);
        prevDistSnapshot = [...dist];
      } else {
        makeStep(lines.relaxEdge, 'skip', `  ⏭️ [跳过松弛] dist[${u}] + ${w} (${dist[u] + w}) >= dist[${v}] (${dist[v] === INF ? '∞' : dist[v]})，无需更新。`, `skip (${u}->${v})`, u, curEdge);
      }
    }
  }

  makeStep(lines.returnDist, 'done', `🎉 [Dijkstra 算法达成] return dist！全图 ${n} 个顶点的单源最短路径全部确定！结果: [${dist.join(', ')}]。`, '算法完成: 返回最短距离表');

  return steps;
}
