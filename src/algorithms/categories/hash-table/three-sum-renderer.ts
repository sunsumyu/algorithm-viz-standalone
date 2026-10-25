/**
 * 三数之和可视化器 — 声明式 4-Card 标准架构
 * LeetCode 15：排序 + 双指针 + 去重剪枝
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  THREE_SUM_PROBLEM_HTML,
  THREE_SUM_ANALYSIS_HTML,
  THREE_SUM_CODE_LANGUAGES,
} from './three-sum-problem-content';
import {
  ThreeSumStep,
  parseThreeSumArray,
  buildThreeSumSteps,
  withThreeSumMetrics,
} from './three-sum-step-compiler';
import { renderThreeSumCanvas } from './three-sum-canvas-adapter';

export type { ThreeSumStep };
export {
  parseThreeSumArray,
  buildThreeSumSteps,
  withThreeSumMetrics,
  renderThreeSumCanvas,
};

registerDeclarativeAlgorithm({
  id: 'three-sum',
  aliases: ['15', 'leetcode-15', 'three-sum-two-pointers'],
  hasDeductionTree: true,
  name: '三数之和（排序+双指针）',
  category: 'hash-table',
  description: '排序后双指针求和为0的三元组',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 2,
  learningGoal: '掌握排序 + 双指针 + 去重的三数求和技巧',
  inputs: [
    {
      id: 'nums',
      label: '数组',
      type: 'text',
      defaultValue: '-1, 0, 1, 2, -1, -4',
      placeholder: '逗号分隔',
      width: '140px',
    },
  ],
  presets: [
    { label: '示例 1: [-1,0,1,2,-1,-4]', values: { nums: '-1, 0, 1, 2, -1, -4' } },
    { label: '无合法解: [0,1,1]', values: { nums: '0, 1, 1' } },
    { label: '全零: [0,0,0]', values: { nums: '0, 0, 0' } },
    { label: '多重解: [-2,0,1,1,2]', values: { nums: '-2, 0, 1, 1, 2' } },
  ],
  metrics: [
    { id: 'i', label: '固定基准 i', color: '#3b82f6' },
    { id: 'left', label: '左指针 left', color: '#10b981' },
    { id: 'right', label: '右指针 right', color: '#f59e0b' },
    { id: 'sum', label: '三数之和 sum', color: '#a855f7' },
  ],
  legend: [
    { label: '基准 i', color: '#3b82f6' },
    { label: '左指针 left', color: '#10b981' },
    { label: '右指针 right', color: '#f59e0b' },
  ],
  codeLanguages: THREE_SUM_CODE_LANGUAGES,
  problemHtml: THREE_SUM_PROBLEM_HTML,
  analysisHtml: THREE_SUM_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withThreeSumMetrics(buildThreeSumSteps(parseThreeSumArray(String(inputs.nums ?? '-1, 0, 1, 2, -1, -4')))),
  renderCanvas: (container, step) => renderThreeSumCanvas(container, step as ThreeSumStep),
});
