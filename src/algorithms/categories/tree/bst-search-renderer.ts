/**
 * 二叉搜索树中的搜索可视化器 (Search in a BST · LeetCode 700 / 701)
 * 采用顶层声明式架构与多阶段演化体系 (Multi-Stage Evolution)
 *
 * 核心阶段体系:
 * - Stage 1: 迭代单向剪枝查找 (Iterative BST Search · O(1) 空间)
 * - Stage 2: 递归分支剪枝查找 (Recursive Divide & Conquer · O(H) 栈深度)
 * - Stage 3: 搜索未命中定点动态插入 (BST Search & Insert · LC 701 读写闭环)
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { StepBase } from '../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import { cloneStateDepTree } from '../../../core/strategies/tree-clone';
import {
  BST_SEARCH_PROBLEM_HTML,
  BST_SEARCH_ANALYSIS_HTML,
  BST_SEARCH_CODE_LANGUAGES,
} from './bst-search-problem-content';
import {
  BST_SEARCH_STAGE1_ITERATIVE_CODE,
  BST_SEARCH_STAGE1_LINES,
  BST_SEARCH_STAGE2_RECURSIVE_CODE,
  BST_SEARCH_STAGE2_LINES,
  BST_SEARCH_STAGE3_INSERT_CODE,
  BST_SEARCH_STAGE3_LINES,
} from './bst-search-stage-codes';
import {
  RecursiveCallTraceAdapter,
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from '../../../core/renderers/adapters/recursive-call-trace-adapter';

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

function cloneTree(node: TreeNode | null): TreeNode | null {
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

  // 克隆树以防修改外部状态
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

// ============================================================
// 表现层适配器渲染规范 (Presentation & Visualizer Adapters)
// ============================================================

/**
 * Card 1: 纯净二叉树画布渲染器 (纯 View 逻辑，杜绝跨容器 DOM 穿透)
 */
export function renderBstSearchCanvas(
  container: HTMLElement,
  step: BSTSStep,
  stageId: 'stage-1' | 'stage-2' | 'stage-3' = 'stage-1'
): void {
  TreeCanvasAdapter.renderTree(container, {
    tree: step.tree,
    current: step.insertedVal != null ? step.insertedVal : step.current,
    secondaryHighlightedNodes: step.path,
    primaryColor: step.insertedVal != null ? '#8b5cf6' : step.found ? '#16a34a' : '#3b82f6',
    secondaryColor: '#fbbf24',
  });
}

/**
 * Card 2: 自定义运行监控与推演面板 (4 格指标 + 下潜路径 + 递归推演树 / 槽位状态)
 */
export function renderBstSearchCustomMetrics(container: HTMLElement, step: BSTSStep): void {
  container.innerHTML = '';
  container.className = 'flex flex-col gap-2 p-2 h-full overflow-y-auto text-slate-200';

  // 1. 顶部 4 格 KPI 卡片
  const metricsGrid = document.createElement('div');
  metricsGrid.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
  const foundText = step.insertedVal != null
    ? '已挂载新节点'
    : step.found
    ? '已命中目标'
    : step.action === 'not-found'
    ? '未找到 (null)'
    : '检索中';
  const foundColor = step.insertedVal != null
    ? 'text-purple-400'
    : step.found
    ? 'text-emerald-400'
    : step.action === 'not-found'
    ? 'text-rose-400'
    : 'text-cyan-400';

  metricsGrid.innerHTML = `
    <div class="flex flex-col p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-sm">
      <span class="text-[11px] text-slate-400 font-medium">检索目标数值</span>
      <span class="text-base font-bold font-mono text-amber-400">val = ${step.val}</span>
    </div>
    <div class="flex flex-col p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-sm">
      <span class="text-[11px] text-slate-400 font-medium">当前考察节点</span>
      <span class="text-base font-bold font-mono text-blue-400">${step.current !== null ? `Node(${step.current})` : '—'}</span>
    </div>
    <div class="flex flex-col p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-sm">
      <span class="text-[11px] text-slate-400 font-medium">分支转向决策</span>
      <span class="text-xs font-semibold text-slate-200 truncate mt-1">${step.decision}</span>
    </div>
    <div class="flex flex-col p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-sm">
      <span class="text-[11px] text-slate-400 font-medium">搜索命中状态</span>
      <span class="text-sm font-bold ${foundColor} mt-0.5">${foundText}</span>
    </div>
  `;
  container.appendChild(metricsGrid);

  // 2. 检索下潜路径展示区
  const pathBox = document.createElement('div');
  pathBox.className = 'p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between flex-shrink-0';
  pathBox.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="text-[11px] text-slate-400">🛤️ 检索下潜路径:</span>
      <div class="flex items-center gap-1">
        ${step.path && step.path.length > 0 ? step.path.map((v, i) => {
          const isTarget = v === step.val;
          const bg = isTarget ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-300';
          return `
            <span class="inline-flex items-center justify-center px-2 py-0.5 rounded border font-mono text-xs font-bold ${bg}">
              ${v}
            </span>
            ${i < step.path.length - 1 ? '<span class="text-slate-500 text-xs">➔</span>' : ''}
          `;
        }).join('') : '<span class="text-xs text-slate-500 italic">未开始</span>'}
      </div>
    </div>
    ${step.targetSubtree ? `<span class="text-xs font-mono font-bold text-emerald-400">Subtree(Root=${step.targetSubtree.val})</span>` : ''}
  `;
  container.appendChild(pathBox);

  // 3. 中间推演区：如果是 Stage 2 展示 Call Trace，其他 Stage 展示单向剪枝/槽位信息
  if (step.stageId === 'stage-2' && step.callTrace) {
    const traceBox = document.createElement('div');
    traceBox.className = 'flex-1 min-h-[160px] max-h-[260px] overflow-hidden flex flex-col rounded-lg bg-slate-800/60 border border-slate-700/50';
    RecursiveCallTraceAdapter.render(traceBox, step.callTrace);
    container.appendChild(traceBox);
  } else if (step.stageId === 'stage-3') {
    const insertBox = document.createElement('div');
    insertBox.className = 'p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/60 flex-shrink-0';
    insertBox.innerHTML = `
      <div class="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
        <span>🌱 BST 读写闭环动态插入 (LC 701)</span>
      </div>
      <div class="text-xs text-slate-300 flex items-center gap-2">
        <span class="text-slate-400">当前槽位动作:</span>
        <span class="font-bold ${step.insertedVal != null ? 'text-purple-400' : 'text-cyan-400'}">${step.decision}</span>
      </div>
    `;
    container.appendChild(insertBox);
  }

  // 4. 当前推演决策总结
  const isDone = step.decision.includes('完成') || step.decision.includes('成功') || step.statusBadge?.type === 'success';
  const summaryBox = document.createElement('div');
  summaryBox.className = `p-2.5 rounded-lg border text-xs leading-relaxed flex-shrink-0 ${
    isDone ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200' : 'bg-slate-800/50 border-slate-700/40 text-slate-300'
  }`;
  summaryBox.innerHTML = `
    <div class="font-bold mb-1 ${isDone ? 'text-emerald-400' : 'text-cyan-400'}">⚡ 当前决策: ${step.decision}</div>
    <div class="text-slate-400">${step.message}</div>
  `;
  container.appendChild(summaryBox);
}

// ============================================================
// 声明式算法注册 (Multi-Stage Evolution)
// ============================================================
export const bstSearchVisualizer = registerDeclarativeAlgorithm<BSTSStep>({
  id: 'bst-search',
  aliases: ['leetcode-700', 'bst-search', 'bst-insert', 'leetcode-701', 'insert-into-a-binary-search-tree'],
  name: '二叉搜索树中的搜索与插入',
  category: 'tree',
  icon: '🔍',
  badge: {
    mode: '多阶段演化: 迭代剪枝 · 递归分治 · 动态插入',
    complexity: 'O(log N) · O(1)',
  },
  card1Title: '📊 BST 拓扑结构与检索路径沙盘',
  card2Title: '🧭 单向分支决策与查找状态监视器',
  card2Desc: '当前检查节点、目标比对关系与已走过检索路径',
  legend: [
    { label: '命中目标节点', color: '#16a34a' },
    { label: '新插入节点', color: '#8b5cf6' },
    { label: '搜索路径节点', color: '#fbbf24' },
    { label: '当前比对节点', color: '#3b82f6' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: 'BST 树层序',
      type: 'text',
      defaultValue: '4, 2, 7, 1, 3',
      width: '140px',
      placeholder: '4, 2, 7, 1, 3',
    },
    {
      id: 'input-target',
      label: '目标值 val',
      type: 'number',
      defaultValue: 2,
      width: '45px',
    },
  ],
  presets: [
    { label: '命中示例 (val=2)', values: { 'input-tree': '4, 2, 7, 1, 3', 'input-target': 2 } },
    { label: '不存在值 (val=5)', values: { 'input-tree': '4, 2, 7, 1, 3', 'input-target': 5 } },
    { label: '多层大型 BST (val=15)', values: { 'input-tree': '10, 5, 20, 3, 7, 15, 25', 'input-target': 15 } },
  ],
  metrics: [
    { id: 'cur-node', label: '当前比对节点', color: '#3b82f6' },
    { id: 'branch-decision', label: '分支转向决策', color: '#f59e0b' },
    { id: 'found-status', label: '搜索命中状态', color: '#16a34a' },
  ],
  codeLanguages: BST_SEARCH_CODE_LANGUAGES,
  problemHtml: BST_SEARCH_PROBLEM_HTML,
  analysisHtml: BST_SEARCH_ANALYSIS_HTML,

  // 核心多阶段演化体系
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 迭代单向剪枝查找 (Iterative BST Search · O(1) 空间)',
      shortName: '迭代剪枝',
      num: 1,
      badge: {
        mode: '迭代循环 · 零递归开销',
        complexity: 'O(log N) · O(1)',
      },
      card1Title: '📊 BST 迭代检索路径沙盘',
      card2Title: '🧭 单向分支决策与查找状态监视器',
      card2Desc: '当前检查节点、目标比对关系与已走过检索路径',
      codeLanguages: BST_SEARCH_STAGE1_ITERATIVE_CODE,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-tree'] || inputs?.['tree'] || '4, 2, 7, 1, 3';
        const arr = parseTreeArray(raw, [4, 2, 7, 1, 3]);
        const root = buildTree(arr);
        const target = parseInt(String(inputs?.['input-target'] ?? inputs?.['target'] ?? '2'), 10);
        return buildBSTSearchSteps(root, target);
      },
      renderCanvas: (container, step) => renderBstSearchCanvas(container, step, 'stage-1'),
      renderCustomMetrics: (container, step) => renderBstSearchCustomMetrics(container, step),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 递归分支剪枝查找 (Recursive Divide & Conquer · O(H) 栈深度)',
      shortName: '递归分治',
      num: 2,
      badge: {
        mode: '递归分治 · 函数调用栈',
        complexity: 'O(log N) · O(H)',
      },
      card1Title: '🌲 BST 递归深入与分治拓扑沙盘',
      card2Title: '🧭 递归栈深度与分支下探监视器',
      card2Desc: '自顶向下分治递归，单向分支深入直到基底条件命中',
      codeLanguages: BST_SEARCH_STAGE2_RECURSIVE_CODE,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-tree'] || inputs?.['tree'] || '4, 2, 7, 1, 3';
        const arr = parseTreeArray(raw, [4, 2, 7, 1, 3]);
        const root = buildTree(arr);
        const target = parseInt(String(inputs?.['input-target'] ?? inputs?.['target'] ?? '2'), 10);
        return buildBstSearchStage2RecursiveSteps(root, target);
      },
      renderCanvas: (container, step) => renderBstSearchCanvas(container, step, 'stage-2'),
      renderCustomMetrics: (container, step) => renderBstSearchCustomMetrics(container, step),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 搜索未命中定点动态插入 (BST Search & Insert · LC 701 读写闭环)',
      shortName: '动态插入',
      num: 3,
      badge: {
        mode: '寻路插入 · 读写闭环',
        complexity: 'O(log N) · O(1)',
      },
      card1Title: '🌱 动态插入与叶子槽位挂载沙盘',
      card2Title: '🧭 空槽位锁定与节点挂载监视器',
      card2Desc: '未命中时顺承下潜路径将新节点作为叶子挂载，维持全局单调性',
      codeLanguages: BST_SEARCH_STAGE3_INSERT_CODE,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-tree'] || inputs?.['tree'] || '4, 2, 7, 1, 3';
        const arr = parseTreeArray(raw, [4, 2, 7, 1, 3]);
        const root = buildTree(arr);
        const target = parseInt(String(inputs?.['input-target'] ?? inputs?.['target'] ?? '2'), 10);
        return buildBstSearchStage3InsertSteps(root, target);
      },
      renderCanvas: (container, step) => renderBstSearchCanvas(container, step, 'stage-3'),
      renderCustomMetrics: (container, step) => renderBstSearchCustomMetrics(container, step),
    },
  ],

  // 遗留兜底
  generateSteps: (inputs) => {
    const raw = inputs?.['input-tree'] || inputs?.['tree'] || '4, 2, 7, 1, 3';
    const arr = parseTreeArray(raw, [4, 2, 7, 1, 3]);
    const root = buildTree(arr);
    const target = parseInt(String(inputs?.['input-target'] ?? inputs?.['target'] ?? '2'), 10);
    return buildBSTSearchSteps(root, target);
  },
  buildSteps: (inputs) => {
    const raw = inputs?.['input-tree'] || inputs?.['tree'] || '4, 2, 7, 1, 3';
    const arr = parseTreeArray(raw, [4, 2, 7, 1, 3]);
    const root = buildTree(arr);
    const target = parseInt(String(inputs?.['input-target'] ?? inputs?.['target'] ?? '2'), 10);
    return buildBSTSearchSteps(root, target);
  },
  renderCanvas: (container, step) => renderBstSearchCanvas(container, step, 'stage-1'),
  renderCustomMetrics: (container, step) => renderBstSearchCustomMetrics(container, step),
});
