/**
 * 递增子序列可视化器（回溯算法）— 4-Card 标准现代架构
 * LeetCode 491：给定整数数组，找出所有长度 >= 2 的非递减子序列
 * 不能排序（要保持原数组顺序）；同层用 Set 去重（未排序无法相邻比较）
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
  INCREASING_SUBSEQUENCES_PROBLEM_HTML,
  INCREASING_SUBSEQUENCES_ANALYSIS_HTML,
  INCREASING_SUBSEQUENCES_CODE_LANGUAGES,
} from './increasing-subsequences-problem-content';
import template from './increasing-subsequences.html?raw';

/* ── Build the full decision tree ─────────────────────────── */
export function buildIncSubTree(nums: number[]): BacktrackTreeNode {
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

  function dfs(start: number, path: number[], parent: BacktrackTreeNode): void {
    const levelUsed = new Set<number>();

    for (let i = start; i < nums.length; i++) {
      nodeIdCounter++;
      const candidate = nums[i];
      const childPath = [...path, candidate];
      const childId = `${parent.id}-${candidate}-${nodeIdCounter}`;

      // 剪枝 1：同层 Set 去重
      const isDup = levelUsed.has(candidate);
      // 剪枝 2：破坏非递减性
      const isDecreasing = path.length > 0 && candidate < path[path.length - 1];

      const isDirectPrune = !parent.isPruned && (isDup || isDecreasing);
      const isPruned = parent.isPruned || isDirectPrune;

      const node: BacktrackTreeNode = {
        id: childId,
        value: String(candidate),
        path: childPath,
        children: [],
        isLeaf: !isPruned && childPath.length >= 2,
        isPruned,
        isDirectPrune,
        parentId: parent.id,
        depth: parent.depth + 1,
      };
      parent.children.push(node);

      if (!isPruned) {
        levelUsed.add(candidate);
        dfs(i + 1, childPath, node);
      }
    }
  }

  dfs(0, [], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
export function buildIncSubSteps(nums: number[]): BacktrackTreeStep[] {
  const root = buildIncSubTree(nums);
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
    message: `开始搜索：nums = [${nums.join(', ')}]，保持原数组先后次序，收集所有长度 &ge; 2 的非递减子序列`,
    codeLine: 3,
    stats: { remaining: nums.length, depth: 0, count: 0 },
    vars: [
      { name: 'nums', value: `[${nums.join(', ')}]`, type: 'array' },
      { name: 'startIndex', value: '0', type: 'number' },
      { name: 'path', value: '[]', type: 'array' },
      { name: 'res.size()', value: '0', type: 'number' },
    ],
  });

  function traverse(node: BacktrackTreeNode, startIndex: number): void {
    // 1. 满足长度 >= 2 收集（但不 return）
    if (node.path.length >= 2) {
      foundIds.push(node.id);
      solutions.push([...(node.path as number[])]);

      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🎉 收集递增子序列：[${node.path.join(', ')}]（长度 &ge; 2，继续深入寻找更长子序列）`,
        codeLine: 9,
        stats: { remaining: nums.length - startIndex, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'res.add()', value: `[${node.path.join(', ')}]`, type: 'array' },
          { name: 'res.size()', value: String(solutions.length), type: 'number' },
        ],
      });
    }

    const levelUsed = new Set<number>();

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const childVal = parseInt(child.value, 10);
      const actualIndex = startIndex + i;

      // 2. 剪枝 1：非递减性被破坏
      if (node.path.length > 0 && childVal < (node.path[node.path.length - 1] as number)) {
        if (!dynamicPrunedIds.includes(child.id)) dynamicPrunedIds.push(child.id);
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `✂️ 递减剪枝：nums[${actualIndex}] = ${childVal} < 末尾元素 ${node.path[node.path.length - 1]}，破坏非递减性，跳过`,
          codeLine: 14,
          stats: { remaining: nums.length - startIndex, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'nums[i] < path.last', value: `${childVal} < ${node.path[node.path.length - 1]}`, type: 'boolean' },
          ],
        });
        continue;
      }

      // 3. 剪枝 2：当前层 Set 重复数值
      if (levelUsed.has(childVal)) {
        if (!dynamicPrunedIds.includes(child.id)) dynamicPrunedIds.push(child.id);
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `✂️ 树层 Set 去重：当前递归层已使用过数字 ${childVal}，continue 跳过`,
          codeLine: 15,
          stats: { remaining: nums.length - startIndex, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'used.contains', value: String(childVal), type: 'number' },
          ],
        });
        continue;
      }

      levelUsed.add(childVal);

      // 4. 做选择
      visitedIds.push(child.id);
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `做选择：used.add(${childVal})，path.add(${childVal})，当前子序列: [${child.path.join(', ')}]`,
        codeLine: 17,
        stats: { remaining: nums.length - (actualIndex + 1), depth: child.depth, count: solutions.length },
        vars: [
          { name: 'used.add()', value: String(childVal), type: 'number' },
          { name: 'path', value: `[${child.path.join(', ')}]`, type: 'array' },
        ],
      });

      // 5. 向下递归
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `向下递归：backtrack(nums, startIndex=${actualIndex + 1}, path, res)`,
        codeLine: 18,
        stats: { remaining: nums.length - (actualIndex + 1), depth: child.depth, count: solutions.length },
        vars: [
          { name: 'startIndex', value: String(actualIndex + 1), type: 'number' },
        ],
      });

      traverse(child, actualIndex + 1);

      // 6. 回溯撤销
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🔙 回溯撤销：path.remove(${childVal})（注意：同层 used Set 不回溯），恢复路径至: [${node.path.join(', ') || '空'}]`,
        codeLine: 19,
        stats: { remaining: nums.length - startIndex, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'path.remove()', value: String(childVal), type: 'number' },
          { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
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
    message: `🎉 搜索完成！共找到 ${solutions.length} 个合法递增子序列`,
    codeLine: 5,
    stats: { remaining: 0, depth: 0, count: solutions.length },
    vars: [
      { name: 'nums', value: `[${nums.join(', ')}]`, type: 'array' },
      { name: 'res.size()', value: String(solutions.length), type: 'number' },
    ],
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class IncreasingSubsequencesVisualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLanguages = INCREASING_SUBSEQUENCES_CODE_LANGUAGES;
  protected codeLines = INCREASING_SUBSEQUENCES_CODE_LANGUAGES['java'];
  protected codePanelTitle = '非递减子序列 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private treeDisplay: HTMLElement | null = null;
  private pathStackContainer: HTMLElement | null = null;
  private monitorContainer: HTMLElement | null = null;
  private resultCollectionContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;
  private cachedLogs: BacktrackLogItem[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#increasing-subsequences-tree-display');
    this.pathStackContainer = this.root.querySelector('#is-path-stack-container');
    this.monitorContainer = this.root.querySelector('#is-monitor-container');
    this.resultCollectionContainer = this.root.querySelector('#is-result-collection-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定播放控制
    this.bindPlaybackControls();

    // 绑定生成与重置
    this.root.querySelector('#btn-generate')?.addEventListener('click', () => this.start());
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());

    // 绑定 Scrubber 进度条
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
    this.root.querySelectorAll<HTMLButtonElement>('.is-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const numsEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
        if (numsEl) numsEl.value = btn.dataset.nums || '';
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: INCREASING_SUBSEQUENCES_PROBLEM_HTML,
      analysisHtml: INCREASING_SUBSEQUENCES_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const numsEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
    const rawNums = (numsEl?.value || '4,6,7,7')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    const nums = rawNums.length > 0 ? rawNums : [4, 6, 7, 7];
    if (nums.length > 6) nums.length = 6;

    const steps = buildIncSubSteps(nums);

    // 预计算日志流
    this.cachedLogs = steps.map((st, idx) => {
      let type: BacktrackLogItem['type'] = 'info';
      if (st.message.includes('做选择')) type = 'push';
      else if (st.message.includes('回溯撤销')) type = 'pop';
      else if (st.message.includes('收集递增子序列')) type = 'collect';
      else if (st.message.includes('剪枝') || st.message.includes('去重')) type = 'prune';

      return {
        stepIndex: idx + 1,
        type,
        text: st.message,
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
        cssPrefix: 'is',
        nodeLabel: (nd) => (nd.id === 'root' ? '[]' : nd.value),
      });
    }

    // 2. 渲染当前路径栈 (Card 2 Left)
    if (this.pathStackContainer) {
      BacktrackStateSpacePresenter.renderPathStack(this.pathStackContainer, step.path || []);
    }

    // 3. 渲染 Set 去重与非递减监视器 (Card 2 Center)
    if (this.monitorContainer) {
      const isPruneStep = step.message.includes('剪枝') || step.message.includes('去重');
      const isLenValid = step.path.length >= 2;

      this.monitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>当前序列长度: <strong style="color: #0f172a; font-family: monospace; font-size: 12px;">${step.path.length}</strong></span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isLenValid ? '#ecfdf5' : '#eff6ff'}; color: ${isLenValid ? '#059669' : '#2563eb'}; border: 1px solid ${isLenValid ? '#a7f3d0' : '#bfdbfe'};">
              ${isLenValid ? '✓ 满足长度 &ge; 2 (已收集)' : '长度 < 2 (继续探索)'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 去重机制: <code style="color:#b45309; font-family:monospace;">HashSet&lt;Integer&gt; used</code> (每层独立)</div>
            <div>• 顺序约束: <code style="color:#b45309; font-family:monospace;">nums[i] &ge; path.last()</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染实时解集箱 (Card 2 Bottom)
    const solutionsUpToNow: Array<Array<number | string>> = [];
    for (let i = 0; i <= index; i++) {
      const st = this.steps[i];
      if (st.message.includes('收集递增子序列')) {
        solutionsUpToNow.push([...st.path]);
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
              this.steps[stepIdx].message.includes('收集递增子序列') &&
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

    // 5. 更新 Scrubber 进度条
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

    // 6. 暗色终端代码行高亮
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
  id: 'increasing-subsequences',
  name: '递增子序列',
  viewId: 'algo-increasing-subsequences-view',
  category: 'backtracking',
  description: '求数组所有长度 >= 2 的非递减子序列，不能排序，局部 Set 去重',
  icon: '📈',
  template,
  Visualizer: IncreasingSubsequencesVisualizer,
  difficulty: 2,
  levelOrder: 11,
  learningGoal: '掌握不能排序时的局部 HashSet 树层去重与非终止型全路径状态收集',
});
