/**
 * 分层图最短路 (Layered Graph Shortest Path - 飞行路线 / K 次免费乘机 洛谷 P4568) 声明式可视化器
 * 核心：二维状态 (node, usedK) 分层图建模、同层常规转移、跨层 0 权免费边、Dijkstra 堆优化
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  LAYERED_DIJKSTRA_CODE_LANGUAGES,
  LAYERED_DIJKSTRA_PROBLEM_HTML,
  LAYERED_DIJKSTRA_ANALYSIS_HTML,
} from './layered-dijkstra-problem-content';

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
  codeLine: number | number[];
}

export function buildLayeredDijkstraSteps(presetKey: string = 'p4568_standard'): LayeredStep[] {
  const config = LAYERED_PRESETS[presetKey] || LAYERED_PRESETS.p4568_standard;
  const { n, k, s, t, edges } = config;
  const steps: LayeredStep[] = [];

  // Build adjacency list (bidirectional graph like P4568)
  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n }, () => []);
  for (const e of edges) {
    adj[e.u].push({ to: e.v, w: e.w });
    adj[e.v].push({ to: e.u, w: e.w });
  }

  // dist[u][used]
  const dist: number[][] = Array.from({ length: n }, () => Array(k + 1).fill(Infinity));
  const visited: boolean[][] = Array.from({ length: n }, () => Array(k + 1).fill(false));
  const parent: Record<string, { u: number; used: number; fromEdgeW: number; isFree: boolean } | null> = {};

  // Priority Queue: array of { u, used, cost }
  const pq: Array<{ u: number; used: number; cost: number }> = [];

  dist[s][0] = 0;
  pq.push({ u: s, used: 0, cost: 0 });

  const getDistGrid = () => {
    const res: Record<string, number> = {};
    for (let u = 0; u < n; u++) {
      for (let j = 0; j <= k; j++) {
        if (dist[u][j] !== Infinity) {
          res[`${u},${j}`] = dist[u][j];
        }
      }
    }
    return res;
  };

  const getVisitedList = () => {
    const list: string[] = [];
    for (let u = 0; u < n; u++) {
      for (let j = 0; j <= k; j++) {
        if (visited[u][j]) list.push(`${u},${j}`);
      }
    }
    return list;
  };

  // Step 1: Initial state
  steps.push({
    curNode: s,
    curK: 0,
    curDist: 0,
    distGrid: getDistGrid(),
    pqList: pq.map((p) => ({ ...p })),
    visitedSet: [],
    pathEdgeKeys: [],
    status: 'init',
    message: `1. [初始化] 起点城市 ${s} 在第 0 层 (未使用免费券)，dist[${s}][0] = 0，初始状态 (${s}, k:0, cost:0) 入小根堆！`,
    log: `初始化：dist[${s}][0]=0, 初始状态 (${s}, k:0, cost:0) 入堆`,
    codeLine: { from: 22, to: 24 },
  });

  let targetState: { u: number; used: number; cost: number } | null = null;

  while (pq.length > 0) {
    // Sort PQ to act as min-heap
    pq.sort((a, b) => a.cost - b.cost);
    const cur = pq.shift()!;
    const { u, used, cost } = cur;

    if (visited[u][used]) continue;
    visited[u][used] = true;

    // Record pop step
    steps.push({
      curNode: u,
      curK: used,
      curDist: cost,
      distGrid: getDistGrid(),
      pqList: pq.map((p) => ({ ...p })),
      visitedSet: getVisitedList(),
      pathEdgeKeys: [],
      status: 'pop',
      message: `[堆顶弹出状态] 弹出当前全局最小状态 (城市 ${u}, usedK: ${used}, 累计花费: ${cost})，标记 visited[${u}][${used}]=true。`,
      log: `堆顶出队：(Node:${u}, k:${used}, cost:${cost})`,
      codeLine: { from: 26, to: 28 },
    });

    if (u === t) {
      targetState = { u, used, cost };
      steps.push({
        curNode: u,
        curK: used,
        curDist: cost,
        distGrid: getDistGrid(),
        pqList: pq.map((p) => ({ ...p })),
        visitedSet: getVisitedList(),
        pathEdgeKeys: [],
        status: 'reach',
        message: `🎯 [命中目标终点] 状态 (城市 ${t}, usedK: ${used}) 首次从堆顶出队！根据 Dijkstra 贪心定理，当前花费 ${cost} 必为全局最优解！`,
        log: `✓ 命中终点：城市 ${t} (usedK: ${used})，最小花费 = ${cost}`,
        codeLine: 32,
      });
      break;
    }

    // Relax outgoing edges
    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;

      // Branch 1: Normal ticket (same layer)
      if (dist[v][used] > cost + w) {
        dist[v][used] = cost + w;
        pq.push({ u: v, used: used, cost: dist[v][used] });
        parent[`${v},${used}`] = { u, used, fromEdgeW: w, isFree: false };

        steps.push({
          curNode: u,
          curK: used,
          curDist: cost,
          distGrid: getDistGrid(),
          pqList: pq.map((p) => ({ ...p })),
          visitedSet: getVisitedList(),
          highlightEdge: { u, v, fromK: used, toK: used, isFree: false },
          pathEdgeKeys: [],
          status: 'relax_edge',
          message: `[同层常规买票] 航线 (${u}➔${v}, 票价:${w})：更新 dist[${v}][${used}] = ${cost} + ${w} = ${dist[v][used]}，状态 (${v}, k:${used}, cost:${dist[v][used]}) 入堆。`,
          log: `松弛航线 (${u}➔${v})：同层买票更新 dist[${v}][${used}]=${dist[v][used]}`,
          codeLine: { from: 37, to: 40 },
        });
      }

      // Branch 2: Free ticket (cross layer, if used < k)
      if (used < k && dist[v][used + 1] > cost) {
        dist[v][used + 1] = cost;
        pq.push({ u: v, used: used + 1, cost: cost });
        parent[`${v},${used + 1}`] = { u, used, fromEdgeW: 0, isFree: true };

        steps.push({
          curNode: u,
          curK: used,
          curDist: cost,
          distGrid: getDistGrid(),
          pqList: pq.map((p) => ({ ...p })),
          visitedSet: getVisitedList(),
          highlightEdge: { u, v, fromK: used, toK: used + 1, isFree: true },
          pathEdgeKeys: [],
          status: 'relax_edge',
          message: `✨ [使用免费通票跨层] 航线 (${u}➔${v}) 使用 1 张免费券：更新 dist[${v}][${used + 1}] = ${cost} + 0 = ${cost}，跨层状态 (${v}, k:${used + 1}, cost:${cost}) 入堆！`,
          log: `跨层免票 (${u}➔${v})：更新 dist[${v}][${used + 1}]=${cost} (0 权跨层边)`,
          codeLine: { from: 42, to: 45 },
        });
      }
    }
  }

  // Backtrack optimal path
  const bestPathKeys: string[] = [];
  if (targetState) {
    let currKey = `${targetState.u},${targetState.used}`;
    while (parent[currKey]) {
      const p = parent[currKey]!;
      bestPathKeys.unshift(`${p.u},${p.used}->${currKey}`);
      currKey = `${p.u},${p.used}`;
    }
  }

  // Final settlement step
  steps.push({
    curNode: t,
    curK: targetState ? targetState.used : 0,
    curDist: targetState ? targetState.cost : -1,
    distGrid: getDistGrid(),
    pqList: [],
    visitedSet: getVisitedList(),
    pathEdgeKeys: bestPathKeys,
    status: 'done',
    message: `🎉 [飞行路线全局最少花费求解完成] 从起点 ${s} 到终点 ${t}，使用 ${targetState?.used || 0} 张免费通票，最优最少总花费 = ${targetState?.cost ?? -1}！`,
    log: `✓ 求解完毕：全局最少花费 = ${targetState?.cost ?? -1}，路径重构完成`,
    codeLine: { from: 49, to: 51 },
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<LayeredStep>({
  id: 'layered-dijkstra',
  name: '飞行路线 (Flight Path / 分层图最短路)',
  category: 'graph',
  icon: '✈️',
  badge: {
    mode: '二维分层状态 (u, usedK)',
    complexity: 'O((V · K + E · K) log(V · K)) · O(V · K)',
  },
  card1Title: '✈️ K 层空间拓扑与跨层免费边沙盘',
  card2Title: '🧭 免费通票使用数与分层距离监视器',
  card2Desc: '第 0 层原图、第 1..K 层免票图与跨层 0 权有向边',
  legend: [
    { label: '第 0 层 (未使用免票)', color: '#0284c7' },
    { label: '第 1 层 (已用 1 次免票)', color: '#ec4899' },
    { label: '🟢 跨层免费边 (w = 0)', color: '#10b981' },
    { label: '⭐ 当前堆顶出队点', color: '#f59e0b' },
  ],
  inputs: [],
  presets: [
    { label: '洛谷 P4568 经典 5 城市 (1 次免票)', values: {} },
  ],
  metrics: [
    { id: 'metric-layer-state', label: '当前出队状态', color: '#2563eb' },
    { id: 'metric-layer-dist', label: '终点最少花费', color: '#10b981' },
  ],
  codeLanguages: LAYERED_DIJKSTRA_CODE_LANGUAGES,
  problemHtml: LAYERED_DIJKSTRA_PROBLEM_HTML,
  analysisHtml: LAYERED_DIJKSTRA_ANALYSIS_HTML,
  buildSteps: () => buildLayeredDijkstraSteps('p4568_standard'),
  renderCanvas: (container, step) => {
    const preset = LAYERED_PRESETS.p4568_standard;
    const { n, edges, nodeCoords } = preset;

    const isPathEdge = (fromKey: string, toKey: string) => {
      const k1 = `${fromKey}->${toKey}`;
      const k2 = `${toKey}->${fromKey}`;
      return step.pathEdgeKeys?.includes(k1) || step.pathEdgeKeys?.includes(k2);
    };

    // Render same-layer edges and cross-layer free edges
    const svgEdgesList: string[] = [];

    for (const e of edges) {
      const p1 = nodeCoords[e.u];
      const p2 = nodeCoords[e.v];
      if (!p1 || !p2) continue;

      // Layer 0 edge
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

      // Layer 1 edge
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
      const onPathCrossVU = isPathEdge(`${e.v},0`, `${e.u},1`);
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

    // Render nodes across layers
    const svgNodesList: string[] = [];
    for (let u = 0; u < n; u++) {
      const p = nodeCoords[u];
      if (!p) continue;

      // Layer 0 node
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

      // Layer 1 node
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
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 215px;" viewBox="0 0 310 215">
          ${svgEdgesList.join('')}
          ${svgNodesList.join('')}
        </svg>
        <div style="font-size: 10px; color: #94a3b8; text-align: center; margin-top: 2px;">
          🔵 上层为第 0 层 (原价图) | 🌸 下层为第 1 层 (使用 1 次免费券) | 🟢 绿色粗线为最优分层最短路
        </div>
      </div>
    `;

    const root = container.closest('#algo-layered-dijkstra-view');
    if (root) {
      const sEl = root.querySelector('#metric-layer-state');
      const dEl = root.querySelector('#metric-layer-dist');

      if (sEl) sEl.textContent = `Node ${step.curNode}, usedK: ${step.curK}`;
      if (dEl) dEl.textContent = `${step.curDist}`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const pqBadges =
          step.pqList.length > 0
            ? step.pqList
                .map(
                  (item) =>
                    `<span style="background: #1e293b; border: 1px solid #38bdf8; border-radius: 4px; padding: 2px 6px; color: #38bdf8; font-family: monospace; font-size: 10px;">(${item.u}, k:${item.used}, cost:${item.cost})</span>`
                )
                .join(' ')
            : '<span style="color: #94a3b8; font-size: 10px;">(空)</span>';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #0f172a; font-weight: 700;">📦 小根堆队列 (PQ):</span>
              <div style="display: flex; gap: 4px; flex-wrap: wrap;">${pqBadges}</div>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 分层图双转移模型:</span>
              <strong style="font-family: monospace; color: #2563eb;">1. 同层买票: dist[v][k] = cost + w; 2. 跨层免单: dist[v][k+1] = cost</strong>
            </div>
          </div>
        `;
      }
    }
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
