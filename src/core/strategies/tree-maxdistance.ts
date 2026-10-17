import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { buildRawTree, toUniversalTree, type RawTreeNode } from './tree-dp-shared';

export interface DistanceInfo {
  maxDistance: number;
  height: number;
}

/**
 * 二叉树中的最大距离 (Max Distance in Binary Tree, 左程云 78 课 Code01)
 * 严格遵循黄金准则：
 * 1. 零跳步（Zero Step Skipping）：子递归调用前发射 branch-call，进入函数发射 entry；
 * 2. 调用-返回物理闭环（Call-Return Parity）：左右子树返回后发射 branch-return 回溯赋值帧；
 * 3. 完备 Info 汇报生命周期：
 *    - leftInfo = process(node.left)
 *    - rightInfo = process(node.right)
 *    - height = max(left.height, right.height) + 1
 *    - crossDist = left.height + right.height
 *    - maxDist = max(crossDist, left.maxDist, right.maxDist)
 * 4. 双向推导支持（Forward 自底向上后序二元汇报 / Reverse 自顶向下先序探查）
 */
export function compileMaxDistance(
  _model: IYamlAlgorithmModel,
  arr: (number | null)[],
  _stage: number = 1,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const root = buildRawTree(arr);
  if (!root) return [];

  const lineEntry = anchorMap?.entry || anchorMap?.reg_init || anchorMap?.dp_init || 1;
  const lineInit = anchorMap?.init || anchorMap?.reg_dfs || anchorMap?.dp_visit || 2;
  const lineDfsEntry = anchorMap?.dfs_entry || anchorMap?.dp_trans || 4;
  const lineBoundary = anchorMap?.boundary || 5;
  const lineBranchLeft = anchorMap?.branch_left || 6;
  const lineBranchRight = anchorMap?.branch_right || 7;
  const lineCalcHeight = anchorMap?.calc_height || anchorMap?.dp_trans || 8;
  const lineCalcCross = anchorMap?.calc_cross || anchorMap?.dp_trans || 9;
  const lineTransfer = anchorMap?.transfer || anchorMap?.dp_trans || 10;
  const lineCombine = anchorMap?.combine || anchorMap?.backtrack || 11;
  const lineReturn = anchorMap?.return || anchorMap?.done || anchorMap?.dp_done || anchorMap?.reg_done || 2;

  const tags = new Map<string, string>();
  const statuses = new Map<string, UniversalTreeNode['status']>();

  // 逆向模式：自顶向下先序路径对比探查 (Top-Down Pre-Order Path Exploration)
  if (direction === 'reverse') {
    const lineEntryR = anchorMap?.entry || 1;
    const lineDfsEntryR = anchorMap?.dfs_entry || 4;
    const lineTransferR = anchorMap?.transfer || 8;
    const lineReturnR = anchorMap?.return || 3;

    steps.push({
      type: 'entry',
      line: lineEntryR,
      codeLine: lineEntryR,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: '逆向自顶向下探查入口',
      log: '🔍 【逆向对比】启动自顶向下先序探查，从根节点出发对比计算每个节点的单链深度与拐点跨度',
      msg: '启动自顶向下先序探查：准备自根节点向下遍历，对比自底向上汇报的全局最优性。',
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, root.id, tags, statuses),
    });

    let reverseMax = 0;
    const queue: RawTreeNode[] = [root];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      statuses.set(curr.id, 'current');

      steps.push({
        type: 'entry',
        line: lineDfsEntryR,
        codeLine: lineDfsEntryR,
        i: 0,
        j: 0,
        dp1d: [reverseMax],
        memo: [reverseMax],
        activeSlot: 0,
        tag: `先序探查节点 [${curr.val}]`,
        log: `| 📥 【先序探查】考察节点 [${curr.val}] 及其左右两翼深度`,
        msg: `自顶向下探查：考察节点 <strong>Node(${curr.val})</strong> 的两翼单链深度。`,
        activeNodeId: curr.id,
        treeRoot: toUniversalTree(root, curr.id, tags, statuses),
      });

      function getDepth(n: RawTreeNode | null): number {
        if (!n) return 0;
        return 1 + Math.max(getDepth(n.left), getDepth(n.right));
      }

      const lDepth = getDepth(curr.left);
      const rDepth = getDepth(curr.right);
      const cross = lDepth + rDepth;
      reverseMax = Math.max(reverseMax, cross);

      tags.set(curr.id, `拐点跨度:${cross}`);
      statuses.set(curr.id, 'visited');

      steps.push({
        type: 'update',
        line: lineTransferR,
        codeLine: lineTransferR,
        i: 0,
        j: 0,
        dp1d: [reverseMax, cross],
        memo: [cross, reverseMax],
        activeSlot: 0,
        tag: `节点[${curr.val}] 跨度 ${cross}`,
        log: `| ⚡ 【拐点结算】节点 [${curr.val}]: 左深度=${lDepth}, 右深度=${rDepth} -> 跨度=${cross}, 当前最大=${reverseMax}`,
        msg: `节点 <strong>Node(${curr.val})</strong>：左翼深=${lDepth}，右翼深=${rDepth}，以其为拱顶的路径长 <code>${cross}</code>。`,
        activeNodeId: curr.id,
        treeRoot: toUniversalTree(root, curr.id, tags, statuses),
      });

      if (curr.left) queue.push(curr.left);
      if (curr.right) queue.push(curr.right);
    }

    steps.push({
      type: 'return',
      line: lineReturnR,
      codeLine: lineReturnR,
      i: 0,
      j: 0,
      dp1d: [reverseMax],
      memo: [reverseMax],
      activeSlot: 0,
      tag: `逆向探查完成: ${reverseMax}`,
      log: `| 🏆 逆向先序推导完成！整树任意两节点间最大距离为 ${reverseMax}`,
      msg: `🏆 逆向推导完成！整树中任意两节点间最大距离为 <strong>${reverseMax}</strong>。`,
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, undefined, tags, statuses),
    });

    return steps.map((s, idx) => ({
      ...s,
      stepIndex: idx,
      stage: _stage || 1,
      line: s.line || 1,
      codeLine: s.codeLine || s.line || 1,
      decision: s.decision || s.log || s.tag || '逆向探查状态转移',
      message: s.message || s.msg || s.log || '',
      metrics: s.metrics || { '当前最大距离': String(reverseMax), '推导方向': '逆向先序对比' },
    }));
  }

  // 正向模式：自底向上后序二元汇报
  let globalMaxDist = 0;

  // Step 0: 主函数入口
  steps.push({
    type: 'entry',
    line: lineEntry,
    codeLine: lineEntry,
    i: 0,
    j: 0,
    dp1d: [0, 0, 0],
    memo: [0, 0, 0],
    activeSlot: 0,
    tag: 'maxDistance(root) 入口',
    log: '🌲 树型DP套路：每个节点向父节点汇报 [子树内部最大距离, 子树最大高度] 二元组 (左程云 78 课 Code01)',
    msg: '主函数入口：准备自底向上后序遍历二叉树，求解整棵树任意两节点间最大距离。',
    activeNodeId: root.id,
    treeRoot: toUniversalTree(root, root.id, tags, statuses),
  });

  // Step 1: 启动 process(root)
  steps.push({
    type: 'entry',
    line: lineInit,
    codeLine: lineInit,
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
        codeLine: lineBoundary,
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
      codeLine: lineDfsEntry,
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
      codeLine: lineBranchLeft,
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
      codeLine: lineBranchLeft,
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
      codeLine: lineBranchRight,
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
      codeLine: lineBranchRight,
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
      codeLine: lineTransfer,
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
      codeLine: lineCombine,
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
    codeLine: lineReturn,
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

  return steps.map((s, idx) => ({
    ...s,
    stepIndex: idx,
    stage: _stage || 1,
    line: s.line || 1,
    codeLine: s.codeLine || s.line || 1,
    decision: s.decision || s.log || s.tag || '树型DP状态转移',
    message: s.message || s.msg || s.log || '',
    metrics: s.metrics || { '全局最大距离': String(finalInfo.maxDistance), '根节点高度': String(finalInfo.height) },
  }));
}
