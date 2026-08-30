/**
 * 二叉搜索树中的搜索可视化器 — 4-Card 标准现代架构
 * 单向剪枝查找、路径与目标子树高亮、即时命中判定
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  BST_SEARCH_PROBLEM_HTML,
  BST_SEARCH_ANALYSIS_HTML,
  BST_SEARCH_CODE_LANGUAGES,
} from './bst-search-problem-content';
import { TreeNode, buildTreeFromArr as buildTree, renderTreeSVG } from './tree-template';
import template from './bst-search.html?raw';

export interface BSTSStep {
  tree: TreeNode | null;
  current: number | null;
  val: number;
  decision: string;
  found: boolean;
  path: number[];
  targetSubtree: TreeNode | null;
  action: 'enter' | 'left' | 'right' | 'found' | 'not-found' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildBSTSearchSteps(root: TreeNode | null, targetVal: number): BSTSStep[] {
  const steps: BSTSStep[] = [];
  const path: number[] = [];
  let found = false;
  let targetSubtree: TreeNode | null = null;

  steps.push({
    tree: root,
    current: null,
    val: targetVal,
    decision: '准备搜索',
    found: false,
    path: [],
    targetSubtree: null,
    action: 'enter',
    message: root ? `初始化 BST 搜索：目标值 val = ${targetVal}，从根节点 ${root.val} 开始定位。` : '空树，返回 null。',
    log: root ? `开始搜索 val = ${targetVal}` : '空树 -> null',
    codeLine: 2,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      val: targetVal,
      decision: '未找到',
      found: false,
      path: [],
      targetSubtree: null,
      action: 'not-found',
      message: '❌ 空树中无法找到目标值，返回 null。',
      log: '✓ 未找到目标 (null)',
      codeLine: 3,
    });
    return steps;
  }

  let curr: TreeNode | null = root;

  while (curr !== null) {
    path.push(curr.val);

    if (curr.val === targetVal) {
      found = true;
      targetSubtree = curr;

      steps.push({
        tree: root,
        current: curr.val,
        val: targetVal,
        decision: '命中目标',
        found: true,
        path: [...path],
        targetSubtree: curr,
        action: 'found',
        message: `🎯 命中目标！节点 ${curr.val} == ${targetVal}，返回以此节点为根的子树。`,
        log: `✓ 命中目标: ${curr.val} == ${targetVal}`,
        codeLine: 3,
      });
      break;
    } else if (targetVal < curr.val) {
      steps.push({
        tree: root,
        current: curr.val,
        val: targetVal,
        decision: '转向左子树',
        found: false,
        path: [...path],
        targetSubtree: null,
        action: 'left',
        message: `目标值 ${targetVal} < 当前节点 ${curr.val}，根据 BST 有序性，目标只可能在左子树。`,
        log: `${targetVal} < ${curr.val} -> 搜左子树`,
        codeLine: [4, 5],
      });
      curr = curr.left;
    } else {
      steps.push({
        tree: root,
        current: curr.val,
        val: targetVal,
        decision: '转向右子树',
        found: false,
        path: [...path],
        targetSubtree: null,
        action: 'right',
        message: `目标值 ${targetVal} > 当前节点 ${curr.val}，根据 BST 有序性，目标只可能在右子树。`,
        log: `${targetVal} > ${curr.val} -> 搜右子树`,
        codeLine: [6, 7],
      });
      curr = curr.right;
    }
  }

  if (!found) {
    steps.push({
      tree: root,
      current: null,
      val: targetVal,
      decision: '未找到',
      found: false,
      path: [...path],
      targetSubtree: null,
      action: 'not-found',
      message: `❌ 到达空子树 (null)，目标值 ${targetVal} 不存在于该二叉搜索树中，返回 null。`,
      log: `✓ 未找到目标 (null)`,
      codeLine: 3,
    });
  }

  return steps;
}

export class BstSearchVisualizer extends StepVisualizer<BSTSStep> {
  protected codeLanguages = BST_SEARCH_CODE_LANGUAGES;
  protected codeLines = BST_SEARCH_CODE_LANGUAGES['java'];
  protected codePanelTitle = '二叉搜索树搜索 代码调试';

  private treeSvgContainer: HTMLElement | null = null;
  private metricCurrEl: HTMLElement | null = null;
  private metricValEl: HTMLElement | null = null;
  private metricDecisionEl: HTMLElement | null = null;
  private metricVerdictEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.treeSvgContainer = this.root.querySelector('#bsts-tree-svg-container');
    this.metricCurrEl = this.root.querySelector('#metric-curr');
    this.metricValEl = this.root.querySelector('#metric-val');
    this.metricDecisionEl = this.root.querySelector('#metric-decision');
    this.metricVerdictEl = this.root.querySelector('#metric-verdict');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#bsts-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.bsts-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const treeInput = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
        const targetInput = this.root?.querySelector('#input-target') as HTMLInputElement | null;
        if (treeInput && btn.dataset.tree) treeInput.value = btn.dataset.tree;
        if (targetInput && btn.dataset.t) targetInput.value = btn.dataset.t;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: BST_SEARCH_PROBLEM_HTML,
      analysisHtml: BST_SEARCH_ANALYSIS_HTML,
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

  protected buildSteps(): BSTSStep[] {
    const treeInput = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
    const targetInput = this.root?.querySelector('#input-target') as HTMLInputElement | null;
    const raw = treeInput?.value || '4, 2, 7, 1, 3';
    const t = parseInt(targetInput?.value || '2', 10);
    const arr = this.parseTreeInput(raw);
    const root = buildTree(arr);
    return buildBSTSearchSteps(root, isNaN(t) ? 2 : t);
  }

  protected renderStep(step: BSTSStep): void {
    const { tree, current, val, decision, found, path, action, message } = step;

    // 1. 渲染 SVG 树拓扑
    if (this.treeSvgContainer) {
      const highlight = current != null ? new Set([current]) : new Set<number>();
      const secondaryHighlight = new Set<number>(path);
      const secondaryColor = found ? '#10b981' : '#3b82f6';

      renderTreeSVG(
        this.treeSvgContainer,
        tree,
        highlight,
        found ? '#10b981' : '#fbbf24',
        secondaryHighlight,
        secondaryColor,
      );
    }

    // 2. 更新状态监视器
    if (this.metricCurrEl) this.metricCurrEl.textContent = current != null ? `${current}` : '—';
    if (this.metricValEl) this.metricValEl.textContent = `${val}`;
    if (this.metricDecisionEl) this.metricDecisionEl.textContent = decision;
    if (this.metricVerdictEl) {
      if (found) {
        this.metricVerdictEl.textContent = `命中节点 [${current}]`;
        this.metricVerdictEl.style.color = '#10b981';
      } else if (action === 'not-found') {
        this.metricVerdictEl.textContent = '不存在 (null)';
        this.metricVerdictEl.style.color = '#ef4444';
      } else {
        this.metricVerdictEl.textContent = '搜索中...';
        this.metricVerdictEl.style.color = '#2563eb';
      }
    }

    if (this.formulaActionEl) {
      if (found) {
        this.formulaActionEl.textContent = `命中: root.val == ${val} -> return root`;
      } else if (action === 'left') {
        this.formulaActionEl.textContent = `${val} < ${current} -> searchBST(root.left, ${val})`;
      } else if (action === 'right') {
        this.formulaActionEl.textContent = `${val} > ${current} -> searchBST(root.right, ${val})`;
      } else if (action === 'not-found') {
        this.formulaActionEl.textContent = 'root == null -> return null';
      } else {
        this.formulaActionEl.textContent = 'val < root.val ? search(left) : search(right)';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let bg =
          st.found ? '#f0fdf4' : st.action === 'not-found' ? '#fff1f2' : '#eff6ff';
        let color =
          st.found ? '#15803d' : st.action === 'not-found' ? '#e11d48' : '#1d4ed8';
        let border =
          st.found ? '#bbf7d0' : st.action === 'not-found' ? '#fecdd3' : '#bfdbfe';
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

    const badgeVerdict = this.root?.querySelector('#badge-verdict');
    if (badgeVerdict) {
      badgeVerdict.textContent =
        found ? `命中节点 [${current}]` : action === 'not-found' ? '未找到 (null)' : '搜索中...';
    }
  }
}

registerAlgorithm({
  id: 'bst-search',
  name: 'BST 节点搜索',
  viewId: 'algo-bst-search-view',
  category: 'tree',
  description: '利用二叉搜索树的单调有序性进行快速节点搜索与子树返回',
  icon: '🔍',
  difficulty: 1,
  levelOrder: 8,
  learningGoal: '掌握基于 BST 性质的单向剪枝搜索模型',
  template,
  Visualizer: BstSearchVisualizer,
});
