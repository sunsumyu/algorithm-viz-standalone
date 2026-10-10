/**
 * Kruskal 重构树 (Kruskal Reconstruction Tree) 领域适配器
 * 进阶树论: 边权转化为新节点点权、大根堆性质、瓶颈路径转化为 LCA 点权、子树对应连通块 (洛谷 P4768 / P4197)
 * 遵循 Matt Pocock 深模块架构 (LOC < 120)，委托 step-compiler、canvas-adapter 与 deduction-tree
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  KRUSKAL_TREE_CODE_LANGUAGES,
  KRUSKAL_TREE_PROBLEM_HTML,
  KRUSKAL_TREE_ANALYSIS_HTML,
} from './kruskal-reconstruction-tree-problem-content';
import {
  buildKruskalTreeSteps,
  type KruskalTreeStep,
} from './kruskal-reconstruction-tree-step-compiler';
import {
  renderKruskalTreeCanvas,
  renderKruskalTreeCustomMetrics,
} from '../../../core/renderers/adapters/kruskal-reconstruction-tree-canvas-adapter';

const { template, Visualizer } = createDeclarativeVisualizer<KruskalTreeStep>({
  id: 'kruskal-reconstruction-tree',
  name: 'Kruskal 重构树 (Kruskal Reconstruction Tree)',
  viewId: 'algo-kruskal-reconstruction-tree-view',
  category: 'graph',
  icon: '🌲',
  badge: {
    mode: '边权转点权 + LCA 瓶颈查询',
    complexity: 'O(M log M + Q log N) · O(N + M)',
  },
  card1Title: '🌲 原图拓扑与 Kruskal 重构二叉树沙盘',
  card2Title: '📊 重构树多数组 (father, val, 树边) 监控器',
  card2Desc: '逐行对齐边权升序排序、新建虚点挂载代表元、点权大根堆性质与 LCA 瓶颈路等价转换',
  hasDeductionTree: true,
  legend: [
    { label: '原图实体节点 (1..n)', color: '#1e3a8a' },
    { label: '💎 边权虚节点 (n+1..2n-1)', color: '#f59e0b' },
    { label: '👑 重构树根节点', state: 'discovered' },
    { label: '🟢 重构树边 (实线)', state: 'discovered' },
    { label: '⚪ 原图边 (灰虚线)', color: '#475569' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设图拓扑',
      type: 'select',
      defaultValue: 'classic_4node',
      options: [
        { label: '4 节点经典图 (虚点 5, 6, 7，树边 6 条)', value: 'classic_4node' },
        { label: '3 节点简单图 (虚点 4, 5，树边 4 条)', value: 'star_3node' },
      ],
    },
  ],
  presets: [
    { label: '4 节点经典图', values: { 'input-preset': 'classic_4node' } },
    { label: '3 节点简单图', values: { 'input-preset': 'star_3node' } },
  ],
  metrics: [
    { id: 'metric-kruskal-root', label: '当前重构树根', color: '#10b981' },
    { id: 'metric-lca-bottleneck', label: 'LCA 瓶颈路径查询', color: '#f59e0b' },
    { id: 'metric-cur-edge', label: '当前考察边', color: '#38bdf8' },
    { id: 'metric-kruskal-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: KRUSKAL_TREE_CODE_LANGUAGES,
  problemHtml: KRUSKAL_TREE_PROBLEM_HTML,
  analysisHtml: KRUSKAL_TREE_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_4node') as string;
    return buildKruskalTreeSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderKruskalTreeCanvas(container, step);

    const rootEl =
      container.closest('#algo-kruskal-reconstruction-tree-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (rootEl) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = rootEl.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }
      const customMetricsContainer = rootEl.querySelector('#dsp-custom-metrics-container') as HTMLElement | null;
      if (customMetricsContainer) {
        renderKruskalTreeCustomMetrics(customMetricsContainer, step);
      }
    }
  },
});

registerAlgorithm({
  id: 'kruskal-reconstruction-tree',
  name: 'Kruskal 重构树 (Kruskal Reconstruction Tree)',
  viewId: 'algo-kruskal-reconstruction-tree-view',
  category: 'graph',
  description: '进阶图论经典：边权转化为重构树虚点点权、点权满足大根堆性质、路径瓶颈边权等价于 LCA 点权 (洛谷 P4768)',
  icon: '🌲',
  aliases: ['kruskal-tree', 'reconstruction-tree', 'P4768', 'P4197', 'class072'],
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 81,
  learningGoal: '掌握 Kruskal 重构树构造原理、大根堆单调性定理及倍增查询瓶颈边权技巧',
});

export { buildKruskalTreeSteps, type KruskalTreeStep };
export { Visualizer as KruskalReconstructionTreeVisualizer };
