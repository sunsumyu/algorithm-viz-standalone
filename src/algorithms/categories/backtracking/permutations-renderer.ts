/**
 * 全排列·used数组可视化器（回溯算法）— 4-Card 标准现代架构
 * LeetCode 46：使用 used 标记已选元素，显式剪枝树视角
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
  PERMUTATIONS_CODE_LINES,
  buildPermutationsTree,
  buildPermutationsSteps,
  withMetrics,
} from './permutations-step-compiler';
import { renderPermutationsCanvas } from './permutations-canvas-adapter';

// 向后兼容导出
export {
  PERMUTATIONS_CODE_LINES,
  buildPermutationsTree,
  buildPermutationsSteps,
  renderPermutationsCanvas,
};

registerDeclarativeAlgorithm({
  id: 'permutations',
  aliases: ['permutations-used'],
  hasDeductionTree: true,
  name: '全排列·used数组',
  category: 'backtracking',
  description: '回溯枚举所有排列，used 标记已选元素',
  icon: '🔢',
  difficulty: 1,
  levelOrder: 15,
  learningGoal: '掌握 used 数组标记法在排列回溯中的去重与剪枝原理',
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
    { label: '1,2,3,4', values: { nums: '1,2,3' } },
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
    return withMetrics(buildPermutationsSteps(nums.length ? nums : [1, 2, 3]));
  },
  renderCanvas: (container, step) => renderPermutationsCanvas(container, step as BacktrackTreeStep),
});
