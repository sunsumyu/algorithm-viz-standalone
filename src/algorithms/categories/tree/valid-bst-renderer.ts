/**
 * 验证二叉搜索树 (Validate BST · LeetCode 98 / Class 037 Code05)
 * 采用顶层声明式架构与多阶段演化体系 (Multi-Stage Evolution)
 *
 * 核心演化体系:
 *   Stage 1: 中序递归单调性校验 (Recursive Inorder Monotonicity · 经典全局前驱指针)
 *   Stage 2: 上下界区间约束先序定界 (Boundary Range Pruning · (min, max) 递归先序剪枝)
 *   Stage 3: 迭代显式栈模拟中序遍历 (Iterative Explicit Stack Inorder · 模拟调用栈)
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { HighlightTarget, StepBase } from '../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import { cloneStateDepTree } from '../../../core/strategies/tree-clone';
import {
  VALID_BST_PROBLEM_HTML,
  VALID_BST_ANALYSIS_HTML,
  VALID_BST_CODE_LANGUAGES,
} from './valid-bst-problem-content';
import {
  VALID_BST_STAGE1_CODE,
  VALID_BST_STAGE1_LINES,
  VALID_BST_STAGE2_RANGE_CODE,
  VALID_BST_STAGE2_RANGE_LINES,
  VALID_BST_STAGE3_STACK_CODE,
  VALID_BST_STAGE3_STACK_LINES,
} from './valid-bst-stage-codes';

// ============================================================
// 类型契约与状态定义 (Domain Step Contract)
// ============================================================
export interface VBStep extends StepBase {
  tree: TreeNode | null;
  current: number | null;
  prev: number | null;
  sequence: number[];
  valid: boolean;
  invalidNode: number | null;
  decision: string;
  phase: 'init' | 'check' | 'valid' | 'invalid' | string;
  action?: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'info' | 'warning' | 'success' | 'danger' };

  /** Stage 2 上下界专用 */
  boundary?: {
    min: number | string;
    max: number | string;
    inRange: boolean;
  };

  /** Stage 3 显式栈专用 */
  stack?: (number | string)[];
}

export const VALID_BST_CODE_LINES = VALID_BST_STAGE1_LINES;

function cloneTree(node: TreeNode | null): TreeNode | null {
  return cloneStateDepTree(node);
}

/**
 * 递归收集二叉树中所有非空节点值
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

// ============================================================
// Stage 1 Step Generator: 中序递归单调性校验 (Recursive Inorder Monotonicity)
// ============================================================
export function buildVBSteps(root: TreeNode | null): VBStep[] {
  const steps: VBStep[] = [];
  const sequence: number[] = [];
  let prevVal: number | null = null;
  let isValid = true;
  let invalidNode: number | null = null;
  const L = VALID_BST_STAGE1_LINES;

  const workingTree = cloneTree(root);

  // Step 0: 入口
  steps.push({
    tree: cloneTree(workingTree),
    current: null,
    prev: null,
    sequence: [],
    valid: true,
    invalidNode: null,
    decision: '算法启动：初始化 BST 中序递增校验',
    phase: 'init',
    action: 'init',
    message: workingTree
      ? `开始验证二叉搜索树，从根节点 ${workingTree.val} 启动中序遍历，维护前驱指针 prev = null。`
      : '空树，直接判定为有效 BST。',
    log: workingTree ? `isValidBST(root: ${workingTree.val})` : 'root is null -> valid',
    codeLine: L.entry,
    metrics: { '当前状态': '准备中序遍历', '前驱 prev': 'null' },
    statusBadge: { text: '算法启动', type: 'info' },
  });

  if (!workingTree) {
    steps.push({
      tree: null,
      current: null,
      prev: null,
      sequence: [],
      valid: true,
      invalidNode: null,
      decision: '特判返回：空树是合法 BST',
      phase: 'valid',
      action: 'done',
      message: '✅ 空树默认满足二叉搜索树的所有定义，返回 true。',
      log: 'return true',
      codeLine: L.emptyCheck,
      metrics: { '判定结果': 'TRUE (合法 BST)' },
      statusBadge: { text: '合法 BST (true)', type: 'success' },
    });
    return steps;
  }

  function inorder(node: TreeNode | null): boolean {
    if (!node || !isValid) return true;

    // 深入左子树
    if (node.left) {
      steps.push({
        tree: cloneTree(workingTree),
        current: node.val,
        prev: prevVal,
        sequence: [...sequence],
        valid: true,
        invalidNode: null,
        decision: `深入节点 ${node.val} 的左子树`,
        phase: 'check',
        action: 'recurse-left',
        message: `中序遍历左中右规则：先深入节点 ${node.val} 的左子树 (左孩子: ${node.left.val})。`,
        log: `inorder left of ${node.val}`,
        codeLine: L.checkLeft,
        metrics: { '当前节点': node.val, '遍历方向': `深入左孩子 ${node.left.val}` },
        statusBadge: { text: '深入左子树', type: 'info' },
      });

      if (!inorder(node.left)) return false;
    }

    // 访问当前节点并与 prev 比较
    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      prev: prevVal,
      sequence: [...sequence],
      valid: true,
      invalidNode: null,
      decision: `考察节点 ${node.val} 并与前驱 prev 比较`,
      phase: 'check',
      action: 'compare',
      message:
        prevVal === null
          ? `首次到达最左叶子节点 ${node.val}，前驱 prev 为 null，单调性检查通过。`
          : `检查节点 ${node.val} 与前驱 prev = ${prevVal}：要求严格大于 (${node.val} > ${prevVal})。`,
      log: prevVal === null ? `first node: ${node.val}` : `compare: cur ${node.val} vs prev ${prevVal}`,
      codeLine: L.comparePrev,
      metrics: { '当前节点': node.val, '前驱 prev': prevVal ?? 'null' },
      statusBadge: { text: `考察节点 ${node.val}`, type: 'info' },
    });

    if (prevVal !== null && node.val <= prevVal) {
      isValid = false;
      invalidNode = node.val;
      steps.push({
        tree: cloneTree(workingTree),
        current: node.val,
        prev: prevVal,
        sequence: [...sequence, node.val],
        valid: false,
        invalidNode: node.val,
        decision: `🚨 发现单调性破损！节点 ${node.val} <= 前驱 ${prevVal}`,
        phase: 'invalid',
        action: 'violation',
        message: `❌ 违规！节点 ${node.val} 未能严格大于前驱 prev (${prevVal})，破坏了 BST 中序递增性质，判定为非法 BST！`,
        log: `FAILED: node ${node.val} <= prev ${prevVal}`,
        codeLine: L.comparePrev,
        metrics: { '违规节点': node.val, '前驱 prev': prevVal, '判定': 'FALSE' },
        statusBadge: { text: '单调性违规 (False)', type: 'danger' },
      });
      return false;
    }

    // 更新 prev 并记录当前节点
    prevVal = node.val;
    sequence.push(node.val);

    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      prev: prevVal,
      sequence: [...sequence],
      valid: true,
      invalidNode: null,
      decision: `单调性合格，更新前驱 prev = ${node.val}`,
      phase: 'check',
      action: 'update-prev',
      message: `✅ 节点 ${node.val} 校验合格，已装入中序序列 [${sequence.join(', ')}]，更新 prev = ${node.val}。`,
      log: `prev = ${node.val}, sequence = [${sequence.join(', ')}]`,
      codeLine: L.updatePrev,
      metrics: { '当前中序序列长度': sequence.length, '最新前驱 prev': node.val },
      statusBadge: { text: '单调递增正常', type: 'success' },
    });

    // 深入右子树
    if (node.right) {
      steps.push({
        tree: cloneTree(workingTree),
        current: node.val,
        prev: prevVal,
        sequence: [...sequence],
        valid: true,
        invalidNode: null,
        decision: `深入节点 ${node.val} 的右子树`,
        phase: 'check',
        action: 'recurse-right',
        message: `中序遍历推进：继续探索节点 ${node.val} 的右子树 (右孩子: ${node.right.val})。`,
        log: `inorder right of ${node.val}`,
        codeLine: L.checkRight,
        metrics: { '当前节点': node.val, '遍历方向': `深入右孩子 ${node.right.val}` },
        statusBadge: { text: '深入右子树', type: 'info' },
      });

      if (!inorder(node.right)) return false;
    }

    return true;
  }

  const finalResult = inorder(workingTree);

  if (finalResult) {
    steps.push({
      tree: cloneTree(workingTree),
      current: null,
      prev: prevVal,
      sequence: [...sequence],
      valid: true,
      invalidNode: null,
      decision: 'BST 校验全部完成：确认合法',
      phase: 'valid',
      action: 'done',
      message: `🎉 全树中序遍历序列严格单调递增：[${sequence.join(', ')}]，成功判定为有效二叉搜索树！`,
      log: `SUCCESS: valid BST -> [${sequence.join(', ')}]`,
      metrics: { '判定结果': 'TRUE (合法 BST)', '序列总长度': sequence.length },
      codeLine: L.doneValid,
      statusBadge: { text: '合法 BST (true)', type: 'success' },
    });
  }

  return steps;
}

// ============================================================
// Stage 2 Step Generator: 上下界区间约束先序定界 (Boundary Range Pruning)
// ============================================================
export function buildValidBstStage2RangeSteps(root: TreeNode | null): VBStep[] {
  const steps: VBStep[] = [];
  const L = VALID_BST_STAGE2_RANGE_LINES;
  const sequence: number[] = [];
  const workingTree = cloneTree(root);

  steps.push({
    tree: cloneTree(workingTree),
    current: null,
    prev: null,
    sequence: [],
    valid: true,
    invalidNode: null,
    decision: '算法启动：初始化上下界区间校验 check(root, -∞, +∞)',
    phase: 'init',
    action: 'init',
    boundary: { min: '-∞', max: '+∞', inRange: true },
    message: workingTree
      ? `启动区间定界法：根节点 ${workingTree.val} 的初始合法区间为 (-∞, +∞)。`
      : '空树，直接判定为有效 BST。',
    log: workingTree ? `check(root: ${workingTree.val}, -inf, +inf)` : 'empty tree -> true',
    codeLine: L.entry,
    metrics: { '全局范围': '(-∞, +∞)', '剪枝策略': '自顶向下先序定界' },
    statusBadge: { text: '先序定界就绪', type: 'info' },
  });

  if (!workingTree) {
    steps.push({
      tree: null,
      current: null,
      prev: null,
      sequence: [],
      valid: true,
      invalidNode: null,
      decision: '特判返回：空树是合法 BST',
      phase: 'valid',
      action: 'done',
      boundary: { min: '-∞', max: '+∞', inRange: true },
      message: '✅ 空树是合法 BST，返回 true。',
      log: 'empty tree -> return true',
      codeLine: L.nullCheck,
      metrics: { '判定结果': 'TRUE' },
      statusBadge: { text: '空树合格', type: 'success' },
    });
    return steps;
  }

  let isValid = true;
  let invalidNode: number | null = null;

  function check(node: TreeNode, minVal: number, maxVal: number): boolean {
    if (!isValid) return false;

    const minStr = minVal === -Infinity ? '-∞' : String(minVal);
    const maxStr = maxVal === Infinity ? '+∞' : String(maxVal);

    const inRange = node.val > minVal && node.val < maxVal;

    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      prev: null,
      sequence: [...sequence],
      valid: inRange,
      invalidNode: inRange ? null : node.val,
      decision: `先序检验节点 ${node.val} 是否落在合法开区间 (${minStr}, ${maxStr})`,
      phase: inRange ? 'check' : 'invalid',
      action: 'check-boundary',
      boundary: { min: minStr, max: maxStr, inRange },
      message: inRange
        ? `节点 ${node.val} 满足 ${minStr} < ${node.val} < ${maxStr}，区间约束合格！`
        : `🚨 节点 ${node.val} 越界！违反约束：要求落在 (${minStr}, ${maxStr}) 内，立即先序剪枝！`,
      log: `check node=${node.val} in (${minStr}, ${maxStr}) -> ${inRange}`,
      codeLine: inRange ? L.boundaryCheck : L.violation,
      metrics: { '当前节点': node.val, '合法开区间': `(${minStr}, ${maxStr})`, '区间符合': inRange ? '合格' : '越界违规' },
      statusBadge: { text: inRange ? '区间合格' : '越界违规', type: inRange ? 'info' : 'danger' },
    });

    if (!inRange) {
      isValid = false;
      invalidNode = node.val;
      return false;
    }

    sequence.push(node.val);

    // 深入左子树
    if (node.left) {
      steps.push({
        tree: cloneTree(workingTree),
        current: node.val,
        prev: null,
        sequence: [...sequence],
        valid: true,
        invalidNode: null,
        decision: `左子树约束更新：左孩子 ${node.left.val} 必须落在 (${minStr}, ${node.val})`,
        phase: 'check',
        action: 'recurse-left',
        boundary: { min: minStr, max: String(node.val), inRange: true },
        message: `向左递归：左子树的所有节点值必须严格小于当前节点值 ${node.val}。`,
        log: `recurse left: ${node.left.val} in (${minStr}, ${node.val})`,
        codeLine: L.recurseLeft,
        metrics: { '当前节点': node.val, '左分支区间': `(${minStr}, ${node.val})` },
        statusBadge: { text: '向左递归定界', type: 'info' },
      });

      if (!check(node.left, minVal, node.val)) return false;
    }

    // 深入右子树
    if (node.right) {
      steps.push({
        tree: cloneTree(workingTree),
        current: node.val,
        prev: null,
        sequence: [...sequence],
        valid: true,
        invalidNode: null,
        decision: `右子树约束更新：右孩子 ${node.right.val} 必须落在 (${node.val}, ${maxStr})`,
        phase: 'check',
        action: 'recurse-right',
        boundary: { min: String(node.val), max: maxStr, inRange: true },
        message: `向右递归：右子树的所有节点值必须严格大于当前节点值 ${node.val}。`,
        log: `recurse right: ${node.right.val} in (${node.val}, ${maxStr})`,
        codeLine: L.recurseRight,
        metrics: { '当前节点': node.val, '右分支区间': `(${node.val}, ${maxStr})` },
        statusBadge: { text: '向右递归定界', type: 'info' },
      });

      if (!check(node.right, node.val, maxVal)) return false;
    }

    return true;
  }

  const res = check(workingTree, -Infinity, Infinity);

  if (res) {
    steps.push({
      tree: cloneTree(workingTree),
      current: null,
      prev: null,
      sequence: [...sequence],
      valid: true,
      invalidNode: null,
      decision: '全树上下界区间定界校验通过：确认合法 BST',
      phase: 'valid',
      action: 'done',
      boundary: { min: '-∞', max: '+∞', inRange: true },
      message: '🎉 所有节点均严格满足其祖先传递的开区间约束，成功判定为有效 BST！',
      log: 'SUCCESS: all nodes satisfy range boundaries',
      codeLine: L.done,
      metrics: { '判定结果': 'TRUE (合法 BST)' },
      statusBadge: { text: '区间定界合格 (true)', type: 'success' },
    });
  }

  return steps;
}

// ============================================================
// Stage 3 Step Generator: 迭代显式栈模拟中序遍历 (Iterative Explicit Stack Inorder)
// ============================================================
export function buildValidBstStage3StackSteps(root: TreeNode | null): VBStep[] {
  const steps: VBStep[] = [];
  const L = VALID_BST_STAGE3_STACK_LINES;
  const sequence: number[] = [];
  const workingTree = cloneTree(root);

  if (!workingTree) {
    steps.push({
      tree: null,
      current: null,
      prev: null,
      sequence: [],
      valid: true,
      invalidNode: null,
      decision: '特判返回：空树为合法 BST',
      phase: 'valid',
      action: 'done',
      stack: [],
      message: '✅ 空树直接返回 true。',
      log: 'empty tree -> return true',
      codeLine: L.nullCheck,
      metrics: { '判定结果': 'TRUE' },
      statusBadge: { text: '空树合格', type: 'success' },
    });
    return steps;
  }

  const stack: TreeNode[] = [];
  let cur: TreeNode | null = workingTree;
  let prevVal: number | null = null;
  let isValid = true;
  let invalidNode: number | null = null;

  const getStackVals = (): (number | string)[] => stack.map((n) => n.val);

  steps.push({
    tree: cloneTree(workingTree),
    current: workingTree.val,
    prev: null,
    sequence: [],
    valid: true,
    invalidNode: null,
    decision: '算法启动：初始化显式栈 Stack<TreeNode> 模拟中序遍历',
    phase: 'init',
    action: 'init',
    stack: [],
    message: `使用显式数据结构 Stack<TreeNode> 模拟系统调用栈，彻底消除递归开销。`,
    log: 'init explicit stack',
    codeLine: L.initStack,
    metrics: { '当前栈深': 0, '前驱 prev': 'null' },
    statusBadge: { text: '显式栈就绪', type: 'info' },
  });

  while (cur !== null || stack.length > 0) {
    // 一路向左压栈
    while (cur !== null) {
      stack.push(cur);
      steps.push({
        tree: cloneTree(workingTree),
        current: cur.val,
        prev: prevVal,
        sequence: [...sequence],
        valid: true,
        invalidNode: null,
        decision: `节点 ${cur.val} 压入显式栈，指针转向其左孩子 (cur = cur.left)`,
        phase: 'check',
        action: 'push-left',
        stack: getStackVals(),
        message: `沿左侧链推进：节点 ${cur.val} 压栈，当前栈大小: ${stack.length}。`,
        log: `push ${cur.val} to stack: [${getStackVals().join(', ')}]`,
        codeLine: L.pushLeftBranch,
        metrics: { '压栈节点': cur.val, '栈内元素数': stack.length },
        statusBadge: { text: `压栈 ${cur.val}`, type: 'info' },
      });
      cur = cur.left;
    }

    // 弹出栈顶
    cur = stack.pop()!;
    steps.push({
      tree: cloneTree(workingTree),
      current: cur.val,
      prev: prevVal,
      sequence: [...sequence],
      valid: true,
      invalidNode: null,
      decision: `弹出栈顶节点 ${cur.val}：准备进行前驱比较与中序访问`,
      phase: 'check',
      action: 'pop-node',
      stack: getStackVals(),
      message: `从栈顶弹出节点 ${cur.val}，与前驱 prev = ${prevVal ?? 'null'} 进行严格大于检验。`,
      log: `pop cur=${cur.val}, compare with prev=${prevVal}`,
      codeLine: L.popNode,
      metrics: { '出栈节点': cur.val, '剩余栈大小': stack.length, '前驱 prev': prevVal ?? 'null' },
      statusBadge: { text: `出栈 ${cur.val}`, type: 'info' },
    });

    if (prevVal !== null && cur.val <= prevVal) {
      isValid = false;
      invalidNode = cur.val;
      steps.push({
        tree: cloneTree(workingTree),
        current: cur.val,
        prev: prevVal,
        sequence: [...sequence, cur.val],
        valid: false,
        invalidNode: cur.val,
        decision: `🚨 发现单调性破坏！出栈节点 ${cur.val} <= 前驱 ${prevVal}`,
        phase: 'invalid',
        action: 'violation',
        stack: getStackVals(),
        message: `❌ 违规！节点 ${cur.val} 未能严格大于前驱 prev (${prevVal})，破坏 BST 中序单调递增性！`,
        log: `FAILED: node ${cur.val} <= prev ${prevVal}`,
        codeLine: L.comparePrev,
        metrics: { '违规节点': cur.val, '前驱 prev': prevVal, '判定': 'FALSE' },
        statusBadge: { text: '单调性破坏 (False)', type: 'danger' },
      });
      break;
    }

    prevVal = cur.val;
    sequence.push(cur.val);

    steps.push({
      tree: cloneTree(workingTree),
      current: cur.val,
      prev: prevVal,
      sequence: [...sequence],
      valid: true,
      invalidNode: null,
      decision: `节点 ${cur.val} 校验合格，更新 prev = ${cur.val}，转向右孩子`,
      phase: 'check',
      action: 'update-prev',
      stack: getStackVals(),
      message: `节点 ${cur.val} 单调性合格，更新前驱，指针转向其右孩子 cur = cur.right。`,
      log: `update prev=${cur.val}, sequence=[${sequence.join(', ')}]`,
      codeLine: L.turnRight,
      metrics: { '已收集序列长度': sequence.length, '当前前驱 prev': prevVal },
      statusBadge: { text: '单调递增正常', type: 'success' },
    });

    cur = cur.right;
  }

  if (isValid) {
    steps.push({
      tree: cloneTree(workingTree),
      current: null,
      prev: prevVal,
      sequence: [...sequence],
      valid: true,
      invalidNode: null,
      decision: '显式栈中序遍历全部完成：确认合法 BST',
      phase: 'valid',
      action: 'done',
      stack: [],
      message: `🎉 显式栈中序遍历顺利结束，所有出栈节点严格单调递增：[${sequence.join(', ')}]，返回 true！`,
      log: `SUCCESS: stack inorder valid BST`,
      codeLine: L.doneValid,
      metrics: { '判定结果': 'TRUE (合法 BST)', '序列总长度': sequence.length },
      statusBadge: { text: '显式栈合格 (true)', type: 'success' },
    });
  }

  return steps;
}

// ============================================================
// 统一表现层渲染器 (Card 1 + Card 2 领域契约)
// ============================================================
function renderValidBstCanvas(container: HTMLElement, step: VBStep, stageId: string): void {
  const isDone = step.action === 'done';
  const allTreeNodes = collectTreeValues(step.tree);

  let primaryNode = step.invalidNode !== null ? step.invalidNode : step.current;
  let visitedNodes = step.sequence;

  if (isDone && step.valid) {
    // 成功完成态：整树全量翡翠绿常驻高亮，根节点金色聚焦点
    visitedNodes = allTreeNodes;
    if (primaryNode === null && step.tree) {
      primaryNode = step.tree.val;
    }
  }

  TreeCanvasAdapter.renderTree(container, {
    tree: step.tree,
    current: primaryNode,
    secondaryHighlightedNodes: step.sequence,
    visitedNodes: visitedNodes,
    primaryColor: step.invalidNode !== null ? '#ef4444' : '#fbbf24',
    secondaryColor: '#60a5fa',
    visitedColor: '#34d399',
  });

  const root = container.closest('#algo-valid-bst-view') || container.parentElement;
  if (!root) return;

  const curEl = root.querySelector('#metric-cur-node');
  const prevEl = root.querySelector('#metric-prev-node');
  const resEl = root.querySelector('#metric-bst-result') as HTMLElement | null;

  if (curEl) curEl.textContent = step.current != null ? `${step.current}` : '—';
  if (prevEl) prevEl.textContent = step.prev != null ? `${step.prev}` : 'null (首节点)';
  if (resEl) {
    resEl.textContent = step.valid ? '单调递增正常' : '违规非法 (False)';
    resEl.style.color = step.valid ? '#16a34a' : '#ef4444';
  }

  const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
  if (!customMetricsContainer) return;

  let stageSpecificHtml = '';

  if (stageId === 'stage-2') {
    const minVal = step.boundary?.min ?? '-∞';
    const maxVal = step.boundary?.max ?? '+∞';
    const inRange = step.boundary?.inRange ?? true;

    stageSpecificHtml = `
      <div style="display: flex; flex-direction: column; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; font-weight: 700; color: #334155;">当前节点开区间范围约束:</span>
          <span style="padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; background: ${inRange ? '#dcfce7' : '#fee2e2'}; color: ${inRange ? '#15803d' : '#b91c1c'};">
            ${inRange ? '落入区间' : '越界违规'}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; font-family: monospace; font-size: 12px;">
          <span style="color: #64748b;">(</span>
          <span style="padding: 2px 6px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; border-radius: 4px;">下界: ${minVal}</span>
          <span style="color: #94a3b8;">,</span>
          <span style="padding: 2px 6px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; border-radius: 4px;">上界: ${maxVal}</span>
          <span style="color: #64748b;">)</span>
        </div>
      </div>
    `;
  } else if (stageId === 'stage-3') {
    const stackChips = (step.stack || [])
      .map(
        (v) =>
          `<span style="padding: 2px 7px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; font-weight: 700; color: #1d4ed8; font-size: 11px; font-family: monospace;">${v}</span>`
      )
      .join('');

    stageSpecificHtml = `
      <div style="display: flex; flex-direction: column; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; font-weight: 700; color: #334155;">显式调用栈 Stack&lt;TreeNode&gt;:</span>
          <span style="font-size: 10px; color: #64748b;">栈顶在右侧</span>
        </div>
        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
          ${stackChips || '<span style="color:#94a3b8; font-style:italic;">栈为空</span>'}
        </div>
      </div>
    `;
  }

  const sequenceBadges =
    step.sequence.length > 0
      ? step.sequence
          .map(
            (v, idx) => `
          <div style="display: flex; align-items: center;">
            <span style="padding: 3px 8px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: monospace;">${v}</span>
            ${idx < step.sequence.length - 1 ? '<span style="color: #94a3b8; font-size: 10px; margin: 0 4px;">&lt;</span>' : ''}
          </div>`
          )
          .join('')
      : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">等待首个中序节点...</span>';

  customMetricsContainer.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; padding: 6px 0;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 11px; font-weight: 700; color: #334155;">当前中序遍历序列 (需严格递增):</span>
        <span style="padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; background: ${step.valid ? '#dcfce7' : '#fee2e2'}; color: ${step.valid ? '#15803d' : '#b91c1c'};">
          ${step.valid ? '递增良好' : '单调性破坏'}
        </span>
      </div>

      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        ${sequenceBadges}
      </div>

      ${stageSpecificHtml}

      <div style="padding: 8px 10px; background: #f1f5f9; border-radius: 6px; font-size: 11px; color: #475569;">
        <div style="font-weight: 700; color: #1e293b; margin-bottom: 2px;">🧭 当前决策: ${step.decision}</div>
        <div>${step.message}</div>
      </div>
    </div>
  `;
}

// ============================================================
// 声明式算法注册 (Multi-Stage Evolution)
// ============================================================
export const validBstVisualizer = registerDeclarativeAlgorithm<VBStep>({
  id: 'valid-bst',
  aliases: ['class023-code01', 'class037-code05', 'valid-bst', 'tree-037-validate-bst', 'leetcode-98'],
  name: '验证二叉搜索树',
  category: 'tree',
  icon: '🛡️',
  badge: {
    mode: '多阶段演化: 中序递归 · 上下界定界 · 显式栈',
    complexity: 'O(N) · O(H)',
  },
  card1Title: '📊 二叉搜索树拓扑与染色沙盘',
  card2Title: '🧭 中序序列输出与单调性监视器',
  card2Desc: '当前考察节点、前驱 prev 状态与实时递增输出序列流',
  legend: [
    { label: '当前访问节点', color: '#fbbf24' },
    { label: '已验证中序节点', color: '#34d399' },
    { label: '违规异常节点', color: '#ef4444' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '5, 1, 4, null, null, 3, 6',
      width: '180px',
      placeholder: '5, 1, 4, null, null, 3, 6',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 2: 非法 BST (5, 1, 4, null, null, 3, 6)',
      values: { 'input-tree': '5, 1, 4, null, null, 3, 6' },
      description: '右孩子 4 小于根节点 5，非法',
    },
    {
      label: 'LeetCode 示例 1: 合法 BST (2, 1, 3)',
      values: { 'input-tree': '2, 1, 3' },
      description: '标准经典合法 BST',
    },
    {
      label: '多层完整合法 BST (10, 5, 15, 3, 7, 12, 18)',
      values: { 'input-tree': '10, 5, 15, 3, 7, 12, 18' },
      description: '三层饱满 BST，中序严格递增',
    },
    {
      label: '隐蔽跨层违规 (10, 5, 15, null, null, 6, 20)',
      values: { 'input-tree': '10, 5, 15, null, null, 6, 20' },
      description: '节点 6 虽然小于 15，但小于根节点 10，违规',
    },
  ],
  metrics: [
    { id: 'cur-node', label: '当前节点', color: '#f59e0b' },
    { id: 'prev-node', label: '前驱节点 prev', color: '#2563eb' },
    { id: 'bst-result', label: '合法性判定', color: '#16a34a' },
  ],
  codeLanguages: VALID_BST_CODE_LANGUAGES,
  problemHtml: VALID_BST_PROBLEM_HTML,
  analysisHtml: VALID_BST_ANALYSIS_HTML,

  // 核心多阶段演化体系
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 中序递归单调性校验 (Recursive Inorder Monotonicity)',
      shortName: '中序递归',
      num: 1,
      badge: {
        mode: '中序递归 · 前驱指针',
        complexity: 'O(N) · O(H)',
      },
      card1Title: '📊 中序遍历与单调性拓扑沙盘',
      card2Title: '🧭 中序序列输出与前驱监视器',
      card2Desc: '维护全局前驱指针 prev 保证严格单调递增',
      codeLanguages: VALID_BST_STAGE1_CODE,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-tree'] || inputs?.['tree'] || '5, 1, 4, null, null, 3, 6';
        const arr = parseTreeArray(raw, [5, 1, 4, null, null, 3, 6]);
        const root = buildTree(arr);
        return buildVBSteps(root);
      },
      renderCanvas: (container, step) => renderValidBstCanvas(container, step, 'stage-1'),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 上下界区间约束先序定界 (Boundary Range Pruning)',
      shortName: '区间定界',
      num: 2,
      badge: {
        mode: '先序剪枝 · 开区间 (min, max)',
        complexity: 'O(N) · O(H)',
      },
      card1Title: '📐 先序定界与开区间拓扑沙盘',
      card2Title: '🧭 节点范围约束与合法性监视器',
      card2Desc: '自顶向下传递开区间并立即剪枝越界节点',
      codeLanguages: VALID_BST_STAGE2_RANGE_CODE,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-tree'] || inputs?.['tree'] || '5, 1, 4, null, null, 3, 6';
        const arr = parseTreeArray(raw, [5, 1, 4, null, null, 3, 6]);
        const root = buildTree(arr);
        return buildValidBstStage2RangeSteps(root);
      },
      renderCanvas: (container, step) => renderValidBstCanvas(container, step, 'stage-2'),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 迭代显式栈模拟中序遍历 (Iterative Explicit Stack Inorder)',
      shortName: '显式栈',
      num: 3,
      badge: {
        mode: '显式栈模拟 · 防栈溢出',
        complexity: 'O(N) · O(H)',
      },
      card1Title: '🧱 显式调用栈中序遍历沙盘',
      card2Title: '🧭 Stack<TreeNode> 栈槽与出栈监视器',
      card2Desc: '左侧链压栈、出栈前驱校验、转向右孩子',
      codeLanguages: VALID_BST_STAGE3_STACK_CODE,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-tree'] || inputs?.['tree'] || '5, 1, 4, null, null, 3, 6';
        const arr = parseTreeArray(raw, [5, 1, 4, null, null, 3, 6]);
        const root = buildTree(arr);
        return buildValidBstStage3StackSteps(root);
      },
      renderCanvas: (container, step) => renderValidBstCanvas(container, step, 'stage-3'),
    },
  ],

  // 遗留兜底
  generateSteps: (inputs) => {
    const raw = inputs?.['input-tree'] || inputs?.['tree'] || '5, 1, 4, null, null, 3, 6';
    const arr = parseTreeArray(raw, [5, 1, 4, null, null, 3, 6]);
    const root = buildTree(arr);
    return buildVBSteps(root);
  },
  buildSteps: (inputs) => {
    const raw = inputs?.['input-tree'] || inputs?.['tree'] || '5, 1, 4, null, null, 3, 6';
    const arr = parseTreeArray(raw, [5, 1, 4, null, null, 3, 6]);
    const root = buildTree(arr);
    return buildVBSteps(root);
  },
  renderCanvas: (container, step) => renderValidBstCanvas(container, step, 'stage-1'),
});