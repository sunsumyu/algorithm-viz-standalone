/**
 * 组合总和 III 可视化器（回溯决策树版本）— 4-Card 标准现代架构
 * LeetCode 216：从 1-9 中选 k 个不重复数字，使总和为 n
 * 双重剪枝：累加和超额剪枝 + 剩余可选数字不足剪枝
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
  COMBINATION_SUM_III_PROBLEM_HTML,
  COMBINATION_SUM_III_ANALYSIS_HTML,
  COMBINATION_SUM_III_CODE_LANGUAGES,
} from './combination-sum-iii-problem-content';
import template from './combination-sum-iii.html?raw';

/* ── Build the full decision tree ─────────────────────────── */
export function buildCombinationSum3Tree(k: number, n: number): BacktrackTreeNode {
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
    if (path.length === k) {
      if (remaining === 0 && !parent.isPruned) {
        parent.isLeaf = true;
      }
      return;
    }
    for (let i = start; i <= 9; i++) {
      nodeIdCounter++;
      const childPath = [...path, i];
      const childId = `${parent.id}-${i}-${nodeIdCounter}`;
      const newRemaining = remaining - i;

      const isSumExceed = newRemaining < 0;
      const isCountInsufficient = 9 - i + 1 < k - path.length;
      const isDirectPrune = !parent.isPruned && (isSumExceed || isCountInsufficient);
      const isPruned = parent.isPruned || isDirectPrune;

      const node: BacktrackTreeNode = {
        id: childId,
        value: String(i),
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
        dfs(i + 1, newRemaining, childPath, node);
      }
    }
  }

  dfs(1, n, [], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
export function buildCombinationSum3Steps(k: number, n: number): BacktrackTreeStep[] {
  const root = buildCombinationSum3Tree(k, n);
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
    message: `开始搜索：从 1~9 中选 ${k} 个不重复数字使得总和为 ${n}`,
    codeLine: 4,
    stats: { remaining: n, depth: 0, count: 0 },
    vars: [
      { name: 'k', value: String(k), type: 'number' },
      { name: 'n', value: String(n), type: 'number' },
      { name: 'sum', value: '0', type: 'number' },
      { name: 'path', value: '[]', type: 'array' },
      { name: 'res.size()', value: '0', type: 'number' },
    ],
  });

  function traverse(node: BacktrackTreeNode): void {
    const nodeSum = (node.path as number[]).reduce((a, b) => a + b, 0);

    if (node.path.length === k) {
      if (nodeSum === n) {
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `递归进入：path.size() == ${k} 且 sum == ${n} ✓ 满足目标条件`,
          codeLine: 11,
          stats: { remaining: 0, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'sum', value: String(nodeSum), type: 'number' },
            { name: 'target', value: String(n), type: 'number' },
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
          message: `🎉 找到合法组合：[${node.path.join(', ')}]，收集并返回`,
          codeLine: 12,
          stats: { remaining: 0, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'res.add()', value: `[${node.path.join(', ')}]`, type: 'array' },
            { name: 'res.size()', value: String(solutions.length), type: 'number' },
          ],
        });
      } else {
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `递归终止：path.size() == ${k}，但 sum(${nodeSum}) != n(${n})，直接返回`,
          codeLine: 13,
          stats: { remaining: n - nodeSum, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'sum', value: String(nodeSum), type: 'number' },
            { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
          ],
        });
      }
      return;
    }

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const childVal = parseInt(child.value, 10);
      const childSum = nodeSum + childVal;

      // 剪枝判定
      if (childSum > n) {
        if (!dynamicPrunedIds.includes(child.id)) dynamicPrunedIds.push(child.id);
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `✂️ 和超额剪枝：sum(${nodeSum}) + ${childVal} = ${childSum} > n(${n})，break 终止本层`,
          codeLine: 16,
          stats: { remaining: n - nodeSum, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'sum + i', value: `${childSum} > ${n}`, type: 'boolean' },
            { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
          ],
        });
        continue;
      }

      if (9 - childVal + 1 < k - node.path.length) {
        if (!dynamicPrunedIds.includes(child.id)) dynamicPrunedIds.push(child.id);
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `✂️ 数量不足剪枝：剩余可选元素数量 < 尚需元素数量 (${9 - childVal + 1} < ${k - node.path.length})，终止遍历`,
          codeLine: 15,
          stats: { remaining: n - nodeSum, depth: node.depth, count: solutions.length },
          vars: [
            { name: '剩余可选数', value: String(9 - childVal + 1), type: 'number' },
            { name: '还需元素数', value: String(k - node.path.length), type: 'number' },
          ],
        });
        continue;
      }

      // 做选择
      visitedIds.push(child.id);
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `做选择：path.add(${childVal})，当前路径：[${child.path.join(', ')}]，sum = ${childSum}`,
        codeLine: 17,
        stats: { remaining: n - childSum, depth: child.depth, count: solutions.length },
        vars: [
          { name: 'i', value: String(childVal), type: 'number' },
          { name: 'sum', value: String(childSum), type: 'number' },
          { name: 'path', value: `[${child.path.join(', ')}]`, type: 'array' },
        ],
      });

      // 向下递归
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `向下递归：backtrack(target=${n}, k=${k}, sum=${childSum}, startIndex=${childVal + 1})`,
        codeLine: 18,
        stats: { remaining: n - childSum, depth: child.depth, count: solutions.length },
        vars: [
          { name: 'startIndex', value: String(childVal + 1), type: 'number' },
          { name: 'sum', value: String(childSum), type: 'number' },
        ],
      });

      traverse(child);

      // 回溯撤销
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🔙 回溯撤销：path.remove(${childVal})，恢复路径至：[${node.path.join(', ') || '空'}]`,
        codeLine: 19,
        stats: { remaining: n - nodeSum, depth: node.depth, count: solutions.length },
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
    message: `🎉 搜索完成！共找到 ${solutions.length} 个满足和为 ${n} 的 ${k} 元数组合`,
    codeLine: 5,
    stats: { remaining: n, depth: 0, count: solutions.length },
    vars: [
      { name: 'k', value: String(k), type: 'number' },
      { name: 'n', value: String(n), type: 'number' },
      { name: 'res.size()', value: String(solutions.length), type: 'number' },
    ],
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class CombinationSum3Visualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLanguages = COMBINATION_SUM_III_CODE_LANGUAGES;
  protected codeLines = COMBINATION_SUM_III_CODE_LANGUAGES['java'];
  protected codePanelTitle = '组合总和 III 代码调试';

  private treeDisplay: HTMLElement | null = null;
  private pathStackContainer: HTMLElement | null = null;
  private pruneMonitorContainer: HTMLElement | null = null;
  private resultCollectionContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;
  private cachedLogs: BacktrackLogItem[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#combination-sum-iii-tree-display');
    this.pathStackContainer = this.root.querySelector('#cs3-path-stack-container');
    this.pruneMonitorContainer = this.root.querySelector('#cs3-prune-monitor-container');
    this.resultCollectionContainer = this.root.querySelector('#cs3-result-collection-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.cs3-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const kEl = this.root?.querySelector('#input-k') as HTMLInputElement | null;
        const nEl = this.root?.querySelector('#input-n') as HTMLInputElement | null;
        if (kEl) kEl.value = btn.dataset.k || '';
        if (nEl) nEl.value = btn.dataset.n || '';
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: COMBINATION_SUM_III_PROBLEM_HTML,
      analysisHtml: COMBINATION_SUM_III_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const kEl = this.root?.querySelector('#input-k') as HTMLInputElement | null;
    const nEl = this.root?.querySelector('#input-n') as HTMLInputElement | null;

    let k = parseInt(kEl?.value || '3', 10);
    let n = parseInt(nEl?.value || '7', 10);
    if (!Number.isFinite(k) || k < 2) k = 3;
    if (k > 9) k = 9;
    if (!Number.isFinite(n) || n < 1) n = 7;
    if (n > 45) n = 45;

    const steps = buildCombinationSum3Steps(k, n);

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
        cssPrefix: 'cs3',
        nodeLabel: (nd) => (nd.id === 'root' ? '[]' : nd.value),
      });
    }

    // 2. 渲染当前路径栈 (Card 2 Left)
    if (this.pathStackContainer) {
      BacktrackStateSpacePresenter.renderPathStack(this.pathStackContainer, step.path || []);
    }

    // 3. 渲染双重剪枝监视器 (Card 2 Center)
    if (this.pruneMonitorContainer) {
      const curSum = (step.path as number[]).reduce((a, b) => a + b, 0);
      const kEl = this.root?.querySelector('#input-k') as HTMLInputElement | null;
      const nEl = this.root?.querySelector('#input-n') as HTMLInputElement | null;
      const k = parseInt(kEl?.value || '3', 10) || 3;
      const n = parseInt(nEl?.value || '7', 10) || 7;
      const curLen = step.path.length;
      const isLenMatch = curLen === k;
      const isSumMatch = curSum === n;

      let badgeHtml = '';
      if (isLenMatch && isSumMatch) {
        badgeHtml = `<span style="color:#059669; font-weight:700; background:#ecfdf5; padding:2px 6px; border-radius:4px; border:1px solid #a7f3d0;">✓ 选够 ${k} 个且 sum == ${n}</span>`;
      } else if (curSum > n) {
        badgeHtml = `<span style="color:#dc2626; font-weight:700; background:#fef2f2; padding:2px 6px; border-radius:4px; border:1px solid #fecaca;">✕ 和超额剪枝</span>`;
      } else {
        badgeHtml = `<span style="color:#2563eb; font-weight:700; background:#eff6ff; padding:2px 6px; border-radius:4px; border:1px solid #bfdbfe;">已选 ${curLen}/${k} 个 (sum: ${curSum}/${n})</span>`;
      }

      this.pruneMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>当前和 / 槽位: <strong style="color:#0f172a; font-family:monospace; font-size:12px;">${curSum}</strong> (${curLen}/${k} 个)</span>
            ${badgeHtml}
          </div>
          <div style="background: #f1f5f9; border-radius: 6px; height: 6px; overflow: hidden; position: relative;">
            <div style="background: ${isLenMatch && isSumMatch ? '#10b981' : curSum > n ? '#ef4444' : '#3b82f6'}; width: ${Math.min(100, (curSum / n) * 100)}%; height: 100%; transition: width 0.2s;"></div>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4;">
            <div>• 和超额剪枝: <code style="color:#b45309; font-family:monospace;">sum + i > n => break</code></div>
            <div>• 数量约束: <code style="color:#b45309; font-family:monospace;">9 - i + 1 < k - path.size() => break</code></div>
          </div>
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
  id: 'combination-sum-iii',
  name: '组合总和 III',
  viewId: 'algo-combination-sum-iii-view',
  category: 'backtracking',
  description: '1-9 中选 k 个数字且和为 n，双重剪枝',
  icon: '🎯',
  template,
  Visualizer: CombinationSum3Visualizer,
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '掌握固定区间 (1~9) 的深度回溯与多维剪枝不等式',
});
