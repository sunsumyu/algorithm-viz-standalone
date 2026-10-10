/**
 * 基环树与环套树 DP (Pseudotree / Cycle-With-Trees DP · 洛谷 P1453 / P2607 骑士) 声明式可视化器
 * 进阶树论: 拓扑找环、子树树形 DP 浓缩至环、断环为链 / 两次 DP 破环求解
 * 遵循 Matt Pocock 深模块规范，Thin Domain Adapter 控制在 120 行以内
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  PSEUDOTREE_DP_CODE_LANGUAGES,
  PSEUDOTREE_DP_PROBLEM_HTML,
  PSEUDOTREE_DP_ANALYSIS_HTML,
} from './pseudotree-dp-problem-content';
import {
  buildPseudotreeSteps,
  type PseudotreeStep,
} from './pseudotree-dp-step-compiler';
import {
  renderPseudotreeDPCanvas,
  renderPseudotreeDPCustomMetrics,
} from '../../../core/renderers/adapters/pseudotree-dp-canvas-adapter';

export { buildPseudotreeSteps, type PseudotreeStep };

const { template, Visualizer } = createDeclarativeVisualizer<PseudotreeStep>({
  id: 'pseudotree-dp',
  name: '基环树 DP (Pseudotree DP)',
  category: 'graph',
  icon: '🐎',
  badge: {
    mode: 'DFS 找环 + 断环为链两次树形 DP',
    complexity: 'O(N) · O(N)',
  },
  card1Title: '🐎 基环树拓扑、破环断边与树形 DP 沙盘',
  card2Title: '📊 状态转移监视器 (dp[0], dp[1], 选点集合)',
  card2Desc: '逐行对齐 DFS 探查基环与返祖边、选定破环断边、分别强制不选环两端跑两次树形 DP 并合并最优解',
  hasDeductionTree: true,
  legend: [
    { label: '基环节点', color: '#f59e0b' },
    { label: '外挂子树节点', color: '#1e3a8a' },
    { label: '⭐ 最优独立集选点', state: 'discovered' },
    { label: '❌ 破环断边 (红虚线)', state: 'swapping' },
    { label: '🟢 树形边 (实线)', state: 'scanning' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设图拓扑',
      type: 'select',
      defaultValue: 'classic_6node',
      options: [
        { label: '6 节点经典基环树 (最优解 35, 选点 [4, 3, 5])', value: 'classic_6node' },
        { label: '5 节点简单基环树 (最优解 24)', value: 'simple_5node' },
      ],
    },
  ],
  presets: [
    { label: '6 节点经典基环树', values: { 'input-preset': 'classic_6node' } },
    { label: '5 节点简单基环树', values: { 'input-preset': 'simple_5node' } },
  ],
  metrics: [
    { id: 'metric-cycle-nodes', label: '基环节点集合', color: '#f59e0b' },
    { id: 'metric-dp-optimal', label: '最大独立权值', color: '#10b981' },
    { id: 'metric-cur-node', label: '当前分析节点', color: '#38bdf8' },
    { id: 'metric-pseudotree-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: PSEUDOTREE_DP_CODE_LANGUAGES,
  problemHtml: PSEUDOTREE_DP_PROBLEM_HTML,
  analysisHtml: PSEUDOTREE_DP_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_6node') as string;
    return buildPseudotreeSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderPseudotreeDPCanvas(container, step);
    const rootEl =
      container.closest('#algo-pseudotree-dp-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (rootEl) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = rootEl.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }
      const customMetricsContainer = rootEl.querySelector('#dsp-custom-metrics-container') as HTMLElement;
      if (customMetricsContainer) {
        renderPseudotreeDPCustomMetrics(customMetricsContainer, step);
      }
    }
  },
  renderCustomMetrics: (container, step) => {
    renderPseudotreeDPCustomMetrics(container, step);
  },
});

registerAlgorithm({
  id: 'pseudotree-dp',
  name: '基环树 DP (Pseudotree DP)',
  viewId: 'algo-pseudotree-dp-view',
  category: 'graph',
  description: '进阶树论经典：DFS/拓扑找环、破环断边为树、两次树形 DP 强制不选断边端点求解最大独立集 (洛谷 P2607 骑士)',
  icon: '🐎',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 86,
  learningGoal: '掌握基环树拓扑性质、断环为链技巧及两次树形 DP 处理相邻约束方法',
  aliases: ['pseudotree', 'cycle-with-trees', 'P1453', 'P2607'],
});

export { Visualizer as PseudotreeVisualizer };
