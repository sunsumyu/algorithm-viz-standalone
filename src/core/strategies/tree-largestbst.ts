import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { buildRawTree, toUniversalTree, type RawTreeNode } from './tree-dp-shared';

export interface BstInfo {
  maxBSTSize: number;
  size: number;
  min: number;
  max: number;
}

/**
 * 最大二叉搜索子树 (Largest BST Subtree, LC 333, 左程云 78 课 Code03)
 * 严格遵循黄金准则：
 * 1. 零跳步（Zero Step Skipping）：子递归调用前发射 branch-call，进入函数发射 entry；
 * 2. 调用-返回物理闭环（Call-Return Parity）：左右子树返回后发射 branch-return 回溯赋值帧；
 * 3. 完备 Info 汇报生命周期：
 *    - leftInfo = process(node.left)
 *    - rightInfo = process(node.right)
 *    - 边界与范围整合：min, max, size
 *    - BST 条件判定：leftBST && rightBST
 *    - 状态转移：maxBSTSize
 * 4. 双向推导支持（Forward 自底向上后序四元汇报 / Reverse 自顶向下先序验证对比探查）
 */
export function compileLargestBST(
  _model: IYamlAlgorithmModel,
  arr: (number | null)[],
  _stage: number = 1,
  anchorMap?: Record<string, number>,
  direction: 'forward' | 'reverse' = 'forward'
): UniversalStep[] {
  const steps: UniversalStep[] = [];
  const root = buildRawTree(arr);
  if (!root) return [];

  const isHigherStage = _stage > 1 && !anchorMap;
  const lineEntry = anchorMap?.entry ?? 1;
  const lineInit = anchorMap?.init ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 2 : 2));
  const lineDfsEntry = anchorMap?.dfs_entry ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 2 : 4));
  const lineBoundary = anchorMap?.boundary ?? (anchorMap ? anchorMap.dfs_entry ?? anchorMap.entry ?? 1 : (isHigherStage ? 2 : 5));
  const lineBranchLeft = anchorMap?.branch_left ?? (anchorMap ? anchorMap.dfs_entry ?? anchorMap.entry ?? 1 : (isHigherStage ? 3 : 6));
  const lineBranchRight = anchorMap?.branch_right ?? (anchorMap ? anchorMap.dfs_entry ?? anchorMap.entry ?? 1 : (isHigherStage ? 4 : 7));
  const lineInitNode = anchorMap?.init_node ?? (anchorMap ? anchorMap.dfs_entry ?? anchorMap.entry ?? 1 : (isHigherStage ? 5 : 8));
  const lineCondBst = anchorMap?.cond_bst ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 5 : 12));
  const lineTransferBst = anchorMap?.transfer_bst ?? (anchorMap ? anchorMap.cond_bst ?? anchorMap.entry ?? 1 : (isHigherStage ? 6 : 14));
  const lineTransferNotBst = anchorMap?.transfer_not_bst ?? (anchorMap ? anchorMap.cond_bst ?? anchorMap.entry ?? 1 : (isHigherStage ? 7 : 16));
  const lineCombine = anchorMap?.combine ?? (anchorMap ? anchorMap.return ?? anchorMap.entry ?? 1 : (isHigherStage ? 8 : 18));
  const lineReturn = anchorMap?.return ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 9 : 2));

  const tags = new Map<string, string>();
  const statuses = new Map<string, UniversalTreeNode['status']>();

  // 逆向模式：自顶向下先序验证对比探查 (Top-Down Pre-Order BST Exploration)
  if (direction === 'reverse') {
    const lineEntryR = anchorMap?.entry ?? 1;
    const lineDfsEntryR = anchorMap?.dfs_entry ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 2 : 4));
    const lineCondBstR = anchorMap?.cond_bst ?? (anchorMap ? anchorMap.dfs_entry ?? anchorMap.entry ?? 1 : (isHigherStage ? 5 : 12));
    const lineTransferBstR = anchorMap?.transfer_bst ?? (anchorMap ? anchorMap.cond_bst ?? anchorMap.entry ?? 1 : (isHigherStage ? 6 : 14));
    const lineReturnR = anchorMap?.return ?? (anchorMap ? anchorMap.entry ?? 1 : (isHigherStage ? 8 : 2));

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
      log: '🔍 【逆向对比】启动自顶向下先序探查，从根节点出发验证各子树是否满足 BST 性质',
      msg: '启动自顶向下先序探查：逐节点验证二叉搜索树充要条件，对比自底向上四元汇报的高效性。',
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, root.id, tags, statuses),
    });

    function isValidBST(n: RawTreeNode | null, minVal: number, maxVal: number): boolean {
      if (!n) return true;
      if (n.val <= minVal || n.val >= maxVal) return false;
      return isValidBST(n.left, minVal, n.val) && isValidBST(n.right, n.val, maxVal);
    }

    function countNodes(n: RawTreeNode | null): number {
      if (!n) return 0;
      return 1 + countNodes(n.left) + countNodes(n.right);
    }

    let reverseMax = 0;
    const queue: RawTreeNode[] = [root];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      statuses.set(curr.id, 'current');

      const isBst = isValidBST(curr, -Infinity, Infinity);
      const bstCount = isBst ? countNodes(curr) : 0;
      reverseMax = Math.max(reverseMax, bstCount);

      steps.push({
        type: 'entry',
        line: lineDfsEntryR,
        codeLine: lineDfsEntryR,
        i: 0,
        j: 0,
        dp1d: [reverseMax],
        memo: [bstCount],
        activeSlot: 0,
        tag: `先序检验节点 [${curr.val}]`,
        log: `| 📥 【先序检验】考察节点 [${curr.val}] 子树是否为有效 BST`,
        msg: `自顶向下检验：考察节点 <strong>Node(${curr.val})</strong> 为根的子树是否满足 BST 严格单调性。`,
        activeNodeId: curr.id,
        treeRoot: toUniversalTree(root, curr.id, tags, statuses),
      });

      tags.set(curr.id, isBst ? `✅合法BST(${bstCount})` : '❌非BST');
      statuses.set(curr.id, isBst ? 'visited' : 'base');

      steps.push({
        type: 'update',
        line: isBst ? lineTransferBstR : lineCondBstR,
        codeLine: isBst ? lineTransferBstR : lineCondBstR,
        i: 0,
        j: 0,
        dp1d: [reverseMax, bstCount],
        memo: [bstCount, reverseMax],
        activeSlot: 0,
        tag: isBst ? `合法BST 节点数 ${bstCount}` : '非合法BST',
        log: `| ⚡ 【检验结果】节点 [${curr.val}]: ${isBst ? `合法 BST (节点数 ${bstCount})` : '不合法 BST'} -> 当前最大 BST=${reverseMax}`,
        msg: `节点 <strong>Node(${curr.val})</strong> 检验结果：${isBst ? `构成合法 BST，大小为 <code>${bstCount}</code>` : '不满足 BST 单调条件'}。当前全局最大 <strong>${reverseMax}</strong>。`,
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
      log: `| 🏆 逆向推导完成！整树最大 BST 子树节点数为 ${reverseMax}`,
      msg: `🏆 逆向推导完成！最大 BST 子树节点数为 <strong>${reverseMax}</strong>。`,
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
      metrics: s.metrics || { '最大BST大小': String(reverseMax), '推导方向': '逆向先序对比' },
    }));
  }

  // 正向模式：自底向上后序四元汇报
  let globalMaxSize = 0;

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
    tag: 'largestBSTSubtree(root) 入口',
    log: '🌲 最大BST子树套路：每个节点汇报 [maxBSTSize, size, min, max] 四元组 (左程云 78 课 Code03)',
    msg: '主函数入口：准备自底向上后序遍历二叉树，求解整棵树中最大二叉搜索子树节点数。',
    activeNodeId: root.id,
    treeRoot: toUniversalTree(root, root.id, tags, statuses),
  });

  // Step 1: 启动后序递归
  steps.push({
    type: 'entry',
    line: lineInit,
    codeLine: lineInit,
    i: 0,
    j: 0,
    dp1d: [0],
    memo: [0],
    activeSlot: 0,
    tag: '启动后序遍历 process(root)',
    log: '| 🚀 启动后序递归：调用 process(root)',
    msg: '调用辅助递归函数：<code>process(root)</code>。',
    activeNodeId: root.id,
    treeRoot: toUniversalTree(root, root.id, tags, statuses),
  });

  function dfs(node: RawTreeNode | null): BstInfo | null {
    if (!node) {
      steps.push({
        type: 'boundary',
        line: lineBoundary,
        codeLine: lineBoundary,
        i: 0,
        j: 0,
        dp1d: [globalMaxSize],
        memo: [0],
        activeSlot: 0,
        tag: 'node == null -> null',
        log: '| 🛑 【边界出口】遇到空节点，返回 null 空信息',
        msg: '空节点边界条件：<code>node == null</code>，返回 <strong>null</strong>。',
      });
      return null;
    }

    statuses.set(node.id, 'current');

    // Callee Entry Frame
    steps.push({
      type: 'entry',
      line: lineDfsEntry,
      codeLine: lineDfsEntry,
      i: 0,
      j: 0,
      dp1d: [globalMaxSize],
      memo: [0],
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
      varName: 'left',
      i: 0,
      j: 0,
      dp1d: [globalMaxSize],
      memo: [0],
      activeSlot: 0,
      tag: `向左深入: process(node.left)`,
      log: `| 🌿 【左分支调用】节点 [${node.val}] 深入左子树 process(node.left)`,
      msg: `向左深入：求解左子树对当前节点 <strong>Node(${node.val})</strong> 的 BST Info 信息。`,
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
      subResult: left ? left.maxBSTSize : 0,
      i: 0,
      j: 0,
      dp1d: [globalMaxSize, left ? left.maxBSTSize : 0],
      memo: [left ? left.maxBSTSize : 0],
      activeSlot: 0,
      tag: left ? `leftInfo(BST:${left.maxBSTSize}, [${left.min}, ${left.max}])` : 'leftInfo(null)',
      log: `| ↩️ 【回溯赋值】节点 [${node.val}] 收到左子树: ${left ? `maxBSTSize=${left.maxBSTSize}, min=${left.min}, max=${left.max}` : 'null (空子树合法)'}`,
      msg: `左子树返回赋值：<code>left = ${left ? `Info(maxBST: ${left.maxBSTSize}, [${left.min}, ${left.max}])` : 'null'}</code>。`,
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
      dp1d: [globalMaxSize, left ? left.maxBSTSize : 0],
      memo: [left ? left.maxBSTSize : 0],
      activeSlot: 0,
      tag: `向右深入: process(node.right)`,
      log: `| 🌿 【右分支调用】节点 [${node.val}] 深入右子树 process(node.right)`,
      msg: `向右深入：求解右子树对当前节点 <strong>Node(${node.val})</strong> 的 BST Info 信息。`,
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
      subResult: right ? right.maxBSTSize : 0,
      i: 0,
      j: 0,
      dp1d: [globalMaxSize, right ? right.maxBSTSize : 0],
      memo: [right ? right.maxBSTSize : 0],
      activeSlot: 0,
      tag: right ? `rightInfo(BST:${right.maxBSTSize}, [${right.min}, ${right.max}])` : 'rightInfo(null)',
      log: `| ↩️ 【回溯赋值】节点 [${node.val}] 收到右子树: ${right ? `maxBSTSize=${right.maxBSTSize}, min=${right.min}, max=${right.max}` : 'null (空子树合法)'}`,
      msg: `右子树返回赋值：<code>right = ${right ? `Info(maxBST: ${right.maxBSTSize}, [${right.min}, ${right.max}])` : 'null'}</code>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    // 3. 整合基础极值与尺寸
    let min = node.val;
    let max = node.val;
    let size = 1;

    if (left !== null) {
      min = Math.min(min, left.min);
      max = Math.max(max, left.max);
      size += left.size;
    }
    if (right !== null) {
      min = Math.min(min, right.min);
      max = Math.max(max, right.max);
      size += right.size;
    }

    steps.push({
      type: 'update',
      line: lineInitNode,
      codeLine: lineInitNode,
      i: 0,
      j: 0,
      dp1d: [globalMaxSize, size],
      memo: [min, max],
      activeSlot: 0,
      tag: `节点基础: 尺寸${size}, 范围[${min}, ${max}]`,
      log: `| 📊 【极值尺寸】节点 [${node.val}]: 子树规模 size=${size}, 范围=[${min}, ${max}]`,
      msg: `整合极值与尺寸：当前子树总节点数 <code>size = ${size}</code>，极值区间 <code>[${min}, ${max}]</code>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    // 4. 判断 BST 充分必要条件
    const leftBST = left === null || (left.maxBSTSize === left.size && left.max < node.val);
    const rightBST = right === null || (right.maxBSTSize === right.size && right.min > node.val);

    steps.push({
      type: 'cond',
      line: lineCondBst,
      codeLine: lineCondBst,
      i: 0,
      j: 0,
      dp1d: [globalMaxSize, size],
      memo: [leftBST ? 1 : 0, rightBST ? 1 : 0],
      activeSlot: 0,
      tag: `BST判断: 左${leftBST ? '✅' : '❌'}, 右${rightBST ? '✅' : '❌'}`,
      log: `| 🔍 【BST判定】节点 [${node.val}]: leftBST=${leftBST} (max=${left?.max} < ${node.val}), rightBST=${rightBST} (min=${right?.min} > ${node.val})`,
      msg: `BST 条件校验：左子树满足 <strong>${leftBST ? '合规 (left.max < node.val)' : '违规'}</strong>，右子树满足 <strong>${rightBST ? '合规 (right.min > node.val)' : '违规'}</strong>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    let maxBSTSize = 0;
    if (leftBST && rightBST) {
      maxBSTSize = (left === null ? 0 : left.size) + (right === null ? 0 : right.size) + 1;
      tags.set(node.id, `✅全合法BST(${maxBSTSize})`);
      statuses.set(node.id, 'visited');

      steps.push({
        type: 'update',
        line: lineTransferBst,
        codeLine: lineTransferBst,
        i: 0,
        j: 0,
        dp1d: [globalMaxSize, maxBSTSize],
        memo: [maxBSTSize],
        activeSlot: 0,
        tag: `✅全合法BST(${maxBSTSize})`,
        log: `| ⚡ 【BST合并】节点 [${node.val}] 自身整棵子树构成合法 BST！size = ${maxBSTSize}`,
        msg: `状态转移：当前节点为根的整棵子树<strong>构成合法 BST</strong>，节点总数 <code>maxBSTSize = <strong>${maxBSTSize}</strong></code>。`,
        activeNodeId: node.id,
        treeRoot: toUniversalTree(root, node.id, tags, statuses),
      });
    } else {
      maxBSTSize = Math.max(left === null ? 0 : left.maxBSTSize, right === null ? 0 : right.maxBSTSize);
      tags.set(node.id, `❌非BST(max:${maxBSTSize})`);
      statuses.set(node.id, 'base');

      steps.push({
        type: 'update',
        line: lineTransferNotBst,
        codeLine: lineTransferNotBst,
        i: 0,
        j: 0,
        dp1d: [globalMaxSize, maxBSTSize],
        memo: [maxBSTSize],
        activeSlot: 0,
        tag: `❌非BST(子树最优:${maxBSTSize})`,
        log: `| ⚡ 【非BST继承】节点 [${node.val}] 无法构成BST，继承左右最优: maxBSTSize = ${maxBSTSize}`,
        msg: `状态转移：无法构成包含当前节点的完整 BST，从左右子树继承最大合法 BST 大小：<code>maxBSTSize = max(${left ? left.maxBSTSize : 0}, ${right ? right.maxBSTSize : 0}) = <strong>${maxBSTSize}</strong></code>。`,
        activeNodeId: node.id,
        treeRoot: toUniversalTree(root, node.id, tags, statuses),
      });
    }

    globalMaxSize = Math.max(globalMaxSize, maxBSTSize);

    // 5. 返回当前 Info
    steps.push({
      type: 'combine',
      line: lineCombine,
      codeLine: lineCombine,
      i: 0,
      j: 0,
      dp1d: [globalMaxSize, maxBSTSize],
      memo: [maxBSTSize, size],
      activeSlot: 0,
      tag: `返回 Info(BST:${maxBSTSize}, 节点:${size})`,
      log: `| ⬆️ 【汇报父级】节点 [${node.val}] 向父节点返回 Info(maxBSTSize=${maxBSTSize}, size=${size}, min=${min}, max=${max})`,
      msg: `向父节点返回：<code>return Info(maxBSTSize: ${maxBSTSize}, size: ${size}, min: ${min}, max: ${max})</code>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    return { maxBSTSize, size, min, max };
  }

  const finalInfo = dfs(root);
  const ans = finalInfo ? finalInfo.maxBSTSize : 0;

  // 最终收敛返回
  steps.push({
    type: 'return',
    line: lineReturn,
    codeLine: lineReturn,
    i: 0,
    j: 0,
    dp1d: [ans],
    memo: [ans],
    activeSlot: 0,
    tag: `最大BST大小: ${ans}`,
    log: `| 🏆 遍历完成！整棵二叉树中最大 BST 子树共有 ${ans} 个节点`,
    msg: `🏆 演化推导完成！最大 BST 子树节点数为 <strong>${ans}</strong>。`,
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
    metrics: s.metrics || { '最大BST大小': String(ans), '子树规模': String(finalInfo ? finalInfo.size : 0) },
  }));
}
