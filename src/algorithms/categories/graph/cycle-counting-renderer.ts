/**
 * 三元环与四元环定向计数 (3-Cycle & 4-Cycle Counting) 声明式可视化器
 * 进阶图论: 按度数度大到小偏序定向成 DAG、三元环 O(M sqrt(M))、四元环 O(M sqrt(M)) 极速计数 (洛谷 P1989)
 * 遵循 Matt Pocock 深模块规范，委托 StepCompiler、CanvasAdapter 与 DeductionTree
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  CYCLE_COUNTING_CODE_LANGUAGES,
  CYCLE_COUNTING_PROBLEM_HTML,
  CYCLE_COUNTING_ANALYSIS_HTML,
} from './cycle-counting-problem-content';
import {
  buildCycleCountingSteps,
  type CycleStep,
} from './cycle-counting-step-compiler';
import {
  renderCycleCountingCanvas,
  renderCycleCountingCustomMetrics,
} from '../../../core/renderers/adapters/cycle-counting-canvas-adapter';

export { buildCycleCountingSteps, type CycleStep };

const { template, Visualizer } = createDeclarativeVisualizer<CycleStep>({
  id: 'cycle-counting',
  name: '三元环与四元环定向计数 (Cycle Counting)',
  viewId: 'algo-cycle-counting-view',
  category: 'graph',
  icon: '🔺',
  badge: {
    mode: 'DAG 定向 + 出度根号优化',
    complexity: 'O(M √M) · O(N + M)',
  },
  card1Title: '🔺 图拓扑与 DAG 定向环搜索沙盘',
  card2Title: '📊 环计数多数组 (deg, vis, cnt) 实时监控器',
  card2Desc: '逐行对齐度数偏序 DAG 定向、两步出边打标求三元环与公共中继点组合求四元环全流程',
  hasDeductionTree: true,
  legend: [
    { label: '图节点', color: '#1e3a8a' },
    { label: '⭐ 起点 u', color: '#f59e0b' },
    { label: '🟢 中继点 v', state: 'discovered' },
    { label: '🟣 终点 w', state: 'secondary' },
    { label: '➡️ 定向边', state: 'scanning' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设图结构',
      type: 'select',
      defaultValue: 'classic_diamond_triangles',
      options: [
        { label: '经典菱形图 (2个三元环, 1个四元环)', value: 'classic_diamond_triangles' },
        { label: '4 阶完全图 K4 (4个三元环, 3个四元环)', value: 'complete_k4' },
      ],
    },
  ],
  presets: [
    { label: '经典菱形图', values: { 'input-preset': 'classic_diamond_triangles' } },
    { label: '4 阶完全图 K4', values: { 'input-preset': 'complete_k4' } },
  ],
  metrics: [
    { id: 'metric-cur-explore', label: '当前分析点', color: '#f59e0b' },
    { id: 'metric-3cycle-count', label: '三元环总数', color: '#10b981' },
    { id: 'metric-4cycle-count', label: '四元环总数', color: '#38bdf8' },
    { id: 'metric-cycle-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: CYCLE_COUNTING_CODE_LANGUAGES,
  problemHtml: CYCLE_COUNTING_PROBLEM_HTML,
  analysisHtml: CYCLE_COUNTING_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'classic_diamond_triangles') as string;
    return buildCycleCountingSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderCycleCountingCanvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    renderCycleCountingCustomMetrics(container, step);
  },
});

registerAlgorithm({
  id: 'cycle-counting',
  name: '三元环与四元环定向计数 (Cycle Counting)',
  viewId: 'algo-cycle-counting-view',
  category: 'graph',
  description: '进阶图论经典：无向图度数偏序 DAG 定向、出度 √M 截断优化、三元环与四元环极速计数 (洛谷 P1989)',
  icon: '🔺',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 71,
  learningGoal: '掌握三元环与四元环根号算法思想、DAG 定向偏序消除冗余及计数原理',
});

export { Visualizer as CycleCountingVisualizer };
