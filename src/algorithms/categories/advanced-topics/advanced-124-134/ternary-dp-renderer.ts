/**
 * Class 126: 三进制状压 DP (Ternary State Compression DP)
 * POJ 2151 / 洛谷 P2704 变体
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_124_134_PROBLEMS } from './advanced-124-134-problem-content';
import { TERNARY_DP_CODES } from './advanced-124-134-stage-codes';
import {
  TernaryDpStep,
  buildTernaryDpSteps,
} from '../../../../core/renderers/adapters/ternary-dp-step-compiler';
import { renderTernaryDpCanvas } from '../../../../core/renderers/adapters/ternary-dp-canvas-adapter';

export type { TernaryDpStep };
export { buildTernaryDpSteps, renderTernaryDpCanvas };

export const ternaryDpVisualizer = registerDeclarativeAlgorithm<TernaryDpStep>({
  id: 'ternary-dp-126',
  name: '三进制状压 DP (Class 126)',
  aliases: ['class126-code01', 'ternary-dp', 'ternary-dp-126', 'ternary-state-compression'],
  category: 'dynamic-programming',
  icon: '🔺',
  difficulty: 3,
  levelOrder: 126,
  learningGoal: '掌握三进制状态表示法解决跨步长多层约束问题，理解 3^M 状态空间设计与衰减转移',
  problemHtml: ADVANCED_124_134_PROBLEMS.ternaryDp.html,
  analysisHtml: ADVANCED_124_134_PROBLEMS.ternaryDp.html,
  inputs: [
    {
      id: 'n',
      label: '网格行数 N',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 5,
    },
    {
      id: 'm',
      label: '网格列数 M',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 4,
    },
  ],
  codeLanguages: TERNARY_DP_CODES,
  generateSteps: (input) => {
    const n = Math.min(5, Math.max(1, Number(input.n) || 3));
    const m = Math.min(4, Math.max(1, Number(input.m) || 3));
    return buildTernaryDpSteps(n, m);
  },
  renderCanvas: (container, step) => {
    renderTernaryDpCanvas(container, step);
  },
});
