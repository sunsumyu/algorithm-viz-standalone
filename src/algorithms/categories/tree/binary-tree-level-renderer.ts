/**
 * 二叉树层序遍历可视化器 (Binary Tree Level Order Traversal · LeetCode 102 / Class 036 Code01)
 * 采用顶级声明式架构与双版本综合长处整合 (Bi-Version Synthesis)
 * 融合旧版本输入交互与稳定画布，融入左神名师讲义与四语言代码精准联动
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { HighlightTarget } from '../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import {
  BINARY_TREE_LEVEL_PROBLEM_HTML,
  BINARY_TREE_LEVEL_ANALYSIS_HTML,
  BINARY_TREE_LEVEL_CODE_LANGUAGES,
} from './binary-tree-level-problem-content';

export interface BTLStep {
  tree: TreeNode | null;
  current: number | null;
  levelIndex: number;
  levelSize: number;
  queue: number[];
  currentLevel: number[];
  result: number[][];
  decision: string;
  action: 'init' | 'start-level' | 'poll-node' | 'enqueue-children' | 'end-level' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
}

export const BINARY_TREE_LEVEL_CODE_LINES = {
  entry: { java: 2, cpp: 4, python: 2, javascript: 1 },
  init: { java: [4, 5, 6], cpp: [5, 6, 7], python: [4, 5], javascript: [3, 4] },
  empty: { java: 4, cpp: 5, python: 4, javascript: 3 },
  startLevel: { java: [7, 8, 9], cpp: [8, 9, 10], python: [6, 7, 8], javascript: [5, 6, 7] },
  pollNode: { java: [10, 11], cpp: [11, 12], python: [9, 10], javascript: [8, 9] },
  enqueueChildren: { java: [12, 13], cpp: [13, 14], python: [11, 12], javascript: [10, 11] },
  endLevel: { java: 15, cpp: 16, python: 13, javascript: 13 },
  done: { java: 17, cpp: 18, python: 14, javascript: 15 },
};

export function buildBTLSteps(root: TreeNode | null): BTLStep[] {
  const steps: BTLStep[] = [];
  const result: number[][] = [];

  // Step 0: 算法入口与空树边界特判
  steps.push({
    tree: root,
    current: null,
    levelIndex: 0,
    levelSize: 0,
    queue: [],
    currentLevel: [],
    result: [],
    decision: '函数入口：检查根节点状态',
    action: 'init',
    message: root ? `接收到二叉树，根节点值为 ${root.val}，准备初始化层序队列。` : '空树，直接返回空列表 []。',
    log: root ? `levelOrder(root: ${root.val})` : 'levelOrder(root: null) -> []',
    codeLine: root ? BINARY_TREE_LEVEL_CODE_LINES.entry : BINARY_TREE_LEVEL_CODE_LINES.empty,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: [],
      decision: '特判返回：二叉树为空',
      action: 'done',
      message: '✅ 根节点为 null，层序遍历直接收敛返回 []。',
      log: 'return []',
      codeLine: BINARY_TREE_LEVEL_CODE_LINES.empty,
    });
    return steps;
  }

  // Step 1: 根节点入队
  const queue: TreeNode[] = [root];
  steps.push({
    tree: root,
    current: root.val,
    levelIndex: 0,
    levelSize: 1,
    queue: [root.val],
    currentLevel: [],
    result: [],
    decision: `根节点 ${root.val} 进队`,
    action: 'init',
    message: `初始化层序队列：将根节点 ${root.val} 压入队列头部，queue = [${root.val}]。`,
    log: `queue.offer(${root.val})`,
    codeLine: BINARY_TREE_LEVEL_CODE_LINES.init,
  });

  let levelIdx = 0;

  while (queue.length > 0) {
    const size = queue.length;
    const currentLevel: number[] = [];
    const qSnapshot = queue.map((n) => n.val);

    // Step 2: 锁定当前层大小
    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: size,
      queue: [...qSnapshot],
      currentLevel: [],
      result: result.map((l) => [...l]),
      decision: `锁定第 ${levelIdx} 层规模 (size = ${size})`,
      action: 'start-level',
      message: `检测到队列非空，当前层共有 ${size} 个待处理节点，开始按层遍历。`,
      log: `第 ${levelIdx} 层开始: size = ${size}`,
      codeLine: BINARY_TREE_LEVEL_CODE_LINES.startLevel,
    });

    for (let i = 0; i < size; i++) {
      const node = queue.shift()!;
      currentLevel.push(node.val);

      // Step 3: 出队并收集
      steps.push({
        tree: root,
        current: node.val,
        levelIndex: levelIdx,
        levelSize: size,
        queue: queue.map((n) => n.val),
        currentLevel: [...currentLevel],
        result: result.map((l) => [...l]),
        decision: `节点 ${node.val} 出队并收录`,
        action: 'poll-node',
        message: `从队列弹出节点 ${node.val} 并装入第 ${levelIdx} 层列表：[${currentLevel.join(', ')}]。`,
        log: `poll: ${node.val} -> level[${levelIdx}] = [${currentLevel.join(', ')}]`,
        codeLine: BINARY_TREE_LEVEL_CODE_LINES.pollNode,
      });

      // Step 4: 左右孩子入队
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);

      if (node.left || node.right) {
        const childrenDesc = [
          node.left ? `左孩子 ${node.left.val}` : '',
          node.right ? `右孩子 ${node.right.val}` : '',
        ].filter(Boolean).join('、');

        steps.push({
          tree: root,
          current: node.val,
          levelIndex: levelIdx,
          levelSize: size,
          queue: queue.map((n) => n.val),
          currentLevel: [...currentLevel],
          result: result.map((l) => [...l]),
          decision: `收录节点 ${node.val} 的子节点`,
          action: 'enqueue-children',
          message: `节点 ${node.val} 的 ${childrenDesc} 压入队列，储备为下一层节点。`,
          log: `offer children: ${childrenDesc}`,
          codeLine: BINARY_TREE_LEVEL_CODE_LINES.enqueueChildren,
        });
      }
    }

    result.push([...currentLevel]);

    // Step 5: 当前层收集完毕
    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: size,
      queue: queue.map((n) => n.val),
      currentLevel: [...currentLevel],
      result: result.map((l) => [...l]),
      decision: `第 ${levelIdx} 层收集完成`,
      action: 'end-level',
      message: `第 ${levelIdx} 层所有 ${size} 个节点已全部出队完成：[${currentLevel.join(', ')}]，追加至结果集。`,
      log: `ans.add([${currentLevel.join(', ')}])`,
      codeLine: BINARY_TREE_LEVEL_CODE_LINES.endLevel,
    });

    levelIdx++;
  }

  // Step 6: 收敛返回最终结果
  steps.push({
    tree: root,
    current: null,
    levelIndex: levelIdx,
    levelSize: 0,
    queue: [],
    currentLevel: [],
    result: result.map((l) => [...l]),
    decision: '层序遍历全部完成',
    action: 'done',
    message: `🎉 层序遍历收敛结束！共收集 ${result.length} 层，返回最终二维数组: ${JSON.stringify(result)}。`,
    log: `return ans: ${JSON.stringify(result)}`,
    codeLine: BINARY_TREE_LEVEL_CODE_LINES.done,
  });

  return steps;
}

export const binaryTreeLevelVisualizer = registerDeclarativeAlgorithm<BTLStep>({
  id: 'binary-tree-level',
  aliases: ['tree-036-level-order'],
  name: '二叉树的层序遍历',
  category: 'tree',
  icon: '🥞',
  badge: {
    mode: 'BFS 队列逐层收集',
    complexity: 'O(n) · O(w)',
  },
  card1Title: '📊 二叉树拓扑与 BFS 遍历沙盘',
  card2Title: '🧭 队列状态与分层结果监视器',
  card2Desc: '当前处理节点、BFS 队列管道流与已收集二维层结果',
  legend: [
    { label: '当前出队节点', color: '#fbbf24' },
    { label: '当前层已访问', color: '#34d399' },
    { label: '队列待访问', color: '#60a5fa' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '3, 9, 20, null, null, 15, 7',
      width: '180px',
      placeholder: '3, 9, 20, null...',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 1 (标准平衡树)',
      values: { 'input-tree': '3, 9, 20, null, null, 15, 7' },
      description: '经典分层二叉树',
    },
    {
      label: '满二叉树 (3层完备)',
      values: { 'input-tree': '1, 2, 3, 4, 5, 6, 7' },
      description: '每层节点全部饱满',
    },
    {
      label: '单链左倾斜树',
      values: { 'input-tree': '1, 2, null, 3, null, 4' },
      description: '退化为单链表，每层仅一个节点',
    },
    {
      label: '轴对称二叉树',
      values: { 'input-tree': '1, 2, 2, 3, 4, 4, 3' },
      description: '左右子树严格对称',
    },
    {
      label: '单节点二叉树',
      values: { 'input-tree': '1' },
      description: '仅包含根节点',
    },
  ],
  metrics: [
    { id: 'cur-level', label: '当前所在层', color: '#2563eb' },
    { id: 'queue-size', label: 'BFS 队列大小', color: '#f59e0b' },
    { id: 'total-collected', label: '已收集层数', color: '#16a34a' },
  ],
  codeLanguages: BINARY_TREE_LEVEL_CODE_LANGUAGES,
  problemHtml: BINARY_TREE_LEVEL_PROBLEM_HTML,
  analysisHtml: BINARY_TREE_LEVEL_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const raw = inputs?.['input-tree'] || inputs?.['tree'] || '3, 9, 20, null, null, 15, 7';
    const arr = parseTreeArray(raw, [3, 9, 20, null, null, 15, 7]);
    const root = buildTree(arr);
    return buildBTLSteps(root);
  },
  buildSteps: (inputs) => {
    const raw = inputs?.['input-tree'] || inputs?.['tree'] || '3, 9, 20, null, null, 15, 7';
    const arr = parseTreeArray(raw, [3, 9, 20, null, null, 15, 7]);
    const root = buildTree(arr);
    return buildBTLSteps(root);
  },
  renderCanvas: (container, step) => {
    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.current,
      secondaryHighlightedNodes: step.queue,
      primaryColor: '#fbbf24',
      secondaryColor: '#93c5fd',
    });

    const root = container.closest('#algo-binary-tree-level-view') || container.parentElement;
    if (root) {
      const lvlEl = root.querySelector('#metric-cur-level');
      const qEl = root.querySelector('#metric-queue-size');
      const totEl = root.querySelector('#metric-total-collected');

      if (lvlEl) lvlEl.textContent = `第 ${step.levelIndex} 层`;
      if (qEl) qEl.textContent = `${step.queue.length}`;
      if (totEl) totEl.textContent = `${step.result.length} 层`;

      // 在 Card 2 中展示队列管道与已收集二维层序结果
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const queueChips =
          step.queue.length > 0
            ? step.queue
                .map(
                  (v, idx) => `
                <div style="display: flex; align-items: center;">
                  <span style="padding: 3px 8px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: monospace;">${v}</span>
                  ${idx < step.queue.length - 1 ? '<span style="color: #94a3b8; font-size: 10px; margin: 0 4px;">➔</span>' : ''}
                </div>`
                )
                .join('')
            : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">队列为空 (Empty)</span>';

        const layersHtml =
          step.result.length > 0
            ? step.result
                .map(
                  (layer, idx) => `
                <div style="display: flex; align-items: center; gap: 6px; padding: 2px 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
                  <span style="font-size: 10.5px; font-weight: 700; color: #166534;">第 ${idx} 层:</span>
                  <span style="font-size: 11px; font-family: monospace; color: #15803d; font-weight: 600;">[${layer.join(', ')}]</span>
                </div>`
                )
                .join('')
            : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">等待收集第一层...</span>';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 10px; padding: 6px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 4px;">
                <span>🥞</span> BFS 队列管道流 (队首 ➔ 队尾):
              </span>
              <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px;">
                ${queueChips}
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 11px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 4px;">
                <span>📦</span> 已收集层序结果集 ans:
              </span>
              <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                ${layersHtml}
              </div>
            </div>

            <div style="padding: 8px 10px; background: #f1f5f9; border-radius: 6px; font-size: 11px; color: #475569;">
              <div style="font-weight: 700; color: #1e293b; margin-bottom: 2px;">🎯 阶段决策: ${step.decision}</div>
              <div>${step.message}</div>
            </div>
          </div>
        `;
      }
    }
  },
});