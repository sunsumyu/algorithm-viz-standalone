/**
 * 大厂高频真题 04: 滑动窗口中位数 (Sliding Window Median)
 * LeetCode 480 / 大厂高频压轴题
 * 对顶堆 (大根堆 + 小根堆) + 延迟删除机制
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  MedianStep,
  SLIDING_WINDOW_MEDIAN_CODES,
  generateMedianSteps,
} from '../../../../core/renderers/adapters/sliding-window-median-step-compiler';
import { renderMedianSandbox } from '../../../../core/renderers/adapters/sliding-window-median-canvas-adapter';

export type { MedianStep };
export { SLIDING_WINDOW_MEDIAN_CODES, generateMedianSteps, renderMedianSandbox };

export const slidingWindowMedianVisualizer = registerDeclarativeAlgorithm<MedianStep>({
  id: 'sliding-window-median',
  name: '大厂高频真题: 滑动窗口中位数 (Sliding Window Median)',
  category: 'array',
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 480,
  learningGoal: '掌握对顶堆动态天平与延迟删除机制，在 O(log k) 效率下维护滑动窗口中位数',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 480)</h3>
      <p>中位数是有序序列最中间的那个数。给你一个整数数组 <code>nums</code> 和一个大小为 <code>k</code> 的滑动窗口，请给出每次窗口向右滑动时包含的 <code>k</code> 个数的中位数数组。</p>
    </div>
  `,
  metrics: [
    { id: 'median', label: '当前中位数', color: '#16a34a' },
    { id: 'windowRange', label: '滑窗区间', color: '#0284c7' },
    { id: 'inOut', label: '进 / 出元素', color: '#ef4444' },
    { id: 'balance', label: '天平状态', color: '#d97706' },
  ],
  codeLanguages: SLIDING_WINDOW_MEDIAN_CODES,
  inputs: [
    {
      id: 'k',
      label: '滑动窗口大小 (K)',
      type: 'number',
      defaultValue: 3,
    },
  ],
  generateSteps: (input) => {
    const nums = [1, 3, -1, -3, 5, 3, 6, 7];
    const k = Math.max(1, Math.min(Number(input.k) || 3, nums.length));
    return generateMedianSteps(nums, k);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = renderMedianSandbox(step);
  },
});
