/**
 * 最长连续序列 (Longest Consecutive Sequence)
 * LeetCode 128
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  LongestConsecutiveStep,
  LONGEST_CONSECUTIVE_CODES,
  buildLongestConsecutiveSteps,
} from './longest-consecutive-sequence-step-compiler';
import { renderLongestConsecutiveCanvas } from './longest-consecutive-sequence-canvas-adapter';

export type { LongestConsecutiveStep };
export {
  LONGEST_CONSECUTIVE_CODES,
  buildLongestConsecutiveSteps,
  renderLongestConsecutiveCanvas,
};

registerDeclarativeAlgorithm({
  id: 'longest-consecutive-sequence',
  aliases: ['128', 'leetcode-128', 'longest-consecutive'],
  hasDeductionTree: true,
  name: '最长连续序列',
  category: 'hash-table',
  difficulty: 2,
  learningGoal: 'LeetCode 128: 在未排序数组中以 O(N) 时间找出数字连续的最长序列长度。利用哈希表高效跳过非起点数字，达成真正线性复杂度。',
  codeLanguages: LONGEST_CONSECUTIVE_CODES,
  generateSteps: (inputs) => {
    const raw = inputs?.nums as string | number[] | undefined;
    let arr = [100, 4, 200, 1, 3, 2];
    if (typeof raw === 'string') {
      try {
        arr = raw.split(/[,，\s]+/).filter(Boolean).map(Number);
      } catch {
        arr = [100, 4, 200, 1, 3, 2];
      }
    } else if (Array.isArray(raw) && raw.length > 0) {
      arr = raw.map(Number);
    }
    return buildLongestConsecutiveSteps(arr);
  },
  renderCanvas: (container: HTMLElement, step: LongestConsecutiveStep) => {
    renderLongestConsecutiveCanvas(container, step);
  },
  inputs: [
    {
      id: 'nums',
      label: '整数序列',
      type: 'text',
      defaultValue: '100, 4, 200, 1, 3, 2',
      placeholder: '用逗号分隔的整数序列',
    },
  ],
});
