/**
 * 堆优化 Dijkstra (O(E log V)) 步进编译器 (DijkstraHeapStepCompiler)
 * 优先队列动态提取、惰性丢弃、邻接边松弛与拓扑高亮 (左程云 class061)
 */

import { StepBase } from '../../../core/step-visualizer';
import { HighlightTarget } from '../../../core/code-panel';
import { DJB_NODES, DJB_EDGES } from './dijkstra-basic-step-compiler';

export interface DJHStep extends StepBase {
  nodes: number[];
  edges: { from: number; to: number; w: number }[];
  dist: number[];
  pq: { d: number; u: number }[];
  currentNode: number | null;
  currentDist: number | null;
  relaxEdge: { from: number; to: number } | null;
  relaxCount: number;
  action: 'init' | 'poll' | 'skip-lazy' | 'relax' | 'skip' | 'done';
  statusText: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

const INF = Infinity;

export function buildDJHSteps(): DJHStep[] {
  const steps: DJHStep[] = [];
  const n = DJB_NODES.length;
  const source = 0;

  // 精准 15 处四语言映射行号字典 (cpp / java / python / javascript 数组 1-based 索引)
  const lines = {
    entry: { cpp: 1, java: 2, python: 1, javascript: 1 },
    initDist: { cpp: 2, java: 4, python: 2, javascript: 2 },
    setSrc: { cpp: 3, java: 5, python: 3, javascript: 3 },
    initPQ: { cpp: 4, java: 6, python: 4, javascript: 4 },
    pushSrc: { cpp: 5, java: 7, python: 4, javascript: 4 },
    whilePQ: { cpp: 6, java: 8, python: 5, javascript: 5 },
    pollPQ: { cpp: 7, java: 9, python: 6, javascript: 7 },
    unpackCur: { cpp: 7, java: 10, python: 6, javascript: 7 },
    checkLazy: { cpp: 8, java: 11, python: 7, javascript: 8 },
    forAdj: { cpp: 9, java: 12, python: 9, javascript: 9 },
    unpackEdge: { cpp: 9, java: 13, python: 9, javascript: 9 },
    checkRelax: { cpp: 10, java: 14, python: 10, javascript: 10 },
    updateDist: { cpp: 11, java: 15, python: 11, javascript: 11 },
    pushPQ: { cpp: 12, java: 16, python: 12, javascript: 12 },
    returnDist: { cpp: 16, java: 20, python: 13, javascript: 16 },
  };

  const dist = new Array(n).fill(INF);
  dist[source] = 0;
  let relaxCount = 0;

  // Build adjacency list
  const adj: { to: number; w: number }[][] = Array.from({ length: n }, () => []);
  for (const e of DJB_EDGES) {
    adj[e.from].push({ to: e.to, w: e.w });
  }

  // Priority Queue: min-heap of {d, u}
  const pq: { d: number; u: number }[] = [{ d: 0, u: source }];

  function makeStep(
    codeLine: HighlightTarget,
    action: 'init' | 'poll' | 'skip-lazy' | 'relax' | 'skip' | 'done',
    statusText: string,
    log: string,
    currentNode: number | null = null,
    currentDist: number | null = null,
    relaxEdge: { from: number; to: number } | null = null
  ): void {
    const dStr = dist.map((d, i) => `${i}:${d === INF ? '∞' : d}`).join(', ');

    steps.push({
      nodes: DJB_NODES,
      edges: DJB_EDGES,
      dist: [...dist],
      pq: pq.map((item) => ({ ...item })),
      currentNode,
      currentDist,
      relaxEdge,
      relaxCount,
      action,
      statusText,
      log,
      codeLine,
      metrics: {
        'metric-cur-extract': currentNode !== null ? `(d=${currentDist}, u=${currentNode})` : '—',
        'metric-pq-size': `${pq.length}`,
        'metric-relax-count': `${relaxCount}`,
        'metric-dist-info': `[${dStr}]`,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, 'init', '🚀 [算法启动] dijkstraHeap(n=5, adj, src=0)：启动堆优化 Dijkstra 算法。', 'dijkstraHeap 入口');
  makeStep(lines.initDist, 'init', '📊 [初始化距离表] Arrays.fill(dist, INF)；除源点外全部设为正无穷。', 'init dist[]');

  dist[source] = 0;
  makeStep(lines.setSrc, 'init', '🌱 [设置源点距离] dist[0] = 0。', 'dist[0] = 0');
  makeStep(lines.initPQ, 'init', '📦 [初始化小顶堆] PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0])。', 'init PriorityQueue');
  makeStep(lines.pushSrc, 'init', '📥 [源点入堆] pq.offer(new int[]{0, 0})；初始二元组 (d=0, u=0) 进堆。', 'pq.offer({0, 0})');

  // 2. 堆非空主循环
  while (pq.length > 0) {
    makeStep(lines.whilePQ, 'init', `🔁 [检查堆状态] while (!pq.isEmpty()) -> 当前堆大小: ${pq.length}。`, '!pq.isEmpty()');

    // 小顶堆弹出最小值
    pq.sort((a, b) => a.d - b.d);
    const top = pq.shift()!;
    const { d, u } = top;

    makeStep(lines.pollPQ, 'poll', `📤 [弹出堆顶] int[] cur = pq.poll() -> 提取出当前距离最小的二元组 (d=${d}, u=${u})。`, `poll ({d:${d}, u:${u}})`, u, d);
    makeStep(lines.unpackCur, 'poll', `  ↳ [解构二元组] 当前探索节点 u=${u}，出堆距离标号 d=${d}。`, `d=${d}, u=${u}`, u, d);

    // 惰性删除检查
    const isLazy = d > dist[u];
    makeStep(lines.checkLazy, isLazy ? 'skip-lazy' : 'poll', `  🔎 [惰性删除检查] if (d > dist[u]) -> (${d} > ${dist[u]}) -> (${isLazy})。`, `lazy check ${d} > ${dist[u]}`, u, d);

    if (isLazy) {
      makeStep(lines.checkLazy, 'skip-lazy', `  🗑️ [惰性丢弃] 节点 ${u} 的该距离标号 (d=${d}) 大于全局最优 dist[${u}] (${dist[u]})，为历史过期冗余，直接丢弃！`, `lazy drop ${u}`, u, d);
      continue;
    }

    // 遍历邻接边
    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;
      const canRelax = dist[u] + w < dist[v];
      const curEdge = { from: u, to: v };

      makeStep(lines.forAdj, canRelax ? 'relax' : 'skip', `  ↳ [遍历出边] 考察边 (${u} ➔ ${v}, 权重 w=${w})。`, `edge (${u}->${v}, w=${w})`, u, d, curEdge);
      makeStep(lines.unpackEdge, canRelax ? 'relax' : 'skip', `    ↳ [解构目标] 目标邻居 v=${v}，边权 w=${w}。`, `v=${v}, w=${w}`, u, d, curEdge);

      makeStep(lines.checkRelax, canRelax ? 'relax' : 'skip', `    🔎 [松弛核验] if (dist[${u}](${dist[u]}) + ${w} < dist[${v}](${dist[v] === INF ? '∞' : dist[v]})) -> (${canRelax})。`, `check relax ${u}->${v}`, u, d, curEdge);

      if (canRelax) {
        const oldVal = dist[v];
        dist[v] = dist[u] + w;
        relaxCount++;
        makeStep(lines.updateDist, 'relax', `    ⚡ [更新距离] 成功松弛！dist[${v}] 从 ${oldVal === INF ? '∞' : oldVal} 缩短为 ${dist[v]}！`, `dist[${v}]=${dist[v]}`, u, d, curEdge);

        pq.push({ d: dist[v], u: v });
        makeStep(lines.pushPQ, 'relax', `    📥 [推入优先队列] pq.offer(new int[]{${dist[v]}, ${v}})；新最优距离入堆排队。`, `offer ({d:${dist[v]}, u:${v}})`, u, d, curEdge);
      } else {
        makeStep(lines.checkRelax, 'skip', `    ⏭️ [跳过边] 边 (${u} ➔ ${v}) 不满足三角不等式缩短条件。`, `skip (${u}->${v})`, u, d, curEdge);
      }
    }
  }

  makeStep(lines.whilePQ, 'init', '🔁 [检查堆状态] while (!pq.isEmpty()) -> (false，堆已清空)。', 'pq empty');
  makeStep(lines.returnDist, 'done', `🎉 [堆优化 Dijkstra 算法达成] return dist！全图 ${n} 个顶点的单源最短路径全部求得！结果: [${dist.join(', ')}]。`, 'return dist');

  return steps;
}
