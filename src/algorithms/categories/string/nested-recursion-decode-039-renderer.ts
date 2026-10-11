/**
 * Class 039: 嵌套结构递归解法母题 (Nested Recursion Decode String)
 * 左程云算法通关课入门篇 Class 039 / LeetCode 394 (解码字符串)
 * 核心原语：嵌套递归通用模板——遇到 '[' 深入子过程，遇到 ']' 弹栈返回展开串与最新游标
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  DecodeStep,
  DECODE_039_CODES,
  DECODE_039_CODE_LINES,
  generateDecodeSteps,
} from './nested-recursion-decode-039-step-compiler';
import { renderDecodeCanvas } from './nested-recursion-decode-039-canvas-adapter';

export type { DecodeStep };
export { DECODE_039_CODES, DECODE_039_CODE_LINES, generateDecodeSteps, renderDecodeCanvas };

export const nestedRecursionDecode039Visualizer = registerDeclarativeAlgorithm<DecodeStep>({
  id: 'nested-recursion-decode-039',
  aliases: ['class039-code02', 'decode-string', 'decode-string-039', 'leetcode-394'],
  name: 'Class 039: 嵌套结构递归解法母题 (Decode String)',
  category: 'string',
  icon: '🪆',
  difficulty: 2,
  levelOrder: 39,
  learningGoal: '掌握处理所有嵌套括号/倍数结构的统一递归解法模板，理解系统调用栈天然处理任意多层嵌套的机制',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 039 / LeetCode 394)</h3>
      <p>给定一个经过编码的字符串，返回它解码后的字符串。编码规则为: <code>k[encoded_string]</code>，表示其中方括号内部的 <code>encoded_string</code> 正好重复 <code>k</code> 次：</p>
      <ul>
        <li><strong>嵌套递归思想</strong>：
          <br/>1. 遇到数字：累加计算重复系数 <code>count</code>。
          <br/>2. 遇到 <code>[</code>：发起子递归 <code>process(i + 1)</code> 深入下一层。
          <br/>3. 遇到 <code>]</code> 或串尾：子过程返回 <code>{ ans, stopIndex }</code>，主过程将 <code>ans</code> 乘以 <code>count</code> 拼入自身，游标推至 <code>stopIndex + 1</code>。</li>
        <li><strong>通用价值</strong>：这套递归模板可以毫无修改地迁移至复杂表达式计算器（LeetCode 772）与分子式原子统计（LeetCode 726）。</li>
      </ul>
    </div>
  `,
  codeLanguages: DECODE_039_CODES,
  inputs: [
    {
      id: 'inputStr',
      label: '待解码字符串',
      type: 'select',
      defaultValue: '3[a2[c]]',
      options: [
        { label: '多层深度嵌套: 3[a2[c]] ➔ accaccacc', value: '3[a2[c]]' },
        { label: '并列嵌套组合: 3[a]2[bc] ➔ aaabcbc', value: '3[a]2[bc]' },
      ],
    },
  ],
  generateSteps: (input) => {
    const s = String(input.inputStr || '3[a2[c]]');
    return generateDecodeSteps(s);
  },
  renderCanvas: (container, step) => {
    renderDecodeCanvas(container, step);
  },
});
