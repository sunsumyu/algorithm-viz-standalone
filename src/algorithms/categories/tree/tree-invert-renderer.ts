/**
 * 翻转二叉树可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * 递归遍历、左右孩子指针互换、动态树结构更新与日志追踪
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import {
  TREE_INVERT_PROBLEM_HTML,
  TREE_INVERT_ANALYSIS_HTML,
  TREE_INVERT_CODE_LANGUAGES,
} from './tree-invert-problem-content';

export interface InvertStep {
  tree: TreeNode | null;
  current: number | null;
  leftVal: number | null;
  rightVal: number | null;
  invertedCount: number;
  isSwapping: boolean;
  action: 'enter' | 'swap' | 'leave' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    val: node.val,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
}

export function buildTreeInvertSteps(root: TreeNode | null): InvertStep[] {
  const steps: InvertStep[] = [];
  const workingTree = cloneTree(root);
  let invertedCount = 0;

  steps.push({
    tree: cloneTree(workingTree),
    current: null,
    leftVal: null,
    rightVal: null,
    invertedCount: 0,
    isSwapping: false,
    action: 'enter',
    message: workingTree ? `初始化翻转二叉树：从根节点 ${workingTree.val} 开始递归。` : '空树，无需翻转。',
    log: workingTree ? '开始翻转二叉树' : '空树',
    codeLine: 2,
  });

  if (!workingTree) {
    steps.push({
      tree: null,
      current: null,
      leftVal: null,
      rightVal: null,
      invertedCount: 0,
      isSwapping: false,
      action: 'done',
      message: '✅ 翻转完成，返回 null。',
      log: '✓ 翻转完成 (null)',
      codeLine: 3,
    });
    return steps;
  }

  const invert = (node: TreeNode | null) => {
    if (!node) return;

    const lVal = node.left ? node.left.val : null;
    const rVal = node.right ? node.right.val : null;

    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      leftVal: lVal,
      rightVal: rVal,
      invertedCount,
      isSwapping: false,
      action: 'enter',
      message: `进入节点 ${node.val}：准备互换其左孩子 (${lVal ?? 'null'}) 与右孩子 (${rVal ?? 'null'})。`,
      log: `进入 ${node.val} (L=${lVal ?? 'null'}, R=${rVal ?? 'null'})`,
      codeLine: [4, 5],
    });

    // 交换左右子树
    const temp = node.left;
    node.left = node.right;
    node.right = temp;
    invertedCount++;

    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      leftVal: node.left ? node.left.val : null,
      rightVal: node.right ? node.right.val : null,
      invertedCount,
      isSwapping: true,
      action: 'swap',
      message: `🔀 互换完成！节点 ${node.val}：原左孩子变为 ${node.left ? node.left.val : 'null'}，原右孩子变为 ${node.right ? node.right.val : 'null'}。`,
      log: `节点 ${node.val} 左右互换完成`,
      codeLine: [6, 7],
    });

    invert(node.left);
    invert(node.right);

    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      leftVal: node.left ? node.left.val : null,
      rightVal: node.right ? node.right.val : null,
      invertedCount,
      isSwapping: false,
      action: 'leave',
      message: `离开节点 ${node.val}：该子树左右翻转全部完成。`,
      log: `离开 ${node.val}`,
      codeLine: 8,
    });
  };

  invert(workingTree);

  steps.push({
    tree: cloneTree(workingTree),
    current: null,
    leftVal: null,
    rightVal: null,
    invertedCount,
    isSwapping: false,
    action: 'done',
    message: `🎉 二叉树翻转全部完成！共执行 ${invertedCount} 次子树互换。`,
    log: `✓ 全部完成 (共交换 ${invertedCount} 次)`,
    codeLine: 8,
  });

  return steps;
}

function parseTreeInput(raw: string): (number | null)[] {
  return (raw || '4, 2, 7, 1, 3, 6, 9')
    .split(/[,，\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => (s === 'null' || s === '#' ? null : parseInt(s, 10)))
    .filter((n) => n === null || !isNaN(n));
}

const { template, Visualizer } = createDeclarativeVisualizer<InvertStep>({
  id: 'tree-invert',
  name: '翻转二叉树',
  category: 'tree',
  icon: '🪞',
  badge: {
    mode: '前序递归·左右指针互换',
    complexity: 'O(n) · O(h)',
  },
  card1Title: '📊 二叉树动态镜像翻转沙盘',
  card2Title: '🧭 左右孩子互换状态监视器',
  card2Desc: '当前处理节点、原左/右孩子值与互换统计',
  legend: [
    { label: '正在互换节点', color: '#fbbf24' },
    { label: '正常节点', color: '#3b82f6' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '4, 2, 7, 1, 3, 6, 9',
      width: '160px',
      placeholder: '4, 2, 7, 1, 3, 6, 9',
    },
  ],
  presets: [
    { label: '标准满二叉树', values: { 'input-tree': '4, 2, 7, 1, 3, 6, 9' } },
    { label: '简单示例', values: { 'input-tree': '2, 1, 3' } },
    { label: '单侧树', values: { 'input-tree': '1, 2, null, 3, null' } },
  ],
  metrics: [
    { id: 'cur-node', label: '当前节点', color: '#f59e0b' },
    { id: 'swap-count', label: '已互换次数', color: '#2563eb' },
    { id: 'swap-state', label: '当前状态', color: '#16a34a' },
  ],
  codeLanguages: TREE_INVERT_CODE_LANGUAGES,
  problemHtml: TREE_INVERT_PROBLEM_HTML,
  analysisHtml: TREE_INVERT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-tree'] || '4, 2, 7, 1, 3, 6, 9';
    const arr = parseTreeInput(raw);
    const root = buildTree(arr);
    return buildTreeInvertSteps(root);
  },
  renderCanvas: (container, step) => {
    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.current,
      primaryColor: '#fbbf24',
    });

    const root = container.closest('#algo-tree-invert-view');
    if (root) {
      const curEl = root.querySelector('#metric-cur-node');
      const countEl = root.querySelector('#metric-swap-count');
      const stateEl = root.querySelector('#metric-swap-state');

      if (curEl) curEl.textContent = step.current != null ? `${step.current}` : '—';
      if (countEl) countEl.textContent = `${step.invertedCount}`;
      if (stateEl) {
        stateEl.textContent = step.isSwapping ? '正在互换左右子树' : step.action === 'done' ? '翻转完成' : '递归遍历中';
      }

      // 在 Card 2 中展示左右孩子互换指针对比
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155; padding: 4px 0;">
            <div style="display: flex; justify-content: space-between;">
              <span>当前左孩子:</span>
              <strong style="font-family: monospace; color: #2563eb; font-size: 12px;">${step.leftVal !== null ? `${step.leftVal}` : 'null'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>当前右孩子:</span>
              <strong style="font-family: monospace; color: #0d9488; font-size: 12px;">${step.rightVal !== null ? `${step.rightVal}` : 'null'}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'tree-invert',
  name: '翻转二叉树',
  viewId: 'algo-tree-invert-view',
  category: 'tree',
  description: '经典递归翻转：前序遍历时直接 swap(node.left, node.right)',
  icon: '🪞',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '掌握利用递归或层序遍历互换每个节点左右子树指针的算法本质',
});