/**
 * 全排列 II 可视化器（回溯算法）— 4-Card 标准现代架构
 * LeetCode 47：输入含重复数字，排序 + used 数组 + 同层去重
 * 核心：树枝去重 (used[i]) + 树层去重 (nums[i] == nums[i-1] && !used[i-1])
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import { BacktrackTreeStep } from './backtracking-tree-helper';
import {
  PERMUTATION_II_PROBLEM_HTML,
  PERMUTATION_II_ANALYSIS_HTML,
  PERMUTATION_II_CODE_LANGUAGES,
} from './permutation-ii-problem-content';
import {
  buildPerm2Tree,
  buildPerm2Steps,
  withMetrics,
} from './permutation-ii-step-compiler';
import { renderPermutationIICanvas } from './permutation-ii-canvas-adapter';

// 向后兼容导出
export {
  buildPerm2Tree,
  buildPerm2Steps,
  renderPermutationIICanvas,
};

registerDeclarativeAlgorithm({
  id: 'permutation-ii',
  name: '全排列 II',
  category: 'backtracking',
  description: '含重复元素全排列，树层去重 (!used[i-1]) 与树枝标记',
  icon: '🔀',
  difficulty: 2,
  levelOrder: 13,
  learningGoal: '掌握含重复元素排列中的树层去重 (!used[i-1]) 与树枝占用的本质区别',
  inputs: [
    {
      id: 'nums',
      label: '输入数组（含重复）',
      type: 'text',
      defaultValue: '1,1,2',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '1,1,2', values: { nums: '1,1,2' } },
    { label: '1,2,2', values: { nums: '1,2,2' } },
    { label: '1,1,2,2', values: { nums: '1,1,2,2' } },
  ],
  metrics: [
    { id: 'path', label: '当前路径', color: '#2563eb' },
    { id: 'visited', label: '已访问节点', color: '#a855f7' },
    { id: 'results', label: '已收集排列', color: '#10b981' },
    { id: 'pruned', label: '去重剪枝次数', color: '#ef4444' },
  ],
  legend: [
    { label: '当前节点', color: '#2563eb' },
    { label: '已访问', color: '#a855f7' },
    { label: '收集方案', color: '#10b981' },
    { label: '树层去重剪枝', color: '#ef4444' },
  ],
  codeLanguages: PERMUTATION_II_CODE_LANGUAGES,
  problemHtml: PERMUTATION_II_PROBLEM_HTML,
  analysisHtml: PERMUTATION_II_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const nums = parseNumberList(inputs.nums, '1,1,2');
    return withMetrics(buildPerm2Steps(nums.length ? nums : [1, 1, 2]));
  },
  renderCanvas: (container, step) => renderPermutationIICanvas(container, step as BacktrackTreeStep),
});
