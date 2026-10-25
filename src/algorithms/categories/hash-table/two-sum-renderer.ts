/**
 * 两数之和可视化器 — 声明式 4-Card 标准架构
 * LeetCode 1：哈希表一次遍历
 */

import { parseNumberList } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  TWO_SUM_PROBLEM_HTML,
  TWO_SUM_ANALYSIS_HTML,
  TWO_SUM_CODE_LANGUAGES,
} from './two-sum-problem-content';
import {
  TwoSumStep,
  buildTwoSumSteps,
  withTwoSumMetrics,
} from './two-sum-step-compiler';
import { renderTwoSumCanvas } from './two-sum-canvas-adapter';

export type { TwoSumStep };
export { buildTwoSumSteps, withTwoSumMetrics, renderTwoSumCanvas };

registerDeclarativeAlgorithm({
  id: 'two-sum',
  aliases: ['1', 'leetcode-1', 'two-sum-hash'],
  hasDeductionTree: true,
  name: '两数之和（哈希表）',
  category: 'hash-table',
  description: '哈希表一次遍历求两数之和',
  icon: '🔗',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '理解哈希表如何替代暴力枚举降低时间复杂度',
  inputs: [
    {
      id: 'nums',
      label: '数组',
      type: 'text',
      defaultValue: '2, 7, 11, 15',
      placeholder: '逗号分隔',
      width: '105px',
    },
    {
      id: 'target',
      label: 'target',
      type: 'number',
      defaultValue: 9,
      width: '60px',
    },
  ],
  presets: [
    { label: '示例 1: ([2,7,11,15], target=9)', values: { nums: '2, 7, 11, 15', target: 9 } },
    { label: '示例 2: ([3,2,4], target=6)', values: { nums: '3, 2, 4', target: 6 } },
    { label: '相同元素: ([3,3], target=6)', values: { nums: '3, 3', target: 6 } },
    { label: '跨度匹配: (target=12)', values: { nums: '1, 5, 8, 3, 9', target: 12 } },
  ],
  metrics: [
    { id: 'i', label: '当前下标 i', color: '#2563eb' },
    { id: 'cur-val', label: '当前数值 nums[i]', color: '#9333ea' },
    { id: 'comp', label: '寻找补数 complement', color: '#f59e0b' },
    { id: 'status', label: '匹配状态', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '当前元素 nums[i]', color: '#2563eb' },
    { label: '目标配对补数', color: '#10b981' },
  ],
  codeLanguages: TWO_SUM_CODE_LANGUAGES,
  problemHtml: TWO_SUM_PROBLEM_HTML,
  analysisHtml: TWO_SUM_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const nums = parseNumberList(String(inputs.nums ?? '2, 7, 11, 15'), [2, 7, 11, 15]);
    const target = parseInt(String(inputs.target ?? '9'), 10);
    return withTwoSumMetrics(buildTwoSumSteps(nums, isNaN(target) ? 9 : target), isNaN(target) ? 9 : target);
  },
  renderCanvas: (container, step) => renderTwoSumCanvas(container, step as TwoSumStep),
});
