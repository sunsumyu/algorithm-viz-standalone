/**
 * 树上有依赖背包 (Tree-Dependent Knapsack DP · 洛谷 P2014 选课) 声明式可视化器
 * 进阶树论 + DP: 泛化物品树上合并、子树大小上下界优化 O(N * V)
 * 遵循 Matt Pocock 深模块规范，Thin Domain Adapter 控制在 120 行以内
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TREE_KNAPSACK_CODE_LANGUAGES,
  TREE_KNAPSACK_PROBLEM_HTML,
  TREE_KNAPSACK_ANALYSIS_HTML,
} from './tree-knapsack-dp-problem-content';
import {
  buildTreeKnapsackSteps,
  type TreeKnapStep,
} from './tree-knapsack-dp-step-compiler';
import {
  renderGraphTreeKnapCanvas,
  renderGraphTreeKnapCustomMetrics,
} from '../../../core/renderers/adapters/graph-tree-knapsack-dp-canvas-adapter';

export { buildTreeKnapsackSteps, type TreeKnapStep };

const { template, Visualizer } = createDeclarativeVisualizer<TreeKnapStep>({
  id: 'tree-knapsack-dp',
  name: '树上有依赖背包 (Tree Knapsack DP)',
  category: 'graph',
  icon: '🎒',
  badge: {
    mode: '树形 DP + 上下界优化',
    complexity: 'O(N · V) · O(N · V)',
  },
  card1Title: '🌲 课程依赖拓扑与已选课程沙盘',
  card2Title: '🧭 背包状态向量 dp[u][j] 监视器',
  card2Desc: '树上泛化物品合并、已选课程集合与最大累计学分',
  hasDeductionTree: true,
  legend: [
    { label: '未选课程', color: '#1e3a8a' },
    { label: '🟢 已选课程 (最优解)', state: 'discovered' },
    { label: '👑 超级源点 S0', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-capacity',
      label: '背包总容量 V',
      type: 'number',
      defaultValue: 3,
      width: '60px',
    },
  ],
  presets: [
    { label: '容量 V=3 (ans=11)', values: { 'input-capacity': 3 } },
    { label: '容量 V=4 (ans=17)', values: { 'input-capacity': 4 } },
  ],
  metrics: [
    { id: 'metric-active-node', label: '当前处理节点', color: '#2563eb' },
    { id: 'metric-max-score', label: '当前最大总学分', color: '#10b981' },
    { id: 'metric-subtree-size', label: '当前子树大小', color: '#f59e0b' },
    { id: 'metric-cur-dp', label: '节点 DP 状态', color: '#8b5cf6' },
  ],
  codeLanguages: TREE_KNAPSACK_CODE_LANGUAGES,
  problemHtml: TREE_KNAPSACK_PROBLEM_HTML,
  analysisHtml: TREE_KNAPSACK_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const v = parseInt(inputs['input-capacity'] || '3', 10);
    return buildTreeKnapsackSteps(v);
  },
  renderCanvas: (container, step) => {
    renderGraphTreeKnapCanvas(container, step);
    const root = container.closest('#algo-tree-knapsack-dp-view');
    if (root) {
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container') as HTMLElement;
      if (customMetricsContainer) {
        renderGraphTreeKnapCustomMetrics(customMetricsContainer, step);
      }
    }
  },
  renderCustomMetrics: (container, step) => {
    renderGraphTreeKnapCustomMetrics(container, step);
  },
});

registerAlgorithm({
  id: 'tree-knapsack-dp',
  name: '树上有依赖背包 (Tree Knapsack DP)',
  viewId: 'algo-tree-knapsack-dp-view',
  category: 'graph',
  description: '进阶树论与 DP 融合：泛化物品树形合并、子树大小上下界优化 O(N*V)、选修课依赖拓扑 (洛谷 P2014 选课)',
  icon: '🎒',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 74,
  learningGoal: '掌握树上有依赖背包的树上泛化物品合并、超级源点技巧与子树大小上下界常数优化',
  aliases: ['tree-knapsack', 'P2014', 'tree-dependent-knapsack', 'dependent-knapsack-tree'],
});

export { Visualizer as TreeKnapsackDPVisualizer };
