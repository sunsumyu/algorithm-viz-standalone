/**
 * 从前序与中序遍历构造二叉树可视化器 (Construct Binary Tree from Preorder & Inorder · LeetCode 105 / Class 036 Code07)
 * 采用顶层声明式架构与双版本综合长处整合 (Bi-Version Synthesis)
 * 融合旧版本输入交互/区间动态切分沙盘与左神 Class 036 名师讲义/四语言代码精准联动
 */

import { parseNumberList } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { HighlightTarget } from '../../../core/step-visualizer';
import { TreeNode } from './tree-template';
import { cloneStateDepTree } from '../../../core/strategies/tree-clone';
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
  decision: string;
  action: 'enter' | 'split' | 'leave' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, string | number>;
}

function cloneTree(node: TreeNode | null): TreeNode | null {
  return cloneStateDepTree(node);
}

export const BUILD_TREE_CODE_LINES = {
  entry: { java: 3, cpp: 5, python: 2, javascript: 1 },
  hashInorder: { java: 4, cpp: 6, python: 3, javascript: 2 },
  enter: { java: 8, cpp: 9, python: 5, javascript: 5 },
  split: { java: [10, 11, 12, 13], cpp: [11, 12, 13, 14], python: [7, 8, 9, 10], javascript: [7, 8, 9, 10] },
  leftCall: { java: 14, cpp: 15, python: 11, javascript: 11 },
  rightCall: { java: 15, cpp: 16, python: 12, javascript: 12 },
  returnRoot: { java: 16, cpp: 17, python: 13, javascript: 13 },
  done: { java: 16, cpp: 17, python: 13, javascript: 13 },
};

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
      decision: '数组为空或长度不匹配',
      action: 'done',
      message: '数组为空或长度不匹配，无法构造二叉树。',
      log: '空数组/长度不匹配 -> return null',
      metrics: { '当前状态': '异常退出' },
      codeLine: BUILD_TREE_CODE_LINES.enter,
    });
    return steps;
  }

  const inMap = new Map<number, number>();
  inorder.forEach((val, idx) => inMap.set(val, idx));

  // Step 0: 入口
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
    decision: '算法启动：建立中序索引哈希表',
    action: 'enter',
    message: `输入前序 pre=[${preorder.join(', ')}]，中序 in=[${inorder.join(', ')}]，建立 inMap 实现 O(1) 根节点定位。`,
    log: 'inMap created, start recursive build',
    metrics: { '前序长度': n, '中序长度': n, '哈希表尺寸': inMap.size },
    codeLine: BUILD_TREE_CODE_LINES.hashInorder,
  });

  let currentTreeRoot: TreeNode | null = null;

  function build(pL: number, pR: number, iL: number, iR: number): TreeNode | null {
    if (pL > pR || iL > iR) {
      steps.push({
        tree: cloneTree(currentTreeRoot),
        preorder,
        inorder,
        pL,
        pR,
        iL,
        iR,
        rootVal: null,
        inRoot: -1,
        leftLen: 0,
        decision: `区间越界 [${pL}..${pR}] / [${iL}..${iR}]，返回 null`,
        action: 'leave',
        message: `子区间为空 (pL=${pL} > pR=${pR} 或 iL=${iL} > iR=${iR})，对应空子树，返回 null。`,
        log: `base case: return null for [${pL}..${pR}]`,
        metrics: { '区间状态': '越界空树' },
        codeLine: BUILD_TREE_CODE_LINES.enter,
      });
      return null;
    }

    const rootVal = preorder[pL];
    const inRoot = inMap.get(rootVal)!;
    const leftLen = inRoot - iL;
    const node: TreeNode = { val: rootVal, left: null, right: null };

    if (!currentTreeRoot) {
      currentTreeRoot = node;
    }

    // Step 1: 切分区间
    steps.push({
      tree: cloneTree(currentTreeRoot),
      preorder,
      inorder,
      pL,
      pR,
      iL,
      iR,
      rootVal,
      inRoot,
      leftLen,
      decision: `前序定根: ${rootVal}，切分左右区间`,
      action: 'split',
      message: `前序首元素为根: rootVal = ${rootVal}，在 inorder 中位于下标 ${inRoot}。左子树长度 = ${leftLen}。`,
      log: `root=${rootVal} inRoot=${inRoot} leftLen=${leftLen}`,
      metrics: {
        '当前根节点': rootVal,
        '中序根索引': inRoot,
        '左子树长度': leftLen,
        '右子树长度': (iR - inRoot),
      },
      codeLine: BUILD_TREE_CODE_LINES.split,
    });

    // 递归左子树
    node.left = build(pL + 1, pL + leftLen, iL, inRoot - 1);

    // 递归右子树
    node.right = build(pL + leftLen + 1, pR, inRoot + 1, iR);

    steps.push({
      tree: cloneTree(currentTreeRoot),
      preorder,
      inorder,
      pL,
      pR,
      iL,
      iR,
      rootVal,
      inRoot,
      leftLen,
      decision: `节点 ${rootVal} 左右子树构建完成`,
      action: 'leave',
      message: `节点 ${rootVal} 的左右子树递归构建完毕并完成挂载。`,
      log: `built node ${rootVal}`,
      metrics: { '当前根节点': rootVal, '左孩子': node.left ? node.left.val : 'null', '右孩子': node.right ? node.right.val : 'null' },
      codeLine: BUILD_TREE_CODE_LINES.returnRoot,
    });

    return node;
  }

  const resultTree = build(0, n - 1, 0, n - 1);

  steps.push({
    tree: cloneTree(resultTree),
    preorder,
    inorder,
    pL: 0,
    pR: n - 1,
    iL: 0,
    iR: n - 1,
    rootVal: resultTree ? resultTree.val : null,
    inRoot: -1,
    leftLen: 0,
    decision: '二叉树重构全部完成',
    action: 'done',
    message: `🎉 二叉树重构全部完成！根节点为 【${resultTree?.val}】。`,
    log: 'done buildTree',
    metrics: { '整树构建状态': '成功完成', '根节点': resultTree ? resultTree.val : 'null', '总节点数': n },
    codeLine: BUILD_TREE_CODE_LINES.done,
  });

  return steps;
}

export const buildTreeVisualizer = registerDeclarativeAlgorithm<BTStep>({
  id: 'build-tree',
  aliases: ['tree-036-build-tree-preorder-inorder'],
  name: '从前序与中序遍历构造二叉树',
  category: 'tree',
  icon: '🏗️',
  badge: {
    mode: '前序定根·中序切分递归分治',
    complexity: 'O(n) · O(n)',
  },
  card1Title: '📊 重构二叉树拓扑生长沙盘',
  card2Title: '🧭 前序与中序区间切分状态机',
  card2Desc: '当前锁定根节点、inMap 索引定位与左右子树区间动态划分',
  legend: [
    { label: '当前处理根节点', color: '#fbbf24' },
    { label: '已挂载结构', color: '#34d399' },
  ],
  inputs: [
    {
      id: 'input-preorder',
      label: '前序序列 (pre)',
      type: 'text',
      defaultValue: '3, 9, 20, 15, 7',
      width: '150px',
      placeholder: '3, 9, 20, 15, 7',
    },
    {
      id: 'input-inorder',
      label: '中序序列 (in)',
      type: 'text',
      defaultValue: '9, 3, 15, 20, 7',
      width: '150px',
      placeholder: '9, 3, 15, 20, 7',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 1: 经典不平衡树',
      values: {
        'input-preorder': '3, 9, 20, 15, 7',
        'input-inorder': '9, 3, 15, 20, 7',
      },
      description: '根 3，左 9，右子树 20(15, 7)',
    },
    {
      label: '简单三节点树',
      values: {
        'input-preorder': '1, 2, 3',
        'input-inorder': '2, 1, 3',
      },
      description: '根 1，左 2，右 3',
    },
    {
      label: '单链左斜树 (退化)',
      values: {
        'input-preorder': '1, 2, 3',
        'input-inorder': '3, 2, 1',
      },
      description: '只有左孩子单侧链',
    },
    {
      label: '单节点树',
      values: {
        'input-preorder': '1',
        'input-inorder': '1',
      },
      description: '仅包含根节点 1',
    },
  ],
  metrics: [
    { id: 'cur-root', label: '当前锁定根节点', color: '#f59e0b' },
    { id: 'pre-range', label: '前序区间 [pL..pR]', color: '#2563eb' },
    { id: 'in-range', label: '中序区间 [iL..iR]', color: '#0d9488' },
  ],
  codeLanguages: BUILD_TREE_CODE_LANGUAGES,
  problemHtml: BUILD_TREE_PROBLEM_HTML,
  analysisHtml: BUILD_TREE_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const pre = parseNumberList(inputs?.['input-preorder'] || inputs?.['preorder'] || '3, 9, 20, 15, 7', [3, 9, 20, 15, 7]);
    const inArr = parseNumberList(inputs?.['input-inorder'] || inputs?.['inorder'] || '9, 3, 15, 20, 7', [9, 3, 15, 20, 7]);
    return buildTreeSteps(pre, inArr);
  },
  buildSteps: (inputs) => {
    const pre = parseNumberList(inputs?.['input-preorder'] || inputs?.['preorder'] || '3, 9, 20, 15, 7', [3, 9, 20, 15, 7]);
    const inArr = parseNumberList(inputs?.['input-inorder'] || inputs?.['inorder'] || '9, 3, 15, 20, 7', [9, 3, 15, 20, 7]);
    return buildTreeSteps(pre, inArr);
  },
  renderCanvas: (container, step) => {
    if (step.tree) {
      TreeCanvasAdapter.renderTree(container, {
        tree: step.tree,
        current: step.rootVal,
        primaryColor: '#fbbf24',
        secondaryColor: '#34d399',
      });
    } else {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
          <svg width="240" height="120" viewBox="0 0 240 120">
            <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
            <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">重构准备中</text>
          </svg>
          <span style="font-size: 11px; color: #64748b; margin-top: 8px;">即将从前序首元素定位根节点...</span>
        </div>
      `;
    }

    const root = container.closest('#algo-build-tree-view') || container.parentElement;
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
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #475569; padding: 6px 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                <span style="font-size: 10.5px; color: #64748b;">中序根索引 inRoot:</span>
                <div style="font-weight: 700; font-size: 12px; color: #2563eb;">
                  ${step.inRoot >= 0 ? `下标 ${step.inRoot}` : '—'}
                </div>
              </div>
              <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                <span style="font-size: 10.5px; color: #64748b;">左子树节点数 leftLen:</span>
                <div style="font-weight: 700; font-size: 12px; color: #0d9488;">
                  ${step.leftLen}
                </div>
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
