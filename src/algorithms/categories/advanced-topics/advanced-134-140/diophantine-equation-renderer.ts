/**
 * Class 140: 二元一次不定方程 (Diophantine Equation)
 * 洛谷 P5656 【模板】二元一次不定方程 (exgcd)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_134_140_PROBLEMS } from './advanced-134-140-problem-content';
import { DIOPHANTINE_CODES } from './advanced-134-140-stage-codes';
import {
  DiophantineStep,
  buildDiophantineSteps,
} from '../../../../core/renderers/adapters/diophantine-equation-step-compiler';
import { renderDiophantineEquationCanvas } from '../../../../core/renderers/adapters/diophantine-equation-canvas-adapter';

export type { DiophantineStep };
export { buildDiophantineSteps };

export const diophantineVisualizer = registerDeclarativeAlgorithm<DiophantineStep>({
  id: 'diophantine-equation-140',
  name: '二元一次不定方程 (Class 140)',
  aliases: ['class140-code01', 'diophantine-equation', 'diophantine-equation-140', 'linear-diophantine'],
  category: 'math',
  icon: '⚖️',
  difficulty: 2,
  levelOrder: 140,
  learningGoal: '掌握二元一次不定方程 ax + by = c 的裴蜀定理无解判定、特解放大与利用周期 dx 模化求最小正整数解机制',
  problemHtml: ADVANCED_134_140_PROBLEMS.diophantineEquation.html,
  analysisHtml: ADVANCED_134_140_PROBLEMS.diophantineEquation.html,
  inputs: [
    {
      id: 'a',
      label: '系数 a',
      type: 'number',
      defaultValue: 24,
      min: 1,
      max: 1000,
    },
    {
      id: 'b',
      label: '系数 b',
      type: 'number',
      defaultValue: 15,
      min: 1,
      max: 1000,
    },
    {
      id: 'c',
      label: '常数 c',
      type: 'number',
      defaultValue: 18,
      min: 1,
      max: 1000,
    },
  ],
  codeLanguages: DIOPHANTINE_CODES,
  generateSteps: (input) => {
    const a = Math.max(1, Number(input.a) || 24);
    const b = Math.max(1, Number(input.b) || 15);
    const c = Math.max(1, Number(input.c) || 18);
    return buildDiophantineSteps(a, b, c);
  },
  renderCanvas: (container, step) => {
    renderDiophantineEquationCanvas(container, step);
  },
});
