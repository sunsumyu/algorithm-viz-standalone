/**
 * 拓扑排序与 DAG 动态规划 (Topological DP - 最长路与关键路径) 声明式可视化器
 * 核心：DAG 无后效性、拓扑序线性递推 dp[v] = max(dp[v], dp[u] + w)、工程关键路径 CPM
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TOPO_DP_CODE_LANGUAGES,
  TOPO_DP_PROBLEM_HTML,
  TOPO_DP_ANALYSIS_HTML,
} from './topo-dp-problem-content';

export interface TopoDPStep {
  curNode: number;
  dpDist: Record<number, number>;
  inDegrees: Record<number, number>;
  status: 'init' | 'relax' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildTopoDPSteps(): TopoDPStep[] {
  const steps: TopoDPStep[] = [];

  steps.push({
    curNode: 1,
    dpDist: { 1: 0, 2: 0, 3: 0, 4: 0 },
    inDegrees: { 1: 0, 2: 1, 3: 1, 4: 2 },
    status: 'init',
    message: '1. [拓扑 DP 初始化] 起点 1 入度为 0，dp[1] = 0 压入拓扑队列！',
    log: '初始化：起点 1 入度为 0, dp[1] = 0',
    codeLine: [15, 22],
  });

  steps.push({
    curNode: 2,
    dpDist: { 1: 0, 2: 3, 3: 2, 4: 0 },
    inDegrees: { 1: 0, 2: 0, 3: 0, 4: 2 },
    status: 'relax',
    message: '2. [弹出 1 并松弛出边] 1 ➔ 2 (w:3) 得到 dp[2]=3；1 ➔ 3 (w:2) 得到 dp[3]=2！2 与 3 入度清零入队！',
    log: '拓扑递推：dp[2] = max(0, 0+3)=3, dp[3] = 2',
    codeLine: [24, 32],
  });

  steps.push({
    curNode: 4,
    dpDist: { 1: 0, 2: 3, 3: 2, 4: 7 },
    inDegrees: { 1: 0, 2: 0, 3: 0, 4: 0 },
    status: 'done',
    message: '🎉 [终点 4 汇聚最长路径] 2 ➔ 4 (w:4) 产生 3+4=7；3 ➔ 4 (w:1) 产生 2+1=3！DAG 最长路径 dp[4] = 7！',
    log: '✓ 拓扑 DP 求解完成：DAG 关键路径 / 最长路 = 7',
    codeLine: [34, 40],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<TopoDPStep>({
  id: 'topo-dp',
  name: '拓扑排序与 DAG 动态规划 (Topo DP)',
  category: 'graph',
  icon: '📊',
  badge: {
    mode: 'DAG 拓扑递推 dp[v] = max',
    complexity: 'O(V + E) · O(V + E)',
  },
  card1Title: '📊 有向无环图与拓扑 DP 最长路沙盘',
  card2Title: '🧭 节点最长路 dp[u] 与入度监视器',
  card2Desc: '入度表 inDegree、拓扑序线性转移与最长关键路径',
  legend: [
    { label: '图节点 (1..4)', color: '#0284c7' },
    { label: '🟢 关键路径连边', color: '#10b981' },
    { label: '普通转移边', color: '#475569' },
  ],
  inputs: [],
  presets: [
    { label: '4 节点经典 DAG 最长路', values: {} },
  ],
  metrics: [
    { id: 'metric-topodp-cur', label: '当前出队节点', color: '#2563eb' },
    { id: 'metric-topodp-max', label: 'DAG 最长路 dp[4]', color: '#10b981' },
  ],
  codeLanguages: TOPO_DP_CODE_LANGUAGES,
  problemHtml: TOPO_DP_PROBLEM_HTML,
  analysisHtml: TOPO_DP_ANALYSIS_HTML,
  buildSteps: () => buildTopoDPSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 75, y: 110 },
      2: { x: 155, y: 55 },
      3: { x: 155, y: 165 },
      4: { x: 235, y: 110 },
    };

    const edges = [
      { u: 1, v: 2, w: 3 },
      { u: 1, v: 3, w: 2 },
      { u: 2, v: 4, w: 4 },
      { u: 3, v: 4, w: 1 },
    ];

    const isCritical = (u: number, v: number) => (u === 1 && v === 2) || (u === 2 && v === 4);

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const crit = isCritical(e.u, e.v);
        const color = crit ? '#10b981' : '#475569';
        const width = crit ? 2.5 : 1.5;
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 6;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" marker-end="url(#arrow-topodp)" />
            <text x="${midX}" y="${midY}" fill="${color}" font-size="8.5" font-weight="700" font-family="monospace" text-anchor="middle">w:${e.w}</text>
          </g>
        `;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const dp = step.dpDist[u];
        const isCur = step.curNode === u;

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${isCur ? '#b45309' : '#0369a1'}" stroke="${isCur ? '#facc15' : '#38bdf8'}" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="#34d399" font-size="8.5" font-weight="700" text-anchor="middle">dp:${dp}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          <defs>
            <marker id="arrow-topodp" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
          </defs>
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟢 绿色连线为关键路径 (1 ➔ 2 ➔ 4) | DAG 拓扑无后效性保证线性递推最长路
        </div>
      </div>
    `;

    const root = container.closest('#algo-topo-dp-view');
    if (root) {
      const cEl = root.querySelector('#metric-topodp-cur');
      const mEl = root.querySelector('#metric-topodp-max');

      if (cEl) cEl.textContent = `Node ${step.curNode}`;
      if (mEl) mEl.textContent = `${step.dpDist[4]}`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 拓扑 DP 转移状态机:</span>
              <strong style="font-family: monospace; color: #2563eb;">dp[v] = max(dp[v], dp[u] + w(u, v)) 按拓扑出队顺序线性递推</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'topo-dp',
  name: '拓扑排序与 DAG 动态规划 (Topo DP)',
  viewId: 'algo-topo-dp-view',
  category: 'graph',
  description: '经典图论 DP 基础：有向无环图拓扑排序、无后效性线性状态递推、工程关键路径 CPM 与 DAG 最长路求解',
  icon: '📊',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 25,
  learningGoal: '掌握拓扑排序在 DAG 上的 DP 状态递推原则、关键路径判定及最短/最长路求解',
});

export { Visualizer as TopoDPVisualizer };
