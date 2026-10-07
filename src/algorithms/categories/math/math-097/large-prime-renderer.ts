/**
 * Miller-Rabin 大素数测试 (Miller-Rabin Primality Test) - 声明式教学级沙盘渲染器
 * 核心原理：费马小定理与二次探测定理，将 n-1 拆解为 d * 2^s，在 2^64 范围内由确定性基底验证
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_097_PROBLEMS } from './math-097-problem-content';
import { LARGE_PRIME_CODES } from './math-097-stage-codes';
import {
  MillerRabinStep,
  buildMillerRabinSteps,
} from '../../../../core/renderers/adapters/large-prime-097-step-compiler';
import { largePrime097CanvasAdapter } from '../../../../core/renderers/adapters/large-prime-097-canvas-adapter';

export type { MillerRabinStep };
export { buildMillerRabinSteps };

export const largePrimeVisualizer = registerDeclarativeAlgorithm<MillerRabinStep>({
  id: 'large-prime-miller-rabin-097',
  name: 'Miller-Rabin 大素数测试',
  category: 'math',
  icon: '🛡️',
  difficulty: 3,
  levelOrder: 972,
  aliases: ['class097-code02', 'large-prime', 'miller-rabin', 'miller-rabin-test'],
  learningGoal: '掌握费马小定理、二次探测定理与确定性基底快速素数判定',
  problemHtml: MATH_097_PROBLEMS.largePrime.html,
  analysisHtml: MATH_097_PROBLEMS.largePrime.html,
  inputs: [
    {
      id: 'input-n',
      label: '待测大正整数 n',
      type: 'number',
      defaultValue: 1000000007,
      min: 2,
      max: 2000000000,
      step: 1,
      placeholder: '例如 1000000007',
    },
  ],
  codeLanguages: LARGE_PRIME_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(2, parseInt(String(inputs?.['input-n'] ?? '1000000007'), 10) || 1000000007);
    return buildMillerRabinSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: MillerRabinStep) => {
    largePrime097CanvasAdapter.render(stageContainer, step);
  },
});
