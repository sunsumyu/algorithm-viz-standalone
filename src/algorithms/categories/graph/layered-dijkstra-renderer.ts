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

export interface LayeredStep {
  curNode: number;
  curK: number;
  curDist: number;
  distGrid: Record<string, number>;
  pqList: Array<{ u: number; k: number; cost: number }>;
  visitedSet: string[];
  highlightEdge?: { u: number; v: number; fromK: number; toK: number; isFree: boolean } | null;
  pathEdgeKeys?: string[];
  status: 'init' | 'relax_edge' | 'pop' | 'reach' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildLayeredDijkstraSteps(): LayeredStep[] {
  const steps: LayeredStep[] = [];

  // Step 1: 初始化与起点入堆
  steps.push({
    curNode: 1,
    curK: 0,
    curDist: 0,
    distGrid: { '1,0': 0 },
    pqList: [{ u: 1, k: 0, cost: 0 }],
    visitedSet: [],
    highlightEdge: null,
    pathEdgeKeys: [],
    status: 'init',
    message: '1. [初始化] 起点城市 1 在第 0 层 (未用免费券)，dist[1][0] = 0，初始状态 (Node:1, k:0, cost:0) 压入小根堆！',
    log: '初始化：dist[1][0]=0, 初始状态 (Node:1, k:0, cost:0) 入小根堆',
    codeLine: [93, 95],
  });

  // Step 2: 弹出起点并松弛 1->2 (同层与跨层)
  steps.push({
    curNode: 1,
    curK: 0,
    curDist: 0,
    distGrid: { '1,0': 0, '2,0': 5, '2,1': 0 },
    pqList: [
      { u: 2, k: 1, cost: 0 },
      { u: 2, k: 0, cost: 5 },
    ],
    visitedSet: ['1,0'],
    highlightEdge: { u: 1, v: 2, fromK: 0, toK: 1, isFree: true },
    pathEdgeKeys: ['1,0->2,1'],
    status: 'relax_edge',
    message: '2. [弹出 (1, k:0) 并松弛航线 (1➔2, w:5)] 分支① 正常购票：dist[2][0] = 0 + 5 = 5 入堆；分支② 使用免费券(used<1)：dist[2][1] = 0 + 0 = 0 跨层入堆！',
    log: '松弛 (1➔2)：同层更新 dist[2][0]=5，跨层免票更新 dist[2][1]=0 (入小根堆)',
    codeLine: [105, 116],
  });

  // Step 3: 小根堆弹出最优状态 (2, k:1, cost:0)
  steps.push({
    curNode: 2,
    curK: 1,
    curDist: 0,
    distGrid: { '1,0': 0, '2,0': 5, '2,1': 0 },
    pqList: [{ u: 2, k: 0, cost: 5 }],
    visitedSet: ['1,0', '2,1'],
    highlightEdge: null,
    pathEdgeKeys: ['1,0->2,1'],
    status: 'pop',
    message: '3. [堆顶弹出最小状态] 弹出 cost=0 的最优状态 (Node:2, usedK:1)，标记 visited[2][1]=true，准备扩展邻接航线！',
    log: '堆顶出队：(Node:2, k:1, cost:0)，已消耗 1 张免费票',
    codeLine: [98, 102],
  });

  // Step 4: 松弛 2->3 (同层购票，免费票已耗尽)
  steps.push({
    curNode: 2,
    curK: 1,
    curDist: 0,
    distGrid: { '1,0': 0, '2,0': 5, '2,1': 0, '3,1': 2 },
    pqList: [
      { u: 3, k: 1, cost: 2 },
      { u: 2, k: 0, cost: 5 },
    ],
    visitedSet: ['1,0', '2,1'],
    highlightEdge: { u: 2, v: 3, fromK: 1, toK: 1, isFree: false },
    pathEdgeKeys: ['1,0->2,1', '2,1->3,1'],
    status: 'relax_edge',
    message: '4. [松弛航线 (2➔3, w:2)] 分支① 正常购票：dist[3][1] = 0 + 2 = 2 入堆；分支② 免费票已耗尽(used=1 == k)，不可再跨层！',
    log: '松弛 (2➔3)：同层更新 dist[3][1]=2 入堆；免费券已用尽不可跨层',
    codeLine: [107, 111],
  });

  // Step 5: 小根堆弹出最优状态 (3, k:1, cost:2)
  steps.push({
    curNode: 3,
    curK: 1,
    curDist: 2,
    distGrid: { '1,0': 0, '2,0': 5, '2,1': 0, '3,1': 2 },
    pqList: [{ u: 2, k: 0, cost: 5 }],
    visitedSet: ['1,0', '2,1', '3,1'],
    highlightEdge: null,
    pathEdgeKeys: ['1,0->2,1', '2,1->3,1'],
    status: 'pop',
    message: '5. [堆顶弹出终点状态] 弹出 cost=2 的状态 (Node:3, usedK:1)，检测到已到达目标终点城市 3！',
    log: '堆顶出队：(Node:3, k:1, cost:2)，命中终点 T=3',
    codeLine: [98, 103],
  });

  // Step 6: 终点命中提前返回
  steps.push({
    curNode: 3,
    curK: 1,
    curDist: 2,
    distGrid: { '1,0': 0, '2,0': 5, '2,1': 0, '3,1': 2 },
    pqList: [],
    visitedSet: ['1,0', '2,1', '3,1'],
    highlightEdge: null,
    pathEdgeKeys: ['1,0->2,1', '2,1->3,1'],
    status: 'reach',
    message: '6. [最优解锁定] if (u == t) return cost 触发提前返回！根据 Dijkstra 贪心性质，首次出堆的目标点必为全局最小花费 2！',
    log: '✓ 判定命中终点：当前花费 2 即为全局最优解，提前退出循环',
    codeLine: [103, 103],
  });

  // Step 7: 结算与复原
  steps.push({
    curNode: 3,
    curK: 1,
    curDist: 2,
    distGrid: { '1,0': 0, '2,0': 5, '2,1': 0, '3,1': 2 },
    pqList: [],
    visitedSet: ['1,0', '2,1', '3,1'],
    highlightEdge: null,
    pathEdgeKeys: ['1,0->2,1', '2,1->3,1'],
    status: 'done',
    message: '🎉 [飞行路线最少花费求解完成] 最优路径：(1, k:0) ➔[免费票 0]➔ (2, k:1) ➔[航费 2]➔ (3, k:1)，总航费仅需 2！比全程原价买票(5+2=7)节省了 5！',
    log: '✓ 飞行路线求解完成：最小总花费 = 2, 使用 1 次免费通票',
    codeLine: [120, 122],
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
    { label: '3 节点 1 次免票图 (P4568)', values: {} },
  ],
  metrics: [
    { id: 'metric-layer-state', label: '当前出队状态', color: '#2563eb' },
    { id: 'metric-layer-dist', label: '终点最少花费', color: '#10b981' },
  ],
  codeLanguages: LAYERED_DIJKSTRA_CODE_LANGUAGES,
  problemHtml: LAYERED_DIJKSTRA_PROBLEM_HTML,
  analysisHtml: LAYERED_DIJKSTRA_ANALYSIS_HTML,
  buildSteps: () => buildLayeredDijkstraSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<string, { x: number; y: number; layer: number }> = {
      '1,0': { x: 60, y: 70, layer: 0 },
      '2,0': { x: 160, y: 70, layer: 0 },
      '3,0': { x: 260, y: 70, layer: 0 },
      '1,1': { x: 60, y: 155, layer: 1 },
      '2,1': { x: 160, y: 155, layer: 1 },
      '3,1': { x: 260, y: 155, layer: 1 },
    };

    const edges = [
      { key: '1,0->2,0', u: '1,0', v: '2,0', w: 5, isFree: false },
      { key: '2,0->3,0', u: '2,0', v: '3,0', w: 2, isFree: false },
      { key: '1,1->2,1', u: '1,1', v: '2,1', w: 5, isFree: false },
      { key: '2,1->3,1', u: '2,1', v: '3,1', w: 2, isFree: false },
      { key: '1,0->2,1', u: '1,0', v: '2,1', w: 0, isFree: true },
      { key: '2,0->3,1', u: '2,0', v: '3,1', w: 0, isFree: true },
    ];

    const isPathEdge = (key: string) => step.pathEdgeKeys?.includes(key);

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const onPath = isPathEdge(e.key);
        const color = onPath ? '#10b981' : e.isFree ? '#059669' : '#475569';
        const width = onPath ? 3.5 : e.isFree ? 2 : 1.5;
        const dash = e.isFree && !onPath ? 'stroke-dasharray="4,4"' : '';
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 6;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${dash} />
            <text x="${midX}" y="${midY}" fill="${color}" font-size="8.5" font-weight="700" font-family="monospace" text-anchor="middle">${e.isFree ? '免票(0)' : `w:${e.w}`}</text>
          </g>
        `;
      })
      .join('');

    const svgNodes = Object.entries(nodeCoords)
      .map(([id, p]) => {
        const isL0 = p.layer === 0;
        const isCur = step.curNode === Number(id.split(',')[0]) && step.curK === p.layer;
        const isVis = step.visitedSet.includes(id);
        const bg = isCur ? '#b45309' : isVis ? (isL0 ? '#0369a1' : '#db2777') : '#1e293b';
        const border = isCur ? '#facc15' : isVis ? (isL0 ? '#38bdf8' : '#f472b6') : '#475569';
        const dist = step.distGrid[id];

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="16" fill="${bg}" stroke="${border}" stroke-width="${isCur ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${id}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="${dist !== undefined ? '#34d399' : '#64748b'}" font-size="8.5" font-weight="700" text-anchor="middle">d:${dist !== undefined ? dist : '∞'}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 320 210">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🔵 上层为第 0 层 (原价图) | 🌸 下层为第 1 层 (使用 1 次免费券) | 🟢 绿色粗线为最优分层最短路径
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
        const pqBadges = step.pqList.length > 0
          ? step.pqList.map(item => `<span style="background: #1e293b; border: 1px solid #38bdf8; border-radius: 4px; padding: 2px 6px; color: #38bdf8; font-family: monospace; font-size: 10.5px;">(${item.u}, k:${item.k}, cost:${item.cost})</span>`).join(' ')
          : '<span style="color: #94a3b8; font-size: 10.5px;">(空)</span>';

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
