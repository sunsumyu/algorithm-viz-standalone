/**
 * 元音排列矩阵快速幂 (Count Vowels Permutation) - 声明式教学级沙盘渲染器
 * 核心原理：5元有限状态机，5×5 状态转移矩阵快速幂
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_098_PROBLEMS } from './math-098-problem-content';
import { COUNT_VOWELS_CODES } from './math-098-stage-codes';
import {
  CountVowelsStep,
  buildCountVowelsSteps,
} from '../../../../core/renderers/adapters/count-vowels-matrix-098-step-compiler';
import { matrixPower098CanvasAdapter } from '../../../../core/renderers/adapters/matrix-power-098-canvas-adapter';

export type { CountVowelsStep };
export { buildCountVowelsSteps };

export const countVowelsMatrixVisualizer = registerDeclarativeAlgorithm<CountVowelsStep>({
  id: 'count-vowels-matrix-098',
  name: '元音排列矩阵快速幂 (Count Vowels Matrix)',
  category: 'math',
  icon: '🔤',
  difficulty: 3,
  levelOrder: 986,
  aliases: ['class098-code06', 'count-vowels-matrix', 'count-vowels-1220', 'leetcode-1220'],
  learningGoal: '掌握字符相邻约束图向有向图邻接转移矩阵的转化与全状态求和',
  problemHtml: MATH_098_PROBLEMS.countVowels.html,
  analysisHtml: MATH_098_PROBLEMS.countVowels.html,
  inputs: [
    {
      id: 'input-n',
      label: '字符串长度 n',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 100000,
      step: 1,
      placeholder: '例如 5',
    },
  ],
  codeLanguages: COUNT_VOWELS_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '5'), 10) || 5);
    return buildCountVowelsSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: CountVowelsStep) => {
    matrixPower098CanvasAdapter.render(stageContainer, step);
  },
});
