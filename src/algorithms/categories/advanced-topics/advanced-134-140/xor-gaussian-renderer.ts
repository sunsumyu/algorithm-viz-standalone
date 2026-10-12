/**
 * Class 134: 异或高斯消元 (XOR Gaussian Elimination)
 * POJ 1830 开关问题 / 洛谷 P2447 外星千足虫
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_134_140_PROBLEMS } from './advanced-134-140-problem-content';
import { XOR_GAUSSIAN_CODES } from './advanced-134-140-stage-codes';
import {
  XorGaussianStep,
  buildXorGaussianSteps,
} from '../../../../core/renderers/adapters/xor-gaussian-step-compiler';
import { renderXorGaussianCanvas } from '../../../../core/renderers/adapters/xor-gaussian-canvas-adapter';

export type { XorGaussianStep };
export { buildXorGaussianSteps };

export const xorGaussianVisualizer = registerDeclarativeAlgorithm<XorGaussianStep>({
  id: 'xor-gaussian-134',
  name: '异或高斯消元 (Class 134)',
  aliases: ['class134-code01', 'xor-gaussian', 'xor-gaussian-134', 'gf2-gaussian'],
  category: 'math',
  icon: '🔲',
  difficulty: 3,
  levelOrder: 134,
  learningGoal: '深刻理解有限域 GF(2) 下的初等行异或变换与开关灯泡问题的矩阵建模与求解机制',
  problemHtml: ADVANCED_134_140_PROBLEMS.xorGaussian.html,
  analysisHtml: ADVANCED_134_140_PROBLEMS.xorGaussian.html,
  inputs: [
    {
      id: 'matrixPreset',
      label: '异或增广矩阵预设',
      type: 'select',
      defaultValue: 'switches_3x3',
      options: [
        { label: '经典开关问题 3x3 (唯一解: x0=1, x1=1, x2=0)', value: 'switches_3x3' },
        { label: '环形触发器 4x4 (唯一解: x0=0, x1=1, x2=0, x3=1)', value: 'switches_4x4' },
      ],
    },
  ],
  codeLanguages: XOR_GAUSSIAN_CODES,
  generateSteps: (input) => {
    const preset = String(input.matrixPreset || 'switches_3x3');
    if (preset === 'switches_4x4') {
      const mat = [
        [1, 1, 0, 0, 1],
        [0, 1, 1, 0, 1],
        [0, 0, 1, 1, 1],
        [1, 0, 0, 1, 1],
      ];
      return buildXorGaussianSteps(mat, 4);
    }
    const stdMat = [
      [1, 1, 0, 0],
      [0, 1, 1, 1],
      [1, 0, 1, 1],
    ];
    return buildXorGaussianSteps(stdMat, 3);
  },
  renderCanvas: (container, step) => {
    renderXorGaussianCanvas(container, step);
  },
});
