/**
 * 下一个更大元素 I 可视化器（单调栈）— 声明式 4-Card 标准架构
 * LeetCode 496：母集 nums2 单调栈建表 map(num -> nextGreater)，子集 nums1 O(1) 查表输出答案
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  NEXT_GREATER_ELEMENT_I_PROBLEM_HTML,
  NEXT_GREATER_ELEMENT_I_ANALYSIS_HTML,
  NEXT_GREATER_ELEMENT_I_CODE_LANGUAGES,
} from './next-greater-element-i-problem-content';
import {
  buildNextGreaterElementISteps,
  withMetrics,
  type NGE1Step,
} from './next-greater-element-i-step-compiler';
import { renderNextGreaterElementICanvas } from './next-greater-element-i-canvas-adapter';

export {
  buildNextGreaterElementISteps,
  withMetrics,
  renderNextGreaterElementICanvas,
  type NGE1Step,
};

registerDeclarativeAlgorithm({
  id: 'next-greater-element-i',
  name: '下一个更大元素 I',
  category: 'monotonic-stack',
  description: '单调栈在母集 nums2 中构建下一个更大元素哈希映射，子集 nums1 查表输出答案',
  icon: '🔍',
  difficulty: 1,
  levelOrder: 2,
  aliases: ['496', 'leetcode-496', 'next-greater-element'],
  hasDeductionTree: true,
  learningGoal: '掌握单调栈与哈希表结合的高效解题范式，理解子集查询先在母集建表的降维思路',
  inputs: [
    {
      id: 'nums1',
      label: '子集 nums1',
      type: 'text',
      defaultValue: '4,1,2',
      placeholder: '逗号分隔数字',
    },
    {
      id: 'nums2',
      label: '母集 nums2',
      type: 'text',
      defaultValue: '1,3,4,2',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '示例 1', values: { nums1: '4,1,2', nums2: '1,3,4,2' } },
    { label: '示例 2', values: { nums1: '2,4', nums2: '1,2,3,4' } },
    { label: '单调降后升', values: { nums1: '1,3,5,2,4', nums2: '6,5,4,3,2,1,7' } },
  ],
  metrics: [
    { id: 'cur-elem', label: '当前处理元素', color: '#2563eb' },
    { id: 'stack-top', label: '单调栈顶', color: '#d97706' },
    { id: 'map-size', label: '已建映射', color: '#059669' },
    { id: 'answers', label: '答案数组', color: '#2563eb' },
    { id: 'action', label: '操作状态', color: '#2563eb' },
  ],
  legend: [
    { label: '当前考察', color: '#2563eb' },
    { label: '栈内元素', color: '#d97706' },
    { label: '映射确立', color: '#10b981' },
  ],
  codeLanguages: NEXT_GREATER_ELEMENT_I_CODE_LANGUAGES,
  problemHtml: NEXT_GREATER_ELEMENT_I_PROBLEM_HTML,
  analysisHtml: NEXT_GREATER_ELEMENT_I_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const nums1 = parseNumberList(inputs.nums1, '4,1,2');
    const nums2 = parseNumberList(inputs.nums2, '1,3,4,2');
    return withMetrics(buildNextGreaterElementISteps(nums1.length ? nums1 : [4, 1, 2], nums2.length ? nums2 : [1, 3, 4, 2]));
  },
  renderCanvas: (container, step) => renderNextGreaterElementICanvas(container, step as NGE1Step),
});
