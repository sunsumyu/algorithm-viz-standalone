import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { buildRawTree, toUniversalTree, type RawTreeNode } from './tree-dp-shared';

/**
 * 监控二叉树 (Binary Tree Cameras, LC 968, 左程云 78 课)
 * 严格遵循黄金准则：
 * 1. 零跳步（Zero Step Skipping）：子递归调用前发射 branch-call，进入函数发射 entry；
 * 2. 调用-返回物理闭环（Call-Return Parity）：左右子树返回后发射 branch-return 回溯赋值帧；
 * 3. 完备状态机分支：
 *    - 状态 0: 待覆盖 (Uncovered) -> 留给父节点安放
 *    - 状态 1: 已被覆盖 (Covered) -> 子树已有相机或空节点
 *    - 状态 2: 安放相机 (Camera installed) -> 覆盖自身与父子节点
 */
export function compileBinaryTreeCameras(
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
  const lineRootCamera = anchorMap?.root_camera || 3;
  const lineReturn = anchorMap?.return || 5;
  const lineDfsEntry = anchorMap?.dfs_entry || 7;
  const lineBoundary = anchorMap?.boundary || 8;
  const lineBranchLeft = anchorMap?.branch_left || 9;
  const lineBranchRight = anchorMap?.branch_right || 10;
  const lineCondCamera = anchorMap?.cond_camera || 11;
  const lineAddCamera = anchorMap?.add_camera || 12;
  const lineReturnCamera = anchorMap?.return_camera || 13;
  const lineReturnCovered = anchorMap?.return_covered || 15;
  const lineReturnUncovered = anchorMap?.return_uncovered || 16;

  const tags = new Map<string, string>();
  const statuses = new Map<string, UniversalTreeNode['status']>();
  let cameras = 0;

  // Step 0: 主函数入口
  steps.push({
    type: 'entry',
    line: lineEntry,
    i: 0,
    j: 0,
    dp1d: [0],
    memo: [0],
    activeSlot: 0,
    tag: 'minCameraCover(root) 入口',
    log: '🌲 函数入口：监控二叉树 (LC 968，三状态贪心后序 DP)',
    msg: '主函数入口：准备自底向上后序遍历二叉树，状态机定义：<code>0-待覆盖, 1-已被覆盖, 2-已安放相机</code>。',
    activeNodeId: root.id,
    treeRoot: toUniversalTree(root, root.id, tags, statuses),
  });

  // Step 1: 启动后序递归 dfs(root)
  steps.push({
    type: 'entry',
    line: lineInit,
    i: 0,
    j: 0,
    dp1d: [0],
    memo: [0],
    activeSlot: 0,
    tag: '启动后序遍历 dfs(root)',
    log: '| 🚀 启动后序递归：调用 dfs(root) 检查根节点及整棵树的监控覆盖',
    msg: '调用后序递归函数：<code>dfs(root)</code>，优先让叶节点的父节点放置相机以获取最大覆盖效率。',
    activeNodeId: root.id,
    treeRoot: toUniversalTree(root, root.id, tags, statuses),
  });

  // 0: 无覆盖, 1: 有覆盖无相机, 2: 安放相机
  function dfs(node: RawTreeNode | null): number {
    // 边界条件：空节点
    if (!node) {
      steps.push({
        type: 'boundary',
        line: lineBoundary,
        i: 0,
        j: 0,
        dp1d: [cameras],
        memo: [1],
        activeSlot: 0,
        tag: 'node == null -> 状态 1 (被覆盖)',
        log: '| 🛑 【边界出口】遇到空节点，视为已被覆盖 (状态 1)，避免叶节点盲目放相机',
        msg: '空节点边界条件：<code>node == null</code>，视为 <strong>已被覆盖 (状态 1)</strong>，防止叶子节点额外浪费相机。',
      });
      return 1;
    }

    statuses.set(node.id, 'current');

    // Callee Entry Frame
    steps.push({
      type: 'entry',
      line: lineDfsEntry,
      i: 0,
      j: 0,
      dp1d: [cameras],
      memo: [0],
      activeSlot: 0,
      tag: `进入节点 [${node.val}]`,
      log: `| 📥 进入递归帧：dfs(Node[${node.val}])`,
      msg: `进入递归函数：后序考察当前节点 <strong>Node(${node.val})</strong>。`,
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
      dp1d: [cameras],
      memo: [0],
      activeSlot: 0,
      tag: `向左深入: dfs(node.left)`,
      log: `| 🌿 【左分支调用】节点 [${node.val}] 准备深入左子树 dfs(node.left)`,
      msg: `向左深入：求解左子节点对当前节点 <strong>Node(${node.val})</strong> 的监控覆盖状态。`,
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
      dp1d: [cameras, left],
      memo: [left],
      activeSlot: 0,
      tag: `left = ${left}`,
      log: `| ↩️ 【回溯赋值】节点 [${node.val}] 收到左子树状态: left = ${left} (${left === 2 ? '已放相机' : left === 1 ? '已被覆盖' : '待覆盖'})`,
      msg: `左子树返回赋值：<code>left = <strong>${left}</strong> (${left === 2 ? '📷 已放相机' : left === 1 ? '🛡️ 已被覆盖' : '⚠️ 待覆盖'})</code>。`,
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
      dp1d: [cameras, left],
      memo: [left],
      activeSlot: 0,
      tag: `向右深入: dfs(node.right)`,
      log: `| 🌿 【右分支调用】节点 [${node.val}] 准备深入右子树 dfs(node.right)`,
      msg: `向右深入：求解右子节点对当前节点 <strong>Node(${node.val})</strong> 的监控覆盖状态。`,
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
      dp1d: [cameras, left, right],
      memo: [left, right],
      activeSlot: 0,
      tag: `right = ${right}`,
      log: `| ↩️ 【回溯赋值】节点 [${node.val}] 收到右子树状态: right = ${right} (${right === 2 ? '已放相机' : right === 1 ? '已被覆盖' : '待覆盖'})`,
      msg: `右子树返回赋值：<code>right = <strong>${right}</strong> (${right === 2 ? '📷 已放相机' : right === 1 ? '🛡️ 已被覆盖' : '⚠️ 待覆盖'})</code>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    // 3. 状态转移决策
    if (left === 0 || right === 0) {
      // 规则 1：子节点存在未覆盖，当前节点必须安放相机
      steps.push({
        type: 'cond',
        line: lineCondCamera,
        i: 0,
        j: 0,
        dp1d: [cameras, left, right],
        memo: [left, right],
        activeSlot: 0,
        tag: '判定: 子节点待覆盖',
        log: `| ⚠️ 【状态判断】节点 [${node.val}]: left=${left}, right=${right} -> 子节点存在 0(待覆盖)，当前节点必须安放相机`,
        msg: `状态判定：子节点存在未被覆盖状态（<code>left=${left}, right=${right}</code>），当前节点 <strong>必须安放相机</strong> 予以覆盖！`,
        activeNodeId: node.id,
        treeRoot: toUniversalTree(root, node.id, tags, statuses),
      });

      cameras++;
      tags.set(node.id, '📷 已放相机');
      statuses.set(node.id, 'visited');

      steps.push({
        type: 'update',
        line: lineAddCamera,
        i: 0,
        j: 0,
        dp1d: [cameras, 2],
        memo: [cameras, 2],
        activeSlot: 0,
        tag: `cameras++ -> ${cameras}`,
        log: `| 📷 【安放相机】在节点 [${node.val}] 安放相机，当前累计相机数: ${cameras}`,
        msg: `在当前节点安放相机：<code>cameras++ = <strong>${cameras}</strong></code>。`,
        activeNodeId: node.id,
        treeRoot: toUniversalTree(root, node.id, tags, statuses),
      });

      steps.push({
        type: 'return',
        line: lineReturnCamera,
        i: 0,
        j: 0,
        dp1d: [cameras, 2],
        memo: [cameras, 2],
        activeSlot: 0,
        tag: '向父节点返回状态 2 (已放相机)',
        log: `| ⬆️ 【汇报父级】节点 [${node.val}] 向父节点返回状态 2 (已放相机)`,
        msg: `向父节点返回：<code>return 2 (📷 已安放相机)</code>。`,
        activeNodeId: node.id,
        treeRoot: toUniversalTree(root, node.id, tags, statuses),
      });

      return 2;
    }

    if (left === 2 || right === 2) {
      // 规则 2：子节点有相机，当前节点已被覆盖
      tags.set(node.id, '🛡️ 已被覆盖');
      statuses.set(node.id, 'base');

      steps.push({
        type: 'return',
        line: lineReturnCovered,
        i: 0,
        j: 0,
        dp1d: [cameras, 1],
        memo: [cameras, 1],
        activeSlot: 0,
        tag: '向父节点返回状态 1 (已被覆盖)',
        log: `| 🛡️ 【已被覆盖】节点 [${node.val}]: 子节点至少有一处相机 (left=${left}, right=${right})，已被覆盖，向父节点返回 1`,
        msg: `状态判定：子节点存在相机（<code>left=${left}, right=${right}</code>），当前节点已被有效覆盖，返回 <code>return 1 (🛡️ 已被覆盖)</code>。`,
        activeNodeId: node.id,
        treeRoot: toUniversalTree(root, node.id, tags, statuses),
      });

      return 1;
    }

    // 规则 3：子节点均被覆盖但无相机，当前节点处于待覆盖状态
    tags.set(node.id, '⚠️ 待覆盖');
    statuses.set(node.id, 'normal');

    steps.push({
      type: 'return',
      line: lineReturnUncovered,
      i: 0,
      j: 0,
      dp1d: [cameras, 0],
      memo: [cameras, 0],
      activeSlot: 0,
      tag: '向父节点返回状态 0 (待覆盖)',
      log: `| ⚠️ 【待覆盖】节点 [${node.val}]: 左右子节点皆为 1 (无相机覆盖)，贪心留给父节点安放相机，返回 0`,
      msg: `状态判定：左右子节点均已被覆盖但自身无相机（<code>left=1, right=1</code>），贪心策略下留给父节点安放相机效率更高，返回 <code>return 0 (⚠️ 待覆盖)</code>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    return 0;
  }

  const rootState = dfs(root);

  // 根节点检查：如果根节点最终未被覆盖，必须在根节点补放相机
  if (rootState === 0) {
    cameras++;
    tags.set(root.id, '📷 根节点补相机');
    statuses.set(root.id, 'visited');

    steps.push({
      type: 'update',
      line: lineRootCamera,
      i: 0,
      j: 0,
      dp1d: [cameras],
      memo: [cameras],
      activeSlot: 0,
      tag: `根节点补相机 -> ${cameras}`,
      log: `| ⚡ 【根节点特判】根节点最终返回 0 (未被覆盖)，没有更高层父节点，必须在根节点补放 1 个相机 -> 总数 = ${cameras}`,
      msg: `根节点无上层父节点，且处于未覆盖状态，<strong>必须在根节点追加 1 个相机</strong>，总相机数更新为 <strong>${cameras}</strong>。`,
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, root.id, tags, statuses),
    });
  }

  // 收敛返回最终结果
  steps.push({
    type: 'return',
    line: lineReturn,
    i: 0,
    j: 0,
    dp1d: [cameras],
    memo: [cameras],
    activeSlot: 0,
    tag: `最少相机数: ${cameras}`,
    log: `| 🏆 演化完成！覆盖整棵树最少需要 ${cameras} 个摄像头`,
    msg: `🏆 演化推导完成！覆盖整棵树最少需要 <strong>${cameras}</strong> 个摄像头。`,
    activeNodeId: root.id,
    treeRoot: toUniversalTree(root, undefined, tags, statuses),
  });

  return steps;
}

