/**
 * 泰波那契数矩阵快速幂 (Tribonacci Matrix Power) - 声明式教学级沙盘渲染器
 * 核心原理：3阶齐次线性递推，3×3 矩阵转移求解 T(n) = T(n-1) + T(n-2) + T(n-3)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_098_PROBLEMS } from './math-098-problem-content';
import { TRIBONACCI_MATRIX_CODES } from './math-098-stage-codes';
import {
  TribonacciStep,
  buildTribonacciSteps,
} from '../../../../core/renderers/adapters/tribonacci-matrix-098-step-compiler';
import { matrixPower098CanvasAdapter } from '../../../../core/renderers/adapters/matrix-power-098-canvas-adapter';

export type { TribonacciStep };
export { buildTribonacciSteps };

export const tribonacciMatrixVisualizer = registerDeclarativeAlgorithm<TribonacciStep>({
  id: 'tribonacci-matrix-power-098',
  name: '泰波那契数矩阵快速幂 (Tribonacci Matrix)',
  category: 'math',
  icon: '🔺',
  difficulty: 3,
  levelOrder: 984,
  aliases: ['class098-code04', 'tribonacci-matrix', 'tribonacci-number-1137', 'leetcode-1137'],
  learningGoal: '掌握高阶线性齐次递推数列与 3×3 状态转移矩阵快速幂构建方法',
  problemHtml: MATH_098_PROBLEMS.tribonacciMatrix.html,
  analysisHtml: MATH_098_PROBLEMS.tribonacciMatrix.html,
  inputs: [
    {
      id: 'input-n',
      label: '目标项数 n',
      type: 'number',
      defaultValue: 10,
      min: 0,
      max: 100000,
      step: 1,
      placeholder: '例如 10',
    },
  ],
  codeLanguages: TRIBONACCI_MATRIX_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(0, parseInt(String(inputs?.['input-n'] ?? '10'), 10) || 10);
    return buildTribonacciSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: TribonacciStep) => {
    matrixPower098CanvasAdapter.render(stageContainer, step);
  },
});
