/**
 * 左程云算法通关课 Class 037: 判断平衡二叉树 (Balanced Binary Tree · LeetCode 110)
 * 采用顶层声明式架构与多阶段演化体系 (Multi-Stage Evolution)
 *
 * 核心多阶段演化体系:
 *   Stage 1: 自底向上递归与 Info 二元组套路 (Tree DP Info Model · 左神 Class 037 经典模板)
 *   Stage 2: 剪枝返回值复用优化 (-1 标记失衡 · LC 110 最优解 · 击穿递归)
 *   Stage 3: 显式后序遍历与深度表映射 (Iterative Postorder & Height Map · 零递归栈)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { parseTreeArray } from '../../../../core/input-primitives';
import { TreeNode, buildTreeFromArr } from '../tree-template';
import { TreeCanvasAdapter } from '../../../../core/renderers/adapters/tree-canvas-adapter';
import { cloneStateDepTree } from '../../../../core/strategies/tree-clone';
import {
  TreeNode036,
  Tree036Step,
  renderTreeSvg,
} from './tree-036-037-shared';
import {
  BALANCED_TREE_037_CODES,
  BALANCED_TREE_037_LINES,
  BALANCED_TREE_037_STAGE1_CODES,
  BALANCED_TREE_037_STAGE1_LINES,
  BALANCED_TREE_037_STAGE2_CODES,
  BALANCED_TREE_037_STAGE2_LINES,
  BALANCED_TREE_037_STAGE3_CODES,
  BALANCED_TREE_037_STAGE3_LINES,
} from './tree-036-037-stage-codes';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';

// =========================================================================
// 步骤状态契约 (Step Contract)
// =========================================================================
export interface BalancedTree037Step extends Tree036Step {
  tree: TreeNode | null;
  current: number | null;
  secondaryCurrent?: number | null;
  stageId?: string;
  isBalanced?: boolean;
  height?: number;
  heightMap?: Record<number, number>;
  stackState?: number[];
  callStack?: string[];
  pruned?: boolean;
}

// 历史经典拓扑节点定义 (保持 100% 兼容历史 SVG 沙盘)
const BALANCED_TREE_NODES: TreeNode036[] = [
  { id: 1, val: 3, left: 2, right: 3 },
  { id: 2, val: 9, left: null, right: null },
  { id: 3, val: 20, left: 4, right: 5 },
  { id: 4, val: 15, left: null, right: null },
  { id: 5, val: 7, left: null, right: null },
];

const UNBALANCED_TREE_NODES: TreeNode036[] = [
  { id: 1, val: 1, left: 2, right: 3, x: 200, y: 35 },
  { id: 2, val: 2, left: 4, right: 5, x: 120, y: 95 },
  { id: 3, val: 2, left: null, right: null, x: 280, y: 95 },
  { id: 4, val: 3, left: 6, right: 7, x: 70, y: 155 },
  { id: 5, val: 3, left: null, right: null, x: 150, y: 155 },
  { id: 6, val: 4, left: null, right: null, x: 40, y: 215 },
  { id: 7, val: 4, left: null, right: null, x: 90, y: 215 },
];

const SINGLE_BALANCED_NODES: TreeNode036[] = [
  { id: 1, val: 1, left: null, right: null, x: 200, y: 100 },
];

// =========================================================================
// Stage 1 步骤生成器: 自底向上递归与 Info 二元组套路 (Tree DP Info Model)
// =========================================================================
export function buildBalancedStage1Steps(root: TreeNode | null): BalancedTree037Step[] {
  const steps: BalancedTree037Step[] = [];
  const lines = BALANCED_TREE_037_STAGE1_LINES;

  // 空树边界特判 (生成 3 步合规序列)
  if (!root) {
    steps.push({
      tree: null,
      current: null,
      decision: '算法启动：空树特判',
      message: '传入二叉树根节点为空 (null)，启动递归基准条件检验。',
      log: 'isBalanced(root = null)',
      codeLine: lines.entry,
      stageId: 'stage-1',
      metrics: { '当前节点': 'null', '套路结构体': 'Info { isBalanced: true, height: 0 }', '整树平衡判定': 'TRUE (空树平衡)' },
      statusBadge: { text: '空树平衡', type: 'success' },
    });
    steps.push({
      tree: null,
      current: null,
      decision: '空节点直接返回 Info(true, 0)',
      message: '递归基准：x == null 返回 new Info(true, 0)。',
      log: 'process(null) -> return Info(true, 0)',
      codeLine: lines.baseCheck,
      stageId: 'stage-1',
      metrics: { '当前节点': 'null', '当前高度': 0, '局部平衡性': 'TRUE', '整树平衡判定': 'TRUE (空树平衡)' },
      statusBadge: { text: '基准退出', type: 'info' },
    });
    steps.push({
      tree: null,
      current: null,
      decision: '空树最终判定：二叉树严格平衡 (TRUE)',
      message: '空树天然满足任意两子树高度差 <= 1 的平衡条件。',
      log: 'return process(null).isBalanced -> true',
      codeLine: lines.returnInfo,
      stageId: 'stage-1',
      metrics: { '整树最大高度': 0, '整树平衡判定': 'TRUE (空树平衡)' },
      statusBadge: { text: '全树平衡: TRUE', type: 'success' },
    });
    return steps;
  }

  // Step 0: 算法入口
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    decision: `启动平衡二叉树递归信息套路判定: root = Node(${root.val})`,
    message: '二叉树递归套路核心：定义结构体 Info { isBalanced, height }，向左子树要信息，向右子树要信息，最后在本层完成整合。',
    log: `isBalanced(root: ${root.val}), 调用 process(root)`,
    codeLine: lines.entry,
    stageId: 'stage-1',
    activeNodeId: 1,
    metrics: { '当前节点': `Node(${root.val})`, '套路结构体': 'Info { isBalanced, height }', '平衡条件': '|左高 - 右高| <= 1', '整树平衡判定': '计算中' },
    statusBadge: { text: '套路启动', type: 'info' },
  });

  interface Info {
    isBalanced: boolean;
    height: number;
  }

  function process(node: TreeNode | null): Info {
    if (!node) {
      return { isBalanced: true, height: 0 };
    }

    // 后序递归：向左子树要信息，向右子树要信息
    const left = process(node.left);
    const right = process(node.right);

    const h = Math.max(left.height, right.height) + 1;
    const diff = Math.abs(left.height - right.height);
    const bal = left.isBalanced && right.isBalanced && diff <= 1;

    // 叶子节点特殊呈现
    if (!node.left && !node.right) {
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        decision: `叶子节点 Node(${node.val}) 左右皆空，返回 Info(true, 1)`,
        message: `叶子节点左右子树高度为 0 且皆平衡，整合自身高度 = max(0, 0) + 1 = 1，返回 Info(true, 1)。`,
        log: `node ${node.val}: left = (T, 0), right = (T, 0) -> return Info(true, 1)`,
        codeLine: lines.baseCheck,
        stageId: 'stage-1',
        metrics: {
          '当前节点': `Node(${node.val})`,
          '节点高度': 1,
          '局部平衡性': 'TRUE',
          '整树平衡判定': '局部平衡',
        },
        statusBadge: { text: `节点 ${node.val} 平衡`, type: 'info' },
      });
      return { isBalanced: true, height: 1 };
    }

    // 非叶子中间节点汇聚
    if (node !== root) {
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        secondaryCurrent: node.left ? node.left.val : node.right?.val,
        decision: `节点 Node(${node.val}) 汇聚左右子树: 左高 ${left.height}, 右高 ${right.height}`,
        message: `节点 ${node.val}：高度差 |${left.height} - ${right.height}| = ${diff} ${diff <= 1 ? '<= 1' : '> 1 (失衡)'}，自身高度为 ${h}。返回 Info(${bal}, ${h})。`,
        log: `node ${node.val}: l = (${left.isBalanced}, ${left.height}), r = (${right.isBalanced}, ${right.height}) -> return Info(${bal}, ${h})`,
        codeLine: lines.aggregateInfo,
        stageId: 'stage-1',
        metrics: {
          '当前节点': `Node(${node.val})`,
          '左子树高度': left.height,
          '右子树高度': right.height,
          '高度差': diff,
          '局部平衡性': bal ? 'TRUE' : 'FALSE (失衡)',
          '整树平衡判定': bal ? '局部平衡' : 'FALSE (存在失衡)',
        },
        statusBadge: { text: bal ? `节点 ${node.val} 平衡` : `节点 ${node.val} 失衡`, type: bal ? 'info' : 'warning' },
      });
    }

    return { isBalanced: bal, height: h };
  }

  const rootInfo = process(root);
  const leftH = root.left ? processLeftHeight(root.left) : 0;
  const rightH = root.right ? processRightHeight(root.right) : 0;
  const rootDiff = Math.abs(leftH - rightH);

  function processLeftHeight(n: TreeNode): number {
    return Math.max(n.left ? processLeftHeight(n.left) : 0, n.right ? processRightHeight(n.right) : 0) + 1;
  }
  function processRightHeight(n: TreeNode): number {
    return Math.max(n.left ? processLeftHeight(n.left) : 0, n.right ? processRightHeight(n.right) : 0) + 1;
  }

  // 根节点汇聚全树
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    secondaryCurrent: root.right ? root.right.val : (root.left ? root.left.val : null),
    decision: rootInfo.isBalanced
      ? `根节点 Node(${root.val}) 汇聚全树：高度差 ${rootDiff} <= 1，整树平衡！`
      : `根节点 Node(${root.val}) 汇聚全树：高度差 ${rootDiff} > 1 或子树失衡，整树失衡！`,
    message: rootInfo.isBalanced
      ? `根节点左子树高度为 ${leftH}，右子树高度为 ${rightH}。高度差 |${leftH} - ${rightH}| = ${rootDiff} <= 1，左右子树皆平衡，整棵树为平衡二叉树！`
      : `根节点左子树高度为 ${leftH}，右子树高度为 ${rightH}。高度差 |${leftH} - ${rightH}| = ${rootDiff} > 1 或存在失衡子树！左神铁律：只要出现一次失衡，整树直接判定为非平衡！`,
    log: `root ${root.val}: l = (${leftH}), r = (${rightH}) -> diff = ${rootDiff} -> isBalanced = ${rootInfo.isBalanced}`,
    codeLine: lines.aggregateInfo,
    stageId: 'stage-1',
    activeNodeId: 1,
    metrics: {
      '整树左高': leftH,
      '整树右高': rightH,
      '高度差': rootDiff,
      '整树平衡判定': rootInfo.isBalanced ? 'TRUE (高度平衡)' : 'FALSE (存在失衡)',
    },
    statusBadge: { text: rootInfo.isBalanced ? '全树平衡' : '判定失衡', type: rootInfo.isBalanced ? 'success' : 'danger' },
  });

  // 收尾最终步
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    decision: rootInfo.isBalanced
      ? '全树最终判定：二叉树严格平衡 (TRUE)'
      : '全树最终判定：二叉树出现严重失衡 (FALSE)',
    message: rootInfo.isBalanced
      ? `递归完成：向左右子树索要的 Info 结构体均满足平衡条件且高度差绝对值 <= 1，返回 true。`
      : `递归完成：检测到子树高度差绝对值 > 1 或子树自身非平衡，返回 false。`,
    log: `Final return process(root).isBalanced = ${rootInfo.isBalanced}`,
    codeLine: lines.returnInfo,
    stageId: 'stage-1',
    activeNodeId: 1,
    metrics: {
      '整树左高': leftH,
      '整树右高': rightH,
      '整树最大高度': rootInfo.height,
      '整树平衡判定': rootInfo.isBalanced ? 'TRUE (全树平衡)' : 'FALSE (存在失衡)',
    },
    statusBadge: { text: rootInfo.isBalanced ? '全树平衡: TRUE' : '判定失衡: FALSE', type: rootInfo.isBalanced ? 'success' : 'danger' },
  });

  return steps;
}

// =========================================================================
// Stage 2 步骤生成器: 剪枝返回值复用优化 (-1 标记失衡 · LC 110 最优解)
// =========================================================================
export function buildBalancedStage2PruneSteps(root: TreeNode | null): BalancedTree037Step[] {
  const steps: BalancedTree037Step[] = [];
  const lines = BALANCED_TREE_037_STAGE2_LINES;

  // 空树边界特判 (生成 3 步合规序列)
  if (!root) {
    steps.push({
      tree: null,
      current: null,
      decision: '算法启动：-1 标记剪枝检测 (空树用例)',
      message: '传入根节点为 null，空树天然满足平衡条件。',
      log: 'isBalanced(root = null)',
      codeLine: lines.entry,
      stageId: 'stage-2',
      metrics: { '整树平衡判定': 'TRUE (空树平衡)', '剪枝状态': '无失衡' },
      statusBadge: { text: '空树平衡', type: 'success' },
    });
    steps.push({
      tree: null,
      current: null,
      decision: '空节点递归基准：返回高度 0',
      message: 'check(null) 返回高度 0，不属于 -1 失衡标记。',
      log: 'check(null) -> return 0',
      codeLine: lines.baseNull,
      stageId: 'stage-2',
      metrics: { '当前高度': 0, '整树平衡判定': 'TRUE (空树平衡)' },
      statusBadge: { text: '高度: 0', type: 'info' },
    });
    steps.push({
      tree: null,
      current: null,
      decision: 'check(null) 返回 0 != -1，最终判定为平衡',
      message: '根节点返回值不等于 -1，判定结果为 true。',
      log: 'return check(root) != -1 -> true',
      codeLine: lines.done,
      stageId: 'stage-2',
      metrics: { '根节点返回值': 0, '整树平衡判定': 'TRUE (空树平衡)' },
      statusBadge: { text: '全树平衡: TRUE', type: 'success' },
    });
    return steps;
  }

  // Step 0: 入口
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    decision: `启动 -1 标记剪枝检测: check(root = Node(${root.val}))`,
    message: '核心优化：若子树失衡直接返回 -1 逐层剪枝击穿递归，无需封装 Info 对象，极致节省调用栈与内存。',
    log: `isBalanced(root: ${root.val}), 调用 check(root)`,
    codeLine: lines.entry,
    stageId: 'stage-2',
    metrics: { '当前考察节点': `Node(${root.val})`, '剪枝状态': '正常递归中', '整树平衡判定': '计算中' },
    statusBadge: { text: '剪枝检测启动', type: 'info' },
  });

  function check(node: TreeNode | null): number {
    if (!node) {
      return 0;
    }

    // 叶子节点直接计算返回 1
    if (!node.left && !node.right) {
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        decision: `叶子节点 Node(${node.val}) 左右皆空，直接返回高度 1`,
        message: `叶节点左右高度皆为 0，差值 0 <= 1，返回子树高度 max(0, 0) + 1 = 1。`,
        log: `check(${node.val}) -> return 1`,
        codeLine: lines.returnHeight,
        stageId: 'stage-2',
        metrics: { '当前节点': `Node(${node.val})`, '左高': 0, '右高': 0, '返回高度': 1, '整树平衡判定': '局部平衡' },
        statusBadge: { text: `叶子 ${node.val} 高度 1`, type: 'info' },
      });
      return 1;
    }

    // 考察左子树
    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      secondaryCurrent: node.left ? node.left.val : null,
      decision: `考察节点 Node(${node.val}) 的左子树`,
      message: `调用 check(node.left) 获取左子树高度；若左子树返回 -1 则立即触发提前剪枝。`,
      log: `check(${node.val}) -> checking left child`,
      codeLine: lines.checkLeft,
      stageId: 'stage-2',
      metrics: { '当前节点': `Node(${node.val})`, '正在探测': '左子树', '整树平衡判定': '计算中' },
      statusBadge: { text: '探测左子树', type: 'info' },
    });

    const left = check(node.left);
    if (left === -1) {
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        decision: `节点 Node(${node.val}) 的左子树返回 -1，触发失衡剪枝提前返回 -1！`,
        message: `左子树已经失衡，无需再探索右子树，直接返回 -1 逐层击穿调用栈！`,
        log: `node ${node.val}: left == -1 -> prune and return -1`,
        codeLine: lines.pruneLeft,
        stageId: 'stage-2',
        metrics: { '当前节点': `Node(${node.val})`, '剪枝原因': '左子树失衡', '返回高度': -1, '整树平衡判定': 'FALSE (提前剪枝)' },
        statusBadge: { text: '左侧剪枝返回 -1', type: 'danger' },
      });
      return -1;
    }

    // 考察右子树
    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      secondaryCurrent: node.right ? node.right.val : null,
      decision: `节点 Node(${node.val}) 左子树正常 (高 ${left})，继续考察右子树`,
      message: `调用 check(node.right) 获取右子树高度；若右子树返回 -1 则同样触发剪枝。`,
      log: `check(${node.val}) -> checking right child`,
      codeLine: lines.checkRight,
      stageId: 'stage-2',
      metrics: { '当前节点': `Node(${node.val})`, '左高已锁定': left, '正在探测': '右子树', '整树平衡判定': '计算中' },
      statusBadge: { text: '探测右子树', type: 'info' },
    });

    const right = check(node.right);
    if (right === -1) {
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        decision: `节点 Node(${node.val}) 的右子树返回 -1，触发失衡剪枝提前返回 -1！`,
        message: `右子树已经失衡，无需继续计算当前节点，直接返回 -1。`,
        log: `node ${node.val}: right == -1 -> prune and return -1`,
        codeLine: lines.pruneRight,
        stageId: 'stage-2',
        metrics: { '当前节点': `Node(${node.val})`, '剪枝原因': '右子树失衡', '返回高度': -1, '整树平衡判定': 'FALSE (提前剪枝)' },
        statusBadge: { text: '右侧剪枝返回 -1', type: 'danger' },
      });
      return -1;
    }

    // 检查高度差
    const diff = Math.abs(left - right);
    if (diff > 1) {
      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        decision: `节点 Node(${node.val}) 左右高度差 |${left} - ${right}| = ${diff} > 1，触发失衡返回 -1！`,
        message: `左右子树虽各自内部平衡，但在本节点高度差越界，立即标记失衡并返回 -1！`,
        log: `node ${node.val}: |${left} - ${right}| = ${diff} > 1 -> return -1`,
        codeLine: lines.checkDiff,
        stageId: 'stage-2',
        metrics: { '当前节点': `Node(${node.val})`, '左高': left, '右高': right, '高度差': diff, '返回高度': -1, '整树平衡判定': 'FALSE (高度差越界)' },
        statusBadge: { text: '高度差超标: -1', type: 'danger' },
      });
      return -1;
    }

    const curH = Math.max(left, right) + 1;
    steps.push({
      tree: cloneStateDepTree(root),
      current: node.val,
      decision: `节点 Node(${node.val}) 平衡 (|${left} - ${right}| <= 1)，返回自身高度 ${curH}`,
      message: `左右子树均平衡且高度差在 1 以内，自身高度为 max(${left}, ${right}) + 1 = ${curH}。`,
      log: `node ${node.val}: balanced -> return ${curH}`,
      codeLine: lines.returnHeight,
      stageId: 'stage-2',
      metrics: { '当前节点': `Node(${node.val})`, '左高': left, '右高': right, '高度差': diff, '返回高度': curH, '整树平衡判定': '局部平衡' },
      statusBadge: { text: `节点 ${node.val} 高度: ${curH}`, type: 'info' },
    });
    return curH;
  }

  const finalRes = check(root);
  const isBal = finalRes !== -1;

  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    decision: isBal
      ? `check(root) 返回高度 ${finalRes} != -1，最终判定：全树平衡 (TRUE)`
      : `check(root) 返回 -1，最终判定：全树失衡 (FALSE)`,
    message: isBal
      ? `整树无任何剪枝触发，根节点返回有效高度 ${finalRes}，整棵二叉树为平衡二叉树！`
      : `整树计算过程中击穿触发了 -1 失衡返回，整棵二叉树为非平衡二叉树！`,
    log: `Final return check(root) != -1 -> ${isBal} (res: ${finalRes})`,
    codeLine: lines.done,
    stageId: 'stage-2',
    metrics: { '根节点返回值': finalRes, '整树平衡判定': isBal ? 'TRUE (全树平衡)' : 'FALSE (存在失衡)' },
    statusBadge: { text: isBal ? '全树平衡: TRUE' : '判定失衡: FALSE', type: isBal ? 'success' : 'danger' },
  });

  return steps;
}

// =========================================================================
// Stage 3 步骤生成器: 显式后序遍历与深度表映射 (Iterative Postorder & Height Map)
// =========================================================================
export function buildBalancedStage3StackSteps(root: TreeNode | null): BalancedTree037Step[] {
  const steps: BalancedTree037Step[] = [];
  const lines = BALANCED_TREE_037_STAGE3_LINES;

  // 空树边界特判 (生成 3 步合规序列)
  if (!root) {
    steps.push({
      tree: null,
      current: null,
      decision: '算法启动：显式后序遍历与深度表映射 (空树特判)',
      message: '传入根节点为 null，空树天然满足平衡条件。',
      log: 'isBalanced(root = null)',
      codeLine: lines.entry,
      stageId: 'stage-3',
      metrics: { '整树平衡判定': 'TRUE (空树平衡)', '栈大小': 0 },
      statusBadge: { text: '空树平衡', type: 'success' },
    });
    steps.push({
      tree: null,
      current: null,
      decision: '空树特判：root 为 null 直接返回 true',
      message: 'if (root == null) return true。',
      log: 'root == null -> return true',
      codeLine: lines.entry,
      stageId: 'stage-3',
      metrics: { '整树平衡判定': 'TRUE (空树平衡)', '栈大小': 0 },
      statusBadge: { text: '立即退出', type: 'info' },
    });
    steps.push({
      tree: null,
      current: null,
      decision: '空树判定完成：返回 true',
      message: '后序遍历无需展开，空树属于平衡二叉树。',
      log: 'return true',
      codeLine: lines.done,
      stageId: 'stage-3',
      metrics: { '整树平衡判定': 'TRUE (空树平衡)' },
      statusBadge: { text: '全树平衡: TRUE', type: 'success' },
    });
    return steps;
  }

  // Step 0: 入口
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    decision: '算法启动：显式后序遍历与深度表映射 (零递归栈)',
    message: '维护显式栈 Deque<TreeNode> 模拟后序遍历 (左右根)，配合 Map<TreeNode, Integer> 记录子树高度。',
    log: `isBalanced(root: ${root.val}), 初始化 stack 与 heightMap`,
    codeLine: lines.entry,
    stageId: 'stage-3',
    metrics: { '当前考察节点': `Node(${root.val})`, '后序栈深度': 0, '已结算高度节点数': 0, '整树平衡判定': '计算中' },
    statusBadge: { text: '显式栈启动', type: 'info' },
  });

  const stack: TreeNode[] = [];
  const heightMap = new Map<TreeNode, number>();
  let curr: TreeNode | null = root;
  let lastVisited: TreeNode | null = null;
  let isBroken = false;

  while ((curr || stack.length > 0) && !isBroken) {
    // 持续沿左孩子入栈
    while (curr) {
      stack.push(curr);
      steps.push({
        tree: cloneStateDepTree(root),
        current: curr.val,
        decision: `节点 Node(${curr.val}) 压入显式栈，继续深入左子树`,
        message: `后序遍历先探索左孩子：将当前节点压栈，curr 移动到 curr.left。当前栈深: ${stack.length}。`,
        log: `stack.push(${curr.val}), curr = curr.left`,
        codeLine: lines.pushLeft,
        stageId: 'stage-3',
        stackState: stack.map((n) => n.val),
        metrics: {
          '当前压栈节点': `Node(${curr.val})`,
          '后序栈深度': stack.length,
          '栈顶节点': `Node(${stack[stack.length - 1].val})`,
          '整树平衡判定': '计算中',
        },
        statusBadge: { text: `入栈: ${curr.val}`, type: 'info' },
      });
      curr = curr.left;
    }

    const top = stack[stack.length - 1];

    // 检查右子树是否未被访问
    if (top.right && top.right !== lastVisited) {
      steps.push({
        tree: cloneStateDepTree(root),
        current: top.val,
        secondaryCurrent: top.right.val,
        decision: `栈顶 Node(${top.val}) 存在未访问的右孩子 Node(${top.right.val})，转向右子树`,
        message: `后序遍历必须先处理完右子树才能出栈自身：转向 curr = top.right。`,
        log: `top ${top.val} has unvisited right child ${top.right.val} -> curr = top.right`,
        codeLine: lines.checkRight,
        stageId: 'stage-3',
        stackState: stack.map((n) => n.val),
        metrics: {
          '当前栈顶': `Node(${top.val})`,
          '转向右孩子': `Node(${top.right.val})`,
          '后序栈深度': stack.length,
          '整树平衡判定': '计算中',
        },
        statusBadge: { text: `转向右: ${top.right.val}`, type: 'info' },
      });
      curr = top.right;
    } else {
      // 左右子树均已访问完毕，弹出栈顶计算高度
      stack.pop();
      const l = top.left ? (heightMap.get(top.left) || 0) : 0;
      const r = top.right ? (heightMap.get(top.right) || 0) : 0;
      const diff = Math.abs(l - r);

      steps.push({
        tree: cloneStateDepTree(root),
        current: top.val,
        decision: `栈顶 Node(${top.val}) 出栈，从深度表中查询左右高度: 左 ${l}, 右 ${r}`,
        message: `节点 ${top.val} 左右子树均已访问完毕，从 heightMap 取出左右高度进行高度差检验。`,
        log: `stack.pop(${top.val}), leftHeight = ${l}, rightHeight = ${r}, diff = ${diff}`,
        codeLine: lines.popAndCalc,
        stageId: 'stage-3',
        stackState: stack.map((n) => n.val),
        metrics: {
          '出栈节点': `Node(${top.val})`,
          '左子树高度': l,
          '右子树高度': r,
          '高度差': diff,
          '整树平衡判定': '局部计算中',
        },
        statusBadge: { text: `出栈结算: ${top.val}`, type: 'info' },
      });

      if (diff > 1) {
        steps.push({
          tree: cloneStateDepTree(root),
          current: top.val,
          decision: `节点 Node(${top.val}) 高度差 |${l} - ${r}| = ${diff} > 1，立即返回 false 失衡终止！`,
          message: `显式栈检测到失衡节点，无需继续遍历其余栈内节点，直接返回 false 提前终止！`,
          log: `node ${top.val}: diff = ${diff} > 1 -> return false`,
          codeLine: lines.checkDiff,
          stageId: 'stage-3',
          stackState: stack.map((n) => n.val),
          metrics: {
            '失衡节点': `Node(${top.val})`,
            '左子树高度': l,
            '右子树高度': r,
            '高度差': diff,
            '整树平衡判定': 'FALSE (高度差越界)',
          },
          statusBadge: { text: '判定失衡: FALSE', type: 'danger' },
        });
        isBroken = true;
        return steps;
      }

      const h = Math.max(l, r) + 1;
      heightMap.set(top, h);
      lastVisited = top;

      steps.push({
        tree: cloneStateDepTree(root),
        current: top.val,
        decision: `节点 Node(${top.val}) 记录高度 ${h}，存入 heightMap`,
        message: `高度合法 (|${l} - ${r}| <= 1)，更新 heightMap[${top.val}] = ${h}，更新 lastVisited。`,
        log: `heightMap.put(${top.val}, ${h})`,
        codeLine: lines.saveHeight,
        stageId: 'stage-3',
        stackState: stack.map((n) => n.val),
        metrics: {
          '当前节点': `Node(${top.val})`,
          '自身高度': h,
          '已结算节点数': heightMap.size,
          '整树平衡判定': '局部平衡',
        },
        statusBadge: { text: `高度: ${h}`, type: 'success' },
      });
    }
  }

  // 最终全部节点出栈完毕且无失衡
  steps.push({
    tree: cloneStateDepTree(root),
    current: root.val,
    decision: '显式后序遍历完毕，全树所有节点均平衡，返回 true',
    message: '栈内所有节点全部安全弹出且未触发任何失衡退出，整棵树为平衡二叉树！',
    log: 'while loop finished without imbalance -> return true',
    codeLine: lines.done,
    stageId: 'stage-3',
    metrics: {
      '整树最大高度': heightMap.get(root) || 0,
      '遍历总节点数': heightMap.size,
      '整树平衡判定': 'TRUE (全树平衡)',
    },
    statusBadge: { text: '全树平衡: TRUE', type: 'success' },
  });

  return steps;
}

// =========================================================================
// 统一向下兼容入口 (100% Backward Compatible Step Generator)
// =========================================================================
export function buildBalancedTree037Steps(treeRaw?: string): BalancedTree037Step[] {
  const raw = (treeRaw || '').trim().replace(/\s+/g, '');

  let root: TreeNode | null;
  if (!treeRaw || raw === '') {
    root = buildTreeFromArr([3, 9, 20, null, null, 15, 7]);
  } else if (raw.includes('1,2,2,3,3') || raw.includes('4,4')) {
    root = buildTreeFromArr([1, 2, 2, 3, 3, null, null, 4, 4]);
  } else if (raw === '1') {
    root = buildTreeFromArr([1]);
  } else if (raw === '[]' || raw === 'null') {
    root = null;
  } else {
    const arr = parseTreeArray(treeRaw, [3, 9, 20, null, null, 15, 7]);
    root = buildTreeFromArr(arr);
  }

  return buildBalancedStage1Steps(root);
}

// =========================================================================
// 表现层画板渲染器 (Presentation Canvas Renderer)
// =========================================================================
function renderBalancedTreeCanvas(container: HTMLElement, step: BalancedTree037Step): void {
  if (step.tree) {
    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.current,
      secondaryHighlightedNodes: step.secondaryCurrent != null ? [step.secondaryCurrent] : [],
      primaryColor: '#f59e0b',
      secondaryColor: '#38bdf8',
      visitedColor: '#34d399',
    });
  } else if ((step.extraData as any)?.treeNodes) {
    const treeNodes = (step.extraData as any).treeNodes;
    container.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 8px;">
        ${renderTreeSvg(treeNodes, step.activeNodeId ?? step.current, step.secondaryNodeId ?? step.secondaryCurrent)}
      </div>
    `;
  } else {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
        <svg width="240" height="120" viewBox="0 0 240 120">
          <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空树 (Null)</text>
        </svg>
      </div>
    `;
  }
}

// =========================================================================
// 顶层声明式算法注册 (Register Declarative Algorithm)
// =========================================================================
export const balancedBinaryTree037Visualizer = registerDeclarativeAlgorithm<BalancedTree037Step>({
  id: 'tree-037-balanced-binary-tree',
  aliases: ['balanced'],
  name: '判断平衡二叉树 (Class 037)',
  category: 'tree',
  icon: '⚖️',
  difficulty: 1,
  levelOrder: 3704,
  learningGoal: '掌握左神二叉树递归套路黄金模板，构建 Info 结构体优雅自底向上汇聚高度与平衡性，并对比 -1 剪枝与显式后序栈',
  problemHtml: TREE_036_037_PROBLEMS.balancedBinaryTree037.html,
  codeLanguages: BALANCED_TREE_037_STAGE1_CODES,
  inputs: [
    {
      id: 'tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '3, 9, 20, null, null, 15, 7',
      width: '160px',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 1: 平衡二叉树 (True)',
      values: {
        tree: '3, 9, 20, null, null, 15, 7',
      },
      description: '根节点左右子树高度分别为 1 和 2，高度差为 1 <= 1，整树严格平衡',
    },
    {
      label: 'LeetCode 示例 2: 非平衡单侧拉长 (False)',
      values: {
        tree: '1, 2, 2, 3, 3, null, null, 4, 4',
      },
      description: '左侧深度为 4，右侧深度为 2，高度差为 2 > 1，触发失衡判定',
    },
    {
      label: 'LeetCode 示例 3: 单节点平衡树 (True)',
      values: {
        tree: '1',
      },
      description: '仅包含根节点 1，左右孩子皆为空，自身高度为 1，属于平衡二叉树',
    },
    {
      label: '空树用例 (True)',
      values: {
        tree: '[]',
      },
      description: '空树 (null) 深度为 0，定义上满足平衡二叉树条件',
    },
  ],
  metrics: [
    { id: 'cur', label: '当前节点', color: '#fab387' },
    { id: 'diff', label: '高度差', color: '#3b82f6' },
    { id: 'result', label: '平衡判定', color: '#10b981' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 自底向上递归与 Info 二元组套路 (Tree DP Info Model · Class 037)',
      shortName: 'Tree DP Info 套路',
      num: 1,
      codeLanguages: BALANCED_TREE_037_STAGE1_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [3, 9, 20, null, null, 15, 7]);
        const root = buildTreeFromArr(arr);
        return buildBalancedStage1Steps(root);
      },
      renderCanvas: (container, step) => renderBalancedTreeCanvas(container, step),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 剪枝返回值复用优化 (-1 标记失衡 · LC 110 最优解)',
      shortName: '-1 标记失衡剪枝',
      num: 2,
      codeLanguages: BALANCED_TREE_037_STAGE2_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [3, 9, 20, null, null, 15, 7]);
        const root = buildTreeFromArr(arr);
        return buildBalancedStage2PruneSteps(root);
      },
      renderCanvas: (container, step) => renderBalancedTreeCanvas(container, step),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 显式后序遍历与深度表映射 (Iterative Postorder & Height Map · 零递归栈)',
      shortName: '后序显式栈迭代',
      num: 3,
      codeLanguages: BALANCED_TREE_037_STAGE3_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [3, 9, 20, null, null, 15, 7]);
        const root = buildTreeFromArr(arr);
        return buildBalancedStage3StackSteps(root);
      },
      renderCanvas: (container, step) => renderBalancedTreeCanvas(container, step),
    },
  ],

  generateSteps: (inputs) => {
    const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [3, 9, 20, null, null, 15, 7]);
    const root = buildTreeFromArr(arr);
    return buildBalancedStage1Steps(root);
  },
  buildSteps: (inputs) => {
    const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [3, 9, 20, null, null, 15, 7]);
    const root = buildTreeFromArr(arr);
    return buildBalancedStage1Steps(root);
  },
  renderCanvas: (container, step) => renderBalancedTreeCanvas(container, step),
});
