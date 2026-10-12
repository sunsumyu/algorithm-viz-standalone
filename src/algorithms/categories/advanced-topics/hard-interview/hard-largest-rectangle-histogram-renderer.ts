/**
 * Hard 17: 柱状图中最大的矩形 (Largest Rectangle in Histogram)
 * LeetCode 84 (Hard) / 单调递增栈最经典母题
 * 核心原语：首尾哨兵优化单调栈，出栈即确定左右首个更小边界，一次遍历 O(N) 破解
 * 架构规范：轻量领域适配器 (Thin Domain Adapter, LOC < 70) 委托核心深模块
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  type HistogramStep,
  HISTOGRAM_CODES,
  generateHistogramSteps,
} from '../../../../core/renderers/adapters/hard-histogram-step-compiler';
import { renderHistogramCanvas } from '../../../../core/renderers/adapters/hard-histogram-canvas-adapter';

export type { HistogramStep };
export { HISTOGRAM_CODES, generateHistogramSteps, renderHistogramCanvas };

export const hardLargestRectangleHistogramVisualizer = registerDeclarativeAlgorithm<HistogramStep>({
  id: 'hard-largest-rectangle-histogram',
  name: 'Hard 17: 柱状图中最大的矩形 (Largest Rectangle in Histogram)',
  category: 'monotonic-stack',
  icon: '📊',
  difficulty: 3,
  levelOrder: 17,
  learningGoal: '彻底掌握单调递增栈的母题模型与首尾哨兵技巧，体会左右边界 O(1) 同时确定的精妙逻辑',
  metrics: [
    { id: 'scanIdx', label: '当前扫描柱', color: '#38bdf8' },
    { id: 'popped', label: '出栈结算柱', color: '#ef4444' },
    { id: 'curRect', label: '结算矩形 (高×宽)', color: '#f59e0b' },
    { id: 'maxArea', label: '最大矩形面积', color: '#10b981' },
  ],
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 84 - Hard)</h3>
      <p>给定 $n$ 个非负整数，用来表示柱状图中各个柱子的高度。每个柱子彼此相邻，且宽度为 1。</p>
      <p>求在该柱状图中，能够勾勒出来的<strong>最大矩形面积</strong>。</p>
      <ul>
        <li><strong>暴力解法</strong>：枚举所有柱子作为高度向左右寻找首个小于它的边界，时间复杂度 $O(N^2)$。</li>
        <li><strong>单调栈最优解</strong>：维护单调递增栈，首尾添加高度为 0 的哨兵，每个柱子仅进栈出栈各一次，时间复杂度降至 $O(N)$。</li>
      </ul>
    </div>
  `,
  codeLanguages: HISTOGRAM_CODES,
  inputs: [
    {
      id: 'heights',
      label: '柱子高度数组 (逗号分隔)',
      type: 'text',
      defaultValue: '2, 1, 5, 6, 2, 3',
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.heights || '2, 1, 5, 6, 2, 3');
    const nums = raw.split(',').map(s => parseInt(s.trim(), 10)).filter(v => !isNaN(v));
    return generateHistogramSteps(nums.length > 0 ? nums : [2, 1, 5, 6, 2, 3]);
  },
  renderCanvas: (container, step) => {
    renderHistogramCanvas(container, step);
  },
});
