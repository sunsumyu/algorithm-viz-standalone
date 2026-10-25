/**
 * 二分查找可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * 左闭右闭区间折半、中点动态定位、边界收缩与目标命中
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  BINARY_SEARCH_PROBLEM_HTML,
  BINARY_SEARCH_ANALYSIS_HTML,
  BINARY_SEARCH_CODE_LANGUAGES,
} from './binary-search-problem-content';
import {
  type BSStep,
  BINARY_SEARCH_CODE_LINES,
  parseSearchArray,
  binarySearchSteps,
} from './binary-search-step-compiler';
import { renderBinarySearchCanvas } from './binary-search-canvas-adapter';

export {
  type BSStep,
  BINARY_SEARCH_CODE_LINES,
  parseSearchArray,
  binarySearchSteps,
  renderBinarySearchCanvas,
};

const { template, Visualizer } = createDeclarativeVisualizer<BSStep>({
  id: 'binary-search',
  name: '二分查找',
  category: 'search',
  icon: '🎯',
  badge: {
    mode: '左闭右闭区间折半',
    complexity: 'O(log n) · O(1)',
  },
  card1Title: '📊 有序数组条带与折半区间沙盘',
  card2Title: '🧭 中点比对与收缩决策监视器',
  card2Desc: '当前区间 [left..right]、中点 mid 与比对比较结论',
  legend: [
    { label: '命中目标', color: '#16a34a' },
    { label: '中点 mid', color: '#fbbf24' },
    { label: '有效搜索区间', color: '#3b82f6' },
  ],
  inputs: [
    {
      id: 'input-array',
      label: '有序数组',
      type: 'text',
      defaultValue: '-1, 0, 3, 5, 9, 12',
      width: '150px',
      placeholder: '-1, 0, 3, 5, 9, 12',
    },
    {
      id: 'input-target',
      label: '目标值 target',
      type: 'number',
      defaultValue: 9,
      width: '45px',
    },
  ],
  presets: [
    { label: '命中示例 (target=9)', values: { 'input-array': '-1, 0, 3, 5, 9, 12', 'input-target': 9 } },
    { label: '不存在值 (target=2)', values: { 'input-array': '-1, 0, 3, 5, 9, 12', 'input-target': 2 } },
    { label: '首尾边界 (target=12)', values: { 'input-array': '-1, 0, 3, 5, 9, 12', 'input-target': 12 } },
  ],
  metrics: [
    { id: 'mid-val', label: '中点 nums[mid]', color: '#f59e0b' },
    { id: 'compare-count', label: '比较次数', color: '#2563eb' },
    { id: 'search-result', label: '查找结论', color: '#16a34a' },
  ],
  codeLanguages: BINARY_SEARCH_CODE_LANGUAGES,
  problemHtml: BINARY_SEARCH_PROBLEM_HTML,
  analysisHtml: BINARY_SEARCH_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-array'] || '-1, 0, 3, 5, 9, 12';
    const arr = parseSearchArray(raw);
    const target = parseInt(inputs['input-target'] || '9', 10);
    return binarySearchSteps(arr, target);
  },
  renderCanvas: (container, step) => {
    renderBinarySearchCanvas(container, step);
  },
});

registerAlgorithm({
  id: 'binary-search',
  aliases: ['704', 'leetcode-704', 'binary-search-closed-interval'],
  hasDeductionTree: true,
  name: '二分查找',
  viewId: 'algo-binary-search-view',
  category: 'search',
  description: '经典折半查找：每次与中点比较，对半剔除不可能区间，对数级 O(log n) 时间复杂度',
  icon: '🎯',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握左闭右闭区间折半查找的不变量设计与防溢出中点计算公式',
});
