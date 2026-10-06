/**
 * 有序数组转二叉搜索树核心步进编译器 (Convert Sorted Array to BST Step Compiler)
 * LeetCode 108
 * 遵循 Matt Pocock 深模块哲学与纯领域逻辑分层架构
 */

import { parseNumberList } from '../../input-primitives';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from './recursive-call-trace-adapter';
import { HighlightTarget } from '../../step-visualizer';
import { TreeNode } from '../../../algorithms/categories/tree/tree-template';
import { cloneStateDepTree } from '../../strategies/tree-clone';
import {
  SORTED_ARRAY_TO_BST_STAGE1_LINES,
  SORTED_ARRAY_TO_BST_STAGE2_LINES,
  SORTED_ARRAY_TO_BST_STAGE3_LINES,
} from '../../../algorithms/categories/tree/sorted-array-to-bst-stage-codes';

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

export function parseAndBuildSortedArrayToBstNums(inputs?: Record<string, any>): number[] {
  return parseNumberList(inputs?.['input-nums'] || '-10, -3, 0, 5, 9', [-10, -3, 0, 5, 9]);
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

    trace.addUnwindCalc(
      `节点 ${midVal} 左右子树构建完成并挂载`,
      depth,
      `左: ${node.left ? node.left.val : 'null'}, 右: ${node.right ? node.right.val : 'null'}`,
      String(midVal)
    );
    steps.push({
      tree: cloneTree(currentTreeRoot),
      nums,
      left,
      right,
      mid,
      currentVal: midVal,
      action: 'unwind',
      decision: `节点 ${midVal} 左右平衡子树构建完毕，向上层返回节点引用`,
      message: `节点 ${midVal} 的左右孩子已成功就绪（左: ${node.left ? node.left.val : 'null'}，右: ${
        node.right ? node.right.val : 'null'
      }），子树平衡度合格。`,
      log: `Node ${midVal} fully built`,
      codeLine: SORTED_ARRAY_TO_BST_STAGE1_LINES.returnRoot,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [midVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== midVal),
      metrics: {
        '就绪节点': midVal,
        '左孩子': node.left ? node.left.val : 'null',
        '右孩子': node.right ? node.right.val : 'null',
      },
    });

    return node;
  }

  const resultTree = build(0, n - 1, 0);
  const allNodes = collectTreeValues(resultTree);

  trace.addFinalResult(
    '偏左中点平衡 BST 构建全部完成',
    0,
    `根节点: ${resultTree ? resultTree.val : 'null'}`,
    resultTree ? String(resultTree.val) : 'null'
  );
  steps.push({
    tree: cloneTree(resultTree),
    nums,
    left: 0,
    right: n - 1,
    mid: null,
    currentVal: resultTree ? resultTree.val : null,
    action: 'done',
    decision: '高度平衡二叉搜索树构建完成',
    message: `全部元素转换完成！生成一棵严格满足左小右大且任意节点子树高度差 <= 1 的平衡 BST，根节点为 ${
      resultTree ? resultTree.val : 'null'
    }。`,
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

    trace.addUnwindCalc(
      `节点 ${midVal} 构建完毕`,
      depth,
      `左: ${node.left ? node.left.val : 'null'}, 右: ${node.right ? node.right.val : 'null'}`,
      String(midVal)
    );
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

  trace.addFinalResult(
    '偏右中点平衡 BST 构建全部完成',
    0,
    `根节点: ${resultTree ? resultTree.val : 'null'}`,
    resultTree ? String(resultTree.val) : 'null'
  );
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
