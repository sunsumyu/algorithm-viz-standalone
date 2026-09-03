/**
 * 反向索引堆优化 Dijkstra (Dijkstra with Index Heap / Decrease-Key) 声明式可视化器
 * 最短路架构: 反向索引映射 where[u]、支持 decreaseKey 原地 O(log N) 向上调整、消除冗余死节点压堆 (左程云图论核心)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（源点入堆、堆非空循环、pop出堆结算、后继松弛decreaseKey均发射独立Step）、四语言行号映射
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES,
  DIJKSTRA_INDEX_HEAP_PROBLEM_HTML,
  DIJKSTRA_INDEX_HEAP_ANALYSIS_HTML,
} from './dijkstra-index-heap-problem-content';
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
    heapClassInit: { cpp: 20, java: 11, python: 2, javascript: 2 },
    heapEmptyCheck: { cpp: 22, java: 19, python: 8, javascript: 9 },
    addOrUpdate: { cpp: 49, java: 48, python: 31, javascript: 39 },
    whereFirstCheck: { cpp: 50, java: 49, python: 32, javascript: 40 },
    whereFirstAdd: { cpp: 54, java: 53, python: 36, javascript: 44 },
    whereUpdateCheck: { cpp: 55, java: 54, python: 38, javascript: 45 },
    whereDecreaseKey: { cpp: 58, java: 57, python: 41, javascript: 48 },
    popEntry: { cpp: 63, java: 62, python: 43, javascript: 53 },
    popAns: { cpp: 64, java: 63, python: 44, javascript: 54 },
    popSwap: { cpp: 65, java: 64, python: 46, javascript: 55 },
    popHeapify: { cpp: 66, java: 65, python: 47, javascript: 56 },
    popSettle: { cpp: 67, java: 66, python: 48, javascript: 57 },
    returnAns: { cpp: 68, java: 67, python: 49, javascript: 58 },
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

const { template, Visualizer } = createDeclarativeVisualizer<IndexHeapStep>({
  id: 'dijkstra-index-heap',
  name: '反向索引堆优化 Dijkstra (Dijkstra Index Heap)',
  viewId: 'algo-dijkstra-index-heap-view',
  category: 'graph',
  icon: '🏔️',
  badge: {
    mode: '反向索引映射 where[] · 原地 decreaseKey',
    complexity: 'O((V + E) log V) · O(V)',
  },
  card1Title: '🏔️ 最短路拓扑网络与索引堆沙盘',
  card2Title: '📊 反向索引堆监视器 (where, distance, heap)',
  card2Desc: '展示反向索引表 where[u] 三态映射 (-1 未入堆, >=0 堆中位置, -2 已锁定) 与 decreaseKey 原地更新',
  legend: [
    { label: '⚡ 当前堆顶出堆节点', color: '#f59e0b' },
    { label: '✔ 已锁定最短路节点 (where=-2)', color: '#10b981' },
    { label: '📥 处于小根堆中 (where>=0)', color: '#38bdf8' },
    { label: '⚪ 未入堆节点 (where=-1)', color: '#1e293b' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设图结构',
      type: 'select',
      defaultValue: 'classic_4node',
      options: [
        { label: '4 节点经典网络 (含多重松弛路径)', value: 'classic_4node' },
        { label: '3 节点三角网络 (含单次松弛更优)', value: 'simple_triangle' },
      ],
    },
  ],
  presets: [
    { label: '4 节点经典网络', values: { 'input-preset': 'classic_4node' } },
    { label: '3 节点三角网络', values: { 'input-preset': 'simple_triangle' } },
  ],
  metrics: [
    { id: 'metric-heap-size', label: '堆内有效节点', color: '#38bdf8' },
    { id: 'metric-settled-count', label: '已锁定节点数', color: '#10b981' },
    { id: 'metric-heap-cur', label: '当前出堆代表元', color: '#f59e0b' },
    { id: 'metric-heap-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES,
  problemHtml: DIJKSTRA_INDEX_HEAP_PROBLEM_HTML,
  analysisHtml: DIJKSTRA_INDEX_HEAP_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_4node') as string;
    return buildIndexHeapSteps(preset);
  },
  renderCanvas: (container, step) => {
    const isTriangle = step.whereArray.length === 3;
    const n = isTriangle ? 3 : 4;

    const nodeCoords: Record<number, { x: number; y: number }> = isTriangle
      ? {
          1: { x: 55, y: 75 },
          2: { x: 235, y: 35 },
          3: { x: 145, y: 125 },
        }
      : {
          1: { x: 55, y: 75 },
          2: { x: 145, y: 35 },
          3: { x: 145, y: 125 },
          4: { x: 245, y: 75 },
        };

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

    const svgEdges = edges
      .map(([u, v, w]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';

        const isAct = step.curRelaxEdge && step.curRelaxEdge.u === u && step.curRelaxEdge.v === v;
        const color = isAct ? '#facc15' : '#64748b';
        const width = isAct ? 3.5 : 1.5;

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" marker-end="url(#dijkstra-arrow)" />
            <rect x="${mx - 7}" y="${my - 7}" width="14" height="12" rx="3" fill="#0f172a" stroke="#334155" />
            <text x="${mx}" y="${my + 2}" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">${w}</text>
          </g>
        `;
      })
      .join('');

    const nodes = isTriangle ? [1, 2, 3] : [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';

        const isCur = step.curPop === u;
        const isSettled = step.settled.includes(u);
        const wVal = step.indexMap[u] ?? -1;
        const dVal = step.distanceArray[u - 1];
        const dStr = dVal === 999 || dVal === undefined ? '∞' : `${dVal}`;

        const bg = isCur ? '#b45309' : isSettled ? '#065f46' : wVal >= 0 ? '#1e3a8a' : '#1e293b';
        const border = isCur ? '#facc15' : isSettled ? '#10b981' : wVal >= 0 ? '#38bdf8' : '#475569';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="16" fill="${bg}" stroke="${border}" stroke-width="${isCur || isSettled ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 24}" fill="${isSettled ? '#10b981' : '#f59e0b'}" font-size="7.5" font-weight="700" text-anchor="middle">d:${dStr}</text>
          </g>
        `;
      })
      .join('');

    const heapBadges = step.heapArray.length > 0
      ? step.heapArray.map((u, idx) => `
          <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid #38bdf8; border-radius: 4px; padding: 4px 8px; display: flex; flex-direction: column; align-items: center;">
            <span style="font-size: 8px; color: #94a3b8;">heap[${idx}]</span>
            <span style="font-size: 11px; font-weight: 700; color: #e2e8f0;">Node ${u} (d=${step.distanceArray[u - 1]})</span>
          </div>
        `).join('')
      : '<span style="font-size: 10.5px; color: #64748b;">(当前堆为空)</span>';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; justify-content: flex-start; align-items: stretch; background: #0b0f19; padding: 12px; border-radius: 8px; box-sizing: border-box; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 700;">🏔️ 最短路有向网络拓扑</span>
          <span style="font-size: 11px; color: #e2e8f0; background: #1e293b; padding: 2px 8px; border-radius: 4px; border: 1px solid #334155;">
            已锁定结算: <b style="color: #10b981;">${step.settled.length}</b> / ${n} 点
          </span>
        </div>

        <div style="width: 100%; min-height: 150px; background: #0f172a; border-radius: 8px; display: flex; justify-content: center; align-items: center; border: 1px solid #334155;">
          <svg style="width: 100%; height: 150px;" viewBox="0 0 310 150">
            <defs>
              <marker id="dijkstra-arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
              </marker>
            </defs>
            ${svgEdges}
            ${svgNodes}
          </svg>
        </div>

        <!-- 底部反向索引堆沙盘舱 -->
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #cbd5e1;">📦 小根堆排列与原地 decreaseKey 舱</span>
            <div style="font-size: 11px; color: #38bdf8;">
              堆规模: <b>${step.heapArray.length}</b> 个节点
            </div>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
            ${heapBadges}
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const isTriangle = step.whereArray.length === 3;
    const n = isTriangle ? 3 : 4;
    const indices = Array.from({ length: n }, (_, i) => i);

    const renderRow = (name: string, arr: any[], activeName: string, color: string, prefix: string) => {
      const cells = indices
        .map((idx) => {
          const val = arr[idx] ?? 0;
          const isActive = step.activeArray === activeName && step.activeSlot === idx;
          const displayVal = val === 999 ? '∞' : `${val}`;
          const bg = isActive ? '#78350f' : '#1e293b';
          const textCol = isActive ? '#fde047' : '#e2e8f0';
          const border = isActive ? '2px solid #eab308' : '1px solid #475569';

          return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 34px; height: 32px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 11px; font-weight: 700;">
              <span style="font-size: 8px; color: #94a3b8; line-height: 1;">${prefix}[${idx + 1}]</span>
              <span style="line-height: 1.1;">${displayVal}</span>
            </div>
          `;
        })
        .join('');

      return `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 135px; color: ${color};">${name}:</span>
          <div style="display: flex; gap: 4px;">${cells}</div>
        </div>
      `;
    };

    const wRow = renderRow('where[] (堆下标)', step.whereArray, 'where', '#38bdf8', 'N');
    const dRow = renderRow('distance[] (距离)', step.distanceArray, 'distance', '#f59e0b', 'N');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #cbd5e1; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155;">
          ${wRow}
          ${dRow}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
            <span style="color: #10b981; font-size: 10px; font-weight: 700;">反向索引状态机:</span>
            <strong style="color: #94a3b8; font-family: monospace; font-size: 10px;">-1: 未入堆 | >=0: 堆中位置 | -2: 已结算锁定</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'dijkstra-index-heap',
  name: '反向索引堆优化 Dijkstra (Dijkstra Index Heap)',
  viewId: 'algo-dijkstra-index-heap-view',
  category: 'graph',
  description: '左程云图论核心：反向索引表 where[] 支持 O(log V) 原地 decreaseKey 上浮、消除冗余节点压堆、严格 O((V+E)log V)',
  icon: '🏔️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 93,
  learningGoal: '掌握反向索引堆设计、where 数组状态机 (-1/idx/-2) 及 decreaseKey 原地更新机制',
});

export { Visualizer as DijkstraIndexHeapVisualizer };
