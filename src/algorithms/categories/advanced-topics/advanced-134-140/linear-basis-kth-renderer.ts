/**
 * Class 137: 线性基重构与第 K 小异或和 (Linear Basis - Kth XOR)
 * HDU 3949 / 洛谷 P3857 彩灯
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_134_140_PROBLEMS } from './advanced-134-140-problem-content';
import { LINEAR_BASIS_KTH_CODES } from './advanced-134-140-stage-codes';
import {
  LinearBasisKthStep,
  buildLinearBasisKthSteps,
} from '../../../../core/renderers/adapters/linear-basis-kth-step-compiler';
import { renderLinearBasisKthCanvas } from '../../../../core/renderers/adapters/linear-basis-kth-canvas-adapter';

export type { LinearBasisKthStep };
export { buildLinearBasisKthSteps };

export const linearBasisKthVisualizer = registerDeclarativeAlgorithm<LinearBasisKthStep>({
  id: 'linear-basis-kth-137',
  name: '线性基第 K 小异或和 (Class 137)',
  aliases: ['class137-code01', 'linear-basis-kth', 'linear-basis-kth-137', 'kth-xor-basis'],
  category: 'math',
  icon: '🎚️',
  difficulty: 3,
  levelOrder: 137,
  learningGoal: '深刻理解线性基高位消低位正交化重构、紧凑基底数组收集与利用 K 的二进制拆分求解第 K 小异或和原理',
  problemHtml: ADVANCED_134_140_PROBLEMS.linearBasisKth.html,
  analysisHtml: ADVANCED_134_140_PROBLEMS.linearBasisKth.html,
  inputs: [
    {
      id: 'numList',
      label: '输入整数集合 (逗号分隔)',
      type: 'text',
      defaultValue: '3,5,6',
      placeholder: '请输入正整数',
    },
    {
      id: 'k',
      label: '目标第 K 小 (K >= 1)',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 100,
    },
  ],
  codeLanguages: LINEAR_BASIS_KTH_CODES,
  generateSteps: (input) => {
    const raw = String(input.numList || '3,5,6');
    const nums = raw.split(',').map(Number).filter(n => !isNaN(n) && n > 0);
    const k = Math.max(1, Number(input.k) || 3);
    return buildLinearBasisKthSteps(nums.length > 0 ? nums : [3, 5, 6], k);
  },
  renderCanvas: (container, step) => {
    renderLinearBasisKthCanvas(container, step);
  },
});
