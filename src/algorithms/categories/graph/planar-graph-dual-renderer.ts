/**
 * 平面图最小割转对偶图最短路 (Planar Graph Min-Cut to Dual Graph Shortest Path · 洛谷 P4001 狼抓兔子)
 * 进阶图论: 狼抓兔子、平面图每个面抽象为点、最小割等价于对偶图最短路、Dijkstra 极速求解
 * 遵循 Matt Pocock 深模块规范，委托 StepCompiler、CanvasAdapter 与 DeductionTree
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  PLANAR_DUAL_CODE_LANGUAGES,
  PLANAR_DUAL_PROBLEM_HTML,
  PLANAR_DUAL_ANALYSIS_HTML,
} from './planar-graph-dual-problem-content';
import {
  buildPlanarDualSteps,
  type PlanarStep,
} from './planar-graph-dual-step-compiler';
import {
  renderPlanarGraphDualCanvas,
  renderPlanarGraphDualCustomMetrics,
} from '../../../core/renderers/adapters/planar-graph-dual-canvas-adapter';

export { buildPlanarDualSteps, type PlanarStep };

const { template, Visualizer } = createDeclarativeVisualizer<PlanarStep>({
  id: 'planar-graph-dual',
  name: '平面图最小割转对偶最短路 (Planar Dual)',
  category: 'graph',
  icon: '🌐',
  badge: {
    mode: '对偶图 Dijkstra 最短路',
    complexity: 'O(E log V) · O(V + E)',
  },
  card1Title: '🌐 平面网格图与对偶图穿透沙盘',
  card2Title: '🧭 对偶面距离 dist[F_i] 监视器',
  card2Desc: '各面抽象对偶节点、跨边权值映射与最小割对应关系',
  hasDeductionTree: true,
  legend: [
    { label: '原图网格节点 (S, 1..4, T)', color: '#0284c7' },
    { label: '⭐ 对偶点 (S*, T*, F1..F4)', color: '#f59e0b' },
    { label: '🔴 最小割被切原边', state: 'swapping' },
    { label: '🟢 对偶图最优最短路径', state: 'discovered' },
  ],
  inputs: [],
  presets: [
    { label: '2x2 网格经典狼抓兔子 (P4001)', values: {} },
  ],
  metrics: [
    { id: 'metric-cur-face', label: '当前对偶面', color: '#f59e0b' },
    { id: 'metric-min-cut', label: '对偶最短路 (最小割)', color: '#10b981' },
    { id: 'metric-pq-top', label: '堆顶候选', color: '#38bdf8' },
    { id: 'metric-visited-count', label: '已访问对偶点', color: '#8b5cf6' },
  ],
  codeLanguages: PLANAR_DUAL_CODE_LANGUAGES,
  problemHtml: PLANAR_DUAL_PROBLEM_HTML,
  analysisHtml: PLANAR_DUAL_ANALYSIS_HTML,
  buildSteps: () => buildPlanarDualSteps(),
  renderCanvas: (container, step) => {
    renderPlanarGraphDualCanvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    renderPlanarGraphDualCustomMetrics(container, step);
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
