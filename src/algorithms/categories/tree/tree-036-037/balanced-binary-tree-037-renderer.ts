/**
 * 左程云算法通关课 Class 037: 判断平衡二叉树 (Balanced Binary Tree / LeetCode 110)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  TreeNode036,
  Tree036Step,
  renderTreeSvg,
} from './tree-036-037-shared';
import { BALANCED_TREE_037_CODES, BALANCED_TREE_037_LINES } from './tree-036-037-stage-codes';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';

// 经典二叉树: 3 -> 左 9, 右 20 -> (15, 7)
const BALANCED_TREE_NODES: TreeNode036[] = [
  { id: 1, val: 3, left: 2, right: 3 },
  { id: 2, val: 9, left: null, right: null },
  { id: 3, val: 20, left: 4, right: 5 },
  { id: 4, val: 15, left: null, right: null },
  { id: 5, val: 7, left: null, right: null },
];

// 非平衡单侧拉长树: 1 -> 左 2 -> 左 3 -> 4, 4; 右 2
const UNBALANCED_TREE_NODES: TreeNode036[] = [
  { id: 1, val: 1, left: 2, right: 3, x: 200, y: 35 },
  { id: 2, val: 2, left: 4, right: 5, x: 120, y: 95 },
  { id: 3, val: 2, left: null, right: null, x: 280, y: 95 },
  { id: 4, val: 3, left: 6, right: 7, x: 70, y: 155 },
  { id: 5, val: 3, left: null, right: null, x: 150, y: 155 },
  { id: 6, val: 4, left: null, right: null, x: 40, y: 215 },
  { id: 7, val: 4, left: null, right: null, x: 90, y: 215 },
];

const SINGLE_BALANCED_NODES: TreeNode036[] = [
  { id: 1, val: 1, left: null, right: null, x: 200, y: 100 },
];

export function buildBalancedTree037Steps(treeRaw?: string): Tree036Step[] {
  const raw = (treeRaw || '').trim().replace(/\s+/g, '');

  // 预设 2: 非平衡单侧拉长
  if (raw.includes('1,2,2,3,3') || raw.includes('4,4')) {
    const steps: Tree036Step[] = [];
    const tNodes = UNBALANCED_TREE_NODES;

    steps.push({
      codeLine: BALANCED_TREE_037_LINES.entry,
      decision: '启动平衡性检测 (非平衡偏斜用例)',
      message: '当前二叉树左侧持续拉长，右侧深度极浅，利用 Info(isBalanced, height) 套路检验',
      log: 'isBalanced(root: 1), 单侧偏斜用例',
      activeNodeId: 1,
      metrics: { '套路结构体': 'Info { isBalanced, height }', '平衡条件': '|左高 - 右高| <= 1' },
      statusBadge: { text: '套路启动', type: 'info' },
      extraData: { treeNodes: tNodes },
    });

    steps.push({
      codeLine: BALANCED_TREE_037_LINES.baseCheck,
      decision: '底层叶子节点 4 返回 Info(true, 1)',
      message: '深度优先下潜到最底层节点 4，左右为空，返回 (height: 1, isBalanced: true)',
      log: 'node 4: Info(true, 1)',
      activeNodeId: 6,
      secondaryNodeId: 7,
      metrics: { '底层叶子高度': 1, '局部平衡性': 'TRUE' },
      statusBadge: { text: '叶子节点平衡', type: 'info' },
      extraData: { treeNodes: tNodes },
    });

    steps.push({
      codeLine: BALANCED_TREE_037_LINES.aggregateInfo,
      decision: '节点 3 汇聚左右叶子，高度到达 2',
      message: '节点 3：左右子树高度为 1，高度差 0，自身高度 = max(1, 1) + 1 = 2',
      log: 'node 3: Info(true, 2)',
      activeNodeId: 4,
      metrics: { '节点 3 高度': 2, '局部平衡性': 'TRUE' },
      statusBadge: { text: '节点 3 高度: 2', type: 'info' },
      extraData: { treeNodes: tNodes },
    });

    steps.push({
      codeLine: BALANCED_TREE_037_LINES.aggregateInfo,
      decision: '节点 2 汇聚子树，左高度 2，右高度 1，自身高度到达 3',
      message: '节点 2：左高度 2，右高度 1，高度差 |2 - 1| = 1 <= 1。自身高度 = 3',
      log: 'node 2: Info(true, 3)',
      activeNodeId: 2,
      secondaryNodeId: 4,
      metrics: { '左主干高度': 3, '局部平衡性': 'TRUE' },
      statusBadge: { text: '节点 2 高度: 3', type: 'warning' },
      extraData: { treeNodes: tNodes },
    });

    steps.push({
      codeLine: BALANCED_TREE_037_LINES.baseCheck,
      decision: '探测右侧节点 2 (叶子)，高度为 1',
      message: '根节点的右孩子 2 左右皆空，返回 Info(true, 1)',
      log: 'right child 2: Info(true, 1)',
      activeNodeId: 3,
      metrics: { '右子树高度': 1, '右侧平衡性': 'TRUE' },
      statusBadge: { text: '右侧高度: 1', type: 'info' },
      extraData: { treeNodes: tNodes },
    });

    steps.push({
      codeLine: BALANCED_TREE_037_LINES.returnInfo,
      decision: '根节点 1 汇聚：左高 3，右高 1，高度差 2 > 1，触发严重失衡！',
      message: '根节点 1：左子树高度为 3，右子树高度为 1。高度差 |3 - 1| = 2 > 1！左神铁律：只要出现一次失衡，整树直接判定为非平衡！返回 Info(false, -1)',
      log: 'root 1: leftHeight = 3, rightHeight = 1 -> diff = 2 > 1 -> UNBALANCED!',
      activeNodeId: 1,
      secondaryNodeId: 2,
      metrics: { '整树左高': 3, '整树右高': 1, '高度差': 2, '整树平衡判定': '⚡ FALSE (严重失衡)' },
      statusBadge: { text: '判定失衡: FALSE', type: 'danger' },
      extraData: { treeNodes: tNodes },
    });

    return steps;
  }

  // 预设 3: 单节点
  if (raw === '1') {
    const singleNodes = SINGLE_BALANCED_NODES;
    return [
      {
        codeLine: BALANCED_TREE_037_LINES.entry,
        decision: '单节点二叉树平衡判定',
        message: '整树仅含单个根节点 1，左右孩子皆为空',
        log: 'isBalanced(root: 1), 单节点',
        activeNodeId: 1,
        metrics: { '整树左高': 0, '整树右高': 0, '整树平衡判定': 'TRUE (高度 1)' },
        statusBadge: { text: '单节点平衡: TRUE', type: 'success' },
        extraData: { treeNodes: singleNodes },
      },
    ];
  }

  // 默认: 标准平衡二叉树
  const steps: Tree036Step[] = [];
  const tNodes = BALANCED_TREE_NODES;

  // Step 1: 算法入口
  steps.push({
    codeLine: BALANCED_TREE_037_LINES.entry,
    decision: '启动平衡二叉树递归信息套路判定',
    message: '二叉树递归套路核心：定义结构体 Info { isBalanced, height }，向左子树要信息，向右子树要信息，最后在本层完成整合',
    log: 'isBalanced(root: 3), 调用 process(root)',
    activeNodeId: 1,
    metrics: { '套路结构体': 'Info { isBalanced, height }', '平衡条件': '|左高 - 右高| <= 1' },
    statusBadge: { text: '套路启动', type: 'info' },
    extraData: { treeNodes: tNodes },
  });

  // Step 2: 叶子节点 9 的判定
  steps.push({
    codeLine: BALANCED_TREE_037_LINES.baseCheck,
    decision: '节点 9 为叶子节点，返回平衡信息',
    message: '访问节点 9，其左右子节点为空（返回 height: 0, isBalanced: true），整合节点 9: height = 1, isBalanced = true',
    log: 'node 9: left = (0, T), right = (0, T) -> return Info(true, 1)',
    activeNodeId: 2,
    metrics: { '节点 9 高度': 1, '节点 9 平衡性': 'TRUE' },
    statusBadge: { text: '节点 9 平衡', type: 'info' },
    extraData: { treeNodes: tNodes },
  });

  // Step 3: 叶子节点 15 的判定
  steps.push({
    codeLine: BALANCED_TREE_037_LINES.baseCheck,
    decision: '叶子节点 15 返回平衡信息 Info(true, 1)',
    message: '访问叶子节点 15，左右子树皆为空，整合返回 (height: 1, isBalanced: true)',
    log: 'node 15: left = (0, T), right = (0, T) -> return Info(true, 1)',
    activeNodeId: 4,
    metrics: { '当前节点': 15, '节点 15 高度': 1, '节点 15 平衡性': 'TRUE' },
    statusBadge: { text: '节点 15 平衡', type: 'info' },
    extraData: { treeNodes: tNodes },
  });

  // Step 4: 叶子节点 7 的判定
  steps.push({
    codeLine: BALANCED_TREE_037_LINES.baseCheck,
    decision: '叶子节点 7 返回平衡信息 Info(true, 1)',
    message: '访问叶子节点 7，左右子树皆为空，整合返回 (height: 1, isBalanced: true)',
    log: 'node 7: left = (0, T), right = (0, T) -> return Info(true, 1)',
    activeNodeId: 5,
    metrics: { '当前节点': 7, '节点 7 高度': 1, '节点 7 平衡性': 'TRUE' },
    statusBadge: { text: '节点 7 平衡', type: 'info' },
    extraData: { treeNodes: tNodes },
  });

  // Step 5: 节点 20 汇聚左右信息
  steps.push({
    codeLine: BALANCED_TREE_037_LINES.aggregateInfo,
    decision: '节点 20 汇聚左右子树信息',
    message: '节点 20：左高 1，右高 1，高度差 |1 - 1| = 0 <= 1，且左右子树皆平衡。返回 Info(true, height: 2)',
    log: 'node 20: l = (T, 1), r = (T, 1) -> diff = 0 -> return Info(true, 2)',
    activeNodeId: 3,
    secondaryNodeId: 4,
    metrics: { '节点 20 左高': 1, '节点 20 右高': 1, '节点 20 自身高度': 2, '节点 20 平衡性': 'TRUE' },
    statusBadge: { text: '节点 20 平衡', type: 'warning' },
    extraData: { treeNodes: tNodes },
  });

  // Step 6: 根节点 3 汇聚全树信息
  steps.push({
    codeLine: BALANCED_TREE_037_LINES.returnInfo,
    decision: '根节点 3 汇聚全树平衡状态',
    message: '根节点 3：左子树 9 高度为 1，右子树 20 高度为 2。高度差 |1 - 2| = 1 <= 1。左子树平衡且右子树平衡，整棵树为平衡二叉树！',
    log: 'node 3: l = (T, 1), r = (T, 2) -> diff = 1 <= 1 -> return Info(true, 3)',
    activeNodeId: 1,
    secondaryNodeId: 3,
    metrics: { '整树左高': 1, '整树右高': 2, '整树最大高度': 3, '整树平衡判定': 'TRUE (高度差 1)' },
    statusBadge: { text: '全树平衡: TRUE', type: 'success' },
    extraData: { treeNodes: tNodes },
  });

  return steps;
}

function renderBalancedTreeCanvas(container: HTMLElement, step: Tree036Step): void {
  const treeNodes = (step.extraData as any)?.treeNodes || BALANCED_TREE_NODES;
  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 8px;">
      ${renderTreeSvg(treeNodes, step.activeNodeId, step.secondaryNodeId)}
    </div>
  `;
}

export const balancedBinaryTree037Visualizer = registerDeclarativeAlgorithm<Tree036Step>({
  id: 'tree-037-balanced-binary-tree',
  aliases: ['balanced'],
  name: '判断平衡二叉树 (Class 037)',
  category: 'tree',
  icon: '⚖️',
  difficulty: 1,
  levelOrder: 3704,
  learningGoal: '掌握左神二叉树递归套路黄金模板，构建 Info 结构体优雅自底向上汇聚高度与平衡性',
  problemHtml: TREE_036_037_PROBLEMS.balancedBinaryTree037.html,
  codeLanguages: BALANCED_TREE_037_CODES,
  inputs: [
    {
      "id": "tree",
      "label": "二叉树层序",
      "type": "text",
      "defaultValue": "3, 9, 20, null, null, 15, 7",
      "width": "160px"
    }
  ],
  presets: [
    {
      "label": "平衡树示例 (True)",
      "values": {
        "tree": "3, 9, 20, null, null, 15, 7"
      }
    },
    {
      "label": "非平衡单侧拉长 (False)",
      "values": {
        "tree": "1, 2, 2, 3, 3, null, null, 4, 4"
      }
    },
    {
      "label": "单节点平衡树 (True)",
      "values": {
        "tree": "1"
      }
    }
  ],

  generateSteps: (inputs) => buildBalancedTree037Steps(inputs?.tree),
  renderCanvas: (container, step) => renderBalancedTreeCanvas(container, step),
});
