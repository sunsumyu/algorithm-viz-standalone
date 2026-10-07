/**
 * 试除法判素数 (Trial Division Prime) - 声明式教学级沙盘渲染器
 * 核心原理：6k±1 步长试除，检验 2 ~ sqrt(n) 之间的因子
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_097_PROBLEMS } from './math-097-problem-content';
import { SMALL_PRIME_CODES } from './math-097-stage-codes';
import {
  SmallPrimeStep,
  buildSmallPrimeSteps,
} from '../../../../core/renderers/adapters/small-prime-097-step-compiler';
import { smallPrime097CanvasAdapter } from '../../../../core/renderers/adapters/small-prime-097-canvas-adapter';

export type { SmallPrimeStep };
export { buildSmallPrimeSteps };

export const smallPrimeVisualizer = registerDeclarativeAlgorithm<SmallPrimeStep>({
  id: 'small-prime-097',
  name: '试除法判素数 (Trial Division Prime)',
  category: 'math',
  icon: '🔍',
  difficulty: 2,
  levelOrder: 971,
  aliases: ['class097-code01', 'small-prime', 'trial-division-prime', 'is-prime'],
  learningGoal: '掌握 6k±1 试除加速与 sqrt(n) 边界剪枝数论原理',
  problemHtml: MATH_097_PROBLEMS.smallPrime.html,
  analysisHtml: MATH_097_PROBLEMS.smallPrime.html,
  inputs: [
    {
      id: 'input-n',
      label: '待测正整数 n',
      type: 'number',
      defaultValue: 97,
      min: 1,
      max: 100000,
      step: 1,
      placeholder: '例如 97 或 100',
    },
  ],
  codeLanguages: SMALL_PRIME_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] ?? '97'), 10) || 97);
    return buildSmallPrimeSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: SmallPrimeStep) => {
    smallPrime097CanvasAdapter.render(stageContainer, step);
  },
});
