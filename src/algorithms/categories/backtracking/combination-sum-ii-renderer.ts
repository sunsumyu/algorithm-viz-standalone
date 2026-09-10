/**
 * 组合总和 II 可视化器（回溯决策树版本）— 4-Card 标准现代架构
 * LeetCode 40：每个元素只能用一次，排序后同层去重与剪枝
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  BacktrackStateSpacePresenter,
  BacktrackLogItem,
} from '../../../core/renderers/backtrack-state-space-presenter';
import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
  renderBacktrackTree,
  resetContainerViewState,
} from './backtracking-tree-helper';
import {
  COMBINATION_SUM_II_PROBLEM_HTML,
  COMBINATION_SUM_II_ANALYSIS_HTML,
  COMBINATION_SUM_II_CODE_LANGUAGES,
} from './combination-sum-ii-problem-content';
import template from './combination-sum-ii.html?raw';

/* ── Build the full decision tree ─────────────────────────── */
export function buildCombinationSum2Tree(nums: number[], target: number): BacktrackTreeNode {
  const sorted = [...nums].sort((a, b) => a - b);
  let nodeIdCounter = 0;
  const root: BacktrackTreeNode = {
    id: 'root',
    value: '[]',
    path: [],
    children: [],
    isLeaf: false,
    isPruned: false,
    parentId: null,
    depth: 0,
  };

  function dfs(start: number, remaining: number, path: number[], parent: BacktrackTreeNode): void {
    if (remaining === 0) {
      if (!parent.isPruned) parent.isLeaf = true;
      return;
    }
    for (let i = start; i < sorted.length; i++) {
      nodeIdCounter++;
      const candidate = sorted[i];
      const childPath = [...path, candidate];
      const childId = `${parent.id}-${candidate}-${nodeIdCounter}`;

      const isDup = i > start && sorted[i] === sorted[i - 1];
      const isExceed = sorted[i] > remaining;
      const isDirectPrune = !parent.isPruned && (isDup || isExceed);
      const isPruned = parent.isPruned || isDirectPrune;

      const node: BacktrackTreeNode = {
        id: childId,
        value: String(candidate),
        path: childPath,
        children: [],
        isLeaf: false,
        isPruned,
        isDirectPrune,
        parentId: parent.id,
        depth: parent.depth + 1,
      };
      parent.children.push(node);
      if (!isPruned) {
        dfs(i + 1, remaining - candidate, childPath, node);
      }
    }
  }

  dfs(0, target, [], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
export function buildCombinationSum2Steps(nums: number[], target: number): BacktrackTreeStep[] {
  const sorted = [...nums].sort((a, b) => a - b);
  const root = buildCombinationSum2Tree(sorted, target);
  layoutTree(root);
  const allNodes = flattenTree(root);

  const steps: BacktrackTreeStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];
  const dynamicPrunedIds: string[] = [];
  const solutions: number[][] = [];

  // Start step
  steps.push({
    nodes: allNodes,
    currentNodeId: 'root',
    visitedNodeIds: ['root'],
    foundPathIds: [],
    prunedNodeIds: [],
    path: [],
    message: `开始搜索：candidates=[${sorted.join(', ')}]，target=${target}，元素不可复用且同层去重`,
    codeLine: 4,
    stats: { remaining: target, depth: 0, count: 0 },
    vars: [
      { name: 'candidates', value: `[${sorted.join(', ')}]`, type: 'array' },
      { name: 'target', value: String(target), type: 'number' },
      { name: 'sum', value: '0', type: 'number' },
      { name: 'path', value: '[]', type: 'array' },
      { name: 'res.size()', value: '0', type: 'number' },
    ],
  });

  function traverse(node: BacktrackTreeNode, start: number): void {
    const nodeSum = (node.path as number[]).reduce((a, b) => a + b, 0);

    if (node.isLeaf) {
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `递归进入：sum = ${nodeSum} == target (${target}) ✓ 满足终止条件`,
        codeLine: 10,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'sum', value: String(nodeSum), type: 'number' },
          { name: 'target', value: String(target), type: 'number' },
          { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
          { name: 'res.size()', value: String(solutions.length), type: 'number' },
        ],
      });

      foundIds.push(node.id);
      solutions.push([...(node.path as number[])]);

      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🎉 找到合法唯一组合：[${node.path.join(', ')}]，收集并返回`,
        codeLine: 11,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'res.add()', value: `[${node.path.join(', ')}]`, type: 'array' },
          { name: 'res.size()', value: String(solutions.length), type: 'number' },
        ],
      });
      return;
    }

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const childVal = parseInt(child.value, 10);
      const childSum = nodeSum + childVal;
      const actualIndex = start + i;

      // 1. 剪枝超额
      if (childSum > target) {
        if (!dynamicPrunedIds.includes(child.id)) dynamicPrunedIds.push(child.id);
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `✂️ 剪枝：sum(${nodeSum}) + ${childVal} = ${childSum} > target(${target})，break 终止本层`,
          codeLine: 15,
          stats: { remaining: target - nodeSum, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'sum + c[i]', value: `${childSum} > ${target}`, type: 'boolean' },
            { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
          ],
        });
        continue;
      }

      // 2. 树层去重判定
      const isDup = i > 0 && childVal === parseInt(node.children[i - 1].value, 10);
      if (isDup) {
        if (!dynamicPrunedIds.includes(child.id)) dynamicPrunedIds.push(child.id);
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `✂️ 树层去重：i > startIndex 且 c[i]==c[i-1] (${childVal}==${childVal})，continue 跳过重复分支`,
          codeLine: 17,
          stats: { remaining: target - nodeSum, depth: node.depth, count: solutions.length },
          vars: [
            { name: '同层去重', value: `c[${actualIndex}]==c[${actualIndex-1}]`, type: 'boolean' },
            { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
          ],
        });
        continue;
      }

      // 3. 做选择
      visitedIds.push(child.id);
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `做选择：path.add(${childVal})，当前路径：[${child.path.join(', ')}]，sum = ${childSum}`,
        codeLine: 18,
        stats: { remaining: target - childSum, depth: child.depth, count: solutions.length },
        vars: [
          { name: 'c[i]', value: String(childVal), type: 'number' },
          { name: 'sum', value: String(childSum), type: 'number' },
          { name: 'path', value: `[${child.path.join(', ')}]`, type: 'array' },
        ],
      });

      // 4. 递归深入：i + 1
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `向下递归：backtrack(target, sum=${childSum}, startIndex=${actualIndex + 1})`,
        codeLine: 19,
        stats: { remaining: target - childSum, depth: child.depth, count: solutions.length },
        vars: [
          { name: 'startIndex', value: String(actualIndex + 1), type: 'number' },
          { name: 'sum', value: String(childSum), type: 'number' },
        ],
      });

      traverse(child, actualIndex + 1);

      // 5. 回溯撤销
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🔙 回溯撤销：path.remove(${childVal})，恢复路径至：[${node.path.join(', ') || '空'}]`,
        codeLine: 20,
        stats: { remaining: target - nodeSum, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'path.remove()', value: String(childVal), type: 'number' },
          { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
          { name: 'sum', value: String(nodeSum), type: 'number' },
        ],
      });
    }
  }

  traverse(root, 0);

  // End step
  steps.push({
    nodes: allNodes,
    currentNodeId: 'root',
    visitedNodeIds: [...visitedIds],
    foundPathIds: [...foundIds],
    prunedNodeIds: [...dynamicPrunedIds],
    path: [],
    message: `🎉 搜索完成！共找到 ${solutions.length} 个不重复组合`,
    codeLine: 5,
    stats: { remaining: target, depth: 0, count: solutions.length },
    vars: [
      { name: 'target', value: String(target), type: 'number' },
      { name: 'res.size()', value: String(solutions.length), type: 'number' },
    ],
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class CombinationSum2Visualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLanguages = COMBINATION_SUM_II_CODE_LANGUAGES;
  protected codeLines = COMBINATION_SUM_II_CODE_LANGUAGES['java'];
  protected codePanelTitle = '组合总和 II 代码调试';

  private treeDisplay: HTMLElement | null = null;
  private pathStackContainer: HTMLElement | null = null;
  private dedupMonitorContainer: HTMLElement | null = null;
  private resultCollectionContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;
  private cachedLogs: BacktrackLogItem[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#combination-sum-ii-tree-display');
    this.pathStackContainer = this.root.querySelector('#cs2-path-stack-container');
    this.dedupMonitorContainer = this.root.querySelector('#cs2-dedup-monitor-container');
    this.resultCollectionContainer = this.root.querySelector('#cs2-result-collection-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.cs2-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const candEl = this.root?.querySelector('#input-candidates') as HTMLInputElement | null;
        const targetEl = this.root?.querySelector('#input-target') as HTMLInputElement | null;
        if (candEl) candEl.value = btn.dataset.candidates || '';
        if (targetEl) targetEl.value = btn.dataset.target || '';
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: COMBINATION_SUM_II_PROBLEM_HTML,
      analysisHtml: COMBINATION_SUM_II_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const candEl = this.root?.querySelector('#input-candidates') as HTMLInputElement | null;
    const targetEl = this.root?.querySelector('#input-target') as HTMLInputElement | null;

    const rawNums = (candEl?.value || '10,1,2,7,6,1,5')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);

    const nums = rawNums.length > 0 ? rawNums : [10, 1, 2, 7, 6, 1, 5];
    let target = parseInt(targetEl?.value || '8', 10);
    if (!Number.isFinite(target) || target <= 0) target = 8;
    if (target > 30) target = 30;

    const steps = buildCombinationSum2Steps(nums, target);

    // 预计算日志流
    this.cachedLogs = steps.map((s, idx) => {
      let type: BacktrackLogItem['type'] = 'info';
      if (s.message.includes('做选择')) type = 'push';
      else if (s.message.includes('回溯撤销')) type = 'pop';
      else if (s.message.includes('找到合法唯一组合')) type = 'collect';
      else if (s.message.includes('剪枝') || s.message.includes('去重')) type = 'prune';

      return {
        stepIndex: idx + 1,
        type,
        text: s.message,
      };
    });

    return steps;
  }

  protected renderStep(step: BacktrackTreeStep): void {
    const index = this.currentIndex;

    // 1. 渲染 SVG 决策树沙盘
    if (this.treeDisplay) {
      renderBacktrackTree({
        container: this.treeDisplay,
        step,
        cssPrefix: 'cs2',
        nodeLabel: (nd) => (nd.id === 'root' ? '[]' : nd.value),
      });
    }

    // 2. 渲染当前路径栈 (Card 2 Left)
    if (this.pathStackContainer) {
      BacktrackStateSpacePresenter.renderPathStack(this.pathStackContainer, step.path || []);
    }

    // 3. 渲染去重与剪枝监视器 (Card 2 Center)
    if (this.dedupMonitorContainer) {
      const curSum = (step.path as number[]).reduce((a, b) => a + b, 0);
      const targetEl = this.root?.querySelector('#input-target') as HTMLInputElement | null;
      const target = parseInt(targetEl?.value || '8', 10) || 8;
      const remaining = target - curSum;
      const isMatch = curSum === target;
      const isOver = curSum > target;

      let badgeHtml = '';
      if (isMatch) {
        badgeHtml = `<span style="color:#059669; font-weight:700; background:#ecfdf5; padding:2px 6px; border-radius:4px; border:1px solid #a7f3d0;">✓ sum == target</span>`;
      } else if (isOver) {
        badgeHtml = `<span style="color:#dc2626; font-weight:700; background:#fef2f2; padding:2px 6px; border-radius:4px; border:1px solid #fecaca;">✕ 剪枝截断</span>`;
      } else {
        badgeHtml = `<span style="color:#2563eb; font-weight:700; background:#eff6ff; padding:2px 6px; border-radius:4px; border:1px solid #bfdbfe;">尚需 ${remaining}</span>`;
      }

      this.dedupMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>当前累加和: <strong style="color:#0f172a; font-family:monospace; font-size:12px;">${curSum}</strong> / ${target}</span>
            ${badgeHtml}
          </div>
          <div style="background: #f1f5f9; border-radius: 6px; height: 6px; overflow: hidden; position: relative;">
            <div style="background: ${isMatch ? '#10b981' : isOver ? '#ef4444' : '#3b82f6'}; width: ${Math.min(100, (curSum / target) * 100)}%; height: 100%; transition: width 0.2s;"></div>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4;">
            <div>• 树层去重: <code style="color:#b45309; font-family:monospace;">i > start && c[i]==c[i-1] => continue</code></div>
            <div>• 累加剪枝: <code style="color:#b45309; font-family:monospace;">sum + c[i] > target => break</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染实时解集箱 (Card 2 Bottom)
    const solutionsUpToNow: Array<Array<number | string>> = [];
    for (let i = 0; i <= index; i++) {
      const s = this.steps[i];
      if (s.message.includes('找到合法唯一组合')) {
        solutionsUpToNow.push([...s.path]);
      }
    }

    if (this.resultCollectionContainer) {
      BacktrackStateSpacePresenter.renderResultCollection(
        this.resultCollectionContainer,
        solutionsUpToNow,
        -1,
        (solIdx: number) => {
          for (let stepIdx = 0; stepIdx < this.steps.length; stepIdx++) {
            if (
              this.steps[stepIdx].message.includes('找到合法唯一组合') &&
              JSON.stringify(this.steps[stepIdx].path) === JSON.stringify(solutionsUpToNow[solIdx])
            ) {
              this.goToStep(stepIdx);
              break;
            }
          }
        }
      );
    }

    const badgeCount = this.root?.querySelector('#badge-result-count');
    if (badgeCount) {
      badgeCount.textContent = `解集: ${solutionsUpToNow.length}`;
    }

    // 5. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      BacktrackStateSpacePresenter.renderBacktrackLogStream(
        this.logContainer,
        this.cachedLogs.slice(0, this.currentIndex + 1),
        this.currentIndex
      );
    }
    if (this.logCountEl) {
      this.logCountEl.textContent = `${this.currentIndex + 1} / ${this.steps.length} 记录`;
    }
  }

  public reset(): void {
    super.reset();
    resetContainerViewState(this.treeDisplay);
    if (this.treeDisplay) this.treeDisplay.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'combination-sum-ii',
  name: '组合总和 II',
  viewId: 'algo-combination-sum-ii-view',
  category: 'backtracking',
  description: '含重复元素，每个元素限用一次，同层去重',
  icon: '🎯',
  template,
  Visualizer: CombinationSum2Visualizer,
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '掌握经典树层去重 (i > startIndex && c[i]==c[i-1]) 机制',
});
