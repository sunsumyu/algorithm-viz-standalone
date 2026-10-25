/**
 * Class 032: 位运算实现加减乘除 (Bitwise Arithmetic Operations)
 * 左程云算法通关课入门篇 Class 032
 * 纯位运算实现算术四则运算：异或与进位相加、补码相反数减法、二进制竖式乘法与高位试商除法
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type BitwiseArithmeticStep,
  BITWISE_ARITHMETIC_032_CODES,
  generateBitwiseSteps,
} from './bitwise-arithmetic-032-step-compiler';
import { renderBitwiseCanvas } from './bitwise-arithmetic-032-canvas-adapter';

export {
  type BitwiseArithmeticStep,
  BITWISE_ARITHMETIC_032_CODES,
  generateBitwiseSteps,
  renderBitwiseCanvas,
};

export const bitwiseArithmetic032Visualizer = registerDeclarativeAlgorithm<BitwiseArithmeticStep>({
  id: 'bitwise-arithmetic-032',
  aliases: ['class032-code01', 'class032-code02', 'bitwise-arithmetic-032', 'bitwise-arithmetic', 'bitwise-add'],
  hasDeductionTree: true,
  name: 'Class 032: 位运算实现加减乘除 (Bitwise Arithmetic)',
  category: 'bit-manipulation',
  icon: '⚡',
  difficulty: 2,
  levelOrder: 32,
  learningGoal: '不用任何算术运算符 (+, -, *, /)，纯粹利用位运算 (异或、与、非、移位) 实现算术四则运算',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 032)</h3>
      <p>这是计算机 CPU 算术逻辑单元 (ALU) 的物理底层实现原理：</p>
      <ul>
        <li><strong>加法</strong>：<code>a ^ b</code> 得到每一位无进位的和，<code>(a & b) << 1</code> 得到所有进位。将二者再次相加，直到进位为 0。</li>
        <li><strong>减法</strong>：<code>a - b = a + (-b)</code>，在计算机补码中，<code>-b = ~b + 1</code>。</li>
        <li><strong>乘法</strong>：二进制的竖式乘法，依次查看乘数的每一位是否为 1，若是则将当前被乘数累加到积中，被乘数左移，乘数右移。</li>
      </ul>
    </div>
  `,
  codeLanguages: BITWISE_ARITHMETIC_032_CODES,
  inputs: [
    {
      id: 'a',
      label: '操作数 A',
      type: 'number',
      defaultValue: 19,
    },
    {
      id: 'b',
      label: '操作数 B',
      type: 'number',
      defaultValue: 13,
    },
    {
      id: 'op',
      label: '运算模式',
      type: 'select',
      defaultValue: 'add',
      options: [
        { label: '加法 (ADD)', value: 'add' },
        { label: '减法 (MINUS)', value: 'minus' },
        { label: '乘法 (MULTIPLY)', value: 'multiply' },
      ],
    },
  ],
  generateSteps: (input) => {
    const a = Number(input.a) || 19;
    const b = Number(input.b) || 13;
    const op = (input.op as any) || 'add';
    return generateBitwiseSteps(a, b, op);
  },
  renderCanvas: (container, step) => {
    renderBitwiseCanvas(container, step);
  },
});
