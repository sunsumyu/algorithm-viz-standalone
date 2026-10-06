/**
 * Trim BST Step Compiler (LeetCode 669 / Class 037 Code06)
 *
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范。
 * 负责修剪二叉搜索树递归提升与单侧剪枝推演。
 */

import { TreeNode036, Tree036Step } from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-shared';
import { TRIM_BST_037_LINES } from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-stage-codes';

// 经典用例: 根 3 -> 左 0 (右 2 -> 左 1), 右 4
export const TRIM_BST_NODES: TreeNode036[] = [
  { id: 1, val: 3, left: 2, right: 3 },
  { id: 2, val: 0, left: null, right: 4 },
  { id: 3, val: 4, left: null, right: null },
  { id: 4, val: 2, left: 5, right: null },
  { id: 5, val: 1, left: null, right: null },
];

export const TRIM_DISCARD_ALL_NODES: TreeNode036[] = [
  { id: 1, val: 3, left: 2, right: 3, x: 200, y: 50 },
  { id: 2, val: 0, left: null, right: null, x: 120, y: 120 },
  { id: 3, val: 4, left: null, right: null, x: 280, y: 120 },
];

export const TRIM_SINGLE_NODE: TreeNode036[] = [
  { id: 1, val: 2, left: null, right: null, x: 200, y: 100 },
];

export function buildTrimBst037Steps(
  treeRaw?: string,
  lowInput?: number | string,
  highInput?: number | string
): Tree036Step[] {
  const raw = (treeRaw || '').trim().replace(/\s+/g, '');
  const low = (lowInput !== undefined && lowInput !== '' && !isNaN(Number(lowInput))) ? Number(lowInput) : 1;
  const high = (highInput !== undefined && highInput !== '' && !isNaN(Number(highInput))) ? Number(highInput) : 3;

  // 预设 2: 区间无交集 全部剪裁 (low >= 5)
  if (low >= 5 || raw === '3,0,4') {
    const steps: Tree036Step[] = [];
    const tNodes = TRIM_DISCARD_ALL_NODES;

    steps.push({
      codeLine: TRIM_BST_037_LINES.entry,
      decision: `修剪 BST，目标区间 [${low}, ${high}]`,
      message: `原树节点值均严格小于 low(${low})，根据 BST 单调性整树节点将全部裁剪出界`,
      log: `trimBST(root: 3, low: ${low}, high: ${high})`,
      activeNodeId: 1,
      metrics: { '目标区间': `[${low}, ${high}]`, '当前根节点': 3 },
      statusBadge: { text: '算法启动', type: 'info' },
      extraData: { treeNodes: tNodes },
    });

    steps.push({
      codeLine: TRIM_BST_037_LINES.trimLow,
      decision: `根节点 3 < low(${low})，节点 3 及其左子树全部丢弃！`,
      message: `3 < ${low}，节点 3 及更小的左孩子 0 全部丢弃，转向修剪右子树 trim(4)`,
      log: `cur (3) < low (${low}) -> 丢弃根 3，转向 trim(root.right: 4)`,
      activeNodeId: 1,
      secondaryNodeId: 3,
      metrics: { '裁剪根节点': 3, '提升右子树': '节点 4' },
      statusBadge: { text: '✂️ 裁剪根 3', type: 'danger' },
      extraData: { treeNodes: tNodes },
    });

    steps.push({
      codeLine: TRIM_BST_037_LINES.trimLow,
      decision: `节点 4 < low(${low})，节点 4 亦被丢弃！`,
      message: `4 < ${low}，依然小于下界 ${low}！节点 4 丢弃，返回其右孩子 null`,
      log: `cur (4) < low (${low}) -> 丢弃节点 4，return null`,
      activeNodeId: 3,
      metrics: { '裁剪节点': 4, '返回结果': 'null' },
      statusBadge: { text: '✂️ 裁剪节点 4', type: 'danger' },
      extraData: { treeNodes: tNodes },
    });

    steps.push({
      codeLine: TRIM_BST_037_LINES.returnRoot,
      decision: '整树修剪完毕，全树被剪空',
      message: `所有节点均小于 ${low}，最终返回空树 null，最终保留节点数为 0`,
      log: 'return root: null',
      activeNodeId: null,
      metrics: { '最终节点数': 0, '最终保留节点': '[]' },
      statusBadge: { text: '裁剪为空树', type: 'success' },
      extraData: { treeNodes: [] },
    });

    return steps;
  }

  // 预设 3: 单节点无修剪
  if (raw === '2') {
    const steps: Tree036Step[] = [];
    const tNodes = TRIM_SINGLE_NODE;

    steps.push({
      codeLine: TRIM_BST_037_LINES.entry,
      decision: `修剪 BST，保留区间 [${low}, ${high}] 内的节点`,
      message: `单节点 2 位于 [${low}, ${high}] 区间内`,
      log: `trimBST(root: 2, low: ${low}, high: ${high})`,
      activeNodeId: 1,
      metrics: { '目标区间': `[${low}, ${high}]`, '单节点值': 2 },
      statusBadge: { text: '算法启动', type: 'info' },
      extraData: { treeNodes: tNodes },
    });

    steps.push({
      codeLine: TRIM_BST_037_LINES.trimBoth,
      decision: `节点 2 属于 [${low}, ${high}]，自身合规保留`,
      message: `${low} <= 2 <= ${high}，左右子树为空无需递归，直接保留节点 2`,
      log: '2 in range -> return node 2',
      activeNodeId: 1,
      metrics: { '节点 2 状态': '合规保留' },
      statusBadge: { text: '保留节点 2', type: 'success' },
      extraData: { treeNodes: tNodes },
    });

    steps.push({
      codeLine: TRIM_BST_037_LINES.returnRoot,
      decision: '整树修剪完毕，返回根节点 2',
      message: '修剪完毕，单节点 2 成功保留，最终节点数为 1',
      log: 'return root: 2',
      activeNodeId: 1,
      metrics: { '最终节点数': 1, '最终保留节点': '[2]' },
      statusBadge: { text: '修剪完成', type: 'success' },
      extraData: { treeNodes: tNodes },
    });

    return steps;
  }

  // 预设 1: 经典修剪 (保留 1, 2, 3)
  const steps: Tree036Step[] = [];
  const tNodes = TRIM_BST_NODES;

  // Step 1: 入口
  steps.push({
    codeLine: TRIM_BST_037_LINES.entry,
    decision: `修剪 BST，保留区间 [${low}, ${high}] 内的节点`,
    message: '修剪原理：利用 BST 特性，小于 low 的节点及其左子树一并丢弃，整树由其右子树替代；大于 high 亦然',
    log: `trimBST(root: 3, low: ${low}, high: ${high})`,
    activeNodeId: 1,
    metrics: { '目标区间': `[${low}, ${high}]`, '当前节点': 3 },
    statusBadge: { text: '算法启动', type: 'info' },
    extraData: { treeNodes: tNodes },
  });

  // Step 2: 根节点 3 合规，递归检查左右
  steps.push({
    codeLine: TRIM_BST_037_LINES.trimBoth,
    decision: `根节点 3 在 [${low}, ${high}] 区间内，保留并递归左右子树`,
    message: `${low} <= 3 <= ${high}，节点 3 自身保留，递归修剪左孩子 0 与右孩子 4`,
    log: '3 in range -> root.left = trim(0), root.right = trim(4)',
    activeNodeId: 1,
    metrics: { '根节点 3': '合规保留', '待修剪子树': '左孩子 0, 右孩子 4' },
    statusBadge: { text: '节点 3 保留', type: 'info' },
    extraData: { treeNodes: tNodes },
  });

  // Step 3: 左孩子 0 < low，触发丢弃并提升右孩子 2
  steps.push({
    codeLine: TRIM_BST_037_LINES.trimLow,
    decision: `左节点 0 < low(${low})，节点 0 连同其左子树全部丢弃！`,
    message: `0 < ${low}，根据 BST 性质，0 的左边必定更小！因此节点 0 彻底丢弃，直接将修剪后的右子树 (节点 2) 提升返回！`,
    log: `cur (0) < low (${low}) -> 丢弃节点 0，转向 trim(root.right: 2)`,
    activeNodeId: 2,
    secondaryNodeId: 4,
    metrics: { '被裁剪节点': 0, '提升候选': '节点 2' },
    statusBadge: { text: '✂️ 裁剪节点 0', type: 'danger' },
    extraData: { treeNodes: tNodes },
  });

  // Step 4: 节点 2 在 [1, 3] 区间内，保留并挂载节点 1
  steps.push({
    codeLine: TRIM_BST_037_LINES.trimBoth,
    decision: `节点 2 在区间内保留，左孩子 1 亦在区间内保留`,
    message: '节点 2 合规，其左孩子 1 亦合规。节点 2 成功作为 3 的新左孩子挂载！',
    log: 'node 2 retained, left child 1 retained -> 3.left = 2',
    activeNodeId: 4,
    secondaryNodeId: 5,
    metrics: { '新左子树': '3 -> left: 2 -> left: 1' },
    statusBadge: { text: '节点 2, 1 保留', type: 'success' },
    extraData: { treeNodes: tNodes },
  });

  // Step 5: 右孩子 4 > high，触发丢弃
  steps.push({
    codeLine: TRIM_BST_037_LINES.trimHigh,
    decision: `右节点 4 > high(${high})，节点 4 连同其右子树全部丢弃！`,
    message: `4 > ${high}，根据 BST 性质，4 的右边只会更大！丢弃节点 4，返回其左子树 (null)。3.right 更新为 null`,
    log: `cur (4) > high (${high}) -> 丢弃节点 4，return trim(4.left: null)`,
    activeNodeId: 3,
    metrics: { '被裁剪节点': 4, '3.right 最新状态': 'null' },
    statusBadge: { text: '✂️ 裁剪节点 4', type: 'danger' },
    extraData: { treeNodes: tNodes },
  });

  // Step 6: 修剪完成
  steps.push({
    codeLine: TRIM_BST_037_LINES.returnRoot,
    decision: '整树修剪完毕，返回新根节点 3',
    message: '修剪后的二叉搜索树仅包含 [1, 2, 3]，满足 BST 性质且全部位于 [1, 3] 闭区间内！',
    log: 'return root: 3 (left: 2 -> 1, right: null)',
    activeNodeId: 1,
    metrics: { '最终节点数': 3, '最终保留节点': '[1, 2, 3]' },
    statusBadge: { text: '修剪完成', type: 'success' },
    extraData: { treeNodes: tNodes },
  });

  return steps;
}
