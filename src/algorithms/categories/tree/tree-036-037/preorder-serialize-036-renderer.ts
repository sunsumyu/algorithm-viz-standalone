/**
 * 左程云算法通关课 Class 036: 二叉树先序序列化与反序列化 (Preorder Serialize & Deserialize / LeetCode 297)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  TreeNode036,
  Tree036Step,
  renderTreeSvg,
  renderQueuePipeline,
} from './tree-036-037-shared';
import { PREORDER_SERIALIZE_036_CODES, PREORDER_SERIALIZE_036_LINES } from './tree-036-037-stage-codes';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';

const SERIAL_TREE_NODES: TreeNode036[] = [
  { id: 1, val: 1, left: 2, right: 3 },
  { id: 2, val: 2, left: null, right: null },
  { id: 3, val: 3, left: 4, right: 5 },
  { id: 4, val: 4, left: null, right: null },
  { id: 5, val: 5, left: null, right: null },
];

export function buildPreorderSerialize036Steps(): Tree036Step[] {
  const steps: Tree036Step[] = [];

  // Step 1: 序列化入口
  steps.push({
    codeLine: PREORDER_SERIALIZE_036_LINES.serialEntry,
    decision: '启动先序深度优先序列化',
    message: '二叉树先序序列化：按 [根 -> 左 -> 右] 递归拼接字符串，空节点用 "#" 占位，节点间逗号分隔',
    log: 'serialize(root = 1), 初始串: ""',
    activeNodeId: 1,
    queue: [],
    metrics: { '当前阶段': '序列化', '已产生序列': '""' },
    statusBadge: { text: '序列化启动', type: 'info' },
  });

  // Step 2: 序列化根节点 1
  steps.push({
    codeLine: PREORDER_SERIALIZE_036_LINES.appendNode,
    decision: '记录根节点 1: 追加 "1,"',
    message: '访问根节点 1，将其值转为字符串追加进序列化串',
    log: 'append("1,")',
    activeNodeId: 1,
    queue: ['1'],
    metrics: { '当前节点': 1, '已产生序列': '"1,"' },
    statusBadge: { text: '记录根节点 1', type: 'info' },
  });

  // Step 3: 递归进入左孩子 2
  steps.push({
    codeLine: PREORDER_SERIALIZE_036_LINES.appendNode,
    decision: '递归进入左孩子 2: 追加 "2,"',
    message: '先序遍历左子树：访问节点 2，写入 "2,"',
    log: 'append("2,")',
    activeNodeId: 2,
    queue: ['1', '2'],
    metrics: { '当前节点': 2, '已产生序列': '"1,2,"' },
    statusBadge: { text: '记录节点 2', type: 'info' },
  });

  // Step 4: 节点 2 左空
  steps.push({
    codeLine: PREORDER_SERIALIZE_036_LINES.appendNode,
    decision: '节点 2 左孩子为空: 追加 "#,"',
    message: '节点 2 的左子树为空，写入占位符 "#,"',
    log: '2.left == null -> append("#,")',
    activeNodeId: 2,
    queue: ['1', '2', '#'],
    metrics: { '当前节点': 2, '已产生序列': '"1,2,#,"' },
    statusBadge: { text: '左空占位', type: 'warning' },
  });

  // Step 5: 节点 2 右空
  steps.push({
    codeLine: PREORDER_SERIALIZE_036_LINES.appendNode,
    decision: '节点 2 右孩子为空: 追加 "#,"',
    message: '节点 2 的右子树为空，写入占位符 "#,"。以 2 为根的子树全部序列化完成',
    log: '2.right == null -> append("#,")',
    activeNodeId: 2,
    queue: ['1', '2', '#', '#'],
    metrics: { '当前节点': 2, '已产生序列': '"1,2,#,#,"' },
    statusBadge: { text: '节点 2 完毕', type: 'success' },
  });

  // Step 6: 转向右孩子 3
  steps.push({
    codeLine: PREORDER_SERIALIZE_036_LINES.appendNode,
    decision: '回溯至根，递归进入右孩子 3: 追加 "3,"',
    message: '先序遍历右子树：访问节点 3，写入 "3,"',
    log: 'append("3,")',
    activeNodeId: 3,
    queue: ['1', '2', '#', '#', '3'],
    metrics: { '当前节点': 3, '已产生序列': '"1,2,#,#,3,"' },
    statusBadge: { text: '记录节点 3', type: 'info' },
  });

  // Step 7: 节点 3 左孩子 4
  steps.push({
    codeLine: PREORDER_SERIALIZE_036_LINES.appendNode,
    decision: '进入 3 的左孩子 4: 追加 "4,#,#,"',
    message: '访问叶子节点 4，写入 "4,"，其左右皆空追加两 "#,"',
    log: 'node 4 -> append("4,#,#,")',
    activeNodeId: 4,
    queue: ['1', '2', '#', '#', '3', '4', '#', '#'],
    metrics: { '当前节点': 4, '已产生序列': '"1,2,#,#,3,4,#,#,"' },
    statusBadge: { text: '记录节点 4', type: 'info' },
  });

  // Step 8: 节点 3 右孩子 5
  steps.push({
    codeLine: PREORDER_SERIALIZE_036_LINES.appendNode,
    decision: '进入 3 的右孩子 5: 追加 "5,#,#,"',
    message: '访问叶子节点 5，写入 "5,"，其左右皆空追加两 "#,"。整树序列化完成',
    log: 'node 5 -> append("5,#,#,")',
    activeNodeId: 5,
    queue: ['1', '2', '#', '#', '3', '4', '#', '#', '5', '#', '#'],
    metrics: { '当前阶段': '序列化完成', '序列化最终结果': '"1,2,#,#,3,4,#,#,5,#,#,"' },
    statusBadge: { text: '序列化完成', type: 'success' },
  });

  // Step 9: 反序列化启动
  const tokens = ['1', '2', '#', '#', '3', '4', '#', '#', '5', '#', '#'];
  steps.push({
    codeLine: PREORDER_SERIALIZE_036_LINES.deserialEntry,
    decision: '启动反序列化：Token 队列就绪',
    message: '切分字符串得到 11 个 Token，装载入重建消费队列',
    log: 'deserialize() -> queue: [1, 2, #, #, 3, 4, #, #, 5, #, #]',
    activeNodeId: null,
    queue: [...tokens],
    metrics: { '当前阶段': '反序列化', 'Token队列长度': tokens.length },
    statusBadge: { text: '反序列化队列', type: 'info' },
  });

  // Step 10: 弹出 1 创建根节点
  steps.push({
    codeLine: PREORDER_SERIALIZE_036_LINES.buildRecur,
    decision: '弹出 "1"，创建根节点 TreeNode(1)',
    message: '从队列头部取出 "1"，构建根节点 TreeNode(1)，继续递归构建其左右子树',
    log: 'poll: "1" -> new TreeNode(1), recurse build left',
    activeNodeId: 1,
    queue: ['2', '#', '#', '3', '4', '#', '#', '5', '#', '#'],
    metrics: { '已构建节点': 'TreeNode(1)', '剩余Tokens': 10 },
    statusBadge: { text: '创建根节点 1', type: 'info' },
  });

  // Step 11: 弹出 2 构建左子树
  steps.push({
    codeLine: PREORDER_SERIALIZE_036_LINES.buildRecur,
    decision: '弹出 "2" 构建 1.left = TreeNode(2)',
    message: '弹出 "2" 创建 TreeNode(2) 作为 1 的左孩子；接连弹出两个 "#" 完成 2 的左右空子树',
    log: 'poll: "2", "#", "#" -> 1.left = 2 (null, null)',
    activeNodeId: 2,
    queue: ['3', '4', '#', '#', '5', '#', '#'],
    metrics: { '已构建结构': '1 -> left: 2', '剩余Tokens': 7 },
    statusBadge: { text: '左子树还原', type: 'warning' },
  });

  // Step 12: 弹出 3 构建右子树
  steps.push({
    codeLine: PREORDER_SERIALIZE_036_LINES.buildRecur,
    decision: '弹出 "3" 构建 1.right = TreeNode(3)',
    message: '弹出 "3" 创建 TreeNode(3) 挂载到 1 的右侧；继续向下递归构建 3 的左右孩子',
    log: 'poll: "3" -> 1.right = 3',
    activeNodeId: 3,
    queue: ['4', '#', '#', '5', '#', '#'],
    metrics: { '已构建结构': '1 -> right: 3', '剩余Tokens': 6 },
    statusBadge: { text: '创建右节点 3', type: 'info' },
  });

  // Step 13: 弹出 4 和 5 完成整树重建
  steps.push({
    codeLine: PREORDER_SERIALIZE_036_LINES.buildRecur,
    decision: '还原叶子 4 和 5，整树无损重建完毕',
    message: '弹出 "4,#,#" 构建 3.left = 4；弹出 "5,#,#" 构建 3.right = 5。队列全部清空，整树拓扑 100% 还原！',
    log: 'poll: 4, 5 with leaves -> tree completely restored',
    activeNodeId: 1,
    queue: [],
    metrics: { '反序列化状态': '100% 结构拓扑无损还原', '最终根节点': 'TreeNode(1)' },
    statusBadge: { text: '还原完成', type: 'success' },
  });

  return steps;
}

function renderPreorderSerializeCanvas(container: HTMLElement, step: Tree036Step): void {
  const treeNodes = (step.extraData as any)?.treeNodes || SERIAL_TREE_NODES;
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 8px; gap: 8px;">
      ${renderTreeSvg(treeNodes, step.activeNodeId, step.secondaryNodeId)}
      ${step.queue ? renderQueuePipeline(step.queue, '序列化 / 反序列化 Token 队列流') : ''}
    </div>
  `;
}

export const preorderSerialize036Visualizer = registerDeclarativeAlgorithm<Tree036Step>({
  id: 'tree-036-preorder-serialize',
  name: '二叉树先序序列化与反序列化 (Class 036)',
  category: 'tree',
  icon: '📦',
  difficulty: 3,
  levelOrder: 3605,
  learningGoal: '掌握先序遍历占位符 (#) 序列化协议，深入理解基于 Token 递归队列无损重建二叉树的机制',
  problemHtml: TREE_036_037_PROBLEMS.preorderSerialize036.html,
  codeLanguages: PREORDER_SERIALIZE_036_CODES,
  inputs: [
    {
      "id": "tree",
      "label": "二叉树层序",
      "type": "text",
      "defaultValue": "1, 2, 3, null, null, 4, 5",
      "width": "160px"
    }
  ],
  presets: [
    {
      "label": "标准序列化示例",
      "values": {
        "tree": "1, 2, 3, null, null, 4, 5"
      },
      "description": "包含占位符 #"
    },
    {
      "label": "空树用例",
      "values": {
        "tree": "null"
      },
      "description": "序列化输出 \"#,\""
    },
    {
      "label": "单分支二叉树",
      "values": {
        "tree": "1, 2, null, 3"
      },
      "description": "连续 null 占位还原"
    }
  ],

  generateSteps: () => buildPreorderSerialize036Steps(),
  renderCanvas: (container, step) => renderPreorderSerializeCanvas(container, step),
});
