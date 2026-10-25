/**
 * 子集可视化器（回溯算法）— 声明式 4-Card 标准架构
 * LeetCode 78：给定不含重复数字的整数数组，返回所有可能的子集
 * 核心：全树节点收集 (收集树上的每一个状态)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  SUBSET_PROBLEM_HTML,
  SUBSET_ANALYSIS_HTML,
  SUBSET_CODE_LANGUAGES,
} from './subset-problem-content';
import {
  SubsetStep,
  buildSubsetTree,
  buildSubsetSteps,
  withMetrics,
} from './subset-step-compiler';
import { renderSubsetCanvas } from './subset-canvas-adapter';

// 向后兼容导出
export type { SubsetStep };
export {
  buildSubsetTree,
  buildSubsetSteps,
  renderSubsetCanvas,
};

registerDeclarativeAlgorithm({
  id: 'subset',
  aliases: ['78', 'leetcode-78', 'subsets'],
  hasDeductionTree: true,
  name: '子集',
  category: 'backtracking',
  description: '求无重复数组的所有子集（幂集），全节点收集',
  icon: '📦',
  difficulty: 2,
  levelOrder: 9,
  learningGoal: '掌握子集问题的全节点收集特性与 2^N 幂集回溯模型',
  inputs: [
    {
      id: 'nums',
      label: '数组 nums',
      type: 'text',
      defaultValue: '1,2,3',
      placeholder: '逗号分隔的不同元素（≤5 个）',
    },
  ],
  presets: [
    { label: '基础示例', values: { nums: '1,2,3' } },
    { label: '两个元素', values: { nums: '1,2' } },
    { label: '四个元素', values: { nums: '1,2,3,4' } },
    { label: '含较大值', values: { nums: '2,4,6,8' } },
  ],
  metrics: [
    { id: 'depth', label: '递归深度', color: '#2563eb' },
    { id: 'path', label: '路径栈 path', color: '#a855f7' },
    { id: 'collected', label: '已收集子集', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#f59e0b' },
  ],
  legend: [
    { label: '📍当前探索', color: '#3b82f6' },
    { label: '✅子集收集节点', color: '#10b981' },
    { label: '🔙已回溯', color: '#94a3b8' },
  ],
  codeLanguages: SUBSET_CODE_LANGUAGES,
  problemHtml: SUBSET_PROBLEM_HTML,
  analysisHtml: SUBSET_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const rawNums = parseNumberList(inputs.nums, '1,2,3');
    const nums = rawNums.length > 0 ? Array.from(new Set(rawNums)) : [1, 2, 3];
    if (nums.length > 5) nums.length = 5; // 防止组合爆炸
    return withMetrics(buildSubsetSteps(nums));
  },
  renderCanvas: (container, step) => renderSubsetCanvas(container, step as SubsetStep),
});
