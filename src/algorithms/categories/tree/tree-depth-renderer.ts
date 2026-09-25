/**
 * 二叉树最大深度可视化器 (Maximum Depth of Binary Tree · LeetCode 104 / Class 036 Code04)
 * 采用顶层声明式架构与双版本综合长处整合 (Bi-Version Synthesis)
 * 融合旧版本动态树输入/节点深度映射画布与左神 Class 036 名师讲义/四语言代码精准联动
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { HighlightTarget } from '../../../core/step-visualizer';
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
  decision: string;
  action: 'enter' | 'left-done' | 'right-done' | 'return-depth' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export const TREE_DEPTH_CODE_LINES = {
  init: { java: 2, cpp: 3, python: 2, javascript: 1 },
  empty: { java: 3, cpp: 4, python: [3, 4], javascript: 2 },
  enter: { java: 4, cpp: 5, python: 5, javascript: 3 },
  leftDone: { java: 5, cpp: 6, python: 6, javascript: 4 },
  returnDepth: { java: 6, cpp: 7, python: 7, javascript: 5 },
  done: { java: 6, cpp: 7, python: 7, javascript: 5 },
};

export function buildTDSteps(root: TreeNode | null): TDStep[] {
  const steps: TDStep[] = [];
  const depthsMap = new Map<number, number>();

  // Step 0: 入口
  steps.push({
    tree: root,
    current: null,
    leftDepth: 0,
    rightDepth: 0,
    maxDepth: 0,
    depthsMap: new Map(depthsMap),
    decision: '算法启动：初始化最大深度计算',
    action: 'enter',
    message: root
      ? `求二叉树最大深度：从根节点 ${root.val} 开始后序自底向上高度归约。递推式: max(l, r) + 1。`
      : '空树，最大深度直接为 0。',
    log: root ? `maxDepth(root: ${root.val})` : 'maxDepth(root: null) -> 0',
    metrics: { '当前算法': 'maxDepth', '当前状态': '初始化' },
    codeLine: TREE_DEPTH_CODE_LINES.init,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      leftDepth: 0,
      rightDepth: 0,
      maxDepth: 0,
      depthsMap: new Map(depthsMap),
      decision: '特判返回：树为空',
      action: 'done',
      message: '树为空，返回深度 0。',
      log: 'return 0',
      metrics: { '最终最大深度': 0 },
      codeLine: TREE_DEPTH_CODE_LINES.empty,
    });
    return steps;
  }

  function dfs(node: TreeNode | null): number {
    if (!node) return 0;

    // 访问当前节点
    steps.push({
      tree: root,
      current: node.val,
      leftDepth: 0,
      rightDepth: 0,
      maxDepth: 0,
      depthsMap: new Map(depthsMap),
      decision: `考察节点 ${node.val}`,
      action: 'enter',
      message: `递归到达节点 ${node.val}，准备分别计算其左右子树深度。`,
      log: `visit node: ${node.val}`,
      metrics: { '当前考察节点': node.val },
      codeLine: TREE_DEPTH_CODE_LINES.enter,
    });

    // 深入左子树
    const lDepth = dfs(node.left);

    steps.push({
      tree: root,
      current: node.val,
      leftDepth: lDepth,
      rightDepth: 0,
      maxDepth: 0,
      depthsMap: new Map(depthsMap),
      decision: `节点 ${node.val} 左子树深度返回: ${lDepth}`,
      action: 'left-done',
      message: `节点 ${node.val} 的左子树最大深度已计算完毕: leftDepth = ${lDepth}。`,
      log: `leftDepth of ${node.val} = ${lDepth}`,
      metrics: { '当前考察节点': node.val, '左子树深度': lDepth },
      codeLine: TREE_DEPTH_CODE_LINES.leftDone,
    });

    // 深入右子树
    const rDepth = dfs(node.right);

    // 归约当前节点最大深度
    const curDepth = Math.max(lDepth, rDepth) + 1;
    depthsMap.set(node.val, curDepth);

    steps.push({
      tree: root,
      current: node.val,
      leftDepth: lDepth,
      rightDepth: rDepth,
      maxDepth: curDepth,
      depthsMap: new Map(depthsMap),
      decision: `节点 ${node.val} 深度归约: max(${lDepth}, ${rDepth}) + 1 = ${curDepth}`,
      action: 'return-depth',
      message: `整合左右子树信息：max(left=${lDepth}, right=${rDepth}) + 1 = ${curDepth}，向上返回。`,
      log: `depth of ${node.val} = ${curDepth}`,
      metrics: { '当前考察节点': node.val, '子树深度': curDepth },
      codeLine: TREE_DEPTH_CODE_LINES.returnDepth,
    });

    return curDepth;
  }

  const finalMax = dfs(root);

  steps.push({
    tree: root,
    current: null,
    leftDepth: 0,
    rightDepth: 0,
    maxDepth: finalMax,
    depthsMap: new Map(depthsMap),
    decision: '最大深度计算完成',
    action: 'done',
    message: `🎉 深度计算完毕！整棵二叉树的最大深度为 【${finalMax}】。`,
    log: `done maxDepth=${finalMax}`,
    metrics: { '最终最大深度': finalMax },
    codeLine: TREE_DEPTH_CODE_LINES.done,
  });

  return steps;
}

export const treeDepthVisualizer = registerDeclarativeAlgorithm<TDStep>({
  id: 'tree-depth',
  aliases: ['tree-036-depth-of-binary-tree'],
  name: '二叉树的最大深度',
  category: 'tree',
  icon: '📉',
  badge: {
    mode: '后序自底向上归约',
    complexity: 'O(n) · O(h)',
  },
  card1Title: '📊 二叉树拓扑与自底向上深度沙盘',
  card2Title: '🧭 左右深度比对与归约计算器',
  card2Desc: '当前考察节点、左右子树深度对照及各节点深度映射表',
  legend: [
    { label: '当前访问节点', color: '#fbbf24' },
    { label: '深度已归约节点', color: '#34d399' },
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
      label: 'LeetCode 示例 1: 3 层非平衡树',
      values: { 'input-tree': '3, 9, 20, null, null, 15, 7' },
      description: '右子树深于左子树，最大深度 = 3',
    },
    {
      label: '单链倾斜树 (4 层)',
      values: { 'input-tree': '1, 2, null, 3, null, 4' },
      description: '退化为单链表，最大深度 = 4',
    },
    {
      label: '满二叉树 (3 层)',
      values: { 'input-tree': '1, 2, 3, 4, 5, 6, 7' },
      description: '完全对称饱满，最大深度 = 3',
    },
    {
      label: '单节点二叉树',
      values: { 'input-tree': '1' },
      description: '仅有根节点，最大深度 = 1',
    },
  ],
  metrics: [
    { id: 'cur-node', label: '当前考察节点', color: '#f59e0b' },
    { id: 'l-depth', label: '左子树深度 left', color: '#2563eb' },
    { id: 'r-depth', label: '右子树深度 right', color: '#0d9488' },
    { id: 'max-depth-res', label: '当前计算深度', color: '#16a34a' },
  ],
  codeLanguages: TREE_DEPTH_CODE_LANGUAGES,
  problemHtml: TREE_DEPTH_PROBLEM_HTML,
  analysisHtml: TREE_DEPTH_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const raw = inputs?.['input-tree'] || inputs?.['tree'] || '3, 9, 20, null, null, 15, 7';
    const arr = parseTreeArray(raw, [3, 9, 20, null, null, 15, 7]);
    const root = buildTree(arr);
    return buildTDSteps(root);
  },
  buildSteps: (inputs) => {
    const raw = inputs?.['input-tree'] || inputs?.['tree'] || '3, 9, 20, null, null, 15, 7';
    const arr = parseTreeArray(raw, [3, 9, 20, null, null, 15, 7]);
    const root = buildTree(arr);
    return buildTDSteps(root);
  },
  renderCanvas: (container, step) => {
    const resolvedNodes = Array.from(step.depthsMap.keys());

    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.current,
      secondaryHighlightedNodes: resolvedNodes,
      primaryColor: '#fbbf24',
      secondaryColor: '#34d399',
    });

    const root = container.closest('#algo-tree-depth-view') || container.parentElement;
    if (root) {
      const curEl = root.querySelector('#metric-cur-node');
      const lEl = root.querySelector('#metric-l-depth');
      const rEl = root.querySelector('#metric-r-depth');
      const maxEl = root.querySelector('#metric-max-depth-res') as HTMLElement | null;

      if (curEl) curEl.textContent = step.current != null ? `${step.current}` : '—';
      if (lEl) lEl.textContent = `${step.leftDepth}`;
      if (rEl) rEl.textContent = `${step.rightDepth}`;
      if (maxEl) {
        maxEl.textContent = step.maxDepth > 0 ? `${step.maxDepth}` : '计算中';
        maxEl.style.color = step.maxDepth > 0 ? '#16a34a' : '#64748b';
      }

      // 在 Card 2 中展示各节点深度记录
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const depthBadges =
          step.depthsMap.size > 0
            ? Array.from(step.depthsMap.entries())
                .map(
                  ([val, d]) => `
                <div style="display: flex; align-items: center; gap: 4px; padding: 2px 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
                  <span style="font-weight: 700; color: #166534; font-size: 11px;">节点 ${val}:</span>
                  <span style="font-family: monospace; font-size: 11px; color: #15803d; font-weight: 700;">深度 = ${d}</span>
                </div>`
                )
                .join('')
            : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">等待首个叶子节点深度归约...</span>';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #475569; padding: 6px 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                <span style="font-size: 10.5px; color: #64748b;">左子树深度 (L):</span>
                <div style="font-weight: 700; font-size: 13px; color: #2563eb;">${step.leftDepth}</div>
              </div>
              <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                <span style="font-size: 10.5px; color: #64748b;">右子树深度 (R):</span>
                <div style="font-weight: 700; font-size: 13px; color: #0d9488;">${step.rightDepth}</div>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 11px; font-weight: 700; color: #334155;">各节点已归约深度 (自底向上):</span>
              <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                ${depthBadges}
              </div>
            </div>

            <div style="padding: 8px 10px; background: #f1f5f9; border-radius: 6px; font-size: 11px; color: #475569;">
              <div style="font-weight: 700; color: #1e293b; margin-bottom: 2px;">🧭 决策推演: ${step.decision}</div>
              <div>${step.message}</div>
            </div>
          </div>
        `;
      }
    }
  },
});