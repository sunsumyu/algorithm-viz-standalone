/**
 * Class 136: 线性基与最大异或和 (Linear Basis - Max XOR)
 * 洛谷 P3812 【模板】线性基
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_134_140_PROBLEMS } from './advanced-134-140-problem-content';
import { LINEAR_BASIS_CODES } from './advanced-134-140-stage-codes';
import {
  LinearBasisStep,
  buildLinearBasisSteps,
} from '../../../../core/renderers/adapters/linear-basis-136-step-compiler';
import { renderLinearBasis136Canvas } from '../../../../core/renderers/adapters/linear-basis-136-canvas-adapter';

export type { LinearBasisStep };
export { buildLinearBasisSteps };

export const linearBasisVisualizer = registerDeclarativeAlgorithm<LinearBasisStep>({
  id: 'linear-basis-136',
  name: '线性基与最大异或和 (Class 136)',
  aliases: ['class136-code01', 'linear-basis-136', 'max-xor-basis'],
  category: 'math',
  icon: '🧬',
  difficulty: 3,
  levelOrder: 136,
  learningGoal: '深刻理解线性基高位向低位贪心插入、异或消元、以及贪心求解任意子集最大异或和的数学本质',
  problemHtml: ADVANCED_134_140_PROBLEMS.linearBasis.html,
  analysisHtml: ADVANCED_134_140_PROBLEMS.linearBasis.html,
  inputs: [
    {
      id: 'numList',
      label: '输入整数序列 (逗号分隔)',
      type: 'text',
      defaultValue: '11,9,5,7',
      placeholder: '请输入正整数',
    },
  ],
  codeLanguages: LINEAR_BASIS_CODES,
  generateSteps: (input) => {
    const raw = String(input.numList || '11,9,5,7');
    const nums = raw.split(',').map(Number).filter(n => !isNaN(n) && n > 0);
    return buildLinearBasisSteps(nums.length > 0 ? nums : [11, 9, 5, 7]);
  },
  renderCanvas: (container, step) => {
    renderLinearBasis136Canvas(container, step);
  },
});
