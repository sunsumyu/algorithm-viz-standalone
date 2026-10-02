/**
 * 树算法批量渲染器 - Batch 7（声明式 4-Card 标准架构）
 * 包含: 最小深度、平衡二叉树、左叶子之和、二叉树所有路径、完全二叉树节点个数、找树左下角的值
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeNode, buildTreeFromArr, renderTreeSVG } from './tree-template';

// 引入左神 Class 036 & 037 综合版（单一事实来源，别名映射 balanced & count-nodes）
import './tree-036-037/balanced-binary-tree-037-renderer';
import './tree-036-037/count-complete-tree-nodes-036-renderer';

/** 通用：树层数组输入解析（空串按空树处理交给 buildTreeFromArr） */
/** 通用：树 SVG 主视觉（渲染深模块 renderTreeSVG） */
function renderTreeCanvas(
  container: HTMLElement,
  tree: TreeNode | null,
  highlight: Set<number>,
  primaryColor: string,
  secondary?: Set<number>,
  secondaryColor?: string,
): void {
  container.innerHTML = '';
  container.style.width = '100%';
  container.style.height = '100%';
  renderTreeSVG(container, tree, highlight, primaryColor, secondary, secondaryColor);
}

// 引入最小深度多阶段演进版（单一事实来源，别名映射 min-depth）
import './min-depth-renderer';
export { buildMinDepthSteps, type MinDepthStep } from './min-depth-renderer';


/* ═══════════════════ Level 12: 平衡二叉树 ═══════════════════ */

interface BalancedStep {
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  height: number | null;
  balanced: boolean | null;
  message: string;
  log: string;
  codeLine?: number | number[];
  metrics?: Record<string, string>;
}

function buildBalancedSteps(root: TreeNode | null): BalancedStep[] {
  const steps: BalancedStep[] = [];
  let isBalanced = true;

  steps.push({
    tree: root, current: null, depth: 0, height: null, balanced: null,
    message: '开始检查是否为平衡二叉树',
    log: '开始',
    codeLine: 1,
  });

  const getHeight = (node: TreeNode | null, depth: number): number => {
    if (!node) return 0;

    steps.push({
      tree: root, current: node.val, depth, height: null, balanced: null,
      message: `访问节点 ${node.val}，当前深度 ${depth}`,
      log: `访问 ${node.val} (深度${depth})`,
      codeLine: 2,
    });

    const leftH = getHeight(node.left, depth + 1);
    const rightH = getHeight(node.right, depth + 1);
    const height = Math.max(leftH, rightH) + 1;

    if (Math.abs(leftH - rightH) > 1) {
      isBalanced = false;
      steps.push({
        tree: root, current: node.val, depth, height, balanced: false,
        message: `节点 ${node.val} 不平衡: 左高${leftH}, 右高${rightH}`,
        log: `${node.val} 不平衡 (|${leftH}-${rightH}|>1)`,
        codeLine: 3,
      });
    } else {
      steps.push({
        tree: root, current: node.val, depth, height, balanced: null,
        message: `节点 ${node.val} 平衡: 左高${leftH}, 右高${rightH}, 高度${height}`,
        log: `${node.val} 平衡 (高度${height})`,
        codeLine: 4,
      });
    }

    return height;
  };

  if (root) {
    getHeight(root, 0);
    steps.push({
      tree: root, current: null, depth: 0, height: null, balanced: isBalanced,
      message: isBalanced ? '是平衡二叉树' : '不是平衡二叉树',
      log: `完成: ${isBalanced ? '平衡' : '不平衡'}`,
      codeLine: 5,
    });
  }

  return steps;
}

// 【双版本长处整合】已整合至 tree-036-037/balanced-binary-tree-037-renderer.ts
// 唯一事实来源：tree-037-balanced-binary-tree (aliases: ['balanced'])，兼具输入框/预设与左神名师讲义四语言联动
export { buildBalancedSteps };
export type { BalancedStep };

/* ═══════════════════ Level 13: 左叶子之和 ═══════════════════ */

// 引入左叶子之和多阶段演进版（单一事实来源，挂载主 ID 'left-leaves'）
import './left-leaves-renderer';
export { buildLeftLeavesSteps, type LeftLeavesStep } from './left-leaves-renderer';

/* ═══════════════════ Level 14: 二叉树所有路径 ═══════════════════ */

// 引入二叉树所有路径多阶段演进版（单一事实来源，挂载主 ID 'all-paths'）
import './all-paths-renderer';
export { buildAllPathsSteps, type AllPathsStep } from './all-paths-renderer';


/* ═══════════════════ Level 15: 完全二叉树节点个数 ═══════════════════ */

interface CountNodesStep {
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  count: number;
  message: string;
  log: string;
  codeLine?: number | number[];
  visitedNodes: Set<number>;
  metrics?: Record<string, string>;
}

function buildCountNodesSteps(root: TreeNode | null): CountNodesStep[] {
  const steps: CountNodesStep[] = [];
  let count = 0;
  const visitedNodes = new Set<number>();

  steps.push({
    tree: root, current: null, depth: 0, count: 0, visitedNodes: new Set(),
    message: '开始计算完全二叉树的节点个数',
    log: '开始',
    codeLine: 1,
  });

  const dfs = (node: TreeNode | null, depth: number): number => {
    if (!node) return 0;

    count++;
    visitedNodes.add(node.val);
    steps.push({
      tree: root, current: node.val, depth, count, visitedNodes: new Set(visitedNodes),
      message: `访问节点 ${node.val}，计数: ${count}`,
      log: `访问 ${node.val} → count=${count}`,
      codeLine: 2,
    });

    const left = dfs(node.left, depth + 1);
    const right = dfs(node.right, depth + 1);
    const total = left + right + 1;

    steps.push({
      tree: root, current: node.val, depth, count, visitedNodes: new Set(visitedNodes),
      message: `节点 ${node.val} 子树共 ${total} 个节点`,
      log: `${node.val} 子树=${total}`,
      codeLine: 3,
    });

    return total;
  };

  if (root) {
    dfs(root, 0);
    steps.push({
      tree: root, current: null, depth: 0, count, visitedNodes: new Set(visitedNodes),
      message: `总节点数为 ${count}`,
      log: `完成: count=${count}`,
      codeLine: 4,
    });
  }

  return steps;
}

// 【双版本长处整合】已整合至 tree-036-037/count-complete-tree-nodes-036-renderer.ts
// 唯一事实来源：tree-036-count-complete-tree-nodes (aliases: ['count-nodes'])，兼具输入框/预设与左神 O((logN)^2) 剪枝讲义
export { buildCountNodesSteps };
export type { CountNodesStep };

/* ═══════════════════ Level 16: 找树左下角的值 ═══════════════════ */

// 引入找树左下角的值多阶段演进版（单一事实来源，挂载主 ID 'bottom-left'）
import './bottom-left-renderer';
export { buildBottomLeftSteps, type BottomLeftStep } from './bottom-left-renderer';


export {};
