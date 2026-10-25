/**
 * 组合总和 III 可视化器（回溯决策树版本）— 4-Card 标准现代架构
 * LeetCode 216：从 1-9 中选 k 个不重复数字，使总和为 n
 * 双重剪枝：累加和超额剪枝 + 剩余可选数字不足剪枝
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import type { BacktrackTreeStep } from './backtracking-tree-helper';
import {
  COMBINATION_SUM_III_PROBLEM_HTML,
  COMBINATION_SUM_III_ANALYSIS_HTML,
  COMBINATION_SUM_III_CODE_LANGUAGES,
} from './combination-sum-iii-problem-content';
import {
  buildCombinationSum3Tree,
  buildCombinationSum3Steps,
  withMetrics,
} from './combination-sum-iii-step-compiler';
import { renderCombinationSumIiiCanvas } from './combination-sum-iii-canvas-adapter';

export { buildCombinationSum3Tree, buildCombinationSum3Steps, renderCombinationSumIiiCanvas };

registerDeclarativeAlgorithm({
  id: 'combination-sum-iii',
  aliases: ['216', 'leetcode-216', 'combination-sum-3'],
  hasDeductionTree: true,
  name: '组合总和 III',
  category: 'backtracking',
  description: '1-9 中选 k 个数字且和为 n，双重剪枝',
  icon: '🎯',
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '掌握固定区间 (1~9) 的深度回溯与多维剪枝不等式',
  inputs: [
    { id: 'k', label: '选取个数 k', type: 'number', defaultValue: '3' },
    { id: 'n', label: '目标和 n', type: 'number', defaultValue: '7' },
  ],
  presets: [
    { label: '示例 1', values: { 'k': '3', 'n': '7' } },
    { label: '示例 2', values: { 'k': '3', 'n': '9' } },
    { label: '示例 3', values: { 'k': '4', 'n': '10' } },
  ],
  metrics: [
    { id: 'path', label: '当前路径', color: '#2563eb' },
    { id: 'visited', label: '已访问节点', color: '#a855f7' },
    { id: 'results', label: '已收集方案', color: '#10b981' },
    { id: 'pruned', label: '剪枝次数', color: '#ef4444' },
  ],
  legend: [
    { label: '当前节点', color: '#2563eb' },
    { label: '已访问', color: '#a855f7' },
    { label: '收集方案', color: '#10b981' },
    { label: '剪枝', color: '#ef4444' },
  ],
  codeLanguages: COMBINATION_SUM_III_CODE_LANGUAGES,
  problemHtml: COMBINATION_SUM_III_PROBLEM_HTML,
  analysisHtml: COMBINATION_SUM_III_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    let k = parseInt(String(inputs.k ?? '3'), 10);
    let n = parseInt(String(inputs.n ?? '7'), 10);
    if (!Number.isFinite(k) || k < 2) k = 3;
    if (!Number.isFinite(n) || n < 1) n = 7;
    return withMetrics(buildCombinationSum3Steps(k, n));
  },
  renderCanvas: (container, step) => renderCombinationSumIiiCanvas(container, step as BacktrackTreeStep),
});
