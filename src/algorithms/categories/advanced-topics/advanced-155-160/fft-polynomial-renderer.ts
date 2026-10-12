/**
 * Class 160: 快速傅里叶变换 (FFT / Fast Fourier Transform)
 * Cooley-Tukey 算法 / 洛谷 P3803 【模板】多项式乘法
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_155_160_PROBLEMS } from './advanced-155-160-problem-content';
import { FFT_POLYNOMIAL_CODES } from './advanced-155-160-stage-codes';
import { FFTStep, buildFFTSteps } from '../../../../core/renderers/adapters/fft-polynomial-step-compiler';
import { renderFFTPolynomialCanvas } from '../../../../core/renderers/adapters/fft-polynomial-canvas-adapter';

export type { FFTStep };
export { buildFFTSteps };

export const fftPolynomialVisualizer = registerDeclarativeAlgorithm<FFTStep>({
  id: 'fft-polynomial-160',
  name: '快速傅里叶变换 FFT (Class 160)',
  aliases: ['class160-code01', 'fft-polynomial-160', 'fft'],
  category: 'math',
  icon: '⚡',
  difficulty: 3,
  levelOrder: 160,
  description: '左程云算法通关课 Class 160：快速傅里叶变换 (FFT)。Cooley-Tukey 蝶形运算与位逆序置换，O(N log N) 极速完成多项式卷积乘法。',
  learningGoal: '掌握复数单位根性质与雷德位逆序置换，深刻理解蝶形运算点值加速与 IDFT 逆变换还原原理',
  problemHtml: ADVANCED_155_160_PROBLEMS.fftPolynomial.html,
  analysisHtml: ADVANCED_155_160_PROBLEMS.fftPolynomial.html,
  inputs: [
    {
      id: 'preset',
      label: '多项式系数预设',
      type: 'select',
      defaultValue: 'poly_3x2',
      options: [
        { label: 'A=[1, 2, 3], B=[2, 1] (结果: [2, 5, 8, 3])', value: 'poly_3x2' },
        { label: 'A=[1, 1], B=[1, 1] (结果: [1, 2, 1])', value: 'poly_simple' },
      ],
    },
  ],
  codeLanguages: FFT_POLYNOMIAL_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'poly_3x2');
    if (preset === 'poly_simple') {
      return buildFFTSteps([1, 1], [1, 1]);
    }
    return buildFFTSteps([1, 2, 3], [2, 1]);
  },
  renderCanvas: renderFFTPolynomialCanvas,
});
