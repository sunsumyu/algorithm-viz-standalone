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
 * 最大二叉搜索子树 (Largest BST Subtree, LC 333, 左程云 76 课)
 * 严格遵循黄金准则：
 * 1. 零跳步（Zero Step Skipping）：子递归调用前发射 branch-call，进入函数发射 entry；
 * 2. 调用-返回物理闭环（Call-Return Parity）：左右子树返回后发射 branch-return 回溯赋值帧；
 * 3. 完备 Info 汇报生命周期：
 *    - leftInfo = process(node.left)
 *    - rightInfo = process(node.right)
 *    - 边界与范围整合：min, max, size
 *    - BST 条件判定：leftBST && rightBST
 *    - 状态转移：maxBSTSize
 */
export function compileLargestBST(
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
  const lineInitNode = anchorMap?.init_node || 8;
  const lineCondBst = anchorMap?.cond_bst || 12;
  const lineTransferBst = anchorMap?.transfer_bst || 14;
  const lineTransferNotBst = anchorMap?.transfer_not_bst || 16;
  const lineCombine = anchorMap?.combine || 18;
  const lineReturn = anchorMap?.return || 2;

  const tags = new Map<string, string>();
  const statuses = new Map<string, UniversalTreeNode['status']>();
  let globalMaxSize = 0;

  // Step 0: 主函数入口
  steps.push({
    type: 'entry',
    line: lineEntry,
    i: 0,
    j: 0,
    dp1d: [0],
    memo: [0],
    activeSlot: 0,
    tag: 'largestBSTSubtree(root) 入口',
    log: '🌲 最大BST子树套路：每个节点汇报 [maxBSTSize, size, min, max] 四元组 (左程云 76 课)',
    msg: '主函数入口：准备自底向上后序遍历二叉树，求解整棵树中最大二叉搜索子树节点数。',
    activeNodeId: root.id,
    treeRoot: toUniversalTree(root, root.id, tags, statuses),
  });

  // Step 1: 启动后序递归
  steps.push({
    type: 'entry',
    line: lineInit,
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
      branchType: 'left',
      varName: 'left',
      i: 0,
      j: 0,
      dp1d: [globalMaxSize],
      memo: [0],
      activeSlot: 0,
      tag: '向左深入: process(node.left)',
      log: `| 🌿 【左分支调用】节点 [${node.val}] 准备深入左子树 process(node.left)`,
      msg: `向左深入：求解左子树对当前节点 <strong>Node(${node.val})</strong> 的 BST Info。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    const left = dfs(node.left);

    // Call-Return Parity: 左子树回溯赋值
    steps.push({
      type: 'branch-return',
      line: lineBranchLeft,
      branchType: 'left',
      subResult: left ? left.maxBSTSize : 0,
      i: 0,
      j: 0,
      dp1d: [globalMaxSize, left ? left.maxBSTSize : 0],
      memo: [left ? left.maxBSTSize : 0],
      activeSlot: 0,
      tag: left ? `left(BST:${left.maxBSTSize}, 节点:${left.size})` : 'left(null)',
      log: `| ↩️ 【回溯赋值】节点 [${node.val}] 收到左子树: ${left ? `maxBSTSize=${left.maxBSTSize}, size=${left.size}, [${left.min}, ${left.max}]` : 'null'}`,
      msg: `左子树返回赋值：<code>left = ${left ? `Info(maxBSTSize: ${left.maxBSTSize}, size: ${left.size})` : 'null'}</code>。`,
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
      dp1d: [globalMaxSize, left ? left.maxBSTSize : 0],
      memo: [left ? left.maxBSTSize : 0],
      activeSlot: 0,
      tag: '向右深入: process(node.right)',
      log: `| 🌿 【右分支调用】节点 [${node.val}] 准备深入右子树 process(node.right)`,
      msg: `向右深入：求解右子树对当前节点 <strong>Node(${node.val})</strong> 的 BST Info。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    const right = dfs(node.right);

    // Call-Return Parity: 右子树回溯赋值
    steps.push({
      type: 'branch-return',
      line: lineBranchRight,
      branchType: 'right',
      subResult: right ? right.maxBSTSize : 0,
      i: 0,
      j: 0,
      dp1d: [globalMaxSize, right ? right.maxBSTSize : 0],
      memo: [right ? right.maxBSTSize : 0],
      activeSlot: 0,
      tag: right ? `right(BST:${right.maxBSTSize}, 节点:${right.size})` : 'right(null)',
      log: `| ↩️ 【回溯赋值】节点 [${node.val}] 收到右子树: ${right ? `maxBSTSize=${right.maxBSTSize}, size=${right.size}, [${right.min}, ${right.max}]` : 'null'}`,
      msg: `右子树返回赋值：<code>right = ${right ? `Info(maxBSTSize: ${right.maxBSTSize}, size: ${right.size})` : 'null'}</code>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    // 3. 初始化节点极值与大小
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
      i: 0,
      j: 0,
      dp1d: [globalMaxSize, size],
      memo: [min, max],
      activeSlot: 0,
      tag: `min:${min}, max:${max}, size:${size}`,
      log: `| 📍 汇总极值与节点数：min=${min}, max=${max}, size=${size}`,
      msg: `局部汇总：当前子树值域 <code>[${min}, ${max}]</code>，子树总节点数 <code>${size}</code>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    // 4. BST 合法性判定
    const leftBST = left === null || (left.maxBSTSize === left.size && left.max < node.val);
    const rightBST = right === null || (right.maxBSTSize === right.size && right.min > node.val);
    const isBST = leftBST && rightBST;

    steps.push({
      type: 'cond',
      line: lineCondBst,
      i: 0,
      j: 0,
      dp1d: [globalMaxSize, size],
      memo: [isBST ? 1 : 0],
      activeSlot: 0,
      tag: isBST ? 'BST条件满足' : '不满足BST条件',
      log: `| 🔍 【BST判断】节点 [${node.val}]: leftBST=${leftBST}, rightBST=${rightBST} -> isBST=${isBST}`,
      msg: `BST 判定：左子树是否全合法且最大值 <code>${left ? left.max : '-∞'}</code> < <code>${node.val}</code>：<strong>${leftBST}</strong>；右子树是否全合法且最小值 <code>${right ? right.min : '+∞'}</code> > <code>${node.val}</code>：<strong>${rightBST}</strong>。`,
      activeNodeId: node.id,
      treeRoot: toUniversalTree(root, node.id, tags, statuses),
    });

    let maxBSTSize = 0;
    if (isBST) {
      maxBSTSize = (left === null ? 0 : left.size) + (right === null ? 0 : right.size) + 1;
      tags.set(node.id, `✅BST(${maxBSTSize})`);
      statuses.set(node.id, 'visited');

      steps.push({
        type: 'update',
        line: lineTransferBst,
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

  return steps;
}

