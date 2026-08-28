/**
 * 组合问题可视化器（回溯算法）- 100% 对齐 DP 标准模板版本
 * LeetCode 77：给定 n 和 k，返回 1...n 中所有可能的 k 个数的组合
 * 基础版：不剪枝，展示回溯搜索决策树的完整结构
 * 布局：
 *   左侧：Card 1 (N-ary 决策树 SVG) + Scrubber 播放条 + Card 2 (状态空间：路径栈、搜索状态、解集箱)
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
import {
  COMBINATION_PROBLEM_HTML,
  COMBINATION_ANALYSIS_HTML,
} from './combination-problem-content';
import template from './combination.html?raw';

/* ── Step ─────────────────────────────────────────────────── */
export interface CombinationStep extends BacktrackTreeStep {
  startIndex: number;
  i?: number;
  n: number;
  k: number;
  action: 'push' | 'pop' | 'found' | 'start' | 'end' | 'iterate' | 'check';
}

/* ── Build the full decision tree ─────────────────────────── */
export function buildCombinationTree(n: number, k: number): BacktrackTreeNode {
  const root: BacktrackTreeNode = {
    id: 'root', value: '', path: [], children: [],
    isLeaf: false, isPruned: false, parentId: null, depth: 0,
  };

  function dfs(start: number, path: number[], parent: BacktrackTreeNode): void {
    if (path.length === k) {
      parent.isLeaf = true;
      return;
    }
    for (let i = start; i <= n; i++) {
      const childPath = [...path, i];
      const childId = `${parent.id}-${i}`;

      const node: BacktrackTreeNode = {
        id: childId, value: String(i), path: childPath,
        children: [], isLeaf: false, isPruned: false,
        parentId: parent.id, depth: parent.depth + 1,
      };
      parent.children.push(node);
      dfs(i + 1, childPath, node);
    }
  }

  dfs(1, [], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
export function combinationSteps(n: number, k: number): CombinationStep[] {
  const root = buildCombinationTree(n, k);
  layoutTree(root);
  const allNodes = flattenTree(root);

  const steps: CombinationStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];

  const makeVars = (currentPathLen: number, start: number, iVal?: number) => {
    return [
      { name: 'n', value: String(n), type: 'number' as const },
      { name: 'k', value: String(k), type: 'number' as const },
      { name: 'startIndex', value: String(start), type: 'number' as const },
      { name: '当前 i', value: String(iVal ?? '-'), type: 'number' as const },
      { name: 'path.size()', value: String(currentPathLen), type: 'number' as const },
      { name: '还需元素', value: String(Math.max(0, k - currentPathLen)), type: 'number' as const },
    ];
  };

  steps.push({
    nodes: allNodes, currentNodeId: 'root', visitedNodeIds: ['root'],
    foundPathIds: [], prunedNodeIds: [],
    path: [],
    startIndex: 1, n, k,
    action: 'start',
    message: `开始回溯搜索：从 1..${n} 中选 ${k} 个数，进入根节点`,
    codeLine: 3,
    vars: makeVars(0, 1),
  });

  function traverse(node: BacktrackTreeNode, start: number): void {
    if (node.isLeaf) {
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        startIndex: start, n, k,
        action: 'check',
        message: `递归进入：path.size() == ${k} ✓ 满足终止条件`,
        codeLine: 9,
        vars: makeVars(node.path.length, start),
      });

      foundIds.push(node.id);
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        startIndex: start, n, k,
        action: 'found',
        message: `找到合法组合：[${node.path.join(', ')}]，加入结果集并 return`,
        codeLine: { from: 10, to: 11 },
        vars: makeVars(node.path.length, start),
      });
      return;
    }

    steps.push({
      nodes: allNodes, currentNodeId: node.id,
      visitedNodeIds: [...visitedIds],
      foundPathIds: [...foundIds],
      prunedNodeIds: [],
      path: [...node.path],
      startIndex: start, n, k,
      action: 'check',
      message: `递归进入：path.size() = ${node.path.length} < ${k}，从 startIndex=${start} 开始横向遍历`,
      codeLine: 9,
      vars: makeVars(node.path.length, start),
    });

    for (const child of node.children) {
      const iVal = Number(child.value);
      visitedIds.push(child.id);

      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...child.path],
        startIndex: start, i: iVal, n, k,
        action: 'push',
        message: `做选择：path.add(${iVal}) → [${child.path.join(', ')}]`,
        codeLine: 14,
        vars: makeVars(child.path.length, start, iVal),
      });

      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...child.path],
        startIndex: iVal + 1, i: iVal, n, k,
        action: 'iterate',
        message: `深入递归：backtrack(startIndex = ${iVal + 1}, path)`,
        codeLine: 15,
        vars: makeVars(child.path.length, iVal + 1, iVal),
      });

      traverse(child, iVal + 1);

      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        startIndex: start, i: iVal, n, k,
        action: 'pop',
        message: `回溯撤销：path.remove()，弹出 ${iVal}，恢复路径为 [${node.path.join(', ')}]`,
        codeLine: 16,
        vars: makeVars(node.path.length, start, iVal),
      });
    }
  }

  traverse(root, 1);

  steps.push({
    nodes: allNodes, currentNodeId: 'root',
    visitedNodeIds: [...visitedIds],
    foundPathIds: [...foundIds],
    prunedNodeIds: [],
    path: [],
    startIndex: 1, n, k,
    action: 'end',
    message: `回溯搜索完成：共遍历 ${allNodes.length} 个节点，找到 ${foundIds.length} 个组合解`,
    codeLine: 4,
    vars: makeVars(0, 1),
  });

  return steps;
}

export class CombinationVisualizer extends StepVisualizer<CombinationStep> {
  protected codeLines: string[] = [
    'public List<List<Integer>> combine(int n, int k) {',
    '    List<List<Integer>> res = new ArrayList<>();',
    '    backtrack(1, new ArrayList<>(), res, n, k);',
    '    return res;',
    '}',
    '',
    'void backtrack(int startIndex, List<Integer> path,',
    '               List<List<Integer>> res, int n, int k) {',
    '    if (path.size() == k) {',
    '        res.add(new ArrayList<>(path));',
    '        return;',
    '    }',
    '    for (int i = startIndex; i <= n; i++) {',
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
      'void backtrack(int startIndex, List<Integer> path,',
      '               List<List<Integer>> res, int n, int k) {',
      '    if (path.size() == k) {',
      '        res.add(new ArrayList<>(path));',
      '        return;',
      '    }',
      '    for (int i = startIndex; i <= n; i++) {',
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
      'void backtrack(int startIndex, vector<int>& path,',
      '               vector<vector<int>>& res, int n, int k) {',
      '    if (path.size() == k) {',
      '        res.push_back(path);',
      '        return;',
      '    }',
      '    for (int i = startIndex; i <= n; i++) {',
      '        path.push_back(i);',
      '        backtrack(i + 1, path, res, n, k);',
      '        path.pop_back();',
      '    }',
      '}',
    ],
    python: [
      'def combine(n: int, k: int) -> List[List[int]]:',
      '    res = []',
      '    def backtrack(startIndex: int, path: List[int]):',
      '        if len(path) == k:',
      '            res.append(list(path))',
      '            return',
      '        for i in range(startIndex, n + 1):',
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
      '    function backtrack(startIndex) {',
      '        if (path.length === k) {',
      '            res.push([...path]);',
      '            return;',
      '        }',
      '        for (let i = startIndex; i <= n; i++) {',
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

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private treeDisplay: HTMLElement | null = null;
  private pathStackContainer: HTMLElement | null = null;
  private searchStateContainer: HTMLElement | null = null;
  private resultCollectionContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;
  private cachedLogs: BacktrackLogItem[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#combination-tree-display');
    this.pathStackContainer = this.root.querySelector('#cs-path-stack-container');
    this.searchStateContainer = this.root.querySelector('#cs-search-state-container');
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
    this.root.querySelectorAll<HTMLButtonElement>('.cs-chip').forEach(btn => {
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

  protected buildSteps(): CombinationStep[] {
    const nEl = this.root?.querySelector('#input-n') as HTMLInputElement | null;
    const kEl = this.root?.querySelector('#input-k') as HTMLInputElement | null;
    let n = parseInt(nEl?.value || '4', 10);
    let k = parseInt(kEl?.value || '2', 10);
    if (!Number.isFinite(n)) n = 4;
    if (!Number.isFinite(k)) k = 2;
    if (k <= 0) k = 1;
    if (n <= 0) n = 1;

    const steps = combinationSteps(n, k);

    // 预计算日志缓存
    this.cachedLogs = steps.map((s, idx) => {
      let type: BacktrackLogItem['type'] = 'info';
      if (s.action === 'push') type = 'push';
      else if (s.action === 'pop') type = 'pop';
      else if (s.action === 'found') type = 'collect';

      return {
        type,
        text: s.message,
        stepNumber: idx + 1,
      };
    });

    return steps;
  }

  protected renderStep(step: CombinationStep): void {
    // 1. Render Tree SVG
    if (this.treeDisplay) {
      renderBacktrackTree({
        container: this.treeDisplay,
        step,
        cssPrefix: 'cs',
      });
    }

    // 2. Render Path Stack in Card 2
    if (this.pathStackContainer) {
      BacktrackStateSpacePresenter.renderPathStack(this.pathStackContainer, step.path, {
        highlightLast: true,
        action: step.action === 'push' ? 'push' : step.action === 'pop' ? 'pop' : step.action === 'found' ? 'collect' : 'idle',
      });
    }

    // 3. Render Search State in Card 2
    if (this.searchStateContainer) {
      BacktrackStateSpacePresenter.renderVariableWatch(this.searchStateContainer, [
        { label: 'startIndex', value: step.startIndex, highlight: true },
        { label: '当前 i', value: step.i ?? '-' },
        { label: '目标 k', value: step.k },
        { label: '还需元素', value: Math.max(0, step.k - step.path.length), highlight: step.path.length === step.k },
      ]);
    }

    // 4. Render Result Collection in Card 2 & Badge
    const results: Array<number[]> = [];
    const foundIds = step.foundPathIds || [];
    const nodeMap = new Map<string, BacktrackTreeNode>();
    step.nodes.forEach(nd => nodeMap.set(nd.id, nd));
    
    foundIds.forEach(id => {
      const nd = nodeMap.get(id);
      if (nd && nd.path.length === step.k) {
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
  id: 'combination',
  name: '组合问题（回溯）',
  viewId: 'algo-combination-view',
  category: 'backtracking',
  description: '使用回溯算法生成所有组合',
  icon: '🎯',
  template,
  Visualizer: CombinationVisualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握回溯法的基础框架：选择、递归、撤销，理解决策树结构',
});
