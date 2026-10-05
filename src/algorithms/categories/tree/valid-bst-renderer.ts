/**
 * 验证二叉搜索树 (Validate BST · LeetCode 98 / Class 037 Code05)
 * 采用顶层声明式架构与多阶段演化体系 (Multi-Stage Evolution)
 *
 * 设计模式抽象与设计原则:
 *   - 建造者模式 (Builder Pattern): 利用 RecursiveCallTraceBuilder 结构化构建递归推演树与状态快照
 *   - 适配器模式 (Adapter Pattern): TreeCanvasAdapter (Card 1 沙盘) + RecursiveCallTraceAdapter (Card 2 调用栈视图)
 *   - 单一职责与防腐隔离 (SRP): Card 1 与 Card 2 彻底解耦，杜绝外部选择器穿透与 DOM 污染
 *   - 严格一行一步与零静默 (Strict One-Line-One-Step): 覆盖所有递归入口/判空/子分支与回溯帧，杜绝高亮冻结
 *
 * 核心演化体系:
 *   Stage 1: 中序递归单调性校验 (Recursive Inorder Monotonicity · 经典全局前驱指针)
 *   Stage 2: 上下界区间约束先序定界 (Boundary Range Pruning · (min, max) 递归先序剪枝)
 *   Stage 3: 迭代显式栈模拟中序遍历 (Iterative Explicit Stack Inorder · 模拟调用栈)
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceAdapter,
  RecursiveCallTraceSnapshot,
} from '../../../core/renderers/adapters/recursive-call-trace-adapter';
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

  /** 递归调用追踪树快照 (Builder Pattern) */
  callTrace?: RecursiveCallTraceSnapshot;

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

  const trace = new RecursiveCallTraceBuilder();
  const workingTree = cloneTree(root);
  const rootText = workingTree ? `${workingTree.val}` : 'null';
  trace.addHeader(`isValidBST(${rootText})`, 0, '<- 根调用开始');

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
      log: 'root is null',
      codeLine: L.nullCheckHit,
      metrics: { '当前节点': 'null', '判定结果': 'TRUE' },
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
      log: 'return true',
      codeLine: L.nullReturn,
      metrics: { '判定结果': 'TRUE (合法 BST)' },
      statusBadge: { text: '合法 BST (true)', type: 'success' },
      callTrace: trace.snapshot(),
    });
    return steps;
  }

  function inorder(node: TreeNode | null, depth: number): boolean {
    if (!isValid) return false;

    if (node === null) {
      trace.addHeader(`isValidBST(null)`, depth, '<- 空节点判空');
      steps.push({
        tree: cloneTree(workingTree),
        current: null,
        prev: prevVal,
        sequence: [...sequence],
        valid: true,
        invalidNode: null,
        decision: '基底判空：进入 isValidBST(null)',
        phase: 'check',
        action: 'null-entry',
        message: '递归进入空节点，执行基底判空检查 if (root == null)。',
        log: 'isValidBST(null) -> check null',
        codeLine: L.nullCheckHit,
        metrics: { '当前节点': 'null', '前驱 prev': prevVal ?? 'null' },
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
        decision: '基底返回：空节点返回 true',
        phase: 'check',
        action: 'null-return',
        message: '空子树不破坏二叉搜索树性质，返回 true。',
        log: 'return true from null',
        codeLine: L.nullReturn,
        metrics: { '当前节点': 'null', '返回值': 'true' },
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
      log: `isValidBST(${node.val}) entry`,
      codeLine: L.entry,
      metrics: { '当前节点': node.val, '前驱 prev': prevVal ?? 'null' },
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
      log: `node ${node.val} != null -> continue`,
      codeLine: L.nullCheckPass,
      metrics: { '当前节点': node.val, '前驱 prev': prevVal ?? 'null' },
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
      log: `recurse left of ${node.val}`,
      codeLine: L.checkLeft,
      metrics: { '当前节点': node.val, '递归方向': `深入左子树 (${node.left ? node.left.val : 'null'})` },
      statusBadge: { text: '深入左子树', type: 'info' },
      callTrace: trace.snapshot(),
    });

    const leftValid = inorder(node.left, depth + 1);
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
        log: `node ${node.val} left branch failed -> return false`,
        codeLine: L.leftReturnFalse,
        metrics: { '当前节点': node.val, '左子树': 'FALSE', '返回值': 'false' },
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
      log: `left of ${node.val} valid -> check cur`,
      codeLine: L.leftReturned,
      metrics: { '当前节点': node.val, '左子树校验': '通过' },
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
      log: prevVal === null ? `first node: ${node.val}` : `compare: cur ${node.val} vs prev ${prevVal}`,
      codeLine: L.comparePrev,
      metrics: { '当前节点': node.val, '前驱 prev': prevVal ?? 'null' },
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
        log: `FAILED: node ${node.val} <= prev ${prevVal}`,
        codeLine: L.prevViolation,
        metrics: { '违规节点': node.val, '前驱 prev': prevVal, '判定': 'FALSE' },
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
      log: `prev = ${node.val}, sequence = [${sequence.join(', ')}]`,
      codeLine: L.updatePrev,
      metrics: { '当前中序序列长度': sequence.length, '最新前驱 prev': node.val },
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
      log: `recurse right of ${node.val}`,
      codeLine: L.checkRight,
      metrics: { '当前节点': node.val, '递归方向': `深入右子树 (${node.right ? node.right.val : 'null'})` },
      statusBadge: { text: '深入右子树', type: 'info' },
      callTrace: trace.snapshot(),
    });

    const rightValid = inorder(node.right, depth + 1);
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
      log: `node ${node.val} valid BST -> return true`,
      codeLine: L.returnRight,
      metrics: { '当前节点': node.val, '子树结果': 'TRUE' },
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
  const L = VALID_BST_STAGE2_RANGE_LINES;
  const sequence: number[] = [];
  const workingTree = cloneTree(root);
  const trace = new RecursiveCallTraceBuilder();
  trace.addHeader(`check(${workingTree ? workingTree.val : 'null'}, -∞, +∞)`, 0, '<- 根区间定界');

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
      log: 'empty tree -> return true',
      codeLine: L.nullCheck,
      metrics: { '判定结果': 'TRUE' },
      statusBadge: { text: '空树合格', type: 'success' },
      callTrace: trace.snapshot(),
    });
    return steps;
  }

  let isValid = true;
  let invalidNode: number | null = null;

  function check(node: TreeNode | null, minVal: number, maxVal: number, depth: number): boolean {
    if (!isValid) return false;

    const minStr = minVal === -Infinity ? '-∞' : String(minVal);
    const maxStr = maxVal === Infinity ? '+∞' : String(maxVal);

    if (node === null) {
      trace.addHeader(`check(null, ${minStr}, ${maxStr})`, depth, '<- 空节点判空');
      steps.push({
        tree: cloneTree(workingTree),
        current: null,
        prev: null,
        sequence: [...sequence],
        valid: true,
        invalidNode: null,
        decision: `基底判空：进入 check(null, ${minStr}, ${maxStr})`,
        phase: 'check',
        action: 'null-check',
        boundary: { min: minStr, max: maxStr, inRange: true },
        message: `空节点天然满足 (${minStr}, ${maxStr}) 约束，命中 if (node == null) return true。`,
        log: `check(null, ${minStr}, ${maxStr}) -> true`,
        codeLine: L.nullCheck,
        metrics: { '当前节点': 'null', '区间约束': `(${minStr}, ${maxStr})`, '返回值': 'true' },
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
        decision: '基底返回：空节点返回 true',
        phase: 'check',
        action: 'null-return',
        boundary: { min: minStr, max: maxStr, inRange: true },
        message: '空节点回溯返回 true。',
        log: 'return true',
        codeLine: L.nullReturn,
        metrics: { '当前节点': 'null', '判定结果': 'TRUE' },
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
      log: `check node=${node.val} in (${minStr}, ${maxStr}) -> ${inRange}`,
      codeLine: inRange ? L.boundaryCheck : L.violation,
      metrics: { '当前节点': node.val, '合法开区间': `(${minStr}, ${maxStr})`, '区间符合': inRange ? '合格' : '越界违规' },
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
        log: `FAILED: node ${node.val} out of range`,
        codeLine: L.violation,
        metrics: { '违规节点': node.val, '当前范围': `(${minStr}, ${maxStr})`, '判定': 'FALSE' },
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
      log: `recurse left in (${minStr}, ${node.val})`,
      codeLine: L.recurseLeft,
      metrics: { '当前节点': node.val, '左分支区间': `(${minStr}, ${node.val})` },
      statusBadge: { text: '向左递归定界', type: 'info' },
      callTrace: trace.snapshot(),
    });

    const leftOk = check(node.left, minVal, node.val, depth + 1);
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
      log: `recurse right in (${node.val}, ${maxStr})`,
      codeLine: L.recurseRight,
      metrics: { '当前节点': node.val, '右分支区间': `(${node.val}, ${maxStr})` },
      statusBadge: { text: '向右递归定界', type: 'info' },
      callTrace: trace.snapshot(),
    });

    const rightOk = check(node.right, node.val, maxVal, depth + 1);
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
      log: 'SUCCESS: all nodes satisfy range boundaries',
      codeLine: L.done,
      metrics: { '判定结果': 'TRUE (合法 BST)' },
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
// 统一表现层渲染器 (Card 1: 树画布纯净沙盘)
// ============================================================
export function renderValidBstCanvas(container: HTMLElement, step: VBStep, _stageId: string): void {
  const isDone = step.action === 'done';
  const allTreeNodes = collectTreeValues(step.tree);

  let primaryNode = step.invalidNode !== null ? step.invalidNode : step.current;
  let visitedNodes = step.sequence;

  if (isDone && step.valid) {
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
}

// ============================================================
// Card 2 自定义指标与推演栈渲染器 (Card 2 Presentation Adapters)
// ============================================================

/**
 * Stage 1: Card 2 递归调用推演跟踪栈
 */
export function renderStage1CustomMetrics(container: HTMLElement, step: VBStep): void {
  container.innerHTML = '';
  container.className = 'w-full h-full flex flex-col gap-2.5 p-3 text-xs font-sans overflow-hidden';

  const isDone = step.action === 'done';
  const isValid = step.valid;

  // 1. 顶部 4 格关键指标
  const statsRow = document.createElement('div');
  statsRow.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
  statsRow.innerHTML = `
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">当前考察</div>
      <div class="text-sm font-bold ${step.invalidNode !== null ? 'text-rose-600' : 'text-amber-600'}">${step.current ?? '—'}</div>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">前驱 prev</div>
      <div class="text-sm font-bold text-blue-600">${step.prev ?? 'null'}</div>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">单调性判定</div>
      <div class="text-sm font-bold ${isValid ? 'text-emerald-600' : 'text-rose-600'}">${isValid ? (isDone ? '全体验证通过' : '严格递增') : '违规破坏'}</div>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">已收集序列</div>
      <div class="text-sm font-bold text-slate-700">${step.sequence.length} 个</div>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 中序递增序列流
  const seqRow = document.createElement('div');
  seqRow.className = 'flex flex-wrap items-center gap-1 p-2 bg-slate-50 border border-slate-200 rounded text-xs flex-shrink-0';
  const seqHtml = step.sequence.length > 0
    ? step.sequence.map((v, i) => `
        <span class="px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded font-mono font-bold">${v}</span>
        ${i < step.sequence.length - 1 ? '<span class="text-slate-400 text-[10px]">&lt;</span>' : ''}
      `).join('')
    : '<span class="text-slate-400 italic">等待首个中序访问节点...</span>';
  seqRow.innerHTML = `<span class="text-[11px] font-bold text-slate-600 mr-1">中序序列:</span> ${seqHtml}`;
  container.appendChild(seqRow);

  // 3. 决策信息条
  const decisionBar = document.createElement('div');
  decisionBar.className = 'p-2 bg-blue-50/60 border border-blue-100 rounded text-[11px] text-slate-700 flex-shrink-0';
  decisionBar.innerHTML = `<span class="font-bold text-blue-900">🧭 决策:</span> ${step.decision} <span class="text-slate-500 ml-2">(${step.message})</span>`;
  container.appendChild(decisionBar);

  // 4. 底部弹性容器挂载 RecursiveCallTraceAdapter
  const traceContainer = document.createElement('div');
  traceContainer.className = 'flex-1 min-h-0 w-full overflow-hidden';
  container.appendChild(traceContainer);

  RecursiveCallTraceAdapter.render(traceContainer, step.callTrace || null, {
    theme: 'light',
    title: '🌳 中序递归调用推演跟踪树 (Inorder Call Trace)',
    showTerminalHeader: true,
  });
}

/**
 * Stage 2: Card 2 先序开区间定界与追踪栈
 */
export function renderStage2CustomMetrics(container: HTMLElement, step: VBStep): void {
  container.innerHTML = '';
  container.className = 'w-full h-full flex flex-col gap-2.5 p-3 text-xs font-sans overflow-hidden';

  const minVal = step.boundary?.min ?? '-∞';
  const maxVal = step.boundary?.max ?? '+∞';
  const inRange = step.boundary?.inRange ?? true;

  // 1. 顶部 4 格关键指标
  const statsRow = document.createElement('div');
  statsRow.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
  statsRow.innerHTML = `
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">当前考察</div>
      <div class="text-sm font-bold ${inRange ? 'text-amber-600' : 'text-rose-600'}">${step.current ?? '—'}</div>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">合法开区间</div>
      <div class="text-sm font-bold text-blue-600 font-mono">(${minVal}, ${maxVal})</div>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">区间检验</div>
      <div class="text-sm font-bold ${inRange ? 'text-emerald-600' : 'text-rose-600'}">${inRange ? '落入区间' : '越界违规'}</div>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">已检验节点</div>
      <div class="text-sm font-bold text-slate-700">${step.sequence.length} 个</div>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 决策信息条
  const decisionBar = document.createElement('div');
  decisionBar.className = 'p-2 bg-blue-50/60 border border-blue-100 rounded text-[11px] text-slate-700 flex-shrink-0';
  decisionBar.innerHTML = `<span class="font-bold text-blue-900">🧭 决策:</span> ${step.decision} <span class="text-slate-500 ml-2">(${step.message})</span>`;
  container.appendChild(decisionBar);

  // 3. 底部弹性容器挂载 RecursiveCallTraceAdapter
  const traceContainer = document.createElement('div');
  traceContainer.className = 'flex-1 min-h-0 w-full overflow-hidden';
  container.appendChild(traceContainer);

  RecursiveCallTraceAdapter.render(traceContainer, step.callTrace || null, {
    theme: 'light',
    title: '📐 先序定界递归推演跟踪树 (Boundary Range Trace)',
    showTerminalHeader: true,
  });
}

/**
 * Stage 3: Card 2 显式栈状态监视器
 */
export function renderStage3CustomMetrics(container: HTMLElement, step: VBStep): void {
  container.innerHTML = '';
  container.className = 'w-full h-full flex flex-col gap-2.5 p-3 text-xs font-sans overflow-hidden';

  const stackVals = step.stack || [];

  // 1. 顶部 4 格关键指标
  const statsRow = document.createElement('div');
  statsRow.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
  statsRow.innerHTML = `
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">当前考察</div>
      <div class="text-sm font-bold text-amber-600">${step.current ?? '—'}</div>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">栈内深度</div>
      <div class="text-sm font-bold text-indigo-600">${stackVals.length}</div>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">前驱 prev</div>
      <div class="text-sm font-bold text-blue-600">${step.prev ?? 'null'}</div>
    </div>
    <div class="bg-slate-50 border border-slate-200 rounded p-2 text-center">
      <div class="text-[10px] text-slate-500 font-bold">单调性判定</div>
      <div class="text-sm font-bold ${step.valid ? 'text-emerald-600' : 'text-rose-600'}">${step.valid ? '严格递增' : '违规破坏'}</div>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 显式栈槽位可视化
  const stackRow = document.createElement('div');
  stackRow.className = 'flex flex-col gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded text-xs flex-shrink-0';
  const stackChips = stackVals.length > 0
    ? stackVals.map((v) => `<span class="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold font-mono rounded text-xs shadow-sm">${v}</span>`).join('')
    : '<span class="text-slate-400 italic">当前栈为空</span>';
  stackRow.innerHTML = `
    <div class="flex items-center justify-between text-[11px] font-bold text-slate-600">
      <span>🥞 显式调用栈 Stack&lt;TreeNode&gt;:</span>
      <span class="text-[10px] text-slate-400">栈底在左 ➔ 栈顶在右</span>
    </div>
    <div class="flex items-center gap-1.5 flex-wrap">${stackChips}</div>
  `;
  container.appendChild(stackRow);

  // 3. 中序序列流
  const seqRow = document.createElement('div');
  seqRow.className = 'flex flex-wrap items-center gap-1 p-2 bg-slate-50 border border-slate-200 rounded text-xs flex-shrink-0';
  const seqHtml = step.sequence.length > 0
    ? step.sequence.map((v, i) => `
        <span class="px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded font-mono font-bold">${v}</span>
        ${i < step.sequence.length - 1 ? '<span class="text-slate-400 text-[10px]">&lt;</span>' : ''}
      `).join('')
    : '<span class="text-slate-400 italic">等待出栈节点...</span>';
  seqRow.innerHTML = `<span class="text-[11px] font-bold text-slate-600 mr-1">已出栈中序序列:</span> ${seqHtml}`;
  container.appendChild(seqRow);

  // 4. 决策信息条
  const decisionBar = document.createElement('div');
  decisionBar.className = 'p-2 bg-blue-50/60 border border-blue-100 rounded text-[11px] text-slate-700 flex-shrink-0';
  decisionBar.innerHTML = `<span class="font-bold text-blue-900">🧭 决策:</span> ${step.decision} <span class="text-slate-500 ml-2">(${step.message})</span>`;
  container.appendChild(decisionBar);
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
      renderCustomMetrics: (container, step) => renderStage1CustomMetrics(container, step),
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
      renderCustomMetrics: (container, step) => renderStage2CustomMetrics(container, step),
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
      renderCustomMetrics: (container, step) => renderStage3CustomMetrics(container, step),
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
  renderCustomMetrics: (container, step) => renderStage1CustomMetrics(container, step),
});