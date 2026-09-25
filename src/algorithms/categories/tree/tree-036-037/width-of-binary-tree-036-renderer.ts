/**
 * 左程云算法通关课 Class 036: 二叉树最大宽度 (Width of Binary Tree / LeetCode 662)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  TreeNode036,
  Tree036Step,
  renderTreeSvg,
  renderQueuePipeline,
} from './tree-036-037-shared';
import { WIDTH_036_CODES, WIDTH_036_LINES } from './tree-036-037-stage-codes';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';

// 经典非满树：根 1 (id=1, val=1) -> 左 3 (id=2, val=3) -> 左 5 (id=4, val=5), 右 3 (id=5, val=3)
// 右 2 (id=3, val=2) -> 右 9 (id=7, val=9)
const WIDTH_TREE_NODES: TreeNode036[] = [
  { id: 1, val: 1, left: 2, right: 3 },
  { id: 2, val: 3, left: 4, right: 5 },
  { id: 3, val: 2, left: null, right: 7 },
  { id: 4, val: 5, left: null, right: null },
  { id: 5, val: 3, left: null, right: null },
  { id: 7, val: 9, left: null, right: null },
];

export function buildWidth036Steps(): Tree036Step[] {
  const steps: Tree036Step[] = [];
  const nodes = WIDTH_TREE_NODES;
  const nodeMap = new Map<number, TreeNode036>(nodes.map((n) => [n.id, n]));

  // Step 1: 入口
  steps.push({
    codeLine: WIDTH_036_LINES.entry,
    decision: '开始计算二叉树最大宽度',
    message: '算法启动：为每个节点分配完全二叉树虚拟编号 (根节点为 1，左孩子 2*i，右孩子 2*i+1)',
    log: 'widthOfBinaryTree(root = 1), maxWidth = 0',
    activeNodeId: null,
    queue: [],
    metrics: { '当前最大宽度 maxWidth': 0, '当前层号': 0 },
    statusBadge: { text: '初始化', type: 'info' },
  });

  // Step 2: 根节点入队 (nodeId: 1, index: 1)
  type QueueItem = { id: number; idx: number };
  let q: QueueItem[] = [{ id: 1, idx: 1 }];
  let maxWidth = 0;
  let level = 0;

  const formatQueue = (queue: QueueItem[]) =>
    queue.map((item) => `Node ${nodeMap.get(item.id)?.val} (idx: ${item.idx})`);

  steps.push({
    codeLine: WIDTH_036_LINES.initQueue,
    decision: '根节点赋编号 1 入队',
    message: '根节点 1 入队，初始虚拟编号 index = 1',
    log: 'queue.offer(Node 1, index = 1)',
    activeNodeId: 1,
    queue: formatQueue(q),
    metrics: { '当前最大宽度 maxWidth': 0, '队列大小': 1 },
    statusBadge: { text: '根节点入队', type: 'info' },
  });

  while (q.length > 0) {
    level++;
    const size = q.length;
    const base = q[0].idx;
    let leftIndex = q[0].idx;
    let rightIndex = q[0].idx;

    steps.push({
      codeLine: WIDTH_036_LINES.whileLoop,
      decision: `进入第 ${level} 层循环：当前层节点数 size = ${size}`,
      message: `开始处理第 ${level} 层，队列中共有 ${size} 个节点等待遍历`,
      log: `while queue not empty: level ${level}, size = ${size}`,
      activeNodeId: q[0].id,
      queue: formatQueue(q),
      metrics: { '当前层号': level, '当前层节点数': size, '历史最大宽度': maxWidth },
      statusBadge: { text: `处理第 ${level} 层`, type: 'info' },
    });

    steps.push({
      codeLine: WIDTH_036_LINES.baseOffset,
      decision: `锁定第 ${level} 层基准偏移量 base = ${base}`,
      message: `第 ${level} 层最左节点编号为 ${base}。后续每个节点用 rawIdx - base 规避大数溢出`,
      log: `第 ${level} 层：size = ${size}, base = ${base}`,
      activeNodeId: q[0].id,
      queue: formatQueue(q),
      metrics: { '层号': level, '基准偏移 base': base, '历史最大宽度': maxWidth },
      statusBadge: { text: `base = ${base}`, type: 'warning' },
    });

    const nextQ: QueueItem[] = [];

    for (let i = 0; i < size; i++) {
      const curItem = q.shift()!;
      const cur = nodeMap.get(curItem.id)!;
      const rawIdx = curItem.idx;
      const normalizedIdx = rawIdx - base;

      if (i === 0) leftIndex = rawIdx;
      if (i === size - 1) rightIndex = rawIdx;

      // 出队步骤
      steps.push({
        codeLine: WIDTH_036_LINES.pollNode,
        decision: `[${i + 1}/${size}] 弹出节点 ${cur.val} (编号 ${rawIdx})`,
        message: `从队列头部弹出节点 ${cur.val}，其绝对编号为 ${rawIdx}`,
        log: `poll: Node ${cur.val} (rawIdx: ${rawIdx})`,
        activeNodeId: cur.id,
        queue: formatQueue([...q, ...nextQ]),
        metrics: { '当前出队节点': cur.val, '原始编号': rawIdx, '相对偏移编号': normalizedIdx },
        statusBadge: { text: `出队: Node ${cur.val}`, type: 'info' },
      });

      // 计算相对偏移编号
      steps.push({
        codeLine: WIDTH_036_LINES.calcIdx,
        decision: `计算相对编号: idx = ${rawIdx} - ${base} = ${normalizedIdx}`,
        message: `若本层首位，更新 left = ${leftIndex}；若末位，更新 right = ${rightIndex}`,
        log: `idx = ${rawIdx} - ${base} = ${normalizedIdx}, left = ${leftIndex}, right = ${rightIndex}`,
        activeNodeId: cur.id,
        queue: formatQueue([...q, ...nextQ]),
        metrics: { '当前节点': cur.val, '相对编号': normalizedIdx, '本层最左': leftIndex, '本层最右': rightIndex },
        statusBadge: { text: `相对编号: ${normalizedIdx}`, type: 'info' },
      });

      // 左孩子入队
      if (cur.left != null) {
        const leftNode = nodeMap.get(cur.left)!;
        const leftRawIdx = rawIdx * 2;
        nextQ.push({ id: cur.left, idx: leftRawIdx });
        steps.push({
          codeLine: WIDTH_036_LINES.pushLeft,
          decision: `左孩子 ${leftNode.val} 入队，分配编号 ${leftRawIdx}`,
          message: `按完全二叉树编号规则：左孩子编号 = parentIdx * 2 = ${rawIdx} * 2 = ${leftRawIdx}`,
          log: `offer left: Node ${leftNode.val} (idx: ${leftRawIdx})`,
          activeNodeId: cur.id,
          secondaryNodeId: cur.left,
          queue: formatQueue([...q, ...nextQ]),
          metrics: { '父节点': cur.val, '左孩子': leftNode.val, '新编号': leftRawIdx },
          statusBadge: { text: `入队左孩子: ${leftNode.val}`, type: 'info' },
        });
      }

      // 右孩子入队
      if (cur.right != null) {
        const rightNode = nodeMap.get(cur.right)!;
        const rightRawIdx = rawIdx * 2 + 1;
        nextQ.push({ id: cur.right, idx: rightRawIdx });
        steps.push({
          codeLine: WIDTH_036_LINES.pushRight,
          decision: `右孩子 ${rightNode.val} 入队，分配编号 ${rightRawIdx}`,
          message: `按完全二叉树编号规则：右孩子编号 = parentIdx * 2 + 1 = ${rawIdx} * 2 + 1 = ${rightRawIdx}`,
          log: `offer right: Node ${rightNode.val} (idx: ${rightRawIdx})`,
          activeNodeId: cur.id,
          secondaryNodeId: cur.right,
          queue: formatQueue([...q, ...nextQ]),
          metrics: { '父节点': cur.val, '右孩子': rightNode.val, '新编号': rightRawIdx },
          statusBadge: { text: `入队右孩子: ${rightNode.val}`, type: 'info' },
        });
      }
    }

    const currentSpan = rightIndex - leftIndex + 1;
    maxWidth = Math.max(maxWidth, currentSpan);

    steps.push({
      codeLine: WIDTH_036_LINES.calcSpan,
      decision: `结算第 ${level} 层跨度: ${currentSpan}`,
      message: `本层最左节点编号 ${leftIndex}，最右节点编号 ${rightIndex}，当前宽度 = ${rightIndex} - ${leftIndex} + 1 = ${currentSpan}。全局最大宽度更新为 ${maxWidth}`,
      log: `curWidth = ${rightIndex} - ${leftIndex} + 1 = ${currentSpan}, maxWidth = ${maxWidth}`,
      activeNodeId: null,
      queue: formatQueue(nextQ),
      metrics: { '最左节点编号': leftIndex, '最右节点编号': rightIndex, '本层宽度': currentSpan, '最终最大宽度 maxWidth': maxWidth },
      statusBadge: { text: `宽度: ${currentSpan}`, type: 'success' },
    });

    q = nextQ;
  }

  // 完成
  steps.push({
    codeLine: WIDTH_036_LINES.returnAns,
    decision: '计算完毕，返回最大宽度',
    message: `整棵二叉树的所有层检查完毕，最终最大宽度为 ${maxWidth}`,
    log: `return maxWidth: ${maxWidth}`,
    activeNodeId: null,
    queue: [],
    metrics: { '最终最大宽度 maxWidth': maxWidth },
    statusBadge: { text: '计算完成', type: 'success' },
  });

  return steps;
}

function renderWidthCanvas(container: HTMLElement, step: Tree036Step): void {
  const badgeColors = {
    info: '#3b82f6',
    warning: '#f59e0b',
    success: '#10b981',
    danger: '#ef4444',
  };

  const badges: Record<number, string> = {
    1: 'idx: 1',
    2: 'idx: 2',
    3: 'idx: 3',
    4: 'idx: 4',
    5: 'idx: 5',
    7: 'idx: 7',
  };

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 8px; gap: 8px;">
      ${renderTreeSvg(WIDTH_TREE_NODES, step.activeNodeId, step.secondaryNodeId, '#3b82f6', badges)}
      ${step.queue ? renderQueuePipeline(step.queue, '层序索引队列 (包含防溢出虚拟编号)') : ''}
    </div>
  `;
}

export const widthOfBinaryTree036Visualizer = registerDeclarativeAlgorithm<Tree036Step>({
  id: 'tree-036-width-of-binary-tree',
  name: '二叉树最大宽度 (Class 036)',
  category: 'tree',
  icon: '📏',
  difficulty: 2,
  levelOrder: 3603,
  learningGoal: '掌握完全二叉树编号模型与基于首节点偏移 base 消除整数溢出的工程技巧',
  problemHtml: TREE_036_037_PROBLEMS.widthOfBinaryTree036.html,
  codeLanguages: WIDTH_036_CODES,
  inputs: [
    {
      "id": "tree",
      "label": "二叉树层序",
      "type": "text",
      "defaultValue": "1, 3, 2, 5, 3, null, 9",
      "width": "160px"
    }
  ],
  presets: [
    {
      "label": "示例 1 (跨度 4)",
      "values": {
        "tree": "1, 3, 2, 5, 3, null, 9"
      },
      "description": "左右最宽跨度为 4"
    },
    {
      "label": "示例 2 (跨度 2)",
      "values": {
        "tree": "1, 3, 2, 5, null, null, 9"
      },
      "description": "中间空位跨度"
    },
    {
      "label": "单链极端偏斜",
      "values": {
        "tree": "1, 3, null, 5"
      },
      "description": "单链跨度为 1"
    }
  ],

  generateSteps: () => buildWidth036Steps(),
  renderCanvas: (container, step) => renderWidthCanvas(container, step),
});
