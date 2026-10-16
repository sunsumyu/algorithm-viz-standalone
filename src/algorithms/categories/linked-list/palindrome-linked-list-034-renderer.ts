/**
 * Class 034: 判断链表是否为回文结构 (Palindrome Linked List)
 * 左程云算法通关课【必备篇】Class 034 / LeetCode 234
 * 极致 O(1) 空间四步法：
 * 1. 快慢指针寻中点 (Slow & Fast Pointer)
 * 2. 原地反转后半部分链表 (In-place Reverse Second Half)
 * 3. 双向向中同步比对 (Two-pointer Compare)
 * 4. 恢复链表原始拓扑结构并返回判定结果 (Restore & Return)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  PalindromeNode,
  PalindromeStep,
  PALINDROME_CODES,
  PALINDROME_CODE_LINES,
  generatePalindromeSteps,
} from './palindrome-linked-list-034-step-compiler';
import { renderPalindromeCanvas } from './palindrome-linked-list-034-canvas-adapter';

export type { PalindromeNode, PalindromeStep };
export {
  PALINDROME_CODES,
  PALINDROME_CODE_LINES,
  generatePalindromeSteps,
  renderPalindromeCanvas,
};

export const palindromeLinkedListVisualizer = registerDeclarativeAlgorithm<PalindromeStep>({
  id: 'palindrome-linked-list-034',
  aliases: ['class034-code02', 'palindrome-linked-list', 'palindrome-list', 'leetcode-234'],
  name: 'Class 034: 判断链表是否为回文结构 (Palindrome Linked List)',
  category: 'linked-list',
  icon: '🪞',
  difficulty: 2,
  levelOrder: 234,
  learningGoal: '掌握快慢指针找中点、局部链表原地反转与 O(1) 空间无副作用复原链表的面试母题',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 034 / LeetCode 234)</h3>
      <p>给你一个单链表的头节点 <code>head</code>，请你判断该链表是否为<strong>回文链表</strong>。如果是，返回 <code>true</code>；否则，返回 <code>false</code>。</p>
      <h4>进阶要求：</h4>
      <p>你能否用 <strong>O(N) 时间复杂度</strong> 与 <strong>O(1) 额外空间复杂度</strong> 解决此题？</p>
      <h4>经典解法步骤：</h4>
      <ol>
        <li>快慢指针寻找上中点 / 中点；</li>
        <li>原地反转后半部分链表；</li>
        <li>左右两端同时向中间遍历并比对；</li>
        <li><strong>无损复原</strong>：再次反转后半部分恢复原始链表，返回判定结果。</li>
      </ol>
    </div>
  `,
  codeLanguages: PALINDROME_CODES,
  inputs: [
    {
      id: 'values',
      label: '链表节点值序列 (逗号分隔)',
      type: 'select',
      defaultValue: '1,2,3,2,1',
      options: [
        { label: '奇数长度回文: 1, 2, 3, 2, 1', value: '1,2,3,2,1' },
        { label: '偶数长度回文: 1, 2, 2, 1', value: '1,2,2,1' },
        { label: '非回文用例: 1, 2, 3, 4, 5', value: '1,2,3,4,5' },
        { label: '非回文偶数: 1, 2, 3, 1', value: '1,2,3,1' },
      ],
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.values || '1,2,3,2,1');
    const nums = raw.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    return generatePalindromeSteps(nums.length > 0 ? nums : [1, 2, 3, 2, 1]);
  },
  renderCanvas: (container, step) => {
    renderPalindromeCanvas(container, step);
  },
});
