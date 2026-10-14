/**
 * 树上差分 (Tree Difference - 点差分与边差分 · 洛谷 P3128 / P3258) 领域适配器
 * 进阶树论: 点差分 (diff[u]++, diff[v]++, diff[lca]--, diff[fa[lca]]--) 与 边差分 (diff[u]++, diff[v]++, diff[lca]-=2)
 * 遵循 Matt Pocock 深模块架构 (LOC < 120)，委托 step-compiler、canvas-adapter 与 deduction-tree
 */

import { registerAlgorithm } from '../../../core/registry';
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
  renderCanvas: (container, step) => {
    renderGraphTreeDiffCanvas(container, step);

    const rootEl =
      container.closest('#algo-tree-difference-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (rootEl) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = rootEl.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }
      const customMetricsContainer = rootEl.querySelector('#dsp-custom-metrics-container') as HTMLElement | null;
      if (customMetricsContainer) {
        renderGraphTreeDiffCustomMetrics(customMetricsContainer, step);
      }
    }
  },
});

registerAlgorithm({
  id: 'tree-difference',
  name: '树上差分 (Tree Difference)',
  viewId: 'algo-tree-difference-view',
  category: 'graph',
  description: '进阶树论经典：树上点差分与边差分标记、倍增 LCA 快速定位、自底向上后序子树和还原 (洛谷 P3128)',
  icon: '🌴',
  aliases: ['tree-diff', 'tree-difference-122', 'P3128', 'P3258', 'class122'],
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 70,
  learningGoal: '掌握树上点差分与边差分原理、LCA 端点标记法及自底向上还原覆盖权值全流程',
});

export { buildTreeDifferenceSteps, type TreeDiffStep };
export { Visualizer as TreeDifferenceVisualizer };
