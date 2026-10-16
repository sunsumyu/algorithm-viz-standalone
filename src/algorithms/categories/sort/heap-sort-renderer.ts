/**
 * 堆排序可视化器 — 声明式 4-Card 标准架构
 * 大顶堆构建、堆顶元素提取、Sift-Down 下沉调整
 * 统一收敛至单一事实来源：src/algorithms/categories/tree/heap-039-042/heap-sort-040-renderer
 */

import { heapSort040Visualizer } from '../tree/heap-039-042/heap-sort-040-renderer';
import {
  HSStep,
  heapSortSteps,
  withMetrics,
} from './heap-sort-step-compiler';
import { renderHeapSortCanvas } from './heap-sort-canvas-adapter';

export type { HSStep };
export { heapSortSteps, withMetrics, renderHeapSortCanvas };

/**
 * 桥接导出已统合的唯一事实来源 Visualizer
 */
export const heapSortVisualizer = heapSort040Visualizer;
