/**
 * 树分治与点分治 (Tree Centroid Decomposition)
 * 统一收敛至单一事实来源：src/algorithms/categories/advanced-topics/advanced-179-184/centroid-decomposition-renderer
 * 本文件保留 Visualizer 构造类与步骤编译器供伴生单测使用，注销重复 catalog 注册
 */

import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TREE_CENTROID_CODE_LANGUAGES,
  TREE_CENTROID_PROBLEM_HTML,
  TREE_CENTROID_ANALYSIS_HTML,
} from './tree-centroid-decomposition-problem-content';
import {
  buildStaticCentroidSteps,
  type StaticCentroidStep,
} from './tree-centroid-decomposition-step-compiler';
import {
  renderTreeCentroidCanvas,
  renderTreeCentroidCustomMetrics,
} from '../../../core/renderers/adapters/tree-centroid-decomposition-canvas-adapter';

export { buildStaticCentroidSteps, type StaticCentroidStep };

const { template, Visualizer } = createDeclarativeVisualizer<StaticCentroidStep>({
  id: 'tree-centroid-decomposition',
  name: '树分治与点分治 (Tree Centroid Decomposition)',
  category: 'graph',
  icon: '⚖️',
  badge: {
    mode: '重心寻找 + O(log N) 树高分治',
    complexity: 'O(N log² N) · O(N)',
  },
  card1Title: '⚖️ 树形拓扑、重心隔离与分治层级沙盘',
  card2Title: '📊 重心状态分析器 (sz, maxSubtree, vis, 路径统计)',
  card2Desc: '逐行对齐 DFS 计算各点最大子树 maxSubtree[u]、确立重心并隔离 (vis=true) 与递归分治子连通块',
  hasDeductionTree: true,
  legend: [
    { label: '普通图节点', color: '#1e3a8a' },
    { label: '👑 当前分治重心', color: '#f59e0b' },
    { label: '🔒 已隔离重心 (Vis)', color: '#065f46' },
    { label: '⚪ 普通树边', state: 'scanning' },
    { label: '❌ 隔离切断边 (虚线)', color: '#475569' },
  ],
  presets: [
    { label: '7 节点经典平衡树', values: { 'input-preset': 'classic_7node' } },
    { label: '5 节点单链树', values: { 'input-preset': 'line_5node' } },
  ],
  metrics: [
    { id: 'metric-cur-centroid', label: '当前分治重心', color: '#f59e0b' },
    { id: 'metric-max-subtree', label: '最大分支大小', color: '#10b981' },
    { id: 'metric-path-count', label: '已分治重心序列', color: '#38bdf8' },
    { id: 'metric-centroid-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: TREE_CENTROID_CODE_LANGUAGES,
  problemHtml: TREE_CENTROID_PROBLEM_HTML,
  analysisHtml: TREE_CENTROID_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_7node') as string;
    return buildStaticCentroidSteps(preset);
  },
  renderCanvas: renderTreeCentroidCanvas,
  renderCustomMetrics: renderTreeCentroidCustomMetrics,
});

export { Visualizer as TreeCentroidDecompositionVisualizer };
