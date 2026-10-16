/**
 * 快速排序可视化器 — 声明式 4-Card 标准架构
 * 递归分治、双指针 Partition、基准值精准归位
 * 统一收敛至单一事实来源：src/algorithms/categories/sort/sort-043-046/quick-sort-dutch-flag-045-renderer
 */

import { quickSortDutchFlag045Visualizer } from './sort-043-046/quick-sort-dutch-flag-045-renderer';
import {
  QSStep,
  quickSortSteps,
  withMetrics,
} from './quick-sort-step-compiler';
import { renderQuickSortCanvas } from './quick-sort-canvas-adapter';

export type { QSStep };
export { quickSortSteps, withMetrics, renderQuickSortCanvas };

/**
 * 桥接导出已统合的唯一事实来源 Visualizer
 */
export const quickSortVisualizer = quickSortDutchFlag045Visualizer;
