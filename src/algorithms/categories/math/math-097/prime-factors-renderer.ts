/**
 * 质因子分解 (Prime Factorization) - 声明式教学级沙盘渲染器
 * 核心原理：算术基本定理，自小到大剥离质因子，剩余数 > 1 必为大质数
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_097_PROBLEMS } from './math-097-problem-content';
import { PRIME_FACTORS_CODES } from './math-097-stage-codes';
import {
  PrimeFactorsStep,
  buildPrimeFactorsSteps,
} from '../../../../core/renderers/adapters/prime-factors-097-step-compiler';
import { primeFactors097CanvasAdapter } from '../../../../core/renderers/adapters/prime-factors-097-canvas-adapter';

export type { PrimeFactorsStep };
export { buildPrimeFactorsSteps };

export const primeFactorsVisualizer = registerDeclarativeAlgorithm<PrimeFactorsStep>({
  id: 'prime-factors-097',
  name: '质因子分解 (Prime Factorization)',
  category: 'math',
  icon: '🌱',
  difficulty: 2,
  levelOrder: 973,
  aliases: ['class097-code03', 'prime-factors', 'prime-factorization'],
  learningGoal: '理解算术基本定理唯一性，掌握 sqrt(n) 试除与末尾剩余大质因子提取',
  problemHtml: MATH_097_PROBLEMS.primeFactors.html,
  analysisHtml: MATH_097_PROBLEMS.primeFactors.html,
  inputs: [
    {
      id: 'input-n',
      label: '待分解正整数 n',
      type: 'number',
      defaultValue: 360,
      min: 2,
      max: 1000000,
      step: 1,
      placeholder: '例如 360 或 999',
    },
  ],
  codeLanguages: PRIME_FACTORS_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(2, parseInt(String(inputs?.['input-n'] ?? '360'), 10) || 360);
    return buildPrimeFactorsSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: PrimeFactorsStep) => {
    primeFactors097CanvasAdapter.render(stageContainer, step);
  },
});
