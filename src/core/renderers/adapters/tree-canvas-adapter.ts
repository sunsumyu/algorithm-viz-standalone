/**
 * 树拓扑画板适配器 (TreeCanvasAdapter)
 * 封装二叉树 / BST 层次 SVG 投影、节点高亮与递归路径追踪
 * 遵循 Zero-Subbox 规范，直接在浅灰画布上居中渲染 SVG
 */

import { TreeNode, renderTreeSVG } from '../../../algorithms/categories/tree/tree-template';

export interface TreeCanvasState {
  tree: TreeNode | null;
  current: number | null;
  highlightedNodes?: number[];
  secondaryHighlightedNodes?: number[];
  primaryColor?: string;
  secondaryColor?: string;
}

export class TreeCanvasAdapter {
  /**
   * 渲染 SVG 二叉树拓扑结构
   */
  public static renderTree(container: HTMLElement, state: TreeCanvasState): void {
    const {
      tree,
      current,
      highlightedNodes = [],
      secondaryHighlightedNodes = [],
      primaryColor = '#fbbf24',
      secondaryColor = '#34d399',
    } = state;

    const primarySet = new Set<number>(highlightedNodes);
    if (current != null) primarySet.add(current);

    const secondarySet = new Set<number>(secondaryHighlightedNodes);

    // 清空并挂载 SVG 容器
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';

    renderTreeSVG(container, tree, primarySet, primaryColor, secondarySet, secondaryColor);
  }
}
