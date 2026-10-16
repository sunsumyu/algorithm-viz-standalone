/**
 * 所有可能的路径 (LC 797) — 领域适配器
 * 遵循 Matt Pocock 深模块哲学：身材保持在 65 行内，委托给纯 SVG 适配器与步进编译器
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  REACHABLE_PATHS_PROBLEM_HTML,
  REACHABLE_PATHS_ANALYSIS_HTML,
  REACHABLE_PATHS_CODE_LANGUAGES,
} from './reachable-paths-problem-content';
import {
  type RPStep,
  type ReachablePathsStep,
  DAG_NODES,
  DAG_EDGES,
  DAG_POSITIONS,
  DEFAULT_GRAPH,
  buildReachableSteps,
  parseGraphInput,
  withMetrics,
} from './reachable-paths-step-compiler';
import {
  renderReachablePathsCanvas,
  renderReachablePathsCustomMetrics,
} from '../../../core/renderers/adapters/reachable-paths-canvas-adapter';

registerDeclarativeAlgorithm({
  id: 'reachable-paths',
  name: '所有可能的路径 (LC 797)',
  category: 'graph',
  description: '回溯 DFS 搜索有向无环图 (DAG) 中从源点到目标点的所有可能路径',
  icon: '🎯',
  difficulty: 2,
  levelOrder: 21,
  learningGoal: '掌握 DAG 上的深度优先回溯搜索与路径压栈恢复机制',
  aliases: ['797', 'all-paths-source-target', 'allPathsSourceTarget'],
  inputs: [
    {
      id: 'graph',
      label: '邻接表 (每行一个节点的邻居)',
      type: 'text',
      defaultValue: '1 2\n3\n3\n',
      placeholder: '每行如 1 2',
    },
  ],
  presets: [
    { label: '默认 DAG (4 节点)', values: { graph: '1 2\n3\n3\n' } },
    { label: '链式图 0→1→2→3', values: { graph: '1\n2\n3\n' } },
    { label: '星形图 (源点直连)', values: { graph: '1 2 3\n\n\n' } },
    { label: '5 节点 DAG', values: { graph: '1 2\n3\n3 4\n4\n' } },
  ],
  metrics: [
    { id: 'metric-rp-cur-node', label: '当前访问节点', color: '#2563eb' },
    { id: 'metric-rp-path', label: '当前路径 path', color: '#eab308' },
    { id: 'metric-rp-action', label: '当前动作', color: '#a855f7' },
    { id: 'metric-rp-total', label: '已发现路径数', color: '#16a34a' },
  ],
  legend: [
    { label: '当前访问栈 path', color: '#2563eb' },
    { label: '命中目标路径', color: '#16a34a' },
    { label: '路径途经节点', color: '#facc15' },
    { label: '待遍历边', state: 'unvisited' },
  ],
  codeLanguages: REACHABLE_PATHS_CODE_LANGUAGES,
  problemHtml: REACHABLE_PATHS_PROBLEM_HTML,
  analysisHtml: REACHABLE_PATHS_ANALYSIS_HTML,
  generateSteps: (inputs) => withMetrics(buildReachableSteps(parseGraphInput(inputs?.graph))),
  renderCanvas: (container, step) => renderReachablePathsCanvas(container, step as RPStep),
  renderCustomMetrics: (container, step) => renderReachablePathsCustomMetrics(container, step as RPStep),
});

export {
  renderReachablePathsCanvas,
  renderReachablePathsCustomMetrics,
  buildReachableSteps,
  parseGraphInput,
  withMetrics,
  DAG_NODES,
  DAG_EDGES,
  DAG_POSITIONS,
  DEFAULT_GRAPH,
  type RPStep,
  type ReachablePathsStep,
};
