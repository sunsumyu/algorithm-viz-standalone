/**
 * 组合（优化）可视化器（回溯）
 * Canvas Adapter
 */

import {
  BacktrackTreeStep,
  renderBacktrackTree,
} from './backtracking-tree-helper';

export function renderCombinationOptimizedCanvas(container: HTMLElement, step: BacktrackTreeStep): void {
  renderBacktrackTree({
    container,
    step,
    cssPrefix: 'co',
  });
}
