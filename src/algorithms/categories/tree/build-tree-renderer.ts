/**
 * 从前序与中序遍历构造二叉树可视化器 — 4-Card 标准现代架构
 * 前序定根、中序切分左右子树、递归组装与拓扑实时绘制
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  BUILD_TREE_PROBLEM_HTML,
  BUILD_TREE_ANALYSIS_HTML,
  BUILD_TREE_CODE_LANGUAGES,
} from './build-tree-problem-content';
import { TreeNode, renderTreeSVG } from './tree-template';
import { parseArray } from '../sort/bubble-sort-renderer';
import template from './build-tree.html?raw';

export interface BTStep {
  tree: TreeNode | null;
  preorder: number[];
  inorder: number[];
  pL: number;
  pR: number;
  iL: number;
  iR: number;
  rootVal: number | null;
  inRoot: number;
  leftLen: number;
  action: 'enter' | 'split' | 'leave' | 'done';
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

export function buildTreeSteps(preorder: number[], inorder: number[]): BTStep[] {
  const steps: BTStep[] = [];
  const n = preorder.length;

  if (n === 0 || inorder.length !== n) {
    steps.push({
      tree: null,
      preorder,
      inorder,
      pL: -1,
      pR: -1,
      iL: -1,
      iR: -1,
      rootVal: null,
      inRoot: -1,
      leftLen: 0,
      action: 'done',
      message: '数组为空或长度不匹配，无法构造二叉树。',
      log: '空数组/长度不匹配',
      codeLine: 2,
    });
    return steps;
  }

  const inMap = new Map<number, number>();
  inorder.forEach((val, idx) => inMap.set(val, idx));

  steps.push({
    tree: null,
    preorder: [...preorder],
    inorder: [...inorder],
    pL: 0,
    pR: n - 1,
    iL: 0,
    iR: n - 1,
    rootVal: null,
    inRoot: -1,
    leftLen: 0,
    action: 'enter',
    message: `初始化前中序构造：数组长度 n = ${n}，已建立中序索引哈希表。`,
    log: `初始化 pre=[${preorder.join(',')}] in=[${inorder.join(',')}]`,
    codeLine: [3, 4],
  });

  const build = (pL: number, pR: number, iL: number, iR: number): TreeNode | null => {
    if (pL > pR || iL > iR) return null;

    const rootVal = preorder[pL];
    const rootNode: TreeNode = { val: rootVal, left: null, right: null };
    const inRoot = inMap.get(rootVal)!;
    const leftLen = inRoot - iL;

    steps.push({
      tree: cloneTree(rootNode),
      preorder: [...preorder],
      inorder: [...inorder],
      pL,
      pR,
      iL,
      iR,
      rootVal,
      inRoot,
      leftLen,
      action: 'split',
      message: `区间切分：选定根节点 ${rootVal}。中序根位于下标 ${inRoot}，划分左子树长度 ${leftLen}，右子树长度 ${
        iR - inRoot
      }。`,
      log: `根 ${rootVal}: inRoot=${inRoot}, leftLen=${leftLen}`,
      codeLine: [8, 9, 10, 11],
    });

    rootNode.left = build(pL + 1, pL + leftLen, iL, inRoot - 1);
    rootNode.right = build(pL + leftLen + 1, pR, inRoot + 1, iR);

    steps.push({
      tree: cloneTree(rootNode),
      preorder: [...preorder],
      inorder: [...inorder],
      pL,
      pR,
      iL,
      iR,
      rootVal,
      inRoot,
      leftLen,
      action: 'leave',
      message: `子树组装完成：以 ${rootVal} 为根的子树构造完毕。`,
      log: `节点 ${rootVal} 子树组装完毕`,
      codeLine: [12, 13, 14],
    });

    return rootNode;
  };

  const finalTree = build(0, n - 1, 0, n - 1);

  steps.push({
    tree: cloneTree(finalTree),
    preorder: [...preorder],
    inorder: [...inorder],
    pL: 0,
    pR: n - 1,
    iL: 0,
    iR: n - 1,
    rootVal: null,
    inRoot: -1,
    leftLen: 0,
    action: 'done',
    message: '🎉 前中序构造二叉树全部完成！',
    log: '✓ 构造完成',
    codeLine: 5,
  });

  return steps;
}

export class BuildTreeVisualizer extends StepVisualizer<BTStep> {
  protected codeLanguages = BUILD_TREE_CODE_LANGUAGES;
  protected codeLines = BUILD_TREE_CODE_LANGUAGES['java'];
  protected codePanelTitle = '前中序构造二叉树 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private treeSvgContainer: HTMLElement | null = null;
  private preCellsEl: HTMLElement | null = null;
  private inCellsEl: HTMLElement | null = null;
  private metricRootValEl: HTMLElement | null = null;
  private metricPreRangeEl: HTMLElement | null = null;
  private metricInRangeEl: HTMLElement | null = null;
  private metricInRootEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.treeSvgContainer = this.root.querySelector('#bt-tree-svg-container');
    this.preCellsEl = this.root.querySelector('#pre-cells');
    this.inCellsEl = this.root.querySelector('#in-cells');
    this.metricRootValEl = this.root.querySelector('#metric-root-val');
    this.metricPreRangeEl = this.root.querySelector('#metric-pre-range');
    this.metricInRangeEl = this.root.querySelector('#metric-in-range');
    this.metricInRootEl = this.root.querySelector('#metric-in-root');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#bt-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>.bind(this.root)('.bt-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preInput = this.root?.querySelector('#input-pre') as HTMLInputElement | null;
        const inInput = this.root?.querySelector('#input-in') as HTMLInputElement | null;
        if (preInput && btn.dataset.pre) preInput.value = btn.dataset.pre;
        if (inInput && btn.dataset.in) inInput.value = btn.dataset.in;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: BUILD_TREE_PROBLEM_HTML,
      analysisHtml: BUILD_TREE_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): BTStep[] {
    const preInput = this.root?.querySelector('#input-pre') as HTMLInputElement | null;
    const inInput = this.root?.querySelector('#input-in') as HTMLInputElement | null;
    const rawPre = preInput?.value || '3, 9, 20, 15, 7';
    const rawIn = inInput?.value || '9, 3, 15, 20, 7';
    const pre = parseArray(rawPre);
    const inArr = parseArray(rawIn);
    return buildTreeSteps(pre, inArr);
  }

  protected renderStep(step: BTStep): void {
    const { tree, preorder, inorder, pL, pR, iL, iR, rootVal, inRoot, leftLen, action, message } = step;

    // 1. 渲染 SVG 树拓扑
    if (this.treeSvgContainer) {
      const highlight = rootVal != null ? new Set([rootVal]) : new Set<number>();
      renderTreeSVG(this.treeSvgContainer, tree, highlight, '#fbbf24');
    }

    // 2. 渲染 Preorder / Inorder 数组区间切分
    if (this.preCellsEl) {
      this.preCellsEl.innerHTML = preorder
        .map((val, idx) => {
          const isRoot = idx === pL && action !== 'done';
          const inLeft = idx > pL && idx <= pL + leftLen && action !== 'done';
          const inRight = idx > pL + leftLen && idx <= pR && action !== 'done';

          let cellClass = 'bt-cell';
          if (isRoot) cellClass += ' is-root';
          else if (inLeft) cellClass += ' in-left';
          else if (inRight) cellClass += ' in-right';

          return `<span class="${cellClass}">${val}</span>`;
        })
        .join('');
    }

    if (this.inCellsEl) {
      this.inCellsEl.innerHTML = inorder
        .map((val, idx) => {
          const isRoot = idx === inRoot && action !== 'done';
          const inLeft = idx >= iL && idx < inRoot && action !== 'done';
          const inRight = idx > inRoot && idx <= iR && action !== 'done';

          let cellClass = 'bt-cell';
          if (isRoot) cellClass += ' is-root';
          else if (inLeft) cellClass += ' in-left';
          else if (inRight) cellClass += ' in-right';

          return `<span class="${cellClass}">${val}</span>`;
        })
        .join('');
    }

    // 3. 更新状态监视器
    if (this.metricRootValEl) this.metricRootValEl.textContent = rootVal != null ? `${rootVal}` : '—';
    if (this.metricPreRangeEl) {
      this.metricPreRangeEl.textContent = pL >= 0 && pR >= 0 ? `[${pL}, ${pR}]` : '—';
    }
    if (this.metricInRangeEl) {
      this.metricInRangeEl.textContent = iL >= 0 && iR >= 0 ? `[${iL}, ${iR}]` : '—';
    }
    if (this.metricInRootEl) {
      this.metricInRootEl.textContent = inRoot >= 0 ? `${inRoot} (leftLen=${leftLen})` : '—';
    }

    if (this.formulaActionEl) {
      if (action === 'split') {
        this.formulaActionEl.textContent = `root=${rootVal}, leftLen=${leftLen}, inRoot=${inRoot}`;
      } else if (action === 'done') {
        this.formulaActionEl.textContent = '二叉树构造完成';
      } else {
        this.formulaActionEl.textContent = 'leftLen = inRoot - iL';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 4. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        action === 'done' ? '#f0fdf4' : action === 'split' ? '#eff6ff' : '#f8fafc';
      logEntry.style.color =
        action === 'done' ? '#15803d' : action === 'split' ? '#1d4ed8' : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done' ? '#bbf7d0' : action === 'split' ? '#bfdbfe' : '#e2e8f0');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    // 5. 同步代码高亮
    if (this.terminalInstance) {
      const line = Array.isArray(step.codeLine) ? step.codeLine[0] : step.codeLine;
      this.terminalInstance.highlightLine(line);
    }

    // 6. 更新底部播放控制条
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
  id: 'build-tree',
  name: '前中序构造二叉树',
  viewId: 'algo-build-tree-view',
  category: 'tree',
  description: '根据前序遍历与中序遍历序列递归切分并构造完整二叉树',
  icon: '🔨',
  difficulty: 2,
  levelOrder: 9,
  learningGoal: '掌握通过前序定位根节点与中序切分左右子树区间的构造技巧',
  template,
  Visualizer: BuildTreeVisualizer,
});
