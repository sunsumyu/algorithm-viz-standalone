/**
 * Class 138: 01 分数规划 (Fractional Programming)
 * POJ 2976 Dropping Tests / 洛谷 P4377 Talent Show
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_134_140_PROBLEMS } from './advanced-134-140-problem-content';
import { FRACTIONAL_PROGRAMMING_CODES } from './advanced-134-140-stage-codes';
import {
  FractionalStep,
  buildFractionalSteps,
} from '../../../../core/renderers/adapters/fractional-programming-step-compiler';
import { renderFractionalProgrammingCanvas } from '../../../../core/renderers/adapters/fractional-programming-canvas-adapter';

export type { FractionalStep };
export { buildFractionalSteps };

export const fractionalProgrammingVisualizer = registerDeclarativeAlgorithm<FractionalStep>({
  id: 'fractional-programming-138',
  name: '01 分数规划 (Class 138)',
  aliases: ['class138-code01', 'fractional-programming', 'fractional-programming-138', 'dinkelbach'],
  category: 'greedy',
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 138,
  learningGoal: '深刻理解 01 分数规划 Dinkelbach 二分判定转化 sum(a - mid*b) >= 0 与贪心排序选取的数学原理',
  problemHtml: ADVANCED_134_140_PROBLEMS.fractionalProgramming.html,
  analysisHtml: ADVANCED_134_140_PROBLEMS.fractionalProgramming.html,
  inputs: [
    {
      id: 'aList',
      label: '收益数组 a[i] (逗号分隔)',
      type: 'text',
      defaultValue: '5,1,3,4,8',
      placeholder: '请输入各物品收益',
    },
    {
      id: 'bList',
      label: '代价数组 b[i] (逗号分隔)',
      type: 'text',
      defaultValue: '2,2,1,5,3',
      placeholder: '请输入各物品代价',
    },
    {
      id: 'k',
      label: '选取物品个数 K',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 10,
    },
  ],
  codeLanguages: FRACTIONAL_PROGRAMMING_CODES,
  generateSteps: (input) => {
    const a = String(input.aList || '5,1,3,4,8').split(',').map(Number);
    const b = String(input.bList || '2,2,1,5,3').split(',').map(Number);
    const k = Math.max(1, Math.min(a.length, Number(input.k) || 3));
    return buildFractionalSteps(a, b, k);
  },
  renderCanvas: (container, step) => {
    renderFractionalProgrammingCanvas(container, step);
  },
});
