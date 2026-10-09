import { HighlightTarget } from '../../../core/code-panel';
import { StepBase } from '../../../core/step-visualizer';

export interface BFS01Step extends StepBase {
  dequeList: Array<{ u: number; dist: number }>;
  distMap: Record<number, number>;
  curU: number;
  activeEdge?: { u: number; v: number; w: number };
  shortestPath?: number[];
  distArray: number[];
  dequeArray: number[];
  activeArray?: 'dist' | 'deque';
  activeSlot?: number;
  status: 'init' | 'pop' | 'relax0' | 'relax1' | 'skip' | 'target' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildBFS01Steps(preset: string = 'classic_5node'): BFS01Step[] {
  const steps: BFS01Step[] = [];
  const is5Node = preset === 'classic_5node';
  const n = is5Node ? 5 : 4;
  const src = 1;
  const target = n;

  const edges: Array<{ u: number; v: number; w: number }> = is5Node
    ? [
        { u: 1, v: 2, w: 0 },
        { u: 1, v: 3, w: 1 },
        { u: 2, v: 4, w: 1 },
        { u: 3, v: 4, w: 0 },
        { u: 4, v: 5, w: 0 },
      ]
    : [
        { u: 1, v: 2, w: 0 },
        { u: 1, v: 3, w: 1 },
        { u: 2, v: 4, w: 1 },
        { u: 3, v: 4, w: 0 },
      ];

  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n + 1 }, () => []);
  for (const e of edges) {
    adj[e.u].push({ to: e.v, w: e.w });
  }

  const dist: number[] = new Array(n + 1).fill(Infinity);
  const pre: number[] = new Array(n + 1).fill(0);
  const deque: Array<{ u: number; dist: number }> = [];
  let curU = src;
  let activeEdge: { u: number; v: number; w: number } | undefined = undefined;

  // 精准 16 处四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    entry: { cpp: 18, java: 9, python: 8, javascript: 2 },
    initDist: { cpp: 20, java: 11, python: 10, javascript: 7 },
    initFillDist: { cpp: 20, java: 12, python: 10, javascript: 8 },
    initDeque: { cpp: 21, java: 16, python: 11, javascript: 9 },
    initSrcDist: { cpp: 23, java: 17, python: 12, javascript: 10 },
    pushSrc: { cpp: 24, java: 18, python: 12, javascript: 11 },
    whileDeque: { cpp: 29, java: 22, python: 17, javascript: 13 },
    pollNode: { cpp: 30, java: 23, python: 18, javascript: 14 },
    checkTarget: { cpp: 33, java: 26, python: 19, javascript: 16 },
    loopEdges: { cpp: 35, java: 28, python: 22, javascript: 18 },
    checkRelax: { cpp: 40, java: 33, python: 26, javascript: 20 },
    applyRelax: { cpp: 41, java: 34, python: 27, javascript: 21 },
    checkWeightZero: { cpp: 36, java: 35, python: 28, javascript: 22 },
    pushFront: { cpp: 37, java: 36, python: 29, javascript: 23 },
    pushBack: { cpp: 39, java: 38, python: 31, javascript: 25 },
    returnAns: { cpp: 44, java: 44, python: 33, javascript: 30 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init' | 'pop' | 'relax0' | 'relax1' | 'skip' | 'target' | 'done',
    activeArray?: 'dist' | 'deque',
    activeSlot?: number
  ): void {
    const dMap: Record<number, number> = {};
    for (let i = 1; i <= n; i++) dMap[i] = dist[i];

    const curStr = status === 'done' ? `到达终点 Node ${target}` : `Node ${curU} (d:${dist[curU] === Infinity ? '∞' : dist[curU]})`;
    const targetDistStr = dist[target] === Infinity ? '∞' : `${dist[target]}`;

    const phaseStr =
      status === 'done'
        ? '0-1 BFS 最短路完成'
        : status === 'relax0'
          ? '0 权边插队头 (addFirst)'
          : status === 'relax1'
            ? '1 权边插队尾 (addLast)'
            : status === 'pop'
              ? '队头出队 (pollFirst)'
              : '算法初始化';

    let shortestPath: number[] | undefined = undefined;
    if (status === 'done') {
      let curr = target;
      shortestPath = [];
      while (curr !== 0) {
        shortestPath.unshift(curr);
        curr = pre[curr];
      }
    }

    const distSlice: number[] = [];
    for (let i = 1; i <= n; i++) distSlice.push(dist[i] === Infinity ? 999 : dist[i]);

    steps.push({
      dequeList: deque.map((x) => ({ ...x })),
      distMap: dMap,
      curU,
      activeEdge,
      shortestPath,
      distArray: distSlice,
      dequeArray: deque.map((x) => x.u),
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-bfs01-node': curStr,
        'metric-bfs01-dist': `终点距离: ${targetDistStr}`,
        'metric-deque-size': `${deque.length} 个就绪元素`,
        'metric-bfs01-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, `🚀 [算法初始化] minimumObstacles(n=${n}, src=1, target=${target})：开启 0-1 双端队列 BFS。`, '启动 0-1 BFS 最短路', 'init');
  makeStep(lines.initDist, `📊 [分配距离数组] int[] distance = new int[${n + 1}]；全部填充为无穷大 ∞。`, '初始化距离数组 distance 为无穷大', 'init', 'dist');

  makeStep(lines.initDeque, '📦 [初始化双端队列] ArrayDeque<int[]> deque = new ArrayDeque<>()；用于维护两段性单调队列。', '初始化双端队列 deque', 'init', 'deque');

  dist[src] = 0;
  makeStep(lines.initSrcDist, `🌱 [设置起点距离] distance[${src}] = 0；起点初始距离为 0。`, `置起点距离 distance[${src}] = 0`, 'init', 'dist', src - 1);

  deque.push({ u: src, dist: 0 });
  makeStep(lines.pushSrc, `📥 [起点入队头] deque.addFirst([node=${src}, dist=0])；起点就绪！`, `起点节点 ${src} 入队头 addFirst`, 'init', 'deque', 0);

  // 2. 0-1 BFS 主循环
  while (deque.length > 0) {
    makeStep(lines.whileDeque, `🔁 [检查队列非空] while (!deque.isEmpty()) -> 当前双端队列长度: ${deque.length}。`, `检查双端队列非空 (长度 ${deque.length})`, 'pop');

    const top = deque.shift()!;
    curU = top.u;
    const curDist = top.dist;

    makeStep(lines.pollNode, `📤 [弹出队头最小距离点] pollFirst() -> 节点 ${curU} (当前距离 d = ${curDist})！`, `弹出队头最小距离节点 ${curU}`, 'pop', 'deque', 0);

    makeStep(lines.checkTarget, `🎯 [终点核验] if (u == target) -> (${curU} == ${target})。`, `核验当前节点是否为终点 ${target}`, 'target');
    if (curU === target) {
      makeStep(lines.checkTarget, `🏆 [抵达目标终点] 成功到达终点节点 ${target}！当前最短距离锁定为 ${dist[target]}！`, `到达终点节点 ${target}`, 'target');
      break;
    }

    for (const e of adj[curU]) {
      const v = e.to;
      const w = e.w;
      activeEdge = { u: curU, v, w };

      makeStep(lines.loopEdges, `  ↳ [遍历出边] 考察边 (${curU} ➔ ${v}, 权重 ${w})。`, `遍历出边 (${curU} ➔ ${v}, 权值 ${w})`, 'pop');

      makeStep(lines.checkRelax, `  🔎 [松弛检验] if (distance[${v}] > distance[${curU}] + ${w}) -> (${dist[v] === Infinity ? '∞' : dist[v]} > ${dist[curU] + w})。`, `松弛检验出边 (${curU} ➔ ${v})`, 'pop');

      if (dist[v] > dist[curU] + w) {
        dist[v] = dist[curU] + w;
        pre[v] = curU;
        makeStep(lines.applyRelax, `  ⚡ [更新到达距离] 发现更优路径！distance[${v}] = ${dist[v]}！`, `更新到达距离 distance[${v}] = ${dist[v]}`, 'pop', 'dist', v - 1);

        makeStep(lines.checkWeightZero, `  ⚖️ [边权分流判定] if (weight == 0) -> (权重为 ${w})。`, `判定边权是否为 0 (当前权值 ${w})`, 'pop');

        if (w === 0) {
          deque.unshift({ u: v, dist: dist[v] });
          makeStep(lines.pushFront, `  🚀 [0 权插队头] 零权无需耗费代价！调用 deque.addFirst(${v}) 插队头，维持严格单调递增！`, `零权边插队头 addFirst(${v})`, 'relax0', 'deque', 0);
        } else {
          deque.push({ u: v, dist: dist[v] });
          makeStep(lines.pushBack, `  🐢 [1 权插队尾] 权值为 1 耗费代价！调用 deque.addLast(${v}) 插队尾，自然维持两段性 [d, d+1]！`, `一权边插队尾 addLast(${v})`, 'relax1', 'deque', deque.length - 1);
        }
      }
    }
    activeEdge = undefined;
  }

  makeStep(lines.returnAns, `🎉 [0-1 BFS 最短路完成] return distance[${target}] = ${dist[target]}！全过程无堆调整开销，严格 O(V + E)！`, `返回终点最短距离 distance[${target}] = ${dist[target]}`, 'done');

  return steps;
}
