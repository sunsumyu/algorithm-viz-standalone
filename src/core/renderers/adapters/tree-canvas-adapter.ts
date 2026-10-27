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
  dimUnvisited?: boolean;
  nullProbe?: { parentVal: number | string; branch: 'left' | 'right' };
  initialDepth?: number;
  height?: string;
  viewBoxHeight?: number;
  tightViewBox?: boolean;
  stackFrames?: {
    depth: number;
    nodeVal: number | null;
    funcCall: string;
    branch?: string;
    isCurrent?: boolean;
  }[];
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
      dimUnvisited,
      nullProbe,
      initialDepth,
      height,
      viewBoxHeight,
      tightViewBox,
      stackFrames,
    } = state;

    const primarySet = new Set<number | string>(highlightedNodes);
    if (activeNodeId != null) primarySet.add(activeNodeId);
    if (current != null && activeNodeId == null) primarySet.add(current);

    const secondarySet = new Set<number | string>(secondaryHighlightedNodes);
    if (secondaryNodeId != null) secondarySet.add(secondaryNodeId);
    if (nullProbe && nullProbe.parentVal != null && primarySet.size === 0) {
      secondarySet.add(nullProbe.parentVal);
    }

    const visitedSet = new Set<number | string>(visitedNodes);

    // 🚨 画布防断电兜底卫士 (Zero Visual Blackout Guard)
    // 当非空树渲染时没有任何节点被高亮时，自动将根节点或探针父节点注入次级焦点，杜绝画布 100% 死灰断电
    if (tree && primarySet.size === 0 && secondarySet.size === 0 && visitedSet.size === 0) {
      if (nullProbe && nullProbe.parentVal != null) {
        secondarySet.add(nullProbe.parentVal);
      } else if (tree.val != null) {
        secondarySet.add(tree.val);
      }
    }

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
      {
        dimUnvisited,
        nullProbe,
        initialDepth,
        height,
        viewBoxHeight,
        tightViewBox,
        stackFrames,
      },
    );
  }
}
