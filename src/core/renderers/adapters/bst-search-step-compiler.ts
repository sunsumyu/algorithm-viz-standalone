/**
 * 二叉搜索树搜索与插入步骤编译器 (BST Search & Insert Step Compiler · LeetCode 700 / 701)
 * Matt Pocock 深模块设计：将迭代单向剪枝、递归分治与动态插入完全封装解耦
 */

import { StepBase } from '../../step-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from '../../../algorithms/categories/tree/tree-template';
import { cloneStateDepTree } from '../../strategies/tree-clone';
import { parseTreeArray } from '../../input-primitives';
import {
  BST_SEARCH_STAGE1_ITERATIVE_CODE,
  BST_SEARCH_STAGE1_LINES,
  BST_SEARCH_STAGE2_RECURSIVE_CODE,
  BST_SEARCH_STAGE2_LINES,
  BST_SEARCH_STAGE3_INSERT_CODE,
  BST_SEARCH_STAGE3_LINES,
} from '../../../algorithms/categories/tree/bst-search-stage-codes';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from './recursive-call-trace-adapter';

export interface BSTSStep extends StepBase {
  tree: TreeNode | null;
  current: number | null;
  val: number;
  decision: string;
  found: boolean;
  path: number[];
  targetSubtree: TreeNode | null;
  action: 'enter' | 'left' | 'right' | 'found' | 'not-found' | 'done' | 'insert';
  message: string;
  log: string;
  codeLine: Record<string, number | number[]>;
  metrics?: Record<string, string | number>;
  stageId?: 'stage-1' | 'stage-2' | 'stage-3';
  insertedVal?: number | null;
  callTrace?: RecursiveCallTraceSnapshot;
  phase?: string;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export function cloneTree(node: TreeNode | null): TreeNode | null {
  return cloneStateDepTree(node);
}

export {
  BST_SEARCH_STAGE1_ITERATIVE_CODE,
  BST_SEARCH_STAGE1_LINES,
  BST_SEARCH_STAGE2_RECURSIVE_CODE,
  BST_SEARCH_STAGE2_LINES,
  BST_SEARCH_STAGE3_INSERT_CODE,
  BST_SEARCH_STAGE3_LINES,
};

export const BST_SEARCH_CODE_LINES = BST_SEARCH_STAGE1_LINES;

/**
 * 解析输入参数并构建树与目标值
 */
export function parseBstSearchInputs(inputs?: Record<string, any>): { root: TreeNode | null; targetVal: number } {
  const raw = inputs?.['input-tree'] || inputs?.['tree'] || '4, 2, 7, 1, 3';
  const arr = parseTreeArray(raw, [4, 2, 7, 1, 3]);
  const root = buildTree(arr);
  const targetVal = parseInt(String(inputs?.['input-target'] ?? inputs?.['target'] ?? '2'), 10);
  return { root, targetVal };
}

// ============================================================
// Stage 1: 迭代单向剪枝查找 (Iterative BST Search · LC 700)
// ============================================================
export function buildBSTSearchSteps(root: TreeNode | null, targetVal: number): BSTSStep[] {
  const steps: BSTSStep[] = [];
  const path: number[] = [];
  let found = false;
  let targetSubtree: TreeNode | null = null;

  steps.push({
    tree: root,
    current: null,
    val: targetVal,
    decision: '准备搜索',
    found: false,
    path: [],
    targetSubtree: null,
    action: 'enter',
    phase: 'init',
    stageId: 'stage-1',
    message: root
      ? `初始化迭代 BST 搜索：目标值 val = ${targetVal}，从根节点 ${root.val} 开始迭代定位。`
      : '空树，直接返回 null。',
    log: root ? `开始迭代搜索 val = ${targetVal}` : '空树 -> null',
    codeLine: BST_SEARCH_STAGE1_LINES.init,
    statusBadge: { text: '准备迭代搜索', type: 'info' },
    metrics: { '当前比对节点': '—', '分支转向决策': '准备启动', '搜索命中状态': '未开始' },
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      val: targetVal,
      decision: '未找到',
      found: false,
      path: [],
      targetSubtree: null,
      action: 'not-found',
      phase: 'return',
      stageId: 'stage-1',
      message: '❌ 空树中无法找到目标值，返回 null。',
      log: '✓ 未找到目标 (null)',
      codeLine: BST_SEARCH_STAGE1_LINES.notFound,
      statusBadge: { text: '未找到', type: 'danger' },
      metrics: { '当前比对节点': 'null', '分支转向决策': '空树直接退出', '搜索命中状态': '未找到' },
    });
    return steps;
  }

  let curr: TreeNode | null = root;

  while (curr !== null) {
    path.push(curr.val);

    steps.push({
      tree: root,
      current: curr.val,
      val: targetVal,
      decision: `比对当前节点 ${curr.val}`,
      found: false,
      path: [...path],
      targetSubtree: null,
      action: 'enter',
      phase: 'check',
      stageId: 'stage-1',
      message: `到达节点 ${curr.val}，比对目标值 val (${targetVal}) 与节点值 (${curr.val})。`,
      log: `check node: ${curr.val}`,
      codeLine: BST_SEARCH_STAGE1_LINES.whileCheck,
      statusBadge: { text: `比对 ${curr.val}`, type: 'info' },
      metrics: { '当前比对节点': curr.val, '分支转向决策': '正在比对', '搜索命中状态': '查找中' },
    });

    if (curr.val === targetVal) {
      found = true;
      targetSubtree = curr;

      steps.push({
        tree: root,
        current: curr.val,
        val: targetVal,
        decision: '命中目标',
        found: true,
        path: [...path],
        targetSubtree: curr,
        action: 'found',
        phase: 'match',
        stageId: 'stage-1',
        message: `🎯 命中目标！节点 ${curr.val} == ${targetVal}，返回以此节点为根的子树。`,
        log: `✓ 命中目标: ${curr.val} == ${targetVal}`,
        codeLine: BST_SEARCH_STAGE1_LINES.match,
        statusBadge: { text: `命中 ${curr.val}`, type: 'success' },
        metrics: { '当前比对节点': curr.val, '分支转向决策': '精准命中', '搜索命中状态': '已命中' },
      });
      break;
    } else if (targetVal < curr.val) {
      steps.push({
        tree: root,
        current: curr.val,
        val: targetVal,
        decision: '转向左子树',
        found: false,
        path: [...path],
        targetSubtree: null,
        action: 'left',
        phase: 'branch',
        stageId: 'stage-1',
        message: `目标值 ${targetVal} < 当前节点 ${curr.val}，根据 BST 有序性，目标只可能在左子树。`,
        log: `${targetVal} < ${curr.val} -> 搜左子树`,
        codeLine: BST_SEARCH_STAGE1_LINES.goLeft,
        statusBadge: { text: `搜左分支`, type: 'info' },
        metrics: { '当前比对节点': curr.val, '分支转向决策': '单向左剪枝 (Left)', '搜索命中状态': '查找中' },
      });
      curr = curr.left;
    } else {
      steps.push({
        tree: root,
        current: curr.val,
        val: targetVal,
        decision: '转向右子树',
        found: false,
        path: [...path],
        targetSubtree: null,
        action: 'right',
        phase: 'branch',
        stageId: 'stage-1',
        message: `目标值 ${targetVal} > 当前节点 ${curr.val}，根据 BST 有序性，目标只可能在右子树。`,
        log: `${targetVal} > ${curr.val} -> 搜右子树`,
        codeLine: BST_SEARCH_STAGE1_LINES.goRight,
        statusBadge: { text: `搜右分支`, type: 'info' },
        metrics: { '当前比对节点': curr.val, '分支转向决策': '单向右剪枝 (Right)', '搜索命中状态': '查找中' },
      });
      curr = curr.right;
    }
  }

  if (!found) {
    steps.push({
      tree: root,
      current: null,
      val: targetVal,
      decision: '未找到',
      found: false,
      path: [...path],
      targetSubtree: null,
      action: 'not-found',
      phase: 'return',
      stageId: 'stage-1',
      message: `❌ 遍历到达空指针 (null)，BST 中不存在值为 ${targetVal} 的节点，返回 null。`,
      log: `✓ 未找到目标 ${targetVal} (null)`,
      codeLine: BST_SEARCH_STAGE1_LINES.notFound,
      statusBadge: { text: '未找到 (null)', type: 'danger' },
      metrics: { '当前比对节点': 'null', '分支转向决策': '触底空节点', '搜索命中状态': '未找到' },
    });
  }

  steps.push({
    tree: root,
    current: found ? targetSubtree!.val : null,
    val: targetVal,
    decision: found ? '搜索成功' : '搜索失败',
    found,
    path: [...path],
    targetSubtree,
    action: 'done',
    phase: 'finish',
    stageId: 'stage-1',
    message: found
      ? `🎉 搜索完成！在路径 [${path.join(' → ')}] 上成功定位到目标节点 ${targetVal}。`
      : `❌ 搜索完成！未在树中检索到节点 ${targetVal}。`,
    log: found ? `✓ 搜索完成: 命中 ${targetVal}` : `✓ 搜索完成: 未找到 ${targetVal}`,
    codeLine: BST_SEARCH_STAGE1_LINES.done,
    statusBadge: { text: found ? `已命中 ${targetVal}` : '未找到', type: found ? 'success' : 'danger' },
    metrics: {
      '当前比对节点': found ? targetSubtree!.val : '—',
      '分支转向决策': found ? '检索成功终止' : '全树无目标',
      '搜索命中状态': found ? '已命中' : '未找到',
    },
  });

  return steps;
}

// ============================================================
// Stage 2: 递归分支剪枝查找 (Recursive BST Search · LC 700)
// ============================================================
export function buildBstSearchStage2RecursiveSteps(root: TreeNode | null, targetVal: number): BSTSStep[] {
  const steps: BSTSStep[] = [];
  const path: number[] = [];
  const trace = new RecursiveCallTraceBuilder();
  let found = false;
  let targetSubtree: TreeNode | null = null;

  if (!root) {
    trace.addHeader(`searchBST(root = null, val = ${targetVal})`, 0, '空树特判');
    trace.addReturnLeaf('return null', 0);
    trace.addFinalResult('搜索结果: null (未找到)', 0, undefined, 'null');

    steps.push({
      tree: null,
      current: null,
      val: targetVal,
      decision: '准备递归搜索：空树特判',
      found: false,
      path: [],
      targetSubtree: null,
      action: 'enter',
      phase: 'init',
      stageId: 'stage-2',
      message: '传入二叉搜索树为空树 (null)，直接返回 null。',
      log: 'root is null -> return null',
      codeLine: BST_SEARCH_STAGE2_LINES.entry,
      statusBadge: { text: '空树', type: 'info' },
      metrics: { '当前比对节点': '—', '分支转向决策': '空树直接退出', '搜索命中状态': '未开始' },
      callTrace: trace.snapshot(),
    });

    steps.push({
      tree: null,
      current: null,
      val: targetVal,
      decision: '递归基底返回：空树为 null',
      found: false,
      path: [],
      targetSubtree: null,
      action: 'not-found',
      phase: 'return',
      stageId: 'stage-2',
      message: '抵达空节点，返回 null。',
      log: 'return null',
      codeLine: BST_SEARCH_STAGE2_LINES.baseCheck,
      statusBadge: { text: '未找到 (null)', type: 'danger' },
      metrics: { '当前比对节点': 'null', '分支转向决策': '递归返回 null', '搜索命中状态': '未命中' },
      callTrace: trace.snapshot(),
    });

    return steps;
  }

  trace.addHeader(`searchBST(root = Node(${root.val}), val = ${targetVal})`, 0, '启动递归分治');

  steps.push({
    tree: root,
    current: null,
    val: targetVal,
    decision: '准备递归搜索',
    found: false,
    path: [],
    targetSubtree: null,
    action: 'enter',
    phase: 'init',
    stageId: 'stage-2',
    message: `递归分治搜索启动：目标值 val = ${targetVal}，从根节点 ${root.val} 递归深入。`,
    log: `searchBST(root: ${root.val}, val: ${targetVal})`,
    codeLine: BST_SEARCH_STAGE2_LINES.entry,
    statusBadge: { text: '递归启动', type: 'info' },
    metrics: { '当前比对节点': '—', '分支转向决策': '准备递归', '搜索命中状态': '未开始' },
    callTrace: trace.snapshot(),
  });

  function search(node: TreeNode | null, depth: number): TreeNode | null {
    if (!node) {
      trace.addHeader(`searchBST(null, ${targetVal})`, depth, '空节点判空');
      trace.addConditionHit('node == null -> return null', depth);
      trace.addReturnLeaf('return null', depth);

      steps.push({
        tree: root,
        current: null,
        val: targetVal,
        decision: '递归基底：空节点',
        found: false,
        path: [...path],
        targetSubtree: null,
        action: 'not-found',
        phase: 'base',
        stageId: 'stage-2',
        message: '抵达空节点，返回 null。',
        log: 'return null',
        codeLine: BST_SEARCH_STAGE2_LINES.baseCheck,
        statusBadge: { text: '空节点', type: 'info' },
        metrics: { '当前比对节点': 'null', '分支转向决策': '递归返回 null', '搜索命中状态': '未命中' },
        callTrace: trace.snapshot(),
      });
      return null;
    }

    path.push(node.val);

    trace.addHeader(`searchBST(Node(${node.val}), val = ${targetVal})`, depth, `比对值 ${node.val}`);
    steps.push({
      tree: root,
      current: node.val,
      val: targetVal,
      decision: `递归检查节点 ${node.val}`,
      found: false,
      path: [...path],
      targetSubtree: null,
      action: 'enter',
      phase: 'check',
      stageId: 'stage-2',
      message: `进入函数栈 searchBST(${node.val}, ${targetVal})，校验是否命中。`,
      log: `visit ${node.val}`,
      codeLine: BST_SEARCH_STAGE2_LINES.baseCheck,
      statusBadge: { text: `检查 Node ${node.val}`, type: 'info' },
      metrics: { '当前比对节点': node.val, '分支转向决策': '校验节点值', '搜索命中状态': '查找中' },
      callTrace: trace.snapshot(),
    });

    if (node.val === targetVal) {
      found = true;
      targetSubtree = node;
      trace.addConditionHit(`🎯 node.val == targetVal (${node.val} == ${targetVal}) 命中目标`, depth);
      trace.addReturnLeaf(`return Node(${node.val}) (返回目标子树)`, depth);

      steps.push({
        tree: root,
        current: node.val,
        val: targetVal,
        decision: '🎯 命中目标！直接返回子树',
        found: true,
        path: [...path],
        targetSubtree: node,
        action: 'found',
        phase: 'match',
        stageId: 'stage-2',
        message: `节点 ${node.val} == ${targetVal} 命中目标！返回以此为根的子树。`,
        log: `hit target: ${node.val}`,
        codeLine: BST_SEARCH_STAGE2_LINES.match,
        statusBadge: { text: `命中 ${node.val}`, type: 'success' },
        metrics: { '当前比对节点': node.val, '分支转向决策': '递归终止返回', '搜索命中状态': '已命中' },
        callTrace: trace.snapshot(),
      });
      return node;
    }

    if (targetVal < node.val) {
      trace.addConditionPass(`${targetVal} < ${node.val} ➔ 目标较小，往左剪枝`, depth);
      trace.addRecursePrep(`递归深入左子树 searchBST(${node.left ? node.left.val : 'null'}, ${targetVal})`, depth);

      steps.push({
        tree: root,
        current: node.val,
        val: targetVal,
        decision: '递归进入左子树',
        found: false,
        path: [...path],
        targetSubtree: null,
        action: 'left',
        phase: 'branch',
        stageId: 'stage-2',
        message: `${targetVal} < ${node.val}，递归下探左孩子 searchBST(node.left, ${targetVal})。`,
        log: `recurse left: ${node.val}`,
        codeLine: BST_SEARCH_STAGE2_LINES.recurseLeft,
        statusBadge: { text: `向左递归`, type: 'info' },
        metrics: { '当前比对节点': node.val, '分支转向决策': '向左递归', '搜索命中状态': '查找中' },
        callTrace: trace.snapshot(),
      });

      const res = search(node.left, depth + 1);
      trace.addUnwindCalc(`左子树返回: ${res ? `Node(${res.val})` : 'null'}`, depth);
      return res;
    } else {
      trace.addConditionPass(`${targetVal} > ${node.val} ➔ 目标较大，往右剪枝`, depth);
      trace.addRecursePrep(`递归深入右子树 searchBST(${node.right ? node.right.val : 'null'}, ${targetVal})`, depth);

      steps.push({
        tree: root,
        current: node.val,
        val: targetVal,
        decision: '递归进入右子树',
        found: false,
        path: [...path],
        targetSubtree: null,
        action: 'right',
        phase: 'branch',
        stageId: 'stage-2',
        message: `${targetVal} > ${node.val}，递归下探右孩子 searchBST(node.right, ${targetVal})。`,
        log: `recurse right: ${node.val}`,
        codeLine: BST_SEARCH_STAGE2_LINES.recurseRight,
        statusBadge: { text: `向右递归`, type: 'info' },
        metrics: { '当前比对节点': node.val, '分支转向决策': '向右递归', '搜索命中状态': '查找中' },
        callTrace: trace.snapshot(),
      });

      const res = search(node.right, depth + 1);
      trace.addUnwindCalc(`右子树返回: ${res ? `Node(${res.val})` : 'null'}`, depth);
      return res;
    }
  }

  const result = search(root, 0);
  trace.addFinalResult(
    result ? `🎉 成功命中目标节点 Node(${result.val})` : `❌ 树中未找到值为 ${targetVal} 的节点`,
    0,
    undefined,
    result ? result.val : 'null'
  );

  steps.push({
    tree: root,
    current: result ? result.val : null,
    val: targetVal,
    decision: result ? '递归搜索成功' : '递归搜索失败',
    found: !!result,
    path: [...path],
    targetSubtree: result,
    action: 'done',
    phase: 'finish',
    stageId: 'stage-2',
    message: result
      ? `✅ 递归搜索成功！返回节点 【${result.val}】 的子树。`
      : '❌ 递归搜索结束，树中不存在该节点，返回 null。',
    log: `done stage-2 result=${result ? result.val : 'null'}`,
    codeLine: BST_SEARCH_STAGE2_LINES.done,
    statusBadge: { text: result ? `成功命中 ${result.val}` : '未找到', type: result ? 'success' : 'danger' },
    metrics: {
      '当前比对节点': result ? result.val : '—',
      '分支转向决策': result ? '递归成功返回' : '全树无目标',
      '搜索命中状态': result ? '已命中' : '未找到',
    },
    callTrace: trace.snapshot(),
  });

  return steps;
}

// ============================================================
// Stage 3: 搜索未命中定点动态插入 (BST Search & Insert · LC 701)
// ============================================================
export function buildBstSearchStage3InsertSteps(initialRoot: TreeNode | null, targetVal: number): BSTSStep[] {
  const steps: BSTSStep[] = [];
  const path: number[] = [];

  const root = cloneTree(initialRoot);

  steps.push({
    tree: cloneTree(root),
    current: null,
    val: targetVal,
    decision: '准备动态插入检索',
    found: false,
    path: [],
    targetSubtree: null,
    action: 'enter',
    phase: 'init',
    stageId: 'stage-3',
    message: root
      ? `启动 BST 检索与动态插入：目标值 val = ${targetVal}，沿单向分支定位插入挂载槽位。`
      : `树为空，直接新建根节点 TreeNode(${targetVal})。`,
    log: root ? `insertIntoBST(val=${targetVal})` : 'empty tree -> new TreeNode',
    codeLine: BST_SEARCH_STAGE3_LINES.entry,
    statusBadge: { text: '准备插入', type: 'info' },
    metrics: { '当前比对节点': '—', '分支转向决策': '准备插入检索', '搜索命中状态': '检索槽位中' },
  });

  if (!root) {
    const newRoot: TreeNode = { val: targetVal, left: null, right: null };
    steps.push({
      tree: newRoot,
      current: targetVal,
      val: targetVal,
      decision: '空树插入作为根节点',
      found: true,
      path: [targetVal],
      targetSubtree: newRoot,
      action: 'insert',
      phase: 'insert',
      stageId: 'stage-3',
      insertedVal: targetVal,
      message: `树为空，直接创建新根节点 【${targetVal}】。`,
      log: `created root ${targetVal}`,
      codeLine: BST_SEARCH_STAGE3_LINES.emptyRoot,
      statusBadge: { text: `创建新根 ${targetVal}`, type: 'success' },
      metrics: { '当前比对节点': targetVal, '分支转向决策': '创建新根', '搜索命中状态': '已挂载' },
    });
    steps.push({
      tree: newRoot,
      current: targetVal,
      val: targetVal,
      decision: '插入构建完成',
      found: true,
      path: [targetVal],
      targetSubtree: newRoot,
      action: 'done',
      phase: 'finish',
      stageId: 'stage-3',
      insertedVal: targetVal,
      message: `🎉 插入完成！新树根节点为 【${targetVal}】。`,
      log: 'done insert',
      codeLine: BST_SEARCH_STAGE3_LINES.done,
      statusBadge: { text: `插入完成`, type: 'success' },
      metrics: { '当前比对节点': targetVal, '分支转向决策': '成功退出', '搜索命中状态': '已挂载' },
    });
    return steps;
  }

  let cur: TreeNode = root;

  while (true) {
    path.push(cur.val);

    steps.push({
      tree: cloneTree(root),
      current: cur.val,
      val: targetVal,
      decision: `探查节点 ${cur.val}`,
      found: false,
      path: [...path],
      targetSubtree: null,
      action: 'enter',
      phase: 'check',
      stageId: 'stage-3',
      message: `到达节点 ${cur.val}，比对待插入值 ${targetVal} 与 ${cur.val}。`,
      log: `check slot: ${cur.val}`,
      codeLine: BST_SEARCH_STAGE3_LINES.whileSearch,
      statusBadge: { text: `探查槽位 ${cur.val}`, type: 'info' },
      metrics: { '当前比对节点': cur.val, '分支转向决策': '探查槽位', '搜索命中状态': '寻路中' },
    });

    if (cur.val === targetVal) {
      steps.push({
        tree: cloneTree(root),
        current: cur.val,
        val: targetVal,
        decision: '节点已存在，无需插入',
        found: true,
        path: [...path],
        targetSubtree: cur,
        action: 'found',
        phase: 'match',
        stageId: 'stage-3',
        message: `目标值 ${targetVal} 在树中已经存在（节点 ${cur.val}），保持原样直接返回。`,
        log: `already exists: ${cur.val}`,
        codeLine: BST_SEARCH_STAGE3_LINES.done,
        statusBadge: { text: `节点已存在`, type: 'warning' },
        metrics: { '当前比对节点': cur.val, '分支转向决策': '值已存在', '搜索命中状态': '已有节点' },
      });
      break;
    }

    if (targetVal < cur.val) {
      steps.push({
        tree: cloneTree(root),
        current: cur.val,
        val: targetVal,
        decision: '目标偏小，检查左槽位',
        found: false,
        path: [...path],
        targetSubtree: null,
        action: 'left',
        phase: 'branch',
        stageId: 'stage-3',
        message: `${targetVal} < ${cur.val}，检查左子节点是否为空。`,
        log: `check left of ${cur.val}`,
        codeLine: BST_SEARCH_STAGE3_LINES.checkLeft,
        statusBadge: { text: `校验左槽位`, type: 'info' },
        metrics: { '当前比对节点': cur.val, '分支转向决策': '向左校验槽位', '搜索命中状态': '寻路中' },
      });

      if (!cur.left) {
        cur.left = { val: targetVal, left: null, right: null };
        steps.push({
          tree: cloneTree(root),
          current: targetVal,
          val: targetVal,
          decision: `🎉 锁定左空位！挂载新叶子节点 ${targetVal}`,
          found: true,
          path: [...path, targetVal],
          targetSubtree: cur.left,
          action: 'insert',
          phase: 'insert',
          stageId: 'stage-3',
          insertedVal: targetVal,
          message: `节点 ${cur.val} 的左孩子为空！将新节点 【${targetVal}】 挂载为 ${cur.val} 的左叶子！`,
          log: `cur.left = new TreeNode(${targetVal})`,
          codeLine: BST_SEARCH_STAGE3_LINES.insertLeft,
          statusBadge: { text: `挂载左叶子 ${targetVal}`, type: 'success' },
          metrics: { '当前比对节点': targetVal, '分支转向决策': '挂载左叶子', '搜索命中状态': '已挂载新节点' },
        });
        break;
      }
      steps.push({
        tree: cloneTree(root),
        current: cur.left.val,
        val: targetVal,
        decision: `左子节点存在，指针下移：cur = cur.left (${cur.left.val})`,
        found: false,
        path: [...path],
        targetSubtree: null,
        action: 'left',
        phase: 'branch',
        stageId: 'stage-3',
        message: `左孩子节点 ${cur.left.val} 不为空，下潜至左子树继续寻找插入位置。`,
        log: `cur = cur.left (${cur.left.val})`,
        codeLine: BST_SEARCH_STAGE3_LINES.stepLeft,
        statusBadge: { text: `下潜左节点 ${cur.left.val}`, type: 'info' },
        metrics: { '当前比对节点': cur.left.val, '分支转向决策': '深入左子树', '搜索命中状态': '寻路中' },
      });
      cur = cur.left;
    } else {
      steps.push({
        tree: cloneTree(root),
        current: cur.val,
        val: targetVal,
        decision: '目标偏大，检查右槽位',
        found: false,
        path: [...path],
        targetSubtree: null,
        action: 'right',
        phase: 'branch',
        stageId: 'stage-3',
        message: `${targetVal} > ${cur.val}，检查右子节点是否为空。`,
        log: `check right of ${cur.val}`,
        codeLine: BST_SEARCH_STAGE3_LINES.checkRight,
        statusBadge: { text: `校验右槽位`, type: 'info' },
        metrics: { '当前比对节点': cur.val, '分支转向决策': '向右校验槽位', '搜索命中状态': '寻路中' },
      });

      if (!cur.right) {
        cur.right = { val: targetVal, left: null, right: null };
        steps.push({
          tree: cloneTree(root),
          current: targetVal,
          val: targetVal,
          decision: `🎉 锁定右空位！挂载新叶子节点 ${targetVal}`,
          found: true,
          path: [...path, targetVal],
          targetSubtree: cur.right,
          action: 'insert',
          phase: 'insert',
          stageId: 'stage-3',
          insertedVal: targetVal,
          message: `节点 ${cur.val} 的右孩子为空！将新节点 【${targetVal}】 挂载为 ${cur.val} 的右叶子！`,
          log: `cur.right = new TreeNode(${targetVal})`,
          codeLine: BST_SEARCH_STAGE3_LINES.insertRight,
          statusBadge: { text: `挂载右叶子 ${targetVal}`, type: 'success' },
          metrics: { '当前比对节点': targetVal, '分支转向决策': '挂载右叶子', '搜索命中状态': '已挂载新节点' },
        });
        break;
      }
      steps.push({
        tree: cloneTree(root),
        current: cur.right.val,
        val: targetVal,
        decision: `右子节点存在，指针下移：cur = cur.right (${cur.right.val})`,
        found: false,
        path: [...path],
        targetSubtree: null,
        action: 'right',
        phase: 'branch',
        stageId: 'stage-3',
        message: `右孩子节点 ${cur.right.val} 不为空，下潜至右子树继续寻找插入位置。`,
        log: `cur = cur.right (${cur.right.val})`,
        codeLine: BST_SEARCH_STAGE3_LINES.stepRight,
        statusBadge: { text: `下潜右节点 ${cur.right.val}`, type: 'info' },
        metrics: { '当前比对节点': cur.right.val, '分支转向决策': '深入右子树', '搜索命中状态': '寻路中' },
      });
      cur = cur.right;
    }
  }

  steps.push({
    tree: cloneTree(root),
    current: targetVal,
    val: targetVal,
    decision: 'BST 动态插入全部完成',
    found: true,
    path: [...path, targetVal],
    targetSubtree: null,
    action: 'done',
    phase: 'finish',
    stageId: 'stage-3',
    insertedVal: targetVal,
    message: `✅ BST 动态插入全部完成！新节点 ${targetVal} 已成功融合至树中且保持严格单调有序。`,
    log: `done insert stage-3`,
    codeLine: BST_SEARCH_STAGE3_LINES.done,
    statusBadge: { text: `插入完成`, type: 'success' },
    metrics: { '当前比对节点': targetVal, '分支转向决策': '维护完成', '搜索命中状态': '成功融合' },
  });

  return steps;
}

export function compileBstSearchStage1(inputs?: Record<string, any>): BSTSStep[] {
  const { root, targetVal } = parseBstSearchInputs(inputs);
  return buildBSTSearchSteps(root, targetVal);
}

export function compileBstSearchStage2(inputs?: Record<string, any>): BSTSStep[] {
  const { root, targetVal } = parseBstSearchInputs(inputs);
  return buildBstSearchStage2RecursiveSteps(root, targetVal);
}

export function compileBstSearchStage3(inputs?: Record<string, any>): BSTSStep[] {
  const { root, targetVal } = parseBstSearchInputs(inputs);
  return buildBstSearchStage3InsertSteps(root, targetVal);
}
