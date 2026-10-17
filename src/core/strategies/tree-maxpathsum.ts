import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { buildRawTree, toUniversalTree, type RawTreeNode } from './tree-dp-shared';

/**
 * 二叉树最大路径和 (Binary Tree Maximum Path Sum, LC 124, 左程云 78 课 Code02)
 * 严格遵循黄金准则：
 * 1. 零跳步（Zero Step Skipping）：子递归调用前发射 branch-call，进入函数发射 entry；
 * 2. 调用-返回物理闭环（Call-Return Parity）：左右子树返回后发射 branch-return 回溯赋值帧；
 * 3. 完备生命周期：entry -> init -> dfs_entry -> boundary -> branch_left -> branch_right -> transfer -> update_max -> combine -> return。
 * 4. 双向推导支持（Forward 自底向上后序单边增益汇报 / Reverse 自顶向下先序拱顶对比探查）
 */
export function compileMaxPathSum(
  _model: IYamlAlgorithmModel,
  arr: (number | null)[],
  _stage: number = 1,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
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
  const lineUpdateMax = anchorMap?.update_max || 9;
  const lineCombine = anchorMap?.combine || 10;

  const tags = new Map<string, string>();
  const statuses = new Map<string, UniversalTreeNode['status']>();

  // 逆向模式：自顶向下先序拱顶对比探查 (Top-Down Pre-Order Arch Exploration)
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
      log: '🔍 【逆向对比】启动自顶向下先序探查，从根节点出发对比计算各个节点作为拱顶时的两翼延伸和',
      msg: '启动自顶向下先序探查：准备自根节点向下遍历，对比自底向上汇报的全局最优性。',
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, root.id, tags, statuses),
    });

    let reverseMax = -Infinity;
    const queue: RawTreeNode[] = [root];

    function getBranchGain(n: RawTreeNode | null): number {
      if (!n) return 0;
      return n.val + Math.max(0, Math.max(getBranchGain(n.left), getBranchGain(n.right)));
    }

    while (queue.length > 0) {
      const curr = queue.shift()!;
      statuses.set(curr.id, 'current');

      steps.push({
        type: 'entry',
        line: lineDfsEntryR,
        codeLine: lineDfsEntryR,
        i: 0,
        j: 0,
        dp1d: [reverseMax === -Infinity ? 0 : reverseMax],
        memo: [reverseMax === -Infinity ? 0 : reverseMax],
        activeSlot: 0,
        tag: `先序探查节点 [${curr.val}]`,
        log: `| 📥 【先序探查】考察节点 [${curr.val}] 作为最高拱顶的路径延伸`,
        msg: `自顶向下探查：考察节点 <strong>Node(${curr.val})</strong> 作为路径折返拱顶时的两翼延伸和。`,
        activeNodeId: curr.id,
        treeRoot: toUniversalTree(root, curr.id, tags, statuses),
      });

      const lGain = Math.max(getBranchGain(curr.left), 0);
      const rGain = Math.max(getBranchGain(curr.right), 0);
      const currentSum = curr.val + lGain + rGain;
      reverseMax = Math.max(reverseMax, currentSum);

      tags.set(curr.id, `拱顶和:${currentSum}`);
      statuses.set(curr.id, 'visited');

      steps.push({
        type: 'update',
        line: lineTransferR,
        codeLine: lineTransferR,
        i: 0,
        j: 0,
        dp1d: [reverseMax, currentSum],
        memo: [currentSum, reverseMax],
        activeSlot: 0,
        tag: `拱顶和 ${currentSum}`,
        log: `| ⚡ 【拱顶结算】节点 [${curr.val}]: 左增益=${lGain}, 右增益=${rGain} -> 拱顶和=${currentSum}, 当前最大=${reverseMax}`,
        msg: `节点 <strong>Node(${curr.val})</strong>：左增益=${lGain}，右增益=${rGain}，以其为拱顶的路径和 <code>${currentSum}</code>。`,
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
      log: `| 🏆 逆向先序推导完成！整树最大路径和为 ${reverseMax}`,
      msg: `🏆 逆向推导完成！整树中最大路径和为 <strong>${reverseMax}</strong>。`,
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
      metrics: s.metrics || { '当前最大路径和': String(reverseMax), '推导方向': '逆向先序对比' },
    }));
  }

  // 正向模式：自底向上后序单边增益汇报
  let maxPath = -Infinity;

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
    tag: 'maxPathSum(root) 入口',
    log: '🌲 函数入口：二叉树中的最大路径和 (LC 124 / 左程云 78 课 Code02)',
    msg: '主函数入口：准备自底向上后序遍历二叉树，求解整棵树上的全局最大路径和。',
    activeNodeId: root.id,
    treeRoot: toUniversalTree(root, root.id, tags, statuses),
  });

  // Step 1: 启动递归调用 maxGain(root)
  steps.push({
    type: 'entry',
    line: lineInit,
    codeLine: lineInit,
    i: 0,
    j: 0,
    dp1d: [0],
    memo: [0],
    activeSlot: 0,
    tag: '启动后序遍历 maxGain(root)',
    log: '| 🚀 启动后序递归：调用 maxGain(root)',
    msg: '调用辅助递归函数：<code>maxGain(root)</code>。',
    activeNodeId: root.id,
    treeRoot: toUniversalTree(root, root.id, tags, statuses),
  });

  function dfs(node: RawTreeNode | null): number {
    // 边界基底判断
    if (!node) {
      steps.push({
        type: 'boundary',
        line: lineBoundary,
        codeLine: lineBoundary,
        i: 0,
        j: 0,
        dp1d: [maxPath === -Infinity ? 0 : maxPath],
        memo: [0],
        activeSlot: 0,
        tag: 'node == null -> 0',
        log: '| 🛑 【边界出口】遇到空节点，向父节点返回单侧增益 0',
        msg: '空节点边界条件：<code>node == null</code>，返回单侧最大增益 <strong>0</strong>。',
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
      dp1d: [maxPath === -Infinity ? 0 : maxPath],
      memo: [0],
      activeSlot: 0,
      tag: `进入节点 [${node.val}]`,
      log: `| 📥 进入递归帧：maxGain(Node[${node.val}])`,
      msg: `进入递归函数：考察当前节点 <strong>Node(${node.val})</strong>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    // 1. 左分支调用前拦截 (branch-call)
    steps.push({
      type: 'branch-call',
      line: lineBranchLeft,
      codeLine: lineBranchLeft,
      branchType: 'left',
      varName: 'leftGain',
      i: 0,
      j: 0,
      dp1d: [maxPath === -Infinity ? 0 : maxPath],
      memo: [0],
      activeSlot: 0,
      tag: `向左深入: maxGain(node.left)`,
      log: `| 🌿 【左分支调用】节点 [${node.val}] 深入求解左子树单侧最大贡献`,
      msg: `向左深入：求解左子树对当前节点 <strong>Node(${node.val})</strong> 的最大延伸收益。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    const rawLeft = dfs(node.left);
    const leftGain = Math.max(0, rawLeft);

    // Call-Return Parity: 左子树回溯赋值
    steps.push({
      type: 'branch-return',
      line: lineBranchLeft,
      codeLine: lineBranchLeft,
      branchType: 'left',
      subResult: leftGain,
      i: 0,
      j: 0,
      dp1d: [maxPath === -Infinity ? 0 : maxPath, leftGain],
      memo: [leftGain],
      activeSlot: 0,
      tag: `leftGain = max(0, ${rawLeft}) = ${leftGain}`,
      log: `| ↩️ 【回溯赋值】节点 [${node.val}] 收到左子树贡献: raw=${rawLeft} -> leftGain=${leftGain}`,
      msg: `左子树返回赋值：<code>leftGain = max(0, ${rawLeft}) = ${leftGain}</code>。若为负数则舍弃不取。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    // 2. 右分支调用前拦截 (branch-call)
    steps.push({
      type: 'branch-call',
      line: lineBranchRight,
      codeLine: lineBranchRight,
      branchType: 'right',
      varName: 'rightGain',
      i: 0,
      j: 0,
      dp1d: [maxPath === -Infinity ? 0 : maxPath, leftGain],
      memo: [leftGain],
      activeSlot: 0,
      tag: `向右深入: maxGain(node.right)`,
      log: `| 🌿 【右分支调用】节点 [${node.val}] 深入求解右子树单侧最大贡献`,
      msg: `向右深入：求解右子树对当前节点 <strong>Node(${node.val})</strong> 的最大延伸收益。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    const rawRight = dfs(node.right);
    const rightGain = Math.max(0, rawRight);

    // Call-Return Parity: 右子树回溯赋值
    steps.push({
      type: 'branch-return',
      line: lineBranchRight,
      codeLine: lineBranchRight,
      branchType: 'right',
      subResult: rightGain,
      i: 0,
      j: 0,
      dp1d: [maxPath === -Infinity ? 0 : maxPath, leftGain, rightGain],
      memo: [leftGain, rightGain],
      activeSlot: 0,
      tag: `rightGain = max(0, ${rawRight}) = ${rightGain}`,
      log: `| ↩️ 【回溯赋值】节点 [${node.val}] 收到右子树贡献: raw=${rawRight} -> rightGain=${rightGain}`,
      msg: `右子树返回赋值：<code>rightGain = max(0, ${rawRight}) = ${rightGain}</code>。若为负数则舍弃不取。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    // 3. 计算拐点跨度全路径和
    const archSum = node.val + leftGain + rightGain;
    const oldMax = maxPath;
    maxPath = Math.max(maxPath, archSum);
    const returnGain = node.val + Math.max(leftGain, rightGain);

    tags.set(node.id, `拐点和:${archSum}, 延伸:${returnGain}`);
    statuses.set(node.id, 'visited');

    steps.push({
      type: 'update',
      line: lineTransfer,
      codeLine: lineTransfer,
      i: 0,
      j: 0,
      dp1d: [maxPath, archSum, returnGain],
      memo: [maxPath, archSum, returnGain],
      activeSlot: 0,
      tag: `拐点路径和: ${archSum}`,
      log: `| ⚡ 【拐点结算】以 Node[${node.val}] 为顶点的拱形路径和: ${node.val} + ${leftGain} + ${rightGain} = ${archSum}`,
      msg: `以当前节点为顶点的拱形路径和：<code>${archSum} = ${node.val} + ${leftGain} + ${rightGain}</code>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    // 4. 更新全局最大值
    steps.push({
      type: 'record',
      line: lineUpdateMax,
      codeLine: lineUpdateMax,
      i: 0,
      j: 0,
      dp1d: [maxPath, archSum, returnGain],
      memo: [maxPath, archSum, returnGain],
      activeSlot: 0,
      tag: `maxSum = ${maxPath}`,
      log: `| 🔄 【全局最优】更新全局最大路径和: max(${oldMax === -Infinity ? '-∞' : oldMax}, ${archSum}) = ${maxPath}`,
      msg: `更新全局最大值：<code>maxSum = max(maxSum, ${archSum}) = <strong>${maxPath}</strong></code>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    // 5. 向父节点返回单侧延伸增益
    steps.push({
      type: 'combine',
      line: lineCombine,
      codeLine: lineCombine,
      i: 0,
      j: 0,
      dp1d: [maxPath, archSum, returnGain],
      memo: [maxPath, archSum, returnGain],
      activeSlot: 0,
      tag: `单侧延伸返回: ${returnGain}`,
      log: `| ⬆️ 【汇报父级】节点 [${node.val}] 向父节点返回单侧最大延伸收益: ${returnGain}`,
      msg: `向父节点返回单向最大延伸增益：<code>return ${node.val} + max(${leftGain}, ${rightGain}) = <strong>${returnGain}</strong></code>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    return returnGain;
  }

  dfs(root);

  // Step final: 收敛返回
  steps.push({
    type: 'return',
    line: lineReturn,
    codeLine: lineReturn,
    i: 0,
    j: 0,
    dp1d: [maxPath],
    memo: [maxPath],
    activeSlot: 0,
    tag: `最大路径和: ${maxPath}`,
    log: `| 🏆 计算完成！整棵二叉树最大路径和为: ${maxPath}`,
    msg: `🏆 全局推导完成！整棵二叉树的最大路径和为 <strong>${maxPath}</strong>。`,
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
    metrics: s.metrics || { '全局最大路径和': String(maxPath) },
  }));
}
