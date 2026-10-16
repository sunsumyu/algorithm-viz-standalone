/**
 * Class 052 Code05: 柱状图中最大的矩形 (Largest Rectangle in Histogram / LeetCode 84)
 * 已与通用单调栈版深度融为单一事实来源 (src/algorithms/categories/monotonic-stack/largest-rectangle-histogram-renderer.ts)
 * 遵循《双版本长处综合整合》规范，通过 aliases: ['largest-rectangle-histogram-052', 'class052-code05', 'leetcode-84'] 统合分发
 */

import { LargestRectangleHistogramVisualizer } from '../largest-rectangle-histogram-renderer';
import {
  buildLargestRectangle052Steps,
  type LargestRectangle052Step,
} from './largest-rectangle-histogram-052-step-compiler';
import { renderHistogramVisualizer } from './stack-052-shared';

export {
  buildLargestRectangle052Steps,
  type LargestRectangle052Step,
  renderHistogramVisualizer as renderLargestRectangle052Canvas,
};

export const largestRectangleHistogram052Visualizer = LargestRectangleHistogramVisualizer;
