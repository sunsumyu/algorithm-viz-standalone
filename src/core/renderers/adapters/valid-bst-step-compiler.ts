/**
 * 验证二叉搜索树 (Validate BST · LeetCode 98 / Class 037 Code05) 核心推演编译器深模块
 * 遵循 Matt Pocock 深模块哲学与严苛一行一步规范
 *
 * 核心多阶段演化推演支持:
 *   Stage 1: 中序递归单调性校验 (Recursive Inorder Monotonicity · 经典全局前驱指针)
 *   Stage 2: 上下界区间约束先序定界 (Boundary Range Pruning · (min, max) 递归先序剪枝)
 *   Stage 3: 迭代显式栈模拟中序遍历 (Iterative Explicit Stack Inorder · 模拟调用栈)
 */

import { HighlightTarget, StepBase } from '../../step-visualizer';
import { TreeNode } from '../../../algorithms/categories/tree/tree-template';
import { cloneStateDepTree } from '../../strategies/tree-clone';
import {
  VALID_BST_STAGE1_LINES,
  VALID_BST_STAGE2_RANGE_LINES,
  VALID_BST_STAGE3_STACK_LINES,
} from '../../../algorithms/categories/tree/valid-bst-stage-codes';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from './recursive-call-trace-adapter';

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

  /** 递归调用追踪树快照 (Builder Pattern) */
  callTrace?: RecursiveCallTraceSnapshot;

  /** Stage 2 上下界专用 */
  boundary?: {
    min: number | string;
    max: number | string;
    inRange: boolean;
  };

  /** 动态空节点探针 (Null-Probe Anchor) */
  nullProbe?: { parentVal: number | string; branch: 'left' | 'right' };
  /** 次级高亮聚焦节点列表 */
  secondaryHighlightedNodes?: (number | string)[];

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
// 指标构造辅助函数 (Stage Metrics Constructors)
// 确保 Card 2 顶层 .dsp-metrics-grid 的每一个指标项均有饱满、实时的中文数值
// ============================================================
function makeStage1Metrics(
  curVal: number | string | null,
  prevVal: number | string | null,
  statusText: string,
  seqCount: number
): Record<string, string | number> {
  const curDisplay = curVal !== null ? (typeof curVal === 'number' ? `Node(${curVal})` : String(curVal)) : '—';
  const prevDisplay = prevVal !== null ? (typeof prevVal === 'number' ? `Node(${prevVal})` : String(prevVal)) : 'null';
  return {
    cur: curDisplay,
    '当前考察': curDisplay,
    prev: prevDisplay,
    '前驱 prev': prevDisplay,
    status: statusText,
    '单调性判定': statusText,
    'seq-len': `${seqCount} 个`,
    '已收集序列': `${seqCount} 个`,
  };
}

function makeStage2Metrics(
  curVal: number | string | null,
  minVal: number | string,
  maxVal: number | string,
  statusText: string,
  checkedCount: number
): Record<string, string | number> {
  const curDisplay = curVal !== null ? (typeof curVal === 'number' ? `Node(${curVal})` : String(curVal)) : '—';
  const rangeDisplay = `(${minVal}, ${maxVal})`;
  return {
    cur: curDisplay,
    '当前考察': curDisplay,
    range: rangeDisplay,
    '合法开区间': rangeDisplay,
    status: statusText,
    '区间定界判定': statusText,
    checked: `${checkedCount} 个`,
    '已检验节点': `${checkedCount} 个`,
  };
}

function makeStage3Metrics(
  curVal: number | string | null,
  stackTopVal: number | string | null,
  statusText: string,
  seqCount: number
): Record<string, string | number> {
  const curDisplay = curVal !== null ? (typeof curVal === 'number' ? `Node(${curVal})` : String(curVal)) : '—';
  const stackTopDisplay = stackTopVal !== null ? (typeof stackTopVal === 'number' ? `Node(${stackTopVal})` : String(stackTopVal)) : '空栈';
  return {
    cur: curDisplay,
    '当前考察': curDisplay,
    'stack-top': stackTopDisplay,
    '显式栈顶': stackTopDisplay,
    status: statusText,
    '出栈单调性': statusText,
    'seq-len': `${seqCount} 个`,
    '已出栈序列': `${seqCount} 个`,
  };
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

  const trace = new RecursiveCallTraceBuilder();
  const workingTree = cloneTree(root);
  const rootText = workingTree ? `${workingTree.val}` : 'null';
  trace.addHeader(`isValidBST(${rootText})`, 0, '<- 根调用开始');

  // Step 0: 入口
  steps.push({
    tree: cloneTree(workingTree),
    current: workingTree ? workingTree.val : null,
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
    log: workingTree ? `算法启动：根节点 ${workingTree.val} 进入 isValidBST 校验` : '空树特判：直接返回 true',
    codeLine: L.entry,
    metrics: makeStage1Metrics(null, null, '准备中序遍历', 0),
    statusBadge: { text: '算法启动', type: 'info' },
    callTrace: trace.snapshot(),
  });

  if (!workingTree) {
    trace.addConditionHit('① root == null √ 命中! -> return true', 0);
    trace.addReturnLeaf('return true', 0);
    trace.addFinalResult('最终返回: true', 0, undefined, 'true');

    steps.push({
      tree: null,
      current: null,
      prev: null,
      sequence: [],
      valid: true,
      invalidNode: null,
      decision: '判空检查命中：root == null',
      phase: 'check',
      action: 'null-check',
      message: '树为空节点，命中基底条件 if (root == null)。',
      log: '空树判空命中 if (root == null)',
      codeLine: L.nullCheckHit,
      metrics: makeStage1Metrics(null, null, '命中判空', 0),
      statusBadge: { text: '空节点', type: 'info' },
      callTrace: trace.snapshot(),
    });

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
      log: '空树天然为有效 BST -> return true',
      codeLine: L.nullReturn,
      metrics: makeStage1Metrics(null, null, '全体验证通过', 0),
      statusBadge: { text: '合法 BST (true)', type: 'success' },
      callTrace: trace.snapshot(),
    });
    return steps;
  }

  function inorder(
    node: TreeNode | null,
    depth: number,
    parent: TreeNode | null = null,
    branch: 'left' | 'right' = 'left'
  ): boolean {
    if (!isValid) return false;

    if (node === null) {
      trace.addHeader(`isValidBST(null)`, depth, '<- 空节点判空');
      const nullProbe = parent ? { parentVal: parent.val, branch } : undefined;
      const secondaryNodes = parent ? [parent.val] : [];

      steps.push({
        tree: cloneTree(workingTree),
        current: null,
        prev: prevVal,
        sequence: [...sequence],
        valid: true,
        invalidNode: null,
        nullProbe,
        secondaryHighlightedNodes: secondaryNodes,
        decision: `基底判空：进入 isValidBST(null)${parent ? ` (考察节点 ${parent.val} 的${branch === 'left' ? '左' : '右'}孩子)` : ''}`,
        phase: 'check',
        action: 'null-entry',
        message: `递归进入空节点，执行基底判空检查 if (root == null)${parent ? `。当前正处于节点 ${parent.val} 的${branch === 'left' ? '左' : '右'}探针分支` : ''}。`,
        log: parent ? `探针进入空节点判空 (节点 ${parent.val} 的${branch === 'left' ? '左' : '右'}孩子)` : '进入空节点判空',
        codeLine: L.nullCheckHit,
        metrics: makeStage1Metrics(parent ? `∅(父:${parent.val})` : 'null', prevVal, '判空通过', sequence.length),
        statusBadge: { text: '空节点判空', type: 'info' },
        callTrace: trace.snapshot(),
      });

      trace.addConditionHit('① root == null √ 命中! -> return true', depth);
      trace.addReturnLeaf('return true', depth);

      steps.push({
        tree: cloneTree(workingTree),
        current: null,
        prev: prevVal,
        sequence: [...sequence],
        valid: true,
        invalidNode: null,
        nullProbe,
        secondaryHighlightedNodes: secondaryNodes,
        decision: `基底返回：空节点返回 true${parent ? ` (向父节点 ${parent.val} 返回)` : ''}`,
        phase: 'check',
        action: 'null-return',
        message: `空子树不破坏二叉搜索树性质，返回 true。`,
        log: parent ? `空节点判空命中，向父节点 ${parent.val} 返回 true` : '空节点判空命中，返回 true',
        codeLine: L.nullReturn,
        metrics: makeStage1Metrics(parent ? `∅(父:${parent.val})` : 'null', prevVal, '返回 true', sequence.length),
        statusBadge: { text: '返回 true', type: 'success' },
        callTrace: trace.snapshot(),
      });

      return true;
    }

    // 1. 进入非空节点
    if (depth > 0) {
      trace.addHeader(`isValidBST(${node.val})`, depth, '<- 递归调用进入');
    }

    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      prev: prevVal,
      sequence: [...sequence],
      valid: true,
      invalidNode: null,
      decision: `进入 isValidBST(root: ${node.val})`,
      phase: 'check',
      action: 'entry',
      message: `递归调用进入节点 ${node.val}，开始验证以 ${node.val} 为根的子树。`,
      log: `递归深入节点 ${node.val} 调用现场`,
      codeLine: L.entry,
      metrics: makeStage1Metrics(node.val, prevVal, sequence.length === 0 ? '首个中序' : '严格递增', sequence.length),
      statusBadge: { text: `进入节点 ${node.val}`, type: 'info' },
      callTrace: trace.snapshot(),
    });

    // 判空未命中
    trace.addConditionPass(`① root != null (Node(${node.val}))`, depth);
    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      prev: prevVal,
      sequence: [...sequence],
      valid: true,
      invalidNode: null,
      decision: `节点 ${node.val} != null，判空未命中`,
      phase: 'check',
      action: 'null-pass',
      message: `节点 ${node.val} 非空，跳过基底返回，继续向下执行。`,
      log: `节点 ${node.val} != null 判空通过，继续向左递归`,
      codeLine: L.nullCheckPass,
      metrics: makeStage1Metrics(node.val, prevVal, '非空继续', sequence.length),
      statusBadge: { text: '非空继续', type: 'info' },
      callTrace: trace.snapshot(),
    });

    // 2. 深入左子树
    trace.addRecursePrep(`② 递归验证左子树: isValidBST(${node.left ? node.left.val : 'null'})`, depth);
    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      prev: prevVal,
      sequence: [...sequence],
      valid: true,
      invalidNode: null,
      decision: `递归验证左子树：if (!isValidBST(root.left))`,
      phase: 'check',
      action: 'recurse-left',
      message: `中序遍历左中右规则：先深入节点 ${node.val} 的左子树 (${node.left ? `左孩子 ${node.left.val}` : '左孩子为 null'})。`,
      log: `深入节点 ${node.val} 左子树：isValidBST(${node.left ? node.left.val : 'null'})`,
      codeLine: L.checkLeft,
      metrics: makeStage1Metrics(node.val, prevVal, '探测左子树', sequence.length),
      statusBadge: { text: '深入左子树', type: 'info' },
      callTrace: trace.snapshot(),
    });

    const leftValid = inorder(node.left, depth + 1, node, 'left');
    if (!leftValid) {
      trace.addConditionHit(`左子树返回 false，短路返回 false`, depth);
      trace.addReturnLeaf(`return false`, depth);
      steps.push({
        tree: cloneTree(workingTree),
        current: node.val,
        prev: prevVal,
        sequence: [...sequence],
        valid: false,
        invalidNode,
        decision: `左子树返回 false，短路返回 false`,
        phase: 'invalid',
        action: 'left-fail',
        message: `❌ 节点 ${node.val} 的左子树不合法，直接返回 false！`,
        log: `节点 ${node.val} 左子树校验违规，向父层传递 false`,
        codeLine: L.leftReturnFalse,
        metrics: makeStage1Metrics(node.val, prevVal, '左子树违规', sequence.length),
        statusBadge: { text: '左子树失败', type: 'danger' },
        callTrace: trace.snapshot(),
      });
      return false;
    }

    // 左子树返回 true，回到当前节点行
    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      prev: prevVal,
      sequence: [...sequence],
      valid: true,
      invalidNode: null,
      decision: `左子树校验通过，继续检查当前节点 ${node.val}`,
      phase: 'check',
      action: 'left-done',
      message: `节点 ${node.val} 的左子树全部满足 BST 性质，准备校验当前节点单调性。`,
      log: `节点 ${node.val} 左子树校验通过，恢复现场开始检查单调性`,
      codeLine: L.leftReturned,
      metrics: makeStage1Metrics(node.val, prevVal, '左子树合格', sequence.length),
      statusBadge: { text: '左子树通过', type: 'info' },
      callTrace: trace.snapshot(),
    });

    // 3. 检查中序严格单调递增
    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      prev: prevVal,
      sequence: [...sequence],
      valid: true,
      invalidNode: null,
      decision: `检验中序单调性: if (prev != null && root.val <= prev.val)`,
      phase: 'check',
      action: 'compare',
      message:
        prevVal === null
          ? `前驱 prev 为 null（首个中序访问节点 ${node.val}），单调性校验直接通过。`
          : `比较当前节点 ${node.val} 与前驱 prev = ${prevVal}：要求严格递增 (${node.val} > ${prevVal})。`,
      log: prevVal === null ? `首个中序访问节点 ${node.val}，无需比较` : `单调性比较：当前节点 ${node.val} vs 前驱 ${prevVal} (要求 >)`,
      codeLine: L.comparePrev,
      metrics: makeStage1Metrics(node.val, prevVal, '单调性校验中', sequence.length),
      statusBadge: { text: `校验单调性 (${node.val})`, type: 'info' },
      callTrace: trace.snapshot(),
    });

    if (prevVal !== null && node.val <= prevVal) {
      isValid = false;
      invalidNode = node.val;
      trace.addConditionHit(
        `③ 单调性破坏: ${node.val} <= ${prevVal} 违规!`,
        depth
      );
      trace.addReturnLeaf('return false', depth);

      steps.push({
        tree: cloneTree(workingTree),
        current: node.val,
        prev: prevVal,
        sequence: [...sequence, node.val],
        valid: false,
        invalidNode: node.val,
        decision: `🚨 发现单调性破坏！节点 ${node.val} <= 前驱 ${prevVal}`,
        phase: 'invalid',
        action: 'violation',
        message: `❌ 违规！节点 ${node.val} 未能严格大于前驱 prev (${prevVal})，破坏 BST 中序单调递增性！`,
        log: `单调性破坏！当前节点 ${node.val} <= 前驱 ${prevVal}，违规熔断！`,
        codeLine: L.prevViolation,
        metrics: makeStage1Metrics(node.val, prevVal, '违规破坏', sequence.length),
        statusBadge: { text: '单调性违规 (False)', type: 'danger' },
        callTrace: trace.snapshot(),
      });
      return false;
    }

    trace.addConditionPass(
      prevVal === null ? '③ prev == null (首节点通过)' : `③ 单调递增合格: ${node.val} > ${prevVal}`,
      depth
    );

    // 4. 更新 prev = node
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
      log: `更新前驱 prev = ${node.val}，已收集序列 [${sequence.join(', ')}]`,
      codeLine: L.updatePrev,
      metrics: makeStage1Metrics(node.val, prevVal, '严格递增', sequence.length),
      statusBadge: { text: '单调递增正常', type: 'success' },
      callTrace: trace.snapshot(),
    });

    // 5. 递归验证右子树
    trace.addRecursePrep(`④ 递归验证右子树: isValidBST(${node.right ? node.right.val : 'null'})`, depth);
    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      prev: prevVal,
      sequence: [...sequence],
      valid: true,
      invalidNode: null,
      decision: `深入右子树递归：return isValidBST(root.right)`,
      phase: 'check',
      action: 'recurse-right',
      message: `中序遍历推进：继续探索节点 ${node.val} 的右子树 (${node.right ? `右孩子 ${node.right.val}` : '右孩子为 null'})。`,
      log: `深入节点 ${node.val} 右子树：isValidBST(${node.right ? node.right.val : 'null'})`,
      codeLine: L.checkRight,
      metrics: makeStage1Metrics(node.val, prevVal, '探测右子树', sequence.length),
      statusBadge: { text: '深入右子树', type: 'info' },
      callTrace: trace.snapshot(),
    });

    const rightValid = inorder(node.right, depth + 1, node, 'right');
    if (!rightValid) {
      return false;
    }

    trace.addUnwindCalc(`节点 ${node.val} 左右子树及自身验证通过`, depth, undefined, 'return true');
    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      prev: prevVal,
      sequence: [...sequence],
      valid: true,
      invalidNode: null,
      decision: `节点 ${node.val} 及其左右子树全部验证通过，返回 true`,
      phase: 'check',
      action: 'node-success',
      message: `✅ 节点 ${node.val} 左右子树及自身单调性校验通过，向父调用返回 true。`,
      log: `节点 ${node.val} 左右子树与单调性均合格，向父层返回 true`,
      codeLine: L.returnRight,
      metrics: makeStage1Metrics(node.val, prevVal, '子树合格', sequence.length),
      statusBadge: { text: '子树合格 (true)', type: 'success' },
      callTrace: trace.snapshot(),
    });

    return true;
  }

  const finalResult = inorder(workingTree, 0);

  if (finalResult) {
    trace.addFinalResult(`🎉 全树中序遍历序列严格单调递增，成功判定为有效 BST！`, 0, undefined, 'true');
    steps.push({
      tree: cloneTree(workingTree),
      current: workingTree ? workingTree.val : null,
      prev: prevVal,
      sequence: [...sequence],
      valid: true,
      invalidNode: null,
      decision: 'BST 校验全部完成：确认合法',
      phase: 'valid',
      action: 'done',
      message: `🎉 全树中序遍历序列严格单调递增：[${sequence.join(', ')}]，成功判定为有效二叉搜索树！`,
      log: `全树中序单调性校验通过：[${sequence.join(', ')}]，确认为有效 BST`,
      metrics: makeStage1Metrics(null, prevVal, '全体验证通过', sequence.length),
      codeLine: L.doneValid,
      statusBadge: { text: '合法 BST (true)', type: 'success' },
      callTrace: trace.snapshot(),
    });
  }

  return steps;
}

// ============================================================
// Stage 2 Step Generator: 上下界区间约束先序定界 (Boundary Range Pruning)
// ============================================================
export function buildValidBstStage2RangeSteps(root: TreeNode | null): VBStep[] {
  const steps: VBStep[] = [];
  const sequence: number[] = [];
  const L = VALID_BST_STAGE2_RANGE_LINES;

  const trace = new RecursiveCallTraceBuilder();
  const workingTree = cloneTree(root);
  const rootText = workingTree ? `${workingTree.val}` : 'null';
  trace.addHeader(`check(${rootText}, -∞, +∞)`, 0, '<- 根调用开始');

  steps.push({
    tree: cloneTree(workingTree),
    current: null,
    prev: null,
    sequence: [],
    valid: true,
    invalidNode: null,
    decision: '算法启动：初始化 (min, max) 上下界定界校验',
    phase: 'init',
    action: 'init',
    boundary: { min: '-∞', max: '+∞', inRange: true },
    message: workingTree
      ? `启动区间定界法：根节点 ${workingTree.val} 的初始合法区间为 (-∞, +∞)。`
      : '空树，直接判定为有效 BST。',
    log: workingTree ? `算法启动：根节点 ${workingTree.val}，初始开区间 (-∞, +∞)` : '空树特判：直接返回 true',
    codeLine: L.entry,
    metrics: makeStage2Metrics(workingTree ? workingTree.val : null, '-∞', '+∞', '准备区间定界', 0),
    statusBadge: { text: '先序定界就绪', type: 'info' },
    callTrace: trace.snapshot(),
  });

  if (!workingTree) {
    trace.addConditionHit('node == null √ 命中 -> return true', 0);
    trace.addReturnLeaf('return true', 0);
    trace.addFinalResult('最终返回: true', 0, undefined, 'true');

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
      log: '空树天然满足开区间约束 -> return true',
      codeLine: L.nullCheck,
      metrics: makeStage2Metrics(null, '-∞', '+∞', '区间定界合格', 0),
      statusBadge: { text: '空树合格', type: 'success' },
      callTrace: trace.snapshot(),
    });
    return steps;
  }

  let isValid = true;
  let invalidNode: number | null = null;

  function check(
    node: TreeNode | null,
    minVal: number,
    maxVal: number,
    depth: number,
    parent: TreeNode | null = null,
    branch: 'left' | 'right' = 'left'
  ): boolean {
    if (!isValid) return false;

    const minStr = minVal === -Infinity ? '-∞' : String(minVal);
    const maxStr = maxVal === Infinity ? '+∞' : String(maxVal);

    if (node === null) {
      trace.addHeader(`check(null, ${minStr}, ${maxStr})`, depth, '<- 空节点判空');
      const nullProbe = parent ? { parentVal: parent.val, branch } : undefined;
      const secondaryNodes = parent ? [parent.val] : [];

      steps.push({
        tree: cloneTree(workingTree),
        current: null,
        prev: null,
        sequence: [...sequence],
        valid: true,
        invalidNode: null,
        nullProbe,
        secondaryHighlightedNodes: secondaryNodes,
        decision: `基底判空：进入 check(null, ${minStr}, ${maxStr})${parent ? ` (考察节点 ${parent.val} 的${branch === 'left' ? '左' : '右'}孩子)` : ''}`,
        phase: 'check',
        action: 'null-check',
        boundary: { min: minStr, max: maxStr, inRange: true },
        message: `空节点天然满足 (${minStr}, ${maxStr}) 约束，命中 if (node == null) return true。`,
        log: parent ? `空节点深入判空 (节点 ${parent.val} 的${branch === 'left' ? '左' : '右'}孩子)` : '空节点判空',
        codeLine: L.nullCheck,
        metrics: makeStage2Metrics(parent ? `∅(父:${parent.val})` : 'null', minStr, maxStr, '判空合格', sequence.length),
        statusBadge: { text: '空节点合格', type: 'success' },
        callTrace: trace.snapshot(),
      });

      trace.addConditionHit('node == null √ 命中 -> return true', depth);
      trace.addReturnLeaf('return true', depth);

      steps.push({
        tree: cloneTree(workingTree),
        current: null,
        prev: null,
        sequence: [...sequence],
        valid: true,
        invalidNode: null,
        nullProbe,
        secondaryHighlightedNodes: secondaryNodes,
        decision: `基底返回：空节点返回 true${parent ? ` (向父节点 ${parent.val} 返回)` : ''}`,
        phase: 'check',
        action: 'null-return',
        boundary: { min: minStr, max: maxStr, inRange: true },
        message: '空节点回溯返回 true。',
        log: parent ? `空节点命中，向父节点 ${parent.val} 返回 true` : '空节点命中，返回 true',
        codeLine: L.nullReturn,
        metrics: makeStage2Metrics(parent ? `∅(父:${parent.val})` : 'null', minStr, maxStr, '返回 true', sequence.length),
        statusBadge: { text: '返回 true', type: 'success' },
        callTrace: trace.snapshot(),
      });

      return true;
    }

    if (depth > 0) {
      trace.addHeader(`check(${node.val}, ${minStr}, ${maxStr})`, depth, '<- 先序检验');
    }

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
      log: `先序检验节点 ${node.val} 是否在开区间 (${minStr}, ${maxStr}) 内 -> ${inRange ? '合格' : '越界'}`,
      codeLine: inRange ? L.boundaryCheck : L.violation,
      metrics: makeStage2Metrics(node.val, minStr, maxStr, inRange ? '落入区间' : '越界违规', sequence.length),
      statusBadge: { text: inRange ? '区间合格' : '越界违规', type: inRange ? 'info' : 'danger' },
      callTrace: trace.snapshot(),
    });

    if (!inRange) {
      isValid = false;
      invalidNode = node.val;
      trace.addConditionHit(
        `越界违规: ${node.val} not in (${minStr}, ${maxStr})!`,
        depth
      );
      trace.addReturnLeaf('return false', depth);

      steps.push({
        tree: cloneTree(workingTree),
        current: node.val,
        prev: null,
        sequence: [...sequence],
        valid: false,
        invalidNode: node.val,
        decision: `🚨 发现节点 ${node.val} 越界！违反约束剪枝返回 false`,
        phase: 'invalid',
        action: 'violation',
        boundary: { min: minStr, max: maxStr, inRange: false },
        message: `❌ 节点 ${node.val} 超出开区间 (${minStr}, ${maxStr})，先序定界立即失败返回 false！`,
        log: `节点 ${node.val} 越界！超出合法开区间 (${minStr}, ${maxStr})，剪枝熔断！`,
        codeLine: L.violation,
        metrics: makeStage2Metrics(node.val, minStr, maxStr, '越界违规', sequence.length),
        statusBadge: { text: '区间定界失败 (False)', type: 'danger' },
        callTrace: trace.snapshot(),
      });
      return false;
    }

    trace.addConditionPass(`区间合格: ${minStr} < ${node.val} < ${maxStr}`, depth);
    sequence.push(node.val);

    // 深入左子树
    trace.addRecursePrep(`左子树递归定界: check(left, ${minStr}, ${node.val})`, depth);
    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      prev: null,
      sequence: [...sequence],
      valid: true,
      invalidNode: null,
      decision: `左子树约束更新：check(node.left, ${minStr}, ${node.val})`,
      phase: 'check',
      action: 'recurse-left',
      boundary: { min: minStr, max: String(node.val), inRange: true },
      message: `向左递归：左子树的所有节点值必须严格落在 (${minStr}, ${node.val}) 内。`,
      log: `深入左子树，收紧上界为 ${node.val}：(${minStr}, ${node.val})`,
      codeLine: L.recurseLeft,
      metrics: makeStage2Metrics(node.val, minStr, node.val, '向左定界', sequence.length),
      statusBadge: { text: '向左递归定界', type: 'info' },
      callTrace: trace.snapshot(),
    });

    const leftOk = check(node.left, minVal, node.val, depth + 1, node, 'left');
    if (!leftOk) {
      return false;
    }

    // 深入右子树
    trace.addRecursePrep(`右子树递归定界: check(right, ${node.val}, ${maxStr})`, depth);
    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      prev: null,
      sequence: [...sequence],
      valid: true,
      invalidNode: null,
      decision: `右子树约束更新：check(node.right, ${node.val}, ${maxStr})`,
      phase: 'check',
      action: 'recurse-right',
      boundary: { min: String(node.val), max: maxStr, inRange: true },
      message: `向右递归：右子树的所有节点值必须严格落在 (${node.val}, ${maxStr}) 内。`,
      log: `深入右子树，收紧下界为 ${node.val}：(${node.val}, ${maxStr})`,
      codeLine: L.recurseRight,
      metrics: makeStage2Metrics(node.val, node.val, maxStr, '向右定界', sequence.length),
      statusBadge: { text: '向右递归定界', type: 'info' },
      callTrace: trace.snapshot(),
    });

    const rightOk = check(node.right, node.val, maxVal, depth + 1, node, 'right');
    if (!rightOk) {
      return false;
    }

    trace.addUnwindCalc(`节点 ${node.val} 子树全部满足区间约束`, depth, undefined, 'return true');
    return true;
  }

  const res = check(workingTree, -Infinity, Infinity, 0);

  if (res) {
    trace.addFinalResult('全树先序定界全部合格，确认合法 BST', 0, undefined, 'true');
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
      log: '所有节点均严格满足祖先传递的开区间约束，确认为有效 BST',
      codeLine: L.done,
      metrics: makeStage2Metrics(null, '-∞', '+∞', '区间定界合格', sequence.length),
      statusBadge: { text: '区间定界合格 (true)', type: 'success' },
      callTrace: trace.snapshot(),
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
      log: '空树特判：直接返回 true',
      codeLine: L.nullCheck,
      metrics: makeStage3Metrics(null, null, '全体验证通过', 0),
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
    log: '算法启动：初始化显式栈 Stack<TreeNode> 模拟中序遍历',
    codeLine: L.initStack,
    metrics: makeStage3Metrics(workingTree.val, null, '显式栈就绪', 0),
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
        log: `节点 ${cur.val} 压入显式栈，栈大小: ${stack.length}`,
        codeLine: L.pushLeftBranch,
        metrics: makeStage3Metrics(cur.val, cur.val, '沿左链压栈', sequence.length),
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
      log: `从栈顶弹出节点 ${cur.val}，与前驱 prev = ${prevVal ?? 'null'} 进行严格大于检验`,
      codeLine: L.popNode,
      metrics: makeStage3Metrics(cur.val, stack.length > 0 ? stack[stack.length - 1].val : null, '出栈校验单调性', sequence.length),
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
        log: `单调性破坏！出栈节点 ${cur.val} <= 前驱 ${prevVal}，遍历终止`,
        codeLine: L.comparePrev,
        metrics: makeStage3Metrics(cur.val, stack.length > 0 ? stack[stack.length - 1].val : null, '违规破坏', sequence.length),
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
      log: `出栈节点 ${cur.val} 校验合格，更新前驱 prev = ${cur.val}，转向右孩子`,
      codeLine: L.turnRight,
      metrics: makeStage3Metrics(cur.val, stack.length > 0 ? stack[stack.length - 1].val : null, '单调递增通过', sequence.length),
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
      log: `显式栈中序遍历全部完成，所有节点严格单调递增：[${sequence.join(', ')}]`,
      codeLine: L.doneValid,
      metrics: makeStage3Metrics(null, null, '全体验证通过', sequence.length),
      statusBadge: { text: '显式栈合格 (true)', type: 'success' },
    });
  }

  return steps;
}

/**
 * 领域统一门面 (ValidBstStepCompiler)
 */
export class ValidBstStepCompiler {
  static buildStage1Steps = buildVBSteps;
  static buildStage2RangeSteps = buildValidBstStage2RangeSteps;
  static buildStage3StackSteps = buildValidBstStage3StackSteps;
  static buildSteps = buildVBSteps;
  static collectTreeValues = collectTreeValues;
}
