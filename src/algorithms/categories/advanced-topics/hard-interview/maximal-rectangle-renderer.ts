/**
 * 大厂高频真题 07: 柱状图与矩阵最大矩形 (Maximal Rectangle & Histogram)
 * LeetCode 84 & 85 / 单调栈压轴神题
 * 矩阵压缩为直方图 + 单调栈 O(N*M) 求解最大矩形面积
 * 架构规范：轻量领域适配器 (Thin Domain Adapter, LOC < 70) 委托核心深模块
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  type MaximalRectStep,
  MAXIMAL_RECTANGLE_CODES,
  generateMaximalRectangleSteps,
} from '../../../../core/renderers/adapters/maximal-rectangle-step-compiler';
import { renderMaximalRectangleSandbox } from '../../../../core/renderers/adapters/maximal-rectangle-canvas-adapter';

export type { MaximalRectStep };
export { MAXIMAL_RECTANGLE_CODES, generateMaximalRectangleSteps, renderMaximalRectangleSandbox };

export const maximalRectangleVisualizer = registerDeclarativeAlgorithm<MaximalRectStep>({
  id: 'maximal-rectangle',
  name: '大厂高频真题: 柱状图与矩阵最大矩形 (Maximal Rectangle)',
  category: 'monotonic-stack',
  icon: '📊',
  difficulty: 3,
  levelOrder: 85,
  learningGoal: '掌握二维矩阵压缩为一维直方图高度，配合单调递增栈在 O(M*N) 极速求出最大全 1 矩形',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 84 & 85)</h3>
      <p>给定一个仅包含 <code>0</code> 和 <code>1</code> 的二维二进制矩阵，找出只包含 <code>1</code> 的最大矩形，并返回其面积。</p>
      <p><strong>降维打法：</strong>以每一行为地基，向上统计连续 <code>1</code> 的高度生成一维直方图，对每行直方图运用单调递增栈在 $O(N)$ 时间求出当前最大矩形，整体复杂度 $O(M \times N)$！</p>
    </div>
  `,
  codeLanguages: MAXIMAL_RECTANGLE_CODES,
  metrics: [
    { id: 'stackDepth', label: '单调栈深', color: '#6366f1' },
    { id: 'rectHeight', label: '结算柱高度', color: '#f59e0b' },
    { id: 'rectArea', label: '当前扩展面积', color: '#38bdf8' },
    { id: 'maxArea', label: '最大全 1 面积', color: '#10b981' },
  ],
  inputs: [],
  generateSteps: () => {
    return generateMaximalRectangleSteps();
  },
  renderCanvas: (container, step) => {
    container.innerHTML = renderMaximalRectangleSandbox(step);
  },
});
