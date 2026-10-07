/**
 * 埃氏筛与欧拉线性筛 (Eratosthenes vs Euler Sieve) - 声明式教学级沙盘渲染器
 * 核心原理：保证每个合数仅被其最小质因子标记一次，达到严格 O(n) 线性时间复杂度
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_097_PROBLEMS } from './math-097-problem-content';
import { EHRLICH_EULER_CODES } from './math-097-stage-codes';
import {
  EulerSieveStep,
  buildEulerSieveSteps,
} from '../../../../core/renderers/adapters/ehrlich-euler-sieve-097-step-compiler';
import { ehrlichEulerSieve097CanvasAdapter } from '../../../../core/renderers/adapters/ehrlich-euler-sieve-097-canvas-adapter';

export type { EulerSieveStep };
export { buildEulerSieveSteps };

export const ehrlichEulerSieveVisualizer = registerDeclarativeAlgorithm<EulerSieveStep>({
  id: 'ehrlich-euler-sieve-097',
  name: '欧拉线性筛法 (Euler Sieve)',
  category: 'math',
  icon: '🧮',
  difficulty: 3,
  levelOrder: 974,
  aliases: ['class097-code04', 'euler-sieve', 'ehrlich-euler-sieve', 'linear-sieve', 'luogu-p3383'],
  learningGoal: '领悟欧拉筛 i % p == 0 最小质因子不重不漏筛除的核心数学设计',
  problemHtml: MATH_097_PROBLEMS.ehrlichEulerSieve.html,
  analysisHtml: MATH_097_PROBLEMS.ehrlichEulerSieve.html,
  inputs: [
    {
      id: 'input-n',
      label: '筛除范围上限 n',
      type: 'number',
      defaultValue: 30,
      min: 5,
      max: 100,
      step: 1,
      placeholder: '例如 30',
    },
  ],
  codeLanguages: EHRLICH_EULER_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(5, parseInt(String(inputs?.['input-n'] ?? '30'), 10) || 30);
    return buildEulerSieveSteps(n);
  },
  renderCanvas: (stageContainer: HTMLElement, step: EulerSieveStep) => {
    ehrlichEulerSieve097CanvasAdapter.render(stageContainer, step);
  },
});
