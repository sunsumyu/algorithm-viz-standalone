/**
 * 对称二叉树可视化器 — 4-Card 标准现代架构
 * 镜像双指针递归、内外侧同步校验、失配即时阻断
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  TREE_SYMMETRIC_PROBLEM_HTML,
  TREE_SYMMETRIC_ANALYSIS_HTML,
  TREE_SYMMETRIC_CODE_LANGUAGES,
} from './tree-symmetric-problem-content';
import { TreeNode, buildTreeFromArr as buildTree, renderTreeSVG } from './tree-template';
import template from './tree-symmetric.html?raw';

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
  codeLine: number | number[];
}

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
    codeLine: 2,
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
      codeLine: 3,
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
        codeLine: 7,
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
        codeLine: 8,
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
        message: `❌ 数值不匹配！左节点 ${left.val} &ne; 右镜像节点 ${right.val}。`,
        log: `数值失配: ${left.val} != ${right.val}`,
        codeLine: 9,
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
      message: `镜像比对：左节点 ${left.val} == 右节点 ${right.val}，数值一致。深入检查外侧与内侧。`,
      log: `比对一致: ${left.val} == ${right.val}`,
      codeLine: [11, 12, 13],
    });

    const outside = check(left.left, right.right);
    const inside = check(left.right, right.left);
    return outside && inside;
  };

  check(root.left, root.right);

  steps.push({
    tree: root,
    leftVal: null,
    rightVal: null,
    match: isSymmetric,
    result: isSymmetric,
    mismatchNode,
    phase: isSymmetric ? 'symmetric' : 'asymmetric',
    status: isSymmetric ? 'symmetric' : 'asymmetric',
    message: isSymmetric
      ? '🎉 验证完成！该二叉树是对称的。'
      : `❌ 验证完成！由于镜像节点失配，该二叉树不对称。`,
    log: isSymmetric ? '✓ 对称二叉树 (True)' : '✗ 不对称二叉树 (False)',
    codeLine: isSymmetric ? 4 : 8,
  });

  return steps;
}

export class TreeSymmetricVisualizer extends StepVisualizer<TSStep> {
  protected codeLanguages = TREE_SYMMETRIC_CODE_LANGUAGES;
  protected codeLines = TREE_SYMMETRIC_CODE_LANGUAGES['java'];
  protected codePanelTitle = '对称二叉树 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private treeSvgContainer: HTMLElement | null = null;
  private metricLeftEl: HTMLElement | null = null;
  private metricRightEl: HTMLElement | null = null;
  private metricMatchEl: HTMLElement | null = null;
  private metricVerdictEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.treeSvgContainer = this.root.querySelector('#ts-tree-svg-container');
    this.metricLeftEl = this.root.querySelector('#metric-left');
    this.metricRightEl = this.root.querySelector('#metric-right');
    this.metricMatchEl = this.root.querySelector('#metric-match');
    this.metricVerdictEl = this.root.querySelector('#metric-verdict');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#ts-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>('.ts-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const treeInput = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
        if (treeInput && btn.dataset.tree) treeInput.value = btn.dataset.tree;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: TREE_SYMMETRIC_PROBLEM_HTML,
      analysisHtml: TREE_SYMMETRIC_ANALYSIS_HTML,
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

  protected buildSteps(): TSStep[] {
    const treeInput = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
    const raw = treeInput?.value || '1, 2, 2, 3, 4, 4, 3';
    const arr = this.parseTreeInput(raw);
    const root = buildTree(arr);
    return buildTSSteps(root);
  }

  protected renderStep(step: TSStep): void {
    const { tree, leftVal, rightVal, match, mismatchNode, phase, message } = step;

    // 1. 渲染 SVG 树拓扑
    if (this.treeSvgContainer) {
      const highlight = leftVal != null ? new Set([leftVal]) : new Set<number>();
      const secondaryHighlight = mismatchNode != null ? new Set([mismatchNode]) : rightVal != null ? new Set([rightVal]) : new Set<number>();
      const secondaryColor = mismatchNode != null ? '#ef4444' : '#a855f7';

      renderTreeSVG(
        this.treeSvgContainer,
        tree,
        highlight,
        mismatchNode != null ? '#ef4444' : '#3b82f6',
        secondaryHighlight,
        secondaryColor,
      );
    }

    // 2. 更新状态监视器
    if (this.metricLeftEl) this.metricLeftEl.textContent = leftVal != null ? `${leftVal}` : '—';
    if (this.metricRightEl) this.metricRightEl.textContent = rightVal != null ? `${rightVal}` : '—';
    if (this.metricMatchEl) {
      if (leftVal != null && rightVal != null) {
        this.metricMatchEl.textContent = match ? `${leftVal} == ${rightVal} (✓)` : `${leftVal} != ${rightVal} (✗)`;
        this.metricMatchEl.style.color = match ? '#10b981' : '#ef4444';
      } else {
        this.metricMatchEl.textContent = '待比对';
        this.metricMatchEl.style.color = '#64748b';
      }
    }
    if (this.metricVerdictEl) {
      if (phase === 'symmetric') {
        this.metricVerdictEl.textContent = '对称二叉树 (True)';
        this.metricVerdictEl.style.color = '#10b981';
      } else if (phase === 'asymmetric') {
        this.metricVerdictEl.textContent = '不对称 (False)';
        this.metricVerdictEl.style.color = '#ef4444';
      } else {
        this.metricVerdictEl.textContent = '校验中...';
        this.metricVerdictEl.style.color = '#2563eb';
      }
    }

    if (this.formulaActionEl) {
      if (!match) {
        this.formulaActionEl.textContent = `失配: left (${leftVal}) != right (${rightVal}) -> return false`;
      } else if (phase === 'symmetric') {
        this.formulaActionEl.textContent = 'outside && inside -> return true';
      } else {
        this.formulaActionEl.textContent = 'check(left.left, right.right) && check(left.right, right.left)';
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
        phase === 'symmetric' ? '#f0fdf4' : phase === 'asymmetric' ? '#fff1f2' : '#eff6ff';
      logEntry.style.color =
        phase === 'symmetric' ? '#15803d' : phase === 'asymmetric' ? '#e11d48' : '#1d4ed8';
      logEntry.style.border =
        '1px solid ' +
        (phase === 'symmetric' ? '#bbf7d0' : phase === 'asymmetric' ? '#fecdd3' : '#bfdbfe');
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
        phase === 'symmetric' ? '对称二叉树 (True)' : phase === 'asymmetric' ? '不对称 (False)' : '校验中...';
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
  id: 'tree-symmetric',
  name: '对称二叉树',
  viewId: 'algo-tree-symmetric-view',
  category: 'tree',
  description: '判断给定二叉树是否关于根节点轴对称',
  icon: '🪞',
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '掌握镜像对称递归的双指针比较模式',
  template,
  Visualizer: TreeSymmetricVisualizer,
});
