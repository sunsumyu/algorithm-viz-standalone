/**
 * 乘法逆元单点求法 (Modular Inverse Single) - 声明式教学级沙盘渲染器
 * 核心原理：费马小定理 a^(p-1) ≡ 1 (mod p) ➔ a^(-1) ≡ a^(p-2) (mod p)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { MATH_099_PROBLEMS } from './math-099-problem-content';
import { INVERSE_SINGLE_CODES } from './math-099-stage-codes';
import {
  InverseSingleStep,
  buildInverseSingleSteps,
} from '../../../../core/renderers/adapters/inverse-single-099-step-compiler';
import { inverseSingle099CanvasAdapter } from '../../../../core/renderers/adapters/inverse-single-099-canvas-adapter';

export type { InverseSingleStep };
export { buildInverseSingleSteps };

export const inverseSingleVisualizer = registerDeclarativeAlgorithm<InverseSingleStep>({
  id: 'inverse-single-099',
  name: '乘法逆元单点求法 (Modular Inverse Single)',
  category: 'math',
  icon: '➗',
  difficulty: 2,
  levelOrder: 991,
  aliases: ['class099-code01', 'inverse-single', 'modular-inverse-single', 'fermat-inverse'],
  learningGoal: '掌握质数模数下费马小定理 a^(p-2) 快速幂求逆元与除法取模转化',
  problemHtml: MATH_099_PROBLEMS.inverseSingle.html,
  analysisHtml: MATH_099_PROBLEMS.inverseSingle.html,
  inputs: [
    {
      id: 'input-a',
      label: '底数 a',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 1000000,
      step: 1,
      placeholder: '例如 3',
    },
    {
      id: 'input-p',
      label: '质数模数 p',
      type: 'number',
      defaultValue: 1000000007,
      min: 2,
      max: 1000000007,
      step: 1,
      placeholder: '例如 1000000007',
    },
  ],
  codeLanguages: INVERSE_SINGLE_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const a = Math.max(1, parseInt(String(inputs?.['input-a'] ?? '3'), 10) || 3);
    const p = Math.max(2, parseInt(String(inputs?.['input-p'] ?? '1000000007'), 10) || 1000000007);
    return buildInverseSingleSteps(a, p);
  },
  renderCanvas: (stageContainer: HTMLElement, step: InverseSingleStep) => {
    inverseSingle099CanvasAdapter.render(stageContainer, step);
  },
});
