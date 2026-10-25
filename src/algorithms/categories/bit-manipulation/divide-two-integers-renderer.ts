/**
 * 两数相除 (Divide Two Integers)
 * LeetCode 29 (Medium / 左程云通关课 Class 032 进阶)
 * 核心原语:
 *  不使用乘法、除法和取模运算符，实现整数除法。
 *  核心解法：二进制倍增减法（Bitwise Doubling Subtraction）。
 *  对被除数与除数统一转为负数处理（规避 Integer.MIN_VALUE 溢出）。
 *  每次寻找除数通过左移 (<< 1) 所能达到的最大不超过被除数的倍数，
 *  从被除数中扣除并累加对应的商的倍数 (1 << shift)，反复迭代直至被除数小于除数。
 *  时间复杂度 O(log^2 N) 或 O(31) = O(1)，空间复杂度 O(1)。
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type DivideStep,
  DIVIDE_TWO_INTEGERS_CODES,
  buildDivideSteps,
} from './divide-two-integers-step-compiler';
import { renderDivideCanvas } from './divide-two-integers-canvas-adapter';

export {
  type DivideStep,
  DIVIDE_TWO_INTEGERS_CODES,
  buildDivideSteps,
  renderDivideCanvas,
};

registerDeclarativeAlgorithm({
  id: 'divide-two-integers',
  aliases: ['29', 'leetcode-29', 'divide-two-integers', 'divide-integers'],
  hasDeductionTree: true,
  name: '两数相除',
  category: 'bit-manipulation',
  difficulty: 2,
  learningGoal: 'LeetCode 29: 不用乘除与取模运算实现除法。基于二进制倍增减法，在 O(log^2 N) 时间内高效定位商。',
  codeLanguages: DIVIDE_TWO_INTEGERS_CODES,
  generateSteps: (inputs) => {
    const rawA = Number(inputs?.dividend ?? 29);
    const rawB = Number(inputs?.divisor ?? 3);
    const a = isNaN(rawA) ? 29 : rawA;
    const b = isNaN(rawB) || rawB === 0 ? 3 : rawB;
    return buildDivideSteps(a, b);
  },
  renderCanvas: (container: HTMLElement, step: DivideStep) => {
    container.innerHTML = renderDivideCanvas(step);
  },
  inputs: [
    {
      id: 'dividend',
      label: '被除数',
      type: 'number',
      defaultValue: 29,
      placeholder: '整数被除数',
    },
    {
      id: 'divisor',
      label: '除数',
      type: 'number',
      defaultValue: 3,
      placeholder: '非零整数除数',
    },
  ],
});
