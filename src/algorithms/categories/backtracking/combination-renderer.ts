/**
 * 组合问题可视化器（回溯算法）— 声明式 4-Card 标准架构
 * LeetCode 77：给定 n 和 k，返回 1...n 中所有可能的 k 个数的组合
 * 基础版：不剪枝，展示回溯搜索决策树的完整结构
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  COMBINATION_PROBLEM_HTML,
  COMBINATION_ANALYSIS_HTML,
} from './combination-problem-content';
import {
  CombinationStep,
  buildCombinationTree,
  combinationSteps,
  withMetrics,
  COMBINATION_CODE_LANGUAGES,
} from './combination-step-compiler';
import { renderCombinationCanvas } from './combination-canvas-adapter';

export type { CombinationStep };
export { buildCombinationTree, combinationSteps, renderCombinationCanvas };

registerDeclarativeAlgorithm({
  id: 'combination',
  name: '组合问题（回溯）',
  category: 'backtracking',
  description: '使用回溯算法生成所有组合',
  icon: '🎯',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握回溯法的基础框架：选择、递归、撤销，理解决策树结构',
  inputs: [
    { id: 'n', label: 'n (1..n)', type: 'number', defaultValue: 4, min: 1, max: 8 },
    { id: 'k', label: 'k (选 k 个)', type: 'number', defaultValue: 2, min: 1, max: 8 },
  ],
  presets: [
    { label: '基础示例', values: { n: 4, k: 2 } },
    { label: '5 选 3', values: { n: 5, k: 3 } },
    { label: '6 选 2', values: { n: 6, k: 2 } },
    { label: '全选 k=n', values: { n: 4, k: 4 } },
  ],
  metrics: [
    { id: 'start', label: 'startIndex', color: '#2563eb' },
    { id: 'cur-i', label: '当前 i', color: '#a855f7' },
    { id: 'need', label: '还需元素', color: '#f59e0b' },
    { id: 'found', label: '已找到组合', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '📍当前探索', color: '#3b82f6' },
    { label: '✅解集命中', color: '#10b981' },
    { label: '🔙已回溯', color: '#94a3b8' },
  ],
  codeLanguages: COMBINATION_CODE_LANGUAGES,
  problemHtml: COMBINATION_PROBLEM_HTML,
  analysisHtml: COMBINATION_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    let n = parseInt(String(inputs.n ?? 4), 10);
    let k = parseInt(String(inputs.k ?? 2), 10);
    if (!Number.isFinite(n)) n = 4;
    if (!Number.isFinite(k)) k = 2;
    if (k <= 0) k = 1;
    if (n <= 0) n = 1;
    return withMetrics(combinationSteps(n, k));
  },
  renderCanvas: (container, step) => renderCombinationCanvas(container, step as CombinationStep),
});
