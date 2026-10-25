/**
 * 柱状图中最大的矩形可视化器（单调栈）— 声明式 4-Card 标准架构
 * LeetCode 84：首尾加哨兵 0，单调递增栈寻找左右两侧首个更矮柱子，以 mid 为高展开矩形
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  LARGEST_RECTANGLE_HISTOGRAM_PROBLEM_HTML,
  LARGEST_RECTANGLE_HISTOGRAM_ANALYSIS_HTML,
  LARGEST_RECTANGLE_HISTOGRAM_CODE_LANGUAGES,
} from './largest-rectangle-histogram-problem-content';
import {
  buildLargestRectangleHistogramSteps,
  withMetrics,
  type LRHStep,
} from './largest-rectangle-histogram-step-compiler';
import { renderLargestRectangleHistogramCanvas } from './largest-rectangle-histogram-canvas-adapter';

export {
  buildLargestRectangleHistogramSteps,
  withMetrics,
  renderLargestRectangleHistogramCanvas,
  type LRHStep,
};

const { Visualizer } = registerDeclarativeAlgorithm({
  id: 'largest-rectangle-histogram',
  name: '柱状图中最大的矩形',
  category: 'monotonic-stack',
  description: '首尾插入哨兵 0，单调递增栈寻找每根柱子左右首个更矮边界，计算最大矩形面积',
  icon: '📊',
  difficulty: 3,
  levelOrder: 5,
  learningGoal: '掌握单调递增栈在直方图最大矩形中的双向边界扩展技巧，深刻理解首尾哨兵 0 消除边界特判的精妙设计',
  aliases: ['largest-rectangle-histogram-052', 'class052-code05', 'leetcode-84', '84', 'largest-rectangle'],
  hasDeductionTree: true,
  inputs: [
    {
      id: 'heights',
      label: '柱子高度数组',
      type: 'text',
      defaultValue: '2,1,5,6,2,3',
      placeholder: '2,1,5,6,2,3',
    },
  ],
  presets: [
    { label: '示例 1 (面积 10)', values: { heights: '2,1,5,6,2,3' } },
    { label: '示例 2 (面积 4)', values: { heights: '2,4' } },
    { label: '多峰波谷 (面积 16)', values: { heights: '6,7,5,2,4,5,9,3' } },
  ],
  metrics: [
    { id: 'rect-3', label: '左矮界 & 基准柱 & 右矮界', color: '#ef4444' },
    { id: 'area', label: '本次计算矩形面积', color: '#059669' },
    { id: 'max-area', label: '全局最大矩形面积', color: '#ef4444' },
    { id: 'action', label: '计算状态', color: '#2563eb' },
  ],
  legend: [
    { label: '🟥 当前计算矩形', color: '#ef4444' },
    { label: '🥞 单调栈内递增柱', color: '#fbbf24' },
    { label: '⚪ 首尾哨兵 0', color: '#cbd5e1' },
  ],
  codeLanguages: LARGEST_RECTANGLE_HISTOGRAM_CODE_LANGUAGES,
  problemHtml: LARGEST_RECTANGLE_HISTOGRAM_PROBLEM_HTML,
  analysisHtml: LARGEST_RECTANGLE_HISTOGRAM_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const rawHeights = parseNumberList(inputs.heights, '2,1,5,6,2,3');
    return withMetrics(
      buildLargestRectangleHistogramSteps(rawHeights.length ? rawHeights : [2, 1, 5, 6, 2, 3])
    );
  },
  renderCanvas: (container, step) =>
    renderLargestRectangleHistogramCanvas(container, step as LRHStep),
});

export { Visualizer as LargestRectangleHistogramVisualizer };
