/**
 * 组合总和 II 可视化器（回溯决策树版本）
 * Canvas Adapter
 */

import {
  BacktrackTreeStep,
  renderBacktrackTree,
} from './backtracking-tree-helper';

export function renderCombinationSumIiCanvas(container: HTMLElement, step: BacktrackTreeStep): void {
  renderBacktrackTree({
    container,
    step,
    cssPrefix: 'cs2',
    nodeLabel: (nd) => (nd.id === 'root' ? '[]' : nd.value),
  });
}
