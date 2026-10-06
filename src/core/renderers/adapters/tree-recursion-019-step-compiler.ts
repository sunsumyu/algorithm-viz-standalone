/**
 * 二叉树高频递归套路核心步进编译器 (Tree Recursion Patterns Step Compiler)
 * 左程云算法通关课 Class 019
 * 遵循 Matt Pocock 深模块哲学与纯领域逻辑分层架构
 */

import { StepBase, HighlightTarget } from '../../step-visualizer';
import {
  TREE_RECURSION_019_CODE_LINES,
  TREE_RECURSION_STAGE2_LINES,
  TREE_RECURSION_STAGE3_LINES,
} from '../../../algorithms/categories/tree/tree-recursion-patterns-019-stage-codes';

// ============================================================
// 树节点与步骤数据结构定义
// ============================================================
export interface TreeNodeData {
  id: number;
  val: number;
  left?: number;
  right?: number;
}

export interface TreeRecursionStep extends StepBase {
  stepIndex?: number;
  nodes: TreeNodeData[];
  currentNodeId: number | null;
  phase: 'enter' | 'left-done' | 'right-done' | 'return';
  collectedInfo: {
    height: number;
    isBalanced: boolean;
    minVal?: number;
    maxVal?: number;
    isBST?: boolean;
    maxDistance?: number;
  };
  leftInfoSnapshot?: any;
  rightInfoSnapshot?: any;
  decision: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  stageId?: 'stage1' | 'stage2' | 'stage3';
}

export function getTree019PresetNodes(treeType?: string, stage: 1 | 2 | 3 = 1): TreeNodeData[] {
  const isUnbalanced = treeType === 'unbalanced';
  if (stage === 1) {
    return isUnbalanced
      ? [
          { id: 1, val: 1, left: 2 },
          { id: 2, val: 2, left: 3 },
          { id: 3, val: 3, left: 4 },
          { id: 4, val: 4 },
        ]
      : [
          { id: 1, val: 1, left: 2, right: 3 },
          { id: 2, val: 2, left: 4, right: 5 },
          { id: 3, val: 3 },
          { id: 4, val: 4 },
          { id: 5, val: 5 },
        ];
  }
  if (stage === 2) {
    return isUnbalanced
      ? [
          { id: 1, val: 10, left: 2 },
          { id: 2, val: 15, left: 3 }, // 15 在 10 的左子树，非法 BST
          { id: 3, val: 5 },
        ]
      : [
          { id: 1, val: 4, left: 2, right: 3 },
          { id: 2, val: 2, left: 4, right: 5 },
          { id: 3, val: 6 },
          { id: 4, val: 1 },
          { id: 5, val: 3 },
        ];
  }
  // stage 3
  return isUnbalanced
    ? [
        { id: 1, val: 1, left: 2 },
        { id: 2, val: 2, left: 3 },
        { id: 3, val: 3, left: 4 },
        { id: 4, val: 4 },
      ]
    : [
        { id: 1, val: 1, left: 2, right: 3 },
        { id: 2, val: 2, left: 4, right: 5 },
        { id: 3, val: 3 },
        { id: 4, val: 4 },
        { id: 5, val: 5 },
      ];
}

// ============================================================
// Stage 1: 平衡二叉树判定 (Is Balanced)
// ============================================================
export function generateTreeRecursionSteps(treeNodes: TreeNodeData[]): TreeRecursionStep[] {
  const steps: TreeRecursionStep[] = [];
  const nodeMap = new Map<number, TreeNodeData>();
  treeNodes.forEach((n) => nodeMap.set(n.id, n));

  const rootId = treeNodes.length > 0 ? treeNodes[0].id : null;
  if (!rootId) {
    steps.push({
      stepIndex: 0,
      nodes: [],
      currentNodeId: null,
      phase: 'return',
      collectedInfo: { height: 0, isBalanced: true },
      decision: '空树天然为平衡二叉树，高度为 0',
      message: '树为空',
      log: '空树处理完毕',
      codeLine: TREE_RECURSION_019_CODE_LINES.baseCase,
      statusBadge: { text: '空树', type: 'info' },
      stageId: 'stage1',
    });
    return steps;
  }

  let stepIdx = 0;

  function dfs(id: number | undefined): { height: number; isBalanced: boolean } {
    if (id === undefined || !nodeMap.has(id)) {
      steps.push({
        stepIndex: stepIdx++,
        nodes: treeNodes,
        currentNodeId: null,
        phase: 'return',
        collectedInfo: { height: 0, isBalanced: true },
        decision: '到达空节点 (Null)，返回 Base Case: {isBalanced: true, height: 0}',
        message: '空节点返回',
        log: 'Null -> 返回高度 0',
        codeLine: TREE_RECURSION_019_CODE_LINES.baseCase,
        statusBadge: { text: '空节点', type: 'info' },
        stageId: 'stage1',
      });
      return { height: 0, isBalanced: true };
    }

    const node = nodeMap.get(id)!;

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'enter',
      collectedInfo: { height: 0, isBalanced: true },
      decision: `进入节点 [${node.val}]，准备向左子树递归收集信息`,
      message: `访问节点 ${node.val}`,
      log: `进入节点 ${node.val}`,
      codeLine: TREE_RECURSION_019_CODE_LINES.enterLeft,
      statusBadge: { text: `进入 Node ${node.val}`, type: 'info' },
      stageId: 'stage1',
    });

    const left = dfs(node.left);

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'left-done',
      collectedInfo: { height: left.height, isBalanced: left.isBalanced },
      leftInfoSnapshot: left,
      decision: `节点 [${node.val}] 左子树收集完毕：高度=${left.height}，是否平衡=${left.isBalanced}。准备向右子树收集信息`,
      message: `左子树信息就绪`,
      log: `节点 ${node.val} 左树高度 ${left.height}`,
      codeLine: TREE_RECURSION_019_CODE_LINES.leftDone,
      statusBadge: { text: `左树完成`, type: 'warning' },
      stageId: 'stage1',
    });

    const right = dfs(node.right);

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'right-done',
      collectedInfo: { height: Math.max(left.height, right.height) + 1, isBalanced: false },
      leftInfoSnapshot: left,
      rightInfoSnapshot: right,
      decision: `节点 [${node.val}] 右子树收集完毕：高度=${right.height}，是否平衡=${right.isBalanced}。整合左右信息计算自身`,
      message: `左右子树信息均就绪`,
      log: `节点 ${node.val} 右树高度 ${right.height}`,
      codeLine: TREE_RECURSION_019_CODE_LINES.rightDone,
      statusBadge: { text: `信息聚合`, type: 'warning' },
      stageId: 'stage1',
    });

    const myHeight = Math.max(left.height, right.height) + 1;
    const isBalanced = left.isBalanced && right.isBalanced && Math.abs(left.height - right.height) <= 1;

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'return',
      collectedInfo: { height: myHeight, isBalanced },
      leftInfoSnapshot: left,
      rightInfoSnapshot: right,
      decision: `节点 [${node.val}] 整合结果：高度=${myHeight}，高度差=|${left.height} - ${right.height}|=${Math.abs(
        left.height - right.height
      )} <= 1，平衡状态=${isBalanced}`,
      message: `向上层返回结果`,
      log: `Node ${node.val} -> {h: ${myHeight}, balanced: ${isBalanced}}`,
      codeLine: TREE_RECURSION_019_CODE_LINES.returnInfo,
      statusBadge: isBalanced ? { text: `平衡 (${myHeight})`, type: 'success' } : { text: `不平衡`, type: 'danger' },
      stageId: 'stage1',
    });

    return { height: myHeight, isBalanced };
  }

  dfs(rootId);
  return steps;
}

// ============================================================
// Stage 2: 搜索二叉树判定 (Is BST)
// ============================================================
export function generateTreeBstSteps(treeNodes: TreeNodeData[]): TreeRecursionStep[] {
  const steps: TreeRecursionStep[] = [];
  const nodeMap = new Map<number, TreeNodeData>();
  treeNodes.forEach((n) => nodeMap.set(n.id, n));
  const rootId = treeNodes.length > 0 ? treeNodes[0].id : null;

  if (!rootId) {
    steps.push({
      stepIndex: 0,
      nodes: [],
      currentNodeId: null,
      phase: 'return',
      collectedInfo: { height: 0, isBalanced: true, isBST: true },
      decision: '空树天然为二叉搜索树 (BST)',
      message: '树为空',
      log: '空树处理',
      codeLine: TREE_RECURSION_STAGE2_LINES.baseCase,
      statusBadge: { text: '空树', type: 'info' },
      stageId: 'stage2',
    });
    return steps;
  }

  let stepIdx = 0;

  interface BSTInfo {
    isBST: boolean;
    min: number;
    max: number;
  }

  function dfs(id: number | undefined): BSTInfo | null {
    if (id === undefined || !nodeMap.has(id)) {
      steps.push({
        stepIndex: stepIdx++,
        nodes: treeNodes,
        currentNodeId: null,
        phase: 'return',
        collectedInfo: { height: 0, isBalanced: true, isBST: true },
        decision: '空节点返回 null，便于父节点搜集极值',
        message: '空节点返回 null',
        log: 'Null -> 返回 null',
        codeLine: TREE_RECURSION_STAGE2_LINES.baseCase,
        statusBadge: { text: 'Null', type: 'info' },
        stageId: 'stage2',
      });
      return null;
    }

    const node = nodeMap.get(id)!;
    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'enter',
      collectedInfo: { height: 0, isBalanced: true, isBST: true },
      decision: `进入节点 [${node.val}]，准备向左子树递归搜集 BST 信息`,
      message: `访问节点 ${node.val}`,
      log: `进入节点 ${node.val}`,
      codeLine: TREE_RECURSION_STAGE2_LINES.enterLeft,
      statusBadge: { text: `Node ${node.val}`, type: 'info' },
      stageId: 'stage2',
    });

    const left = dfs(node.left);

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'left-done',
      collectedInfo: { height: 1, isBalanced: true, isBST: left ? left.isBST : true },
      leftInfoSnapshot: left,
      decision: `节点 [${node.val}] 左子树就绪：${
        left ? `isBST=${left.isBST}, min=${left.min}, max=${left.max}` : '空子树'
      }。深入右子树`,
      message: `左子树汇报完毕`,
      log: `左子树汇报完毕`,
      codeLine: TREE_RECURSION_STAGE2_LINES.leftDone,
      statusBadge: { text: `左树完成`, type: 'warning' },
      stageId: 'stage2',
    });

    const right = dfs(node.right);

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'right-done',
      collectedInfo: { height: 1, isBalanced: true, isBST: false },
      leftInfoSnapshot: left,
      rightInfoSnapshot: right,
      decision: `节点 [${node.val}] 左右子树均就绪。开始校验 BST 判定条件：左大 < ${node.val} < 右小`,
      message: `左右子树汇报完毕`,
      log: `左右子树汇报完毕`,
      codeLine: TREE_RECURSION_STAGE2_LINES.rightDone,
      statusBadge: { text: `汇总信息`, type: 'warning' },
      stageId: 'stage2',
    });

    let min = node.val;
    let max = node.val;
    if (left) {
      min = Math.min(min, left.min);
      max = Math.max(max, left.max);
    }
    if (right) {
      min = Math.min(min, right.min);
      max = Math.max(max, right.max);
    }

    let isBST = true;
    if (left && (!left.isBST || left.max >= node.val)) isBST = false;
    if (right && (!right.isBST || right.min <= node.val)) isBST = false;

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'return',
      collectedInfo: { height: 1, isBalanced: true, isBST, minVal: min, maxVal: max },
      leftInfoSnapshot: left,
      rightInfoSnapshot: right,
      decision: `节点 [${node.val}] 判定结果：isBST=${isBST}, 覆盖区间=[${min}, ${max}]`,
      message: `向父节点返回 BST 判定结果`,
      log: `Node ${node.val} -> {isBST: ${isBST}, [${min}, ${max}]}`,
      codeLine: TREE_RECURSION_STAGE2_LINES.returnInfo,
      statusBadge: isBST ? { text: `BST 合法`, type: 'success' } : { text: `BST 失效`, type: 'danger' },
      stageId: 'stage2',
    });

    return { isBST, min, max };
  }

  dfs(rootId);
  return steps;
}

// ============================================================
// Stage 3: 二叉树最大节点距离 (Max Distance)
// ============================================================
export function generateTreeMaxDistSteps(treeNodes: TreeNodeData[]): TreeRecursionStep[] {
  const steps: TreeRecursionStep[] = [];
  const nodeMap = new Map<number, TreeNodeData>();
  treeNodes.forEach((n) => nodeMap.set(n.id, n));
  const rootId = treeNodes.length > 0 ? treeNodes[0].id : null;

  if (!rootId) {
    steps.push({
      stepIndex: 0,
      nodes: [],
      currentNodeId: null,
      phase: 'return',
      collectedInfo: { height: 0, isBalanced: true, maxDistance: 0 },
      decision: '空树最大节点距离为 0，高度为 0',
      message: '树为空',
      log: '空树处理',
      codeLine: TREE_RECURSION_STAGE3_LINES.baseCase,
      statusBadge: { text: '空树', type: 'info' },
      stageId: 'stage3',
    });
    return steps;
  }

  let stepIdx = 0;

  interface DistInfo {
    maxDistance: number;
    height: number;
  }

  function dfs(id: number | undefined): DistInfo {
    if (id === undefined || !nodeMap.has(id)) {
      steps.push({
        stepIndex: stepIdx++,
        nodes: treeNodes,
        currentNodeId: null,
        phase: 'return',
        collectedInfo: { height: 0, isBalanced: true, maxDistance: 0 },
        decision: '空节点返回 Base Case: {maxDistance: 0, height: 0}',
        message: '空节点返回',
        log: 'Null -> dist=0, h=0',
        codeLine: TREE_RECURSION_STAGE3_LINES.baseCase,
        statusBadge: { text: 'Null', type: 'info' },
        stageId: 'stage3',
      });
      return { maxDistance: 0, height: 0 };
    }

    const node = nodeMap.get(id)!;
    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'enter',
      collectedInfo: { height: 0, isBalanced: true, maxDistance: 0 },
      decision: `进入节点 [${node.val}]，准备向左子树搜集最大距离与高度`,
      message: `访问节点 ${node.val}`,
      log: `进入节点 ${node.val}`,
      codeLine: TREE_RECURSION_STAGE3_LINES.enterLeft,
      statusBadge: { text: `Node ${node.val}`, type: 'info' },
      stageId: 'stage3',
    });

    const left = dfs(node.left);

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'left-done',
      collectedInfo: { height: left.height, isBalanced: true, maxDistance: left.maxDistance },
      leftInfoSnapshot: left,
      decision: `节点 [${node.val}] 左子树汇报完毕：maxDist=${left.maxDistance}, height=${left.height}。深入右子树`,
      message: `左子树汇报完毕`,
      log: `左子树汇报完毕`,
      codeLine: TREE_RECURSION_STAGE3_LINES.leftDone,
      statusBadge: { text: `左树完成`, type: 'warning' },
      stageId: 'stage3',
    });

    const right = dfs(node.right);

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'right-done',
      collectedInfo: {
        height: Math.max(left.height, right.height) + 1,
        isBalanced: true,
        maxDistance: Math.max(left.maxDistance, right.maxDistance),
      },
      leftInfoSnapshot: left,
      rightInfoSnapshot: right,
      decision: `节点 [${node.val}] 左右子树均就绪。对比三种可能性：1.左树内(${left.maxDistance}); 2.右树内(${right.maxDistance}); 3.过当前根(${left.height}+${right.height}+1=${
        left.height + right.height + 1
      })`,
      message: `左右子树汇报完毕`,
      log: `左右子树汇报完毕`,
      codeLine: TREE_RECURSION_STAGE3_LINES.rightDone,
      statusBadge: { text: `聚合决策`, type: 'warning' },
      stageId: 'stage3',
    });

    const height = Math.max(left.height, right.height) + 1;
    const p1 = left.maxDistance;
    const p2 = right.maxDistance;
    const p3 = left.height + right.height + 1;
    const maxDist = Math.max(Math.max(p1, p2), p3);

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'return',
      collectedInfo: { height, isBalanced: true, maxDistance: maxDist },
      leftInfoSnapshot: left,
      rightInfoSnapshot: right,
      decision: `节点 [${node.val}] 整合结果：最大节点距离=${maxDist}，子树高度=${height}`,
      message: `向上层返回结果`,
      log: `Node ${node.val} -> {dist: ${maxDist}, h: ${height}}`,
      codeLine: TREE_RECURSION_STAGE3_LINES.returnInfo,
      statusBadge: { text: `距离 ${maxDist}`, type: 'success' },
      stageId: 'stage3',
    });

    return { maxDistance: maxDist, height };
  }

  dfs(rootId);
  return steps;
}
