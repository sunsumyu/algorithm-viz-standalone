import type { HighlightTarget } from '../../../core/code-panel';
import type { StepVar } from '../../../core/interfaces';

export interface BacktrackTreeNode {
  id: string;
  value: string;
  path: (number | string)[];
  children: BacktrackTreeNode[];
  isLeaf: boolean;
  isPruned: boolean;
  isDirectPrune?: boolean;
  parentId: string | null;
  depth: number;
  /** layout coords, computed after layout */
  x?: number;
  y?: number;
}

export interface BacktrackTreeStep {
  nodes: BacktrackTreeNode[];
  currentNodeId: string;
  visitedNodeIds: string[];
  foundPathIds: string[];
  prunedNodeIds: string[];
  path: (number | string)[];
  message: string;
  codeLine: HighlightTarget;
  /** Extra stats to display (key-value pairs) */
  stats?: Record<string, string | number>;
  /** 变量快照，用于变量监视面板 */
  vars?: StepVar[];
}

export interface TreeLayoutOptions {
  horizontalGap?: number;
  levelHeight?: number;
  topPadding?: number;
}

export interface TreeBoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  vMinX: number;
  vMinY: number;
  vWidth: number;
  vHeight: number;
}

export const LEVEL_HEIGHT = 110;
export const NODE_RADIUS = 20;
export const HORIZONTAL_GAP = 75;

/**
 * 树形决策空间布局引擎 (TreeLayoutEngine) - 深模块 (Deep Module)
 * 纯算法数学推导模块，0 DOM 依赖，负责 N 叉树节点的紧凑层次布局与坐标计算。
 */
export class TreeLayoutEngine {
  /**
   * 递归展平整棵树为一维节点数组
   */
  public static flatten(root: BacktrackTreeNode): BacktrackTreeNode[] {
    const list: BacktrackTreeNode[] = [];
    function walk(n: BacktrackTreeNode) {
      list.push(n);
      n.children.forEach(walk);
    }
    walk(root);
    return list;
  }

  /**
   * 计算整棵决策树所有节点的二维 (x, y) 像素坐标
   */
  public static layout(root: BacktrackTreeNode, options?: TreeLayoutOptions): void {
    const gap = options?.horizontalGap ?? HORIZONTAL_GAP;
    const levelH = options?.levelHeight ?? LEVEL_HEIGHT;
    const topPad = options?.topPadding ?? 40;

    function assignWidth(n: BacktrackTreeNode): number {
      if (n.children.length === 0) {
        (n as BacktrackTreeNode & { _sw: number })._sw = gap;
        return gap;
      }
      let total = 0;
      n.children.forEach((c) => {
        total += assignWidth(c);
      });
      total = Math.max(total, gap);
      (n as BacktrackTreeNode & { _sw: number })._sw = total;
      return total;
    }

    function position(n: BacktrackTreeNode, left: number): void {
      const sw = (n as BacktrackTreeNode & { _sw: number })._sw || gap;
      n.x = left + sw / 2;
      n.y = n.depth * levelH + topPad;

      let cur = left;
      n.children.forEach((c) => {
        position(c, cur);
        cur += (c as BacktrackTreeNode & { _sw: number })._sw || gap;
      });
    }

    assignWidth(root);
    position(root, 0);

    function cleanup(n: BacktrackTreeNode) {
      delete (n as BacktrackTreeNode & { _sw?: number })._sw;
      n.children.forEach(cleanup);
    }
    cleanup(root);
  }

  /**
   * 检查指定节点是否位于从 currentNodeId 溯源到根节点的路径上
   */
  public static isNodeOnPath(
    nodeId: string,
    nodeMap: Map<string, BacktrackTreeNode>,
    currentNodeId: string
  ): boolean {
    if (nodeId === currentNodeId) return true;
    let cur: string | null = currentNodeId;
    while (cur) {
      if (cur === nodeId) return true;
      const p = nodeMap.get(cur);
      cur = p?.parentId ?? null;
    }
    return false;
  }

  /**
   * 计算节点几何外接包围盒及 SVG viewBox 尺寸
   */
  public static computeBounds(
    nodes: BacktrackTreeNode[],
    padX: number = 60,
    padY: number = 60,
    nodeRadius: number = NODE_RADIUS
  ): TreeBoundingBox {
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    nodes.forEach((nd) => {
      const x = nd.x ?? 0;
      const y = nd.y ?? 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });

    if (nodes.length === 0) {
      minX = 0;
      maxX = 0;
      minY = 0;
      maxY = 0;
    }

    const width = maxX - minX;
    const height = maxY - minY;
    const vMinX = minX - nodeRadius - padX;
    const vMinY = minY - nodeRadius - padY;
    const vWidth = width + (nodeRadius + padX) * 2;
    const vHeight = height + (nodeRadius + padY) * 2;

    return {
      minX,
      maxX,
      minY,
      maxY,
      width,
      height,
      vMinX,
      vMinY,
      vWidth,
      vHeight
    };
  }
}
