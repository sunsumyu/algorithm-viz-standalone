/**
 * K 短路与 A* 搜索 (K-th Shortest Path - A* Algorithm) 声明式可视化器
 * 进阶搜索: 反向图 Dijkstra 预处理 h(u)、A* 优先队列启发式估价 f(u) = g(u) + h(u)、第 K 次出堆即为答案 (洛谷 P2483 / P4467)
 * 遵循标准 4-Card 声明式沙盘架构，支持逐行指令执行与多状态数组 (h, countPop, 优先队列) 实时监控
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  K_SHORTEST_PATH_CODE_LANGUAGES,
  K_SHORTEST_PATH_PROBLEM_HTML,
  K_SHORTEST_PATH_ANALYSIS_HTML,
} from './k-shortest-path-problem-content';

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

  // ==================== 1. 初始化 ====================
  // 行 36: Code01_KthShortestPath(n, S, T, K)
  makeStep(36, `🚀 [算法初始化] 构造 K 短路求解器：n=${n}, 源点 S=${S}, 汇点 T=${T}, 目标求解第 K=${K} 短路。`, `init(${n}, ${S}, ${T}, ${K})`, 'init');

  // 行 43-49: 分配数组
  makeStep([43, 49], '📊 [分配状态数组] 初始化 adj[], revAdj[], h[], countPop[] 数组。', '分配状态数组', 'init');

  // 逐条加边
  for (const [u, v, w] of edges) {
    adj[u].push({ to: v, w });
    revAdj[v].push({ to: u, w });
    makeStep(52, `🔗 [添加有向边] addEdge(${u} ➔ ${v}, w=${w})：同时建立原边与反向边。`, `addEdge(${u}, ${v}, ${w})`, 'init', [u, v]);
  }

  // ==================== 2. 反向 Dijkstra 预处理 h(u) ====================
  // 行 57: dijkstraRev()
  makeStep(57, '⚡ [反向最短路预处理] dijkstraRev(): 从终点 T=4 出发在反图上跑 Dijkstra，计算各点到 T 的精确最短距离作为 A* 启发估价 h(u)。', 'dijkstraRev() 入口', 'rev_dijkstra');

  // 行 59: h[T] = 0
  h[T] = 0;
  makeStep(59, `📌 [终点基准初始化] h[T=${T}] = 0; 终点到自身的距离为 0。`, 'h[T] = 0', 'rev_dijkstra', undefined, 'h', T);

  // 反向松弛 (手工精细步骤)
  // T->2 (w=3), T->3 (w=3), T->1 (w=6)
  h[2] = 3;
  makeStep([66, 68], '📉 [松弛边 2 ➔ 4] h[2] 更新为 3 (2 到 4 的最短路为 3)。', 'h[2] = 3', 'rev_dijkstra', [2, 4], 'h', 2);

  h[3] = 3;
  makeStep([66, 68], '📉 [松弛边 3 ➔ 4] h[3] 更新为 3 (3 到 4 的最短路为 3)。', 'h[3] = 3', 'rev_dijkstra', [3, 4], 'h', 3);

  // 2->1 (w=1): h[1] = min(6, h[2]+1=4) = 4
  h[1] = 4;
  makeStep([66, 68], '📉 [松弛边 1 ➔ 2] h[1] 更新为 min(6, h[2]+1=4) = 4；所有启发估价 h(u) 预处理完毕！', 'h[1] = 4', 'rev_dijkstra', [1, 2], 'h', 1);

  // ==================== 3. A* 启发式搜索 ====================
  // 行 74: aStar()
  makeStep(74, '🧭 [启动 A* 启发式搜索] aStar(): 使用优先队列按综合估价 f(u) = g(u) + h(u) 升序出堆。', 'aStar() 入口', 'search');

  // 模拟优先队列搜索过程
  interface HeapNode {
    u: number;
    g: number;
    f: number;
    path: number[];
  }

  const pq: HeapNode[] = [];
  pq.push({ u: S, g: 0, f: h[S], path: [S] });

  // 模拟 A* 循环
  while (pq.length > 0) {
    pq.sort((a, b) => a.f - b.f);
    const cur = pq.shift()!;
    curU = cur.u;
    curG = cur.g;
    curH = h[curU];
    curF = cur.f;

    // 行 80: countPop[cur.u]++
    countPop[curU]++;
    makeStep(80, `📤 [出堆考量] 弹出 Node ${curU} (g=${curG}, h=${curH}, 综合 f=${curF})；该点累计出堆第 ${countPop[curU]} 次。`, `出堆 Node ${curU} (f=${curF})`, 'search', undefined, 'countPop', curU);

    // 行 81: if (cur.u == T && countPop[T] == K)
    if (curU === T) {
      foundPaths.push({ path: [...cur.path], len: curG });
      makeStep(81, `🎯 [命中终点 T] 发现到达终点 T 的路径：${cur.path.join(' ➔ ')}，实际花费 len = ${curG}！已命中第 ${countPop[T]} 次！`, `终点命中第 ${countPop[T]} 次: len=${curG}`, 'hit');

      if (countPop[T] === K) {
        // 行 82: return cur.g
        makeStep(82, `🎉 [达到第 K 次目标] countPop[T] == K (${countPop[T]} == ${K})！第 ${K} 短路求解成功，长度为 ${curG}！`, `第 ${K} 短路达成: ${curG}`, 'done');
        break;
      }
    }

    if (countPop[curU] > K) continue;

    // 行 85: 遍历出边入堆
    for (const e of adj[curU]) {
      const nextG = curG + e.w;
      const nextF = nextG + h[e.to];
      pq.push({ u: e.to, g: nextG, f: nextF, path: [...cur.path, e.to] });
      makeStep([86, 88], `📥 [扩展邻居] 沿边 (${curU} ➔ ${e.to}, w=${e.w}) 推进：新状态 Node ${e.to} (g=${nextG}, f=${nextF}) 入优先队列。`, `入堆 Node ${e.to} (f=${nextF})`, 'search', [curU, e.to]);
    }
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<KPathStep>({
  id: 'k-shortest-path',
  name: 'K 短路与 A* 启发式搜索 (K-th Shortest Path)',
  viewId: 'algo-k-shortest-path-view',
  category: 'graph',
  icon: '🧭',
  badge: {
    mode: '反向 Dijkstra + A* 优先队列',
    complexity: 'O((M + K) log N) · O(N + M)',
  },
  card1Title: '🧭 有向图拓扑、启发估价与路径沙盘',
  card2Title: '📊 A* 状态分析器 (h, countPop, g/h/f 估价)',
  card2Desc: '逐行对齐反向图 Dijkstra 预处理 h(u)、A* 优先队列综合估价 f(u) 升序扩展及终点第 K 次出堆命中判定',
  legend: [
    { label: '图节点', color: '#1e3a8a' },
    { label: '⭐ 当前出堆点', color: '#f59e0b' },
    { label: '🎯 目标汇点 T', color: '#ef4444' },
    { label: '🟢 活跃路径边', color: '#10b981' },
    { label: '⚪ 普通有向边', color: '#475569' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设查询',
      type: 'select',
      defaultValue: 'classic_4node_k2',
      options: [
        { label: '4 节点经典图 - 第 2 短路 (K=2, ans: 5)', value: 'classic_4node_k2' },
        { label: '4 节点经典图 - 第 3 短路 (K=3, ans: 6)', value: 'classic_4node_k3' },
      ],
    },
  ],
  presets: [
    { label: '第 2 短路 (K=2)', values: { 'input-preset': 'classic_4node_k2' } },
    { label: '第 3 短路 (K=3)', values: { 'input-preset': 'classic_4node_k3' } },
  ],
  metrics: [
    { id: 'metric-cur-node', label: '当前出堆状态', color: '#f59e0b' },
    { id: 'metric-f-val', label: '综合估价 f(u)', color: '#38bdf8' },
    { id: 'metric-hit-count', label: '终点出堆进度', color: '#10b981' },
    { id: 'metric-kpath-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: K_SHORTEST_PATH_CODE_LANGUAGES,
  problemHtml: K_SHORTEST_PATH_PROBLEM_HTML,
  analysisHtml: K_SHORTEST_PATH_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_4node_k2') as string;
    return buildKShortestPathSteps(preset);
  },
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 50, y: 105 },
      2: { x: 155, y: 45 },
      3: { x: 155, y: 165 },
      4: { x: 265, y: 105 },
    };

    const edges = [
      { u: 1, v: 2, w: 1 },
      { u: 1, v: 3, w: 2 },
      { u: 1, v: 4, w: 6 },
      { u: 2, v: 4, w: 3 },
      { u: 3, v: 4, w: 3 },
    ];

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const isAct = step.activeEdge && step.activeEdge[0] === e.u && step.activeEdge[1] === e.v;
        const color = isAct ? '#f59e0b' : '#475569';
        const width = isAct ? 3.5 : 1.5;

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2 + (e.u === 1 && e.v === 4 ? -8 : 0);

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />
            <rect x="${mx - 8}" y="${my - 6}" width="16" height="12" fill="#0f172a" rx="2" />
            <text x="${mx}" y="${my + 3}" fill="#94a3b8" font-size="8.5" font-family="monospace" text-anchor="middle">${e.w}</text>
          </g>
        `;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isCur = step.curNode === u;
        const isT = u === 4;
        const hVal = step.hArray[u] === 999 ? '∞' : step.hArray[u];

        const bg = isCur ? '#f59e0b' : isT ? '#991b1b' : '#1e3a8a';
        const border = isCur ? '#facc15' : isT ? '#ef4444' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="${isCur ? 3.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 28}" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">h:${hVal}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 205px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          节点底部为启发式估价 h(u)=dist(u➔T) | 终点第 K 次出堆对应的实际花费 g(T) 即为第 K 短路！
        </div>
      </div>
    `;

    const rootEl =
      container.closest('#algo-k-shortest-path-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (rootEl) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = rootEl.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }

      // 多数组监视器
      const customMetricsContainer = rootEl.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const indices = [1, 2, 3, 4];
        const renderRow = (name: string, arr: any[], activeName: string, color: string) => {
          const cells = indices
            .map((idx) => {
              const val = arr[idx] ?? 0;
              const isActive = step.activeArray === activeName && step.activeSlot === idx;
              const displayVal = val === 999 ? '∞' : val;
              const bg = isActive ? '#fef08a' : '#1e293b';
              const textCol = isActive ? '#854d0e' : '#e2e8f0';
              const border = isActive ? '2px solid #eab308' : '1px solid #475569';

              return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 32px; height: 30px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
                <span style="font-size: 7.5px; color: #64748b; line-height: 1;">[${idx}]</span>
                <span style="line-height: 1.1;">${displayVal}</span>
              </div>`;
            })
            .join('');

          return `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 110px; color: ${color};">${name}:</span>
              <div style="display: flex; gap: 4px;">${cells}</div>
            </div>
          `;
        };

        const hRow = renderRow('h[] (反向最短路)', step.hArray, 'h', '#38bdf8');
        const countRow = renderRow('countPop[] (出堆数)', step.countPopArray, 'countPop', '#f59e0b');

        const pathsStr =
          step.foundPaths.length > 0
            ? step.foundPaths.map((p, i) => `#${i + 1}: ${p.path.join('➔')} (长${p.len})`).join(' | ')
            : '尚未到达终点';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #cbd5e1; padding: 2px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px; background: #0f172a; padding: 8px; border-radius: 6px; border: 1px solid #334155;">
              ${hRow}
              ${countRow}
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
                <span style="color: #10b981; font-size: 10px; font-weight: 700;">已探明路径:</span>
                <strong style="color: #10b981; font-family: monospace; font-size: 10px;">${pathsStr}</strong>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #1e293b; border: 1px solid #334155; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #94a3b8; font-size: 10.5px;">执行语句:</span>
              <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine}: ${step.log}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'k-shortest-path',
  name: 'K 短路与 A* 启发式搜索 (K-th Shortest Path)',
  viewId: 'algo-k-shortest-path-view',
  category: 'graph',
  description: '进阶搜索经典：反向图 Dijkstra 预处理估价 h(u)、正向 A* 优先队列综合估价 f(u) 启发式搜索 (洛谷 P2483)',
  icon: '🧭',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 78,
  learningGoal: '掌握 K 短路问题建模、反向图最短路估价函数设计以及 A* 算法第 K 次出堆最优性定理',
});

export { Visualizer as KShortestPathVisualizer };
