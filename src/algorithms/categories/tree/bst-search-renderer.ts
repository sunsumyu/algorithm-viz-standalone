/**
 * 二叉搜索树中的搜索可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * 单向剪枝查找、路径与目标子树高亮、即时命中判定
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import {
  BST_SEARCH_PROBLEM_HTML,
  BST_SEARCH_ANALYSIS_HTML,
  BST_SEARCH_CODE_LANGUAGES,
} from './bst-search-problem-content';

export interface BSTSStep {
  tree: TreeNode | null;
  current: number | null;
  val: number;
  decision: string;
  found: boolean;
  path: number[];
  targetSubtree: TreeNode | null;
  action: 'enter' | 'left' | 'right' | 'found' | 'not-found' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildBSTSearchSteps(root: TreeNode | null, targetVal: number): BSTSStep[] {
  const steps: BSTSStep[] = [];
  const path: number[] = [];
  let found = false;
  let targetSubtree: TreeNode | null = null;

  steps.push({
    tree: root,
    current: null,
    val: targetVal,
    decision: '准备搜索',
    found: false,
    path: [],
    targetSubtree: null,
    action: 'enter',
    message: root ? `初始化 BST 搜索：目标值 val = ${targetVal}，从根节点 ${root.val} 开始定位。` : '空树，返回 null。',
    log: root ? `开始搜索 val = ${targetVal}` : '空树 -> null',
    codeLine: 2,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      val: targetVal,
      decision: '未找到',
      found: false,
      path: [],
      targetSubtree: null,
      action: 'not-found',
      message: '❌ 空树中无法找到目标值，返回 null。',
      log: '✓ 未找到目标 (null)',
      codeLine: 3,
    });
    return steps;
  }

  let curr: TreeNode | null = root;

  while (curr !== null) {
    path.push(curr.val);

    if (curr.val === targetVal) {
      found = true;
      targetSubtree = curr;

      steps.push({
        tree: root,
        current: curr.val,
        val: targetVal,
        decision: '命中目标',
        found: true,
        path: [...path],
        targetSubtree: curr,
        action: 'found',
        message: `🎯 命中目标！节点 ${curr.val} == ${targetVal}，返回以此节点为根的子树。`,
        log: `✓ 命中目标: ${curr.val} == ${targetVal}`,
        codeLine: 3,
      });
      break;
    } else if (targetVal < curr.val) {
      steps.push({
        tree: root,
        current: curr.val,
        val: targetVal,
        decision: '转向左子树',
        found: false,
        path: [...path],
        targetSubtree: null,
        action: 'left',
        message: `目标值 ${targetVal} < 当前节点 ${curr.val}，根据 BST 有序性，目标只可能在左子树。`,
        log: `${targetVal} < ${curr.val} -> 搜左子树`,
        codeLine: 4,
      });
      curr = curr.left;
    } else {
      steps.push({
        tree: root,
        current: curr.val,
        val: targetVal,
        decision: '转向右子树',
        found: false,
        path: [...path],
        targetSubtree: null,
        action: 'right',
        message: `目标值 ${targetVal} > 当前节点 ${curr.val}，根据 BST 有序性，目标只可能在右子树。`,
        log: `${targetVal} > ${curr.val} -> 搜右子树`,
        codeLine: 5,
      });
      curr = curr.right;
    }
  }

  if (!found) {
    steps.push({
      tree: root,
      current: null,
      val: targetVal,
      decision: '未找到',
      found: false,
      path: [...path],
      targetSubtree: null,
      action: 'not-found',
      message: `❌ 遍历到达空指针 (null)，BST 中不存在值为 ${targetVal} 的节点，返回 null。`,
      log: `✓ 未找到目标 ${targetVal} (null)`,
      codeLine: 3,
    });
  }

  steps.push({
    tree: root,
    current: found ? targetSubtree!.val : null,
    val: targetVal,
    decision: found ? '搜索成功' : '搜索失败',
    found,
    path: [...path],
    targetSubtree,
    action: 'done',
    message: found
      ? `🎉 搜索完成！在路径 [${path.join(' -> ')}] 上成功定位到目标节点 ${targetVal}。`
      : `❌ 搜索完成！未在树中检索到节点 ${targetVal}。`,
    log: found ? `✓ 搜索完成: 命中 ${targetVal}` : `✓ 搜索完成: 未找到 ${targetVal}`,
    codeLine: 6,
  });

  return steps;
}

function parseTreeInput(raw: string): (number | null)[] {
  return (raw || '4, 2, 7, 1, 3')
    .split(/[,，\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => (s === 'null' || s === '#' ? null : parseInt(s, 10)))
    .filter((n) => n === null || !isNaN(n));
}

const { template, Visualizer } = createDeclarativeVisualizer<BSTSStep>({
  id: 'bst-search',
  name: '二叉搜索树中的搜索',
  category: 'tree',
  icon: '🔍',
  badge: {
    mode: 'BST二分剪枝查找',
    complexity: 'O(log n) · O(1)',
  },
  card1Title: '📊 BST 拓扑结构与检索路径沙盘',
  card2Title: '🧭 单向分支决策与查找状态监视器',
  card2Desc: '当前检查节点、目标比对关系与已走过检索路径',
  legend: [
    { label: '命中目标节点', color: '#16a34a' },
    { label: '搜索路径上的节点', color: '#fbbf24' },
    { label: '当前比对节点', color: '#3b82f6' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: 'BST 树层序',
      type: 'text',
      defaultValue: '4, 2, 7, 1, 3',
      width: '140px',
      placeholder: '4, 2, 7, 1, 3',
    },
    {
      id: 'input-target',
      label: '目标值 val',
      type: 'number',
      defaultValue: 2,
      width: '45px',
    },
  ],
  presets: [
    { label: '命中示例 (val=2)', values: { 'input-tree': '4, 2, 7, 1, 3', 'input-target': 2 } },
    { label: '不存在值 (val=5)', values: { 'input-tree': '4, 2, 7, 1, 3', 'input-target': 5 } },
    { label: '更大多层树 (val=15)', values: { 'input-tree': '10, 5, 20, 3, 7, 15, 25', 'input-target': 15 } },
  ],
  metrics: [
    { id: 'cur-node', label: '当前比对节点', color: '#3b82f6' },
    { id: 'branch-decision', label: '分支转向决策', color: '#f59e0b' },
    { id: 'found-status', label: '搜索命中状态', color: '#16a34a' },
  ],
  codeLanguages: BST_SEARCH_CODE_LANGUAGES,
  problemHtml: BST_SEARCH_PROBLEM_HTML,
  analysisHtml: BST_SEARCH_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-tree'] || '4, 2, 7, 1, 3';
    const arr = parseTreeInput(raw);
    const root = buildTree(arr);
    const target = parseInt(inputs['input-target'] || '2', 10);
    return buildBSTSearchSteps(root, target);
  },
  renderCanvas: (container, step) => {
    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.found ? step.current : null,
      secondaryHighlightedNodes: step.path,
      primaryColor: '#16a34a',
      secondaryColor: '#fbbf24',
    });

    const root = container.closest('#algo-bst-search-view');
    if (root) {
      const curEl = root.querySelector('#metric-cur-node');
      const decEl = root.querySelector('#metric-branch-decision');
      const foundEl = root.querySelector('#metric-found-status');

      if (curEl) curEl.textContent = step.current != null ? `${step.current}` : '—';
      if (decEl) decEl.textContent = step.decision;
      if (foundEl) {
        foundEl.textContent = step.found ? '已命中目标' : step.action === 'not-found' ? '未找到 (null)' : '检索中';
        foundEl.style.color = step.found ? '#16a34a' : step.action === 'not-found' ? '#ef4444' : '#2563eb';
      }

      // 在 Card 2 中展示检索路径
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; padding: 4px 0;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 10.5px; font-weight: 700; color: #475569;">已检索路径 (Path):</span>
              <span style="font-size: 10px; color: #64748b; font-family: monospace;">目标: ${step.val}</span>
            </div>
            <div style="padding: 4px 8px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #2563eb;">
              ${step.path.join(' -> ') || '未开始'}
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'bst-search',
  name: '二叉搜索树中的搜索',
  viewId: 'algo-bst-search-view',
  category: 'tree',
  description: 'BST 单向剪枝查找：val < root.val 走左子树，val > root.val 走右子树',
  icon: '🔍',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 6,
  learningGoal: '掌握二叉搜索树利用有序性实现单向分支高效剪枝查找的算法原理',
});
