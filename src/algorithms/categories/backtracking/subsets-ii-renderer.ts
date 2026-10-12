/**
 * 子集 II 可视化器（回溯算法）— 4-Card 标准现代架构
 * LeetCode 90：输入含重复元素，排序后同层去重
 * backtrack(start, path)：先收集 path，然后 for i in [start, n)：
 *   if i > start && sorted[i] == sorted[i-1] 同层去重（剪枝），否则选 nums[i] 递归
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import { BacktrackTreeStep } from './backtracking-tree-helper';
import {
  SUBSETS_II_PROBLEM_HTML,
  SUBSETS_II_ANALYSIS_HTML,
  SUBSETS_II_CODE_LANGUAGES,
} from './subsets-ii-problem-content';
import {
  buildSubsets2Tree,
  buildSubsets2Steps,
  withMetrics,
} from './subsets-ii-step-compiler';
import { renderSubsetsIiCanvas } from './subsets-ii-canvas-adapter';

// 向后兼容导出
export {
  buildSubsets2Tree,
  buildSubsets2Steps,
  renderSubsetsIiCanvas,
};

registerDeclarativeAlgorithm({
  id: 'subsets-ii',
  name: '子集 II',
  category: 'backtracking',
  description: '含重复元素数组的子集生成，排序后树层去重',
  icon: '📦',
  difficulty: 2,
  levelOrder: 10,
  learningGoal: '掌握含重复元素时的全节点收集与树层去重 (i > startIndex && nums[i]==nums[i-1]) 机制',
  inputs: [
    { id: 'nums', label: '整数数组（可含重复）', type: 'text', defaultValue: '1,2,2' },
  ],
  presets: [
    { label: '示例 1', values: { 'nums': '1,2,2' } },
    { label: '示例 2', values: { 'nums': '2,1,2' } },
    { label: '示例 3', values: { 'nums': '1,2,2,3' } },
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
  codeLanguages: SUBSETS_II_CODE_LANGUAGES,
  problemHtml: SUBSETS_II_PROBLEM_HTML,
  analysisHtml: SUBSETS_II_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const nums = parseNumberList(inputs.nums, '1,2,2');
    return withMetrics(buildSubsets2Steps(nums.length ? nums : [1, 2, 2]));
  },
  renderCanvas: (container, step) => renderSubsetsIiCanvas(container, step as BacktrackTreeStep),
});
