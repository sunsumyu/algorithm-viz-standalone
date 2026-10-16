/**
 * Class 022: 归并排序与小和问题 (MergeSort Small Sum)
 * 左程云算法通关课入门篇 Class 022
 * 分治合并单调性加速：利用归并合并阶段的左右有序性，在 O(N log N) 内求出全局小和
 * 统一收敛至单一事实来源：src/algorithms/categories/sort/sort-043-046/small-sum-merge-044-renderer
 */

import { smallSumMerge044Visualizer } from './sort-043-046/small-sum-merge-044-renderer';
import {
  SmallSumStep,
  MERGE_SORT_SMALL_SUM_CODES,
  generateSmallSumSteps,
} from './merge-sort-small-sum-022-step-compiler';
import { renderSmallSumCanvas } from './merge-sort-small-sum-022-canvas-adapter';

export type { SmallSumStep };
export {
  MERGE_SORT_SMALL_SUM_CODES,
  generateSmallSumSteps,
  renderSmallSumCanvas,
};

/**
 * 桥接导出已统合的唯一事实来源 Visualizer
 */
export const mergeSortSmallSum022Visualizer = smallSumMerge044Visualizer;
