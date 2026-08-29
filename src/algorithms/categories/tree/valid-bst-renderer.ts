/**
 * 验证二叉搜索树可视化器 — 4-Card 标准现代架构
 * 中序遍历严格单调递增校验、前驱节点追踪、违规节点高亮
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  VALID_BST_PROBLEM_HTML,
  VALID_BST_ANALYSIS_HTML,
  VALID_BST_CODE_LANGUAGES,
} from './valid-bst-problem-content';
import { TreeNode, buildTreeFromArr as buildTree, renderTreeSVG } from './tree-template';
import template from './valid-bst.html?raw';

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
        : `❌ 违规！节点 ${val} &le; 前驱 ${prevVal}，破坏了中序严格递增特性！`,
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

    prevVal = val;
    sequence.push(val);

    // 3. 递归右子树
    return inorder(node.right);
  };

  inorder(root);

  steps.push({
    tree: root,
    current: null,
    prev: prevVal,
    sequence: [...sequence],
    valid: isValid,
    invalidNode,
    phase: isValid ? 'valid' : 'invalid',
    status: isValid ? 'valid' : 'invalid',
    message: isValid
      ? `🎉 验证通过！中序序列 [${sequence.join(', ')}] 严格递增，该树是有效的二叉搜索树。`
      : `❌ 验证失败！由于节点 ${invalidNode} 违规，该树不是有效的二叉搜索树。`,
    log: isValid ? `✓ 验证通过 (有效 BST)` : `✗ 验证失败 (非法 BST)`,
    codeLine: isValid ? 13 : 9,
  });

  return steps;
}

export class ValidBstVisualizer extends StepVisualizer<VBStep> {
  protected codeLanguages = VALID_BST_CODE_LANGUAGES;
  protected codeLines = VALID_BST_CODE_LANGUAGES['java'];
  protected codePanelTitle = '验证二叉搜索树 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private treeSvgContainer: HTMLElement | null = null;
  private metricCurrEl: HTMLElement | null = null;
  private metricPrevEl: HTMLElement | null = null;
  private metricConditionEl: HTMLElement | null = null;
  private metricVerdictEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.treeSvgContainer = this.root.querySelector('#vb-tree-svg-container');
    this.metricCurrEl = this.root.querySelector('#metric-curr');
    this.metricPrevEl = this.root.querySelector('#metric-prev');
    this.metricConditionEl = this.root.querySelector('#metric-condition');
    this.metricVerdictEl = this.root.querySelector('#metric-verdict');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#vb-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>.bind(this.root)('.vb-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const treeInput = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
        if (treeInput && btn.dataset.tree) treeInput.value = btn.dataset.tree;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: VALID_BST_PROBLEM_HTML,
      analysisHtml: VALID_BST_ANALYSIS_HTML,
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

  protected buildSteps(): VBStep[] {
    const treeInput = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
    const raw = treeInput?.value || '2, 1, 3';
    const arr = this.parseTreeInput(raw);
    const root = buildTree(arr);
    return buildVBSteps(root);
  }

  protected renderStep(step: VBStep): void {
    const { tree, current, prev, valid, invalidNode, phase, message } = step;

    // 1. 渲染 SVG 树拓扑
    if (this.treeSvgContainer) {
      const highlight = current != null ? new Set([current]) : new Set<number>();
      const secondaryHighlight = invalidNode != null ? new Set([invalidNode]) : prev != null ? new Set([prev]) : new Set<number>();
      const secondaryColor = invalidNode != null ? '#ef4444' : '#3b82f6';

      renderTreeSVG(
        this.treeSvgContainer,
        tree,
        highlight,
        invalidNode != null ? '#ef4444' : '#fbbf24',
        secondaryHighlight,
        secondaryColor,
      );
    }

    // 2. 更新状态监视器
    if (this.metricCurrEl) this.metricCurrEl.textContent = current != null ? `${current}` : '—';
    if (this.metricPrevEl) this.metricPrevEl.textContent = prev != null ? `${prev}` : 'null';
    if (this.metricConditionEl) {
      if (current != null && prev != null) {
        this.metricConditionEl.textContent = current > prev ? `${current} > ${prev} (✓)` : `${current} <= ${prev} (✗)`;
        this.metricConditionEl.style.color = current > prev ? '#10b981' : '#ef4444';
      } else {
        this.metricConditionEl.textContent = 'prev == null (首项)';
        this.metricConditionEl.style.color = '#10b981';
      }
    }
    if (this.metricVerdictEl) {
      if (phase === 'valid') {
        this.metricVerdictEl.textContent = '合法 BST (True)';
        this.metricVerdictEl.style.color = '#10b981';
      } else if (phase === 'invalid') {
        this.metricVerdictEl.textContent = '非法 BST (False)';
        this.metricVerdictEl.style.color = '#ef4444';
      } else {
        this.metricVerdictEl.textContent = '校验中...';
        this.metricVerdictEl.style.color = '#2563eb';
      }
    }

    if (this.formulaActionEl) {
      if (!valid) {
        this.formulaActionEl.textContent = `违规: ${current} <= ${prev} -> return false`;
      } else if (phase === 'valid') {
        this.formulaActionEl.textContent = '中序严格递增 -> return true';
      } else {
        this.formulaActionEl.textContent = 'prev == null || curr.val > prev.val';
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
        phase === 'valid' ? '#f0fdf4' : phase === 'invalid' ? '#fff1f2' : '#eff6ff';
      logEntry.style.color =
        phase === 'valid' ? '#15803d' : phase === 'invalid' ? '#e11d48' : '#1d4ed8';
      logEntry.style.border =
        '1px solid ' +
        (phase === 'valid' ? '#bbf7d0' : phase === 'invalid' ? '#fecdd3' : '#bfdbfe');
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
  id: 'valid-bst',
  name: '验证二叉搜索树',
  viewId: 'algo-valid-bst-view',
  category: 'tree',
  description: '判断给定二叉树是否为合法的二叉搜索树（中序严格递增）',
  icon: '⚖️',
  difficulty: 2,
  levelOrder: 2,
  learningGoal: '理解二叉搜索树的中序单调性与上下界校验方法',
  template,
  Visualizer: ValidBstVisualizer,
});