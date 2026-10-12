/**
 * Hard 10: 最长有效括号 (Longest Valid Parentheses)
 * LeetCode 32 经典高频压轴题
 * 栈底参照哨兵法与动态规划 DP 解法可视化
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  ParenthesesStep,
  LONGEST_VALID_PARENTHESES_CODES,
  LONGEST_VALID_PARENTHESES_CODE_LINES,
  generateParenthesesSteps,
} from '../../../../core/renderers/adapters/longest-valid-parentheses-step-compiler';
import { renderParenthesesCanvas } from '../../../../core/renderers/adapters/longest-valid-parentheses-canvas-adapter';

export type { ParenthesesStep };
export {
  LONGEST_VALID_PARENTHESES_CODES,
  LONGEST_VALID_PARENTHESES_CODE_LINES,
  generateParenthesesSteps,
  renderParenthesesCanvas,
};

export const longestValidParenthesesVisualizer = registerDeclarativeAlgorithm<ParenthesesStep>({
  id: 'longest-valid-parentheses',
  name: '大厂高频真题: 最长有效括号 (Longest Valid Parentheses)',
  category: 'stack',
  icon: '🧶',
  difficulty: 3,
  levelOrder: 32,
  aliases: ['class066-code06', 'longest-valid-parentheses-066', 'longest-valid-parentheses-class066', 'leetcode-32'],
  learningGoal: '掌握 LeetCode 32 最长有效连续括号的栈底基准哨兵法与动态规划状态转移技巧',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 32)</h3>
      <p>给你一个只包含 <code>'('</code> 和 <code>')'</code> 的字符串，找出最长有效（格式正确且连续）括号子串的长度：</p>
      <ul>
        <li><strong>栈底哨兵思想</strong>：初始压入 <code>-1</code>，保证任何合法闭合的子串左端点都可以通过 <code>i - stack.top()</code> 正确减出距离。</li>
        <li><strong>边界重置</strong>：一旦栈空，说明当前 <code>)</code> 无法匹配任何前序 <code>(</code>，必须重置为新的断点哨兵。</li>
      </ul>
    </div>
  `,
  codeLanguages: LONGEST_VALID_PARENTHESES_CODES,
  metrics: [
    { id: 'currentChar', label: '当前字符/下标', color: '#38bdf8' },
    { id: 'stackTop', label: '栈顶基准哨兵', color: '#f59e0b' },
    { id: 'maxLen', label: '最长有效长度', color: '#10b981' },
    { id: 'validRange', label: '最长有效区间', color: '#ec4899' },
  ],
  inputs: [
    {
      id: 's',
      label: '括号字符串',
      type: 'text',
      defaultValue: ')()())',
    },
  ],
  generateSteps: (input) => {
    const s = String(input.s || ')()())');
    return generateParenthesesSteps(s);
  },
  renderCanvas: (container, step) => {
    renderParenthesesCanvas(container, step);
  },
});
