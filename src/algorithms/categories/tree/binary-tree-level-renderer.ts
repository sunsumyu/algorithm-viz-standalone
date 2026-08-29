/**
 * 二叉树层序遍历可视化器 — 4-Card 标准现代架构
 * BFS 广度优先搜索、队列动态进出、层边界确定与分层收集
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  BINARY_TREE_LEVEL_PROBLEM_HTML,
  BINARY_TREE_LEVEL_ANALYSIS_HTML,
  BINARY_TREE_LEVEL_CODE_LANGUAGES,
} from './binary-tree-level-problem-content';
import { TreeNode, buildTreeFromArr as buildTree, renderTreeSVG } from './tree-template';
import template from './binary-tree-level.html?raw';

export interface BTLStep {
  tree: TreeNode | null;
  current: number | null;
  levelIndex: number;
  levelSize: number;
  queue: number[];
  currentLevel: number[];
  result: number[][];
  action: 'init' | 'start-level' | 'poll-node' | 'end-level' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildBTLSteps(root: TreeNode | null): BTLStep[] {
  const steps: BTLStep[] = [];
  const result: number[][] = [];

  steps.push({
    tree: root,
    current: null,
    levelIndex: 0,
    levelSize: 0,
    queue: root ? [root.val] : [],
    currentLevel: [],
    result: [],
    action: 'init',
    message: root ? `初始化层序遍历：根节点 ${root.val} 入队。` : '空树，返回空层序 []。',
    log: root ? `根节点 ${root.val} 入队` : '空树',
    codeLine: [4, 5, 6],
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: [],
      action: 'done',
      message: '✅ 遍历完成，返回 []。',
      log: '✓ 完成: []',
      codeLine: 4,
    });
    return steps;
  }

  const queue: TreeNode[] = [root];
  let levelIdx = 0;

  while (queue.length > 0) {
    const size = queue.length;
    const currentLevel: number[] = [];
    const qSnapshot = queue.map((n) => n.val);

    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: size,
      queue: [...qSnapshot],
      currentLevel: [],
      result: result.map((l) => [...l]),
      action: 'start-level',
      message: `开始遍历第 ${levelIdx} 层：当前队列大小 size = ${size}，节点为 [${qSnapshot.join(', ')}]。`,
      log: `第 ${levelIdx} 层开始 (size=${size})`,
      codeLine: [7, 8, 9],
    });

    for (let i = 0; i < size; i++) {
      const node = queue.shift()!;
      currentLevel.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);

      const remainingQ = queue.map((n) => n.val);

      steps.push({
        tree: root,
        current: node.val,
        levelIndex: levelIdx,
        levelSize: size,
        queue: [...remainingQ],
        currentLevel: [...currentLevel],
        result: result.map((l) => [...l]),
        action: 'poll-node',
        message: `节点 ${node.val} 出队，加入本层结果。${node.left ? `左孩子 ${node.left.val} 入队。` : ''}${
          node.right ? `右孩子 ${node.right.val} 入队。` : ''
        }`,
        log: `出队 ${node.val} -> 本层: [${currentLevel.join(', ')}]`,
        codeLine: [10, 11, 12, 13, 14],
      });
    }

    result.push([...currentLevel]);

    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: size,
      queue: queue.map((n) => n.val),
      currentLevel: [...currentLevel],
      result: result.map((l) => [...l]),
      action: 'end-level',
      message: `第 ${levelIdx} 层收集完成：[${currentLevel.join(', ')}]，追加至结果总集。`,
      log: `第 ${levelIdx} 层完成 -> [${currentLevel.join(', ')}]`,
      codeLine: 16,
    });

    levelIdx++;
  }

  steps.push({
    tree: root,
    current: null,
    levelIndex: levelIdx,
    levelSize: 0,
    queue: [],
    currentLevel: [],
    result: result.map((l) => [...l]),
    action: 'done',
    message: `🎉 层序遍历全部完成！结果：[${result.map((l) => `[${l.join(', ')}]`).join(', ')}]。`,
    log: `✓ 完成: [${result.map((l) => `[${l.join(',')}]`).join(',')}]`,
    codeLine: 18,
  });

  return steps;
}

export class BinaryTreeLevelVisualizer extends StepVisualizer<BTLStep> {
  protected codeLanguages = BINARY_TREE_LEVEL_CODE_LANGUAGES;
  protected codeLines = BINARY_TREE_LEVEL_CODE_LANGUAGES['java'];
  protected codePanelTitle = '二叉树层序遍历 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private treeSvgContainer: HTMLElement | null = null;
  private metricLevelIdxEl: HTMLElement | null = null;
  private metricCurNodeEl: HTMLElement | null = null;
  private metricLevelSizeEl: HTMLElement | null = null;
  private metricCollectedLevelsEl: HTMLElement | null = null;
  private queueElementsEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.treeSvgContainer = this.root.querySelector('#btl-tree-svg-container');
    this.metricLevelIdxEl = this.root.querySelector('#metric-level-idx');
    this.metricCurNodeEl = this.root.querySelector('#metric-cur-node');
    this.metricLevelSizeEl = this.root.querySelector('#metric-level-size');
    this.metricCollectedLevelsEl = this.root.querySelector('#metric-collected-levels');
    this.queueElementsEl = this.root.querySelector('#queue-elements');
    this.liveTextEl = this.root.querySelector('#btl-live-text');
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
    this.root.querySelectorAll<HTMLButtonElement>.bind(this.root)('.btl-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const treeInput = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
        if (treeInput && btn.dataset.tree) treeInput.value = btn.dataset.tree;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: BINARY_TREE_LEVEL_PROBLEM_HTML,
      analysisHtml: BINARY_TREE_LEVEL_ANALYSIS_HTML,
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

  protected buildSteps(): BTLStep[] {
    const treeInput = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
    const raw = treeInput?.value || '3, 9, 20, null, null, 15, 7';
    const arr = this.parseTreeInput(raw);
    const root = buildTree(arr);
    return buildBTLSteps(root);
  }

  protected renderStep(step: BTLStep): void {
    const { tree, current, levelIndex, levelSize, queue, currentLevel, result, action, message } = step;

    // 1. 渲染 SVG 树拓扑
    if (this.treeSvgContainer) {
      const highlight = current != null ? new Set([current]) : new Set<number>();
      const secondaryHighlight = new Set<number>([...queue, ...currentLevel]);
      const secondaryColor = '#3b82f6';

      renderTreeSVG(
        this.treeSvgContainer,
        tree,
        highlight,
        '#fbbf24',
        secondaryHighlight,
        secondaryColor,
      );
    }

    // 2. 更新状态监视器
    if (this.metricLevelIdxEl) this.metricLevelIdxEl.textContent = `${levelIndex}`;
    if (this.metricCurNodeEl) this.metricCurNodeEl.textContent = current != null ? `${current}` : '—';
    if (this.metricLevelSizeEl) this.metricLevelSizeEl.textContent = `${levelSize}`;
    if (this.metricCollectedLevelsEl) this.metricCollectedLevelsEl.textContent = `${result.length}`;
    if (this.queueElementsEl) {
      this.queueElementsEl.textContent = queue.length > 0 ? `[ ${queue.join(', ')} ]` : '[ (空) ]';
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        action === 'done' ? '#f0fdf4' : action === 'poll-node' ? '#eff6ff' : '#f8fafc';
      logEntry.style.color =
        action === 'done' ? '#15803d' : action === 'poll-node' ? '#1d4ed8' : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done' ? '#bbf7d0' : action === 'poll-node' ? '#bfdbfe' : '#e2e8f0');
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
  id: 'binary-tree-level',
  name: '二叉树层序遍历',
  viewId: 'algo-binary-tree-level-view',
  category: 'tree',
  description: '使用队列进行二叉树的广度优先层序遍历',
  icon: '🌊',
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '掌握利用队列按层大小循环实现 BFS 的标准模板',
  template,
  Visualizer: BinaryTreeLevelVisualizer,
});