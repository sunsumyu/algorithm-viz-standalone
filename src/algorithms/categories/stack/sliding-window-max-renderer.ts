/**
 * 滑动窗口最大值可视化器 (LeetCode 239)
 * 已与单调队列标准版深度融为单一事实来源 (src/algorithms/categories/monotonic-queue/monotonic-queue-054/sliding-window-max-054-renderer.ts)
 * 遵循《双版本长处综合整合》规范，通过 aliases: ['sliding-window-max', 'class054-code01', 'leetcode-239'] 统合分发
 */

import { slidingWindowMax054Renderer } from '../monotonic-queue/monotonic-queue-054/sliding-window-max-054-renderer';
import {
  type SWMStep,
  buildSlidingWindowMaxSteps,
} from './sliding-window-max-step-compiler';
import { renderSlidingWindowMaxCanvas } from './sliding-window-max-canvas-adapter';

export type { SWMStep };
export { buildSlidingWindowMaxSteps, renderSlidingWindowMaxCanvas };

export const SlidingWindowMaxVisualizer = slidingWindowMax054Renderer;
