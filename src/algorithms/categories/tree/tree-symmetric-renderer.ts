/**
 * 对称二叉树可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * 镜像双指针递归、内外侧同步校验、失配即时阻断
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { HighlightTarget } from '../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import {
  TREE_SYMMETRIC_PROBLEM_HTML,
  TREE_SYMMETRIC_ANALYSIS_HTML,
  TREE_SYMMETRIC_CODE_LANGUAGES,
} from './tree-symmetric-problem-content';

export interface TSStep {
  tree: TreeNode | null;
  leftVal: number | null;
  rightVal: number | null;
  match: boolean;
  result: boolean;
  mismatchNode: number | null;
  phase: 'init' | 'check-pair' | 'symmetric' | 'asymmetric';
  status: 'init' | 'check-pair' | 'symmetric' | 'asymmetric';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
}

export const TREE_SYMMETRIC_CODE_LINES = {
  init: { java: 2, cpp: 3, python: 2, javascript: 1 },
  empty: { java: 3, cpp: 4, python: 3, javascript: 2 },
  bothNull: { java: 7, cpp: 8, python: 5, javascript: 4 },
  oneNull: { java: 8, cpp: 9, python: 6, javascript: 5 },
  valMismatch: { java: 9, cpp: 10, python: 7, javascript: 6 },
  recurseMatch: { java: 11, cpp: 11, python: 8, javascript: 7 },
  done: { java: 4, cpp: 5, python: 9, javascript: 9 },
};

export function buildTSSteps(root: TreeNode | null): TSStep[] {
  const steps: TSStep[] = [];
  let isSymmetric = true;
  let mismatchNode: number | null = null;

  steps.push({
    tree: root,
    leftVal: null,
    rightVal: null,
    match: true,
    result: true,
    mismatchNode: null,
    phase: 'init',
    status: 'init',
    message: root ? `初始化对称性检查：根节点为 ${root.val}，开始对比左子树与右子树。` : '空树，默认对称。',
    log: root ? '初始化对称检查' : '空树 -> 对称',
    codeLine: TREE_SYMMETRIC_CODE_LINES.init,
  });

  if (!root) {
    steps.push({
      tree: null,
      leftVal: null,
      rightVal: null,
      match: true,
      result: true,
      mismatchNode: null,
      phase: 'symmetric',
      status: 'symmetric',
      message: '✅ 空树是对称的。',
      log: '✓ 对称二叉树',
      codeLine: TREE_SYMMETRIC_CODE_LINES.empty,
    });
    return steps;
  }

  const check = (left: TreeNode | null, right: TreeNode | null): boolean => {
    if (!isSymmetric) return false;

    if (left === null && right === null) {
      steps.push({
        tree: root,
        leftVal: null,
        rightVal: null,
        match: true,
        result: true,
        mismatchNode: null,
        phase: 'check-pair',
        status: 'check-pair',
        message: '左右镜像节点均为空 (null == null)，该分支对称。',
        log: 'null == null -> 对称',
        codeLine: TREE_SYMMETRIC_CODE_LINES.bothNull,
      });
      return true;
    }

    if (left === null || right === null) {
      const failed = left ? left.val : right!.val;
      steps.push({
        tree: root,
        leftVal: left ? left.val : null,
        rightVal: right ? right.val : null,
        match: false,
        result: false,
        mismatchNode: failed,
        phase: 'asymmetric',
        status: 'asymmetric',
        message: `❌ 结构不对称！一个节点为 ${failed}，而对应镜像节点为 null。`,
        log: `结构失配: ${left ? left.val : 'null'} vs ${right ? right.val : 'null'}`,
        codeLine: TREE_SYMMETRIC_CODE_LINES.oneNull,
      });
      isSymmetric = false;
      mismatchNode = failed;
      return false;
    }

    if (left.val !== right.val) {
      steps.push({
        tree: root,
        leftVal: left.val,
        rightVal: right.val,
        match: false,
        result: false,
        mismatchNode: left.val,
        phase: 'asymmetric',
        status: 'asymmetric',
        message: `❌ 数值不对称！左侧节点值为 ${left.val}，而右侧镜像节点值为 ${right.val}。`,
        log: `数值失配: ${left.val} != ${right.val}`,
        codeLine: TREE_SYMMETRIC_CODE_LINES.valMismatch,
      });
      isSymmetric = false;
      mismatchNode = left.val;
      return false;
    }

    steps.push({
      tree: root,
      leftVal: left.val,
      rightVal: right.val,
      match: true,
      result: true,
      mismatchNode: null,
      phase: 'check-pair',
      status: 'check-pair',
      message: `✓ 镜像节点比对一致：左侧 ${left.val} == 右侧 ${right.val}。继续递归外侧与内侧。`,
      log: `比对一致: ${left.val} == ${right.val}`,
      codeLine: TREE_SYMMETRIC_CODE_LINES.recurseMatch,
    });

    const outside = check(left.left, right.right);
    const inside = check(left.right, right.left);

    return outside && inside;
  };

  const finalResult = check(root.left, root.right);

  steps.push({
    tree: root,
    leftVal: null,
    rightVal: null,
    match: finalResult,
    result: finalResult,
    mismatchNode,
    phase: finalResult ? 'symmetric' : 'asymmetric',
    status: finalResult ? 'symmetric' : 'asymmetric',
    message: finalResult ? '🎉 检查完成！该二叉树是对称的 (True)。' : '❌ 检查完成！该二叉树不是镜像对称的 (False)。',
    log: finalResult ? '✓ 对称二叉树 (True)' : '✗ 不对称二叉树 (False)',
    codeLine: TREE_SYMMETRIC_CODE_LINES.done,
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<TSStep>({
  id: 'tree-symmetric',
  name: '对称二叉树',
  category: 'tree',
  icon: '⚖️',
  badge: {
    mode: '双指针镜像递归',
    complexity: 'O(n) · O(h)',
  },
  card1Title: '📊 二叉树拓扑与镜像比对沙盘',
  card2Title: '🧭 左右镜像比对与对称性监视器',
  card2Desc: '当前比对的左/右镜像节点值与对称性判定',
  legend: [
    { label: '左镜像节点', color: '#2563eb' },
    { label: '右镜像节点', color: '#0d9488' },
    { label: '失配节点', color: '#ef4444' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '1, 2, 2, 3, 4, 4, 3',
      width: '160px',
      placeholder: '1, 2, 2, 3, 4, 4, 3',
    },
  ],
  presets: [
    { label: '完全对称', values: { 'input-tree': '1, 2, 2, 3, 4, 4, 3' } },
    { label: '不对称示例', values: { 'input-tree': '1, 2, 2, null, 3, null, 3' } },
    { label: '数值不对称', values: { 'input-tree': '1, 2, 3' } },
  ],
  metrics: [
    { id: 'left-node', label: '左镜像节点', color: '#2563eb' },
    { id: 'right-node', label: '右镜像节点', color: '#0d9488' },
    { id: 'symm-result', label: '对称性判定', color: '#16a34a' },
  ],
  codeLanguages: TREE_SYMMETRIC_CODE_LANGUAGES,
  problemHtml: TREE_SYMMETRIC_PROBLEM_HTML,
  analysisHtml: TREE_SYMMETRIC_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-tree'] || '1, 2, 2, 3, 4, 4, 3';
    const arr = parseTreeArray(raw, [1, 2, 2, 3, 4, 4, 3]);
    const root = buildTree(arr);
    return buildTSSteps(root);
  },
  renderCanvas: (container, step) => {
    const highlights: number[] = [];
    if (step.leftVal != null) highlights.push(step.leftVal);
    if (step.rightVal != null) highlights.push(step.rightVal);

    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.mismatchNode,
      highlightedNodes: highlights,
      primaryColor: '#ef4444',
      secondaryColor: '#38bdf8',
    });

    const root = container.closest('#algo-tree-symmetric-view');
    if (root) {
      const lEl = root.querySelector('#metric-left-node');
      const rEl = root.querySelector('#metric-right-node');
      const resEl = root.querySelector('#metric-symm-result') as HTMLElement | null;

      if (lEl) lEl.textContent = step.leftVal !== null ? `${step.leftVal}` : '—';
      if (rEl) rEl.textContent = step.rightVal !== null ? `${step.rightVal}` : '—';
      if (resEl) {
        resEl.textContent = step.result ? '符合镜像对称' : '失配 (False)';
        resEl.style.color = step.result ? '#16a34a' : '#ef4444';
      }

      // 在 Card 2 中展示镜像比对规则
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #475569; padding: 4px 0;">
            <div style="display: flex; justify-content: space-between;">
              <span>比对动作:</span>
              <strong style="color: ${step.match ? '#16a34a' : '#ef4444'};">${step.match ? '✓ 一致' : '❌ 结构或数值失配'}</strong>
            </div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
              • 外侧比对: left.left 与 right.right<br/>
              • 内侧比对: left.right 与 right.left
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'tree-symmetric',
  name: '对称二叉树',
  viewId: 'algo-tree-symmetric-view',
  category: 'tree',
  description: '双指针镜像递归：同步比对外侧 (L.left, R.right) 与内侧 (L.right, R.left)',
  icon: '⚖️',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 4,
  learningGoal: '掌握镜像二叉树双指针同时向下递归遍历外侧与内侧节点的算法设计模式',
});
