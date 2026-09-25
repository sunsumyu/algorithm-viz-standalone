/**
 * 二叉树最近公共祖先 (LCA) 可视化器 (Lowest Common Ancestor · LeetCode 236 / Class 037 Code01)
 * 采用顶层声明式架构与双版本综合长处整合 (Bi-Version Synthesis)
 * 融合原 LCA 输入控件/自适应 SVG 画布与左神 Class 037 后序自底向上汇聚讲义与四语言代码联动
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { HighlightTarget } from '../../../core/step-visualizer';
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
  decision: string;
  action: 'enter' | 'hit-target' | 'left-done' | 'right-done' | 'merge' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export const LCA_CODE_LINES = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  baseCheck: { java: 3, cpp: 4, python: [3, 4], javascript: 2 },
  leftCall: { java: 4, cpp: 5, python: 5, javascript: 3 },
  rightCall: { java: 5, cpp: 6, python: 6, javascript: 4 },
  splitLCA: { java: 6, cpp: 7, python: [7, 8], javascript: 5 },
  singlePass: { java: 7, cpp: 8, python: 9, javascript: 6 },
  done: { java: 7, cpp: 8, python: 9, javascript: 6 },
};

export function buildLCASteps(root: TreeNode | null, pVal: number, qVal: number): LCAStep[] {
  const steps: LCAStep[] = [];
  let foundLCA: number | null = null;

  // Step 0: 入口
  steps.push({
    tree: root,
    current: null,
    p: pVal,
    q: qVal,
    leftReturn: null,
    rightReturn: null,
    lcaResult: null,
    decision: '算法启动：初始化 LCA 递归查找',
    action: 'enter',
    message: root
      ? `寻找节点 p = ${pVal} 与 q = ${qVal} 的最近公共祖先，从根节点 ${root.val} 开始后序递归。`
      : '空树，直接返回 null。',
    log: root ? `lowestCommonAncestor(root: ${root.val}, p: ${pVal}, q: ${qVal})` : 'root is null -> null',
    codeLine: LCA_CODE_LINES.entry,
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
      decision: '特判返回：树为空',
      action: 'done',
      message: '树为空，无公共祖先，返回 null。',
      log: 'return null',
      codeLine: LCA_CODE_LINES.baseCheck,
    });
    return steps;
  }

  function postOrder(node: TreeNode | null): number | null {
    if (!node) return null;

    // Step: 访问当前节点
    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: null,
      rightReturn: null,
      lcaResult: foundLCA,
      decision: `考察节点 ${node.val}`,
      action: 'enter',
      message: `递归到达节点 ${node.val}，检查是否为 null 或命中目标节点 p (${pVal}) / q (${qVal})。`,
      log: `visit node: ${node.val}`,
      codeLine: LCA_CODE_LINES.baseCheck,
    });

    // 命中目标节点 (base case)
    if (node.val === pVal || node.val === qVal) {
      steps.push({
        tree: root,
        current: node.val,
        p: pVal,
        q: qVal,
        leftReturn: null,
        rightReturn: null,
        lcaResult: foundLCA,
        decision: `命中目标节点 ${node.val}`,
        action: 'hit-target',
        message: `🎯 节点 ${node.val} 匹配目标 (${node.val === pVal ? `p=${pVal}` : `q=${qVal}`})，直接向上返回 ${node.val}。`,
        log: `hit target: ${node.val} -> return ${node.val}`,
        codeLine: LCA_CODE_LINES.baseCheck,
      });
      return node.val;
    }

    // 深入左子树
    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: null,
      rightReturn: null,
      lcaResult: foundLCA,
      decision: `深入节点 ${node.val} 的左子树`,
      action: 'enter',
      message: `向下探索节点 ${node.val} 的左子树...`,
      log: `explore left of ${node.val}`,
      codeLine: LCA_CODE_LINES.leftCall,
    });

    const leftRet = postOrder(node.left);

    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: leftRet,
      rightReturn: null,
      lcaResult: foundLCA,
      decision: `左子树返回: ${leftRet !== null ? leftRet : 'null'}`,
      action: 'left-done',
      message: `节点 ${node.val} 的左子树探测完毕，返回值为 ${leftRet !== null ? leftRet : 'null'}。`,
      log: `leftRet = ${leftRet}`,
      codeLine: LCA_CODE_LINES.leftCall,
    });

    // 深入右子树
    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: leftRet,
      rightReturn: null,
      lcaResult: foundLCA,
      decision: `深入节点 ${node.val} 的右子树`,
      action: 'enter',
      message: `向下探索节点 ${node.val} 的右子树...`,
      log: `explore right of ${node.val}`,
      codeLine: LCA_CODE_LINES.rightCall,
    });

    const rightRet = postOrder(node.right);

    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: leftRet,
      rightReturn: rightRet,
      lcaResult: foundLCA,
      decision: `右子树返回: ${rightRet !== null ? rightRet : 'null'}`,
      action: 'right-done',
      message: `节点 ${node.val} 的右子树探测完毕，返回值为 ${rightRet !== null ? rightRet : 'null'}。`,
      log: `rightRet = ${rightRet}`,
      codeLine: LCA_CODE_LINES.rightCall,
    });

    // 汇总左右子树结果
    if (leftRet !== null && rightRet !== null) {
      foundLCA = node.val;
      steps.push({
        tree: root,
        current: node.val,
        p: pVal,
        q: qVal,
        leftReturn: leftRet,
        rightReturn: rightRet,
        lcaResult: foundLCA,
        decision: `🎉 左右分叉交汇！节点 ${node.val} 即为最近公共祖先 (LCA)`,
        action: 'merge',
        message: `左右子树均返回非空（left=${leftRet}, right=${rightRet}），说明目标节点分属两侧，节点 ${node.val} 就是 LCA！`,
        log: `⭐ LCA FOUND: ${node.val}`,
        codeLine: LCA_CODE_LINES.splitLCA,
      });
      return node.val;
    }

    const ret = leftRet !== null ? leftRet : rightRet;
    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: leftRet,
      rightReturn: rightRet,
      lcaResult: foundLCA,
      decision: `单侧向上传递: ${ret !== null ? ret : 'null'}`,
      action: 'merge',
      message: `节点 ${node.val} 左右汇聚：非双向交汇，将非空分支 ${ret !== null ? ret : 'null'} 向上传递。`,
      log: `pass up: ${ret}`,
      codeLine: LCA_CODE_LINES.singlePass,
    });

    return ret;
  }

  const finalLCA = postOrder(root);

  steps.push({
    tree: root,
    current: finalLCA,
    p: pVal,
    q: qVal,
    leftReturn: null,
    rightReturn: null,
    lcaResult: finalLCA,
    decision: 'LCA 查找全部结束',
    action: 'done',
    message:
      finalLCA !== null
        ? `✅ 查找完成！节点 p = ${pVal} 与 q = ${qVal} 的最近公共祖先为 【${finalLCA}】。`
        : '查找完成，未在树中找到公共祖先。',
    log: `done lca=${finalLCA}`,
    metrics: { '最终结果': finalLCA !== null ? `TreeNode(${finalLCA})` : 'null' },
    codeLine: LCA_CODE_LINES.done,
  });

  return steps;
}

export const lcaVisualizer = registerDeclarativeAlgorithm<LCAStep>({
  id: 'lca',
  aliases: ['tree-037-lowest-common-ancestor'],
  name: '二叉树的最近公共祖先',
  category: 'tree',
  icon: '🤝',
  badge: {
    mode: '后序自底向上回溯',
    complexity: 'O(n) · O(h)',
  },
  card1Title: '📊 二叉树拓扑与 LCA 汇聚沙盘',
  card2Title: '🧭 左右子树返回与祖先判定状态机',
  card2Desc: '后序遍历中 left 与 right 返回值归并逻辑实时监视',
  legend: [
    { label: '目标节点 p / q', color: '#fbbf24' },
    { label: '当前访问节点', color: '#3b82f6' },
    { label: '已捕获 LCA', color: '#16a34a' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4',
      width: '180px',
      placeholder: '3, 5, 1, 6...',
    },
    {
      id: 'input-p',
      label: '节点 p',
      type: 'number',
      defaultValue: 5,
      width: '50px',
    },
    {
      id: 'input-q',
      label: '节点 q',
      type: 'number',
      defaultValue: 1,
      width: '50px',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 1: 根为 LCA (p=5, q=1)',
      values: {
        'input-tree': '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4',
        'input-p': 5,
        'input-q': 1,
      },
      description: 'p、q 分属根节点左右两侧，LCA = 3',
    },
    {
      label: 'LeetCode 示例 2: 同侧祖先 (p=5, q=4)',
      values: {
        'input-tree': '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4',
        'input-p': 5,
        'input-q': 4,
      },
      description: 'q 在 p 的子树内，LCA 为自身 (5)',
    },
    {
      label: '经典三节点树 (p=2, q=3)',
      values: {
        'input-tree': '1, 2, 3',
        'input-p': 2,
        'input-q': 3,
      },
      description: '简单满二叉树，根为 LCA (1)',
    },
    {
      label: '单链倾斜树 (p=3, q=4)',
      values: {
        'input-tree': '1, 2, null, 3, null, 4',
        'input-p': 3,
        'input-q': 4,
      },
      description: '左斜树垂直串联，LCA = 3',
    },
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
  generateSteps: (inputs) => {
    const raw = inputs?.['input-tree'] || inputs?.['tree'] || '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4';
    const arr = parseTreeArray(raw, [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
    const root = buildTree(arr);
    const p = parseInt(String(inputs?.['input-p'] ?? inputs?.['p'] ?? '5'), 10);
    const q = parseInt(String(inputs?.['input-q'] ?? inputs?.['q'] ?? '1'), 10);
    return buildLCASteps(root, p, q);
  },
  buildSteps: (inputs) => {
    const raw = inputs?.['input-tree'] || inputs?.['tree'] || '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4';
    const arr = parseTreeArray(raw, [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
    const root = buildTree(arr);
    const p = parseInt(String(inputs?.['input-p'] ?? inputs?.['p'] ?? '5'), 10);
    const q = parseInt(String(inputs?.['input-q'] ?? inputs?.['q'] ?? '1'), 10);
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

    const root = container.closest('#algo-lca-view') || container.parentElement;
    if (root) {
      const curEl = root.querySelector('#metric-cur-node');
      const lEl = root.querySelector('#metric-left-ret');
      const rEl = root.querySelector('#metric-right-ret');
      const lcaEl = root.querySelector('#metric-lca-val') as HTMLElement | null;

      if (curEl) curEl.textContent = step.current != null ? `${step.current}` : '—';
      if (lEl) lEl.textContent = step.leftReturn != null ? `${step.leftReturn}` : 'null';
      if (rEl) rEl.textContent = step.rightReturn != null ? `${step.rightReturn}` : 'null';
      if (lcaEl) {
        lcaEl.textContent = step.lcaResult != null ? `${step.lcaResult}` : '未捕获';
        lcaEl.style.color = step.lcaResult != null ? '#16a34a' : '#64748b';
      }

      // 在 Card 2 中展示回溯合并规则与当前状态
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #475569; padding: 6px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px;">
              <span style="font-weight: 700; color: #92400e;">🎯 检索目标节点对:</span>
              <span style="font-family: monospace; font-size: 12px; font-weight: 700; color: #b45309;">p = ${step.p}，q = ${step.q}</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                <span style="font-size: 10.5px; color: #64748b;">左子树 leftRet:</span>
                <div style="font-weight: 700; font-size: 12px; color: ${step.leftReturn != null ? '#2563eb' : '#94a3b8'};">
                  ${step.leftReturn != null ? step.leftReturn : 'null'}
                </div>
              </div>
              <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                <span style="font-size: 10.5px; color: #64748b;">右子树 rightRet:</span>
                <div style="font-weight: 700; font-size: 12px; color: ${step.rightReturn != null ? '#0d9488' : '#94a3b8'};">
                  ${step.rightReturn != null ? step.rightReturn : 'null'}
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