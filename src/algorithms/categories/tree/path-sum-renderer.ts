/**
 * 路径总和可视化器 (Path Sum & Path Sum II · LeetCode 112 & 113 / Class 037 Code03)
 * 采用顶层声明式架构与多阶段演化体系 (Multi-Stage Evolution)
 *
 * 核心演化体系:
 *   Stage 1: 递归减法回溯 (Recursive Subtraction DFS · 单解判定 LC 112)
 *   Stage 2: 显式回溯现场恢复与全解收集 (Backtracking Path Restoration · 全路径收集 LC 113 / Class 037 Code03)
 *   Stage 3: 迭代 BFS 双队列 (Iterative BFS Queues · 广度优先层序求和)
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { HighlightTarget, StepBase } from '../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import { cloneStateDepTree } from '../../../core/strategies/tree-clone';
import {
  PATH_SUM_PROBLEM_HTML,
  PATH_SUM_ANALYSIS_HTML,
  PATH_SUM_CODE_LANGUAGES,
} from './path-sum-problem-content';
import {
  PATH_SUM_STAGE1_CODE,
  PATH_SUM_STAGE1_LINES,
  PATH_SUM_STAGE2_BACKTRACK_CODE,
  PATH_SUM_STAGE2_BACKTRACK_LINES,
  PATH_SUM_STAGE3_BFS_CODE,
  PATH_SUM_STAGE3_BFS_LINES,
} from './path-sum-stage-codes';
import {
  RecursiveCallTraceAdapter,
  RecursiveCallTraceBuilder,
  CallTraceSnapshot,
} from '../../../core/renderers/adapters/recursive-call-trace-adapter';

// ============================================================
// 类型契约与状态定义 (Domain Step Contract)
// ============================================================
export interface PSStep extends StepBase {
  tree: TreeNode | null;
  current: number | null;
  targetSum: number;
  currentSum: number;
  remain: number;
  path: number[];
  allPaths: number[][];
  found: boolean;
  decision: string;
  action: 'enter' | 'check-leaf' | 'match' | 'leave' | 'done' | string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'info' | 'warning' | 'success' | 'danger' };
  callTrace?: CallTraceSnapshot;

  /** Stage 3 BFS 专用 */
  nodeQueue?: (number | string)[];
  sumQueue?: number[];

  /** 双重不变量保障与高亮支持 */
  visitedNodes?: number[];
  highlightedNodes?: number[];
}

export const PATH_SUM_CODE_LINES = PATH_SUM_STAGE1_LINES;

function cloneTree(node: TreeNode | null): TreeNode | null {
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

export function buildPSSteps(root: TreeNode | null, targetSum: number): PSStep[] {
  const steps: PSStep[] = [];
  const L = PATH_SUM_STAGE1_LINES;
  const currentPath: number[] = [];
  const allPaths: number[][] = [];
  let found = false;

  const workingTree = cloneTree(root);
  const trace = new RecursiveCallTraceBuilder();
  const rootText = workingTree ? `${workingTree.val}` : 'null';
  trace.addHeader(`hasPathSum(${rootText}, targetSum=${targetSum})`, 0, '<- 根调用判定');

  // Step 0: 函数入口帧 (Line 2: hasPathSum(root, targetSum))
  steps.push({
    tree: cloneTree(workingTree),
    current: null,
    targetSum,
    currentSum: 0,
    remain: targetSum,
    path: [],
    allPaths: [],
    found: false,
    decision: workingTree
      ? `进入函数：hasPathSum(root: ${workingTree.val}, targetSum: ${targetSum})`
      : `进入函数：hasPathSum(root: null, targetSum: ${targetSum})`,
    action: 'enter',
    message: workingTree
      ? `初始化路径搜索：目标和 targetSum = ${targetSum}，从根节点 ${workingTree.val} 开始 DFS 减法递归。`
      : '空树，准备执行判空检查。',
    log: workingTree ? `hasPathSum(root: ${workingTree.val}, targetSum: ${targetSum})` : 'hasPathSum(null)',
    metrics: { '目标和 targetSum': targetSum, '已收集路径': 0 },
    codeLine: L.entry,
    statusBadge: { text: '算法启动', type: 'info' },
    callTrace: trace.snapshot(),
  });

  // Step 1: 判空检查 (Line 3: if (root == null) return false;)
  if (!workingTree) {
    trace.addConditionHit('① root == null √ 命中! -> return false', 0);
    trace.addReturnLeaf('return false', 0);
    trace.addFinalResult('最终返回: false', 0, undefined, 'false');
    steps.push({
      tree: null,
      current: null,
      targetSum,
      currentSum: 0,
      remain: targetSum,
      path: [],
      allPaths: [],
      found: false,
      decision: '判空检查：树为空 (root == null)，返回 false',
      action: 'done',
      message: '树为空，无合法根到叶路径，直接返回 false。',
      log: 'root == null -> return false',
      metrics: { '目标和 targetSum': targetSum, '有效路径数': 0 },
      codeLine: L.nullCheck,
      statusBadge: { text: '空树返回 false', type: 'warning' },
      callTrace: trace.snapshot(),
    });
    return steps;
  }

  // 根非空判定帧 (Line 3: 判空为 false，继续向下)
  trace.addConditionPass(`① root != null (Node(${workingTree.val}))，继续向下`, 0);
  steps.push({
    tree: cloneTree(workingTree),
    current: workingTree.val,
    targetSum,
    currentSum: 0,
    remain: targetSum,
    path: [],
    allPaths: [],
    found: false,
    decision: `根节点非空 (Node(${workingTree.val}))，判空条件不满足，继续向下检查是否为叶子节点`,
    action: 'enter',
    message: `根节点 Node(${workingTree.val}) != null，继续执行叶子判断。`,
    log: `root != null -> proceed to leaf check`,
    metrics: { '根节点状态': `Node(${workingTree.val}) 非空`, '当前差额': targetSum },
    codeLine: L.nullCheck,
    statusBadge: { text: '根非空', type: 'info' },
    callTrace: trace.snapshot(),
  });

  function dfs(node: TreeNode | null, curRemain: number, depth: number): boolean {
    if (!node) return false;

    currentPath.push(node.val);
    const curSum = targetSum - curRemain + node.val;
    const isLeaf = !node.left && !node.right;

    // 递归子调用入口帧 (Line 2: 非根节点进入时)
    if (depth > 0) {
      trace.addHeader(`hasPathSum(node: ${node.val}, remain: ${curRemain})`, depth, `<- 深入 Node(${node.val})`);
      steps.push({
        tree: cloneTree(workingTree),
        current: node.val,
        targetSum,
        currentSum: curSum,
        remain: curRemain,
        path: [...currentPath],
        allPaths: allPaths.map((p) => [...p]),
        found,
        decision: `递归进入：hasPathSum(node: ${node.val}, targetSum: ${curRemain})`,
        action: 'enter',
        message: `进入子调用 hasPathSum，考察以 Node(${node.val}) 为根的子树是否满足剩余和 ${curRemain}。`,
        log: `enter dfs(${node.val}, remain=${curRemain})`,
        metrics: { '当前节点': node.val, '当前路径累加和': curSum, '本层需求': curRemain },
        codeLine: L.entry,
        statusBadge: { text: `进入 ${node.val}`, type: 'info' },
        callTrace: trace.snapshot(),
      });

      // 判空判定帧 (Line 3: 节点非空)
      trace.addConditionPass(`① node != null (Node(${node.val}))`, depth);
      steps.push({
        tree: cloneTree(workingTree),
        current: node.val,
        targetSum,
        currentSum: curSum,
        remain: curRemain,
        path: [...currentPath],
        allPaths: allPaths.map((p) => [...p]),
        found,
        decision: `判空检查：Node(${node.val}) != null，判空条件不满足，继续向下`,
        action: 'enter',
        message: `节点 Node(${node.val}) 存在，继续执行叶子判断。`,
        log: `node ${node.val} != null -> proceed`,
        metrics: { '当前节点': node.val, '判空结果': '非空' },
        codeLine: L.nullCheck,
        statusBadge: { text: '节点非空', type: 'info' },
        callTrace: trace.snapshot(),
      });
    }

    // 叶子节点检查 (Line 4: if (root.left == null && root.right == null))
    if (isLeaf) {
      trace.addConditionHit(`② 叶子节点判定 √ 命中! (Node(${node.val}) 无左右孩子)`, depth);
      const isMatch = node.val === curRemain;
      steps.push({
        tree: cloneTree(workingTree),
        current: node.val,
        targetSum,
        currentSum: curSum,
        remain: curRemain,
        path: [...currentPath],
        allPaths: allPaths.map((p) => [...p]),
        found,
        decision: `到达叶子节点 Node(${node.val})，判断其值是否等于剩余需求差额: ${node.val} == ${curRemain}`,
        action: 'check-leaf',
        message: `考察叶子节点 Node(${node.val})：当前路径已到达终点，检查是否满足和为目标和。`,
        log: `leaf check: ${node.val} == ${curRemain}`,
        metrics: { '当前节点': `叶子 ${node.val}`, '节点值': node.val, '剩余差额': curRemain },
        codeLine: L.leafCheck,
        statusBadge: { text: `叶子 ${node.val}`, type: 'info' },
        callTrace: trace.snapshot(),
      });

      // 叶子值比较与命中 (Line 5: return root.val == targetSum;)
      if (isMatch) {
        found = true;
        allPaths.push([...currentPath]);
        trace.addReturnLeaf(`return ${node.val} == ${curRemain} (true) ★ 命中解!`, depth);
        steps.push({
          tree: cloneTree(workingTree),
          current: node.val,
          targetSum,
          currentSum: targetSum,
          remain: 0,
          path: [...currentPath],
          allPaths: allPaths.map((p) => [...p]),
          found: true,
          decision: `🎉 命中目标解！叶子节点值 ${node.val} == 剩余需求 ${curRemain}，返回 true！`,
          action: 'match',
          message: `🎯 命中解！从根到叶路径 [${currentPath.join(' -> ')}] 累加和恰好等于 ${targetSum}，返回 true！`,
          log: `⭐ MATCH: [${currentPath.join(' -> ')}] = ${targetSum}`,
          metrics: { '当前节点': node.val, '状态': '命中目标解', '有效路径数': allPaths.length },
          codeLine: L.match,
          statusBadge: { text: '命中目标解', type: 'success' },
          callTrace: trace.snapshot(),
        });
        currentPath.pop();
        return true;
      } else {
        trace.addReturnLeaf(`return ${node.val} == ${curRemain} (false) × 不匹配`, depth);
        steps.push({
          tree: cloneTree(workingTree),
          current: node.val,
          targetSum,
          currentSum: curSum,
          remain: curRemain - node.val,
          path: [...currentPath],
          allPaths: allPaths.map((p) => [...p]),
          found,
          decision: `叶子不匹配：节点值 ${node.val} != 剩余差额 ${curRemain}，返回 false`,
          action: 'check-leaf',
          message: `叶子节点不匹配：节点值 ${node.val} 与所需 ${curRemain} 不符，本路径无效，返回 false。`,
          log: `leaf mismatch: ${node.val} != ${curRemain} -> false`,
          metrics: { '当前节点': node.val, '状态': '叶子和不匹配' },
          codeLine: L.match,
          statusBadge: { text: '叶子不匹配', type: 'warning' },
          callTrace: trace.snapshot(),
        });
        currentPath.pop();
        return false;
      }
    }

    // 非叶子节点判定帧 (Line 4 条件为假)
    trace.addConditionPass(`② 非叶子节点 (Node(${node.val}) 有子节点)，继续递归探索左右子树`, depth);
    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      targetSum,
      currentSum: curSum,
      remain: curRemain,
      path: [...currentPath],
      allPaths: allPaths.map((p) => [...p]),
      found,
      decision: `Node(${node.val}) 不是叶子节点，叶子特判条件为 false，向下递归检查左右子树`,
      action: 'check-leaf',
      message: `Node(${node.val}) 内部有子分支，必须向下递归左右子树求和。`,
      log: `not leaf node ${node.val} -> proceed to branches`,
      metrics: { '当前节点': node.val, '节点类型': '内部非叶节点' },
      codeLine: L.leafCheck,
      statusBadge: { text: '非叶节点', type: 'info' },
      callTrace: trace.snapshot(),
    });

    const nextRemain = curRemain - node.val;
    let left = false;

    // 递归左子树 (Line 7: boolean left = hasPathSum(root.left, targetSum - root.val);)
    trace.addRecursePrep(`left = hasPathSum(root.left: ${node.left ? node.left.val : 'null'}, remain: ${nextRemain})`, depth);
    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      targetSum,
      currentSum: curSum,
      remain: nextRemain,
      path: [...currentPath],
      allPaths: allPaths.map((p) => [...p]),
      found,
      decision: `沿左分支递归：hasPathSum(node.left: ${node.left ? node.left.val : 'null'}, remain: ${nextRemain})`,
      action: 'recurse-left',
      message: `深入左子树探索，需求差额更新为 targetSum - ${node.val} = ${nextRemain}。`,
      log: `recurse left: ${node.left ? node.left.val : 'null'} (remain=${nextRemain})`,
      codeLine: L.recurseLeft,
      metrics: { '当前节点': node.val, '下一分支': node.left ? `左孩子 ${node.left.val}` : 'null', '传递差额': nextRemain },
      statusBadge: { text: '向左递归', type: 'info' },
      callTrace: trace.snapshot(),
    });

    left = dfs(node.left, nextRemain, depth + 1);

    // 左子树返回赋值帧 (Line 7: left 结果就绪)
    trace.addConditionPass(`left 结果就绪: ${left}`, depth);
    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      targetSum,
      currentSum: curSum,
      remain: nextRemain,
      path: [...currentPath],
      allPaths: allPaths.map((p) => [...p]),
      found,
      decision: `左分支递归返回：left = ${left}`,
      action: 'recurse-left',
      message: `以左孩子为根的子树搜索完毕，left = ${left}。${left ? '左路已找到满足路径！' : '左路未找到，继续探索右路。'}`,
      log: `left returned ${left}`,
      codeLine: L.leftDone,
      metrics: { '当前节点': node.val, '左分支判定 (left)': `${left}` },
      statusBadge: { text: `左路: ${left}`, type: left ? 'success' : 'info' },
      callTrace: trace.snapshot(),
    });

    let right = false;
    if (!left) {
      // 递归右子树 (Line 8: boolean right = hasPathSum(root.right, targetSum - root.val);)
      trace.addRecursePrep(`right = hasPathSum(root.right: ${node.right ? node.right.val : 'null'}, remain: ${nextRemain})`, depth);
      steps.push({
        tree: cloneTree(workingTree),
        current: node.val,
        targetSum,
        currentSum: curSum,
        remain: nextRemain,
        path: [...currentPath],
        allPaths: allPaths.map((p) => [...p]),
        found,
        decision: `沿右分支递归：hasPathSum(node.right: ${node.right ? node.right.val : 'null'}, remain: ${nextRemain})`,
        action: 'recurse-right',
        message: `深入右子树探索，需求差额更新为 targetSum - ${node.val} = ${nextRemain}。`,
        log: `recurse right: ${node.right ? node.right.val : 'null'} (remain=${nextRemain})`,
        codeLine: L.recurseRight,
        metrics: { '当前节点': node.val, '下一分支': node.right ? `右孩子 ${node.right.val}` : 'null', '传递差额': nextRemain },
        statusBadge: { text: '向右递归', type: 'info' },
        callTrace: trace.snapshot(),
      });

      right = dfs(node.right, nextRemain, depth + 1);

      // 右子树返回赋值帧 (Line 8: right 结果就绪)
      trace.addConditionPass(`right 结果就绪: ${right}`, depth);
      steps.push({
        tree: cloneTree(workingTree),
        current: node.val,
        targetSum,
        currentSum: curSum,
        remain: nextRemain,
        path: [...currentPath],
        allPaths: allPaths.map((p) => [...p]),
        found,
        decision: `右分支递归返回：right = ${right}`,
        action: 'recurse-right',
        message: `以右孩子为根的子树搜索完毕，right = ${right}。准备执行或逻辑归约。`,
        log: `right returned ${right}`,
        codeLine: L.rightDone,
        metrics: { '当前节点': node.val, '右分支判定 (right)': `${right}` },
        statusBadge: { text: `右路: ${right}`, type: right ? 'success' : 'info' },
        callTrace: trace.snapshot(),
      });
    }

    // 逻辑或归约返回 (Line 9: return left || right;)
    const combined = left || right;
    trace.addUnwindCalc(`回到 hasPathSum(node: ${node.val}): return left(${left}) || right(${right}) = ${combined}`, depth);
    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      targetSum,
      currentSum: curSum,
      remain: curRemain,
      path: [...currentPath],
      allPaths: allPaths.map((p) => [...p]),
      found,
      decision: `归约返回：left(${left}) || right(${right}) = ${combined}`,
      action: 'leave',
      message: `Node(${node.val}) 左右子树搜索完毕，综合判定结果: ${combined}。回溯向父节点返回。`,
      log: `return left || right = ${combined}`,
      codeLine: L.combine,
      metrics: { '左结果 (left)': `${left}`, '右结果 (right)': `${right}`, '综合返回': `${combined}` },
      statusBadge: { text: `归约: ${combined}`, type: combined ? 'success' : 'info' },
      callTrace: trace.snapshot(),
    });

    currentPath.pop();
    return combined;
  }

  const finalResult = dfs(workingTree, targetSum, 0);

  const allTreeVals = collectTreeValues(workingTree);
  const matchedPath = found ? (allPaths[0] ?? []) : [];

  trace.addFinalResult(`最终判定: ${finalResult ? '存在路径 (true)' : '无路径 (false)'}`, 0, undefined, finalResult ? 'true' : 'false');

  // 最终结算帧 (Line 10: done)
  steps.push({
    tree: cloneTree(workingTree),
    current: workingTree ? workingTree.val : null,
    targetSum,
    currentSum: found ? targetSum : 0,
    remain: 0,
    path: matchedPath,
    allPaths: allPaths.map((p) => [...p]),
    visitedNodes: allTreeVals,
    highlightedNodes: matchedPath,
    found: finalResult,
    decision: finalResult
      ? `🎉 路径总和判定成功！找到满足目标和 ${targetSum} 的有效路径 [${matchedPath.join(' -> ')}]`
      : `探索结束，未找到根到叶和为 ${targetSum} 的路径 (返回 false)`,
    action: 'done',
    message: finalResult
      ? `🎉 判定结果: true！成功找到和为 ${targetSum} 的路径 [${matchedPath.join(' -> ')}]。`
      : `判定结果: false。全树探索完毕，无任何根到叶路径之和为 ${targetSum}。`,
    log: `done hasPathSum=${finalResult}`,
    metrics: { '最终判定': finalResult ? 'true' : 'false', '目标和': targetSum },
    codeLine: L.done,
    statusBadge: { text: finalResult ? '存在路径 (true)' : '无路径 (false)', type: finalResult ? 'success' : 'danger' },
    callTrace: trace.snapshot(),
  });

  return steps;
}

// ============================================================
// Stage 2 Step Generator: 回溯现场恢复与全解收集 (LC 113 / Class 037 Code03)
// ============================================================
export function buildPathSumStage2BacktrackSteps(root: TreeNode | null, targetSum: number): PSStep[] {
  const steps: PSStep[] = [];
  const L = PATH_SUM_STAGE2_BACKTRACK_LINES;
  const currentPath: number[] = [];
  const allPaths: number[][] = [];
  const workingTree = cloneTree(root);

  steps.push({
    tree: cloneTree(workingTree),
    current: null,
    targetSum,
    currentSum: 0,
    remain: targetSum,
    path: [],
    allPaths: [],
    found: false,
    decision: `全解收集启动：收集所有根到叶和为 ${targetSum} 的路径 (LC 113 / Class 037)`,
    action: 'enter',
    message: workingTree
      ? `左神 Class 037 经典回溯：共享 path 列表，深入节点时 path.add()，回溯时显式 path.remove() 现场恢复！`
      : '空树，直接返回空解集 []。',
    log: workingTree ? `pathSumII(root: ${workingTree.val}, targetSum: ${targetSum})` : 'empty tree -> []',
    metrics: { '目标和 targetSum': targetSum, '已收集路径数': 0 },
    codeLine: L.entry,
    statusBadge: { text: '回溯全解启动', type: 'info' },
  });

  if (!workingTree) {
    steps.push({
      tree: null,
      current: null,
      targetSum,
      currentSum: 0,
      remain: targetSum,
      path: [],
      allPaths: [],
      found: false,
      decision: '特判返回：树为空，返回空列表 []',
      action: 'done',
      message: '树为空，无解，返回空列表 []。',
      log: 'return []',
      metrics: { '有效路径数': 0 },
      codeLine: L.nullCheck,
      statusBadge: { text: '空列表返回', type: 'warning' },
    });
    return steps;
  }

  function dfs(node: TreeNode, curRemain: number): void {
    currentPath.push(node.val);
    const nextRemain = curRemain - node.val;
    const curSum = targetSum - nextRemain;

    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      targetSum,
      currentSum: curSum,
      remain: nextRemain,
      path: [...currentPath],
      allPaths: allPaths.map((p) => [...p]),
      found: allPaths.length > 0,
      decision: `path.add(${node.val})：压入回溯栈，当前路径 [${currentPath.join(' -> ')}]，剩余差额 ${nextRemain}`,
      action: 'enter',
      message: `节点 ${node.val} 入栈，路径当前和为 ${curSum}，剩余所需为 ${nextRemain}。`,
      log: `push ${node.val} -> path: [${currentPath.join(' -> ')}]`,
      metrics: { '当前节点': node.val, '当前路径': `[${currentPath.join(', ')}]`, '剩余差额': nextRemain },
      codeLine: L.dfsEntry,
      statusBadge: { text: `入栈 ${node.val}`, type: 'info' },
    });

    const isLeaf = !node.left && !node.right;

    if (isLeaf) {
      if (nextRemain === 0) {
        allPaths.push([...currentPath]);
        steps.push({
          tree: cloneTree(workingTree),
          current: node.val,
          targetSum,
          currentSum: targetSum,
          remain: 0,
          path: [...currentPath],
          allPaths: allPaths.map((p) => [...p]),
          found: true,
          decision: `🎉 到达叶子节点 ${node.val} 且 remain == 0！深拷贝当前路径加入答案集 ans.add(new ArrayList<>(path))`,
          action: 'match',
          message: `🎯 命中有效路径！复制当前路径 [${currentPath.join(' -> ')}] 存入解集，目前已累计 ${allPaths.length} 条有效解！`,
          log: `⭐ COLLECT SOL ${allPaths.length}: [${currentPath.join(' -> ')}]`,
          metrics: { '当前节点': node.val, '已收集路径数': allPaths.length, '最新解': `[${currentPath.join(', ')}]` },
          codeLine: L.collectPath,
          statusBadge: { text: `收集解 #${allPaths.length}`, type: 'success' },
        });
      } else {
        steps.push({
          tree: cloneTree(workingTree),
          current: node.val,
          targetSum,
          currentSum: curSum,
          remain: nextRemain,
          path: [...currentPath],
          allPaths: allPaths.map((p) => [...p]),
          found: allPaths.length > 0,
          decision: `叶子节点 ${node.val} 和不符 (remain=${nextRemain} != 0)，无法作为有效解`,
          action: 'check-leaf',
          message: `到达叶子节点 ${node.val}，但总和不等于 ${targetSum}，不予收录。`,
          log: `leaf mismatch: remain=${nextRemain}`,
          metrics: { '当前节点': node.val, '差额': nextRemain },
          codeLine: L.leafCheck,
          statusBadge: { text: '和不符', type: 'warning' },
        });
      }
    } else {
      if (node.left) {
        steps.push({
          tree: cloneTree(workingTree),
          current: node.val,
          targetSum,
          currentSum: curSum,
          remain: nextRemain,
          path: [...currentPath],
          allPaths: allPaths.map((p) => [...p]),
          found: allPaths.length > 0,
          decision: `向左子树递归：dfs(node.left: ${node.left.val}, remain: ${nextRemain})`,
          action: 'recurse-left',
          message: `向左子树继续寻找路径。`,
          log: `recurse left: ${node.left.val}`,
          codeLine: L.recurseLeft,
          metrics: { '当前节点': node.val, '递归': `左孩子 ${node.left.val}` },
          statusBadge: { text: '向左递归', type: 'info' },
        });
        dfs(node.left, nextRemain);
      }
      if (node.right) {
        steps.push({
          tree: cloneTree(workingTree),
          current: node.val,
          targetSum,
          currentSum: curSum,
          remain: nextRemain,
          path: [...currentPath],
          allPaths: allPaths.map((p) => [...p]),
          found: allPaths.length > 0,
          decision: `向右子树递归：dfs(node.right: ${node.right.val}, remain: ${nextRemain})`,
          action: 'recurse-right',
          message: `向右子树继续寻找路径。`,
          log: `recurse right: ${node.right.val}`,
          codeLine: L.recurseRight,
          metrics: { '当前节点': node.val, '递归': `右孩子 ${node.right.val}` },
          statusBadge: { text: '向右递归', type: 'info' },
        });
        dfs(node.right, nextRemain);
      }
    }

    // 显式回溯现场恢复
    currentPath.pop();
    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      targetSum,
      currentSum: curSum - node.val,
      remain: curRemain,
      path: [...currentPath],
      allPaths: allPaths.map((p) => [...p]),
      found: allPaths.length > 0,
      decision: `🔄 现场恢复：path.remove(path.size() - 1)，将节点 ${node.val} 从路径栈弹出！`,
      action: 'backtrack',
      message: `节点 ${node.val} 探索完成，回溯弹出，恢复路径栈为 [${currentPath.join(' -> ')}]。`,
      log: `backtrack: pop ${node.val}`,
      metrics: { '回溯弹出节点': node.val, '恢复后路径': `[${currentPath.join(', ')}]` },
      codeLine: L.backtrack,
      statusBadge: { text: `回溯弹出 ${node.val}`, type: 'warning' },
    });
  }

  dfs(workingTree, targetSum);

  const allTreeVals = collectTreeValues(workingTree);
  const allSolutionNodes = Array.from(new Set(allPaths.flat()));

  steps.push({
    tree: cloneTree(workingTree),
    current: workingTree ? workingTree.val : null,
    targetSum,
    currentSum: 0,
    remain: 0,
    path: allSolutionNodes,
    allPaths: allPaths.map((p) => [...p]),
    visitedNodes: allTreeVals,
    highlightedNodes: allSolutionNodes,
    found: allPaths.length > 0,
    decision: `🎉 全解回溯搜索圆满完成！共收集 ${allPaths.length} 条有效路径`,
    action: 'done',
    message: `🎉 回溯搜索结束！共找到 ${allPaths.length} 条根到叶总和为 ${targetSum} 的有效路径。`,
    log: `done backtrack allPaths.length=${allPaths.length}`,
    metrics: { '总有效路径数': allPaths.length, '有效路径数': allPaths.length, '算法复杂度': 'O(N) · O(H)' },
    codeLine: L.returnAns,
    statusBadge: { text: `收集完成 (${allPaths.length} 解)`, type: 'success' },
  });

  return steps;
}

// ============================================================
// Stage 3 Step Generator: 迭代 BFS 双队列 (Iterative BFS Queues)
// ============================================================
export function buildPathSumStage3BfsSteps(root: TreeNode | null, targetSum: number): PSStep[] {
  const steps: PSStep[] = [];
  const L = PATH_SUM_STAGE3_BFS_LINES;
  const workingTree = cloneTree(root);

  if (!workingTree) {
    steps.push({
      tree: null,
      current: null,
      targetSum,
      currentSum: 0,
      remain: targetSum,
      path: [],
      allPaths: [],
      found: false,
      decision: '特判返回：树为空，直接返回 false',
      action: 'done',
      message: '树为空，无合法路径，返回 false。',
      log: 'empty tree -> return false',
      metrics: { '有效路径数': 0 },
      codeLine: L.nullCheck,
      statusBadge: { text: '空树返回 false', type: 'warning' },
    });
    return steps;
  }

  const nodeQ: TreeNode[] = [workingTree];
  const sumQ: number[] = [workingTree.val];
  const nodeToPath = new Map<TreeNode, number[]>();
  nodeToPath.set(workingTree, [workingTree.val]);

  const getQVals = (): (number | string)[] => nodeQ.map((n) => n.val);
  const getSumVals = (): number[] => [...sumQ];
  const allTreeVals = collectTreeValues(workingTree);

  steps.push({
    tree: cloneTree(workingTree),
    current: workingTree.val,
    targetSum,
    currentSum: workingTree.val,
    remain: targetSum - workingTree.val,
    path: [workingTree.val],
    allPaths: [],
    visitedNodes: [workingTree.val],
    found: false,
    decision: `双队列初始化：根节点 ${workingTree.val} 入 nodeQ，根节点值 ${workingTree.val} 入 sumQ`,
    action: 'init',
    nodeQueue: getQVals(),
    sumQueue: getSumVals(),
    message: `启动广度优先双队列求和：根节点 ${workingTree.val} 及其初始累加和 ${workingTree.val} 分别入队。`,
    log: `BFS init: nodeQ=[${workingTree.val}], sumQ=[${workingTree.val}]`,
    codeLine: L.initQueues,
    metrics: { '当前队列大小': 1, '根节点值': workingTree.val },
    statusBadge: { text: '双队列就绪', type: 'info' },
  });

  let found = false;

  while (nodeQ.length > 0) {
    const cur = nodeQ.shift()!;
    const curSum = sumQ.shift()!;
    const curPath = nodeToPath.get(cur) ?? [cur.val];

    steps.push({
      tree: cloneTree(workingTree),
      current: cur.val,
      targetSum,
      currentSum: curSum,
      remain: targetSum - curSum,
      path: [...curPath],
      allPaths: [],
      found: false,
      decision: `出队考察：节点 ${cur.val} 出队，当前累计路径和 = ${curSum} (差额: ${targetSum - curSum})`,
      action: 'poll',
      nodeQueue: getQVals(),
      sumQueue: getSumVals(),
      message: `从队列头部取出节点 ${cur.val}，对应根到此节点的累计和为 ${curSum}。`,
      log: `poll node=${cur.val}, curSum=${curSum}`,
      codeLine: L.poll,
      metrics: { '出队节点': cur.val, '当前累计和': curSum, '剩余差额': targetSum - curSum },
      statusBadge: { text: `出队 ${cur.val}`, type: 'info' },
    });

    const isLeaf = !cur.left && !cur.right;

    if (isLeaf && curSum === targetSum) {
      found = true;
      steps.push({
        tree: cloneTree(workingTree),
        current: cur.val,
        targetSum,
        currentSum: curSum,
        remain: 0,
        path: [...curPath],
        allPaths: [[...curPath]],
        visitedNodes: allTreeVals,
        highlightedNodes: [...curPath],
        found: true,
        decision: `🎉 发现叶子节点 ${cur.val} 且累计和恰好等于目标和 ${targetSum}！立刻返回 true`,
        action: 'match',
        nodeQueue: getQVals(),
        sumQueue: getSumVals(),
        message: `🎯 命中目标！叶子节点 ${cur.val} 处累计和达到 ${targetSum}，BFS 快速短路返回 true！`,
        log: `⭐ BFS MATCH at leaf ${cur.val}: sum = ${curSum}`,
        metrics: { '命中节点': cur.val, '累计和': curSum, '判定': 'true' },
        codeLine: L.match,
        statusBadge: { text: '命中目标 (true)', type: 'success' },
      });

      steps.push({
        tree: cloneTree(workingTree),
        current: workingTree.val,
        targetSum,
        currentSum: curSum,
        remain: 0,
        path: [...curPath],
        allPaths: [[...curPath]],
        visitedNodes: allTreeVals,
        highlightedNodes: [...curPath],
        found: true,
        decision: `🎉 BFS 搜索成功！找到根到叶和为 ${targetSum} 的有效路径 [${curPath.join(' ➔ ')}]`,
        action: 'done',
        nodeQueue: [],
        sumQueue: [],
        message: `🎯 命中目标！叶子节点 ${cur.val} 处累计和达到 ${targetSum}，BFS 搜索圆满完成！`,
        log: `⭐ BFS MATCH done: [${curPath.join(' ➔ ')}] = ${targetSum}`,
        codeLine: L.match,
        metrics: { '命中节点': cur.val, '有效路径': curPath.join(' -> '), '判定': 'true' },
        statusBadge: { text: '命中目标 (true)', type: 'success' },
      });
      break;
    }

    if (cur.left) {
      nodeQ.push(cur.left);
      sumQ.push(curSum + cur.left.val);
      nodeToPath.set(cur.left, [...curPath, cur.left.val]);
      steps.push({
        tree: cloneTree(workingTree),
        current: cur.val,
        targetSum,
        currentSum: curSum,
        remain: targetSum - curSum,
        path: [...curPath],
        allPaths: [],
        found: false,
        decision: `左孩子 ${cur.left.val} 入队，累计和 ${curSum} + ${cur.left.val} = ${curSum + cur.left.val} 入 sumQ`,
        action: 'push-left',
        nodeQueue: getQVals(),
        sumQueue: getSumVals(),
        message: `将左孩子 ${cur.left.val} 及其新累计和 ${curSum + cur.left.val} 推入双队列。`,
        log: `push left ${cur.left.val}, newSum=${curSum + cur.left.val}`,
        codeLine: L.pushLeft,
        metrics: { '入队左孩子': cur.left.val, '新累计和': curSum + cur.left.val },
        statusBadge: { text: `入队左 ${cur.left.val}`, type: 'info' },
      });
    }

    if (cur.right) {
      nodeQ.push(cur.right);
      sumQ.push(curSum + cur.right.val);
      nodeToPath.set(cur.right, [...curPath, cur.right.val]);
      steps.push({
        tree: cloneTree(workingTree),
        current: cur.val,
        targetSum,
        currentSum: curSum,
        remain: targetSum - curSum,
        path: [...curPath],
        allPaths: [],
        found: false,
        decision: `右孩子 ${cur.right.val} 入队，累计和 ${curSum} + ${cur.right.val} = ${curSum + cur.right.val} 入 sumQ`,
        action: 'push-right',
        nodeQueue: getQVals(),
        sumQueue: getSumVals(),
        message: `将右孩子 ${cur.right.val} 及其新累计和 ${curSum + cur.right.val} 推入双队列。`,
        log: `push right ${cur.right.val}, newSum=${curSum + cur.right.val}`,
        codeLine: L.pushRight,
        metrics: { '入队右孩子': cur.right.val, '新累计和': curSum + cur.right.val },
        statusBadge: { text: `入队右 ${cur.right.val}`, type: 'info' },
      });
    }
  }

  if (!found) {
    steps.push({
      tree: cloneTree(workingTree),
      current: workingTree.val,
      targetSum,
      currentSum: 0,
      remain: targetSum,
      path: [],
      allPaths: [],
      visitedNodes: allTreeVals,
      found: false,
      decision: `队列已全部清空，未发现任何满足条件的根到叶路径，返回 false`,
      action: 'done',
      nodeQueue: [],
      sumQueue: [],
      message: `广度优先层序遍历结束，未检测到和为 ${targetSum} 的叶子路径，返回 false。`,
      log: 'BFS done: not found -> return false',
      codeLine: L.returnFalse,
      metrics: { '最终判定': 'false', '目标和': targetSum },
      statusBadge: { text: '无路径 (false)', type: 'danger' },
    });
  }

  return steps;
}

// ============================================================
// 统一表现层渲染器 (Card 1 + Card 2 领域契约)
// ============================================================
function renderPathSumCanvas(container: HTMLElement, step: PSStep): void {
  const isDone = step.action === 'done';
  const allTreeVals = collectTreeValues(step.tree);
  const matchedNodes = step.highlightedNodes && step.highlightedNodes.length > 0
    ? step.highlightedNodes
    : step.path;

  let current = step.current;
  let visitedNodes = step.visitedNodes;

  if (isDone && step.tree) {
    if (current === null) {
      current = step.tree.val;
    }
    if (!visitedNodes || visitedNodes.length === 0) {
      visitedNodes = allTreeVals;
    }
  }

  TreeCanvasAdapter.renderTree(container, {
    tree: step.tree,
    current,
    visitedNodes: visitedNodes && visitedNodes.length > 0 ? visitedNodes : undefined,
    secondaryHighlightedNodes: matchedNodes && matchedNodes.length > 0 ? matchedNodes : undefined,
    primaryColor: step.found ? '#10b981' : '#fbbf24',
    secondaryColor: '#93c5fd',
    visitedColor: '#34d399',
  });
}

/** Card 2: Stage 2 回溯现场恢复与全解收集监视器 */
function renderStage2CustomMetrics(container: HTMLElement, step: PSStep): void {
  const pathChips =
    step.path.length > 0
      ? step.path
          .map(
            (v, idx) => `
          <div style="display: flex; align-items: center;">
            <span style="padding: 2px 8px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: monospace;">${v}</span>
            ${idx < step.path.length - 1 ? '<span style="color: #94a3b8; font-size: 10px; margin: 0 4px;">➔</span>' : ''}
          </div>`
          )
          .join('')
      : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">路径为空 (初始或已回溯至根外)</span>';

  const allPathsHtml =
    step.allPaths.length > 0
      ? step.allPaths
          .map(
            (p, idx) => `
          <div style="display: flex; align-items: center; gap: 6px; padding: 2px 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
            <span style="font-size: 10.5px; font-weight: 700; color: #166534;">解 ${idx + 1}:</span>
            <span style="font-size: 11px; font-family: monospace; color: #15803d; font-weight: 600;">[${p.join(' ➔ ')}]</span>
          </div>`
          )
          .join('')
      : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">等待首条匹配路径...</span>';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #475569; padding: 6px 0;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
        <div style="padding: 4px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 10px; color: #64748b;">目标和:</span>
          <span style="font-weight: 700; font-size: 13px; color: #0f172a;">${step.targetSum}</span>
        </div>
        <div style="padding: 4px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 10px; color: #64748b;">已收录解数:</span>
          <span style="font-weight: 700; font-size: 13px; color: #166534;">${step.allPaths.length} 条</span>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 11px; font-weight: 700; color: #334155;">当前路径栈 (DFS 现场):</span>
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          ${pathChips}
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 11px; font-weight: 700; color: #334155;">已收集有效路径总集 (LC 113):</span>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          ${allPathsHtml}
        </div>
      </div>
      <div style="padding: 8px 10px; background: #f1f5f9; border-radius: 6px; font-size: 11px; color: #475569;">
        <div style="font-weight: 700; color: #1e293b; margin-bottom: 2px;">🧭 决策推演: ${step.decision}</div>
        <div>${step.message}</div>
      </div>
    </div>
  `;
}

/** Card 2: Stage 3 迭代 BFS 双队列管道监视器 */
function renderStage3CustomMetrics(container: HTMLElement, step: PSStep): void {
  const pathChips =
    step.path.length > 0
      ? step.path
          .map(
            (v, idx) => `
          <div style="display: flex; align-items: center;">
            <span style="padding: 2px 8px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: monospace;">${v}</span>
            ${idx < step.path.length - 1 ? '<span style="color: #94a3b8; font-size: 10px; margin: 0 4px;">➔</span>' : ''}
          </div>`
          )
          .join('')
      : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">路径为空</span>';

  const qChips = (step.nodeQueue || [])
    .map(
      (v) =>
        `<span style="padding: 2px 7px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 4px; font-weight: 700; color: #166534; font-size: 11px; font-family: monospace;">${v}</span>`
    )
    .join('');
  const sumChips = (step.sumQueue || [])
    .map(
      (v) =>
        `<span style="padding: 2px 7px; background: #fefce8; border: 1px solid #fde047; border-radius: 4px; font-weight: 700; color: #854d0e; font-size: 11px; font-family: monospace;">${v}</span>`
    )
    .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #475569; padding: 6px 0;">
      <div style="display: flex; flex-direction: column; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: #166534; min-width: 70px;">nodeQueue:</span>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">${qChips || '<span style="color:#94a3b8; font-style:italic;">空</span>'}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: #854d0e; min-width: 70px;">sumQueue:</span>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">${sumChips || '<span style="color:#94a3b8; font-style:italic;">空</span>'}</div>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 11px; font-weight: 700; color: #334155;">当前考察路径:</span>
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          ${pathChips}
        </div>
      </div>
      <div style="padding: 8px 10px; background: #f1f5f9; border-radius: 6px; font-size: 11px; color: #475569;">
        <div style="font-weight: 700; color: #1e293b; margin-bottom: 2px;">🧭 决策推演: ${step.decision}</div>
        <div>${step.message}</div>
      </div>
    </div>
  `;
}

// ============================================================
// 声明式算法注册 (Multi-Stage Evolution)
// ============================================================
export const pathSumVisualizer = registerDeclarativeAlgorithm<PSStep>({
  id: 'path-sum',
  aliases: ['tree-037-path-sum-ii'],
  name: '路径总和与收集所有路径',
  category: 'tree',
  icon: '🪜',
  badge: {
    mode: '多阶段演化: 递归减法 · 回溯全解 · 队列BFS',
    complexity: 'O(N) · O(H)',
  },
  card1Title: '📊 二叉树拓扑与当前回溯路径沙盘',
  card2Title: '🧭 路径累加和与解集收集监视器',
  card2Desc: '实时当前路径栈、剩余差额及已收集解集二维看板',
  legend: [
    { label: '当前访问节点', color: '#fbbf24' },
    { label: '当前路径栈', color: '#93c5fd' },
    { label: '命中目标解', color: '#16a34a' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1',
      width: '180px',
      placeholder: '5, 4, 8, 11...',
    },
    {
      id: 'input-target-sum',
      label: '目标和 targetSum',
      type: 'number',
      defaultValue: 22,
      width: '50px',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 1: 经典双解 (sum=22)',
      values: {
        'input-tree': '5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1',
        'input-target-sum': 22,
      },
      description: '两条有效路径 [5,4,11,2] 和 [5,8,4,5]',
    },
    {
      label: '单解路径示例 (sum=10)',
      values: {
        'input-tree': '1, 2, 3, 4, 5, 6, 7',
        'input-target-sum': 10,
      },
      description: '满二叉树路径 [1, 3, 6]',
    },
    {
      label: '无匹配过大目标 (sum=100)',
      values: {
        'input-tree': '1, 2, 3',
        'input-target-sum': 100,
      },
      description: '搜索完全探索但无解',
    },
  ],
  metrics: [
    { id: 'cur-sum', label: '当前路径累加和', color: '#2563eb' },
    { id: 'remain-diff', label: '剩余所需差值', color: '#f59e0b' },
    { id: 'found-status', label: '有效判定 / 路径数', color: '#16a34a' },
  ],
  codeLanguages: PATH_SUM_CODE_LANGUAGES,
  problemHtml: PATH_SUM_PROBLEM_HTML,
  analysisHtml: PATH_SUM_ANALYSIS_HTML,

  // 核心多阶段体系
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 递归减法回溯 (Recursive Subtraction DFS)',
      shortName: '递归减法',
      num: 1,
      badge: {
        mode: '递归减法 · O(H)',
        complexity: 'O(N) · O(H)',
      },
      card1Title: '📊 递归深入与差额减法拓扑沙盘',
      card2Title: '🧭 路径剩余差额与叶子判定监视器',
      card2Desc: '自顶向下扣减 remain 并在叶子节点检测相等',
      codeLanguages: PATH_SUM_STAGE1_CODE,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-tree'] || inputs?.['tree'] || '5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1';
        const arr = parseTreeArray(raw, [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1]);
        const root = buildTree(arr);
        const target = parseInt(String(inputs?.['input-target-sum'] ?? inputs?.['targetSum'] ?? '22'), 10);
        return buildPSSteps(root, target);
      },
      renderCanvas: (container, step) => renderPathSumCanvas(container, step),
      renderCustomMetrics: (container, step) => {
        container.innerHTML = `
          <div style="display: flex; flex-direction: column; height: 100%; gap: 6px; font-size: 11px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; flex-shrink: 0;">
              <div style="padding: 4px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 10px; color: #64748b;">当前节点:</span>
                <span style="font-weight: 700; font-size: 12px; color: #2563eb;">${step.current != null ? `Node(${step.current})` : '空'}</span>
              </div>
              <div style="padding: 4px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 10px; color: #64748b;">剩余需求 (remain):</span>
                <span style="font-weight: 700; font-size: 12px; color: #f59e0b;">${step.remain}</span>
              </div>
            </div>
            <div class="ps-trace-host" style="flex: 1; min-height: 120px; overflow: hidden;"></div>
          </div>
        `;
        if (step.callTrace) {
          const traceHost = container.querySelector('.ps-trace-host') as HTMLElement | null;
          if (traceHost) {
            RecursiveCallTraceAdapter.render(traceHost, step.callTrace, {
              title: '📜 路径总和减法回溯推演栈',
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
      name: '阶段 2: 回溯现场恢复与全解收集 (Backtracking Path Restoration)',
      shortName: '回溯全解',
      num: 2,
      badge: {
        mode: '回溯恢复 · LC 113',
        complexity: 'O(N) · O(H)',
      },
      card1Title: '🌲 DFS 回溯路径与现场恢复拓扑沙盘',
      card2Title: '🧭 共享路径栈与全解收集监视器',
      card2Desc: '入栈深入、命中收录、左右递归后显式弹出恢复现场',
      codeLanguages: PATH_SUM_STAGE2_BACKTRACK_CODE,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-tree'] || inputs?.['tree'] || '5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1';
        const arr = parseTreeArray(raw, [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1]);
        const root = buildTree(arr);
        const target = parseInt(String(inputs?.['input-target-sum'] ?? inputs?.['targetSum'] ?? '22'), 10);
        return buildPathSumStage2BacktrackSteps(root, target);
      },
      renderCanvas: (container, step) => renderPathSumCanvas(container, step),
      renderCustomMetrics: (container, step) => renderStage2CustomMetrics(container, step),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 迭代 BFS 双队列 (Iterative BFS Queues)',
      shortName: '队列BFS',
      num: 3,
      badge: {
        mode: '双队列 · 迭代BFS',
        complexity: 'O(N) · O(W)',
      },
      card1Title: '🌊 广度优先层序求和拓扑沙盘',
      card2Title: '🧭 双队列管道与层序累计和监视器',
      card2Desc: 'nodeQueue 与 sumQueue 同步出队入队',
      codeLanguages: PATH_SUM_STAGE3_BFS_CODE,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-tree'] || inputs?.['tree'] || '5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1';
        const arr = parseTreeArray(raw, [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1]);
        const root = buildTree(arr);
        const target = parseInt(String(inputs?.['input-target-sum'] ?? inputs?.['targetSum'] ?? '22'), 10);
        return buildPathSumStage3BfsSteps(root, target);
      },
      renderCanvas: (container, step) => renderPathSumCanvas(container, step),
      renderCustomMetrics: (container, step) => renderStage3CustomMetrics(container, step),
    },
  ],

  // 向后兼容兜底
  generateSteps: (inputs) => {
    const raw = inputs?.['input-tree'] || inputs?.['tree'] || '5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1';
    const arr = parseTreeArray(raw, [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1]);
    const root = buildTree(arr);
    const target = parseInt(String(inputs?.['input-target-sum'] ?? inputs?.['targetSum'] ?? '22'), 10);
    return buildPSSteps(root, target);
  },
  buildSteps: (inputs) => {
    const raw = inputs?.['input-tree'] || inputs?.['tree'] || '5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1';
    const arr = parseTreeArray(raw, [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1]);
    const root = buildTree(arr);
    const target = parseInt(String(inputs?.['input-target-sum'] ?? inputs?.['targetSum'] ?? '22'), 10);
    return buildPSSteps(root, target);
  },
  renderCanvas: (container, step) => renderPathSumCanvas(container, step),
});
