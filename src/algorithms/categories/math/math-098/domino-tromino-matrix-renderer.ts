/**
 * 多米诺和托米诺平铺矩阵快速幂 (Domino Tromino Matrix Power) - 声明式教学级沙盘渲染器
 * 核心原理：dp[n] = 2 * dp[n-1] + dp[n-3]，构造 3×3 矩阵加速至 O(log n)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_098_PROBLEMS } from './math-098-problem-content';
import { DOMINO_TROMINO_CODES } from './math-098-stage-codes';
import {
  DominoStep,
  buildDominoSteps,
} from '../../../../core/renderers/adapters/domino-tromino-matrix-098-step-compiler';
import { matrixPower098CanvasAdapter } from '../../../../core/renderers/adapters/matrix-power-098-canvas-adapter';

export type { DominoStep };
export { buildDominoSteps };

export const dominoTrominoMatrixVisualizer = registerDeclarativeAlgorithm<DominoStep>({
  id: 'domino-tromino-matrix-098',
  name: '多米诺与托米诺平铺矩阵快速幂',
  category: 'math',
  icon: '🀄',
  difficulty: 3,
  levelOrder: 985,
  aliases: ['class098-code05', 'domino-tromino', 'domino-tromino-790', 'leetcode-790'],
  learningGoal: '通过几何骨牌覆盖推导出线性递推式，并转化为 3×3 矩阵快速幂加速',
  problemHtml: MATH_098_PROBLEMS.dominoTromino.html,
  analysisHtml: MATH_098_PROBLEMS.dominoTromino.html,
  inputs: [
    {
      id: 'input-n',
      label: '面板长度 n',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 100000,
      step: 1,
      placeholder: '例如 10',
    },
  ],
  codeLanguages: DOMINO_TROMINO_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '10'), 10) || 10);
    return buildDominoSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: DominoStep) => {
    matrixPower098CanvasAdapter.render(stageContainer, step);
  },
});
