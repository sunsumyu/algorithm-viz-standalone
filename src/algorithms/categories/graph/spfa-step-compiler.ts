import { StepBase } from '../../../core/step-visualizer';
import { HighlightTarget } from '../../../core/code-panel';
import { BF_NODES, BF_EDGES } from './bellman-ford-step-compiler';

export interface SPFAStep extends StepBase {
  nodes: number[];
  edges: { from: number; to: number; w: number }[];
  dist: number[];
  queue: number[];
  inQueue: boolean[];
  currentNode: number | null;
  relaxEdge: { from: number; to: number; w: number } | null;
  relaxCount: number;
  action: 'init' | 'poll' | 'relax' | 'skip' | 'done';
  statusText: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

const INF = Infinity;

export function buildSPFASteps(): SPFAStep[] {
  const steps: SPFAStep[] = [];
  const n = BF_NODES.length;
  const source = 0;

  // 精准 16 处四语言映射行号字典 (cpp / java / python / javascript 数组 1-based 索引)
  const lines = {
    entry: { cpp: 1, java: 2, python: 1, javascript: 1 },
    initDist: { cpp: 2, java: 4, python: 2, javascript: 2 },
    setSrc: { cpp: 4, java: 5, python: 4, javascript: 4 },
    initInQueue: { cpp: 3, java: 6, python: 3, javascript: 3 },
    initQueue: { cpp: 5, java: 7, python: 5, javascript: 5 },
    pushSrc: { cpp: 6, java: 8, python: 5, javascript: 5 },
    setSrcInQueue: { cpp: 7, java: 9, python: 6, javascript: 6 },
    whileQueue: { cpp: 8, java: 10, python: 7, javascript: 7 },
    pollQueue: { cpp: 9, java: 11, python: 8, javascript: 8 },
    clearInQueue: { cpp: 10, java: 12, python: 9, javascript: 9 },
    forAdj: { cpp: 11, java: 13, python: 10, javascript: 10 },
    checkRelax: { cpp: 12, java: 15, python: 11, javascript: 11 },
    updateDist: { cpp: 13, java: 16, python: 12, javascript: 12 },
    checkInQueue: { cpp: 14, java: 17, python: 13, javascript: 13 },
    pushQueue: { cpp: 15, java: 18, python: 14, javascript: 14 },
    returnDist: { cpp: 21, java: 24, python: 16, javascript: 20 },
  };

  const dist = new Array(n).fill(INF);
  dist[source] = 0;
  const inQueue = new Array(n).fill(false);
  const queue: number[] = [source];
  inQueue[source] = true;
  let relaxCount = 0;

  // Build adjacency list
  const adj: { to: number; w: number }[][] = Array.from({ length: n }, () => []);
  for (const e of BF_EDGES) {
    adj[e.from].push({ to: e.to, w: e.w });
  }

  function makeStep(
    codeLine: HighlightTarget,
    action: 'init' | 'poll' | 'relax' | 'skip' | 'done',
    statusText: string,
    log: string,
    currentNode: number | null = null,
    relaxEdge: { from: number; to: number; w: number } | null = null
  ): void {
    const qStr = queue.length > 0 ? `[${queue.join(', ')}]` : '[]';
    const dStr = dist.map((d, i) => `${i}:${d === INF ? '∞' : d}`).join(', ');

    steps.push({
      nodes: BF_NODES,
      edges: BF_EDGES,
      dist: [...dist],
      queue: [...queue],
      inQueue: [...inQueue],
      currentNode,
      relaxEdge,
      relaxCount,
      action,
      statusText,
      log,
      codeLine,
      metrics: {
        'metric-spfa-queue': qStr,
        'metric-spfa-cur': currentNode !== null ? `${currentNode}` : '—',
        'metric-spfa-relax': `${relaxCount}`,
        'metric-spfa-dist': `[${dStr}]`,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, 'init', '🚀 [算法启动] spfa(n=5, adj, src=0)：初始化 SPFA 队列优化最短路。', 'spfa 入口');
  makeStep(lines.initDist, 'init', '📊 [初始化距离表] Arrays.fill(dist, INF)；除源点外初始距离为无穷大。', 'init dist[]');
  makeStep(lines.setSrc, 'init', '🌱 [设置源点距离] dist[0] = 0。', 'dist[0] = 0');
  makeStep(lines.initInQueue, 'init', '🏷️ [初始化在队标记] boolean[] inQueue = new boolean[5]；防止重复入队。', 'init inQueue[]');
  makeStep(lines.initQueue, 'init', '📦 [初始化队列] Queue<Integer> queue = new LinkedList<>()。', 'init queue');
  makeStep(lines.pushSrc, 'init', '📥 [源点入队] queue.offer(0)；源点进入待松弛波前。', 'queue.offer(0)');
  makeStep(lines.setSrcInQueue, 'init', '🏷️ [标记源点在队] inQueue[0] = true。', 'inQueue[0] = true');

  // 2. 队列主循环
  while (queue.length > 0) {
    makeStep(lines.whileQueue, 'init', `🔁 [检查队列] while (!queue.isEmpty()) -> 当前就绪队列: [${queue.join(', ')}]。`, '!queue.isEmpty()');

    const u = queue.shift()!;
    makeStep(lines.pollQueue, 'poll', `📤 [出队推进] int u = queue.poll() -> 弹出节点 ${u}。`, `poll node ${u}`, u);

    inQueue[u] = false;
    makeStep(lines.clearInQueue, 'poll', `🏷️ [清除在队标记] inQueue[${u}] = false；节点 ${u} 出队后可再次接收松弛。`, `inQueue[${u}] = false`, u);

    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;
      const curEdge = { from: u, to: v, w };

      makeStep(lines.forAdj, 'skip', `  ↳ [遍历出边] 考察边 (${u} ➔ ${v}, 权值 w=${w})。`, `edge (${u}->${v}, w=${w})`, u, curEdge);

      const canRelax = dist[u] !== INF && dist[u] + w < dist[v];
      makeStep(lines.checkRelax, canRelax ? 'relax' : 'skip', `  🔎 [松弛检验] if (dist[${u}](${dist[u]}) + ${w} < dist[${v}](${dist[v] === INF ? '∞' : dist[v]})) -> (${canRelax})。`, `check relax ${u}->${v}`, u, curEdge);

      if (canRelax) {
        const oldDist = dist[v];
        dist[v] = dist[u] + w;
        relaxCount++;

        makeStep(lines.updateDist, 'relax', `  ⚡ [更新距离] 成功松弛！dist[${v}] 从 ${oldDist === INF ? '∞' : oldDist} 缩短为 ${dist[v]}！`, `dist[${v}]=${dist[v]}`, u, curEdge);

        makeStep(lines.checkInQueue, 'relax', `  🔎 [检查是否在队] if (!inQueue[${v}]) -> (${!inQueue[v]})。`, `!inQueue[${v}]?`, u, curEdge);
        if (!inQueue[v]) {
          queue.push(v);
          inQueue[v] = true;
          makeStep(lines.pushQueue, 'relax', `  📥 [触发入队] 节点 ${v} 距离被优化，queue.offer(${v}), inQueue[${v}] = true！`, `offer ${v}`, u, curEdge);
        }
      } else {
        makeStep(lines.checkRelax, 'skip', `  ⏭️ [跳过边] 边 (${u} ➔ ${v}) 不满足松弛条件。`, `skip ${u}->${v}`, u, curEdge);
      }
    }
  }

  makeStep(lines.whileQueue, 'init', '🔁 [检查队列] while (!queue.isEmpty()) -> (false，队列已清空)。', 'queue empty');
  makeStep(lines.returnDist, 'done', `🎉 [SPFA 算法达成] return dist！队列已完全收敛，总松弛次数: ${relaxCount}。最终最短路: [${dist.join(', ')}]。`, 'return dist');

  return steps;
}
