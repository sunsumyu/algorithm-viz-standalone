/**
 * 斐波那契数矩阵快速幂 (Fibonacci Matrix Power) - 声明式教学级沙盘渲染器
 * 核心原理：[F(n), F(n-1)] = [F(2), F(1)] * [[1,1],[1,0]]^(n-2)，O(log n) 求解
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_098_PROBLEMS } from './math-098-problem-content';
import { FIBONACCI_MATRIX_CODES } from './math-098-stage-codes';
import {
  FibMatrixStep,
  buildFibMatrixSteps,
} from '../../../../core/renderers/adapters/fibonacci-matrix-098-step-compiler';
import { matrixPower098CanvasAdapter } from '../../../../core/renderers/adapters/matrix-power-098-canvas-adapter';

export type { FibMatrixStep };
export { buildFibMatrixSteps };

export const fibonacciMatrixVisualizer = registerDeclarativeAlgorithm<FibMatrixStep>({
  id: 'fibonacci-matrix-power-098',
  name: '斐波那契矩阵快速幂 (Fibonacci Matrix)',
  category: 'math',
  icon: '🌀',
  difficulty: 3,
  levelOrder: 982,
  aliases: ['class098-code02', 'fibonacci-matrix', 'fibonacci-number-509', 'leetcode-509'],
  learningGoal: '掌握常系数线性齐次递推数列转化为状态转移矩阵快速幂的标准范式',
  problemHtml: MATH_098_PROBLEMS.fibonacciMatrix.html,
  analysisHtml: MATH_098_PROBLEMS.fibonacciMatrix.html,
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
  codeLanguages: FIBONACCI_MATRIX_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(0, parseInt(String(inputs?.['input-n'] ?? '10'), 10) || 10);
    return buildFibMatrixSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: FibMatrixStep) => {
    matrixPower098CanvasAdapter.render(stageContainer, step);
  },
});
