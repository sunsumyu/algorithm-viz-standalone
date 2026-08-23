/**
 * 子集 II 可视化器 - 回溯决策树版本
 * LeetCode 90：输入含重复元素，排序后同层去重
 * backtrack(start, path)：先收集 path，然后 for i in [start,n)：
 *   if i>start && sorted[i]==sorted[i-1] 同层去重（剪枝），否则选 nums[i] 递归
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
} from './backtracking-tree-helper';
import template from './subsets-ii.html?raw';

/* ── Build the full decision tree (with dedup pruning) ────── */
function buildTree(sorted: number[]): BacktrackTreeNode {
  const root: BacktrackTreeNode = {
    id: 'root', value: '', path: [], children: [],
    isLeaf: true, isPruned: false, parentId: null, depth: 0,
  };

  function dfs(startIdx: number, path: number[], parent: BacktrackTreeNode): void {
    for (let i = startIdx; i < sorted.length; i++) {
      const candidate = sorted[i];
      const childPath = [...path, candidate];
      const childId = `${parent.id}-${i}`;

      // 同层去重：i > startIdx 且当前值等于前一个同层值时剪枝
      if (i > startIdx && sorted[i] === sorted[i - 1]) {
        parent.children.push({
          id: childId, value: String(candidate), path: childPath,
          children: [], isLeaf: false, isPruned: true,
          parentId: parent.id, depth: parent.depth + 1,
        });
        continue; // 跳过重复，不递归
      }

      const node: BacktrackTreeNode = {
        id: childId, value: String(candidate), path: childPath,
        children: [], isLeaf: true, isPruned: false,
        parentId: parent.id, depth: parent.depth + 1,
      };
      parent.children.push(node);
      dfs(i + 1, childPath, node);
    }
  }

  dfs(0, [], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
function buildSteps(nums: number[]): BacktrackTreeStep[] {
  const sorted = [...nums].sort((a, b) => a - b);
  const root = buildTree(sorted);
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
    message: `开始：nums=[${sorted.join(',')}]（已排序），同层去重生成不重复子集`,
    codeLine: 4,
    stats: { depth: 0, count: 0, pathLen: 0 },
  });

  function traverse(node: BacktrackTreeNode): void {
    // Every non-pruned node is a collection point
    foundIds.push(node.id);
    steps.push({
      nodes: allNodes, currentNodeId: node.id,
      visitedNodeIds: [...visitedIds],
      foundPathIds: [...foundIds],
      prunedNodeIds: [...prunedIds],
      path: [...node.path],
      message: `收集子集：[${node.path.join(', ')}]`,
      codeLine: 9,
      stats: { depth: node.depth, count: foundIds.length, pathLen: node.path.length },
    });

    for (const child of node.children) {
      if (child.isPruned) {
        visitedIds.push(child.id);
        steps.push({
          nodes: allNodes, currentNodeId: child.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...prunedIds],
          path: [...child.path],
          message: `同层跳过重复值 ${child.value}（与同层前一个相同）`,
          codeLine: 11,
          stats: { depth: child.depth, count: foundIds.length, pathLen: child.path.length },
        });
        continue;
      }

      // iterate: for 循环取到候选值 nums[i]，高亮循环头
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path],
        message: `for 循环：i = ${child.value}，检查去重后尝试`,
        codeLine: 10,
        stats: { depth: node.depth, count: foundIds.length, pathLen: node.path.length },
      });

      // Step A: path.add(i)
      visitedIds.push(child.id);
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...child.path],
        message: `path.add(${child.value})：当前路径变为 [${child.path.join(', ')}]`,
        codeLine: 12,
        stats: { depth: child.depth, count: foundIds.length, pathLen: child.path.length },
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
        codeLine: 13,
        stats: { depth: child.depth, count: foundIds.length, pathLen: child.path.length },
      });

      traverse(child);

      // pop: backtrack
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path],
        message: `撤销 ${child.value}，回溯到：[${node.path.join(', ') || '空'}]`,
        codeLine: 14,
        stats: { depth: node.depth, count: foundIds.length, pathLen: node.path.length },
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
    message: `完成！共收集 ${foundIds.length} 个不重复子集`,
    codeLine: 5,
    stats: { depth: 0, count: foundIds.length, pathLen: 0 },
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class SubsetIIVisualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLines = [
    'public List<List<Integer>> subsetsWithDup(int[] nums) {',
    '    Arrays.sort(nums);',
    '    List<List<Integer>> res = new ArrayList<>();',
    '    backtrack(nums, 0, new ArrayList<>(), res);',
    '    return res;',
    '}',
    '',
    'void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> res) {',
    '    res.add(new ArrayList<>(path));',
    '    for (int i = start; i < nums.length; i++) {',
    '        if (i > start && nums[i] == nums[i - 1]) continue; // 同层去重',
    '        path.add(nums[i]);',
    '        backtrack(nums, i + 1, path, res);',
    '        path.remove(path.size() - 1);',
    '    }',
    '}',
  ];
  protected codePanelTitle = '子集 II Java 代码';

  private treeDisplay: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private inputField: HTMLInputElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#subsets-ii-tree-display');
    this.logEl = this.root.querySelector('#sii-log');
    this.inputField = this.root.querySelector('#bt-nums');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#bt-start')?.addEventListener('click', () => this.start());

    // Example chips
    this.root.querySelectorAll<HTMLButtonElement>('.bt-example').forEach(btn => {
      btn.addEventListener('click', () => {
        const numsEl = this.root?.querySelector('#bt-nums') as HTMLInputElement | null;
        if (numsEl) numsEl.value = btn.dataset.nums || '';
        this.start();
      });
    });

    // Clear log
    this.root.querySelector('#sii-log-clear')?.addEventListener('click', () => {
      if (this.logEl) this.logEl.innerHTML = '';
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const input = this.inputField?.value.trim() || '1,2,2';
    const nums = input.split(/[,，\s]+/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (nums.length === 0) nums.push(1, 2, 2);
    return buildSteps(nums);
  }

  protected renderStep(step: BacktrackTreeStep): void {
    // Stats
    const depthEl = this.root?.querySelector('#sii-depth');
    if (depthEl) depthEl.textContent = String(step.stats?.depth ?? 0);
    const countEl = this.root?.querySelector('#sii-count');
    if (countEl) countEl.textContent = String(step.stats?.count ?? 0);
    const pathLenEl = this.root?.querySelector('#sii-path-len');
    if (pathLenEl) pathLenEl.textContent = String(step.path.length);
    const prunedEl = this.root?.querySelector('#sii-pruned');
    if (prunedEl) prunedEl.textContent = String(step.prunedNodeIds.length);

    // Tree
    if (this.treeDisplay) {
      renderBacktrackTree({
        container: this.treeDisplay,
        step,
        cssPrefix: 'sii',
      });
    }

    // Log
    renderBacktrackLog(this.logEl, this.steps, this.currentIndex, 'sii');
  }

  public reset(): void {
    super.reset();
    if (this.treeDisplay) this.treeDisplay.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'subsets-ii',
  name: '子集II',
  viewId: 'algo-subsets-ii-view',
  category: 'backtracking',
  description: 'LeetCode 90 · 排序 + 同层去重求不重复子集',
  icon: '🧩',
  template,
  Visualizer: SubsetIIVisualizer,
  difficulty: 2,
  levelOrder: 12,
  learningGoal: '掌握含重复元素子集去重的回溯策略',
});
