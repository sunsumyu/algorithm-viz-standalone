/**
 * 朴素 Dijkstra (O(V^2)) 领域适配器 (Thin Domain Adapter)
 * 贪心选点、邻接边松弛、距离数组实时追踪与拓扑高亮 (左程云 class061)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  DIJKSTRA_BASIC_PROBLEM_HTML,
  DIJKSTRA_BASIC_ANALYSIS_HTML,
  DIJKSTRA_BASIC_CODE_LANGUAGES,
} from './dijkstra-basic-problem-content';
import { visualState } from '../../../core/renderers/visual-state-tokens';
import {
  DJB_NODES,
  DJB_EDGES,
  DJB_NODE_POSITIONS,
  renderDijkstraBasicCanvas,
} from '../../../core/renderers/adapters/dijkstra-graph-canvas-adapter';
import {
  buildDJBSteps,
  type DJBStep,
} from './dijkstra-basic-step-compiler';

export { DJB_NODES, DJB_EDGES, DJB_NODE_POSITIONS, renderDijkstraBasicCanvas };
export { buildDJBSteps, type DJBStep };

export const dijkstraBasicVisualizer = registerDeclarativeAlgorithm({
  id: 'dijkstra-basic',
  aliases: ['dijkstra-basic-061', 'dijkstra', 'naive-dijkstra', 'class061-dijkstra', 'dijkstra-naive'],
  name: 'Dijkstra 朴素最短路',
  category: 'graph',
  icon: '📍',
  difficulty: 2,
  levelOrder: 27,
  hasDeductionTree: true,
  description: '左程云算法通关课 Class 061：基于贪心策略与三角不等式松弛的单源最短路算法，适用于无负权图与稠密图',
  learningGoal: '掌握贪心选点、最短路锁定准则以及边松弛操作的核心本质',
  inputs: [],
  presets: [
    { label: '默认图 (5 节点)', values: {} },
  ],
  metrics: [
    { id: 'metric-cur-node', label: '当前节点 u', color: visualState('pivot').border },
    { id: 'metric-visited-nodes', label: '已锁定节点', color: visualState('sorted').border },
    { id: 'metric-relax-count', label: '松弛次数', color: visualState('secondary').border },
    { id: 'metric-dist-info', label: 'dist 距离表', color: visualState('comparing').border },
  ],
  legend: [
    { label: '已确定最短路', color: visualState('sorted').border },
    { label: '当前选出节点 u', color: visualState('pivot').border },
    { label: '正在松弛边', color: visualState('comparing').border },
    { label: '松弛成功', color: visualState('discovered').border },
  ],
  codeLanguages: DIJKSTRA_BASIC_CODE_LANGUAGES,
  problemHtml: DIJKSTRA_BASIC_PROBLEM_HTML,
  analysisHtml: DIJKSTRA_BASIC_ANALYSIS_HTML,
  generateSteps: () => buildDJBSteps(),
  renderCanvas: (container, step) => renderDijkstraBasicCanvas(container, step as DJBStep),
});
