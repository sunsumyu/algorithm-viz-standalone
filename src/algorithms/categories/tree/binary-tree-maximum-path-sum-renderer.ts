/**
 * 二叉树中的最大路径和可视化器 (Binary Tree Maximum Path Sum · LeetCode 124 / Zuoshen Class 077)
 * 采用顶层声明式架构与多阶段演化标准 (Multi-Stage Evolution)
 *
 * Stage 1: 递归后序遍历与单边最大贡献分离 (LC 124 经典树形 DP)
 * Stage 2: 树形 DP 二元信息汇聚模型 (Zuoshen Class 077 套路)
 * Stage 3: 显式后序遍历与状态表映射 (零系统栈递归)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../core/step-visualizer';
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
} from './binary-tree-maximum-path-sum-stage-codes';

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
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  tree?: TreeNode | null;
  stageId?: string;
  metrics?: Record<string, string | number>;
  visitedNodes?: number[];
  highlightedNodes?: number[];
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

export const MAX_PATH_SUM_CODES = MAX_PATH_SUM_STAGE1_CODES;

export const MAX_PATH_SUM_STAGE1_LINES = {
  entry: { java: 4, cpp: 12, python: 2, javascript: 1 },
  dfsEntry: { java: 8, cpp: 4, python: 5, javascript: 4 },
  baseNull: { java: 8, cpp: 4, python: 5, javascript: 4 },
  calcLeft: { java: 9, cpp: 5, python: 6, javascript: 5 },
  calcRight: { java: 10, cpp: 6, python: 7, javascript: 6 },
  calcArch: { java: 11, cpp: 7, python: 8, javascript: 7 },
  updateMax: { java: 12, cpp: 7, python: 8, javascript: 8 },
  returnSingle: { java: 13, cpp: 8, python: 9, javascript: 9 },
  done: { java: 5, cpp: 13, python: 11, javascript: 12 },
};

export const MAX_PATH_SUM_STAGE2_LINES = {
  entry: { java: 7, cpp: 13, python: 2, javascript: 1 },
  callProcess: { java: 8, cpp: 13, python: 12, javascript: 13 },
  nullBase: { java: 11, cpp: 4, python: 4, javascript: 3 },
  collectLeft: { java: 12, cpp: 5, python: 5, javascript: 4 },
  collectRight: { java: 13, cpp: 6, python: 6, javascript: 5 },
  calcGain: { java: 16, cpp: 9, python: 9, javascript: 8 },
  calcArch: { java: 17, cpp: 10, python: 10, javascript: 9 },
  mergeMax: { java: 18, cpp: 11, python: 11, javascript: 10 },
  returnInfo: { java: 21, cpp: 12, python: 12, javascript: 11 },
  done: { java: 8, cpp: 13, python: 12, javascript: 13 },
};

export const MAX_PATH_SUM_STAGE3_LINES = {
  entry: { java: 3, cpp: 4, python: 2, javascript: 2 },
  init: { java: 6, cpp: 7, python: 5, javascript: 5 },
  pushLeft: { java: 8, cpp: 9, python: 7, javascript: 7 },
  popNode: { java: 12, cpp: 13, python: 11, javascript: 11 },
  calcArch: { java: 15, cpp: 16, python: 14, javascript: 14 },
  updateMax: { java: 16, cpp: 17, python: 15, javascript: 15 },
  saveGain: { java: 17, cpp: 18, python: 16, javascript: 16 },
  done: { java: 22, cpp: 22, python: 19, javascript: 19 },
};

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

  if (!root) {
    steps.push({
      currentNode: null,
      leftGain: 0,
      rightGain: 0,
      currentArchSum: 0,
      maxGlobalSum: 0,
      bestArchPath: [],
      callStack: [],
      decision: '特判返回：树为空',
      message: '树为空，最大路径和为 0。',
      log: 'root is null -> return 0',
      codeLine: lines.entry,
      statusBadge: { text: '空树', type: 'info' },
      tree: null,
      stageId: 'stage-1',
      metrics: { '全局最大路径和': 0, '当前处理节点': 'null' },
    });
    return steps;
  }

  let globalMax = -Infinity;
  let bestPath: number[] = [];
  const callStack: number[] = [];

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
    message: '核心思想：单边最大收益向上传递，跨根拱形全路径和就地更新全局最优。',
    log: `Init maxPathSum on root ${root.val}`,
    codeLine: lines.entry,
    statusBadge: { text: '算法启动', type: 'info' },
    tree: cloneStateDepTree(root),
    stageId: 'stage-1',
    metrics: { '全局最大路径和': '初始化', '当前处理节点': root.val },
  });

  function dfs(node: TreeNode | null): number {
    if (!node) return 0;

    callStack.push(node.val);

    steps.push({
      currentNode: node.val,
      leftGain: 0,
      rightGain: 0,
      currentArchSum: 0,
      maxGlobalSum: globalMax === -Infinity ? node.val : globalMax,
      bestArchPath: [...bestPath],
      callStack: [...callStack],
      decision: `进入节点 [${node.val}]：发起左子树收益探查`,
      message: `调用 maxGain(${node.left ? node.left.val : 'null'})。`,
      log: `Node ${node.val} explore left`,
      codeLine: lines.calcLeft,
      statusBadge: { text: `节点 ${node.val}`, type: 'info' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
      metrics: { '当前处理节点': node.val, '递归栈深度': callStack.length },
    });

    const l = Math.max(0, dfs(node.left));

    steps.push({
      currentNode: node.val,
      leftGain: l,
      rightGain: 0,
      currentArchSum: 0,
      maxGlobalSum: globalMax === -Infinity ? node.val : globalMax,
      bestArchPath: [...bestPath],
      callStack: [...callStack],
      decision: `节点 [${node.val}] 左子树有效收益 = ${l}，发起右子树探查`,
      message: `调用 maxGain(${node.right ? node.right.val : 'null'})。`,
      log: `Node ${node.val} explore right, leftGain=${l}`,
      codeLine: lines.calcRight,
      statusBadge: { text: `左收益 ${l}`, type: 'info' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
      metrics: { '当前处理节点': node.val, '左子树收益': l },
    });

    const r = Math.max(0, dfs(node.right));

    const arch = node.val + l + r;
    const isNewBest = arch > globalMax;
    if (isNewBest) {
      globalMax = arch;
      bestPath = [node.val];
      if (node.left && l > 0) bestPath.unshift(node.left.val);
      if (node.right && r > 0) bestPath.push(node.right.val);
    }

    steps.push({
      currentNode: node.val,
      leftGain: l,
      rightGain: r,
      currentArchSum: arch,
      maxGlobalSum: globalMax,
      bestArchPath: [...bestPath],
      callStack: [...callStack],
      decision: `节点 [${node.val}] 汇合拱形路径和：${node.val} + ${l} + ${r} = ${arch} ➔ ${
        isNewBest ? `🎉 刷新全局最大路径和至 ${globalMax}！` : `未超越当前最大值 ${globalMax}`
      }`,
      message: `向父节点传递单边最大贡献：${node.val} + max(${l}, ${r}) = ${node.val + Math.max(l, r)}。`,
      log: `Node ${node.val} arch=${arch}, globalMax=${globalMax}`,
      codeLine: lines.calcArch,
      statusBadge: { text: isNewBest ? `新纪录 ${arch}` : `局部和 ${arch}`, type: isNewBest ? 'success' : 'warning' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-1',
      metrics: { '当前处理节点': node.val, '拱形路径和': arch, '全局最优': globalMax },
    });

    callStack.pop();
    return node.val + Math.max(l, r);
  }

  dfs(root);

  const allTreeVals = collectTreeValues(root);

  steps.push({
    currentNode: root ? root.val : null,
    leftGain: 0,
    rightGain: 0,
    currentArchSum: globalMax,
    maxGlobalSum: globalMax,
    bestArchPath: [...bestPath],
    callStack: [],
    decision: `🎉 全树推演完毕！全局最大路径和 = ${globalMax}`,
    message: `单次后序遍历 O(N) 完美闭环，全局最大和为 ${globalMax}。`,
    log: `Max path sum complete. Result=${globalMax}`,
    codeLine: lines.done,
    statusBadge: { text: `最终最大和: ${globalMax}`, type: 'success' },
    tree: cloneStateDepTree(root),
    stageId: 'stage-1',
    visitedNodes: allTreeVals,
    highlightedNodes: bestPath.length > 0 ? [...bestPath] : allTreeVals,
    metrics: { '最终最大路径和': globalMax, '最优节点集': bestPath.join(' ➔ ') },
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
      decision: '特判返回：树为空',
      message: '树为空，Info { maxPathSum: 0, maxGainFromRoot: 0 }。',
      log: 'root is null -> return 0',
      codeLine: lines.entry,
      statusBadge: { text: '空树', type: 'info' },
      tree: null,
      stageId: 'stage-2',
      metrics: { '全局最大路径和': 0, '单边增益': 0 },
    });
    return steps;
  }

  let globalMax = -Infinity;
  const callStack: number[] = [];

  steps.push({
    currentNode: root.val,
    leftGain: 0,
    rightGain: 0,
    currentArchSum: 0,
    maxGlobalSum: 0,
    bestArchPath: [],
    callStack: [],
    decision: '树形 DP 套路启动：向子树收集 Info 二元组',
    message: '二元组定义：Info { maxPathSum: 子树内最大全路径和, maxGainFromRoot: 从当前根出发单边最大收益 }。',
    log: 'Tree DP Info pattern started',
    codeLine: lines.entry,
    statusBadge: { text: '树形DP套路', type: 'info' },
    tree: cloneStateDepTree(root),
    stageId: 'stage-2',
    metrics: { '架构模式': 'Info 二元组汇聚', '根节点': root.val },
  });

  function processNode(node: TreeNode | null): TreeInfo | null {
    if (!node) return null;

    callStack.push(node.val);

    steps.push({
      currentNode: node.val,
      leftGain: 0,
      rightGain: 0,
      currentArchSum: 0,
      maxGlobalSum: globalMax === -Infinity ? node.val : globalMax,
      bestArchPath: [node.val],
      callStack: [...callStack],
      decision: `process(${node.val})：收集左子树 Info`,
      message: `向下发起 process(${node.left ? node.left.val : 'null'}) 收集左子树二元组。`,
      log: `Collect left info for ${node.val}`,
      codeLine: lines.collectLeft,
      statusBadge: { text: `收集左子树`, type: 'info' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-2',
      metrics: { '当前处理节点': node.val, '递归深度': callStack.length },
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
      decision: `process(${node.val})：收集右子树 Info`,
      message: `左子树 maxGain=${left?.maxGainFromRoot ?? 0}。向下发起 process(${node.right ? node.right.val : 'null'})。`,
      log: `Collect right info for ${node.val}`,
      codeLine: lines.collectRight,
      statusBadge: { text: `收集右子树`, type: 'info' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-2',
      metrics: { '当前处理节点': node.val, '左单侧增益': leftGain },
    });

    const right = processNode(node.right);
    const rightGain = right ? Math.max(0, right.maxGainFromRoot) : 0;

    const gainFromRoot = node.val + Math.max(leftGain, rightGain);
    const arch = node.val + leftGain + rightGain;

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
      decision: `节点 ${node.val} 二元组融合：Info { maxPath: ${subMax}, maxGain: ${gainFromRoot} }`,
      message: `拱形路径和 ${arch}，综合左右子树最优解后局部 maxPathSum=${subMax}，单边汇报增益=${gainFromRoot}。`,
      log: `Node ${node.val} -> Info(${subMax}, ${gainFromRoot})`,
      codeLine: lines.returnInfo,
      statusBadge: { text: `融合二元组`, type: 'success' },
      tree: cloneStateDepTree(root),
      stageId: 'stage-2',
      metrics: { '子树全路径和': subMax, '单边延伸增益': gainFromRoot, '全局最优': globalMax },
    });

    callStack.pop();
    return { maxPathSum: subMax, maxGainFromRoot: gainFromRoot };
  }

  const finalInfo = processNode(root);

  const allTreeVals = collectTreeValues(root);

  steps.push({
    currentNode: root ? root.val : null,
    leftGain: 0,
    rightGain: 0,
    currentArchSum: finalInfo ? finalInfo.maxPathSum : 0,
    maxGlobalSum: finalInfo ? finalInfo.maxPathSum : 0,
    bestArchPath: [],
    callStack: [],
    decision: `🎉 树形 DP 二元组推演完成！最终最大路径和 = ${finalInfo?.maxPathSum}`,
    message: `根节点输出最终 Info 汇报：整棵树最大路径和收敛至 ${finalInfo?.maxPathSum}。`,
    log: `Tree DP complete. Result=${finalInfo?.maxPathSum}`,
    codeLine: lines.done,
    statusBadge: { text: `收敛: ${finalInfo?.maxPathSum}`, type: 'success' },
    tree: cloneStateDepTree(root),
    stageId: 'stage-2',
    visitedNodes: allTreeVals,
    metrics: { '最终结果': finalInfo?.maxPathSum ?? 0 },
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
      decision: '特判返回：树为空',
      message: '树为空，最大路径和为 0。',
      log: 'root is null -> return 0',
      codeLine: lines.entry,
      statusBadge: { text: '空树', type: 'info' },
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

  steps.push({
    currentNode: root.val,
    leftGain: 0,
    rightGain: 0,
    currentArchSum: 0,
    maxGlobalSum: 0,
    bestArchPath: [],
    callStack: [],
    decision: '显式后序遍历模拟启动 (零递归栈)',
    message: '利用单显式栈进行后序遍历，并在节点回溯出栈时从 gainMap 提取左右单侧增益。',
    log: 'Iterative postorder maxPathSum started',
    codeLine: lines.init,
    statusBadge: { text: '显式栈', type: 'info' },
    tree: cloneStateDepTree(root),
    stageId: 'stage-3',
    metrics: { '栈大小': 0, '已缓存收益节点数': 0 },
  });

  while (curr !== null || stack.length > 0) {
    while (curr !== null) {
      stack.push(curr);
      steps.push({
        currentNode: curr.val,
        leftGain: 0,
        rightGain: 0,
        currentArchSum: 0,
        maxGlobalSum: globalMax === -Infinity ? curr.val : globalMax,
        bestArchPath: [curr.val],
        callStack: stack.map((n) => n.val),
        decision: `一路向左压栈：节点 [${curr.val}]`,
        message: `将节点 ${curr.val} 压入显式栈，继续向左深入。`,
        log: `Push ${curr.val} to stack`,
        codeLine: lines.pushLeft,
        statusBadge: { text: `压栈 ${curr.val}`, type: 'info' },
        tree: cloneStateDepTree(root),
        stageId: 'stage-3',
        metrics: { '当前栈顶': curr.val, '栈深度': stack.length },
      });
      curr = curr.left;
    }

    const top = stack[stack.length - 1];
    if (top.right !== null && top.right !== lastVisited) {
      curr = top.right;
    } else {
      stack.pop();
      const l = Math.max(0, top.left ? gainMap.get(top.left) ?? 0 : 0);
      const r = Math.max(0, top.right ? gainMap.get(top.right) ?? 0 : 0);
      const arch = top.val + l + r;
      if (arch > globalMax) globalMax = arch;

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
        decision: `节点 [${top.val}] 子树已全结算出栈：拱形和 = ${arch}，单边收益 = ${singleGain}`,
        message: `从 gainMap 查得左增益=${l}, 右增益=${r}。结算拱形路径和 ${arch}，更新全局最优=${globalMax}。`,
        log: `Pop ${top.val}, arch=${arch}, gain=${singleGain}`,
        codeLine: lines.calcArch,
        statusBadge: { text: `出栈 ${top.val}`, type: 'success' },
        tree: cloneStateDepTree(root),
        stageId: 'stage-3',
        metrics: { '出栈节点': top.val, '拱形路径和': arch, '记录单边收益': singleGain, '全局最优': globalMax },
      });
    }
  }

  const allTreeVals = collectTreeValues(root);

  steps.push({
    currentNode: root ? root.val : null,
    leftGain: 0,
    rightGain: 0,
    currentArchSum: globalMax,
    maxGlobalSum: globalMax,
    bestArchPath: [],
    callStack: [],
    decision: `🎉 显式后序遍历完成！全局最大路径和 = ${globalMax}`,
    message: `全部节点出栈并结算完成，全局最大路径和收敛至 ${globalMax}。`,
    log: `Iterative stack maxPathSum done. Result=${globalMax}`,
    codeLine: lines.done,
    statusBadge: { text: `结果: ${globalMax}`, type: 'success' },
    tree: cloneStateDepTree(root),
    stageId: 'stage-3',
    visitedNodes: allTreeVals,
    metrics: { '最终结果': globalMax },
  });

  return steps;
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
});

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

  const root = container.closest('#algo-binary-tree-maximum-path-sum-view') || container.parentElement;
  if (root) {
    const globalMaxEl = root.querySelector('#metric-global-max');
    const archSumEl = root.querySelector('#metric-arch-sum');
    const gainsEl = root.querySelector('#metric-gains');

    if (globalMaxEl) globalMaxEl.textContent = `${step.maxGlobalSum}`;
    if (archSumEl) archSumEl.textContent = step.currentArchSum !== 0 ? `${step.currentArchSum}` : '—';
    if (gainsEl) gainsEl.textContent = `L: ${step.leftGain} / R: ${step.rightGain}`;

    // 在 Card 2 中展示递归栈与决策详情
    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #475569; padding: 6px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
              <span style="font-size: 10.5px; color: #64748b;">调用栈 / 遍历栈:</span>
              <div style="font-weight: 700; font-size: 12px; color: #2563eb;">
                ${step.callStack && step.callStack.length > 0 ? `[${step.callStack.join(' ➔ ')}]` : '栈为空 []'}
              </div>
            </div>
            <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
              <span style="font-size: 10.5px; color: #64748b;">当前考察节点:</span>
              <div style="font-weight: 700; font-size: 12px; color: #0d9488;">
                ${step.currentNode !== null ? `Node(${step.currentNode})` : '已收敛'}
              </div>
            </div>
          </div>

          <div style="padding: 8px 10px; background: #f1f5f9; border-radius: 6px; font-size: 11px; color: #475569;">
            <div style="font-weight: 700; color: #1e293b; margin-bottom: 2px;">🧭 决策推演: ${step.decision}</div>
            <div>${step.message}</div>
          </div>
        </div>
      `;
    }
  }
}
