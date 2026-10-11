/**
 * 下一个更大元素 II 可视化器（单调栈 · 循环数组）— 4-Card 标准现代架构
 * LeetCode 503：利用取模 2n 轮循环遍历 (i % n)，单调递增栈（栈头到栈底）
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  NEXT_GREATER_ELEMENT_II_PROBLEM_HTML,
  NEXT_GREATER_ELEMENT_II_ANALYSIS_HTML,
  NEXT_GREATER_ELEMENT_II_CODE_LANGUAGES,
} from './next-greater-element-ii-problem-content';
import {
  buildNextGreaterElementIISteps,
  withMetrics,
  type NGE2Step,
} from './next-greater-element-ii-step-compiler';
import { renderNextGreaterElementIICanvas } from './next-greater-element-ii-canvas-adapter';

export {
  buildNextGreaterElementIISteps,
  withMetrics,
  renderNextGreaterElementIICanvas,
  type NGE2Step,
};

registerDeclarativeAlgorithm({
  id: 'next-greater-element-ii',
  name: '下一个更大元素 II',
  category: 'monotonic-stack',
  description: '循环数组通过取模模拟 2 轮遍历 (i % n)，单调递减栈寻找循环右侧首个更大元素',
  icon: '🔄',
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '掌握循环数组在单调栈中的取模模拟技巧，理解两轮遍历即可完备覆盖循环边界的数学原理',
  inputs: [
    {
      id: 'nums',
      label: '循环数组',
      type: 'text',
      defaultValue: '1,2,1',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '示例 1', values: { nums: '1,2,1' } },
    { label: '示例 2', values: { nums: '1,2,3,4,3' } },
    { label: '单调递减', values: { nums: '5,4,3,2,1' } },
  ],
  metrics: [
    { id: 'loop-idx', label: '循环步数/实际下标', color: '#4f46e5' },
    { id: 'stack-top', label: '当前栈顶', color: '#d97706' },
    { id: 'resolved', label: '已确定数量', color: '#059669' },
    { id: 'result', label: '答案数组', color: '#4f46e5' },
    { id: 'action', label: '操作决策', color: '#2563eb' },
  ],
  legend: [
    { label: '📍 当前考察', color: '#4f46e5' },
    { label: '🥞 栈内待结算', color: '#fbbf24' },
    { label: '✓ 已结算', color: '#10b981' },
  ],
  codeLanguages: NEXT_GREATER_ELEMENT_II_CODE_LANGUAGES,
  problemHtml: NEXT_GREATER_ELEMENT_II_PROBLEM_HTML,
  analysisHtml: NEXT_GREATER_ELEMENT_II_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const rawNums = parseNumberList(inputs.nums, '1,2,1');
    return withMetrics(buildNextGreaterElementIISteps(rawNums.length ? rawNums : [1, 2, 1]));
  },
  renderCanvas: (container, step) => renderNextGreaterElementIICanvas(container, step as NGE2Step),
});
