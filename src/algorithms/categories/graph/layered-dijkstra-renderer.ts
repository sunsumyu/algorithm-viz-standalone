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
  status: 'init' | 'relax_normal' | 'relax_free' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildLayeredDijkstraSteps(): LayeredStep[] {
  const steps: LayeredStep[] = [];

  steps.push({
    curNode: 1,
    curK: 0,
    curDist: 0,
    distGrid: { '1,0': 0 },
    status: 'init',
    message: '1. [起点初始状态] 起点在第 0 层 (1, usedK:0)，累计耗费 dist = 0，压入小根堆！',
    log: '起点入堆：state(node:1, k:0, dist:0)',
    codeLine: [18, 25],
  });

  steps.push({
    curNode: 2,
    curK: 0,
    curDist: 5,
    distGrid: { '1,0': 0, '2,0': 5, '2,1': 0 },
    status: 'relax_free',
    message: '2. [使用 1 次免费通票跨层] 沿航线 (1 ➔ 2, w:5) 既可同层走 (dist:5)，也可使用免费通票跳转至第 1 层 (2, usedK:1, dist:0)！',
    log: '跨层免费转移：(1, k:0) ➔ (2, k:1), 边权为 0',
    codeLine: [28, 38],
  });

  steps.push({
    curNode: 3,
    curK: 1,
    curDist: 2,
    distGrid: { '1,0': 0, '2,0': 5, '2,1': 0, '3,1': 2 },
    status: 'done',
    message: '🎉 [到达终点 3] 从 (2, k:1) 走常规边 (2 ➔ 3, w:2) 到达终点，使用 1 次免费票的总花费仅为 2！',
    log: '✓ 到达终点 3：最优分层最短路 = 2',
    codeLine: [40, 46],
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
  card1Title: '🪜 K 层空间拓扑与跨层免费边沙盘',
  card2Title: '🧭 免费通票使用数与分层距离监视器',
  card2Desc: '第 0 层原图、第 1..K 层免票图与跨层 0 权有向边',
  legend: [
    { label: '第 0 层 (未使用免票)', color: '#0284c7' },
    { label: '第 1 层 (已用 1 次免票)', color: '#ec4899' },
    { label: '🟢 跨层免费边 (w = 0)', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '3 节点 1 次免票图 (P4568)', values: {} },
  ],
  metrics: [
    { id: 'metric-layer-state', label: '当前分层状态', color: '#2563eb' },
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
      { u: '1,0', v: '2,0', w: 5, isFree: false },
      { u: '2,0', v: '3,0', w: 2, isFree: false },
      { u: '1,1', v: '2,1', w: 5, isFree: false },
      { u: '2,1', v: '3,1', w: 2, isFree: false },
      { u: '1,0', v: '2,1', w: 0, isFree: true },
      { u: '2,0', v: '3,1', w: 0, isFree: true },
    ];

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const color = e.isFree ? '#10b981' : '#475569';
        const width = e.isFree ? 2.5 : 1.5;
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 6;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />
            <text x="${midX}" y="${midY}" fill="${color}" font-size="8.5" font-weight="700" font-family="monospace" text-anchor="middle">${e.isFree ? '免票(0)' : `w:${e.w}`}</text>
          </g>
        `;
      })
      .join('');

    const svgNodes = Object.entries(nodeCoords)
      .map(([id, p]) => {
        const isL0 = p.layer === 0;
        const isCur = step.curNode === Number(id.split(',')[0]) && step.curK === p.layer;
        const bg = isCur ? '#b45309' : isL0 ? '#0369a1' : '#db2777';
        const border = isCur ? '#facc15' : isL0 ? '#38bdf8' : '#f472b6';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${id}</text>
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
          🔵 上层为第 0 层 (原图) | 🌸 下层为第 1 层 (使用 1 次免票) | 🟢 绿色斜线为 0 权跨层边
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
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 分层图双转移模型:</span>
              <strong style="font-family: monospace; color: #2563eb;">1. 同层常规走: (u, k) ➔ (v, k), 权值 w; 2. 跨层免票走: (u, k) ➔ (v, k+1), 权值 0</strong>
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
