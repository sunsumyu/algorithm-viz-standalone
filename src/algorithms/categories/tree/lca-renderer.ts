/**
 * 二叉树最近公共祖先 (LCA) 可视化器 — 4-Card 标准现代架构
 * 后序自底向上回溯、左右子树结果合并、祖先交汇即时捕获
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  LCA_PROBLEM_HTML,
  LCA_ANALYSIS_HTML,
  LCA_CODE_LANGUAGES,
} from './lca-problem-content';
import { TreeNode, buildTreeFromArr as buildTree, renderTreeSVG } from './tree-template';
import template from './lca.html?raw';

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
      message: `节点 ${node.val} 的左子树回溯返回：${left != null ? `已发现 ${left}` : 'null'}。开始检索右子树。`,
      log: `节点 ${node.val}: left = ${left != null ? left : 'null'}`,
      codeLine: [4, 5],
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
      message: `节点 ${node.val} 的右子树回溯返回：${right != null ? `已发现 ${right}` : 'null'}。开始合并判定。`,
      log: `节点 ${node.val}: right = ${right != null ? right : 'null'}`,
      codeLine: [5, 6],
    });

    let res: number | null = null;
    if (left !== null && right !== null) {
      res = node.val;
      foundLCA = node.val;
      steps.push({
        tree: root,
        current: node.val,
        p: pVal,
        q: qVal,
        leftReturn: left,
        rightReturn: right,
        lcaResult: res,
        action: 'merge',
        message: `✨ 左右子树均非空 (left=${left}, right=${right})！当前节点 ${node.val} 正是 p(${pVal}) 和 q(${qVal}) 的最近公共祖先（LCA）！`,
        log: `✓ 锁定 LCA: ${node.val}`,
        codeLine: 6,
      });
    } else {
      res = left !== null ? left : right;
      steps.push({
        tree: root,
        current: node.val,
        p: pVal,
        q: qVal,
        leftReturn: left,
        rightReturn: right,
        lcaResult: foundLCA,
        action: 'merge',
        message: `单侧有值或均空：返回 ${res != null ? res : 'null'} 至上一层。`,
        log: `节点 ${node.val}: 返回 ${res != null ? res : 'null'}`,
        codeLine: 7,
      });
    }

    return res;
  };

  const finalLCA = findLCA(root);

  steps.push({
    tree: root,
    current: null,
    p: pVal,
    q: qVal,
    leftReturn: null,
    rightReturn: null,
    lcaResult: finalLCA,
    action: 'done',
    message: finalLCA != null
      ? `🎉 搜索成功！节点 ${pVal} 和 ${qVal} 的最近公共祖先是 ${finalLCA}。`
      : '❌ 未找到最近公共祖先。',
    log: finalLCA != null ? `✓ LCA = ${finalLCA}` : '✗ 未找到',
    codeLine: 2,
  });

  return steps;
}

export class LCAVisualizer extends StepVisualizer<LCAStep> {
  protected codeLanguages = LCA_CODE_LANGUAGES;
  protected codeLines = LCA_CODE_LANGUAGES['java'];
  protected codePanelTitle = '二叉树最近公共祖先 代码调试';

  private treeSvgContainer: HTMLElement | null = null;
  private metricCurrEl: HTMLElement | null = null;
  private metricLeftEl: HTMLElement | null = null;
  private metricRightEl: HTMLElement | null = null;
  private metricLCAResultEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.treeSvgContainer = this.root.querySelector('#lca-tree-svg-container');
    this.metricCurrEl = this.root.querySelector('#metric-curr');
    this.metricLeftEl = this.root.querySelector('#metric-left');
    this.metricRightEl = this.root.querySelector('#metric-right');
    this.metricLCAResultEl = this.root.querySelector('#metric-lca-result');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#lca-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.lca-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const treeInput = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
        const pInput = this.root?.querySelector('#input-p') as HTMLInputElement | null;
        const qInput = this.root?.querySelector('#input-q') as HTMLInputElement | null;
        if (treeInput && btn.dataset.tree) treeInput.value = btn.dataset.tree;
        if (pInput && btn.dataset.p) pInput.value = btn.dataset.p;
        if (qInput && btn.dataset.q) qInput.value = btn.dataset.q;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: LCA_PROBLEM_HTML,
      analysisHtml: LCA_ANALYSIS_HTML,
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

  protected buildSteps(): LCAStep[] {
    const treeInput = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
    const pInput = this.root?.querySelector('#input-p') as HTMLInputElement | null;
    const qInput = this.root?.querySelector('#input-q') as HTMLInputElement | null;
    const raw = treeInput?.value || '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4';
    const p = parseInt(pInput?.value || '5', 10);
    const q = parseInt(qInput?.value || '1', 10);
    const arr = this.parseTreeInput(raw);
    const root = buildTree(arr);
    return buildLCASteps(root, isNaN(p) ? 5 : p, isNaN(q) ? 1 : q);
  }

  protected renderStep(step: LCAStep): void {
    const { tree, current, p, q, leftReturn, rightReturn, lcaResult, action, message } = step;

    // 1. 渲染 SVG 树拓扑
    if (this.treeSvgContainer) {
      const highlight = current != null ? new Set([current]) : new Set<number>();
      const secondaryHighlight = new Set<number>();
      if (p != null) secondaryHighlight.add(p);
      if (q != null) secondaryHighlight.add(q);
      if (lcaResult != null) secondaryHighlight.add(lcaResult);

      const labels = new Map<number, string>();
      if (p != null) labels.set(p, 'p');
      if (q != null) labels.set(q, 'q');
      if (lcaResult != null) labels.set(lcaResult, 'LCA');

      renderTreeSVG(
        this.treeSvgContainer,
        tree,
        highlight,
        '#fbbf24',
        secondaryHighlight,
        lcaResult != null ? '#10b981' : '#3b82f6',
        labels,
      );
    }

    // 2. 更新状态监视器
    if (this.metricCurrEl) this.metricCurrEl.textContent = current != null ? `${current}` : '—';
    if (this.metricLeftEl) this.metricLeftEl.textContent = leftReturn != null ? `${leftReturn}` : 'null';
    if (this.metricRightEl) this.metricRightEl.textContent = rightReturn != null ? `${rightReturn}` : 'null';
    if (this.metricLCAResultEl) {
      this.metricLCAResultEl.textContent = lcaResult != null ? `${lcaResult}` : '检索中...';
      this.metricLCAResultEl.style.color = lcaResult != null ? '#10b981' : '#2563eb';
    }

    if (this.formulaActionEl) {
      if (leftReturn != null && rightReturn != null) {
        this.formulaActionEl.textContent = `left(${leftReturn}) && right(${rightReturn}) -> return root (${current})`;
      } else if (action === 'hit-target') {
        this.formulaActionEl.textContent = `root == ${current} (p/q) -> return root`;
      } else {
        this.formulaActionEl.textContent = 'left && right ? root : (left ? left : right)';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let bg =
          st.action === 'done' || (st.leftReturn != null && st.rightReturn != null)
            ? '#f0fdf4'
            : st.action === 'hit-target'
            ? '#eff6ff'
            : '#f8fafc';
        let color =
          st.action === 'done' || (st.leftReturn != null && st.rightReturn != null)
            ? '#15803d'
            : st.action === 'hit-target'
            ? '#1d4ed8'
            : '#64748b';
        let border =
          st.action === 'done' || (st.leftReturn != null && st.rightReturn != null)
            ? '#bbf7d0'
            : st.action === 'hit-target'
            ? '#bfdbfe'
            : '#e2e8f0';
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

    const badgeLca = this.root?.querySelector('#badge-lca-result');
    if (badgeLca) {
      badgeLca.textContent = action === 'done' ? `LCA 结果: ${lcaResult}` : '查找中...';
    }
  }
}

registerAlgorithm({
  id: 'lca',
  name: '二叉树最近公共祖先',
  viewId: 'algo-lca-view',
  category: 'tree',
  description: '自底向上后序递归查找二叉树中两个指定节点的最近公共祖先',
  icon: '👥',
  difficulty: 2,
  levelOrder: 10,
  learningGoal: '掌握后序递归自底向上四象限状态合并的经典 LCA 模板',
  template,
  Visualizer: LCAVisualizer,
});