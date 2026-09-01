/**
 * 平面图最小割转对偶图最短路 (Planar Graph Min-Cut to Dual Graph Shortest Path) 声明式可视化器
 * 进阶图论: 狼抓兔子、平面图每个面抽象为点、最小割等价于对偶图最短路、Dijkstra 极速求解 (洛谷 P4001)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  PLANAR_DUAL_CODE_LANGUAGES,
  PLANAR_DUAL_PROBLEM_HTML,
  PLANAR_DUAL_ANALYSIS_HTML,
} from './planar-graph-dual-problem-content';

export interface PlanarStep {
  curDualNode: string;
  distMap: Record<string, number>;
  visitedDual: string[];
  dualPq: Array<{ node: string; dist: number }>;
  bestDualPath?: string[];
  cutPlanarEdges?: Array<{ u: string; v: string }>;
  minCutVal: number;
  status: 'init' | 'dijkstra' | 'reach' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildPlanarDualSteps(): PlanarStep[] {
  const steps: PlanarStep[] = [];

  steps.push({
    curDualNode: 'S*',
    distMap: { 'S*': 0, F1: Infinity, F2: Infinity, F3: Infinity, F4: Infinity, 'T*': Infinity },
    visitedDual: ['S*'],
    dualPq: [{ node: 'S*', dist: 0 }],
    minCutVal: 0,
    status: 'init',
    message: '🌐 [构建对偶图] 原图面 F1~F4 与外部无界面抽象为对偶点，左下面定义为源点 S*，右上面为汇点 T*。',
    log: '对偶图初始化：S* 到各面对偶点建图',
    codeLine: [15, 22],
  });

  steps.push({
    curDualNode: 'F1',
    distMap: { 'S*': 0, F1: 3, F2: 4, F3: Infinity, F4: Infinity, 'T*': Infinity },
    visitedDual: ['S*', 'F1'],
    dualPq: [
      { node: 'F1', dist: 3 },
      { node: 'F2', dist: 4 },
    ],
    minCutVal: 3,
    status: 'dijkstra',
    message: '⚡ [Dijkstra 松弛对偶面 F1] 跨越原图边 (S, 1) 对应对偶边权 3，更新 dist[F1] = 3！',
    log: 'Dijkstra 松弛：S* -> F1 (dist=3)',
    codeLine: [28, 35],
  });

  steps.push({
    curDualNode: 'F3',
    distMap: { 'S*': 0, F1: 3, F2: 4, F3: 5, F4: 7, 'T*': Infinity },
    visitedDual: ['S*', 'F1', 'F3'],
    dualPq: [
      { node: 'F3', dist: 5 },
      { node: 'F2', dist: 4 },
      { node: 'F4', dist: 7 },
    ],
    minCutVal: 5,
    status: 'dijkstra',
    message: '⚡ [松弛对偶面 F3] 跨越原图内部边 (1, 2) 对应对偶边权 2，dist[F3] = 3 + 2 = 5！',
    log: 'Dijkstra 松弛：F1 -> F3 (dist=5)',
    codeLine: [28, 35],
  });

  steps.push({
    curDualNode: 'T*',
    distMap: { 'S*': 0, F1: 3, F2: 4, F3: 5, F4: 7, 'T*': 8 },
    visitedDual: ['S*', 'F1', 'F3', 'T*'],
    dualPq: [{ node: 'T*', dist: 8 }],
    bestDualPath: ['S*', 'F1', 'F3', 'T*'],
    cutPlanarEdges: [
      { u: 'S', v: '1' },
      { u: '1', v: '2' },
      { u: '2', v: 'T' },
    ],
    minCutVal: 8,
    status: 'reach',
    message: '🎯 [到达对偶汇点 T*] 对偶图最短路径 S* ➔ F1 ➔ F3 ➔ T* 长度为 8，对应原图割边集合！',
    log: 'Dijkstra 到达 T*：最短路 = 8 (即原图最小割容量)',
    codeLine: [40, 45],
  });

  steps.push({
    curDualNode: 'T*',
    distMap: { 'S*': 0, F1: 3, F2: 4, F3: 5, F4: 7, 'T*': 8 },
    visitedDual: ['S*', 'F1', 'F3', 'T*'],
    dualPq: [],
    bestDualPath: ['S*', 'F1', 'F3', 'T*'],
    cutPlanarEdges: [
      { u: 'S', v: '1' },
      { u: '1', v: '2' },
      { u: '2', v: 'T' },
    ],
    minCutVal: 8,
    status: 'done',
    message: '🎉 [平面图最小割定理验证完成] 原图最小割容量 = 对偶图 S*-T* 最短路 = 8！用 Dijkstra O(E log V) 完美替代 O(V²E) 最大流！',
    log: '✓ 判定成功：原图 Min-Cut = 对偶图 Shortest-Path = 8',
    codeLine: 48,
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<PlanarStep>({
  id: 'planar-graph-dual',
  name: '平面图最小割转对偶最短路 (Planar Dual)',
  viewId: 'algo-planar-graph-dual-view',
  category: 'graph',
  icon: '🌐',
  badge: {
    mode: '对偶图 Dijkstra 最短路',
    complexity: 'O(E log V) · O(V + E)',
  },
  card1Title: '🌐 平面网格图与对偶图穿透沙盘',
  card2Title: '🧭 对偶面距离 dist[F_i] 监视器',
  card2Desc: '各面抽象对偶节点、跨边权值映射与最小割对应关系',
  legend: [
    { label: '原图网格节点 (S, 1..4, T)', color: '#0284c7' },
    { label: '⭐ 对偶点 (S*, T*, F1..F4)', color: '#f59e0b' },
    { label: '🔴 最小割被切原边', color: '#ef4444' },
    { label: '🟢 对偶图最优最短路径', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '2x2 网格经典狼抓兔子 (P4001)', values: {} },
  ],
  metrics: [
    { id: 'metric-cur-face', label: '当前对偶面', color: '#f59e0b' },
    { id: 'metric-min-cut', label: '对偶最短路 (最小割)', color: '#10b981' },
  ],
  codeLanguages: PLANAR_DUAL_CODE_LANGUAGES,
  problemHtml: PLANAR_DUAL_PROBLEM_HTML,
  analysisHtml: PLANAR_DUAL_ANALYSIS_HTML,
  buildSteps: () => buildPlanarDualSteps(),
  renderCanvas: (container, step) => {
    const isDone = step.status === 'reach' || step.status === 'done';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          <!-- 原图网格边 (灰底/红割) -->
          <line x1="60" y1="150" x2="155" y2="150" stroke="${isDone ? '#ef4444' : '#475569'}" stroke-width="${isDone ? 3 : 1.5}" />
          <line x1="155" y1="150" x2="250" y2="150" stroke="#475569" stroke-width="1.5" />
          <line x1="60" y1="50" x2="155" y2="50" stroke="#475569" stroke-width="1.5" />
          <line x1="155" y1="50" x2="250" y2="50" stroke="${isDone ? '#ef4444' : '#475569'}" stroke-width="${isDone ? 3 : 1.5}" />
          <line x1="60" y1="50" x2="60" y2="150" stroke="#475569" stroke-width="1.5" />
          <line x1="155" y1="50" x2="155" y2="150" stroke="${isDone ? '#ef4444' : '#475569'}" stroke-width="${isDone ? 3 : 1.5}" />
          <line x1="250" y1="50" x2="250" y2="150" stroke="#475569" stroke-width="1.5" />

          <!-- 对偶图最短路 (绿线穿透) -->
          ${
            isDone
              ? `
            <line x1="40" y1="180" x2="105" y2="100" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4,4" />
            <line x1="105" y1="100" x2="205" y2="100" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4,4" />
            <line x1="205" y1="100" x2="270" y2="20" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4,4" />
          `
              : ''
          }

          <!-- 原图节点 -->
          <g><circle cx="60" cy="150" r="11" fill="#0284c7" /><text x="60" y="154" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">S</text></g>
          <g><circle cx="155" cy="150" r="11" fill="#0284c7" /><text x="155" y="154" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">1</text></g>
          <g><circle cx="250" cy="150" r="11" fill="#0284c7" /><text x="250" y="154" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">2</text></g>
          <g><circle cx="60" cy="50" r="11" fill="#0284c7" /><text x="60" y="54" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">3</text></g>
          <g><circle cx="155" cy="50" r="11" fill="#0284c7" /><text x="155" y="54" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">4</text></g>
          <g><circle cx="250" cy="50" r="11" fill="#0284c7" /><text x="250" y="54" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">T</text></g>

          <!-- 对偶点 -->
          <g><circle cx="40" cy="180" r="12" fill="#f59e0b" /><text x="40" y="184" fill="#ffffff" font-size="9.5" font-weight="800" text-anchor="middle">S*</text></g>
          <g><circle cx="105" cy="100" r="10" fill="#f59e0b" /><text x="105" y="104" fill="#ffffff" font-size="8.5" font-weight="800" text-anchor="middle">F1</text></g>
          <g><circle cx="205" cy="100" r="10" fill="#f59e0b" /><text x="205" y="104" fill="#ffffff" font-size="8.5" font-weight="800" text-anchor="middle">F3</text></g>
          <g><circle cx="270" cy="20" r="12" fill="#f59e0b" /><text x="270" y="24" fill="#ffffff" font-size="9.5" font-weight="800" text-anchor="middle">T*</text></g>
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟢 绿色虚线为对偶图从 S* 到 T* 的最短路径 | 🔴 红色为对应的原图最小割割边
        </div>
      </div>
    `;

    const root = container.closest('#algo-planar-graph-dual-view');
    if (root) {
      const faceEl = root.querySelector('#metric-cur-face');
      const cutEl = root.querySelector('#metric-min-cut');

      if (faceEl) faceEl.textContent = step.curDualNode;
      if (cutEl) cutEl.textContent = `${step.minCutVal}`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const distItems = Object.entries(step.distMap)
          .map(([f, d]) => `<span style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10.5px;">${f}: <strong style="color: #2563eb;">${d === Infinity ? '∞' : d}</strong></span>`)
          .join(' ');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>对偶面距离表 dist[F]:</span>
              <div style="display: flex; gap: 4px;">${distItems}</div>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 平面图最小割对偶定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">MinCut(s, t) = ShortestPath(S*, T*)</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'planar-graph-dual',
  name: '平面图最小割转对偶最短路 (Planar Dual)',
  viewId: 'algo-planar-graph-dual-view',
  category: 'graph',
  description: '进阶图论经典对偶转化：平面图每个面抽象为点、最小割等价于对偶图最短路、Dijkstra 极速求解 (洛谷 P4001 狼抓兔子)',
  icon: '🌐',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 66,
  learningGoal: '掌握平面图面与对偶点的构造对应关系、最小割转对偶最短路的严格数学证明与 Dijkstra 加速',
});

export { Visualizer as PlanarGraphDualVisualizer };
