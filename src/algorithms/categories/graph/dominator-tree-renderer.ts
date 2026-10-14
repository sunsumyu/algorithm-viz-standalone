/**
 * DAG 支配树 (Dominator Tree) 领域适配器
 * 进阶图论: DAG 拓扑反向递推、多前驱 LCA 汇聚、idom[u] 唯一直接支配点 (洛谷 P2597 / 编译原理 SSA)
 * 遵循 Matt Pocock 深模块架构 (LOC < 120)，委托 step-compiler、canvas-adapter 与 deduction-tree
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  DOMINATOR_TREE_CODE_LANGUAGES,
  DOMINATOR_TREE_PROBLEM_HTML,
  DOMINATOR_TREE_ANALYSIS_HTML,
} from './dominator-tree-problem-content';
import {
  buildDominatorTreeSteps,
  type DominatorStep,
} from './dominator-tree-step-compiler';
import {
  renderDominatorTreeCanvas,
  renderDominatorTreeCustomMetrics,
} from '../../../core/renderers/adapters/dominator-tree-canvas-adapter';

const { template, Visualizer } = createDeclarativeVisualizer<DominatorStep>({
  id: 'dominator-tree',
  name: 'DAG 支配树 (Dominator Tree)',
  category: 'graph',
  icon: '🌳',
  badge: {
    mode: 'DAG 拓扑排序 + 前驱 LCA',
    complexity: 'O((V + E) log V) · O(V + E)',
  },
  card1Title: '🌳 原图 DAG 拓扑与支配树 (Dominator Tree) 沙盘',
  card2Title: '📊 支配树多数组 (inDegree, idom, depth, 队列) 监控器',
  card2Desc: '逐行对齐拓扑排序出入度递减、前驱集合在支配树上的 LCA 汇聚与唯一直接支配点 idom[u] 确立',
  hasDeductionTree: true,
  legend: [
    { label: '图节点', color: '#1e3a8a' },
    { label: '⭐ 当前分析点', color: '#f59e0b' },
    { label: '🟢 根节点 (Root)', state: 'discovered' },
    { label: '🟣 支配树边 (紫色)', color: '#8b5cf6' },
    { label: '⚪ 原图边 (灰线)', color: '#475569' },
  ],
  presets: [
    { label: '经典菱形图', values: { 'input-preset': 'classic_diamond' } },
    { label: '旁路控制流', values: { 'input-preset': 'linear_bypass' } },
  ],
  metrics: [
    { id: 'metric-cur-node', label: '当前处理节点', color: '#f59e0b' },
    { id: 'metric-dom-lca', label: '前驱汇聚 LCA', color: '#10b981' },
    { id: 'metric-dom-edges', label: '支配树边数', color: '#38bdf8' },
    { id: 'metric-dom-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: DOMINATOR_TREE_CODE_LANGUAGES,
  problemHtml: DOMINATOR_TREE_PROBLEM_HTML,
  analysisHtml: DOMINATOR_TREE_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_diamond') as string;
    return buildDominatorTreeSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderDominatorTreeCanvas(container, step);

    const rootEl =
      container.closest('#algo-dominator-tree-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (rootEl) {
      for (const [id, val] of Object.entries(step.metrics ?? {})) {
        const el = rootEl.querySelector(`#${id}`);
        if (el) el.textContent = String(val);
      }
      const customMetricsContainer = rootEl.querySelector('#dsp-custom-metrics-container') as HTMLElement | null;
      if (customMetricsContainer) {
        renderDominatorTreeCustomMetrics(customMetricsContainer, step);
      }
    }
  },
});

registerAlgorithm({
  id: 'dominator-tree',
  name: 'DAG 支配树 (Dominator Tree)',
  viewId: 'algo-dominator-tree-view',
  category: 'graph',
  description: '进阶图论经典：有向无环图支配树构建、拓扑排序自顶向下、前驱集合最近公共祖先 LCA 汇聚定理 (洛谷 P2597)',
  icon: '🌳',
  aliases: ['dominator-tree-dag', 'dag-dominator-tree', 'P2597', 'P5180'],
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 73,
  learningGoal: '掌握 DAG 支配树构造原理、前驱支配交集与 LCA 等价定理及倍增查询应用',
});

export { buildDominatorTreeSteps, type DominatorStep };
export { Visualizer as DominatorTreeVisualizer };
