/**
 * 递增子序列可视化器（回溯算法）— 4-Card 标准现代架构
 * LeetCode 491：给定整数数组，找出所有长度 >= 2 的非递减子序列
 * 不能排序（要保持原数组顺序）；同层用 Set 去重（未排序无法相邻比较）
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import { BacktrackTreeStep } from './backtracking-tree-helper';
import {
  INCREASING_SUBSEQUENCES_PROBLEM_HTML,
  INCREASING_SUBSEQUENCES_ANALYSIS_HTML,
  INCREASING_SUBSEQUENCES_CODE_LANGUAGES,
} from './increasing-subsequences-problem-content';
import {
  buildIncSubTree,
  buildIncSubSteps,
  withMetrics,
} from './increasing-subsequences-step-compiler';
import { renderIncreasingSubsequencesCanvas } from './increasing-subsequences-canvas-adapter';

// 向后兼容导出
export {
  buildIncSubTree,
  buildIncSubSteps,
  renderIncreasingSubsequencesCanvas,
};

registerDeclarativeAlgorithm({
  id: 'increasing-subsequences',
  name: '递增子序列',
  category: 'backtracking',
  description: '求数组所有长度 >= 2 的非递减子序列，不能排序，局部 Set 去重',
  icon: '📈',
  difficulty: 2,
  levelOrder: 11,
  learningGoal: '掌握不能排序时的局部 HashSet 树层去重与非终止型全路径状态收集',
  inputs: [
    { id: 'nums', label: '整数数组', type: 'text', defaultValue: '4,6,7,7' },
  ],
  presets: [
    { label: '示例 1', values: { 'nums': '4,6,7,7' } },
    { label: '示例 2', values: { 'nums': '4,4,3,2,1' } },
    { label: '示例 3', values: { 'nums': '4,7,6,7' } },
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
  codeLanguages: INCREASING_SUBSEQUENCES_CODE_LANGUAGES,
  problemHtml: INCREASING_SUBSEQUENCES_PROBLEM_HTML,
  analysisHtml: INCREASING_SUBSEQUENCES_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const nums = parseNumberList(inputs.nums, '4,6,7,7');
    return withMetrics(buildIncSubSteps(nums.length ? nums : [4, 6, 7, 7]));
  },
  renderCanvas: (container, step) => renderIncreasingSubsequencesCanvas(container, step as BacktrackTreeStep),
});
