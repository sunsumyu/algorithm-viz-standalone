/**
 * Class 139: 扩展欧几里得算法 (Extended GCD / ExGCD)
 * 洛谷 P1082 同余方程 / Bézout 定理
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_134_140_PROBLEMS } from './advanced-134-140-problem-content';
import { EXGCD_CODES } from './advanced-134-140-stage-codes';
import {
  ExgcdFrame,
  ExgcdStep,
  buildExgcdSteps,
} from '../../../../core/renderers/adapters/exgcd-step-compiler';
import { renderExgcdCanvas } from '../../../../core/renderers/adapters/exgcd-canvas-adapter';

export type { ExgcdFrame, ExgcdStep };
export { buildExgcdSteps };

export const exgcdVisualizer = registerDeclarativeAlgorithm<ExgcdStep>({
  id: 'exgcd-139',
  name: '扩展欧几里得算法 (Class 139)',
  aliases: ['class139-code01', 'exgcd', 'exgcd-139', 'extended-euclidean'],
  category: 'math',
  icon: '🤝',
  difficulty: 2,
  levelOrder: 139,
  learningGoal: '深刻理解辗转相除递归深入与利用 x = y\', y = x\' - floor(a/b)*y\' 逐层回溯构建裴蜀等式解的数学原理',
  problemHtml: ADVANCED_134_140_PROBLEMS.exgcd.html,
  analysisHtml: ADVANCED_134_140_PROBLEMS.exgcd.html,
  inputs: [
    {
      id: 'a',
      label: '系数 a',
      type: 'number',
      defaultValue: 47,
      min: 1,
      max: 1000,
    },
    {
      id: 'b',
      label: '系数 b',
      type: 'number',
      defaultValue: 30,
      min: 0,
      max: 1000,
    },
  ],
  codeLanguages: EXGCD_CODES,
  generateSteps: (input) => {
    const a = Math.max(1, Number(input.a) || 47);
    const b = Math.max(0, Number(input.b) || 30);
    return buildExgcdSteps(a, b);
  },
  renderCanvas: (container, step) => {
    renderExgcdCanvas(container, step);
  },
});
