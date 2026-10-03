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
  enter: { java: 8, cpp: 9, python: 5, javascript: 5 },
  split: { java: 10, cpp: 11, python: 7, javascript: 7 },
  leftCall: { java: 13, cpp: 14, python: 10, javascript: 10 },
  rightCall: { java: 14, cpp: 15, python: 11, javascript: 11 },
  returnRoot: { java: 15, cpp: 16, python: 12, javascript: 12 },
  done: { java: 5, cpp: 6, python: 13, javascript: 14 },
};

// Stage 2 代码行号映射
export const BUILD_TREE_STAGE2_LINES = {
  entry: { java: 3, cpp: 4, python: 2, javascript: 1 },
  hashInorder: { java: 4, cpp: 5, python: 3, javascript: 3 },
  enter: { java: 8, cpp: 9, python: 5, javascript: 5 },
  split: { java: 10, cpp: 11, python: 7, javascript: 7 },
  leftCall: { java: 13, cpp: 14, python: 10, javascript: 10 },
  rightCall: { java: 14, cpp: 15, python: 11, javascript: 11 },
  returnRoot: { java: 15, cpp: 16, python: 12, javascript: 12 },
  done: { java: 5, cpp: 6, python: 13, javascript: 14 },
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
      message: '数组为空或长度不匹配，无法构造二叉树。',
      log: '空数组/长度不匹配 -> return null',
      metrics: { '当前状态': '异常退出' },
      codeLine: BUILD_TREE_CODE_LINES.enter,
    });
    return steps;
  }

  const inMap = new Map<number, number>();
  inorder.forEach((val, idx) => inMap.set(val, idx));

  // Step 0: 入口
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
    decision: '算法启动：建立中序索引哈希表',
    action: 'enter',
    message: `输入前序 pre=[${preorder.join(', ')}]，中序 in=[${inorder.join(', ')}]，建立 inMap 实现 O(1) 根节点定位。`,
    log: 'inMap created, start recursive build',
    metrics: { '前序长度': n, '中序长度': n, '哈希表尺寸': inMap.size },
    codeLine: BUILD_TREE_CODE_LINES.hashInorder,
  });

  let currentTreeRoot: TreeNode | null = null;

  function build(pL: number, pR: number, iL: number, iR: number): TreeNode | null {
    if (pL > pR || iL > iR) {
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
        codeLine: BUILD_TREE_CODE_LINES.enter,
      });
      return null;
    }

    const rootVal = preorder[pL];
    const inRoot = inMap.get(rootVal) ?? -1;
    const leftLen = inRoot - iL;
    const node: TreeNode = { val: rootVal, left: null, right: null };

    if (!currentTreeRoot) {
      currentTreeRoot = node;
    }

    // Step 1: 切分区间
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
      decision: `前序定根: ${rootVal}，切分左右区间`,
      action: 'split',
      message: `前序首元素为根: rootVal = ${rootVal}，在 inorder 中位于下标 ${inRoot}。左子树长度 = ${leftLen}。`,
      log: `root=${rootVal} inRoot=${inRoot} leftLen=${leftLen}`,
      metrics: {
        '当前根节点': rootVal,
        '中序根索引': inRoot,
        '左子树长度': leftLen,
        '右子树长度': (iR - inRoot),
      },
      codeLine: BUILD_TREE_CODE_LINES.split,
      highlightedNodes: [rootVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== rootVal),
    });

    // 递归左子树
    node.left = build(pL + 1, pL + leftLen, iL, inRoot - 1);

    // 递归右子树
    node.right = build(pL + leftLen + 1, pR, inRoot + 1, iR);

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
      decision: `节点 ${rootVal} 左右子树构建完成`,
      action: 'leave',
      message: `节点 ${rootVal} 的左右子树递归构建完毕并完成挂载。`,
      log: `built node ${rootVal}`,
      metrics: { '当前根节点': rootVal, '左孩子': node.left ? node.left.val : 'null', '右孩子': node.right ? node.right.val : 'null' },
      codeLine: BUILD_TREE_CODE_LINES.returnRoot,
      highlightedNodes: [rootVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== rootVal),
    });

    return node;
  }

  const resultTree = build(0, n - 1, 0, n - 1);
  const allTreeNodes = collectTreeValues(resultTree);

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

  if (n === 0 || inorder.length !== n) {
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
      codeLine: BUILD_TREE_STAGE2_LINES.enter,
    });
    return steps;
  }

  const inMap = new Map<number, number>();
  inorder.forEach((val, idx) => inMap.set(val, idx));

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
  });

  let currentTreeRoot: TreeNode | null = null;

  function build(postL: number, postR: number, inL: number, inR: number): TreeNode | null {
    if (postL > postR || inL > inR) {
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
        codeLine: BUILD_TREE_STAGE2_LINES.enter,
      });
      return null;
    }

    const rootVal = postorder[postR];
    const inRoot = inMap.get(rootVal) ?? -1;
    const leftLen = inRoot - inL;
    const node: TreeNode = { val: rootVal, left: null, right: null };

    if (!currentTreeRoot) {
      currentTreeRoot = node;
    }

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
      decision: `后序尾元素定根: ${rootVal}，切分中序左右子树`,
      action: 'split',
      message: `后序尾部 post[${postR}]=${rootVal} 为根，在中序位于下标 ${inRoot}。左子树长度 leftLen=${leftLen}。`,
      log: `root=${rootVal} inRoot=${inRoot} leftLen=${leftLen}`,
      metrics: {
        '当前根节点': rootVal,
        '中序根索引': inRoot,
        '左子树长度': leftLen,
        '右子树长度': inR - inRoot,
      },
      codeLine: BUILD_TREE_STAGE2_LINES.split,
      highlightedNodes: [rootVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== rootVal),
    });

    // 递归左子树
    node.left = build(postL, postL + leftLen - 1, inL, inRoot - 1);

    // 递归右子树
    node.right = build(postL + leftLen, postR - 1, inRoot + 1, inR);

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
      decision: `节点 ${rootVal} 左右子树构建完成`,
      action: 'leave',
      message: `节点 ${rootVal} 的左右子树递归构建完毕并挂载。`,
      log: `built node ${rootVal}`,
      metrics: { '当前根节点': rootVal, '左孩子': node.left ? node.left.val : 'null', '右孩子': node.right ? node.right.val : 'null' },
      codeLine: BUILD_TREE_STAGE2_LINES.returnRoot,
      highlightedNodes: [rootVal],
      visitedNodes: collectTreeValues(currentTreeRoot).filter((v) => v !== rootVal),
    });

    return node;
  }

  const resultTree = build(0, n - 1, 0, n - 1);
  const allTreeNodes = collectTreeValues(resultTree);

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
});

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

  const root = container.closest('#algo-build-tree-view') || container.parentElement;
  if (root) {
    const rootEl = root.querySelector('#metric-cur-root');
    const pRangeEl = root.querySelector('#metric-pre-range');
    const iRangeEl = root.querySelector('#metric-in-range');

    if (rootEl) rootEl.textContent = step.rootVal != null ? `${step.rootVal}` : '—';
    if (pRangeEl) pRangeEl.textContent = step.pL >= 0 ? `[${step.pL}..${step.pR}]` : '—';
    if (iRangeEl) iRangeEl.textContent = step.iL >= 0 ? `[${step.iL}..${step.iR}]` : '—';

    // 在 Card 2 中展示区间切分与显式栈详情
    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      const isStackStage = step.stackState !== undefined;
      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #475569; padding: 6px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
              <span style="font-size: 10.5px; color: #64748b;">${isStackStage ? '显式栈 stack:' : '中序根索引 inRoot:'}</span>
              <div style="font-weight: 700; font-size: 12px; color: #2563eb;">
                ${isStackStage ? (step.stackState && step.stackState.length > 0 ? `[${step.stackState.join(', ')}]` : '空栈 []') : (step.inRoot >= 0 ? `下标 ${step.inRoot}` : '—')}
              </div>
            </div>
            <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
              <span style="font-size: 10.5px; color: #64748b;">${isStackStage ? '中序指针 inIdx:' : '左子树节点数 leftLen:'}</span>
              <div style="font-weight: 700; font-size: 12px; color: #0d9488;">
                ${isStackStage ? `inIdx = ${step.inIdx ?? 0}` : `${step.leftLen}`}
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
