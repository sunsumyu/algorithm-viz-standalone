/**
 * 大厂高频真题 08: 最小覆盖子串 (Minimum Window Substring)
 * LeetCode 76 / 滑动窗口最高频经典压轴题
 * 左神经典【欠账表模型】+ 双指针滑窗
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  MinWindowStep,
  MIN_WINDOW_CODES,
  MIN_WINDOW_CODE_LINES,
  generateMinWindowSteps,
} from '../../../../core/renderers/adapters/min-window-substring-step-compiler';
import { renderMinWindowSandbox } from '../../../../core/renderers/adapters/min-window-substring-canvas-adapter';

export type { MinWindowStep };
export { MIN_WINDOW_CODES, MIN_WINDOW_CODE_LINES, generateMinWindowSteps, renderMinWindowSandbox };

export const minWindowSubstringVisualizer = registerDeclarativeAlgorithm<MinWindowStep>({
  id: 'min-window-substring',
  name: '大厂高频真题: 最小覆盖子串 (Minimum Window Substring)',
  category: 'string',
  icon: '🪟',
  difficulty: 3,
  levelOrder: 76,
  learningGoal: '深刻掌握滑动窗口欠账表模型，在 O(N) 线性时间内求解最小覆盖子串经典难题',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 76)</h3>
      <p>给你一个字符串 <code>s</code> 、一个字符串 <code>t</code> 。返回 <code>s</code> 中涵盖 <code>t</code> 所有字符的最小子串。如果不存在符合条件的子串，返回空字符串 <code>""</code>。</p>
      <p><strong>左神欠账表精髓：</strong>将 $t$ 的字符频次视为债务，右指针吸收字符还款，当全网欠账还清时，左指针向前催收挤压富余字符，达到常数空间 $O(N)$ 极速解法！</p>
    </div>
  `,
  metrics: [
    { id: 'windowLen', label: '窗口长度', color: '#0284c7' },
    { id: 'allDebt', label: '剩余欠账', color: '#ef4444' },
    { id: 'bestLen', label: '最短长度', color: '#16a34a' },
    { id: 'bestSubstr', label: '最优子串', color: '#d97706' },
  ],
  codeLanguages: MIN_WINDOW_CODES,
  inputs: [
    {
      id: 's',
      label: '源字符串 (s)',
      type: 'text',
      defaultValue: 'ADOBECODEBANC',
    },
    {
      id: 't',
      label: '目标串 (t)',
      type: 'text',
      defaultValue: 'ABC',
    },
  ],
  generateSteps: (input) => {
    const s = String(input.s || 'ADOBECODEBANC');
    const t = String(input.t || 'ABC');
    return generateMinWindowSteps(s, t);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = renderMinWindowSandbox(step);
  },
});
