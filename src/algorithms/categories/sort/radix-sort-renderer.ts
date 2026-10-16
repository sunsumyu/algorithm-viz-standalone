/**
 * 基数排序可视化器 — 声明式 4-Card 标准架构
 * LSD 低位优先、按位计数统计与稳定回填
 * 统一收敛至单一事实来源：src/algorithms/categories/sort/radix-sort-028-renderer
 */

import { radixSort028Visualizer } from './radix-sort-028-renderer';
import {
  RadixStep,
  radixSortSteps,
  withMetrics,
} from './radix-sort-step-compiler';
import { renderRadixSortCanvas } from './radix-sort-canvas-adapter';

export type { RadixStep };
export { radixSortSteps, withMetrics, renderRadixSortCanvas };

/**
 * 桥接导出已统合的唯一事实来源 Visualizer
 */
export const radixSortVisualizer = radixSort028Visualizer;
