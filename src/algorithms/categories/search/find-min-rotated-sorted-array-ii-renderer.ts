/**
 * Hard 27: 寻找旋转排序数组中的最小值 II (Find Minimum in Rotated Sorted Array II)
 * LeetCode 154 (Hard / 包含重复元素的二分查找压轴题)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type MinRotatedStep,
  MIN_ROTATED_CODES,
  MIN_ROTATED_CODE_LINES,
  buildMinRotatedSteps,
} from './find-min-rotated-sorted-array-ii-step-compiler';
import { renderMinRotatedCanvas } from './find-min-rotated-sorted-array-ii-canvas-adapter';

export {
  type MinRotatedStep,
  MIN_ROTATED_CODES,
  MIN_ROTATED_CODE_LINES,
  buildMinRotatedSteps,
  renderMinRotatedCanvas,
};

export const findMinRotatedSortedArrayIIVisualizer = registerDeclarativeAlgorithm<MinRotatedStep>({
  id: 'find-min-rotated-sorted-array-ii',
  aliases: ['154', 'leetcode-154'],
  hasDeductionTree: true,
  name: 'Hard 27: 寻找旋转排序数组最小值 II (LeetCode 154)',
  category: 'search',
  icon: '📉',
  difficulty: 3,
  levelOrder: 154,
  learningGoal: '深刻理解带重复元素二分查找的三分支决策模型，掌握通过 right-- 平缓降级解决单调性歧义的关键技巧',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 154 - Hard)</h3>
      <p>已知一个按升序排列的整数数组 <code>nums</code> ，预先未知在某个点上进行了旋转。数组中<strong>可能包含重复元素</strong>，找出其中的最小元素：</p>
      <ul>
        <li><strong>为什么是 Hard？</strong> 若无重复元素（LeetCode 153），通过 <code>nums[mid]</code> 与 <code>nums[right]</code> 大小比对可在严格 $O(\\log N)$ 完成。</li>
        <li><strong>重复元素破解</strong>：当 <code>nums[mid] == nums[right]</code> 时，无法直接砍半！例如 <code>[3, 3, 1, 3]</code> 与 <code>[1, 3, 3, 3]</code>，最小值可能在左也可能在右。
          <br/><strong>神来之笔</strong>：此时只需执行 <code>right--</code>！因为即使 <code>nums[right]</code> 是最小值，其值也已经由 <code>nums[mid]</code> 保留备份，因此单步收缩绝对不会丢失最优解！</li>
      </ul>
    </div>
  `,
  codeLanguages: MIN_ROTATED_CODES,
  inputs: [
    {
      id: 'case',
      label: '预设旋转数组',
      type: 'select',
      defaultValue: 'case1',
      options: [
        { label: '[2, 2, 2, 0, 1, 2] (经典重复折断)', value: 'case1' },
        { label: '[10, 1, 10, 10, 10] (两端重复)', value: 'case2' },
      ],
    },
  ],
  generateSteps: (input) => {
    const c = input?.case || 'case1';
    const nums = c === 'case2' ? [10, 1, 10, 10, 10] : [2, 2, 2, 0, 1, 2];
    return buildMinRotatedSteps(nums);
  },
  renderCanvas: (container, step) => {
    renderMinRotatedCanvas(container, step);
  },
});
