/**
 * 点分治路径计数与容斥去重 (Tree Divide and Conquer Path Count - POJ 1741 / 洛谷 P3806)
 * 进阶树论: 树上重心分治、子树距离收集与双指针排序、容斥去重
 * 遵循 Matt Pocock 深模块规范，委托 StepCompiler、CanvasAdapter 与 DeductionTree
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TREE_PATH_COUNT_CODE_LANGUAGES,
  TREE_PATH_COUNT_PROBLEM_HTML,
  TREE_PATH_COUNT_ANALYSIS_HTML,
} from './tree-centroid-path-count-problem-content';
import {
  buildTreeCentroidPathCountSteps,
  type TreePathStep,
} from './tree-centroid-path-count-step-compiler';
import {
  renderTreeCentroidPathCountCanvas,
  renderTreeCentroidPathCountCustomMetrics,
} from '../../../core/renderers/adapters/tree-centroid-path-count-canvas-adapter';

export { buildTreeCentroidPathCountSteps, type TreePathStep };

const { template, Visualizer } = createDeclarativeVisualizer<TreePathStep>({
  id: 'tree-centroid-path-count',
  name: '点分治路径计数 (Centroid Path Count)',
  category: 'graph',
  icon: '🌲',
  badge: {
    mode: '重心分治 + 双指针容斥',
    complexity: 'O(N log² N) · O(N)',
  },
  card1Title: '🌲 带权树形拓扑与重心沙盘',
  card2Title: '🧭 距离池排序与双指针容斥监视器',
  card2Desc: '各节点到重心距离升序池、双指针扫描与容斥去重',
  hasDeductionTree: true,
  legend: [
    { label: '普通树节点', color: '#0284c7' },
    { label: '👑 当前分治重心', color: '#f59e0b' },
    { label: '树枝边权', color: '#e2e8f0' },
  ],
  inputs: [
    {
      id: 'input-k-threshold',
      label: '距离阈值 K',
      type: 'number',
      defaultValue: 5,
      width: '60px',
    },
  ],
  presets: [
    { label: '阈值 K=5 (ans=11)', values: { 'input-k-threshold': 5 } },
    { label: '阈值 K=3 (ans=6)', values: { 'input-k-threshold': 3 } },
  ],
  metrics: [
    { id: 'metric-centroid', label: '当前分治重心', color: '#f59e0b' },
    { id: 'metric-raw-pairs', label: '双指针点对', color: '#2563eb' },
    { id: 'metric-deduct-pairs', label: '容斥扣除点对', color: '#ef4444' },
    { id: 'metric-valid-pairs', label: '合法点对 (去重后)', color: '#10b981' },
  ],
  codeLanguages: TREE_PATH_COUNT_CODE_LANGUAGES,
  problemHtml: TREE_PATH_COUNT_PROBLEM_HTML,
  analysisHtml: TREE_PATH_COUNT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const k = parseInt(inputs['input-k-threshold'] || '5', 10);
    return buildTreeCentroidPathCountSteps(k);
  },
  renderCanvas: (container, step) => {
    renderTreeCentroidPathCountCanvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    renderTreeCentroidPathCountCustomMetrics(container, step);
  },
});

registerAlgorithm({
  id: 'tree-centroid-path-count',
  name: '点分治路径计数 (Centroid Path Count)',
  viewId: 'algo-tree-centroid-path-count-view',
  category: 'graph',
  description: '进阶树论经典点分治：重心查找、子树距离收集、双指针排序扫描与容斥去重、严格 O(N log^2 N) (POJ 1741 / 洛谷 P3806)',
  icon: '🌲',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 72,
  learningGoal: '掌握树上点分治的核心四步流程、双指针统计与容斥原理去重技巧',
});

export { Visualizer as TreeCentroidPathCountVisualizer };
