import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { buildRawTree, toUniversalTree, type RawTreeNode } from './tree-dp-shared';

export interface DistanceInfo {
  maxDistance: number;
  height: number;
}

/**
 * 二叉树中的最大距离 (Max Distance in Binary Tree, 左程云 76 课)
 * 严格遵循黄金准则：
 * 1. 零跳步（Zero Step Skipping）：子递归调用前发射 branch-call，进入函数发射 entry；
 * 2. 调用-返回物理闭环（Call-Return Parity）：左右子树返回后发射 branch-return 回溯赋值帧；
 * 3. 完备 Info 汇报生命周期：
 *    - leftInfo = process(node.left)
 *    - rightInfo = process(node.right)
 *    - height = max(left.height, right.height) + 1
 *    - crossDist = left.height + right.height
 *    - maxDist = max(crossDist, left.maxDist, right.maxDist)
 */
export function compileMaxDistance(
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
  const lineDfsEntry = anchorMap?.dfs_entry || 4;
  const lineBoundary = anchorMap?.boundary || 5;
  const lineBranchLeft = anchorMap?.branch_left || 6;
  const lineBranchRight = anchorMap?.branch_right || 7;
  const lineCalcHeight = anchorMap?.calc_height || 8;
  const lineCalcCross = anchorMap?.calc_cross || 9;
  const lineTransfer = anchorMap?.transfer || 10;
  const lineCombine = anchorMap?.combine || 11;
  const lineReturn = anchorMap?.return || 2;

  const tags = new Map<string, string>();
  const statuses = new Map<string, UniversalTreeNode['status']>();
  let globalMaxDist = 0;

  // Step 0: 主函数入口
  steps.push({
    type: 'entry',
    line: lineEntry,
    i: 0,
    j: 0,
    dp1d: [0, 0, 0],
    memo: [0, 0, 0],
    activeSlot: 0,
    tag: 'maxDistance(root) 入口',
    log: '🌲 树型DP套路：每个节点向父节点汇报 [子树内部最大距离, 子树最大高度] 二元组 (左程云 76 课)',
    msg: '主函数入口：准备自底向上后序遍历二叉树，求解整棵树任意两节点间最大距离。',
    activeNodeId: root.id,
    treeRoot: toUniversalTree(root, root.id, tags, statuses),
  });

  // Step 1: 启动 process(root)
  steps.push({
    type: 'entry',
    line: lineInit,
    i: 0,
    j: 0,
    dp1d: [0, 0, 0],
    memo: [0, 0, 0],
    activeSlot: 0,
    tag: '启动后序遍历 process(root)',
    log: '| 🚀 启动后序递归：调用 process(root)',
    msg: '调用辅助递归函数：<code>process(root)</code>。',
    activeNodeId: root.id,
    treeRoot: toUniversalTree(root, root.id, tags, statuses),
  });

  function dfs(node: RawTreeNode | null): DistanceInfo {
    if (!node) {
      steps.push({
        type: 'boundary',
        line: lineBoundary,
        i: 0,
        j: 0,
        dp1d: [globalMaxDist, 0, 0],
        memo: [0, 0],
        activeSlot: 0,
        tag: 'node == null -> Info(0, 0)',
        log: '| 🛑 【边界出口】遇到空节点，返回基底 Info(maxDist=0, height=0)',
        msg: '空节点边界条件：<code>node == null</code>，返回 <strong>Info(maxDistance: 0, height: 0)</strong>。',
      });
      return { maxDistance: 0, height: 0 };
    }

    statuses.set(node.id, 'current');

    // Callee Entry Frame
    steps.push({
      type: 'entry',
      line: lineDfsEntry,
      i: 0,
      j: 0,
      dp1d: [globalMaxDist, 0, 0],
      memo: [0, 0],
      activeSlot: 0,
      tag: `进入节点 [${node.val}]`,
      log: `| 📥 进入递归帧：process(Node[${node.val}])`,
      msg: `进入递归函数：考察当前节点 <strong>Node(${node.val})</strong>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    // 1. 左子树分支调用前拦截 (branch-call)
    steps.push({
      type: 'branch-call',
      line: lineBranchLeft,
      branchType: 'left',
      varName: 'leftInfo',
      i: 0,
      j: 0,
      dp1d: [globalMaxDist, 0, 0],
      memo: [0, 0],
      activeSlot: 0,
      tag: '向左深入: process(node.left)',
      log: `| 🌿 【左分支调用】节点 [${node.val}] 准备深入左子树 process(node.left)`,
      msg: `向左深入：求解左子树对当前节点 <strong>Node(${node.val})</strong> 的 Info 信息。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    const leftInfo = dfs(node.left);

    // Call-Return Parity: 左子树回溯赋值
    steps.push({
      type: 'branch-return',
      line: lineBranchLeft,
      branchType: 'left',
      subResult: leftInfo.maxDistance,
      i: 0,
      j: 0,
      dp1d: [globalMaxDist, leftInfo.height, leftInfo.maxDistance],
      memo: [leftInfo.height, leftInfo.maxDistance],
      activeSlot: 0,
      tag: `leftInfo(距:${leftInfo.maxDistance}, 高:${leftInfo.height})`,
      log: `| ↩️ 【回溯赋值】节点 [${node.val}] 收到左子树: maxDist=${leftInfo.maxDistance}, height=${leftInfo.height}`,
      msg: `左子树返回赋值：<code>leftInfo = Info(maxDist: ${leftInfo.maxDistance}, height: ${leftInfo.height})</code>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    // 2. 右子树分支调用前拦截 (branch-call)
    steps.push({
      type: 'branch-call',
      line: lineBranchRight,
      branchType: 'right',
      varName: 'rightInfo',
      i: 0,
      j: 0,
      dp1d: [globalMaxDist, leftInfo.height, leftInfo.maxDistance],
      memo: [leftInfo.height, leftInfo.maxDistance],
      activeSlot: 0,
      tag: '向右深入: process(node.right)',
      log: `| 🌿 【右分支调用】节点 [${node.val}] 准备深入右子树 process(node.right)`,
      msg: `向右深入：求解右子树对当前节点 <strong>Node(${node.val})</strong> 的 Info 信息。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    const rightInfo = dfs(node.right);

    // Call-Return Parity: 右子树回溯赋值
    steps.push({
      type: 'branch-return',
      line: lineBranchRight,
      branchType: 'right',
      subResult: rightInfo.maxDistance,
      i: 0,
      j: 0,
      dp1d: [globalMaxDist, rightInfo.height, rightInfo.maxDistance],
      memo: [rightInfo.height, rightInfo.maxDistance],
      activeSlot: 0,
      tag: `rightInfo(距:${rightInfo.maxDistance}, 高:${rightInfo.height})`,
      log: `| ↩️ 【回溯赋值】节点 [${node.val}] 收到右子树: maxDist=${rightInfo.maxDistance}, height=${rightInfo.height}`,
      msg: `右子树返回赋值：<code>rightInfo = Info(maxDist: ${rightInfo.maxDistance}, height: ${rightInfo.height})</code>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    // 3. 计算高度与穿过拐点距离
    const height = Math.max(leftInfo.height, rightInfo.height) + 1;
    const crossDist = leftInfo.height + rightInfo.height;
    const maxDist = Math.max(crossDist, Math.max(leftInfo.maxDistance, rightInfo.maxDistance));
    globalMaxDist = Math.max(globalMaxDist, maxDist);

    tags.set(node.id, `高:${height}, 距:${maxDist}`);
    statuses.set(node.id, 'visited');

    steps.push({
      type: 'update',
      line: lineTransfer,
      i: 0,
      j: 0,
      dp1d: [globalMaxDist, height, maxDist],
      memo: [crossDist, maxDist],
      activeSlot: 0,
      tag: `穿越:${crossDist}, 子树距:${maxDist}`,
      log: `| ⚡ 【状态合并】节点 [${node.val}]: height=max(${leftInfo.height}, ${rightInfo.height})+1=${height}, crossDist=${crossDist} -> maxDist=${maxDist}`,
      msg: `节点 <strong>Node(${node.val})</strong>：左高=${leftInfo.height}，右高=${rightInfo.height}，穿越当前节点路径长 <code>${crossDist} = ${leftInfo.height} + ${rightInfo.height}</code>，子树最大距离 <strong>${maxDist}</strong>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    // 4. 返回当前 Info
    steps.push({
      type: 'combine',
      line: lineCombine,
      i: 0,
      j: 0,
      dp1d: [globalMaxDist, height, maxDist],
      memo: [maxDist, height],
      activeSlot: 0,
      tag: `返回 Info(${maxDist}, ${height})`,
      log: `| ⬆️ 【汇报父级】节点 [${node.val}] 向父节点返回 Info(maxDistance=${maxDist}, height=${height})`,
      msg: `向父节点返回二元组：<code>return Info(maxDistance: ${maxDist}, height: ${height})</code>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    return { maxDistance: maxDist, height };
  }

  const finalInfo = dfs(root);

  // 最终收敛返回
  steps.push({
    type: 'return',
    line: lineReturn,
    i: 0,
    j: 0,
    dp1d: [finalInfo.maxDistance],
    memo: [finalInfo.maxDistance],
    activeSlot: 0,
    tag: `最大距离: ${finalInfo.maxDistance}`,
    log: `| 🏆 树型DP推导完成！整棵树中任意两节点间最大距离为 ${finalInfo.maxDistance}`,
    msg: `🏆 演化推导完成！整棵树中任意两节点间最大距离为 <strong>${finalInfo.maxDistance}</strong>。`,
    activeNodeId: root.id,
    treeRoot: toUniversalTree(root, undefined, tags, statuses),
  });

  return steps;
}

