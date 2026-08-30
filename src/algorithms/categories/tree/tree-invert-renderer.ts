/**
 * 翻转二叉树可视化器 — 4-Card 标准现代架构
 * 递归遍历、左右孩子指针互换、动态树结构更新与日志追踪
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  TREE_INVERT_PROBLEM_HTML,
  TREE_INVERT_ANALYSIS_HTML,
  TREE_INVERT_CODE_LANGUAGES,
} from './tree-invert-problem-content';
import { TreeNode, buildTreeFromArr as buildTree, renderTreeSVG } from './tree-template';
import template from './tree-invert.html?raw';

export interface InvertStep {
  tree: TreeNode | null;
  current: number | null;
  leftVal: number | null;
  rightVal: number | null;
  invertedCount: number;
  isSwapping: boolean;
  action: 'enter' | 'swap' | 'leave' | 'done';
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

export function buildTreeInvertSteps(root: TreeNode | null): InvertStep[] {
  const steps: InvertStep[] = [];
  const workingTree = cloneTree(root);
  let invertedCount = 0;

  steps.push({
    tree: cloneTree(workingTree),
    current: null,
    leftVal: null,
    rightVal: null,
    invertedCount: 0,
    isSwapping: false,
    action: 'enter',
    message: workingTree ? `初始化翻转二叉树：从根节点 ${workingTree.val} 开始递归。` : '空树，无需翻转。',
    log: workingTree ? '开始翻转二叉树' : '空树',
    codeLine: 2,
  });

  if (!workingTree) {
    steps.push({
      tree: null,
      current: null,
      leftVal: null,
      rightVal: null,
      invertedCount: 0,
      isSwapping: false,
      action: 'done',
      message: '✅ 翻转完成，返回 null。',
      log: '✓ 翻转完成 (null)',
      codeLine: 3,
    });
    return steps;
  }

  const invert = (node: TreeNode | null) => {
    if (!node) return;

    const lVal = node.left ? node.left.val : null;
    const rVal = node.right ? node.right.val : null;

    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      leftVal: lVal,
      rightVal: rVal,
      invertedCount,
      isSwapping: false,
      action: 'enter',
      message: `进入节点 ${node.val}：准备互换其左孩子 (${lVal ?? 'null'}) 与右孩子 (${rVal ?? 'null'})。`,
      log: `进入 ${node.val} (L=${lVal ?? 'null'}, R=${rVal ?? 'null'})`,
      codeLine: [4, 5],
    });

    // 交换左右子树
    const temp = node.left;
    node.left = node.right;
    node.right = temp;
    invertedCount++;

    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      leftVal: node.left ? node.left.val : null,
      rightVal: node.right ? node.right.val : null,
      invertedCount,
      isSwapping: true,
      action: 'swap',
      message: `互换完成：节点 ${node.val} 的左孩子变为 ${node.left ? node.left.val : 'null'}，右孩子变为 ${
        node.right ? node.right.val : 'null'
      }。`,
      log: `节点 ${node.val} 左右互换完成`,
      codeLine: [6, 7],
    });

    invert(node.left);
    invert(node.right);

    steps.push({
      tree: cloneTree(workingTree),
      current: node.val,
      leftVal: node.left ? node.left.val : null,
      rightVal: node.right ? node.right.val : null,
      invertedCount,
      isSwapping: false,
      action: 'leave',
      message: `离开节点 ${node.val}（该子树左右翻转完毕）。`,
      log: `离开 ${node.val}`,
      codeLine: [9, 10],
    });
  };

  invert(workingTree);

  steps.push({
    tree: cloneTree(workingTree),
    current: null,
    leftVal: null,
    rightVal: null,
    invertedCount,
    isSwapping: false,
    action: 'done',
    message: `🎉 翻转二叉树全部完成！共翻转 ${invertedCount} 个子树节点。`,
    log: `✓ 全部翻转完成`,
    codeLine: 11,
  });

  return steps;
}

export class TreeInvertVisualizer extends StepVisualizer<InvertStep> {
  protected codeLanguages = TREE_INVERT_CODE_LANGUAGES;
  protected codeLines = TREE_INVERT_CODE_LANGUAGES['java'];
  protected codePanelTitle = '翻转二叉树 代码调试';

  private treeSvgContainer: HTMLElement | null = null;
  private metricCurrEl: HTMLElement | null = null;
  private metricLeftEl: HTMLElement | null = null;
  private metricRightEl: HTMLElement | null = null;
  private metricInvertedCountEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.treeSvgContainer = this.root.querySelector('#ti-tree-svg-container');
    this.metricCurrEl = this.root.querySelector('#metric-curr');
    this.metricLeftEl = this.root.querySelector('#metric-left');
    this.metricRightEl = this.root.querySelector('#metric-right');
    this.metricInvertedCountEl = this.root.querySelector('#metric-inverted-count');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#ti-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.ti-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const treeInput = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
        if (treeInput && btn.dataset.tree) treeInput.value = btn.dataset.tree;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: TREE_INVERT_PROBLEM_HTML,
      analysisHtml: TREE_INVERT_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  private parseTreeInput(raw: string): (number | null)[] {
    return raw
      .split(/[,，\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => (s === 'null' || s === '#' ? null : parseInt(s, 10)))
      .filter((n) => n === null || !isNaN(n));
  }

  protected buildSteps(): InvertStep[] {
    const treeInput = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
    const raw = treeInput?.value || '4, 2, 7, 1, 3, 6, 9';
    const arr = this.parseTreeInput(raw);
    const root = buildTree(arr);
    return buildTreeInvertSteps(root);
  }

  protected renderStep(step: InvertStep): void {
    const { tree, current, leftVal, rightVal, invertedCount, isSwapping, action, message } = step;

    // 1. 渲染 SVG 树拓扑
    if (this.treeSvgContainer) {
      const highlight = current != null ? new Set([current]) : new Set<number>();
      const secondaryHighlight = new Set<number>();
      if (leftVal != null) secondaryHighlight.add(leftVal);
      if (rightVal != null) secondaryHighlight.add(rightVal);

      renderTreeSVG(
        this.treeSvgContainer,
        tree,
        highlight,
        isSwapping ? '#f43f5e' : '#fbbf24',
        secondaryHighlight,
        '#3b82f6',
      );
    }

    // 2. 更新状态监视器
    if (this.metricCurrEl) this.metricCurrEl.textContent = current != null ? `${current}` : '—';
    if (this.metricLeftEl) this.metricLeftEl.textContent = leftVal != null ? `${leftVal}` : 'null';
    if (this.metricRightEl) this.metricRightEl.textContent = rightVal != null ? `${rightVal}` : 'null';
    if (this.metricInvertedCountEl) this.metricInvertedCountEl.textContent = `${invertedCount}`;

    if (this.formulaActionEl) {
      if (isSwapping) {
        this.formulaActionEl.textContent = `swap(node.left, node.right) (${leftVal} ⇋ ${rightVal})`;
      } else if (action === 'done') {
        this.formulaActionEl.textContent = '翻转二叉树完成';
      } else {
        this.formulaActionEl.textContent = 'swap(root.left, root.right)';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let bg =
          st.action === 'done' ? '#f0fdf4' : st.isSwapping ? '#fff1f2' : '#eff6ff';
        let color =
          st.action === 'done' ? '#15803d' : st.isSwapping ? '#e11d48' : '#1d4ed8';
        let border =
          st.action === 'done' ? '#bbf7d0' : st.isSwapping ? '#fecdd3' : '#bfdbfe';
        return `<div style="padding: 4px 8px; border-radius: 6px; background: ${bg}; color: ${color}; border: 1px solid ${border}; margin-bottom: 4px;">
          <span style="color:#94a3b8;">[Step ${idx + 1}]</span> ${st.log}
        </div>`;
      });
      this.logContainer.innerHTML = logs.join('');
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.currentIndex + 1} 条记录`;
      }
    }

    const badgeInvert = this.root?.querySelector('#badge-inverted-count');
    if (badgeInvert) {
      badgeInvert.textContent = action === 'done' ? '翻转完成' : `已翻转: ${invertedCount} 个`;
    }
  }
}

registerAlgorithm({
  id: 'tree-invert',
  name: '翻转二叉树',
  viewId: 'algo-tree-invert-view',
  category: 'tree',
  description: '递归遍历二叉树并互换每一个节点的左右子节点',
  icon: '🔄',
  difficulty: 1,
  levelOrder: 7,
  learningGoal: '掌握二叉树子节点指针交换与递归翻转的基本思路',
  template,
  Visualizer: TreeInvertVisualizer,
});