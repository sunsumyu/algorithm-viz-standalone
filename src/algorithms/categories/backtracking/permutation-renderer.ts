/**
 * 全排列可视化器（回溯算法）— 4-Card 标准现代架构
 * LeetCode 46：给定不含重复数字的数组，返回所有可能的全排列
 * 核心：全循环枚举 + used[] 树枝去重标记
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
  PERMUTATION_PROBLEM_HTML,
  PERMUTATION_ANALYSIS_HTML,
  PERMUTATION_CODE_LANGUAGES,
} from './permutation-problem-content';
import template from './permutation.html?raw';

/* ── Build the full decision tree ─────────────────────────── */
export function buildPermutationTree(nums: number[]): BacktrackTreeNode {
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

  function dfs(used: boolean[], path: number[], parent: BacktrackTreeNode): void {
    if (path.length === nums.length) {
      parent.isLeaf = true;
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      nodeIdCounter++;
      const candidate = nums[i];
      const childPath = [...path, candidate];
      const childId = `${parent.id}-${candidate}-${nodeIdCounter}`;

      const childNode: BacktrackTreeNode = {
        id: childId,
        value: String(candidate),
        path: childPath,
        children: [],
        isLeaf: childPath.length === nums.length,
        isPruned: false,
        parentId: parent.id,
        depth: parent.depth + 1,
      };
      parent.children.push(childNode);

      used[i] = true;
      dfs(used, childPath, childNode);
      used[i] = false;
    }
  }

  dfs(new Array(nums.length).fill(false), [], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
export function buildPermutationSteps(nums: number[]): BacktrackTreeStep[] {
  if (nums.length === 0) {
    return [
      {
        nodes: [],
        currentNodeId: 'root',
        visitedNodeIds: [],
        foundPathIds: [],
        prunedNodeIds: [],
        path: [],
        message: '输入为空，返回空列表 []',
        codeLine: 2,
        stats: {},
      },
    ];
  }

  const root = buildPermutationTree(nums);
  layoutTree(root);
  const allNodes = flattenTree(root);

  const steps: BacktrackTreeStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];
  const solutions: number[][] = [];
  const used = new Array(nums.length).fill(false);

  // Start step
  steps.push({
    nodes: allNodes,
    currentNodeId: 'root',
    visitedNodeIds: ['root'],
    foundPathIds: [],
    prunedNodeIds: [],
    path: [],
    message: `开始搜索：nums = [${nums.join(', ')}]，全排列使用 used[] 数组进行树枝去重`,
    codeLine: 4,
    stats: { remaining: nums.length, depth: 0, count: 0 },
    vars: [
      { name: 'nums', value: `[${nums.join(', ')}]`, type: 'array' },
      { name: 'used', value: `[${used.map((u) => (u ? 'T' : 'F')).join(', ')}]`, type: 'array' },
      { name: 'path', value: '[]', type: 'array' },
      { name: 'res.size()', value: '0', type: 'number' },
    ],
  });

  function traverse(node: BacktrackTreeNode): void {
    if (node.path.length === nums.length) {
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        message: `递归进入：path.size() == ${nums.length} ✓ 构造完成一个全排列`,
        codeLine: 8,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'path.size()', value: String(nums.length), type: 'number' },
          { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
        ],
      });

      foundIds.push(node.id);
      solutions.push([...(node.path as number[])]);

      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        message: `🎉 收集排列方案：[${node.path.join(', ')}]，收集并返回`,
        codeLine: 9,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'res.add()', value: `[${node.path.join(', ')}]`, type: 'array' },
          { name: 'res.size()', value: String(solutions.length), type: 'number' },
        ],
      });
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      const candidate = nums[i];

      // 树枝去重检查
      if (used[i]) {
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [],
          path: [...node.path],
          message: `树枝跳过：used[${i}] (元素 ${candidate}) 为 true，已在当前排列分支中，continue`,
          codeLine: 13,
          stats: { remaining: nums.length - node.path.length, depth: node.depth, count: solutions.length },
          vars: [
            { name: `used[${i}]`, value: 'true', type: 'boolean' },
            { name: 'candidate', value: String(candidate), type: 'number' },
          ],
        });
        continue;
      }

      const childNode = node.children.find((c) => parseInt(c.value, 10) === candidate);
      if (!childNode) continue;

      // 做选择
      used[i] = true;
      visitedIds.push(childNode.id);
      steps.push({
        nodes: allNodes,
        currentNodeId: childNode.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...childNode.path],
        message: `做选择：used[${i}]=true, path.add(${candidate})，当前排列: [${childNode.path.join(', ')}]`,
        codeLine: 15,
        stats: { remaining: nums.length - childNode.path.length, depth: childNode.depth, count: solutions.length },
        vars: [
          { name: `used[${i}]`, value: 'true', type: 'boolean' },
          { name: 'path', value: `[${childNode.path.join(', ')}]`, type: 'array' },
        ],
      });

      // 向下递归
      steps.push({
        nodes: allNodes,
        currentNodeId: childNode.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...childNode.path],
        message: `向下递归：backtrack(nums, used, path, res)`,
        codeLine: 16,
        stats: { remaining: nums.length - childNode.path.length, depth: childNode.depth, count: solutions.length },
        vars: [
          { name: 'used', value: `[${used.map((u) => (u ? 'T' : 'F')).join(', ')}]`, type: 'array' },
        ],
      });

      traverse(childNode);

      // 回溯撤销
      used[i] = false;
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        message: `🔙 回溯撤销：path.remove(${candidate}), used[${i}]=false，恢复排列: [${node.path.join(', ') || '空'}]`,
        codeLine: 18,
        stats: { remaining: nums.length - node.path.length, depth: node.depth, count: solutions.length },
        vars: [
          { name: `used[${i}]`, value: 'false', type: 'boolean' },
          { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
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
    prunedNodeIds: [],
    path: [],
    message: `🎉 搜索完成！共找到 ${nums.length}! = ${solutions.length} 个全排列`,
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
export class PermutationVisualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLanguages = PERMUTATION_CODE_LANGUAGES;
  protected codeLines = PERMUTATION_CODE_LANGUAGES['java'];
  protected codePanelTitle = '全排列 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private treeDisplay: HTMLElement | null = null;
  private pathStackContainer: HTMLElement | null = null;
  private usedMonitorContainer: HTMLElement | null = null;
  private resultCollectionContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;
  private cachedLogs: BacktrackLogItem[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#permutation-tree-display');
    this.pathStackContainer = this.root.querySelector('#pm-path-stack-container');
    this.usedMonitorContainer = this.root.querySelector('#pm-used-monitor-container');
    this.resultCollectionContainer = this.root.querySelector('#pm-result-collection-container');
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
    this.root.querySelectorAll<HTMLButtonElement>('.pm-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const numsEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
        if (numsEl) numsEl.value = btn.dataset.nums || '';
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: PERMUTATION_PROBLEM_HTML,
      analysisHtml: PERMUTATION_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const numsEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
    const rawNums = (numsEl?.value || '1,2,3')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    const nums = rawNums.length > 0 ? Array.from(new Set(rawNums)) : [1, 2, 3];
    if (nums.length > 4) nums.length = 4; // 防止 N! 爆炸

    const steps = buildPermutationSteps(nums);

    // 预计算日志流
    this.cachedLogs = steps.map((st, idx) => {
      let type: BacktrackLogItem['type'] = 'info';
      if (st.message.includes('做选择')) type = 'push';
      else if (st.message.includes('回溯撤销')) type = 'pop';
      else if (st.message.includes('收集排列方案')) type = 'collect';
      else if (st.message.includes('跳过')) type = 'prune';

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
        cssPrefix: 'pm',
        nodeLabel: (nd) => (nd.id === 'root' ? '[]' : nd.value),
      });
    }

    // 2. 渲染当前路径栈 (Card 2 Left)
    if (this.pathStackContainer) {
      BacktrackStateSpacePresenter.renderPathStack(this.pathStackContainer, step.path || []);
    }

    // 3. 渲染 used[] 状态监视器 (Card 2 Center)
    if (this.usedMonitorContainer) {
      const numsEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
      const rawNums = (numsEl?.value || '1,2,3')
        .split(/[,，\s]+/)
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      const nums = rawNums.length > 0 ? Array.from(new Set(rawNums)) : [1, 2, 3];
      const curPath = (step.path || []) as number[];

      const cardsHtml = nums
        .map((num, i) => {
          const isUsed = curPath.includes(num);
          return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px 8px; border-radius: 8px; background: ${isUsed ? '#eff6ff' : '#f8fafc'}; border: 1px solid ${isUsed ? '#3b82f6' : '#e2e8f0'}; min-width: 44px;">
              <span style="font-size: 11px; font-weight: 800; color: ${isUsed ? '#2563eb' : '#0f172a'}; font-family: monospace;">nums[${i}]=${num}</span>
              <span style="font-size: 9.5px; font-weight: 700; color: ${isUsed ? '#2563eb' : '#94a3b8'};">${isUsed ? 'used: TRUE' : 'FALSE'}</span>
            </div>
          `;
        })
        .join('');

      this.usedMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${cardsHtml}
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 树枝去重: <code style="color:#b45309; font-family:monospace;">if (used[i]) continue</code></div>
            <div>• 递归与撤销: <code style="color:#b45309; font-family:monospace;">used[i]=true &rarr; dfs &rarr; used[i]=false</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染实时解集箱 (Card 2 Bottom)
    const solutionsUpToNow: Array<Array<number | string>> = [];
    for (let i = 0; i <= index; i++) {
      const st = this.steps[i];
      if (st.message.includes('收集排列方案')) {
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
              this.steps[stepIdx].message.includes('收集排列方案') &&
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
  id: 'permutation',
  name: '全排列',
  viewId: 'algo-permutation-view',
  category: 'backtracking',
  description: '无重复元素全排列，used 数组树枝标记与全循环回溯',
  icon: '🔀',
  template,
  Visualizer: PermutationVisualizer,
  difficulty: 2,
  levelOrder: 12,
  learningGoal: '掌握排列问题中从 0 开始的全局循环与 used[] 树枝去重标记机制',
});
