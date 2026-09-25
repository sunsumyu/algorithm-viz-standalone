/**
 * 左程云算法通关课 Class 036: 完全二叉树的节点个数 (Count Complete Tree Nodes / LeetCode 222)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  TreeNode036,
  Tree036Step,
  renderTreeSvg,
} from './tree-036-037-shared';
import { COUNT_NODES_036_CODES, COUNT_NODES_036_LINES } from './tree-036-037-stage-codes';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';

// 6 个节点的完全二叉树 (h = 3)
const CBT_COUNT_NODES: TreeNode036[] = [
  { id: 1, val: 1, left: 2, right: 3 },
  { id: 2, val: 2, left: 4, right: 5 },
  { id: 3, val: 3, left: 6, right: null },
  { id: 4, val: 4, left: null, right: null },
  { id: 5, val: 5, left: null, right: null },
  { id: 6, val: 6, left: null, right: null },
];

export function buildCountNodes036Steps(): Tree036Step[] {
  const steps: Tree036Step[] = [];

  // Step 1: 入口
  steps.push({
    codeLine: COUNT_NODES_036_LINES.entry,
    decision: '启动完全二叉树 O((logN)^2) 节点计数',
    message: '利用满二叉树公式 2^k - 1 进行分支修剪，绝不遍历整棵树的每个节点！',
    log: 'countNodes(root = 1)',
    activeNodeId: 1,
    metrics: { '算法时间复杂度': 'O((log N)^2)', '普通遍历复杂度': 'O(N)' },
    statusBadge: { text: '算法启动', type: 'info' },
  });

  // Step 2: 测定整树总高度 h
  steps.push({
    codeLine: COUNT_NODES_036_LINES.calcHeight,
    decision: '测定总树高：从根节点 1 开始一路向左探索',
    message: '调用 mostLeft(root: 1, 1)，沿最左分支下潜，当前访问根节点 1 (深度 1)',
    log: 'mostLeft(1, 1) -> cur = 1, depth = 1',
    activeNodeId: 1,
    metrics: { '当前探测节点': 1, '当前深度': 1 },
    statusBadge: { text: '下潜深度: 1', type: 'info' },
  });

  steps.push({
    codeLine: COUNT_NODES_036_LINES.calcHeight,
    decision: '下潜至左孩子 2 (深度 2)',
    message: '沿左分支深入访问节点 2，深度递增至 2',
    log: 'mostLeft: cur = 2, depth = 2',
    activeNodeId: 2,
    metrics: { '当前探测节点': 2, '当前深度': 2 },
    statusBadge: { text: '下潜深度: 2', type: 'info' },
  });

  steps.push({
    codeLine: COUNT_NODES_036_LINES.calcHeight,
    decision: '下潜至最底层左孩子 4 (深度 3)',
    message: '深入到叶子节点 4，左孩子为空触底！确定整棵完全二叉树的总树高 h = 3',
    log: 'mostLeft: cur = 4, cur.left == null -> total height h = 3',
    activeNodeId: 4,
    metrics: { '总高度 h': 3, '触底叶子': 4 },
    statusBadge: { text: '测得总树高 h = 3', type: 'success' },
  });

  // Step 3: 探测根节点的右子树的最左分支能否到达 h=3
  steps.push({
    codeLine: COUNT_NODES_036_LINES.probeRight,
    decision: '探测右子树节点 3 的最左分支深度',
    message: '转入右子树：调用 mostLeft(node.right: 3, level: 2)，起点为节点 3 (深度 2)',
    log: 'probe right subtree: mostLeft(3, 2) -> start at node 3',
    activeNodeId: 3,
    metrics: { '当前探测起点': 3, '起点深度': 2 },
    statusBadge: { text: '探测右子树', type: 'warning' },
  });

  steps.push({
    codeLine: COUNT_NODES_036_LINES.probeRight,
    decision: '右子树向左下潜至节点 6 (深度 3)',
    message: '从节点 3 向左深入到节点 6，深度到达 3，等于总树高 h=3！判定：以 2 为根的左子树必为满二叉树！',
    log: 'mostLeft(3, 2) -> left child 6 (depth 3 == h: 3) -> left subtree is FULL!',
    activeNodeId: 6,
    secondaryNodeId: 3,
    metrics: { '右子树最左深度': 3, '总树高 h': 3, '判定': '深度 == h (左子树必为满二叉树)' },
    statusBadge: { text: '右侧触底 h=3', type: 'warning' },
  });

  // Step 4: 判定左子树为满树，直接公式求和
  steps.push({
    codeLine: COUNT_NODES_036_LINES.accumulateFullSubtree,
    decision: '左子树必为满树，公式直接计入 (1 << (3 - 1)) = 4 个节点',
    message: '因为右子树最左已经扎到最底层，说明以 2 为根的左子树一定是满二叉树！节点数（含根节点 1）直接通过 (1 << (h - level)) = 4 算出，转向右子树递归！',
    log: 'leftSubtree + root = 1 << (3 - 1) = 4, recurse right: count(node.right: 3, level: 2)',
    activeNodeId: 2,
    secondaryNodeId: 3,
    metrics: { '已确定节点数': 4, '剩余待求子树': '节点 3 的子树' },
    statusBadge: { text: '左满树累加 4 个', type: 'success' },
  });

  // Step 5: 递归处理右子树节点 3
  steps.push({
    codeLine: COUNT_NODES_036_LINES.probeRight,
    decision: '递归处理节点 3 (level = 2)',
    message: '节点 3 的右子树为空，无法到达第 3 层。右子树为满树 (高 0，节点 0 个)，计入 (1 << 0) = 1 (含节点 3 本身)，转向左孩子 6 递归',
    log: 'node 3: right is null -> add (1 << 0) = 1, recurse left (node 6)',
    activeNodeId: 3,
    secondaryNodeId: 6,
    metrics: { '累计节点数': 4 + 1, '当前处理': '节点 6' },
    statusBadge: { text: '处理右侧', type: 'warning' },
  });

  // Step 6: 节点 6 是叶子节点，返回 1
  steps.push({
    codeLine: COUNT_NODES_036_LINES.accumulateFullSubtree,
    decision: '节点 6 返回 1，递归归并全部节点数',
    message: '叶子节点 6 返回 1。右子树总节点数 = 1 + 1 = 2。全局总节点数 = 4 (左满树+根) + 2 (右子树) = 6！',
    log: 'node 6 returns 1; count(node 3) = 2; total = 4 + 2 = 6',
    activeNodeId: 6,
    metrics: { '最终节点总数': 6, '耗时对比': '仅探测 3 次左边界，无需遍历 6 次' },
    statusBadge: { text: '总数 = 6', type: 'success' },
  });

  // Step 7: 结束
  steps.push({
    codeLine: COUNT_NODES_036_LINES.finish,
    decision: '算法完成，返回 6',
    message: '完全二叉树节点计算圆满完成，在 O((logN)^2) 复杂度下精确得出答案: 6',
    log: 'return totalNodes: 6',
    activeNodeId: 1,
    metrics: { '最终结果': 6 },
    statusBadge: { text: '计算完成', type: 'success' },
  });

  return steps;
}

function renderCountNodesCanvas(container: HTMLElement, step: Tree036Step): void {
  const treeNodes = (step.extraData as any)?.treeNodes || CBT_COUNT_NODES;
  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 8px;">
      ${renderTreeSvg(treeNodes, step.activeNodeId, step.secondaryNodeId)}
    </div>
  `;
}

export const countCompleteTreeNodes036Visualizer = registerDeclarativeAlgorithm<Tree036Step>({
  id: 'tree-036-count-complete-tree-nodes',
  aliases: ['count-nodes'],
  name: '完全二叉树节点个数 (Class 036)',
  category: 'tree',
  icon: '🧮',
  difficulty: 2,
  levelOrder: 3609,
  learningGoal: '掌握完全二叉树右子树最左探测定界法，利用满树公式 2^k 实现 O((log N)^2) 极致递归剪枝',
  problemHtml: TREE_036_037_PROBLEMS.countCompleteTreeNodes036.html,
  codeLanguages: COUNT_NODES_036_CODES,
  inputs: [
    {
      "id": "tree",
      "label": "完全二叉树",
      "type": "text",
      "defaultValue": "1, 2, 3, 4, 5, 6",
      "width": "160px"
    }
  ],
  presets: [
    {
      "label": "示例 1 (6 节点)",
      "values": {
        "tree": "1, 2, 3, 4, 5, 6"
      },
      "description": "总高度 3，节点数 6"
    },
    {
      "label": "满二叉树 (7 节点)",
      "values": {
        "tree": "1, 2, 3, 4, 5, 6, 7"
      },
      "description": "左右皆满"
    },
    {
      "label": "单节点极限 (1 节点)",
      "values": {
        "tree": "1"
      },
      "description": "h=1"
    }
  ],

  generateSteps: (input?: any) => {
    const raw = String(input?.tree || '1, 2, 3, 4, 5, 6').trim();
    if (raw === '1') {
      const singleNodes: TreeNode036[] = [{ id: 1, val: 1, left: null, right: null, x: 200, y: 100 }];
      return [
        {
          codeLine: COUNT_NODES_036_LINES.entry,
          decision: '单节点完全二叉树：直接返回 1',
          message: '整树只有一个根节点，左右皆为空，总节点数 = 1',
          log: 'countNodes(root = 1) -> 1',
          activeNodeId: 1,
          metrics: { '算法时间复杂度': 'O(1)', '最终结果': 1 },
          statusBadge: { text: '单节点瞬时返回', type: 'success' },
          extraData: { treeNodes: singleNodes },
        },
      ];
    }
    if (raw.replace(/\s+/g, '') === '1,2,3,4,5,6,7') {
      const full7Nodes: TreeNode036[] = [
        { id: 1, val: 1, left: 2, right: 3 },
        { id: 2, val: 2, left: 4, right: 5 },
        { id: 3, val: 3, left: 6, right: 7 },
        { id: 4, val: 4, left: null, right: null },
        { id: 5, val: 5, left: null, right: null },
        { id: 6, val: 6, left: null, right: null },
        { id: 7, val: 7, left: null, right: null },
      ];
      return [
        {
          codeLine: COUNT_NODES_036_LINES.entry,
          decision: '启动 7 节点满二叉树探测',
          message: '探测完全二叉树节点个数，当前输入为 7 节点的完备满二叉树',
          log: 'countNodes(root = 1), 7 nodes full tree',
          activeNodeId: 1,
          metrics: { '总节点数': 7, '树高度': 3 },
          statusBadge: { text: '满二叉树', type: 'info' },
          extraData: { treeNodes: full7Nodes },
        },
        {
          codeLine: COUNT_NODES_036_LINES.calcHeight,
          decision: '一路向左测量总树高 h = 3',
          message: '从根节点 1 一路向左 1 -> 2 -> 4，测出总高度 h = 3',
          log: 'mostLeft(1) = 3',
          activeNodeId: 1,
          secondaryNodeId: 4,
          metrics: { '总高度 h': 3 },
          statusBadge: { text: '树高 h = 3', type: 'info' },
          extraData: { treeNodes: full7Nodes },
        },
        {
          codeLine: COUNT_NODES_036_LINES.probeRight,
          decision: '探测右子树节点 3 最左深度到达第 3 层',
          message: '右孩子 3 一路向左探测 3 -> 6 到达第 3 层，说明以 2 为根的左子树必为满二叉树！',
          log: 'mostLeft(node.right: 3) = 3 == h',
          activeNodeId: 3,
          secondaryNodeId: 6,
          metrics: { '右子树最左深度': 3, '总树高 h': 3 },
          statusBadge: { text: '右侧触底 h=3', type: 'warning' },
          extraData: { treeNodes: full7Nodes },
        },
        {
          codeLine: COUNT_NODES_036_LINES.accumulateFullSubtree,
          decision: '左满二叉树累加 4 个节点，转向右子树',
          message: '左子树累加 1 << (3 - 1) = 4 个节点（含根 1），继续向右递归计算节点 3',
          log: 'leftSubtree = 4, recurse right: node 3',
          activeNodeId: 2,
          secondaryNodeId: 3,
          metrics: { '已确定节点数': 4 },
          statusBadge: { text: '左满树累加 4', type: 'success' },
          extraData: { treeNodes: full7Nodes },
        },
        {
          codeLine: COUNT_NODES_036_LINES.finish,
          decision: '右子树同样为满二叉树 (3 个节点)，总数 4 + 3 = 7',
          message: '完全二叉树节点计算圆满完成，在 O((logN)^2) 复杂度下精确得出答案: 7',
          log: 'return totalNodes: 7',
          activeNodeId: 1,
          metrics: { '最终结果': 7 },
          statusBadge: { text: '计算完成 (7 节点)', type: 'success' },
          extraData: { treeNodes: full7Nodes },
        },
      ];
    }
    return buildCountNodes036Steps();
  },
  renderCanvas: (container, step) => renderCountNodesCanvas(container, step),
});
