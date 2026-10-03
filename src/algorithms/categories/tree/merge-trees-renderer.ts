/**
 * LeetCode 617: 合并二叉树 (Merge Two Binary Trees)
 * 采用顶层声明式架构与多阶段演化标准 (Multi-Stage Evolution)
 *
 * 核心多阶段演化体系:
 *   Stage 1: 递归 DFS 同步下潜 (Simultaneous DFS, O(min(M, N)))
 *   Stage 2: 迭代 BFS 队列同步合并 (Iterative BFS Queue, O(min(M, N)))
 */

import { parseNumberList } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeNode, buildTreeFromArr } from './tree-template';
import { cloneStateDepTree } from '../../../core/strategies/tree-clone';
import {
  MERGE_TREES_STAGE1_CODES,
  MERGE_TREES_STAGE1_LINES,
  MERGE_TREES_STAGE2_CODES,
  MERGE_TREES_STAGE2_LINES,
} from './merge-trees-stage-codes';
import {
  MERGE_TREES_PROBLEM_HTML,
  MERGE_TREES_ANALYSIS_HTML,
} from './merge-trees-problem-content';

export interface MergeTreesStep {
  // 向后兼容字段
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  sum: number | null;
  val1: number | null;
  val2: number | null;
  message: string;
  log: string;
  codeLine?: number | Record<string, number>;

  // 现代声明式与多树高亮增强字段
  tree1: TreeNode | null;
  tree2: TreeNode | null;
  mergedTree: TreeNode | null;
  focus1: number | null;
  focus2: number | null;
  focusMerged: number | null;
  tree1Visited: Set<number>;
  tree2Visited: Set<number>;
  highlightedMergedVals: Set<number>;
  graftedVals?: Set<number>;
  metrics?: Record<string, string>;
  queueState?: string[];
  opType: 'init' | 'check' | 'add' | 'graft' | 'recurse_left' | 'recurse_right' | 'complete';
}

function cloneTree(node: TreeNode | null): TreeNode | null {
  return cloneStateDepTree(node);
}

/**
 * 递归收集二叉树中所有非空节点值
 */
export function collectAllTreeVals(node: TreeNode | null, out: Set<number> = new Set()): Set<number> {
  if (!node) return out;
  out.add(node.val);
  if (node.left) collectAllTreeVals(node.left, out);
  if (node.right) collectAllTreeVals(node.right, out);
  return out;
}

/**
 * 将逗号分隔的输入字符串安全解析为二叉树层序数组
 * 支持 'null' 标识空节点
 */
export function parseTreeInput(inputStr: any, defaultVals: (number | null)[]): (number | null)[] {
  if (typeof inputStr !== 'string') {
    if (Array.isArray(inputStr)) return inputStr;
    return defaultVals;
  }
  const trimmed = inputStr.trim();
  if (!trimmed) return [];

  const rawTokens = trimmed
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .split(/[,，\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (rawTokens.length === 0) return [];

  return rawTokens.map((t) => {
    if (t.toLowerCase() === 'null' || t === '#') return null;
    const n = Number(t);
    return isNaN(n) ? null : n;
  });
}

// ----------------------------------------------------
// Stage 1: 递归 DFS 同步下潜 (Simultaneous DFS)
// ----------------------------------------------------
export function buildMergeTreesDfsSteps(
  tree1Arr: (number | null)[],
  tree2Arr: (number | null)[]
): MergeTreesStep[] {
  const steps: MergeTreesStep[] = [];
  const lines = MERGE_TREES_STAGE1_LINES;

  const root1 = buildTreeFromArr(tree1Arr);
  const root2 = buildTreeFromArr(tree2Arr);

  const initialTree1 = cloneTree(root1);
  const initialTree2 = cloneTree(root2);

  const tree1Visited = new Set<number>();
  const tree2Visited = new Set<number>();
  const completedVals = new Set<number>();
  const graftedVals = new Set<number>();

  if (root1) tree1Visited.add(root1.val);
  if (root2) tree2Visited.add(root2.val);

  // 1. 初始化入口帧
  steps.push({
    tree: null,
    current: null,
    tree1: cloneTree(initialTree1),
    tree2: cloneTree(initialTree2),
    mergedTree: null,
    depth: 0,
    sum: null,
    val1: root1 ? root1.val : null,
    val2: root2 ? root2.val : null,
    focus1: root1 ? root1.val : null,
    focus2: root2 ? root2.val : null,
    focusMerged: null,
    tree1Visited: new Set(tree1Visited),
    tree2Visited: new Set(tree2Visited),
    highlightedMergedVals: new Set(),
    graftedVals: new Set(),
    message: `准备开始合并：树 1 根节点 [${root1?.val ?? '空'}] 与 树 2 根节点 [${root2?.val ?? '空'}]`,
    log: '开始 DFS 递归合并两棵二叉树',
    codeLine: lines.entry,
    opType: 'init',
  });

  // 边界：两树皆空
  if (!root1 && !root2) {
    steps.push({
      tree: null,
      current: null,
      tree1: null,
      tree2: null,
      mergedTree: null,
      depth: 0,
      sum: null,
      val1: null,
      val2: null,
      focus1: null,
      focus2: null,
      focusMerged: null,
      tree1Visited: new Set(),
      tree2Visited: new Set(),
      highlightedMergedVals: new Set(),
      graftedVals: new Set(),
      message: '两棵输入树皆为空，合并结果为 null',
      log: '两树均为空，直接返回 null',
      codeLine: lines.check1,
      opType: 'complete',
    });
    return steps;
  }

  let liveMergedRoot: TreeNode | null = null;

  const dfs = (
    n1: TreeNode | null,
    n2: TreeNode | null,
    depth: number,
    parent?: TreeNode,
    isLeft?: boolean
  ): TreeNode | null => {
    // 检查树 1 是否为空
    if (!n1) {
      if (n2) tree2Visited.add(n2.val);
      const grafted = cloneTree(n2);
      if (grafted) {
        if (!liveMergedRoot) {
          liveMergedRoot = grafted;
        } else if (parent) {
          if (isLeft) parent.left = grafted;
          else parent.right = grafted;
        }
        collectAllTreeVals(grafted, completedVals);
        collectAllTreeVals(grafted, graftedVals);
      }

      steps.push({
        tree: cloneTree(liveMergedRoot),
        current: n2 ? n2.val : null,
        tree1: cloneTree(initialTree1),
        tree2: cloneTree(initialTree2),
        mergedTree: cloneTree(liveMergedRoot),
        depth,
        sum: n2 ? n2.val : null,
        val1: null,
        val2: n2 ? n2.val : null,
        focus1: null,
        focus2: n2 ? n2.val : null,
        focusMerged: n2 ? n2.val : null,
        tree1Visited: new Set(tree1Visited),
        tree2Visited: new Set(tree2Visited),
        highlightedMergedVals: new Set(completedVals),
        graftedVals: new Set(graftedVals),
        message: `树 1 当前节点为空，直接继承/保留树 2 子树（节点值: ${n2 ? n2.val : 'null'}）`,
        log: `树 1 为空，单边嫁接树 2 子树 (${n2?.val ?? 'null'})`,
        codeLine: lines.check1,
        opType: 'graft',
      });
      return grafted;
    }

    // 检查树 2 是否为空
    if (!n2) {
      tree1Visited.add(n1.val);
      const grafted = cloneTree(n1);
      if (grafted) {
        if (!liveMergedRoot) {
          liveMergedRoot = grafted;
        } else if (parent) {
          if (isLeft) parent.left = grafted;
          else parent.right = grafted;
        }
        collectAllTreeVals(grafted, completedVals);
        collectAllTreeVals(grafted, graftedVals);
      }

      steps.push({
        tree: cloneTree(liveMergedRoot),
        current: n1.val,
        tree1: cloneTree(initialTree1),
        tree2: cloneTree(initialTree2),
        mergedTree: cloneTree(liveMergedRoot),
        depth,
        sum: n1.val,
        val1: n1.val,
        val2: null,
        focus1: n1.val,
        focus2: null,
        focusMerged: n1.val,
        tree1Visited: new Set(tree1Visited),
        tree2Visited: new Set(tree2Visited),
        highlightedMergedVals: new Set(completedVals),
        graftedVals: new Set(graftedVals),
        message: `树 2 当前节点为空，直接继承/保留树 1 子树（节点值: ${n1.val}）`,
        log: `树 2 为空，单边保留树 1 子树 (${n1.val})`,
        codeLine: lines.check2,
        opType: 'graft',
      });
      return grafted;
    }

    // 两树节点均非空：值相加
    tree1Visited.add(n1.val);
    tree2Visited.add(n2.val);
    const sum = n1.val + n2.val;
    const newNode: TreeNode = { val: sum, left: null, right: null };

    if (!liveMergedRoot) {
      liveMergedRoot = newNode;
    } else if (parent) {
      if (isLeft) parent.left = newNode;
      else parent.right = newNode;
    }

    completedVals.add(sum);

    steps.push({
      tree: cloneTree(liveMergedRoot),
      current: sum,
      tree1: cloneTree(initialTree1),
      tree2: cloneTree(initialTree2),
      mergedTree: cloneTree(liveMergedRoot),
      depth,
      sum,
      val1: n1.val,
      val2: n2.val,
      focus1: n1.val,
      focus2: n2.val,
      focusMerged: sum,
      tree1Visited: new Set(tree1Visited),
      tree2Visited: new Set(tree2Visited),
      highlightedMergedVals: new Set(completedVals),
      graftedVals: new Set(graftedVals),
      message: `重叠节点相加：树 1(${n1.val}) + 树 2(${n2.val}) = ${sum}，创建合并新节点`,
      log: `重叠相加: ${n1.val} + ${n2.val} = ${sum}`,
      codeLine: lines.createMerged,
      opType: 'add',
    });

    // 递归左子树
    if (n1.left) tree1Visited.add(n1.left.val);
    if (n2.left) tree2Visited.add(n2.left.val);
    steps.push({
      tree: cloneTree(liveMergedRoot),
      current: sum,
      tree1: cloneTree(initialTree1),
      tree2: cloneTree(initialTree2),
      mergedTree: cloneTree(liveMergedRoot),
      depth,
      sum,
      val1: n1.val,
      val2: n2.val,
      focus1: n1.left ? n1.left.val : null,
      focus2: n2.left ? n2.left.val : null,
      focusMerged: sum,
      tree1Visited: new Set(tree1Visited),
      tree2Visited: new Set(tree2Visited),
      highlightedMergedVals: new Set(completedVals),
      graftedVals: new Set(graftedVals),
      message: `向左下潜：递归合并节点 ${sum} 的左子树 (树 1: ${n1.left?.val ?? 'null'}, 树 2: ${n2.left?.val ?? 'null'})`,
      log: `下潜合并节点 ${sum} 的左子树`,
      codeLine: lines.recurseLeft,
      opType: 'recurse_left',
    });
    newNode.left = dfs(n1.left, n2.left, depth + 1, newNode, true);

    // 递归右子树
    if (n1.right) tree1Visited.add(n1.right.val);
    if (n2.right) tree2Visited.add(n2.right.val);
    steps.push({
      tree: cloneTree(liveMergedRoot),
      current: sum,
      tree1: cloneTree(initialTree1),
      tree2: cloneTree(initialTree2),
      mergedTree: cloneTree(liveMergedRoot),
      depth,
      sum,
      val1: n1.val,
      val2: n2.val,
      focus1: n1.right ? n1.right.val : null,
      focus2: n2.right ? n2.right.val : null,
      focusMerged: sum,
      tree1Visited: new Set(tree1Visited),
      tree2Visited: new Set(tree2Visited),
      highlightedMergedVals: new Set(completedVals),
      graftedVals: new Set(graftedVals),
      message: `向右下潜：递归合并节点 ${sum} 的右子树 (树 1: ${n1.right?.val ?? 'null'}, 树 2: ${n2.right?.val ?? 'null'})`,
      log: `下潜合并节点 ${sum} 的右子树`,
      codeLine: lines.recurseRight,
      opType: 'recurse_right',
    });
    newNode.right = dfs(n1.right, n2.right, depth + 1, newNode, false);

    // 左右合并完成，向上回溯
    steps.push({
      tree: cloneTree(liveMergedRoot),
      current: sum,
      tree1: cloneTree(initialTree1),
      tree2: cloneTree(initialTree2),
      mergedTree: cloneTree(liveMergedRoot),
      depth,
      sum,
      val1: n1.val,
      val2: n2.val,
      focus1: n1.val,
      focus2: n2.val,
      focusMerged: sum,
      tree1Visited: new Set(tree1Visited),
      tree2Visited: new Set(tree2Visited),
      highlightedMergedVals: new Set(completedVals),
      graftedVals: new Set(graftedVals),
      message: `节点 ${sum} 的左右子树全部合并完毕，返回该节点`,
      log: `节点 ${sum} 左右子树合并完毕`,
      codeLine: lines.returnMerged,
      opType: 'check',
    });

    return newNode;
  };

  const finalResult = dfs(root1, root2, 0);

  // 最终收尾步（保证高亮不变量：全树所有节点全部常驻翡翠绿点亮，绝无空白暗灰！）
  const allFinalT1Vals = collectAllTreeVals(initialTree1);
  const allFinalT2Vals = collectAllTreeVals(initialTree2);
  const allFinalMergedVals = collectAllTreeVals(finalResult);

  steps.push({
    tree: cloneTree(finalResult),
    current: finalResult ? finalResult.val : null,
    tree1: cloneTree(initialTree1),
    tree2: cloneTree(initialTree2),
    mergedTree: cloneTree(finalResult),
    depth: 0,
    sum: finalResult ? finalResult.val : null,
    val1: finalResult ? finalResult.val : null,
    val2: finalResult ? finalResult.val : null,
    focus1: null,
    focus2: null,
    focusMerged: finalResult ? finalResult.val : null,
    tree1Visited: allFinalT1Vals,
    tree2Visited: allFinalT2Vals,
    highlightedMergedVals: allFinalMergedVals,
    graftedVals: new Set(graftedVals),
    message: '🎉 二叉树同步递归合并成功完成！全树节点均已合并点亮！',
    log: '合并成功完成 (全树点亮)',
    codeLine: lines.returnMerged,
    opType: 'complete',
  });

  return steps;
}

// ----------------------------------------------------
// Stage 2: 迭代 BFS 队列同步合并 (Iterative BFS Queue)
// ----------------------------------------------------
export function buildMergeTreesBfsSteps(
  tree1Arr: (number | null)[],
  tree2Arr: (number | null)[]
): MergeTreesStep[] {
  const steps: MergeTreesStep[] = [];
  const lines = MERGE_TREES_STAGE2_LINES;

  const root1 = buildTreeFromArr(tree1Arr);
  const root2 = buildTreeFromArr(tree2Arr);

  const initialTree1 = cloneTree(root1);
  const initialTree2 = cloneTree(root2);

  const tree1Visited = new Set<number>();
  const tree2Visited = new Set<number>();
  const completedVals = new Set<number>();
  const graftedVals = new Set<number>();

  if (root1) tree1Visited.add(root1.val);
  if (root2) tree2Visited.add(root2.val);

  steps.push({
    tree: null,
    current: null,
    tree1: cloneTree(initialTree1),
    tree2: cloneTree(initialTree2),
    mergedTree: null,
    depth: 0,
    sum: null,
    val1: root1 ? root1.val : null,
    val2: root2 ? root2.val : null,
    focus1: root1 ? root1.val : null,
    focus2: root2 ? root2.val : null,
    focusMerged: null,
    tree1Visited: new Set(tree1Visited),
    tree2Visited: new Set(tree2Visited),
    highlightedMergedVals: new Set(),
    graftedVals: new Set(),
    queueState: [],
    message: 'BFS 广度优先合并开始：初始化双树与待处理节点队列',
    log: '初始化 BFS 队列合并',
    codeLine: lines.entry,
    opType: 'init',
  });

  if (!root1) {
    const res = cloneTree(root2);
    const allT2 = collectAllTreeVals(initialTree2);
    steps.push({
      tree: res,
      current: res ? res.val : null,
      tree1: null,
      tree2: cloneTree(initialTree2),
      mergedTree: res,
      depth: 0,
      sum: res ? res.val : null,
      val1: null,
      val2: res ? res.val : null,
      focus1: null,
      focus2: null,
      focusMerged: res ? res.val : null,
      tree1Visited: new Set(),
      tree2Visited: allT2,
      highlightedMergedVals: allT2,
      graftedVals: allT2,
      queueState: [],
      message: '树 1 为空，直接返回整棵树 2 作为合并结果',
      log: '树 1 为空，返回树 2',
      codeLine: lines.check1,
      opType: 'complete',
    });
    return steps;
  }

  if (!root2) {
    const res = cloneTree(root1);
    const allT1 = collectAllTreeVals(initialTree1);
    steps.push({
      tree: res,
      current: res ? res.val : null,
      tree1: cloneTree(initialTree1),
      tree2: null,
      mergedTree: res,
      depth: 0,
      sum: res ? res.val : null,
      val1: res ? res.val : null,
      val2: null,
      focus1: null,
      focus2: null,
      focusMerged: res ? res.val : null,
      tree1Visited: allT1,
      tree2Visited: new Set(),
      highlightedMergedVals: allT1,
      graftedVals: allT1,
      queueState: [],
      message: '树 2 为空，直接返回整棵树 1 作为合并结果',
      log: '树 2 为空，返回树 1',
      codeLine: lines.check2,
      opType: 'complete',
    });
    return steps;
  }

  // 以 root1 的副本作为 live 结果树
  const mergedRoot = cloneTree(root1)!;
  const queue: Array<{ n1: TreeNode; n2: TreeNode }> = [{ n1: mergedRoot, n2: root2 }];

  steps.push({
    tree: cloneTree(mergedRoot),
    current: mergedRoot.val,
    tree1: cloneTree(initialTree1),
    tree2: cloneTree(initialTree2),
    mergedTree: cloneTree(mergedRoot),
    depth: 0,
    sum: null,
    val1: mergedRoot.val,
    val2: root2.val,
    focus1: mergedRoot.val,
    focus2: root2.val,
    focusMerged: mergedRoot.val,
    tree1Visited: new Set(tree1Visited),
    tree2Visited: new Set(tree2Visited),
    highlightedMergedVals: new Set(completedVals),
    graftedVals: new Set(graftedVals),
    queueState: [`[T1:${mergedRoot.val}, T2:${root2.val}]`],
    message: `根节点对入队: [T1:${mergedRoot.val}, T2:${root2.val}]`,
    log: `根节点入队: [${mergedRoot.val}, ${root2.val}]`,
    codeLine: lines.initQueue,
    opType: 'init',
  });

  while (queue.length > 0) {
    const formatQueue = () => queue.map((p) => `(${p.n1.val},${p.n2.val})`);

    steps.push({
      tree: cloneTree(mergedRoot),
      current: queue[0].n1.val,
      tree1: cloneTree(initialTree1),
      tree2: cloneTree(initialTree2),
      mergedTree: cloneTree(mergedRoot),
      depth: 0,
      sum: null,
      val1: queue[0].n1.val,
      val2: queue[0].n2.val,
      focus1: queue[0].n1.val,
      focus2: queue[0].n2.val,
      focusMerged: queue[0].n1.val,
      tree1Visited: new Set(tree1Visited),
      tree2Visited: new Set(tree2Visited),
      highlightedMergedVals: new Set(completedVals),
      graftedVals: new Set(graftedVals),
      queueState: formatQueue(),
      message: `队列循环：当前队列尚存 ${queue.length} 个重叠节点对待合并`,
      log: `队列待处理: ${queue.length} 对`,
      codeLine: lines.whileLoop,
      opType: 'check',
    });

    const { n1, n2 } = queue.shift()!;
    const originalN1Val = n1.val;
    const sum = n1.val + n2.val;
    n1.val = sum;

    tree1Visited.add(originalN1Val);
    tree2Visited.add(n2.val);
    completedVals.add(sum);

    steps.push({
      tree: cloneTree(mergedRoot),
      current: sum,
      tree1: cloneTree(initialTree1),
      tree2: cloneTree(initialTree2),
      mergedTree: cloneTree(mergedRoot),
      depth: 0,
      sum,
      val1: originalN1Val,
      val2: n2.val,
      focus1: originalN1Val,
      focus2: n2.val,
      focusMerged: sum,
      tree1Visited: new Set(tree1Visited),
      tree2Visited: new Set(tree2Visited),
      highlightedMergedVals: new Set(completedVals),
      graftedVals: new Set(graftedVals),
      queueState: formatQueue(),
      message: `弹出对头并在主树原地累加: ${originalN1Val} + ${n2.val} = ${sum}`,
      log: `弹出节点对求和: ${originalN1Val} + ${n2.val} = ${sum}`,
      codeLine: lines.addVal,
      opType: 'add',
    });

    // 检查左孩子
    if (n1.left && n2.left) {
      queue.push({ n1: n1.left, n2: n2.left });
      tree1Visited.add(n1.left.val);
      tree2Visited.add(n2.left.val);
      steps.push({
        tree: cloneTree(mergedRoot),
        current: sum,
        tree1: cloneTree(initialTree1),
        tree2: cloneTree(initialTree2),
        mergedTree: cloneTree(mergedRoot),
        depth: 0,
        sum,
        val1: n1.left.val,
        val2: n2.left.val,
        focus1: n1.left.val,
        focus2: n2.left.val,
        focusMerged: sum,
        tree1Visited: new Set(tree1Visited),
        tree2Visited: new Set(tree2Visited),
        highlightedMergedVals: new Set(completedVals),
        graftedVals: new Set(graftedVals),
        queueState: formatQueue(),
        message: `左右两树均有左孩子 (${n1.left.val} 与 ${n2.left.val})，入队等待层序求和`,
        log: `左孩子均存在，入队 (${n1.left.val}, ${n2.left.val})`,
        codeLine: lines.checkLeftBoth,
        opType: 'check',
      });
    } else if (!n1.left && n2.left) {
      n1.left = cloneTree(n2.left);
      if (n1.left) {
        collectAllTreeVals(n1.left, completedVals);
        collectAllTreeVals(n1.left, graftedVals);
        collectAllTreeVals(n1.left, tree2Visited);
      }
      steps.push({
        tree: cloneTree(mergedRoot),
        current: sum,
        tree1: cloneTree(initialTree1),
        tree2: cloneTree(initialTree2),
        mergedTree: cloneTree(mergedRoot),
        depth: 0,
        sum,
        val1: null,
        val2: n2.left.val,
        focus1: null,
        focus2: n2.left.val,
        focusMerged: sum,
        tree1Visited: new Set(tree1Visited),
        tree2Visited: new Set(tree2Visited),
        highlightedMergedVals: new Set(completedVals),
        graftedVals: new Set(graftedVals),
        queueState: formatQueue(),
        message: `主树无左孩子但树 2 存在左孩子 (${n2.left.val})，直接嫁接树 2 的左子树`,
        log: `嫁接树 2 左孩子: ${n2.left.val}`,
        codeLine: lines.graftLeft,
        opType: 'graft',
      });
    }

    // 检查右孩子
    if (n1.right && n2.right) {
      queue.push({ n1: n1.right, n2: n2.right });
      tree1Visited.add(n1.right.val);
      tree2Visited.add(n2.right.val);
      steps.push({
        tree: cloneTree(mergedRoot),
        current: sum,
        tree1: cloneTree(initialTree1),
        tree2: cloneTree(initialTree2),
        mergedTree: cloneTree(mergedRoot),
        depth: 0,
        sum,
        val1: n1.right.val,
        val2: n2.right.val,
        focus1: n1.right.val,
        focus2: n2.right.val,
        focusMerged: sum,
        tree1Visited: new Set(tree1Visited),
        tree2Visited: new Set(tree2Visited),
        highlightedMergedVals: new Set(completedVals),
        graftedVals: new Set(graftedVals),
        queueState: formatQueue(),
        message: `左右两树均有右孩子 (${n1.right.val} 与 ${n2.right.val})，入队等待层序求和`,
        log: `右孩子均存在，入队 (${n1.right.val}, ${n2.right.val})`,
        codeLine: lines.checkRightBoth,
        opType: 'check',
      });
    } else if (!n1.right && n2.right) {
      n1.right = cloneTree(n2.right);
      if (n1.right) {
        collectAllTreeVals(n1.right, completedVals);
        collectAllTreeVals(n1.right, graftedVals);
        collectAllTreeVals(n1.right, tree2Visited);
      }
      steps.push({
        tree: cloneTree(mergedRoot),
        current: sum,
        tree1: cloneTree(initialTree1),
        tree2: cloneTree(initialTree2),
        mergedTree: cloneTree(mergedRoot),
        depth: 0,
        sum,
        val1: null,
        val2: n2.right.val,
        focus1: null,
        focus2: n2.right.val,
        focusMerged: sum,
        tree1Visited: new Set(tree1Visited),
        tree2Visited: new Set(tree2Visited),
        highlightedMergedVals: new Set(completedVals),
        graftedVals: new Set(graftedVals),
        queueState: formatQueue(),
        message: `主树无右孩子但树 2 存在右孩子 (${n2.right.val})，直接嫁接树 2 的右子树`,
        log: `嫁接树 2 右孩子: ${n2.right.val}`,
        codeLine: lines.graftRight,
        opType: 'graft',
      });
    }
  }

  // 最终完成步（全树高亮不变量契约）
  const allFinalT1Vals = collectAllTreeVals(initialTree1);
  const allFinalT2Vals = collectAllTreeVals(initialTree2);
  const allFinalMergedVals = collectAllTreeVals(mergedRoot);

  steps.push({
    tree: cloneTree(mergedRoot),
    current: mergedRoot.val,
    tree1: cloneTree(initialTree1),
    tree2: cloneTree(initialTree2),
    mergedTree: cloneTree(mergedRoot),
    depth: 0,
    sum: mergedRoot.val,
    val1: mergedRoot.val,
    val2: mergedRoot.val,
    focus1: null,
    focus2: null,
    focusMerged: mergedRoot.val,
    tree1Visited: allFinalT1Vals,
    tree2Visited: allFinalT2Vals,
    highlightedMergedVals: allFinalMergedVals,
    graftedVals: new Set(graftedVals),
    queueState: [],
    message: '🎉 二叉树 BFS 队列迭代合并全部完成！全树节点均已合并点亮！',
    log: '队列为空，迭代合并完成 (全树点亮)',
    codeLine: lines.returnRoot,
    opType: 'complete',
  });

  return steps;
}

// 向后兼容接口导出
export function buildMergeTreesSteps(
  tree1Arr: (number | null)[] = [1, 3, 2, 5],
  tree2Arr: (number | null)[] = [2, 1, 3, null, 4, null, 7]
): MergeTreesStep[] {
  return buildMergeTreesDfsSteps(tree1Arr, tree2Arr);
}

// ----------------------------------------------------
// 表现层渲染逻辑 (Presentation Logic)
// ----------------------------------------------------

/**
 * 绘制高质感亮色/暗色自适应二叉树 SVG
 */
export function renderMiniTreeSVG(
  container: HTMLElement,
  root: TreeNode | null,
  focusVal: number | null,
  focusColor: string,
  visitedVals: Set<number>,
  visitedColor: string,
  graftedVals?: Set<number>,
  graftColor = '#9333ea',
  badgeText?: string
): void {
  container.innerHTML = '';
  if (!root) {
    container.innerHTML = `
      <div style="height: 100%; min-height: 180px; display: flex; align-items: center; justify-content: center; flex-direction: column; color: #94a3b8; font-size: 12px; font-weight: 500;">
        <span style="font-size: 20px; margin-bottom: 4px; opacity: 0.6;">🌱</span>
        <span>(空树 null)</span>
      </div>
    `;
    return;
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', '0 0 240 210');
  svg.style.display = 'block';
  svg.style.overflow = 'visible';

  const lh = 38;

  const draw = (node: TreeNode, x: number, y: number, spread: number) => {
    const isFocus = focusVal !== null && node.val === focusVal;
    const isGrafted = graftedVals ? graftedVals.has(node.val) : false;
    const isVisited = visitedVals ? visitedVals.has(node.val) : false;

    // 连接线绘制
    if (node.left) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x));
      line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(x - spread));
      line.setAttribute('y2', String(y + lh));
      line.setAttribute('stroke', isVisited || isFocus ? '#64748b' : '#cbd5e1');
      line.setAttribute('stroke-width', '2.5');
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);
      draw(node.left, x - spread, y + lh, spread / 2);
    }

    if (node.right) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x));
      line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(x + spread));
      line.setAttribute('y2', String(y + lh));
      line.setAttribute('stroke', isVisited || isFocus ? '#64748b' : '#cbd5e1');
      line.setAttribute('stroke-width', '2.5');
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);
      draw(node.right, x + spread, y + lh, spread / 2);
    }

    // 活跃焦点微光外环 (Pulsing Halo)
    if (isFocus) {
      const halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      halo.setAttribute('cx', String(x));
      halo.setAttribute('cy', String(y));
      halo.setAttribute('r', '20');
      halo.setAttribute('fill', 'none');
      halo.setAttribute('stroke', focusColor);
      halo.setAttribute('stroke-width', '2');
      halo.setAttribute('stroke-opacity', '0.45');
      halo.setAttribute('stroke-dasharray', '3, 2');
      svg.appendChild(halo);
    }

    // 节点实体圆圈
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(x));
    circle.setAttribute('cy', String(y));
    circle.setAttribute('r', '15.5');

    // 现代亮色主题自适应高对比色彩
    let fill = '#ffffff';
    let stroke = '#94a3b8';
    let strokeWidth = '2';
    let textColor = '#0f172a';

    if (isFocus) {
      fill = 'rgba(56, 189, 248, 0.25)';
      stroke = focusColor;
      strokeWidth = '3';
      textColor = focusColor;
    } else if (isGrafted) {
      fill = 'rgba(168, 85, 247, 0.2)';
      stroke = graftColor;
      strokeWidth = '2.5';
      textColor = '#7e22ce';
    } else if (isVisited) {
      fill = 'rgba(34, 197, 94, 0.2)';
      stroke = visitedColor;
      strokeWidth = '2.5';
      textColor = '#15803d';
    }

    circle.setAttribute('fill', fill);
    circle.setAttribute('stroke', stroke);
    circle.setAttribute('stroke-width', strokeWidth);
    svg.appendChild(circle);

    // 节点数值文字
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(x));
    text.setAttribute('y', String(y + 4.5));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '12.5');
    text.setAttribute('font-weight', '800');
    text.setAttribute('font-family', "'JetBrains Mono', ui-monospace, monospace");
    text.setAttribute('fill', textColor);
    text.textContent = String(node.val);
    svg.appendChild(text);
  };

  draw(root, 120, 28, 52);

  // 顶部完成徽章 (若存在)
  if (badgeText) {
    const badge = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    badge.setAttribute('x', '120');
    badge.setAttribute('y', '9');
    badge.setAttribute('text-anchor', 'middle');
    badge.setAttribute('font-size', '11');
    badge.setAttribute('font-weight', '700');
    badge.setAttribute('fill', '#16a34a');
    badge.textContent = badgeText;
    svg.appendChild(badge);
  }

  container.appendChild(svg);
}

/**
 * Card 1: 主画布三树并排沙盘渲染 (彻底消灭垂直折叠，保证全景横向排布)
 */
export function renderMergeTreesCanvas(container: HTMLElement, step: MergeTreesStep): void {
  container.innerHTML = '';

  // 强制创建独立横向容器包装，消除外部 CSS flex-direction: column 的影响
  const mainRow = document.createElement('div');
  mainRow.style.cssText = [
    'width: 100%',
    'height: 100%',
    'min-height: 280px',
    'display: flex !important',
    'flex-direction: row !important',
    'align-items: stretch',
    'justify-content: space-between',
    'gap: 8px',
    'padding: 4px',
    'box-sizing: border-box',
    'background: #ffffff',
  ].join(';');

  const isFinalComplete = step.opType === 'complete';

  // 1. 树 1 区域 (T1)
  const col1 = document.createElement('div');
  col1.style.cssText = 'flex: 1; display: flex; flex-direction: column; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; min-width: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.03);';

  const t1Header = document.createElement('div');
  t1Header.style.cssText = 'font-size: 12px; font-weight: 700; color: #0284c7; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;';
  const t1StatusText = isFinalComplete ? '✓ 全部合并' : (step.focus1 !== null ? `焦点: ${step.focus1}` : '焦点: 无');
  t1Header.innerHTML = `<span>🌳 输入树 1</span><span style="font-size: 11px; font-weight: 600; color: ${isFinalComplete ? '#16a34a' : '#64748b'};">${t1StatusText}</span>`;
  col1.appendChild(t1Header);

  const t1TreeBox = document.createElement('div');
  t1TreeBox.style.cssText = 'flex: 1; min-height: 190px; display: flex; align-items: center; justify-content: center;';
  renderMiniTreeSVG(t1TreeBox, step.tree1, step.focus1, '#0284c7', step.tree1Visited, '#16a34a', step.graftedVals);
  col1.appendChild(t1TreeBox);

  // 2. 加号操作符
  const opPlus = document.createElement('div');
  opPlus.style.cssText = 'display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: #94a3b8; width: 24px; flex-shrink: 0; user-select: none;';
  opPlus.textContent = '+';

  // 3. 树 2 区域 (T2)
  const col2 = document.createElement('div');
  col2.style.cssText = 'flex: 1; display: flex; flex-direction: column; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; min-width: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.03);';

  const t2Header = document.createElement('div');
  t2Header.style.cssText = 'font-size: 12px; font-weight: 700; color: #9333ea; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;';
  const t2StatusText = isFinalComplete ? '✓ 全部合并' : (step.focus2 !== null ? `焦点: ${step.focus2}` : '焦点: 无');
  t2Header.innerHTML = `<span>🌿 输入树 2</span><span style="font-size: 11px; font-weight: 600; color: ${isFinalComplete ? '#16a34a' : '#64748b'};">${t2StatusText}</span>`;
  col2.appendChild(t2Header);

  const t2TreeBox = document.createElement('div');
  t2TreeBox.style.cssText = 'flex: 1; min-height: 190px; display: flex; align-items: center; justify-content: center;';
  renderMiniTreeSVG(t2TreeBox, step.tree2, step.focus2, '#9333ea', step.tree2Visited, '#16a34a', step.graftedVals);
  col2.appendChild(t2TreeBox);

  // 4. 等号/箭头操作符
  const opArrow = document.createElement('div');
  opArrow.style.cssText = 'display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; color: #16a34a; width: 24px; flex-shrink: 0; user-select: none;';
  opArrow.textContent = '➔';

  // 5. 合并结果树区域 (Merged)
  const col3 = document.createElement('div');
  col3.style.cssText = 'flex: 1.25; display: flex; flex-direction: column; background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 8px; min-width: 0; box-shadow: 0 1px 3px rgba(34,197,94,0.08);';

  const t3Header = document.createElement('div');
  t3Header.style.cssText = 'font-size: 12px; font-weight: 700; color: #15803d; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;';
  const t3StatusText = isFinalComplete ? '🏆 100% 完成' : (step.sum !== null ? `当前生成: ${step.sum}` : '等待就绪');
  t3Header.innerHTML = `<span>✨ 合并演进树</span><span style="font-size: 11px; font-weight: 700; color: #16a34a;">${t3StatusText}</span>`;
  col3.appendChild(t3Header);

  const t3TreeBox = document.createElement('div');
  t3TreeBox.style.cssText = 'flex: 1; min-height: 190px; display: flex; align-items: center; justify-content: center;';
  renderMiniTreeSVG(
    t3TreeBox,
    step.mergedTree,
    step.focusMerged,
    '#eab308',
    step.highlightedMergedVals,
    '#16a34a',
    step.graftedVals,
    '#9333ea',
    isFinalComplete ? '🏆 完成' : undefined
  );
  col3.appendChild(t3TreeBox);

  mainRow.appendChild(col1);
  mainRow.appendChild(opPlus);
  mainRow.appendChild(col2);
  mainRow.appendChild(opArrow);
  mainRow.appendChild(col3);

  container.appendChild(mainRow);
}

/**
 * Card 2: 辅助推演动态与状态卡片
 */
export function renderMergeTreesCard2(container: HTMLElement, step: MergeTreesStep): void {
  container.innerHTML = '';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '8px';
  container.style.padding = '4px 2px';

  const isFinalComplete = step.opType === 'complete';

  // 1. 算式推演视窗
  const formulaBox = document.createElement('div');
  formulaBox.style.background = '#f8fafc';
  formulaBox.style.border = '1px solid #e2e8f0';
  formulaBox.style.borderRadius = '8px';
  formulaBox.style.padding = '8px 10px';

  const formulaTitle = document.createElement('div');
  formulaTitle.style.fontSize = '11px';
  formulaTitle.style.fontWeight = '700';
  formulaTitle.style.color = '#475569';
  formulaTitle.style.marginBottom = '4px';
  formulaTitle.textContent = '📐 节点合并算式推导';
  formulaBox.appendChild(formulaTitle);

  const formulaRow = document.createElement('div');
  formulaRow.style.display = 'flex';
  formulaRow.style.alignItems = 'center';
  formulaRow.style.gap = '8px';
  formulaRow.style.fontFamily = "'JetBrains Mono', ui-monospace, monospace";
  formulaRow.style.fontSize = '12.5px';
  formulaRow.style.fontWeight = '700';

  if (isFinalComplete) {
    formulaRow.innerHTML = `
      <span style="color: #16a34a; background: #dcfce7; padding: 3px 10px; border-radius: 4px; border: 1px solid #86efac;">
        🎉 两棵二叉树同步遍历合并成功完成！全树所有对应节点累加与单边继承已全部就绪。
      </span>
    `;
  } else if (step.val1 !== null && step.val2 !== null && step.sum !== null) {
    formulaRow.innerHTML = `
      <span style="color: #0369a1; background: #e0f2fe; padding: 2px 8px; border-radius: 4px; border: 1px solid #bae6fd;">T1: ${step.val1}</span>
      <span style="color: #64748b;">+</span>
      <span style="color: #7e22ce; background: #f3e8ff; padding: 2px 8px; border-radius: 4px; border: 1px solid #e9d5ff;">T2: ${step.val2}</span>
      <span style="color: #16a34a;">=</span>
      <span style="color: #854d0e; background: #fef9c3; padding: 2px 8px; border-radius: 4px; border: 1px solid #fde047;">合并新节点: ${step.sum}</span>
    `;
  } else if (step.val1 !== null && step.val2 === null) {
    formulaRow.innerHTML = `
      <span style="color: #0369a1; background: #e0f2fe; padding: 2px 8px; border-radius: 4px; border: 1px solid #bae6fd;">T1: ${step.val1}</span>
      <span style="color: #64748b;">+</span>
      <span style="color: #94a3b8;">null</span>
      <span style="color: #16a34a;">➜</span>
      <span style="color: #15803d; background: #dcfce7; padding: 2px 8px; border-radius: 4px;">单边保留 T1 子树 (根节点 ${step.val1})</span>
    `;
  } else if (step.val1 === null && step.val2 !== null) {
    formulaRow.innerHTML = `
      <span style="color: #94a3b8;">null</span>
      <span style="color: #64748b;">+</span>
      <span style="color: #7e22ce; background: #f3e8ff; padding: 2px 8px; border-radius: 4px; border: 1px solid #e9d5ff;">T2: ${step.val2}</span>
      <span style="color: #16a34a;">➜</span>
      <span style="color: #7e22ce; background: #f3e8ff; padding: 2px 8px; border-radius: 4px;">单边嫁接 T2 子树 (根节点 ${step.val2})</span>
    `;
  } else {
    formulaRow.innerHTML = `<span style="color: #64748b;">(准备启动同步遍历)</span>`;
  }
  formulaBox.appendChild(formulaRow);
  container.appendChild(formulaBox);

  // 2. 状态队列/调用栈沙盘
  if (step.queueState && step.queueState.length > 0) {
    const qBox = document.createElement('div');
    qBox.style.background = '#f8fafc';
    qBox.style.border = '1px solid #e2e8f0';
    qBox.style.borderRadius = '8px';
    qBox.style.padding = '8px 10px';

    const qTitle = document.createElement('div');
    qTitle.style.fontSize = '11px';
    qTitle.style.fontWeight = '700';
    qTitle.style.color = '#475569';
    qTitle.style.marginBottom = '4px';
    qTitle.textContent = `📋 BFS 待处理节点对队列 (Size: ${step.queueState.length})`;
    qBox.appendChild(qTitle);

    const qRow = document.createElement('div');
    qRow.style.display = 'flex';
    qRow.style.flexWrap = 'wrap';
    qRow.style.gap = '6px';

    step.queueState.forEach((item, idx) => {
      const pill = document.createElement('span');
      pill.style.padding = '2px 8px';
      pill.style.borderRadius = '4px';
      pill.style.fontSize = '11px';
      pill.style.fontFamily = "'JetBrains Mono', ui-monospace, monospace";
      pill.style.fontWeight = '600';
      if (idx === 0) {
        pill.style.background = '#fef9c3';
        pill.style.border = '1px solid #facc15';
        pill.style.color = '#854d0e';
        pill.textContent = `${item} (头)`;
      } else {
        pill.style.background = '#ffffff';
        pill.style.border = '1px solid #cbd5e1';
        pill.style.color = '#334155';
        pill.textContent = item;
      }
      qRow.appendChild(pill);
    });
    qBox.appendChild(qRow);
    container.appendChild(qBox);
  }

  // 3. 步骤决策与动态解释
  const summaryBox = document.createElement('div');
  summaryBox.style.background = isFinalComplete ? '#f0fdf4' : '#f8fafc';
  summaryBox.style.padding = '8px 10px';
  summaryBox.style.borderRadius = '8px';
  summaryBox.style.border = isFinalComplete ? '1px solid #86efac' : '1px solid #e2e8f0';
  summaryBox.style.fontSize = '12px';
  summaryBox.style.lineHeight = '1.5';
  summaryBox.style.color = '#334155';
  summaryBox.innerHTML = `
    <div style="font-weight: 700; color: ${isFinalComplete ? '#16a34a' : '#0284c7'}; margin-bottom: 2px;">⚡ 当前操作动作</div>
    <div style="color: #0f172a;">${step.message}</div>
  `;
  container.appendChild(summaryBox);
}

// ----------------------------------------------------
// 注册声明式多阶段二叉树合并算法
// ----------------------------------------------------
registerDeclarativeAlgorithm({
  id: 'merge-trees',
  name: '合并二叉树',
  category: 'tree',
  description: '合并两棵二叉树：对应重叠节点值相加，单边存在节点直接继承',
  icon: '🤝',
  difficulty: 1,
  levelOrder: 617,
  aliases: ['leetcode-617', 'merge-two-binary-trees'],
  learningGoal: '掌握双树同步遍历递归模型 (Simultaneous DFS) 与广度优先队列迭代合并两大工业范式',
  inputs: [
    {
      id: 'tree1',
      label: '树 1 层序数组',
      type: 'text',
      defaultValue: '1, 3, 2, 5',
      placeholder: '以逗号分隔，如 1, 3, 2, 5',
    },
    {
      id: 'tree2',
      label: '树 2 层序数组',
      type: 'text',
      defaultValue: '2, 1, 3, null, 4, null, 7',
      placeholder: '以逗号分隔，如 2, 1, 3, null, 4, null, 7',
    },
  ],
  presets: [
    {
      label: '经典案例 [1,3,2,5] + [2,1,3,null,4,null,7]',
      values: {
        tree1: '1, 3, 2, 5',
        tree2: '2, 1, 3, null, 4, null, 7',
      },
    },
    {
      label: '单节点与多层树 [1] + [1, 2, 3]',
      values: {
        tree1: '1',
        tree2: '1, 2, 3',
      },
    },
    {
      label: '互补左右斜树 [1,2,null,3] + [1,null,2,null,3]',
      values: {
        tree1: '1, 2, null, 3',
        tree2: '1, null, 2, null, 3',
      },
    },
    {
      label: '一侧为空树 [1, 2, 3] + []',
      values: {
        tree1: '1, 2, 3',
        tree2: '',
      },
    },
  ],
  metrics: [
    { id: 'metric-val1', label: '树 1 节点值', color: '#0284c7' },
    { id: 'metric-val2', label: '树 2 节点值', color: '#9333ea' },
    { id: 'metric-sum', label: '合并计算和', color: '#eab308' },
    { id: 'metric-depth', label: '递归深度/对数', color: '#16a34a' },
  ],
  legend: [
    { label: '树 1 节点', color: '#0284c7' },
    { label: '树 2 节点', color: '#9333ea' },
    { label: '合并完成', color: '#16a34a' },
    { label: '单边继承', color: '#7e22ce' },
  ],
  stages: [
    {
      id: 'stage-1-recursive',
      name: 'Stage 1: 递归 DFS 同步下潜',
      shortName: '递归 DFS',
      num: 1,
      timeBadge: 'O(min(M,N))',
      codeLanguages: MERGE_TREES_STAGE1_CODES,
      buildSteps: (inputs: Record<string, any>) => {
        const t1 = parseTreeInput(inputs.tree1, [1, 3, 2, 5]);
        const t2 = parseTreeInput(inputs.tree2, [2, 1, 3, null, 4, null, 7]);
        return buildMergeTreesDfsSteps(t1, t2).map((s) => ({
          ...s,
          metrics: {
            'metric-val1': s.val1 !== null ? String(s.val1) : '-',
            'metric-val2': s.val2 !== null ? String(s.val2) : '-',
            'metric-sum': s.sum !== null ? String(s.sum) : '-',
            'metric-depth': String(s.depth),
          },
        }));
      },
      renderCanvas: (container: HTMLElement, step: MergeTreesStep) => renderMergeTreesCanvas(container, step),
      auxiliaryVisual: {
        title: '节点推导与推演动态',
        render: (container: HTMLElement, step: MergeTreesStep) => renderMergeTreesCard2(container, step),
      },
    },
    {
      id: 'stage-2-queue-bfs',
      name: 'Stage 2: 迭代 BFS 队列同步合并',
      shortName: '迭代 BFS 队列',
      num: 2,
      timeBadge: 'O(min(M,N))',
      codeLanguages: MERGE_TREES_STAGE2_CODES,
      buildSteps: (inputs: Record<string, any>) => {
        const t1 = parseTreeInput(inputs.tree1, [1, 3, 2, 5]);
        const t2 = parseTreeInput(inputs.tree2, [2, 1, 3, null, 4, null, 7]);
        return buildMergeTreesBfsSteps(t1, t2).map((s) => ({
          ...s,
          metrics: {
            'metric-val1': s.val1 !== null ? String(s.val1) : '-',
            'metric-val2': s.val2 !== null ? String(s.val2) : '-',
            'metric-sum': s.sum !== null ? String(s.sum) : '-',
            'metric-depth': String(s.queueState?.length ?? 0),
          },
        }));
      },
      renderCanvas: (container: HTMLElement, step: MergeTreesStep) => renderMergeTreesCanvas(container, step),
      auxiliaryVisual: {
        title: '节点推导与队列状态',
        render: (container: HTMLElement, step: MergeTreesStep) => renderMergeTreesCard2(container, step),
      },
    },
  ],
  problemHtml: MERGE_TREES_PROBLEM_HTML,
  analysisHtml: MERGE_TREES_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const t1 = parseTreeInput(inputs.tree1, [1, 3, 2, 5]);
    const t2 = parseTreeInput(inputs.tree2, [2, 1, 3, null, 4, null, 7]);
    return buildMergeTreesDfsSteps(t1, t2).map((s) => ({
      ...s,
      metrics: {
        'metric-val1': s.val1 !== null ? String(s.val1) : '-',
        'metric-val2': s.val2 !== null ? String(s.val2) : '-',
        'metric-sum': s.sum !== null ? String(s.sum) : '-',
        'metric-depth': String(s.depth),
      },
    }));
  },
  renderCanvas: (container, step) => renderMergeTreesCanvas(container, step as MergeTreesStep),
});
