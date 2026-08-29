/**
 * 全排列 II 可视化器（回溯算法）— 4-Card 标准现代架构
 * LeetCode 47：输入含重复数字，排序 + used 数组 + 同层去重
 * 核心：树枝去重 (used[i]) + 树层去重 (nums[i] == nums[i-1] && !used[i-1])
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
  PERMUTATION_II_PROBLEM_HTML,
  PERMUTATION_II_ANALYSIS_HTML,
  PERMUTATION_II_CODE_LANGUAGES,
} from './permutation-ii-problem-content';
import template from './permutation-ii.html?raw';

/* ── Build the full decision tree ─────────────────────────── */
export function buildPerm2Tree(sorted: number[]): BacktrackTreeNode {
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
  const n = sorted.length;
  const used = new Array(n).fill(false);

  function dfs(path: number[], parent: BacktrackTreeNode): void {
    if (path.length === n) {
      parent.isLeaf = true;
      return;
    }
    for (let i = 0; i < n; i++) {
      nodeIdCounter++;
      const candidate = sorted[i];
      const childPath = [...path, candidate];
      const childId = `${parent.id}-${candidate}-${nodeIdCounter}`;

      // 1. 树枝去重：used[i] == true（当前路径已选该位置元素）
      if (used[i]) {
        continue; // 树枝已占用的不再生成分支，保持树清晰
      }

      // 2. 树层去重：同层遇到重复元素且前一个已回溯完成 (!used[i-1])
      const isDedupPrune = i > 0 && sorted[i] === sorted[i - 1] && !used[i - 1];

      const node: BacktrackTreeNode = {
        id: childId,
        value: String(candidate),
        path: childPath,
        children: [],
        isLeaf: !isDedupPrune && childPath.length === n,
        isPruned: isDedupPrune,
        isDirectPrune: isDedupPrune,
        parentId: parent.id,
        depth: parent.depth + 1,
      };
      parent.children.push(node);

      if (!isDedupPrune) {
        used[i] = true;
        dfs(childPath, node);
        used[i] = false;
      }
    }
  }

  dfs([], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
export function buildPerm2Steps(nums: number[]): BacktrackTreeStep[] {
  const sorted = [...nums].sort((a, b) => a - b);
  const n = sorted.length;
  const root = buildPerm2Tree(sorted);
  layoutTree(root);
  const allNodes = flattenTree(root);

  const steps: BacktrackTreeStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];
  const dynamicPrunedIds: string[] = [];
  const solutions: number[][] = [];
  const used = new Array(n).fill(false);

  // Start step
  steps.push({
    nodes: allNodes,
    currentNodeId: 'root',
    visitedNodeIds: ['root'],
    foundPathIds: [],
    prunedNodeIds: [],
    path: [],
    message: `开始搜索：已排序 nums = [${sorted.join(', ')}]，树枝去重 (used[i]) + 树层去重 (!used[i-1])`,
    codeLine: 4,
    stats: { remaining: n, depth: 0, count: 0 },
    vars: [
      { name: 'nums', value: `[${sorted.join(', ')}]`, type: 'array' },
      { name: 'used', value: `[${used.map((u) => (u ? 'T' : 'F')).join(', ')}]`, type: 'array' },
      { name: 'path', value: '[]', type: 'array' },
      { name: 'res.size()', value: '0', type: 'number' },
    ],
  });

  function traverse(node: BacktrackTreeNode): void {
    if (node.path.length === n) {
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `递归进入：path.size() == ${n} ✓ 找到唯一排列 [${node.path.join(', ')}]`,
        codeLine: 9,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'path.size()', value: String(n), type: 'number' },
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
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🎉 收集唯一排列：[${node.path.join(', ')}]，收集并返回`,
        codeLine: 10,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'res.add()', value: `[${node.path.join(', ')}]`, type: 'array' },
          { name: 'res.size()', value: String(solutions.length), type: 'number' },
        ],
      });
      return;
    }

    for (let i = 0; i < n; i++) {
      const candidate = sorted[i];

      // 1. 树枝去重
      if (used[i]) {
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `树枝跳过：used[${i}] 为 true（当前排列已占用元素 ${candidate}），continue`,
          codeLine: 14,
          stats: { remaining: n - node.path.length, depth: node.depth, count: solutions.length },
          vars: [
            { name: `used[${i}]`, value: 'true', type: 'boolean' },
          ],
        });
        continue;
      }

      // 2. 树层去重
      if (i > 0 && sorted[i] === sorted[i - 1] && !used[i - 1]) {
        const prunedChild = node.children.find((c) => parseInt(c.value, 10) === candidate && c.isPruned);
        if (prunedChild && !dynamicPrunedIds.includes(prunedChild.id)) {
          dynamicPrunedIds.push(prunedChild.id);
        }

        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `✂️ 树层去重：nums[${i}] == nums[${i - 1}] (${candidate} == ${sorted[i - 1]}) 且 used[${i - 1}] == false，说明同层已处理过该值，剪枝跳过`,
          codeLine: 16,
          stats: { remaining: n - node.path.length, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'nums[i]==nums[i-1]', value: 'true', type: 'boolean' },
            { name: `!used[${i - 1}]`, value: 'true', type: 'boolean' },
          ],
        });
        continue;
      }

      const childNode = node.children.find((c) => parseInt(c.value, 10) === candidate && !c.isPruned);
      if (!childNode) continue;

      // 3. 做选择
      used[i] = true;
      visitedIds.push(childNode.id);
      steps.push({
        nodes: allNodes,
        currentNodeId: childNode.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...childNode.path],
        message: `做选择：used[${i}]=true, path.add(${candidate})，当前排列: [${childNode.path.join(', ')}]`,
        codeLine: 18,
        stats: { remaining: n - childNode.path.length, depth: childNode.depth, count: solutions.length },
        vars: [
          { name: `used[${i}]`, value: 'true', type: 'boolean' },
          { name: 'path', value: `[${childNode.path.join(', ')}]`, type: 'array' },
        ],
      });

      // 4. 向下递归
      steps.push({
        nodes: allNodes,
        currentNodeId: childNode.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...childNode.path],
        message: `向下递归：backtrack(nums, used, path, res)`,
        codeLine: 19,
        stats: { remaining: n - childNode.path.length, depth: childNode.depth, count: solutions.length },
        vars: [
          { name: 'used', value: `[${used.map((u) => (u ? 'T' : 'F')).join(', ')}]`, type: 'array' },
        ],
      });

      traverse(childNode);

      // 5. 回溯撤销
      used[i] = false;
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🔙 回溯撤销：path.remove(${candidate}), used[${i}]=false，恢复排列: [${node.path.join(', ') || '空'}]`,
        codeLine: 21,
        stats: { remaining: n - node.path.length, depth: node.depth, count: solutions.length },
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
    prunedNodeIds: [...dynamicPrunedIds],
    path: [],
    message: `🎉 搜索完成！共找到 ${solutions.length} 个不重复全排列`,
    codeLine: 5,
    stats: { remaining: 0, depth: 0, count: solutions.length },
    vars: [
      { name: 'nums', value: `[${sorted.join(', ')}]`, type: 'array' },
      { name: 'res.size()', value: String(solutions.length), type: 'number' },
    ],
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class Permutation2Visualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLanguages = PERMUTATION_II_CODE_LANGUAGES;
  protected codeLines = PERMUTATION_II_CODE_LANGUAGES['java'];
  protected codePanelTitle = '全排列 II 代码调试';

  private treeDisplay: HTMLElement | null = null;
  private pathStackContainer: HTMLElement | null = null;
  private dedupMonitorContainer: HTMLElement | null = null;
  private resultCollectionContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;
  private cachedLogs: BacktrackLogItem[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#permutation-ii-tree-display');
    this.pathStackContainer = this.root.querySelector('#pm2-path-stack-container');
    this.dedupMonitorContainer = this.root.querySelector('#pm2-dedup-monitor-container');
    this.resultCollectionContainer = this.root.querySelector('#pm2-result-collection-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.pm2-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const numsEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
        if (numsEl) numsEl.value = btn.dataset.nums || '';
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: PERMUTATION_II_PROBLEM_HTML,
      analysisHtml: PERMUTATION_II_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const numsEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
    const rawNums = (numsEl?.value || '1,1,2')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    const nums = rawNums.length > 0 ? rawNums : [1, 1, 2];
    if (nums.length > 4) nums.length = 4;

    const steps = buildPerm2Steps(nums);

    // 预计算日志流
    this.cachedLogs = steps.map((st, idx) => {
      let type: BacktrackLogItem['type'] = 'info';
      if (st.message.includes('做选择')) type = 'push';
      else if (st.message.includes('回溯撤销')) type = 'pop';
      else if (st.message.includes('收集唯一排列')) type = 'collect';
      else if (st.message.includes('跳过') || st.message.includes('剪枝')) type = 'prune';

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
        cssPrefix: 'pm2',
        nodeLabel: (nd) => (nd.id === 'root' ? '[]' : nd.value),
      });
    }

    // 2. 渲染当前路径栈 (Card 2 Left)
    if (this.pathStackContainer) {
      BacktrackStateSpacePresenter.renderPathStack(this.pathStackContainer, step.path || []);
    }

    // 3. 渲染去重监视器 (Card 2 Center)
    if (this.dedupMonitorContainer) {
      const isPruneStep = step.message.includes('树层去重');
      const isBranchSkip = step.message.includes('树枝跳过');

      this.dedupMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>去重状态:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isPruneStep || isBranchSkip ? '#fef2f2' : '#ecfdf5'}; color: ${isPruneStep || isBranchSkip ? '#dc2626' : '#059669'}; border: 1px solid ${isPruneStep || isBranchSkip ? '#fecaca' : '#a7f3d0'};">
              ${isPruneStep ? '✂️ 树层去重 (剪枝)' : isBranchSkip ? '🏷️ 树枝已占 (跳过)' : '✅ 正常选取'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 树层去重: <code style="color:#b45309; font-family:monospace;">nums[i] == nums[i-1] && !used[i-1]</code></div>
            <div>• 树枝去重: <code style="color:#b45309; font-family:monospace;">if (used[i]) continue</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染实时解集箱 (Card 2 Bottom)
    const solutionsUpToNow: Array<Array<number | string>> = [];
    for (let i = 0; i <= index; i++) {
      const st = this.steps[i];
      if (st.message.includes('收集唯一排列')) {
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
              this.steps[stepIdx].message.includes('收集唯一排列') &&
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
  id: 'permutation-ii',
  name: '全排列 II',
  viewId: 'algo-permutation-ii-view',
  category: 'backtracking',
  description: '含重复元素全排列，树层去重 (!used[i-1]) 与树枝标记',
  icon: '🔀',
  template,
  Visualizer: Permutation2Visualizer,
  difficulty: 2,
  levelOrder: 13,
  learningGoal: '掌握含重复元素排列中的树层去重 (!used[i-1]) 与树枝占用的本质区别',
});
