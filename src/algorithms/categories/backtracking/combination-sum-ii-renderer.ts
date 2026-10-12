/**
 * 组合总和 II 可视化器（回溯决策树版本）— 4-Card 标准现代架构
 * LeetCode 40：每个元素只能用一次，排序后同层去重与剪枝
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import type { BacktrackTreeStep } from './backtracking-tree-helper';
import {
  COMBINATION_SUM_II_PROBLEM_HTML,
  COMBINATION_SUM_II_ANALYSIS_HTML,
  COMBINATION_SUM_II_CODE_LANGUAGES,
} from './combination-sum-ii-problem-content';
import {
  buildCombinationSum2Tree,
  buildCombinationSum2Steps,
  withMetrics,
} from './combination-sum-ii-step-compiler';
import { renderCombinationSumIiCanvas } from './combination-sum-ii-canvas-adapter';

export { buildCombinationSum2Tree, buildCombinationSum2Steps, renderCombinationSumIiCanvas };

registerDeclarativeAlgorithm({
  id: 'combination-sum-ii',
  name: '组合总和 II',
  category: 'backtracking',
  description: '含重复元素，每个元素限用一次，同层去重',
  icon: '🎯',
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '掌握经典树层去重 (i > startIndex && c[i]==c[i-1]) 机制',
  inputs: [
    { id: 'candidates', label: '候选数组（可含重复）', type: 'text', defaultValue: '10,1,2,7,6,1,5' },
    { id: 'target', label: '目标和 target', type: 'number', defaultValue: '8' },
  ],
  presets: [
    { label: '示例 1', values: { 'candidates': '10,1,2,7,6,1,5', 'target': '8' } },
    { label: '示例 2', values: { 'candidates': '2,5,2,1,2', 'target': '5' } },
    { label: '示例 3', values: { 'candidates': '1,1,2,2', 'target': '4' } },
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
  codeLanguages: COMBINATION_SUM_II_CODE_LANGUAGES,
  problemHtml: COMBINATION_SUM_II_PROBLEM_HTML,
  analysisHtml: COMBINATION_SUM_II_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const cands = parseNumberList(inputs.candidates, '10,1,2,7,6,1,5');
    let target = parseInt(String(inputs.target ?? '8'), 10);
    if (!Number.isFinite(target)) target = 8;
    return withMetrics(buildCombinationSum2Steps(cands.length ? cands : [10, 1, 2, 7, 6, 1, 5], target));
  },
  renderCanvas: (container, step) => renderCombinationSumIiCanvas(container, step as BacktrackTreeStep),
});
