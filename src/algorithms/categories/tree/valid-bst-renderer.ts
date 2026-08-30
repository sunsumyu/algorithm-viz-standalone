/**
 * 验证二叉搜索树可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * 中序遍历严格单调递增校验、前驱节点追踪、违规节点高亮
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import {
  VALID_BST_PROBLEM_HTML,
  VALID_BST_ANALYSIS_HTML,
  VALID_BST_CODE_LANGUAGES,
} from './valid-bst-problem-content';

export interface VBStep {
  tree: TreeNode | null;
  current: number | null;
  prev: number | null;
  sequence: number[];
  valid: boolean;
  invalidNode: number | null;
  phase: 'init' | 'check' | 'valid' | 'invalid';
  status: 'init' | 'check' | 'valid' | 'invalid';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildVBSteps(root: TreeNode | null): VBStep[] {
  const steps: VBStep[] = [];
  const sequence: number[] = [];
  let prevVal: number | null = null;
  let isValid = true;
  let invalidNode: number | null = null;

  steps.push({
    tree: root,
    current: null,
    prev: null,
    sequence: [],
    valid: true,
    invalidNode: null,
    phase: 'init',
    status: 'init',
    message: root ? '初始化 BST 校验：开始中序遍历并检查单调性。' : '空树，默认是有效 BST。',
    log: root ? '初始化 BST 校验' : '空树 -> 有效',
    codeLine: 2,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      prev: null,
      sequence: [],
      valid: true,
      invalidNode: null,
      phase: 'valid',
      status: 'valid',
      message: '✅ 空树是合法的二叉搜索树。',
      log: '✓ 有效 BST',
      codeLine: 4,
    });
    return steps;
  }

  const inorder = (node: TreeNode | null): boolean => {
    if (!node || !isValid) return true;

    // 1. 递归左子树
    if (!inorder(node.left)) return false;

    // 2. 检查当前节点
    const val = node.val;
    const ok = prevVal === null || val > prevVal;

    steps.push({
      tree: root,
      current: val,
      prev: prevVal,
      sequence: [...sequence],
      valid: ok,
      invalidNode: ok ? null : val,
      phase: ok ? 'check' : 'invalid',
      status: ok ? 'check' : 'invalid',
      message: ok
        ? `中序检查节点 ${val}：${prevVal === null ? '无前驱节点' : `${val} > 前驱 ${prevVal}`}，满足严格递增。`
        : `❌ 违规！节点 ${val} <= 前驱 ${prevVal}，破坏了中序严格递增特性！`,
      log: ok
        ? `检查 ${val} (prev=${prevVal ?? 'null'}) -> OK`
        : `违规: ${val} <= prev(${prevVal}) -> 非法 BST`,
      codeLine: [8, 9, 10],
    });

    if (!ok) {
      isValid = false;
      invalidNode = val;
      return false;
    }

    sequence.push(val);
    prevVal = val;

    // 3. 递归右子树
    return inorder(node.right);
  };

  const finalResult = inorder(root);

  steps.push({
    tree: root,
    current: null,
    prev: prevVal,
    sequence: [...sequence],
    valid: finalResult,
    invalidNode,
    phase: finalResult ? 'valid' : 'invalid',
    status: finalResult ? 'valid' : 'invalid',
    message: finalResult
      ? `🎉 校验完成！中序遍历序列为 [${sequence.join(', ')}]，完全满足严格单调递增，该树是合法的二叉搜索树 (True)。`
      : `❌ 校验完成！该树不是合法的二叉搜索树 (False)。`,
    log: finalResult ? '✓ 合法 BST (True)' : '✗ 非法 BST (False)',
    codeLine: 11,
  });

  return steps;
}

function parseTreeInput(raw: string): (number | null)[] {
  return (raw || '5, 1, 4, null, null, 3, 6')
    .split(/[,，\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => (s === 'null' || s === '#' ? null : parseInt(s, 10)))
    .filter((n) => n === null || !isNaN(n));
}

const { template, Visualizer } = createDeclarativeVisualizer<VBStep>({
  id: 'valid-bst',
  name: '验证二叉搜索树',
  category: 'tree',
  icon: '🛡️',
  badge: {
    mode: '中序严格单调递增',
    complexity: 'O(n) · O(h)',
  },
  card1Title: '📊 BST 拓扑结构与中序遍历沙盘',
  card2Title: '🧭 中序递增与有效性监视器',
  card2Desc: '当前检查节点、前驱节点与中序遍历输出序列',
  legend: [
    { label: '当前检查节点', color: '#fbbf24' },
    { label: '已确认递增序列', color: '#34d399' },
    { label: '违规节点', color: '#ef4444' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '5, 1, 4, null, null, 3, 6',
      width: '160px',
      placeholder: '5, 1, 4, null, null, 3, 6',
    },
  ],
  presets: [
    { label: '非法 BST (示例)', values: { 'input-tree': '5, 1, 4, null, null, 3, 6' } },
    { label: '合法 BST', values: { 'input-tree': '2, 1, 3' } },
    { label: '多层合法 BST', values: { 'input-tree': '10, 5, 15, 3, 7, 12, 18' } },
  ],
  metrics: [
    { id: 'cur-node', label: '当前节点', color: '#f59e0b' },
    { id: 'prev-node', label: '前驱节点 prev', color: '#2563eb' },
    { id: 'bst-result', label: '合法性判定', color: '#16a34a' },
  ],
  codeLanguages: VALID_BST_CODE_LANGUAGES,
  problemHtml: VALID_BST_PROBLEM_HTML,
  analysisHtml: VALID_BST_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-tree'] || '5, 1, 4, null, null, 3, 6';
    const arr = parseTreeInput(raw);
    const root = buildTree(arr);
    return buildVBSteps(root);
  },
  renderCanvas: (container, step) => {
    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.invalidNode !== null ? step.invalidNode : step.current,
      secondaryHighlightedNodes: step.sequence,
      primaryColor: step.invalidNode !== null ? '#ef4444' : '#fbbf24',
      secondaryColor: '#34d399',
    });

    const root = container.closest('#algo-valid-bst-view');
    if (root) {
      const curEl = root.querySelector('#metric-cur-node');
      const prevEl = root.querySelector('#metric-prev-node');
      const resEl = root.querySelector('#metric-bst-result');

      if (curEl) curEl.textContent = step.current != null ? `${step.current}` : '—';
      if (prevEl) prevEl.textContent = step.prev != null ? `${step.prev}` : '无 (首节点)';
      if (resEl) {
        resEl.textContent = step.valid ? '单调递增正常' : '违规非法 (False)';
        resEl.style.color = step.valid ? '#16a34a' : '#ef4444';
      }

      // 在 Card 2 中展示中序输出序列
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; padding: 4px 0;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 10.5px; font-weight: 700; color: #475569;">当前中序遍历序列:</span>
              <span style="font-size: 10px; color: ${step.valid ? '#16a34a' : '#ef4444'}; font-family: monospace;">${step.valid ? '严格递增' : '递增破损'}</span>
            </div>
            <div style="padding: 4px 8px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: ${step.valid ? '#16a34a' : '#ef4444'};">
              [ ${step.sequence.join(', ') || '空'} ]
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'valid-bst',
  name: '验证二叉搜索树',
  viewId: 'algo-valid-bst-view',
  category: 'tree',
  description: '中序遍历严格单调递增性校验：当前节点值严格大于前驱节点 prev.val',
  icon: '🛡️',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '掌握二叉搜索树中序遍历必然严格单调递增的本质特性及其在线校验算法',
});