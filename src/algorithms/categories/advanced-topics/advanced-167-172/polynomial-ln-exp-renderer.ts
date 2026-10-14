/**
 * Class 172: 多项式对数与指数 (Polynomial Ln & Exp)
 * ln A(x) = integral(A'/A) dx 与 exp 牛顿迭代 / 洛谷 P4725 / P4726
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_167_172_PROBLEMS } from './advanced-167-172-problem-content';
import { POLYNOMIAL_LN_EXP_CODES } from './advanced-167-172-stage-codes';
import { buildPolyLnExpSteps, PolyLnExpStep } from '../../../../core/renderers/adapters/polynomial-ln-exp-step-compiler';
import { renderPolyLnExpCanvas } from '../../../../core/renderers/adapters/polynomial-ln-exp-canvas-adapter';

export { buildPolyLnExpSteps, type PolyLnExpStep };

export const polynomialLnExpVisualizer = registerDeclarativeAlgorithm<PolyLnExpStep>({
  id: 'polynomial-ln-exp-172',
  name: '多项式对数与指数 ln/exp (Class 172)',
  aliases: ['class172-code01', 'polynomial-ln-exp-172', 'poly-ln-exp'],
  category: 'math',
  icon: '📈',
  difficulty: 3,
  levelOrder: 172,
  description: '左程云算法通关课 Class 172：多项式对数函数 ln 与指数函数 exp。ln A = integral(A\'/A) dx 与 exp 牛顿迭代倍增，组合生成函数巅峰利器。',
  learningGoal: '掌握微积分在形式幂级数上的映射规则，深刻理解 ln/exp 在无向连通图计数与有标号集合划分中的代数威力',
  problemHtml: ADVANCED_167_172_PROBLEMS.polynomialLnExp.html,
  analysisHtml: ADVANCED_167_172_PROBLEMS.polynomialLnExp.html,
  presets: [
    { label: 'A=[1, 1, 0, 0] (1+x, Taylor 展开 ln(1+x))', values: { preset: 'ln_exp_linear' } },
    { label: 'A=[1, 2, 1, 0] ((1+x)^2, 2*ln(1+x))', values: { preset: 'ln_exp_quad' } },
  ],
  codeLanguages: POLYNOMIAL_LN_EXP_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'ln_exp_linear');
    if (preset === 'ln_exp_quad') return buildPolyLnExpSteps([1, 2, 1, 0], 4);
    return buildPolyLnExpSteps([1, 1, 0, 0], 4);
  },
  renderCanvas: (container, step) => renderPolyLnExpCanvas(container, step),
});
