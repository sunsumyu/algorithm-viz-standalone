/**
 * 二叉搜索树最小绝对差步骤编译器 (Minimum Absolute Difference in BST Step Compiler · LeetCode 530 / 783)
 * Matt Pocock 深模块设计：将中序双指针递归、显式单调栈迭代与 Morris 常数空间遍历彻底下沉解耦
 */

import { HighlightTarget } from '../../step-visualizer';
import { TreeNode, buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import { parseTreeArray } from '../../input-primitives';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from './recursive-call-trace-adapter';
import {
  BST_MIN_DIFF_STAGE1_LINES,
  BST_MIN_DIFF_STAGE2_LINES,
  BST_MIN_DIFF_STAGE3_LINES,
} from '../../../algorithms/categories/tree/bst-min-diff-stage-codes';

export interface BstMinDiffStep {
  tree: TreeNode | null;
  currNodeVal: number | null;
  prevNodeVal: number | null;
  currDiff: number | null;
  minDiff: number;
  inorderSeq: number[];
  action: 'enter' | 'left' | 'visit' | 'right' | 'thread-build' | 'thread-cut' | 'done';
  decision: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  callTrace?: RecursiveCallTraceSnapshot;
  stageId?: string;
  highlightedNodes?: number[];
  stackVals?: number[];
  morrisThread?: { from: number; to: number; active: boolean };
}

export function cloneTree(node: TreeNode | null, visited = new Set<TreeNode>()): TreeNode | null {
  if (!node || visited.has(node)) return null;
  visited.add(node);
  const copy: TreeNode = {
    val: node.val,
    left: cloneTree(node.left, visited),
    right: cloneTree(node.right, visited),
  };
  return copy;
}

/** 解析输入参数并构建树 */
export function parseBstMinDiffInputs(inputs?: Record<string, unknown>): TreeNode | null {
  const raw = inputs?.['input-tree'] || inputs?.tree || '[4, 2, 6, 1, 3]';
  const arr = parseTreeArray(raw as string, [4, 2, 6, 1, 3]);
  return buildTreeFromArr(arr);
}

// =========================================================================
// Stage 1: 经典中序双指针递归 (Inorder Traversal with Prev Pointer)
// =========================================================================
export function buildBstMinDiffStage1Steps(root: TreeNode | null): BstMinDiffStep[] {
  const steps: BstMinDiffStep[] = [];
  const trace = new RecursiveCallTraceBuilder();
  let minDiff = Infinity;
  let prev: TreeNode | null = null;
  const inorderSeq: number[] = [];

  if (!root) {
    trace.addHeader('getMinimumDifference(root=null)', 0, '空树特判');
    trace.addConditionHit('root == null -> return 0', 0, '树为空，无两节点可计算');
    trace.addFinalResult('return 0', 0, '空树结束', '0');
    steps.push({
      tree: null,
      currNodeVal: null,
      prevNodeVal: null,
      currDiff: null,
      minDiff: 0,
      inorderSeq: [],
      action: 'done',
      decision: '空树输入，返回 0',
      message: '树为空，无两节点可计算，返回 0。',
      log: 'empty tree -> return 0',
      codeLine: BST_MIN_DIFF_STAGE1_LINES.done,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
    });
    return steps;
  }

  // 初始化入口
  trace.addHeader(`getMinimumDifference(root=${root.val})`, 0, '初始化 minDiff=∞, prev=null');
  steps.push({
    tree: cloneTree(root),
    currNodeVal: root.val,
    prevNodeVal: null,
    currDiff: null,
    minDiff,
    inorderSeq: [],
    action: 'enter',
    decision: '初始化算法状态，开启中序递归遍历',
    message: `初始化 minDiff = ∞, prev = null，开始中序遍历二叉搜索树（根节点 ${root.val}）。`,
    log: `init: minDiff = ∞, start inorder traversal from root ${root.val}`,
    codeLine: BST_MIN_DIFF_STAGE1_LINES.entry,
    callTrace: trace.snapshot(),
    stageId: 'stage-1',
    highlightedNodes: [root.val],
  });

  function inorder(node: TreeNode | null, depth: number) {
    if (!node) {
      trace.addHeader('inorder(node=null)', depth, '空节点触底返回');
      trace.addConditionHit('node == null -> return', depth, '命中基底条件');
      trace.addReturnLeaf('return', depth, 'null');
      steps.push({
        tree: cloneTree(root),
        currNodeVal: null,
        prevNodeVal: prev ? prev.val : null,
        currDiff: null,
        minDiff,
        inorderSeq: [...inorderSeq],
        action: 'visit',
        decision: '到达空节点，直接返回上一层递归',
        message: '到达空子树，满足基底条件 node == null，返回父调用。',
        log: `depth ${depth}: node == null, return`,
        codeLine: BST_MIN_DIFF_STAGE1_LINES.checkNull,
        callTrace: trace.snapshot(),
        stageId: 'stage-1',
        highlightedNodes: prev ? [prev.val] : [],
      });
      return;
    }

    // 递归进入当前节点
    trace.addHeader(`inorder(node=${node.val})`, depth, `访问节点 ${node.val}，准备递归左子树`);
    steps.push({
      tree: cloneTree(root),
      currNodeVal: node.val,
      prevNodeVal: prev ? prev.val : null,
      currDiff: null,
      minDiff,
      inorderSeq: [...inorderSeq],
      action: 'enter',
      decision: `进入节点 ${node.val}，探索其左子树`,
      message: `进入 inorder(node=${node.val})，下一步下潜至左孩子 ${node.left ? node.left.val : 'null'}。`,
      log: `depth ${depth}: enter inorder(${node.val})`,
      codeLine: BST_MIN_DIFF_STAGE1_LINES.inorderEnter,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [node.val],
    });

    // 1. 递归左子树
    trace.addRecursePrep(`inorder(node.left=${node.left ? node.left.val : 'null'})`, depth, '深入左分支');
    steps.push({
      tree: cloneTree(root),
      currNodeVal: node.val,
      prevNodeVal: prev ? prev.val : null,
      currDiff: null,
      minDiff,
      inorderSeq: [...inorderSeq],
      action: 'left',
      decision: `递归探索 ${node.val} 的左子树`,
      message: `根据中序遍历「左-根-右」规则，先递归处理左子树。`,
      log: `depth ${depth}: recurse left of node ${node.val}`,
      codeLine: BST_MIN_DIFF_STAGE1_LINES.leftRecurse,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [node.val],
    });
    inorder(node.left, depth + 1);

    // 2. 访问当前节点：计算与前驱的差值
    let diff: number | null = null;
    let isNewMin = false;
    if (prev !== null) {
      diff = node.val - prev.val;
      if (diff < minDiff) {
        minDiff = diff;
        isNewMin = true;
      }
    }
    inorderSeq.push(node.val);

    trace.addUnwindCalc(
      `visit(${node.val})`,
      depth,
      prev
        ? `prev=${prev.val}, diff=${diff}, minDiff=${minDiff}${isNewMin ? ' (刷新极小值!)' : ''}`
        : `prev=null, 首次访问最小节点 ${node.val}`,
    );

    steps.push({
      tree: cloneTree(root),
      currNodeVal: node.val,
      prevNodeVal: prev ? prev.val : null,
      currDiff: diff,
      minDiff,
      inorderSeq: [...inorderSeq],
      action: 'visit',
      decision: prev
        ? `计算当前差值 ${node.val} - ${prev.val} = ${diff}，当前最小差 ${minDiff}`
        : `首次访问中序首节点 ${node.val}，无需计算差值`,
      message: prev
        ? `访问节点 ${node.val}，中序前驱为 ${prev.val}。相邻差值 diff = ${node.val} - ${prev.val} = ${diff}。` +
          (isNewMin ? ` 🌟 成功刷新全局最小差值 minDiff = ${minDiff}！` : ` 当前全局最小差仍为 ${minDiff}。`)
        : `访问节点 ${node.val}，此时 prev 为 null，记录其为首个已访问节点。`,
      log: prev
        ? `visit ${node.val}: diff = ${node.val} - ${prev.val} = ${diff}, minDiff = ${minDiff}`
        : `visit ${node.val}: first node in inorder, prev is null`,
      codeLine: prev ? BST_MIN_DIFF_STAGE1_LINES.calcDiff : BST_MIN_DIFF_STAGE1_LINES.checkPrev,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: prev ? [node.val, prev.val] : [node.val],
    });

    // 更新 prev 指针
    prev = node;
    steps.push({
      tree: cloneTree(root),
      currNodeVal: node.val,
      prevNodeVal: prev.val,
      currDiff: diff,
      minDiff,
      inorderSeq: [...inorderSeq],
      action: 'visit',
      decision: `更新前驱指针 prev = ${node.val}`,
      message: `更新 prev = ${node.val}，为后续后继节点考察差值提供基准。`,
      log: `update prev = ${node.val}`,
      codeLine: BST_MIN_DIFF_STAGE1_LINES.updatePrev,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [node.val],
    });

    // 3. 递归右子树
    trace.addRecursePrep(`inorder(node.right=${node.right ? node.right.val : 'null'})`, depth, '深入右分支');
    steps.push({
      tree: cloneTree(root),
      currNodeVal: node.val,
      prevNodeVal: prev ? prev.val : null,
      currDiff: diff,
      minDiff,
      inorderSeq: [...inorderSeq],
      action: 'right',
      decision: `递归探索 ${node.val} 的右子树`,
      message: `左子树与根节点处理完毕，递归处理右子树 ${node.right ? node.right.val : 'null'}。`,
      log: `depth ${depth}: recurse right of node ${node.val}`,
      codeLine: BST_MIN_DIFF_STAGE1_LINES.rightRecurse,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [node.val],
    });
    inorder(node.right, depth + 1);

    trace.addReturnLeaf(`node=${node.val} 子树遍历完成`, depth, `minDiff=${minDiff}`);
  }

  inorder(root, 0);

  // 算法完成
  trace.addFinalResult('return minDiff', 0, `全树中序遍历结束，全局最小绝对差为 ${minDiff}`, String(minDiff));
  steps.push({
    tree: cloneTree(root),
    currNodeVal: null,
    prevNodeVal: (prev as TreeNode | null)?.val ?? null,
    currDiff: null,
    minDiff,
    inorderSeq: [...inorderSeq],
    action: 'done',
    decision: `中序遍历完成，输出最小绝对差 ${minDiff}`,
    message: `🎉 全树中序遍历结束，中序升序序列为 [${inorderSeq.join(', ')}]，任意两节点的最小绝对差为 ${minDiff}。`,
    log: `done: inorder sequence = [${inorderSeq.join(', ')}], minDiff = ${minDiff}`,
    codeLine: BST_MIN_DIFF_STAGE1_LINES.done,
    callTrace: trace.snapshot(),
    stageId: 'stage-1',
    highlightedNodes: [],
  });

  return steps;
}

// =========================================================================
// Stage 2: 显式单调栈迭代中序 (Iterative Explicit Stack Inorder)
// =========================================================================
export function buildBstMinDiffStage2Steps(root: TreeNode | null): BstMinDiffStep[] {
  const steps: BstMinDiffStep[] = [];
  let minDiff = Infinity;
  let prev: TreeNode | null = null;
  const inorderSeq: number[] = [];
  const stack: TreeNode[] = [];

  if (!root) {
    steps.push({
      tree: null,
      currNodeVal: null,
      prevNodeVal: null,
      currDiff: null,
      minDiff: 0,
      inorderSeq: [],
      action: 'done',
      decision: '空树输入，直接返回 0',
      message: '树为空，无节点可计算差值，返回 0。',
      log: 'empty tree -> return 0',
      codeLine: BST_MIN_DIFF_STAGE2_LINES.done,
      stageId: 'stage-2',
      stackVals: [],
    });
    return steps;
  }

  let curr: TreeNode | null = root;

  // 1. 初始化
  steps.push({
    tree: cloneTree(root),
    currNodeVal: curr.val,
    prevNodeVal: null,
    currDiff: null,
    minDiff,
    inorderSeq: [],
    action: 'enter',
    decision: '初始化显式栈与游标 curr = root',
    message: `初始化显式栈 stack = []，prev = null，游标指向根节点 ${curr.val}。`,
    log: `init: stack = [], curr = ${curr.val}`,
    codeLine: BST_MIN_DIFF_STAGE2_LINES.init,
    stageId: 'stage-2',
    highlightedNodes: [curr.val],
    stackVals: [],
  });

  while (curr !== null || stack.length > 0) {
    // 检查循环条件
    steps.push({
      tree: cloneTree(root),
      currNodeVal: curr ? curr.val : null,
      prevNodeVal: prev ? prev.val : null,
      currDiff: null,
      minDiff,
      inorderSeq: [...inorderSeq],
      action: 'left',
      decision: `循环条件检查: curr=${curr ? curr.val : 'null'}, stack 深度=${stack.length}`,
      message: `当前 curr = ${curr ? curr.val : 'null'}，栈内节点 [${stack.map((n) => n.val).join(', ')}]。继续推进遍历。`,
      log: `while loop check: curr=${curr ? curr.val : 'null'}, stack=[${stack.map((n) => n.val).join(', ')}]`,
      codeLine: BST_MIN_DIFF_STAGE2_LINES.whileLoop,
      stageId: 'stage-2',
      highlightedNodes: curr ? [curr.val] : [],
      stackVals: stack.map((n) => n.val),
    });

    // 左链一路入栈
    while (curr !== null) {
      stack.push(curr);
      steps.push({
        tree: cloneTree(root),
        currNodeVal: curr.val,
        prevNodeVal: prev ? prev.val : null,
        currDiff: null,
        minDiff,
        inorderSeq: [...inorderSeq],
        action: 'left',
        decision: `左孩子存在，节点 ${curr.val} 压栈，游标下潜向左`,
        message: `将节点 ${curr.val} 压入显式栈，curr 转向左孩子 ${curr.left ? curr.left.val : 'null'}。`,
        log: `push ${curr.val} to stack, curr = curr.left (${curr.left ? curr.left.val : 'null'})`,
        codeLine: BST_MIN_DIFF_STAGE2_LINES.pushLeft,
        stageId: 'stage-2',
        highlightedNodes: [curr.val],
        stackVals: stack.map((n) => n.val),
      });
      curr = curr.left;
    }

    // 弹出栈顶节点访问
    curr = stack.pop()!;
    steps.push({
      tree: cloneTree(root),
      currNodeVal: curr.val,
      prevNodeVal: prev ? prev.val : null,
      currDiff: null,
      minDiff,
      inorderSeq: [...inorderSeq],
      action: 'visit',
      decision: `左子树触底，从栈顶弹出节点 ${curr.val} 准备访问`,
      message: `从栈顶弹出节点 ${curr.val}。当前左子树已探查完毕，准备考察其值并与 prev 比较。`,
      log: `pop ${curr.val} from stack`,
      codeLine: BST_MIN_DIFF_STAGE2_LINES.popNode,
      stageId: 'stage-2',
      highlightedNodes: [curr.val],
      stackVals: stack.map((n) => n.val),
    });

    // 计算差值
    let diff: number | null = null;
    let isNewMin = false;
    if (prev !== null) {
      diff = curr.val - prev.val;
      if (diff < minDiff) {
        minDiff = diff;
        isNewMin = true;
      }
    }
    inorderSeq.push(curr.val);

    steps.push({
      tree: cloneTree(root),
      currNodeVal: curr.val,
      prevNodeVal: prev ? prev.val : null,
      currDiff: diff,
      minDiff,
      inorderSeq: [...inorderSeq],
      action: 'visit',
      decision: prev
        ? `计算差值: ${curr.val} - ${prev.val} = ${diff}，更新最小差 ${minDiff}`
        : `访问首个节点 ${curr.val}，prev 暂为 null`,
      message: prev
        ? `考察节点 ${curr.val}，中序前驱为 ${prev.val}。相邻差值 diff = ${diff}。` +
          (isNewMin ? ` 🌟 刷新全局最小差值 minDiff = ${minDiff}！` : ` 当前最小差仍为 ${minDiff}。`)
        : `访问中序首节点 ${curr.val}，前驱指针暂为 null，中序序列记录 [${inorderSeq.join(', ')}]。`,
      log: prev
        ? `calc diff: ${curr.val} - ${prev.val} = ${diff}, minDiff = ${minDiff}`
        : `first node ${curr.val} visited`,
      codeLine: prev ? BST_MIN_DIFF_STAGE2_LINES.calcDiff : BST_MIN_DIFF_STAGE2_LINES.checkPrev,
      stageId: 'stage-2',
      highlightedNodes: prev ? [curr.val, prev.val] : [curr.val],
      stackVals: stack.map((n) => n.val),
    });

    // 更新 prev
    prev = curr;
    steps.push({
      tree: cloneTree(root),
      currNodeVal: curr.val,
      prevNodeVal: prev.val,
      currDiff: diff,
      minDiff,
      inorderSeq: [...inorderSeq],
      action: 'visit',
      decision: `更新前驱节点指针 prev = ${curr.val}`,
      message: `更新 prev = ${curr.val}。`,
      log: `update prev = ${curr.val}`,
      codeLine: BST_MIN_DIFF_STAGE2_LINES.updatePrev,
      stageId: 'stage-2',
      highlightedNodes: [curr.val],
      stackVals: stack.map((n) => n.val),
    });

    // 转向右子树
    const nextRight = curr.right;
    steps.push({
      tree: cloneTree(root),
      currNodeVal: curr.val,
      prevNodeVal: prev.val,
      currDiff: diff,
      minDiff,
      inorderSeq: [...inorderSeq],
      action: 'right',
      decision: `游标转向右孩子 curr = curr.right (${nextRight ? nextRight.val : 'null'})`,
      message: `当前节点的左侧与自身处理完毕，游标移向右孩子 ${nextRight ? nextRight.val : 'null'}。`,
      log: `curr = curr.right (${nextRight ? nextRight.val : 'null'})`,
      codeLine: BST_MIN_DIFF_STAGE2_LINES.turnRight,
      stageId: 'stage-2',
      highlightedNodes: nextRight ? [nextRight.val] : [],
      stackVals: stack.map((n) => n.val),
    });
    curr = nextRight;
  }

  // 完成
  steps.push({
    tree: cloneTree(root),
    currNodeVal: null,
    prevNodeVal: prev ? prev.val : null,
    currDiff: null,
    minDiff,
    inorderSeq: [...inorderSeq],
    action: 'done',
    decision: `显式栈迭代完毕，最终最小差为 ${minDiff}`,
    message: `🎉 显式单调栈迭代遍历完毕，中序升序结果 [${inorderSeq.join(', ')}]，最小差值为 ${minDiff}。`,
    log: `iterative inorder done, minDiff = ${minDiff}`,
    codeLine: BST_MIN_DIFF_STAGE2_LINES.done,
    stageId: 'stage-2',
    highlightedNodes: [],
    stackVals: [],
  });

  return steps;
}

// =========================================================================
// Stage 3: Morris 中序遍历 (O(1) 常数空间神级算法)
// =========================================================================
export function buildBstMinDiffStage3Steps(root: TreeNode | null): BstMinDiffStep[] {
  const steps: BstMinDiffStep[] = [];
  let minDiff = Infinity;
  let prev: TreeNode | null = null;
  const inorderSeq: number[] = [];

  if (!root) {
    steps.push({
      tree: null,
      currNodeVal: null,
      prevNodeVal: null,
      currDiff: null,
      minDiff: 0,
      inorderSeq: [],
      action: 'done',
      decision: '空树输入，返回 0',
      message: '树为空，无节点可计算差值，返回 0。',
      log: 'empty tree -> return 0',
      codeLine: BST_MIN_DIFF_STAGE3_LINES.done,
      stageId: 'stage-3',
    });
    return steps;
  }

  let curr: TreeNode | null = root;

  steps.push({
    tree: cloneTree(root),
    currNodeVal: curr.val,
    prevNodeVal: null,
    currDiff: null,
    minDiff,
    inorderSeq: [],
    action: 'enter',
    decision: '初始化 Morris 遍历，curr 指向根节点',
    message: `初始化 Morris 中序遍历，游标指向根节点 ${curr.val}，无需任何显式或隐式栈空间。`,
    log: `init Morris traversal from root ${curr.val}`,
    codeLine: BST_MIN_DIFF_STAGE3_LINES.init,
    stageId: 'stage-3',
    highlightedNodes: [curr.val],
  });

  while (curr !== null) {
    steps.push({
      tree: cloneTree(root),
      currNodeVal: curr.val,
      prevNodeVal: prev ? prev.val : null,
      currDiff: null,
      minDiff,
      inorderSeq: [...inorderSeq],
      action: 'visit',
      decision: `检查当前节点 ${curr.val} 的左孩子状态`,
      message: `当前游标在节点 ${curr.val}，检查 curr.left 是否为空 (${curr.left ? curr.left.val : 'null'})。`,
      log: `check curr.left of ${curr.val}`,
      codeLine: BST_MIN_DIFF_STAGE3_LINES.whileCheck,
      stageId: 'stage-3',
      highlightedNodes: [curr.val],
    });

    if (curr.left === null) {
      // 无左子树：直接访问当前节点
      let diff: number | null = null;
      let isNewMin = false;
      if (prev !== null) {
        diff = curr.val - prev.val;
        if (diff < minDiff) {
          minDiff = diff;
          isNewMin = true;
        }
      }
      inorderSeq.push(curr.val);

      steps.push({
        tree: cloneTree(root),
        currNodeVal: curr.val,
        prevNodeVal: prev ? prev.val : null,
        currDiff: diff,
        minDiff,
        inorderSeq: [...inorderSeq],
        action: 'visit',
        decision: `curr.left 为空，直接访问节点 ${curr.val}，计算差值`,
        message: prev
          ? `节点 ${curr.val} 无左子树，直接访问。前驱为 ${prev.val}，差值 diff = ${diff}。` +
            (isNewMin ? ` 🌟 刷新最小差值 minDiff = ${minDiff}！` : ` 当前最小差为 ${minDiff}。`)
          : `节点 ${curr.val} 无左子树，为中序首个访问节点。`,
        log: prev
          ? `visit ${curr.val}: diff = ${diff}, minDiff = ${minDiff}`
          : `first visit node ${curr.val}`,
        codeLine: BST_MIN_DIFF_STAGE3_LINES.calcDiffNoLeft,
        stageId: 'stage-3',
        highlightedNodes: prev ? [curr.val, prev.val] : [curr.val],
      });

      // 更新 prev
      prev = curr;
      steps.push({
        tree: cloneTree(root),
        currNodeVal: curr.val,
        prevNodeVal: prev.val,
        currDiff: diff,
        minDiff,
        inorderSeq: [...inorderSeq],
        action: 'visit',
        decision: `更新前驱 prev = ${curr.val}`,
        message: `更新前驱指针 prev = ${curr.val}。`,
        log: `update prev = ${curr.val}`,
        codeLine: BST_MIN_DIFF_STAGE3_LINES.updatePrevNoLeft,
        stageId: 'stage-3',
        highlightedNodes: [curr.val],
      });

      // 移动到右孩子
      const nextRight: TreeNode | null = curr.right;
      steps.push({
        tree: cloneTree(root),
        currNodeVal: curr.val,
        prevNodeVal: prev.val,
        currDiff: diff,
        minDiff,
        inorderSeq: [...inorderSeq],
        action: 'right',
        decision: `移动至右孩子 curr = curr.right (${nextRight ? nextRight.val : 'null'})`,
        message: `转向右孩子 ${nextRight ? nextRight.val : 'null'}。`,
        log: `curr = curr.right (${nextRight ? nextRight.val : 'null'})`,
        codeLine: BST_MIN_DIFF_STAGE3_LINES.turnRightNoLeft,
        stageId: 'stage-3',
        highlightedNodes: nextRight ? [nextRight.val] : [],
      });
      curr = nextRight;
    } else {
      // 有左子树：找到中序前驱节点 mostRight
      let mostRight: TreeNode = curr.left!;
      while (mostRight.right !== null && mostRight.right !== curr) {
        mostRight = mostRight.right;
      }

      steps.push({
        tree: cloneTree(root),
        currNodeVal: curr.val,
        prevNodeVal: prev ? prev.val : null,
        currDiff: null,
        minDiff,
        inorderSeq: [...inorderSeq],
        action: 'left',
        decision: `在左子树中定位前驱节点 mostRight = ${mostRight.val}`,
        message: `寻找 ${curr.val} 左子树中最右侧的节点，找到前驱节点 ${mostRight.val}。当前其 right 指向 ${mostRight.right ? (mostRight.right === curr ? `curr(${curr.val})` : mostRight.right.val) : 'null'}。`,
        log: `find mostRight of ${curr.val}: node ${mostRight.val}`,
        codeLine: BST_MIN_DIFF_STAGE3_LINES.findPredecessor,
        stageId: 'stage-3',
        highlightedNodes: [curr.val, mostRight.val],
      });

      if (mostRight.right === null) {
        // 首次到达：建立线索
        mostRight.right = curr;
        steps.push({
          tree: cloneTree(root),
          currNodeVal: curr.val,
          prevNodeVal: prev ? prev.val : null,
          currDiff: null,
          minDiff,
          inorderSeq: [...inorderSeq],
          action: 'thread-build',
          decision: `首次到达，建立线索: ${mostRight.val}.right -> ${curr.val}，游标向左下潜`,
          message: `构建回溯桥梁：将前驱节点 ${mostRight.val} 的空闲 right 指针指向当前节点 ${curr.val}，随后向左下潜 curr = curr.left (${curr.left.val})。`,
          log: `build thread: ${mostRight.val}.right -> ${curr.val}, curr = ${curr.left.val}`,
          codeLine: BST_MIN_DIFF_STAGE3_LINES.buildThread,
          stageId: 'stage-3',
          highlightedNodes: [curr.val, mostRight.val],
          morrisThread: { from: mostRight.val, to: curr.val, active: true },
        });
        curr = curr.left;
      } else {
        // 二次到达：拆除线索，恢复二叉树拓扑
        mostRight.right = null;
        let diff: number | null = null;
        let isNewMin = false;
        if (prev !== null) {
          diff = curr.val - prev.val;
          if (diff < minDiff) {
            minDiff = diff;
            isNewMin = true;
          }
        }
        inorderSeq.push(curr.val);

        steps.push({
          tree: cloneTree(root),
          currNodeVal: curr.val,
          prevNodeVal: prev ? prev.val : null,
          currDiff: diff,
          minDiff,
          inorderSeq: [...inorderSeq],
          action: 'thread-cut',
          decision: `二次到达，拆除线索: ${mostRight.val}.right = null，访问节点 ${curr.val}，更新差值`,
          message: `左子树全部遍历完毕，恢复树拓扑（拆除 ${mostRight.val} 到 ${curr.val} 的线索）。访问当前节点 ${curr.val}。` +
            (prev
              ? ` 与前驱 ${prev.val} 的差值 diff = ${diff}。` + (isNewMin ? ` 🌟 刷新最小差值 minDiff = ${minDiff}！` : ` 当前最小差为 ${minDiff}。`)
              : ` 为首个访问节点。`),
          log: `cut thread ${mostRight.val}.right = null, visit ${curr.val}, diff = ${diff}, minDiff = ${minDiff}`,
          codeLine: BST_MIN_DIFF_STAGE3_LINES.cutThread,
          stageId: 'stage-3',
          highlightedNodes: prev ? [curr.val, prev.val] : [curr.val],
          morrisThread: { from: mostRight.val, to: curr.val, active: false },
        });

        // 更新 prev
        prev = curr;
        steps.push({
          tree: cloneTree(root),
          currNodeVal: curr.val,
          prevNodeVal: prev.val,
          currDiff: diff,
          minDiff,
          inorderSeq: [...inorderSeq],
          action: 'visit',
          decision: `更新前驱 prev = ${curr.val}，游标转向右孩子`,
          message: `更新前驱 prev = ${curr.val}，继续转向右孩子 ${curr.right ? curr.right.val : 'null'}。`,
          log: `update prev = ${curr.val}, curr = curr.right`,
          codeLine: BST_MIN_DIFF_STAGE3_LINES.updatePrevThread,
          stageId: 'stage-3',
          highlightedNodes: [curr.val],
        });
        curr = curr.right;
      }
    }
  }

  // 完成
  steps.push({
    tree: cloneTree(root),
    currNodeVal: null,
    prevNodeVal: prev ? prev.val : null,
    currDiff: null,
    minDiff,
    inorderSeq: [...inorderSeq],
    action: 'done',
    decision: `Morris 遍历结束，树结构 100% 恢复，最小绝对差为 ${minDiff}`,
    message: `🎉 Morris O(1) 空间遍历结束！树拓扑结构已完全恢复，中序升序结果 [${inorderSeq.join(', ')}]，最小差为 ${minDiff}。`,
    log: `Morris traversal done, minDiff = ${minDiff}`,
    codeLine: BST_MIN_DIFF_STAGE3_LINES.done,
    stageId: 'stage-3',
    highlightedNodes: [],
  });

  return steps;
}
