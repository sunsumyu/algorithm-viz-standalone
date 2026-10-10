/**
 * 寻找图中有效路径 (LC 1971 / 面试题 04.01) — 领域适配器
 * 遵循 Matt Pocock 深模块哲学：身材保持在 65 行内，委托给纯 SVG 适配器与步进编译器
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  FIND_ROUTE_PROBLEM_HTML,
  FIND_ROUTE_ANALYSIS_HTML,
  FIND_ROUTE_CODE_LANGUAGES,
} from './find-route-problem-content';
import {
  FindRouteStep,
  buildFindRouteSteps,
  FR_NODES,
  FR_EDGES,
  FR_NODE_POSITIONS,
  buildFRSteps,
  type FRStep,
} from './find-route-step-compiler';
import { renderFindRouteCanvas } from '../../../core/renderers/adapters/find-route-canvas-adapter';

registerDeclarativeAlgorithm({
  id: 'find-route',
  name: '寻找图中有效路径 (LC 1971)',
  category: 'graph',
  description: '使用广度优先搜索 (BFS) 与前驱节点映射判断无向图中两点连通性并重构路径',
  icon: '🧭',
  difficulty: 1,
  levelOrder: 20,
  learningGoal: '掌握无向图连通性判定与前驱记录回溯最短跳步路径',
  aliases: ['1971', 'valid-path', 'validPath', 'find-path'],
  metrics: [
    { id: 'metric-cur-node', label: '当前出队点', color: '#2563eb' },
    { id: 'metric-queue', label: '队列内容', color: '#3b82f6' },
    { id: 'metric-visited-count', label: '已访问节点', color: '#10b981' },
    { id: 'metric-found', label: '连通结果', color: '#16a34a' },
    { id: 'result-path', label: '最终路径', color: '#f59e0b' },
  ],
  legend: [
    { label: '当前出队点 u', color: '#2563eb' },
    { label: '已访问节点', color: '#16a34a' },
    { label: '最终路径边', color: '#f59e0b' },
    { label: '未访问节点', state: 'unvisited' },
  ],
  codeLanguages: FIND_ROUTE_CODE_LANGUAGES,
  problemHtml: FIND_ROUTE_PROBLEM_HTML,
  analysisHtml: FIND_ROUTE_ANALYSIS_HTML,
  generateSteps: () => buildFindRouteSteps(),
  renderCanvas: (container, step) => renderFindRouteCanvas(container, step as FindRouteStep),
});

export {
  renderFindRouteCanvas,
  buildFRSteps,
  buildFindRouteSteps,
  FR_NODES,
  FR_EDGES,
  FR_NODE_POSITIONS,
  type FRStep,
  type FindRouteStep,
};
