/**
 * Class 170: 多项式除法与取模 (Polynomial Division & Modulo)
 * 系数翻转消去余式 / 洛谷 P4512 【模板】多项式除法
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_167_172_PROBLEMS } from './advanced-167-172-problem-content';
import { POLYNOMIAL_DIVISION_CODES } from './advanced-167-172-stage-codes';
import { buildPolyDivSteps, PolyDivStep } from '../../../../core/renderers/adapters/polynomial-division-step-compiler';
import { renderPolyDivCanvas } from '../../../../core/renderers/adapters/polynomial-division-canvas-adapter';

export { buildPolyDivSteps, type PolyDivStep };

export const polynomialDivisionVisualizer = registerDeclarativeAlgorithm<PolyDivStep>({
  id: 'polynomial-division-170',
  name: '多项式除法与取模 (Class 170)',
  aliases: ['class170-code01', 'polynomial-division-170', 'poly-division'],
  category: 'math',
  icon: '➗',
  difficulty: 3,
  levelOrder: 170,
  description: '左程云算法通关课 Class 170：多项式除法与取模。通过代入 1/x 系数翻转消去余式，结合多项式求逆，O(n log n) 极速求出商式与余式。',
  learningGoal: '掌握反转系数消去未定余式项的核心代数手法，理解多项式求逆与回代相消求余全流程',
  problemHtml: ADVANCED_167_172_PROBLEMS.polynomialDivision.html,
  analysisHtml: ADVANCED_167_172_PROBLEMS.polynomialDivision.html,
  inputs: [
    {
      id: 'preset',
      label: '被除式与除式参数',
      type: 'select',
      defaultValue: 'div_cubic_linear',
      options: [
        { label: 'A=[4, 3, 2, 1] (x^3+2x^2+3x+4), B=[1, 1] (x+1) (商: x^2+x+2, 余: 2)', value: 'div_cubic_linear' },
        { label: 'A=[1, 2, 1], B=[1, 1] ((x+1)^2 / (x+1) 整除示例)', value: 'div_exact' },
      ],
    },
  ],
  codeLanguages: POLYNOMIAL_DIVISION_CODES,
  generateSteps: (input) => {
    const preset = String(input.preset || 'div_cubic_linear');
    if (preset === 'div_exact') return buildPolyDivSteps([1, 2, 1], [1, 1]);
    return buildPolyDivSteps([4, 3, 2, 1], [1, 1]);
  },
  renderCanvas: (container, step) => renderPolyDivCanvas(container, step),
});
