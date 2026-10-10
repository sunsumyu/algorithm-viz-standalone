/**
 * 最小均值回路与分数规划 (Minimum Mean Weight Cycle - Karp · 洛谷 P2868)
 * 进阶图论: 0-1 分数规划、边权重赋权 w'(e) = w(e) - λ、SPFA 负环判定、二分逼近
 * 遵循 Matt Pocock 深模块规范，委托 StepCompiler、CanvasAdapter 与 DeductionTree
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  MIN_MEAN_CYCLE_CODE_LANGUAGES,
  MIN_MEAN_CYCLE_PROBLEM_HTML,
  MIN_MEAN_CYCLE_ANALYSIS_HTML,
} from './min-mean-cycle-problem-content';
import {
  buildMinMeanCycleSteps,
  type MinMeanStep,
} from './min-mean-cycle-step-compiler';
import {
  renderMinMeanCycleCanvas,
  renderMinMeanCycleCustomMetrics,
} from '../../../core/renderers/adapters/min-mean-cycle-canvas-adapter';

export { buildMinMeanCycleSteps, type MinMeanStep };

const { template, Visualizer } = createDeclarativeVisualizer<MinMeanStep>({
  id: 'min-mean-cycle',
  name: '最小均值回路 (Min Mean Cycle)',
  category: 'graph',
  icon: '🔄',
  badge: {
    mode: '0-1 分数规划 + SPFA 负环',
    complexity: 'O(V · E · log(W/ε)) · O(V + E)',
  },
  card1Title: '🌐 有向带权图与赋权残量沙盘',
  card2Title: '🧭 二分区间 [L, R] 与负环判定监视器',
  card2Desc: '二分平均值 λ、新边权 w\'=w-λ 与 SPFA 负权回路高亮',
  hasDeductionTree: true,
  legend: [
    { label: '正权边 (w\' ≥ 0)', state: 'scanning' },
    { label: '负权边 (w\' < 0)', color: '#facc15' },
    { label: '🔴 负权回路 (Negative Cycle)', state: 'swapping' },
  ],
  inputs: [
    {
      id: 'input-graph-type',
      label: '图用例',
      type: 'select',
      defaultValue: 'four-nodes',
      options: [
        { label: '4 节点双回路图 (ans=1.333)', value: 'four-nodes' },
        { label: '3 节点单回路图 (ans=2.000)', value: 'three-nodes' },
      ],
      width: '180px',
    },
  ],
  presets: [
    { label: '4 节点双回路图 (ans=1.333)', values: { 'input-graph-type': 'four-nodes' } },
    { label: '3 节点单回路图 (ans=2.000)', values: { 'input-graph-type': 'three-nodes' } },
  ],
  metrics: [
    { id: 'metric-bounds', label: '二分区间 [L, R]', color: '#2563eb' },
    { id: 'metric-guess-lambda', label: '当前猜测 λ', color: '#0d9488' },
    { id: 'metric-cycle-status', label: '负环判定', color: '#ef4444' },
  ],
  codeLanguages: MIN_MEAN_CYCLE_CODE_LANGUAGES,
  problemHtml: MIN_MEAN_CYCLE_PROBLEM_HTML,
  analysisHtml: MIN_MEAN_CYCLE_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const gType = inputs['input-graph-type'] || 'four-nodes';
    return buildMinMeanCycleSteps(gType);
  },
  renderCanvas: (container, step) => {
    renderMinMeanCycleCanvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    renderMinMeanCycleCustomMetrics(container, step);
  },
});

registerAlgorithm({
  id: 'min-mean-cycle',
  name: '最小均值回路 (Min Mean Cycle)',
  viewId: 'algo-min-mean-cycle-view',
  category: 'graph',
  description: '进阶图论 0-1 分数规划：边权动态赋权 w\'(e)=w(e)-λ、SPFA 负环判别与二分逼近最小平均回路 (洛谷 P2868)',
  icon: '🔄',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 73,
  learningGoal: '掌握 0-1 分数规划转化为负环判定的数学原理、二分逼近与 Karp 最小均值回路算法',
});

export { Visualizer as MinMeanCycleVisualizer };
