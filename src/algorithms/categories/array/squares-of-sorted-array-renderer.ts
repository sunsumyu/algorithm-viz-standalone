/**
 * 有序数组的平方可视化器 — 顶层声明式黄金规约架构 (Declarative Visualizer)
 * LeetCode 977：首尾对撞双指针
 * 遵循 Zero-Subbox 规范，扁平双轨沙盘与纯数据驱动 4-Card 结构
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  SQUARES_OF_SORTED_ARRAY_PROBLEM_HTML,
  SQUARES_OF_SORTED_ARRAY_ANALYSIS_HTML,
  SQUARES_OF_SORTED_ARRAY_CODE_LANGUAGES,
} from './squares-of-sorted-array-problem-content';
import {
  SSQStep,
  parseSortedArray,
  buildSortedSquaresSteps,
} from './squares-of-sorted-array-step-compiler';
import {
  renderSortedSquaresCanvas,
  renderSortedSquaresAuxiliary,
} from './squares-of-sorted-array-canvas-adapter';

export type { SSQStep };
export { parseSortedArray, buildSortedSquaresSteps, renderSortedSquaresCanvas, renderSortedSquaresAuxiliary };

const { template, Visualizer } = createDeclarativeVisualizer<SSQStep>({
  id: 'sorted-squares',
  name: '有序数组的平方',
  category: 'array',
  icon: '📐',
  badge: {
    mode: '首尾对撞双指针',
    complexity: 'O(n) · O(n)',
  },
  card1Title: '📊 原始数组与结果数组双轨沙盘',
  card2Title: '🧭 对撞指针与平方比较监视器',
  card2Desc: '左右指针位置、当前平方值对比与写入索引',
  legend: [
    { label: '左指针 left', color: '#2563eb' },
    { label: '右指针 right', color: '#0d9488' },
    { label: '写入位置 writeIdx', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-array',
      label: '有序数组',
      type: 'text',
      defaultValue: '-4, -1, 0, 3, 10',
      width: '150px',
      placeholder: '-4, -1, 0, 3, 10',
    },
  ],
  presets: [
    { label: '示例 1 (含负数)', values: { 'input-array': '-4, -1, 0, 3, 10' } },
    { label: '示例 2 (全负数)', values: { 'input-array': '-7, -3, 2, 3, 11' } },
    { label: '全正数', values: { 'input-array': '1, 2, 3, 4, 5' } },
  ],
  metrics: [
    { id: 'left-sq', label: '左侧 nums[left]²', color: '#2563eb' },
    { id: 'right-sq', label: '右侧 nums[right]²', color: '#0d9488' },
    { id: 'pointers', label: '双指针位置 [L, R]', color: '#8b5cf6' },
    { id: 'write-idx', label: '当前写入目标', color: '#f59e0b' },
  ],
  auxiliaryVisual: {
    title: '🧭 对撞指针与平方比较监视器',
    desc: '左右指针位置、当前平方值对比与写入索引',
    render: (container, step) => {
      renderSortedSquaresAuxiliary(container, step);
    },
  },
  codeLanguages: SQUARES_OF_SORTED_ARRAY_CODE_LANGUAGES,
  problemHtml: SQUARES_OF_SORTED_ARRAY_PROBLEM_HTML,
  analysisHtml: SQUARES_OF_SORTED_ARRAY_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-array'] || '-4, -1, 0, 3, 10';
    const arr = parseSortedArray(raw);
    return buildSortedSquaresSteps(arr);
  },
  renderCanvas: (container, step) => {
    renderSortedSquaresCanvas(container, step);
  },
});

registerAlgorithm({
  id: 'sorted-squares',
  name: '有序数组的平方',
  viewId: 'algo-sorted-squares-view',
  category: 'array',
  description: '首尾双指针向中间对撞：两端平方最大，每次选取较大者倒序写入新数组末尾',
  icon: '📐',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '掌握首尾对撞双指针在非递减含负数数组平方排序中的线性 O(n) 解法',
  aliases: ['squares-of-sorted-array'],
});
