/**
 * 无向图割点与桥 (Tarjan Cut Vertices & Bridges) 声明式可视化器
 * 图论经典: 时间戳 dfn[u] 与追溯值 low[u]、割点判定 low[v] >= dfn[u]、桥/割边判定 low[v] > dfn[u] (洛谷 P3388)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TARJAN_BRIDGE_CODE_LANGUAGES,
  TARJAN_BRIDGE_PROBLEM_HTML,
  TARJAN_BRIDGE_ANALYSIS_HTML,
} from './tarjan-bridge-problem-content';

export interface BridgeStep {
  dfnMap: Record<number, number>;
  lowMap: Record<number, number>;
  cutNodes: number[];
  bridgeEdges: Array<[number, number]>;
  curNode: number;
  status: 'dfs' | 'cut' | 'bridge' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildTarjanBridgeSteps(): BridgeStep[] {
  const steps: BridgeStep[] = [];

  steps.push({
    dfnMap: { 1: 1, 2: 2, 3: 3, 4: 4 },
    lowMap: { 1: 1, 2: 1, 3: 1, 4: 4 },
    cutNodes: [],
    bridgeEdges: [],
    curNode: 3,
    status: 'dfs',
    message: '1. [DFS 树与反向边更新] 环 (1-2-3-1) 的 low 值均被反向边更新为 1。遍历探索节点 4！',
    log: 'DFS 遍历：dfn[1..4]=[1,2,3,4], low[1..3]=1, low[4]=4',
    codeLine: [18, 25],
  });

  steps.push({
    dfnMap: { 1: 1, 2: 2, 3: 3, 4: 4 },
    lowMap: { 1: 1, 2: 1, 3: 1, 4: 4 },
    cutNodes: [3],
    bridgeEdges: [[3, 4]],
    curNode: 3,
    status: 'done',
    message: '🎉 [割点与桥判定完成] 节点 4 的 low[4] = 4 > dfn[3] = 3，判定边 (3, 4) 为桥！同时节点 3 为割点！',
    log: '✓ 判定完成：割点集 = {3}，桥边集 = {(3, 4)}',
    codeLine: [28, 36],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<BridgeStep>({
  id: 'tarjan-bridge',
  name: '割点与桥 (Cut Vertices & Bridges)',
  category: 'graph',
  icon: '🌉',
  badge: {
    mode: 'Tarjan low/dfn 定理',
    complexity: 'O(V + E) · O(V + E)',
  },
  card1Title: '🌉 无向图连通度与割点/割边沙盘',
  card2Title: '🧭 dfn/low 时间戳与割点/桥监视器',
  card2Desc: '割点判据 low[v] >= dfn[u] 与 桥判据 low[v] > dfn[u]',
  legend: [
    { label: '普通图节点', color: '#0284c7' },
    { label: '👑 割点 (Cut Vertex)', color: '#f59e0b' },
    { label: '🔴 桥 / 割边 (Bridge)', color: '#ef4444' },
  ],
  inputs: [],
  presets: [
    { label: '4 节点经典带桥图 (P3388)', values: {} },
  ],
  metrics: [
    { id: 'metric-cut-count', label: '割点总数', color: '#f59e0b' },
    { id: 'metric-bridge-count', label: '桥边总数', color: '#ef4444' },
  ],
  codeLanguages: TARJAN_BRIDGE_CODE_LANGUAGES,
  problemHtml: TARJAN_BRIDGE_PROBLEM_HTML,
  analysisHtml: TARJAN_BRIDGE_ANALYSIS_HTML,
  buildSteps: () => buildTarjanBridgeSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 75, y: 75 },
      2: { x: 75, y: 155 },
      3: { x: 155, y: 110 },
      4: { x: 235, y: 110 },
    };

    const edges = [
      { u: 1, v: 2 },
      { u: 2, v: 3 },
      { u: 3, v: 1 },
      { u: 3, v: 4 },
    ];

    const isBridge = (u: number, v: number) => step.bridgeEdges.some(([bu, bv]) => (bu === u && bv === v) || (bu === v && bv === u));

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const bridge = isBridge(e.u, e.v);
        const color = bridge ? '#ef4444' : '#475569';
        const width = bridge ? 3 : 1.5;
        const dash = bridge ? 'stroke-dasharray="4,4"' : '';

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${dash} />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isCut = step.cutNodes.includes(u);
        const bg = isCut ? '#b45309' : '#0369a1';
        const border = isCut ? '#facc15' : '#38bdf8';
        const dfn = step.dfnMap[u] || 0;
        const low = step.lowMap[u] || 0;

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="#34d399" font-size="8.5" font-weight="700" text-anchor="middle">${dfn}/${low}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟡 金色为割点 Node 3 | 🔴 红色虚线为桥边 (3, 4) | 节点标注 dfn/low
        </div>
      </div>
    `;

    const root = container.closest('#algo-tarjan-bridge-view');
    if (root) {
      const cEl = root.querySelector('#metric-cut-count');
      const bEl = root.querySelector('#metric-bridge-count');

      if (cEl) cEl.textContent = `${step.cutNodes.length} 个`;
      if (bEl) bEl.textContent = `${step.bridgeEdges.length} 条`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 割点与桥判据:</span>
              <strong style="font-family: monospace; color: #2563eb;">割点: low[v] >= dfn[u]; 桥: low[v] > dfn[u]</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'tarjan-bridge',
  name: '割点与桥 (Cut Vertices & Bridges)',
  viewId: 'algo-tarjan-bridge-view',
  category: 'graph',
  description: '无向图连通性基石：Tarjan 深度优先搜索树、dfn 与 low 追溯值、严格判定割点与桥 (洛谷 P3388)',
  icon: '🌉',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 32,
  learningGoal: '掌握无向图割点和桥的 Tarjan 判定充要条件、根节点的特殊两子树讨论及边双/点双联通分量关系',
});

export { Visualizer as TarjanBridgeVisualizer };
