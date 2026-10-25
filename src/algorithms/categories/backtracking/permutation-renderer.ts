/**
 * 全排列可视化器（回溯算法）— 4-Card 标准现代架构
 * LeetCode 46：给定不含重复数字的数组，返回所有可能的全排列
 * 核心：全循环枚举 + used[] 树枝去重标记
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import { BacktrackTreeStep } from './backtracking-tree-helper';
import {
  PERMUTATION_PROBLEM_HTML,
  PERMUTATION_ANALYSIS_HTML,
  PERMUTATION_CODE_LANGUAGES,
} from './permutation-problem-content';
import {
  buildPermutationTree,
  buildPermutationSteps,
  withMetrics,
} from './permutation-step-compiler';
import { renderPermutationCanvas } from './permutation-canvas-adapter';

// 向后兼容导出
export {
  buildPermutationTree,
  buildPermutationSteps,
  renderPermutationCanvas,
};

registerDeclarativeAlgorithm({
  id: 'permutation',
  aliases: ['46', 'leetcode-46', 'permutations-all'],
  hasDeductionTree: true,
  name: '全排列',
  category: 'backtracking',
  description: '无重复元素全排列，used 数组树枝标记与全循环回溯',
  icon: '🔀',
  difficulty: 2,
  levelOrder: 12,
  learningGoal: '掌握排列问题中从 0 开始的全局循环与 used[] 树枝去重标记机制',
  inputs: [
    {
      id: 'nums',
      label: '输入数组（无重复）',
      type: 'text',
      defaultValue: '1,2,3',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '1,2,3', values: { nums: '1,2,3' } },
    { label: '1,2', values: { nums: '1,2' } },
    { label: '1,2,3,4', values: { nums: '1,2,3,4' } },
  ],
  metrics: [
    { id: 'path', label: '当前路径', color: '#2563eb' },
    { id: 'visited', label: '已访问节点', color: '#a855f7' },
    { id: 'results', label: '已收集排列', color: '#10b981' },
    { id: 'pruned', label: '剪枝次数', color: '#ef4444' },
  ],
  legend: [
    { label: '当前节点', color: '#2563eb' },
    { label: '已访问', color: '#a855f7' },
    { label: '收集方案', color: '#10b981' },
    { label: '剪枝', color: '#ef4444' },
  ],
  codeLanguages: PERMUTATION_CODE_LANGUAGES,
  problemHtml: PERMUTATION_PROBLEM_HTML,
  analysisHtml: PERMUTATION_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const nums = parseNumberList(inputs.nums, '1,2,3');
    return withMetrics(buildPermutationSteps(nums.length ? nums : [1, 2, 3]));
  },
  renderCanvas: (container, step) => renderPermutationCanvas(container, step as BacktrackTreeStep),
});
