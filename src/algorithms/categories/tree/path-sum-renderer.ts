/**
 * 路径总和可视化器 — 4-Card 标准现代架构
 * 递归减法回溯、叶子节点精确判定、路径高亮与成功早停
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  PATH_SUM_PROBLEM_HTML,
  PATH_SUM_ANALYSIS_HTML,
  PATH_SUM_CODE_LANGUAGES,
} from './path-sum-problem-content';
import { TreeNode, buildTreeFromArr as buildTree, renderTreeSVG } from './tree-template';
import template from './path-sum.html?raw';

export interface PSStep {
  tree: TreeNode | null;
  current: number | null;
  targetSum: number;
  currentSum: number;
  remain: number;
  path: number[];
  found: boolean;
  action: 'enter' | 'check-leaf' | 'match' | 'leave' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildPSSteps(root: TreeNode | null, targetSum: number): PSStep[] {
  const steps: PSStep[] = [];
  const currentPath: number[] = [];
  let found = false;

  steps.push({
    tree: root,
    current: null,
    targetSum,
    currentSum: 0,
    remain: targetSum,
    path: [],
    found: false,
    action: 'enter',
    message: root ? `初始化路径总和搜索：targetSum = ${targetSum}，从根节点 ${root.val} 开始递归。` : '空树，返回 false。',
    log: root ? `开始搜索 targetSum = ${targetSum}` : '空树 -> false',
    codeLine: 2,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      targetSum,
      currentSum: 0,
      remain: targetSum,
      path: [],
      found: false,
      action: 'done',
      message: '❌ 空树不存在根到叶路径，返回 false。',
      log: '✓ 未找到目标路径 (false)',
      codeLine: 3,
    });
    return steps;
  }

  const dfs = (node: TreeNode | null, remain: number, runningSum: number): boolean => {
    if (!node || found) return false;

    currentPath.push(node.val);
    const newSum = runningSum + node.val;
    const isLeaf = !node.left && !node.right;

    steps.push({
      tree: root,
      current: node.val,
      targetSum,
      currentSum: newSum,
      remain: targetSum - newSum,
      path: [...currentPath],
      found: false,
      action: 'enter',
      message: `进入节点 ${node.val}：当前路径 [${currentPath.join(' -> ')}]，当前累加和 = ${newSum} (目标 ${targetSum})。`,
      log: `进入 ${node.val} (和=${newSum})`,
      codeLine: 4,
    });

    if (isLeaf) {
      const match = node.val === remain;
      steps.push({
        tree: root,
        current: node.val,
        targetSum,
        currentSum: newSum,
        remain: targetSum - newSum,
        path: [...currentPath],
        found: match,
        action: match ? 'match' : 'check-leaf',
        message: match
          ? `🎯 成功到达叶子节点 ${node.val}！路径总和恰好等于 ${targetSum}！`
          : `到达叶子节点 ${node.val}，累加和 ${newSum} &ne; ${targetSum}，回溯。`,
        log: match ? `✓ 命中路径: [${currentPath.join('->')}] = ${targetSum}` : `叶子 ${node.val} 和不符`,
        codeLine: match ? 6 : 5,
      });

      if (match) {
        found = true;
        return true;
      }
    }

    if (node.left && dfs(node.left, remain - node.val, newSum)) return true;
    if (node.right && dfs(node.right, remain - node.val, newSum)) return true;

    currentPath.pop();

    steps.push({
      tree: root,
      current: node.val,
      targetSum,
      currentSum: runningSum,
      remain: targetSum - runningSum,
      path: [...currentPath],
      found: false,
      action: 'leave',
      message: `回溯离开节点 ${node.val}。`,
      log: `离开 ${node.val}`,
      codeLine: [9, 10],
    });

    return false;
  };

  dfs(root, targetSum, 0);

  steps.push({
    tree: root,
    current: null,
    targetSum,
    currentSum: found ? targetSum : 0,
    remain: found ? 0 : targetSum,
    path: found ? [...currentPath] : [],
    found,
    action: 'done',
    message: found
      ? `🎉 搜索成功！存在根到叶路径的和为 ${targetSum}。`
      : `❌ 搜索结束，不存在和为 ${targetSum} 的根到叶路径。`,
    log: found ? `✓ 存在目标路径 (true)` : `✗ 不存在目标路径 (false)`,
    codeLine: found ? 6 : 3,
  });

  return steps;
}

export class PathSumVisualizer extends StepVisualizer<PSStep> {
  protected codeLanguages = PATH_SUM_CODE_LANGUAGES;
  protected codeLines = PATH_SUM_CODE_LANGUAGES['java'];
  protected codePanelTitle = '路径总和 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private treeSvgContainer: HTMLElement | null = null;
  private metricCurrEl: HTMLElement | null = null;
  private metricSumEl: HTMLElement | null = null;
  private metricRemainEl: HTMLElement | null = null;
  private metricVerdictEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.treeSvgContainer = this.root.querySelector('#ps-tree-svg-container');
    this.metricCurrEl = this.root.querySelector('#metric-curr');
    this.metricSumEl = this.root.querySelector('#metric-sum');
    this.metricRemainEl = this.root.querySelector('#metric-remain');
    this.metricVerdictEl = this.root.querySelector('#metric-verdict');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#ps-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>('.ps-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const treeInput = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
        const targetInput = this.root?.querySelector('#input-target') as HTMLInputElement | null;
        if (treeInput && btn.dataset.tree) treeInput.value = btn.dataset.tree;
        if (targetInput && btn.dataset.t) targetInput.value = btn.dataset.t;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: PATH_SUM_PROBLEM_HTML,
      analysisHtml: PATH_SUM_ANALYSIS_HTML,
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

  protected buildSteps(): PSStep[] {
    const treeInput = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
    const targetInput = this.root?.querySelector('#input-target') as HTMLInputElement | null;
    const raw = treeInput?.value || '5, 4, 8, 11, null, 13, 4, 7, 2';
    const t = parseInt(targetInput?.value || '22', 10);
    const arr = this.parseTreeInput(raw);
    const root = buildTree(arr);
    return buildPSSteps(root, isNaN(t) ? 22 : t);
  }

  protected renderStep(step: PSStep): void {
    const { tree, current, targetSum, currentSum, remain, path, found, action, message } = step;

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
    if (this.metricSumEl) this.metricSumEl.textContent = `${currentSum} / ${targetSum}`;
    if (this.metricRemainEl) this.metricRemainEl.textContent = `${remain}`;
    if (this.metricVerdictEl) {
      if (found) {
        this.metricVerdictEl.textContent = '存在路径 (True)';
        this.metricVerdictEl.style.color = '#10b981';
      } else if (action === 'done' && !found) {
        this.metricVerdictEl.textContent = '不存在 (False)';
        this.metricVerdictEl.style.color = '#ef4444';
      } else {
        this.metricVerdictEl.textContent = '搜索中...';
        this.metricVerdictEl.style.color = '#2563eb';
      }
    }

    if (this.formulaActionEl) {
      if (action === 'match') {
        this.formulaActionEl.textContent = `命中: 叶子节点且路径和等于 ${targetSum} -> return true`;
      } else if (action === 'check-leaf') {
        this.formulaActionEl.textContent = `叶子节点累加和 ${currentSum} != ${targetSum}`;
      } else {
        this.formulaActionEl.textContent = 'hasPathSum(left, remain - val) || hasPathSum(right, remain - val)';
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
        action === 'match' || (action === 'done' && found)
          ? '#f0fdf4'
          : action === 'done' && !found
          ? '#fff1f2'
          : '#eff6ff';
      logEntry.style.color =
        action === 'match' || (action === 'done' && found)
          ? '#15803d'
          : action === 'done' && !found
          ? '#e11d48'
          : '#1d4ed8';
      logEntry.style.border =
        '1px solid ' +
        (action === 'match' || (action === 'done' && found)
          ? '#bbf7d0'
          : action === 'done' && !found
          ? '#fecdd3'
          : '#bfdbfe');
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

    const badgeVerdict = this.root?.querySelector('#badge-verdict');
    if (badgeVerdict) {
      badgeVerdict.textContent =
        found ? '存在路径 (True)' : action === 'done' && !found ? '不存在 (False)' : '搜索中...';
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
  id: 'path-sum',
  name: '路径总和',
  viewId: 'algo-path-sum-view',
  category: 'tree',
  description: '判断二叉树中是否存在根到叶节点和等于目标值的路径',
  icon: '🎯',
  difficulty: 1,
  levelOrder: 6,
  learningGoal: '掌握二叉树根到叶路径回溯与减法计数的技巧',
  template,
  Visualizer: PathSumVisualizer,
});
