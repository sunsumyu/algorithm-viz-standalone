/**
 * 组合总和可视化器（回溯）— 声明式 4-Card 标准架构
 * LeetCode 39：给定无重复元素的整数数组和一个目标整数，找出所有和为目标的组合
 * 元素可以无限重复选取，排序后进行剪枝优化
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  COMBINATION_SUM_PROBLEM_HTML,
  COMBINATION_SUM_ANALYSIS_HTML,
  COMBINATION_SUM_CODE_LANGUAGES,
} from './combination-sum-problem-content';
import {
  CombinationSumStep,
  buildCombinationSumTree,
  buildCombinationSumSteps,
  withMetrics,
} from './combination-sum-step-compiler';
import { renderCombinationSumCanvas } from './combination-sum-canvas-adapter';

export type { CombinationSumStep };
export { buildCombinationSumTree, buildCombinationSumSteps, renderCombinationSumCanvas };

registerDeclarativeAlgorithm({
  id: 'combination-sum',
  name: '组合总和',
  category: 'backtracking',
  description: '无重复元素，可重复选取，剪枝求目标总和',
  icon: '🎯',
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '掌握元素可重复选取的回溯搜索与累加和剪枝',
  inputs: [
    {
      id: 'candidates',
      label: '候选数组',
      type: 'text',
      defaultValue: '2,3,6,7',
      placeholder: '逗号分隔的无重复正整数',
    },
    { id: 'target', label: '目标值 target', type: 'number', defaultValue: 7, min: 1, max: 20 },
  ],
  presets: [
    { label: '基础示例', values: { candidates: '2,3,6,7', target: 7 } },
    { label: '2,3,5 → 8', values: { candidates: '2,3,5', target: 8 } },
    { label: '2,4,6 → 6', values: { candidates: '2,4,6', target: 6 } },
    { label: '大目标', values: { candidates: '2,3,6,7', target: 12 } },
  ],
  metrics: [
    { id: 'sum', label: '当前累加和 / target', color: '#2563eb' },
    { id: 'remaining', label: '剩余差额', color: '#f59e0b' },
    { id: 'depth', label: '递归深度', color: '#a855f7' },
    { id: 'found', label: '已找到组合', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '📍当前探索', color: '#3b82f6' },
    { label: '✅解集命中', color: '#10b981' },
    { label: '✂️剪枝截断', color: '#ef4444' },
    { label: '🔙已回溯', color: '#94a3b8' },
  ],
  codeLanguages: COMBINATION_SUM_CODE_LANGUAGES,
  problemHtml: COMBINATION_SUM_PROBLEM_HTML,
  analysisHtml: COMBINATION_SUM_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const rawCands = String(inputs.candidates ?? '2,3,6,7')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);

    const sorted = Array.from(new Set(rawCands.length > 0 ? rawCands : [2, 3, 6, 7])).sort((a, b) => a - b);
    let target = parseInt(String(inputs.target ?? 7), 10);
    if (!Number.isFinite(target) || target <= 0) target = 7;
    if (target > 30) target = 30;

    return withMetrics(buildCombinationSumSteps(sorted, target), target);
  },
  renderCanvas: (container, step) => renderCombinationSumCanvas(container, step as CombinationSumStep),
});
