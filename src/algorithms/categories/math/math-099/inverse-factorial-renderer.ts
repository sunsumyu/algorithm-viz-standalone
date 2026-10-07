/**
 * 阶乘逆元与组合数快速计算 (Factorial Inverses & nCr) - 声明式教学级沙盘渲染器
 * 核心原理：O(n) 预处理阶乘与倒推阶乘逆元，单次 O(1) 求解组合数 C(n, m)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_099_PROBLEMS } from './math-099-problem-content';
import { INVERSE_FACTORIAL_CODES } from './math-099-stage-codes';
import {
  FactorialStep,
  buildFactorialSteps,
} from '../../../../core/renderers/adapters/inverse-factorial-099-step-compiler';
import { inverseFactorial099CanvasAdapter } from '../../../../core/renderers/adapters/inverse-factorial-099-canvas-adapter';

export type { FactorialStep };
export { buildFactorialSteps };

export const inverseFactorialVisualizer = registerDeclarativeAlgorithm<FactorialStep>({
  id: 'inverse-factorial-099',
  name: '阶乘逆元与组合数快速计算 (Factorial Inverses & nCr)',
  category: 'math',
  icon: '🎲',
  difficulty: 3,
  levelOrder: 993,
  aliases: ['class099-code03', 'inverse-factorial', 'combination-ncr', 'factorial-inverses'],
  learningGoal: '掌握阶乘倒推逆元全量预处理，达成 O(1) 极速回答任意组合数',
  problemHtml: MATH_099_PROBLEMS.inverseFactorial.html,
  analysisHtml: MATH_099_PROBLEMS.inverseFactorial.html,
  inputs: [
    {
      id: 'input-n',
      label: '总元素数 n',
      type: 'number',
      defaultValue: 10,
      min: 0,
      max: 100000,
      step: 1,
      placeholder: '例如 10',
    },
    {
      id: 'input-m',
      label: '选取数 m',
      type: 'number',
      defaultValue: 3,
      min: 0,
      max: 100000,
      step: 1,
      placeholder: '例如 3',
    },
  ],
  codeLanguages: INVERSE_FACTORIAL_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(0, parseInt(String(inputs?.['input-n'] ?? '10'), 10) || 10);
    const m = Math.max(0, parseInt(String(inputs?.['input-m'] ?? '3'), 10) || 3);
    return buildFactorialSteps(n, m);
  },
  renderCanvas: (stageContainer: HTMLElement, step: FactorialStep) => {
    inverseFactorial099CanvasAdapter.render(stageContainer, step);
  },
});
