/**
 * Class 162: 多项式求逆 (Polynomial Inverse)
 * 牛顿迭代法倍增求逆 / 洛谷 P4238 【模板】多项式乘法逆
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_161_166_PROBLEMS } from './advanced-161-166-problem-content';
import { POLYNOMIAL_INVERSE_CODES } from './advanced-161-166-stage-codes';
import { PolyInvStep, buildPolyInvSteps } from '../../../../core/renderers/adapters/polynomial-inverse-step-compiler';
import { renderPolynomialInverseCanvas } from '../../../../core/renderers/adapters/polynomial-inverse-canvas-adapter';

export type { PolyInvStep };
export { buildPolyInvSteps };

export const polynomialInverseVisualizer = registerDeclarativeAlgorithm<PolyInvStep>({
  id: 'polynomial-inverse-162',
  name: '多项式求逆 (Class 162)',
  aliases: ['class162-code01', 'polynomial-inverse-162', 'poly-inverse'],
  category: 'math',
  icon: '🔄',
  difficulty: 3,
  levelOrder: 162,
  description: '左程云算法通关课 Class 162：多项式求逆。利用牛顿迭代法倍增递推 B = B0(2 - A*B0) mod x^n，O(n log n) 极速求得多项式乘法逆元。',
  learningGoal: '掌握牛顿迭代法推导多项式倍增逆元公式，理解二次收敛性质与高阶项清零截断技巧',
  problemHtml: ADVANCED_161_166_PROBLEMS.polynomialInverse.html,
  analysisHtml: ADVANCED_161_166_PROBLEMS.polynomialInverse.html,
  inputs: [
    {
      id: 'preset',
      label: '输入多项式与截断项数',
      type: 'select',
      defaultValue: 'deg_4',
      options: [
        { label: 'A=[1, 2, 3, 4], deg=4 (标准 4 次界求逆)', value: 'deg_4' },
        { label: 'A=[1, 1, 1], deg=3 (1/(1-x) 展开逆元)', value: 'deg_3' },
      ],
    },
  ],
  codeLanguages: POLYNOMIAL_INVERSE_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'deg_4');
    if (preset === 'deg_3') return buildPolyInvSteps([1, 1, 1], 3);
    return buildPolyInvSteps([1, 2, 3, 4], 4);
  },
  renderCanvas: renderPolynomialInverseCanvas,
});
