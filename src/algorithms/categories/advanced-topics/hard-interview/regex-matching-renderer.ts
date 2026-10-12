/**
 * Hard 06: 正则表达式匹配 (Regular Expression Matching)
 * LeetCode 10 (Hard) / 大厂面试顶级压轴高频题
 * 核心原语：二维状态矩阵 (dp[i][j]) 与通配符分支转移
 * 架构规范：轻量领域适配器 (Thin Domain Adapter, LOC < 70) 委托核心深模块
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  type RegexStep,
  REGEX_MATCHING_CODES,
  generateRegexSteps,
} from '../../../../core/renderers/adapters/sequence-regex-step-compiler';
import { renderRegexSandbox } from '../../../../core/renderers/adapters/sequence-regex-canvas-adapter';

export type { RegexStep };
export { REGEX_MATCHING_CODES, generateRegexSteps, renderRegexSandbox };

export const regexMatchingVisualizer = registerDeclarativeAlgorithm<RegexStep>({
  id: 'hard-regex-matching',
  name: '大厂高频真题: 正则表达式匹配 (Regex Matching)',
  category: 'string',
  icon: '🔤',
  difficulty: 3,
  levelOrder: 10,
  learningGoal: '彻底掌握带 . 和 * 字符的二维动态规划状态转移与通配符展开机制',
  metrics: [
    { id: 'textChar', label: '文本字符 (Text Char)', color: 'blue' },
    { id: 'patternChar', label: '模式字符 (Pattern Char)', color: 'amber' },
    { id: 'cellValue', label: 'DP 单元格 (dp[i][j])', color: 'emerald' },
    { id: 'branchType', label: '匹配分支 (Branch)', color: 'purple' },
  ],
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 10)</h3>
      <p>给你一个字符串 <code>s</code> 和一个字符规律 <code>p</code>，请你实现一个支持 <code>'.'</code> 和 <code>'*'</code> 的正则表达式匹配：</p>
      <ul>
        <li><code>'.'</code> 匹配任意单个字符。</li>
        <li><code>'*'</code> 匹配零个或多个前面的那一个元素。</li>
      </ul>
      <p>所谓匹配，是要涵盖<strong>整个</strong>字符串 <code>s</code> 的，而不是部分字符串。</p>
    </div>
  `,
  codeLanguages: REGEX_MATCHING_CODES,
  inputs: [
    {
      id: 's',
      label: '文本串 (s)',
      type: 'text',
      defaultValue: 'aab',
    },
    {
      id: 'p',
      label: '模式串 (p)',
      type: 'text',
      defaultValue: 'c*a*b',
    },
  ],
  generateSteps: (input) => {
    const s = String(input.s || 'aab');
    const p = String(input.p || 'c*a*b');
    return generateRegexSteps(s, p);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = renderRegexSandbox(step);
  },
});
