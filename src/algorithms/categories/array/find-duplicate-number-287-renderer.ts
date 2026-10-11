/**
 * Hard 25: 寻找重复数 (Find the Duplicate Number)
 * LeetCode 287 (Medium-Hard / 顶级面试数学转化题)
 * 核心原语:
 *  将数组视为单链表，下标 i 指向下一个节点 nums[i]
 *  由于鸽巢原理，必定存在多个入度指向同一个值，形成带环链表，环入口即为重复数字！
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  DuplicateNumberStep,
  FIND_DUPLICATE_CODES,
  FIND_DUPLICATE_CODE_LINES,
  buildFindDuplicateSteps,
} from './find-duplicate-number-287-step-compiler';
import { renderFindDuplicateCanvas } from './find-duplicate-number-287-canvas-adapter';

export type { DuplicateNumberStep };
export {
  FIND_DUPLICATE_CODES,
  FIND_DUPLICATE_CODE_LINES,
  buildFindDuplicateSteps,
  renderFindDuplicateCanvas,
};

export const findDuplicateNumber287Visualizer = registerDeclarativeAlgorithm<DuplicateNumberStep>({
  id: 'find-duplicate-number-287',
  name: 'Hard 25: 寻找重复数 (LeetCode 287)',
  category: 'array',
  icon: '🔍',
  difficulty: 3,
  levelOrder: 287,
  learningGoal: '掌握将静态数组转化为有向图链表的数学抽象技巧，深刻理解鸽巢原理与 Floyd 快慢指针在数组查重中的经典运用',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 287 - Medium / Hard 考核)</h3>
      <p>给定一个包含 <code>n + 1</code> 个整数的数组 <code>nums</code> ，其数字都在 <code>[1, n]</code> 范围内（包括 1 和 n），可知至少存在一个重复的整数。假设 <code>nums</code> 只有一个重复的整数，返回这个重复的数：</p>
      <ul>
        <li><strong>极其严格的约束</strong>：
          <br/>1. <strong>不能修改原数组</strong>（不能排序，不能打负号原地标记）；
          <br/>2. <strong>只能使用 $O(1)$ 的额外空间</strong>（不能用哈希表或计数数组）；
          <br/>3. 时间复杂度必须小于 $O(N^2)$。
        </li>
        <li><strong>核心解法</strong>：将数组抽象成单链表，每个下标 <code>i</code> 指向 <code>nums[i]</code>。根据鸽巢原理，存在两个以上下标指向同一个重复数字，这就构成了“入度 $\ge 2$”的入环节点。直接应用 <strong>Floyd 快慢指针判圈算法</strong>！</li>
      </ul>
    </div>
  `,
  codeLanguages: FIND_DUPLICATE_CODES,
  inputs: [
    {
      id: 'case',
      label: '预设数组用例',
      type: 'select',
      defaultValue: 'case1',
      options: [
        { label: '[1, 3, 4, 2, 2] (重复数字 2)', value: 'case1' },
        { label: '[3, 1, 3, 4, 2] (重复数字 3)', value: 'case2' },
      ],
    },
  ],
  generateSteps: (input) => {
    const c = input?.case || 'case1';
    const nums = c === 'case2' ? [3, 1, 3, 4, 2] : [1, 3, 4, 2, 2];
    return buildFindDuplicateSteps(nums);
  },
  renderCanvas: (container, step) => {
    renderFindDuplicateCanvas(container, step);
  },
});
