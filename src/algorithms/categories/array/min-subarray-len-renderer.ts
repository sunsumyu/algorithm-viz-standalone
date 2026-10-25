/**
 * 长度最小的子数组可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * LeetCode 209：滑动窗口双指针
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  MIN_SUBARRAY_LEN_PROBLEM_HTML,
  MIN_SUBARRAY_LEN_ANALYSIS_HTML,
  MIN_SUBARRAY_LEN_CODE_LANGUAGES,
} from './min-subarray-len-problem-content';
import {
  SWStep,
  parsePositiveArray,
  buildMinSubarrayLenSteps,
} from './min-subarray-len-step-compiler';
import { renderMinSubarrayLenCanvas } from './min-subarray-len-canvas-adapter';

export type { SWStep };
export { parsePositiveArray, buildMinSubarrayLenSteps, renderMinSubarrayLenCanvas };

const { template, Visualizer } = createDeclarativeVisualizer<SWStep>({
  id: 'min-subarray-len',
  name: '长度最小的子数组',
  category: 'array',
  icon: '🪟',
  badge: {
    mode: '滑动窗口双指针',
    complexity: 'O(n) · O(1)',
  },
  card1Title: '📊 数组条带与动态滑动窗口沙盘',
  card2Title: '🧭 窗口和与最小长度监视器',
  card2Desc: '当前窗口范围 [left..right]、累加和 sum 与历史最小长度',
  legend: [
    { label: '滑动窗口覆盖', color: '#3b82f6' },
    { label: '左边界 left', color: '#0d9488' },
    { label: '右边界 right', color: '#2563eb' },
  ],
  inputs: [
    {
      id: 'input-target',
      label: '目标和 target',
      type: 'number',
      defaultValue: 7,
      width: '45px',
    },
    {
      id: 'input-array',
      label: '正整数数组',
      type: 'text',
      defaultValue: '2, 3, 1, 2, 4, 3',
      width: '140px',
      placeholder: '2, 3, 1, 2, 4, 3',
    },
  ],
  presets: [
    { label: '示例 1 (target=7)', values: { 'input-target': 7, 'input-array': '2, 3, 1, 2, 4, 3' } },
    { label: '单元素达标 (target=4)', values: { 'input-target': 4, 'input-array': '1, 4, 4' } },
    { label: '无达标子数组 (target=11)', values: { 'input-target': 11, 'input-array': '1, 1, 1, 1, 1, 1, 1, 1' } },
  ],
  metrics: [
    { id: 'cur-sum', label: '当前窗口和 sum', color: '#2563eb' },
    { id: 'window-len', label: '当前窗口长度', color: '#0d9488' },
    { id: 'min-len', label: '历史最小长度 minLen', color: '#16a34a' },
  ],
  codeLanguages: MIN_SUBARRAY_LEN_CODE_LANGUAGES,
  problemHtml: MIN_SUBARRAY_LEN_PROBLEM_HTML,
  analysisHtml: MIN_SUBARRAY_LEN_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-array'] || '2, 3, 1, 2, 4, 3';
    const arr = parsePositiveArray(raw);
    const target = parseInt(inputs['input-target'] || '7', 10);
    return buildMinSubarrayLenSteps(arr, target);
  },
  renderCanvas: (container, step) => {
    renderMinSubarrayLenCanvas(container, step);
  },
});

registerAlgorithm({
  id: 'min-subarray-len',
  aliases: ['209', 'leetcode-209', 'minimum-size-subarray-sum'],
  hasDeductionTree: true,
  name: '长度最小的子数组',
  viewId: 'algo-min-subarray-len-view',
  category: 'array',
  description: '滑动窗口双指针：right 扩展累加，sum ≥ target 时更新最小长度并收缩 left',
  icon: '🪟',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '掌握滑动窗口在连续子数组条件最值问题中的右扩左缩单调收敛机制',
});
