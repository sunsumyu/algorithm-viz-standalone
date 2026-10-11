import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  ShuffleArrayStep,
  SHUFFLE_CODES,
  buildShuffleSteps,
} from './shuffle-an-array-step-compiler';
import { renderShuffleCanvas } from './shuffle-an-array-canvas-adapter';

export type { ShuffleArrayStep };
export { SHUFFLE_CODES, buildShuffleSteps, renderShuffleCanvas };

registerDeclarativeAlgorithm({
  id: 'shuffle-an-array',
  name: '打乱数组',
  category: 'array',
  learningGoal: '理解现代 Fisher-Yates (Knuth) 洗牌算法在 O(N) 复杂度下实现真等概率随机置乱的数学原理',
  inputs: [
    {
      id: 'nums',
      label: '输入数组',
      type: 'text',
      defaultValue: '1, 2, 3, 4, 5, 6',
      placeholder: '逗号分隔数字，如 1, 2, 3, 4, 5, 6',
    },
  ],
  codeLanguages: SHUFFLE_CODES,
  generateSteps: (inputs) => {
    const raw = String(inputs.nums || '1, 2, 3, 4, 5, 6');
    const nums = raw.split(/[,，\s]+/).filter(Boolean).map(Number).filter((n) => !isNaN(n));
    return buildShuffleSteps(nums.length ? nums : [1, 2, 3, 4, 5, 6]);
  },
  renderCanvas: (container, step) => {
    renderShuffleCanvas(container, step as ShuffleArrayStep);
  },
});
