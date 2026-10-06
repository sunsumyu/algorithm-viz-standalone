/**
 * Class 109: 树状数组求逆序对数 (Inversion Count)
 * 洛谷 P1908
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_108_116_PROBLEMS } from './tree-108-116-problem-content';
import {
  FenwickInversionStep,
  discretize,
  buildFenwickInversionSteps,
  FENWICK_INVERSION_CODES,
} from '../../../../core/renderers/adapters/fenwick-inversion-step-compiler';
import { renderFenwickInversionCanvas } from '../../../../core/renderers/adapters/fenwick-inversion-canvas-adapter';

export type { FenwickInversionStep };
export { discretize, buildFenwickInversionSteps };

export const fenwickInversionVisualizer = registerDeclarativeAlgorithm<FenwickInversionStep>({
  id: 'fenwick-inversion-109',
  name: '树状数组求逆序对数 (Class 109)',
  aliases: ['class109-code01', 'fenwick-inversion', 'fenwick-inversion-109', 'inversion-pairs-bit'],
  category: 'tree',
  icon: '🔄',
  difficulty: 2,
  levelOrder: 109,
  learningGoal: '掌握离散化 rank 映射与倒序扫描利用树状数组动态统计逆序对数的经典算法',
  problemHtml: TREE_108_116_PROBLEMS.fenwickInversion.html,
  analysisHtml: TREE_108_116_PROBLEMS.fenwickInversion.html,
  inputs: [
    {
      id: 'nums',
      label: '待统计数组 (逗号分隔)',
      type: 'text',
      defaultValue: '5,4,2,6,3,1',
      placeholder: '请输入测试数组',
    },
  ],
  codeLanguages: FENWICK_INVERSION_CODES,
  generateSteps: (input) => {
    const nums = String(input.nums || '5,4,2,6,3,1').split(',').map(Number).filter(n => !isNaN(n));
    return buildFenwickInversionSteps(nums);
  },
  renderCanvas: (container, step) => {
    renderFenwickInversionCanvas(container, step);
  },
});
