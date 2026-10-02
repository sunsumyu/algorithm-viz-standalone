/**
 * 求根节点到叶节点数字之和可视化器 (Sum Root to Leaf Numbers · LeetCode 129 / Zuoshen Class 036)
 * 采用顶层声明式架构与多阶段演化标准 (Multi-Stage Evolution)
 *
 * Stage 1: 前序遍历与自顶向下累加递归 (LC 129 经典 DFS 解法)
 * Stage 2: 广度优先搜索双队列同步 (BFS Dual Queues 层序遍历)
 * Stage 3: 显式迭代双栈与回溯模拟 (Iterative Explicit Dual Stacks DFS)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr } from './tree-template';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { cloneStateDepTree } from '../../../core/strategies/tree-clone';
import {
  SUM_NUMBERS_PROBLEM_HTML,
  SUM_NUMBERS_ANALYSIS_HTML,
} from './sum-root-to-leaf-numbers-problem-content';
import {
  SUM_NUMBERS_STAGE1_CODES,
  SUM_NUMBERS_STAGE2_CODES,
  SUM_NUMBERS_STAGE3_CODES,
} from './sum-root-to-leaf-numbers-stage-codes';

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
}

export const SUM_NUMBERS_STAGE1_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  callDfsRoot: { java: 3, cpp: 4, python: 10, javascript: 10 },
  dfsEntry: { java: 5, cpp: 6, python: 3, javascript: 2 },
  baseNull: { java: 6, cpp: 7, python: 4, javascript: 3 },
  dfsNullCheck: { java: 6, cpp: 7, python: 4, javascript: 3 },
  calcSum: { java: 7, cpp: 8, python: 6, javascript: 4 },
  leafCheck: { java: 8, cpp: 9, python: 7, javascript: 5 },
  leafReturn: { java: 9, cpp: 10, python: 8, javascript: 6 },
  recurseChildren: { java: 11, cpp: 12, python: 9, javascript: 8 },
  done: { java: 3, cpp: 4, python: 10, javascript: 10 },
};

export const SUM_NUMBERS_STAGE2_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  init: { java: 5, cpp: 6, python: 6, javascript: 4 },
  whileLoop: { java: 9, cpp: 10, python: 8, javascript: 6 },
  pollNode: { java: 10, cpp: 11, python: 9, javascript: 7 },
  leafCheck: { java: 12, cpp: 13, python: 11, javascript: 9 },
  leafAdd: { java: 13, cpp: 14, python: 12, javascript: 10 },
  pushLeft: { java: 16, cpp: 17, python: 15, javascript: 13 },
  pushRight: { java: 20, cpp: 21, python: 18, javascript: 17 },
  done: { java: 25, cpp: 26, python: 20, javascript: 22 },
};

export const SUM_NUMBERS_STAGE3_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  init: { java: 5, cpp: 6, python: 6, javascript: 4 },
  whileLoop: { java: 9, cpp: 10, python: 8, javascript: 6 },
  popNode: { java: 10, cpp: 11, python: 9, javascript: 7 },
  leafCheck: { java: 12, cpp: 13, python: 11, javascript: 9 },
  leafAdd: { java: 13, cpp: 14, python: 12, javascript: 10 },
  pushRight: { java: 16, cpp: 17, python: 14, javascript: 13 },
  pushLeft: { java: 20, cpp: 21, python: 17, javascript: 17 },
  done: { java: 24, cpp: 25, python: 19, javascript: 21 },
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

function parseTreeInput(raw?: string, fallback: (number | null)[] = [4, 9, 0, 5, 1]): (number | null)[] {
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
  const completedPaths: PathRecord[] = [];
  const activePath: number[] = [];
  const callStack: { nodeId: number; prevSum: number; currentSum: number; action: string }[] = [];

  if (!root) {
    steps.push({
      currentNodeId: null,
      activePathNodeIds: [],
      completedPaths: [],
      totalSum: 0,
      decision: '特判返回：树为空',
      metrics: { '当前节点': 'null', '当前路径值': 0, '已累加和': 0, '递归深度': 0 },
      message: '树为空，根到叶节点路径数字之和为 0。',
      log: 'root is null -> return 0',
      codeLine: linesMap.baseNull,
      tree: null,
      stageId: 'stage-1',
    });
    return steps;
  }

  // Step 0: 入口
  steps.push({
    currentNodeId: null,
    activePathNodeIds: [],
    completedPaths: [],
    totalSum: 0,
    decision: `求根到叶节点数字之和：启动递归 dfs(root=${root.val}, prevSum=0)`,
    metrics: { '当前节点': `Node(${root.val})`, '当前路径值': 0, '已累加和': 0, '递归深度': 0 },
    message: '初始化函数，传入根节点 root，初始上层累加和 prevSum = 0',
    log: `Init sumNumbers on root Node(${root.val})`,
    codeLine: linesMap.entry,
    tree: cloneStateDepTree(root),
    stageId: 'stage-1',
  });

  // Step 1: 调用 dfs(root, 0)
  steps.push({
    currentNodeId: root.val,
    activePathNodeIds: [root.val],
    completedPaths: [],
    totalSum: 0,
    decision: `调用 dfs(root=${root.val}, 0) 开始自顶向下累加数字`,
    metrics: { '当前节点': `Node(${root.val})`, '当前路径值': 0, '已累加和': 0, '递归深度': 1 },
    message: `调用 dfs(root, 0)，从根节点 Node(${root.val}) 开始前序探索`,
    log: `Call dfs(root=${root.val}, 0)`,
    codeLine: linesMap.callDfsRoot,
    tree: cloneStateDepTree(root),
    stageId: 'stage-1',
  });

  let totalSum = 0;

  function dfs(node: TreeNode | null, prevSum: number): number {
    if (!node) {
      steps.push({
        currentNodeId: null,
        activePathNodeIds: [...activePath],
        completedPaths: [...completedPaths],
        totalSum,
        decision: '当前节点为 null，直接返回 0',
        metrics: { '当前节点': 'null', '当前路径值': prevSum, '已累加和': totalSum, '递归深度': callStack.length },
        message: '递归基底：遇到空节点 null，对总和贡献为 0，返回 0',
        log: `dfs(null, ${prevSum}) -> return 0`,
        codeLine: linesMap.baseNull,
        tree: cloneStateDepTree(root),
        stageId: 'stage-1',
      });
      return 0;
    }

    activePath.push(node.val);
    callStack.push({ nodeId: node.val, prevSum, currentSum: 0, action: `进入 Node(${node.val})` });

    steps.push({
      currentNodeId: node.val,
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `进入节点 Node(${node.val})，上级传递的数值为 ${prevSum}`,
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': prevSum, '已累加和': totalSum, '递归深度': callStack.length },
      message: `dfs 进入 Node(${node.val})，检查节点有效性`,
      log: `Enter dfs(node=${node.val}, prevSum=${prevSum})`,
      codeLine: linesMap.dfsEntry,
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
    });

    const currSum = prevSum * 10 + node.val;
    callStack[callStack.length - 1].currentSum = currSum;

    steps.push({
      currentNodeId: node.val,
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `计算当前路径数值：${prevSum} × 10 + ${node.val} = ${currSum}`,
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': currSum, '已累加和': totalSum, '递归深度': callStack.length },
      message: `公式推导：currSum = prevSum * 10 + node.val = ${prevSum} * 10 + ${node.val} = ${currSum}`,
      log: `Node(${node.val}) 累计数值为 ${currSum}`,
      codeLine: linesMap.calcSum,
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
    });

    const isLeaf = !node.left && !node.right;
    steps.push({
      currentNodeId: node.val,
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: isLeaf ? `Node(${node.val}) 是叶子节点！形成一条完整根到叶路径` : `Node(${node.val}) 不是叶子节点，继续向下分治`,
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': currSum, '已累加和': totalSum, '递归深度': callStack.length },
      message: isLeaf ? `叶子判定：左右孩子皆空，产生完整路径数值 ${currSum}` : `叶子判定：存在子节点，继续向下探索左右分支`,
      log: `Check leaf: Node(${node.val}) isLeaf=${isLeaf}`,
      codeLine: linesMap.leafCheck,
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
    });

    if (isLeaf) {
      totalSum += currSum;
      const pathStr = activePath.join(' ➔ ');
      completedPaths.push({ pathStr, value: currSum });

      steps.push({
        currentNodeId: node.val,
        activePathNodeIds: [...activePath],
        completedPaths: [...completedPaths],
        totalSum,
        decision: `到达叶子节点，返回该路径值 ${currSum}，总和累计达 ${totalSum}`,
        metrics: { '当前节点': `Node(${node.val})`, '当前路径值': currSum, '已累加和': totalSum, '递归深度': callStack.length },
        message: `叶子收网：路径 [${pathStr}] 形成整数 ${currSum}，将其计入结果集`,
        log: `Leaf return ${currSum}, totalSum=${totalSum}`,
        codeLine: linesMap.leafReturn,
        tree: cloneStateDepTree(root),
        stageId: 'stage-1',
      });

      activePath.pop();
      callStack.pop();
      return currSum;
    }

    steps.push({
      currentNodeId: node.val,
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `分别向下递归左右子树 dfs(left, ${currSum}) 与 dfs(right, ${currSum})`,
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': currSum, '已累加和': totalSum, '递归深度': callStack.length },
      message: `向下探索：先访问左子树 left=${node.left?.val ?? 'null'}，再访问右子树 right=${node.right?.val ?? 'null'}`,
      log: `Node(${node.val}) 分支递归调用`,
      codeLine: linesMap.recurseChildren,
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
    });

    const leftVal = dfs(node.left, currSum);
    const rightVal = dfs(node.right, currSum);
    const subtotal = leftVal + rightVal;

    steps.push({
      currentNodeId: node.val,
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `Node(${node.val}) 左右子树合并：${leftVal} + ${rightVal} = ${subtotal}`,
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': currSum, '已累加和': totalSum, '递归深度': callStack.length },
      message: `子树合并完成：Node(${node.val}) 的左右子节点路径和为 ${subtotal}，回溯向上返回`,
      log: `Node(${node.val}) return ${subtotal}`,
      codeLine: linesMap.recurseChildren,
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
    });

    activePath.pop();
    callStack.pop();
    return subtotal;
  }

  const finalResult = dfs(root, 0);

  steps.push({
    currentNodeId: null,
    activePathNodeIds: [],
    completedPaths: [...completedPaths],
    totalSum: finalResult,
    decision: `🎉 全树 DFS 遍历完成！所有根到叶节点路径数字之和为 ${finalResult}`,
    metrics: { '当前节点': '完成', '当前路径值': '-', '已累加和': finalResult, '递归深度': 0 },
    message: `计算收官：全树共 ${completedPaths.length} 条有效路径，总和为 ${finalResult}`,
    log: `SumNumbers Stage 1 done. Total = ${finalResult}`,
    codeLine: linesMap.done,
    tree: cloneStateDepTree(root),
    stageId: 'stage-1',
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

  // Done
  steps.push({
    currentNodeId: null,
    activePathNodeIds: [],
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

  // Done
  steps.push({
    currentNodeId: null,
    activePathNodeIds: [],
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
export function generateSumNumbersSteps(nodesInput?: TreeNodeData[]): SumNumbersStep[] {
  const nodes = nodesInput ?? buildDefaultTree();
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
    currentNodeId: null,
    callStack: [],
    activePathNodeIds: [],
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
export function renderSumNumbersCanvas(container: HTMLElement, step: SumNumbersStep): void {
  const { nodes, currentNodeId, activePathNodeIds, completedPaths, totalSum, tree, queueState, stackState } = step;

  if (tree) {
    TreeCanvasAdapter.renderTree(container, {
      tree,
      current: currentNodeId,
      highlightedNodes: activePathNodeIds,
      primaryColor: '#f59e0b',
      secondaryColor: '#38bdf8',
      visitedColor: '#34d399',
    });
  } else if (nodes && nodes.length > 0) {
    const linesSvg: string[] = [];
    const nodesSvg: string[] = [];
    const nodeMap = new Map<number, TreeNodeData>();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    for (const node of nodes) {
      if (node.leftId !== null) {
        const left = nodeMap.get(node.leftId);
        if (left) {
          const isPathActive = activePathNodeIds.includes(node.id) && activePathNodeIds.includes(left.id);
          linesSvg.push(
            `<line x1="${node.x}" y1="${node.y}" x2="${left.x}" y2="${left.y}" ` +
              `stroke="${isPathActive ? '#38bdf8' : 'rgba(148, 163, 184, 0.3)'}" ` +
              `stroke-width="${isPathActive ? 3.5 : 1.8}" stroke-linecap="round" />`
          );
        }
      }
      if (node.rightId !== null) {
        const right = nodeMap.get(node.rightId);
        if (right) {
          const isPathActive = activePathNodeIds.includes(node.id) && activePathNodeIds.includes(right.id);
          linesSvg.push(
            `<line x1="${node.x}" y1="${node.y}" x2="${right.x}" y2="${right.y}" ` +
              `stroke="${isPathActive ? '#38bdf8' : 'rgba(148, 163, 184, 0.3)'}" ` +
              `stroke-width="${isPathActive ? 3.5 : 1.8}" stroke-linecap="round" />`
          );
        }
      }
    }

    for (const node of nodes) {
      const isCurrent = node.id === currentNodeId;
      const inActivePath = activePathNodeIds.includes(node.id);
      const isLeaf = node.leftId === null && node.rightId === null;

      let fillColor = 'rgba(30, 41, 59, 0.85)';
      let strokeColor = 'rgba(148, 163, 184, 0.4)';
      let strokeWidth = 1.5;

      if (isCurrent) {
        fillColor = 'rgba(245, 158, 11, 0.3)';
        strokeColor = '#f59e0b';
        strokeWidth = 3;
      } else if (inActivePath) {
        fillColor = 'rgba(56, 189, 248, 0.25)';
        strokeColor = '#38bdf8';
        strokeWidth = 2.5;
      } else if (isLeaf) {
        fillColor = 'rgba(16, 185, 129, 0.15)';
        strokeColor = 'rgba(52, 211, 153, 0.5)';
      }

      nodesSvg.push(`
        <g transform="translate(${node.x}, ${node.y})">
          <circle r="18" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
          <text y="5" text-anchor="middle" fill="#f8fafc" font-size="13" font-weight="700" font-family="monospace">${node.val}</text>
          ${isLeaf ? `<text y="28" text-anchor="middle" fill="#34d399" font-size="9" font-family="sans-serif">Leaf</text>` : ''}
        </g>
      `);
    }

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
        <svg width="400" height="230" viewBox="40 10 360 210" style="max-width: 100%; height: auto;">
          ${linesSvg.join('\n')}
          ${nodesSvg.join('\n')}
        </svg>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 240px; width: 100%;">
        <svg width="240" height="120" viewBox="0 0 240 120">
          <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空树或初始化</text>
        </svg>
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">准备自顶向下计算根到叶路径数字之和...</span>
      </div>
    `;
  }

  // 联动 Card 2 指标与结构详情
  const root = container.closest('#algo-sum-root-to-leaf-numbers-view') || container.parentElement;
  if (root) {
    const totalSumEl = root.querySelector('#metric-total-sum');
    const activePathEl = root.querySelector('#metric-active-path');
    const pathsCountEl = root.querySelector('#metric-paths-count');

    if (totalSumEl) totalSumEl.textContent = `${totalSum}`;
    if (activePathEl) activePathEl.textContent = activePathNodeIds.length > 0 ? activePathNodeIds.join(' ➔ ') : '空';
    if (pathsCountEl) pathsCountEl.textContent = `${completedPaths.length}`;

    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      const pathsHtml =
        completedPaths.length === 0
          ? `<div style="color: #94a3b8; font-size: 11px; font-style: italic;">暂无已完成的叶子路径</div>`
          : completedPaths
              .map(
                (p) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; border-radius: 6px; background: rgba(52, 211, 153, 0.1); border: 1px solid rgba(52, 211, 153, 0.25);">
                  <span style="font-family: monospace; font-size: 11px; color: #334155;">${p.pathStr}</span>
                  <span style="font-family: monospace; font-size: 12px; font-weight: 700; color: #059669;">+${p.value}</span>
                </div>
              `
              )
              .join('');

      let structureTitle = '递归调用栈';
      let structureContent = '栈为空 []';

      if (queueState) {
        structureTitle = `BFS 节点与数值队列 (${queueState.length})`;
        structureContent =
          queueState.length > 0
            ? queueState.map((q) => `[Node(${q.node}), sum=${q.sum}]`).join(' ➔ ')
            : '队列为空 []';
      } else if (stackState) {
        structureTitle = `显式迭代双栈 (${stackState.length})`;
        structureContent =
          stackState.length > 0
            ? stackState.map((s) => `[Node(${s.node}), sum=${s.sum}]`).join(' ➔ ')
            : '栈为空 []';
      } else if (step.callStack && step.callStack.length > 0) {
        structureTitle = `递归调用栈 (${step.callStack.length})`;
        structureContent = step.callStack
          .slice(-3)
          .map((cs) => `[Node(${cs.nodeId}), sum=${cs.currentSum}]`)
          .join(' ➔ ');
      }

      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #475569; padding: 6px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
              <span style="font-size: 10.5px; color: #64748b;">${structureTitle}:</span>
              <div style="font-weight: 700; font-size: 11.5px; color: #2563eb; overflow-x: auto; white-space: nowrap;">
                ${structureContent}
              </div>
            </div>
            <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
              <span style="font-size: 10.5px; color: #64748b;">当前考察节点:</span>
              <div style="font-weight: 700; font-size: 12px; color: #0d9488;">
                ${currentNodeId !== null ? `Node(${currentNodeId})` : '已收敛'}
              </div>
            </div>
          </div>

          <div style="padding: 8px 10px; background: #f1f5f9; border-radius: 6px;">
            <div style="font-weight: 700; color: #1e293b; margin-bottom: 2px;">🧭 决策推演: ${step.decision}</div>
            <div>${step.message}</div>
          </div>

          <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="font-size: 11px; font-weight: 700; color: #059669; margin-bottom: 4px;">
              已达成的叶子路径 (${completedPaths.length})
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px; max-height: 80px; overflow-y: auto;">
              ${pathsHtml}
            </div>
          </div>
        </div>
      `;
    }
  }
}

// =========================================================================
// 顶层声明式算法注册 (Register Declarative Algorithm)
// =========================================================================
export const sumRootToLeafNumbersVisualizer = registerDeclarativeAlgorithm<SumNumbersStep>({
  id: 'sum-root-to-leaf-numbers',
  name: '求根节点到叶节点数字之和',
  category: 'tree',
  icon: '🌿',
  difficulty: 2,
  levelOrder: 129,
  aliases: ['leetcode-129', 'sum-numbers', 'sum-root-to-leaf'],
  learningGoal: '掌握二叉树自顶向下递归路径数值累加，理解叶子判定、BFS 双队列同步与显式双栈迭代机制',
  timeComplexity: 'O(N)',
  spaceComplexity: 'O(H)',
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序数组 (逗号分隔)',
      type: 'text',
      defaultValue: '4, 9, 0, 5, 1',
      placeholder: '例如: 4, 9, 0, 5, 1',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 2: 经典 1026',
      values: { 'input-tree': '4, 9, 0, 5, 1' },
      description: '根 4，左 9(5, 1)，右 0，路径 495 + 491 + 40 = 1026',
    },
    {
      label: 'LeetCode 示例 1: 简单三节点 25',
      values: { 'input-tree': '1, 2, 3' },
      description: '根 1，左 2，右 3，路径 12 + 13 = 25',
    },
    {
      label: '三叶子分叉树 281',
      values: { 'input-tree': '1, 2, 3, null, null, 4, 5' },
      description: '根 1，左 2，右 3(4, 5)，路径 12 + 134 + 135 = 281',
    },
    {
      label: '单节点根树 9',
      values: { 'input-tree': '9' },
      description: '仅包含根节点 9',
    },
  ],
  metrics: [
    { id: 'total-sum', label: '路径数字总和', color: '#10b981' },
    { id: 'active-path', label: '当前探索路径', color: '#0ea5e9' },
    { id: 'paths-count', label: '已达成叶子路径数', color: '#f59e0b' },
  ],
  codeLanguages: SUM_NUMBERS_STAGE1_CODES,
  problemHtml: SUM_NUMBERS_PROBLEM_HTML,
  analysisHtml: SUM_NUMBERS_ANALYSIS_HTML,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 前序遍历与自顶向下累加递归 (LC 129)',
      shortName: '前序递归累加',
      num: 1,
      codeLanguages: SUM_NUMBERS_STAGE1_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeInput(inputs?.['input-tree']);
        const root = buildTreeFromArr(arr);
        return buildSumNumbersStage1Steps(root);
      },
      renderCanvas: (container, step) => renderSumNumbersCanvas(container, step),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 广度优先搜索双队列同步 (BFS 层序)',
      shortName: 'BFS 双队列同步',
      num: 2,
      codeLanguages: SUM_NUMBERS_STAGE2_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeInput(inputs?.['input-tree']);
        const root = buildTreeFromArr(arr);
        return buildSumNumbersStage2BfsSteps(root);
      },
      renderCanvas: (container, step) => renderSumNumbersCanvas(container, step),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 显式迭代双栈与回溯模拟 (零系统递归栈)',
      shortName: '显式双栈迭代',
      num: 3,
      codeLanguages: SUM_NUMBERS_STAGE3_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeInput(inputs?.['input-tree']);
        const root = buildTreeFromArr(arr);
        return buildSumNumbersStage3StackSteps(root);
      },
      renderCanvas: (container, step) => renderSumNumbersCanvas(container, step),
    },
  ],
  generateSteps: (inputs) => {
    const arr = parseTreeInput(inputs?.['input-tree']);
    const root = buildTreeFromArr(arr);
    return buildSumNumbersStage1Steps(root);
  },
  buildSteps: (inputs) => {
    const arr = parseTreeInput(inputs?.['input-tree']);
    const root = buildTreeFromArr(arr);
    return buildSumNumbersStage1Steps(root);
  },
  renderCanvas: (container, step) => renderSumNumbersCanvas(container, step),
});
