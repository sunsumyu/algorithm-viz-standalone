/**
 * 二叉树层序遍历可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * BFS 广度优先搜索、队列动态进出、层边界确定与分层收集
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
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
  action: 'init' | 'start-level' | 'poll-node' | 'end-level' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildBTLSteps(root: TreeNode | null): BTLStep[] {
  const steps: BTLStep[] = [];
  const result: number[][] = [];

  steps.push({
    tree: root,
    current: null,
    levelIndex: 0,
    levelSize: 0,
    queue: root ? [root.val] : [],
    currentLevel: [],
    result: [],
    action: 'init',
    message: root ? `初始化层序遍历：根节点 ${root.val} 入队。` : '空树，返回空层序 []。',
    log: root ? `根节点 ${root.val} 入队` : '空树',
    codeLine: [4, 5, 6],
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
      action: 'done',
      message: '✅ 遍历完成，返回 []。',
      log: '✓ 完成: []',
      codeLine: 4,
    });
    return steps;
  }

  const queue: TreeNode[] = [root];
  let levelIdx = 0;

  while (queue.length > 0) {
    const size = queue.length;
    const currentLevel: number[] = [];
    const qSnapshot = queue.map((n) => n.val);

    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: size,
      queue: [...qSnapshot],
      currentLevel: [],
      result: result.map((l) => [...l]),
      action: 'start-level',
      message: `开始遍历第 ${levelIdx} 层：当前队列大小 size = ${size}，节点为 [${qSnapshot.join(', ')}]。`,
      log: `第 ${levelIdx} 层开始 (size=${size})`,
      codeLine: [7, 8, 9],
    });

    for (let i = 0; i < size; i++) {
      const node = queue.shift()!;
      currentLevel.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);

      const remainingQ = queue.map((n) => n.val);

      steps.push({
        tree: root,
        current: node.val,
        levelIndex: levelIdx,
        levelSize: size,
        queue: [...remainingQ],
        currentLevel: [...currentLevel],
        result: result.map((l) => [...l]),
        action: 'poll-node',
        message: `出队节点 ${node.val} 并加入当前层；将其左右孩子压入队列。当前队列: [${remainingQ.join(', ')}]。`,
        log: `访问 ${node.val} -> 层列表 [${currentLevel.join(', ')}]`,
        codeLine: [10, 11, 12, 13, 14],
      });
    }

    result.push([...currentLevel]);

    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: size,
      queue: queue.map((n) => n.val),
      currentLevel: [...currentLevel],
      result: result.map((l) => [...l]),
      action: 'end-level',
      message: `第 ${levelIdx} 层收集完成：[${currentLevel.join(', ')}]。加入最终结果列表。`,
      log: `✓ 第 ${levelIdx} 层完成: [${currentLevel.join(', ')}]`,
      codeLine: 15,
    });

    levelIdx++;
  }

  steps.push({
    tree: root,
    current: null,
    levelIndex: levelIdx,
    levelSize: 0,
    queue: [],
    currentLevel: [],
    result: result.map((l) => [...l]),
    action: 'done',
    message: `🎉 层序遍历全部完成！共 ${result.length} 层，最终二维结果: ${JSON.stringify(result)}。`,
    log: `✓ 全部完成: ${JSON.stringify(result)}`,
    codeLine: 16,
  });

  return steps;
}

function parseTreeInput(raw: string): (number | null)[] {
  return (raw || '3, 9, 20, null, null, 15, 7')
    .split(/[,，\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => (s === 'null' || s === '#' ? null : parseInt(s, 10)))
    .filter((n) => n === null || !isNaN(n));
}

const { template, Visualizer } = createDeclarativeVisualizer<BTLStep>({
  id: 'binary-tree-level',
  name: '二叉树的层序遍历',
  category: 'tree',
  icon: '🥞',
  badge: {
    mode: 'BFS 队列逐层收集',
    complexity: 'O(n) · O(w)',
  },
  card1Title: '📊 二叉树拓扑与 BFS 遍历沙盘',
  card2Title: '🧭 队列状态与分层结果监视器',
  card2Desc: '当前处理节点、BFS 队列序列与已收集二维层结果',
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
      width: '160px',
      placeholder: '3, 9, 20, null...',
    },
  ],
  presets: [
    { label: 'LeetCode 示例 1', values: { 'input-tree': '3, 9, 20, null, null, 15, 7' } },
    { label: '单节点树', values: { 'input-tree': '1' } },
    { label: '满二叉树', values: { 'input-tree': '1, 2, 3, 4, 5, 6, 7' } },
  ],
  metrics: [
    { id: 'cur-level', label: '当前所在层', color: '#2563eb' },
    { id: 'queue-size', label: 'BFS 队列大小', color: '#f59e0b' },
    { id: 'total-collected', label: '已收集层数', color: '#16a34a' },
  ],
  codeLanguages: BINARY_TREE_LEVEL_CODE_LANGUAGES,
  problemHtml: BINARY_TREE_LEVEL_PROBLEM_HTML,
  analysisHtml: BINARY_TREE_LEVEL_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-tree'] || '3, 9, 20, null, null, 15, 7';
    const arr = parseTreeInput(raw);
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

    const root = container.closest('#algo-binary-tree-level-view');
    if (root) {
      const lvlEl = root.querySelector('#metric-cur-level');
      const qEl = root.querySelector('#metric-queue-size');
      const totEl = root.querySelector('#metric-total-collected');

      if (lvlEl) lvlEl.textContent = `第 ${step.levelIndex} 层`;
      if (qEl) qEl.textContent = `${step.queue.length}`;
      if (totEl) totEl.textContent = `${step.result.length} 层`;

      // 在 Card 2 中展示队列与收集的二维结果
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const queueChips = step.queue.map((v) => `<span style="padding: 1px 6px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; border-radius: 4px; font-size: 10.5px; font-family: monospace;">${v}</span>`).join(' ') || '<span style="color:#94a3b8; font-size:10.5px; font-style:italic;">队列为空</span>';
        const layersHtml = step.result.map((layer, idx) => `<span style="padding: 2px 6px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; border-radius: 4px; font-size: 10.5px; font-family: monospace;">层${idx}: [${layer.join(', ')}]</span>`).join(' ') || '<span style="color:#94a3b8; font-size:10.5px; font-style:italic;">等待收集第一层...</span>';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; padding: 4px 0;">
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <span style="font-size: 10.5px; font-weight: 700; color: #475569;">🥞 BFS 队列状态 (队头 → 队尾):</span>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">${queueChips}</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <span style="font-size: 10.5px; font-weight: 700; color: #475569;">已收集二维层序结果:</span>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">${layersHtml}</div>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'binary-tree-level',
  name: '二叉树的层序遍历',
  viewId: 'algo-binary-tree-level-view',
  category: 'tree',
  description: 'BFS 队列广度优先逐层遍历二叉树，按层收集二维节点列表',
  icon: '🥞',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 8,
  learningGoal: '掌握利用辅助队列进行层序遍历与通过当前层 size 准确控制层边界的经典套路',
});