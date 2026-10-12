/**
 * 全排列画布适配器
 * 负责渲染决策树沙盘
 */

import { BacktrackTreeStep, renderBacktrackTree } from './backtracking-tree-helper';

/** 主视觉：SVG 决策树沙盘（backtracking-tree-helper 自注入样式） */
export function renderPermutationCanvas(container: HTMLElement, step: BacktrackTreeStep): void {
  renderBacktrackTree({
    container,
    step,
    cssPrefix: 'pm',
    nodeLabel: (nd) => (nd.id === 'root' ? '[]' : nd.value),
  });
}
