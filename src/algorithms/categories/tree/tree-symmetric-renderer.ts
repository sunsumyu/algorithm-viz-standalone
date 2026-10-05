/**
 * 对称二叉树 (Symmetric Tree · LeetCode 101)
 * 采用顶层声明式架构与多阶段演化体系 (Multi-Stage Evolution)
 *
 * 核心多阶段演化体系:
 *   Stage 1: 双指针镜像递归 (Recursive Mirror DFS · 经典内外侧双路递归)
 *   Stage 2: 队列成对迭代 (Iterative Queue BFS · 镜像双双入队校验)
 *   Stage 3: 静态数组模拟队列 (Static Array Queue · 左神招牌零 GC 连续内存)
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { HighlightTarget, StepBase } from '../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr } from './tree-template';
import {
  TREE_SYMMETRIC_PROBLEM_HTML,
  TREE_SYMMETRIC_ANALYSIS_HTML,
} from './tree-symmetric-problem-content';
import {
  TREE_SYMMETRIC_STAGE1_CODE,
  TREE_SYMMETRIC_STAGE1_LINES,
  TREE_SYMMETRIC_STAGE2_QUEUE_CODE,
  TREE_SYMMETRIC_STAGE2_QUEUE_LINES,
  TREE_SYMMETRIC_STAGE3_STATIC_ARRAY_CODE,
  TREE_SYMMETRIC_STAGE3_STATIC_ARRAY_LINES,
} from './tree-symmetric-stage-codes';

import {
  RecursiveCallTraceAdapter,
  RecursiveCallTraceBuilder,
  CallTraceSnapshot,
} from '../../../core/renderers/adapters/recursive-call-trace-adapter';

// ============================================================
// 类型契约与状态定义 (Domain Step Contract)
// ============================================================
export interface TSStep extends StepBase {
  tree: TreeNode | null;
  leftVal: number | null;
  rightVal: number | null;
  match: boolean;
  result: boolean;
  mismatchNode: number | null;
  decision?: string;
  action?: string;
  phase: 'init' | 'check-pair' | 'symmetric' | 'asymmetric';
  status: 'init' | 'check-pair' | 'symmetric' | 'asymmetric';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'info' | 'warning' | 'success' | 'danger' };
  callTrace?: CallTraceSnapshot;

  /** Stage 1 递归专用 */
  pairType?: 'outside' | 'inside' | 'root';

  /** Stage 2 队列专用 */
  queue?: (number | string)[];
  currentPair?: [number | string, number | string];

  /** Stage 3 静态数组专用 */
  staticQueueState?: {
    array: (number | string)[];
    l: number;
    r: number;
    u: number | string | null;
    v: number | string | null;
  };
}

// 兼容别名
export const TREE_SYMMETRIC_CODE_LINES = TREE_SYMMETRIC_STAGE1_LINES;

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
// Stage 1 Step Generator: 双指针镜像递归 (Recursive Mirror DFS)
// ============================================================
export function buildTSRecursiveSteps(root: TreeNode | null): TSStep[] {
  const steps: TSStep[] = [];
  const L = TREE_SYMMETRIC_STAGE1_LINES;
  let isSymmetric = true;
  let mismatchNode: number | null = null;
  let pairCount = 0;

  const trace = new RecursiveCallTraceBuilder();
  const rootText = root ? `${root.val}` : 'null';
  trace.addHeader(`isSymmetric(${rootText})`, 0, '<- 根调用判定');

  // 1. 函数入口帧 (Line 2: isSymmetric(root))
  steps.push({
    tree: root,
    leftVal: null,
    rightVal: null,
    match: true,
    result: true,
    mismatchNode: null,
    phase: 'init',
    status: 'init',
    decision: root ? `启动镜像递归：根节点为 ${root.val}，开始对比左子树与右子树` : '空二叉树：天然对称',
    action: 'init',
    message: root ? `初始化对称性检查：根节点为 ${root.val}，准备进入条件检查。` : '空树，默认对称。',
    log: root ? '初始化对称检查' : '空树 -> 对称',
    codeLine: L.init,
    metrics: { '当前比对': '根节点启动', '最终判定': '检验中...' },
    statusBadge: { text: '递归启动', type: 'info' },
    callTrace: trace.snapshot(),
  });

  // 2. 根判空行 (Line 3: if (root == null) return true;)
  if (!root) {
    trace.addConditionHit('① root == null √ 命中 -> 天然对称', 0);
    trace.addFinalResult('最终返回: true', 0, undefined, 'true');
    steps.push({
      tree: null,
      leftVal: null,
      rightVal: null,
      match: true,
      result: true,
      mismatchNode: null,
      phase: 'symmetric',
      status: 'symmetric',
      decision: '空树特判：root == null 命中，判定为轴对称 (true)',
      action: 'done',
      message: '✅ 空树是对称的，返回 true。',
      log: 'root == null -> return true',
      codeLine: L.empty,
      metrics: { '最终判定': '对称 (True)', '比对节点对数': 0 },
      statusBadge: { text: '空树对称', type: 'success' },
      callTrace: trace.snapshot(),
    });
    return steps;
  }

  // 根非空判定帧 (Line 3 判空为 false，继续向下)
  trace.addConditionPass(`① root != null (Node(${root.val}))，继续向下`, 0);
  steps.push({
    tree: root,
    leftVal: null,
    rightVal: null,
    match: true,
    result: true,
    mismatchNode: null,
    phase: 'init',
    status: 'init',
    decision: `根节点非空 (Node(${root.val}))，判空条件不满足，继续执行下一行`,
    action: 'init',
    message: `根节点 Node(${root.val}) != null，继续执行 check(root.left, root.right)。`,
    log: `root is not null -> proceed`,
    codeLine: L.empty,
    metrics: { '根节点状态': `Node(${root.val}) 非空`, '下一阶段': '启动双路镜像递归' },
    statusBadge: { text: '根非空', type: 'info' },
    callTrace: trace.snapshot(),
  });

  // 3. 启动镜像检查 (Line 4: return check(root.left, root.right);)
  trace.addRecursePrep(`return check(root.left: ${root.left?.val ?? 'null'}, root.right: ${root.right?.val ?? 'null'})`, 0);
  steps.push({
    tree: root,
    leftVal: root.left?.val ?? null,
    rightVal: root.right?.val ?? null,
    match: true,
    result: true,
    mismatchNode: null,
    phase: 'init',
    status: 'init',
    decision: `调用辅助函数：check(root.left: ${root.left?.val ?? 'null'}, root.right: ${root.right?.val ?? 'null'})`,
    action: 'init',
    message: `准备进入镜像比对函数 check(left, right)，同时考察左右子树对称性。`,
    log: `invoke check(left: ${root.left?.val ?? 'null'}, right: ${root.right?.val ?? 'null'})`,
    codeLine: L.startCheck,
    metrics: { '发起检查': 'check(root.left, root.right)', '左孩子': root.left?.val ?? 'null', '右孩子': root.right?.val ?? 'null' },
    statusBadge: { text: '发起镜像比对', type: 'info' },
    callTrace: trace.snapshot(),
  });

  const check = (
    left: TreeNode | null,
    right: TreeNode | null,
    depth: number,
    pairType: 'outside' | 'inside' | 'root'
  ): boolean => {
    if (!isSymmetric) return false;
    pairCount++;

    const leftVal = left ? left.val : null;
    const rightVal = right ? right.val : null;
    const pairName = pairType === 'outside' ? '外侧对' : pairType === 'inside' ? '内侧对' : '根下对';

    // 4.1 辅助函数入口帧 (Line 6: private boolean check(TreeNode left, TreeNode right))
    trace.addHeader(`check(${leftVal ?? 'null'}, ${rightVal ?? 'null'})`, depth, `<- ${pairName}比对`);
    steps.push({
      tree: root,
      leftVal,
      rightVal,
      match: true,
      result: true,
      mismatchNode: null,
      phase: 'check-pair',
      status: 'check-pair',
      pairType,
      decision: `进入 check 函数：考察${pairName} [${leftVal ?? 'null'}, ${rightVal ?? 'null'}]`,
      action: 'check-pair',
      message: `进入镜像比对函数 check(left: ${leftVal ?? 'null'}, right: ${rightVal ?? 'null'})。`,
      log: `check entry: ${leftVal ?? 'null'} vs ${rightVal ?? 'null'} (${pairType})`,
      codeLine: L.checkEntry,
      metrics: { '左镜像节点': leftVal ?? 'null', '右镜像节点': rightVal ?? 'null', '比对类型': pairType },
      statusBadge: { text: `比对 [${leftVal ?? 'null'}, ${rightVal ?? 'null'}]`, type: 'info' },
      callTrace: trace.snapshot(),
    });

    // 4.2 双空判定 (Line 7: if (left == null && right == null) return true;)
    if (left === null && right === null) {
      trace.addConditionHit('① left==null && right==null √ 命中! -> 对称', depth);
      trace.addReturnLeaf('return true', depth);
      steps.push({
        tree: root,
        leftVal: null,
        rightVal: null,
        match: true,
        result: true,
        mismatchNode: null,
        phase: 'check-pair',
        status: 'check-pair',
        pairType,
        decision: '双空判定：左右镜像节点均为空 (null == null)，命中基底，返回 true',
        action: 'both-null',
        message: '左右镜像节点均为空 (null == null)，该分支天然对称，返回 true。',
        log: 'both null -> return true',
        codeLine: L.bothNull,
        metrics: { '左镜像节点': 'null', '右镜像节点': 'null', '当前分支判定': '✓ 对称' },
        statusBadge: { text: '双空对称', type: 'success' },
        callTrace: trace.snapshot(),
      });
      return true;
    }

    // 双空不成立，显式推进判定帧
    trace.addConditionPass('① 非双空条件，继续向下判断', depth);
    steps.push({
      tree: root,
      leftVal,
      rightVal,
      match: true,
      result: true,
      mismatchNode: null,
      phase: 'check-pair',
      status: 'check-pair',
      pairType,
      decision: '双空判定：左右节点不全为空，条件为 false，向下检查是否有单侧为空',
      action: 'check-pair',
      message: `左右不全为空 (left: ${leftVal ?? 'null'}, right: ${rightVal ?? 'null'})，继续检查单侧空。`,
      log: `not both null -> proceed`,
      codeLine: L.bothNull,
      metrics: { '左镜像节点': leftVal ?? 'null', '右镜像节点': rightVal ?? 'null', '判定结果': '非双空' },
      statusBadge: { text: '非双空', type: 'info' },
      callTrace: trace.snapshot(),
    });

    // 4.3 单侧为空判定 (Line 8: if (left == null || right == null) return false;)
    if (left === null || right === null) {
      const failed = left ? left.val : right!.val;
      isSymmetric = false;
      mismatchNode = failed;

      trace.addConditionHit(`② left==null || right==null × 命中结构失配!`, depth);
      trace.addReturnLeaf('return false', depth);
      steps.push({
        tree: root,
        leftVal,
        rightVal,
        match: false,
        result: false,
        mismatchNode: failed,
        phase: 'asymmetric',
        status: 'asymmetric',
        pairType,
        decision: `结构失配！一侧节点为 Node(${failed})，而对应镜像节点为 null，返回 false`,
        action: 'one-null',
        message: `❌ 结构不对称！一个节点为 Node(${failed})，而对应镜像节点为 null。`,
        log: `structural mismatch: ${left ? left.val : 'null'} vs ${right ? right.val : 'null'}`,
        codeLine: L.oneNull,
        metrics: { '左镜像节点': leftVal ?? 'null', '右镜像节点': rightVal ?? 'null', '失配原因': '结构空缺失配' },
        statusBadge: { text: '结构失配', type: 'danger' },
        callTrace: trace.snapshot(),
      });
      return false;
    }

    // 单侧为空不成立，显式推进判定帧
    trace.addConditionPass('② 结构匹配（均非空），继续检查数值', depth);
    steps.push({
      tree: root,
      leftVal,
      rightVal,
      match: true,
      result: true,
      mismatchNode: null,
      phase: 'check-pair',
      status: 'check-pair',
      pairType,
      decision: `单侧空判定：两侧均非空 (Node(${left.val}) 与 Node(${right.val}))，结构匹配，向下比较数值`,
      action: 'check-pair',
      message: `两侧均非空，结构对称，继续检查节点数值是否相等。`,
      log: `both non-null -> proceed to value check`,
      codeLine: L.oneNull,
      metrics: { '左节点值': left.val, '右节点值': right.val, '判定结果': '结构对称' },
      statusBadge: { text: '结构匹配', type: 'info' },
      callTrace: trace.snapshot(),
    });

    // 4.4 数值不相等判定 (Line 9: if (left.val != right.val) return false;)
    if (left.val !== right.val) {
      isSymmetric = false;
      mismatchNode = left.val;

      trace.addConditionHit(`③ 数值失配: ${left.val} != ${right.val} × 命中!`, depth);
      trace.addReturnLeaf('return false', depth);
      steps.push({
        tree: root,
        leftVal: left.val,
        rightVal: right.val,
        match: false,
        result: false,
        mismatchNode: left.val,
        phase: 'asymmetric',
        status: 'asymmetric',
        pairType,
        decision: `数值失配！左侧值 ${left.val} != 右侧值 ${right.val}，返回 false`,
        action: 'val-mismatch',
        message: `❌ 数值不对称！左侧节点值为 ${left.val}，而右侧镜像节点值为 ${right.val}。`,
        log: `value mismatch: ${left.val} != ${right.val}`,
        codeLine: L.valMismatch,
        metrics: { '左镜像节点': left.val, '右镜像节点': right.val, '失配原因': '数值不等失配' },
        statusBadge: { text: '数值失配', type: 'danger' },
        callTrace: trace.snapshot(),
      });
      return false;
    }

    // 数值相等成立判定帧 (Line 9: 相等则不返回 false，准备深入)
    trace.addConditionPass(`③ 数值比对一致: ${left.val} == ${right.val} √`, depth);
    steps.push({
      tree: root,
      leftVal: left.val,
      rightVal: right.val,
      match: true,
      result: true,
      mismatchNode: null,
      phase: 'check-pair',
      status: 'check-pair',
      pairType,
      decision: `数值比对：左侧值 ${left.val} == 右侧值 ${right.val}，数值一致，准备递归检查子树`,
      action: 'val-match',
      message: `✓ 镜像节点比对一致：左侧 ${left.val} == 右侧 ${right.val}。准备深入子树。`,
      log: `value matched: ${left.val} == ${right.val}`,
      codeLine: L.valMatch,
      metrics: { '左镜像节点': left.val, '右镜像节点': right.val, '当前比对': '✓ 数值一致' },
      statusBadge: { text: '数值一致', type: 'success' },
      callTrace: trace.snapshot(),
    });

    // 4.5 递归外侧 (Line 10: boolean outside = check(left.left, right.right);)
    trace.addRecursePrep(`outside = check(left.left: ${left.left?.val ?? 'null'}, right.right: ${right.right?.val ?? 'null'})`, depth);
    steps.push({
      tree: root,
      leftVal: left.val,
      rightVal: right.val,
      match: true,
      result: true,
      mismatchNode: null,
      phase: 'check-pair',
      status: 'check-pair',
      pairType: 'outside',
      decision: `发起外侧递归：check(left.left: ${left.left?.val ?? 'null'}, right.right: ${right.right?.val ?? 'null'})`,
      action: 'recurse-outside',
      message: `深入外侧镜像比对：探索左节点的左孩子与右节点的右孩子。`,
      log: `recurse outside: ${left.left?.val ?? 'null'} vs ${right.right?.val ?? 'null'}`,
      codeLine: L.recurseOutside,
      metrics: { '比对方向': '外侧 (L.left vs R.right)' },
      statusBadge: { text: '外侧递归', type: 'info' },
      callTrace: trace.snapshot(),
    });

    const outside = check(left.left, right.right, depth + 1, 'outside');

    // 外侧返回赋值帧 (Line 10: 记录 outside 结果)
    trace.addConditionPass(`outside 结果就绪: ${outside}`, depth);
    steps.push({
      tree: root,
      leftVal: left.val,
      rightVal: right.val,
      match: outside,
      result: outside,
      mismatchNode: outside ? null : mismatchNode,
      phase: outside ? 'check-pair' : 'asymmetric',
      status: outside ? 'check-pair' : 'asymmetric',
      pairType: 'outside',
      decision: `外侧递归返回：outside = ${outside}`,
      action: 'check-pair',
      message: `外侧镜像递归计算完毕，outside = ${outside}。${outside ? '继续检查内侧。' : '外侧不对称，短路返回。'}`,
      log: `outside returned ${outside}`,
      codeLine: L.outsideDone,
      metrics: { '外侧结果 (outside)': `${outside}` },
      statusBadge: { text: `外侧: ${outside}`, type: outside ? 'info' : 'danger' },
      callTrace: trace.snapshot(),
    });

    if (!outside) return false;

    // 4.6 递归内侧 (Line 11: boolean inside = check(left.right, right.left);)
    trace.addRecursePrep(`inside = check(left.right: ${left.right?.val ?? 'null'}, right.left: ${right.left?.val ?? 'null'})`, depth);
    steps.push({
      tree: root,
      leftVal: left.val,
      rightVal: right.val,
      match: true,
      result: true,
      mismatchNode: null,
      phase: 'check-pair',
      status: 'check-pair',
      pairType: 'inside',
      decision: `发起内侧递归：check(left.right: ${left.right?.val ?? 'null'}, right.left: ${right.left?.val ?? 'null'})`,
      action: 'recurse-inside',
      message: `深入内侧镜像比对：探索左节点的右孩子与右节点的左孩子。`,
      log: `recurse inside: ${left.right?.val ?? 'null'} vs ${right.left?.val ?? 'null'}`,
      codeLine: L.recurseInside,
      metrics: { '比对方向': '内侧 (L.right vs R.left)' },
      statusBadge: { text: '内侧递归', type: 'info' },
      callTrace: trace.snapshot(),
    });

    const inside = check(left.right, right.left, depth + 1, 'inside');

    // 内侧返回赋值帧 (Line 11: 记录 inside 结果)
    trace.addConditionPass(`inside 结果就绪: ${inside}`, depth);
    steps.push({
      tree: root,
      leftVal: left.val,
      rightVal: right.val,
      match: inside,
      result: inside,
      mismatchNode: inside ? null : mismatchNode,
      phase: inside ? 'check-pair' : 'asymmetric',
      status: inside ? 'check-pair' : 'asymmetric',
      pairType: 'inside',
      decision: `内侧递归返回：inside = ${inside}`,
      action: 'check-pair',
      message: `内侧镜像递归计算完毕，inside = ${inside}。准备汇聚两路判定。`,
      log: `inside returned ${inside}`,
      codeLine: L.insideDone,
      metrics: { '内侧结果 (inside)': `${inside}` },
      statusBadge: { text: `内侧: ${inside}`, type: inside ? 'info' : 'danger' },
      callTrace: trace.snapshot(),
    });

    // 4.7 汇聚返回 (Line 12: return outside && inside;)
    const totalMatch = outside && inside;
    trace.addUnwindCalc(`回到 check(${left.val}, ${right.val}): return outside(${outside}) && inside(${inside}) = ${totalMatch}`, depth);
    steps.push({
      tree: root,
      leftVal: left.val,
      rightVal: right.val,
      match: totalMatch,
      result: totalMatch,
      mismatchNode: totalMatch ? null : mismatchNode,
      phase: totalMatch ? 'check-pair' : 'asymmetric',
      status: totalMatch ? 'check-pair' : 'asymmetric',
      pairType,
      decision: `镜像汇聚：return outside(${outside}) && inside(${inside}) = ${totalMatch}`,
      action: 'check-pair',
      message: `Node(${left.val}) 与 Node(${right.val}) 的内外侧检查均完成，综合结果: ${totalMatch}。向上回溯。`,
      log: `check return: outside && inside = ${totalMatch}`,
      codeLine: L.combine,
      metrics: { '外侧 outside': `${outside}`, '内侧 inside': `${inside}`, '汇聚结果': `${totalMatch}` },
      statusBadge: { text: `汇聚: ${totalMatch}`, type: totalMatch ? 'success' : 'danger' },
      callTrace: trace.snapshot(),
    });

    return totalMatch;
  };

  const finalResult = check(root.left, root.right, 1, 'root');

  trace.addFinalResult(`最终判定: ${finalResult ? '对称 (True)' : '不对称 (False)'}`, 0, undefined, finalResult ? 'True' : 'False');

  // 5. 最终结算帧 (Line 4: return check(root.left, root.right);)
  steps.push({
    tree: root,
    leftVal: null,
    rightVal: null,
    match: finalResult,
    result: finalResult,
    mismatchNode,
    phase: finalResult ? 'symmetric' : 'asymmetric',
    status: finalResult ? 'symmetric' : 'asymmetric',
    decision: finalResult ? '🎉 检查完成！该二叉树完全轴对称 (True)' : '❌ 检查完成！该二叉树不是镜像对称的 (False)',
    action: 'done',
    message: finalResult ? '🎉 检查完成！该二叉树是对称的 (True)。' : '❌ 检查完成！该二叉树不是镜像对称的 (False)。',
    log: finalResult ? '✓ 对称二叉树 (True)' : '✗ 不对称二叉树 (False)',
    codeLine: L.done,
    metrics: { '最终判定': finalResult ? '对称 (True)' : '不对称 (False)', '比对节点对数': pairCount },
    statusBadge: { text: finalResult ? '对称 (True)' : '不对称 (False)', type: finalResult ? 'success' : 'danger' },
    callTrace: trace.snapshot(),
  });

  return steps;
}

// ============================================================
// Stage 2 Step Generator: 队列成对迭代 (Iterative Queue BFS)
// ============================================================
export function buildTSIterativeQueueSteps(root: TreeNode | null): TSStep[] {
  const steps: TSStep[] = [];
  const L = TREE_SYMMETRIC_STAGE2_QUEUE_LINES;

  if (!root) {
    steps.push({
      tree: null,
      leftVal: null,
      rightVal: null,
      match: true,
      result: true,
      mismatchNode: null,
      phase: 'symmetric',
      status: 'symmetric',
      decision: '空二叉树：天然对称',
      action: 'done',
      message: '✅ 空树是对称的。',
      log: '✓ 对称二叉树',
      codeLine: L.entry,
      metrics: { '最终判定': '对称 (True)', '队列大小': 0 },
      statusBadge: { text: '空树对称', type: 'success' },
    });
    return steps;
  }

  // 1. 初始化队列并成对推入根节点的左右孩子
  const queue: (TreeNode | null)[] = [root.left ?? null, root.right ?? null];
  const qVals = (): (number | string)[] => queue.map(n => n ? n.val : 'null');

  steps.push({
    tree: root,
    leftVal: root.left?.val ?? null,
    rightVal: root.right?.val ?? null,
    match: true,
    result: true,
    mismatchNode: null,
    phase: 'init',
    status: 'init',
    queue: qVals(),
    decision: `初始化队列：成对推入根节点的左孩子 (${root.left?.val ?? 'null'}) 与右孩子 (${root.right?.val ?? 'null'})`,
    action: 'init-queue',
    message: `启动迭代双指针校验：使用队列维护成对镜像节点。将 root.left (${root.left?.val ?? 'null'}) 与 root.right (${root.right?.val ?? 'null'}) 成对入队。`,
    log: `queue init: [${root.left?.val ?? 'null'}, ${root.right?.val ?? 'null'}]`,
    codeLine: L.pushRootChildren,
    metrics: { '队列当前大小': queue.length, '待检镜像对': `[${root.left?.val ?? 'null'}, ${root.right?.val ?? 'null'}]` },
    statusBadge: { text: '成对入队', type: 'info' },
  });

  let isSymmetric = true;
  let mismatchNode: number | null = null;

  while (queue.length > 0) {
    const u = queue.shift()!;
    const v = queue.shift()!;
    const uVal = u ? u.val : null;
    const vVal = v ? v.val : null;

    steps.push({
      tree: root,
      leftVal: uVal,
      rightVal: vVal,
      match: true,
      result: true,
      mismatchNode: null,
      phase: 'check-pair',
      status: 'check-pair',
      queue: qVals(),
      currentPair: [uVal ?? 'null', vVal ?? 'null'],
      decision: `队列出队一对镜像节点: u=${uVal ?? 'null'}, v=${vVal ?? 'null'}`,
      action: 'poll-pair',
      message: `从队列头部连续弹出两个镜像节点 u=${uVal ?? 'null'} 与 v=${vVal ?? 'null'} 进行对称性核验。`,
      log: `poll pair: u=${uVal ?? 'null'}, v=${vVal ?? 'null'}`,
      codeLine: L.pollPair,
      metrics: { '出队节点 u': uVal ?? 'null', '出队节点 v': vVal ?? 'null', '剩余队列长度': queue.length },
      statusBadge: { text: `核验 [${uVal ?? 'null'}, ${vVal ?? 'null'}]`, type: 'info' },
    });

    // 1. 双空
    if (u === null && v === null) {
      steps.push({
        tree: root,
        leftVal: null,
        rightVal: null,
        match: true,
        result: true,
        mismatchNode: null,
        phase: 'check-pair',
        status: 'check-pair',
        queue: qVals(),
        decision: 'u 与 v 均为 null，该分支天然对称，继续核验下一对',
        action: 'both-null',
        message: 'u == null && v == null：说明该对称分支触底，继续循环处理队列剩余节点。',
        log: 'both null -> continue',
        codeLine: L.bothNull,
        metrics: { '当前核验': '双空对称', '剩余队列': queue.length },
        statusBadge: { text: '双空匹配', type: 'success' },
      });
      continue;
    }

    // 2. 其一为空或值不等
    if (u === null || v === null || u.val !== v.val) {
      isSymmetric = false;
      mismatchNode = u ? u.val : v!.val;

      steps.push({
        tree: root,
        leftVal: uVal,
        rightVal: vVal,
        match: false,
        result: false,
        mismatchNode,
        phase: 'asymmetric',
        status: 'asymmetric',
        queue: qVals(),
        decision: (u === null || v === null) ? '结构失配！一侧为空另一侧存在节点' : `数值失配！u.val(${u.val}) != v.val(${v.val})`,
        action: 'mismatch',
        message: (u === null || v === null)
          ? `❌ 结构不对称！一个为 ${mismatchNode}，另一个为 null。`
          : `❌ 数值不对称！u 节点值为 ${u!.val}，而镜像 v 节点值为 ${v!.val}。`,
        log: `mismatch: u=${uVal ?? 'null'}, v=${vVal ?? 'null'}`,
        codeLine: L.mismatch,
        metrics: { '失配原因': (u === null || v === null) ? '结构空缺' : '数值不等', '判定结果': '不对称 (False)' },
        statusBadge: { text: '失配即停', type: 'danger' },
      });
      break;
    }

    // 3. 匹配一致，将外侧与内侧成对入队
    queue.push(u.left ?? null, v.right ?? null);
    steps.push({
      tree: root,
      leftVal: u.val,
      rightVal: v.val,
      match: true,
      result: true,
      mismatchNode: null,
      phase: 'check-pair',
      status: 'check-pair',
      queue: qVals(),
      decision: `外侧镜像对入队: [u.left: ${u.left?.val ?? 'null'}, v.right: ${v.right?.val ?? 'null'}]`,
      action: 'push-outside',
      message: `成对外侧入队：将 u 的左孩子与 v 的右孩子按序入队。`,
      log: `push outside: [${u.left?.val ?? 'null'}, ${v.right?.val ?? 'null'}]`,
      codeLine: L.pushOutside,
      metrics: { '入队对': '外侧镜像', '队列长度': queue.length },
      statusBadge: { text: '外侧入队', type: 'info' },
    });

    queue.push(u.right ?? null, v.left ?? null);
    steps.push({
      tree: root,
      leftVal: u.val,
      rightVal: v.val,
      match: true,
      result: true,
      mismatchNode: null,
      phase: 'check-pair',
      status: 'check-pair',
      queue: qVals(),
      decision: `内侧镜像对入队: [u.right: ${u.right?.val ?? 'null'}, v.left: ${v.left?.val ?? 'null'}]`,
      action: 'push-inside',
      message: `成对内侧入队：将 u 的右孩子与 v 的左孩子按序入队。`,
      log: `push inside: [${u.right?.val ?? 'null'}, ${v.left?.val ?? 'null'}]`,
      codeLine: L.pushInside,
      metrics: { '入队对': '内侧镜像', '队列长度': queue.length },
      statusBadge: { text: '内侧入队', type: 'info' },
    });
  }

  // 最终判定
  steps.push({
    tree: root,
    leftVal: null,
    rightVal: null,
    match: isSymmetric,
    result: isSymmetric,
    mismatchNode,
    phase: isSymmetric ? 'symmetric' : 'asymmetric',
    status: isSymmetric ? 'symmetric' : 'asymmetric',
    queue: qVals(),
    decision: isSymmetric ? '🎉 队列已清空且全部镜像节点匹配，二叉树对称 (True)' : '❌ 队列校验发现断层失配，二叉树不对称 (False)',
    action: 'done',
    message: isSymmetric ? '🎉 迭代队列检查完成！该二叉树是对称的 (True)。' : '❌ 检查完成！该二叉树不是镜像对称的 (False)。',
    log: isSymmetric ? '✓ 对称二叉树 (True)' : '✗ 不对称二叉树 (False)',
    codeLine: isSymmetric ? L.returnTrue : L.mismatch,
    metrics: { '最终结果': isSymmetric ? '对称 (True)' : '不对称 (False)' },
    statusBadge: { text: isSymmetric ? '对称 (True)' : '不对称 (False)', type: isSymmetric ? 'success' : 'danger' },
  });

  return steps;
}

// ============================================================
// Stage 3 Step Generator: 静态数组模拟队列 (Static Array Queue)
// ============================================================
export function buildTSStaticArraySteps(root: TreeNode | null): TSStep[] {
  const steps: TSStep[] = [];
  const L = TREE_SYMMETRIC_STAGE3_STATIC_ARRAY_LINES;

  if (!root) {
    steps.push({
      tree: null,
      leftVal: null,
      rightVal: null,
      match: true,
      result: true,
      mismatchNode: null,
      phase: 'symmetric',
      status: 'symmetric',
      decision: '空二叉树：天然对称',
      action: 'done',
      message: '✅ 空树是对称的。',
      log: '✓ 对称二叉树',
      codeLine: L.entry,
      metrics: { '最终判定': '对称 (True)', '静态队列': 'l=0, r=0' },
      statusBadge: { text: '空树对称', type: 'success' },
    });
    return steps;
  }

  const MAXN = 2001;
  const queue: (TreeNode | null)[] = new Array(MAXN);
  let l = 0;
  let r = 0;

  queue[r++] = root.left ?? null;
  queue[r++] = root.right ?? null;

  const getArraySnapshot = (currL: number, currR: number): (number | string)[] => {
    const arr: (number | string)[] = [];
    for (let i = 0; i < Math.min(currR + 2, 10); i++) {
      if (i < currR) {
        const item = queue[i];
        arr.push(item ? item.val : 'null');
      } else {
        arr.push('—');
      }
    }
    return arr;
  };

  steps.push({
    tree: root,
    leftVal: root.left?.val ?? null,
    rightVal: root.right?.val ?? null,
    match: true,
    result: true,
    mismatchNode: null,
    phase: 'init',
    status: 'init',
    decision: `连续内存初始化：queue[0]=${root.left?.val ?? 'null'}, queue[1]=${root.right?.val ?? 'null'} (l=0, r=2)`,
    action: 'static-init',
    message: `左神 Class 036 招牌：采用连续数组 queue[MAXN] 与双指针 l=0, r=0 避免对象频繁 GC。初始化推入 root.left 与 root.right。`,
    log: `static queue init: l=${l}, r=${r}`,
    codeLine: L.pushRootChildren,
    staticQueueState: {
      array: getArraySnapshot(l, r),
      l,
      r,
      u: root.left?.val ?? 'null',
      v: root.right?.val ?? 'null',
    },
    metrics: { '队列双指针': `l=${l}, r=${r}`, '待处理元素数': r - l, '内存优化': '零 GC 极速' },
    statusBadge: { text: '静态队列就绪', type: 'info' },
  });

  let isSymmetric = true;
  let mismatchNode: number | null = null;

  while (l < r) {
    const u = queue[l++];
    const v = queue[l++];
    const uVal = u ? u.val : null;
    const vVal = v ? v.val : null;

    steps.push({
      tree: root,
      leftVal: uVal,
      rightVal: vVal,
      match: true,
      result: true,
      mismatchNode: null,
      phase: 'check-pair',
      status: 'check-pair',
      decision: `双指针弹出一对: u=queue[${l - 2}]=${uVal ?? 'null'}, v=queue[${l - 1}]=${vVal ?? 'null'}`,
      action: 'poll-pair',
      message: `从静态数组弹出连续两个节点：u (${uVal ?? 'null'}) 与 v (${vVal ?? 'null'})，指针推进 l = ${l}。`,
      log: `poll: u=${uVal ?? 'null'}, v=${vVal ?? 'null'} (l=${l}, r=${r})`,
      codeLine: L.pollPair,
      staticQueueState: {
        array: getArraySnapshot(l, r),
        l,
        r,
        u: uVal ?? 'null',
        v: vVal ?? 'null',
      },
      metrics: { '出队对': `[${uVal ?? 'null'}, ${vVal ?? 'null'}]`, '双指针状态': `l=${l}, r=${r}` },
      statusBadge: { text: `核验 [${uVal ?? 'null'}, ${vVal ?? 'null'}]`, type: 'info' },
    });

    if (u === null && v === null) {
      steps.push({
        tree: root,
        leftVal: null,
        rightVal: null,
        match: true,
        result: true,
        mismatchNode: null,
        phase: 'check-pair',
        status: 'check-pair',
        decision: 'u 与 v 均为 null，该分支对称，继续处理',
        action: 'both-null',
        message: 'u 与 v 均为 null，对称性成立。',
        log: 'both null -> continue',
        codeLine: L.bothNull,
        staticQueueState: {
          array: getArraySnapshot(l, r),
          l,
          r,
          u: 'null',
          v: 'null',
        },
        metrics: { '核验结论': '双空对称', '剩余待检': (r - l) / 2 },
        statusBadge: { text: '双空匹配', type: 'success' },
      });
      continue;
    }

    if (u === null || v === null || u.val !== v.val) {
      isSymmetric = false;
      mismatchNode = u ? u.val : v!.val;

      steps.push({
        tree: root,
        leftVal: uVal,
        rightVal: vVal,
        match: false,
        result: false,
        mismatchNode,
        phase: 'asymmetric',
        status: 'asymmetric',
        decision: (u === null || v === null) ? '结构失配！一侧为空另一侧存在' : `数值失配！u(${u.val}) != v(${v.val})`,
        action: 'mismatch',
        message: (u === null || v === null)
          ? `❌ 结构不对称！一个为 ${mismatchNode}，另一个为 null。`
          : `❌ 数值不对称！左 ${u!.val} != 右 ${v!.val}。`,
        log: `mismatch: u=${uVal ?? 'null'}, v=${vVal ?? 'null'}`,
        codeLine: L.mismatch,
        staticQueueState: {
          array: getArraySnapshot(l, r),
          l,
          r,
          u: uVal ?? 'null',
          v: vVal ?? 'null',
        },
        metrics: { '失配原因': (u === null || v === null) ? '结构空缺' : '数值不等', '判定结果': '不对称 (False)' },
        statusBadge: { text: '失配即停', type: 'danger' },
      });
      break;
    }

    // 入队外侧
    queue[r++] = u.left ?? null;
    queue[r++] = v.right ?? null;
    steps.push({
      tree: root,
      leftVal: u.val,
      rightVal: v.val,
      match: true,
      result: true,
      mismatchNode: null,
      phase: 'check-pair',
      status: 'check-pair',
      decision: `外侧推入静态数组: queue[${r - 2}]=${u.left?.val ?? 'null'}, queue[${r - 1}]=${v.right?.val ?? 'null'} (r=${r})`,
      action: 'push-outside',
      message: `成对外侧入队：将 u.left 与 v.right 写入连续内存槽位，r 指针递增至 ${r}。`,
      log: `push outside: r=${r}`,
      codeLine: L.pushOutside,
      staticQueueState: {
        array: getArraySnapshot(l, r),
        l,
        r,
        u: u.left?.val ?? 'null',
        v: v.right?.val ?? 'null',
      },
      metrics: { '连续写入': '外侧镜像对', '指针范围': `[l=${l}, r=${r})` },
      statusBadge: { text: '外侧写入', type: 'info' },
    });

    // 入队内侧
    queue[r++] = u.right ?? null;
    queue[r++] = v.left ?? null;
    steps.push({
      tree: root,
      leftVal: u.val,
      rightVal: v.val,
      match: true,
      result: true,
      mismatchNode: null,
      phase: 'check-pair',
      status: 'check-pair',
      decision: `内侧推入静态数组: queue[${r - 2}]=${u.right?.val ?? 'null'}, queue[${r - 1}]=${v.left?.val ?? 'null'} (r=${r})`,
      action: 'push-inside',
      message: `成对内侧入队：将 u.right 与 v.left 写入连续内存槽位，r 指针递增至 ${r}。`,
      log: `push inside: r=${r}`,
      codeLine: L.pushInside,
      staticQueueState: {
        array: getArraySnapshot(l, r),
        l,
        r,
        u: u.right?.val ?? 'null',
        v: v.left?.val ?? 'null',
      },
      metrics: { '连续写入': '内侧镜像对', '指针范围': `[l=${l}, r=${r})` },
      statusBadge: { text: '内侧写入', type: 'info' },
    });
  }

  steps.push({
    tree: root,
    leftVal: null,
    rightVal: null,
    match: isSymmetric,
    result: isSymmetric,
    mismatchNode,
    phase: isSymmetric ? 'symmetric' : 'asymmetric',
    status: isSymmetric ? 'symmetric' : 'asymmetric',
    decision: isSymmetric ? '🎉 静态数组队列 l==r 清空完毕，整树完全轴对称 (True)' : '❌ 静态数组检验发现不对称，返回 False',
    action: 'done',
    message: isSymmetric ? '🎉 静态数组队列检查完成！该二叉树是对称的 (True)。' : '❌ 检查完成！该二叉树不是镜像对称的 (False)。',
    log: isSymmetric ? '✓ 对称二叉树 (True)' : '✗ 不对称二叉树 (False)',
    codeLine: isSymmetric ? L.returnTrue : L.mismatch,
    staticQueueState: {
      array: getArraySnapshot(l, r),
      l,
      r,
      u: null,
      v: null,
    },
    metrics: { '最终结果': isSymmetric ? '对称 (True)' : '不对称 (False)', '双指针终态': `l=${l}, r=${r}` },
    statusBadge: { text: isSymmetric ? '对称 (True)' : '不对称 (False)', type: isSymmetric ? 'success' : 'danger' },
  });

  return steps;
}

// ============================================================
// 辅助解析与默认用例 (Legacy 兼容包装)
// ============================================================
function parseAndBuild(inputs?: Record<string, any>): TreeNode | null {
  const raw = inputs?.['input-tree'] ?? inputs?.tree ?? '1, 2, 2, 3, 4, 4, 3';
  const arr = parseTreeArray(raw, [1, 2, 2, 3, 4, 4, 3]);
  return buildTreeFromArr(arr);
}

/** Legacy 兼容包装函数 (保证 tree-algorithms.test.ts 零退化通过) */
export function buildTSSteps(root: TreeNode | null): TSStep[] {
  return buildTSRecursiveSteps(root);
}

// ============================================================
// 表现层渲染辅助器 (Card 1 & Card 2 Presenters)
// ============================================================

/** Card 1: 树画布渲染 */
function renderTreeSymmetricCanvasForStep(container: HTMLElement, step: TSStep, primaryColor: string = '#0284c7'): void {
  const isDone = step.action === 'done';
  const allTreeNodes = collectTreeValues(step.tree);
  const highlights: number[] = [];
  if (step.leftVal != null) highlights.push(step.leftVal);
  if (step.rightVal != null) highlights.push(step.rightVal);

  let current = step.mismatchNode;
  let visitedNodes: number[] = [];

  if (isDone) {
    if (step.result) {
      // 对称成功完成态：整树全量翡翠绿常驻高亮，根节点金色焦点
      visitedNodes = allTreeNodes;
      if (step.tree) {
        current = step.tree.val;
      }
    } else {
      // 不对称失配态：保持 mismatchNode 为警戒红
      current = step.mismatchNode;
    }
  }

  TreeCanvasAdapter.renderTree(container, {
    tree: step.tree,
    current,
    highlightedNodes: highlights,
    visitedNodes,
    primaryColor: step.mismatchNode != null ? '#ef4444' : (isDone && step.result ? '#fbbf24' : primaryColor),
    secondaryColor: '#38bdf8',
    visitedColor: '#34d399',
  });
}

/** Card 2 缓冲器：Stage 1 递归镜像面板 */
function renderStage1RecursionBufferHtml(step: TSStep): string {
  const lVal = step.leftVal != null ? `左: ${step.leftVal}` : '左: null';
  const rVal = step.rightVal != null ? `右: ${step.rightVal}` : '右: null';

  return `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #166534;">当前递归比对节点对:</span>
        <span style="font-size: 12px; font-weight: 700; font-family: monospace; color: #15803d;">
          ${lVal} &nbsp;⟺&nbsp; ${rVal} &nbsp;(${step.pairType === 'outside' ? '外侧' : step.pairType === 'inside' ? '内侧' : '根下'})
        </span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px;">
        <span style="color: #64748b;">• 外侧比对: left.left 与 right.right</span>
        <span style="color: #64748b;">• 内侧比对: left.right 与 right.left</span>
      </div>
    </div>
  `;
}

/** Card 2 缓冲器：Stage 2 队列管道面板 */
function renderStage2QueueBufferHtml(step: TSStep): string {
  const q = step.queue ?? [];
  const chips = q.length > 0
    ? q.map((v, idx) => {
        const isHead = idx < 2;
        const bg = isHead ? '#dbeafe' : '#f1f5f9';
        const color = isHead ? '#1e40af' : '#475569';
        const border = isHead ? '#93c5fd' : '#cbd5e1';
        return `<span style="padding: 2px 7px; background: ${bg}; color: ${color}; border: 1px solid ${border}; border-radius: 4px; font-size: 11px; font-weight: 700; font-family: monospace;">${v}</span>`;
      }).join('')
    : '<span style="color:#94a3b8; font-size:11px;">[ 队列已清空 ]</span>';

  return `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #1e40af;">当前队列头部核验对:</span>
        <span style="font-size: 12px; font-weight: 700; font-family: monospace; color: #1d4ed8;">
          ${step.currentPair ? `u=${step.currentPair[0]}, v=${step.currentPair[1]}` : '准备中...'}
        </span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 11px; font-weight: 700; color: #475569;">成对队列管道 [u.left, v.right, u.right, v.left]:</span>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; min-height: 36px; align-items: center;">
          ${chips}
        </div>
      </div>
    </div>
  `;
}

/** Card 2 缓冲器：Stage 3 静态数组面板 */
function renderStage3StaticArrayBufferHtml(step: TSStep): string {
  const s = step.staticQueueState;
  const arr = s?.array ?? [];
  const cells = arr.map((v, i) => {
    const isL = i === s?.l;
    const isR = i === s?.r;
    let ptr = '&nbsp;';
    if (isL && isR) ptr = '<span style="color:#ef4444; font-weight:800;">l/r</span>';
    else if (isL) ptr = '<span style="color:#0284c7; font-weight:800;">l↓</span>';
    else if (isR) ptr = '<span style="color:#10b981; font-weight:800;">r↓</span>';

    return `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
        <div style="height: 12px; line-height: 12px; font-size: 9px; font-family: monospace;">${ptr}</div>
        <div style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: ${i >= (s?.l ?? 0) && i < (s?.r ?? 0) ? '#e0f2fe' : '#ffffff'}; border: 1px solid #cbd5e1; border-radius: 6px; font-family: monospace; font-size: 11px; font-weight: 700;">
          ${v}
        </div>
        <span style="font-size: 9px; color: #94a3b8; font-family: monospace;">[${i}]</span>
      </div>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #92400e;">左神静态连续数组 queue[MAXN]:</span>
        <span style="font-size: 12px; font-weight: 700; font-family: monospace; color: #b45309;">
          [l=${s?.l ?? 0}, r=${s?.r ?? 0}) | 待检: ${Math.max(0, (s?.r ?? 0) - (s?.l ?? 0))}
        </span>
      </div>
      <div style="display: flex; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow-x: auto;">
        ${cells}
      </div>
    </div>
  `;
}

/** Card 2 全景指标诊断看板外壳 */
function renderTreeSymmetricMetricsShell(step: TSStep, bufferHtml: string, tipHtml: string): string {
  const lVal = step.leftVal !== null ? `${step.leftVal}` : '—';
  const rVal = step.rightVal !== null ? `${step.rightVal}` : '—';
  const resText = step.result ? '符合镜像对称' : '失配 (False)';
  const resColor = step.result ? '#16a34a' : '#ef4444';

  return `
    <div style="display: flex; flex-direction: column; gap: 10px; padding: 12px 14px; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">左镜像节点</div>
          <div style="font-size: 14px; font-weight: 800; color: #2563eb; margin-top: 2px;">${lVal}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">右镜像节点</div>
          <div style="font-size: 14px; font-weight: 800; color: #0d9488; margin-top: 2px;">${rVal}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">对称性判定</div>
          <div style="font-size: 13px; font-weight: 800; color: ${resColor}; margin-top: 2px;">${resText}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">时间复杂度</div>
          <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">O(N) · O(H)</div>
        </div>
      </div>

      <div style="padding: 10px; background: #fafafa; border: 1px solid #e5e7eb; border-radius: 8px;">
        ${bufferHtml}
      </div>

      <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f8fafc; border-left: 3px solid #3b82f6; border-radius: 0 6px 6px 0; font-size: 12px; color: #334155;">
        <span>💡</span>
        <span>${tipHtml}</span>
      </div>
    </div>
  `;
}

// ============================================================
// 声明式算法注册中心配置 (Declarative Algorithm Visualizer)
// ============================================================
export const treeSymmetricVisualizer = registerDeclarativeAlgorithm<TSStep>({
  id: 'tree-symmetric',
  aliases: ['leetcode-101', 'symmetric-tree'],
  name: '对称二叉树',
  category: 'tree',
  icon: '⚖️',
  difficulty: 1,
  levelOrder: 4,
  learningGoal: '掌握镜像二叉树双指针同时向下递归遍历外侧与内侧节点的算法设计模式',
  problemHtml: TREE_SYMMETRIC_PROBLEM_HTML,
  analysisHtml: TREE_SYMMETRIC_ANALYSIS_HTML,

  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 双指针镜像递归 (Recursive Mirror DFS)',
      shortName: '镜像递归',
      num: 1,
      timeBadge: 'O(N) · O(H)',
      theme: 'bg-emerald' as const,
      badge: {
        mode: '深度优先 · 外侧与内侧双路递归比对',
        complexity: 'O(N) · O(H) 递归栈',
      },
      card1Title: '🌳 二叉树拓扑与镜像比对沙盘',
      card2Title: '⚖️ 镜像递归调用与内外侧状态监视器',
      codeLanguages: TREE_SYMMETRIC_STAGE1_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildTSRecursiveSteps(root);
      },
      renderCanvas: (container: HTMLElement, step: TSStep) => renderTreeSymmetricCanvasForStep(container, step, '#10b981'),
      renderCustomMetrics: (container: HTMLElement, step: TSStep) => {
        container.innerHTML = `
          <div style="display: flex; flex-direction: column; height: 100%; gap: 6px; font-size: 11px;">
            <div style="display: flex; flex-direction: column; gap: 4px; flex-shrink: 0;">
              ${renderStage1RecursionBufferHtml(step)}
            </div>
            <div class="ts-trace-host" style="flex: 1; min-height: 120px; overflow: hidden;"></div>
          </div>
        `;
        if (step.callTrace) {
          const traceHost = container.querySelector('.ts-trace-host') as HTMLElement | null;
          if (traceHost) {
            RecursiveCallTraceAdapter.render(traceHost, step.callTrace, {
              title: '📜 镜像递归调用推演与归约栈',
              theme: 'light',
              maxHeight: '100%',
              showTerminalHeader: true,
            });
          }
        }
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 队列成对迭代 (Iterative Queue BFS)',
      shortName: '成对队列',
      num: 2,
      timeBadge: 'O(N) · O(W)',
      theme: 'bg-blue' as const,
      badge: {
        mode: '广度优先 · 镜像成对入队与出队校验',
        complexity: 'O(N) · O(W) 队列',
      },
      card1Title: '🚪 队列成对出入拓扑沙盘',
      card2Title: '🔄 成对队列管道与失配阻断监视器',
      codeLanguages: TREE_SYMMETRIC_STAGE2_QUEUE_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildTSIterativeQueueSteps(root);
      },
      renderCanvas: (container: HTMLElement, step: TSStep) => renderTreeSymmetricCanvasForStep(container, step, '#3b82f6'),
      renderCustomMetrics: (container: HTMLElement, step: TSStep) => {
        container.innerHTML = renderTreeSymmetricMetricsShell(
          step,
          renderStage2QueueBufferHtml(step),
          '成对迭代：每次连续弹出 u, v，将外侧对 (u.left, v.right) 与内侧对 (u.right, v.left) 按序推入。'
        );
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 静态数组模拟队列 (Static Array Queue)',
      shortName: '静态数组',
      num: 3,
      timeBadge: 'O(N) · 零GC',
      theme: 'bg-amber' as const,
      badge: {
        mode: '连续内存 · 双指针模拟队列零 GC 极速',
        complexity: 'O(N) · O(W) 常数优',
      },
      card1Title: '⚡ 连续内存队列拓扑沙盘',
      card2Title: '🏎️ queue[MAXN] 连续槽位与双指针监视器',
      codeLanguages: TREE_SYMMETRIC_STAGE3_STATIC_ARRAY_CODE,
      buildSteps: (inputs: Record<string, any>) => {
        const root = parseAndBuild(inputs);
        return buildTSStaticArraySteps(root);
      },
      renderCanvas: (container: HTMLElement, step: TSStep) => renderTreeSymmetricCanvasForStep(container, step, '#f59e0b'),
      renderCustomMetrics: (container: HTMLElement, step: TSStep) => {
        container.innerHTML = renderTreeSymmetricMetricsShell(
          step,
          renderStage3StaticArrayBufferHtml(step),
          '左神 Class 036 招牌：queue[MAXN] 连续数组配合 l, r 双指针，彻底消灭 GC 开销！'
        );
      },
    },
  ],

  // Fallback
  codeLanguages: TREE_SYMMETRIC_STAGE1_CODE,
  buildSteps: (inputs) => {
    const root = parseAndBuild(inputs);
    return buildTSRecursiveSteps(root);
  },
  generateSteps: (inputs) => {
    const root = parseAndBuild(inputs);
    return buildTSRecursiveSteps(root);
  },
  renderCanvas: (container, step) => {
    renderTreeSymmetricCanvasForStep(container, step, '#10b981');
  },

  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '1, 2, 2, 3, 4, 4, 3',
      width: '160px',
      placeholder: '1, 2, 2, 3, 4, 4, 3',
    },
  ],
  presets: [
    {
      label: '完全对称 [1, 2, 2, 3, 4, 4, 3]',
      values: { 'input-tree': '1, 2, 2, 3, 4, 4, 3' },
      description: '标准轴对称完全二叉树',
    },
    {
      label: '结构不对称 [1, 2, 2, null, 3, null, 3]',
      values: { 'input-tree': '1, 2, 2, null, 3, null, 3' },
      description: '缺失节点不对称',
    },
    {
      label: '数值不对称 [1, 2, 3]',
      values: { 'input-tree': '1, 2, 3' },
      description: '节点值 2 != 3',
    },
    {
      label: '单节点根树 [1]',
      values: { 'input-tree': '1' },
      description: '单节点天然对称',
    },
  ],
});
