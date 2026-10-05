/**
 * 将有序数组转换为二叉搜索树可视化器 (Convert Sorted Array to BST · LeetCode 108)
 * 采用顶层声明式架构与双版本综合长处整合 (Bi-Version Synthesis)
 *
 * Stage 1: 偏左中点经典分治递归 (Classic Divide & Conquer · 偏左取中)
 * Stage 2: 偏右中点分治递归 (Right-Biased Divide & Conquer · 探索平衡多解)
 * Stage 3: 三队列显式 BFS 迭代模拟 (Iterative BFS Three-Queues · 零递归调用栈)
 */

import { parseNumberList } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceAdapter,
  RecursiveCallTraceSnapshot,
} from '../../../core/renderers/adapters/recursive-call-trace-adapter';
import { HighlightTarget } from '../../../core/step-visualizer';
import { TreeNode } from './tree-template';
import { cloneStateDepTree } from '../../../core/strategies/tree-clone';
import {
  SORTED_ARRAY_TO_BST_PROBLEM_HTML,
  SORTED_ARRAY_TO_BST_ANALYSIS_HTML,
} from './sorted-array-to-bst-problem-content';
import {
  SORTED_ARRAY_TO_BST_STAGE1_CODES,
  SORTED_ARRAY_TO_BST_STAGE1_LINES,
  SORTED_ARRAY_TO_BST_STAGE2_CODES,
  SORTED_ARRAY_TO_BST_STAGE2_LINES,
  SORTED_ARRAY_TO_BST_STAGE3_CODES,
  SORTED_ARRAY_TO_BST_STAGE3_LINES,
} from './sorted-array-to-bst-stage-codes';

export interface SortedArrayToBstStep {
  tree: TreeNode | null;
  nums: number[];
  left: number;
  right: number;
  mid: number | null;
  currentVal: number | null;
  action: 'enter' | 'split' | 'create' | 'unwind' | 'done';
  decision: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  callTrace?: RecursiveCallTraceSnapshot;
  stageId?: string;
  highlightedNodes?: number[];
  visitedNodes?: number[];
  metrics?: Record<string, string | number>;
  bfsQueues?: {
    nodeVals: number[];
    leftRanges: number[];
    rightRanges: number[];
  };
}

function cloneTree(node: TreeNode | null): TreeNode | null {
  return cloneStateDepTree(node);
}

/**
 * 递归层序遍历收集二叉树中所有非空节点值
 */
export function collectTreeValues(node: TreeNode | null): number[] {
  if (!node) return [];
  const res: number[] = [];
  const queue: TreeNode[] = [node];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    res.push(cur.val);
    if (cur.left) queue.push(cur.left);
    if (cur.right) queue.push(cur.right);
  }
  return res;
}

// =========================================================================
// Stage 1: 偏左中点经典分治递归 (Classic Divide & Conquer)
// =========================================================================
export function buildSortedArrayToBstStage1Steps(nums: number[]): SortedArrayToBstStep[] {
  const steps: SortedArrayToBstStep[] = [];
  const n = nums.length;
  const trace = new RecursiveCallTraceBuilder();

  if (n === 0) {
    trace.addHeader('sortedArrayToBST(nums=[])', 0, '空数组边界防守');
    trace.addConditionHit('nums == null || nums.length == 0 -> return null', 0, '数组为空，返回 null');
    trace.addFinalResult('return null', 0, '空树直接退出', 'null');
    steps.push({
      tree: null,
      nums: [],
      left: -1,
      right: -1,
      mid: null,
      currentVal: null,
      action: 'done',
      decision: '输入数组为空，直接返回 null',
      message: '数组长度为 0，对应空树，无需构建直接返回 null。',
      log: 'empty array -> return null',
      codeLine: SORTED_ARRAY_TO_BST_STAGE1_LINES.entry,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      metrics: { '数组长度': 0, '当前状态': '空树直接返回' },
    });
    return steps;
  }

  trace.addHeader(`sortedArrayToBST(nums[${n}])`, 0, '算法入口，启动偏左中点分治构建');
  steps.push({
    tree: null,
    nums: [...nums],
    left: 0,
    right: n - 1,
    mid: null,
    currentVal: null,
    action: 'enter',
    decision: `算法启动：准备对区间 [0..${n - 1}] 执行二分分治构建`,
    message: `输入升序数组 nums=[${nums.join(', ')}]，准备递归选取中间偏左元素作为根节点，左右开工。`,
    log: `Start sortedArrayToBST with ${n} elements`,
    codeLine: SORTED_ARRAY_TO_BST_STAGE1_LINES.callBuild,
    callTrace: trace.snapshot(),
    stageId: 'stage-1',
    metrics: { '数组长度': n, '初始区间': `[0..${n - 1}]` },
  });

  let currentTreeRoot: TreeNode | null = null;

  function build(left: number, right: number, depth: number): TreeNode | null {
    trace.addHeader(`build(left=${left}, right=${right})`, depth, `进入分治区间 [${left}..${right}]`);

    if (left > right) {
      trace.addReturnLeaf(`left(${left}) > right(${right})，返回 null`, depth, 'null');
      steps.push({
        tree: cloneTree(currentTreeRoot),
        nums,
        left,
        right,
        mid: null,
        currentVal: null,
        action: 'unwind',
        decision: `区间越界 [${left}..${right}]，返回空子树 null`,
        message: `当前子区间为空 (left=${left} > right=${right})，对应叶子节点的空指针，返回 null。`,
        log: `base case: return null for [${left}..${right}]`,
        codeLine: SORTED_ARRAY_TO_BST_STAGE1_LINES.baseCheck,
        callTrace: trace.snapshot(),
        stageId: 'stage-1',
        metrics: { '当前区间': `[${left}..${right}]`, '状态': '越界返回 null' },
      });
      return null;
    }

    const mid = Math.floor((left + right) / 2);
    const midVal = nums[mid];
    const node: TreeNode = { val: midVal, left: null, right: null };

    if (!currentTreeRoot) {
      currentTreeRoot = node;
    }

    trace.addConditionPass(`选定偏左中点 mid=${mid} (nums[${mid}]=${midVal})`, depth, `创建根节点 TreeNode(${midVal})`);
    steps.push({
      tree: cloneTree(currentTreeRoot),
      nums,
      left,
      right,
      mid,
      currentVal: midVal,
      action: 'create',
      decision: `中点划分：选取索引 mid=${mid} 处的值 ${midVal} 创建子树根节点`,
      message: `区间 [${left}..${right}] 中点 mid=Math.floor((${left}+${right})/2)=${mid}，以 nums[${mid}]=${midVal} 创建节点。`,
      log: `Mid selected: nums[${mid}]=${midVal}`,
      codeLine: SORTED_ARRAY_TO_BST_STAGE1_LINES.createNode,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [midVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== midVal),
      metrics: { '当前区间': `[${left}..${right}]`, '选中中点': mid, '节点值': midVal },
    });

    // 递归左子树
    trace.addRecursePrep(`递归左子树: build(${left}, ${mid - 1})`, depth, `左半区间 [${left}..${mid - 1}]`);
    steps.push({
      tree: cloneTree(currentTreeRoot),
      nums,
      left,
      right,
      mid,
      currentVal: midVal,
      action: 'split',
      decision: `递归深入：构建节点 ${midVal} 的左子树 [${left}..${mid - 1}]`,
      message: `准备构建节点 ${midVal} 的左子树，划分区间为 [${left}..${mid - 1}]。`,
      log: `Recurse left for ${midVal}: [${left}..${mid - 1}]`,
      codeLine: SORTED_ARRAY_TO_BST_STAGE1_LINES.leftRecurse,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [midVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== midVal),
      metrics: { '父节点': midVal, '左子区间': `[${left}..${mid - 1}]` },
    });

    node.left = build(left, mid - 1, depth + 1);

    // 递归右子树
    trace.addRecursePrep(`递归右子树: build(${mid + 1}, ${right})`, depth, `右半区间 [${mid + 1}..${right}]`);
    steps.push({
      tree: cloneTree(currentTreeRoot),
      nums,
      left,
      right,
      mid,
      currentVal: midVal,
      action: 'split',
      decision: `递归深入：构建节点 ${midVal} 的右子树 [${mid + 1}..${right}]`,
      message: `准备构建节点 ${midVal} 的右子树，划分区间为 [${mid + 1}..${right}]。`,
      log: `Recurse right for ${midVal}: [${mid + 1}..${right}]`,
      codeLine: SORTED_ARRAY_TO_BST_STAGE1_LINES.rightRecurse,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [midVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== midVal),
      metrics: { '父节点': midVal, '右子区间': `[${mid + 1}..${right}]` },
    });

    node.right = build(mid + 1, right, depth + 1);

    trace.addUnwindCalc(`节点 ${midVal} 左右子树构建完成并挂载`, depth, `左: ${node.left ? node.left.val : 'null'}, 右: ${node.right ? node.right.val : 'null'}`, String(midVal));
    steps.push({
      tree: cloneTree(currentTreeRoot),
      nums,
      left,
      right,
      mid,
      currentVal: midVal,
      action: 'unwind',
      decision: `节点 ${midVal} 左右平衡子树构建完毕，向上层返回节点引用`,
      message: `节点 ${midVal} 的左右孩子已成功就绪（左: ${node.left ? node.left.val : 'null'}，右: ${node.right ? node.right.val : 'null'}），子树平衡度合格。`,
      log: `Node ${midVal} fully built`,
      codeLine: SORTED_ARRAY_TO_BST_STAGE1_LINES.returnRoot,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [midVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== midVal),
      metrics: { '就绪节点': midVal, '左孩子': node.left ? node.left.val : 'null', '右孩子': node.right ? node.right.val : 'null' },
    });

    return node;
  }

  const resultTree = build(0, n - 1, 0);
  const allNodes = collectTreeValues(resultTree);

  trace.addFinalResult('偏左中点平衡 BST 构建全部完成', 0, `根节点: ${resultTree ? resultTree.val : 'null'}`, resultTree ? String(resultTree.val) : 'null');
  steps.push({
    tree: cloneTree(resultTree),
    nums,
    left: 0,
    right: n - 1,
    mid: null,
    currentVal: resultTree ? resultTree.val : null,
    action: 'done',
    decision: '高度平衡二叉搜索树构建完成',
    message: `全部元素转换完成！生成一棵严格满足左小右大且任意节点子树高度差 <= 1 的平衡 BST，根节点为 ${resultTree ? resultTree.val : 'null'}。`,
    log: 'sortedArrayToBST finished successfully',
    codeLine: SORTED_ARRAY_TO_BST_STAGE1_LINES.done,
    callTrace: trace.snapshot(),
    stageId: 'stage-1',
    highlightedNodes: resultTree ? [resultTree.val] : [],
    visitedNodes: allNodes,
    metrics: { '最终根节点': resultTree ? resultTree.val : 'null', '节点总数': n },
  });

  return steps;
}

// =========================================================================
// Stage 2: 偏右中点分治递归 (Right-Biased Divide & Conquer)
// =========================================================================
export function buildSortedArrayToBstStage2Steps(nums: number[]): SortedArrayToBstStep[] {
  const steps: SortedArrayToBstStep[] = [];
  const n = nums.length;
  const trace = new RecursiveCallTraceBuilder();

  if (n === 0) {
    trace.addHeader('sortedArrayToBST(nums=[])', 0, '空数组校验');
    trace.addConditionHit('nums == null || nums.length == 0 -> return null', 0, '返回 null');
    trace.addFinalResult('return null', 0, '退出', 'null');
    steps.push({
      tree: null,
      nums: [],
      left: -1,
      right: -1,
      mid: null,
      currentVal: null,
      action: 'done',
      decision: '输入数组为空，直接返回 null',
      message: '数组长度为 0，直接返回 null。',
      log: 'empty array -> return null',
      codeLine: SORTED_ARRAY_TO_BST_STAGE2_LINES.entry,
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      metrics: { '数组长度': 0, '当前状态': '空树直接退出' },
    });
    return steps;
  }

  trace.addHeader(`sortedArrayToBST(nums[${n}])`, 0, '启动 Stage 2 偏右中点分治构建');
  steps.push({
    tree: null,
    nums: [...nums],
    left: 0,
    right: n - 1,
    mid: null,
    currentVal: null,
    action: 'enter',
    decision: '算法启动：采用偏右中点向上取整策略构建平衡 BST',
    message: `准备利用 mid = Math.floor((left + right + 1) / 2) 向上取整选择中点，探索同构平衡树形态。`,
    log: `Start Stage 2 right-biased build`,
    codeLine: SORTED_ARRAY_TO_BST_STAGE2_LINES.callBuild,
    callTrace: trace.snapshot(),
    stageId: 'stage-2',
    metrics: { '数组长度': n, '取中策略': '偏右向上取整' },
  });

  let currentTreeRoot: TreeNode | null = null;

  function build(left: number, right: number, depth: number): TreeNode | null {
    trace.addHeader(`build(left=${left}, right=${right})`, depth, `进入分治区间 [${left}..${right}]`);

    if (left > right) {
      trace.addReturnLeaf(`left(${left}) > right(${right})，返回 null`, depth, 'null');
      steps.push({
        tree: cloneTree(currentTreeRoot),
        nums,
        left,
        right,
        mid: null,
        currentVal: null,
        action: 'unwind',
        decision: `区间越界 [${left}..${right}]，返回空子树 null`,
        message: `子区间为空，返回 null。`,
        log: `base case: return null for [${left}..${right}]`,
        codeLine: SORTED_ARRAY_TO_BST_STAGE2_LINES.baseCheck,
        callTrace: trace.snapshot(),
        stageId: 'stage-2',
        metrics: { '当前区间': `[${left}..${right}]`, '状态': '越界' },
      });
      return null;
    }

    const mid = Math.floor((left + right + 1) / 2);
    const midVal = nums[mid];
    const node: TreeNode = { val: midVal, left: null, right: null };

    if (!currentTreeRoot) {
      currentTreeRoot = node;
    }

    trace.addConditionPass(`选定偏右中点 mid=${mid} (nums[${mid}]=${midVal})`, depth, `创建节点 TreeNode(${midVal})`);
    steps.push({
      tree: cloneTree(currentTreeRoot),
      nums,
      left,
      right,
      mid,
      currentVal: midVal,
      action: 'create',
      decision: `偏右取中：选取索引 mid=${mid} 处的值 ${midVal} 作为子树根`,
      message: `区间 [${left}..${right}] 偏右中点 mid=Math.floor((${left}+${right}+1)/2)=${mid}，创建节点 ${midVal}。`,
      log: `Right-biased mid selected: nums[${mid}]=${midVal}`,
      codeLine: SORTED_ARRAY_TO_BST_STAGE2_LINES.createNode,
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      highlightedNodes: [midVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== midVal),
      metrics: { '当前区间': `[${left}..${right}]`, '选中偏右中点': mid, '节点值': midVal },
    });

    // 递归左子树
    trace.addRecursePrep(`递归左子树: build(${left}, ${mid - 1})`, depth, `深入左半区间`);
    steps.push({
      tree: cloneTree(currentTreeRoot),
      nums,
      left,
      right,
      mid,
      currentVal: midVal,
      action: 'split',
      decision: `递归左子树：构建节点 ${midVal} 的左孩子 [${left}..${mid - 1}]`,
      message: `准备构建节点 ${midVal} 的左子树，区间为 [${left}..${mid - 1}]。`,
      log: `Recurse left for ${midVal}: [${left}..${mid - 1}]`,
      codeLine: SORTED_ARRAY_TO_BST_STAGE2_LINES.leftRecurse,
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      highlightedNodes: [midVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== midVal),
      metrics: { '父节点': midVal, '左子区间': `[${left}..${mid - 1}]` },
    });

    node.left = build(left, mid - 1, depth + 1);

    // 递归右子树
    trace.addRecursePrep(`递归右子树: build(${mid + 1}, ${right})`, depth, `深入右半区间`);
    steps.push({
      tree: cloneTree(currentTreeRoot),
      nums,
      left,
      right,
      mid,
      currentVal: midVal,
      action: 'split',
      decision: `递归右子树：构建节点 ${midVal} 的右孩子 [${mid + 1}..${right}]`,
      message: `准备构建节点 ${midVal} 的右子树，区间为 [${mid + 1}..${right}]。`,
      log: `Recurse right for ${midVal}: [${mid + 1}..${right}]`,
      codeLine: SORTED_ARRAY_TO_BST_STAGE2_LINES.rightRecurse,
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      highlightedNodes: [midVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== midVal),
      metrics: { '父节点': midVal, '右子区间': `[${mid + 1}..${right}]` },
    });

    node.right = build(mid + 1, right, depth + 1);

    trace.addUnwindCalc(`节点 ${midVal} 构建完毕`, depth, `左: ${node.left ? node.left.val : 'null'}, 右: ${node.right ? node.right.val : 'null'}`, String(midVal));
    steps.push({
      tree: cloneTree(currentTreeRoot),
      nums,
      left,
      right,
      mid,
      currentVal: midVal,
      action: 'unwind',
      decision: `偏右取中：节点 ${midVal} 构建就绪并向父层返回`,
      message: `节点 ${midVal} 左右平衡子树构建完毕，向上层返回。`,
      log: `Node ${midVal} fully built (right-biased)`,
      codeLine: SORTED_ARRAY_TO_BST_STAGE2_LINES.returnRoot,
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      highlightedNodes: [midVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== midVal),
      metrics: { '就绪节点': midVal },
    });

    return node;
  }

  const resultTree = build(0, n - 1, 0);
  const allNodes = collectTreeValues(resultTree);

  trace.addFinalResult('偏右中点平衡 BST 构建全部完成', 0, `根节点: ${resultTree ? resultTree.val : 'null'}`, resultTree ? String(resultTree.val) : 'null');
  steps.push({
    tree: cloneTree(resultTree),
    nums,
    left: 0,
    right: n - 1,
    mid: null,
    currentVal: resultTree ? resultTree.val : null,
    action: 'done',
    decision: '偏右中点高度平衡二叉搜索树构建完成',
    message: `全部元素转换完成！对比 Stage 1 可见偶数长度区间的根节点存在镜像对称或拓扑偏转，两者均 100% 满足 AVL 平衡条件。`,
    log: 'Right-biased build finished successfully',
    codeLine: SORTED_ARRAY_TO_BST_STAGE2_LINES.done,
    callTrace: trace.snapshot(),
    stageId: 'stage-2',
    highlightedNodes: resultTree ? [resultTree.val] : [],
    visitedNodes: allNodes,
    metrics: { '最终根节点': resultTree ? resultTree.val : 'null', '节点总数': n },
  });

  return steps;
}

// =========================================================================
// Stage 3: 三队列显式 BFS 迭代模拟 (Iterative BFS Three-Queues)
// =========================================================================
export function buildSortedArrayToBstStage3Steps(nums: number[]): SortedArrayToBstStep[] {
  const steps: SortedArrayToBstStep[] = [];
  const n = nums.length;

  if (n === 0) {
    steps.push({
      tree: null,
      nums: [],
      left: -1,
      right: -1,
      mid: null,
      currentVal: null,
      action: 'done',
      decision: '输入数组为空，直接返回 null',
      message: '数组为空，直接返回 null。',
      log: 'empty array -> return null',
      codeLine: SORTED_ARRAY_TO_BST_STAGE3_LINES.entry,
      stageId: 'stage-3',
      metrics: { '数组长度': 0 },
    });
    return steps;
  }

  const rootMid = Math.floor((n - 1) / 2);
  const rootNode: TreeNode = { val: nums[rootMid], left: null, right: null };

  const nodeQ: TreeNode[] = [rootNode];
  const leftQ: number[] = [0];
  const rightQ: number[] = [n - 1];

  steps.push({
    tree: cloneTree(rootNode),
    nums,
    left: 0,
    right: n - 1,
    mid: rootMid,
    currentVal: rootNode.val,
    action: 'enter',
    decision: `初始化 BFS 迭代：选取总根 nums[${rootMid}]=${rootNode.val} 入队`,
    message: `初始化三队列显式 BFS 模拟：压入根节点 ${rootNode.val} 与初始区间 [0..${n - 1}]，完全避免递归调用栈消耗。`,
    log: `Init BFS with root ${rootNode.val}`,
    codeLine: SORTED_ARRAY_TO_BST_STAGE3_LINES.initRoot,
    stageId: 'stage-3',
    highlightedNodes: [rootNode.val],
    visitedNodes: [],
    metrics: { '根节点': rootNode.val, '队列长度': nodeQ.length },
    bfsQueues: {
      nodeVals: nodeQ.map((nd) => nd.val),
      leftRanges: [...leftQ],
      rightRanges: [...rightQ],
    },
  });

  while (nodeQ.length > 0) {
    const cur = nodeQ.shift()!;
    const l = leftQ.shift()!;
    const r = rightQ.shift()!;
    const m = l + Math.floor((r - l) / 2);

    steps.push({
      tree: cloneTree(rootNode),
      nums,
      left: l,
      right: r,
      mid: m,
      currentVal: cur.val,
      action: 'split',
      decision: `出队节点 ${cur.val}，处理其当前负责区间 [${l}..${r}]`,
      message: `从队列中取出节点 ${cur.val}，对应区间 [${l}..${r}]，中点 m=${m}。准备探测并挂载左右子区间。`,
      log: `Poll node ${cur.val} for range [${l}..${r}]`,
      codeLine: SORTED_ARRAY_TO_BST_STAGE3_LINES.pollNode,
      stageId: 'stage-3',
      highlightedNodes: [cur.val],
      visitedNodes: collectTreeValues(rootNode).filter((v) => v !== cur.val),
      metrics: { '出队节点': cur.val, '当前区间': `[${l}..${r}]`, '中点': m },
      bfsQueues: {
        nodeVals: nodeQ.map((nd) => nd.val),
        leftRanges: [...leftQ],
        rightRanges: [...rightQ],
      },
    });

    // 挂载左子树
    if (l <= m - 1) {
      const lm = l + Math.floor((m - 1 - l) / 2);
      const leftChild: TreeNode = { val: nums[lm], left: null, right: null };
      cur.left = leftChild;
      nodeQ.push(leftChild);
      leftQ.push(l);
      rightQ.push(m - 1);

      steps.push({
        tree: cloneTree(rootNode),
        nums,
        left: l,
        right: m - 1,
        mid: lm,
        currentVal: leftChild.val,
        action: 'create',
        decision: `左子区间 [${l}..${m - 1}] 就绪：生成左孩子 ${leftChild.val} 并入队`,
        message: `计算左子区间中点 lm=${lm}，挂载为 ${cur.val} 的左孩子，同时将新节点与区间 [${l}..${m - 1}] 压入 BFS 队列。`,
        log: `Attach left child ${leftChild.val} to ${cur.val}`,
        codeLine: SORTED_ARRAY_TO_BST_STAGE3_LINES.attachLeft,
        stageId: 'stage-3',
        highlightedNodes: [leftChild.val, cur.val],
        visitedNodes: collectTreeValues(rootNode).filter((v) => v !== leftChild.val && v !== cur.val),
        metrics: { '新挂左孩子': leftChild.val, '父节点': cur.val, '左区间': `[${l}..${m - 1}]` },
        bfsQueues: {
          nodeVals: nodeQ.map((nd) => nd.val),
          leftRanges: [...leftQ],
          rightRanges: [...rightQ],
        },
      });
    }

    // 挂载右子树
    if (m + 1 <= r) {
      const rm = m + 1 + Math.floor((r - (m + 1)) / 2);
      const rightChild: TreeNode = { val: nums[rm], left: null, right: null };
      cur.right = rightChild;
      nodeQ.push(rightChild);
      leftQ.push(m + 1);
      rightQ.push(r);

      steps.push({
        tree: cloneTree(rootNode),
        nums,
        left: m + 1,
        right: r,
        mid: rm,
        currentVal: rightChild.val,
        action: 'create',
        decision: `右子区间 [${m + 1}..${r}] 就绪：生成右孩子 ${rightChild.val} 并入队`,
        message: `计算右子区间中点 rm=${rm}，挂载为 ${cur.val} 的右孩子，同时将新节点与区间 [${m + 1}..${r}] 压入 BFS 队列。`,
        log: `Attach right child ${rightChild.val} to ${cur.val}`,
        codeLine: SORTED_ARRAY_TO_BST_STAGE3_LINES.attachRight,
        stageId: 'stage-3',
        highlightedNodes: [rightChild.val, cur.val],
        visitedNodes: collectTreeValues(rootNode).filter((v) => v !== rightChild.val && v !== cur.val),
        metrics: { '新挂右孩子': rightChild.val, '父节点': cur.val, '右区间': `[${m + 1}..${r}]` },
        bfsQueues: {
          nodeVals: nodeQ.map((nd) => nd.val),
          leftRanges: [...leftQ],
          rightRanges: [...rightQ],
        },
      });
    }
  }

  const allTreeVals = collectTreeValues(rootNode);

  steps.push({
    tree: cloneTree(rootNode),
    nums,
    left: 0,
    right: n - 1,
    mid: rootMid,
    currentVal: rootNode.val,
    action: 'done',
    decision: '三队列显式 BFS 迭代平衡 BST 构建完成',
    message: `全部区间消费完毕！队列已空，整棵高度平衡二叉搜索树成功完成层序迭代还原，根节点为 ${rootNode.val}。`,
    log: 'BFS sortedArrayToBST done',
    codeLine: SORTED_ARRAY_TO_BST_STAGE3_LINES.done,
    stageId: 'stage-3',
    highlightedNodes: [rootNode.val],
    visitedNodes: allTreeVals,
    metrics: { '最终根节点': rootNode.val, '总节点数': n, '队列状态': '空队列 (消费完毕)' },
    bfsQueues: { nodeVals: [], leftRanges: [], rightRanges: [] },
  });

  return steps;
}

// =========================================================================
// 顶层声明式算法注册 (Register Declarative Algorithm)
// =========================================================================
export const sortedArrayToBstVisualizer = registerDeclarativeAlgorithm<SortedArrayToBstStep>({
  id: 'sorted-array-to-bst',
  name: '有序数组转二叉搜索树',
  category: 'tree',
  aliases: ['leetcode-108', 'convert-sorted-array-to-binary-search-tree'],
  icon: '🔄',
  badge: {
    mode: '多阶段演化: 偏左中点 · 偏右中点 · 三队列 BFS 迭代',
    complexity: 'O(N) · O(log N)',
  },
  card1Title: '📊 平衡 BST 拓扑结构沙盘',
  card2Title: '🧭 二分区间划分与调用栈/队列监视器',
  card2Desc: '当前切分区间 [left..right]、选定中点 mid 与平衡树高度监视',
  legend: [
    { label: '中点/新创建节点', color: '#fbbf24' },
    { label: '已完成子树节点', color: '#10b981' },
    { label: '正在处理节点', color: '#3b82f6' },
  ],
  inputs: [
    {
      id: 'input-nums',
      label: '升序数组 nums (逗号分隔)',
      type: 'text',
      defaultValue: '-10, -3, 0, 5, 9',
      placeholder: '例如: -10, -3, 0, 5, 9',
    },
  ],
  presets: [
    {
      label: 'LeetCode 官方标准用例 (5节点)',
      values: {
        'input-nums': '-10, -3, 0, 5, 9',
      },
      description: '奇数长度 5 节点，中点为 0，左子树 (-10, -3)，右子树 (5, 9)',
    },
    {
      label: '偶数长度测试用例 (4节点)',
      values: {
        'input-nums': '1, 2, 3, 4',
      },
      description: '偶数长度区间，适合观察偏左中点与偏右中点的拓扑偏转差异',
    },
    {
      label: '简单三节点树 (3节点)',
      values: {
        'input-nums': '1, 2, 3',
      },
      description: '经典完全满二叉树，根为 2，左右分别为 1 和 3',
    },
    {
      label: '长序列平衡测试 (7节点)',
      values: {
        'input-nums': '0, 1, 2, 3, 4, 5, 6',
      },
      description: '7 节点满二叉搜索树，根为 3',
    },
    {
      label: '单节点极限用例',
      values: {
        'input-nums': '42',
      },
      description: '仅包含单一元素 42',
    },
  ],
  metrics: [
    { id: 'cur-range', label: '当前区间 [L..R]', color: '#3b82f6' },
    { id: 'mid-val', label: '选中中点根节点', color: '#fbbf24' },
    { id: 'action-type', label: '当前分治动作', color: '#10b981' },
  ],
  codeLanguages: SORTED_ARRAY_TO_BST_STAGE1_CODES,
  problemHtml: SORTED_ARRAY_TO_BST_PROBLEM_HTML,
  analysisHtml: SORTED_ARRAY_TO_BST_ANALYSIS_HTML,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 偏左中点经典分治递归 (LC 108 经典二分)',
      shortName: '偏左中点递归',
      num: 1,
      codeLanguages: SORTED_ARRAY_TO_BST_STAGE1_CODES,
      buildSteps: (inputs) => {
        const nums = parseNumberList(inputs?.['input-nums'] || '-10, -3, 0, 5, 9', [-10, -3, 0, 5, 9]);
        return buildSortedArrayToBstStage1Steps(nums);
      },
      renderCanvas: (container, step) => renderSortedArrayToBstCanvas(container, step),
      renderCustomMetrics: (container, step) => renderSortedArrayToBstCustomMetrics(container, step),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 偏右中点分治递归 (探索二叉搜索树多解)',
      shortName: '偏右中点递归',
      num: 2,
      codeLanguages: SORTED_ARRAY_TO_BST_STAGE2_CODES,
      buildSteps: (inputs) => {
        const nums = parseNumberList(inputs?.['input-nums'] || '-10, -3, 0, 5, 9', [-10, -3, 0, 5, 9]);
        return buildSortedArrayToBstStage2Steps(nums);
      },
      renderCanvas: (container, step) => renderSortedArrayToBstCanvas(container, step),
      renderCustomMetrics: (container, step) => renderSortedArrayToBstCustomMetrics(container, step),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 三队列显式 BFS 迭代模拟 (零递归调用栈)',
      shortName: '三队列迭代',
      num: 3,
      codeLanguages: SORTED_ARRAY_TO_BST_STAGE3_CODES,
      buildSteps: (inputs) => {
        const nums = parseNumberList(inputs?.['input-nums'] || '-10, -3, 0, 5, 9', [-10, -3, 0, 5, 9]);
        return buildSortedArrayToBstStage3Steps(nums);
      },
      renderCanvas: (container, step) => renderSortedArrayToBstCanvas(container, step),
      renderCustomMetrics: (container, step) => renderSortedArrayToBstCustomMetrics(container, step),
    },
  ],
  generateSteps: (inputs) => {
    const nums = parseNumberList(inputs?.['input-nums'] || '-10, -3, 0, 5, 9', [-10, -3, 0, 5, 9]);
    return buildSortedArrayToBstStage1Steps(nums);
  },
  buildSteps: (inputs) => {
    const nums = parseNumberList(inputs?.['input-nums'] || '-10, -3, 0, 5, 9', [-10, -3, 0, 5, 9]);
    return buildSortedArrayToBstStage1Steps(nums);
  },
  renderCanvas: (container, step) => renderSortedArrayToBstCanvas(container, step),
  renderCustomMetrics: (container, step) => renderSortedArrayToBstCustomMetrics(container, step),
});

/**
 * Card 1: 纯粹的树形沙盘渲染 (Pure SVG Sandbox)
 * 绝对零套娃、零直接修改 #dsp-custom-metrics-container、零指标污染
 */
function renderSortedArrayToBstCanvas(container: HTMLElement, step: SortedArrayToBstStep) {
  if (step.tree) {
    const allVals = collectTreeValues(step.tree);
    const isDone = step.action === 'done';
    const visited = isDone ? allVals : (step.visitedNodes ?? []);
    const highlights = step.highlightedNodes && step.highlightedNodes.length > 0
      ? step.highlightedNodes
      : (step.currentVal != null ? [step.currentVal] : []);

    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.currentVal,
      highlightedNodes: highlights,
      visitedNodes: visited,
      primaryColor: '#fbbf24', // 金黄选中节点
      visitedColor: '#10b981', // 翡翠绿完工节点
      secondaryColor: '#3b82f6', // 天蓝辅助节点
    });
  } else {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
        <svg width="240" height="120" viewBox="0 0 240 120">
          <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">分治准备中</text>
        </svg>
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">即将从区间中点选取根节点...</span>
      </div>
    `;
  }
}

/**
 * Card 2: 领域指标监控与递归调用栈沙盘 (Custom Metrics & Recursive Call Trace / Queue Monitor)
 */
export function renderSortedArrayToBstCustomMetrics(container: HTMLElement, step: SortedArrayToBstStep) {
  container.innerHTML = '';
  container.className = 'p-3 flex flex-col gap-3 min-h-[300px] overflow-y-auto';

  // 1. 顶部 4 维核心数值卡片网格
  const metricGrid = document.createElement('div');
  metricGrid.className = 'grid grid-cols-2 sm:grid-cols-4 gap-2 flex-shrink-0';
  metricGrid.innerHTML = `
    <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
      <span class="text-[10px] text-slate-400">当前分治区间:</span>
      <span class="text-sm font-bold text-sky-400 font-mono">${step.left >= 0 && step.right >= 0 ? `[${step.left}..${step.right}]` : '—'}</span>
    </div>
    <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
      <span class="text-[10px] text-slate-400">中点索引 mid:</span>
      <span class="text-sm font-bold text-amber-400 font-mono">${step.mid != null ? `mid=${step.mid}` : '—'}</span>
    </div>
    <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
      <span class="text-[10px] text-slate-400">选中节点值:</span>
      <span class="text-sm font-bold text-emerald-400 font-mono">${step.currentVal != null ? `${step.currentVal}` : '—'}</span>
    </div>
    <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
      <span class="text-[10px] text-slate-400">当前动作阶段:</span>
      <span class="text-sm font-bold text-indigo-400 font-mono">${step.action.toUpperCase()}</span>
    </div>
  `;
  container.appendChild(metricGrid);

  // 2. 中部：Stage 1/2 递归调用栈踪迹监控沙盘 VS Stage 3 显式三队列状态监控
  if (step.bfsQueues) {
    const queueBox = document.createElement('div');
    queueBox.className = 'p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/60 flex-shrink-0';
    queueBox.innerHTML = `
      <div class="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
        <span>🥞 三队列显式 BFS 状态 (Explicit Queues)</span>
        <span class="text-[10px] text-slate-400 font-normal">(O(N) 零递归栈层序构建)</span>
      </div>
      <div class="flex flex-col gap-1 text-xs font-mono">
        <div class="flex items-center gap-2">
          <span class="text-slate-400 w-24">nodeQueue:</span>
          <span class="text-amber-300 font-bold">[${step.bfsQueues.nodeVals.join(', ')}]</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-slate-400 w-24">leftQueue:</span>
          <span class="text-sky-300">[${step.bfsQueues.leftRanges.join(', ')}]</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-slate-400 w-24">rightQueue:</span>
          <span class="text-teal-300">[${step.bfsQueues.rightRanges.join(', ')}]</span>
        </div>
      </div>
    `;
    container.appendChild(queueBox);
  } else if (step.callTrace) {
    const traceBox = document.createElement('div');
    traceBox.className = 'flex-1 min-h-[160px] max-h-[260px] overflow-hidden flex flex-col rounded-lg bg-slate-800/60 border border-slate-700/50';
    RecursiveCallTraceAdapter.render(traceBox, step.callTrace);
    container.appendChild(traceBox);
  }

  // 3. 底部推演决策卡片
  const isDone = step.action === 'done';
  const summaryBox = document.createElement('div');
  summaryBox.className = `p-2.5 rounded-lg border text-xs leading-relaxed flex-shrink-0 ${
    isDone ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200' : 'bg-slate-800/50 border-slate-700/40 text-slate-300'
  }`;
  summaryBox.innerHTML = `
    <div class="font-bold mb-1 ${isDone ? 'text-emerald-400' : 'text-cyan-400'}">⚡ 决策推演: ${step.decision}</div>
    <div class="text-slate-400">${step.message}</div>
  `;
  container.appendChild(summaryBox);
}
