/**
 * 和为 K 的子数组 (Subarray Sum Equals K)
 * LeetCode 560
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  SubarraySumStep,
  SUBARRAY_SUM_CODES,
  buildSubarraySumSteps,
} from './subarray-sum-equals-k-step-compiler';
import { renderSubarraySumCanvas } from './subarray-sum-equals-k-canvas-adapter';

export type { SubarraySumStep };
export { SUBARRAY_SUM_CODES, buildSubarraySumSteps, renderSubarraySumCanvas };

registerDeclarativeAlgorithm({
  id: 'subarray-sum-equals-k',
  name: '和为 K 的子数组',
  category: 'hash-table',
  difficulty: 2,
  learningGoal: 'LeetCode 560: 统计连续子数组和等于 k 的个数。利用前缀和移项与哈希表频次统计，将 O(N^2) 暴力枚举优化为 O(N) 线性推演。',
  codeLanguages: SUBARRAY_SUM_CODES,
  generateSteps: (inputs) => {
    const raw = inputs?.nums as string | number[] | undefined;
    const rawK = Number(inputs?.k ?? 3);
    let arr = [1, 2, 3, -2, 1, 4];
    if (typeof raw === 'string') {
      try {
        arr = raw.split(/[,，\s]+/).filter(Boolean).map(Number);
      } catch {
        arr = [1, 2, 3, -2, 1, 4];
      }
    } else if (Array.isArray(raw) && raw.length > 0) {
      arr = raw.map(Number);
    }
    return buildSubarraySumSteps(arr, isNaN(rawK) ? 3 : rawK);
  },
  renderCanvas: (container: HTMLElement, step: SubarraySumStep) => {
    renderSubarraySumCanvas(container, step);
  },
  inputs: [
    {
      id: 'nums',
      label: '输入整数数组',
      type: 'text',
      defaultValue: '1, 2, 3, -2, 1, 4',
      placeholder: '逗号分隔整数',
    },
    {
      id: 'k',
      label: '目标和 k',
      type: 'number',
      defaultValue: 3,
      placeholder: '目标和',
    },
  ],
});
