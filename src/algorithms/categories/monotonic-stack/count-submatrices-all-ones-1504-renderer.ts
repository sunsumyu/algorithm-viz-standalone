/**
 * Hard 26: 统计全 1 子矩形 (Count Submatrices With All Ones)
 * LeetCode 1504 (Medium-Hard / 单调栈在矩阵计数组合中的巅峰应用)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  COUNT_SUBMATRICES_CODES,
  buildCountSubmatricesSteps,
  type SubmatrixStep,
} from './count-submatrices-all-ones-1504-step-compiler';
import { renderCountSubmatricesCanvas } from './count-submatrices-all-ones-1504-canvas-adapter';

export {
  COUNT_SUBMATRICES_CODES,
  buildCountSubmatricesSteps,
  renderCountSubmatricesCanvas,
  type SubmatrixStep,
};

export const countSubmatricesAllOnes1504Visualizer = registerDeclarativeAlgorithm<SubmatrixStep>({
  id: 'count-submatrices-all-ones-1504',
  name: 'Hard 26: 统计全 1 子矩形 (LeetCode 1504)',
  aliases: [
    'count-submatrices-all-ones-053',
    'class053-code01',
    '1504',
    'leetcode-1504',
    'count-submatrices-all-ones',
  ],
  category: 'monotonic-stack',
  icon: '🧱',
  difficulty: 3,
  levelOrder: 1504,
  hasDeductionTree: true,
  learningGoal: '掌握二维矩阵压缩高度后运用单调递增栈快速统计子矩形数量的组合数学公式与 O(M * N) 算法实现',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 1504 - Medium / Hard 考核)</h3>
      <p>给你一个 <code>m x n</code> 的二进制矩阵 <code>mat</code> ，返回有多少个 <strong>子矩形</strong> 的元素全部都是 1：</p>
      <ul>
        <li><strong>为什么是单调栈经典压轴题？</strong>
          <br/>求最大矩形面积（LeetCode 84/85）只需要在出栈时求极值 $\max(h \times w)$；
          <br/>而统计所有子矩形总数，需要将每一段由 $h[cur]$ 控制的高度阶梯所能贡献的矩形全部累加！
        </li>
        <li><strong>精妙组合公式</strong>：
          <br/>设出栈柱子高度为 $h[cur]$，其左右两侧最高阻挡柱高度为 $down = \max(h[left], h[right])$；
          <br/>宽度跨度为 $k = right - left - 1$。
          <br/>则该阶梯独立贡献的矩形数为：<strong>$(h[cur] - down) \times \frac{k(k + 1)}{2}$</strong>！</li>
      </ul>
    </div>
  `,
  codeLanguages: COUNT_SUBMATRICES_CODES,
  inputs: [],
  generateSteps: () => {
    return buildCountSubmatricesSteps();
  },
  renderCanvas: (container, step) => {
    renderCountSubmatricesCanvas(container, step);
  },
});
