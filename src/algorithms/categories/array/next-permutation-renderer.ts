/**
 * 下一个排列 (Next Permutation)
 * LeetCode 31 (Medium / 大厂高频字典序与数组双指针经典)
 * 核心原语:
 *  寻找按字典序排列的下一个更大的全排列。基于从后向前的三步双指针反转法，在 O(N) 时间和 O(1) 原地空间内达成极值。
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  NextPermutationStep,
  NEXT_PERMUTATION_CODES,
  NEXT_PERMUTATION_CODE_LINES,
  buildNextPermutationSteps,
} from './next-permutation-step-compiler';
import {
  renderNextPermutationCanvas,
  renderNextPermutationAuxiliary,
} from './next-permutation-canvas-adapter';

export type { NextPermutationStep };
export {
  NEXT_PERMUTATION_CODES,
  NEXT_PERMUTATION_CODE_LINES,
  buildNextPermutationSteps,
};

registerDeclarativeAlgorithm<NextPermutationStep>({
  id: 'next-permutation',
  name: '下一个排列',
  category: 'array',
  difficulty: 2,
  learningGoal: 'LeetCode 31: 求解下一个更大字典序排列。基于从后向前的三步双指针反转法，在 O(N) 时间和 O(1) 原地空间内达成极值。',
  codeLanguages: NEXT_PERMUTATION_CODES,
  metrics: [
    { id: '拐点下标 i', label: '拐点下标 i', color: '#f59e0b' },
    { id: '交换下标 j', label: '交换下标 j', color: '#ec4899' },
    { id: '当前推演阶段', label: '当前推演阶段', color: '#0ea5e9' },
    { id: '重排状态', label: '重排状态', color: '#10b981' },
  ],
  generateSteps: (inputs) => {
    const raw = inputs?.nums as string | number[] | undefined;
    let arr = [1, 2, 7, 4, 3, 1];
    if (typeof raw === 'string') {
      try {
        arr = raw.split(/[,，\s]+/).filter(Boolean).map(Number);
      } catch {
        arr = [1, 2, 7, 4, 3, 1];
      }
    } else if (Array.isArray(raw) && raw.length > 0) {
      arr = raw.map(Number);
    }
    return buildNextPermutationSteps(arr);
  },
  renderCanvas: (container: HTMLElement, step: NextPermutationStep) => {
    renderNextPermutationCanvas(container, step);
  },
  auxiliaryVisual: {
    title: '字典序三步准则与状态空间',
    render: (container: HTMLElement, step: NextPermutationStep) => {
      renderNextPermutationAuxiliary(container, step);
    },
  },
  inputs: [
    {
      id: 'nums',
      label: '输入整数排列',
      type: 'text',
      defaultValue: '1, 2, 7, 4, 3, 1',
      placeholder: '逗号分隔序列',
    },
  ],
});
