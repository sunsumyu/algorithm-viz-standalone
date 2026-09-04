/**
 * 分层图最短路 (Layered Graph Shortest Path - 飞行路线 / K 次免费乘机 洛谷 P4568) 声明式可视化器
 * 核心：二维状态 (node, usedK) 分层图建模、同层常规转移、跨层 0 权免费边、Dijkstra 堆优化
 * 深度架构重构：严格解释器级全流程逐行高亮执行（初始化数组、起点入队、堆非空循环、poll出队、已访问continue、终点判定、同层买票松弛、跨层免单跃迁松弛均发射独立Step）、四语言行号映射
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  LAYERED_DIJKSTRA_CODE_LANGUAGES,
  LAYERED_DIJKSTRA_PROBLEM_HTML,
  LAYERED_DIJKSTRA_ANALYSIS_HTML,
} from './layered-dijkstra-problem-content';
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

  // 精准 16 处四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    entry: { cpp: 34, java: 16, python: 3, javascript: 2 },
    initArrays: { cpp: 35, java: 17, python: 10, javascript: 9 },
    initPq: { cpp: 37, java: 22, python: 15, javascript: 14 },
    initSrc: { cpp: 39, java: 23, python: 16, javascript: 15 },
    pushSrc: { cpp: 40, java: 24, python: 16, javascript: 16 },
    whilePq: { cpp: 42, java: 26, python: 18, javascript: 18 },
    popNode: { cpp: 43, java: 27, python: 19, javascript: 19 },
    checkVisited: { cpp: 47, java: 30, python: 20, javascript: 21 },
    markVisited: { cpp: 48, java: 31, python: 22, javascript: 22 },
    checkTarget: { cpp: 49, java: 32, python: 23, javascript: 23 },
    loopNeighbors: { cpp: 51, java: 34, python: 26, javascript: 26 },
    checkPaidRelax: { cpp: 54, java: 37, python: 28, javascript: 28 },
    applyPaidRelax: { cpp: 55, java: 38, python: 29, javascript: 29 },
    checkFreeRelax: { cpp: 59, java: 42, python: 32, javascript: 32 },
    applyFreeRelax: { cpp: 60, java: 43, python: 33, javascript: 33 },
    returnAns: { cpp: 68, java: 51, python: 37, javascript: 39 },
  };

  function snapshotDistGrid(): Record<string, number> {
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

  function snapshotVisited(): string[] {
    const res: string[] = [];
    for (let u = 0; u < n; u++) {
      for (let j = 0; j <= k; j++) {
        if (visited[u][j]) res.push(`${u},${j}`);
      }
    }
    return res;
  }

  function reconstructPath(targetU: number, targetUsed: number): string[] {
    const pathKeys: string[] = [];
    let cur: { u: number; used: number } | null = { u: targetU, used: targetUsed };
    while (cur) {
      const curKey: string = `${cur.u},${cur.used}`;
      const prevInfo: { u: number; used: number; fromEdgeW: number; isFree: boolean } | null | undefined = parent[curKey];
      if (!prevInfo) break;
      const prevKey = `${prevInfo.u},${prevInfo.used}`;
      pathKeys.push(`${prevKey}->${curKey}`);
      cur = { u: prevInfo.u, used: prevInfo.used };
    }
    return pathKeys;
  }

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init' | 'pop' | 'relax_edge' | 'reach' | 'done',
    curNode: number,
    curK: number,
    curDist: number,
    highlightEdge?: { u: number; v: number; fromK: number; toK: number; isFree: boolean } | null,
    pathEdgeKeys?: string[]
  ): void {
    const distGrid = snapshotDistGrid();
    const visitedSet = snapshotVisited();
    const pqCopy = pq.map((x) => ({ ...x })).sort((a, b) => a.cost - b.cost);

    const phaseStr =
      status === 'done'
        ? '终点最优锁定'
        : status === 'reach'
          ? '到达终点并回溯'
          : status === 'relax_edge'
            ? '边松弛与跨层跃迁'
            : status === 'pop'
              ? '堆顶状态出堆'
              : '分量初始化';

    steps.push({
      curNode,
      curK,
      curDist,
      distGrid,
      pqList: pqCopy,
      visitedSet,
      highlightEdge: highlightEdge || null,
      pathEdgeKeys: pathEdgeKeys || [],
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-layer-state': `城市 ${curNode} (已用券 ${curK}/${k})`,
        'metric-layer-dist': `${curDist === Infinity ? '∞' : curDist} 金额`,
        'metric-layer-pq': `${pqCopy.length} 个状态在堆中`,
        'metric-layer-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, `🚀 [分层图算法入口] layeredDijkstra(n=${n}, k=${k}, s=${s}, t=${t})：构建 ${k + 1} 层状态图。`, 'layeredDijkstra 入口', 'init', s, 0, 0);
  makeStep(lines.initArrays, `📊 [初始化距离与访问矩阵] 分配 distance[${n}][${k + 1}] (填 ∞) 与 visited[${n}][${k + 1}] (填 false)。`, '初始化二维矩阵', 'init', s, 0, 0);
  makeStep(lines.initPq, '📦 [初始化小根堆] PriorityQueue<int[]> pq 按累计花费 cost 升序排序。', '创建优先队列', 'init', s, 0, 0);

  dist[s][0] = 0;
  makeStep(lines.initSrc, `🌱 [设置起点零花费] distance[${s}][0] = 0：位于第 0 层未用券起点。`, `distance[${s}][0] = 0`, 'init', s, 0, 0);

  pq.push({ u: s, used: 0, cost: 0 });
  makeStep(lines.pushSrc, `📥 [起点状态入堆] pq.add([city=${s}, used=0, cost=0])；进入就绪队列。`, `pq.add(${s},0,0)`, 'init', s, 0, 0);

  let finalAns = -1;
  let reachedState: { u: number; used: number } | null = null;

  // 2. Dijkstra 循环
  while (pq.length > 0) {
    makeStep(lines.whilePq, `🔁 [检查堆非空] while (!pq.isEmpty()) -> 堆中包含 ${pq.length} 个候选状态。`, `!pq.isEmpty()`, 'pop', s, 0, 0);

    pq.sort((a, b) => a.cost - b.cost);
    const cur = pq.shift()!;
    const u = cur.u;
    const used = cur.used;
    const cost = cur.cost;

    makeStep(lines.popNode, `📤 [弹出堆顶最优状态] poll() -> 城市 ${u} (已用券 ${used}, 累计花费 ${cost})。`, `poll (${u}, k:${used}, c:${cost})`, 'pop', u, used, cost);

    makeStep(lines.checkVisited, `🔎 [检查是否已访问] if (visited[${u}][${used}]) -> (${visited[u][used]})。`, `visited[${u}][${used}]?`, 'pop', u, used, cost);
    if (visited[u][used]) {
      makeStep(lines.checkVisited, `⏭️ [跳过已锁定状态] (${u}, used=${used}) 已经以更优花费访问过，跳过。`, `skip visited (${u}, ${used})`, 'pop', u, used, cost);
      continue;
    }

    visited[u][used] = true;
    makeStep(lines.markVisited, `🔒 [标记永久锁定] visited[${u}][${used}] = true；该分层状态最短路确立！`, `visited[${u}][${used}]=true`, 'pop', u, used, cost);

    makeStep(lines.checkTarget, `🎯 [终点判定] if (u == ${t}) -> (${u} == ${t})。`, `u == ${t}?`, 'pop', u, used, cost);
    if (u === t) {
      finalAns = cost;
      reachedState = { u, used };
      const pathKeys = reconstructPath(u, used);
      makeStep(lines.checkTarget, `🏆 [抵达目标终点] 成功到达终点城市 ${t}！当前最小总花费为 ${cost}！`, `到达终点 ${t}, ans=${cost}`, 'reach', u, used, cost, null, pathKeys);
      break;
    }

    // 考察邻接边
    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;

      makeStep(lines.loopNeighbors, `  ↳ [考察出边] for (int[] edge : graph[${u}]) -> 考察航线 (${u} ➔ ${v}, 原价票 ${w})。`, `neighbor (${u}, ${v})`, 'relax_edge', u, used, cost);

      // 分支 1: 正常付费买票（同层转移）
      makeStep(lines.checkPaidRelax, `  🔎 [同层买票松弛检验] if (distance[${v}][${used}] > cost + ${w}) -> (${dist[v][used]} > ${cost + w})。`, `check paid (${u}->${v})`, 'relax_edge', u, used, cost, { u, v, fromK: used, toK: used, isFree: false });

      if (dist[v][used] > cost + w) {
        dist[v][used] = cost + w;
        parent[`${v},${used}`] = { u, used, fromEdgeW: w, isFree: false };
        pq.push({ u: v, used, cost: dist[v][used] });
        makeStep(lines.applyPaidRelax, `  💳 [同层买票更新] 正常购票！更新 distance[${v}][${used}] = ${dist[v][used]}，状态 (${v}, k=${used}) 入堆！`, `paid relax: dist[${v}][${used}]=${dist[v][used]}`, 'relax_edge', u, used, cost, { u, v, fromK: used, toK: used, isFree: false });
      }

      // 分支 2: 使用 1 张免费券跨层跃迁 (used < k)
      if (used < k) {
        makeStep(lines.checkFreeRelax, `  🎟️ [免单券跃迁检验] if (used < ${k} && distance[${v}][${used + 1}] > cost) -> (${used} < ${k} && ${dist[v][used + 1]} > ${cost})。`, `check free ticket (${u}->${v})`, 'relax_edge', u, used, cost, { u, v, fromK: used, toK: used + 1, isFree: true });

        if (dist[v][used + 1] > cost) {
          dist[v][used + 1] = cost;
          parent[`${v},${used + 1}`] = { u, used, fromEdgeW: 0, isFree: true };
          pq.push({ u: v, used: used + 1, cost });
          makeStep(lines.applyFreeRelax, `  🚀 [跨层免单跃迁] 使用 1 次免票券！花费保持 ${cost} 不变，跃迁至第 ${used + 1} 层 distance[${v}][${used + 1}] = ${cost}！`, `free relax: dist[${v}][${used + 1}]=${cost}`, 'relax_edge', u, used, cost, { u, v, fromK: used, toK: used + 1, isFree: true });
        }
      }
    }
  }

  const finalPath = reachedState ? reconstructPath(reachedState.u, reachedState.used) : [];
  makeStep(lines.returnAns, `🎉 [最优飞行路线确定] return ans = ${finalAns}！使用至多 ${k} 次免费机票，最小开销锁定为 ${finalAns}！`, `return ${finalAns}`, 'done', t, reachedState ? reachedState.used : 0, finalAns, null, finalPath);

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<LayeredStep>({
  id: 'layered-dijkstra',
  name: '飞行路线 (Flight Path / 分层图最短路)',
  viewId: 'algo-layered-dijkstra-view',
  category: 'graph',
  icon: '✈️',
  badge: {
    mode: '分层图 Dijkstra · 跨层 0 权免单跃迁',
    complexity: 'O((V + E) K log(VK)) · O(VK)',
  },
  card1Title: '✈️ 飞行路线与分层图免票跃迁舱',
  card2Title: '📊 分层图状态监视器 (distance[city][usedK], PQ 优先队列)',
  card2Desc: '展示二维状态矩阵 (city, usedK) 的同层购票转移与跨层免单 0 权边松弛全过程',
  legend: [
    { label: '🔵 第 0 层原价机票', color: '#0369a1' },
    { label: '🌸 第 1 层免票优惠', color: '#db2777' },
    { label: '⚡ 当前出堆考察状态', color: '#f59e0b' },
    { label: '🟢 最优分层最短路', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设飞行网络',
      type: 'select',
      defaultValue: 'p4568_standard',
      options: [
        { label: '洛谷 P4568 经典 5 城市 (1 次免票)', value: 'p4568_standard' },
        { label: '3 城市入门双层图 (1 次免票)', value: 'simple_3node' },
      ],
    },
  ],
  presets: [
    { label: '5 城市经典 (P4568)', values: { 'input-preset': 'p4568_standard' } },
    { label: '3 城市简易', values: { 'input-preset': 'simple_3node' } },
  ],
  metrics: [
    { id: 'metric-layer-state', label: '当前出堆状态', color: '#f59e0b' },
    { id: 'metric-layer-dist', label: '当前花费金额', color: '#10b981' },
    { id: 'metric-layer-pq', label: '堆内候选状态', color: '#38bdf8' },
    { id: 'metric-layer-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: LAYERED_DIJKSTRA_CODE_LANGUAGES,
  problemHtml: LAYERED_DIJKSTRA_PROBLEM_HTML,
  analysisHtml: LAYERED_DIJKSTRA_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'p4568_standard') as string;
    return buildLayeredDijkstraSteps(preset);
  },
  renderCanvas: (container, step) => {
    const config = Object.keys(step.distGrid).length > 4 ? LAYERED_PRESETS.p4568_standard : LAYERED_PRESETS.simple_3node;
    const { n, edges, nodeCoords } = config;

    const isPathEdge = (uStr: string, vStr: string) => {
      if (!step.pathEdgeKeys) return false;
      return (
        step.pathEdgeKeys.includes(`${uStr}->${vStr}`) ||
        step.pathEdgeKeys.includes(`${vStr}->${uStr}`)
      );
    };

    const svgEdgesList: string[] = [];
    for (const e of edges) {
      const p1 = nodeCoords[e.u];
      const p2 = nodeCoords[e.v];
      if (!p1 || !p2) continue;

      // Layer 0 regular edge
      const onPathL0 = isPathEdge(`${e.u},0`, `${e.v},0`);
      const isCurL0 =
        step.highlightEdge &&
        !step.highlightEdge.isFree &&
        step.highlightEdge.fromK === 0 &&
        ((step.highlightEdge.u === e.u && step.highlightEdge.v === e.v) ||
          (step.highlightEdge.u === e.v && step.highlightEdge.v === e.u));

      svgEdgesList.push(`
        <g>
          <line x1="${p1.x}" y1="${p1.y0}" x2="${p2.x}" y2="${p2.y0}" stroke="${onPathL0 ? '#10b981' : isCurL0 ? '#f59e0b' : '#334155'}" stroke-width="${onPathL0 ? 3.5 : isCurL0 ? 2.5 : 1.5}" />
          <text x="${(p1.x + p2.x) / 2}" y="${(p1.y0 + p2.y0) / 2 - 5}" fill="${onPathL0 ? '#34d399' : '#64748b'}" font-size="8" font-family="monospace" text-anchor="middle">w:${e.w}</text>
        </g>
      `);

      // Layer 1 regular edge
      const onPathL1 = isPathEdge(`${e.u},1`, `${e.v},1`);
      const isCurL1 =
        step.highlightEdge &&
        !step.highlightEdge.isFree &&
        step.highlightEdge.fromK === 1 &&
        ((step.highlightEdge.u === e.u && step.highlightEdge.v === e.v) ||
          (step.highlightEdge.u === e.v && step.highlightEdge.v === e.u));

      svgEdgesList.push(`
        <g>
          <line x1="${p1.x}" y1="${p1.y1}" x2="${p2.x}" y2="${p2.y1}" stroke="${onPathL1 ? '#10b981' : isCurL1 ? '#f59e0b' : '#334155'}" stroke-width="${onPathL1 ? 3.5 : isCurL1 ? 2.5 : 1.5}" />
          <text x="${(p1.x + p2.x) / 2}" y="${(p1.y1 + p2.y1) / 2 - 5}" fill="${onPathL1 ? '#34d399' : '#64748b'}" font-size="8" font-family="monospace" text-anchor="middle">w:${e.w}</text>
        </g>
      `);

      // Cross layer free edges (0->1 from u to v, and from v to u)
      const onPathCrossUV = isPathEdge(`${e.u},0`, `${e.v},1`);
      const isCurCrossUV =
        step.highlightEdge &&
        step.highlightEdge.isFree &&
        step.highlightEdge.u === e.u &&
        step.highlightEdge.v === e.v;

      svgEdgesList.push(`
        <g>
          <line x1="${p1.x}" y1="${p1.y0}" x2="${p2.x}" y2="${p2.y1}" stroke="${onPathCrossUV ? '#10b981' : isCurCrossUV ? '#f59e0b' : '#059669'}" stroke-width="${onPathCrossUV ? 3.5 : 1.5}" stroke-dasharray="${onPathCrossUV ? 'none' : '3,3'}" />
          <text x="${(p1.x + p2.x) / 2 + 10}" y="${(p1.y0 + p2.y1) / 2}" fill="#10b981" font-size="7.5" font-family="monospace" text-anchor="middle">免(0)</text>
        </g>
      `);
    }

    const svgNodesList: string[] = [];
    for (let u = 0; u < n; u++) {
      const p = nodeCoords[u];
      if (!p) continue;

      const id0 = `${u},0`;
      const isCur0 = step.curNode === u && step.curK === 0;
      const isVis0 = step.visitedSet.includes(id0);
      const d0 = step.distGrid[id0];

      svgNodesList.push(`
        <g>
          <circle cx="${p.x}" cy="${p.y0}" r="14" fill="${isCur0 ? '#b45309' : isVis0 ? '#0369a1' : '#1e293b'}" stroke="${isCur0 ? '#facc15' : isVis0 ? '#38bdf8' : '#475569'}" stroke-width="${isCur0 ? 2.5 : 1.5}" />
          <text x="${p.x}" y="${p.y0 + 4}" fill="#ffffff" font-size="9.5" font-weight="800" font-family="monospace" text-anchor="middle">${u},0</text>
          <text x="${p.x}" y="${p.y0 + 24}" fill="${d0 !== undefined ? '#34d399' : '#64748b'}" font-size="8" font-weight="700" text-anchor="middle">d:${d0 !== undefined ? d0 : '∞'}</text>
        </g>
      `);

      const id1 = `${u},1`;
      const isCur1 = step.curNode === u && step.curK === 1;
      const isVis1 = step.visitedSet.includes(id1);
      const d1 = step.distGrid[id1];

      svgNodesList.push(`
        <g>
          <circle cx="${p.x}" cy="${p.y1}" r="14" fill="${isCur1 ? '#b45309' : isVis1 ? '#db2777' : '#1e293b'}" stroke="${isCur1 ? '#facc15' : isVis1 ? '#f472b6' : '#475569'}" stroke-width="${isCur1 ? 2.5 : 1.5}" />
          <text x="${p.x}" y="${p.y1 + 4}" fill="#ffffff" font-size="9.5" font-weight="800" font-family="monospace" text-anchor="middle">${u},1</text>
          <text x="${p.x}" y="${p.y1 + 24}" fill="${d1 !== undefined ? '#34d399' : '#64748b'}" font-size="8" font-weight="700" text-anchor="middle">d:${d1 !== undefined ? d1 : '∞'}</text>
        </g>
      `);
    }

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; justify-content: flex-start; align-items: stretch; background: #0b0f19; padding: 12px; border-radius: 8px; box-sizing: border-box; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 700;">✈️ 飞行网络双层拓扑</span>
          <span style="font-size: 11px; color: #e2e8f0; background: #1e293b; padding: 2px 8px; border-radius: 4px; border: 1px solid #334155;">
            当前出堆城市: <b style="color: #f59e0b;">Node ${step.curNode} (usedK: ${step.curK})</b>
          </span>
        </div>

        <div style="width: 100%; min-height: 180px; background: #0f172a; border-radius: 8px; display: flex; justify-content: center; align-items: center; border: 1px solid #334155;">
          <svg style="width: 100%; height: 180px;" viewBox="0 0 310 200">
            ${svgEdgesList.join('')}
            ${svgNodesList.join('')}
          </svg>
        </div>

        <!-- 底部免票跃迁舱 -->
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #cbd5e1;">🎫 分层图双转移模型舱</span>
            <div style="font-size: 11px; color: #38bdf8;">
              堆中候选状态: <b>${step.pqList.length}</b> 个
            </div>
          </div>

          <div style="display: flex; gap: 10px; font-size: 10.5px;">
            <div style="background: rgba(3, 105, 161, 0.3); border: 1px solid #0284c7; border-radius: 4px; padding: 4px 8px; color: #bae6fd;">
              <b>1. 同层购票:</b> dist[v][k] = cost + w
            </div>
            <div style="background: rgba(219, 39, 119, 0.3); border: 1px solid #db2777; border-radius: 4px; padding: 4px 8px; color: #fbcfe8;">
              <b>2. 跨层免单 (k&lt;K):</b> dist[v][k+1] = cost
            </div>
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const pqBadges =
      step.pqList.length > 0
        ? step.pqList
            .map(
              (item) =>
                `<span style="background: #1e293b; border: 1px solid #38bdf8; border-radius: 4px; padding: 2px 6px; color: #38bdf8; font-family: monospace; font-size: 10.5px;">(${item.u}, k:${item.used}, cost:${item.cost})</span>`
            )
            .join(' ')
        : '<span style="color: #94a3b8; font-size: 10.5px;">(空)</span>';

    const distKeys = Object.keys(step.distGrid);
    const distBadges = distKeys.map((k) => `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 38px; height: 32px; background: #1e293b; border: 1px solid #334155; border-radius: 4px; color: #34d399; font-family: monospace; font-size: 11px; font-weight: 700;">
        <span style="font-size: 8px; color: #94a3b8;">(${k})</span>
        <span>${step.distGrid[k]}</span>
      </div>
    `).join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #cbd5e1; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 120px; color: #38bdf8;">distance[u][k]:</span>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">${distBadges}</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
            <span style="color: #a855f7; font-size: 10.5px; font-weight: 700;">小根堆优先队列:</span>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">${pqBadges}</div>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'layered-dijkstra',
  name: '飞行路线 (Flight Path / 分层图最短路)',
  viewId: 'algo-layered-dijkstra-view',
  category: 'graph',
  description: '左程云算法通关课 Class 064 核心：洛谷 P4568 飞行路线、二维状态 (node, usedK)、同层常规边与跨层 0 权免票边、Dijkstra 堆优化求解',
  icon: '✈️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 21,
  learningGoal: '掌握分层图的思想与建模范式、同层/跨层边的构建以及与动态规划状态压缩的内在联系',
});

export { Visualizer as LayeredDijkstraVisualizer };
