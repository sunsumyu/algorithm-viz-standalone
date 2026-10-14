/**
 * Class 171: 多项式开方 (Polynomial Sqrt)
 * 牛顿迭代法倍增开方 / 洛谷 P5205 【模板】多项式开方
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_167_172_PROBLEMS } from './advanced-167-172-problem-content';
import { POLYNOMIAL_SQRT_CODES } from './advanced-167-172-stage-codes';
import { buildPolySqrtSteps, PolySqrtStep } from '../../../../core/renderers/adapters/polynomial-sqrt-step-compiler';
import { renderPolySqrtCanvas } from '../../../../core/renderers/adapters/polynomial-sqrt-canvas-adapter';

export { buildPolySqrtSteps, type PolySqrtStep };

export const polynomialSqrtVisualizer = registerDeclarativeAlgorithm<PolySqrtStep>({
  id: 'polynomial-sqrt-171',
  name: '多项式开方 (Class 171)',
  aliases: ['class171-code01', 'polynomial-sqrt-171', 'poly-sqrt'],
  category: 'math',
  icon: '√',
  difficulty: 3,
  levelOrder: 171,
  description: '左程云算法通关课 Class 171：多项式开方。利用牛顿迭代法倍增推导 B = (B0 + A/B0)/2 mod x^n，结合多项式求逆，O(n log n) 极速求出平方根多项式。',
  learningGoal: '掌握牛顿迭代法在多项式二次开方方程 F(B) = B^2 - A = 0 上的展开应用，深刻理解精度倍增机制',
  problemHtml: ADVANCED_167_172_PROBLEMS.polynomialSqrt.html,
  analysisHtml: ADVANCED_167_172_PROBLEMS.polynomialSqrt.html,
  presets: [
    { label: 'A=[1, 2, 1], deg=3 ((1+x)^2 完美开方为 [1, 1, 0])', values: { preset: 'sqrt_quad' } },
    { label: 'A=[1, 4, 4], deg=3 ((1+2x)^2 完美开方为 [1, 2, 0])', values: { preset: 'sqrt_quad2' } },
    { label: 'A=[1, 1, 1], deg=4 (1/(1-x) 展开开方示例)', values: { preset: 'sqrt_geom' } },
  ],
  codeLanguages: POLYNOMIAL_SQRT_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'sqrt_quad');
    if (preset === 'sqrt_quad2') return buildPolySqrtSteps([1, 4, 4], 3);
    if (preset === 'sqrt_geom') return buildPolySqrtSteps([1, 1, 1, 0], 4);
    return buildPolySqrtSteps([1, 2, 1], 3);
  },
  renderCanvas: (container, step) => renderPolySqrtCanvas(container, step),
});
