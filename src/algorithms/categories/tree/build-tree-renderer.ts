/**
 * 从前序/后序与中序遍历构造二叉树可视化器 (Construct Binary Tree · LeetCode 105 & 106 / Zuoshen Class 036 Code07)
 * 采用顶层声明式架构与双版本综合长处整合 (Bi-Version Synthesis)
 * 融合旧版本输入交互/区间动态切分沙盘与左神 Class 036 名师讲义/四语言代码精准联动
 *
 * Stage 1: 前序+中序分治切分递归构造 (LC 105)
 * Stage 2: 后序+中序分治切分递归构造 (LC 106)
 * Stage 3: 迭代显式栈模拟前序重构 ($O(N)$ 零哈希表 · LC 105 迭代法)
 */

import { parseNumberList } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { HighlightTarget } from '../../../core/step-visualizer';
import { TreeNode } from './tree-template';
import { cloneStateDepTree } from '../../../core/strategies/tree-clone';
import {
  RecursiveCallTraceSnapshot,
  RecursiveCallTraceBuilder,
  RecursiveCallTraceAdapter,
} from '../../../core/renderers/adapters/recursive-call-trace-adapter';
import {
  BUILD_TREE_PROBLEM_HTML,
  BUILD_TREE_ANALYSIS_HTML,
} from './build-tree-problem-content';
import {
  BUILD_TREE_STAGE1_PRE_IN_CODE,
  BUILD_TREE_STAGE2_POST_IN_CODE,
  BUILD_TREE_STAGE3_STACK_CODE,
} from './build-tree-stage-codes';

export interface BTStep {
  tree: TreeNode | null;
  preorder: number[];
  inorder: number[];
  postorder?: number[];
  pL: number;
  pR: number;
  iL: number;
  iR: number;
  rootVal: number | null;
  inRoot: number;
  leftLen: number;
  decision: string;
  action: 'enter' | 'split' | 'leave' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, string | number>;
  stackState?: number[];
  inIdx?: number;
  // 高亮不变量增强字段
  visitedNodes?: number[];
  highlightedNodes?: number[];
  secondaryHighlightedNodes?: number[];
  // 递归调用栈踪迹快照
  callTrace?: RecursiveCallTraceSnapshot;
  stageId?: 'stage-1' | 'stage-2' | 'stage-3';
}

function cloneTree(node: TreeNode | null): TreeNode | null {
  return cloneStateDepTree(node);
}

/**
 * 递归层序遍历收集二叉树中所有非空节点值
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

// Stage 1 代码行号映射
export const BUILD_TREE_CODE_LINES = {
  entry: { java: 3, cpp: 4, python: 2, javascript: 1 },
  hashInorder: { java: 4, cpp: 5, python: 3, javascript: 3 },
  callBuild: { java: 5, cpp: 6, python: 13, javascript: 14 },
  funcHeader: { java: 7, cpp: 8, python: 4, javascript: 4 },
  baseCheck: { java: 8, cpp: 9, python: 5, javascript: 5 },
  extractRoot: { java: 9, cpp: 10, python: 6, javascript: 6 },
  createNode: { java: 10, cpp: 11, python: 7, javascript: 7 },
  findInRoot: { java: 11, cpp: 12, python: 8, javascript: 8 },
  calcLeftLen: { java: 12, cpp: 13, python: 9, javascript: 9 },
  leftCall: { java: 13, cpp: 14, python: 10, javascript: 10 },
  rightCall: { java: 14, cpp: 15, python: 11, javascript: 11 },
  returnRoot: { java: 15, cpp: 16, python: 12, javascript: 12 },
  done: { java: 5, cpp: 6, python: 13, javascript: 14 },
  // Backward compatibility aliases
  enter: { java: 8, cpp: 9, python: 5, javascript: 5 },
  split: { java: 10, cpp: 11, python: 7, javascript: 7 },
};

// Stage 2 代码行号映射
export const BUILD_TREE_STAGE2_LINES = {
  entry: { java: 3, cpp: 4, python: 2, javascript: 1 },
  hashInorder: { java: 4, cpp: 5, python: 3, javascript: 3 },
  callBuild: { java: 5, cpp: 6, python: 13, javascript: 14 },
  funcHeader: { java: 7, cpp: 8, python: 4, javascript: 4 },
  baseCheck: { java: 8, cpp: 9, python: 5, javascript: 5 },
  extractRoot: { java: 9, cpp: 10, python: 6, javascript: 6 },
  createNode: { java: 10, cpp: 11, python: 7, javascript: 7 },
  findInRoot: { java: 11, cpp: 12, python: 8, javascript: 8 },
  calcLeftLen: { java: 12, cpp: 13, python: 9, javascript: 9 },
  leftCall: { java: 13, cpp: 14, python: 10, javascript: 10 },
  rightCall: { java: 14, cpp: 15, python: 11, javascript: 11 },
  returnRoot: { java: 15, cpp: 16, python: 12, javascript: 12 },
  done: { java: 5, cpp: 6, python: 13, javascript: 14 },
  // Backward compatibility aliases
  enter: { java: 8, cpp: 9, python: 5, javascript: 5 },
  split: { java: 10, cpp: 11, python: 7, javascript: 7 },
};

// Stage 3 代码行号映射
export const BUILD_TREE_STAGE3_LINES = {
  entry: { java: 3, cpp: 4, python: 3, javascript: 2 },
  init: { java: 4, cpp: 5, python: 4, javascript: 3 },
  loop: { java: 8, cpp: 9, python: 7, javascript: 6 },
  checkLeft: { java: 11, cpp: 12, python: 10, javascript: 9 },
  attachLeft: { java: 12, cpp: 13, python: 11, javascript: 10 },
  popStack: { java: 15, cpp: 16, python: 14, javascript: 13 },
  attachRight: { java: 19, cpp: 20, python: 17, javascript: 17 },
  done: { java: 23, cpp: 24, python: 19, javascript: 21 },
};

// =========================================================================
// Stage 1: 前序+中序分治切分递归构造 (LC 105)
// =========================================================================
export function buildTreeSteps(preorder: number[], inorder: number[]): BTStep[] {
  const steps: BTStep[] = [];
  const n = preorder.length;
  const trace = new RecursiveCallTraceBuilder();

  if (n === 0 || inorder.length !== n) {
    trace.addHeader('buildTree(preorder, inorder)', 0, '输入异常校验');
    trace.addConditionHit('数组为空或长度不匹配 -> return null', 0, '参数不匹配，防御性退出');
    trace.addFinalResult('return null', 0, '退出', 'null');
    steps.push({
      tree: null,
      preorder,
      inorder,
      pL: -1,
      pR: -1,
      iL: -1,
      iR: -1,
      rootVal: null,
      inRoot: -1,
      leftLen: 0,
      decision: '数组为空或长度不匹配',
      action: 'done',
      message: '数组为空或长度不匹配，无法构造二叉树。',
      log: '空数组/长度不匹配 -> return null',
      metrics: { '当前状态': '异常退出' },
      codeLine: BUILD_TREE_CODE_LINES.baseCheck,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
    });
    return steps;
  }

  const inMap = new Map<number, number>();
  inorder.forEach((val, idx) => inMap.set(val, idx));

  // Step 0: 入口
  trace.addHeader(`buildTree(preorder[${n}], inorder[${n}])`, 0, '算法入口，初始化调用');
  steps.push({
    tree: null,
    preorder: [...preorder],
    inorder: [...inorder],
    pL: 0,
    pR: n - 1,
    iL: 0,
    iR: n - 1,
    rootVal: null,
    inRoot: -1,
    leftLen: 0,
    decision: '算法启动：进入 buildTree 入口函数',
    action: 'enter',
    message: `准备利用前序 pre=[${preorder.join(', ')}] 与中序 in=[${inorder.join(', ')}] 分治重构二叉树。`,
    log: 'Enter buildTree',
    metrics: { '前序长度': n, '中序长度': n },
    codeLine: BUILD_TREE_CODE_LINES.entry,
    callTrace: trace.snapshot(),
    stageId: 'stage-1',
  });

  // Step 1: 建立中序索引哈希表
  trace.addConditionPass('建立中序哈希映射 inMap', 0, `inMap 建立完成，大小 = ${inMap.size}`);
  steps.push({
    tree: null,
    preorder: [...preorder],
    inorder: [...inorder],
    pL: 0,
    pR: n - 1,
    iL: 0,
    iR: n - 1,
    rootVal: null,
    inRoot: -1,
    leftLen: 0,
    decision: '建立中序索引哈希表 inMap',
    action: 'enter',
    message: `为中序遍历建立快速索引哈希表，实现 O(1) 快速定位根节点在 inorder 中的位置。`,
    log: 'inMap created, start recursive build',
    metrics: { '前序长度': n, '中序长度': n, '哈希表尺寸': inMap.size },
    codeLine: BUILD_TREE_CODE_LINES.hashInorder,
    callTrace: trace.snapshot(),
    stageId: 'stage-1',
  });

  // Step 2: 启动根区间分治
  trace.addRecursePrep(`调用顶级递归 build(0..${n - 1}, 0..${n - 1})`, 0, '启动根节点与左右子树分治');
  steps.push({
    tree: null,
    preorder: [...preorder],
    inorder: [...inorder],
    pL: 0,
    pR: n - 1,
    iL: 0,
    iR: n - 1,
    rootVal: null,
    inRoot: -1,
    leftLen: 0,
    decision: `调用 build(pre, 0, ${n - 1}, 0, ${n - 1})`,
    action: 'enter',
    message: `准备分治递归构建整棵二叉树，初始区间：前序 [0..${n - 1}]，中序 [0..${n - 1}]。`,
    log: 'Call root build',
    metrics: { '前序区间': `[0..${n - 1}]`, '中序区间': `[0..${n - 1}]` },
    codeLine: BUILD_TREE_CODE_LINES.callBuild,
    callTrace: trace.snapshot(),
    stageId: 'stage-1',
  });

  let currentTreeRoot: TreeNode | null = null;

  function build(
    pL: number,
    pR: number,
    iL: number,
    iR: number,
    depth: number,
    parent?: TreeNode,
    branch?: 'left' | 'right'
  ): TreeNode | null {
    // 递归头
    trace.addHeader(`build(pL=${pL}..${pR}, iL=${iL}..${iR})`, depth, `进入递归层 (depth=${depth})`);
    steps.push({
      tree: cloneTree(currentTreeRoot),
      preorder,
      inorder,
      pL,
      pR,
      iL,
      iR,
      rootVal: null,
      inRoot: -1,
      leftLen: 0,
      decision: `进入 build 递归帧：前序 [${pL}..${pR}]，中序 [${iL}..${iR}]`,
      action: 'enter',
      message: `递归函数 build(pre, pL=${pL}, pR=${pR}, iL=${iL}, iR=${iR}) 启动。`,
      log: `Enter build([${pL}..${pR}], [${iL}..${iR}])`,
      metrics: { '当前前序区间': `[${pL}..${pR}]`, '当前中序区间': `[${iL}..${iR}]`, '递归深度': depth },
      codeLine: BUILD_TREE_CODE_LINES.funcHeader,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: parent ? [parent.val] : [],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== (parent ? parent.val : null)),
    });

    // 基底越界检查
    if (pL > pR || iL > iR) {
      trace.addConditionHit(`pL(${pL}) > pR(${pR}) || iL(${iL}) > iR(${iR}) -> return null`, depth, '命中基底条件，返回 null');
      trace.addReturnLeaf('return null', depth, '空子树返回');
      steps.push({
        tree: cloneTree(currentTreeRoot),
        preorder,
        inorder,
        pL,
        pR,
        iL,
        iR,
        rootVal: null,
        inRoot: -1,
        leftLen: 0,
        decision: `区间越界 [${pL}..${pR}] / [${iL}..${iR}]，返回 null`,
        action: 'leave',
        message: `子区间为空 (pL=${pL} > pR=${pR} 或 iL=${iL} > iR=${iR})，对应空子树，返回 null。`,
        log: `base case: return null for [${pL}..${pR}]`,
        metrics: { '区间状态': '越界空树' },
        codeLine: BUILD_TREE_CODE_LINES.baseCheck,
        callTrace: trace.snapshot(),
        stageId: 'stage-1',
        highlightedNodes: parent ? [parent.val] : [],
        visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== (parent ? parent.val : null)),
      });
      return null;
    }

    trace.addConditionPass(`区间有效 [${pL}..${pR}] / [${iL}..${iR}]`, depth, '区间非空，继续分治');

    const rootVal = preorder[pL];
    const inRoot = inMap.get(rootVal) ?? -1;
    const leftLen = inRoot - iL;
    const node: TreeNode = { val: rootVal, left: null, right: null };

    if (!currentTreeRoot) {
      currentTreeRoot = node;
    } else if (parent && branch) {
      parent[branch] = node;
    }

    // 创建根节点
    trace.addConditionPass(`前序定根: rootVal = ${rootVal}`, depth, '前序首元素锁定为当前子树根节点');
    steps.push({
      tree: cloneTree(currentTreeRoot),
      preorder,
      inorder,
      pL,
      pR,
      iL,
      iR,
      rootVal,
      inRoot,
      leftLen,
      decision: `前序定根: rootVal = ${rootVal}，创建节点`,
      action: 'split',
      message: `前序首元素为根: rootVal = pre[${pL}] = ${rootVal}，创建 TreeNode(${rootVal})。`,
      log: `Create node ${rootVal}`,
      metrics: { '当前根节点': rootVal },
      codeLine: BUILD_TREE_CODE_LINES.createNode,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [rootVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== rootVal),
    });

    // 中序定位与计算长度
    trace.addConditionPass(`中序定位: inRoot=${inRoot}, leftLen=${leftLen}`, depth, `中序划分：左长 ${leftLen}，右长 ${iR - inRoot}`);
    steps.push({
      tree: cloneTree(currentTreeRoot),
      preorder,
      inorder,
      pL,
      pR,
      iL,
      iR,
      rootVal,
      inRoot,
      leftLen,
      decision: `中序定位: inRoot = ${inRoot}，左子树长度 = ${leftLen}`,
      action: 'split',
      message: `根节点 ${rootVal} 在中序中下标为 ${inRoot}，推算出左子树长度 leftLen = ${inRoot} - ${iL} = ${leftLen}，右子树长度 = ${iR - inRoot}。`,
      log: `inRoot=${inRoot} leftLen=${leftLen}`,
      metrics: {
        '当前根节点': rootVal,
        '中序根索引': inRoot,
        '左子树长度': leftLen,
        '右子树长度': (iR - inRoot),
      },
      codeLine: BUILD_TREE_CODE_LINES.calcLeftLen,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [rootVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== rootVal),
    });

    // 递归左子树
    trace.addRecursePrep(`递归左子树: build(${pL + 1}..${pL + leftLen}, ${iL}..${inRoot - 1})`, depth, `向左深入，左子树节点数 = ${leftLen}`);
    steps.push({
      tree: cloneTree(currentTreeRoot),
      preorder,
      inorder,
      pL,
      pR,
      iL,
      iR,
      rootVal,
      inRoot,
      leftLen,
      decision: `发起左子树递归: pre[${pL + 1}..${pL + leftLen}], in[${iL}..${inRoot - 1}]`,
      action: 'split',
      message: `准备递归构建节点 ${rootVal} 的左子树：前序 [${pL + 1}..${pL + leftLen}]，中序 [${iL}..${inRoot - 1}]。`,
      log: `Recurse left for ${rootVal}`,
      metrics: { '当前根节点': rootVal, '左子树前序': `[${pL + 1}..${pL + leftLen}]`, '左子树中序': `[${iL}..${inRoot - 1}]` },
      codeLine: BUILD_TREE_CODE_LINES.leftCall,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [rootVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== rootVal),
    });

    node.left = build(pL + 1, pL + leftLen, iL, inRoot - 1, depth + 1, node, 'left');

    // 递归右子树
    trace.addRecursePrep(`递归右子树: build(${pL + leftLen + 1}..${pR}, ${inRoot + 1}..${iR})`, depth, `向右深入，右子树节点数 = ${iR - inRoot}`);
    steps.push({
      tree: cloneTree(currentTreeRoot),
      preorder,
      inorder,
      pL,
      pR,
      iL,
      iR,
      rootVal,
      inRoot,
      leftLen,
      decision: `发起右子树递归: pre[${pL + leftLen + 1}..${pR}], in[${inRoot + 1}..${iR}]`,
      action: 'split',
      message: `准备递归构建节点 ${rootVal} 的右子树：前序 [${pL + leftLen + 1}..${pR}]，中序 [${inRoot + 1}..${iR}]。`,
      log: `Recurse right for ${rootVal}`,
      metrics: { '当前根节点': rootVal, '右子树前序': `[${pL + leftLen + 1}..${pR}]`, '右子树中序': `[${inRoot + 1}..${iR}]` },
      codeLine: BUILD_TREE_CODE_LINES.rightCall,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [rootVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== rootVal),
    });

    node.right = build(pL + leftLen + 1, pR, inRoot + 1, iR, depth + 1, node, 'right');

    // 子树组装完成并返回
    trace.addUnwindCalc(`节点 ${rootVal} 左右子树构建完成`, depth, `左: ${node.left ? node.left.val : 'null'}, 右: ${node.right ? node.right.val : 'null'}`, `TreeNode(${rootVal})`);
    steps.push({
      tree: cloneTree(currentTreeRoot),
      preorder,
      inorder,
      pL,
      pR,
      iL,
      iR,
      rootVal,
      inRoot,
      leftLen,
      decision: `节点 ${rootVal} 左右子树构建完成并挂载`,
      action: 'leave',
      message: `节点 ${rootVal} 的左右子树递归构建完毕并完成双向挂载，向上层返回节点引用。`,
      log: `built node ${rootVal}`,
      metrics: { '当前根节点': rootVal, '左孩子': node.left ? node.left.val : 'null', '右孩子': node.right ? node.right.val : 'null' },
      codeLine: BUILD_TREE_CODE_LINES.returnRoot,
      callTrace: trace.snapshot(),
      stageId: 'stage-1',
      highlightedNodes: [rootVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== rootVal),
    });

    return node;
  }

  const resultTree = build(0, n - 1, 0, n - 1, 0);
  const allTreeNodes = collectTreeValues(resultTree);

  trace.addFinalResult('二叉树全拓扑重构构建完成', 0, `根节点: ${resultTree ? resultTree.val : 'null'}`, resultTree ? resultTree.val : 'null');
  steps.push({
    tree: cloneTree(resultTree),
    preorder,
    inorder,
    pL: 0,
    pR: n - 1,
    iL: 0,
    iR: n - 1,
    rootVal: resultTree ? resultTree.val : null,
    inRoot: -1,
    leftLen: 0,
    decision: '二叉树全拓扑重构构建完成',
    action: 'done',
    message: `成功利用前序与中序重构整棵二叉树，根节点值为 ${resultTree ? resultTree.val : 'null'}。`,
    log: 'build finished successfully',
    metrics: { '最终根节点': resultTree ? resultTree.val : 'null', '总节点数': n },
    codeLine: BUILD_TREE_CODE_LINES.done,
    callTrace: trace.snapshot(),
    stageId: 'stage-1',
    highlightedNodes: resultTree ? [resultTree.val] : [],
    visitedNodes: allTreeNodes,
  });

  return steps;
}

// =========================================================================
// Stage 2: 后序+中序分治切分递归构造 (LC 106)
// =========================================================================
export function buildTreeStage2PostorderSteps(inorder: number[], postorder: number[]): BTStep[] {
  const steps: BTStep[] = [];
  const n = postorder.length;
  const trace = new RecursiveCallTraceBuilder();

  if (n === 0 || inorder.length !== n) {
    trace.addHeader('buildTree(inorder, postorder)', 0, '后序输入异常校验');
    trace.addConditionHit('数组为空或长度不匹配 -> return null', 0, '参数不匹配，防御退出');
    trace.addFinalResult('return null', 0, '退出', 'null');
    steps.push({
      tree: null,
      preorder: [],
      inorder,
      postorder,
      pL: -1,
      pR: -1,
      iL: -1,
      iR: -1,
      rootVal: null,
      inRoot: -1,
      leftLen: 0,
      decision: '数组为空或长度不匹配',
      action: 'done',
      message: '中序与后序数组为空或长度不匹配，无法构造二叉树。',
      log: 'empty arrays -> return null',
      metrics: { '当前状态': '异常退出' },
      codeLine: BUILD_TREE_STAGE2_LINES.baseCheck,
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
    });
    return steps;
  }

  const inMap = new Map<number, number>();
  inorder.forEach((val, idx) => inMap.set(val, idx));

  trace.addHeader(`buildTree(inorder[${n}], postorder[${n}])`, 0, '后序+中序算法入口');
  steps.push({
    tree: null,
    preorder: [],
    inorder: [...inorder],
    postorder: [...postorder],
    pL: 0,
    pR: n - 1,
    iL: 0,
    iR: n - 1,
    rootVal: null,
    inRoot: -1,
    leftLen: 0,
    decision: '算法启动：进入 buildTree 入口函数 (LC 106)',
    action: 'enter',
    message: `准备利用中序 in=[${inorder.join(', ')}] 与后序 post=[${postorder.join(', ')}] 分治重构二叉树。`,
    log: 'Enter postorder buildTree',
    metrics: { '后序长度': n, '中序长度': n },
    codeLine: BUILD_TREE_STAGE2_LINES.entry,
    callTrace: trace.snapshot(),
    stageId: 'stage-2',
  });

  trace.addConditionPass('建立中序哈希映射 inMap', 0, `inMap 大小 = ${inMap.size}`);
  steps.push({
    tree: null,
    preorder: [],
    inorder: [...inorder],
    postorder: [...postorder],
    pL: 0,
    pR: n - 1,
    iL: 0,
    iR: n - 1,
    rootVal: null,
    inRoot: -1,
    leftLen: 0,
    decision: '算法启动：建立中序索引哈希表 (后序定根)',
    action: 'enter',
    message: `输入中序 in=[${inorder.join(', ')}]，后序 post=[${postorder.join(', ')}]，后序末元素为根，inMap 定位切分点。`,
    log: 'inMap created, start postorder recursive build',
    metrics: { '后序长度': n, '中序长度': n, '哈希表尺寸': inMap.size },
    codeLine: BUILD_TREE_STAGE2_LINES.hashInorder,
    callTrace: trace.snapshot(),
    stageId: 'stage-2',
  });

  trace.addRecursePrep(`调用顶级递归 build(0..${n - 1}, 0..${n - 1})`, 0, '启动后序根节点与左右子树分治');
  steps.push({
    tree: null,
    preorder: [],
    inorder: [...inorder],
    postorder: [...postorder],
    pL: 0,
    pR: n - 1,
    iL: 0,
    iR: n - 1,
    rootVal: null,
    inRoot: -1,
    leftLen: 0,
    decision: `调用 build(post, 0, ${n - 1}, 0, ${n - 1})`,
    action: 'enter',
    message: `准备后序分治递归构建整棵二叉树，初始区间：后序 [0..${n - 1}]，中序 [0..${n - 1}]。`,
    log: 'Call postorder root build',
    metrics: { '后序区间': `[0..${n - 1}]`, '中序区间': `[0..${n - 1}]` },
    codeLine: BUILD_TREE_STAGE2_LINES.callBuild,
    callTrace: trace.snapshot(),
    stageId: 'stage-2',
  });

  let currentTreeRoot: TreeNode | null = null;

  function build(
    postL: number,
    postR: number,
    inL: number,
    inR: number,
    depth: number,
    parent?: TreeNode,
    branch?: 'left' | 'right'
  ): TreeNode | null {
    trace.addHeader(`build(postL=${postL}..${postR}, inL=${inL}..${inR})`, depth, `进入递归层 (depth=${depth})`);
    steps.push({
      tree: cloneTree(currentTreeRoot),
      preorder: [],
      inorder,
      postorder,
      pL: postL,
      pR: postR,
      iL: inL,
      iR: inR,
      rootVal: null,
      inRoot: -1,
      leftLen: 0,
      decision: `进入 build 递归帧：后序 [${postL}..${postR}]，中序 [${inL}..${inR}]`,
      action: 'enter',
      message: `递归函数 build(post, postL=${postL}, postR=${postR}, inL=${inL}, inR=${inR}) 启动。`,
      log: `Enter postorder build([${postL}..${postR}], [${inL}..${inR}])`,
      metrics: { '当前后序区间': `[${postL}..${postR}]`, '当前中序区间': `[${inL}..${inR}]`, '递归深度': depth },
      codeLine: BUILD_TREE_STAGE2_LINES.funcHeader,
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      highlightedNodes: parent ? [parent.val] : [],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== (parent ? parent.val : null)),
    });

    if (postL > postR || inL > inR) {
      trace.addConditionHit(`postL(${postL}) > postR(${postR}) || inL(${inL}) > inR(${inR}) -> return null`, depth, '命中基底条件，返回 null');
      trace.addReturnLeaf('return null', depth, '空子树返回');
      steps.push({
        tree: cloneTree(currentTreeRoot),
        preorder: [],
        inorder,
        postorder,
        pL: postL,
        pR: postR,
        iL: inL,
        iR: inR,
        rootVal: null,
        inRoot: -1,
        leftLen: 0,
        decision: `后序区间越界 [${postL}..${postR}] / [${inL}..${inR}]，返回 null`,
        action: 'leave',
        message: `子区间为空 (postL=${postL} > postR=${postR})，对应空子树，返回 null。`,
        log: `base case: return null for post [${postL}..${postR}]`,
        metrics: { '区间状态': '越界空树' },
        codeLine: BUILD_TREE_STAGE2_LINES.baseCheck,
        callTrace: trace.snapshot(),
        stageId: 'stage-2',
        highlightedNodes: parent ? [parent.val] : [],
        visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== (parent ? parent.val : null)),
      });
      return null;
    }

    trace.addConditionPass(`区间有效 [${postL}..${postR}] / [${inL}..${inR}]`, depth, '区间非空，继续分治');

    const rootVal = postorder[postR];
    const inRoot = inMap.get(rootVal) ?? -1;
    const leftLen = inRoot - inL;
    const node: TreeNode = { val: rootVal, left: null, right: null };

    if (!currentTreeRoot) {
      currentTreeRoot = node;
    } else if (parent && branch) {
      parent[branch] = node;
    }

    trace.addConditionPass(`后序定根: rootVal = ${rootVal}`, depth, '后序尾元素锁定为当前子树根节点');
    steps.push({
      tree: cloneTree(currentTreeRoot),
      preorder: [],
      inorder,
      postorder,
      pL: postL,
      pR: postR,
      iL: inL,
      iR: inR,
      rootVal,
      inRoot,
      leftLen,
      decision: `后序尾元素定根: ${rootVal}，创建节点`,
      action: 'split',
      message: `后序尾部 post[${postR}]=${rootVal} 为根，创建 TreeNode(${rootVal})。`,
      log: `Create postorder node ${rootVal}`,
      metrics: { '当前根节点': rootVal },
      codeLine: BUILD_TREE_STAGE2_LINES.createNode,
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      highlightedNodes: [rootVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== rootVal),
    });

    trace.addConditionPass(`中序定位: inRoot=${inRoot}, leftLen=${leftLen}`, depth, `切分：左长 ${leftLen}，右长 ${inR - inRoot}`);
    steps.push({
      tree: cloneTree(currentTreeRoot),
      preorder: [],
      inorder,
      postorder,
      pL: postL,
      pR: postR,
      iL: inL,
      iR: inR,
      rootVal,
      inRoot,
      leftLen,
      decision: `中序定位: inRoot = ${inRoot}，左子树长度 = ${leftLen}`,
      action: 'split',
      message: `根节点 ${rootVal} 在中序中位于下标 ${inRoot}。左子树长度 leftLen=${leftLen}，右子树长度=${inR - inRoot}。`,
      log: `root=${rootVal} inRoot=${inRoot} leftLen=${leftLen}`,
      metrics: {
        '当前根节点': rootVal,
        '中序根索引': inRoot,
        '左子树长度': leftLen,
        '右子树长度': inR - inRoot,
      },
      codeLine: BUILD_TREE_STAGE2_LINES.calcLeftLen,
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      highlightedNodes: [rootVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== rootVal),
    });

    // 递归左子树: post[postL .. postL + leftLen - 1], in[inL .. inRoot - 1]
    trace.addRecursePrep(`递归左子树: build(${postL}..${postL + leftLen - 1}, ${inL}..${inRoot - 1})`, depth, `向左深入，左子树节点数 = ${leftLen}`);
    steps.push({
      tree: cloneTree(currentTreeRoot),
      preorder: [],
      inorder,
      postorder,
      pL: postL,
      pR: postR,
      iL: inL,
      iR: inR,
      rootVal,
      inRoot,
      leftLen,
      decision: `发起左子树递归: post[${postL}..${postL + leftLen - 1}], in[${inL}..${inRoot - 1}]`,
      action: 'split',
      message: `准备递归构建节点 ${rootVal} 的左子树：后序 [${postL}..${postL + leftLen - 1}]，中序 [${inL}..${inRoot - 1}]。`,
      log: `Recurse left for ${rootVal}`,
      metrics: { '当前根节点': rootVal, '左子树后序': `[${postL}..${postL + leftLen - 1}]`, '左子树中序': `[${inL}..${inRoot - 1}]` },
      codeLine: BUILD_TREE_STAGE2_LINES.leftCall,
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      highlightedNodes: [rootVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== rootVal),
    });

    node.left = build(postL, postL + leftLen - 1, inL, inRoot - 1, depth + 1, node, 'left');

    // 递归右子树: post[postL + leftLen .. postR - 1], in[inRoot + 1 .. inR]
    trace.addRecursePrep(`递归右子树: build(${postL + leftLen}..${postR - 1}, ${inRoot + 1}..${inR})`, depth, `向右深入，右子树节点数 = ${inR - inRoot}`);
    steps.push({
      tree: cloneTree(currentTreeRoot),
      preorder: [],
      inorder,
      postorder,
      pL: postL,
      pR: postR,
      iL: inL,
      iR: inR,
      rootVal,
      inRoot,
      leftLen,
      decision: `发起右子树递归: post[${postL + leftLen}..${postR - 1}], in[${inRoot + 1}..${inR}]`,
      action: 'split',
      message: `准备递归构建节点 ${rootVal} 的右子树：后序 [${postL + leftLen}..${postR - 1}]，中序 [${inRoot + 1}..${inR}]。`,
      log: `Recurse right for ${rootVal}`,
      metrics: { '当前根节点': rootVal, '右子树后序': `[${postL + leftLen}..${postR - 1}]`, '右子树中序': `[${inRoot + 1}..${inR}]` },
      codeLine: BUILD_TREE_STAGE2_LINES.rightCall,
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      highlightedNodes: [rootVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== rootVal),
    });

    node.right = build(postL + leftLen, postR - 1, inRoot + 1, inR, depth + 1, node, 'right');

    trace.addUnwindCalc(`节点 ${rootVal} 左右子树构建完成`, depth, `左: ${node.left ? node.left.val : 'null'}, 右: ${node.right ? node.right.val : 'null'}`, `TreeNode(${rootVal})`);
    steps.push({
      tree: cloneTree(currentTreeRoot),
      preorder: [],
      inorder,
      postorder,
      pL: postL,
      pR: postR,
      iL: inL,
      iR: inR,
      rootVal,
      inRoot,
      leftLen,
      decision: `节点 ${rootVal} 左右子树构建完成并挂载`,
      action: 'leave',
      message: `节点 ${rootVal} 的左右子树递归构建完毕并挂载，向上层返回节点引用。`,
      log: `built node ${rootVal}`,
      metrics: { '当前根节点': rootVal, '左孩子': node.left ? node.left.val : 'null', '右孩子': node.right ? node.right.val : 'null' },
      codeLine: BUILD_TREE_STAGE2_LINES.returnRoot,
      callTrace: trace.snapshot(),
      stageId: 'stage-2',
      highlightedNodes: [rootVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== rootVal),
    });

    return node;
  }

  const resultTree = build(0, n - 1, 0, n - 1, 0);
  const allTreeNodes = collectTreeValues(resultTree);

  trace.addFinalResult('后序+中序二叉树拓扑重构构建完成', 0, `根节点: ${resultTree ? resultTree.val : 'null'}`, resultTree ? resultTree.val : 'null');
  steps.push({
    tree: cloneTree(resultTree),
    preorder: [],
    inorder,
    postorder,
    pL: 0,
    pR: n - 1,
    iL: 0,
    iR: n - 1,
    rootVal: resultTree ? resultTree.val : null,
    inRoot: -1,
    leftLen: 0,
    decision: '后序+中序二叉树拓扑重构构建完成',
    action: 'done',
    message: `成功利用后序与中序重构整棵二叉树，根节点值为 ${resultTree ? resultTree.val : 'null'}。`,
    log: 'postorder build finished successfully',
    metrics: { '最终根节点': resultTree ? resultTree.val : 'null', '总节点数': n },
    codeLine: BUILD_TREE_STAGE2_LINES.done,
    callTrace: trace.snapshot(),
    stageId: 'stage-2',
    highlightedNodes: resultTree ? [resultTree.val] : [],
    visitedNodes: allTreeNodes,
  });

  return steps;
}

// =========================================================================
// Stage 3: 迭代显式栈模拟前序重构 ($O(N)$ 零哈希表 · LC 105 迭代法)
// =========================================================================
export function buildTreeStage3StackSteps(preorder: number[], inorder: number[]): BTStep[] {
  const steps: BTStep[] = [];
  const n = preorder.length;

  if (n === 0 || inorder.length !== n) {
    steps.push({
      tree: null,
      preorder,
      inorder,
      pL: -1,
      pR: -1,
      iL: -1,
      iR: -1,
      rootVal: null,
      inRoot: -1,
      leftLen: 0,
      decision: '数组为空或长度不匹配',
      action: 'done',
      message: '前序与中序数组为空或长度不匹配，无法构造二叉树。',
      log: 'empty arrays -> return null',
      metrics: { '当前状态': '异常退出' },
      codeLine: BUILD_TREE_STAGE3_LINES.entry,
      stackState: [],
      inIdx: 0,
      stageId: 'stage-3',
    });
    return steps;
  }

  const rootVal = preorder[0];
  const rootNode: TreeNode = { val: rootVal, left: null, right: null };
  const stack: TreeNode[] = [rootNode];
  let inIdx = 0;

  steps.push({
    tree: cloneTree(rootNode),
    preorder: [...preorder],
    inorder: [...inorder],
    pL: 0,
    pR: n - 1,
    iL: 0,
    iR: n - 1,
    rootVal,
    inRoot: -1,
    leftLen: 0,
    decision: `前序首元素 ${rootVal} 入栈作为根节点`,
    action: 'enter',
    message: `初始化显式单调栈，放入前序首节点 ${rootVal}。中序指针 inIdx 指向 0 (inorder[0]=${inorder[0]})。`,
    log: `push root ${rootVal} to stack`,
    metrics: { '栈顶节点': rootVal, '栈大小': stack.length, '中序指针 inIdx': inIdx },
    codeLine: BUILD_TREE_STAGE3_LINES.init,
    stackState: stack.map((node) => node.val),
    inIdx,
    stageId: 'stage-3',
  });

  for (let i = 1; i < n; i++) {
    const val = preorder[i];
    let node = stack[stack.length - 1];

    if (node.val !== inorder[inIdx]) {
      // 栈顶不等于当前中序元素，说明依然是左倾分支
      const childNode: TreeNode = { val, left: null, right: null };
      node.left = childNode;
      stack.push(childNode);

      steps.push({
        tree: cloneTree(rootNode),
        preorder,
        inorder,
        pL: i,
        pR: n - 1,
        iL: inIdx,
        iR: n - 1,
        rootVal: val,
        inRoot: -1,
        leftLen: 0,
        decision: `栈顶 ${node.val} != in[${inIdx}](${inorder[inIdx]})，挂载为左孩子`,
        action: 'split',
        message: `前序元素 ${val}：栈顶节点 ${node.val} 与当前中序元素 ${inorder[inIdx]} 不等，说明属于一路向左分支，挂载为 ${node.val} 的左孩子并压栈。`,
        log: `node ${node.val}.left = ${val}, push ${val}`,
        metrics: { '新插入节点': val, '父节点': node.val, '挂载方向': '左孩子', '栈大小': stack.length },
        codeLine: BUILD_TREE_STAGE3_LINES.attachLeft,
        stackState: stack.map((nd) => nd.val),
        inIdx,
        stageId: 'stage-3',
        highlightedNodes: [val],
        visitedNodes: collectTreeValues(rootNode).filter((v) => v !== val),
      });
    } else {
      // 栈顶等于当前中序元素，说明左子树已完整遍历，出栈找到拐点
      const poppedNodes: number[] = [];
      while (stack.length > 0 && stack[stack.length - 1].val === inorder[inIdx]) {
        node = stack.pop()!;
        poppedNodes.push(node.val);
        inIdx++;
      }

      const childNode: TreeNode = { val, left: null, right: null };
      node.right = childNode;
      stack.push(childNode);

      steps.push({
        tree: cloneTree(rootNode),
        preorder,
        inorder,
        pL: i,
        pR: n - 1,
        iL: inIdx,
        iR: n - 1,
        rootVal: val,
        inRoot: -1,
        leftLen: 0,
        decision: `匹配中序，出栈 [${poppedNodes.join(', ')}]，拐点 ${node.val} 挂载右孩子 ${val}`,
        action: 'leave',
        message: `栈顶与中序 ${poppedNodes.join('->')} 匹配成功出栈，指针推进至 ${inIdx}。前序元素 ${val} 挂载为拐点节点 ${node.val} 的右孩子并压栈。`,
        log: `pop [${poppedNodes.join(', ')}], node ${node.val}.right = ${val}`,
        metrics: { '新插入节点': val, '父拐点节点': node.val, '挂载方向': '右孩子', '栈大小': stack.length },
        codeLine: BUILD_TREE_STAGE3_LINES.attachRight,
        stackState: stack.map((nd) => nd.val),
        inIdx,
        stageId: 'stage-3',
        highlightedNodes: [val],
        visitedNodes: collectTreeValues(rootNode).filter((v) => v !== val),
      });
    }
  }

  const allTreeNodes = collectTreeValues(rootNode);

  steps.push({
    tree: cloneTree(rootNode),
    preorder,
    inorder,
    pL: 0,
    pR: n - 1,
    iL: 0,
    iR: n - 1,
    rootVal: rootNode.val,
    inRoot: -1,
    leftLen: 0,
    decision: '迭代显式栈前序重构构建完成',
    action: 'done',
    message: `全部前序与中序节点消费完毕，二叉树拓扑完整还原，根节点为 ${rootNode.val}。`,
    log: 'iterative stack build done',
    metrics: { '最终根节点': rootNode.val, '总节点数': n },
    codeLine: BUILD_TREE_STAGE3_LINES.done,
    stackState: stack.map((nd) => nd.val),
    inIdx,
    stageId: 'stage-3',
    highlightedNodes: [rootNode.val],
    visitedNodes: allTreeNodes,
  });

  return steps;
}

// =========================================================================
// 顶层声明式算法注册 (Register Declarative Algorithm)
// =========================================================================
export const buildTreeVisualizer = registerDeclarativeAlgorithm({
  id: 'build-tree',
  name: '从前序/后序与中序遍历构造二叉树',
  category: 'tree',
  aliases: [
    'tree-036-build-tree-preorder-inorder',
    'build-tree-from-preorder-inorder',
    'build-tree-2',
    'leetcode-106',
    'construct-binary-tree-from-inorder-and-postorder',
  ],
  inputs: [
    {
      id: 'input-preorder',
      label: '前序遍历 preorder (逗号分隔)',
      type: 'text',
      defaultValue: '3, 9, 20, 15, 7',
      placeholder: '例如: 3, 9, 20, 15, 7',
    },
    {
      id: 'input-inorder',
      label: '中序遍历 inorder (逗号分隔)',
      type: 'text',
      defaultValue: '9, 3, 15, 20, 7',
      placeholder: '例如: 9, 3, 15, 20, 7',
    },
    {
      id: 'input-postorder',
      label: '后序遍历 postorder (逗号分隔，Stage 2 专用)',
      type: 'text',
      defaultValue: '9, 15, 7, 20, 3',
      placeholder: '例如: 9, 15, 7, 20, 3',
    },
  ],
  presets: [
    {
      label: 'LeetCode 经典不平衡树',
      values: {
        'input-preorder': '3, 9, 20, 15, 7',
        'input-inorder': '9, 3, 15, 20, 7',
        'input-postorder': '9, 15, 7, 20, 3',
      },
      description: '根 3，左 9，右子树 20(15, 7)',
    },
    {
      label: '完美满二叉树 (7节点)',
      values: {
        'input-preorder': '4, 2, 1, 3, 6, 5, 7',
        'input-inorder': '1, 2, 3, 4, 5, 6, 7',
        'input-postorder': '1, 3, 2, 5, 7, 6, 4',
      },
      description: '满二叉树：根4，左子树2(1,3)，右子树6(5,7)',
    },
    {
      label: '简单三节点树',
      values: {
        'input-preorder': '1, 2, 3',
        'input-inorder': '2, 1, 3',
        'input-postorder': '2, 3, 1',
      },
      description: '根 1，左 2，右 3',
    },
    {
      label: '单链左斜树 (退化)',
      values: {
        'input-preorder': '1, 2, 3',
        'input-inorder': '3, 2, 1',
        'input-postorder': '3, 2, 1',
      },
      description: '只有左孩子单侧链',
    },
    {
      label: '单节点树',
      values: {
        'input-preorder': '1',
        'input-inorder': '1',
        'input-postorder': '1',
      },
      description: '仅包含根节点 1',
    },
  ],
  metrics: [
    { id: 'cur-root', label: '当前锁定根节点', color: '#f59e0b' },
    { id: 'pre-range', label: '前序/后序区间 [pL..pR]', color: '#2563eb' },
    { id: 'in-range', label: '中序区间 [iL..iR]', color: '#0d9488' },
  ],
  codeLanguages: BUILD_TREE_STAGE1_PRE_IN_CODE,
  problemHtml: BUILD_TREE_PROBLEM_HTML,
  analysisHtml: BUILD_TREE_ANALYSIS_HTML,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 前序+中序分治切分递归构造 (LC 105)',
      shortName: '前序+中序分治',
      num: 1,
      codeLanguages: BUILD_TREE_STAGE1_PRE_IN_CODE,
      buildSteps: (inputs) => {
        const pre = parseNumberList(inputs?.['input-preorder'] || inputs?.['preorder'] || '3, 9, 20, 15, 7', [3, 9, 20, 15, 7]);
        const inArr = parseNumberList(inputs?.['input-inorder'] || inputs?.['inorder'] || '9, 3, 15, 20, 7', [9, 3, 15, 20, 7]);
        return buildTreeSteps(pre, inArr);
      },
      renderCanvas: (container, step) => renderBuildTreeCanvas(container, step),
      renderCustomMetrics: (container, step) => renderBuildTreeCustomMetrics(container, step),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 后序+中序分治切分递归构造 (LC 106)',
      shortName: '后序+中序分治',
      num: 2,
      codeLanguages: BUILD_TREE_STAGE2_POST_IN_CODE,
      buildSteps: (inputs) => {
        const inArr = parseNumberList(inputs?.['input-inorder'] || inputs?.['inorder'] || '9, 3, 15, 20, 7', [9, 3, 15, 20, 7]);
        const post = parseNumberList(inputs?.['input-postorder'] || inputs?.['postorder'] || '9, 15, 7, 20, 3', [9, 15, 7, 20, 3]);
        return buildTreeStage2PostorderSteps(inArr, post);
      },
      renderCanvas: (container, step) => renderBuildTreeCanvas(container, step),
      renderCustomMetrics: (container, step) => renderBuildTreeCustomMetrics(container, step),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 迭代显式栈模拟前序重构 ($O(N)$ 零哈希表 · LC 105 迭代法)',
      shortName: '迭代显式栈',
      num: 3,
      codeLanguages: BUILD_TREE_STAGE3_STACK_CODE,
      buildSteps: (inputs) => {
        const pre = parseNumberList(inputs?.['input-preorder'] || inputs?.['preorder'] || '3, 9, 20, 15, 7', [3, 9, 20, 15, 7]);
        const inArr = parseNumberList(inputs?.['input-inorder'] || inputs?.['inorder'] || '9, 3, 15, 20, 7', [9, 3, 15, 20, 7]);
        return buildTreeStage3StackSteps(pre, inArr);
      },
      renderCanvas: (container, step) => renderBuildTreeCanvas(container, step),
      renderCustomMetrics: (container, step) => renderBuildTreeCustomMetrics(container, step),
    },
  ],
  generateSteps: (inputs) => {
    const pre = parseNumberList(inputs?.['input-preorder'] || inputs?.['preorder'] || '3, 9, 20, 15, 7', [3, 9, 20, 15, 7]);
    const inArr = parseNumberList(inputs?.['input-inorder'] || inputs?.['inorder'] || '9, 3, 15, 20, 7', [9, 3, 15, 20, 7]);
    return buildTreeSteps(pre, inArr);
  },
  buildSteps: (inputs) => {
    const pre = parseNumberList(inputs?.['input-preorder'] || inputs?.['preorder'] || '3, 9, 20, 15, 7', [3, 9, 20, 15, 7]);
    const inArr = parseNumberList(inputs?.['input-inorder'] || inputs?.['inorder'] || '9, 3, 15, 20, 7', [9, 3, 15, 20, 7]);
    return buildTreeSteps(pre, inArr);
  },
  renderCanvas: (container, step) => renderBuildTreeCanvas(container, step),
  renderCustomMetrics: (container, step) => renderBuildTreeCustomMetrics(container, step),
});

/**
 * Card 1: 纯粹的树形沙盘渲染 (Pure SVG/Canvas Sandbox)
 * 绝对零套娃、零直接修改 #dsp-custom-metrics-container、零指标覆盖
 */
function renderBuildTreeCanvas(container: HTMLElement, step: BTStep) {
  if (step.tree) {
    const allTreeVals = collectTreeValues(step.tree);
    const isDone = step.action === 'done';
    // 若完成态，全部树节点全量纳入 visitedNodes（翡翠绿常驻高亮）；推演过程中若未提供则默认将非当前焦点节点作为 visited
    const visited = isDone
      ? allTreeVals
      : (step.visitedNodes ?? allTreeVals.filter((v) => v !== step.rootVal));

    const primaryNodes = step.highlightedNodes && step.highlightedNodes.length > 0
      ? step.highlightedNodes
      : (step.rootVal != null ? [step.rootVal] : []);

    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.rootVal,
      highlightedNodes: primaryNodes,
      visitedNodes: visited,
      primaryColor: '#fbbf24', // 金黄色聚焦点
      visitedColor: '#34d399', // 翡翠绿完工/常驻高亮
      secondaryColor: '#60a5fa', // 天蓝色
    });
  } else {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
        <svg width="240" height="120" viewBox="0 0 240 120">
          <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">重构准备中</text>
        </svg>
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">即将从遍历序列定位根节点...</span>
      </div>
    `;
  }
}

/**
 * Card 2: 领域指标监控与递归调用栈沙盘 (Custom Metrics & Recursive Call Trace / Stack Monitor)
 */
export function renderBuildTreeCustomMetrics(container: HTMLElement, step: BTStep) {
  container.innerHTML = '';
  container.className = 'p-3 flex flex-col gap-3 min-h-[300px] overflow-y-auto';

  const isStackStage = step.stackState !== undefined;

  // 1. 顶部 4 维核心数值卡片网格
  const metricGrid = document.createElement('div');
  metricGrid.className = 'grid grid-cols-2 sm:grid-cols-4 gap-2 flex-shrink-0';
  metricGrid.innerHTML = `
    <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
      <span class="text-[10px] text-slate-400">当前锁定根:</span>
      <span class="text-sm font-bold text-amber-400 font-mono">${step.rootVal != null ? `${step.rootVal}` : '—'}</span>
    </div>
    <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
      <span class="text-[10px] text-slate-400">前序/后序区间:</span>
      <span class="text-sm font-bold text-blue-400 font-mono">${step.pL >= 0 ? `[${step.pL}..${step.pR}]` : '—'}</span>
    </div>
    <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
      <span class="text-[10px] text-slate-400">中序区间:</span>
      <span class="text-sm font-bold text-teal-400 font-mono">${step.iL >= 0 ? `[${step.iL}..${step.iR}]` : '—'}</span>
    </div>
    <div class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
      <span class="text-[10px] text-slate-400">${isStackStage ? '中序指针 inIdx:' : '左子树长度:'}</span>
      <span class="text-sm font-bold text-indigo-400 font-mono">${isStackStage ? `inIdx=${step.inIdx ?? 0}` : `${step.leftLen}`}</span>
    </div>
  `;
  container.appendChild(metricGrid);

  // 2. 中部：Stage 1/2 递归调用栈踪迹监控沙盘 VS Stage 3 显式遍历栈监控
  if (isStackStage) {
    const stackBox = document.createElement('div');
    stackBox.className = 'p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/60 flex-shrink-0';
    stackBox.innerHTML = `
      <div class="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
        <span>🥞 显式单调栈状态 (Explicit Stack)</span>
        <span class="text-[10px] text-slate-400 font-normal">(O(N) 零递归栈模拟)</span>
      </div>
      <div class="flex items-center gap-2 text-xs font-mono">
        <span class="text-slate-400">栈内元素 (栈底 ➔ 栈顶):</span>
        <div class="flex items-center gap-1 flex-wrap">
          ${(step.stackState && step.stackState.length > 0)
            ? step.stackState.map((v, idx) => `
                <span class="px-2 py-0.5 rounded ${idx === step.stackState!.length - 1 ? 'bg-amber-950/80 border border-amber-500/70 text-amber-300 font-bold' : 'bg-blue-950/70 border border-blue-600/60 text-blue-300 font-bold'}">
                  ${v}${idx === step.stackState!.length - 1 ? ' (顶)' : ''}
                </span>
              `).join('')
            : '<span class="text-slate-500 italic">空栈 []</span>'}
        </div>
      </div>
    `;
    container.appendChild(stackBox);
  } else if (step.callTrace) {
    const traceBox = document.createElement('div');
    traceBox.className = 'flex-1 min-h-[160px] max-h-[260px] overflow-hidden flex flex-col rounded-lg bg-slate-800/60 border border-slate-700/50';
    RecursiveCallTraceAdapter.render(traceBox, step.callTrace);
    container.appendChild(traceBox);
  }

  // 3. 底部推演决策卡片
  const isDone = step.action === 'done';
  const summaryBox = document.createElement('div');
  summaryBox.className = `p-2.5 rounded-lg border text-xs leading-relaxed flex-shrink-0 ${
    isDone ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200' : 'bg-slate-800/50 border-slate-700/40 text-slate-300'
  }`;
  summaryBox.innerHTML = `
    <div class="font-bold mb-1 ${isDone ? 'text-emerald-400' : 'text-cyan-400'}">⚡ 决策推演: ${step.decision}</div>
    <div class="text-slate-400">${step.message}</div>
  `;
  container.appendChild(summaryBox);
}
