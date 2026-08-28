/**
 * 组合问题可视化器（回溯算法）- 回溯决策树版本
 * LeetCode 77：给定 n 和 k，返回 1...n 中所有可能的 k 个数的组合
 * 基础版：不剪枝，展示回溯搜索决策树的完整结构（剪枝优化见 combination-optimized）
 * 支持代码联动高亮演示，使用 SVG 回溯决策树展示递归结构
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import { BacktrackStateSpacePresenter } from '../../../core/renderers/backtrack-state-space-presenter';
import { AnalysisKnowledgePresenter } from '../../../core/renderers/analysis-knowledge-presenter';
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

  steps.push({
    nodes: allNodes, currentNodeId: 'root', visitedNodeIds: ['root'],
    foundPathIds: [], prunedNodeIds: [],
    path: [],
    startIndex: 1, n, k,
    action: 'start',
    message: `开始回溯搜索：从 1..${n} 中选 ${k} 个数，进入根节点`,
    codeLine: 3,
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
        message: `撤销选择：path.remove(${iVal}) 状态恢复为 [${node.path.join(', ')}]`,
        codeLine: 16,
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
    message: `搜索完成！共找到 ${foundIds.length} 个组合`,
    codeLine: 4,
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
    'void backtrack(int start, List<Integer> path,',
    '               List<List<Integer>> res, int n, int k) {',
    '    if (path.size() == k) {',
    '        res.add(new ArrayList<>(path));',
    '        return;',
    '    }',
    '    for (int i = start; i <= n; i++) {',
    '        path.add(i);',
    '        backtrack(i + 1, path, res, n, k);',
    '        path.remove(path.size() - 1);',
    '    }',
    '}',
  ];
  protected codePanelTitle = '组合问题 Java 源码';

  private treeDisplay: HTMLElement | null = null;
  private pathStackContainer: HTMLElement | null = null;
  private searchStateContainer: HTMLElement | null = null;
  private resultCollectionContainer: HTMLElement | null = null;
  private analysisContainer: HTMLElement | null = null;
  private problemContainer: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#combination-tree-display');
    this.pathStackContainer = this.root.querySelector('#cs-path-stack-container');
    this.searchStateContainer = this.root.querySelector('#cs-search-state-container');
    this.resultCollectionContainer = this.root.querySelector('#cs-result-collection-container');
    this.analysisContainer = this.root.querySelector('#cs-analysis-container');
    this.problemContainer = this.root.querySelector('#cs-problem-container');

    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#cs-start')?.addEventListener('click', () => this.start());

    // Right Panel Tabs
    const tabBtns = this.root.querySelectorAll<HTMLButtonElement>('.bt-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tabType = btn.dataset.tab;
        const codeTab = this.root?.querySelector('#cs-tab-content-code');
        const analysisTab = this.root?.querySelector('#cs-tab-content-analysis');
        const problemTab = this.root?.querySelector('#cs-tab-content-problem');

        codeTab?.classList.toggle('active', tabType === 'code');
        analysisTab?.classList.toggle('active', tabType === 'analysis');
        problemTab?.classList.toggle('active', tabType === 'problem');
      });
    });

    // Example chips
    this.root.querySelectorAll<HTMLButtonElement>('.bt-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const nEl = this.root?.querySelector('#cs-n') as HTMLInputElement | null;
        const kEl = this.root?.querySelector('#cs-k') as HTMLInputElement | null;
        if (nEl) nEl.value = btn.dataset.n || '';
        if (kEl) kEl.value = btn.dataset.k || '';
        this.start();
      });
    });

    this.initKnowledgePresenters();
  }

  private initKnowledgePresenters(): void {
    const model = {
      id: 'combination',
      name: '组合问题（回溯）',
      viewId: 'algo-combination-view',
      category: '回溯算法',
      difficulty: 1 as const,
      description: '给定两个整数 n 和 k，返回范围 [1, n] 中所有可能的 k 个数的组合。利用回溯法搜索全空间解。',
      directions: [],
      stages: [],
      problem: {
        title: '组合问题',
        leetcodeId: 77,
        leetcodeUrl: 'https://leetcode.cn/problems/combinations/',
        difficulty: 'medium' as const,
        description: '给定两个整数 n 和 k，返回范围 [1, n] 中所有可能的 k 个数的组合。\n\n**回溯核心思路**：\n将问题抽象为一棵 N 叉树，树的深度由 k 决定，树的宽度由 n 决定。通过递归深入、回溯撤销选择探索所有可能。',
        examples: [
          { input: 'n = 4, k = 2', output: '[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]' },
          { input: 'n = 1, k = 1', output: '[[1]]' },
        ],
        constraints: [
          '1 <= n <= 20',
          '1 <= k <= n',
        ],
        tags: ['回溯算法', '递归', '深度优先搜索', '组合问题'],
      },
    };

    if (this.problemContainer) {
      AnalysisKnowledgePresenter.renderProblemView(this.problemContainer, model as any);
    }
    if (this.analysisContainer) {
      AnalysisKnowledgePresenter.renderAnalysisView(this.analysisContainer, model as any);
    }
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
