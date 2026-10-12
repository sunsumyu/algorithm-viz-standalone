/**
 * 大厂高频真题 03: 全功能表达式计算器 (Basic Calculator Full)
 * LeetCode 772 / 224 / 227 / 大厂高频真题
 * 双栈法 (双栈：操作数栈 + 操作符栈) 完整解析加减乘除与多层嵌套括号
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  CalculatorStep,
  BASIC_CALCULATOR_CODES,
  generateCalculatorSteps,
} from '../../../../core/renderers/adapters/basic-calculator-full-step-compiler';
import { renderCalculatorSandbox } from '../../../../core/renderers/adapters/basic-calculator-full-canvas-adapter';

export type { CalculatorStep };
export { BASIC_CALCULATOR_CODES, generateCalculatorSteps, renderCalculatorSandbox };

export const basicCalculatorVisualizer = registerDeclarativeAlgorithm<CalculatorStep>({
  id: 'basic-calculator-full',
  aliases: ['class039-calculator', 'basic-calculator', 'basic-calculator-full', 'leetcode-772'],
  name: '大厂高频真题: 全功能表达式计算器 (Basic Calculator)',
  category: 'stack',
  icon: '🧮',
  difficulty: 3,
  levelOrder: 772,
  learningGoal: '掌握双栈法（操作数栈 + 操作符栈）在 O(N) 时间内解析含加减乘除与括号的复杂表达式',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 772)</h3>
      <p>实现一个全功能表达式计算器。表达式字符串包含非负整数、<code>+</code>、<code>-</code>、<code>*</code>、<code>/</code> 运算符以及圆括号 <code>(</code> 和 <code>)</code>。</p>
      <p>注意：整数除法仅保留整数部分。</p>
    </div>
  `,
  codeLanguages: BASIC_CALCULATOR_CODES,
  metrics: [
    { id: 'currentToken', label: '当前 Token', color: '#f59e0b' },
    { id: 'numDepth', label: '数栈深度', color: '#10b981' },
    { id: 'opDepth', label: '符号栈深度', color: '#6366f1' },
    { id: 'lastEval', label: '最近求值', color: '#38bdf8' },
  ],
  inputs: [
    {
      id: 'expression',
      label: '算术表达式',
      type: 'text',
      defaultValue: '(2 + 6 * 3) / (4 - 2) + 5',
    },
  ],
  generateSteps: (input) => {
    const expr = String(input.expression || '(2 + 6 * 3) / (4 - 2) + 5');
    return generateCalculatorSteps(expr);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = renderCalculatorSandbox(step);
  },
});
