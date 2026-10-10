/**
 * 树上众数求和 (Tree Dominant Color - CF600E)
 * 进阶树论启发式合并: DSU on Tree 动态维护最值与频次和、轻重儿子判定
 * 遵循 Matt Pocock 深模块规范，委托 StepCompiler、CanvasAdapter 与 DeductionTree
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TREE_DOMINANT_CODE_LANGUAGES,
  TREE_DOMINANT_PROBLEM_HTML,
  TREE_DOMINANT_ANALYSIS_HTML,
} from './tree-dominant-color-problem-content';
import {
  buildTreeDominantColorSteps,
  type TreeDominantStep,
} from './tree-dominant-color-step-compiler';
import {
  renderTreeDominantColorCanvas,
  renderTreeDominantColorCustomMetrics,
} from '../../../core/renderers/adapters/tree-dominant-color-canvas-adapter';

export { buildTreeDominantColorSteps, type TreeDominantStep };

const { template, Visualizer } = createDeclarativeVisualizer<TreeDominantStep>({
  id: 'tree-dominant-color',
  name: '树上众数求和 (Tree Dominant Color)',
  category: 'graph',
  icon: '🌳',
  badge: {
    mode: 'DSU on Tree + 动态众数和',
    complexity: 'O(N log N) · O(N)',
  },
  card1Title: '🌳 树拓扑与启发式合并沙盘',
  card2Title: '📊 多数组状态监视器 (sz, son, cnt, ans)',
  card2Desc: '轻儿子子树信息清空 (keep=false)、重儿子数据桶保留 (keep=true) 与众数 O(1) 动态合并',
  hasDeductionTree: true,
  legend: [
    { label: '蓝色节点 (颜色 1)', color: '#38bdf8' },
    { label: '粉色节点 (颜色 2)', color: '#ec4899' },
    { label: '绿色节点 (颜色 3)', color: '#10b981' },
    { label: '👑 重边 (Heavy Edge)', color: '#facc15' },
    { label: '轻边 (Light Edge)', color: '#475569' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设拓扑',
      type: 'select',
      defaultValue: 'cf600e_5node',
      options: [
        { label: 'CF600E 样例 (多色混合树)', value: 'cf600e_5node' },
        { label: '双色偏斜树 (众数显著)', value: 'bicolor_5node' },
      ],
    },
  ],
  presets: [
    { label: 'CF600E 样例', values: { 'input-preset': 'cf600e_5node' } },
    { label: '双色偏斜树', values: { 'input-preset': 'bicolor_5node' } },
  ],
  metrics: [
    { id: 'metric-cur-root', label: '当前处理根', color: '#38bdf8' },
    { id: 'metric-max-freq', label: '最高出现频次', color: '#f59e0b' },
    { id: 'metric-sum-colors', label: '当前众数颜色和', color: '#10b981' },
    { id: 'metric-dominant-phase', label: '启发式合并阶段', color: '#ec4899' },
  ],
  codeLanguages: TREE_DOMINANT_CODE_LANGUAGES,
  problemHtml: TREE_DOMINANT_PROBLEM_HTML,
  analysisHtml: TREE_DOMINANT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'cf600e_5node') as string;
    return buildTreeDominantColorSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderTreeDominantColorCanvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    renderTreeDominantColorCustomMetrics(container, step);
  },
});

registerAlgorithm({
  id: 'tree-dominant-color',
  name: '树上众数求和 (Tree Dominant Color)',
  viewId: 'algo-tree-dominant-color-view',
  category: 'graph',
  description: '进阶树论启发式合并：DSU on Tree 树链剖分、动态维护桶内最高频次与众数颜色和 (CF600E)',
  icon: '🌳',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 76,
  learningGoal: '掌握 DSU on Tree 维护子树众数方法、O(1) 动态调整最大频次与消除撤销开销技巧',
});

export { Visualizer as TreeDominantColorVisualizer };
