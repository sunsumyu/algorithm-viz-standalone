/**
 * 翻转二叉树步骤编译器 (Invert Binary Tree Step Compiler · LeetCode 226)
 * Matt Pocock 深模块设计：将递归前序遍历、BFS 队列遍历与静态数组模拟队列推演完全下沉解耦
 */

import { HighlightTarget, StepBase } from '../../step-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from '../../../algorithms/categories/tree/tree-template';
import { cloneStateDepTree } from '../../strategies/tree-clone';
import { parseTreeArray } from '../../input-primitives';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from './recursive-call-trace-adapter';
import {
  TREE_INVERT_STAGE1_CODE,
  TREE_INVERT_STAGE1_LINES,
  TREE_INVERT_STAGE2_QUEUE_CODE,
  TREE_INVERT_STAGE2_QUEUE_LINES,
  TREE_INVERT_STAGE3_STATIC_ARRAY_CODE,
  TREE_INVERT_STAGE3_STATIC_ARRAY_LINES,
} from '../../../algorithms/categories/tree/tree-invert-stage-codes';

// ============================================================
// 类型契约与状态定义 (Domain Step Contract)
// ============================================================
export interface InvertStep extends StepBase {
  tree: TreeNode | null;
  current: number | null;
  leftVal: number | null;
  rightVal: number | null;
  invertedCount: number;
  isSwapping: boolean;
  action: 'enter' | 'swap' | 'leave' | 'done' | string;
  actionName?: string;
  decision?: string;
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'info' | 'warning' | 'success' | 'danger' };

  /** 双重不变量保障与高亮支持 */
  visitedNodes?: number[];
  highlightedNodes?: number[];

  /** Stage 1 递归推演栈专用 */
  callTrace?: RecursiveCallTraceSnapshot;

  /** Stage 2 队列专用 */
  queue?: (number | string)[];

  /** Stage 3 静态数组专用 */
  staticQueueState?: {
    array: (number | string)[];
    l: number;
    r: number;
    cur: number | string | null;
  };
}

// 树快照统一委托 core/strategies/tree-clone.ts
export function cloneTree(node: TreeNode | null): TreeNode | null {
  return cloneStateDepTree(node);
}

/** 收集树中所有有效节点值，支持全景高亮与收尾状态守卫 */
export function collectTreeValues(node: TreeNode | null): number[] {
  const result: number[] = [];
  function traverse(n: TreeNode | null) {
    if (!n) return;
    result.push(n.val);
    traverse(n.left);
    traverse(n.right);
  }
  traverse(node);
  return result;
}

/** 解析输入参数并构建树 */
export function parseTreeInvertInputs(inputs?: Record<string, any>): TreeNode | null {
  const raw = inputs?.['input-tree'] ?? inputs?.tree ?? '4, 2, 7, 1, 3, 6, 9';
  const arr = parseTreeArray(raw, [4, 2, 7, 1, 3, 6, 9]);
  return buildTree(arr);
}

export const parseAndBuild = parseTreeInvertInputs;

// ============================================================
// Stage 1 Step Generator: 前序递归翻转 (Recursive Preorder DFS)
// ============================================================
export function buildTreeInvertSteps(root: TreeNode | null): InvertStep[] {
  const steps: InvertStep[] = [];
  const L = TREE_INVERT_STAGE1_LINES;
  const workingTree = cloneTree(root);
  let invertedCount = 0;

  const trace = new RecursiveCallTraceBuilder();
  const rootText = workingTree ? `${workingTree.val}` : 'null';
  trace.addHeader(`invertTree(root: ${rootText})`, 0, '<- 根调用开始');

  // Step 0: 函数入口帧 (Line 2: public TreeNode invertTree(TreeNode root))
  steps.push({
    tree: cloneTree(workingTree),
    current: workingTree?.val ?? null,
    leftVal: null,
    rightVal: null,
    invertedCount: 0,
    isSwapping: false,
    action: 'enter',
    decision: workingTree ? `启动前序递归翻转：从根节点 ${workingTree.val} 开始` : '空二叉树：无需翻转',
    message: workingTree ? `初始化翻转二叉树：从根节点 ${workingTree.val} 开始递归。` : '空树，无需翻转。',
    log: workingTree ? `invertTree(root: ${workingTree.val})` : 'invertTree(null)',
    codeLine: L.entry,
    metrics: { '当前处理节点': workingTree ? `节点 ${workingTree.val}` : '—', '已互换次数': 0 },
    statusBadge: { text: '递归启动', type: 'info' },
    callTrace: trace.snapshot(),
  });

  if (!workingTree) {
    trace.addConditionHit('① root == null -> true (基底条件命中)', 0);
    trace.addReturnLeaf('return null', 0);
    trace.addFinalResult('最终结果: null', 0, undefined, 'null');
    steps.push({
      tree: null,
      current: null,
      leftVal: null,
      rightVal: null,
      invertedCount: 0,
      isSwapping: false,
      action: 'done',
      decision: '空树翻转完成，返回 null',
      message: '✅ 翻转完成，返回 null。',
      log: '✓ 翻转完成 (null)',
      codeLine: L.nullCheckHit,
      metrics: { '已互换次数': 0, '最终结果': 'null' },
      statusBadge: { text: '空树完成', type: 'success' },
      callTrace: trace.snapshot(),
    });
    return steps;
  }

  function invert(node: TreeNode | null, depth: number, role: string): TreeNode | null {
    if (depth > 0) {
      const label = node ? `Node(${node.val})` : 'null';
      trace.addHeader(`invertTree(${role}: ${label})`, depth, `<- 深入 ${role}`);
      steps.push({
        tree: cloneTree(workingTree),
        current: node ? node.val : null,
        leftVal: node?.left ? node.left.val : null,
        rightVal: node?.right ? node.right.val : null,
        invertedCount,
        isSwapping: false,
        action: 'enter',
        decision: `递归进入：invertTree(${role}: ${label})`,
        message: `深入调用 invertTree 翻转 ${role} 子树 (${label})。`,
        log: `enter invertTree(${role}: ${label})`,
        codeLine: L.entry,
        metrics: { '当前处理节点': label, '已互换次数': invertedCount },
        statusBadge: { text: `进入 ${label}`, type: 'info' },
        callTrace: trace.snapshot(),
      });
    }

    // 判空检查 (Line 3: if (root == null) return null;)
    if (!node) {
      trace.addConditionHit('① root == null -> true (基底条件命中)', depth);
      trace.addReturnLeaf('return null', depth);
      steps.push({
        tree: cloneTree(workingTree),
        current: null,
        leftVal: null,
        rightVal: null,
        invertedCount,
        isSwapping: false,
        action: 'null-base',
        decision: `判空检查：节点为 null，触发基底条件直接返回 null`,
        message: `子树为空，命中递归基底，向父调用返回 null。`,
        log: `null node -> return null`,
        codeLine: L.nullCheckHit,
        metrics: { '当前节点': 'null', '已互换次数': invertedCount },
        statusBadge: { text: '基底返回 null', type: 'warning' },
        callTrace: trace.snapshot(),
      });
      return null;
    }

    // 节点非空判定帧 (Line 3: root != null 推进)
    trace.addConditionPass(`① root != null (Node(${node.val}))，准备互换左右孩子`, depth);
    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      leftVal: node.left ? node.left.val : null,
      rightVal: node.right ? node.right.val : null,
      invertedCount,
      isSwapping: false,
      action: 'enter',
      decision: `判空检查：Node(${node.val}) != null，继续执行左右孩子互换`,
      message: `节点 Node(${node.val}) 存在，准备执行左右子树互换。`,
      log: `node ${node.val} != null -> proceed to swap`,
      codeLine: L.nullCheckPass,
      metrics: { '当前节点': node.val, '原左孩子': node.left?.val ?? 'null', '原右孩子': node.right?.val ?? 'null' },
      statusBadge: { text: `节点 ${node.val} 非空`, type: 'info' },
      callTrace: trace.snapshot(),
    });

    // 左右孩子互换帧 (Line 6 in Java, Line 5 in C++/Python, Line 4 in JS -> L.swap)
    const oldLeft = node.left;
    const oldRight = node.right;
    node.left = oldRight;
    node.right = oldLeft;
    invertedCount++;

    trace.addUnwindCalc(`swap(${node.val}) -> left:${node.left?.val ?? 'null'}, right:${node.right?.val ?? 'null'}`, depth);
    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      leftVal: node.left ? node.left.val : null,
      rightVal: node.right ? node.right.val : null,
      invertedCount,
      isSwapping: true,
      action: 'swap',
      decision: `🔀 节点 ${node.val} 左右指针互换完成！新左: ${node.left ? node.left.val : 'null'}, 新右: ${node.right ? node.right.val : 'null'}`,
      message: `🔀 互换完成！节点 ${node.val}：原左孩子变为 ${node.left ? node.left.val : 'null'}，原右孩子变为 ${node.right ? node.right.val : 'null'}。`,
      log: `节点 ${node.val} 左右互换完成`,
      codeLine: L.swap,
      metrics: { '当前节点': node.val, '新左孩子': node.left ? node.left.val : 'null', '新右孩子': node.right ? node.right.val : 'null', '已互换次数': invertedCount },
      statusBadge: { text: `互换成功 (#${invertedCount})`, type: 'warning' },
      callTrace: trace.snapshot(),
    });

    // 递归翻转左子树 (Line 9 in Java: invertTree(root.left);)
    trace.addRecursePrep(`② 递归翻转左子树 invertTree(${node.left ? 'Node(' + node.left.val + ')' : 'null'})`, depth);
    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      leftVal: node.left ? node.left.val : null,
      rightVal: node.right ? node.right.val : null,
      invertedCount,
      isSwapping: false,
      action: 'recurse-left',
      decision: `向左子树递归：调用 invertTree(node.left: ${node.left ? node.left.val : 'null'})`,
      message: `向左子树递归调用 invertTree(node.left: ${node.left ? node.left.val : 'null'})。`,
      log: `recurse left: ${node.left ? node.left.val : 'null'}`,
      codeLine: L.recurseLeft,
      metrics: { '当前节点': node.val, '下一步递归': `左孩子 ${node.left ? node.left.val : 'null'}` },
      statusBadge: { text: '向左递归', type: 'info' },
      callTrace: trace.snapshot(),
    });

    invert(node.left, depth + 1, '左子树');

    // 递归翻转右子树 (Line 10 in Java: invertTree(root.right);)
    trace.addRecursePrep(`③ 递归翻转右子树 invertTree(${node.right ? 'Node(' + node.right.val + ')' : 'null'})`, depth);
    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      leftVal: node.left ? node.left.val : null,
      rightVal: node.right ? node.right.val : null,
      invertedCount,
      isSwapping: false,
      action: 'recurse-right',
      decision: `向右子树递归：调用 invertTree(node.right: ${node.right ? node.right.val : 'null'})`,
      message: `向右子树递归调用 invertTree(node.right: ${node.right ? node.right.val : 'null'})。`,
      log: `recurse right: ${node.right ? node.right.val : 'null'}`,
      codeLine: L.recurseRight,
      metrics: { '当前节点': node.val, '下一步递归': `右孩子 ${node.right ? node.right.val : 'null'}` },
      statusBadge: { text: '向右递归', type: 'info' },
      callTrace: trace.snapshot(),
    });

    invert(node.right, depth + 1, '右子树');

    // 左右子树均已翻转完成，返回 root (Line 11 in Java: return root;)
    trace.addFinalResult(`④ Node(${node.val}) 左右子树翻转完毕，返回 root`, depth, undefined, `Node(${node.val})`);
    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      leftVal: node.left ? node.left.val : null,
      rightVal: node.right ? node.right.val : null,
      invertedCount,
      isSwapping: false,
      action: 'leave',
      decision: `离开节点 ${node.val}：该子树左右翻转全部完成，向父层返回 Node(${node.val})`,
      message: `离开节点 ${node.val}：该子树左右翻转全部完成，返回 root。`,
      log: `离开 ${node.val}`,
      codeLine: L.returnRoot,
      metrics: { '当前完成节点': node.val, '已互换次数': invertedCount },
      statusBadge: { text: `节点 ${node.val} 完成`, type: 'success' },
      callTrace: trace.snapshot(),
    });

    return node;
  }

  invert(workingTree, 0, '根节点');

  const allTreeVals = collectTreeValues(workingTree);

  steps.push({
    tree: cloneTree(workingTree),
    current: workingTree ? workingTree.val : null,
    leftVal: null,
    rightVal: null,
    invertedCount,
    isSwapping: false,
    visitedNodes: allTreeVals,
    highlightedNodes: allTreeVals,
    action: 'done',
    decision: `🎉 二叉树翻转全部完成！共执行 ${invertedCount} 次子树互换`,
    message: `🎉 二叉树翻转全部完成！共执行 ${invertedCount} 次子树互换。`,
    log: `✓ 全部完成 (共交换 ${invertedCount} 次)`,
    codeLine: L.returnRoot,
    metrics: { '总交换次数': invertedCount, '整树状态': '完全镜像倒置', '时间复杂度': 'O(N)' },
    statusBadge: { text: `翻转完成 (${invertedCount} 次交换)`, type: 'success' },
    callTrace: trace.snapshot(),
  });

  return steps;
}

// ============================================================
// Stage 2 Step Generator: 队列层序遍历翻转 (Iterative Queue BFS)
// ============================================================
export function buildTreeInvertBfsSteps(root: TreeNode | null): InvertStep[] {
  const steps: InvertStep[] = [];
  const L = TREE_INVERT_STAGE2_QUEUE_LINES;
  const workingTree = cloneTree(root);

  if (!workingTree) {
    steps.push({
      tree: null,
      current: null,
      leftVal: null,
      rightVal: null,
      invertedCount: 0,
      isSwapping: false,
      action: 'done',
      decision: '空二叉树：无需翻转，返回 null',
      message: '✅ 翻转完成，返回 null。',
      log: '✓ 翻转完成 (null)',
      codeLine: L.nullCheck,
      metrics: { '已互换次数': 0 },
      statusBadge: { text: '空树完成', type: 'success' },
    });
    return steps;
  }

  const queue: TreeNode[] = [workingTree];
  const qVals = (): (number | string)[] => queue.map(n => n.val);
  let invertedCount = 0;

  steps.push({
    tree: cloneTree(workingTree),
    current: workingTree.val,
    leftVal: null,
    rightVal: null,
    invertedCount: 0,
    isSwapping: false,
    action: 'init',
    queue: qVals(),
    decision: `初始化 BFS 队列：将根节点 ${workingTree.val} 推入队列`,
    actionName: 'init-queue',
    message: `启动广度优先遍历层序翻转：初始化队列，根节点 ${workingTree.val} 入队。`,
    log: `queue init: [${workingTree.val}]`,
    codeLine: L.initQueue,
    metrics: { '当前队列大小': 1, '已翻转节点数': 0 },
    statusBadge: { text: '根节点入队', type: 'info' },
  });

  while (queue.length > 0) {
    const cur = queue.shift()!;
    const lVal = cur.left ? cur.left.val : null;
    const rVal = cur.right ? cur.right.val : null;

    steps.push({
      tree: cloneTree(workingTree),
      current: cur.val,
      leftVal: lVal,
      rightVal: rVal,
      invertedCount,
      isSwapping: false,
      action: 'poll',
      queue: qVals(),
      decision: `队列头部出队节点 ${cur.val}：原左孩子 ${lVal ?? 'null'}，原右孩子 ${rVal ?? 'null'}`,
      message: `从队列头部弹出节点 ${cur.val}，准备交换其左右孩子指针。`,
      log: `poll cur = ${cur.val}`,
      codeLine: L.poll,
      metrics: { '出队节点': cur.val, '剩余队列': queue.length },
      statusBadge: { text: `出队 ${cur.val}`, type: 'info' },
    });

    // 交换
    const temp = cur.left;
    cur.left = cur.right;
    cur.right = temp;
    invertedCount++;

    steps.push({
      tree: cloneTree(workingTree),
      current: cur.val,
      leftVal: cur.left ? cur.left.val : null,
      rightVal: cur.right ? cur.right.val : null,
      invertedCount,
      isSwapping: true,
      action: 'swap',
      queue: qVals(),
      decision: `🔀 交换节点 ${cur.val} 的左右孩子指针完成 (新左: ${cur.left?.val ?? 'null'}, 新右: ${cur.right?.val ?? 'null'})`,
      message: `交换完成！节点 ${cur.val} 的左右指针互换。`,
      log: `swap cur = ${cur.val} children`,
      codeLine: L.swap,
      metrics: { '当前节点': cur.val, '已互换次数': invertedCount },
      statusBadge: { text: `交换成功 (#${invertedCount})`, type: 'warning' },
    });

    if (cur.left) {
      queue.push(cur.left);
      steps.push({
        tree: cloneTree(workingTree),
        current: cur.val,
        leftVal: cur.left.val,
        rightVal: cur.right ? cur.right.val : null,
        invertedCount,
        isSwapping: false,
        action: 'push-left',
        queue: qVals(),
        decision: `非空左孩子 ${cur.left.val} 入队等待下一轮翻转`,
        message: `将节点 ${cur.val} 的新左孩子 ${cur.left.val} 推入队列。`,
        log: `push left child ${cur.left.val}`,
        codeLine: L.pushLeft,
        metrics: { '入队节点': cur.left.val, '当前队列': queue.length },
        statusBadge: { text: `入队 ${cur.left.val}`, type: 'info' },
      });
    }

    if (cur.right) {
      queue.push(cur.right);
      steps.push({
        tree: cloneTree(workingTree),
        current: cur.val,
        leftVal: cur.left ? cur.left.val : null,
        rightVal: cur.right.val,
        invertedCount,
        isSwapping: false,
        action: 'push-right',
        queue: qVals(),
        decision: `非空右孩子 ${cur.right.val} 入队等待下一轮翻转`,
        message: `将节点 ${cur.val} 的新右孩子 ${cur.right.val} 推入队列。`,
        log: `push right child ${cur.right.val}`,
        codeLine: L.pushRight,
        metrics: { '入队节点': cur.right.val, '当前队列': queue.length },
        statusBadge: { text: `入队 ${cur.right.val}`, type: 'info' },
      });
    }
  }

  const allTreeVals = collectTreeValues(workingTree);

  steps.push({
    tree: cloneTree(workingTree),
    current: workingTree ? workingTree.val : null,
    leftVal: null,
    rightVal: null,
    invertedCount,
    isSwapping: false,
    visitedNodes: allTreeVals,
    highlightedNodes: allTreeVals,
    action: 'done',
    queue: [],
    decision: `🎉 队列已清空，层序遍历翻转完成！共交换 ${invertedCount} 次`,
    message: `🎉 广度优先层序遍历翻转圆满完成！整棵二叉树已完全镜像倒置。`,
    log: `✓ BFS 完成 (共交换 ${invertedCount} 次)`,
    codeLine: L.returnRoot,
    metrics: { '总交换次数': invertedCount, '算法时间复杂度': 'O(N)', '空间复杂度': 'O(W)' },
    statusBadge: { text: `翻转完成 (${invertedCount} 次)`, type: 'success' },
  });

  return steps;
}

// ============================================================
// Stage 3 Step Generator: 静态数组模拟队列 (Static Array Queue)
// ============================================================
export function buildTreeInvertStaticArraySteps(root: TreeNode | null): InvertStep[] {
  const steps: InvertStep[] = [];
  const L = TREE_INVERT_STAGE3_STATIC_ARRAY_LINES;
  const workingTree = cloneTree(root);

  if (!workingTree) {
    steps.push({
      tree: null,
      current: null,
      leftVal: null,
      rightVal: null,
      invertedCount: 0,
      isSwapping: false,
      action: 'done',
      decision: '空二叉树：无需翻转，返回 null',
      message: '✅ 翻转完成，返回 null。',
      log: '✓ 翻转完成 (null)',
      codeLine: L.nullCheck,
      metrics: { '已互换次数': 0 },
      statusBadge: { text: '空树完成', type: 'success' },
    });
    return steps;
  }

  const MAXN = 2001;
  const queue: TreeNode[] = new Array(MAXN);
  let l = 0;
  let r = 0;
  let invertedCount = 0;

  queue[r++] = workingTree;

  const getArraySnapshot = (currL: number, currR: number): (number | string)[] => {
    const arr: (number | string)[] = [];
    for (let i = 0; i < Math.min(currR + 2, 10); i++) {
      if (i < currR) {
        arr.push(queue[i]?.val ?? '—');
      } else {
        arr.push('—');
      }
    }
    return arr;
  };

  steps.push({
    tree: cloneTree(workingTree),
    current: workingTree.val,
    leftVal: null,
    rightVal: null,
    invertedCount: 0,
    isSwapping: false,
    action: 'init',
    decision: `连续内存初始化：queue[0]=${workingTree.val} (l=0, r=1)`,
    message: `左神 Class 036 招牌零 GC 连续内存队列：使用 queue[MAXN] 与双指针 l=0, r=1 消除频繁对象垃圾回收。`,
    log: `static queue init: l=${l}, r=${r}`,
    codeLine: L.initQueue,
    staticQueueState: {
      array: getArraySnapshot(l, r),
      l,
      r,
      cur: workingTree.val,
    },
    metrics: { '双指针状态': `l=${l}, r=${r}`, '待处理元素': r - l, '内存优化': '零 GC 连续内存' },
    statusBadge: { text: '静态队列就绪', type: 'info' },
  });

  while (l < r) {
    const cur = queue[l++];
    const lVal = cur.left ? cur.left.val : null;
    const rVal = cur.right ? cur.right.val : null;

    steps.push({
      tree: cloneTree(workingTree),
      current: cur.val,
      leftVal: lVal,
      rightVal: rVal,
      invertedCount,
      isSwapping: false,
      action: 'poll',
      decision: `双指针出队：cur=queue[${l - 1}]=${cur.val} (l推进至 ${l})`,
      message: `从连续数组弹出节点 ${cur.val}。`,
      log: `poll cur = ${cur.val} (l=${l}, r=${r})`,
      codeLine: L.poll,
      staticQueueState: {
        array: getArraySnapshot(l, r),
        l,
        r,
        cur: cur.val,
      },
      metrics: { '当前出队': cur.val, '指针范围': `[l=${l}, r=${r})` },
      statusBadge: { text: `出队 ${cur.val}`, type: 'info' },
    });

    // 交换
    const temp = cur.left;
    cur.left = cur.right;
    cur.right = temp;
    invertedCount++;

    steps.push({
      tree: cloneTree(workingTree),
      current: cur.val,
      leftVal: cur.left ? cur.left.val : null,
      rightVal: cur.right ? cur.right.val : null,
      invertedCount,
      isSwapping: true,
      action: 'swap',
      decision: `🔀 交换节点 ${cur.val} 左右指针完成 (新左: ${cur.left?.val ?? 'null'}, 新右: ${cur.right?.val ?? 'null'})`,
      message: `交换完成！节点 ${cur.val} 的左右孩子指针互换。`,
      log: `swap cur = ${cur.val}`,
      codeLine: L.swap,
      staticQueueState: {
        array: getArraySnapshot(l, r),
        l,
        r,
        cur: cur.val,
      },
      metrics: { '当前节点': cur.val, '已互换次数': invertedCount },
      statusBadge: { text: `交换成功 (#${invertedCount})`, type: 'warning' },
    });

    if (cur.left) {
      queue[r++] = cur.left;
      steps.push({
        tree: cloneTree(workingTree),
        current: cur.val,
        leftVal: cur.left.val,
        rightVal: cur.right ? cur.right.val : null,
        invertedCount,
        isSwapping: false,
        action: 'push-left',
        decision: `左孩子写入连续数组 queue[${r - 1}]=${cur.left.val} (r递增至 ${r})`,
        message: `将非空左孩子 ${cur.left.val} 写入连续数组末尾。`,
        log: `push left: queue[${r - 1}]=${cur.left.val}`,
        codeLine: L.pushLeft,
        staticQueueState: {
          array: getArraySnapshot(l, r),
          l,
          r,
          cur: cur.val,
        },
        metrics: { '写入槽位': `[${r - 1}]`, '双指针状态': `l=${l}, r=${r}` },
        statusBadge: { text: `写入左孩子 ${cur.left.val}`, type: 'info' },
      });
    }

    if (cur.right) {
      queue[r++] = cur.right;
      steps.push({
        tree: cloneTree(workingTree),
        current: cur.val,
        leftVal: cur.left ? cur.left.val : null,
        rightVal: cur.right.val,
        invertedCount,
        isSwapping: false,
        action: 'push-right',
        decision: `右孩子写入连续数组 queue[${r - 1}]=${cur.right.val} (r递增至 ${r})`,
        message: `将非空右孩子 ${cur.right.val} 写入连续数组末尾。`,
        log: `push right: queue[${r - 1}]=${cur.right.val}`,
        codeLine: L.pushRight,
        staticQueueState: {
          array: getArraySnapshot(l, r),
          l,
          r,
          cur: cur.val,
        },
        metrics: { '写入槽位': `[${r - 1}]`, '双指针状态': `l=${l}, r=${r}` },
        statusBadge: { text: `写入右孩子 ${cur.right.val}`, type: 'info' },
      });
    }
  }

  const allTreeVals = collectTreeValues(workingTree);

  steps.push({
    tree: cloneTree(workingTree),
    current: workingTree ? workingTree.val : null,
    leftVal: null,
    rightVal: null,
    invertedCount,
    isSwapping: false,
    visitedNodes: allTreeVals,
    highlightedNodes: allTreeVals,
    action: 'done',
    decision: `🎉 静态数组队列 l==r 清空完毕，整树翻转完成！共交换 ${invertedCount} 次`,
    message: `🎉 静态数组零 GC 翻转全部完成！共执行 ${invertedCount} 次子树互换。`,
    log: `✓ 静态数组全部完成 (共交换 ${invertedCount} 次)`,
    codeLine: L.returnRoot,
    staticQueueState: {
      array: getArraySnapshot(l, r),
      l,
      r,
      cur: null,
    },
    metrics: { '总交换次数': invertedCount, '双指针终态': `l=${l}, r=${r}`, '内存优化': '零 GC 极速' },
    statusBadge: { text: `翻转完成 (${invertedCount} 次)`, type: 'success' },
  });

  return steps;
}
