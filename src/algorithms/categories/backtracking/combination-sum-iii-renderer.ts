/**
 * 组合总和 III 可视化器（回溯决策树版本）
 * LeetCode 216：从 1-9 中选 k 个不重复数字，使总和为 n
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
  renderBacktrackTree,
  renderBacktrackLog,
  getBacktrackTreeCSS,
} from './backtracking-tree-helper';
import template from './combination-sum-iii.html?raw';

/* ── Build the full decision tree ─────────────────────────── */
function buildTree(k: number, n: number): BacktrackTreeNode {
  const root: BacktrackTreeNode = {
    id: 'root', value: '', path: [], children: [],
    isLeaf: false, isPruned: false, parentId: null, depth: 0,
  };

  function dfs(start: number, remaining: number, path: number[], parent: BacktrackTreeNode): void {
    if (path.length === k) {
      if (remaining === 0 && !parent.isPruned) {
        parent.isLeaf = true;
      }
      return;
    }
    for (let i = start; i <= 9; i++) {
      const childPath = [...path, i];
      const childId = `${parent.id}-${i}`;
      const newRemaining = remaining - i;
      const isDirectPrune = !parent.isPruned && (newRemaining < 0 || (9 - i < k - childPath.length));
      const isPruned = parent.isPruned || isDirectPrune;

      const node: BacktrackTreeNode = {
        id: childId, value: String(i), path: childPath,
        children: [], isLeaf: false, isPruned, isDirectPrune,
        parentId: parent.id, depth: parent.depth + 1,
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
function buildSteps(k: number, n: number): BacktrackTreeStep[] {
  const root = buildTree(k, n);
  layoutTree(root);
  const allNodes = flattenTree(root);
  const prunedIds = allNodes.filter(nd => nd.isPruned).map(nd => nd.id);

  const steps: BacktrackTreeStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];

  // Start step
  steps.push({
    nodes: allNodes, currentNodeId: 'root', visitedNodeIds: ['root'],
    foundPathIds: [], prunedNodeIds: [...prunedIds],
    path: [],
    message: `开始：从 1-9 中选 ${k} 个数，和为 ${n}`,
    codeLine: 3,
    stats: { remaining: n, depth: 0, count: 0, k },
  });

  function traverse(node: BacktrackTreeNode): void {
    if (node.isLeaf) {
      // 递归进入：先执行 if (path.size() == k) 判断 —— 成立
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path],
        message: `递归进入：path.size() == ${k} ✓ 满足终止条件`,
        codeLine: 9,
        stats: { remaining: 0, depth: node.depth, count: foundIds.length, k },
      });
      // 进入 if 块：收集结果并 return
      foundIds.push(node.id);
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path],
        message: `找到组合：[${node.path.join(', ')}]，收集并返回`,
        codeLine: { from: 10, to: 11 },
        stats: { remaining: 0, depth: node.depth, count: foundIds.length, k },
      });
      return;
    }

    // 递归进入非叶子：每次 backtrack 调用都先执行 if 判断 —— 不成立
    steps.push({
      nodes: allNodes, currentNodeId: node.id,
      visitedNodeIds: [...visitedIds],
      foundPathIds: [...foundIds],
      prunedNodeIds: [...prunedIds],
      path: [...node.path],
      message: `递归进入：path.size() = ${node.path.length} < ${k}，进入 for 循环`,
      codeLine: 9,
      stats: { remaining: n - (node.path as number[]).reduce((a, b) => a + b, 0), depth: node.depth, count: foundIds.length, k },
    });

    for (const child of node.children) {
      if (child.isPruned) {
        if (child.isDirectPrune) {
          visitedIds.push(child.id);
          const nodeSum = (node.path as number[]).reduce((a, b) => a + b, 0);
          steps.push({
            nodes: allNodes, currentNodeId: node.id,
            visitedNodeIds: [...visitedIds],
            foundPathIds: [...foundIds],
            prunedNodeIds: [...prunedIds],
            path: [...node.path],
            message: `剪枝：选 ${child.value} 后超过目标和 ${n}（跳过，未下潜）`,
            codeLine: 14,
            stats: { remaining: n - nodeSum, depth: node.depth, count: foundIds.length, k },
          });
        }
        continue;
      }

      // iterate: for 循环取到候选值 i，高亮循环头
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path],
        message: `for 循环：i = ${child.value}，尝试加入`,
        codeLine: 13,
        stats: { remaining: n - (node.path as number[]).reduce((a, b) => a + b, 0), depth: node.depth, count: foundIds.length, k },
      });

      // Step A: path.add(i)
      visitedIds.push(child.id);
      const remaining = n - (child.path as number[]).reduce((a, b) => a + b, 0);
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...child.path],
        message: `path.add(${child.value})：当前路径变为 [${child.path.join(', ')}]`,
        codeLine: 15,
        stats: { remaining, depth: child.depth, count: foundIds.length, k },
      });
      // Step B: backtrack(...)
      const childStart = parseInt(child.value, 10) + 1;
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...child.path],
        message: `backtrack(${childStart}, ...)：start = i + 1，递归深入`,
        codeLine: 16,
        stats: { remaining, depth: child.depth, count: foundIds.length, k },
      });

      traverse(child);

      // pop
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path],
        message: `撤销 ${child.value}，回溯到：[${node.path.join(', ') || '空'}]`,
        codeLine: 17,
        stats: { remaining: n - (node.path as number[]).reduce((a, b) => a + b, 0), depth: node.depth, count: foundIds.length, k },
      });
    }
  }

  traverse(root);

  // End step
  steps.push({
    nodes: allNodes, currentNodeId: 'root',
    visitedNodeIds: [...visitedIds],
    foundPathIds: [...foundIds],
    prunedNodeIds: [...prunedIds],
    path: [],
    message: `完成！共找到 ${foundIds.length} 个组合`,
    codeLine: 4,
    stats: { remaining: n, depth: 0, count: foundIds.length, k },
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class CombinationSumIIIVisualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLines = [
    'public List<List<Integer>> combinationSum3(int k, int n) {',
    '    List<List<Integer>> res = new ArrayList<>();',
    '    backtrack(1, new ArrayList<>(), res, k, n, 0);',
    '    return res;',
    '}',
    '',
    'void backtrack(int start, List<Integer> path,',
    '               List<List<Integer>> res, int k, int n, int sum) {',
    '    if (path.size() == k) {',
    '        if (sum == n) res.add(new ArrayList<>(path));',
    '        return;',
    '    }',
    '    for (int i = start; i <= 9; i++) {',
    '        if (sum + i > n) break;',
    '        path.add(i);',
    '        backtrack(i + 1, path, res, k, n, sum + i);',
    '        path.remove(path.size() - 1);',
    '    }',
    '}',
  ];
  protected codePanelTitle = '组合总和 III Java 代码';

  private treeDisplay: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#combination-tree-display');
    this.logEl = this.root.querySelector('#bt-log');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#bt-start')?.addEventListener('click', () => this.start());

    // Example chips
    this.root.querySelectorAll<HTMLButtonElement>('.bt-example').forEach(btn => {
      btn.addEventListener('click', () => {
        const kEl = this.root?.querySelector('#bt-k') as HTMLInputElement | null;
        const nEl = this.root?.querySelector('#bt-n') as HTMLInputElement | null;
        if (kEl) kEl.value = btn.dataset.k || '';
        if (nEl) nEl.value = btn.dataset.n || '';
        this.start();
      });
    });

    // Clear log
    this.root.querySelector('#bt-log-clear')?.addEventListener('click', () => {
      if (this.logEl) this.logEl.innerHTML = '';
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const kEl = this.root?.querySelector('#bt-k') as HTMLInputElement | null;
    const nEl = this.root?.querySelector('#bt-n') as HTMLInputElement | null;
    const k = parseInt(kEl?.value || '3', 10);
    const n = parseInt(nEl?.value || '7', 10);
    return buildSteps(
      Number.isFinite(k) ? Math.max(1, Math.min(9, k)) : 3,
      Number.isFinite(n) ? Math.max(1, Math.min(45, n)) : 7,
    );
  }

  protected renderStep(step: BacktrackTreeStep): void {
    // Stats
    const remainingEl = this.root?.querySelector('#bt-remaining');
    if (remainingEl) remainingEl.textContent = String(step.stats?.remaining ?? 0);
    const depthEl = this.root?.querySelector('#bt-depth');
    if (depthEl) depthEl.textContent = String(step.stats?.depth ?? 0);
    const countEl = this.root?.querySelector('#bt-count');
    if (countEl) countEl.textContent = String(step.stats?.count ?? 0);
    const pathLenEl = this.root?.querySelector('#bt-path-len');
    if (pathLenEl) pathLenEl.textContent = `${step.path.length}/${step.stats?.k ?? 0}`;

    // Tree
    if (this.treeDisplay) {
      renderBacktrackTree({
        container: this.treeDisplay,
        step,
        cssPrefix: 'bt',
      });
    }

    // Log
    renderBacktrackLog(this.logEl, this.steps, this.currentIndex, 'bt');
  }

  public reset(): void {
    super.reset();
    if (this.treeDisplay) this.treeDisplay.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'combination-sum-iii',
  name: '组合总和 III',
  viewId: 'algo-combination-sum-iii-view',
  category: 'backtracking',
  description: 'LeetCode 216 · 1-9 选 k 个不重复，和为 n',
  icon: '\uD83C\uDFAF',
  template,
  Visualizer: CombinationSumIIIVisualizer,
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '理解在回溯中结合求和约束与数量约束的决策树结构',
});
