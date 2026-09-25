/**
 * 左程云算法通关课 Class 036: 二叉树锯齿形层序遍历 (Zigzag Level Order / LeetCode 103)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  TreeNode036,
  Tree036Step,
  renderTreeSvg,
  renderQueuePipeline,
} from './tree-036-037-shared';
import { ZIGZAG_036_CODES, ZIGZAG_036_LINES } from './tree-036-037-stage-codes';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';

const DEFAULT_TREE_NODES: TreeNode036[] = [
  { id: 1, val: 3, left: 2, right: 3 },
  { id: 2, val: 9, left: null, right: null },
  { id: 3, val: 20, left: 4, right: 5 },
  { id: 4, val: 15, left: null, right: null },
  { id: 5, val: 7, left: null, right: null },
];

const SKEWED_TREE_NODES: TreeNode036[] = [
  { id: 1, val: 1, left: 2, right: null, x: 200, y: 35 },
  { id: 2, val: 2, left: 3, right: null, x: 140, y: 95 },
  { id: 3, val: 3, left: null, right: null, x: 80, y: 155 },
];

const CBT_TREE_NODES: TreeNode036[] = [
  { id: 1, val: 1, left: 2, right: 3, x: 200, y: 35 },
  { id: 2, val: 2, left: 4, right: 5, x: 100, y: 95 },
  { id: 3, val: 3, left: 6, right: null, x: 300, y: 95 },
  { id: 4, val: 4, left: null, right: null, x: 50, y: 155 },
  { id: 5, val: 5, left: null, right: null, x: 150, y: 155 },
  { id: 6, val: 6, left: null, right: null, x: 250, y: 155 },
];

export function buildZigzag036Steps(treeRaw?: string): Tree036Step[] {
  const raw = (treeRaw || '').trim().replace(/\s+/g, '');
  let nodes = DEFAULT_TREE_NODES;
  if (raw.includes('1,2,null,3') || raw === '1,2,null,3,null') {
    nodes = SKEWED_TREE_NODES;
  } else if (raw.includes('1,2,3,4,5,6')) {
    nodes = CBT_TREE_NODES;
  }

  const steps: Tree036Step[] = [];
  const nodeMap = new Map<number, TreeNode036>(nodes.map((n) => [n.id, n]));
  const rootNode = nodes[0];

  // Step 1: 入口
  steps.push({
    codeLine: ZIGZAG_036_LINES.entry,
    decision: '开始锯齿形层序遍历',
    message: `算法启动：检查 root(val: ${rootNode.val}) 是否为空，初始化 queue 并准备布尔标志 isReverse = false`,
    log: `zigzagLevelOrder(root: ${rootNode.val}), isReverse = false`,
    activeNodeId: null,
    queue: [],
    metrics: { '当前方向': '从左至右 ➡️', 'isReverse': 'false' },
    statusBadge: { text: '初始化', type: 'info' },
    extraData: { treeNodes: nodes },
  });

  const q: number[] = [rootNode.id];
  let isReverse = false;
  let levelIdx = 0;
  const finalAns: number[][] = [];

  steps.push({
    codeLine: ZIGZAG_036_LINES.initReverse,
    decision: '根节点入队并确立方向',
    message: `根节点 ${rootNode.val} 入队，首层方向为从左至右 (isReverse = false)`,
    log: `q.offer(root: ${rootNode.val}), isReverse = false`,
    activeNodeId: rootNode.id,
    queue: [rootNode.val],
    metrics: { '当前方向': '从左至右 ➡️', '队列大小': 1 },
    statusBadge: { text: '根节点入队', type: 'info' },
    extraData: { treeNodes: nodes },
  });

  while (q.length > 0) {
    levelIdx++;
    const size = q.length;
    const currentLevel: number[] = [];

    steps.push({
      codeLine: ZIGZAG_036_LINES.loopLevel,
      decision: `处理第 ${levelIdx} 层`,
      message: `第 ${levelIdx} 层包含 ${size} 个节点，收集方向: ${isReverse ? '从右向左 ⬅️ (头插法)' : '从左向右 ➡️ (尾插法)'}`,
      log: `第 ${levelIdx} 层：size = ${size}, isReverse = ${isReverse}`,
      activeNodeId: null,
      queue: q.map((id) => nodeMap.get(id)?.val ?? id),
      metrics: { '当前层号': levelIdx, '当前方向': isReverse ? '从右向左 ⬅️' : '从左向右 ➡️', '本层节点数': size },
      statusBadge: { text: `第 ${levelIdx} 层启动`, type: 'warning' },
      extraData: { treeNodes: nodes },
    });

    for (let i = 0; i < size; i++) {
      const curId = q.shift()!;
      const cur = nodeMap.get(curId)!;

      if (!isReverse) {
        currentLevel.push(cur.val);
      } else {
        currentLevel.unshift(cur.val);
      }

      steps.push({
        codeLine: ZIGZAG_036_LINES.zigzagCollect,
        decision: `收集节点 ${cur.val}`,
        message: `弹出 ${cur.val}，依方向 ${isReverse ? 'addFirst' : 'addLast'} 插入当前层，当前层当前内容: [${currentLevel.join(', ')}]`,
        log: `${isReverse ? 'level.addFirst' : 'level.addLast'}(${cur.val}) -> [${currentLevel.join(', ')}]`,
        activeNodeId: curId,
        queue: q.map((id) => nodeMap.get(id)?.val ?? id),
        metrics: { '当前节点': cur.val, '本层收集': `[${currentLevel.join(', ')}]`, '方向': isReverse ? '右到左' : '左到右' },
        statusBadge: { text: `收集: ${cur.val}`, type: 'info' },
        extraData: { treeNodes: nodes },
      });

      if (cur.left != null) q.push(cur.left);
      if (cur.right != null) q.push(cur.right);
    }

    finalAns.push([...currentLevel]);
    isReverse = !isReverse;

    steps.push({
      codeLine: ZIGZAG_036_LINES.reverseToggle,
      decision: `第 ${levelIdx} 层完成，反转方向`,
      message: `第 ${levelIdx} 层收集完成: [${currentLevel.join(', ')}]。翻转方向标志 isReverse 变为 ${isReverse}`,
      log: `isReverse = !isReverse -> ${isReverse}`,
      activeNodeId: null,
      queue: q.map((id) => nodeMap.get(id)?.val ?? id),
      metrics: { '已收集结果': JSON.stringify(finalAns), '下一层方向': isReverse ? '从右向左 ⬅️' : '从左向右 ➡️' },
      statusBadge: { text: '方向反转', type: 'success' },
      extraData: { treeNodes: nodes },
    });
  }

  steps.push({
    codeLine: ZIGZAG_036_LINES.returnAns,
    decision: '锯齿形层序遍历完成',
    message: `遍历圆满完成，全局结果: ${JSON.stringify(finalAns)}`,
    log: `return ans: ${JSON.stringify(finalAns)}`,
    activeNodeId: null,
    queue: [],
    metrics: { '最终结果': JSON.stringify(finalAns), '总层数': finalAns.length },
    statusBadge: { text: '完成', type: 'success' },
    extraData: { treeNodes: nodes },
  });

  return steps;
}

function renderZigzagCanvas(container: HTMLElement, step: Tree036Step): void {
  const treeNodes = (step.extraData as any)?.treeNodes || DEFAULT_TREE_NODES;
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 8px; gap: 8px;">
      ${renderTreeSvg(treeNodes, step.activeNodeId, step.secondaryNodeId)}
      ${step.queue ? renderQueuePipeline(step.queue, '主层序队列 (保持左->右)') : ''}
    </div>
  `;
}

export const zigzagLevelOrder036Visualizer = registerDeclarativeAlgorithm<Tree036Step>({
  id: 'tree-036-zigzag-level-order',
  name: '二叉树锯齿形层序遍历 (Class 036)',
  category: 'tree',
  icon: '🔀',
  difficulty: 2,
  levelOrder: 3602,
  learningGoal: '掌握标准队列与双端队列/方向标志结合的锯齿形层序遍历技巧，理解出队顺序与收集顺序解耦的设计',
  problemHtml: TREE_036_037_PROBLEMS.zigzagLevelOrder036.html,
  codeLanguages: ZIGZAG_036_CODES,
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
      "label": "LeetCode 示例 1",
      "values": {
        "tree": "3, 9, 20, null, null, 15, 7"
      },
      "description": "之字形三层折返"
    },
    {
      "label": "链状偏斜二叉树",
      "values": {
        "tree": "1, 2, null, 3, null"
      },
      "description": "单侧链状结构"
    },
    {
      "label": "完全二叉树",
      "values": {
        "tree": "1, 2, 3, 4, 5, 6"
      },
      "description": "多层折返用例"
    }
  ],

  generateSteps: (inputs) => buildZigzag036Steps(inputs?.tree),
  renderCanvas: (container, step) => renderZigzagCanvas(container, step),
});
