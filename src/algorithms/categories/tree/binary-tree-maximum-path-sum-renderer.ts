/**
 * 二叉树中的最大路径和可视化器 (Binary Tree Maximum Path Sum · LeetCode 124 / Zuoshen Class 077)
 * 采用顶层声明式架构与多阶段演化标准 (Multi-Stage Evolution)
 *
 * Stage 1: 递归后序遍历与单边最大贡献分离 (LC 124 经典树形 DP)
 * Stage 2: 树形 DP 二元信息汇聚模型 (Zuoshen Class 077 套路)
 * Stage 3: 显式后序遍历与状态表映射 (零系统栈递归)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr } from './tree-template';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { cloneStateDepTree } from '../../../core/strategies/tree-clone';
import {
  MAX_PATH_SUM_PROBLEM_HTML,
  MAX_PATH_SUM_ANALYSIS_HTML,
} from './binary-tree-maximum-path-sum-problem-content';
import {
  MAX_PATH_SUM_STAGE1_CODES,
  MAX_PATH_SUM_STAGE2_CODES,
  MAX_PATH_SUM_STAGE3_CODES,
  MAX_PATH_SUM_STAGE1_LINES,
  MAX_PATH_SUM_STAGE2_LINES,
  MAX_PATH_SUM_STAGE3_LINES,
} from './binary-tree-maximum-path-sum-stage-codes';
import {
  RecursiveCallTraceAdapter,
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from '../../../core/renderers/adapters/recursive-call-trace-adapter';

export interface PathSumStep extends StepBase {
  stepIndex?: number;
  currentNode: number | null;
  leftGain: number;
  rightGain: number;
  currentArchSum: number;
  maxGlobalSum: number;
  bestArchPath: number[];
  callStack: number[];
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  tree?: TreeNode | null;
  stageId?: string;
  metrics?: Record<string, string | number>;
  visitedNodes?: number[];
  highlightedNodes?: number[];
  action?: string;
  phase?: string;
  callTrace?: RecursiveCallTraceSnapshot;
  infoResult?: { maxPathSum: number; maxGainFromRoot: number } | null;
  stackState?: number[];
  gainMapState?: { val: number; gain: number }[];
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
  MAX_PATH_SUM_STAGE1_CODES,
  MAX_PATH_SUM_STAGE2_CODES,
  MAX_PATH_SUM_STAGE3_CODES,
  MAX_PATH_SUM_STAGE1_LINES,
  MAX_PATH_SUM_STAGE2_LINES,
  MAX_PATH_SUM_STAGE3_LINES,
};

export const MAX_PATH_SUM_CODES = MAX_PATH_SUM_STAGE1_CODES;
export const MAX_PATH_SUM_CODE_LINES = MAX_PATH_SUM_STAGE1_LINES;

function parseTreeInput(raw?: string, fallback: (number | null)[] = [-10, 9, 20, null, null, 15, 7]): (number | null)[] {
  if (!raw || !raw.trim()) return fallback;
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .map((s) => (s === 'null' || s === 'nil' || s === 'none' || s === '' ? null : Number(s)));
}

// =========================================================================
// Stage 1: 递归后序遍历与单边最大贡献分离 (LC 124 经典树形 DP)
// =========================================================================
export function buildMaxPathSumStage1Steps(root: TreeNode | null): PathSumStep[] {
  const steps: PathSumStep[] = [];
  const lines = MAX_PATH_SUM_STAGE1_LINES;
  const trace = new RecursiveCallTraceBuilder();

  if (!root) {
    trace.addHeader('maxPathSum(root = null)', 0, '根特判');
    trace.addConditionHit('root == null -> return 0', 0);
    trace.addReturnLeaf('return 0', 0);
    trace.addFinalResult('最终最大路径和: 0 (空树)', 0, undefined, 0);

    steps.push({
      currentNode: null,
      leftGain: 0,
      rightGain: 0,
      currentArchSum: 0,
      maxGlobalSum: 0,
      bestArchPath: [],
      callStack: [],
      decision: '算法启动：空树特判',
      action: 'entry',
      phase: 'init',
      message: '传入二叉树为空树 (null)，启动特判。',
      log: 'maxPathSum(root = null)',
      codeLine: lines.entry,
      statusBadge: { text: '空树', type: 'info' },
      tree: null,
      stageId: 'stage-1',
      metrics: { '全局最大路径和': 0, '当前处理节点': 'null' },
      callTrace: trace.snapshot(),
    });

    steps.push({
      currentNode: null,
      leftGain: 0,
      rightGain: 0,
      currentArchSum: 0,
      maxGlobalSum: 0,
      bestArchPath: [],
      callStack: [],
      decision: '特判返回：树为空，最大路径和为 0',
      action: 'done',
      phase: 'return',
      message: '树为空，最大路径和为 0。',
      log: 'root is null -> return 0',
      codeLine: lines.done,
      statusBadge: { text: '结果: 0', type: 'info' },
      tree: null,
      stageId: 'stage-1',
      metrics: { '全局最大路径和': 0 },
      callTrace: trace.snapshot(),
    });

    return steps;
  }

  let globalMax = -Infinity;
  let bestPath: number[] = [];
  const callStack: number[] = [];
  const visitedVals: number[] = [];

  trace.addHeader(`maxPathSum(root = ${root.val})`, 0, '启动全局最优搜索');

  // Step 0: 入口
  steps.push({
    currentNode: root.val,
    leftGain: 0,
    rightGain: 0,
    currentArchSum: 0,
    maxGlobalSum: 0,
    bestArchPath: [],
    callStack: [],
    decision: `启动二叉树最大路径和求解：root = ${root.val}`,
    action: 'entry',
    phase: 'init',
    message: '核心思想：单边最大收益向上传递，跨根拱形全路径和就地更新全局最优。',
    log: `Init maxPathSum on root ${root.val}`,
    codeLine: lines.entry,
    statusBadge: { text: '算法启动', type: 'info' },
    tree: cloneStateDepTree(root),
    stageId: 'stage-1',
    metrics: { '全局最大路径和': '初始化', '当前处理节点': root.val },
    callTrace: trace.snapshot(),
  });

  // Step 1: 调用 maxGain(root)
  trace.addRecursePrep(`发起根调用 maxGain(root=${root.val})`, 0);
  steps.push({
    currentNode: root.val,
    leftGain: 0,
    rightGain: 0,
    currentArchSum: 0,
    maxGlobalSum: 0,
    bestArchPath: [],
    callStack: [],
    decision: `准备调用辅助函数 maxGain(${root.val}) 发起全局深度探测`,
    action: 'callRoot',
    phase: 'call',
    message: `以根节点 ${root.val} 为起始点，发起自顶向下 DFS 探查。`,
    log: `maxGain(${root.val}) called from root`,
    codeLine: lines.callRoot,
    statusBadge: { text: `探测根 ${root.val}`, type: 'info' },
    tree: cloneStateDepTree(root),
    stageId: 'stage-1',
    metrics: { '全局最大路径和': '探测中', '当前处理节点': root.val },
    callTrace: trace.snapshot(),
  });

  function dfs(node: TreeNode | null, depth: number): number {
    if (!node) {
      trace.addHeader('maxGain(null)', depth, '空子树基底');
      trace.addConditionHit('node == null -> return 0', depth);
      trace.addReturnLeaf('return 0 (空节点无收益贡献)', depth);
      steps.push({
        currentNode: null,
        leftGain: 0,
        rightGain: 0,
        currentArchSum: 0,
        maxGlobalSum: globalMax === -Infinity ? 0 : globalMax,
        bestArchPath: [...bestPath],
        callStack: [...callStack],
        decision: '空节点基准退出：if (node == null) return 0',
        action: 'baseNull',
        phase: 'base',
        message: '遇到空子节点，返回单边有效贡献 0。',
        log: 'dfs(null) -> 0',
        codeLine: lines.baseNull,
        statusBadge: { text: '空节点: 0', type: 'info' },
        tree: cloneStateDepTree(root),
        stageId: 'stage-1',
        metrics: { '当前节点': 'null', '单边增益贡献': 0 },
        visitedNodes: [...visitedVals],
        callTrace: trace.snapshot(),
      });
      return 0;
    }

    callStack.push(node.val);
    visitedVals.push(node.val);

    trace.addHeader(`maxGain(Node ${node.val})`, depth, `节点值 = ${node.val}`);
    steps.push({
      currentNode: node.val,
      leftGain: 0,
      rightGain: 0,
      currentArchSum: 0,
      maxGlobalSum: globalMax === -Infinity ? node.val : globalMax,
      bestArchPath: [...bestPath],
      callStack: [...callStack],
      decision: `进入节点 [${node.val}]：启动单边增益与拱形和评估`,
      action: 'dfsEntry',
      phase: 'enter',
      message: `进入节点 ${node.val}，即将向左、右子树索取延伸最大增益。`,
      log: `Enter node ${node.val}`,
      codeLine: lines.dfsEntry,
      statusBadge: { text: `进入 Node ${node.val}`, type: 'info' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
      metrics: { '当前处理节点': node.val, '递归栈深度': callStack.length },
      visitedNodes: [...visitedVals],
      callTrace: trace.snapshot(),
    });

    // 探查左子树
    trace.addRecursePrep(`Node ${node.val} 探查左子树 maxGain(${node.left ? node.left.val : 'null'})`, depth);
    steps.push({
      currentNode: node.val,
      leftGain: 0,
      rightGain: 0,
      currentArchSum: 0,
      maxGlobalSum: globalMax === -Infinity ? node.val : globalMax,
      bestArchPath: [...bestPath],
      callStack: [...callStack],
      decision: `节点 [${node.val}]：向下探查左子树 maxGain(${node.left ? node.left.val : 'null'})`,
      action: 'calcLeft',
      phase: 'recurse',
      message: `调用 maxGain(${node.left ? node.left.val : 'null'})。`,
      log: `Node ${node.val} explore left`,
      codeLine: lines.calcLeft,
      statusBadge: { text: `探查左子树`, type: 'info' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
      metrics: { '当前处理节点': node.val, '递归栈深度': callStack.length },
      visitedNodes: [...visitedVals],
      callTrace: trace.snapshot(),
    });

    const rawLeft = dfs(node.left, depth + 1);
    const leftGain = Math.max(0, rawLeft);

    trace.addUnwindCalc(`Node ${node.val} 左子树返回: raw=${rawLeft}, leftGain=max(0, ${rawLeft})=${leftGain}`, depth);
    steps.push({
      currentNode: node.val,
      leftGain,
      rightGain: 0,
      currentArchSum: 0,
      maxGlobalSum: globalMax === -Infinity ? node.val : globalMax,
      bestArchPath: [...bestPath],
      callStack: [...callStack],
      decision: `节点 [${node.val}]：左子树原始返回 ${rawLeft} ➔ 截断负数有效收益 = ${leftGain}`,
      action: 'leftDone',
      phase: 'eval',
      message: `若左子树贡献为负数则舍弃（取0），当前采纳左单侧增益 = ${leftGain}。`,
      log: `Node ${node.val} leftDone: rawLeft=${rawLeft}, leftGain=${leftGain}`,
      codeLine: lines.leftDone,
      statusBadge: { text: `左收益 ${leftGain}`, type: 'info' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
      metrics: { '当前处理节点': node.val, '左子树收益': leftGain },
      visitedNodes: [...visitedVals],
      callTrace: trace.snapshot(),
    });

    // 探查右子树
    trace.addRecursePrep(`Node ${node.val} 探查右子树 maxGain(${node.right ? node.right.val : 'null'})`, depth);
    steps.push({
      currentNode: node.val,
      leftGain,
      rightGain: 0,
      currentArchSum: 0,
      maxGlobalSum: globalMax === -Infinity ? node.val : globalMax,
      bestArchPath: [...bestPath],
      callStack: [...callStack],
      decision: `节点 [${node.val}]：向下探查右子树 maxGain(${node.right ? node.right.val : 'null'})`,
      action: 'calcRight',
      phase: 'recurse',
      message: `调用 maxGain(${node.right ? node.right.val : 'null'})。`,
      log: `Node ${node.val} explore right`,
      codeLine: lines.calcRight,
      statusBadge: { text: `探查右子树`, type: 'info' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
      metrics: { '当前处理节点': node.val, '递归栈深度': callStack.length },
      visitedNodes: [...visitedVals],
      callTrace: trace.snapshot(),
    });

    const rawRight = dfs(node.right, depth + 1);
    const rightGain = Math.max(0, rawRight);

    trace.addUnwindCalc(`Node ${node.val} 右子树返回: raw=${rawRight}, rightGain=max(0, ${rawRight})=${rightGain}`, depth);
    steps.push({
      currentNode: node.val,
      leftGain,
      rightGain,
      currentArchSum: 0,
      maxGlobalSum: globalMax === -Infinity ? node.val : globalMax,
      bestArchPath: [...bestPath],
      callStack: [...callStack],
      decision: `节点 [${node.val}]：右子树原始返回 ${rawRight} ➔ 截断负数有效收益 = ${rightGain}`,
      action: 'rightDone',
      phase: 'eval',
      message: `当前采纳右单侧增益 = ${rightGain}。左右两侧均就绪，准备汇算跨根拱形全路径和。`,
      log: `Node ${node.val} rightDone: rawRight=${rawRight}, rightGain=${rightGain}`,
      codeLine: lines.rightDone,
      statusBadge: { text: `右收益 ${rightGain}`, type: 'info' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
      metrics: { '当前处理节点': node.val, '右子树收益': rightGain },
      visitedNodes: [...visitedVals],
      callTrace: trace.snapshot(),
    });

    // 汇算拱形全路径和
    const currentArch = node.val + leftGain + rightGain;
    trace.addConditionHit(`Node ${node.val} 拱形和: ${node.val} + ${leftGain} + ${rightGain} = ${currentArch}`, depth);
    steps.push({
      currentNode: node.val,
      leftGain,
      rightGain,
      currentArchSum: currentArch,
      maxGlobalSum: globalMax === -Infinity ? currentArch : globalMax,
      bestArchPath: [...bestPath],
      callStack: [...callStack],
      decision: `节点 [${node.val}] 计算拱形全路径和：val(${node.val}) + left(${leftGain}) + right(${rightGain}) = ${currentArch}`,
      action: 'calcArch',
      phase: 'aggregate',
      message: `拱形全路径以 Node(${node.val}) 为最高折返点，汇算值为 ${currentArch}。`,
      log: `Node ${node.val} currentArch=${currentArch}`,
      codeLine: lines.calcArch,
      statusBadge: { text: `拱形和 ${currentArch}`, type: 'info' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
      metrics: { '当前处理节点': node.val, '当前拱形和': currentArch },
      visitedNodes: [...visitedVals],
      callTrace: trace.snapshot(),
    });

    // 检验是否刷新全局最优
    const isNewBest = currentArch > globalMax;
    if (isNewBest) {
      globalMax = currentArch;
      const path: number[] = [node.val];
      if (node.left && leftGain > 0) path.unshift(node.left.val);
      if (node.right && rightGain > 0) path.push(node.right.val);
      bestPath = path;
      trace.addConditionHit(`🎉 突破全局最优: maxSum = ${globalMax} (拱形路径: [${bestPath.join(' ➔ ')}])`, depth);
    }

    steps.push({
      currentNode: node.val,
      leftGain,
      rightGain,
      currentArchSum: currentArch,
      maxGlobalSum: globalMax,
      bestArchPath: [...bestPath],
      callStack: [...callStack],
      decision: isNewBest
        ? `🎉 节点 [${node.val}] 拱形和 ${currentArch} 突破全局纪录！maxSum 更新为 ${globalMax}`
        : `节点 [${node.val}] 拱形和 ${currentArch} 未超越当前全局最优 ${globalMax}，保持纪录`,
      action: 'updateMax',
      phase: 'update',
      message: isNewBest
        ? `全局最大路径和刷新为 ${globalMax}！当前最优路径节点集: [${bestPath.join(', ')}]。`
        : `当前全局最高记录仍为 ${globalMax}。`,
      log: `Node ${node.val} updateMax: globalMax=${globalMax}`,
      codeLine: lines.updateMax,
      statusBadge: { text: isNewBest ? `新纪录 ${globalMax}` : `记录 ${globalMax}`, type: isNewBest ? 'success' : 'info' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
      metrics: { '当前处理节点': node.val, '全局最优': globalMax, '最优拱形路径': bestPath.join(' ➔ ') },
      visitedNodes: [...visitedVals],
      highlightedNodes: [...bestPath],
      callTrace: trace.snapshot(),
    });

    // 向父层汇报单边最大增益
    const singleGain = node.val + Math.max(leftGain, rightGain);
    trace.addReturnLeaf(`向父层返回单边最大增益: ${node.val} + max(${leftGain}, ${rightGain}) = ${singleGain}`, depth);

    steps.push({
      currentNode: node.val,
      leftGain,
      rightGain,
      currentArchSum: currentArch,
      maxGlobalSum: globalMax,
      bestArchPath: [...bestPath],
      callStack: [...callStack],
      decision: `节点 [${node.val}] 向上汇报单边增益：${node.val} + max(${leftGain}, ${rightGain}) = ${singleGain}`,
      action: 'returnSingle',
      phase: 'return',
      message: `父节点若要延伸至本子树，只能选择左或右一条分支，单侧最大贡献为 ${singleGain}。`,
      log: `Node ${node.val} return singleGain=${singleGain}`,
      codeLine: lines.returnSingle,
      statusBadge: { text: `单边返回 ${singleGain}`, type: 'info' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
      metrics: { '当前处理节点': node.val, '单边汇报增益': singleGain },
      visitedNodes: [...visitedVals],
      highlightedNodes: [...bestPath],
      callTrace: trace.snapshot(),
    });

    callStack.pop();
    return singleGain;
  }

  dfs(root, 0);

  const allTreeVals = collectTreeValues(root);
  trace.addFinalResult(`全树搜索完毕！最终全局最大路径和 = ${globalMax}`, 0, undefined, globalMax);

  steps.push({
    currentNode: root.val,
    leftGain: 0,
    rightGain: 0,
    currentArchSum: globalMax,
    maxGlobalSum: globalMax,
    bestArchPath: [...bestPath],
    callStack: [],
    decision: `🎉 全树推演完毕！全局最大路径和 = ${globalMax}`,
    action: 'done',
    phase: 'finish',
    message: `单次后序遍历 O(N) 完美闭环，全局最大和为 ${globalMax}。最优拱形路径: [${bestPath.join(' ➔ ')}]。`,
    log: `Max path sum complete. Result=${globalMax}`,
    codeLine: lines.done,
    statusBadge: { text: `最终最大和: ${globalMax}`, type: 'success' },
    tree: cloneStateDepTree(root),
    stageId: 'stage-1',
    visitedNodes: allTreeVals,
    highlightedNodes: bestPath.length > 0 ? [...bestPath] : allTreeVals,
    metrics: { '最终最大路径和': globalMax, '最优节点集': bestPath.join(' ➔ ') },
    callTrace: trace.snapshot(),
  });

  return steps;
}

// 保持历史导出不变 (100% 向后兼容)
export function generateMaxPathSumSteps(): PathSumStep[] {
  const root = buildTreeFromArr([-10, 9, 20, null, null, 15, 7]);
  return buildMaxPathSumStage1Steps(root);
}

// =========================================================================
// Stage 2: 树形 DP 二元信息汇聚模型 (Tree DP Info Tuple · Zuoshen Class 077)
// =========================================================================
interface TreeInfo {
  maxPathSum: number;
  maxGainFromRoot: number;
}

export function buildMaxPathSumStage2InfoSteps(root: TreeNode | null): PathSumStep[] {
  const steps: PathSumStep[] = [];
  const lines = MAX_PATH_SUM_STAGE2_LINES;

  if (!root) {
    steps.push({
      currentNode: null,
      leftGain: 0,
      rightGain: 0,
      currentArchSum: 0,
      maxGlobalSum: 0,
      bestArchPath: [],
      callStack: [],
      decision: '算法启动：空树特判',
      action: 'entry',
      phase: 'init',
      message: '传入二叉树为空树 (null)，启动特判。',
      log: 'root is null -> return 0',
      codeLine: lines.entry,
      statusBadge: { text: '空树', type: 'info' },
      tree: null,
      stageId: 'stage-2',
      metrics: { '全局最大路径和': 0, '单边增益': 0 },
    });

    steps.push({
      currentNode: null,
      leftGain: 0,
      rightGain: 0,
      currentArchSum: 0,
      maxGlobalSum: 0,
      bestArchPath: [],
      callStack: [],
      decision: '特判返回：树为空，返回 0',
      action: 'baseNull',
      phase: 'return',
      message: '树为空，Info { maxPathSum: 0, maxGainFromRoot: 0 }。',
      log: 'root is null -> return 0',
      codeLine: lines.baseNull,
      statusBadge: { text: '结果: 0', type: 'info' },
      tree: null,
      stageId: 'stage-2',
      metrics: { '全局最大路径和': 0 },
    });

    return steps;
  }

  let globalMax = -Infinity;
  const callStack: number[] = [];
  const visitedVals: number[] = [];

  steps.push({
    currentNode: root.val,
    leftGain: 0,
    rightGain: 0,
    currentArchSum: 0,
    maxGlobalSum: 0,
    bestArchPath: [],
    callStack: [],
    decision: '树形 DP 套路启动：向子树收集 Info 二元组',
    action: 'entry',
    phase: 'init',
    message: '二元组定义：Info { maxPathSum: 子树内最大全路径和, maxGainFromRoot: 从当前根出发单边最大收益 }。',
    log: 'Tree DP Info pattern started',
    codeLine: lines.entry,
    statusBadge: { text: '树形DP套路', type: 'info' },
    tree: cloneStateDepTree(root),
    stageId: 'stage-2',
    metrics: { '架构模式': 'Info 二元组汇聚', '根节点': root.val },
  });

  steps.push({
    currentNode: root.val,
    leftGain: 0,
    rightGain: 0,
    currentArchSum: 0,
    maxGlobalSum: 0,
    bestArchPath: [],
    callStack: [],
    decision: `调用 process(${root.val}) 发起递归求解`,
    action: 'callProcess',
    phase: 'call',
    message: `自顶向下递归求解二叉树根节点 ${root.val} 的 Info 信息。`,
    log: `call process(${root.val})`,
    codeLine: lines.callProcess,
    statusBadge: { text: `递归启动`, type: 'info' },
    tree: cloneStateDepTree(root),
    stageId: 'stage-2',
    metrics: { '当前处理节点': root.val },
  });

  function processNode(node: TreeNode | null): TreeInfo | null {
    if (!node) {
      steps.push({
        currentNode: null,
        leftGain: 0,
        rightGain: 0,
        currentArchSum: 0,
        maxGlobalSum: globalMax === -Infinity ? 0 : globalMax,
        bestArchPath: [],
        callStack: [...callStack],
        decision: '空节点基准退出：if (x == null) return null',
        action: 'processNull',
        phase: 'base',
        message: '空节点无法提供有效路径，返回 null。',
        log: 'process(null) -> null',
        codeLine: lines.processNull,
        statusBadge: { text: '空节点 null', type: 'info' },
        tree: cloneStateDepTree(root),
        stageId: 'stage-2',
        metrics: { '当前处理节点': 'null' },
        visitedNodes: [...visitedVals],
      });
      return null;
    }

    callStack.push(node.val);
    visitedVals.push(node.val);

    steps.push({
      currentNode: node.val,
      leftGain: 0,
      rightGain: 0,
      currentArchSum: 0,
      maxGlobalSum: globalMax === -Infinity ? node.val : globalMax,
      bestArchPath: [node.val],
      callStack: [...callStack],
      decision: `进入节点 [${node.val}]：准备收集左右子树二元组`,
      action: 'processEntry',
      phase: 'enter',
      message: `开始处理节点 ${node.val} 的 Info 汇总。`,
      log: `process(${node.val}) enter`,
      codeLine: lines.processEntry,
      statusBadge: { text: `节点 ${node.val}`, type: 'info' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-2',
      metrics: { '当前处理节点': node.val, '递归栈深度': callStack.length },
      visitedNodes: [...visitedVals],
    });

    steps.push({
      currentNode: node.val,
      leftGain: 0,
      rightGain: 0,
      currentArchSum: 0,
      maxGlobalSum: globalMax === -Infinity ? node.val : globalMax,
      bestArchPath: [node.val],
      callStack: [...callStack],
      decision: `process(${node.val})：发起左子树 Info 收集`,
      action: 'callLeft',
      phase: 'recurse',
      message: `向下发起 process(${node.left ? node.left.val : 'null'}) 收集左子树二元组。`,
      log: `Collect left info for ${node.val}`,
      codeLine: lines.callLeft,
      statusBadge: { text: `收集左子树`, type: 'info' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-2',
      metrics: { '当前处理节点': node.val, '递归深度': callStack.length },
      visitedNodes: [...visitedVals],
    });

    const left = processNode(node.left);
    const leftGain = left ? Math.max(0, left.maxGainFromRoot) : 0;

    steps.push({
      currentNode: node.val,
      leftGain,
      rightGain: 0,
      currentArchSum: 0,
      maxGlobalSum: globalMax === -Infinity ? node.val : globalMax,
      bestArchPath: [node.val],
      callStack: [...callStack],
      decision: `process(${node.val})：发起右子树 Info 收集`,
      action: 'callRight',
      phase: 'recurse',
      message: `左子树 maxGain=${left?.maxGainFromRoot ?? 0}。向下发起 process(${node.right ? node.right.val : 'null'})。`,
      log: `Collect right info for ${node.val}`,
      codeLine: lines.callRight,
      statusBadge: { text: `收集右子树`, type: 'info' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-2',
      metrics: { '当前处理节点': node.val, '左单侧增益': leftGain },
      visitedNodes: [...visitedVals],
    });

    const right = processNode(node.right);
    const rightGain = right ? Math.max(0, right.maxGainFromRoot) : 0;

    const gainFromRoot = node.val + Math.max(leftGain, rightGain);
    const arch = node.val + leftGain + rightGain;

    steps.push({
      currentNode: node.val,
      leftGain,
      rightGain,
      currentArchSum: 0,
      maxGlobalSum: globalMax === -Infinity ? node.val : globalMax,
      bestArchPath: [node.val],
      callStack: [...callStack],
      decision: `节点 [${node.val}] 计算单边增益贡献：leftGain=${leftGain}, rightGain=${rightGain}`,
      action: 'calcGains',
      phase: 'eval',
      message: `结合左右子树 maxGainFromRoot，过滤负数后得到单边有效贡献。`,
      log: `Node ${node.val} gains evaluated: leftGain=${leftGain}, rightGain=${rightGain}`,
      codeLine: lines.calcGains,
      statusBadge: { text: `计算有效增益`, type: 'info' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-2',
      metrics: { '当前处理节点': node.val, '左增益': leftGain, '右增益': rightGain },
      visitedNodes: [...visitedVals],
    });

    steps.push({
      currentNode: node.val,
      leftGain,
      rightGain,
      currentArchSum: arch,
      maxGlobalSum: globalMax === -Infinity ? arch : globalMax,
      bestArchPath: [node.val],
      callStack: [...callStack],
      decision: `节点 [${node.val}] 计算跨根拱形全路径和: ${node.val} + ${leftGain} + ${rightGain} = ${arch}`,
      action: 'calcArch',
      phase: 'aggregate',
      message: `拱形全路径和为 ${arch}，单边向下延伸最大贡献为 ${gainFromRoot}。`,
      log: `Node ${node.val} arch=${arch}`,
      codeLine: lines.calcArch,
      statusBadge: { text: `拱形和 ${arch}`, type: 'info' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-2',
      metrics: { '当前处理节点': node.val, '拱形路径和': arch, '向根单边增益': gainFromRoot },
      visitedNodes: [...visitedVals],
    });

    let subMax = arch;
    if (left) subMax = Math.max(subMax, left.maxPathSum);
    if (right) subMax = Math.max(subMax, right.maxPathSum);

    if (subMax > globalMax) globalMax = subMax;

    steps.push({
      currentNode: node.val,
      leftGain,
      rightGain,
      currentArchSum: arch,
      maxGlobalSum: globalMax,
      bestArchPath: [node.val],
      callStack: [...callStack],
      decision: `节点 [${node.val}] 归纳子树最优全路径和：max(arch=${arch}, left=${left?.maxPathSum ?? '—'}, right=${right?.maxPathSum ?? '—'}) = ${subMax}`,
      action: 'mergeMax',
      phase: 'update',
      message: `以当前节点为根的完整子树中，最大路径和收敛为 ${subMax}。`,
      log: `Node ${node.val} mergeMax: subMax=${subMax}`,
      codeLine: lines.mergeMax,
      statusBadge: { text: `最优和 ${subMax}`, type: 'info' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-2',
      metrics: { '当前处理节点': node.val, '子树最优和': subMax },
      visitedNodes: [...visitedVals],
    });

    const info: TreeInfo = { maxPathSum: subMax, maxGainFromRoot: gainFromRoot };

    steps.push({
      currentNode: node.val,
      leftGain,
      rightGain,
      currentArchSum: arch,
      maxGlobalSum: globalMax,
      bestArchPath: [node.val],
      callStack: [...callStack],
      decision: `节点 ${node.val} 二元组融合：Info { maxPath: ${subMax}, maxGain: ${gainFromRoot} }`,
      action: 'returnInfo',
      phase: 'return',
      message: `拱形路径和 ${arch}，综合左右子树最优解后局部 maxPathSum=${subMax}，单边汇报增益=${gainFromRoot}。`,
      log: `Node ${node.val} -> Info(${subMax}, ${gainFromRoot})`,
      codeLine: lines.returnInfo,
      statusBadge: { text: `融合二元组`, type: 'success' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-2',
      metrics: { '子树全路径和': subMax, '单边延伸增益': gainFromRoot, '全局最优': globalMax },
      infoResult: info,
      visitedNodes: [...visitedVals],
    });

    callStack.pop();
    return info;
  }

  const finalInfo = processNode(root);
  const allTreeVals = collectTreeValues(root);

  steps.push({
    currentNode: root.val,
    leftGain: 0,
    rightGain: 0,
    currentArchSum: finalInfo ? finalInfo.maxPathSum : 0,
    maxGlobalSum: finalInfo ? finalInfo.maxPathSum : 0,
    bestArchPath: [],
    callStack: [],
    decision: `🎉 树形 DP 二元组推演完成！最终最大路径和 = ${finalInfo?.maxPathSum}`,
    action: 'done',
    phase: 'finish',
    message: `根节点输出最终 Info 汇报：整棵树最大路径和收敛至 ${finalInfo?.maxPathSum}。`,
    log: `Tree DP complete. Result=${finalInfo?.maxPathSum}`,
    codeLine: lines.done,
    statusBadge: { text: `收敛: ${finalInfo?.maxPathSum}`, type: 'success' },
    tree: cloneStateDepTree(root),
    stageId: 'stage-2',
    visitedNodes: allTreeVals,
    metrics: { '最终结果': finalInfo?.maxPathSum ?? 0 },
    infoResult: finalInfo,
  });

  return steps;
}

// =========================================================================
// Stage 3: 显式后序遍历与状态表映射 (Iterative Postorder & Gain Table)
// =========================================================================
export function buildMaxPathSumStage3StackSteps(root: TreeNode | null): PathSumStep[] {
  const steps: PathSumStep[] = [];
  const lines = MAX_PATH_SUM_STAGE3_LINES;

  if (!root) {
    steps.push({
      currentNode: null,
      leftGain: 0,
      rightGain: 0,
      currentArchSum: 0,
      maxGlobalSum: 0,
      bestArchPath: [],
      callStack: [],
      decision: '算法启动：空树特判',
      action: 'entry',
      phase: 'init',
      message: '传入二叉树为空树 (null)，启动特判。',
      log: 'root is null -> return 0',
      codeLine: lines.entry,
      statusBadge: { text: '空树', type: 'info' },
      tree: null,
      stageId: 'stage-3',
      metrics: { '全局最大路径和': 0 },
    });

    steps.push({
      currentNode: null,
      leftGain: 0,
      rightGain: 0,
      currentArchSum: 0,
      maxGlobalSum: 0,
      bestArchPath: [],
      callStack: [],
      decision: '特判返回：树为空，返回 0',
      action: 'baseNull',
      phase: 'return',
      message: '树为空，最大路径和为 0。',
      log: 'root is null -> return 0',
      codeLine: lines.baseNull,
      statusBadge: { text: '结果: 0', type: 'info' },
      tree: null,
      stageId: 'stage-3',
      metrics: { '全局最大路径和': 0 },
    });

    return steps;
  }

  let globalMax = -Infinity;
  const gainMap = new Map<TreeNode, number>();
  const stack: TreeNode[] = [];
  let curr: TreeNode | null = root;
  let lastVisited: TreeNode | null = null;
  const visitedVals: number[] = [];

  const getGainMapState = () => Array.from(gainMap.entries()).map(([n, g]) => ({ val: n.val, gain: g }));

  steps.push({
    currentNode: root.val,
    leftGain: 0,
    rightGain: 0,
    currentArchSum: 0,
    maxGlobalSum: 0,
    bestArchPath: [],
    callStack: [],
    decision: '显式后序遍历准备 (零递归栈)',
    action: 'entry',
    phase: 'init',
    message: '利用单显式栈与 last 访问指针实现二叉树后序遍历，配合 Map 缓存子树单边增益。',
    log: 'Iterative postorder entry',
    codeLine: lines.entry,
    statusBadge: { text: '算法启动', type: 'info' },
    tree: cloneStateDepTree(root),
    stageId: 'stage-3',
    metrics: { '栈大小': 0, '已缓存收益节点数': 0 },
    stackState: [],
    gainMapState: [],
  });

  steps.push({
    currentNode: root.val,
    leftGain: 0,
    rightGain: 0,
    currentArchSum: 0,
    maxGlobalSum: 0,
    bestArchPath: [],
    callStack: [],
    decision: '显式后序遍历变量初始化',
    action: 'init',
    phase: 'init',
    message: '初始化 stack, gainMap, curr = root, last = null。',
    log: 'Iterative postorder initialized',
    codeLine: lines.init,
    statusBadge: { text: '显式栈就绪', type: 'info' },
    tree: cloneStateDepTree(root),
    stageId: 'stage-3',
    metrics: { '栈大小': 0, '已缓存收益节点数': 0 },
    stackState: [],
    gainMapState: [],
  });

  while (curr !== null || stack.length > 0) {
    while (curr !== null) {
      stack.push(curr);
      visitedVals.push(curr.val);
      steps.push({
        currentNode: curr.val,
        leftGain: 0,
        rightGain: 0,
        currentArchSum: 0,
        maxGlobalSum: globalMax === -Infinity ? curr.val : globalMax,
        bestArchPath: [curr.val],
        callStack: stack.map((n) => n.val),
        decision: `一路向左压栈：节点 [${curr.val}]`,
        action: 'pushLeftBranch',
        phase: 'push',
        message: `将节点 ${curr.val} 压入显式栈，继续向左深入。`,
        log: `Push ${curr.val} to stack`,
        codeLine: lines.pushLeftBranch,
        statusBadge: { text: `压栈 ${curr.val}`, type: 'info' },
        tree: cloneStateDepTree(root),
        stageId: 'stage-3',
        metrics: { '当前栈顶': curr.val, '栈深度': stack.length },
        stackState: stack.map((n) => n.val),
        gainMapState: getGainMapState(),
        visitedNodes: [...visitedVals],
      });
      curr = curr.left;
    }

    const top = stack[stack.length - 1];

    steps.push({
      currentNode: top.val,
      leftGain: 0,
      rightGain: 0,
      currentArchSum: 0,
      maxGlobalSum: globalMax === -Infinity ? top.val : globalMax,
      bestArchPath: [top.val],
      callStack: stack.map((n) => n.val),
      decision: `窥视栈顶节点 [${top.val}]：检查右子树是否已访问完毕`,
      action: 'peekTop',
      phase: 'peek',
      message: `栈顶为 ${top.val}，右子树为 ${top.right ? top.right.val : 'null'}，上一次访问为 ${lastVisited ? lastVisited.val : 'null'}。`,
      log: `Peek top ${top.val}`,
      codeLine: lines.peekTop,
      statusBadge: { text: `窥视栈顶 ${top.val}`, type: 'info' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-3',
      metrics: { '当前栈顶': top.val, '栈深度': stack.length },
      stackState: stack.map((n) => n.val),
      gainMapState: getGainMapState(),
      visitedNodes: [...visitedVals],
    });

    if (top.right !== null && top.right !== lastVisited) {
      steps.push({
        currentNode: top.val,
        leftGain: 0,
        rightGain: 0,
        currentArchSum: 0,
        maxGlobalSum: globalMax === -Infinity ? top.val : globalMax,
        bestArchPath: [top.val],
        callStack: stack.map((n) => n.val),
        decision: `转向右子树深入：节点 [${top.right.val}]`,
        action: 'turnRight',
        phase: 'branch',
        message: `右子节点 ${top.right.val} 尚未结算，转向右侧并开始新一轮向左压栈。`,
        log: `Turn right to ${top.right.val}`,
        codeLine: lines.turnRight,
        statusBadge: { text: `转向右侧 ${top.right.val}`, type: 'info' },
        tree: cloneStateDepTree(root),
        stageId: 'stage-3',
        metrics: { '转向节点': top.right.val },
        stackState: stack.map((n) => n.val),
        gainMapState: getGainMapState(),
        visitedNodes: [...visitedVals],
      });
      curr = top.right;
    } else {
      stack.pop();
      steps.push({
        currentNode: top.val,
        leftGain: 0,
        rightGain: 0,
        currentArchSum: 0,
        maxGlobalSum: globalMax === -Infinity ? top.val : globalMax,
        bestArchPath: [top.val],
        callStack: stack.map((n) => n.val),
        decision: `节点 [${top.val}] 左右子树均已处理完毕，出栈`,
        action: 'popNode',
        phase: 'pop',
        message: `弹出栈顶节点 ${top.val}，即将从 gainMap 读取子树收益进行汇算。`,
        log: `Pop ${top.val}`,
        codeLine: lines.popNode,
        statusBadge: { text: `出栈 ${top.val}`, type: 'info' },
        tree: cloneStateDepTree(root),
        stageId: 'stage-3',
        metrics: { '出栈节点': top.val, '剩余栈深度': stack.length },
        stackState: stack.map((n) => n.val),
        gainMapState: getGainMapState(),
        visitedNodes: [...visitedVals],
      });

      const l = Math.max(0, top.left ? gainMap.get(top.left) ?? 0 : 0);
      const r = Math.max(0, top.right ? gainMap.get(top.right) ?? 0 : 0);

      steps.push({
        currentNode: top.val,
        leftGain: l,
        rightGain: r,
        currentArchSum: 0,
        maxGlobalSum: globalMax === -Infinity ? top.val : globalMax,
        bestArchPath: [top.val],
        callStack: stack.map((n) => n.val),
        decision: `从 gainMap 查询得到左右有效单侧增益：left=${l}, right=${r}`,
        action: 'calcGains',
        phase: 'eval',
        message: `左增益为 ${l}，右增益为 ${r}。`,
        log: `Node ${top.val} gains: l=${l}, r=${r}`,
        codeLine: lines.calcGains,
        statusBadge: { text: `增益 L:${l} R:${r}`, type: 'info' },
        tree: cloneStateDepTree(root),
        stageId: 'stage-3',
        metrics: { '出栈节点': top.val, '左增益': l, '右增益': r },
        stackState: stack.map((n) => n.val),
        gainMapState: getGainMapState(),
        visitedNodes: [...visitedVals],
      });

      const arch = top.val + l + r;
      if (arch > globalMax) globalMax = arch;

      steps.push({
        currentNode: top.val,
        leftGain: l,
        rightGain: r,
        currentArchSum: arch,
        maxGlobalSum: globalMax,
        bestArchPath: [top.val],
        callStack: stack.map((n) => n.val),
        decision: `节点 [${top.val}] 结算拱形和：${top.val} + ${l} + ${r} = ${arch}，更新全局最优 = ${globalMax}`,
        action: 'updateMax',
        phase: 'update',
        message: `计算跨根拱形全路径和 ${arch}，当前全局最大和收敛为 ${globalMax}。`,
        log: `Node ${top.val} arch=${arch}, globalMax=${globalMax}`,
        codeLine: lines.updateMax,
        statusBadge: { text: `全局最优 ${globalMax}`, type: 'success' },
        tree: cloneStateDepTree(root),
        stageId: 'stage-3',
        metrics: { '出栈节点': top.val, '拱形和': arch, '全局最优': globalMax },
        stackState: stack.map((n) => n.val),
        gainMapState: getGainMapState(),
        visitedNodes: [...visitedVals],
      });

      const singleGain = top.val + Math.max(l, r);
      gainMap.set(top, singleGain);
      lastVisited = top;

      steps.push({
        currentNode: top.val,
        leftGain: l,
        rightGain: r,
        currentArchSum: arch,
        maxGlobalSum: globalMax,
        bestArchPath: [top.val],
        callStack: stack.map((n) => n.val),
        decision: `记录节点 [${top.val}] 单边汇报增益 ${singleGain} 至 gainMap`,
        action: 'saveGain',
        phase: 'save',
        message: `向父节点提供单边延伸值: ${top.val} + max(${l}, ${r}) = ${singleGain}，保存至 gainMap。`,
        log: `gainMap.set(${top.val}, ${singleGain})`,
        codeLine: lines.saveGain,
        statusBadge: { text: `缓存收益 ${singleGain}`, type: 'info' },
        tree: cloneStateDepTree(root),
        stageId: 'stage-3',
        metrics: { '出栈节点': top.val, '单边增益': singleGain },
        stackState: stack.map((n) => n.val),
        gainMapState: getGainMapState(),
        visitedNodes: [...visitedVals],
      });
    }
  }

  const allTreeVals = collectTreeValues(root);

  steps.push({
    currentNode: root.val,
    leftGain: 0,
    rightGain: 0,
    currentArchSum: globalMax,
    maxGlobalSum: globalMax,
    bestArchPath: [],
    callStack: [],
    decision: `🎉 显式后序遍历完成！全局最大路径和 = ${globalMax}`,
    action: 'done',
    phase: 'finish',
    message: `全部节点出栈并结算完成，全局最大路径和收敛至 ${globalMax}。`,
    log: `Iterative stack maxPathSum done. Result=${globalMax}`,
    codeLine: lines.done,
    statusBadge: { text: `结果: ${globalMax}`, type: 'success' },
    tree: cloneStateDepTree(root),
    stageId: 'stage-3',
    visitedNodes: allTreeVals,
    metrics: { '最终结果': globalMax },
    stackState: [],
    gainMapState: getGainMapState(),
  });

  return steps;
}

// =========================================================================
// 表现层与适配器渲染规范 (Presentation & Visualizer Adapters)
// =========================================================================

/**
 * Card 1: 纯净二叉树画布渲染器 (纯 View 逻辑，杜绝跨容器 DOM 穿透)
 */
export function renderMaxPathSumCanvas(container: HTMLElement, step: PathSumStep): void {
  if (step.tree) {
    const isDone = step.decision.includes('完毕') || step.decision.includes('完成') || step.statusBadge?.type === 'success';
    const allTreeVals = collectTreeValues(step.tree);
    let current = step.currentNode;
    let visitedNodes = step.visitedNodes;

    if (isDone) {
      if (current === null && step.tree) {
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
      secondaryHighlightedNodes: step.bestArchPath && step.bestArchPath.length > 0 ? step.bestArchPath : [],
      primaryColor: '#fbbf24',
      secondaryColor: '#34d399',
      visitedColor: '#38bdf8',
    });
  } else {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
        <svg width="240" height="120" viewBox="0 0 240 120">
          <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空树或初始化</text>
        </svg>
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">准备自底向上后序遍历计算最大路径和...</span>
      </div>
    `;
  }
}

/**
 * Card 2: 自定义运行监控与推演面板 (4 格指标 + 最优路径 + 推演栈 / Info 二元组 / 显式栈)
 */
export function renderMaxPathSumCustomMetrics(container: HTMLElement, step: PathSumStep): void {
  container.innerHTML = '';
  container.className = 'flex flex-col gap-2 p-2 h-full overflow-y-auto text-slate-200';

  // 1. 顶部 4 格 KPI 卡片
  const metricsGrid = document.createElement('div');
  metricsGrid.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
  metricsGrid.innerHTML = `
    <div class="flex flex-col p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-sm">
      <span class="text-[11px] text-slate-400 font-medium">全局最大路径和</span>
      <span class="text-base font-bold font-mono text-emerald-400">
        ${step.maxGlobalSum === -Infinity ? '—' : step.maxGlobalSum}
      </span>
    </div>
    <div class="flex flex-col p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-sm">
      <span class="text-[11px] text-slate-400 font-medium">当前拱形和</span>
      <span class="text-base font-bold font-mono text-cyan-400">
        ${step.currentArchSum !== 0 ? step.currentArchSum : '—'}
      </span>
    </div>
    <div class="flex flex-col p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-sm">
      <span class="text-[11px] text-slate-400 font-medium">左单侧有效增益</span>
      <span class="text-base font-bold font-mono text-amber-400">
        ${step.leftGain !== undefined ? step.leftGain : '—'}
      </span>
    </div>
    <div class="flex flex-col p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-sm">
      <span class="text-[11px] text-slate-400 font-medium">右单侧有效增益</span>
      <span class="text-base font-bold font-mono text-indigo-400">
        ${step.rightGain !== undefined ? step.rightGain : '—'}
      </span>
    </div>
  `;
  container.appendChild(metricsGrid);

  // 2. 最优全路径展示区
  if (step.bestArchPath && step.bestArchPath.length > 0) {
    const pathBox = document.createElement('div');
    pathBox.className = 'p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between flex-shrink-0';
    pathBox.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-[11px] text-slate-400">🏔️ 当前最优全路径:</span>
        <div class="flex items-center gap-1">
          ${step.bestArchPath.map((v, i) => `
            <span class="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-600/70 font-mono text-xs font-bold text-emerald-300">
              ${v}
            </span>
            ${i < step.bestArchPath.length - 1 ? '<span class="text-slate-500 text-xs">➔</span>' : ''}
          `).join('')}
        </div>
      </div>
      <span class="text-xs font-mono font-bold text-emerald-400">Sum = ${step.maxGlobalSum}</span>
    `;
    container.appendChild(pathBox);
  }

  // 3. 中间推演区：根据 stageId 呈现推演树、二元组或显式栈
  if (step.stageId === 'stage-2') {
    const infoBox = document.createElement('div');
    infoBox.className = 'p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/60 flex-shrink-0';
    infoBox.innerHTML = `
      <div class="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
        <span>📦 树形 DP 二元组 Info 数据流</span>
        <span class="text-[10px] text-slate-400 font-normal">(Zuoshen Class 077 套路)</span>
      </div>
      <div class="grid grid-cols-2 gap-2 text-xs font-mono">
        <div class="p-2 rounded bg-slate-900/60 border border-slate-800 flex flex-col">
          <span class="text-[10px] text-slate-400">子树内部最大全路径和 (maxPathSum):</span>
          <span class="text-sm font-bold text-emerald-400">${step.infoResult ? step.infoResult.maxPathSum : (step.maxGlobalSum === -Infinity ? '—' : step.maxGlobalSum)}</span>
        </div>
        <div class="p-2 rounded bg-slate-900/60 border border-slate-800 flex flex-col">
          <span class="text-[10px] text-slate-400">从根向下延伸单边最大收益 (maxGainFromRoot):</span>
          <span class="text-sm font-bold text-cyan-400">${step.infoResult ? step.infoResult.maxGainFromRoot : (step.currentNode !== null ? (step.currentNode + Math.max(step.leftGain, step.rightGain)) : '—')}</span>
        </div>
      </div>
    `;
    container.appendChild(infoBox);
  } else if (step.stageId === 'stage-3') {
    const stackBox = document.createElement('div');
    stackBox.className = 'p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/60 flex-shrink-0';
    stackBox.innerHTML = `
      <div class="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
        <span>🥞 显式栈与增益映射表 (Gain Map)</span>
        <span class="text-[10px] text-slate-400 font-normal">(零系统栈后序遍历)</span>
      </div>
      <div class="flex flex-col gap-1.5 text-xs font-mono">
        <div class="flex items-center gap-2">
          <span class="text-slate-400">显式遍历栈:</span>
          <div class="flex items-center gap-1">
            ${(step.stackState && step.stackState.length > 0)
              ? step.stackState.map(v => `<span class="px-1.5 py-0.5 rounded bg-blue-950/70 border border-blue-600/60 text-blue-300 font-bold">${v}</span>`).join('')
              : '<span class="text-slate-500 italic">空栈 []</span>'}
          </div>
        </div>
        ${step.gainMapState && step.gainMapState.length > 0 ? `
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-slate-400">已结算单边增益:</span>
            <div class="flex items-center gap-1.5 flex-wrap">
              ${step.gainMapState.map(item => `
                <span class="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  Node(${item.val}) ➔ <strong class="text-amber-400">${item.gain}</strong>
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
    container.appendChild(stackBox);
  } else if (step.callTrace) {
    const traceBox = document.createElement('div');
    traceBox.className = 'flex-1 min-h-[160px] max-h-[260px] overflow-hidden flex flex-col rounded-lg bg-slate-800/60 border border-slate-700/50';
    RecursiveCallTraceAdapter.render(traceBox, step.callTrace);
    container.appendChild(traceBox);
  }

  // 4. 当前推演决策总结
  const isDone = step.decision.includes('完成') || step.decision.includes('完毕') || step.statusBadge?.type === 'success';
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

// =========================================================================
// 顶层声明式算法注册 (Register Declarative Algorithm)
// =========================================================================
export const binaryTreeMaximumPathSumVisualizer = registerDeclarativeAlgorithm<PathSumStep>({
  id: 'binary-tree-maximum-path-sum',
  name: '二叉树中的最大路径和',
  category: 'tree',
  icon: '🏔️',
  difficulty: 3,
  levelOrder: 124,
  aliases: ['leetcode-124', 'max-path-sum-tree'],
  learningGoal: '透彻掌握树形 DP 经典模型：单边向上贡献收益与跨根拱形全路径和分离计算的精妙架构',
  timeComplexity: 'O(N)',
  spaceComplexity: 'O(H)',
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序数组 (逗号分隔)',
      type: 'text',
      defaultValue: '-10, 9, 20, null, null, 15, 7',
      placeholder: '例如: -10, 9, 20, null, null, 15, 7',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 2: 经典拱形最值 42',
      values: { 'input-tree': '-10, 9, 20, null, null, 15, 7' },
      description: '根 -10，左 9，右 20(15, 7)，最优路径 15 -> 20 -> 7',
    },
    {
      label: 'LeetCode 示例 1: 简单三节点树 6',
      values: { 'input-tree': '1, 2, 3' },
      description: '根 1，左 2，右 3，最优路径 2 -> 1 -> 3',
    },
    {
      label: '全部负数节点树 -1',
      values: { 'input-tree': '-3, -2, -1' },
      description: '根 -3，左 -2，右 -1，最大值是单节点 -1',
    },
    {
      label: '单节点树 10',
      values: { 'input-tree': '10' },
      description: '仅包含根节点 10',
    },
  ],
  metrics: [
    { id: 'global-max', label: '全局最大路径和', color: '#10b981' },
    { id: 'arch-sum', label: '当前拱形和', color: '#0ea5e9' },
    { id: 'gains', label: '左/右单侧增益', color: '#f59e0b' },
  ],
  codeLanguages: MAX_PATH_SUM_STAGE1_CODES,
  problemHtml: MAX_PATH_SUM_PROBLEM_HTML,
  analysisHtml: MAX_PATH_SUM_ANALYSIS_HTML,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 递归后序遍历与单边最大贡献分离 (LC 124)',
      shortName: '后序递归与单边增益',
      num: 1,
      codeLanguages: MAX_PATH_SUM_STAGE1_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeInput(inputs?.['input-tree']);
        const root = buildTreeFromArr(arr);
        return buildMaxPathSumStage1Steps(root);
      },
      renderCanvas: (container, step) => renderMaxPathSumCanvas(container, step),
      renderCustomMetrics: (container, step) => renderMaxPathSumCustomMetrics(container, step),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 树形 DP 二元信息汇聚模型 (Zuoshen Class 077)',
      shortName: '树形DP信息汇聚',
      num: 2,
      codeLanguages: MAX_PATH_SUM_STAGE2_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeInput(inputs?.['input-tree']);
        const root = buildTreeFromArr(arr);
        return buildMaxPathSumStage2InfoSteps(root);
      },
      renderCanvas: (container, step) => renderMaxPathSumCanvas(container, step),
      renderCustomMetrics: (container, step) => renderMaxPathSumCustomMetrics(container, step),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 显式后序遍历与状态表映射 (零递归栈)',
      shortName: '显式栈后序遍历',
      num: 3,
      codeLanguages: MAX_PATH_SUM_STAGE3_CODES,
      buildSteps: (inputs) => {
        const arr = parseTreeInput(inputs?.['input-tree']);
        const root = buildTreeFromArr(arr);
        return buildMaxPathSumStage3StackSteps(root);
      },
      renderCanvas: (container, step) => renderMaxPathSumCanvas(container, step),
      renderCustomMetrics: (container, step) => renderMaxPathSumCustomMetrics(container, step),
    },
  ],
  generateSteps: (inputs) => {
    const arr = parseTreeInput(inputs?.['input-tree']);
    const root = buildTreeFromArr(arr);
    return buildMaxPathSumStage1Steps(root);
  },
  buildSteps: (inputs) => {
    const arr = parseTreeInput(inputs?.['input-tree']);
    const root = buildTreeFromArr(arr);
    return buildMaxPathSumStage1Steps(root);
  },
  renderCanvas: (container, step) => renderMaxPathSumCanvas(container, step),
  renderCustomMetrics: (container, step) => renderMaxPathSumCustomMetrics(container, step),
});
