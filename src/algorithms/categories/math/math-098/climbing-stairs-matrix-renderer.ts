/**
 * 爬楼梯矩阵快速幂 (Climbing Stairs Matrix Power) - 声明式教学级沙盘渲染器
 * 核心原理：dp[n] = dp[n-1] + dp[n-2]，同构于斐波那契矩阵，ans = 2 * res[0][0] + res[1][0]
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_098_PROBLEMS } from './math-098-problem-content';
import { CLIMBING_STAIRS_CODES } from './math-098-stage-codes';
import {
  ClimbingStairsStep,
  buildClimbingStairsSteps,
} from '../../../../core/renderers/adapters/climbing-stairs-matrix-098-step-compiler';
import { matrixPower098CanvasAdapter } from '../../../../core/renderers/adapters/matrix-power-098-canvas-adapter';

export type { ClimbingStairsStep };
export { buildClimbingStairsSteps };

export const climbingStairsMatrixVisualizer = registerDeclarativeAlgorithm<ClimbingStairsStep>({
  id: 'climbing-stairs-matrix-098',
  name: '爬楼梯矩阵快速幂 (Climbing Stairs Matrix)',
  category: 'math',
  icon: '🪜',
  difficulty: 2,
  levelOrder: 983,
  aliases: ['class098-code03', 'climbing-stairs-matrix', 'climbing-stairs-70', 'leetcode-70'],
  learningGoal: '掌握斐波那契同构问题在矩阵快速幂中的初值代入 [dp(2)=2, dp(1)=1]',
  problemHtml: MATH_098_PROBLEMS.climbingStairsMatrix.html,
  analysisHtml: MATH_098_PROBLEMS.climbingStairsMatrix.html,
  inputs: [
    {
      id: 'input-n',
      label: '台阶数 n',
      type: 'number',
      defaultValue: 10,
      min: 1,
      max: 100000,
      step: 1,
      placeholder: '例如 10',
    },
  ],
  codeLanguages: CLIMBING_STAIRS_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '10'), 10) || 10);
    return buildClimbingStairsSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: ClimbingStairsStep) => {
    matrixPower098CanvasAdapter.render(stageContainer, step);
  },
});
