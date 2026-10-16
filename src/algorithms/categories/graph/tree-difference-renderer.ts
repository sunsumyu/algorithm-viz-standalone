/**
 * 树上差分 (Tree Difference - 点差分与边差分 · 洛谷 P3128 / P3258) 领域适配器
 * 统一收敛至单一事实来源：src/algorithms/categories/tree/tree-117-123/tree-difference-renderer
 * 本文件保留 Visualizer 构造类与步骤编译器供伴生单测使用，注销重复 catalog 注册
 */

import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TREE_DIFF_CODE_LANGUAGES,
  TREE_DIFF_PROBLEM_HTML,
  TREE_DIFF_ANALYSIS_HTML,
} from './tree-difference-problem-content';
import {
  buildTreeDifferenceSteps,
  type TreeDiffStep,
} from './tree-difference-step-compiler';
import {
  renderGraphTreeDiffCanvas,
  renderGraphTreeDiffCustomMetrics,
} from '../../../core/renderers/adapters/graph-tree-difference-canvas-adapter';

export {
  buildTreeDifferenceSteps,
  type TreeDiffStep,
  renderGraphTreeDiffCanvas,
  renderGraphTreeDiffCustomMetrics,
};

const { template, Visualizer } = createDeclarativeVisualizer<TreeDiffStep>({
  id: 'tree-difference',
  name: '树上差分 (Tree Difference)',
  viewId: 'algo-tree-difference-view',
  category: 'graph',
  icon: '🌴',
  badge: {
    mode: 'LCA + 自底向上前缀和',
    complexity: 'O(log N) · O(N)',
  },
  card1Title: '🌴 树形拓扑与路径差分打标沙盘',
  card2Title: '📊 差分多数组 (depth, diff, val) 实时监控器',
  card2Desc: '逐行对齐点差分/边差分端点与 LCA 标记抵消公式，自底向上后序遍历前缀和汇总推导',
  hasDeductionTree: true,
  legend: [
    { label: '树节点', color: '#1e3a8a' },
    { label: '⭐ LCA 节点', color: '#f59e0b' },
    { label: '🟢 路径端点', state: 'discovered' },
    { label: '🔴 覆盖边/点', state: 'swapping' },
  ],
  presets: [
    { label: '点差分 (路径 4➔5)', values: { 'input-preset': 'node_diff_5node' } },
    { label: '边差分 (路径 4➔5)', values: { 'input-preset': 'edge_diff_5node' } },
  ],
  metrics: [
    { id: 'metric-active-lca', label: '最近公共祖先 LCA', color: '#f59e0b' },
    { id: 'metric-max-cover', label: '最高覆盖次数', color: '#10b981' },
    { id: 'metric-diff-formula', label: '当前差分公式', color: '#38bdf8' },
    { id: 'metric-diff-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: TREE_DIFF_CODE_LANGUAGES,
  problemHtml: TREE_DIFF_PROBLEM_HTML,
  analysisHtml: TREE_DIFF_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'node_diff_5node') as string;
    return buildTreeDifferenceSteps(preset);
  },
  renderCanvas: renderGraphTreeDiffCanvas,
  renderCustomMetrics: renderGraphTreeDiffCustomMetrics,
});

export { Visualizer as TreeDifferenceVisualizer };
