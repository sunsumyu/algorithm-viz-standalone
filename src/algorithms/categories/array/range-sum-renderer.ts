/**
 * 区间和（前缀和）可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * KamaCoder 58：一维前缀和预处理与 O(1) 差分查询
 * 遵循 Zero-Subbox 规范，扁平双轨沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  RANGE_SUM_PROBLEM_HTML,
  RANGE_SUM_ANALYSIS_HTML,
  RANGE_SUM_CODE_LANGUAGES,
} from './range-sum-problem-content';
import {
  RSumStep,
  parseRangeArray,
  parseQueries,
  buildRangeSumSteps,
} from './range-sum-step-compiler';
import { renderRangeSumCanvas } from './range-sum-canvas-adapter';

export type { RSumStep };
export { parseRangeArray, parseQueries, buildRangeSumSteps, renderRangeSumCanvas };

const { template, Visualizer } = createDeclarativeVisualizer<RSumStep>({
  id: 'range-sum',
  name: '区间和（前缀和）',
  category: 'array',
  icon: '➕',
  badge: {
    mode: '一维前缀和·O(1)查询',
    complexity: 'O(n+m) · O(n)',
  },
  card1Title: '📊 原始数组与前缀和双轨沙盘',
  card2Title: '🧭 前缀和公式与区间差分监视器',
  card2Desc: '当前查询区间 [L..R]、prefix[R+1] - prefix[L] 与结果列表',
  legend: [
    { label: '查询区间覆盖', color: '#2563eb' },
    { label: '前缀和数组', color: '#0d9488' },
  ],
  inputs: [
    {
      id: 'input-array',
      label: '原始数组',
      type: 'text',
      defaultValue: '1, 2, 3, 4, 5',
      width: '130px',
      placeholder: '1, 2, 3, 4, 5',
    },
    {
      id: 'input-queries',
      label: '查询区间',
      type: 'text',
      defaultValue: '0, 2 | 1, 3 | 2, 4',
      width: '140px',
      placeholder: '0, 2 | 1, 3',
    },
  ],
  presets: [
    { label: '标准示例', values: { 'input-array': '1, 2, 3, 4, 5', 'input-queries': '0, 2 | 1, 3 | 2, 4' } },
    { label: '全区间查询', values: { 'input-array': '10, 20, 30, 40', 'input-queries': '0, 3 | 1, 2' } },
    { label: '单点查询', values: { 'input-array': '5, 8, 12, 15', 'input-queries': '0, 0 | 2, 2 | 3, 3' } },
  ],
  metrics: [
    { id: 'query-range', label: '当前查询区间 [L, R]', color: '#2563eb' },
    { id: 'diff-formula', label: '差分公式计算', color: '#f59e0b' },
    { id: 'query-result', label: '当前区间和', color: '#16a34a' },
  ],
  codeLanguages: RANGE_SUM_CODE_LANGUAGES,
  problemHtml: RANGE_SUM_PROBLEM_HTML,
  analysisHtml: RANGE_SUM_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const rawArr = inputs['input-array'] || '1, 2, 3, 4, 5';
    const rawQ = inputs['input-queries'] || '0, 2 | 1, 3 | 2, 4';
    const arr = parseRangeArray(rawArr);
    const queries = parseQueries(rawQ);
    return buildRangeSumSteps(arr, queries);
  },
  renderCanvas: (container, step) => {
    renderRangeSumCanvas(container, step);
  },
});

registerAlgorithm({
  id: 'range-sum',
  name: '区间和（前缀和）',
  viewId: 'algo-range-sum-view',
  category: 'array',
  description: '一维前缀和预处理 O(n)，之后任意区间 [L, R] 求和只需 O(1) 差分计算 prefix[R+1] - prefix[L]',
  icon: '➕',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 6,
  learningGoal: '掌握前缀和数组空间换时间核心设计，实现海量静态区间和快速 O(1) 查询',
});
