/**
 * 二叉树层序遍历可视化器 — 4-Card 标准现代架构
 * BFS 广度优先搜索、队列动态进出、层边界确定与分层收集
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
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

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.btl-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const treeInput = this.root?.querySelector('#input-tree') as HTMLInputElement | null;
        if (treeInput && btn.dataset.tree) treeInput.value = btn.dataset.tree;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
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
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let bg =
          st.action === 'done' ? '#f0fdf4' : st.action === 'poll-node' ? '#eff6ff' : '#f8fafc';
        let color =
          st.action === 'done' ? '#15803d' : st.action === 'poll-node' ? '#1d4ed8' : '#64748b';
        let border =
          st.action === 'done' ? '#bbf7d0' : st.action === 'poll-node' ? '#bfdbfe' : '#e2e8f0';
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

    const badgeLevel = this.root?.querySelector('#badge-cur-level');
    if (badgeLevel) {
      badgeLevel.textContent = action === 'done' ? '层序遍历完成' : `第 ${step.levelIndex} 层`;
    }
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