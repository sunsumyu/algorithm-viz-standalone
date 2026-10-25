/**
 * 组合（优化）可视化器（回溯）- 100% 对齐 DP 标准模板版本
 * LeetCode 77：从 1..n 中选 k 个数的所有组合
 * 支持阶段演化：阶段 1 (完整决策树) vs 阶段 2 (剪枝优化决策树)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import type { BacktrackTreeStep } from './backtracking-tree-helper';
import { combinationSteps } from './combination-step-compiler';
import {
  COMBINATION_PROBLEM_HTML,
  COMBINATION_ANALYSIS_HTML,
} from './combination-problem-content';
import {
  buildOptimizedTree,
  buildOptimizedSteps,
  withMetrics,
} from './combination-optimized-step-compiler';
import { renderCombinationOptimizedCanvas } from './combination-optimized-canvas-adapter';

export { buildOptimizedTree, buildOptimizedSteps, renderCombinationOptimizedCanvas };

registerDeclarativeAlgorithm({
  id: 'combination-optimized',
  hasDeductionTree: true,
  name: '组合（优化）',
  category: 'backtracking',
  description: '剪枝优化：i <= n - (k - path.length) + 1',
  icon: '✂️',
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '学会用剪枝优化回溯搜索',
  modes: [
    { id: 'naive', label: '阶段 1 · 完整决策树' },
    { id: 'optimized', label: '阶段 2 · 剪枝优化决策树' },
  ],
  inputs: [
    { id: 'n', label: '范围 1..n', type: 'number', defaultValue: '4' },
    { id: 'k', label: '选取个数 k', type: 'number', defaultValue: '2' },
  ],
  presets: [
    { label: 'n=4, k=2', values: { n: '4', k: '2' } },
    { label: 'n=5, k=3', values: { n: '5', k: '3' } },
    { label: 'n=9, k=2', values: { n: '9', k: '2' } },
  ],
  metrics: [
    { id: 'path', label: '当前路径', color: '#2563eb' },
    { id: 'path-len', label: '路径长度 / k', color: '#a855f7' },
    { id: 'visited', label: '已访问节点', color: '#0f172a' },
    { id: 'results', label: '已收集组合', color: '#10b981' },
    { id: 'pruned', label: '剪枝次数', color: '#ef4444' },
  ],
  legend: [
    { label: '当前节点', color: '#2563eb' },
    { label: '收集方案', color: '#10b981' },
    { label: '剪枝', color: '#ef4444' },
  ],
  problemHtml: COMBINATION_PROBLEM_HTML,
  analysisHtml: COMBINATION_ANALYSIS_HTML,
  generateSteps: (inputs, mode) => {
    let n = parseInt(String(inputs.n ?? '4'), 10);
    let k = parseInt(String(inputs.k ?? '2'), 10);
    if (!Number.isFinite(n)) n = 4;
    if (!Number.isFinite(k)) k = 2;
    n = Math.max(1, Math.min(9, n));
    k = Math.max(1, Math.min(9, k));
    const steps = mode === 'optimized' ? buildOptimizedSteps(n, k) : combinationSteps(n, k);
    return withMetrics(steps, k);
  },
  renderCanvas: (container, step) => renderCombinationOptimizedCanvas(container, step as BacktrackTreeStep),
});
