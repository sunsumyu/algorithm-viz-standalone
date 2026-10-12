/**
 * Class 133: 高斯消元法 (Gaussian Elimination)
 * 洛谷 P3389 【模板】高斯消元法 / P2455 线性方程组
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_124_134_PROBLEMS } from './advanced-124-134-problem-content';
import { GAUSSIAN_ELIMINATION_CODES } from './advanced-124-134-stage-codes';
import {
  GaussianStep,
  buildGaussianSteps,
} from '../../../../core/renderers/adapters/gaussian-elimination-step-compiler';
import { renderGaussianEliminationCanvas } from '../../../../core/renderers/adapters/gaussian-elimination-canvas-adapter';

export type { GaussianStep };
export { buildGaussianSteps, renderGaussianEliminationCanvas };

export const gaussianEliminationVisualizer = registerDeclarativeAlgorithm<GaussianStep>({
  id: 'gaussian-elimination-133',
  name: '高斯消元法 (Class 133)',
  aliases: ['class133-code01', 'gaussian-elimination', 'gaussian-elimination-133', 'linear-system-gaussian'],
  category: 'math',
  icon: '🔢',
  difficulty: 3,
  levelOrder: 133,
  learningGoal: '深刻理解高斯消元最大主元选取、初等行变换化上三角与自底向上回代求解线性方程组机制',
  problemHtml: ADVANCED_124_134_PROBLEMS.gaussianElimination.html,
  analysisHtml: ADVANCED_124_134_PROBLEMS.gaussianElimination.html,
  inputs: [
    {
      id: 'matrixPreset',
      label: '增广矩阵预设',
      type: 'select',
      defaultValue: 'standard_3x3',
      options: [
        { label: '标准 3x3 方程组 (x0=1, x1=2, x2=3)', value: 'standard_3x3' },
        { label: '交错系数 3x3 方程组', value: 'staggered_3x3' },
      ],
    },
  ],
  codeLanguages: GAUSSIAN_ELIMINATION_CODES,
  generateSteps: (input) => {
    const preset = String(input.matrixPreset || 'standard_3x3');
    if (preset === 'staggered_3x3') {
      const mat = [
        [2, 1, -1, 8],
        [-3, -1, 2, -11],
        [-2, 1, 2, -3],
      ];
      return buildGaussianSteps(mat, 3);
    }
    const stdMat = [
      [1, 1, 1, 6],
      [2, 3, 1, 11],
      [1, -1, 2, 5],
    ];
    return buildGaussianSteps(stdMat, 3);
  },
  renderCanvas: (container, step) => {
    renderGaussianEliminationCanvas(container, step);
  },
});
