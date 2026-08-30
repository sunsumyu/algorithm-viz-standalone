/**
 * 二叉树最大深度可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * 后序自底向上高度归约、左右子树深度比对、SVG 拓扑高度标注
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import {
  TREE_DEPTH_PROBLEM_HTML,
  TREE_DEPTH_ANALYSIS_HTML,
  TREE_DEPTH_CODE_LANGUAGES,
} from './tree-depth-problem-content';

export interface TDStep {
  tree: TreeNode | null;
  current: number | null;
  leftDepth: number;
  rightDepth: number;
  maxDepth: number;
  depthsMap: Map<number, number>;
  action: 'enter' | 'left-done' | 'right-done' | 'return-depth';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildTDSteps(root: TreeNode | null): TDStep[] {
  const steps: TDStep[] = [];
  const depthsMap = new Map<number, number>();

  steps.push({
    tree: root,
    current: null,
    leftDepth: 0,
    rightDepth: 0,
    maxDepth: 0,
    depthsMap: new Map(depthsMap),
    action: 'enter',
    message: root ? `初始化最大深度计算：根节点为 ${root.val}，采用后序自底向上归约。` : '空树，最大深度为 0。',
    log: root ? '初始化最大深度计算' : '空树 -> 深度 0',
    codeLine: 2,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      leftDepth: 0,
      rightDepth: 0,
      maxDepth: 0,
      depthsMap: new Map(depthsMap),
      action: 'return-depth',
      message: '✅ 空树最大深度为 0。',
      log: '✓ 最大深度 = 0',
      codeLine: 3,
    });
    return steps;
  }

  const getDepth = (node: TreeNode | null): number => {
    if (!node) return 0;

    steps.push({
      tree: root,
      current: node.val,
      leftDepth: 0,
      rightDepth: 0,
      maxDepth: 0,
      depthsMap: new Map(depthsMap),
      action: 'enter',
      message: `进入节点 ${node.val}：开始递归求其左子树最大深度。`,
      log: `进入 ${node.val} -> 求左深度`,
      codeLine: [4, 5],
    });

    const l = getDepth(node.left);

    steps.push({
      tree: root,
      current: node.val,
      leftDepth: l,
      rightDepth: 0,
      maxDepth: 0,
      depthsMap: new Map(depthsMap),
      action: 'left-done',
      message: `节点 ${node.val} 左子树深度计算完毕：leftDepth = ${l}。开始求右子树深度。`,
      log: `节点 ${node.val}: leftDepth = ${l}`,
      codeLine: [5, 6],
    });

    const r = getDepth(node.right);

    const curHeight = 1 + Math.max(l, r);
    depthsMap.set(node.val, curHeight);

    steps.push({
      tree: root,
      current: node.val,
      leftDepth: l,
      rightDepth: r,
      maxDepth: curHeight,
      depthsMap: new Map(depthsMap),
      action: 'return-depth',
      message: `节点 ${node.val} 左右子树处理完毕：1 + max(${l}, ${r}) = ${curHeight}。向父节点返回该高度。`,
      log: `节点 ${node.val} -> 高度 = ${curHeight}`,
      codeLine: [6, 7],
    });

    return curHeight;
  };

  const finalMax = getDepth(root);

  steps.push({
    tree: root,
    current: root.val,
    leftDepth: 0,
    rightDepth: 0,
    maxDepth: finalMax,
    depthsMap: new Map(depthsMap),
    action: 'return-depth',
    message: `🎉 计算完成！二叉树最大深度为 ${finalMax}。`,
    log: `✓ 最大深度 = ${finalMax}`,
    codeLine: 7,
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

const { template, Visualizer } = createDeclarativeVisualizer<TDStep>({
  id: 'tree-depth',
  name: '二叉树的最大深度',
  category: 'tree',
  icon: '📏',
  badge: {
    mode: '后序自底向上归约',
    complexity: 'O(n) · O(h)',
  },
  card1Title: '📊 二叉树拓扑与最大深度归约沙盘',
  card2Title: '🧭 左右深度与高度归约监视器',
  card2Desc: '当前递归节点、左子树深度、右子树深度与当前高度',
  legend: [
    { label: '当前递归节点', color: '#fbbf24' },
    { label: '已计算高度节点', color: '#34d399' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '3, 9, 20, null, null, 15, 7',
      width: '170px',
      placeholder: '3, 9, 20, null...',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 1',
      values: { 'input-tree': '3, 9, 20, null, null, 15, 7' },
    },
    {
      label: '示例 2 (斜树)',
      values: { 'input-tree': '1, null, 2' },
    },
    {
      label: '单节点树',
      values: { 'input-tree': '1' },
    },
  ],
  metrics: [
    { id: 'cur-node', label: '当前节点', color: '#f59e0b' },
    { id: 'left-depth', label: '左子树深度', color: '#2563eb' },
    { id: 'right-depth', label: '右子树深度', color: '#0d9488' },
    { id: 'max-depth', label: '当前最大深度', color: '#16a34a' },
  ],
  codeLanguages: TREE_DEPTH_CODE_LANGUAGES,
  problemHtml: TREE_DEPTH_PROBLEM_HTML,
  analysisHtml: TREE_DEPTH_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-tree'] || '3, 9, 20, null, null, 15, 7';
    const arr = parseTreeInput(raw);
    const root = buildTree(arr);
    return buildTDSteps(root);
  },
  renderCanvas: (container, step) => {
    const calculatedNodes = Array.from(step.depthsMap.keys());
    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.current,
      secondaryHighlightedNodes: calculatedNodes,
      primaryColor: '#fbbf24',
      secondaryColor: '#34d399',
    });

    const root = container.closest('#algo-tree-depth-view');
    if (root) {
      const curEl = root.querySelector('#metric-cur-node');
      const lEl = root.querySelector('#metric-left-depth');
      const rEl = root.querySelector('#metric-right-depth');
      const maxEl = root.querySelector('#metric-max-depth');

      if (curEl) curEl.textContent = step.current != null ? `${step.current}` : '—';
      if (lEl) lEl.textContent = `${step.leftDepth}`;
      if (rEl) rEl.textContent = `${step.rightDepth}`;
      if (maxEl) maxEl.textContent = `${step.maxDepth}`;

      // 在 Card 2 中展示各节点归约高度表
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const entriesHtml = Array.from(step.depthsMap.entries())
          .map(([nVal, h]) => `<span style="padding: 1px 6px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 10.5px; font-family: monospace;">节点 <strong>${nVal}</strong> 高度: <span style="color:#16a34a; font-weight:700;">${h}</span></span>`)
          .join(' ');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; padding: 4px 0;">
            <span style="font-size: 10.5px; font-weight: 700; color: #475569;">已计算高度节点列表:</span>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">${entriesHtml || '<span style="color:#94a3b8; font-size:10.5px; font-style:italic;">等待叶子节点归约...</span>'}</div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'tree-depth',
  name: '二叉树的最大深度',
  viewId: 'algo-tree-depth-view',
  category: 'tree',
  description: '后序遍历自底向上归约：1 + max(leftDepth, rightDepth)',
  icon: '📏',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '掌握利用后序遍历自底向上求树最大高度的核心归约模式',
});