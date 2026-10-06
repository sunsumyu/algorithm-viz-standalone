/**
 * 把二叉搜索树转换为累加树核心步进编译器 (Convert BST to Greater Tree Step Compiler)
 * LeetCode 538 / LC 1038
 * 遵循 Matt Pocock 深模块哲学与纯领域逻辑分层架构
 */

import { parseTreeArray } from '../../input-primitives';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from './recursive-call-trace-adapter';
import { HighlightTarget } from '../../step-visualizer';
import { TreeNode, buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import {
  BST_TO_GST_STAGE1_LINES,
  BST_TO_GST_STAGE2_LINES,
  BST_TO_GST_STAGE3_LINES,
} from '../../../algorithms/categories/tree/bst-to-gst-stage-codes';

export interface BstToGstStep {
  tree: TreeNode | null;
  currOldVal: number | null;
  currNewVal: number | null;
  sum: number;
  reverseSeq: Array<{ oldVal: number; newVal: number }>;
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

/** 防环安全树克隆 */
export function cloneTree(node: TreeNode | null, visited = new Set<TreeNode>()): TreeNode | null {
  if (!node || visited.has(node)) return null;
  visited.add(node);
  return {
    val: node.val,
    left: cloneTree(node.left, visited),
    right: cloneTree(node.right, visited),
  };
}

export function parseAndBuildBstToGstTree(inputs?: Record<string, unknown>): TreeNode | null {
  const defaultArr = [4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8];
  const arr = parseTreeArray(inputs?.['input-tree'] || '[4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]', defaultArr);
  return buildTreeFromArr(arr);
}

// =========================================================================
// Stage 1: 反向中序遍历 (Reverse Inorder Traversal · 经典递归)
// =========================================================================
export function buildBstToGstStage1Steps(root: TreeNode | null): BstToGstStep[] {
  const steps: BstToGstStep[] = [];
  const trace = new RecursiveCallTraceBuilder();
  let sum = 0;
  const reverseSeq: Array<{ oldVal: number; newVal: number }> = [];

  const workingRoot = cloneTree(root);

  if (!workingRoot) {
    trace.addHeader('convertBST(root=null)', 0, '空树特判');
    trace.addConditionHit('root == null -> return null', 0, '树为空，直接返回 null');
    trace.addFinalResult('return null', 0, '空树退出', 'null');
    steps.push({
      tree: null,
      currOldVal: null,
      currNewVal: null,
      sum: 0,
      reverseSeq: [],
      action: 'done',
      decision: '空树输入，返回 null',
      message: '树为空，无需转换，返回 null。',
      log: 'empty tree -> return null',
      codeLine: BST_TO_GST_STAGE1_LINES.done,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
    });
    return steps;
  }

  // 初始化入口
  trace.addHeader(`convertBST(root=${workingRoot.val})`, 0, '初始化 sum=0，开启右-根-左反向中序');
  steps.push({
    tree: cloneTree(workingRoot),
    currOldVal: workingRoot.val,
    currNewVal: null,
    sum: 0,
    reverseSeq: [],
    action: 'enter',
    decision: '初始化算法全局状态 sum = 0，开启反向中序递归',
    message: `初始化累加和 sum = 0，从根节点 ${workingRoot.val} 开启反向中序遍历（右 ➔ 根 ➔ 左）。`,
    log: `init: sum = 0, start reverse inorder from root ${workingRoot.val}`,
    codeLine: BST_TO_GST_STAGE1_LINES.entry,
    callTrace: trace.snapshot(),
    stageId: 'stage-1',
    highlightedNodes: [workingRoot.val],
  });

  function reverseInorder(node: TreeNode | null, depth: number) {
    if (!node) {
      trace.addHeader('reverseInorder(node=null)', depth, '空节点触底返回');
      trace.addConditionHit('node == null -> return', depth, '命中基底条件');
      trace.addReturnLeaf('return', depth, 'null');
      steps.push({
        tree: cloneTree(workingRoot),
        currOldVal: null,
        currNewVal: null,
        sum,
        reverseSeq: [...reverseSeq],
        action: 'visit',
        decision: '到达空节点，直接返回上一层调用',
        message: '到达空子树，满足 node == null，返回上一层递归。',
        log: `depth ${depth}: node == null, return`,
        codeLine: BST_TO_GST_STAGE1_LINES.checkNull,
        callTrace: trace.snapshot(),
        stageId: 'stage-1',
      });
      return;
    }

    // 递归进入当前节点
    trace.addHeader(`reverseInorder(node=${node.val})`, depth, `进入节点 ${node.val}，先递归右子树`);
    steps.push({
      tree: cloneTree(workingRoot),
      currOldVal: node.val,
      currNewVal: null,
      sum,
      reverseSeq: [...reverseSeq],
      action: 'enter',
      decision: `进入节点 ${node.val}，优先处理更大值的右子树`,
      message: `进入 reverseInorder(node=${node.val})，准备深入更大数值的右子树。`,
      log: `depth ${depth}: enter reverseInorder(${node.val})`,
      codeLine: BST_TO_GST_STAGE1_LINES.reverseInorderEnter,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [node.val],
    });

    // 1. 递归右子树
    trace.addRecursePrep(`reverseInorder(node.right=${node.right ? node.right.val : 'null'})`, depth, '深入右分支');
    steps.push({
      tree: cloneTree(workingRoot),
      currOldVal: node.val,
      currNewVal: null,
      sum,
      reverseSeq: [...reverseSeq],
      action: 'right',
      decision: `深入右子树 node.right (${node.right ? node.right.val : 'null'})`,
      message: `反向中序核心：先处理右子树，将所有大于当前节点的数全部累加完毕。`,
      log: `depth ${depth}: recurse right of node ${node.val}`,
      codeLine: BST_TO_GST_STAGE1_LINES.rightRecurse,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [node.val],
    });
    reverseInorder(node.right, depth + 1);

    // 2. 访问当前节点：累加 sum 并更新 node.val
    const oldVal = node.val;
    sum += oldVal;
    node.val = sum;
    reverseSeq.push({ oldVal, newVal: sum });

    trace.addUnwindCalc(
      `sum += ${oldVal} -> sum=${sum}, node.val=${sum}`,
      depth,
      `更新节点值: ${oldVal} ➔ ${sum}`
    );

    // 累加步
    steps.push({
      tree: cloneTree(workingRoot),
      currOldVal: oldVal,
      currNewVal: sum,
      sum,
      reverseSeq: [...reverseSeq],
      action: 'visit',
      decision: `累加当前节点原值: sum += ${oldVal}，得到新累加和 ${sum}`,
      message: `访问节点原值 ${oldVal}，累加后 sum = ${sum}。`,
      log: `visit ${oldVal}: sum += ${oldVal} = ${sum}`,
      codeLine: BST_TO_GST_STAGE1_LINES.accumulateSum,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [sum],
    });

    // 节点赋值更新步
    steps.push({
      tree: cloneTree(workingRoot),
      currOldVal: oldVal,
      currNewVal: sum,
      sum,
      reverseSeq: [...reverseSeq],
      action: 'visit',
      decision: `就地修改节点值: node.val = ${sum} (原值 ${oldVal})`,
      message: `将当前节点值就地修改为累加和 ${sum}（转换完成：${oldVal} ➔ ${sum}）。`,
      log: `node.val = ${sum} (was ${oldVal})`,
      codeLine: BST_TO_GST_STAGE1_LINES.updateNodeVal,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [sum],
    });

    // 3. 递归左子树
    trace.addRecursePrep(`reverseInorder(node.left=${node.left ? node.left.val : 'null'})`, depth, '深入左分支');
    steps.push({
      tree: cloneTree(workingRoot),
      currOldVal: oldVal,
      currNewVal: sum,
      sum,
      reverseSeq: [...reverseSeq],
      action: 'left',
      decision: `将累加和 ${sum} 传递并递归深入左子树 (${node.left ? node.left.val : 'null'})`,
      message: `右子树和根节点处理完毕，向左子树递归，将大于等于左子树所有节点的值之和传递下去。`,
      log: `depth ${depth}: recurse left of node ${sum}`,
      codeLine: BST_TO_GST_STAGE1_LINES.leftRecurse,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [sum],
    });
    reverseInorder(node.left, depth + 1);

    trace.addReturnLeaf(`node=${sum} 子树转换完毕`, depth);
  }

  reverseInorder(workingRoot, 0);

  // 完成
  trace.addFinalResult('return root', 0, `累加树转换全部完成，总累加和为 ${sum}`, String(sum));
  steps.push({
    tree: cloneTree(workingRoot),
    currOldVal: null,
    currNewVal: null,
    sum,
    reverseSeq: [...reverseSeq],
    action: 'done',
    decision: `全树转换完成，根节点新值为 ${workingRoot.val}，总累加和 ${sum}`,
    message: `🎉 累加树转换全部完成！所有节点的新值均等于原树中大于等于它的元素总和（全树总和 ${sum}）。`,
    log: `done: total sum = ${sum}, root new val = ${workingRoot.val}`,
    codeLine: BST_TO_GST_STAGE1_LINES.done,
    callTrace: trace.snapshot(),
    stageId: 'stage-1',
    highlightedNodes: [],
  });

  return steps;
}

// =========================================================================
// Stage 2: 显式单调栈迭代反向中序
// =========================================================================
export function buildBstToGstStage2Steps(root: TreeNode | null): BstToGstStep[] {
  const steps: BstToGstStep[] = [];
  let sum = 0;
  const reverseSeq: Array<{ oldVal: number; newVal: number }> = [];
  const stack: TreeNode[] = [];

  const workingRoot = cloneTree(root);

  if (!workingRoot) {
    steps.push({
      tree: null,
      currOldVal: null,
      currNewVal: null,
      sum: 0,
      reverseSeq: [],
      action: 'done',
      decision: '空树输入，返回 null',
      message: '树为空，返回 null。',
      log: 'empty tree -> return null',
      codeLine: BST_TO_GST_STAGE2_LINES.done,
      stageId: 'stage-2',
      stackVals: [],
    });
    return steps;
  }

  let curr: TreeNode | null = workingRoot;

  steps.push({
    tree: cloneTree(workingRoot),
    currOldVal: curr.val,
    currNewVal: null,
    sum: 0,
    reverseSeq: [],
    action: 'enter',
    decision: '初始化显式栈与游标 curr = root，开启显式栈迭代反向中序',
    message: `初始化显式栈 stack = []，sum = 0，游标 curr 指向根节点 ${curr.val}。`,
    log: `init: stack = [], curr = ${curr.val}`,
    codeLine: BST_TO_GST_STAGE2_LINES.init,
    stageId: 'stage-2',
    highlightedNodes: [curr.val],
    stackVals: [],
  });

  while (curr !== null || stack.length > 0) {
    steps.push({
      tree: cloneTree(workingRoot),
      currOldVal: curr ? curr.val : null,
      currNewVal: null,
      sum,
      reverseSeq: [...reverseSeq],
      action: 'right',
      decision: `循环条件检查: curr=${curr ? curr.val : 'null'}, stack 深度=${stack.length}`,
      message: `当前 curr = ${curr ? curr.val : 'null'}，栈内待处理节点 [${stack.map((n) => n.val).join(', ')}]。`,
      log: `while loop check: curr=${curr ? curr.val : 'null'}, stack=[${stack.map((n) => n.val).join(', ')}]`,
      codeLine: BST_TO_GST_STAGE2_LINES.whileLoop,
      stageId: 'stage-2',
      highlightedNodes: curr ? [curr.val] : [],
      stackVals: stack.map((n) => n.val),
    });

    // 右链一路入栈
    while (curr !== null) {
      stack.push(curr);
      steps.push({
        tree: cloneTree(workingRoot),
        currOldVal: curr.val,
        currNewVal: null,
        sum,
        reverseSeq: [...reverseSeq],
        action: 'right',
        decision: `右孩子存在，节点 ${curr.val} 入栈，游标向右下潜`,
        message: `将节点 ${curr.val} 压入显式栈，curr 移向右孩子 ${curr.right ? curr.right.val : 'null'}。`,
        log: `push ${curr.val} to stack, curr = curr.right (${curr.right ? curr.right.val : 'null'})`,
        codeLine: BST_TO_GST_STAGE2_LINES.pushRight,
        stageId: 'stage-2',
        highlightedNodes: [curr.val],
        stackVals: stack.map((n) => n.val),
      });
      curr = curr.right;
    }

    // 弹出栈顶节点访问
    curr = stack.pop()!;
    const oldVal = curr.val;
    steps.push({
      tree: cloneTree(workingRoot),
      currOldVal: oldVal,
      currNewVal: null,
      sum,
      reverseSeq: [...reverseSeq],
      action: 'visit',
      decision: `右子树触底，从栈顶弹出节点 ${oldVal} 准备累加转换`,
      message: `从栈顶弹出当前最大未处理节点 ${oldVal}。`,
      log: `pop ${oldVal} from stack`,
      codeLine: BST_TO_GST_STAGE2_LINES.popNode,
      stageId: 'stage-2',
      highlightedNodes: [oldVal],
      stackVals: stack.map((n) => n.val),
    });

    // 累加 sum 并就地修改节点值
    sum += oldVal;
    curr.val = sum;
    reverseSeq.push({ oldVal, newVal: sum });

    steps.push({
      tree: cloneTree(workingRoot),
      currOldVal: oldVal,
      currNewVal: sum,
      sum,
      reverseSeq: [...reverseSeq],
      action: 'visit',
      decision: `累加原值 ${oldVal}，更新节点值为累加和: ${oldVal} ➔ ${sum}`,
      message: `原值 ${oldVal} 累加至 sum，当前累加和为 ${sum}。节点值就地更新为 ${sum}。`,
      log: `sum += ${oldVal} = ${sum}, curr.val = ${sum}`,
      codeLine: BST_TO_GST_STAGE2_LINES.updateNodeVal,
      stageId: 'stage-2',
      highlightedNodes: [sum],
      stackVals: stack.map((n) => n.val),
    });

    // 转向左孩子
    const nextLeft = curr.left;
    steps.push({
      tree: cloneTree(workingRoot),
      currOldVal: oldVal,
      currNewVal: sum,
      sum,
      reverseSeq: [...reverseSeq],
      action: 'left',
      decision: `游标移向左孩子 curr = curr.left (${nextLeft ? nextLeft.val : 'null'})`,
      message: `节点转换完毕，游标转向左孩子 ${nextLeft ? nextLeft.val : 'null'} 继续处理较小数值。`,
      log: `curr = curr.left (${nextLeft ? nextLeft.val : 'null'})`,
      codeLine: BST_TO_GST_STAGE2_LINES.turnLeft,
      stageId: 'stage-2',
      highlightedNodes: nextLeft ? [nextLeft.val] : [],
      stackVals: stack.map((n) => n.val),
    });
    curr = nextLeft;
  }

  // 完成
  steps.push({
    tree: cloneTree(workingRoot),
    currOldVal: null,
    currNewVal: null,
    sum,
    reverseSeq: [...reverseSeq],
    action: 'done',
    decision: `显式栈迭代遍历完毕，累加树构建完成，总累加和为 ${sum}`,
    message: `🎉 显式栈反向中序迭代完毕，累加树构建成功，总和为 ${sum}。`,
    log: `iterative done: sum = ${sum}`,
    codeLine: BST_TO_GST_STAGE2_LINES.done,
    stageId: 'stage-2',
    highlightedNodes: [],
    stackVals: [],
  });

  return steps;
}

// =========================================================================
// Stage 3: Morris 反向空间常数遍历 (O(1) 绝对常数空间)
// =========================================================================
export function buildBstToGstStage3Steps(root: TreeNode | null): BstToGstStep[] {
  const steps: BstToGstStep[] = [];
  let sum = 0;
  const reverseSeq: Array<{ oldVal: number; newVal: number }> = [];

  const workingRoot = cloneTree(root);

  if (!workingRoot) {
    steps.push({
      tree: null,
      currOldVal: null,
      currNewVal: null,
      sum: 0,
      reverseSeq: [],
      action: 'done',
      decision: '空树输入，返回 null',
      message: '树为空，返回 null。',
      log: 'empty tree -> return null',
      codeLine: BST_TO_GST_STAGE3_LINES.done,
      stageId: 'stage-3',
    });
    return steps;
  }

  let curr: TreeNode | null = workingRoot;

  steps.push({
    tree: cloneTree(workingRoot),
    currOldVal: curr.val,
    currNewVal: null,
    sum: 0,
    reverseSeq: [],
    action: 'enter',
    decision: '初始化 Morris 反向中序遍历，curr 指向根节点',
    message: `初始化 Morris 反向中序遍历，无需任何栈空间，空间复杂度严格为 O(1)。`,
    log: `init Morris reverse inorder from root ${curr.val}`,
    codeLine: BST_TO_GST_STAGE3_LINES.init,
    stageId: 'stage-3',
    highlightedNodes: [curr.val],
  });

  while (curr !== null) {
    steps.push({
      tree: cloneTree(workingRoot),
      currOldVal: curr.val,
      currNewVal: null,
      sum,
      reverseSeq: [...reverseSeq],
      action: 'visit',
      decision: `检查节点 ${curr.val} 的右孩子状态`,
      message: `当前游标在节点 ${curr.val}，检查 curr.right 是否为空 (${curr.right ? curr.right.val : 'null'})。`,
      log: `check curr.right of ${curr.val}`,
      codeLine: BST_TO_GST_STAGE3_LINES.whileCheck,
      stageId: 'stage-3',
      highlightedNodes: [curr.val],
    });

    if (curr.right === null) {
      // 无右子树：直接访问当前节点
      const oldVal = curr.val;
      sum += oldVal;
      curr.val = sum;
      reverseSeq.push({ oldVal, newVal: sum });

      steps.push({
        tree: cloneTree(workingRoot),
        currOldVal: oldVal,
        currNewVal: sum,
        sum,
        reverseSeq: [...reverseSeq],
        action: 'visit',
        decision: `curr.right 为空，直接累加转换: ${oldVal} ➔ ${sum}`,
        message: `节点原值 ${oldVal} 无右子树，直接累加。sum 更新为 ${sum}，节点值修改为 ${sum}。`,
        log: `visit ${oldVal}: sum += ${oldVal} = ${sum}`,
        codeLine: BST_TO_GST_STAGE3_LINES.noRightUpdate,
        stageId: 'stage-3',
        highlightedNodes: [sum],
      });

      const nextLeft: TreeNode | null = curr.left;
      steps.push({
        tree: cloneTree(workingRoot),
        currOldVal: oldVal,
        currNewVal: sum,
        sum,
        reverseSeq: [...reverseSeq],
        action: 'left',
        decision: `转向左孩子 curr = curr.left (${nextLeft ? nextLeft.val : 'null'})`,
        message: `转向左孩子 ${nextLeft ? nextLeft.val : 'null'}。`,
        log: `curr = curr.left (${nextLeft ? nextLeft.val : 'null'})`,
        codeLine: BST_TO_GST_STAGE3_LINES.turnLeftNoRight,
        stageId: 'stage-3',
        highlightedNodes: nextLeft ? [nextLeft.val] : [],
      });
      curr = nextLeft;
    } else {
      // 有右子树：寻找反向中序前驱（即右子树中最左侧的节点 mostLeft）
      let mostLeft: TreeNode = curr.right!;
      while (mostLeft.left !== null && mostLeft.left !== curr) {
        mostLeft = mostLeft.left;
      }

      steps.push({
        tree: cloneTree(workingRoot),
        currOldVal: curr.val,
        currNewVal: null,
        sum,
        reverseSeq: [...reverseSeq],
        action: 'right',
        decision: `定位右子树中最左侧节点 mostLeft = ${mostLeft.val}`,
        message: `在右子树中找到反向中序前驱节点 ${mostLeft.val}。当前其 left 指向 ${
          mostLeft.left ? (mostLeft.left === curr ? `curr(${curr.val})` : mostLeft.left.val) : 'null'
        }。`,
        log: `find mostLeft of ${curr.val}: node ${mostLeft.val}`,
        codeLine: BST_TO_GST_STAGE3_LINES.findPredecessor,
        stageId: 'stage-3',
        highlightedNodes: [curr.val, mostLeft.val],
      });

      if (mostLeft.left === null) {
        // 首次到达：建立反向线索 mostLeft.left = curr
        mostLeft.left = curr;
        steps.push({
          tree: cloneTree(workingRoot),
          currOldVal: curr.val,
          currNewVal: null,
          sum,
          reverseSeq: [...reverseSeq],
          action: 'thread-build',
          decision: `首次到达，建立反向线索: ${mostLeft.val}.left -> ${curr.val}，向右前进`,
          message: `构建回溯桥梁：将前驱节点 ${mostLeft.val} 的空闲 left 指针指向当前节点 ${curr.val}，游标深入右孩子 curr = curr.right。`,
          log: `build thread: ${mostLeft.val}.left -> ${curr.val}, curr = ${curr.right.val}`,
          codeLine: BST_TO_GST_STAGE3_LINES.buildThread,
          stageId: 'stage-3',
          highlightedNodes: [curr.val, mostLeft.val],
          morrisThread: { from: mostLeft.val, to: curr.val, active: true },
        });
        curr = curr.right;
      } else {
        // 二次到达：拆除线索，恢复二叉树拓扑
        mostLeft.left = null;
        const oldVal = curr.val;
        sum += oldVal;
        curr.val = sum;
        reverseSeq.push({ oldVal, newVal: sum });

        steps.push({
          tree: cloneTree(workingRoot),
          currOldVal: oldVal,
          currNewVal: sum,
          sum,
          reverseSeq: [...reverseSeq],
          action: 'thread-cut',
          decision: `二次到达，拆除线索: ${mostLeft.val}.left = null，累加转换节点: ${oldVal} ➔ ${sum}`,
          message: `右子树已全部转换完毕，恢复树拓扑（拆除线索），累加原值 ${oldVal}，节点值修改为 ${sum}。`,
          log: `cut thread ${mostLeft.val}.left = null, curr.val = ${sum}`,
          codeLine: BST_TO_GST_STAGE3_LINES.cutThread,
          stageId: 'stage-3',
          highlightedNodes: [sum],
          morrisThread: { from: mostLeft.val, to: curr.val, active: false },
        });

        // 转向左孩子
        const nextLeft: TreeNode | null = curr.left;
        steps.push({
          tree: cloneTree(workingRoot),
          currOldVal: oldVal,
          currNewVal: sum,
          sum,
          reverseSeq: [...reverseSeq],
          action: 'left',
          decision: `转向左孩子 curr = curr.left (${nextLeft ? nextLeft.val : 'null'})`,
          message: `当前节点转换完毕，移向左孩子 ${nextLeft ? nextLeft.val : 'null'}。`,
          log: `curr = curr.left (${nextLeft ? nextLeft.val : 'null'})`,
          codeLine: BST_TO_GST_STAGE3_LINES.turnLeftThread,
          stageId: 'stage-3',
          highlightedNodes: nextLeft ? [nextLeft.val] : [],
        });
        curr = nextLeft;
      }
    }
  }

  // 完成
  steps.push({
    tree: cloneTree(workingRoot),
    currOldVal: null,
    currNewVal: null,
    sum,
    reverseSeq: [...reverseSeq],
    action: 'done',
    decision: `Morris 反向中序遍历完成，树拓扑 100% 恢复，累加树构建完成`,
    message: `🎉 Morris O(1) 空间累加树转换完毕！树拓扑已完全恢复，全树总和为 ${sum}。`,
    log: `Morris GST done: sum = ${sum}`,
    codeLine: BST_TO_GST_STAGE3_LINES.done,
    stageId: 'stage-3',
    highlightedNodes: [],
  });

  return steps;
}
