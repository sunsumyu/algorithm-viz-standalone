/**
 * 把二叉搜索树转换为累加树可视化器 (Convert BST to Greater Tree · LeetCode 538 / LC 1038)
 * 采用顶层声明式架构与双版本综合长处整合 (Bi-Version Synthesis)
 *
 * Stage 1: 反向中序遍历 (Reverse Inorder Traversal · 经典递归)
 * Stage 2: 显式单调栈迭代反向中序 (Iterative Explicit Stack Reverse Inorder)
 * Stage 3: Morris 反向空间常数遍历 (Morris Reverse Inorder · O(1) 绝对常数空间)
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
import {
  BST_TO_GST_PROBLEM_HTML,
  BST_TO_GST_ANALYSIS_HTML,
} from './bst-to-gst-problem-content';
import {
  BST_TO_GST_STAGE1_CODES,
  BST_TO_GST_STAGE1_LINES,
  BST_TO_GST_STAGE2_CODES,
  BST_TO_GST_STAGE2_LINES,
  BST_TO_GST_STAGE3_CODES,
  BST_TO_GST_STAGE3_LINES,
} from './bst-to-gst-stage-codes';

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
function cloneTree(node: TreeNode | null, visited = new Set<TreeNode>()): TreeNode | null {
  if (!node || visited.has(node)) return null;
  visited.add(node);
  return {
    val: node.val,
    left: cloneTree(node.left, visited),
    right: cloneTree(node.right, visited),
  };
}

// =========================================================================
// Stage 1: 反向中序遍历 (Reverse Inorder Traversal · 经典递归)
// =========================================================================
export function buildBstToGstStage1Steps(root: TreeNode | null): BstToGstStep[] {
  const steps: BstToGstStep[] = [];
  const trace = new RecursiveCallTraceBuilder();
  let sum = 0;
  const reverseSeq: Array<{ oldVal: number; newVal: number }> = [];

  // 工作树克隆，避免原对象被破坏
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
      `更新节点值: ${oldVal} ➔ ${sum}`,
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

  // 1. 初始化
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
        message: `在右子树中找到反向中序前驱节点 ${mostLeft.val}。当前其 left 指向 ${mostLeft.left ? (mostLeft.left === curr ? `curr(${curr.val})` : mostLeft.left.val) : 'null'}。`,
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

// =========================================================================
// 自定义 Card 2 指标渲染组件 (Clean Custom Metrics DOM)
// =========================================================================
export function renderBstToGstCustomMetrics(container: HTMLElement, step: BstToGstStep): void {
  const oldValStr = step.currOldVal !== null ? String(step.currOldVal) : '-';
  const newValStr = step.currNewVal !== null ? String(step.currNewVal) : '-';

  const reverseSeqHtml = step.reverseSeq.length > 0
    ? step.reverseSeq
        .map((item, idx) => {
          const isLatest = idx === step.reverseSeq.length - 1;
          return `<span style="display:inline-block; padding:2px 6px; border-radius:4px; font-weight:700; font-size:11px; margin-right:4px; margin-bottom:4px; background:${isLatest ? '#fef3c7' : '#ecfdf5'}; color:${isLatest ? '#b45309' : '#047857'}; border:1px solid ${isLatest ? '#f59e0b' : '#a7f3d0'};">${item.oldVal}➔<strong style="color:${isLatest ? '#d97706' : '#059669'};">${item.newVal}</strong></span>`;
        })
        .join('')
    : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">尚无转换节点</span>';

  let extraMetricHtml = '';
  if (step.stageId === 'stage-2') {
    const stackStr = step.stackVals && step.stackVals.length > 0
      ? step.stackVals.map((v) => `<span style="display:inline-block; padding:1px 5px; border-radius:3px; background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; font-size:10.5px; font-weight:700; margin-right:3px;">${v}</span>`).join(' ')
      : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">栈为空</span>';
    extraMetricHtml = `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px; margin-top:8px;">
        <div style="font-size:11px; font-weight:700; color:#0369a1; margin-bottom:4px;">
          <span>🥞 显式调用栈 (Stack Top 在右侧)</span>
        </div>
        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:4px;">${stackStr}</div>
      </div>
    `;
  } else if (step.stageId === 'stage-3' && step.morrisThread) {
    const threadStatus = step.morrisThread.active
      ? `<span style="color:#16a34a; font-weight:700;">🟢 已建立反向线索 (${step.morrisThread.from} ➔ ${step.morrisThread.to})</span>`
      : `<span style="color:#dc2626; font-weight:700;">🔴 已拆除反向线索 (${step.morrisThread.from} ⇸ ${step.morrisThread.to})</span>`;
    extraMetricHtml = `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px; margin-top:8px;">
        <div style="font-size:11px; font-weight:700; color:#4338ca; margin-bottom:4px;">
          <span>🧵 Morris 反向线索状态</span>
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
    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;">
      <!-- 原节点值 -->
      <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:8px 10px; text-align:center;">
        <div style="font-size:10px; color:#b45309; font-weight:700; text-transform:uppercase;">原值 oldVal</div>
        <div style="font-size:18px; font-weight:800; color:#d97706; font-family:monospace; margin-top:2px;">${oldValStr}</div>
      </div>

      <!-- 转换后新值 -->
      <div style="background:#ecfdf5; border:1.5px solid #a7f3d0; border-radius:8px; padding:8px 10px; text-align:center;">
        <div style="font-size:10px; color:#047857; font-weight:700; text-transform:uppercase;">新值 newVal</div>
        <div style="font-size:18px; font-weight:900; color:#059669; font-family:monospace; margin-top:2px;">${newValStr}</div>
      </div>

      <!-- 当前全局累加和 -->
      <div style="background:#f0f9ff; border:1.5px solid #bae6fd; border-radius:8px; padding:8px 10px; text-align:center;">
        <div style="font-size:10px; color:#0369a1; font-weight:700; text-transform:uppercase;">全局累加 sum</div>
        <div style="font-size:18px; font-weight:900; color:#0284c7; font-family:monospace; margin-top:2px;">${step.sum}</div>
      </div>
    </div>

    <!-- 反向中序转换流 -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
      <div style="font-size:11px; font-weight:700; color:#475569; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
        <span>📈 降序累加序列流 (右 ➔ 根 ➔ 左)</span>
        <span style="font-size:10px; color:#94a3b8; font-weight:normal;">已处理: ${step.reverseSeq.length} 项</span>
      </div>
      <div style="display:flex; flex-wrap:wrap; align-items:center;">${reverseSeqHtml}</div>
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
// Card 1: 纯粹的树形沙盘渲染 (Pure SVG Sandbox)
// =========================================================================
export function renderBstToGstCanvas(container: HTMLElement, step: BstToGstStep): void {
  if (step.tree) {
    const highlights = step.highlightedNodes && step.highlightedNodes.length > 0
      ? step.highlightedNodes
      : (step.currNewVal != null ? [step.currNewVal] : []);

    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.currNewVal ?? step.currOldVal,
      highlightedNodes: highlights,
      primaryColor: '#059669', // 翡翠绿当前累加节点
      visitedColor: '#10b981', // 翡翠绿完工节点
      secondaryColor: '#f59e0b', // 琥珀黄原值节点
    });
  } else {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
        <svg width="240" height="120" viewBox="0 0 240 120">
          <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空二叉树</text>
        </svg>
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">无节点可转换为累加树</span>
      </div>
    `;
  }
}

// =========================================================================
// 注册顶层声明式算法 (Bi-Version Synthesis)
// =========================================================================
registerDeclarativeAlgorithm({
  id: 'bst-to-gst',
  aliases: ['leetcode-538', 'leetcode-1038', 'convert-bst-to-greater-tree', 'binary-search-tree-to-greater-sum-tree'],
  name: '把二叉搜索树转换为累加树',
  category: 'tree',
  icon: '💰',
  difficulty: 'medium',
  learningGoal: '利用BST「右-根-左」反向中序严格递减的性质，通过单变量全局累加实现节点值原地后缀累加转换。',
  problemHtml: BST_TO_GST_PROBLEM_HTML,
  analysisHtml: BST_TO_GST_ANALYSIS_HTML,
  codeLanguages: BST_TO_GST_STAGE1_CODES,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 反向中序递归遍历',
      shortName: '反向中序递归',
      num: 1,
      codeLanguages: BST_TO_GST_STAGE1_CODES,
      buildSteps: (inputs: Record<string, unknown>) => {
        const arr = parseTreeArray(inputs?.['input-tree'] || '[4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]', [4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]);
        const root = buildTreeFromArr(arr);
        return buildBstToGstStage1Steps(root);
      },
      renderCanvas: (container, step) => renderBstToGstCanvas(container, step as BstToGstStep),
      renderCustomMetrics: (container, step) => renderBstToGstCustomMetrics(container, step as BstToGstStep),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 显式单调栈迭代反向中序',
      shortName: '显式栈迭代',
      num: 2,
      codeLanguages: BST_TO_GST_STAGE2_CODES,
      buildSteps: (inputs: Record<string, unknown>) => {
        const arr = parseTreeArray(inputs?.['input-tree'] || '[4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]', [4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]);
        const root = buildTreeFromArr(arr);
        return buildBstToGstStage2Steps(root);
      },
      renderCanvas: (container, step) => renderBstToGstCanvas(container, step as BstToGstStep),
      renderCustomMetrics: (container, step) => renderBstToGstCustomMetrics(container, step as BstToGstStep),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: Morris 反向空间常数遍历',
      shortName: 'Morris 常数空间',
      num: 3,
      codeLanguages: BST_TO_GST_STAGE3_CODES,
      buildSteps: (inputs: Record<string, unknown>) => {
        const arr = parseTreeArray(inputs?.['input-tree'] || '[4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]', [4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]);
        const root = buildTreeFromArr(arr);
        return buildBstToGstStage3Steps(root);
      },
      renderCanvas: (container, step) => renderBstToGstCanvas(container, step as BstToGstStep),
      renderCustomMetrics: (container, step) => renderBstToGstCustomMetrics(container, step as BstToGstStep),
    },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: 'BST 层序序列 (JSON/逗号数组)',
      type: 'text',
      defaultValue: '[4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]',
      placeholder: '例如: [4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8] 或 [0, null, 1]',
    },
  ],
  presets: [
    {
      label: '官方经典 [4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]',
      values: { 'input-tree': '[4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]' },
      description: '标准经典用例，全树累加和为 36',
    },
    {
      label: '单侧树 [0, null, 1]',
      values: { 'input-tree': '[0, null, 1]' },
      description: '右单链树，转换后为 [1, null, 1]',
    },
    {
      label: '对称小树 [1, 0, 2]',
      values: { 'input-tree': '[1, 0, 2]' },
      description: '简单三节点BST，转换后为 [3, 3, 2]',
    },
    {
      label: '单节点 [3]',
      values: { 'input-tree': '[3]' },
      description: '单一节点边界，转换后仍为 [3]',
    },
  ],
  generateSteps: (inputs: Record<string, unknown>) => {
    const arr = parseTreeArray(inputs?.['input-tree'] || '[4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]', [4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]);
    const root = buildTreeFromArr(arr);
    return buildBstToGstStage1Steps(root);
  },
  buildSteps: (inputs: Record<string, unknown>) => {
    const arr = parseTreeArray(inputs?.['input-tree'] || '[4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]', [4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]);
    const root = buildTreeFromArr(arr);
    return buildBstToGstStage1Steps(root);
  },
  renderCanvas: (container, step) => renderBstToGstCanvas(container, step as BstToGstStep),
  renderCustomMetrics: (container, step) => renderBstToGstCustomMetrics(container, step as BstToGstStep),
});
