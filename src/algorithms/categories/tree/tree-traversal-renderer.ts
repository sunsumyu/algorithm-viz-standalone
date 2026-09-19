/**
 * 二叉树前中后序遍历可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * 递归前序/中序/后序遍历、SVG 拓扑高亮、实时访问序列与代码同步
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { HighlightTarget } from '../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import {
  TREE_TRAVERSAL_PROBLEM_HTML,
  TREE_TRAVERSAL_ANALYSIS_HTML,
  TREE_TRAVERSAL_CODE_LANGUAGES,
} from './tree-traversal-problem-content';

export type Mode = 'pre' | 'in' | 'post';

export interface TTStep {
  tree: TreeNode | null;
  mode: Mode;
  current: number | null;
  depth: number;
  visited: number;
  result: number[];
  action: 'enter' | 'visit' | 'leave';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
}

export const TREE_TRAVERSAL_CODE_LINES = {
  pre: {
    init: { java: 3, cpp: 3, python: 2, javascript: 1 },
    empty: { java: 4, cpp: 4, python: 3, javascript: 2 },
    enter: { java: 4, cpp: 4, python: 3, javascript: 2 },
    visit: { java: 5, cpp: 5, python: 4, javascript: 3 },
    leave: { java: 7, cpp: 7, python: 6, javascript: 6 },
  },
  in: {
    init: { java: 10, cpp: 9, python: 8, javascript: 8 },
    empty: { java: 11, cpp: 10, python: 9, javascript: 9 },
    enter: { java: 11, cpp: 10, python: 9, javascript: 9 },
    visit: { java: 13, cpp: 12, python: 11, javascript: 11 },
    leave: { java: 14, cpp: 13, python: 12, javascript: 13 },
  },
  post: {
    init: { java: 17, cpp: 15, python: 14, javascript: 15 },
    empty: { java: 18, cpp: 16, python: 15, javascript: 16 },
    enter: { java: 18, cpp: 16, python: 15, javascript: 16 },
    visit: { java: 21, cpp: 19, python: 18, javascript: 19 },
    leave: { java: 20, cpp: 18, python: 17, javascript: 20 },
  },
};

export function buildTTSteps(root: TreeNode | null, mode: Mode): TTStep[] {
  const steps: TTStep[] = [];
  const result: number[] = [];
  let visited = 0;

  const modeName = mode === 'pre' ? '前序（根左右）' : mode === 'in' ? '中序（左根右）' : '后序（左右根）';
  const modeConfig = TREE_TRAVERSAL_CODE_LINES[mode] || TREE_TRAVERSAL_CODE_LINES.pre;
  steps.push({
    tree: root,
    mode,
    current: null,
    depth: 0,
    visited: 0,
    result: [],
    action: 'enter',
    message: root ? `开始${modeName}遍历：根节点为 ${root.val}。` : '空树，无需遍历。',
    log: root ? `开始${modeName}遍历` : '空树',
    codeLine: modeConfig.init,
  });

  if (!root) {
    steps.push({
      tree: null,
      mode,
      current: null,
      depth: 0,
      visited: 0,
      result: [],
      action: 'leave',
      message: '✅ 遍历完成，返回空序列 []。',
      log: '遍历完成: []',
      codeLine: modeConfig.empty,
    });
    return steps;
  }

  const visit = (node: TreeNode, depth: number) => {
    visited++;
    result.push(node.val);
    steps.push({
      tree: root,
      mode,
      current: node.val,
      depth,
      visited,
      result: [...result],
      action: 'visit',
      message: `${modeName} 访问节点 ${node.val}（深度 ${depth}），加入结果序列。`,
      log: `访问节点 ${node.val} -> [${result.join(', ')}]`,
      codeLine: modeConfig.visit,
    });
  };

  const traverse = (node: TreeNode | null, depth: number) => {
    if (!node) return;
    steps.push({
      tree: root,
      mode,
      current: node.val,
      depth,
      visited,
      result: [...result],
      action: 'enter',
      message: `进入节点 ${node.val}（当前栈深度 ${depth}）。`,
      log: `进入 ${node.val} (depth ${depth})`,
      codeLine: modeConfig.enter,
    });

    if (mode === 'pre') visit(node, depth);
    traverse(node.left, depth + 1);
    if (mode === 'in') visit(node, depth);
    traverse(node.right, depth + 1);
    if (mode === 'post') visit(node, depth);

    steps.push({
      tree: root,
      mode,
      current: node.val,
      depth,
      visited,
      result: [...result],
      action: 'leave',
      message: `离开节点 ${node.val}（该子树所有分支处理完毕，弹出栈帧）。`,
      log: `离开 ${node.val}`,
      codeLine: modeConfig.leave,
    });
  };

  traverse(root, 0);

  steps.push({
    tree: root,
    mode,
    current: null,
    depth: 0,
    visited,
    result: [...result],
    action: 'leave',
    message: `🎉 ${modeName}遍历完成！最终收集序列：[${result.join(', ')}]。`,
    log: `✓ 完成: [${result.join(', ')}]`,
    codeLine: 1,
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<TTStep>({
  id: 'tree-traversal',
  name: '二叉树遍历',
  category: 'tree',
  icon: '🌲',
  badge: {
    mode: '前序 / 中序 / 后序递归',
    complexity: 'O(n) · O(h)',
  },
  card1Title: '📊 二叉树拓扑结构与遍历沙盘',
  card2Title: '🧭 遍历指标与输出序列监视器',
  card2Desc: '当前访问节点、递归调用栈深度与输出序列',
  legend: [
    { label: '当前访问节点', color: '#fbbf24' },
    { label: '已输出节点', color: '#34d399' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '1, 2, 3, 4, 5, 6, 7',
      width: '150px',
      placeholder: '1, 2, 3, 4, 5...',
    },
  ],
  modes: [
    { id: 'pre', label: '前序遍历 (根-左-右)' },
    { id: 'in', label: '中序遍历 (左-根-右)' },
    { id: 'post', label: '后序遍历 (左-右-根)' },
  ],
  presets: [
    {
      label: '完美满二叉树',
      values: { 'input-tree': '1, 2, 3, 4, 5, 6, 7' },
    },
    {
      label: '单侧偏斜树',
      values: { 'input-tree': '1, 2, null, 3, null, null, null' },
    },
    {
      label: '不规则二叉树',
      values: { 'input-tree': '1, 2, 3, null, 4, 5, null' },
    },
  ],
  metrics: [
    { id: 'cur-node', label: '当前访问节点', color: '#f59e0b' },
    { id: 'depth', label: '调用栈深度 depth', color: '#2563eb' },
    { id: 'visited-count', label: '已访问节点数', color: '#0f172a' },
  ],
  codeLanguages: TREE_TRAVERSAL_CODE_LANGUAGES,
  problemHtml: TREE_TRAVERSAL_PROBLEM_HTML,
  analysisHtml: TREE_TRAVERSAL_ANALYSIS_HTML,
  buildSteps: (inputs, mode) => {
    const raw = inputs['input-tree'] || '1, 2, 3, 4, 5, 6, 7';
    const arr = parseTreeArray(raw, [1, 2, 3, 4, 5, 6, 7]);
    const root = buildTree(arr);
    return buildTTSteps(root, (mode as Mode) || 'pre');
  },
  renderCanvas: (container, step) => {
    // 渲染纯净 SVG 树拓扑
    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.current,
      secondaryHighlightedNodes: step.result,
      primaryColor: '#fbbf24',
      secondaryColor: '#34d399',
    });

    // 更新指标卡片
    const root = container.closest('#algo-tree-traversal-view');
    if (root) {
      const curEl = root.querySelector('#metric-cur-node');
      const depthEl = root.querySelector('#metric-depth');
      const visitedEl = root.querySelector('#metric-visited-count');

      if (curEl) curEl.textContent = step.current != null ? `${step.current}` : '—';
      if (depthEl) depthEl.textContent = `${step.depth}`;
      if (visitedEl) visitedEl.textContent = `${step.visited}`;

      // 在 Card 2 中展示输出序列
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; padding: 4px 0;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 10.5px; font-weight: 700; color: #475569;">已输出序列:</span>
              <span style="font-size: 10px; color: #64748b; font-family: monospace;">${step.result.length} 个节点</span>
            </div>
            <div style="padding: 4px 8px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #16a34a;">
              [ ${step.result.join(', ')} ]
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'tree-traversal',
  name: '二叉树遍历',
  viewId: 'algo-tree-traversal-view',
  category: 'tree',
  description: '前序（根左右）、中序（左根右）、后序（左右根）三大经典递归遍历算法',
  icon: '🌲',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '彻底掌握二叉树前中后序递归遍历的访问时机、调用栈深度与输出时机',
});