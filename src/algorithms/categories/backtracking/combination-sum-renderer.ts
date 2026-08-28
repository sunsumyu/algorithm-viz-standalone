/**
 * 组合总和可视化器（回溯）— 4-Card 标准现代架构
 * LeetCode 39：给定无重复元素的整数数组和一个目标整数，找出所有和为目标的组合
 * 元素可以无限重复选取，排序后进行剪枝优化
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
  COMBINATION_SUM_PROBLEM_HTML,
  COMBINATION_SUM_ANALYSIS_HTML,
  COMBINATION_SUM_CODE_LANGUAGES,
} from './combination-sum-problem-content';
import template from './combination-sum.html?raw';

/* ── Build the full decision tree ─────────────────────────── */
export function buildCombinationSumTree(sorted: number[], target: number): BacktrackTreeNode {
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

  function dfs(startIdx: number, remaining: number, path: number[], parent: BacktrackTreeNode): void {
    if (remaining === 0) {
      if (!parent.isPruned) parent.isLeaf = true;
      return;
    }
    for (let i = startIdx; i < sorted.length; i++) {
      nodeIdCounter++;
      const candidate = sorted[i];
      const childPath = [...path, candidate];
      const childId = `${parent.id}-${candidate}-${nodeIdCounter}`;
      const isDirectPrune = !parent.isPruned && candidate > remaining;
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
        dfs(i, remaining - candidate, childPath, node);
      }
    }
  }

  dfs(0, target, [], root);
  return root;
}

export function buildCombinationSumSteps(sorted: number[], target: number): BacktrackTreeStep[] {
  const root = buildCombinationSumTree(sorted, target);
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
    message: `开始搜索：candidates=[${sorted.join(', ')}]，target=${target}，元素可重复选取`,
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

  function traverse(node: BacktrackTreeNode): void {
    const nodeSum = (node.path as number[]).reduce((a, b) => a + b, 0);

    if (node.isLeaf) {
      // 递归进入：先执行 if (sum == target) 判断 —— 成立
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

      // 收集结果并 return
      foundIds.push(node.id);
      solutions.push([...(node.path as number[])]);

      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🎉 找到合法组合：[${node.path.join(', ')}]，收集并返回`,
        codeLine: 11,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'res.add()', value: `[${node.path.join(', ')}]`, type: 'array' },
          { name: 'res.size()', value: String(solutions.length), type: 'number' },
        ],
      });
      return;
    }

    // 遍历子分支
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const childVal = parseInt(child.value, 10);
      const childSum = nodeSum + childVal;

      // 检查剪枝
      if (child.isDirectPrune) {
        if (!dynamicPrunedIds.includes(child.id)) {
          dynamicPrunedIds.push(child.id);
        }
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `✂️ 剪枝：sum(${nodeSum}) + ${childVal} = ${childSum} > target(${target})，break 本层遍历`,
          codeLine: 15,
          stats: { remaining: target - nodeSum, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'sum + c[i]', value: `${childSum} > ${target}`, type: 'boolean' },
            { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
          ],
        });
        continue;
      }

      // 做选择：path.add(c[i])
      visitedIds.push(child.id);
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `做选择：path.add(${childVal})，当前路径：[${child.path.join(', ')}]，sum = ${childSum}`,
        codeLine: 16,
        stats: { remaining: target - childSum, depth: child.depth, count: solutions.length },
        vars: [
          { name: 'c[i]', value: String(childVal), type: 'number' },
          { name: 'sum', value: String(childSum), type: 'number' },
          { name: 'path', value: `[${child.path.join(', ')}]`, type: 'array' },
        ],
      });

      // 递归深入：backtrack(candidates, target, sum + c[i], i, path, res)
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `向下递归：backtrack(target, sum=${childSum}, startIndex=${i})`,
        codeLine: 17,
        stats: { remaining: target - childSum, depth: child.depth, count: solutions.length },
        vars: [
          { name: 'sum', value: String(childSum), type: 'number' },
          { name: 'startIndex', value: String(i), type: 'number' },
        ],
      });

      traverse(child);

      // 撤销选择：path.remove(path.size() - 1)
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🔙 回溯撤销：path.remove(${childVal})，恢复路径至：[${node.path.join(', ') || '空'}]`,
        codeLine: 18,
        stats: { remaining: target - nodeSum, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'path.remove()', value: String(childVal), type: 'number' },
          { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
          { name: 'sum', value: String(nodeSum), type: 'number' },
        ],
      });
    }
  }

  traverse(root);

  // End step
  steps.push({
    nodes: allNodes,
    currentNodeId: 'root',
    visitedNodeIds: [...visitedIds],
    foundPathIds: [...foundIds],
    prunedNodeIds: [...dynamicPrunedIds],
    path: [],
    message: `🎉 搜索完成！共找到 ${solutions.length} 个满足和为 ${target} 的不同组合`,
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
export class CombinationSumVisualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLanguages = COMBINATION_SUM_CODE_LANGUAGES;
  protected codeLines = COMBINATION_SUM_CODE_LANGUAGES['java'];
  protected codePanelTitle = '组合总和代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private treeDisplay: HTMLElement | null = null;
  private pathStackContainer: HTMLElement | null = null;
  private sumMonitorContainer: HTMLElement | null = null;
  private resultCollectionContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;
  private cachedLogs: BacktrackLogItem[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#combination-sum-tree-display');
    this.pathStackContainer = this.root.querySelector('#cs-path-stack-container');
    this.sumMonitorContainer = this.root.querySelector('#cs-sum-monitor-container');
    this.resultCollectionContainer = this.root.querySelector('#cs-result-collection-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定标准播放控制条
    this.bindPlaybackControls();

    // 绑定生成与重置
    this.root.querySelector('#btn-generate')?.addEventListener('click', () => this.start());
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());

    // 绑定 Scrubber 进度条拖拽交互
    const slider = this.root.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val) && val >= 0 && val < this.steps.length) {
          this.goToStep(val);
        }
      });
    }

    // 绑定前进后退按钮
    this.root.querySelector('#btn-step-prev')?.addEventListener('click', () => this.prevStep());
    this.root.querySelector('#btn-step-next')?.addEventListener('click', () => this.nextStep());
    this.root.querySelector('#btn-play-pause')?.addEventListener('click', () => this.togglePlay());

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.cs-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const candEl = this.root?.querySelector('#input-candidates') as HTMLInputElement | null;
        const targetEl = this.root?.querySelector('#input-target') as HTMLInputElement | null;
        if (candEl) candEl.value = btn.dataset.candidates || '';
        if (targetEl) targetEl.value = btn.dataset.target || '';
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: COMBINATION_SUM_PROBLEM_HTML,
      analysisHtml: COMBINATION_SUM_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const candEl = this.root?.querySelector('#input-candidates') as HTMLInputElement | null;
    const targetEl = this.root?.querySelector('#input-target') as HTMLInputElement | null;

    const rawCands = (candEl?.value || '2,3,6,7')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);

    const sorted = Array.from(new Set(rawCands.length > 0 ? rawCands : [2, 3, 6, 7])).sort((a, b) => a - b);
    let target = parseInt(targetEl?.value || '7', 10);
    if (!Number.isFinite(target) || target <= 0) target = 7;
    if (target > 30) target = 30;

    const steps = buildCombinationSumSteps(sorted, target);

    // 预计算日志流
    this.cachedLogs = steps.map((s, idx) => {
      let type: BacktrackLogItem['type'] = 'info';
      if (s.message.includes('做选择')) type = 'push';
      else if (s.message.includes('回溯撤销')) type = 'pop';
      else if (s.message.includes('找到合法组合')) type = 'collect';
      else if (s.message.includes('剪枝')) type = 'prune';

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
        cssPrefix: 'cs',
        nodeLabel: (nd) => (nd.id === 'root' ? '[]' : nd.value),
      });
    }

    // 2. 渲染当前路径栈 (Card 2 Left)
    if (this.pathStackContainer) {
      BacktrackStateSpacePresenter.renderPathStack(this.pathStackContainer, step.path || []);
    }

    // 3. 渲染累加和与剪枝不等式监视器 (Card 2 Center)
    if (this.sumMonitorContainer) {
      const curSum = (step.path as number[]).reduce((a, b) => a + b, 0);
      const targetEl = this.root?.querySelector('#input-target') as HTMLInputElement | null;
      const target = parseInt(targetEl?.value || '7', 10) || 7;
      const remaining = target - curSum;
      const isOver = curSum > target;
      const isMatch = curSum === target;

      let badgeHtml = '';
      if (isMatch) {
        badgeHtml = `<span style="color:#059669; font-weight:700; background:#ecfdf5; padding:2px 6px; border-radius:4px; border:1px solid #a7f3d0;">✓ sum == target (命中)</span>`;
      } else if (isOver) {
        badgeHtml = `<span style="color:#dc2626; font-weight:700; background:#fef2f2; padding:2px 6px; border-radius:4px; border:1px solid #fecaca;">✕ sum > target (超额)</span>`;
      } else {
        badgeHtml = `<span style="color:#2563eb; font-weight:700; background:#eff6ff; padding:2px 6px; border-radius:4px; border:1px solid #bfdbfe;">探索中: 尚需 ${remaining}</span>`;
      }

      this.sumMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>当前累加和: <strong style="color:#0f172a; font-family:monospace; font-size:12px;">${curSum}</strong> / ${target}</span>
            ${badgeHtml}
          </div>
          <div style="background: #f1f5f9; border-radius: 6px; height: 6px; overflow: hidden; position: relative;">
            <div style="background: ${isMatch ? '#10b981' : isOver ? '#ef4444' : '#3b82f6'}; width: ${Math.min(100, (curSum / target) * 100)}%; height: 100%; transition: width 0.2s;"></div>
          </div>
          <div style="font-size: 10.5px; color: #64748b;">剪枝规则: <code style="color:#b45309; font-family:monospace;">sum + c[i] > target => break</code></div>
        </div>
      `;
    }

    // 4. 渲染实时解集箱 (Card 2 Bottom)
    const solutionsUpToNow: Array<Array<number | string>> = [];
    for (let i = 0; i <= index; i++) {
      const s = this.steps[i];
      if (s.message.includes('找到合法组合')) {
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
              this.steps[stepIdx].message.includes('找到合法组合') &&
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

    // 5. 更新 Scrubber 进度条与指示器
    const slider = this.root?.querySelector('#slider-progress') as HTMLInputElement | null;
    const stepCur = this.root?.querySelector('#step-cur') as HTMLElement | null;
    const stepTotal = this.root?.querySelector('#step-total') as HTMLElement | null;
    const playIcon = this.root?.querySelector('#play-icon') as HTMLElement | null;

    if (slider) {
      slider.max = String(Math.max(0, this.steps.length - 1));
      slider.value = String(this.currentIndex);
    }
    if (stepCur) stepCur.textContent = String(this.currentIndex + 1);
    if (stepTotal) stepTotal.textContent = String(this.steps.length);
    if (playIcon) {
      playIcon.className = this.isPlaying ? 'fa-solid fa-pause text-[12px]' : 'fa-solid fa-play text-[12px]';
    }

    // 6. 暗色终端代码行精准高亮
    this.terminalInstance?.highlightLine(step.codeLine);

    // 7. 渲染执行日志流 (Card 4)
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
  id: 'combination-sum',
  name: '组合总和',
  viewId: 'algo-combination-sum-view',
  category: 'backtracking',
  description: '无重复元素，可重复选取，剪枝求目标总和',
  icon: '🎯',
  template,
  Visualizer: CombinationSumVisualizer,
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '掌握元素可重复选取的回溯搜索与累加和剪枝',
});
