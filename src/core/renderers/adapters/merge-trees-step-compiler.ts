/**
 * 合并二叉树 (Merge Two Binary Trees · LeetCode 617) 核心多阶段演化推演编译器
 *
 * Stage 1: 递归 DFS 同步下潜 (Simultaneous DFS, O(min(M, N)))
 * Stage 2: 迭代 BFS 队列同步合并 (Iterative BFS Queue, O(min(M, N)))
 */

import { parseNumberList } from '../../input-primitives';
import { TreeNode, buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import { cloneStateDepTree } from '../../strategies/tree-clone';
import {
  MERGE_TREES_STAGE1_CODES,
  MERGE_TREES_STAGE1_LINES,
  MERGE_TREES_STAGE2_CODES,
  MERGE_TREES_STAGE2_LINES,
} from '../../../algorithms/categories/tree/merge-trees-stage-codes';
import {
  RecursiveCallTraceAdapter,
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from './recursive-call-trace-adapter';

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
  opType: 'init' | 'enter' | 'check' | 'add' | 'graft' | 'recurse_left' | 'recurse_right' | 'complete';
  callTrace?: RecursiveCallTraceSnapshot;
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

  const trace = new RecursiveCallTraceBuilder();
  const root1Label = root1 ? `Node(${root1.val})` : 'null';
  const root2Label = root2 ? `Node(${root2.val})` : 'null';
  trace.addHeader(`mergeTrees(root1: ${root1Label}, root2: ${root2Label})`, 0, '<- 根调用开始');

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
    callTrace: trace.snapshot(),
  });

  // 边界：两树皆空
  if (!root1 && !root2) {
    trace.addConditionHit('① root1 == null -> true, root2 == null -> true', 0);
    trace.addReturnLeaf('return null', 0);
    trace.addFinalResult('最终合并结果: null', 0, undefined, 'null');
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
      callTrace: trace.snapshot(),
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
    const n1Label = n1 ? `Node(${n1.val})` : 'null';
    const n2Label = n2 ? `Node(${n2.val})` : 'null';

    // 递归函数深入帧 (depth > 0)
    if (depth > 0) {
      trace.addHeader(`mergeTrees(t1: ${n1Label}, t2: ${n2Label})`, depth, `<- 深入深度 ${depth}`);
      steps.push({
        tree: cloneTree(liveMergedRoot),
        current: n1 ? n1.val : (n2 ? n2.val : null),
        tree1: cloneTree(initialTree1),
        tree2: cloneTree(initialTree2),
        mergedTree: cloneTree(liveMergedRoot),
        depth,
        sum: null,
        val1: n1 ? n1.val : null,
        val2: n2 ? n2.val : null,
        focus1: n1 ? n1.val : null,
        focus2: n2 ? n2.val : null,
        focusMerged: null,
        tree1Visited: new Set(tree1Visited),
        tree2Visited: new Set(tree2Visited),
        highlightedMergedVals: new Set(completedVals),
        graftedVals: new Set(graftedVals),
        message: `深入递归调用：mergeTrees(树 1: ${n1Label}, 树 2: ${n2Label})`,
        log: `enter mergeTrees(t1: ${n1Label}, t2: ${n2Label})`,
        codeLine: lines.entry,
        opType: 'enter',
        callTrace: trace.snapshot(),
      });
    }

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

      trace.addConditionHit(`① root1 == null -> true，单边保留/嫁接 root2 (${n2Label})`, depth);
      trace.addReturnLeaf(`return root2 (${n2Label})`, depth);

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
        callTrace: trace.snapshot(),
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

      trace.addConditionPass(`① root1 != null (${n1Label})`, depth);
      trace.addConditionHit(`② root2 == null -> true，单边保留树 1 子树 (${n1Label})`, depth);
      trace.addReturnLeaf(`return root1 (${n1Label})`, depth);

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
        callTrace: trace.snapshot(),
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

    trace.addConditionPass(`① root1 != null (${n1Label})`, depth);
    trace.addConditionPass(`② root2 != null (${n2Label})`, depth);
    trace.addUnwindCalc(`createMerged: ${n1.val} + ${n2.val} = ${sum}`, depth);

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
      callTrace: trace.snapshot(),
    });

    // 递归左子树
    if (n1.left) tree1Visited.add(n1.left.val);
    if (n2.left) tree2Visited.add(n2.left.val);
    const l1Text = n1.left ? `Node(${n1.left.val})` : 'null';
    const l2Text = n2.left ? `Node(${n2.left.val})` : 'null';
    trace.addRecursePrep(`③ 递归合并左子树: mergeTrees(${l1Text}, ${l2Text})`, depth);

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
      callTrace: trace.snapshot(),
    });
    newNode.left = dfs(n1.left, n2.left, depth + 1, newNode, true);

    // 递归右子树
    if (n1.right) tree1Visited.add(n1.right.val);
    if (n2.right) tree2Visited.add(n2.right.val);
    const r1Text = n1.right ? `Node(${n1.right.val})` : 'null';
    const r2Text = n2.right ? `Node(${n2.right.val})` : 'null';
    trace.addRecursePrep(`④ 递归合并右子树: mergeTrees(${r1Text}, ${r2Text})`, depth);

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
      callTrace: trace.snapshot(),
    });
    newNode.right = dfs(n1.right, n2.right, depth + 1, newNode, false);

    // 左右合并完成，向上回溯
    trace.addReturnLeaf(`return Node(${sum}) (左右子树合并完毕)`, depth);
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
      callTrace: trace.snapshot(),
    });

    return newNode;
  };

  const finalResult = dfs(root1, root2, 0);

  // 最终收尾步（保证高亮不变量：全树所有节点全部常驻翡翠绿点亮，绝无空白暗灰！）
  const allFinalT1Vals = collectAllTreeVals(initialTree1);
  const allFinalT2Vals = collectAllTreeVals(initialTree2);
  const allFinalMergedVals = collectAllTreeVals(finalResult);

  const resText = finalResult ? `Node(${finalResult.val})` : 'null';
  trace.addFinalResult(`最终合并完成: 根节点 ${resText}`, 0, undefined, resText);

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
    callTrace: trace.snapshot(),
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

export class MergeTreesStepCompiler {
  public static compileDfs = buildMergeTreesDfsSteps;
  public static compileBfs = buildMergeTreesBfsSteps;
  public static compileSteps = buildMergeTreesSteps;
  public static parseInput = parseTreeInput;
}
