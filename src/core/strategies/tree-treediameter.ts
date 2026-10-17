import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { buildRawTree, toUniversalTree, type RawTreeNode } from './tree-dp-shared';

/**
 * 二叉树的直径 (Diameter of Binary Tree, LC 543, 左程云 78 课 Code04)
 * 严格遵循黄金准则：
 * 1. 零跳步（Zero Step Skipping）：子递归调用前发射 branch-call，进入函数发射 entry；
 * 2. 调用-返回物理闭环（Call-Return Parity）：左右子树返回后发射 branch-return 回溯赋值帧；
 * 3. 完备生命周期：entry -> init -> dfs_entry -> boundary -> branch_left -> branch_right -> transfer -> combine -> return。
 * 4. 双向推导支持（Forward 自底向上单边深度汇报 / Reverse 自顶向下先序路径对比探查）
 */
export function compileTreeDiameter(
  _model: IYamlAlgorithmModel,
  arr: (number | null)[],
  _stage: number = 1,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const root = buildRawTree(arr);
  if (!root) return [];

  const tags = new Map<string, string>();
  const statuses = new Map<string, UniversalTreeNode['status']>();

  // 逆向模式：自顶向下先序路径对比探查 (Top-Down Pre-Order Path Exploration)
  if (direction === 'reverse') {
    const isHigherStage = _stage > 1 && !anchorMap;
    const lineEntryR = anchorMap?.entry ?? 1;
    const lineDfsEntryR = anchorMap?.dfs_entry ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 2 : 4));
    const lineTransferR = anchorMap?.transfer ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 5 : 8));
    const lineReturnR = anchorMap?.return ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 7 : 3));

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
      log: '🔍 【逆向对比】启动自顶向下先序探查，从根节点出发计算各子树的拐点跨度',
      msg: '启动自顶向下先序探查：逐节点计算左右分支深度并结算拐点跨度，对比自底向上深度汇报的高效性。',
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, root.id, tags, statuses),
    });

    function getDepth(n: RawTreeNode | null): number {
      if (!n) return 0;
      return 1 + Math.max(getDepth(n.left), getDepth(n.right));
    }

    let reverseMax = 0;
    const queue: RawTreeNode[] = [root];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      statuses.set(curr.id, 'current');

      const lDepth = getDepth(curr.left);
      const rDepth = getDepth(curr.right);
      const cross = lDepth + rDepth;
      reverseMax = Math.max(reverseMax, cross);

      steps.push({
        type: 'entry',
        line: lineDfsEntryR,
        codeLine: lineDfsEntryR,
        i: 0,
        j: 0,
        dp1d: [reverseMax],
        memo: [cross],
        activeSlot: 0,
        tag: `先序考察节点 [${curr.val}]`,
        log: `| 📥 【先序考察】考察节点 [${curr.val}]: 左深度=${lDepth}, 右深度=${rDepth} -> 拐点跨度=${cross}`,
        msg: `自顶向下检验：考察节点 <strong>Node(${curr.val})</strong>，计算得出左子树深度 <code>${lDepth}</code>，右子树深度 <code>${rDepth}</code>，拐点跨度 <code>${cross}</code>。`,
        activeNodeId: curr.id,
        treeRoot: toUniversalTree(root, curr.id, tags, statuses),
      });

      tags.set(curr.id, `拐点:${cross}(全:${reverseMax})`);
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
        tag: `更新全局直径: ${reverseMax}`,
        log: `| ⚡ 【拐点对比】节点 [${curr.val}] 跨度 ${cross} -> 当前全局最大直径=${reverseMax}`,
        msg: `节点 <strong>Node(${curr.val})</strong> 结算完成：拐点边数 <code>${cross}</code>，更新当前全局最大直径 <code>maxDiameter = <strong>${reverseMax}</strong></code>。`,
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
      log: `| 🏆 逆向推导完成！整树最大直径为 ${reverseMax}`,
      msg: `🏆 逆向推导完成！二叉树的最大直径为 <strong>${reverseMax}</strong>。`,
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
      metrics: s.metrics || { '全局最大直径': String(reverseMax), '推导方向': '逆向先序对比' },
    }));
  }

  // 正向模式：自底向上后序深度汇报
  const isHigherStage = _stage > 1 && !anchorMap;
  const lineEntry = anchorMap?.entry ?? 1;
  const lineInit = anchorMap?.init ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 2 : 2));
  const lineReturn = anchorMap?.return ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 7 : 3));
  const lineDfsEntry = anchorMap?.dfs_entry ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 2 : 4));
  const lineBoundary = anchorMap?.boundary ?? (anchorMap ? anchorMap.dfs_entry ?? anchorMap.entry ?? 1 : (isHigherStage ? 2 : 5));
  const lineBranchLeft = anchorMap?.branch_left ?? (anchorMap ? anchorMap.dfs_entry ?? anchorMap.entry ?? 1 : (isHigherStage ? 3 : 6));
  const lineBranchRight = anchorMap?.branch_right ?? (anchorMap ? anchorMap.dfs_entry ?? anchorMap.entry ?? 1 : (isHigherStage ? 4 : 7));
  const lineTransfer = anchorMap?.transfer ?? (anchorMap ? anchorMap.dfs_entry ?? anchorMap.entry ?? 1 : (isHigherStage ? 5 : 8));
  const lineCombine = anchorMap?.combine ?? (anchorMap ? anchorMap.return ?? anchorMap.entry ?? 1 : (isHigherStage ? 6 : 9));

  let maxDiameter = 0;

  // Step 0: 主函数入口
  steps.push({
    type: 'entry',
    line: lineEntry,
    codeLine: lineEntry,
    i: 0,
    j: 0,
    dp1d: [0],
    memo: [0],
    activeSlot: 0,
    tag: 'diameterOfBinaryTree(root) 入口',
    log: '🌲 函数入口：二叉树的直径 (LC 543 / 左程云 78 课 Code04)',
    msg: '主函数入口：准备自底向上后序遍历二叉树，求解树中最长路径边数。',
    activeNodeId: root.id,
    treeRoot: toUniversalTree(root, root.id, tags, statuses),
  });

  // Step 1: 启动递归调用 maxDepth(root)
  steps.push({
    type: 'entry',
    line: lineInit,
    codeLine: lineInit,
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
        codeLine: lineBoundary,
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
      codeLine: lineDfsEntry,
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
      codeLine: lineBranchLeft,
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
      codeLine: lineBranchLeft,
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
      codeLine: lineBranchRight,
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
      codeLine: lineBranchRight,
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
      codeLine: lineTransfer,
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
      codeLine: lineCombine,
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
    codeLine: lineReturn,
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

  return steps.map((s, idx) => ({
    ...s,
    stepIndex: idx,
    stage: _stage || 1,
    line: s.line || 1,
    codeLine: s.codeLine || s.line || 1,
    decision: s.decision || s.log || s.tag || '树型DP状态转移',
    message: s.message || s.msg || s.log || '',
    metrics: s.metrics || { '全局最大直径': String(maxDiameter) },
  }));
}
