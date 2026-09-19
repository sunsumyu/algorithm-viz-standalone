import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { buildRawTree, toUniversalTree, type RawTreeNode } from './tree-dp-shared';

/**
 * 二叉树的直径 (Diameter of Binary Tree, LC 543, 左程云 77 课)
 * 严格遵循黄金准则：
 * 1. 零跳步（Zero Step Skipping）：子递归调用前发射 branch-call，进入函数发射 entry；
 * 2. 调用-返回物理闭环（Call-Return Parity）：左右子树返回后发射 branch-return 回溯赋值帧；
 * 3. 完备生命周期：entry -> init -> dfs_entry -> boundary -> branch_left -> branch_right -> transfer -> combine -> return。
 */
export function compileTreeDiameter(
  _model: IYamlAlgorithmModel,
  arr: (number | null)[],
  _stage: number,
  anchorMap?: Record<string, number>
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const root = buildRawTree(arr);
  if (!root) return [];

  const lineEntry = anchorMap?.entry || 1;
  const lineInit = anchorMap?.init || 2;
  const lineReturn = anchorMap?.return || 3;
  const lineDfsEntry = anchorMap?.dfs_entry || 4;
  const lineBoundary = anchorMap?.boundary || 5;
  const lineBranchLeft = anchorMap?.branch_left || 6;
  const lineBranchRight = anchorMap?.branch_right || 7;
  const lineTransfer = anchorMap?.transfer || 8;
  const lineCombine = anchorMap?.combine || 9;

  const tags = new Map<string, string>();
  const statuses = new Map<string, UniversalTreeNode['status']>();
  let maxDiameter = 0;

  // Step 0: 主函数入口
  steps.push({
    type: 'entry',
    line: lineEntry,
    i: 0,
    j: 0,
    dp1d: [0],
    memo: [0],
    activeSlot: 0,
    tag: 'diameterOfBinaryTree(root) 入口',
    log: '🌲 函数入口：二叉树的直径 (LC 543)',
    msg: '主函数入口：准备自底向上后序遍历二叉树，求解树中最长路径边数。',
    activeNodeId: root.id,
    treeRoot: toUniversalTree(root, root.id, tags, statuses),
  });

  // Step 1: 启动递归调用 maxDepth(root)
  steps.push({
    type: 'entry',
    line: lineInit,
    i: 0,
    j: 0,
    dp1d: [0],
    memo: [0],
    activeSlot: 0,
    tag: '启动后序遍历 maxDepth(root)',
    log: '| 🚀 启动后序递归：调用 maxDepth(root)',
    msg: '调用辅助后序遍历函数：<code>maxDepth(root)</code>。',
    activeNodeId: root.id,
    treeRoot: toUniversalTree(root, root.id, tags, statuses),
  });

  function dfs(node: RawTreeNode | null): number {
    // 边界空节点
    if (!node) {
      steps.push({
        type: 'boundary',
        line: lineBoundary,
        i: 0,
        j: 0,
        dp1d: [maxDiameter],
        memo: [0],
        activeSlot: 0,
        tag: 'node == null -> 深度 0',
        log: '| 🛑 【边界出口】遇到空节点，向父节点返回单侧深度 0',
        msg: '空节点边界条件：<code>node == null</code>，返回单侧深度 <strong>0</strong>。',
      });
      return 0;
    }

    statuses.set(node.id, 'current');

    // Callee Entry Frame
    steps.push({
      type: 'entry',
      line: lineDfsEntry,
      i: 0,
      j: 0,
      dp1d: [maxDiameter],
      memo: [0],
      activeSlot: 0,
      tag: `进入节点 [${node.val}]`,
      log: `| 📥 进入递归帧：maxDepth(Node[${node.val}])`,
      msg: `进入递归函数：考察当前节点 <strong>Node(${node.val})</strong>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    // 1. 左子树分支调用前拦截 (branch-call)
    steps.push({
      type: 'branch-call',
      line: lineBranchLeft,
      branchType: 'left',
      varName: 'left',
      i: 0,
      j: 0,
      dp1d: [maxDiameter],
      memo: [0],
      activeSlot: 0,
      tag: `向左深入: maxDepth(node.left)`,
      log: `| 🌿 【左分支调用】节点 [${node.val}] 准备深入左子树 maxDepth(node.left)`,
      msg: `向左深入：求解左子树对当前节点 <strong>Node(${node.val})</strong> 的最大深度。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    const left = dfs(node.left);

    // Call-Return Parity: 左子树回溯赋值
    steps.push({
      type: 'branch-return',
      line: lineBranchLeft,
      branchType: 'left',
      subResult: left,
      i: 0,
      j: 0,
      dp1d: [maxDiameter, left],
      memo: [left],
      activeSlot: 0,
      tag: `left = ${left}`,
      log: `| ↩️ 【回溯赋值】节点 [${node.val}] 收到左子树深度: left = ${left}`,
      msg: `左子树返回赋值：<code>left = <strong>${left}</strong></code>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    // 2. 右子树分支调用前拦截 (branch-call)
    steps.push({
      type: 'branch-call',
      line: lineBranchRight,
      branchType: 'right',
      varName: 'right',
      i: 0,
      j: 0,
      dp1d: [maxDiameter, left],
      memo: [left],
      activeSlot: 0,
      tag: `向右深入: maxDepth(node.right)`,
      log: `| 🌿 【右分支调用】节点 [${node.val}] 准备深入右子树 maxDepth(node.right)`,
      msg: `向右深入：求解右子树对当前节点 <strong>Node(${node.val})</strong> 的最大深度。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    const right = dfs(node.right);

    // Call-Return Parity: 右子树回溯赋值
    steps.push({
      type: 'branch-return',
      line: lineBranchRight,
      branchType: 'right',
      subResult: right,
      i: 0,
      j: 0,
      dp1d: [maxDiameter, left, right],
      memo: [left, right],
      activeSlot: 0,
      tag: `right = ${right}`,
      log: `| ↩️ 【回溯赋值】节点 [${node.val}] 收到右子树深度: right = ${right}`,
      msg: `右子树返回赋值：<code>right = <strong>${right}</strong></code>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    // 3. 结算拐点直径
    const currentDiameter = left + right;
    const oldDiameter = maxDiameter;
    maxDiameter = Math.max(maxDiameter, currentDiameter);
    const depth = Math.max(left, right) + 1;

    tags.set(node.id, `深:${depth}, 直:${currentDiameter}`);
    statuses.set(node.id, 'visited');

    steps.push({
      type: 'update',
      line: lineTransfer,
      i: 0,
      j: 0,
      dp1d: [maxDiameter, depth, currentDiameter],
      memo: [maxDiameter, depth, currentDiameter],
      activeSlot: 0,
      tag: `拐点直径: ${currentDiameter}`,
      log: `| ⚡ 【拐点结算】以 Node[${node.val}] 为顶点的路径长: ${left} + ${right} = ${currentDiameter} (全局最大: ${oldDiameter} -> ${maxDiameter})`,
      msg: `以当前节点为顶点的拐点路径边数：<code>${currentDiameter} = ${left} + ${right}</code>，更新全局最大直径 <code>maxDiameter = <strong>${maxDiameter}</strong></code>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    // 4. 向父节点返回当前节点的最大单侧深度
    steps.push({
      type: 'combine',
      line: lineCombine,
      i: 0,
      j: 0,
      dp1d: [maxDiameter, depth, currentDiameter],
      memo: [maxDiameter, depth, currentDiameter],
      activeSlot: 0,
      tag: `单侧深度返回: ${depth}`,
      log: `| ⬆️ 【汇报父级】节点 [${node.val}] 向父节点返回单侧最大深度: ${depth}`,
      msg: `向父节点返回单向最大深度：<code>return max(${left}, ${right}) + 1 = <strong>${depth}</strong></code>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    return depth;
  }

  dfs(root);

  // Step final: 收敛返回
  steps.push({
    type: 'return',
    line: lineReturn,
    i: 0,
    j: 0,
    dp1d: [maxDiameter],
    memo: [maxDiameter],
    activeSlot: 0,
    tag: `最大直径: ${maxDiameter}`,
    log: `| 🏆 计算完成！二叉树的最大直径为: ${maxDiameter}`,
    msg: `🏆 全局推导完成！整棵二叉树的最大直径为 <strong>${maxDiameter}</strong>。`,
    activeNodeId: root.id,
    treeRoot: toUniversalTree(root, undefined, tags, statuses),
  });

  return steps;
}
