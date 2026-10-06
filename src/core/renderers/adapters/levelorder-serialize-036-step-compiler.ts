/**
 * Levelorder Serialize & Deserialize Step Compiler (Class 036 Code05 / LeetCode 297)
 *
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范。
 * 负责二叉树按层广度优先序列化与队列流状态推演。
 */

import { TreeNode036, Tree036Step } from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-shared';
import { LEVELORDER_SERIALIZE_036_LINES } from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-stage-codes';

export const LEVEL_SERIAL_NODES: TreeNode036[] = [
  { id: 1, val: 1, left: 2, right: 3 },
  { id: 2, val: 2, left: null, right: null },
  { id: 3, val: 3, left: 4, right: 5 },
  { id: 4, val: 4, left: null, right: null },
  { id: 5, val: 5, left: null, right: null },
];

export function buildLevelorderSerialize036Steps(): Tree036Step[] {
  const steps: Tree036Step[] = [];

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

  // Step 8: 完成
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
