/**
 * BST 众数状态步进编译器 (LC 501 · Find Mode in Binary Search Tree)
 *
 * 封装 BST 众数的三大多阶段推演算法：
 * 1. Stage 1: 经典中序双指针在线动态结算递归 (Inorder Traversal with Dynamic Update)
 * 2. Stage 2: 显式单调栈迭代中序 (Iterative Explicit Stack Inorder)
 * 3. Stage 3: Morris 空间常数遍历 (Morris Inorder Traversal · O(1) 常数空间进阶算法)
 */

import { TreeNode } from '../../../algorithms/categories/tree/tree-template';
import { HighlightTarget } from '../../step-visualizer';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from './recursive-call-trace-adapter';
import {
  BST_MODES_STAGE1_LINES,
  BST_MODES_STAGE2_LINES,
  BST_MODES_STAGE3_LINES,
} from '../../../algorithms/categories/tree/bst-modes-stage-codes';

export interface BstModesStep {
  tree: TreeNode | null;
  currNodeVal: number | null;
  prevNodeVal: number | null;
  count: number;
  maxCount: number;
  modes: number[];
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

/** 防环安全树克隆 (特别是 Morris 遍历中可能产生临时回路) */
export function cloneTree(node: TreeNode | null, visited = new Set<TreeNode>()): TreeNode | null {
  if (!node || visited.has(node)) return null;
  visited.add(node);
  return {
    val: node.val,
    left: cloneTree(node.left, visited),
    right: cloneTree(node.right, visited),
  };
}

// =========================================================================
// Stage 1: 经典中序双指针在线动态结算递归
// =========================================================================
export function buildBstModesStage1Steps(root: TreeNode | null): BstModesStep[] {
  const steps: BstModesStep[] = [];
  const trace = new RecursiveCallTraceBuilder();
  let count = 0;
  let maxCount = 0;
  let prev: TreeNode | null = null;
  let modes: number[] = [];
  const inorderSeq: number[] = [];

  if (!root) {
    trace.addHeader('findMode(root=null)', 0, '空树特判');
    trace.addConditionHit('root == null -> return []', 0, '树为空，无众数');
    trace.addFinalResult('return []', 0, '空树结束', '[]');
    steps.push({
      tree: null,
      currNodeVal: null,
      prevNodeVal: null,
      count: 0,
      maxCount: 0,
      modes: [],
      inorderSeq: [],
      action: 'done',
      decision: '空树输入，返回空数组 []',
      message: '树为空，无节点，直接返回 []。',
      log: 'empty tree -> return []',
      codeLine: BST_MODES_STAGE1_LINES.done,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
    });
    return steps;
  }

  // 初始化入口
  trace.addHeader(`findMode(root=${root.val})`, 0, '初始化 count=0, maxCount=0, modes=[]');
  steps.push({
    tree: cloneTree(root),
    currNodeVal: root.val,
    prevNodeVal: null,
    count: 0,
    maxCount: 0,
    modes: [],
    inorderSeq: [],
    action: 'enter',
    decision: '初始化算法全局状态，开启中序递归遍历',
    message: `初始化 count=0, maxCount=0, modes=[]，从根节点 ${root.val} 开始中序遍历。`,
    log: `init: count=0, maxCount=0, start inorder traversal from root ${root.val}`,
    codeLine: BST_MODES_STAGE1_LINES.entry,
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
        count,
        maxCount,
        modes: [...modes],
        inorderSeq: [...inorderSeq],
        action: 'visit',
        decision: '到达空节点，直接返回上一层递归',
        message: '到达叶子下方的空子树，满足 node == null，返回父调用。',
        log: `depth ${depth}: node == null, return`,
        codeLine: BST_MODES_STAGE1_LINES.checkNull,
        callTrace: trace.snapshot(),
        stageId: 'stage-1',
        highlightedNodes: prev ? [prev.val] : [],
      });
      return;
    }

    // 进入当前节点
    trace.addHeader(`inorder(node=${node.val})`, depth, `进入节点 ${node.val}`);
    steps.push({
      tree: cloneTree(root),
      currNodeVal: node.val,
      prevNodeVal: prev ? prev.val : null,
      count,
      maxCount,
      modes: [...modes],
      inorderSeq: [...inorderSeq],
      action: 'enter',
      decision: `进入节点 ${node.val}，探索其左子树`,
      message: `进入 inorder(node=${node.val})，准备遍历左子树。`,
      log: `depth ${depth}: enter inorder(${node.val})`,
      codeLine: BST_MODES_STAGE1_LINES.inorderEnter,
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
      count,
      maxCount,
      modes: [...modes],
      inorderSeq: [...inorderSeq],
      action: 'left',
      decision: `深入左子树 node.left (${node.left ? node.left.val : 'null'})`,
      message: `递归左子树：按照中序先左后根的规则下潜。`,
      log: `depth ${depth}: recurse left of node ${node.val}`,
      codeLine: BST_MODES_STAGE1_LINES.leftRecurse,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [node.val],
    });
    inorder(node.left, depth + 1);

    // 2. 访问当前节点：更新 count
    const isSame = prev !== null && prev.val === node.val;
    if (isSame) {
      count++;
    } else {
      count = 1;
    }
    inorderSeq.push(node.val);

    trace.addUnwindCalc(
      `countUpdate(${node.val})`,
      depth,
      isSame ? `与前驱相同: count 累加为 ${count}` : `与前驱不同: count 重置为 1`,
    );

    steps.push({
      tree: cloneTree(root),
      currNodeVal: node.val,
      prevNodeVal: prev ? prev.val : null,
      count,
      maxCount,
      modes: [...modes],
      inorderSeq: [...inorderSeq],
      action: 'visit',
      decision: isSame
        ? `节点值 ${node.val} == prev.val (${prev?.val})，计数 count 累加至 ${count}`
        : `节点值 ${node.val} 与前驱不同，计数 count 重置为 1`,
      message: isSame
        ? `访问节点 ${node.val}，与前驱相同，当前值连续出现频率上升至 ${count}。`
        : `访问节点 ${node.val}，新元素出现，频次从 1 开始统计。`,
      log: `visit ${node.val}: count = ${count} (prev = ${prev ? prev.val : 'null'})`,
      codeLine: BST_MODES_STAGE1_LINES.countUpdate,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: prev ? [node.val, prev.val] : [node.val],
    });

    // 比较 maxCount 更新众数集合
    let actionDesc = '';
    if (count > maxCount) {
      maxCount = count;
      modes = [node.val];
      actionDesc = `🌟 破纪录！count (${count}) > maxCount，重置众数集合 modes = [${node.val}]`;
    } else if (count === maxCount) {
      modes.push(node.val);
      actionDesc = `🤝 并列最高！count (${count}) == maxCount，追加众数 modes = [${modes.join(', ')}]`;
    } else {
      actionDesc = `当前 count (${count}) < maxCount (${maxCount})，不改变众数列表`;
    }

    trace.addUnwindCalc(`maxCountUpdate`, depth, actionDesc);

    steps.push({
      tree: cloneTree(root),
      currNodeVal: node.val,
      prevNodeVal: prev ? prev.val : null,
      count,
      maxCount,
      modes: [...modes],
      inorderSeq: [...inorderSeq],
      action: 'visit',
      decision: actionDesc,
      message: actionDesc,
      log: `modes update: maxCount = ${maxCount}, modes = [${modes.join(', ')}]`,
      codeLine: BST_MODES_STAGE1_LINES.maxCountUpdate,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [node.val],
    });

    // 更新 prev 指针
    prev = node;
    steps.push({
      tree: cloneTree(root),
      currNodeVal: node.val,
      prevNodeVal: prev.val,
      count,
      maxCount,
      modes: [...modes],
      inorderSeq: [...inorderSeq],
      action: 'visit',
      decision: `更新前驱指针 prev = ${node.val}`,
      message: `更新 prev = ${node.val}，为后续节点连续性判断提供基准。`,
      log: `update prev = ${node.val}`,
      codeLine: BST_MODES_STAGE1_LINES.updatePrev,
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
      count,
      maxCount,
      modes: [...modes],
      inorderSeq: [...inorderSeq],
      action: 'right',
      decision: `递归探索 ${node.val} 的右子树`,
      message: `根节点处理完成，递归探索右子树 ${node.right ? node.right.val : 'null'}。`,
      log: `depth ${depth}: recurse right of node ${node.val}`,
      codeLine: BST_MODES_STAGE1_LINES.rightRecurse,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [node.val],
    });
    inorder(node.right, depth + 1);

    trace.addReturnLeaf(`node=${node.val} 子树遍历完成`, depth);
  }

  inorder(root, 0);

  // 遍历完成
  trace.addFinalResult('return modes', 0, `众数检索完成，最高频次 ${maxCount}，众数集合: [${modes.join(', ')}]`, `[${modes.join(',')}]`);
  steps.push({
    tree: cloneTree(root),
    currNodeVal: null,
    prevNodeVal: (prev as TreeNode | null)?.val ?? null,
    count,
    maxCount,
    modes: [...modes],
    inorderSeq: [...inorderSeq],
    action: 'done',
    decision: `中序遍历完成，最终众数为 [${modes.join(', ')}]，最高频次 ${maxCount}`,
    message: `🎉 全树遍历完毕！中序升序结果 [${inorderSeq.join(', ')}]，最高频次 maxCount = ${maxCount}，众数集合为 [${modes.join(', ')}]。`,
    log: `done: modes = [${modes.join(', ')}], maxCount = ${maxCount}`,
    codeLine: BST_MODES_STAGE1_LINES.done,
    callTrace: trace.snapshot(),
    stageId: 'stage-1',
    highlightedNodes: modes,
  });

  return steps;
}

// =========================================================================
// Stage 2: 显式单调栈迭代中序
// =========================================================================
export function buildBstModesStage2Steps(root: TreeNode | null): BstModesStep[] {
  const steps: BstModesStep[] = [];
  let count = 0;
  let maxCount = 0;
  let prev: TreeNode | null = null;
  let modes: number[] = [];
  const inorderSeq: number[] = [];
  const stack: TreeNode[] = [];

  if (!root) {
    steps.push({
      tree: null,
      currNodeVal: null,
      prevNodeVal: null,
      count: 0,
      maxCount: 0,
      modes: [],
      inorderSeq: [],
      action: 'done',
      decision: '空树输入，返回空数组 []',
      message: '树为空，返回 []。',
      log: 'empty tree -> return []',
      codeLine: BST_MODES_STAGE2_LINES.done,
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
    count: 0,
    maxCount: 0,
    modes: [],
    inorderSeq: [],
    action: 'enter',
    decision: '初始化显式栈与游标 curr = root',
    message: `初始化显式栈 stack = []，modes = []，游标 curr 指向根节点 ${curr.val}。`,
    log: `init: stack = [], curr = ${curr.val}`,
    codeLine: BST_MODES_STAGE2_LINES.init,
    stageId: 'stage-2',
    highlightedNodes: [curr.val],
    stackVals: [],
  });

  while (curr !== null || stack.length > 0) {
    steps.push({
      tree: cloneTree(root),
      currNodeVal: curr ? curr.val : null,
      prevNodeVal: prev ? prev.val : null,
      count,
      maxCount,
      modes: [...modes],
      inorderSeq: [...inorderSeq],
      action: 'left',
      decision: `循环条件检查: curr=${curr ? curr.val : 'null'}, stack 深度=${stack.length}`,
      message: `当前 curr = ${curr ? curr.val : 'null'}，栈内节点 [${stack.map((n) => n.val).join(', ')}]。`,
      log: `while loop check: curr=${curr ? curr.val : 'null'}, stack=[${stack.map((n) => n.val).join(', ')}]`,
      codeLine: BST_MODES_STAGE2_LINES.whileLoop,
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
        count,
        maxCount,
        modes: [...modes],
        inorderSeq: [...inorderSeq],
        action: 'left',
        decision: `左孩子存在，节点 ${curr.val} 入栈，向左下潜`,
        message: `将节点 ${curr.val} 压入显式栈，curr 下潜至左孩子 ${curr.left ? curr.left.val : 'null'}。`,
        log: `push ${curr.val} to stack, curr = curr.left (${curr.left ? curr.left.val : 'null'})`,
        codeLine: BST_MODES_STAGE2_LINES.pushLeft,
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
      count,
      maxCount,
      modes: [...modes],
      inorderSeq: [...inorderSeq],
      action: 'visit',
      decision: `从栈顶弹出节点 ${curr.val} 准备访问`,
      message: `从栈顶弹出节点 ${curr.val}，左子树已探索完毕，开始统计该节点频次。`,
      log: `pop ${curr.val} from stack`,
      codeLine: BST_MODES_STAGE2_LINES.popNode,
      stageId: 'stage-2',
      highlightedNodes: [curr.val],
      stackVals: stack.map((n) => n.val),
    });

    // 统计 count
    const isSame = prev !== null && prev.val === curr.val;
    if (isSame) {
      count++;
    } else {
      count = 1;
    }
    inorderSeq.push(curr.val);

    steps.push({
      tree: cloneTree(root),
      currNodeVal: curr.val,
      prevNodeVal: prev ? prev.val : null,
      count,
      maxCount,
      modes: [...modes],
      inorderSeq: [...inorderSeq],
      action: 'visit',
      decision: isSame
        ? `节点值 ${curr.val} 与前驱相同，count 累加至 ${count}`
        : `节点值 ${curr.val} 与前驱不同，count 重置为 1`,
      message: isSame
        ? `节点 ${curr.val} 再次出现，当前频次为 ${count}。`
        : `节点 ${curr.val} 首次出现，频次置为 1。`,
      log: `count update: node ${curr.val}, count = ${count}`,
      codeLine: BST_MODES_STAGE2_LINES.countUpdate,
      stageId: 'stage-2',
      highlightedNodes: prev ? [curr.val, prev.val] : [curr.val],
      stackVals: stack.map((n) => n.val),
    });

    // 比较 maxCount 更新众数
    let actionDesc = '';
    if (count > maxCount) {
      maxCount = count;
      modes = [curr.val];
      actionDesc = `🌟 破纪录！count (${count}) > maxCount，重置众数集合 modes = [${curr.val}]`;
    } else if (count === maxCount) {
      modes.push(curr.val);
      actionDesc = `🤝 并列最高！count (${count}) == maxCount，追加众数 modes = [${modes.join(', ')}]`;
    } else {
      actionDesc = `当前 count (${count}) < maxCount (${maxCount})，不改变众数列表`;
    }

    steps.push({
      tree: cloneTree(root),
      currNodeVal: curr.val,
      prevNodeVal: prev ? prev.val : null,
      count,
      maxCount,
      modes: [...modes],
      inorderSeq: [...inorderSeq],
      action: 'visit',
      decision: actionDesc,
      message: actionDesc,
      log: `modes update: maxCount = ${maxCount}, modes = [${modes.join(', ')}]`,
      codeLine: BST_MODES_STAGE2_LINES.maxCountUpdate,
      stageId: 'stage-2',
      highlightedNodes: [curr.val],
      stackVals: stack.map((n) => n.val),
    });

    // 更新 prev
    prev = curr;
    steps.push({
      tree: cloneTree(root),
      currNodeVal: curr.val,
      prevNodeVal: prev.val,
      count,
      maxCount,
      modes: [...modes],
      inorderSeq: [...inorderSeq],
      action: 'visit',
      decision: `更新前驱 prev = ${curr.val}`,
      message: `更新前驱节点指针 prev = ${curr.val}。`,
      log: `update prev = ${curr.val}`,
      codeLine: BST_MODES_STAGE2_LINES.updatePrev,
      stageId: 'stage-2',
      highlightedNodes: [curr.val],
      stackVals: stack.map((n) => n.val),
    });

    // 转向右孩子
    const nextRight = curr.right;
    steps.push({
      tree: cloneTree(root),
      currNodeVal: curr.val,
      prevNodeVal: prev.val,
      count,
      maxCount,
      modes: [...modes],
      inorderSeq: [...inorderSeq],
      action: 'right',
      decision: `游标移向右孩子 curr = curr.right (${nextRight ? nextRight.val : 'null'})`,
      message: `当前节点自身处理完毕，移向右孩子 ${nextRight ? nextRight.val : 'null'}。`,
      log: `curr = curr.right (${nextRight ? nextRight.val : 'null'})`,
      codeLine: BST_MODES_STAGE2_LINES.turnRight,
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
    count,
    maxCount,
    modes: [...modes],
    inorderSeq: [...inorderSeq],
    action: 'done',
    decision: `显式单调栈迭代完毕，众数集合为 [${modes.join(', ')}]`,
    message: `🎉 显式栈遍历结束，最高频次为 ${maxCount}，最终众数集合: [${modes.join(', ')}]。`,
    log: `iterative done: modes = [${modes.join(', ')}], maxCount = ${maxCount}`,
    codeLine: BST_MODES_STAGE2_LINES.done,
    stageId: 'stage-2',
    highlightedNodes: modes,
    stackVals: [],
  });

  return steps;
}

// =========================================================================
// Stage 3: Morris 空间常数遍历 (O(1) 辅助空间)
// =========================================================================
export function buildBstModesStage3Steps(root: TreeNode | null): BstModesStep[] {
  const steps: BstModesStep[] = [];
  let count = 0;
  let maxCount = 0;
  let prev: TreeNode | null = null;
  let modes: number[] = [];
  const inorderSeq: number[] = [];

  if (!root) {
    steps.push({
      tree: null,
      currNodeVal: null,
      prevNodeVal: null,
      count: 0,
      maxCount: 0,
      modes: [],
      inorderSeq: [],
      action: 'done',
      decision: '空树输入，返回空数组 []',
      message: '树为空，返回 []。',
      log: 'empty tree -> return []',
      codeLine: BST_MODES_STAGE3_LINES.done,
      stageId: 'stage-3',
    });
    return steps;
  }

  let curr: TreeNode | null = root;

  steps.push({
    tree: cloneTree(root),
    currNodeVal: curr.val,
    prevNodeVal: null,
    count: 0,
    maxCount: 0,
    modes: [],
    inorderSeq: [],
    action: 'enter',
    decision: '初始化 Morris 遍历，curr 指向根节点',
    message: `初始化 Morris 众数检索，游标指向根节点 ${curr.val}，辅助空间严格为 O(1)。`,
    log: `init Morris traversal for modes from root ${curr.val}`,
    codeLine: BST_MODES_STAGE3_LINES.init,
    stageId: 'stage-3',
    highlightedNodes: [curr.val],
  });

  while (curr !== null) {
    steps.push({
      tree: cloneTree(root),
      currNodeVal: curr.val,
      prevNodeVal: prev ? prev.val : null,
      count,
      maxCount,
      modes: [...modes],
      inorderSeq: [...inorderSeq],
      action: 'visit',
      decision: `检查节点 ${curr.val} 的左孩子是否存在`,
      message: `当前游标在节点 ${curr.val}，检查 curr.left 是否为空 (${curr.left ? curr.left.val : 'null'})。`,
      log: `check curr.left of ${curr.val}`,
      codeLine: BST_MODES_STAGE3_LINES.whileCheck,
      stageId: 'stage-3',
      highlightedNodes: [curr.val],
    });

    if (curr.left === null) {
      // 无左子树：直接访问当前节点
      const isSame = prev !== null && prev.val === curr.val;
      if (isSame) {
        count++;
      } else {
        count = 1;
      }
      inorderSeq.push(curr.val);

      steps.push({
        tree: cloneTree(root),
        currNodeVal: curr.val,
        prevNodeVal: prev ? prev.val : null,
        count,
        maxCount,
        modes: [...modes],
        inorderSeq: [...inorderSeq],
        action: 'visit',
        decision: `curr.left 为空，直接访问节点 ${curr.val}，计数 count = ${count}`,
        message: `节点 ${curr.val} 无左子树，直接访问。count = ${count}。`,
        log: `visit ${curr.val}: count = ${count}`,
        codeLine: BST_MODES_STAGE3_LINES.countNoLeft,
        stageId: 'stage-3',
        highlightedNodes: prev ? [curr.val, prev.val] : [curr.val],
      });

      // 比较 maxCount 更新众数
      let actionDesc = '';
      if (count > maxCount) {
        maxCount = count;
        modes = [curr.val];
        actionDesc = `🌟 破纪录！count (${count}) > maxCount，重置众数 modes = [${curr.val}]`;
      } else if (count === maxCount) {
        modes.push(curr.val);
        actionDesc = `🤝 并列最高！count (${count}) == maxCount，追加众数 modes = [${modes.join(', ')}]`;
      } else {
        actionDesc = `当前 count (${count}) < maxCount (${maxCount})，不改变众数列表`;
      }

      steps.push({
        tree: cloneTree(root),
        currNodeVal: curr.val,
        prevNodeVal: prev ? prev.val : null,
        count,
        maxCount,
        modes: [...modes],
        inorderSeq: [...inorderSeq],
        action: 'visit',
        decision: actionDesc,
        message: actionDesc,
        log: `modes update: maxCount = ${maxCount}, modes = [${modes.join(', ')}]`,
        codeLine: BST_MODES_STAGE3_LINES.maxCountNoLeft,
        stageId: 'stage-3',
        highlightedNodes: [curr.val],
      });

      // 更新 prev
      prev = curr;
      steps.push({
        tree: cloneTree(root),
        currNodeVal: curr.val,
        prevNodeVal: prev.val,
        count,
        maxCount,
        modes: [...modes],
        inorderSeq: [...inorderSeq],
        action: 'visit',
        decision: `更新前驱 prev = ${curr.val}`,
        message: `更新前驱指针 prev = ${curr.val}。`,
        log: `update prev = ${curr.val}`,
        codeLine: BST_MODES_STAGE3_LINES.updatePrevNoLeft,
        stageId: 'stage-3',
        highlightedNodes: [curr.val],
      });

      // 移动到右孩子
      const nextRight: TreeNode | null = curr.right;
      steps.push({
        tree: cloneTree(root),
        currNodeVal: curr.val,
        prevNodeVal: prev.val,
        count,
        maxCount,
        modes: [...modes],
        inorderSeq: [...inorderSeq],
        action: 'right',
        decision: `移动至右孩子 curr = curr.right (${nextRight ? nextRight.val : 'null'})`,
        message: `转向右孩子 ${nextRight ? nextRight.val : 'null'}。`,
        log: `curr = curr.right (${nextRight ? nextRight.val : 'null'})`,
        codeLine: BST_MODES_STAGE3_LINES.turnRightNoLeft,
        stageId: 'stage-3',
        highlightedNodes: nextRight ? [nextRight.val] : [],
      });
      curr = nextRight;
    } else {
      // 有左子树：寻找中序前驱
      let mostRight: TreeNode = curr.left!;
      while (mostRight.right !== null && mostRight.right !== curr) {
        mostRight = mostRight.right;
      }

      steps.push({
        tree: cloneTree(root),
        currNodeVal: curr.val,
        prevNodeVal: prev ? prev.val : null,
        count,
        maxCount,
        modes: [...modes],
        inorderSeq: [...inorderSeq],
        action: 'left',
        decision: `定位中序前驱节点 mostRight = ${mostRight.val}`,
        message: `寻找 ${curr.val} 左子树中最右侧节点，定位到前驱节点 ${mostRight.val}。`,
        log: `find mostRight of ${curr.val}: node ${mostRight.val}`,
        codeLine: BST_MODES_STAGE3_LINES.findPredecessor,
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
          count,
          maxCount,
          modes: [...modes],
          inorderSeq: [...inorderSeq],
          action: 'thread-build',
          decision: `首次到达，建立线索: ${mostRight.val}.right -> ${curr.val}，游标向左下潜`,
          message: `构建回溯桥梁：将前驱节点 ${mostRight.val} 的空闲 right 指针指向当前节点 ${curr.val}，向左下潜 curr = curr.left。`,
          log: `build thread: ${mostRight.val}.right -> ${curr.val}, curr = ${curr.left.val}`,
          codeLine: BST_MODES_STAGE3_LINES.buildThread,
          stageId: 'stage-3',
          highlightedNodes: [curr.val, mostRight.val],
          morrisThread: { from: mostRight.val, to: curr.val, active: true },
        });
        curr = curr.left;
      } else {
        // 二次到达：拆除线索，访问当前节点
        mostRight.right = null;
        const isSame = prev !== null && prev.val === curr.val;
        if (isSame) {
          count++;
        } else {
          count = 1;
        }
        inorderSeq.push(curr.val);

        steps.push({
          tree: cloneTree(root),
          currNodeVal: curr.val,
          prevNodeVal: prev ? prev.val : null,
          count,
          maxCount,
          modes: [...modes],
          inorderSeq: [...inorderSeq],
          action: 'thread-cut',
          decision: `二次到达，拆除线索: ${mostRight.val}.right = null，访问节点 ${curr.val}，count = ${count}`,
          message: `左子树全部遍历完毕，恢复树拓扑（拆除线索），访问当前节点 ${curr.val}，当前计数 count = ${count}。`,
          log: `cut thread ${mostRight.val}.right = null, visit ${curr.val}, count = ${count}`,
          codeLine: BST_MODES_STAGE3_LINES.countThread,
          stageId: 'stage-3',
          highlightedNodes: prev ? [curr.val, prev.val] : [curr.val],
          morrisThread: { from: mostRight.val, to: curr.val, active: false },
        });

        // 比较 maxCount 更新众数
        let actionDesc = '';
        if (count > maxCount) {
          maxCount = count;
          modes = [curr.val];
          actionDesc = `🌟 破纪录！count (${count}) > maxCount，重置众数 modes = [${curr.val}]`;
        } else if (count === maxCount) {
          modes.push(curr.val);
          actionDesc = `🤝 并列最高！count (${count}) == maxCount，追加众数 modes = [${modes.join(', ')}]`;
        } else {
          actionDesc = `当前 count (${count}) < maxCount (${maxCount})，不改变众数列表`;
        }

        steps.push({
          tree: cloneTree(root),
          currNodeVal: curr.val,
          prevNodeVal: prev ? prev.val : null,
          count,
          maxCount,
          modes: [...modes],
          inorderSeq: [...inorderSeq],
          action: 'visit',
          decision: actionDesc,
          message: actionDesc,
          log: `modes update: maxCount = ${maxCount}, modes = [${modes.join(', ')}]`,
          codeLine: BST_MODES_STAGE3_LINES.maxCountThread,
          stageId: 'stage-3',
          highlightedNodes: [curr.val],
        });

        // 更新 prev
        prev = curr;
        steps.push({
          tree: cloneTree(root),
          currNodeVal: curr.val,
          prevNodeVal: prev.val,
          count,
          maxCount,
          modes: [...modes],
          inorderSeq: [...inorderSeq],
          action: 'visit',
          decision: `更新前驱 prev = ${curr.val}，游标转向右孩子`,
          message: `更新前驱 prev = ${curr.val}，继续转向右孩子 ${curr.right ? curr.right.val : 'null'}。`,
          log: `update prev = ${curr.val}, curr = curr.right`,
          codeLine: BST_MODES_STAGE3_LINES.updatePrevThread,
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
    count,
    maxCount,
    modes: [...modes],
    inorderSeq: [...inorderSeq],
    action: 'done',
    decision: `Morris 遍历结束，树拓扑 100% 恢复，最终众数集合为 [${modes.join(', ')}]`,
    message: `🎉 Morris O(1) 空间众数检索完毕！树拓扑已完全恢复，最高频次 ${maxCount}，众数集合为 [${modes.join(', ')}]。`,
    log: `Morris traversal done: modes = [${modes.join(', ')}], maxCount = ${maxCount}`,
    codeLine: BST_MODES_STAGE3_LINES.done,
    stageId: 'stage-3',
    highlightedNodes: modes,
  });

  return steps;
}
