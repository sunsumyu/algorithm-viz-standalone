/**
 * 从前序与中序遍历构造二叉树可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * 前序定根、中序切分左右子树、递归组装与拓扑实时绘制
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { TreeNode } from './tree-template';
import {
  BUILD_TREE_PROBLEM_HTML,
  BUILD_TREE_ANALYSIS_HTML,
  BUILD_TREE_CODE_LANGUAGES,
} from './build-tree-problem-content';

export interface BTStep {
  tree: TreeNode | null;
  preorder: number[];
  inorder: number[];
  pL: number;
  pR: number;
  iL: number;
  iR: number;
  rootVal: number | null;
  inRoot: number;
  leftLen: number;
  action: 'enter' | 'split' | 'leave' | 'done';
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

export function buildTreeSteps(preorder: number[], inorder: number[]): BTStep[] {
  const steps: BTStep[] = [];
  const n = preorder.length;

  if (n === 0 || inorder.length !== n) {
    steps.push({
      tree: null,
      preorder,
      inorder,
      pL: -1,
      pR: -1,
      iL: -1,
      iR: -1,
      rootVal: null,
      inRoot: -1,
      leftLen: 0,
      action: 'done',
      message: '数组为空或长度不匹配，无法构造二叉树。',
      log: '空数组/长度不匹配',
      codeLine: 2,
    });
    return steps;
  }

  const inMap = new Map<number, number>();
  inorder.forEach((val, idx) => inMap.set(val, idx));

  steps.push({
    tree: null,
    preorder: [...preorder],
    inorder: [...inorder],
    pL: 0,
    pR: n - 1,
    iL: 0,
    iR: n - 1,
    rootVal: null,
    inRoot: -1,
    leftLen: 0,
    action: 'enter',
    message: `初始化前中序构造：数组长度 n = ${n}，已建立中序索引哈希表。`,
    log: `初始化 pre=[${preorder.join(',')}] in=[${inorder.join(',')}]`,
    codeLine: [3, 4],
  });

  const build = (pL: number, pR: number, iL: number, iR: number): TreeNode | null => {
    if (pL > pR || iL > iR) return null;

    const rootVal = preorder[pL];
    const rootNode: TreeNode = { val: rootVal, left: null, right: null };
    const inRoot = inMap.get(rootVal)!;
    const leftLen = inRoot - iL;

    steps.push({
      tree: cloneTree(rootNode),
      preorder: [...preorder],
      inorder: [...inorder],
      pL,
      pR,
      iL,
      iR,
      rootVal,
      inRoot,
      leftLen,
      action: 'split',
      message: `前序首元素锁定根节点 ${rootVal}。在中序数组中找到位置索引 ${inRoot}，切分出左子树长度 ${leftLen}，右子树长度 ${iR - inRoot}。`,
      log: `锁定根 ${rootVal} -> 中序索引 ${inRoot} (左长度=${leftLen})`,
      codeLine: [6, 7, 8],
    });

    rootNode.left = build(pL + 1, pL + leftLen, iL, inRoot - 1);
    rootNode.right = build(pL + leftLen + 1, pR, inRoot + 1, iR);

    steps.push({
      tree: cloneTree(rootNode),
      preorder: [...preorder],
      inorder: [...inorder],
      pL,
      pR,
      iL,
      iR,
      rootVal,
      inRoot,
      leftLen,
      action: 'leave',
      message: `节点 ${rootVal} 的左右子树组装完毕。`,
      log: `节点 ${rootVal} 组装完成`,
      codeLine: [9, 10],
    });

    return rootNode;
  };

  const finalTree = build(0, n - 1, 0, n - 1);

  steps.push({
    tree: cloneTree(finalTree),
    preorder: [...preorder],
    inorder: [...inorder],
    pL: 0,
    pR: n - 1,
    iL: 0,
    iR: n - 1,
    rootVal: finalTree ? finalTree.val : null,
    inRoot: -1,
    leftLen: 0,
    action: 'done',
    message: `🎉 二叉树构造全部完成！成功还原整棵树的拓扑结构。`,
    log: '✓ 构造完成',
    codeLine: 11,
  });

  return steps;
}

function parseArray(raw: string): number[] {
  return (raw || '')
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));
}

const { template, Visualizer } = createDeclarativeVisualizer<BTStep>({
  id: 'build-tree',
  name: '从前序与中序遍历构造二叉树',
  category: 'tree',
  icon: '🏗️',
  badge: {
    mode: '前序定根·中序切分',
    complexity: 'O(n) · O(n)',
  },
  card1Title: '📊 递归构造生成的二叉树拓扑沙盘',
  card2Title: '🧭 数组区间切分与根节点定位监视器',
  card2Desc: '当前处理根节点、前序区间 [pL..pR] 与中序区间 [iL..iR]',
  legend: [
    { label: '当前确定根节点', color: '#fbbf24' },
    { label: '已生成树结构', color: '#34d399' },
  ],
  inputs: [
    {
      id: 'input-preorder',
      label: '前序序列 (pre)',
      type: 'text',
      defaultValue: '3, 9, 20, 15, 7',
      width: '130px',
      placeholder: '3, 9, 20, 15, 7',
    },
    {
      id: 'input-inorder',
      label: '中序序列 (in)',
      type: 'text',
      defaultValue: '9, 3, 15, 20, 7',
      width: '130px',
      placeholder: '9, 3, 15, 20, 7',
    },
  ],
  presets: [
    { label: '经典示例', values: { 'input-preorder': '3, 9, 20, 15, 7', 'input-inorder': '9, 3, 15, 20, 7' } },
    { label: '简单示例', values: { 'input-preorder': '1, 2, 3', 'input-inorder': '2, 1, 3' } },
    { label: '单节点', values: { 'input-preorder': '1', 'input-inorder': '1' } },
  ],
  metrics: [
    { id: 'cur-root', label: '当前锁定根节点', color: '#f59e0b' },
    { id: 'pre-range', label: '前序区间 [pL..pR]', color: '#2563eb' },
    { id: 'in-range', label: '中序区间 [iL..iR]', color: '#0d9488' },
  ],
  codeLanguages: BUILD_TREE_CODE_LANGUAGES,
  problemHtml: BUILD_TREE_PROBLEM_HTML,
  analysisHtml: BUILD_TREE_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const pre = parseArray(inputs['input-preorder'] || '3, 9, 20, 15, 7');
    const inArr = parseArray(inputs['input-inorder'] || '9, 3, 15, 20, 7');
    return buildTreeSteps(pre, inArr);
  },
  renderCanvas: (container, step) => {
    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.rootVal,
      primaryColor: '#fbbf24',
      secondaryColor: '#34d399',
    });

    const root = container.closest('#algo-build-tree-view');
    if (root) {
      const rootEl = root.querySelector('#metric-cur-root');
      const pRangeEl = root.querySelector('#metric-pre-range');
      const iRangeEl = root.querySelector('#metric-in-range');

      if (rootEl) rootEl.textContent = step.rootVal != null ? `${step.rootVal}` : '—';
      if (pRangeEl) pRangeEl.textContent = step.pL >= 0 ? `[${step.pL}..${step.pR}]` : '—';
      if (iRangeEl) iRangeEl.textContent = step.iL >= 0 ? `[${step.iL}..${step.iR}]` : '—';

      // 在 Card 2 中展示区间切分详情
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #475569; padding: 4px 0;">
            <div style="display: flex; justify-content: space-between;">
              <span>中序根索引:</span>
              <strong style="color: #2563eb;">${step.inRoot >= 0 ? `index ${step.inRoot}` : '—'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>左子树长度:</span>
              <strong style="color: #0d9488;">${step.leftLen}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'build-tree',
  name: '从前序与中序遍历构造二叉树',
  viewId: 'algo-build-tree-view',
  category: 'tree',
  description: '前序定根、中序切分左右子树：preorder[0] 为根，根据 inMap 确定左右子树区间并递归构造',
  icon: '🏗️',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 10,
  learningGoal: '掌握前序遍历与中序遍历相互配合还原二叉树唯一拓扑结构的递归分割算法',
});
