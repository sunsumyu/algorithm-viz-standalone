/**
 * 左程云算法通关课 Class 037: 打家劫舍 III (House Robber III / LeetCode 337)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  TreeNode036,
  Tree036Step,
  renderTreeSvg,
} from './tree-036-037-shared';
import { HOUSE_ROBBER_III_037_CODES, HOUSE_ROBBER_III_037_LINES } from './tree-036-037-stage-codes';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';

// 经典二叉树: 根 3 -> 左 2 (右 3), 右 3 (右 1)
const ROB_TREE_NODES: TreeNode036[] = [
  { id: 1, val: 3, left: 2, right: 3 },
  { id: 2, val: 2, left: null, right: 4 },
  { id: 3, val: 3, left: null, right: 5 },
  { id: 4, val: 3, left: null, right: null },
  { id: 5, val: 1, left: null, right: null },
];

const ROB_TREE_NODES_EX2: TreeNode036[] = [
  { id: 1, val: 3, left: 2, right: 3, x: 200, y: 35 },
  { id: 2, val: 4, left: 4, right: 5, x: 100, y: 95 },
  { id: 3, val: 5, left: null, right: 6, x: 300, y: 95 },
  { id: 4, val: 1, left: null, right: null, x: 60, y: 155 },
  { id: 5, val: 3, left: null, right: null, x: 140, y: 155 },
  { id: 6, val: 1, left: null, right: null, x: 340, y: 155 },
];

const ROB_SINGLE_NODE: TreeNode036[] = [
  { id: 1, val: 10, left: null, right: null, x: 200, y: 100 },
];

export function buildHouseRobberIII037Steps(treeRaw?: string): Tree036Step[] {
  const raw = (treeRaw || '').trim().replace(/\s+/g, '');

  // 预设 2: 不偷根最优 (Ans=9)
  if (raw.includes('3,4,5,1,3') || raw.includes('4,5')) {
    const steps: Tree036Step[] = [];
    const tNodes = ROB_TREE_NODES_EX2;

    steps.push({
      codeLine: HOUSE_ROBBER_III_037_LINES.entry,
      decision: '启动打家劫舍 III 树形 DP (示例 2: 不偷根最优)',
      message: '二叉树树形 DP 状态设计：每个节点返回 [notRob, robCur]。向左右要信息，父子互斥转移',
      log: 'rob(root: 3), 调用 dp(root)',
      activeNodeId: 1,
      metrics: { '树形DP状态定义': '[不偷最大收益, 偷当前最大收益]', '父子约束': '若偷父，必不偷子' },
      statusBadge: { text: '树形DP启动', type: 'info' },
      extraData: { treeNodes: tNodes },
    });

    steps.push({
      codeLine: HOUSE_ROBBER_III_037_LINES.baseCheck,
      decision: '叶子节点 4 (金额 1) 的决策',
      message: '节点 4 左右为空：若不偷收益为 0；若偷收益为 1。返回状态 [0, 1]',
      log: 'dp(4) -> [notRob: 0, rob: 1]',
      activeNodeId: 4,
      metrics: { '节点 4 不偷': 0, '节点 4 偷': 1 },
      statusBadge: { text: '叶子 4: [0, 1]', type: 'info' },
      extraData: { treeNodes: tNodes },
    });

    steps.push({
      codeLine: HOUSE_ROBBER_III_037_LINES.baseCheck,
      decision: '叶子节点 5 (金额 3) 的决策',
      message: '节点 5 左右为空：若不偷收益为 0；若偷收益为 3。返回状态 [0, 3]',
      log: 'dp(5) -> [notRob: 0, rob: 3]',
      activeNodeId: 5,
      metrics: { '节点 5 不偷': 0, '节点 5 偷': 3 },
      statusBadge: { text: '叶子 5: [0, 3]', type: 'info' },
      extraData: { treeNodes: tNodes },
    });

    steps.push({
      codeLine: HOUSE_ROBBER_III_037_LINES.robCur,
      decision: '节点 2 (金额 4) 汇聚子节点 4 与 5',
      message: '节点 2：偷 2 收益 = 4 + 0 + 0 = 4；不偷 2 收益 = max(0, 1) + max(0, 3) = 4。返回状态 [4, 4]',
      log: 'dp(2) -> notRob = 1 + 3 = 4; rob = 4 -> [4, 4]',
      activeNodeId: 2,
      secondaryNodeId: 4,
      metrics: { '节点 2 不偷收益': 4, '节点 2 偷收益': 4, '最优收益': 4 },
      statusBadge: { text: '节点 2 决策: [4, 4]', type: 'warning' },
      extraData: { treeNodes: tNodes },
    });

    steps.push({
      codeLine: HOUSE_ROBBER_III_037_LINES.baseCheck,
      decision: '叶子节点 6 (金额 1) 的决策',
      message: '节点 6 左右为空：返回状态 [0, 1]',
      log: 'dp(6) -> [notRob: 0, rob: 1]',
      activeNodeId: 6,
      metrics: { '节点 6 不偷': 0, '节点 6 偷': 1 },
      statusBadge: { text: '叶子 6: [0, 1]', type: 'info' },
      extraData: { treeNodes: tNodes },
    });

    steps.push({
      codeLine: HOUSE_ROBBER_III_037_LINES.robCur,
      decision: '节点 3 (右孩子, 金额 5) 汇聚子节点 6',
      message: '节点 3：偷 3 收益 = 5 + 0 = 5；不偷 3 收益 = max(0, 1) = 1。返回状态 [1, 5]',
      log: 'dp(3) -> notRob = 1; rob = 5 -> [1, 5]',
      activeNodeId: 3,
      secondaryNodeId: 6,
      metrics: { '节点 3 不偷收益': 1, '节点 3 偷收益': 5, '最优收益': 5 },
      statusBadge: { text: '节点 3 决策: [1, 5]', type: 'warning' },
      extraData: { treeNodes: tNodes },
    });

    steps.push({
      codeLine: HOUSE_ROBBER_III_037_LINES.notRob,
      decision: '根节点 3 (金额 3) 最终状态大汇聚',
      message: '根节点 3：\n- 偷根节点: 3 + l.notRob(4) + r.notRob(1) = 8\n- 不偷根节点: max(4, 4) + max(1, 5) = 4 + 5 = 9！\n不偷根节点收益更高 (9 > 8)！',
      log: 'root 3: rob = 3 + 4 + 1 = 8; notRob = 4 + 5 = 9 -> [9, 8]',
      activeNodeId: 1,
      secondaryNodeId: 2,
      metrics: { '根节点偷收益': 8, '根节点不偷收益': 9, '最优选择': '不偷根节点 (收益 9)' },
      statusBadge: { text: '根节点汇聚: [9, 8]', type: 'warning' },
      extraData: { treeNodes: tNodes },
    });

    steps.push({
      codeLine: HOUSE_ROBBER_III_037_LINES.returnMax,
      decision: '取根节点最优决策 max(9, 8) = 9',
      message: '全树遍历完毕，不偷根节点时最大可获得金额 9 (偷左孩子 4 与右孩子 5)',
      log: 'return Math.max(9, 8) = 9',
      activeNodeId: 1,
      metrics: { '全树最优窃取金额': 9, '被选中的节点': '节点 4 (金额 4) + 节点 5 (金额 5)' },
      statusBadge: { text: '最大金额 = 9', type: 'success' },
      extraData: { treeNodes: tNodes },
    });

    return steps;
  }

  // 预设 3: 单节点抢劫
  if (raw === '10') {
    const steps: Tree036Step[] = [];
    const tNodes = ROB_SINGLE_NODE;

    steps.push({
      codeLine: HOUSE_ROBBER_III_037_LINES.entry,
      decision: '启动打家劫舍 III 树形 DP (单节点)',
      message: '单节点树，无需递归子节点',
      log: 'rob(root: 10)',
      activeNodeId: 1,
      metrics: { '树形DP状态定义': '[不偷最大收益, 偷当前最大收益]' },
      statusBadge: { text: '树形DP启动', type: 'info' },
      extraData: { treeNodes: tNodes },
    });

    steps.push({
      codeLine: HOUSE_ROBBER_III_037_LINES.baseCheck,
      decision: '单节点 10 的 DP 状态 [0, 10]',
      message: '若不偷收益为 0；若偷收益为 10。返回状态 [0, 10]',
      log: 'dp(10) -> [notRob: 0, rob: 10]',
      activeNodeId: 1,
      metrics: { '不偷': 0, '偷': 10 },
      statusBadge: { text: '单节点决策: [0, 10]', type: 'info' },
      extraData: { treeNodes: tNodes },
    });

    steps.push({
      codeLine: HOUSE_ROBBER_III_037_LINES.returnMax,
      decision: '取最优决策 max(0, 10) = 10',
      message: '直接偷单节点 10，获得最大金额 10',
      log: 'return 10',
      activeNodeId: 1,
      metrics: { '全树最优窃取金额': 10 },
      statusBadge: { text: '最大金额 = 10', type: 'success' },
      extraData: { treeNodes: tNodes },
    });

    return steps;
  }

  // 预设 1: 经典二叉树 (Ans = 7)
  const steps: Tree036Step[] = [];
  const tNodes = ROB_TREE_NODES;

  // Step 1: 入口
  steps.push({
    codeLine: HOUSE_ROBBER_III_037_LINES.entry,
    decision: '启动打家劫舍 III 树形 DP',
    message: '二叉树树形 DP 状态设计：每个节点返回元组 [notRob, robCur]。向左右要信息，根据父子互斥原则完成状态转移',
    log: 'rob(root: 3), 调用 dp(root)',
    activeNodeId: 1,
    metrics: { '树形DP状态定义': '[不偷最大收益, 偷当前最大收益]', '父子约束': '若偷父，必不偷子' },
    statusBadge: { text: '树形DP启动', type: 'info' },
    extraData: { treeNodes: tNodes },
  });

  // Step 2: 叶子节点 4 (val=3) 的 DP 状态
  steps.push({
    codeLine: HOUSE_ROBBER_III_037_LINES.baseCheck,
    decision: '叶子节点 4 (金额 3) 的决策',
    message: '节点 4 左右为空：若不偷收益为 0；若偷收益为 3 + 0 + 0 = 3。返回状态 [0, 3]',
    log: 'dp(4) -> [notRob: 0, rob: 3]',
    activeNodeId: 4,
    metrics: { '节点 4 不偷': 0, '节点 4 偷': 3, '节点 4 最优': 3 },
    statusBadge: { text: '叶子节点 4: [0, 3]', type: 'info' },
    extraData: { treeNodes: tNodes },
  });

  // Step 3: 节点 2 (val=2) 状态转移
  steps.push({
    codeLine: HOUSE_ROBBER_III_037_LINES.robCur,
    decision: '节点 2 (金额 2) 汇聚子节点 4',
    message: '节点 2：若偷当前，子节点 4 必不能偷，收益 = 2 + 0 = 2；若不偷当前，子节点 4 取最优 max(0, 3) = 3。返回状态 [3, 2]',
    log: 'dp(2) -> notRob = max(0, 3) = 3; rob = 2 + 0 = 2 -> [3, 2]',
    activeNodeId: 2,
    secondaryNodeId: 4,
    metrics: { '节点 2 不偷收益': 3, '节点 2 偷收益': 2, '决策倾向': '不偷 2 偷其子节点 4 收益更高' },
    statusBadge: { text: '节点 2 决策: [3, 2]', type: 'warning' },
    extraData: { treeNodes: tNodes },
  });

  // Step 4: 叶子节点 5 (val=1) 的 DP 状态
  steps.push({
    codeLine: HOUSE_ROBBER_III_037_LINES.baseCheck,
    decision: '叶子节点 5 (金额 1) 的决策',
    message: '节点 5 为叶子节点：返回状态 [0, 1]',
    log: 'dp(5) -> [notRob: 0, rob: 1]',
    activeNodeId: 5,
    metrics: { '节点 5 不偷': 0, '节点 5 偷': 1 },
    statusBadge: { text: '叶子节点 5: [0, 1]', type: 'info' },
    extraData: { treeNodes: tNodes },
  });

  // Step 5: 节点 3 (右孩子, val=3) 状态转移
  steps.push({
    codeLine: HOUSE_ROBBER_III_037_LINES.notRob,
    decision: '右孩子节点 3 (金额 3) 汇聚子节点 5',
    message: '右孩子 3：若偷收益 = 3 + 0 = 3；若不偷收益 = max(0, 1) = 1。返回状态 [1, 3]',
    log: 'dp(3_right) -> notRob = 1; rob = 3 + 0 = 3 -> [1, 3]',
    activeNodeId: 3,
    secondaryNodeId: 5,
    metrics: { '右孩子 3 不偷': 1, '右孩子 3 偷': 3 },
    statusBadge: { text: '右节点 3: [1, 3]', type: 'warning' },
    extraData: { treeNodes: tNodes },
  });

  // Step 6: 根节点 3 (val=3) 最终大汇聚
  steps.push({
    codeLine: HOUSE_ROBBER_III_037_LINES.robCur,
    decision: '根节点 3 汇聚全树，状态转移',
    message: '根节点 3：\n- 偷根节点: 3 + l.notRob(3) + r.notRob(1) = 7\n- 不偷根节点: max(3, 2) + max(1, 3) = 3 + 3 = 6',
    log: 'root 3: rob = 3 + 3 + 1 = 7; notRob = max(3,2) + max(1,3) = 6 -> [6, 7]',
    activeNodeId: 1,
    secondaryNodeId: 2,
    metrics: { '根节点偷收益': 7, '根节点不偷收益': 6, '最优选择': '偷根节点 (收益 7)' },
    statusBadge: { text: '根节点大汇聚: [6, 7]', type: 'warning' },
    extraData: { treeNodes: tNodes },
  });

  // Step 7: 返回最终结果
  steps.push({
    codeLine: HOUSE_ROBBER_III_037_LINES.returnMax,
    decision: '取根节点最优决策 max(6, 7) = 7',
    message: '全树遍历完毕，偷根节点时最大可获得金额 7 (偷节点 1 + 节点 4 + 节点 3右 舍弃节点2)',
    log: 'return Math.max(6, 7) = 7',
    activeNodeId: 1,
    metrics: { '全树最优窃取金额': 7, '被选中的节点': '根节点 3 (val=3) + 叶节点 4 (val=3) + 右节点 (val=1)' },
    statusBadge: { text: '最大金额 = 7', type: 'success' },
    extraData: { treeNodes: tNodes },
  });

  return steps;
}

function renderHouseRobberIIICanvas(container: HTMLElement, step: Tree036Step): void {
  const treeNodes = (step.extraData as any)?.treeNodes || ROB_TREE_NODES;
  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 8px;">
      ${renderTreeSvg(treeNodes, step.activeNodeId, step.secondaryNodeId)}
    </div>
  `;
}

export const houseRobberIII037Visualizer = registerDeclarativeAlgorithm<Tree036Step>({
  id: 'tree-037-house-robber-iii',
  name: '打家劫舍 III 树形DP (Class 037)',
  category: 'tree',
  icon: '💰',
  difficulty: 2,
  levelOrder: 3707,
  learningGoal: '领会树形动态规划经典互斥状态设计 [notRob, robCur]，掌握后序遍历自底向上的状态转移方程推导',
  problemHtml: TREE_036_037_PROBLEMS.houseRobberIII037.html,
  codeLanguages: HOUSE_ROBBER_III_037_CODES,
  inputs: [
    {
      "id": "tree",
      "label": "二叉树层序",
      "type": "text",
      "defaultValue": "3, 2, 3, null, 3, null, 1",
      "width": "160px"
    }
  ],
  presets: [
    {
      "label": "示例 1 (偷根最优 Ans=7)",
      "values": {
        "tree": "3, 2, 3, null, 3, null, 1"
      }
    },
    {
      "label": "示例 2 (不偷根最优 Ans=9)",
      "values": {
        "tree": "3, 4, 5, 1, 3, null, 1"
      }
    },
    {
      "label": "单节点抢劫",
      "values": {
        "tree": "10"
      }
    }
  ],

  generateSteps: (inputs) => buildHouseRobberIII037Steps(inputs?.tree),
  renderCanvas: (container, step) => renderHouseRobberIIICanvas(container, step),
});
