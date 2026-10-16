/**
 * 最近公共祖先 LCA (Binary Lifting LCA - 树上倍增 · 洛谷 P3379) 领域适配器
 * 进阶树论: 深度对齐 depth[u] == depth[v]、二进制倍增同步上跳 up[u][i] != up[v][i]、O(log N) 极速查询 (洛谷 P3379)
 * 遵循 Matt Pocock 深模块架构 (LOC < 120)，委托 step-compiler、canvas-adapter 与 deduction-tree
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  LCA_BINARY_LIFTING_CODE_LANGUAGES,
  LCA_BINARY_LIFTING_PROBLEM_HTML,
  LCA_BINARY_LIFTING_ANALYSIS_HTML,
} from './lca-binary-lifting-problem-content';
import {
  buildLCASteps,
  type LCAStep,
} from './lca-binary-lifting-step-compiler';
import {
  renderLCABinaryLiftingCanvas,
  renderLCABinaryLiftingCustomMetrics,
} from '../../../core/renderers/adapters/lca-binary-lifting-canvas-adapter';

const { template, Visualizer } = createDeclarativeVisualizer<LCAStep>({
  id: 'lca-binary-lifting',
  name: '最近公共祖先与树上倍增 (LCA Binary Lifting)',
  viewId: 'algo-lca-binary-lifting-view',
  category: 'graph',
  icon: '🌳',
  badge: {
    mode: '深度对齐 + 二进制倍增上跳',
    complexity: 'O(N log N) · O(log N)',
  },
  card1Title: '🌳 树形拓扑、深度分层与倍增试跳沙盘',
  card2Title: '📊 倍增状态分析器 (depth, up[0], up[1], 试跳步长)',
  card2Desc: '逐行对齐 DFS 树深度与倍增表递推、阶段一深度对齐跃升、阶段二二进制试跳与两点最短距离计算',
  hasDeductionTree: true,
  legend: [
    { label: '图节点', color: '#1e3a8a' },
    { label: '⭐ 查询节点 u / v', state: 'swapping' },
    { label: '👑 最近公共祖先 LCA', color: '#f59e0b' },
    { label: '🟢 试跳路径边', state: 'discovered' },
    { label: '⚪ 普通树边', color: '#475569' },
  ],
  presets: [
    { label: '7 节点经典树', values: { 'input-preset': 'classic_7node' } },
    { label: '5 节点分叉树', values: { 'input-preset': 'fork_5node' } },
  ],
  metrics: [
    { id: 'metric-lca-query', label: '当前查询点对', color: '#ef4444' },
    { id: 'metric-lca-res', label: '最近公共祖先 LCA', color: '#f59e0b' },
    { id: 'metric-cur-state', label: '跃升指针当前状态', color: '#38bdf8' },
    { id: 'metric-lca-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: LCA_BINARY_LIFTING_CODE_LANGUAGES,
  problemHtml: LCA_BINARY_LIFTING_PROBLEM_HTML,
  analysisHtml: LCA_BINARY_LIFTING_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_7node') as string;
    return buildLCASteps(preset);
  },
  renderCanvas: (container, step) => {
    renderLCABinaryLiftingCanvas(container, step);

    const rootEl =
      container.closest('#algo-lca-binary-lifting-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (rootEl) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = rootEl.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }
      const customMetricsContainer = rootEl.querySelector('#dsp-custom-metrics-container') as HTMLElement | null;
      if (customMetricsContainer) {
        renderLCABinaryLiftingCustomMetrics(customMetricsContainer, step);
      }
    }
  },
});

registerAlgorithm({
  id: 'lca-binary-lifting',
  name: '最近公共祖先与树上倍增 (LCA Binary Lifting)',
  viewId: 'algo-lca-binary-lifting-view',
  category: 'graph',
  description: '进阶树论经典：树上倍增跳转表 up[u][i]、深度对齐、二进制试跳求 LCA 及两点最短距离 (洛谷 P3379)',
  icon: '🌳',
  aliases: ['binary-lifting-lca', 'tree-lca', 'P3379', 'class076'],
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 82,
  learningGoal: '掌握倍增递推原理 up[u][i]=up[up[u][i-1]][i-1]、两阶段深度对齐与二进制试跳算法',
});

export { buildLCASteps, type LCAStep };
export { Visualizer as LCABinaryLiftingVisualizer };
