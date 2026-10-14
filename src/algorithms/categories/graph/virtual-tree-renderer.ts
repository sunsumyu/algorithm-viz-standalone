/**
 * 虚树与树形 DP (Virtual Tree / Auxiliary Tree) 领域适配器
 * 进阶树论: 关键点按 Dfn 序排序、单调栈维护最右链 LCA、虚树浓缩规模至 O(K) (洛谷 P2495 消耗战)
 * 遵循 Matt Pocock 深模块架构 (LOC < 120)，委托 step-compiler、canvas-adapter 与 deduction-tree
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  VIRTUAL_TREE_CODE_LANGUAGES,
  VIRTUAL_TREE_PROBLEM_HTML,
  VIRTUAL_TREE_ANALYSIS_HTML,
} from './virtual-tree-problem-content';
import {
  buildVirtualTreeSteps,
  type VirtualTreeStep,
} from './virtual-tree-step-compiler';
import {
  renderVirtualTreeCanvas,
  renderVirtualTreeCustomMetrics,
} from '../../../core/renderers/adapters/virtual-tree-canvas-adapter';

const { template, Visualizer } = createDeclarativeVisualizer<VirtualTreeStep>({
  id: 'virtual-tree',
  name: '虚树与关键点浓缩 (Virtual Tree)',
  viewId: 'algo-virtual-tree-view',
  category: 'graph',
  icon: '🌲',
  badge: {
    mode: '单调栈最右链 + O(K) 树形 DP',
    complexity: 'O(K log N) · O(K)',
  },
  card1Title: '🌲 原树与虚树 (Virtual Tree) 双层浓缩沙盘',
  card2Title: '📊 虚树多数组 (dfn, depth, 单调栈, DP) 监控器',
  card2Desc: '逐行对齐关键点 DFN 排序、单调栈维护极浅祖先、LCA 连边构建与 O(K) 树形 DP 求解',
  hasDeductionTree: true,
  legend: [
    { label: '普通原树节点', color: '#1e3a8a' },
    { label: '⭐ 关键点 (Key Nodes)', state: 'swapping' },
    { label: '🟣 虚树节点 (包含 LCA)', color: '#8b5cf6' },
    { label: '🟢 虚树边 (粗绿线)', state: 'discovered' },
    { label: '⚪ 原树边 (灰虚线)', color: '#475569' },
  ],
  presets: [
    { label: '7 节点经典树', values: { 'input-preset': 'classic_7node' } },
    { label: '4 节点单链', values: { 'input-preset': 'simple_chain' } },
  ],
  metrics: [
    { id: 'metric-vtree-nodes', label: '虚树节点规模', color: '#8b5cf6' },
    { id: 'metric-stack-top', label: '单调栈栈顶', color: '#f59e0b' },
    { id: 'metric-dp-cost', label: '树形 DP 最小代价', color: '#10b981' },
    { id: 'metric-vtree-phase', label: '当前算法阶段', color: '#38bdf8' },
  ],
  codeLanguages: VIRTUAL_TREE_CODE_LANGUAGES,
  problemHtml: VIRTUAL_TREE_PROBLEM_HTML,
  analysisHtml: VIRTUAL_TREE_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_7node') as string;
    return buildVirtualTreeSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderVirtualTreeCanvas(container, step);

    const rootEl =
      container.closest('#algo-virtual-tree-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (rootEl) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = rootEl.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }
      const customMetricsContainer = rootEl.querySelector('#dsp-custom-metrics-container') as HTMLElement | null;
      if (customMetricsContainer) {
        renderVirtualTreeCustomMetrics(customMetricsContainer, step);
      }
    }
  },
});

registerAlgorithm({
  id: 'virtual-tree',
  name: '虚树与关键点浓缩 (Virtual Tree)',
  viewId: 'algo-virtual-tree-view',
  category: 'graph',
  description: '进阶树论经典：关键点 DFN 序排序、单调栈维护最右链极浅 LCA、虚树浓缩至 O(K) 树形 DP (洛谷 P2495)',
  icon: '🌲',
  aliases: ['auxiliary-tree', 'vtree', 'P2495', 'SDOI2011', 'class073'],
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 77,
  learningGoal: '掌握虚树单调栈构建方法、O(K log N) 提取必要连通骨架及在虚树上极速树形 DP 技巧',
});

export { buildVirtualTreeSteps, type VirtualTreeStep };
export { Visualizer as VirtualTreeVisualizer };
