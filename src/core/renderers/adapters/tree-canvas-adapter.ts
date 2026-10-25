/**
 * 树拓扑画板适配器 (TreeCanvasAdapter)
 * 封装二叉树 / BST 层次 SVG 投影、节点高亮与递归路径追踪
 * 遵循 Zero-Subbox 规范，直接在浅灰画布上居中渲染 SVG
 */

import { TreeNode, renderTreeSVG } from '../tree-svg';

export interface TreeCanvasState {
  tree: TreeNode | null;
  current?: number | string | null;
  activeNodeId?: number | string | null;
  secondaryNodeId?: number | string | null;
  highlightedNodes?: (number | string)[];
  secondaryHighlightedNodes?: (number | string)[];
  visitedNodes?: (number | string)[];
  primaryColor?: string;
  secondaryColor?: string;
  visitedColor?: string;
  labels?: Map<number | string, string>;
}

export class TreeCanvasAdapter {
  /**
   * 渲染 SVG 二叉树拓扑结构
   */
  public static renderTree(container: HTMLElement, state: TreeCanvasState): void {
    const {
      tree,
      current,
      activeNodeId,
      secondaryNodeId,
      highlightedNodes = [],
      secondaryHighlightedNodes = [],
      visitedNodes = [],
      primaryColor = '#fbbf24',
      secondaryColor = '#60a5fa',
      visitedColor = '#34d399',
      labels,
    } = state;

    const primarySet = new Set<number | string>(highlightedNodes);
    if (activeNodeId != null) primarySet.add(activeNodeId);
    if (current != null && activeNodeId == null) primarySet.add(current);

    const secondarySet = new Set<number | string>(secondaryHighlightedNodes);
    if (secondaryNodeId != null) secondarySet.add(secondaryNodeId);

    const visitedSet = new Set<number | string>(visitedNodes);

    // 清空并挂载 SVG 容器
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';

    renderTreeSVG(
      container,
      tree,
      primarySet,
      primaryColor,
      secondarySet,
      secondaryColor,
      labels,
      visitedSet,
      visitedColor,
    );
  }
}
