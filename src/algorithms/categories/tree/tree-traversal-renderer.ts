/**
 * 二叉树前中后序遍历可视化器 — 4-Card 标准现代架构
 * 递归前序/中序/后序遍历、SVG 拓扑高亮、实时访问序列与代码同步
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  TREE_TRAVERSAL_PROBLEM_HTML,
  TREE_TRAVERSAL_ANALYSIS_HTML,
  TREE_TRAVERSAL_CODE_LANGUAGES,
} from './tree-traversal-problem-content';
import { TreeNode, buildTreeFromArr as buildTree, renderTreeSVG } from './tree-template';
import template from './tree-traversal.html?raw';

export type Mode = 'pre' | 'in' | 'post';

export interface TTStep {
  tree: TreeNode | null;
  mode: Mode;
  current: number | null;
  depth: number;
  visited: number;
  result: number[];
  action: 'enter' | 'visit' | 'leave';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildTTSteps(root: TreeNode | null, mode: Mode): TTStep[] {
  const steps: TTStep[] = [];
  const result: number[] = [];
  let visited = 0;

  const modeName = mode === 'pre' ? '前序（根左右）' : mode === 'in' ? '中序（左根右）' : '后序（左右根）';
  steps.push({
    tree: root,
    mode,
    current: null,
    depth: 0,
    visited: 0,
    result: [],
    action: 'enter',
    message: root ? `开始${modeName}遍历：根节点为 ${root.val}。` : '空树，无需遍历。',
    log: root ? `开始${modeName}遍历` : '空树',
    codeLine: 1,
  });

  if (!root) {
    steps.push({
      tree: null,
      mode,
      current: null,
      depth: 0,
      visited: 0,
      result: [],
      action: 'leave',
      message: '✅ 遍历完成，返回空序列 []。',
      log: '遍历完成: []',
      codeLine: 4,
    });
    return steps;
  }

  const visit = (node: TreeNode, depth: number) => {
    visited++;
    result.push(node.val);
    steps.push({
      tree: root,
      mode,
      current: node.val,
      depth,
      visited,
      result: [...result],
      action: 'visit',
      message: `${modeName} 访问节点 ${node.val}（深度 ${depth}），加入结果序列。`,
      log: `访问节点 ${node.val} -> [${result.join(', ')}]`,
      codeLine: mode === 'pre' ? 5 : mode === 'in' ? 12 : 19,
    });
  };

  const traverse = (node: TreeNode | null, depth: number) => {
    if (!node) return;
    steps.push({
      tree: root,
      mode,
      current: node.val,
      depth,
      visited,
      result: [...result],
      action: 'enter',
      message: `进入节点 ${node.val}（当前栈深度 ${depth}）。`,
      log: `进入 ${node.val} (depth ${depth})`,
      codeLine: mode === 'pre' ? 4 : mode === 'in' ? 10 : 16,
    });

    if (mode === 'pre') visit(node, depth);
    traverse(node.left, depth + 1);
    if (mode === 'in') visit(node, depth);
    traverse(node.right, depth + 1);
    if (mode === 'post') visit(node, depth);

    steps.push({
      tree: root,
      mode,
      current: node.val,
      depth,
      visited,
      result: [...result],
      action: 'leave',
      message: `离开节点 ${node.val}（该子树所有分支处理完毕，弹出栈帧）。`,
      log: `离开 ${node.val}`,
      codeLine: mode === 'pre' ? 7 : mode === 'in' ? 14 : 21,
    });
  };

  traverse(root, 0);

  steps.push({
    tree: root,
    mode,
    current: null,
    depth: 0,
    visited,
    result: [...result],
    action: 'leave',
    message: `🎉 ${modeName}遍历完成！最终收集序列：[${result.join(', ')}]。`,
    log: `✓ 完成: [${result.join(', ')}]`,
    codeLine: 1,
  });

  return steps;
}

export class TreeTraversalVisualizer extends StepVisualizer<TTStep> {
  protected codeLanguages = TREE_TRAVERSAL_CODE_LANGUAGES;
  protected codeLines = TREE_TRAVERSAL_CODE_LANGUAGES['java'];
  protected codePanelTitle = '二叉树遍历 代码调试';

  private currentMode: Mode = 'pre';
  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private treeSvgContainer: HTMLElement | null = null;
  private metricCurNodeEl: HTMLElement | null = null;
  private metricDepthEl: HTMLElement | null = null;
  private metricVisitedCountEl: HTMLElement | null = null;
  private metricModeNameEl: HTMLElement | null = null;
  private resultSeqEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.treeSvgContainer = this.root.querySelector('#tt-tree-svg-container');
    this.metricCurNodeEl = this.root.querySelector('#metric-cur-node');
    this.metricDepthEl = this.root.querySelector('#metric-depth');
    this.metricVisitedCountEl = this.root.querySelector('#metric-visited-count');
    this.metricModeNameEl = this.root.querySelector('#metric-mode-name');
    this.resultSeqEl = this.root.querySelector('#traversal-result');
    this.liveTextEl = this.root.querySelector('#tt-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 模式切换按钮
    this.root.querySelectorAll<HTMLButtonElement>('.tt-mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.root?.querySelectorAll('.tt-mode-btn').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        this.currentMode = (btn.dataset.mode as Mode) || 'pre';
        this.start();
      });
    });

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
    this.root.querySelectorAll<HTMLButtonElement>('.tt-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const treeInput = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
        if (treeInput && btn.dataset.tree) treeInput.value = btn.dataset.tree;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: TREE_TRAVERSAL_PROBLEM_HTML,
      analysisHtml: TREE_TRAVERSAL_ANALYSIS_HTML,
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

  protected buildSteps(): TTStep[] {
    const treeInput = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
    const raw = treeInput?.value || '1, 2, 3, 4, 5, 6, 7';
    const arr = this.parseTreeInput(raw);
    const root = buildTree(arr);
    return buildTTSteps(root, this.currentMode);
  }

  protected renderStep(step: TTStep): void {
    const { tree, mode, current, depth, visited, result, action, message } = step;

    // 1. 渲染 SVG 树拓扑
    if (this.treeSvgContainer) {
      const highlight = current != null ? new Set([current]) : new Set<number>();
      const secondaryHighlight = new Set<number>(result);
      renderTreeSVG(
        this.treeSvgContainer,
        tree,
        highlight,
        '#fbbf24',
        secondaryHighlight,
        '#34d399',
      );
    }

    // 2. 更新状态监视器
    if (this.metricCurNodeEl) this.metricCurNodeEl.textContent = current != null ? `${current}` : '—';
    if (this.metricDepthEl) this.metricDepthEl.textContent = `${depth}`;
    if (this.metricVisitedCountEl) this.metricVisitedCountEl.textContent = `${visited}`;
    if (this.metricModeNameEl) {
      this.metricModeNameEl.textContent =
        mode === 'pre' ? '前序 (根左右)' : mode === 'in' ? '中序 (左根右)' : '后序 (左右根)';
    }
    if (this.resultSeqEl) {
      this.resultSeqEl.textContent = `[ ${result.join(', ')} ]`;
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        action === 'visit' ? '#f0fdf4' : action === 'enter' ? '#eff6ff' : '#f8fafc';
      logEntry.style.color =
        action === 'visit' ? '#15803d' : action === 'enter' ? '#1d4ed8' : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'visit' ? '#bbf7d0' : action === 'enter' ? '#bfdbfe' : '#e2e8f0');
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
    const stepCurEl = this.root?.querySelector('#step-cur');
    const stepTotalEl = this.root?.querySelector('#step-total');
    if (stepCurEl) stepCurEl.textContent = String(this.currentStepIndex + 1);
    if (stepTotalEl) stepTotalEl.textContent = String(this.steps.length);

    const badgeMode = this.root?.querySelector('#badge-mode-name');
    if (badgeMode) {
      badgeMode.textContent =
        mode === 'pre' ? '前序遍历 (根-左-右)' : mode === 'in' ? '中序遍历 (左-根-右)' : '后序遍历 (左-右-根)';
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
  id: 'tree-traversal',
  name: '二叉树遍历',
  viewId: 'algo-tree-traversal-view',
  category: 'tree',
  description: '前序、中序、后序深度优先遍历过程演示',
  icon: '🌲',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握前序/中序/后序三种遍历顺序及递归本质',
  template,
  Visualizer: TreeTraversalVisualizer,
});