/**
 * K 短路与 A* 搜索 (K-th Shortest Path - A* Algorithm · 洛谷 P2483) 步进编译器 (Deep Module)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：反向图 Dijkstra 预处理 h(u)、A* 启发式综合估价 f(u) = g(u) + h(u) 推演、行号联动
 */

export interface KPathStep {
  curNode: number;
  gVal: number;
  hVal: number;
  fVal: number;
  popCountAtTarget: number;
  targetK: number;
  foundPaths: Array<{ path: number[]; len: number }>;
  hArray: number[];
  countPopArray: number[];
  activeArray?: 'h' | 'countPop';
  activeSlot?: number;
  activeEdge?: [number, number];
  status: 'init' | 'rev_dijkstra' | 'search' | 'hit' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildKShortestPathSteps(preset: string = 'classic_4node_k2'): KPathStep[] {
  const steps: KPathStep[] = [];
  const isK3 = preset === 'classic_4node_k3';
  const K = isK3 ? 3 : 2;
  const n = 4;
  const S = 1;
  const T = 4;

  // 经典图结构: 1->2(1), 1->3(2), 1->4(6), 2->4(3), 3->4(3)
  const edges: Array<[number, number, number]> = [
    [1, 2, 1],
    [1, 3, 2],
    [1, 4, 6],
    [2, 4, 3],
    [3, 4, 3],
  ];

  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n + 1 }, () => []);
  const revAdj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n + 1 }, () => []);

  const h: number[] = new Array(n + 1).fill(Infinity);
  const countPop: number[] = new Array(n + 1).fill(0);
  const foundPaths: Array<{ path: number[]; len: number }> = [];

  let curU = S;
  let curG = 0;
  let curH = 0;
  let curF = 0;

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'rev_dijkstra' | 'search' | 'hit' | 'done',
    activeEdge?: [number, number],
    activeArray?: 'h' | 'countPop',
    activeSlot?: number
  ): void {
    const hCopy = h.map((v) => (v === Infinity ? 999 : v));
    const hits = countPop[T];

    const phaseStr =
      status === 'done'
        ? '第 K 短路求解完成'
        : status === 'hit'
          ? '到达终点 T (更新命中计数)'
          : status === 'search'
            ? 'A* 启发式优先队列推进'
            : status === 'rev_dijkstra'
              ? '反向 Dijkstra 预处理 h(u)'
              : '算法初始化';

    steps.push({
      curNode: curU,
      gVal: curG,
      hVal: curH,
      fVal: curF,
      popCountAtTarget: hits,
      targetK: K,
      foundPaths: foundPaths.map((p) => ({ ...p, path: [...p.path] })),
      hArray: hCopy,
      countPopArray: [...countPop],
      activeArray,
      activeSlot,
      activeEdge,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cur-node': `Node ${curU} (g=${curG}, h=${curH})`,
        'metric-f-val': `f(u) = ${curF}`,
        'metric-hit-count': `终点命中: ${hits} / ${K} 次`,
        'metric-kpath-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(36, `🚀 [算法初始化] 构造 K 短路求解器：n=${n}, 源点 S=${S}, 汇点 T=${T}, 目标求解第 K=${K} 短路。`, `init(${n}, ${S}, ${T}, ${K})`, 'init');
  makeStep([43, 49], '📊 [分配状态数组] 初始化 adj[], revAdj[], h[], countPop[] 数组。', '分配状态数组', 'init');

  for (const [u, v, w] of edges) {
    adj[u].push({ to: v, w });
    revAdj[v].push({ to: u, w });
    makeStep(52, `🔗 [添加有向边] addEdge(${u} ➔ ${v}, w=${w})：同时建立原边与反向边。`, `addEdge(${u}, ${v}, ${w})`, 'init', [u, v]);
  }

  // 2. 反向 Dijkstra 预处理 h(u)
  makeStep(57, '⚡ [反向最短路预处理] dijkstraRev(): 从终点 T=4 出发在反图上跑 Dijkstra，计算各点到 T 的精确最短距离作为 A* 启发估价 h(u)。', 'dijkstraRev() 入口', 'rev_dijkstra');

  h[T] = 0;
  makeStep(59, `📌 [终点基准初始化] h[T=${T}] = 0; 终点到自身的距离为 0。`, 'h[T] = 0', 'rev_dijkstra', undefined, 'h', T);

  h[2] = 3;
  makeStep([66, 68], '📉 [松弛边 2 ➔ 4] h[2] 更新为 3 (2 到 4 的最短路为 3)。', 'h[2] = 3', 'rev_dijkstra', [2, 4], 'h', 2);

  h[3] = 3;
  makeStep([66, 68], '📉 [松弛边 3 ➔ 4] h[3] 更新为 3 (3 到 4 的最短路为 3)。', 'h[3] = 3', 'rev_dijkstra', [3, 4], 'h', 3);

  h[1] = 4;
  makeStep([66, 68], '📉 [松弛边 1 ➔ 2] h[1] 更新为 min(6, h[2]+1=4) = 4；所有启发估价 h(u) 预处理完毕！', 'h[1] = 4', 'rev_dijkstra', [1, 2], 'h', 1);

  // 3. A* 启发式搜索
  makeStep(74, '🧭 [启动 A* 启发式搜索] aStar(): 使用优先队列按综合估价 f(u) = g(u) + h(u) 升序出堆。', 'aStar() 入口', 'search');

  interface HeapNode {
    u: number;
    g: number;
    f: number;
    path: number[];
  }

  const pq: HeapNode[] = [];
  pq.push({ u: S, g: 0, f: h[S], path: [S] });

  while (pq.length > 0) {
    pq.sort((a, b) => a.f - b.f);
    const cur = pq.shift()!;
    curU = cur.u;
    curG = cur.g;
    curH = h[curU];
    curF = cur.f;

    countPop[curU]++;
    makeStep(80, `📤 [出堆考量] 弹出 Node ${curU} (g=${curG}, h=${curH}, 综合 f=${curF})；该点累计出堆第 ${countPop[curU]} 次。`, `出堆 Node ${curU} (f=${curF})`, 'search', undefined, 'countPop', curU);

    if (curU === T) {
      foundPaths.push({ path: [...cur.path], len: curG });
      makeStep(81, `🎯 [命中终点 T] 发现到达终点 T 的路径：${cur.path.join(' ➔ ')}，实际花费 len = ${curG}！已命中第 ${countPop[T]} 次！`, `终点命中第 ${countPop[T]} 次: len=${curG}`, 'hit');

      if (countPop[T] === K) {
        makeStep(82, `🎉 [达到第 K 次目标] countPop[T] == K (${countPop[T]} == ${K})！第 ${K} 短路求解成功，长度为 ${curG}！`, `第 ${K} 短路达成: ${curG}`, 'done');
        break;
      }
    }

    if (countPop[curU] > K) continue;

    for (const e of adj[curU]) {
      const nextG = curG + e.w;
      const nextF = nextG + h[e.to];
      pq.push({ u: e.to, g: nextG, f: nextF, path: [...cur.path, e.to] });
      makeStep([86, 88], `📥 [扩展邻居] 沿边 (${curU} ➔ ${e.to}, w=${e.w}) 推进：新状态 Node ${e.to} (g=${nextG}, f=${nextF}) 入优先队列。`, `入堆 Node ${e.to} (f=${nextF})`, 'search', [curU, e.to]);
    }
  }

  return steps;
}
