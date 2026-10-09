/**
 * 分层图最短路 (Layered Dijkstra - 洛谷 P4568 飞行路线) 步进编译器 (Deep Module)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：状态升维 (u, usedK) 分层图建模、同层常规转移与跨层 0 权免票跃迁推演、四语言行号联动
 */

import { HighlightTarget } from '../../../core/code-panel';

export interface LayeredGraphPreset {
  name: string;
  n: number;
  k: number;
  s: number;
  t: number;
  edges: Array<{ u: number; v: number; w: number }>;
  nodeCoords: Record<number, { x: number; y0: number; y1: number }>;
}

export const LAYERED_PRESETS: Record<string, LayeredGraphPreset> = {
  p4568_standard: {
    name: '洛谷 P4568 经典 5 城市 (1 次免票)',
    n: 5,
    k: 1,
    s: 0,
    t: 4,
    edges: [
      { u: 0, v: 1, w: 2 },
      { u: 0, v: 2, w: 5 },
      { u: 1, v: 2, w: 2 },
      { u: 1, v: 3, w: 4 },
      { u: 2, v: 3, w: 1 },
      { u: 2, v: 4, w: 7 },
      { u: 3, v: 4, w: 3 },
    ],
    nodeCoords: {
      0: { x: 35, y0: 55, y1: 155 },
      1: { x: 95, y0: 30, y1: 130 },
      2: { x: 95, y0: 80, y1: 180 },
      3: { x: 175, y0: 55, y1: 155 },
      4: { x: 255, y0: 55, y1: 155 },
    },
  },
  simple_3node: {
    name: '3 城市入门双层图 (1 次免票)',
    n: 3,
    k: 1,
    s: 0,
    t: 2,
    edges: [
      { u: 0, v: 1, w: 5 },
      { u: 1, v: 2, w: 2 },
      { u: 0, v: 2, w: 9 },
    ],
    nodeCoords: {
      0: { x: 50, y0: 55, y1: 155 },
      1: { x: 150, y0: 55, y1: 155 },
      2: { x: 250, y0: 55, y1: 155 },
    },
  },
};

export interface LayeredStep {
  curNode: number;
  curK: number;
  curDist: number;
  distGrid: Record<string, number>;
  pqList: Array<{ u: number; used: number; cost: number }>;
  visitedSet: string[];
  highlightEdge?: { u: number; v: number; fromK: number; toK: number; isFree: boolean } | null;
  pathEdgeKeys?: string[];
  status: 'init' | 'pop' | 'relax_edge' | 'reach' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildLayeredDijkstraSteps(presetKey: string = 'p4568_standard'): LayeredStep[] {
  const config = LAYERED_PRESETS[presetKey] || LAYERED_PRESETS.p4568_standard;
  const { n, k, s, t, edges } = config;
  const steps: LayeredStep[] = [];

  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n }, () => []);
  for (const e of edges) {
    adj[e.u].push({ to: e.v, w: e.w });
    adj[e.v].push({ to: e.u, w: e.w });
  }

  const dist: number[][] = Array.from({ length: n }, () => Array(k + 1).fill(Infinity));
  const visited: boolean[][] = Array.from({ length: n }, () => Array(k + 1).fill(false));
  const parent: Record<string, { u: number; used: number; fromEdgeW: number; isFree: boolean } | null> = {};

  const pq: Array<{ u: number; used: number; cost: number }> = [];

  function pushPq(u: number, used: number, cost: number): void {
    pq.push({ u, used, cost });
    pq.sort((a, b) => a.cost - b.cost);
  }

  function pollPq(): { u: number; used: number; cost: number } {
    return pq.shift()!;
  }

  function getSnapshotDist(): Record<string, number> {
    const res: Record<string, number> = {};
    for (let u = 0; u < n; u++) {
      for (let j = 0; j <= k; j++) {
        if (dist[u][j] !== Infinity) {
          res[`${u},${j}`] = dist[u][j];
        }
      }
    }
    return res;
  }

  function getVisitedKeys(): string[] {
    const res: string[] = [];
    for (let u = 0; u < n; u++) {
      for (let j = 0; j <= k; j++) {
        if (visited[u][j]) res.push(`${u},${j}`);
      }
    }
    return res;
  }

  function reconstructPathKeys(finalState: { u: number; used: number }): string[] {
    const keys: string[] = [];
    let cur: { u: number; used: number } | null = finalState;
    while (cur) {
      const prevNode: { u: number; used: number; fromEdgeW: number; isFree: boolean } | null | undefined = parent[`${cur.u},${cur.used}`];
      if (!prevNode) break;
      keys.push(`${prevNode.u},${prevNode.used}->${cur.u},${cur.used}`);
      cur = { u: prevNode.u, used: prevNode.used };
    }
    return keys;
  }

  const lines = {
    initDist: { cpp: 18, java: 18, python: 13, javascript: 14 },
    initSrc: { cpp: 23, java: 23, python: 17, javascript: 18 },
    pushSrc: { cpp: 24, java: 24, python: 18, javascript: 19 },
    whilePq: { cpp: 26, java: 26, python: 20, javascript: 21 },
    poll: { cpp: 27, java: 27, python: 21, javascript: 22 },
    checkVisited: { cpp: 31, java: 31, python: 25, javascript: 26 },
    markVisited: { cpp: 32, java: 32, python: 26, javascript: 27 },
    checkTarget: { cpp: 34, java: 34, python: 28, javascript: 29 },
    loopEdges: { cpp: 36, java: 36, python: 30, javascript: 31 },
    sameLayerRelax: { cpp: 38, java: 38, python: 32, javascript: 33 },
    pushSame: { cpp: 40, java: 40, python: 34, javascript: 35 },
    crossLayerCheck: { cpp: 43, java: 43, python: 37, javascript: 38 },
    crossLayerRelax: { cpp: 44, java: 44, python: 38, javascript: 39 },
    pushCross: { cpp: 46, java: 46, python: 40, javascript: 41 },
    returnAns: { cpp: 50, java: 50, python: 43, javascript: 44 },
  };

  let optimalFinalState: { u: number; used: number } | null = null;

  function makeStep(
    curNode: number,
    curK: number,
    curDist: number,
    codeLine: HighlightTarget,
    status: 'init' | 'pop' | 'relax_edge' | 'reach' | 'done',
    message: string,
    log: string,
    highlightEdge?: { u: number; v: number; fromK: number; toK: number; isFree: boolean } | null
  ): void {
    const curPqSnapshot = pq.map((x) => ({ ...x }));
    const distGrid = getSnapshotDist();
    const visitedSet = getVisitedKeys();
    const pathEdgeKeys = optimalFinalState ? reconstructPathKeys(optimalFinalState) : undefined;

    const curStateStr = `(Node ${curNode}, usedK=${curK})`;
    const phaseStr =
      status === 'done'
        ? '分层最短路收敛'
        : status === 'reach'
          ? '到达目的地城市'
          : status === 'relax_edge'
            ? '边松弛(购票/免票)'
            : status === 'pop'
              ? '堆顶状态出堆'
              : '状态空间初始化';

    steps.push({
      curNode,
      curK,
      curDist,
      distGrid,
      pqList: curPqSnapshot,
      visitedSet,
      highlightEdge,
      pathEdgeKeys,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-layer-state': curStateStr,
        'metric-layer-dist': `${curDist === Infinity ? '∞' : curDist} 元`,
        'metric-layer-pq': `${curPqSnapshot.length} 个候选波前`,
        'metric-layer-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(s, 0, 0, lines.initDist, 'init', `🚀 [初始化分层距离表] 创建 dist[${n}][${k + 1}]，全部初始化为正无穷大 ∞。`, 'init dist table');

  dist[s][0] = 0;
  parent[`${s},0`] = null;
  makeStep(s, 0, 0, lines.initSrc, 'init', `🌱 [起点入堆] 起点 ${s} 使用 0 次免票花费为 0，dist[${s}][0] = 0。`, `dist[${s}][0]=0`);

  pushPq(s, 0, 0);
  makeStep(s, 0, 0, lines.pushSrc, 'init', `📥 [推入优先队列] pq.push({ u: ${s}, used: 0, cost: 0 })。`, `pq.push(${s}, 0, 0)`);

  // 2. 主循环
  let foundOptimal = false;
  let optimalCost = Infinity;

  while (pq.length > 0) {
    makeStep(pq[0].u, pq[0].used, pq[0].cost, lines.whilePq, 'pop', `🔁 [检查堆非空] while (!pq.isEmpty()) -> 堆中待探索状态数: ${pq.length}。`, `!pq.isEmpty()`);

    const top = pollPq();
    const u = top.u;
    const used = top.used;
    const cost = top.cost;

    makeStep(u, used, cost, lines.poll, 'pop', `📤 [提取当前最小花费] poll -> 出堆状态 (Node ${u}, usedK=${used})，花费 ${cost} 元。`, `poll (${u}, ${used}, ${cost})`);

    makeStep(u, used, cost, lines.checkVisited, 'pop', `🔎 [检查是否已锁定] visited[${u}][${used}] -> ${visited[u][used] ? '已访问(跳过)' : '首次到达'}。`, `check visited[${u}][${used}]`);
    if (visited[u][used]) {
      continue;
    }

    visited[u][used] = true;
    makeStep(u, used, cost, lines.markVisited, 'pop', `🔒 [标记全局锁定] visited[${u}][${used}] = true，此状态的最优花费永久确认为 ${cost} 元！`, `visited[${u}][${used}]=true`);

    if (u === t) {
      if (!foundOptimal) {
        foundOptimal = true;
        optimalCost = cost;
        optimalFinalState = { u, used };
        makeStep(u, used, cost, lines.checkTarget, 'reach', `🎯 [抵达终点] 首次在终点城市 ${t} 出堆！最优花费即为 ${cost} 元 (免票使用 ${used}/${k} 次)！`, `reached target ${t} (cost=${cost})`);
        break;
      }
    }

    // 邻边转移
    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;

      makeStep(u, used, cost, lines.loopEdges, 'relax_edge', `  ↳ [遍历航线] 考察从城市 ${u} 到城市 ${v} 的航班 (原价 ${w} 元)。`, `edge ${u}->${v} (w=${w})`, { u, v, fromK: used, toK: used, isFree: false });

      // 同层转移：原价买票
      if (cost + w < dist[v][used]) {
        dist[v][used] = cost + w;
        parent[`${v},${used}`] = { u, used, fromEdgeW: w, isFree: false };
        makeStep(u, used, cost, lines.sameLayerRelax, 'relax_edge', `  🎫 [同层购票转移] 常规买票: dist[${v}][${used}] 从 ${dist[v][used] === Infinity ? '∞' : dist[v][used]} 更新为 ${cost + w} 元！`, `dist[${v}][${used}]=${cost + w}`, { u, v, fromK: used, toK: used, isFree: false });

        pushPq(v, used, cost + w);
        makeStep(u, used, cost, lines.pushSame, 'relax_edge', `  📥 [推入购票波前] pq.push({ u: ${v}, used: ${used}, cost: ${cost + w} })。`, `pq.push(${v}, ${used}, ${cost + w})`);
      }

      // 跨层转移：免票优惠
      if (used < k) {
        makeStep(u, used, cost, lines.crossLayerCheck, 'relax_edge', `  ✨ [检查免票额度] used(${used}) < k(${k})，可以使用免费升舱/免单特权！`, `check free: ${used} < ${k}`);

        if (cost < dist[v][used + 1]) {
          dist[v][used + 1] = cost;
          parent[`${v},${used + 1}`] = { u, used, fromEdgeW: 0, isFree: true };
          makeStep(u, used, cost, lines.crossLayerRelax, 'relax_edge', `  ⚡ [跨层免单跃迁] 0 权免费边: dist[${v}][${used + 1}] 原地缩减为 ${cost} 元 (跃迁至第 ${used + 1} 层)！`, `free edge to (${v}, ${used + 1})`, { u, v, fromK: used, toK: used + 1, isFree: true });

          pushPq(v, used + 1, cost);
          makeStep(u, used, cost, lines.pushCross, 'relax_edge', `  📥 [推入免票波前] pq.push({ u: ${v}, used: ${used + 1}, cost: ${cost} })。`, `pq.push(${v}, ${used + 1}, ${cost})`);
        }
      }
    }
  }

  // 终态步
  const finalAns = optimalCost !== Infinity ? optimalCost : dist[t][k];
  makeStep(t, optimalFinalState?.used ?? k, finalAns, lines.returnAns, 'done', `🎉 [分层图最优路结算完成] 起点 ${s} 到终点 ${t} 的最低花费为 ${finalAns} 元！`, `return ${finalAns}`);

  return steps;
}
