/**
 * 二叉树最大深度可视化器 — 4-Card 标准现代架构
 * 后序自底向上高度归约、左右子树深度比对、SVG 拓扑高度标注
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  TREE_DEPTH_PROBLEM_HTML,
  TREE_DEPTH_ANALYSIS_HTML,
  TREE_DEPTH_CODE_LANGUAGES,
} from './tree-depth-problem-content';
import { TreeNode, buildTreeFromArr as buildTree, renderTreeSVG } from './tree-template';
import template from './tree-depth.html?raw';

export interface TDStep {
  tree: TreeNode | null;
  current: number | null;
  leftDepth: number;
  rightDepth: number;
  maxDepth: number;
  depthsMap: Map<number, number>;
  action: 'enter' | 'left-done' | 'right-done' | 'return-depth';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildTDSteps(root: TreeNode | null): TDStep[] {
  const steps: TDStep[] = [];
  const depthsMap = new Map<number, number>();

  steps.push({
    tree: root,
    current: null,
    leftDepth: 0,
    rightDepth: 0,
    maxDepth: 0,
    depthsMap: new Map(depthsMap),
    action: 'enter',
    message: root ? `初始化最大深度计算：根节点为 ${root.val}，采用后序自底向上归约。` : '空树，最大深度为 0。',
    log: root ? '初始化最大深度计算' : '空树 -> 深度 0',
    codeLine: 2,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      leftDepth: 0,
      rightDepth: 0,
      maxDepth: 0,
      depthsMap: new Map(depthsMap),
      action: 'return-depth',
      message: '✅ 空树最大深度为 0。',
      log: '✓ 最大深度 = 0',
      codeLine: 3,
    });
    return steps;
  }

  const getDepth = (node: TreeNode | null): number => {
    if (!node) return 0;

    steps.push({
      tree: root,
      current: node.val,
      leftDepth: 0,
      rightDepth: 0,
      maxDepth: 0,
      depthsMap: new Map(depthsMap),
      action: 'enter',
      message: `进入节点 ${node.val}：开始递归求其左子树最大深度。`,
      log: `进入 ${node.val} -> 求左深度`,
      codeLine: [4, 5],
    });

    const l = getDepth(node.left);

    steps.push({
      tree: root,
      current: node.val,
      leftDepth: l,
      rightDepth: 0,
      maxDepth: 0,
      depthsMap: new Map(depthsMap),
      action: 'left-done',
      message: `节点 ${node.val} 左子树深度计算完毕：leftDepth = ${l}。开始求右子树深度。`,
      log: `节点 ${node.val}: leftDepth = ${l}`,
      codeLine: [5, 6],
    });

    const r = getDepth(node.right);

    const curHeight = 1 + Math.max(l, r);
    depthsMap.set(node.val, curHeight);

    steps.push({
      tree: root,
      current: node.val,
      leftDepth: l,
      rightDepth: r,
      maxDepth: curHeight,
      depthsMap: new Map(depthsMap),
      action: 'return-depth',
      message: `节点 ${node.val} 高度归约：1 + max(${l}, ${r}) = ${curHeight}。将此高度返回上一层。`,
      log: `节点 ${node.val}: height = 1 + max(${l}, ${r}) = ${curHeight}`,
      codeLine: 7,
    });

    return curHeight;
  };

  const totalMax = getDepth(root);

  steps.push({
    tree: root,
    current: null,
    leftDepth: 0,
    rightDepth: 0,
    maxDepth: totalMax,
    depthsMap: new Map(depthsMap),
    action: 'return-depth',
    message: `🎉 计算完成！二叉树的最大深度为 ${totalMax}。`,
    log: `✓ 最大深度 = ${totalMax}`,
    codeLine: 2,
  });

  return steps;
}

export class TreeDepthVisualizer extends StepVisualizer<TDStep> {
  protected codeLanguages = TREE_DEPTH_CODE_LANGUAGES;
  protected codeLines = TREE_DEPTH_CODE_LANGUAGES['java'];
  protected codePanelTitle = '二叉树最大深度 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private treeSvgContainer: HTMLElement | null = null;
  private metricCurrEl: HTMLElement | null = null;
  private metricLeftDepthEl: HTMLElement | null = null;
  private metricRightDepthEl: HTMLElement | null = null;
  private metricMaxDepthEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.treeSvgContainer = this.root.querySelector('#td-tree-svg-container');
    this.metricCurrEl = this.root.querySelector('#metric-curr');
    this.metricLeftDepthEl = this.root.querySelector('#metric-left-depth');
    this.metricRightDepthEl = this.root.querySelector('#metric-right-depth');
    this.metricMaxDepthEl = this.root.querySelector('#metric-max-depth');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#td-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定播放控制
    this.bindPlaybackControls();

    // 运行与重置
    this.root.querySelector('#btn-generate')?.addEventListener('click', () => this.start());
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());

    // 进度条 Scrubber
    const slider = this.root.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val) && val >= 0 && val < this.steps.length) {
          this.goToStep(val);
        }
      });
    }

    // 步进控制
    this.root.querySelector('#btn-step-prev')?.addEventListener('click', () => this.prevStep());
    this.root.querySelector('#btn-step-next')?.addEventListener('click', () => this.nextStep());
    this.root.querySelector('#btn-play-pause')?.addEventListener('click', () => this.togglePlay());

    // 速度选择
    const speedSelect = this.root.querySelector('#select-speed') as HTMLSelectElement | null;
    if (speedSelect) {
      speedSelect.addEventListener('change', () => {
        this.playbackSpeed = parseInt(speedSelect.value, 10) || 600;
      });
    }

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>.bind(this.root)('.td-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const treeInput = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
        if (treeInput && btn.dataset.tree) treeInput.value = btn.dataset.tree;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: TREE_DEPTH_PROBLEM_HTML,
      analysisHtml: TREE_DEPTH_ANALYSIS_HTML,
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

  protected buildSteps(): TDStep[] {
    const treeInput = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
    const raw = treeInput?.value || '3, 9, 20, null, null, 15, 7';
    const arr = this.parseTreeInput(raw);
    const root = buildTree(arr);
    return buildTDSteps(root);
  }

  protected renderStep(step: TDStep): void {
    const { tree, current, leftDepth, rightDepth, maxDepth, depthsMap, action, message } = step;

    // 1. 渲染 SVG 树拓扑
    if (this.treeSvgContainer) {
      const highlight = current != null ? new Set([current]) : new Set<number>();
      const secondaryHighlight = new Set<number>(depthsMap.keys());
      const labels = new Map<number, string>();
      depthsMap.forEach((depth, nodeVal) => {
        labels.set(nodeVal, `h:${depth}`);
      });

      renderTreeSVG(
        this.treeSvgContainer,
        tree,
        highlight,
        '#fbbf24',
        secondaryHighlight,
        '#34d399',
        labels,
      );
    }

    // 2. 更新状态监视器
    if (this.metricCurrEl) this.metricCurrEl.textContent = current != null ? `${current}` : '—';
    if (this.metricLeftDepthEl) this.metricLeftDepthEl.textContent = `${leftDepth}`;
    if (this.metricRightDepthEl) this.metricRightDepthEl.textContent = `${rightDepth}`;
    if (this.metricMaxDepthEl) this.metricMaxDepthEl.textContent = `${maxDepth}`;

    if (this.formulaActionEl) {
      if (action === 'return-depth') {
        this.formulaActionEl.textContent = `1 + Math.max(${leftDepth}, ${rightDepth}) = ${maxDepth}`;
      } else {
        this.formulaActionEl.textContent = '1 + Math.max(leftDepth, rightDepth)';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        action === 'return-depth' ? '#f0fdf4' : action === 'enter' ? '#eff6ff' : '#f8fafc';
      logEntry.style.color =
        action === 'return-depth' ? '#15803d' : action === 'enter' ? '#1d4ed8' : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'return-depth' ? '#bbf7d0' : action === 'enter' ? '#bfdbfe' : '#e2e8f0');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    // 4. 同步代码高亮
    if (this.terminalInstance) {
      const line = Array.isArray(step.codeLine) ? step.codeLine[0] : step.codeLine;
      this.terminalInstance.highlightLine(line);
    }

    // 5. 更新底部播放控制条
    const slider = this.root?.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.max = String(this.steps.length - 1);
      slider.value = String(this.currentStepIndex);
    }
    const indicator = this.root?.querySelector('#step-indicator');
    if (indicator) {
      indicator.textContent = `步骤 ${this.currentStepIndex + 1} / ${this.steps.length}`;
    }
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'tree-depth',
  name: '二叉树最大深度',
  viewId: 'algo-tree-depth-view',
  category: 'tree',
  description: '自底向上后序归约计算二叉树的最大深度',
  icon: '📏',
  difficulty: 1,
  levelOrder: 4,
  learningGoal: '掌握通过后序遍历自底向上归约子树深度的核心模型',
  template,
  Visualizer: TreeDepthVisualizer,
});