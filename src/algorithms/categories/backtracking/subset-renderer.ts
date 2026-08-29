/**
 * 子集可视化器（回溯算法）— 4-Card 标准现代架构
 * LeetCode 78：给定不含重复数字的整数数组，返回所有可能的子集
 * 核心：全树节点收集 (收集树上的每一个状态)
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
  SUBSET_PROBLEM_HTML,
  SUBSET_ANALYSIS_HTML,
  SUBSET_CODE_LANGUAGES,
} from './subset-problem-content';
import template from './subset.html?raw';

/* ── Build the full decision tree ─────────────────────────── */
export function buildSubsetTree(nums: number[]): BacktrackTreeNode {
  let nodeIdCounter = 0;
  const root: BacktrackTreeNode = {
    id: 'root',
    value: '[]',
    path: [],
    children: [],
    isLeaf: true,
    isPruned: false,
    parentId: null,
    depth: 0,
  };

  function dfs(startIdx: number, path: number[], parent: BacktrackTreeNode): void {
    for (let i = startIdx; i < nums.length; i++) {
      nodeIdCounter++;
      const candidate = nums[i];
      const childPath = [...path, candidate];
      const childId = `${parent.id}-${candidate}-${nodeIdCounter}`;

      const node: BacktrackTreeNode = {
        id: childId,
        value: String(candidate),
        path: childPath,
        children: [],
        isLeaf: true,
        isPruned: false,
        parentId: parent.id,
        depth: parent.depth + 1,
      };
      parent.children.push(node);
      dfs(i + 1, childPath, node);
    }
  }

  dfs(0, [], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
export function buildSubsetSteps(nums: number[]): BacktrackTreeStep[] {
  const root = buildSubsetTree(nums);
  layoutTree(root);
  const allNodes = flattenTree(root);

  const steps: BacktrackTreeStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];
  const solutions: number[][] = [];
  const totalPowerSet = Math.pow(2, nums.length);

  // Start step
  steps.push({
    nodes: allNodes,
    currentNodeId: 'root',
    visitedNodeIds: ['root'],
    foundPathIds: [],
    prunedNodeIds: [],
    path: [],
    message: `开始搜索：nums = [${nums.join(', ')}]，子集问题收集树上的每一个节点（总计 2^${nums.length} = ${totalPowerSet} 个子集）`,
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
    // 1. 子集问题：节点入口处直接无条件收集
    foundIds.push(node.id);
    solutions.push([...(node.path as number[])]);

    steps.push({
      nodes: allNodes,
      currentNodeId: node.id,
      visitedNodeIds: [...visitedIds],
      foundPathIds: [...foundIds],
      prunedNodeIds: [],
      path: [...node.path],
      message: `🎉 收集子集：[${node.path.join(', ')}]（当前进度: ${solutions.length}/${totalPowerSet}）`,
      codeLine: 8,
      stats: { remaining: nums.length - startIndex, depth: node.depth, count: solutions.length },
      vars: [
        { name: 'res.add()', value: `[${node.path.join(', ')}]`, type: 'array' },
        { name: 'res.size()', value: String(solutions.length), type: 'number' },
        { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
      ],
    });

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const childVal = parseInt(child.value, 10);
      const actualIndex = startIndex + i;

      // 做选择
      visitedIds.push(child.id);
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...child.path],
        message: `做选择：path.add(${childVal})，当前子集: [${child.path.join(', ')}]`,
        codeLine: 11,
        stats: { remaining: nums.length - (actualIndex + 1), depth: child.depth, count: solutions.length },
        vars: [
          { name: 'nums[i]', value: String(childVal), type: 'number' },
          { name: 'path', value: `[${child.path.join(', ')}]`, type: 'array' },
        ],
      });

      // 向下递归
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...child.path],
        message: `向下递归：backtrack(nums, startIndex=${actualIndex + 1}, path, res)`,
        codeLine: 12,
        stats: { remaining: nums.length - (actualIndex + 1), depth: child.depth, count: solutions.length },
        vars: [
          { name: 'startIndex', value: String(actualIndex + 1), type: 'number' },
        ],
      });

      traverse(child, actualIndex + 1);

      // 回溯撤销
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        message: `🔙 回溯撤销：path.remove(${childVal})，恢复子集至: [${node.path.join(', ') || '空'}]`,
        codeLine: 13,
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
    prunedNodeIds: [],
    path: [],
    message: `🎉 搜索完成！共找到 2^${nums.length} = ${solutions.length} 个子集`,
    codeLine: 4,
    stats: { remaining: 0, depth: 0, count: solutions.length },
    vars: [
      { name: 'nums', value: `[${nums.join(', ')}]`, type: 'array' },
      { name: 'res.size()', value: String(solutions.length), type: 'number' },
    ],
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class SubsetVisualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLanguages = SUBSET_CODE_LANGUAGES;
  protected codeLines = SUBSET_CODE_LANGUAGES['java'];
  protected codePanelTitle = '子集 代码调试';

  private treeDisplay: HTMLElement | null = null;
  private pathStackContainer: HTMLElement | null = null;
  private collectorMonitorContainer: HTMLElement | null = null;
  private resultCollectionContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;
  private cachedLogs: BacktrackLogItem[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#subset-tree-display');
    this.pathStackContainer = this.root.querySelector('#sb-path-stack-container');
    this.collectorMonitorContainer = this.root.querySelector('#sb-collector-monitor-container');
    this.resultCollectionContainer = this.root.querySelector('#sb-result-collection-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.sb-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const numsEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
        if (numsEl) numsEl.value = btn.dataset.nums || '';
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: SUBSET_PROBLEM_HTML,
      analysisHtml: SUBSET_ANALYSIS_HTML,
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
    if (nums.length > 5) nums.length = 5; // 防止组合爆炸

    const steps = buildSubsetSteps(nums);

    // 预计算日志流
    this.cachedLogs = steps.map((st, idx) => {
      let type: BacktrackLogItem['type'] = 'info';
      if (st.message.includes('做选择')) type = 'push';
      else if (st.message.includes('回溯撤销')) type = 'pop';
      else if (st.message.includes('收集子集')) type = 'collect';

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
        cssPrefix: 'sb',
        nodeLabel: (nd) => (nd.id === 'root' ? '[]' : nd.value),
      });
    }

    // 2. 渲染当前路径栈 (Card 2 Left)
    if (this.pathStackContainer) {
      BacktrackStateSpacePresenter.renderPathStack(this.pathStackContainer, step.path || []);
    }

    // 3. 渲染全节点收集监视器 (Card 2 Center)
    const numsEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
    const rawNums = (numsEl?.value || '1,2,3')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const nums = rawNums.length > 0 ? Array.from(new Set(rawNums)) : [1, 2, 3];
    const totalPowerSet = Math.pow(2, nums.length);

    const solutionsUpToNow: Array<Array<number | string>> = [];
    for (let i = 0; i <= index; i++) {
      const st = this.steps[i];
      if (st.message.includes('收集子集')) {
        solutionsUpToNow.push([...st.path]);
      }
    }

    if (this.collectorMonitorContainer) {
      const percent = Math.min(100, (solutionsUpToNow.length / totalPowerSet) * 100);
      this.collectorMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>幂集收集: <strong style="color: #0f172a; font-family: monospace; font-size: 12px;">${solutionsUpToNow.length}</strong> / 2^${nums.length} = ${totalPowerSet}</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;">
              ${percent.toFixed(0)}% 完成
            </span>
          </div>
          <div style="background: #f1f5f9; border-radius: 6px; height: 6px; overflow: hidden; position: relative;">
            <div style="background: #10b981; width: ${percent}%; height: 100%; transition: width 0.2s;"></div>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4;">
            <div>• 特征: 每一个节点进入即 <code style="color:#b45309; font-family:monospace;">res.add(path)</code></div>
            <div>• 无需剪枝，全树展开遍历所有路径</div>
          </div>
        </div>
      `;
    }

    // 4. 渲染实时解集箱 (Card 2 Bottom)
    if (this.resultCollectionContainer) {
      BacktrackStateSpacePresenter.renderResultCollection(
        this.resultCollectionContainer,
        solutionsUpToNow,
        -1,
        (solIdx: number) => {
          for (let stepIdx = 0; stepIdx < this.steps.length; stepIdx++) {
            if (
              this.steps[stepIdx].message.includes('收集子集') &&
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
      badgeCount.textContent = `解集: ${solutionsUpToNow.length} / ${totalPowerSet}`;
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
  id: 'subset',
  name: '子集',
  viewId: 'algo-subset-view',
  category: 'backtracking',
  description: '求无重复数组的所有子集（幂集），全节点收集',
  icon: '📦',
  template,
  Visualizer: SubsetVisualizer,
  difficulty: 2,
  levelOrder: 9,
  learningGoal: '掌握子集问题的全节点收集特性与 2^N 幂集回溯模型',
});
