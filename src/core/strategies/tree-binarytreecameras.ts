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
 * 4. 完备 4 阶段演进体系：
 *    - Stage 1: 后序自底向上贪心状态机
 *    - Stage 2: 递归调用与状态依赖树展开
 *    - Stage 3: 树形 DP 三状态转移表
 *    - Stage 4: O(h) 递归栈空间压缩与极速流转
 */
export function compileBinaryTreeCameras(
  model: IYamlAlgorithmModel,
  arr: (number | null)[],
  stage: number = 1,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  switch (stage) {
    case 2:
      return compileBinaryTreeCamerasStage2(model, arr, anchorMap, direction);
    case 3:
      return compileBinaryTreeCamerasStage3(model, arr, anchorMap, direction);
    case 4:
      return compileBinaryTreeCamerasStage4(model, arr, anchorMap, direction);
    case 1:
    default:
      return compileBinaryTreeCamerasStage1(model, arr, anchorMap, direction);
  }
}

// ============================================================================
// Stage 1: 后序遍历自底向上贪心状态机
// ============================================================================
function compileBinaryTreeCamerasStage1(
  _model: IYamlAlgorithmModel,
  arr: (number | null)[],
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const root = buildRawTree(arr);
  if (!root) return [];

  const lineEntry = anchorMap?.entry || 1;
  const lineInit = anchorMap?.init || 2;
  const lineRootCamera = anchorMap?.root_camera || 3;
  const lineReturn = anchorMap?.return || anchorMap?.done || 5;
  const lineDfsEntry = anchorMap?.dfs_entry || 7;
  const lineBoundary = anchorMap?.boundary || 8;
  const lineBranchLeft = anchorMap?.branch_left || 9;
  const lineBranchRight = anchorMap?.branch_right || 10;
  const lineCondCamera = anchorMap?.cond_camera || 11;
  const lineAddCamera = anchorMap?.add_camera || 12;
  const lineReturnCamera = anchorMap?.return_camera || 13;
  const lineReturnCovered = anchorMap?.return_covered || 15;
  const lineReturnUncovered = anchorMap?.return_uncovered || 16;

  if (direction === 'reverse') {
    // 逆向：自顶向下先序贪心对比推演
    steps.push({
      stepIndex: 0,
      stage: 1,
      type: 'entry',
      line: lineEntry,
      codeLine: lineEntry,
      decision: `逆向自顶向下先序覆盖仿真启动：考察根节点 ${root.val}`,
      message: `对比分析：如果从根节点自顶向下尝试放置相机，对比自底向上的相机消耗`,
      variables: { totalNodes: arr.filter(x => x !== null).length, rootVal: root.val },
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, root.id),
      metrics: { '当前策略': '自顶向下先序对比', '相机计数': '0' },
    });

    let topDownCams = 0;
    const queue: { node: RawTreeNode; depth: number }[] = [{ node: root, depth: 0 }];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { node, depth } = queue.shift()!;
      visited.add(node.id);
      const needCam = depth % 2 === 0;
      if (needCam) topDownCams++;

      steps.push({
        stepIndex: steps.length,
        stage: 1,
        type: needCam ? 'update' : 'cond',
        line: needCam ? lineAddCamera : lineBoundary,
        codeLine: needCam ? lineAddCamera : lineBoundary,
        decision: needCam
          ? `先序深入 [${node.id}] (深度 ${depth})：为覆盖子节点，在此安放相机 (累计: ${topDownCams})`
          : `先序深入 [${node.id}] (深度 ${depth})：已被父节点相机覆盖，跳过`,
        message: `自顶向下贪心分配视角`,
        variables: { nodeId: node.id, depth, needCam, topDownCams },
        activeNodeId: node.id,
        treeRoot: toUniversalTree(root, node.id),
        metrics: { '当前深度': String(depth), '相机总数': String(topDownCams) },
      });

      if (node.left) {
        steps.push({
          stepIndex: steps.length,
          stage: 1,
          type: 'branch-call',
          line: lineBranchLeft,
          codeLine: lineBranchLeft,
          decision: `先序探查左子节点 [${node.left.id}]`,
          message: `深入左子树`,
          variables: { parent: node.id, left: node.left.id },
          activeNodeId: node.left.id,
          treeRoot: toUniversalTree(root, node.left.id),
          metrics: { '探查方向': '左子树' },
        });
        queue.push({ node: node.left, depth: depth + 1 });
      }

      if (node.right) {
        steps.push({
          stepIndex: steps.length,
          stage: 1,
          type: 'branch-call',
          line: lineBranchRight,
          codeLine: lineBranchRight,
          decision: `先序探查右子节点 [${node.right.id}]`,
          message: `深入右子树`,
          variables: { parent: node.id, right: node.right.id },
          activeNodeId: node.right.id,
          treeRoot: toUniversalTree(root, node.right.id),
          metrics: { '探查方向': '右子树' },
        });
        queue.push({ node: node.right, depth: depth + 1 });
      }
    }

    steps.push({
      stepIndex: steps.length,
      stage: 1,
      type: 'return',
      line: lineReturn,
      codeLine: lineReturn,
      decision: `🏁 逆向先序推演收敛：自顶向下消耗 ${topDownCams} 个相机`,
      message: `对比结论：自顶向下会导致叶节点重复或多余放相机，自底向上后序贪心更为紧凑最优`,
      variables: { topDownCameras: topDownCams },
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root),
      metrics: { '先序相机数': String(topDownCams), '状态': '🏁 逆向对比完成' },
    });

    return steps;
  }

  // 正向：严格遵循黄金准则的后序自底向上贪心状态机
  const tags = new Map<string, string>();
  const statuses = new Map<string, UniversalTreeNode['status']>();
  let cameras = 0;

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
    codeLine: lineInit,
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
        codeLine: lineBoundary,
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
      codeLine: lineDfsEntry,
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
      codeLine: lineBranchLeft,
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
      codeLine: lineBranchLeft,
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
      codeLine: lineBranchRight,
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
      codeLine: lineBranchRight,
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
      steps.push({
        type: 'cond',
        line: lineCondCamera,
        codeLine: lineCondCamera,
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
        codeLine: lineAddCamera,
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
        codeLine: lineReturnCamera,
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
      tags.set(node.id, '🛡️ 已被覆盖');
      statuses.set(node.id, 'base');

      steps.push({
        type: 'return',
        line: lineReturnCovered,
        codeLine: lineReturnCovered,
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

    tags.set(node.id, '⚠️ 待覆盖');
    statuses.set(node.id, 'normal');

    steps.push({
      type: 'return',
      line: lineReturnUncovered,
      codeLine: lineReturnUncovered,
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

  if (rootState === 0) {
    cameras++;
    tags.set(root.id, '📷 根节点补相机');
    statuses.set(root.id, 'visited');

    steps.push({
      type: 'update',
      line: lineRootCamera,
      codeLine: lineRootCamera,
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

  steps.push({
    type: 'return',
    line: lineReturn,
    codeLine: lineReturn,
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

  return steps.map((s, idx) => ({
    ...s,
    stepIndex: idx,
    stage: 1,
    line: s.line || 1,
    codeLine: s.codeLine || s.line || 1,
    decision: s.decision || s.log || s.tag || '状态转移',
    message: s.message || s.msg || s.log || '',
    metrics: s.metrics || { '已安放相机数': String(cameras), '当前状态': s.tag || '推进中' },
  }));
}

// ============================================================================
// Stage 2: 递归调用与状态依赖树展开
// ============================================================================
function compileBinaryTreeCamerasStage2(
  _model: IYamlAlgorithmModel,
  arr: (number | null)[],
  anchorMap?: Record<string, number>,
  _direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const root = buildRawTree(arr);
  if (!root) return [];

  const lineEntry = anchorMap?.entry || 2;
  const lineBranchLeft = anchorMap?.branch_left || 4;
  const lineBranchRight = anchorMap?.branch_right || 6;
  const lineStateCheck = anchorMap?.state_check || 8;
  const lineBacktrack = anchorMap?.backtrack || 10;
  const lineDone = anchorMap?.done || 12;

  const rootTreeNode: UniversalTreeNode = {
    id: root.id,
    r: 0,
    c: 0,
    val: `dfs(${root.id})`,
    status: 'active',
    children: [],
  };

  steps.push({
    stepIndex: 0,
    stage: 2,
    line: lineEntry,
    codeLine: lineEntry,
    decision: `展开递归决策依赖树根节点：dfs(${root.id})`,
    message: `自顶向下构建树形决策树，追踪每一个子树的递归推演与状态回溯`,
    variables: { rootId: root.id, totalNodes: arr.filter(x => x !== null).length },
    treeRoot: rootTreeNode,
    metrics: { '决策树阶段': '初始化', '活跃节点': root.id },
  });

  function traverse(node: RawTreeNode, parentTree: UniversalTreeNode, depth: number) {
    // 考察左分支
    if (node.left) {
      const leftChildTree: UniversalTreeNode = {
        id: node.left.id,
        r: depth + 1,
        c: 0,
        val: `dfs(${node.left.id})`,
        status: 'active',
        children: [],
      };
      parentTree.children.push(leftChildTree);

      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: lineBranchLeft,
        codeLine: lineBranchLeft,
        decision: `展开左子树分支：${node.id} -> ${node.left.id} (深入层级 ${depth + 1})`,
        message: `后序优先深入左子树`,
        variables: { current: node.id, child: node.left.id, depth },
        treeRoot: rootTreeNode,
        activeNodeId: node.left.id,
        metrics: { '分支': '左子树', '层级': String(depth + 1) },
      });

      traverse(node.left, leftChildTree, depth + 1);
    }

    // 考察右分支
    if (node.right) {
      const rightChildTree: UniversalTreeNode = {
        id: node.right.id,
        r: depth + 1,
        c: 1,
        val: `dfs(${node.right.id})`,
        status: 'active',
        children: [],
      };
      parentTree.children.push(rightChildTree);

      steps.push({
        stepIndex: steps.length,
        stage: 2,
        line: lineBranchRight,
        codeLine: lineBranchRight,
        decision: `展开右子树分支：${node.id} -> ${node.right.id} (深入层级 ${depth + 1})`,
        message: `深入右子树探索`,
        variables: { current: node.id, child: node.right.id, depth },
        treeRoot: rootTreeNode,
        activeNodeId: node.right.id,
        metrics: { '分支': '右子树', '层级': String(depth + 1) },
      });

      traverse(node.right, rightChildTree, depth + 1);
    }

    // 状态汇集与决策检查
    steps.push({
      stepIndex: steps.length,
      stage: 2,
      line: lineStateCheck,
      codeLine: lineStateCheck,
      decision: `汇集节点 [${node.id}] 的子树状态并执行贪心判定`,
      message: `后序归纳：左右子树推演完毕，决策当前节点是否放置相机`,
      variables: { nodeId: node.id },
      treeRoot: rootTreeNode,
      activeNodeId: node.id,
      metrics: { '节点判定': node.id, '决策': '汇集子树状态' },
    });

    parentTree.status = 'visited';

    steps.push({
      stepIndex: steps.length,
      stage: 2,
      line: lineBacktrack,
      codeLine: lineBacktrack,
      decision: `状态回溯落盘：节点 [${node.id}] 向上层父节点返回状态`,
      message: `完成当前节点的依赖闭环并回溯`,
      variables: { nodeId: node.id, status: 'visited' },
      treeRoot: rootTreeNode,
      activeNodeId: node.id,
      metrics: { '回溯': '向父节点汇报', '状态': '已落盘' },
    });
  }

  traverse(root, rootTreeNode, 0);

  steps.push({
    stepIndex: steps.length,
    stage: 2,
    line: lineDone,
    codeLine: lineDone,
    decision: `🛑 依赖树遍历收敛：根节点特判与全局相机安装推演完毕`,
    message: `完整构建了全树后序状态依赖的自底向上执行图谱`,
    variables: { totalSteps: steps.length },
    treeRoot: rootTreeNode,
    metrics: { '状态': '🏁 依赖树构建收敛' },
  });

  return steps;
}

// ============================================================================
// Stage 3: 树形 DP 三状态转移表
// ============================================================================
function compileBinaryTreeCamerasStage3(
  _model: IYamlAlgorithmModel,
  arr: (number | null)[],
  anchorMap?: Record<string, number>,
  _direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const root = buildRawTree(arr);
  if (!root) return [];

  const lineDpInit = anchorMap?.dp_init || 2;
  const lineDpVisit = anchorMap?.dp_visit || 4;
  const lineDpTrans = anchorMap?.dp_trans || 6;
  const lineDpRoot = anchorMap?.dp_root || 8;
  const lineDpDone = anchorMap?.dp_done || 10;

  // 收集后序节点序列
  const postOrderNodes: RawTreeNode[] = [];
  function collectPostOrder(node: RawTreeNode | null) {
    if (!node) return;
    collectPostOrder(node.left);
    collectPostOrder(node.right);
    postOrderNodes.push(node);
  }
  collectPostOrder(root);

  steps.push({
    stepIndex: 0,
    stage: 3,
    line: lineDpInit,
    codeLine: lineDpInit,
    decision: `初始化树形 DP 状态转移表：dp[N][3] (N=${postOrderNodes.length})`,
    message: `状态维度说明：0=待覆盖(留给父节点), 1=安装相机(覆盖父子与自身), 2=已被覆盖(无需再装)`,
    variables: { totalNodes: postOrderNodes.length, states: ['0:待覆盖', '1:装相机', '2:已覆盖'] },
    metrics: { '状态表尺寸': `${postOrderNodes.length} × 3`, '推导序列': '后序自底向上' },
    activeNodeId: root.id,
    treeRoot: toUniversalTree(root, root.id),
  });

  // 每个节点的状态转移推导
  let cameras = 0;
  const nodeStates: Record<string, number> = {};

  for (let idx = 0; idx < postOrderNodes.length; idx++) {
    const node = postOrderNodes[idx];
    const leftState = node.left ? (nodeStates[node.left.id] ?? 1) : 1;
    const rightState = node.right ? (nodeStates[node.right.id] ?? 1) : 1;

    steps.push({
      stepIndex: steps.length,
      stage: 3,
      line: lineDpVisit,
      codeLine: lineDpVisit,
      decision: `树形 DP 填表 [${idx + 1}/${postOrderNodes.length}]：考察节点 [${node.id}] (子节点状态: 左=${leftState}, 右=${rightState})`,
      message: `读取左子节点 dp[left] 与右子节点 dp[right] 转移向量`,
      variables: { nodeId: node.id, leftState, rightState, index: idx },
      stateArrays: [
        {
          id: 'dp_row',
          name: `dp[${node.id}] 状态演进`,
          indices: [0, 1, 2],
          values: [`0:待覆盖`, `1:装相机`, `2:已覆盖`],
          color: 'indigo',
        },
      ],
      activeSlot: idx,
      metrics: { '考察节点': node.id, '左子状态': String(leftState), '右子状态': String(rightState) },
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id),
    });

    let currentState = 0;
    if (leftState === 0 || rightState === 0) {
      cameras++;
      currentState = 2; // 装相机
    } else if (leftState === 2 || rightState === 2) {
      currentState = 1; // 已覆盖
    } else {
      currentState = 0; // 待覆盖
    }
    nodeStates[node.id] = currentState;

    steps.push({
      stepIndex: steps.length,
      stage: 3,
      line: lineDpTrans,
      codeLine: lineDpTrans,
      decision: `状态转移计算完成：dp[${node.id}] 判定为状态 ${currentState} (${currentState === 2 ? '📷 安装相机' : currentState === 1 ? '🛡️ 已被覆盖' : '⚠️ 待父覆盖'})，当前累计相机: ${cameras}`,
      message: `结合子树极值转移完成`,
      variables: { nodeId: node.id, computedState: currentState, cameras },
      stateArrays: [
        {
          id: 'dp_row',
          name: `dp[${node.id}] 最终状态`,
          indices: [0, 1, 2],
          values: [
            currentState === 0 ? '✓ 最优' : '—',
            currentState === 2 ? `✓ 相机(${cameras})` : '—',
            currentState === 1 ? '✓ 覆盖' : '—',
          ],
          color: 'emerald',
        },
      ],
      activeSlot: idx,
      metrics: { '节点状态': String(currentState), '相机累计': String(cameras) },
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id),
    });
  }

  // 根节点特判
  const rootFinalState = nodeStates[root.id] ?? 0;
  if (rootFinalState === 0) {
    cameras++;
    steps.push({
      stepIndex: steps.length,
      stage: 3,
      line: lineDpRoot,
      codeLine: lineDpRoot,
      decision: `⚡ 根节点常数特判：rootState == 0 (无上层父节点覆盖)，强制补装 1 个相机 -> 总数 = ${cameras}`,
      message: `边界约束闭环`,
      variables: { rootId: root.id, finalCameras: cameras },
      metrics: { '根特判': '追加相机', '最终相机数': String(cameras) },
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, root.id),
    });
  }

  steps.push({
    stepIndex: steps.length,
    stage: 3,
    line: lineDpDone,
    codeLine: lineDpDone,
    decision: `树形 DP 状态转移收敛：全树完成覆盖，最少需要相机 ${cameras} 台`,
    message: `全表填毕收敛`,
    variables: { totalCameras: cameras },
    metrics: { '最终结果': `${cameras} 台相机`, '推导': '收敛完成' },
    activeNodeId: root.id,
    treeRoot: toUniversalTree(root, root.id),
  });

  steps.push({
    stepIndex: steps.length,
    stage: 3,
    line: lineDpDone,
    codeLine: lineDpDone,
    decision: `🎉 树形 DP 三状态转移矩阵收敛完成！最少相机总数 = ${cameras}`,
    message: `所有节点状态转移矩阵推演自洽闭环`,
    variables: { totalCameras: cameras },
    metrics: { '最少相机数': String(cameras), '状态': '🏁 填表收敛' },
  });

  return steps;
}

// ============================================================================
// Stage 4: O(h) 递归栈空间压缩与极速结算
// ============================================================================
function compileBinaryTreeCamerasStage4(
  _model: IYamlAlgorithmModel,
  arr: (number | null)[],
  anchorMap?: Record<string, number>,
  _direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const root = buildRawTree(arr);
  if (!root) return [];

  const lineRegInit = anchorMap?.reg_init || 2;
  const lineRegDfs = anchorMap?.reg_dfs || 4;
  const lineRegRoot = anchorMap?.reg_root || 6;
  const lineRegDone = anchorMap?.reg_done || 8;

  steps.push({
    stepIndex: 0,
    stage: 4,
    line: lineRegInit,
    codeLine: lineRegInit,
    decision: `O(h) 空间极致压缩初始化：分配单个整数寄存器 cameras = 0`,
    message: `利用递归调用栈自带的 O(h) 空间，原地流式后序传递整型返回值`,
    variables: { cameras: 0, space: 'O(h)' },
    stateArrays: [
      {
        id: 'registers',
        name: '状态寄存器',
        indices: [0, 1],
        values: ['cameras: 0', 'cur_state: INIT'],
        color: 'indigo',
      },
    ],
    metrics: { '空间复杂度': 'O(h)', 'space': 'O(1)', '相机寄存器': '0' },
    activeNodeId: root.id,
    treeRoot: toUniversalTree(root, root.id),
  });

  // 极速扫描后序遍历节点
  const postOrder: RawTreeNode[] = [];
  function post(n: RawTreeNode | null) {
    if (!n) return;
    post(n.left);
    post(n.right);
    postOrder.push(n);
  }
  post(root);

  let cameras = 0;
  const nodeStates: Record<string, number> = {};

  for (let i = 0; i < postOrder.length; i++) {
    const node = postOrder[i];
    const left = node.left ? (nodeStates[node.left.id] ?? 1) : 1;
    const right = node.right ? (nodeStates[node.right.id] ?? 1) : 1;

    let res = 0;
    if (left === 0 || right === 0) {
      cameras++;
      res = 2;
    } else if (left === 2 || right === 2) {
      res = 1;
    } else {
      res = 0;
    }
    nodeStates[node.id] = res;

    steps.push({
      stepIndex: steps.length,
      stage: 4,
      line: lineRegDfs,
      codeLine: lineRegDfs,
      decision: `单趟常数级流转 [${i + 1}/${postOrder.length}]: Node[${node.id}] 返回 ${res}，cameras 寄存器 = ${cameras}`,
      message: `无额外哈希表与树对象分配，极速结算`,
      variables: { node: node.id, returned: res, cameras },
      stateArrays: [
        {
          id: 'registers',
          name: '状态寄存器',
          indices: [0, 1],
          values: [`cameras: ${cameras}`, `state: ${res}`],
          color: 'indigo',
        },
      ],
      activeSlot: i,
      metrics: { '当前节点': node.id, '寄存器 cameras': String(cameras), 'space': 'O(1)' },
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id),
    });
  }

  // 根节点快速收敛特判 (始终发射常数检查步骤)
  const rootRet = nodeStates[root.id] ?? 0;
  if (rootRet === 0) {
    cameras++;
    steps.push({
      stepIndex: steps.length,
      stage: 4,
      line: lineRegRoot,
      codeLine: lineRegRoot,
      decision: `根节点常数特判：rootRet == 0 (未被覆盖) -> 补装相机 -> cameras=${cameras}`,
      message: `常数时间补足根节点相机`,
      variables: { rootRet, cameras },
      metrics: { '根相机追加': 'YES', 'cameras': String(cameras), 'space': 'O(1)' },
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, root.id),
    });
  } else {
    steps.push({
      stepIndex: steps.length,
      stage: 4,
      line: lineRegRoot,
      codeLine: lineRegRoot,
      decision: `根节点常数检查：rootRet == ${rootRet} (已被子树有效覆盖)，无需追加相机 -> cameras=${cameras}`,
      message: `根节点已在监控覆盖范围内，维持当前相机计数`,
      variables: { rootRet, cameras },
      metrics: { '根相机追加': 'NO', 'cameras': String(cameras), 'space': 'O(1)' },
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, root.id),
    });
  }

  steps.push({
    stepIndex: steps.length,
    stage: 4,
    line: lineRegDone,
    codeLine: lineRegDone,
    decision: `🏁 O(h) 栈空间极速推演完毕，返回最少摄像头数: ${cameras}`,
    message: `极速求解成功，时间复杂度 O(N)，空间复杂度 O(h)`,
    variables: { return: cameras },
    metrics: { '最终结果': String(cameras), '空间开销': 'O(h)', 'space': 'O(1)', '状态': '🏁 极致收敛' },
    activeNodeId: root.id,
    treeRoot: toUniversalTree(root, root.id),
  });

  return steps;
}
