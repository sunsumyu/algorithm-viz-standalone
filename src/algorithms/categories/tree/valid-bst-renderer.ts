/**
 * 验证二叉搜索树 (Validate BST · LeetCode 98 / Class 037 Code05)
 * 采用顶层声明式架构与双版本综合长处整合 (Bi-Version Synthesis)
 * 融合旧版本输入交互/中序递增序列看板与左神 Class 037 名师讲义/四语言代码精准联动
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { HighlightTarget } from '../../../core/step-visualizer';
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
  decision: string;
  phase: 'init' | 'check' | 'valid' | 'invalid';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export const VALID_BST_CODE_LINES = {
  entry: { java: 3, cpp: 4, python: 5, javascript: 1 },
  emptyCheck: { java: 4, cpp: 5, python: 6, javascript: 4 },
  checkLeft: { java: 6, cpp: 6, python: 8, javascript: 5 },
  comparePrev: { java: [8, 9], cpp: 7, python: [10, 11], javascript: 6 },
  updatePrev: { java: 11, cpp: 8, python: 12, javascript: 7 },
  checkRight: { java: 13, cpp: 9, python: 13, javascript: 8 },
  doneValid: { java: 13, cpp: 9, python: 13, javascript: 8 },
};

export function buildVBSteps(root: TreeNode | null): VBStep[] {
  const steps: VBStep[] = [];
  const sequence: number[] = [];
  let prevVal: number | null = null;
  let isValid = true;
  let invalidNode: number | null = null;

  // Step 0: 入口
  steps.push({
    tree: root,
    current: null,
    prev: null,
    sequence: [],
    valid: true,
    invalidNode: null,
    decision: '算法启动：初始化 BST 中序递增校验',
    phase: 'init',
    message: root
      ? `开始验证二叉搜索树，从根节点 ${root.val} 启动中序遍历，维护前驱指针 prev = null。`
      : '空树，直接判定为有效 BST。',
    log: root ? `isValidBST(root: ${root.val})` : 'root is null -> valid',
    codeLine: VALID_BST_CODE_LINES.entry,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      prev: null,
      sequence: [],
      valid: true,
      invalidNode: null,
      decision: '特判返回：空树是合法 BST',
      phase: 'valid',
      message: '✅ 空树默认满足二叉搜索树的所有定义，返回 true。',
      log: 'return true',
      codeLine: VALID_BST_CODE_LINES.emptyCheck,
    });
    return steps;
  }

  function inorder(node: TreeNode | null): boolean {
    if (!node || !isValid) return true;

    // 深入左子树
    if (node.left) {
      steps.push({
        tree: root,
        current: node.val,
        prev: prevVal,
        sequence: [...sequence],
        valid: true,
        invalidNode: null,
        decision: `深入节点 ${node.val} 的左子树`,
        phase: 'check',
        message: `中序遍历左中右规则：先深入节点 ${node.val} 的左子树进行单调性校验。`,
        log: `inorder left of ${node.val}`,
        codeLine: VALID_BST_CODE_LINES.checkLeft,
      });

      if (!inorder(node.left)) return false;
    }

    // 访问当前节点并与 prev 比较
    steps.push({
      tree: root,
      current: node.val,
      prev: prevVal,
      sequence: [...sequence],
      valid: true,
      invalidNode: null,
      decision: `考察节点 ${node.val} 并与前驱 prev 比较`,
      phase: 'check',
      message:
        prevVal === null
          ? `首次到达最左叶子节点 ${node.val}，前驱 prev 为 null，单调性检查通过。`
          : `检查节点 ${node.val} 与前驱 prev = ${prevVal}：要求严格大于 (${node.val} > ${prevVal})。`,
      log: prevVal === null ? `first node: ${node.val}` : `compare: cur ${node.val} vs prev ${prevVal}`,
      codeLine: VALID_BST_CODE_LINES.comparePrev,
    });

    if (prevVal !== null && node.val <= prevVal) {
      isValid = false;
      invalidNode = node.val;
      steps.push({
        tree: root,
        current: node.val,
        prev: prevVal,
        sequence: [...sequence, node.val],
        valid: false,
        invalidNode: node.val,
        decision: `🚨 发现单调性破损！节点 ${node.val} <= 前驱 ${prevVal}`,
        phase: 'invalid',
        message: `❌ 违规！节点 ${node.val} 未能严格大于前驱 prev (${prevVal})，破坏了 BST 中序递增性质，判定为非法 BST！`,
        log: `FAILED: node ${node.val} <= prev ${prevVal}`,
        codeLine: VALID_BST_CODE_LINES.comparePrev,
      });
      return false;
    }

    // 更新 prev 并记录当前节点
    prevVal = node.val;
    sequence.push(node.val);

    steps.push({
      tree: root,
      current: node.val,
      prev: prevVal,
      sequence: [...sequence],
      valid: true,
      invalidNode: null,
      decision: `单调性合格，更新前驱 prev = ${node.val}`,
      phase: 'check',
      message: `✅ 节点 ${node.val} 校验合格，已装入中序序列 [${sequence.join(', ')}]，更新 prev = ${node.val}。`,
      log: `prev = ${node.val}, sequence = [${sequence.join(', ')}]`,
      codeLine: VALID_BST_CODE_LINES.updatePrev,
    });

    // 深入右子树
    if (node.right) {
      steps.push({
        tree: root,
        current: node.val,
        prev: prevVal,
        sequence: [...sequence],
        valid: true,
        invalidNode: null,
        decision: `深入节点 ${node.val} 的右子树`,
        phase: 'check',
        message: `中序遍历推进：继续探索节点 ${node.val} 的右子树。`,
        log: `inorder right of ${node.val}`,
        codeLine: VALID_BST_CODE_LINES.checkRight,
      });

      if (!inorder(node.right)) return false;
    }

    return true;
  }

  const finalResult = inorder(root);

  if (finalResult) {
    steps.push({
      tree: root,
      current: null,
      prev: prevVal,
      sequence: [...sequence],
      valid: true,
      invalidNode: null,
      decision: 'BST 校验全部完成：确认合法',
      phase: 'valid',
      message: `🎉 全树中序遍历序列严格单调递增：[${sequence.join(', ')}]，成功判定为有效二叉搜索树！`,
      log: `SUCCESS: valid BST -> [${sequence.join(', ')}]`,
      metrics: { '判定结果': 'TRUE (合法 BST)' },
      codeLine: VALID_BST_CODE_LINES.doneValid,
    });
  }

  return steps;
}

export const validBstVisualizer = registerDeclarativeAlgorithm<VBStep>({
  id: 'valid-bst',
  aliases: ['tree-037-validate-bst'],
  name: '验证二叉搜索树',
  category: 'tree',
  icon: '🛡️',
  badge: {
    mode: '中序严格单调递增校验',
    complexity: 'O(n) · O(h)',
  },
  card1Title: '📊 二叉搜索树拓扑与染色沙盘',
  card2Title: '🧭 中序序列输出与单调性监视器',
  card2Desc: '当前考察节点、前驱 prev 状态与实时递增输出序列流',
  legend: [
    { label: '当前访问节点', color: '#fbbf24' },
    { label: '已验证中序节点', color: '#34d399' },
    { label: '违规异常节点', color: '#ef4444' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '5, 1, 4, null, null, 3, 6',
      width: '180px',
      placeholder: '5, 1, 4, null, null, 3, 6',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 2: 非法 BST (5, 1, 4, null, null, 3, 6)',
      values: { 'input-tree': '5, 1, 4, null, null, 3, 6' },
      description: '右孩子 4 小于根节点 5，非法',
    },
    {
      label: 'LeetCode 示例 1: 合法 BST (2, 1, 3)',
      values: { 'input-tree': '2, 1, 3' },
      description: '标准经典合法 BST',
    },
    {
      label: '多层完整合法 BST (10, 5, 15, 3, 7, 12, 18)',
      values: { 'input-tree': '10, 5, 15, 3, 7, 12, 18' },
      description: '三层饱满 BST，中序严格递增',
    },
    {
      label: '隐蔽跨层违规 (10, 5, 15, null, null, 6, 20)',
      values: { 'input-tree': '10, 5, 15, null, null, 6, 20' },
      description: '节点 6 虽然小于 15，但小于根节点 10，违规',
    },
  ],
  metrics: [
    { id: 'cur-node', label: '当前节点', color: '#f59e0b' },
    { id: 'prev-node', label: '前驱节点 prev', color: '#2563eb' },
    { id: 'bst-result', label: '合法性判定', color: '#16a34a' },
  ],
  codeLanguages: VALID_BST_CODE_LANGUAGES,
  problemHtml: VALID_BST_PROBLEM_HTML,
  analysisHtml: VALID_BST_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const raw = inputs?.['input-tree'] || inputs?.['tree'] || '5, 1, 4, null, null, 3, 6';
    const arr = parseTreeArray(raw, [5, 1, 4, null, null, 3, 6]);
    const root = buildTree(arr);
    return buildVBSteps(root);
  },
  buildSteps: (inputs) => {
    const raw = inputs?.['input-tree'] || inputs?.['tree'] || '5, 1, 4, null, null, 3, 6';
    const arr = parseTreeArray(raw, [5, 1, 4, null, null, 3, 6]);
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

    const root = container.closest('#algo-valid-bst-view') || container.parentElement;
    if (root) {
      const curEl = root.querySelector('#metric-cur-node');
      const prevEl = root.querySelector('#metric-prev-node');
      const resEl = root.querySelector('#metric-bst-result') as HTMLElement | null;

      if (curEl) curEl.textContent = step.current != null ? `${step.current}` : '—';
      if (prevEl) prevEl.textContent = step.prev != null ? `${step.prev}` : 'null (首节点)';
      if (resEl) {
        resEl.textContent = step.valid ? '单调递增正常' : '违规非法 (False)';
        resEl.style.color = step.valid ? '#16a34a' : '#ef4444';
      }

      // 在 Card 2 中展示中序输出序列与前驱比较
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const sequenceBadges =
          step.sequence.length > 0
            ? step.sequence
                .map(
                  (v, idx) => `
                <div style="display: flex; align-items: center;">
                  <span style="padding: 3px 8px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: monospace;">${v}</span>
                  ${idx < step.sequence.length - 1 ? '<span style="color: #94a3b8; font-size: 10px; margin: 0 4px;">&lt;</span>' : ''}
                </div>`
                )
                .join('')
            : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">等待首个中序节点...</span>';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 8px; padding: 6px 0;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 11px; font-weight: 700; color: #334155;">当前中序遍历序列 (需严格递增):</span>
              <span style="padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; background: ${step.valid ? '#dcfce7' : '#fee2e2'}; color: ${step.valid ? '#15803d' : '#b91c1c'};">
                ${step.valid ? '递增良好' : '单调性破坏'}
              </span>
            </div>

            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
              ${sequenceBadges}
            </div>

            <div style="padding: 8px 10px; background: #f1f5f9; border-radius: 6px; font-size: 11px; color: #475569;">
              <div style="font-weight: 700; color: #1e293b; margin-bottom: 2px;">🧭 当前决策: ${step.decision}</div>
              <div>${step.message}</div>
            </div>
          </div>
        `;
      }
    }
  },
});