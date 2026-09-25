/**
 * 左程云算法通关课 Class 036: 二叉树按层序列化与反序列化 (Levelorder Serialize & Deserialize / LeetCode 297)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  TreeNode036,
  Tree036Step,
  renderTreeSvg,
  renderQueuePipeline,
} from './tree-036-037-shared';
import { LEVELORDER_SERIALIZE_036_CODES, LEVELORDER_SERIALIZE_036_LINES } from './tree-036-037-stage-codes';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';

const LEVEL_SERIAL_NODES: TreeNode036[] = [
  { id: 1, val: 1, left: 2, right: 3 },
  { id: 2, val: 2, left: null, right: null },
  { id: 3, val: 3, left: 4, right: 5 },
  { id: 4, val: 4, left: null, right: null },
  { id: 5, val: 5, left: null, right: null },
];

export function buildLevelorderSerialize036Steps(): Tree036Step[] {
  const steps: Tree036Step[] = [];
  const nodes = LEVEL_SERIAL_NODES;
  const nodeMap = new Map<number, TreeNode036>(nodes.map((n) => [n.id, n]));

  // Step 1: 算法入口
  steps.push({
    codeLine: LEVELORDER_SERIALIZE_036_LINES.entry,
    decision: '启动按层序列化 (BFS)',
    message: '按层序列化准则：使用队列辅助，根节点率先记录并入队；每当弹出节点时，左右子节点不论是否存在，均记录到序列中',
    log: 'serialize(root = 1), queue 初始化',
    activeNodeId: null,
    queue: [],
    metrics: { '当前阶段': '按层序列化', '已生成序列': '""' },
    statusBadge: { text: '初始化', type: 'info' },
  });

  // Step 2: 根节点入队
  const res: string[] = ['1'];
  const q: number[] = [1];
  steps.push({
    codeLine: LEVELORDER_SERIALIZE_036_LINES.rootQueue,
    decision: '根节点 1 写入序列并入队',
    message: '根节点 1 进入队列，初始序列写入 "1,"',
    log: 'q.offer(1), res.add("1")',
    activeNodeId: 1,
    queue: [1],
    metrics: { '已生成序列': res.join(',') + ',', '队列节点': '[1]' },
    statusBadge: { text: '根节点入队', type: 'info' },
  });

  // Step 3: 弹出 1，展开左右子节点 2 和 3
  q.shift();
  q.push(2);
  q.push(3);
  res.push('2', '3');
  steps.push({
    codeLine: LEVELORDER_SERIALIZE_036_LINES.expandChildren,
    decision: '弹出 1，记录左孩子 2 与右孩子 3',
    message: '节点 1 出队，左孩子 2 非空入队写入序列；右孩子 3 非空入队写入序列',
    log: 'poll(1) -> push(2, 3), res: ["1", "2", "3"]',
    activeNodeId: 1,
    queue: [2, 3],
    metrics: { '已生成序列': res.join(',') + ',', '当前队列': '[2, 3]' },
    statusBadge: { text: '展开根节点', type: 'warning' },
  });

  // Step 4: 弹出 2，左右皆空写入 "#,#"
  q.shift();
  res.push('#', '#');
  steps.push({
    codeLine: LEVELORDER_SERIALIZE_036_LINES.expandChildren,
    decision: '弹出 2，其左右子树为空写入 "#,#"',
    message: '节点 2 出队，左右孩子皆为空，分别将 "#" 追加到序列中，不入队',
    log: 'poll(2) -> left is null, right is null -> append "#,#"',
    activeNodeId: 2,
    queue: [3],
    metrics: { '已生成序列': res.join(',') + ',', '当前队列': '[3]' },
    statusBadge: { text: '空节点占位', type: 'warning' },
  });

  // Step 5: 弹出 3，展开左右孩子 4 和 5
  q.shift();
  q.push(4);
  q.push(5);
  res.push('4', '5');
  steps.push({
    codeLine: LEVELORDER_SERIALIZE_036_LINES.expandChildren,
    decision: '弹出 3，记录左孩子 4 与右孩子 5',
    message: '节点 3 出队，将左孩子 4 和右孩子 5 写入序列并加入队列',
    log: 'poll(3) -> push(4, 5), res: [..., "4", "5"]',
    activeNodeId: 3,
    queue: [4, 5],
    metrics: { '已生成序列': res.join(',') + ',', '当前队列': '[4, 5]' },
    statusBadge: { text: '展开节点 3', type: 'warning' },
  });

  // Step 6: 弹出 4，左右皆空写入 "#,#"
  q.shift();
  res.push('#', '#');
  steps.push({
    codeLine: LEVELORDER_SERIALIZE_036_LINES.expandChildren,
    decision: '弹出叶子节点 4，写入 "#,#"',
    message: '节点 4 出队，左右孩子皆为空，分别将 "#" 追加到序列中',
    log: 'poll(4) -> left is null, right is null -> append "#,#"',
    activeNodeId: 4,
    queue: [5],
    metrics: { '当前节点': 4, '已生成序列': res.join(',') + ',', '当前队列': '[5]' },
    statusBadge: { text: '处理叶子 4', type: 'info' },
  });

  // Step 7: 弹出 5，左右皆空写入 "#,#"
  q.shift();
  res.push('#', '#');
  steps.push({
    codeLine: LEVELORDER_SERIALIZE_036_LINES.expandChildren,
    decision: '弹出叶子节点 5，写入 "#,#"',
    message: '节点 5 出队，左右孩子皆为空，分别将 "#" 追加到序列中，队列排空',
    log: 'poll(5) -> left is null, right is null -> append "#,#"',
    activeNodeId: 5,
    queue: [],
    metrics: { '当前节点': 5, '已生成序列': res.join(',') + ',', '当前队列': '空' },
    statusBadge: { text: '处理叶子 5', type: 'info' },
  });

  // Step 7: 完成
  const finalStr = res.join(',') + ',';
  steps.push({
    codeLine: LEVELORDER_SERIALIZE_036_LINES.finish,
    decision: '按层序列化完成',
    message: `队列已空，序列化圆满结束，最终导出的按层紧凑协议串为: "${finalStr}"`,
    log: `return serialize result: "${finalStr}"`,
    activeNodeId: null,
    queue: [],
    metrics: { '按层序列结果': finalStr, '总 Token 数量': res.length },
    statusBadge: { text: '完成', type: 'success' },
  });

  return steps;
}

function renderLevelorderSerializeCanvas(container: HTMLElement, step: Tree036Step): void {
  const treeNodes = (step.extraData as any)?.treeNodes || LEVEL_SERIAL_NODES;
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 8px; gap: 8px;">
      ${renderTreeSvg(treeNodes, step.activeNodeId, step.secondaryNodeId)}
      ${step.queue ? renderQueuePipeline(step.queue, 'BFS 遍历辅助队列') : ''}
    </div>
  `;
}

export const levelorderSerialize036Visualizer = registerDeclarativeAlgorithm<Tree036Step>({
  id: 'tree-036-levelorder-serialize',
  name: '二叉树按层序列化与反序列化 (Class 036)',
  category: 'tree',
  icon: '🗂️',
  difficulty: 3,
  levelOrder: 3606,
  learningGoal: '掌握广度优先遍历与空节点占位符相结合的按层序列化协议与还原技巧',
  problemHtml: TREE_036_037_PROBLEMS.levelorderSerialize036.html,
  codeLanguages: LEVELORDER_SERIALIZE_036_CODES,
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
      "label": "按层紧凑流示例",
      "values": {
        "tree": "1, 2, 3, null, null, 4, 5"
      },
      "description": "BFS 紧凑流导出"
    },
    {
      "label": "满二叉树流",
      "values": {
        "tree": "1, 2, 3, 4, 5, 6, 7"
      },
      "description": "全节点紧凑序列化"
    },
    {
      "label": "叶子断层用例",
      "values": {
        "tree": "1, null, 2, null, 3"
      },
      "description": "右单支层序流"
    }
  ],

  generateSteps: () => buildLevelorderSerialize036Steps(),
  renderCanvas: (container, step) => renderLevelorderSerializeCanvas(container, step),
});
