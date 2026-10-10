/**
 * 动态点分树 (Dynamic Centroid Tree · 洛谷 P6329 / SP1437) 声明式可视化器
 * 进阶树论: 重心递归分治建树、树高严格 O(log N)、动态单点修改与全局路径维护
 * 遵循 Matt Pocock 深模块规范，Thin Domain Adapter 控制在 120 行以内
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  CENTROID_TREE_CODE_LANGUAGES,
  CENTROID_TREE_PROBLEM_HTML,
  CENTROID_TREE_ANALYSIS_HTML,
} from './centroid-tree-problem-content';
import {
  buildCentroidTreeSteps,
  type CentroidTreeStep,
} from './centroid-tree-step-compiler';
import {
  renderCentroidTreeCanvas,
  renderCentroidTreeCustomMetrics,
} from '../../../core/renderers/adapters/centroid-tree-canvas-adapter';

export { buildCentroidTreeSteps, type CentroidTreeStep };

const { template, Visualizer } = createDeclarativeVisualizer<CentroidTreeStep>({
  id: 'centroid-tree',
  name: '动态点分树 (Centroid Tree)',
  category: 'graph',
  icon: '🌲',
  badge: {
    mode: '重心分治重构树',
    complexity: 'O(N log N) · O(N)',
  },
  card1Title: '🌲 原图树形与点分重构树沙盘',
  card2Title: '🧭 点分树父子关系监视器',
  card2Desc: '各节点点分树父节点 fa[u]、树高 O(log N) 与跳链查询',
  hasDeductionTree: true,
  legend: [
    { label: '原树节点', color: '#0284c7' },
    { label: '👑 点分树根节点', color: '#f59e0b' },
    { label: '🟢 当前活跃/查询链节点', state: 'discovered' },
  ],
  inputs: [],
  presets: [
    { label: '5 节点经典点分树', values: { preset: 'classic_5node' } },
    { label: '线性链 1-2-3-4-5', values: { preset: 'simple_line' } },
  ],
  metrics: [
    { id: 'metric-active-node', label: '当前点分节点', color: '#2563eb' },
    { id: 'metric-tree-height', label: '点分树当前深度', color: '#10b981' },
    { id: 'metric-centroid-root', label: '点分树根', color: '#f59e0b' },
    { id: 'metric-centroid-phase', label: '当前阶段', color: '#8b5cf6' },
  ],
  codeLanguages: CENTROID_TREE_CODE_LANGUAGES,
  problemHtml: CENTROID_TREE_PROBLEM_HTML,
  analysisHtml: CENTROID_TREE_ANALYSIS_HTML,
  buildSteps: (inputs) => buildCentroidTreeSteps((inputs['preset'] as string) || 'classic_5node'),
  renderCanvas: (container, step) => {
    renderCentroidTreeCanvas(container, step);
    const root = container.closest('#algo-centroid-tree-view');
    if (root) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = root.querySelector(`#${id}`);
        if (el) el.textContent = val;
      }
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container') as HTMLElement;
      if (customMetricsContainer) {
        renderCentroidTreeCustomMetrics(customMetricsContainer, step);
      }
    }
  },
  renderCustomMetrics: (container, step) => {
    renderCentroidTreeCustomMetrics(container, step);
  },
});

registerAlgorithm({
  id: 'centroid-tree',
  name: '动态点分树 (Centroid Tree)',
  viewId: 'algo-centroid-tree-view',
  category: 'graph',
  description: '进阶树论点分治重构：重心递归建树、树高严格 O(log N)、动态单点修改与路径信息维护 (洛谷 P6329)',
  icon: '🌲',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 61,
  learningGoal: '掌握动态点分树的重构方法、树高对数级性质以及跳链更新和容斥查询技巧',
  aliases: ['dynamic-centroid-tree', 'P6329', 'SP1437', 'centroid-decomposition-tree'],
});

export { Visualizer as CentroidTreeVisualizer };
