/**
 * 求根节点到叶节点数字之和 (Sum Root to Leaf Numbers · LeetCode 129) 核心推演编译器
 *
 * Stage 1: 前序遍历与自顶向下累加递归 (LC 129 经典 DFS 解法)
 * Stage 2: 广度优先搜索双队列同步 (BFS Dual Queues 层序遍历)
 * Stage 3: 显式迭代双栈与回溯模拟 (Iterative Explicit Dual Stacks DFS)
 */

import { StepBase } from '../../step-visualizer';
import { TreeNode, buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import { cloneStateDepTree } from '../../strategies/tree-clone';
import {
  SUM_NUMBERS_STAGE1_CODES,
  SUM_NUMBERS_STAGE2_CODES,
  SUM_NUMBERS_STAGE3_CODES,
  SUM_NUMBERS_STAGE1_LINES,
  SUM_NUMBERS_STAGE2_LINES,
  SUM_NUMBERS_STAGE3_LINES,
} from '../../../algorithms/categories/tree/sum-root-to-leaf-numbers-stage-codes';
import {
  RecursiveCallTraceAdapter,
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from './recursive-call-trace-adapter';

export interface TreeNodeData {
  id: number;
  val: number;
  leftId: number | null;
  rightId: number | null;
  x: number;
  y: number;
}

export interface PathRecord {
  pathStr: string;
  value: number;
}

export interface SumNumbersStep extends StepBase {
  nodes?: TreeNodeData[];
  currentNodeId: number | null;
  callStack?: { nodeId: number; prevSum: number; currentSum: number; action: string }[];
  activePathNodeIds: number[];
  completedPaths: PathRecord[];
  totalSum: number;
  decision: string;
  metrics?: Record<string, string | number>;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  tree?: TreeNode | null;
  stageId?: string;
  queueState?: { node: number; sum: number }[];
  stackState?: { node: number; sum: number }[];
  visitedNodes?: number[];
  highlightedNodes?: number[];
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  action?: string;
  phase?: string;
  callTrace?: RecursiveCallTraceSnapshot;
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

export {
  SUM_NUMBERS_STAGE1_LINES,
  SUM_NUMBERS_STAGE2_LINES,
  SUM_NUMBERS_STAGE3_LINES,
};

export const SUM_ROOT_TO_LEAF_NUMBERS_CODES: Record<string, string> = {
  java: SUM_NUMBERS_STAGE1_CODES.java.join('\n'),
  cpp: SUM_NUMBERS_STAGE1_CODES.cpp.join('\n'),
  python: SUM_NUMBERS_STAGE1_CODES.python.join('\n'),
  javascript: SUM_NUMBERS_STAGE1_CODES.javascript.join('\n'),
};

const lines = SUM_NUMBERS_STAGE1_LINES;

export function buildDefaultTree(): TreeNodeData[] {
  return [
    { id: 1, val: 1, leftId: 2, rightId: 3, x: 200, y: 40 },
    { id: 2, val: 2, leftId: null, rightId: null, x: 110, y: 110 },
    { id: 3, val: 3, leftId: 4, rightId: 5, x: 290, y: 110 },
    { id: 4, val: 4, leftId: null, rightId: null, x: 240, y: 180 },
    { id: 5, val: 5, leftId: null, rightId: null, x: 340, y: 180 },
  ];
}

export function parseTreeInput(raw?: string, fallback: (number | null)[] = [4, 9, 0, 5, 1]): (number | null)[] {
  if (!raw || !raw.trim()) return fallback;
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .map((s) => (s === 'null' || s === 'nil' || s === 'none' || s === '' ? null : Number(s)));
}

// =========================================================================
// Stage 1: 前序遍历与自顶向下累加递归 (Preorder DFS)
// =========================================================================
export function buildSumNumbersStage1Steps(root: TreeNode | null): SumNumbersStep[] {
  const steps: SumNumbersStep[] = [];
  const linesMap = SUM_NUMBERS_STAGE1_LINES;
  const trace = new RecursiveCallTraceBuilder();
  const completedPaths: PathRecord[] = [];
  const activePath: number[] = [];
  const callStack: { nodeId: number; prevSum: number; currentSum: number; action: string }[] = [];

  if (!root) {
    trace.addHeader('sumNumbers(root = null)', 0, '<- 根调用特判');
    trace.addConditionHit('root == null -> return 0', 0);
    trace.addReturnLeaf('return 0', 0);
    trace.addFinalResult('最终判定: 0 (空树返回 0)', 0, undefined, 0);

    steps.push({
      currentNodeId: null,
      activePathNodeIds: [],
      completedPaths: [],
      totalSum: 0,
      decision: '算法启动：空树特判',
      action: 'entry',
      phase: 'init',
      metrics: { '当前节点': 'null', '当前路径值': 0, '已累加和': 0, '递归深度': 0 },
      message: '传入二叉树根节点为空 (null)，启动递归基准条件检验。',
      log: 'sumNumbers(root = null)',
      codeLine: linesMap.entry,
      tree: null,
      stageId: 'stage-1',
      statusBadge: { text: '空树: 0', type: 'info' },
      callTrace: trace.snapshot(),
    });

    steps.push({
      currentNodeId: null,
      activePathNodeIds: [],
      completedPaths: [],
      totalSum: 0,
      decision: '空节点基准退出：if (root == null) return 0',
      action: 'base-null',
      phase: 'check',
      metrics: { '当前节点': 'null', '当前路径值': 0, '已累加和': 0, '递归深度': 0 },
      message: '树为空，根到叶节点路径数字之和为 0。',
      log: 'root == null -> return 0',
      codeLine: linesMap.baseNull,
      tree: null,
      stageId: 'stage-1',
      statusBadge: { text: '基准退出', type: 'info' },
      callTrace: trace.snapshot(),
    });

    steps.push({
      currentNodeId: null,
      activePathNodeIds: [],
      completedPaths: [],
      totalSum: 0,
      decision: '计算完成：空树返回 0',
      action: 'done',
      phase: 'done',
      metrics: { '当前节点': 'null', '当前路径值': 0, '已累加和': 0, '递归深度': 0 },
      message: '空树计算完毕，最终结果为 0。',
      log: 'return 0',
      codeLine: linesMap.done,
      tree: null,
      stageId: 'stage-1',
      statusBadge: { text: '完成: 0', type: 'success' },
      callTrace: trace.snapshot(),
    });

    return steps;
  }

  // Step 0: 入口
  trace.addHeader(`sumNumbers(root: Node(${root.val}))`, 0, '<- 根调用开始');
  steps.push({
    currentNodeId: null,
    activePathNodeIds: [],
    completedPaths: [],
    totalSum: 0,
    decision: `求根到叶节点数字之和：启动递归 dfs(root=${root.val}, prevSum=0)`,
    action: 'entry',
    phase: 'init',
    metrics: { '当前节点': `Node(${root.val})`, '当前路径值': 0, '已累加和': 0, '递归深度': 0 },
    message: '初始化函数，传入根节点 root，初始上层累加和 prevSum = 0',
    log: `Init sumNumbers on root Node(${root.val})`,
    codeLine: linesMap.entry,
    tree: cloneStateDepTree(root),
    stageId: 'stage-1',
    statusBadge: { text: '开始递归', type: 'info' },
    callTrace: trace.snapshot(),
  });

  // Step 1: 调用 dfs(root, 0)
  trace.addRecursePrep(`dfs(root=Node(${root.val}), prevSum=0)`, 0, '<- 启动 DFS 递归');
  steps.push({
    currentNodeId: root.val,
    activePathNodeIds: [root.val],
    completedPaths: [],
    totalSum: 0,
    decision: `调用 dfs(root=${root.val}, 0) 开始自顶向下累加数字`,
    action: 'call-dfs-root',
    phase: 'call',
    metrics: { '当前节点': `Node(${root.val})`, '当前路径值': 0, '已累加和': 0, '递归深度': 1 },
    message: `调用 dfs(root, 0)，从根节点 Node(${root.val}) 开始前序探索`,
    log: `Call dfs(root=${root.val}, 0)`,
    codeLine: linesMap.callDfsRoot,
    tree: cloneStateDepTree(root),
    stageId: 'stage-1',
    statusBadge: { text: '进入递归', type: 'info' },
    callTrace: trace.snapshot(),
  });

  let totalSum = 0;

  function dfs(node: TreeNode | null, prevSum: number, depth: number): number {
    if (!node) {
      trace.addHeader(`dfs(null, prevSum=${prevSum})`, depth, '<- 空子节点');
      trace.addConditionHit('node == null -> return 0', depth);
      trace.addReturnLeaf('return 0', depth);

      steps.push({
        currentNodeId: null,
        activePathNodeIds: [...activePath],
        completedPaths: [...completedPaths],
        totalSum,
        decision: '当前节点为 null，直接返回 0',
        action: 'dfs-null',
        phase: 'base',
        metrics: { '当前节点': 'null', '当前路径值': prevSum, '已累加和': totalSum, '递归深度': depth },
        message: '递归基底：遇到空节点 null，对总和贡献为 0，返回 0',
        log: `dfs(null, ${prevSum}) -> return 0`,
        codeLine: linesMap.dfsNullCheck,
        tree: cloneStateDepTree(root),
        stageId: 'stage-1',
        statusBadge: { text: '空节点 null', type: 'warning' },
        callTrace: trace.snapshot(),
      });
      return 0;
    }

    activePath.push(node.val);
    callStack.push({ nodeId: node.val, prevSum, currentSum: 0, action: `进入 Node(${node.val})` });
    trace.addHeader(`dfs(Node(${node.val}), prevSum=${prevSum})`, depth, `<- 深入 Node(${node.val})`);
    trace.addConditionPass(`node != null √ 进入有效节点 Node(${node.val})`, depth);

    steps.push({
      currentNodeId: node.val,
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `进入节点 Node(${node.val})，上级传递的数值为 ${prevSum}`,
      action: 'dfs-entry',
      phase: 'entry',
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': prevSum, '已累加和': totalSum, '递归深度': depth },
      message: `dfs 进入 Node(${node.val})，准备执行边界判空检查`,
      log: `Enter dfs(node=${node.val}, prevSum=${prevSum})`,
      codeLine: linesMap.dfsEntry,
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
      statusBadge: { text: `访问: Node(${node.val})`, type: 'info' },
      callTrace: trace.snapshot(),
    });

    trace.addConditionPass(`node != null √ Node(${node.val}) 判空检验通过，继续累加`, depth);
    steps.push({
      currentNodeId: node.val,
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `边界判空检验：Node(${node.val}) != null，继续自顶向下累加`,
      action: 'dfs-null-check',
      phase: 'check',
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': prevSum, '已累加和': totalSum, '递归深度': depth },
      message: `边界判空：node != null，节点有效，继续执行路径求和公式`,
      log: `Node(${node.val}) != null -> continue`,
      codeLine: linesMap.dfsNullCheck,
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
      statusBadge: { text: `节点有效: Node(${node.val})`, type: 'info' },
      callTrace: trace.snapshot(),
    });

    const currSum = prevSum * 10 + node.val;
    callStack[callStack.length - 1].currentSum = currSum;
    trace.addConditionPass(`currSum = ${prevSum} * 10 + ${node.val} = ${currSum}`, depth);

    steps.push({
      currentNodeId: node.val,
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `计算当前路径数值：${prevSum} × 10 + ${node.val} = ${currSum}`,
      action: 'calc-sum',
      phase: 'calc',
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': currSum, '已累加和': totalSum, '递归深度': depth },
      message: `公式推导：currSum = prevSum * 10 + node.val = ${prevSum} * 10 + ${node.val} = ${currSum}`,
      log: `Node(${node.val}) 累计数值为 ${currSum}`,
      codeLine: linesMap.calcSum,
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
      statusBadge: { text: `路径值: ${currSum}`, type: 'info' },
      callTrace: trace.snapshot(),
    });

    const isLeaf = !node.left && !node.right;
    if (isLeaf) {
      trace.addConditionHit(`node.left == null && node.right == null √ 判定为叶子节点！`, depth);
    } else {
      trace.addConditionPass(`非叶子节点，继续向下探索左右分支`, depth);
    }

    steps.push({
      currentNodeId: node.val,
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: isLeaf ? `Node(${node.val}) 是叶子节点！形成一条完整根到叶路径` : `Node(${node.val}) 不是叶子节点，继续向下分治`,
      action: 'leaf-check',
      phase: 'check',
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': currSum, '已累加和': totalSum, '递归深度': depth },
      message: isLeaf ? `叶子判定：左右孩子皆空，产生完整路径数值 ${currSum}` : `叶子判定：存在子节点，继续向下探索左右分支`,
      log: `Check leaf: Node(${node.val}) isLeaf=${isLeaf}`,
      codeLine: linesMap.leafCheck,
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
      statusBadge: { text: isLeaf ? '命中叶子！' : '内部节点', type: isLeaf ? 'success' : 'info' },
      callTrace: trace.snapshot(),
    });

    if (isLeaf) {
      totalSum += currSum;
      const pathStr = activePath.join(' ➔ ');
      completedPaths.push({ pathStr, value: currSum });
      trace.addReturnLeaf(`叶子节点路径达成: [${pathStr}] = ${currSum} -> return ${currSum}`, depth);

      steps.push({
        currentNodeId: node.val,
        activePathNodeIds: [...activePath],
        completedPaths: [...completedPaths],
        totalSum,
        decision: `到达叶子节点，返回该路径值 ${currSum}，总和累计达 ${totalSum}`,
        action: 'leaf-return',
        phase: 'harvest',
        metrics: { '当前节点': `Node(${node.val})`, '当前路径值': currSum, '已累加和': totalSum, '递归深度': depth },
        message: `叶子收网：路径 [${pathStr}] 形成整数 ${currSum}，将其计入结果集`,
        log: `Leaf return ${currSum}, totalSum=${totalSum}`,
        codeLine: linesMap.leafReturn,
        tree: cloneStateDepTree(root),
        stageId: 'stage-1',
        statusBadge: { text: `收获路径: ${currSum}`, type: 'success' },
        callTrace: trace.snapshot(),
      });

      activePath.pop();
      callStack.pop();
      return currSum;
    }

    // 深入左子树
    trace.addRecursePrep(`递归深入左孩子 dfs(left, currSum=${currSum})`, depth, '<- 分支探查');
    steps.push({
      currentNodeId: node.val,
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `准备向下递归左子树 dfs(left=${node.left?.val ?? 'null'}, ${currSum})`,
      action: 'call-left',
      phase: 'recurse',
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': currSum, '已累加和': totalSum, '递归深度': depth },
      message: `向下探索：访问左子树 left=${node.left?.val ?? 'null'}`,
      log: `Node(${node.val}) recurse left`,
      codeLine: linesMap.callLeft,
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
      statusBadge: { text: '下探左子树', type: 'info' },
      callTrace: trace.snapshot(),
    });

    const leftVal = dfs(node.left, currSum, depth + 1);
    trace.addUnwindCalc(`左分支回溯完毕，左子树和: ${leftVal}`, depth);

    // 深入右子树
    trace.addRecursePrep(`递归深入右孩子 dfs(right, currSum=${currSum})`, depth, '<- 分支探查');
    steps.push({
      currentNodeId: node.val,
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `准备向下递归右子树 dfs(right=${node.right?.val ?? 'null'}, ${currSum})`,
      action: 'call-right',
      phase: 'recurse',
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': currSum, '已累加和': totalSum, '递归深度': depth },
      message: `向下探索：访问右子树 right=${node.right?.val ?? 'null'}`,
      log: `Node(${node.val}) recurse right`,
      codeLine: linesMap.callRight,
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
      statusBadge: { text: '下探右子树', type: 'info' },
      callTrace: trace.snapshot(),
    });

    const rightVal = dfs(node.right, currSum, depth + 1);
    trace.addUnwindCalc(`右分支回溯完毕，右子树和: ${rightVal}`, depth);

    const subtotal = leftVal + rightVal;
    trace.addUnwindCalc(`Node(${node.val}) 左右子树合并: ${leftVal} + ${rightVal} = ${subtotal}`, depth);

    steps.push({
      currentNodeId: node.val,
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `Node(${node.val}) 左右子树合并：${leftVal} + ${rightVal} = ${subtotal}`,
      action: 'return-sum',
      phase: 'unwind',
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': currSum, '已累加和': totalSum, '递归深度': depth },
      message: `子树合并完成：Node(${node.val}) 的左右子节点路径和为 ${subtotal}，回溯向上返回`,
      log: `Node(${node.val}) return ${subtotal}`,
      codeLine: linesMap.returnSum,
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
      statusBadge: { text: `子树合并: ${subtotal}`, type: 'info' },
      callTrace: trace.snapshot(),
    });

    activePath.pop();
    callStack.pop();
    return subtotal;
  }

  const finalResult = dfs(root, 0, 0);
  const allTreeVals = collectTreeValues(root);
  trace.addFinalResult(`全树 DFS 遍历完成！所有根到叶节点路径数字之和为 ${finalResult}`, 0, undefined, finalResult);

  steps.push({
    currentNodeId: root ? root.val : null,
    activePathNodeIds: allTreeVals,
    visitedNodes: allTreeVals,
    completedPaths: [...completedPaths],
    totalSum: finalResult,
    decision: `🎉 全树 DFS 遍历完成！所有根到叶节点路径数字之和为 ${finalResult}`,
    action: 'done',
    phase: 'done',
    metrics: { '当前节点': root ? `Node(${root.val})` : '完成', '当前路径值': '-', '已累加和': finalResult, '递归深度': 0 },
    message: `计算收官：全树共 ${completedPaths.length} 条有效路径，总和为 ${finalResult}`,
    log: `SumNumbers Stage 1 done. Total = ${finalResult}`,
    codeLine: linesMap.done,
    tree: cloneStateDepTree(root),
    stageId: 'stage-1',
    statusBadge: { text: `最终总和: ${finalResult}`, type: 'success' },
    callTrace: trace.snapshot(),
  });

  return steps;
}

// =========================================================================
// Stage 2: 广度优先搜索双队列同步 (BFS Dual Queues)
// =========================================================================
export function buildSumNumbersStage2BfsSteps(root: TreeNode | null): SumNumbersStep[] {
  const steps: SumNumbersStep[] = [];
  const linesMap = SUM_NUMBERS_STAGE2_LINES;
  const completedPaths: PathRecord[] = [];

  if (!root) {
    steps.push({
      currentNodeId: null,
      activePathNodeIds: [],
      completedPaths: [],
      totalSum: 0,
      decision: '特判返回：树为空',
      metrics: { '队列长度': 0, '已累加和': 0 },
      message: '树为空，返回总和 0。',
      log: 'root is null -> return 0',
      codeLine: linesMap.entry,
      tree: null,
      stageId: 'stage-2',
    });
    return steps;
  }

  let totalSum = 0;
  const nodeQueue: TreeNode[] = [root];
  const numQueue: number[] = [root.val];
  const pathMap = new Map<TreeNode, string>();
  pathMap.set(root, `${root.val}`);

  // Step 0: 初始化队列
  steps.push({
    currentNodeId: root.val,
    activePathNodeIds: [root.val],
    completedPaths: [],
    totalSum: 0,
    decision: `启动 BFS 双队列层序遍历：root = Node(${root.val}) 入队`,
    metrics: { '当前队列': `[Node(${root.val})]`, '当前数值队列': `[${root.val}]`, '已累加和': 0 },
    message: `初始化双队列：nodeQueue.offer(root), numQueue.offer(${root.val})`,
    log: `Init BFS queue with Node(${root.val})`,
    codeLine: linesMap.init,
    tree: cloneStateDepTree(root),
    stageId: 'stage-2',
    queueState: [{ node: root.val, sum: root.val }],
  });

  while (nodeQueue.length > 0) {
    const queueStateSnapshot = nodeQueue.map((n, i) => ({ node: n.val, sum: numQueue[i] }));
    steps.push({
      currentNodeId: nodeQueue[0].val,
      activePathNodeIds: [nodeQueue[0].val],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `队列非空 (长度=${nodeQueue.length})，准备出队队头节点 Node(${nodeQueue[0].val})`,
      metrics: { '队列长度': nodeQueue.length, '已累加和': totalSum },
      message: `循环检查：队列中有 ${nodeQueue.length} 个待处理节点`,
      log: `Queue has ${nodeQueue.length} elements`,
      codeLine: linesMap.whileLoop,
      tree: cloneStateDepTree(root),
      stageId: 'stage-2',
      queueState: queueStateSnapshot,
    });

    const node = nodeQueue.shift()!;
    const num = numQueue.shift()!;
    const currentPath = pathMap.get(node) || `${node.val}`;

    steps.push({
      currentNodeId: node.val,
      activePathNodeIds: [node.val],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `队头出队：Node(${node.val})，对应前缀累加值为 ${num}`,
      metrics: { '出队节点': `Node(${node.val})`, '前缀数值': num, '已累加和': totalSum },
      message: `node = nodeQueue.poll(), num = numQueue.poll()，当前路径: ${currentPath}`,
      log: `Poll Node(${node.val}) with sum ${num}`,
      codeLine: linesMap.pollNode,
      tree: cloneStateDepTree(root),
      stageId: 'stage-2',
      queueState: nodeQueue.map((n, i) => ({ node: n.val, sum: numQueue[i] })),
    });

    const isLeaf = !node.left && !node.right;
    steps.push({
      currentNodeId: node.val,
      activePathNodeIds: [node.val],
      completedPaths: [...completedPaths],
      totalSum,
      decision: isLeaf ? `Node(${node.val}) 为叶子节点！累加完整数字 ${num}` : `Node(${node.val}) 存在子节点，继续将子节点派生入队`,
      metrics: { '当前节点': `Node(${node.val})`, '前缀数值': num, '是否叶子': isLeaf ? '是' : '否' },
      message: isLeaf ? `叶子节点判定成功：左右孩子均为空` : `非叶子节点，准备将非空孩子及其派生值推入队列`,
      log: `Check leaf: Node(${node.val}) isLeaf=${isLeaf}`,
      codeLine: linesMap.leafCheck,
      tree: cloneStateDepTree(root),
      stageId: 'stage-2',
      queueState: nodeQueue.map((n, i) => ({ node: n.val, sum: numQueue[i] })),
    });

    if (isLeaf) {
      totalSum += num;
      completedPaths.push({ pathStr: currentPath, value: num });

      steps.push({
        currentNodeId: node.val,
        activePathNodeIds: [node.val],
        completedPaths: [...completedPaths],
        totalSum,
        decision: `叶子路径结算：累计和增加 ${num} ➔ totalSum = ${totalSum}`,
        metrics: { '叶子路径': currentPath, '新增贡献': num, '当前总和': totalSum },
        message: `叶子收官：路径 [${currentPath}] 贡献数值 ${num}，当前总和收敛至 ${totalSum}`,
        log: `Leaf add ${num} -> totalSum=${totalSum}`,
        codeLine: linesMap.leafAdd,
        tree: cloneStateDepTree(root),
        stageId: 'stage-2',
        queueState: nodeQueue.map((n, i) => ({ node: n.val, sum: numQueue[i] })),
      });
    } else {
      if (node.left) {
        const nextVal = num * 10 + node.left.val;
        nodeQueue.push(node.left);
        numQueue.push(nextVal);
        pathMap.set(node.left, `${currentPath} ➔ ${node.left.val}`);

        steps.push({
          currentNodeId: node.left.val,
          activePathNodeIds: [node.val, node.left.val],
          completedPaths: [...completedPaths],
          totalSum,
          decision: `左子节点 Node(${node.left.val}) 入队：${num} × 10 + ${node.left.val} = ${nextVal}`,
          metrics: { '入队节点': `Node(${node.left.val})`, '派生数值': nextVal, '队列新长度': nodeQueue.length },
          message: `nodeQueue.offer(node.left), numQueue.offer(${nextVal})`,
          log: `Enqueue left Node(${node.left.val}) with sum ${nextVal}`,
          codeLine: linesMap.pushLeft,
          tree: cloneStateDepTree(root),
          stageId: 'stage-2',
          queueState: nodeQueue.map((n, i) => ({ node: n.val, sum: numQueue[i] })),
        });
      }

      if (node.right) {
        const nextVal = num * 10 + node.right.val;
        nodeQueue.push(node.right);
        numQueue.push(nextVal);
        pathMap.set(node.right, `${currentPath} ➔ ${node.right.val}`);

        steps.push({
          currentNodeId: node.right.val,
          activePathNodeIds: [node.val, node.right.val],
          completedPaths: [...completedPaths],
          totalSum,
          decision: `右子节点 Node(${node.right.val}) 入队：${num} × 10 + ${node.right.val} = ${nextVal}`,
          metrics: { '入队节点': `Node(${node.right.val})`, '派生数值': nextVal, '队列新长度': nodeQueue.length },
          message: `nodeQueue.offer(node.right), numQueue.offer(${nextVal})`,
          log: `Enqueue right Node(${node.right.val}) with sum ${nextVal}`,
          codeLine: linesMap.pushRight,
          tree: cloneStateDepTree(root),
          stageId: 'stage-2',
          queueState: nodeQueue.map((n, i) => ({ node: n.val, sum: numQueue[i] })),
        });
      }
    }
  }

  const allTreeVals = collectTreeValues(root);

  // Done
  steps.push({
    currentNodeId: root ? root.val : null,
    activePathNodeIds: allTreeVals,
    visitedNodes: allTreeVals,
    completedPaths: [...completedPaths],
    totalSum,
    decision: `🎉 BFS 双队列层序遍历完成！所有根到叶数字之和为 ${totalSum}`,
    metrics: { '最终结果': totalSum, '总路径数': completedPaths.length },
    message: `双队列已全部清空，全树共 ${completedPaths.length} 条有效路径，总和为 ${totalSum}`,
    log: `SumNumbers Stage 2 BFS done. Result = ${totalSum}`,
    codeLine: linesMap.done,
    tree: cloneStateDepTree(root),
    stageId: 'stage-2',
    queueState: [],
  });

  return steps;
}

// =========================================================================
// Stage 3: 显式迭代双栈与回溯模拟 (Iterative Explicit Dual Stacks DFS)
// =========================================================================
export function buildSumNumbersStage3StackSteps(root: TreeNode | null): SumNumbersStep[] {
  const steps: SumNumbersStep[] = [];
  const linesMap = SUM_NUMBERS_STAGE3_LINES;
  const completedPaths: PathRecord[] = [];

  if (!root) {
    steps.push({
      currentNodeId: null,
      activePathNodeIds: [],
      completedPaths: [],
      totalSum: 0,
      decision: '特判返回：树为空',
      metrics: { '栈深度': 0, '已累加和': 0 },
      message: '树为空，返回总和 0。',
      log: 'root is null -> return 0',
      codeLine: linesMap.entry,
      tree: null,
      stageId: 'stage-3',
    });
    return steps;
  }

  let totalSum = 0;
  const nodeStack: TreeNode[] = [root];
  const numStack: number[] = [root.val];
  const pathMap = new Map<TreeNode, string>();
  pathMap.set(root, `${root.val}`);

  // Step 0: 初始化栈
  steps.push({
    currentNodeId: root.val,
    activePathNodeIds: [root.val],
    completedPaths: [],
    totalSum: 0,
    decision: `启动显式双栈迭代前序遍历：root = Node(${root.val}) 压入栈`,
    metrics: { '栈顶节点': `Node(${root.val})`, '初始路径和': root.val, '已累加和': 0 },
    message: `初始化双栈：nodeStack.push(root), numStack.push(${root.val})`,
    log: `Init stack with Node(${root.val})`,
    codeLine: linesMap.init,
    tree: cloneStateDepTree(root),
    stageId: 'stage-3',
    stackState: [{ node: root.val, sum: root.val }],
  });

  while (nodeStack.length > 0) {
    const stackSnapshot = nodeStack.map((n, i) => ({ node: n.val, sum: numStack[i] }));
    steps.push({
      currentNodeId: nodeStack[nodeStack.length - 1].val,
      activePathNodeIds: [nodeStack[nodeStack.length - 1].val],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `栈非空 (深度=${nodeStack.length})，准备弹出栈顶 Node(${nodeStack[nodeStack.length - 1].val})`,
      metrics: { '栈深度': nodeStack.length, '已累加和': totalSum },
      message: `循环检查：栈内有 ${nodeStack.length} 个待回溯展开节点`,
      log: `Stack has ${nodeStack.length} frames`,
      codeLine: linesMap.whileLoop,
      tree: cloneStateDepTree(root),
      stageId: 'stage-3',
      stackState: stackSnapshot,
    });

    const node = nodeStack.pop()!;
    const curr = numStack.pop()!;
    const currentPath = pathMap.get(node) || `${node.val}`;

    steps.push({
      currentNodeId: node.val,
      activePathNodeIds: [node.val],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `栈顶出栈：Node(${node.val})，累计数值为 ${curr}`,
      metrics: { '出栈节点': `Node(${node.val})`, '当前累加数值': curr, '已累加和': totalSum },
      message: `node = nodeStack.pop(), curr = numStack.pop()，当前路径: ${currentPath}`,
      log: `Pop Node(${node.val}) with sum ${curr}`,
      codeLine: linesMap.popNode,
      tree: cloneStateDepTree(root),
      stageId: 'stage-3',
      stackState: nodeStack.map((n, i) => ({ node: n.val, sum: numStack[i] })),
    });

    const isLeaf = !node.left && !node.right;
    steps.push({
      currentNodeId: node.val,
      activePathNodeIds: [node.val],
      completedPaths: [...completedPaths],
      totalSum,
      decision: isLeaf ? `Node(${node.val}) 为叶子节点！结算整条路径数值 ${curr}` : `Node(${node.val}) 存在子节点，继续先右后左压栈`,
      metrics: { '当前节点': `Node(${node.val})`, '数值': curr, '是否叶子': isLeaf ? '是' : '否' },
      message: isLeaf ? `叶子判定成立：左右孩子皆空` : `非叶子节点，为保证前序左优先遍历，先压入右子树再压入左子树`,
      log: `Check leaf: Node(${node.val}) isLeaf=${isLeaf}`,
      codeLine: linesMap.leafCheck,
      tree: cloneStateDepTree(root),
      stageId: 'stage-3',
      stackState: nodeStack.map((n, i) => ({ node: n.val, sum: numStack[i] })),
    });

    if (isLeaf) {
      totalSum += curr;
      completedPaths.push({ pathStr: currentPath, value: curr });

      steps.push({
        currentNodeId: node.val,
        activePathNodeIds: [node.val],
        completedPaths: [...completedPaths],
        totalSum,
        decision: `叶子路径结算：累计和增加 ${curr} ➔ totalSum = ${totalSum}`,
        metrics: { '叶子路径': currentPath, '新增数值': curr, '当前总和': totalSum },
        message: `叶子收官：路径 [${currentPath}] 贡献数值 ${curr}，当前总和收敛至 ${totalSum}`,
        log: `Leaf add ${curr} -> totalSum=${totalSum}`,
        codeLine: linesMap.leafAdd,
        tree: cloneStateDepTree(root),
        stageId: 'stage-3',
        stackState: nodeStack.map((n, i) => ({ node: n.val, sum: numStack[i] })),
      });
    }

    if (node.right) {
      const nextVal = curr * 10 + node.right.val;
      nodeStack.push(node.right);
      numStack.push(nextVal);
      pathMap.set(node.right, `${currentPath} ➔ ${node.right.val}`);

      steps.push({
        currentNodeId: node.right.val,
        activePathNodeIds: [node.val, node.right.val],
        completedPaths: [...completedPaths],
        totalSum,
        decision: `右子节点 Node(${node.right.val}) 压栈：${curr} × 10 + ${node.right.val} = ${nextVal}`,
        metrics: { '压栈节点': `Node(${node.right.val})`, '派生数值': nextVal, '栈新深度': nodeStack.length },
        message: `nodeStack.push(node.right), numStack.push(${nextVal})`,
        log: `Push right Node(${node.right.val}) with sum ${nextVal}`,
        codeLine: linesMap.pushRight,
        tree: cloneStateDepTree(root),
        stageId: 'stage-3',
        stackState: nodeStack.map((n, i) => ({ node: n.val, sum: numStack[i] })),
      });
    }

    if (node.left) {
      const nextVal = curr * 10 + node.left.val;
      nodeStack.push(node.left);
      numStack.push(nextVal);
      pathMap.set(node.left, `${currentPath} ➔ ${node.left.val}`);

      steps.push({
        currentNodeId: node.left.val,
        activePathNodeIds: [node.val, node.left.val],
        completedPaths: [...completedPaths],
        totalSum,
        decision: `左子节点 Node(${node.left.val}) 压栈：${curr} × 10 + ${node.left.val} = ${nextVal}`,
        metrics: { '压栈节点': `Node(${node.left.val})`, '派生数值': nextVal, '栈新深度': nodeStack.length },
        message: `nodeStack.push(node.left), numStack.push(${nextVal})`,
        log: `Push left Node(${node.left.val}) with sum ${nextVal}`,
        codeLine: linesMap.pushLeft,
        tree: cloneStateDepTree(root),
        stageId: 'stage-3',
        stackState: nodeStack.map((n, i) => ({ node: n.val, sum: numStack[i] })),
      });
    }
  }

  const allTreeVals = collectTreeValues(root);

  // Done
  steps.push({
    currentNodeId: root ? root.val : null,
    activePathNodeIds: allTreeVals,
    visitedNodes: allTreeVals,
    completedPaths: [...completedPaths],
    totalSum,
    decision: `🎉 显式双栈迭代前序遍历完成！所有根到叶数字之和为 ${totalSum}`,
    metrics: { '最终结果': totalSum, '总路径数': completedPaths.length },
    message: `双栈已全部清空，全树共 ${completedPaths.length} 条有效路径，总和为 ${totalSum}`,
    log: `SumNumbers Stage 3 Stack done. Result = ${totalSum}`,
    codeLine: linesMap.done,
    tree: cloneStateDepTree(root),
    stageId: 'stage-3',
    stackState: [],
  });

  return steps;
}

// =========================================================================
// 向后兼容接口 (Backward-Compatible generateSumNumbersSteps)
// =========================================================================
export function generateSumNumbersSteps(nodesInput?: TreeNodeData[] | null): SumNumbersStep[] {
  if (nodesInput === null || (Array.isArray(nodesInput) && nodesInput.length === 0)) {
    return [{
      nodes: [],
      currentNodeId: null,
      callStack: [],
      activePathNodeIds: [],
      completedPaths: [],
      totalSum: 0,
      decision: '空树特判返回 0',
      metrics: { '当前节点': '无', '当前路径值': '0', '已累加和': '0', '递归深度': '0' },
      message: '树为空，直接返回 0',
      log: 'root == null -> return 0',
      codeLine: lines.entry,
    }];
  }
  const nodes = nodesInput !== undefined ? nodesInput : buildDefaultTree();
  const nodeMap = new Map<number, TreeNodeData>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const steps: SumNumbersStep[] = [];
  const completedPaths: PathRecord[] = [];
  const activePath: number[] = [];
  const callStack: { nodeId: number; prevSum: number; currentSum: number; action: string }[] = [];
  let totalSum = 0;

  // Step 0: 入口
  steps.push({
    nodes,
    currentNodeId: null,
    callStack: [],
    activePathNodeIds: [],
    completedPaths: [],
    totalSum: 0,
    decision: '开始求根到叶节点数字之和，准备启动 DFS 递归',
    metrics: { '当前节点': '无', '当前路径值': '0', '已累加和': '0', '递归深度': '0' },
    message: '初始化函数，传入根节点 root，初始上层累加和 prevSum = 0',
    log: '初始化：root = Node(1), prevSum = 0',
    codeLine: lines.entry,
  });

  // Step 1: 调用 dfs(root, 0)
  steps.push({
    nodes,
    currentNodeId: 1,
    callStack: [{ nodeId: 1, prevSum: 0, currentSum: 0, action: 'dfs(root, 0)' }],
    activePathNodeIds: [1],
    completedPaths: [],
    totalSum: 0,
    decision: '调用 dfs(root, 0) 进入根节点计算',
    metrics: { '当前节点': 'Node(1)', '当前路径值': '0', '已累加和': '0', '递归深度': '1' },
    message: '调用 dfs(root, 0)，从根节点 Node(1) 开始自顶向下累加数字',
    log: '调用 dfs(root, 0)',
    codeLine: lines.callDfsRoot,
  });

  function dfs(nodeId: number | null, prevSum: number): number {
    if (nodeId === null) {
      steps.push({
        nodes,
        currentNodeId: null,
        callStack: [...callStack],
        activePathNodeIds: [...activePath],
        completedPaths: [...completedPaths],
        totalSum,
        decision: '当前节点为 null，直接返回 0',
        metrics: { '当前节点': 'null', '当前路径值': String(prevSum), '已累加和': String(totalSum), '递归深度': String(callStack.length) },
        message: '递归基底：遇到空节点 null，对总和贡献为 0，返回 0',
        log: `dfs(null, ${prevSum}) -> return 0`,
        codeLine: lines.dfsNullCheck,
      });
      return 0;
    }

    const node = nodeMap.get(nodeId)!;
    activePath.push(nodeId);
    callStack.push({ nodeId, prevSum, currentSum: 0, action: `进入 Node(${node.val})` });

    steps.push({
      nodes,
      currentNodeId: nodeId,
      callStack: [...callStack],
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `进入节点 Node(${node.val})，上级传递的数值为 ${prevSum}`,
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': String(prevSum), '已累加和': String(totalSum), '递归深度': String(callStack.length) },
      message: `dfs 进入 Node(${node.val})，检查节点有效性`,
      log: `进入 dfs(node=${node.val}, prevSum=${prevSum})`,
      codeLine: lines.dfsEntry,
    });

    const currSum = prevSum * 10 + node.val;
    callStack[callStack.length - 1].currentSum = currSum;

    steps.push({
      nodes,
      currentNodeId: nodeId,
      callStack: [...callStack],
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `计算当前路径数值：${prevSum} × 10 + ${node.val} = ${currSum}`,
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': String(currSum), '已累加和': String(totalSum), '递归深度': String(callStack.length) },
      message: `公式推导：sum = prevSum * 10 + node.val = ${prevSum} * 10 + ${node.val} = ${currSum}`,
      log: `Node(${node.val}) 累计数值更新为 ${currSum}`,
      codeLine: lines.calcSum,
    });

    const isLeaf = node.leftId === null && node.rightId === null;
    steps.push({
      nodes,
      currentNodeId: nodeId,
      callStack: [...callStack],
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: isLeaf ? `Node(${node.val}) 是叶子节点！形成一条完整根到叶路径` : `Node(${node.val}) 不是叶子节点，继续向下分治`,
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': String(currSum), '已累加和': String(totalSum), '递归深度': String(callStack.length) },
      message: isLeaf ? `叶子节点判定成功：左右孩子均为空，此分支形成完整数字 ${currSum}` : `叶子判定：非叶子节点，准备递归其子节点`,
      log: `检查叶子节点：Node(${node.val}) -> left=${node.leftId}, right=${node.rightId} (isLeaf=${isLeaf})`,
      codeLine: lines.leafCheck,
    });

    if (isLeaf) {
      totalSum += currSum;
      const pathStr = activePath.map((id) => nodeMap.get(id)!.val).join(' -> ');
      completedPaths.push({ pathStr, value: currSum });

      steps.push({
        nodes,
        currentNodeId: nodeId,
        callStack: [...callStack],
        activePathNodeIds: [...activePath],
        completedPaths: [...completedPaths],
        totalSum,
        decision: `到达叶子节点，返回该路径值 ${currSum}，总和累计达 ${totalSum}`,
        metrics: { '当前节点': `Node(${node.val})`, '当前路径值': String(currSum), '已累加和': String(totalSum), '递归深度': String(callStack.length) },
        message: `叶子收网：路径 [${pathStr}] 对应整数为 ${currSum}，将其计入结果集`,
        log: `叶子节点返回：${currSum}，已累计和：${totalSum}`,
        codeLine: lines.leafReturn,
      });

      activePath.pop();
      callStack.pop();
      return currSum;
    }

    steps.push({
      nodes,
      currentNodeId: nodeId,
      callStack: [...callStack],
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `分别向下递归左右子树 dfs(left, ${currSum}) 与 dfs(right, ${currSum})`,
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': String(currSum), '已累加和': String(totalSum), '递归深度': String(callStack.length) },
      message: `向下探索：先访问左子树 left=${node.leftId ?? 'null'}，再访问右子树 right=${node.rightId ?? 'null'}`,
      log: `Node(${node.val}) 分支递归调用`,
      codeLine: lines.recurseChildren,
    });

    const leftVal = dfs(node.leftId, currSum);
    const rightVal = dfs(node.rightId, currSum);
    const subtotal = leftVal + rightVal;

    steps.push({
      nodes,
      currentNodeId: nodeId,
      callStack: [...callStack],
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `Node(${node.val}) 左右子树合并：${leftVal} + ${rightVal} = ${subtotal}`,
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': String(currSum), '已累加和': String(totalSum), '递归深度': String(callStack.length) },
      message: `子树合并完成：Node(${node.val}) 的左右子节点路径和为 ${subtotal}，回溯向上返回`,
      log: `Node(${node.val}) 回溯：返回 ${subtotal}`,
      codeLine: lines.recurseChildren,
    });

    activePath.pop();
    callStack.pop();
    return subtotal;
  }

  const result = dfs(1, 0);

  steps.push({
    nodes,
    currentNodeId: 1,
    callStack: [],
    activePathNodeIds: nodes.map((n) => n.id),
    visitedNodes: nodes.map((n) => n.id),
    completedPaths: [...completedPaths],
    totalSum: result,
    decision: `全树 DFS 遍历完成！所有根到叶节点路径数字之和为 ${result}`,
    metrics: { '当前节点': '完成', '当前路径值': '-', '已累加和': String(result), '递归深度': '0' },
    message: `计算收官：全树共 ${completedPaths.length} 条有效路径，总和为 ${result}`,
    log: `算法执行完毕，返回结果：${result}`,
    codeLine: lines.done,
  });

  return steps;
}

// =========================================================================
// 表现层渲染 (Render Canvas & Metrics)
// =========================================================================

export class SumRootToLeafStepCompiler {
  public static compileStage1 = buildSumNumbersStage1Steps;
  public static compileStage2 = buildSumNumbersStage2BfsSteps;
  public static compileStage3 = buildSumNumbersStage3StackSteps;
  public static generateSteps = generateSumNumbersSteps;
  public static parseInput = parseTreeInput;
}
