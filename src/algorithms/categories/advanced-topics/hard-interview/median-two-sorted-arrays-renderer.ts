/**
 * Hard 20: 寻找两个正序数组的中位数 (Median of Two Sorted Arrays)
 * LeetCode 4 (Hard) / 大厂压轴终极二分题
 * 核心原语：短数组二分虚拟切分，交叉不等式检验 (L1 <= R2 && L2 <= R1)，O(log(min(M, N))) 极速定位
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  MedianStep,
  MEDIAN_CODES,
  MEDIAN_TWO_SORTED_CODE_LINES,
  generateMedianSteps,
} from '../../../../core/renderers/adapters/median-two-sorted-arrays-step-compiler';
import { renderMedianCanvas } from '../../../../core/renderers/adapters/median-two-sorted-arrays-canvas-adapter';

export type { MedianStep };
export { MEDIAN_CODES, MEDIAN_TWO_SORTED_CODE_LINES, generateMedianSteps, renderMedianCanvas };

export const medianTwoSortedArraysVisualizer = registerDeclarativeAlgorithm<MedianStep>({
  id: 'median-two-sorted-arrays',
  name: 'Hard 20: 寻找两个正序数组的中位数 (Median of Two Sorted Arrays)',
  category: 'search',
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 20,
  learningGoal: '掌握双数组虚拟二分切分与交叉不等式收敛原理，体会 O(log(min(M, N))) 极速分治模型',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 4 - Hard)</h3>
      <p>给定两个大小分别为 $m$ 和 $n$ 的正序（从小到大）数组 <code>nums1</code> 和 <code>nums2</code>。请你找出并返回这两个正序数组的<strong>中位数</strong>。</p>
      <p>算法的总时间复杂度应该为 $O(\log(m + n))$。</p>
      <ul>
        <li><strong>最优切分解</strong>：在较短的数组上做二分查找，根据左右元素交叉不等式 $L1 \le R2$ 与 $L2 \le R1$ 调整切分边界。</li>
        <li><strong>复杂度</strong>：时间复杂度仅为 $O(\log(\min(m, n)))$，空间复杂度 $O(1)$。</li>
      </ul>
    </div>
  `,
  codeLanguages: MEDIAN_CODES,
  metrics: [
    { id: 'median', label: '中位数计算结果', color: '#10b981' },
    { id: 'cuts', label: '切分位置 (Cut1 & Cut2)', color: '#38bdf8' },
    { id: 'searchRange', label: '二分区间 [low, high]', color: '#fbbf24' },
    { id: 'crossCheck', label: '交叉不等式状态', color: '#ec4899' },
  ],
  inputs: [
    {
      id: 'scenario',
      label: '预设数组用例',
      type: 'select',
      defaultValue: 'odd_total',
      options: [
        { label: '奇数总长用例: [1, 3, 8, 9, 15] 与 [7, 11, 18, 19, 21, 25]', value: 'odd_total' },
        { label: '偶数总长用例: [1, 2] 与 [3, 4]', value: 'even_total' },
      ],
    },
  ],
  generateSteps: (input) => {
    const sc = input.scenario || 'odd_total';
    let a: number[], b: number[];
    if (sc === 'even_total') {
      a = [1, 2];
      b = [3, 4];
    } else {
      a = [1, 3, 8, 9, 15];
      b = [7, 11, 18, 19, 21, 25];
    }
    return generateMedianSteps(a, b);
  },
  renderCanvas: (container, step) => {
    renderMedianCanvas(container, step);
  },
});
