/**
 * 四数之和可视化器 — 声明式 4-Card 标准架构
 * LeetCode 18：双层 for 循环 + 双指针 + 两级去重剪枝
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  FOUR_SUM_PROBLEM_HTML,
  FOUR_SUM_ANALYSIS_HTML,
  FOUR_SUM_CODE_LANGUAGES,
} from './four-sum-problem-content';
import {
  FourSumStep,
  parseFourSumArray,
  buildFourSumSteps,
  withFourSumMetrics,
} from './four-sum-step-compiler';
import { renderFourSumCanvas } from './four-sum-canvas-adapter';

export type { FourSumStep };
export {
  parseFourSumArray,
  buildFourSumSteps,
  withFourSumMetrics,
  renderFourSumCanvas,
};

registerDeclarativeAlgorithm({
  id: 'four-sum',
  name: '四数之和（排序+双指针）',
  category: 'hash-table',
  description: '排序后固定 i/j 再双指针求和为 target 的四元组',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 3,
  learningGoal: '掌握嵌套双指针 + 多层去重的四数求和技巧',
  inputs: [
    {
      id: 'nums',
      label: '数组',
      type: 'text',
      defaultValue: '1, 0, -1, 0, -2, 2',
      placeholder: '逗号分隔',
      width: '135px',
    },
    {
      id: 'target',
      label: 'target',
      type: 'number',
      defaultValue: 0,
      width: '40px',
    },
  ],
  presets: [
    { label: '示例 1: (target=0)', values: { nums: '1, 0, -1, 0, -2, 2', target: 0 } },
    { label: '全相同: (target=8)', values: { nums: '2, 2, 2, 2, 2', target: 8 } },
    { label: '对称分布: (target=0)', values: { nums: '-3, -2, -1, 0, 0, 1, 2, 3', target: 0 } },
  ],
  metrics: [
    { id: 'ij', label: '固定 i / j', color: '#3b82f6' },
    { id: 'lr', label: '双指针 left / right', color: '#10b981' },
    { id: 'sum', label: '四数之和 sum', color: '#a855f7' },
    { id: 'target', label: '目标 target', color: '#0f172a' },
  ],
  legend: [
    { label: 'i', color: '#3b82f6' },
    { label: 'j', color: '#8b5cf6' },
    { label: 'left', color: '#10b981' },
    { label: 'right', color: '#f59e0b' },
  ],
  codeLanguages: FOUR_SUM_CODE_LANGUAGES,
  problemHtml: FOUR_SUM_PROBLEM_HTML,
  analysisHtml: FOUR_SUM_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const nums = parseFourSumArray(String(inputs.nums ?? '1, 0, -1, 0, -2, 2'));
    const target = parseInt(String(inputs.target ?? '0'), 10);
    return withFourSumMetrics(buildFourSumSteps(nums, isNaN(target) ? 0 : target));
  },
  renderCanvas: (container, step) => renderFourSumCanvas(container, step as FourSumStep),
});
