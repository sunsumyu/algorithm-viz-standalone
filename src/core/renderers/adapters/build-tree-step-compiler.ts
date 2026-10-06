/**
 * 从前序/后序与中序构造二叉树推演步进编译器深模块 (BuildTreeStepCompiler)
 *
 * 遵循 Matt Pocock 深模块哲学与“两适配器深化法则（Two-Adapter Deepening Rule）”，
 * 封装 LeetCode 105 & 106 / Zuoshen Class 036 Code07 的多阶段演化推演逻辑：
 *   - Stage 1: 前序+中序分治切分递归构造 (LC 105)
 *   - Stage 2: 后序+中序分治切分递归构造 (LC 106)
 *   - Stage 3: 迭代显式栈模拟前序重构 ($O(N)$ 零哈希表 · LC 105 迭代法)
 */

import { TreeNode } from '../../../algorithms/categories/tree/tree-template';
import { cloneStateDepTree } from '../../strategies/tree-clone';
import { HighlightTarget } from '../../step-visualizer';
import {
  RecursiveCallTraceSnapshot,
  RecursiveCallTraceBuilder,
} from './recursive-call-trace-adapter';

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

export class BuildTreeStepCompiler {
  /**
   * Stage 1: 前序+中序分治切分递归构造 (LC 105)
   */
  public static compilePreorderInorderSteps(preorder: number[], inorder: number[]): BTStep[] {
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
          '右子树长度': iR - inRoot,
        },
        codeLine: BUILD_TREE_CODE_LINES.calcLeftLen,
        callTrace: trace.snapshot(),
        stageId: 'stage-1',
        highlightedNodes: [rootVal],
        visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== rootVal),
      });

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

  /**
   * Stage 2: 后序+中序分治切分递归构造 (LC 106)
   */
  public static compileInorderPostorderSteps(inorder: number[], postorder: number[]): BTStep[] {
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

  /**
   * Stage 3: 迭代显式栈模拟前序重构 ($O(N)$ 零哈希表 · LC 105 迭代法)
   */
  public static compileStage3StackSteps(preorder: number[], inorder: number[]): BTStep[] {
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
}

// 向后兼容函数导出
export const buildTreeSteps = BuildTreeStepCompiler.compilePreorderInorderSteps;
export const buildTreeStage2PostorderSteps = BuildTreeStepCompiler.compileInorderPostorderSteps;
export const buildTreeStage3StackSteps = BuildTreeStepCompiler.compileStage3StackSteps;
