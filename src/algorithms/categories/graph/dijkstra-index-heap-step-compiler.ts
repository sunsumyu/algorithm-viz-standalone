/**
 * 反向索引堆优化 Dijkstra (Dijkstra with Index Heap) 步进编译器 (Deep Module)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：图模型构建、反向索引堆 (where[] 映射与 decreaseKey) 推演、四语言 1-based 行号联动
 */

import { HighlightTarget } from '../../../core/code-panel';

export interface IndexHeapStep {
  heapNodes: Array<{ u: number; dist: number }>;
  indexMap: Record<number, number>;
  settled: number[];
  curPop: number | null;
  curRelaxEdge?: { u: number; v: number; w: number };
  heapArray: number[];
  whereArray: number[];
  distanceArray: number[];
  activeArray?: 'heap' | 'where' | 'distance';
  activeSlot?: number;
  status: 'init' | 'pop' | 'relax' | 'decrease' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildIndexHeapSteps(preset: string = 'classic_4node'): IndexHeapStep[] {
  const steps: IndexHeapStep[] = [];
  const isTriangle = preset === 'simple_triangle';
  const n = isTriangle ? 3 : 4;
  const src = 1;

  const edges: Array<[number, number, number]> = isTriangle
    ? [
        [1, 2, 4],
        [1, 3, 1],
        [3, 2, 1],
      ]
    : [
        [1, 2, 4],
        [1, 3, 1],
        [3, 2, 1],
        [2, 4, 2],
        [3, 4, 5],
      ];

  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of edges) {
    adj[u].push({ to: v, w });
  }

  const heap: number[] = new Array(n + 1).fill(0);
  const where: number[] = new Array(n + 1).fill(-1);
  const distance: number[] = new Array(n + 1).fill(Infinity);
  let heapSize = 0;

  const settled: number[] = [];
  let curPop: number | null = null;
  let curRelaxEdge: { u: number; v: number; w: number } | undefined = undefined;

  function swap(i: number, j: number): void {
    where[heap[i]] = j;
    where[heap[j]] = i;
    const tmp = heap[i];
    heap[i] = heap[j];
    heap[j] = tmp;
  }

  function heapInsert(index: number): void {
    let i = index;
    while (distance[heap[i]] < distance[heap[Math.floor((i - 1) / 2)]]) {
      swap(i, Math.floor((i - 1) / 2));
      i = Math.floor((i - 1) / 2);
    }
  }

  function heapify(index: number): void {
    let i = index;
    let l = i * 2 + 1;
    while (l < heapSize) {
      let best = l + 1 < heapSize && distance[heap[l + 1]] < distance[heap[l]] ? l + 1 : l;
      best = distance[heap[best]] < distance[heap[i]] ? best : i;
      if (best === i) break;
      swap(best, i);
      i = best;
      l = i * 2 + 1;
    }
  }

  // 精准 13 处四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    heapClassInit: { cpp: 13, java: 11, python: 2, javascript: 2 },
    heapEmptyCheck: { cpp: 15, java: 19, python: 8, javascript: 9 },
    addOrUpdate: { cpp: 42, java: 48, python: 31, javascript: 39 },
    whereFirstCheck: { cpp: 43, java: 49, python: 32, javascript: 40 },
    whereFirstAdd: { cpp: 47, java: 53, python: 36, javascript: 44 },
    whereUpdateCheck: { cpp: 48, java: 54, python: 38, javascript: 45 },
    whereDecreaseKey: { cpp: 51, java: 57, python: 41, javascript: 48 },
    popEntry: { cpp: 56, java: 62, python: 43, javascript: 53 },
    popAns: { cpp: 57, java: 63, python: 44, javascript: 54 },
    popSwap: { cpp: 58, java: 64, python: 46, javascript: 55 },
    popHeapify: { cpp: 59, java: 65, python: 47, javascript: 56 },
    popSettle: { cpp: 60, java: 66, python: 48, javascript: 57 },
    returnAns: { cpp: 61, java: 67, python: 49, javascript: 58 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init' | 'pop' | 'relax' | 'decrease' | 'done',
    activeArray?: 'heap' | 'where' | 'distance',
    activeSlot?: number
  ): void {
    const heapNodes: Array<{ u: number; dist: number }> = [];
    for (let i = 0; i < heapSize; i++) {
      heapNodes.push({ u: heap[i], dist: distance[heap[i]] });
    }

    const indexMap: Record<number, number> = {};
    const whereSlice: number[] = [];
    const distSlice: number[] = [];
    for (let i = 1; i <= n; i++) {
      indexMap[i] = where[i];
      whereSlice.push(where[i]);
      distSlice.push(distance[i] === Infinity ? 999 : distance[i]);
    }

    const heapSlice: number[] = [];
    for (let i = 0; i < heapSize; i++) {
      heapSlice.push(heap[i]);
    }

    const curStr = curPop !== null ? `Node ${curPop}` : '无';
    const phaseStr =
      status === 'done'
        ? '最短路全量结算'
        : status === 'decrease'
          ? '原地 decreaseKey 上浮'
          : status === 'relax'
            ? '边松弛考察'
            : status === 'pop'
              ? '堆顶出堆结算'
              : '堆初始化';

    steps.push({
      heapNodes,
      indexMap,
      settled: [...settled],
      curPop,
      curRelaxEdge: curRelaxEdge ? { ...curRelaxEdge } : undefined,
      heapArray: heapSlice,
      whereArray: whereSlice,
      distanceArray: distSlice,
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-heap-size': `${heapSize} 个节点在堆中`,
        'metric-settled-count': `${settled.length} 个节点已锁定`,
        'metric-heap-cur': curStr,
        'metric-heap-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.heapClassInit, `🚀 [反向索引堆初始化] Heap(n=${n})：分配 heap[n+1]、where[n+1] 填 -1、distance[n+1] 填 ∞。`, '初始化 IndexHeap', 'init');

  // 源点入堆
  makeStep(lines.addOrUpdate, `🌱 [源点入堆] addOrUpdateOrIgnore(src=${src}, dist=0)：将起点加入反向索引堆。`, `add(src=${src}, 0)`, 'init');
  makeStep(lines.whereFirstCheck, `🔎 [检查 where 状态] if (where[${src}] == -1) -> (${where[src]} == -1: 首次入堆)。`, `where[${src}] == -1`, 'init');

  distance[src] = 0;
  heap[heapSize] = src;
  where[src] = heapSize;
  heapSize++;
  heapInsert(heapSize - 1);
  makeStep(lines.whereFirstAdd, `📥 [首次入堆完成] distance[${src}]=0, where[${src}]=0, heap[0]=${src}；当前堆规模 heapSize = ${heapSize}。`, `heapInsert(${src})`, 'init', 'heap', 0);

  // 2. Dijkstra 主循环
  while (heapSize > 0) {
    makeStep(lines.heapEmptyCheck, `🔁 [检查堆非空] while (!heap.isEmpty()) -> 当前堆大小 size = ${heapSize}。`, `!isEmpty() (size=${heapSize})`, 'pop');

    // pop 出堆
    makeStep(lines.popEntry, '📤 [调用 pop 出堆] public int pop()：提取当前全局最短距离估计最小节点。', 'pop()', 'pop');

    const u = heap[0];
    curPop = u;
    makeStep(lines.popAns, `🎯 [锁定堆顶代表元] int ans = heap[0] = Node ${u} (最短距离 d = ${distance[u]})！`, `ans = heap[0] = ${u}`, 'pop', 'heap', 0);

    swap(0, heapSize - 1);
    heapSize--;
    makeStep(lines.popSwap, `🔄 [末尾元素调换] swap(0, --size) -> 堆尾换至堆顶，准备执行下沉重构。`, `swap(0, ${heapSize})`, 'pop');

    heapify(0);
    makeStep(lines.popHeapify, '⚖️ [堆化下沉调整] heapify(0)：恢复小根堆性质。', 'heapify(0)', 'pop');

    where[u] = -2;
    settled.push(u);
    makeStep(lines.popSettle, `🔒 [标记永久锁定] where[${u}] = -2：节点 ${u} 的最短路已全局确定，今后永不重复入堆！`, `where[${u}] = -2`, 'pop', 'where', u - 1);

    makeStep(lines.returnAns, `✨ [返回出堆节点] return ans = Node ${u}！准备以此节点考察所有邻接出边。`, `return Node ${u}`, 'pop');

    // 考察出边
    for (const e of adj[u]) {
      const v = e.to;
      const w = e.w;
      curRelaxEdge = { u, v, w };

      makeStep(lines.addOrUpdate, `  ↳ [边松弛考察] 考察边 (${u} ➔ ${v}, 权重 ${w})：尝试以 d = distance[${u}]+${w} = ${distance[u] + w} 松弛 Node ${v}。`, `relax edge (${u}, ${v})`, 'relax');

      const newDist = distance[u] + w;

      if (where[v] === -1) {
        makeStep(lines.whereFirstCheck, `  🔎 [未曾入堆判定] if (where[${v}] == -1) -> (${where[v]} == -1: 首次触达)。`, `where[${v}] == -1`, 'relax');

        distance[v] = newDist;
        heap[heapSize] = v;
        where[v] = heapSize;
        heapSize++;
        heapInsert(heapSize - 1);
        makeStep(lines.whereFirstAdd, `  📥 [首次入堆上浮] distance[${v}] = ${newDist}, where[${v}] = ${where[v]}；节点 ${v} 成功进入小根堆！`, `heapInsert(${v})`, 'relax', 'heap', where[v]);
      } else if (where[v] >= 0) {
        makeStep(lines.whereUpdateCheck, `  🔎 [堆内减权判定] else if (where[${v}] >= 0) -> (${where[v]} >= 0: 节点在堆中)，检查 newDist < distance[${v}] (${newDist} < ${distance[v]})。`, `where[${v}] >= 0`, 'relax');

        if (newDist < distance[v]) {
          distance[v] = newDist;
          makeStep(lines.whereDecreaseKey, `  ⚡ [原地 decreaseKey] 发现更优路径！原地更新 distance[${v}] = ${newDist}，调用 heapInsert(where[${v}]=${where[v]}) 向上调整！`, `decreaseKey(${v})`, 'decrease', 'distance', v - 1);
          heapInsert(where[v]);
          makeStep(lines.whereDecreaseKey, `  📈 [上浮调整就绪] 节点 ${v} 在堆中位置更新为 where[${v}] = ${where[v]}，消除冗余死节点压堆！`, `heapInsert 完成`, 'decrease', 'where', v - 1);
        }
      } else {
        makeStep(lines.whereUpdateCheck, `  🛡️ [已结算忽略] where[${v}] == -2 (已锁定)，无需任何操作，天然避免死循环！`, `where[${v}] == -2 (ignore)`, 'relax');
      }
    }

    curRelaxEdge = undefined;
    curPop = null;
  }

  makeStep(lines.heapEmptyCheck, `🎉 [最短路全量结算] 堆已为空，从源点 ${src} 出发到所有可达节点的最短距离全部精确锁定！`, 'Dijkstra 算法完成', 'done');

  return steps;
}
