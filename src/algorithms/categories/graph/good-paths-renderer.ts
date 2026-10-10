/**
 * 好路径的数目 (Number of Good Paths - LeetCode 2421) 声明式可视化器
 * 核心：按边端点最大权值升序排序加边、并查集连通块维护同值最大点计数、乘法原理累加组合数 count[u] * count[v]
 * 遵循 Matt Pocock 深模块规范，委托 StepCompiler、CanvasAdapter 与 DeductionTree
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  GOOD_PATHS_CODE_LANGUAGES,
  GOOD_PATHS_PROBLEM_HTML,
  GOOD_PATHS_ANALYSIS_HTML,
} from './good-paths-problem-content';
import {
  traceGoodPaths,
  buildGoodPathsSteps,
  type GoodPathsStep,
} from './good-paths-step-compiler';
import {
  renderGoodPathsCanvas,
  renderGoodPathsCustomMetrics,
} from '../../../core/renderers/adapters/good-paths-canvas-adapter';

export { traceGoodPaths, buildGoodPathsSteps, type GoodPathsStep };

const { template, Visualizer } = createDeclarativeVisualizer<GoodPathsStep>({
  id: 'good-paths',
  name: '好路径的数目 (Number of Good Paths)',
  category: 'graph',
  badge: {
    mode: '点权升序并查集 · 乘法原理组合',
    complexity: 'O(N log N) · O(N)',
  },
  card1Title: '树形网络拓扑与好路径实时收集舱',
  card2Title: '并查集状态监视器 (parent, count, vals)',
  card2Desc: '展示按边端点最大点权升序加边过程，利用并查集维护各分量中当前最大点权的频次并计算组合数',
  hasDeductionTree: true,
  legend: [
    { label: '普通树边 (虚线)', color: '#475569' },
    { label: '已激活加边 (绿实线)', state: 'discovered' },
    { label: '当前连接边 (金色)', color: '#facc15' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设树形结构',
      type: 'select',
      defaultValue: 'classic_4node',
      options: [
        { label: '4 节点经典树 (好路径 5 条)', value: 'classic_4node' },
        { label: '5 节点星形树 (好路径 6 条)', value: 'star_5node' },
      ],
    },
  ],
  presets: [
    { label: '4 节点经典树', values: { 'input-preset': 'classic_4node' } },
    { label: '5 节点星形树', values: { 'input-preset': 'star_5node' } },
  ],
  metrics: [
    { id: 'metric-active-val', label: '当前边权上限', color: '#38bdf8' },
    { id: 'metric-good-paths', label: '当前好路径总数', color: '#10b981' },
    { id: 'metric-active-edges', label: '已激活连接边', color: '#f59e0b' },
    { id: 'metric-paths-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: GOOD_PATHS_CODE_LANGUAGES,
  problemHtml: GOOD_PATHS_PROBLEM_HTML,
  analysisHtml: GOOD_PATHS_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_4node') as string;
    return buildGoodPathsSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderGoodPathsCanvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    renderGoodPathsCustomMetrics(container, step);
  },
});

registerAlgorithm({
  id: 'good-paths',
  aliases: ['class057-code04', 'number-of-good-paths-2421', 'good-paths-2421'],
  name: '好路径的数目 (Number of Good Paths)',
  viewId: 'algo-good-paths-view',
  category: 'graph',
  description: '并查集贪心加边经典：边端点最大权值升序排序、连通块同最大值频次维护 count[u] * count[v] 乘法组合 (LeetCode 2421)',
  icon: '🛣️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 103,
  learningGoal: '掌握按权值升序离线加边技巧、并查集动态维护最大点计数及乘法原理统计路径',
});

export { Visualizer as GoodPathsVisualizer };
