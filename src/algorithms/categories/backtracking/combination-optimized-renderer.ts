/**
 * 组合（优化）可视化器（回溯）- 100% 对齐 DP 标准模板版本
 * LeetCode 77：从 1..n 中选 k 个数的所有组合
 * 支持阶段演化：阶段 1 (完整决策树) vs 阶段 2 (剪枝优化决策树)
 * 布局：
 *   左侧：Card 1 (N-ary 决策树 SVG) + Scrubber 播放条 + Card 2 (状态空间：路径栈、剪枝监视器、解集箱)
 *   右侧：Card 3 (暗色代码终端：多语言、Tab切换、字号控制) + Card 4 (执行日志流)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import type { HighlightTarget } from '../../../core/code-panel';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  type DarkCodeTerminalInstance,
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
import { buildCombinationTree, combinationSteps } from './combination-renderer';
import {
  COMBINATION_PROBLEM_HTML,
  COMBINATION_ANALYSIS_HTML,
} from './combination-problem-content';
import template from './combination-optimized.html?raw';

function clampInt(val: string | number, def: number, min: number, max: number): number {
  const n = typeof val === 'number' ? val : parseInt(val, 10);
  if (isNaN(n)) return def;
  return Math.max(min, Math.min(max, n));
}

/* ── Build the pruned decision tree ─────────────────────────── */
export function buildOptimizedTree(n: number, k: number): BacktrackTreeNode {
  const root: BacktrackTreeNode = {
    id: 'root', value: '', path: [], children: [],
    isLeaf: false, isPruned: false, parentId: null, depth: 0,
  };

  function dfs(start: number, path: number[], parent: BacktrackTreeNode): void {
    if (path.length === k) {
      if (!parent.isPruned) {
        parent.isLeaf = true;
      }
      return;
    }
    // Upper bound: remaining candidates must be enough to fill k slots.
    const upper = n - (k - path.length) + 1;
    for (let i = start; i <= n; i++) {
      const childPath = [...path, i];
      const childId = `${parent.id}-${i}`;
      const isDirectPrune = !parent.isPruned && (i > upper);
      const isPruned = parent.isPruned || isDirectPrune;

      const node: BacktrackTreeNode = {
        id: childId, value: String(i), path: childPath,
        children: [], isLeaf: false, isPruned, isDirectPrune,
        parentId: parent.id, depth: parent.depth + 1,
      };
      parent.children.push(node);
      if (!isPruned) {
        dfs(i + 1, childPath, node);
      }
    }
  }

  dfs(1, [], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
export function buildOptimizedSteps(n: number, k: number): BacktrackTreeStep[] {
  const root = buildOptimizedTree(n, k);
  layoutTree(root);
  const allNodes = flattenTree(root);

  const steps: BacktrackTreeStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];
  const dynamicPrunedIds: string[] = [];

  const makeVars = (currentPathLen: number) => {
    const need = Math.max(0, k - currentPathLen);
    const upper = n - need + 1;
    return [
      { name: 'n', value: String(n), type: 'number' as const },
      { name: 'k', value: String(k), type: 'number' as const },
      { name: 'path.size()', value: String(currentPathLen), type: 'number' as const },
      { name: '需补元素', value: String(need), type: 'number' as const },
      { name: '遍历上界', value: String(upper), type: 'number' as const },
    ];
  };

  steps.push({
    nodes: allNodes, currentNodeId: 'root', visitedNodeIds: ['root'],
    foundPathIds: [], prunedNodeIds: [],
    path: [],
    message: `开始：从 1..${n} 中选 ${k} 个数，剪枝上界 i <= ${n - k + 1}（首层）`,
    codeLine: 3,
    stats: { depth: 0, count: 0, need: k, remain: 0 },
    vars: makeVars(0),
  });

  function traverse(node: BacktrackTreeNode): void {
    if (node.isLeaf) {
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `递归进入：path.size() == ${k} ✓ 满足终止条件`,
        codeLine: 9,
        stats: { depth: node.depth, count: foundIds.length, need: 0, remain: node.path.length },
        vars: makeVars(node.path.length),
      });
      foundIds.push(node.id);
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `找到组合：[${node.path.join(', ')}]，收集并返回`,
        codeLine: { from: 10, to: 11 },
        stats: { depth: node.depth, count: foundIds.length, need: 0, remain: node.path.length },
        vars: makeVars(node.path.length),
      });
      return;
    }

    steps.push({
      nodes: allNodes, currentNodeId: node.id,
      visitedNodeIds: [...visitedIds],
      foundPathIds: [...foundIds],
      prunedNodeIds: [...dynamicPrunedIds],
      path: [...node.path],
      message: `递归进入：path.size() = ${node.path.length} < ${k}，进入 for 循环`,
      codeLine: 9,
      stats: { depth: node.depth, count: foundIds.length, need: k - node.path.length, remain: node.path.length },
      vars: makeVars(node.path.length),
    });

    for (const child of node.children) {
      if (child.isPruned) {
        if (child.isDirectPrune) {
          const upper = n - (k - node.path.length) + 1;
          if (!dynamicPrunedIds.includes(child.id)) {
            dynamicPrunedIds.push(child.id);
          }
          steps.push({
            nodes: allNodes, currentNodeId: node.id,
            visitedNodeIds: [...visitedIds],
            foundPathIds: [...foundIds],
            prunedNodeIds: [...dynamicPrunedIds],
            path: [...node.path],
            message: `剪枝：i = ${child.value} > ${upper}（剩余元素不够凑满 ${k} 个），截断循环`,
            codeLine: 13,
            stats: { depth: node.depth, count: foundIds.length, need: k - node.path.length, remain: node.path.length },
            vars: makeVars(node.path.length),
          });
        }
        continue;
      }

      visitedIds.push(child.id);

      // Push path
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `处理节点：path.add(${child.value}) → [${child.path.join(', ')}]`,
        codeLine: 14,
        stats: { depth: child.depth, count: foundIds.length, need: k - child.path.length, remain: child.path.length },
        vars: makeVars(child.path.length),
      });

      // Recurse
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `向下递归：backtrack(${Number(child.value) + 1}, path)`,
        codeLine: 15,
        stats: { depth: child.depth, count: foundIds.length, need: k - child.path.length, remain: child.path.length },
        vars: makeVars(child.path.length),
      });

      traverse(child);

      // Backtrack
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `回溯撤销：path.remove()，弹出 ${child.value}，恢复路径为 [${node.path.join(', ')}]`,
        codeLine: 16,
        stats: { depth: node.depth, count: foundIds.length, need: k - node.path.length, remain: node.path.length },
        vars: makeVars(node.path.length),
      });
    }
  }

  traverse(root);

  steps.push({
    nodes: allNodes, currentNodeId: 'root',
    visitedNodeIds: [...visitedIds],
    foundPathIds: [...foundIds],
    prunedNodeIds: [...dynamicPrunedIds],
    path: [],
    message: `搜索完成：共找到 ${foundIds.length} 个合法组合（剪枝减少了无效递归分支）`,
    codeLine: 4,
    stats: { depth: 0, count: foundIds.length, need: 0, remain: 0 },
    vars: makeVars(0),
  });

  return steps;
}

export class CombinationOptimizedVisualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLines: string[] = [
    'public List<List<Integer>> combine(int n, int k) {',
    '    List<List<Integer>> res = new ArrayList<>();',
    '    backtrack(1, new ArrayList<>(), res, n, k);',
    '    return res;',
    '}',
    '',
    'void backtrack(int start, List<Integer> path,',
    '               List<List<Integer>> res, int n, int k) {',
    '    if (path.size() == k) {',
    '        res.add(new ArrayList<>(path));',
    '        return;',
    '    }',
    '    // 剪枝：i <= n - (k - path.size()) + 1',
    '    for (int i = start; i <= n - (k - path.size()) + 1; i++) {',
    '        path.add(i);',
    '        backtrack(i + 1, path, res, n, k);',
    '        path.remove(path.size() - 1);',
    '    }',
    '}',
  ];
  protected codeLanguages: Record<string, string[]> = {
    java: [
      'public List<List<Integer>> combine(int n, int k) {',
      '    List<List<Integer>> res = new ArrayList<>();',
      '    backtrack(1, new ArrayList<>(), res, n, k);',
      '    return res;',
      '}',
      '',
      'void backtrack(int start, List<Integer> path,',
      '               List<List<Integer>> res, int n, int k) {',
      '    if (path.size() == k) {',
      '        res.add(new ArrayList<>(path));',
      '        return;',
      '    }',
      '    // 剪枝：i <= n - (k - path.size()) + 1',
      '    for (int i = start; i <= n - (k - path.size()) + 1; i++) {',
      '        path.add(i);',
      '        backtrack(i + 1, path, res, n, k);',
      '        path.remove(path.size() - 1);',
      '    }',
      '}',
    ],
    cpp: [
      'vector<vector<int>> combine(int n, int k) {',
      '    vector<vector<int>> res;',
      '    vector<int> path;',
      '    backtrack(1, path, res, n, k);',
      '    return res;',
      '}',
      '',
      'void backtrack(int start, vector<int>& path,',
      '               vector<vector<int>>& res, int n, int k) {',
      '    if (path.size() == k) {',
      '        res.push_back(path);',
      '        return;',
      '    }',
      '    // 剪枝：i <= n - (k - path.size()) + 1',
      '    for (int i = start; i <= n - (k - path.size()) + 1; i++) {',
      '        path.push_back(i);',
      '        backtrack(i + 1, path, res, n, k);',
      '        path.pop_back();',
      '    }',
      '}',
    ],
    python: [
      'def combine(n: int, k: int) -> List[List[int]]:',
      '    res = []',
      '    def backtrack(start: int, path: List[int]):',
      '        if len(path) == k:',
      '            res.append(list(path))',
      '            return',
      '        # 剪枝：i <= n - (k - len(path)) + 1',
      '        upper = n - (k - len(path)) + 1',
      '        for i in range(start, upper + 1):',
      '            path.append(i)',
      '            backtrack(i + 1, path)',
      '            path.pop()',
      '    backtrack(1, [])',
      '    return res',
    ],
    javascript: [
      'function combine(n, k) {',
      '    const res = [];',
      '    const path = [];',
      '    function backtrack(start) {',
      '        if (path.length === k) {',
      '            res.push([...path]);',
      '            return;',
      '        }',
      '        // 剪枝：i <= n - (k - path.length) + 1',
      '        const upper = n - (k - path.length) + 1;',
      '        for (let i = start; i <= upper; i++) {',
      '            path.push(i);',
      '            backtrack(i + 1);',
      '            path.pop();',
      '        }',
      '    }',
      '    backtrack(1);',
      '    return res;',
      '}',
    ],
  };

  private currentStage: 'naive' | 'pruned' = 'pruned';
  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private treeDisplay: HTMLElement | null = null;
  private pathStackContainer: HTMLElement | null = null;
  private pruningMonitorContainer: HTMLElement | null = null;
  private resultCollectionContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;
  private cachedLogs: BacktrackLogItem[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#combination-optimized-tree-display');
    this.pathStackContainer = this.root.querySelector('#co-path-stack-container');
    this.pruningMonitorContainer = this.root.querySelector('#co-pruning-monitor-container');
    this.resultCollectionContainer = this.root.querySelector('#co-result-collection-container');
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

    // 阶段切换 Tab
    const stage1Tab = this.root.querySelector('#co-tab-stage1');
    const stage2Tab = this.root.querySelector('#co-tab-stage2');
    const modeTag = this.root.querySelector('#header-algo-title');

    stage1Tab?.addEventListener('click', () => {
      this.currentStage = 'naive';
      stage1Tab.classList.add('active');
      stage2Tab?.classList.remove('active');
      if (modeTag) modeTag.textContent = '完整决策树 (未剪枝)';
      this.start();
    });

    stage2Tab?.addEventListener('click', () => {
      this.currentStage = 'pruned';
      stage2Tab.classList.add('active');
      stage1Tab?.classList.remove('active');
      if (modeTag) modeTag.textContent = '剪枝优化模式';
      this.start();
    });

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.co-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const nEl = this.root?.querySelector('#input-n') as HTMLInputElement | null;
        const kEl = this.root?.querySelector('#input-k') as HTMLInputElement | null;
        if (nEl) nEl.value = btn.dataset.n || '';
        if (kEl) kEl.value = btn.dataset.k || '';
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: COMBINATION_PROBLEM_HTML,
      analysisHtml: COMBINATION_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const nEl = this.root?.querySelector('#input-n') as HTMLInputElement | null;
    const kEl = this.root?.querySelector('#input-k') as HTMLInputElement | null;
    const n = clampInt(nEl?.value || '4', 4, 1, 9);
    const k = clampInt(kEl?.value || '2', 2, 1, 9);

    const steps = this.currentStage === 'naive'
      ? combinationSteps(n, k)
      : buildOptimizedSteps(n, k);

    // 预计算日志缓存
    this.cachedLogs = steps.map((s, idx) => {
      let type: BacktrackLogItem['type'] = 'info';
      if (s.message.includes('add') || s.message.includes('做选择')) type = 'push';
      else if (s.message.includes('remove') || s.message.includes('撤销') || s.message.includes('回溯')) type = 'pop';
      else if (s.message.includes('找到') || s.message.includes('收集')) type = 'collect';
      else if (s.message.includes('剪枝')) type = 'prune';

      return {
        type,
        text: s.message,
        stepNumber: idx + 1,
      };
    });

    return steps;
  }

  protected renderStep(step: BacktrackTreeStep): void {
    const nEl = this.root?.querySelector('#input-n') as HTMLInputElement | null;
    const kEl = this.root?.querySelector('#input-k') as HTMLInputElement | null;
    const n = clampInt(nEl?.value || '4', 4, 1, 9);
    const k = clampInt(kEl?.value || '2', 2, 1, 9);

    // 1. Render Tree SVG
    if (this.treeDisplay) {
      renderBacktrackTree({
        container: this.treeDisplay,
        step,
        cssPrefix: 'co',
      });
    }

    // 2. Render Path Stack in Card 2
    if (this.pathStackContainer) {
      BacktrackStateSpacePresenter.renderPathStack(this.pathStackContainer, step.path, {
        highlightLast: true,
        action: step.message.includes('add') ? 'push' : step.message.includes('remove') ? 'pop' : step.message.includes('找到') ? 'collect' : 'idle',
      });
    }

    // 3. Render Pruning Monitor in Card 2
    if (this.pruningMonitorContainer) {
      const need = k - step.path.length;
      const upper = n - need + 1;
      const isPruningEnabled = this.currentStage === 'pruned';
      const lastVal = Number(step.path[step.path.length - 1] ?? 0);
      const isCurrentlyPruning = isPruningEnabled && (step.message.startsWith('剪枝：') || step.message.includes('截断循环'));
      BacktrackStateSpacePresenter.renderPruningMonitor(this.pruningMonitorContainer, {
        enabled: isPruningEnabled,
        formula: isPruningEnabled ? `i <= ${n} - (${k} - ${step.path.length}) + 1 = ${upper}` : '无剪枝：i <= n (全空间搜索)',
        neededElements: Math.max(0, need),
        remainingCapacity: Math.max(0, n - lastVal),
        conditionMet: isCurrentlyPruning,
        message: isPruningEnabled
          ? (isCurrentlyPruning ? `⚠️ 触发剪枝：剩余候选不足 ${need} 个` : `当前所需: ${need} 个，遍历上界: ${upper}`)
          : '当前阶段搜索全解空间，不截断任何分支',
      });
    }

    // 4. Render Result Collection in Card 2 & Badge
    const results: Array<number[]> = [];
    const foundIds = step.foundPathIds || [];
    const nodeMap = new Map<string, BacktrackTreeNode>();
    step.nodes.forEach(nd => nodeMap.set(nd.id, nd));
    
    foundIds.forEach(id => {
      const nd = nodeMap.get(id);
      if (nd && nd.path.length === k) {
        results.push([...nd.path] as number[]);
      }
    });

    if (this.resultCollectionContainer) {
      BacktrackStateSpacePresenter.renderResultCollection(
        this.resultCollectionContainer,
        results,
        results.length - 1
      );
    }

    const badgeResult = this.root?.querySelector('#badge-result-count');
    if (badgeResult) {
      badgeResult.textContent = `解集: ${results.length}`;
    }

    // 5. Update Scrubber Progress & Playback Counters
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

    // 6. Highlight Dark Terminal Code Line
    this.terminalInstance?.highlightLine(step.codeLine);

    // 7. Render Execution Log Stream (Card 4)
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
  id: 'combination-optimized',
  name: '组合（优化）',
  viewId: 'algo-combination-optimized-view',
  category: 'backtracking',
  description: '剪枝优化：i <= n - (k - path.length) + 1',
  icon: '✂️',
  template,
  Visualizer: CombinationOptimizedVisualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '学会用剪枝优化回溯搜索',
});
