/**
 * 归并排序可视化器 — 声明式 4-Card 标准架构
 * 递归分治、双指针归并、临时缓冲区与写回
 * 统一收敛至单一事实来源：src/algorithms/categories/sort/sort-043-046/merge-sort-043-renderer
 */

import { mergeSort043Visualizer } from './sort-043-046/merge-sort-043-renderer';
import {
  MSStep,
  mergeSortSteps,
  withMetrics,
} from './merge-sort-step-compiler';
import { renderMergeSortCanvas } from './merge-sort-canvas-adapter';

export type { MSStep };
export { mergeSortSteps, withMetrics, renderMergeSortCanvas };

/**
 * 桥接导出已统合的唯一事实来源 Visualizer
 */
export const mergeSortVisualizer = mergeSort043Visualizer;
