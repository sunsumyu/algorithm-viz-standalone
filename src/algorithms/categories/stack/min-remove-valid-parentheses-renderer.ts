/**
 * Hard 28: 移除无效的括号 (Minimum Remove to Make Valid Parentheses)
 * LeetCode 1249 (Medium-Hard / 经典栈与字符串高频题)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type ParenthesesStep,
  MIN_REMOVE_PARENTHESES_CODES,
  buildMinRemoveSteps,
} from './min-remove-valid-parentheses-step-compiler';
import { renderMinRemoveCanvas } from './min-remove-valid-parentheses-canvas-adapter';

export { type ParenthesesStep, MIN_REMOVE_PARENTHESES_CODES, buildMinRemoveSteps, renderMinRemoveCanvas };

export const minRemoveValidParenthesesVisualizer = registerDeclarativeAlgorithm<ParenthesesStep>({
  id: 'min-remove-valid-parentheses',
  aliases: ['min-remove-parentheses', 'min-remove-valid-parentheses-1249', 'leetcode-1249', '1249'],
  name: 'Hard 28: 移除无效的括号 (LeetCode 1249)',
  category: 'stack',
  hasDeductionTree: true,
  icon: '🧹',
  difficulty: 3,
  levelOrder: 1249,
  learningGoal: '掌握利用索引栈标记未匹配括号的线性重构技巧，理解布尔数组在字符串原地/单趟过滤中的核心应用',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 1249 - Medium-Hard)</h3>
      <p>给你一个由 <code>'('</code>、<code>')'</code> 和小写字母组成的字符串 <code>s</code>。你需要从字符串中删除最少数目的 <code>'('</code> 或 <code>')'</code> （可以删除任意位置的括号），使得剩下的括号字符串有效：</p>
      <ul>
        <li><strong>核心解题套路</strong>：
          <br/>1. 用栈存储左括号的下标。当遇到右括号时，如果栈非空则弹出一个匹配；如果栈为空，说明该右括号必定是多余的，在 <code>invalid</code> 标记数组中打标；
          <br/>2. 遍历结束后，栈中残余的所有下标对应的左括号也是多余的，全部在 <code>invalid</code> 中打标；
          <br/>3. 第二趟线性扫描跳过所有 <code>invalid[i] == true</code> 的字符，即可拼装出最长有效括号字符串！</li>
      </ul>
    </div>
  `,
  codeLanguages: MIN_REMOVE_PARENTHESES_CODES,
  inputs: [
    {
      id: 'case',
      label: '预设字符串',
      type: 'select',
      defaultValue: 'case1',
      options: [
        { label: 'lee(t(c)o)de) (多余末尾右括号)', value: 'case1' },
        { label: 'a)b(c)d (多余开头右括号)', value: 'case2' },
        { label: '))(( (全无效反向括号)', value: 'case3' },
      ],
    },
  ],
  generateSteps: (input) => {
    const c = input?.case || 'case1';
    const s = c === 'case2' ? 'a)b(c)d' : c === 'case3' ? '))((' : 'lee(t(c)o)de)';
    return buildMinRemoveSteps(s);
  },
  renderCanvas: (container, step) => {
    renderMinRemoveCanvas(container, step);
  },
});
