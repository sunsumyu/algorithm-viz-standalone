/**
 * 二叉树最近公共祖先 (LCA) 可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * 后序自底向上回溯、左右子树结果合并、祖先交汇即时捕获
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import {
  LCA_PROBLEM_HTML,
  LCA_ANALYSIS_HTML,
  LCA_CODE_LANGUAGES,
} from './lca-problem-content';

export interface LCAStep {
  tree: TreeNode | null;
  current: number | null;
  p: number;
  q: number;
  leftReturn: number | null;
  rightReturn: number | null;
  lcaResult: number | null;
  action: 'enter' | 'hit-target' | 'left-done' | 'right-done' | 'merge' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildLCASteps(root: TreeNode | null, pVal: number, qVal: number): LCAStep[] {
  const steps: LCAStep[] = [];
  let foundLCA: number | null = null;

  steps.push({
    tree: root,
    current: null,
    p: pVal,
    q: qVal,
    leftReturn: null,
    rightReturn: null,
    lcaResult: null,
    action: 'enter',
    message: root
      ? `初始化 LCA 查找：目标节点 p = ${pVal}, q = ${qVal}，从根节点 ${root.val} 开始后序递归。`
      : '空树，返回 null。',
    log: root ? `开始寻找 LCA(p=${pVal}, q=${qVal})` : '空树 -> null',
    codeLine: 2,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      p: pVal,
      q: qVal,
      leftReturn: null,
      rightReturn: null,
      lcaResult: null,
      action: 'done',
      message: '❌ 空树不存在公共祖先。',
      log: '✓ 未找到 LCA',
      codeLine: 3,
    });
    return steps;
  }

  const findLCA = (node: TreeNode | null): number | null => {
    if (!node) return null;

    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: null,
      rightReturn: null,
      lcaResult: foundLCA,
      action: 'enter',
      message: `进入节点 ${node.val}。检查是否为 p 或 q。`,
      log: `访问 ${node.val}`,
      codeLine: 3,
    });

    if (node.val === pVal || node.val === qVal) {
      steps.push({
        tree: root,
        current: node.val,
        p: pVal,
        q: qVal,
        leftReturn: null,
        rightReturn: null,
        lcaResult: foundLCA,
        action: 'hit-target',
        message: `🎯 命中目标节点 ${node.val}（== ${node.val === pVal ? 'p' : 'q'}），直接向上返回 ${node.val}。`,
        log: `命中目标 ${node.val}`,
        codeLine: 3,
      });
      return node.val;
    }

    const left = findLCA(node.left);

    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: left,
      rightReturn: null,
      lcaResult: foundLCA,
      action: 'left-done',
      message: `节点 ${node.val} 左子树遍历完毕：left 返回 ${left ?? 'null'}。开始求右子树。`,
      log: `节点 ${node.val}: left=${left ?? 'null'}`,
      codeLine: 4,
    });

    const right = findLCA(node.right);

    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: left,
      rightReturn: right,
      lcaResult: foundLCA,
      action: 'right-done',
      message: `节点 ${node.val} 右子树遍历完毕：right 返回 ${right ?? 'null'}。开始合并判定。`,
      log: `节点 ${node.val}: right=${right ?? 'null'}`,
      codeLine: 5,
    });

    // 合并逻辑
    if (left !== null && right !== null) {
      foundLCA = node.val;
      steps.push({
        tree: root,
        current: node.val,
        p: pVal,
        q: qVal,
        leftReturn: left,
        rightReturn: right,
        lcaResult: node.val,
        action: 'merge',
        message: `🌟 节点 ${node.val} 左右子树均非空 (left=${left}, right=${right})！p 与 q 分别散落在左右两侧，故节点 ${node.val} 即为最近公共祖先 (LCA)！`,
        log: `🌟 发现 LCA = ${node.val}`,
        codeLine: 6,
      });
      return node.val;
    }

    const ret = left !== null ? left : right;
    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: left,
      rightReturn: right,
      lcaResult: foundLCA,
      action: 'merge',
      message: `节点 ${node.val} 单侧或空返回：向父节点透传 ${ret ?? 'null'}。`,
      log: `节点 ${node.val} -> 返回 ${ret ?? 'null'}`,
      codeLine: 7,
    });

    return ret;
  };

  const finalLCA = findLCA(root);

  steps.push({
    tree: root,
    current: finalLCA,
    p: pVal,
    q: qVal,
    leftReturn: null,
    rightReturn: null,
    lcaResult: finalLCA,
    action: 'done',
    message: finalLCA !== null
      ? `🎉 搜索完成！节点 ${pVal} 与节点 ${qVal} 的最近公共祖先为: ${finalLCA}。`
      : `❌ 搜索完成！未找到公共祖先。`,
    log: finalLCA !== null ? `✓ 最近公共祖先 LCA = ${finalLCA}` : '✗ 未找到 LCA',
    codeLine: 8,
  });

  return steps;
}

function parseTreeInput(raw: string): (number | null)[] {
  return (raw || '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4')
    .split(/[,，\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => (s === 'null' || s === '#' ? null : parseInt(s, 10)))
    .filter((n) => n === null || !isNaN(n));
}

const { template, Visualizer } = createDeclarativeVisualizer<LCAStep>({
  id: 'lca',
  name: '二叉树的最近公共祖先',
  category: 'tree',
  icon: '🧬',
  badge: {
    mode: '后序自底向上回溯',
    complexity: 'O(n) · O(h)',
  },
  card1Title: '📊 二叉树拓扑与 LCA 祖先回溯沙盘',
  card2Title: '🧭 左右子树返回值与 LCA 判定监视器',
  card2Desc: '目标节点 p/q、左右子树回溯值与最近公共祖先结果',
  legend: [
    { label: '最近公共祖先 (LCA)', color: '#16a34a' },
    { label: '目标节点 p / q', color: '#fbbf24' },
    { label: '当前递归节点', color: '#3b82f6' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4',
      width: '160px',
      placeholder: '3, 5, 1, 6, 2...',
    },
    {
      id: 'input-p',
      label: '节点 p',
      type: 'number',
      defaultValue: 5,
      width: '45px',
    },
    {
      id: 'input-q',
      label: '节点 q',
      type: 'number',
      defaultValue: 1,
      width: '45px',
    },
  ],
  presets: [
    { label: '根为 LCA (p=5, q=1)', values: { 'input-tree': '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4', 'input-p': 5, 'input-q': 1 } },
    { label: '同侧祖先 (p=5, q=4)', values: { 'input-tree': '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4', 'input-p': 5, 'input-q': 4 } },
    { label: '简单树 (p=2, q=3)', values: { 'input-tree': '1, 2, 3', 'input-p': 2, 'input-q': 3 } },
  ],
  metrics: [
    { id: 'cur-node', label: '当前节点', color: '#3b82f6' },
    { id: 'left-ret', label: 'left 返回值', color: '#2563eb' },
    { id: 'right-ret', label: 'right 返回值', color: '#0d9488' },
    { id: 'lca-val', label: '当前捕获 LCA', color: '#16a34a' },
  ],
  codeLanguages: LCA_CODE_LANGUAGES,
  problemHtml: LCA_PROBLEM_HTML,
  analysisHtml: LCA_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-tree'] || '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4';
    const arr = parseTreeInput(raw);
    const root = buildTree(arr);
    const p = parseInt(inputs['input-p'] || '5', 10);
    const q = parseInt(inputs['input-q'] || '1', 10);
    return buildLCASteps(root, p, q);
  },
  renderCanvas: (container, step) => {
    const targets = [step.p, step.q];

    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.lcaResult !== null ? step.lcaResult : step.current,
      secondaryHighlightedNodes: targets,
      primaryColor: step.lcaResult !== null ? '#16a34a' : '#3b82f6',
      secondaryColor: '#fbbf24',
    });

    const root = container.closest('#algo-lca-view');
    if (root) {
      const curEl = root.querySelector('#metric-cur-node');
      const lEl = root.querySelector('#metric-left-ret');
      const rEl = root.querySelector('#metric-right-ret');
      const lcaEl = root.querySelector('#metric-lca-val');

      if (curEl) curEl.textContent = step.current != null ? `${step.current}` : '—';
      if (lEl) lEl.textContent = step.leftReturn != null ? `${step.leftReturn}` : 'null';
      if (rEl) rEl.textContent = step.rightReturn != null ? `${step.rightReturn}` : 'null';
      if (lcaEl) {
        lcaEl.textContent = step.lcaResult != null ? `${step.lcaResult}` : '未捕获';
        lcaEl.style.color = step.lcaResult != null ? '#16a34a' : '#64748b';
      }

      // 在 Card 2 中展示回溯合并规则
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #475569; padding: 4px 0;">
            <div style="display: flex; justify-content: space-between;">
              <span>目标节点对:</span>
              <strong style="color: #d97706;">p = ${step.p}, q = ${step.q}</strong>
            </div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
              • 若 left!=null && right!=null &rarr; 当前节点即为 LCA<br/>
              • 否则向上传递非空分支或 null
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'lca',
  name: '二叉树的最近公共祖先',
  viewId: 'algo-lca-view',
  category: 'tree',
  description: '后序自底向上回溯：左右子树同时返回非空时，当前节点即为最近公共祖先 (LCA)',
  icon: '🧬',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 9,
  learningGoal: '掌握后序自底向上递归处理二叉树祖先聚合问题的核心设计思维',
});