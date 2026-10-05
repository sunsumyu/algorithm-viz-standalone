/**
 * 二叉搜索树最小绝对差可视化器 (Minimum Absolute Difference in BST · LeetCode 530 / LC 783)
 * 采用顶层声明式架构与双版本综合长处整合 (Bi-Version Synthesis)
 *
 * Stage 1: 经典中序双指针递归 (Inorder Traversal with Prev Pointer · 经典递归)
 * Stage 2: 显式单调栈迭代中序 (Iterative Explicit Stack Inorder · 显式栈迭代)
 * Stage 3: Morris 中序遍历 (Morris Inorder Traversal · O(1) 常数空间神级算法)
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceAdapter,
  RecursiveCallTraceSnapshot,
} from '../../../core/renderers/adapters/recursive-call-trace-adapter';
import { HighlightTarget } from '../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr } from './tree-template';
import { cloneStateDepTree } from '../../../core/strategies/tree-clone';
import {
  BST_MIN_DIFF_PROBLEM_HTML,
  BST_MIN_DIFF_ANALYSIS_HTML,
} from './bst-min-diff-problem-content';
import {
  BST_MIN_DIFF_STAGE1_CODES,
  BST_MIN_DIFF_STAGE1_LINES,
  BST_MIN_DIFF_STAGE2_CODES,
  BST_MIN_DIFF_STAGE2_LINES,
  BST_MIN_DIFF_STAGE3_CODES,
  BST_MIN_DIFF_STAGE3_LINES,
} from './bst-min-diff-stage-codes';

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

function cloneTree(node: TreeNode | null, visited = new Set<TreeNode>()): TreeNode | null {
  if (!node || visited.has(node)) return null;
  visited.add(node);
  const copy: TreeNode = {
    val: node.val,
    left: cloneTree(node.left, visited),
    right: cloneTree(node.right, visited),
  };
  return copy;
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

// =========================================================================
// Card 1: 纯粹的树形沙盘渲染 (Pure SVG Sandbox)
// =========================================================================
export function renderBstMinDiffCanvas(container: HTMLElement, step: BstMinDiffStep): void {
  if (step.tree) {
    const highlights = step.highlightedNodes && step.highlightedNodes.length > 0
      ? step.highlightedNodes
      : (step.currNodeVal != null ? [step.currNodeVal] : []);

    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.currNodeVal,
      highlightedNodes: highlights,
      primaryColor: '#7c3aed', // 紫色当前节点
      visitedColor: '#10b981', // 翡翠绿已访问节点
      secondaryColor: '#f59e0b', // 琥珀黄前驱节点
    });
  } else {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
        <svg width="240" height="120" viewBox="0 0 240 120">
          <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空二叉树</text>
        </svg>
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">无节点可计算最小绝对差</span>
      </div>
    `;
  }
}

// =========================================================================
// Card 2: 领域指标监控与递归调用栈沙盘 (Custom Metrics & Recursive Call Trace / Stack Monitor)
// =========================================================================
export function renderBstMinDiffCustomMetrics(container: HTMLElement, step: BstMinDiffStep): void {
  const minDiffStr = step.minDiff === Infinity ? '∞' : String(step.minDiff);
  const currDiffStr = step.currDiff !== null ? String(step.currDiff) : '-';
  const prevValStr = step.prevNodeVal !== null ? String(step.prevNodeVal) : 'null';
  const currValStr = step.currNodeVal !== null ? String(step.currNodeVal) : '-';

  const inorderSeqHtml = step.inorderSeq && step.inorderSeq.length > 0
    ? step.inorderSeq
        .map((val, idx) => {
          const isLatest = idx === step.inorderSeq.length - 1;
          return `<span style="display:inline-block; padding:2px 6px; border-radius:4px; font-weight:700; font-size:11px; margin-right:4px; margin-bottom:4px; background:${isLatest ? '#fef3c7' : '#f1f5f9'}; color:${isLatest ? '#b45309' : '#475569'}; border:1px solid ${isLatest ? '#f59e0b' : '#cbd5e1'};">${val}</span>`;
        })
        .join('')
    : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">尚无访问节点</span>';

  let extraMetricHtml = '';
  if (step.stageId === 'stage-2') {
    const stackStr = step.stackVals && step.stackVals.length > 0
      ? step.stackVals.map((v) => `<span style="display:inline-block; padding:1px 5px; border-radius:3px; background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; font-size:10.5px; font-weight:700; margin-right:3px;">${v}</span>`).join(' ')
      : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">栈为空</span>';
    extraMetricHtml = `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px; margin-top:8px;">
        <div style="font-size:11px; font-weight:700; color:#0369a1; margin-bottom:4px; display:flex; align-items:center; gap:4px;">
          <span>🥞 显式调用栈 (Stack Top 在右侧)</span>
        </div>
        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:4px;">${stackStr}</div>
      </div>
    `;
  } else if (step.stageId === 'stage-3' && step.morrisThread) {
    const threadStatus = step.morrisThread.active
      ? `<span style="color:#16a34a; font-weight:700;">🟢 已连接 (${step.morrisThread.from} ➔ ${step.morrisThread.to})</span>`
      : `<span style="color:#dc2626; font-weight:700;">🔴 已拆除 (${step.morrisThread.from} ⇸ ${step.morrisThread.to})</span>`;
    extraMetricHtml = `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px; margin-top:8px;">
        <div style="font-size:11px; font-weight:700; color:#4338ca; margin-bottom:4px;">
          <span>🧵 Morris 线索桥梁状态</span>
        </div>
        <div style="font-size:11.5px; font-family:monospace;">${threadStatus}</div>
      </div>
    `;
  }

  container.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display:flex; flex-direction:column; gap:10px; font-family:system-ui, -apple-system, sans-serif;';
  wrapper.innerHTML = `
    <!-- 核心指标网格 -->
    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px;">
      <!-- 当前节点 -->
      <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:8px 10px; text-align:center;">
        <div style="font-size:10px; color:#0369a1; font-weight:700; text-transform:uppercase;">当前节点 curr</div>
        <div style="font-size:18px; font-weight:800; color:#0284c7; font-family:monospace; margin-top:2px;">${currValStr}</div>
      </div>

      <!-- 前驱节点 -->
      <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:8px 10px; text-align:center;">
        <div style="font-size:10px; color:#b45309; font-weight:700; text-transform:uppercase;">前驱 prev</div>
        <div style="font-size:18px; font-weight:800; color:#d97706; font-family:monospace; margin-top:2px;">${prevValStr}</div>
      </div>

      <!-- 当前相邻差值 -->
      <div style="background:#f5f3ff; border:1px solid #ddd6fe; border-radius:8px; padding:8px 10px; text-align:center;">
        <div style="font-size:10px; color:#6d28d9; font-weight:700; text-transform:uppercase;">相邻差 diff</div>
        <div style="font-size:18px; font-weight:800; color:#7c3aed; font-family:monospace; margin-top:2px;">${currDiffStr}</div>
      </div>

      <!-- 全局最小绝对差 -->
      <div style="background:#ecfdf5; border:1.5px solid #a7f3d0; border-radius:8px; padding:8px 10px; text-align:center;">
        <div style="font-size:10px; color:#047857; font-weight:700; text-transform:uppercase;">全局最小 minDiff</div>
        <div style="font-size:18px; font-weight:900; color:#059669; font-family:monospace; margin-top:2px;">${minDiffStr}</div>
      </div>
    </div>

    <!-- 中序递增序列流 -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
      <div style="font-size:11px; font-weight:700; color:#475569; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
        <span>📈 已访问中序升序序列</span>
        <span style="font-size:10px; color:#94a3b8; font-weight:normal;">元素个数: ${step.inorderSeq.length}</span>
      </div>
      <div style="display:flex; flex-wrap:wrap; align-items:center;">${inorderSeqHtml}</div>
    </div>

    ${extraMetricHtml}
  `;
  container.appendChild(wrapper);

  // 递归生命周期追踪 (Stage 1)
  if (step.callTrace) {
    const traceBox = document.createElement('div');
    traceBox.style.cssText = 'flex:1; min-height:160px; max-height:260px; overflow:hidden; display:flex; flex-direction:column;';
    RecursiveCallTraceAdapter.render(traceBox, step.callTrace);
    container.appendChild(traceBox);
  }

  // 决策解说卡
  const decisionCard = document.createElement('div');
  decisionCard.style.cssText = 'background:#faf5ff; border:1px dashed #d8b4fe; border-radius:8px; padding:8px 12px; font-size:11.5px; color:#581c87; line-height:1.5;';
  decisionCard.innerHTML = `<span style="font-weight:700; color:#7e22ce;">💡 当前决策：</span>${step.decision}`;
  container.appendChild(decisionCard);
}

// =========================================================================
// 注册顶层声明式算法 (Bi-Version Synthesis)
// =========================================================================
registerDeclarativeAlgorithm({
  id: 'bst-min-diff',
  aliases: ['leetcode-530', 'leetcode-783', 'minimum-absolute-difference-in-bst'],
  name: '二叉搜索树的最小绝对差',
  category: 'tree',
  icon: '📏',
  difficulty: 'easy',
  learningGoal: '利用BST中序遍历严格升序的单调性质，将全局任意两节点最小绝对差规约为相邻两项的极小差。',
  problemHtml: BST_MIN_DIFF_PROBLEM_HTML,
  analysisHtml: BST_MIN_DIFF_ANALYSIS_HTML,
  codeLanguages: BST_MIN_DIFF_STAGE1_CODES,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 经典中序双指针递归',
      shortName: '双指针递归',
      num: 1,
      codeLanguages: BST_MIN_DIFF_STAGE1_CODES,
      buildSteps: (inputs: Record<string, unknown>) => {
        const arr = parseTreeArray(inputs?.['input-tree'] || '[4, 2, 6, 1, 3]', [4, 2, 6, 1, 3]);
        const root = buildTreeFromArr(arr);
        return buildBstMinDiffStage1Steps(root);
      },
      renderCanvas: (container, step) => renderBstMinDiffCanvas(container, step as BstMinDiffStep),
      renderCustomMetrics: (container, step) => renderBstMinDiffCustomMetrics(container, step as BstMinDiffStep),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 显式单调栈迭代中序',
      shortName: '显式栈迭代',
      num: 2,
      codeLanguages: BST_MIN_DIFF_STAGE2_CODES,
      buildSteps: (inputs: Record<string, unknown>) => {
        const arr = parseTreeArray(inputs?.['input-tree'] || '[4, 2, 6, 1, 3]', [4, 2, 6, 1, 3]);
        const root = buildTreeFromArr(arr);
        return buildBstMinDiffStage2Steps(root);
      },
      renderCanvas: (container, step) => renderBstMinDiffCanvas(container, step as BstMinDiffStep),
      renderCustomMetrics: (container, step) => renderBstMinDiffCustomMetrics(container, step as BstMinDiffStep),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: Morris 空间常数遍历',
      shortName: 'Morris 常数空间',
      num: 3,
      codeLanguages: BST_MIN_DIFF_STAGE3_CODES,
      buildSteps: (inputs: Record<string, unknown>) => {
        const arr = parseTreeArray(inputs?.['input-tree'] || '[4, 2, 6, 1, 3]', [4, 2, 6, 1, 3]);
        const root = buildTreeFromArr(arr);
        return buildBstMinDiffStage3Steps(root);
      },
      renderCanvas: (container, step) => renderBstMinDiffCanvas(container, step as BstMinDiffStep),
      renderCustomMetrics: (container, step) => renderBstMinDiffCustomMetrics(container, step as BstMinDiffStep),
    },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: 'BST 层序序列 (JSON/逗号数组)',
      type: 'text',
      defaultValue: '[4, 2, 6, 1, 3]',
      placeholder: '例如: [4, 2, 6, 1, 3] 或 [1, 0, 48, null, null, 12, 49]',
    },
  ],
  presets: [
    {
      label: '经典BST [4, 2, 6, 1, 3] (最小差为 1)',
      values: { 'input-tree': '[4, 2, 6, 1, 3]' },
      description: '标准经典用例，中序为 [1, 2, 3, 4, 6]，最小差为 1',
    },
    {
      label: '非对称BST [1, 0, 48, null, null, 12, 49] (最小差为 1)',
      values: { 'input-tree': '[1, 0, 48, null, null, 12, 49]' },
      description: '右深非平衡BST，中序为 [0, 1, 12, 48, 49]，最小差为 1',
    },
    {
      label: '大数值BST [236, 104, 701, null, 227, null, 911] (最小差为 9)',
      values: { 'input-tree': '[236, 104, 701, null, 227, null, 911]' },
      description: '跨度大数值BST，最小差为 236 - 227 = 9',
    },
    {
      label: '三节点BST [5, 1, 7] (最小差为 2)',
      values: { 'input-tree': '[5, 1, 7]' },
      description: '简单三节点BST，中序为 [1, 5, 7]，最小差为 2',
    },
  ],
  generateSteps: (inputs: Record<string, unknown>) => {
    const arr = parseTreeArray(inputs?.['input-tree'] || '[4, 2, 6, 1, 3]', [4, 2, 6, 1, 3]);
    const root = buildTreeFromArr(arr);
    return buildBstMinDiffStage1Steps(root);
  },
  buildSteps: (inputs: Record<string, unknown>) => {
    const arr = parseTreeArray(inputs?.['input-tree'] || '[4, 2, 6, 1, 3]', [4, 2, 6, 1, 3]);
    const root = buildTreeFromArr(arr);
    return buildBstMinDiffStage1Steps(root);
  },
  renderCanvas: (container, step) => renderBstMinDiffCanvas(container, step as BstMinDiffStep),
  renderCustomMetrics: (container, step) => renderBstMinDiffCustomMetrics(container, step as BstMinDiffStep),
});
