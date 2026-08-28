/**
 * 组合问题可视化器（回溯算法）- 回溯决策树版本
 * LeetCode 77：给定 n 和 k，返回 1...n 中所有可能的 k 个数的组合
 * 基础版：不剪枝，展示回溯搜索决策树的完整结构（剪枝优化见 combination-optimized）
 * 支持代码联动高亮演示，使用 SVG 回溯决策树展示递归结构
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import { BacktrackStateSpacePresenter } from '../../../core/renderers/backtrack-state-space-presenter';
import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
  renderBacktrackTree,
} from './backtracking-tree-helper';
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

/* ── Visualizer class ─────────────────────────────────────── */
export class CombinationVisualizer extends StepVisualizer<CombinationStep> {
  protected codeLines = [
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

  protected codeLanguages = {
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

  protected lineExplanations: Record<number, string> = {
    1: '主函数入口：给定正整数 n 和组合大小 k',
    2: '初始化存放所有合法解组合的结果集 res',
    3: '启动首层回溯递归：从数字 1 开始，初始路径为空 ArrayList',
    4: '返回搜索得到的所有合法组合集合',
    7: '递归函数签名：startIndex 为当前层可选数字起点，path 为当前收集路径',
    9: '【终止条件】：当前路径已选满 k 个元素，满足组合要求',
    10: '【收集解集】：拷贝当前 path 快照加入结果集 res',
    11: '递归返回上一层（触发向上回溯）',
    13: '【单层横向遍历】：从 startIndex 开始遍历到 n，生成当前层的分支',
    14: '【做选择】：将当前元素 i 追加至路径 path 尾部',
    15: '【向下递归】：进入下一层树，下一轮可选起点为 i + 1',
    16: '【回溯撤销】：弹出刚加入的元素 i，恢复路径以供同层后续分支探索',
  };

  protected keyPoints = {
    title: '回溯 5 步精讲与核心框架',
    summary: '组合问题（LeetCode 77）经典全解空间树搜索模型',
    points: [
      { label: '1. 递归函数参数', desc: '除了 n, k 和 res，关键是 startIndex 控制横向遍历的起始位置，防止出现 [1, 2] 与 [2, 1] 的重复组合。', icon: '📥' },
      { label: '2. 终止条件', desc: '当 path.size() == k 时，说明找到一个合法长度的子集，收集深拷贝后 return。', icon: '🛑' },
      { label: '3. 单层搜索逻辑', desc: 'for 循环横向枚举本层可选数字，递归深入纵向探索，并在递归返回后撤销选择。', icon: '🔁' },
      { label: '4. 状态撤销回溯', desc: 'path.remove() 是回溯法的灵魂，确保深入探索后原路恢复，不污染兄弟分支。', icon: '🔙' },
      { label: '5. 为什么是 i + 1', desc: '组合问题不考虑元素顺序，且同一个数不可复用，因此下一层递归起点必须为 i + 1。', icon: '🔢' },
    ],
  };

  protected problemDetail = {
    title: 'LeetCode 77. 组合 (Combinations)',
    leetcodeId: 77,
    leetcodeUrl: 'https://leetcode.cn/problems/combinations/',
    difficulty: 'medium' as const,
    description: '给定两个整数 n 和 k，返回范围 [1, n] 中所有可能的 k 个数的组合。\n\n你可以按任何顺序返回答案。\n\n**示例 1**:\n- 输入: `n = 4, k = 2`\n- 输出: `[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]`\n\n**示例 2**:\n- 输入: `n = 1, k = 1`\n- 输出: `[[1]]`',
    examples: [
      { input: 'n = 4, k = 2', output: '[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]' },
      { input: 'n = 1, k = 1', output: '[[1]]' },
    ],
    constraints: ['1 <= n <= 20', '1 <= k <= n'],
    tags: ['回溯算法', '递归', '深度优先搜索'],
  };

  private treeDisplay: HTMLElement | null = null;
  private pathStackContainer: HTMLElement | null = null;
  private searchStateContainer: HTMLElement | null = null;
  private resultCollectionContainer: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#combination-tree-display');
    this.pathStackContainer = this.root.querySelector('#cs-path-stack-container');
    this.searchStateContainer = this.root.querySelector('#cs-search-state-container');
    this.resultCollectionContainer = this.root.querySelector('#cs-result-collection-container');

    this.bindPlaybackControls();
    this.root.querySelector('#cs-start')?.addEventListener('click', () => this.start());

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

    // Example chips
    this.root.querySelectorAll<HTMLButtonElement>('.cs-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const nEl = this.root?.querySelector('#cs-n') as HTMLInputElement | null;
        const kEl = this.root?.querySelector('#cs-k') as HTMLInputElement | null;
        if (nEl) nEl.value = btn.dataset.n || '';
        if (kEl) kEl.value = btn.dataset.k || '';
        this.start();
      });
    });
  }

  protected buildSteps(): CombinationStep[] {
    const nEl = this.root?.querySelector('#cs-n') as HTMLInputElement | null;
    const kEl = this.root?.querySelector('#cs-k') as HTMLInputElement | null;
    let n = parseInt(nEl?.value || '4', 10);
    let k = parseInt(kEl?.value || '2', 10);
    if (!Number.isFinite(n)) n = 4;
    if (!Number.isFinite(k)) k = 2;
    if (k <= 0) k = 1;
    if (n <= 0) n = 1;
    return combinationSteps(n, k);
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

    // 4. Render Result Collection in Card 2
    if (this.resultCollectionContainer) {
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

      BacktrackStateSpacePresenter.renderResultCollection(
        this.resultCollectionContainer,
        results,
        results.length - 1
      );
    }

    // 5. Update Scrubber Progress & Counters
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
    if (playIcon) playIcon.textContent = this.isPlaying ? '❚❚' : '▶';
  }

  public reset(): void {
    super.reset();
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
