/**
 * 递增子序列可视化器（回溯）- 回溯决策树版本
 * LeetCode 491：给定整数数组，找出所有长度 >= 2 的非递减子序列
 * 不能排序（要保持原数组顺序）；同层用 Set 去重（未排序无法相邻比较）
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
import template from './increasing-subsequences.html?raw';

/* ── Build the full decision tree ─────────────────────────── */
function buildTree(nums: number[]): BacktrackTreeNode {
  const root: BacktrackTreeNode = {
    id: 'root', value: '', path: [], children: [],
    isLeaf: false, isPruned: false, parentId: null, depth: 0,
  };

  function dfs(start: number, path: number[], parent: BacktrackTreeNode): void {
    const levelUsed = new Set<number>();
    for (let i = start; i < nums.length; i++) {
      const candidate = nums[i];
      const childPath = [...path, candidate];
      const childId = `${parent.id}-${i}`;

      // Prune 1: same value already used at this recursion level
      if (levelUsed.has(candidate)) {
        parent.children.push({
          id: childId, value: String(candidate), path: childPath,
          children: [], isLeaf: false, isPruned: true,
          parentId: parent.id, depth: parent.depth + 1,
        });
        continue;
      }

      // Prune 2: breaks non-decreasing property
      if (path.length > 0 && candidate < path[path.length - 1]) {
        parent.children.push({
          id: childId, value: String(candidate), path: childPath,
          children: [], isLeaf: false, isPruned: true,
          parentId: parent.id, depth: parent.depth + 1,
        });
        continue;
      }

      levelUsed.add(candidate);

      const node: BacktrackTreeNode = {
        id: childId, value: String(candidate), path: childPath,
        children: [], isLeaf: false, isPruned: false,
        parentId: parent.id, depth: parent.depth + 1,
      };
      parent.children.push(node);
      // Every path of length >= 2 is a valid answer, so even non-leaf nodes
      // carry a collected result; recurse to extend further.
      dfs(i + 1, childPath, node);
    }
  }

  dfs(0, [], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
function buildSteps(nums: number[]): BacktrackTreeStep[] {
  const root = buildTree(nums);
  layoutTree(root);
  const allNodes = flattenTree(root);
  const prunedIds = allNodes.filter(nd => nd.isPruned).map(nd => nd.id);

  const steps: BacktrackTreeStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];

  steps.push({
    nodes: allNodes, currentNodeId: 'root', visitedNodeIds: ['root'],
    foundPathIds: [], prunedNodeIds: [...prunedIds],
    path: [],
    message: `开始：nums=[${nums.join(',')}]，保持原序，收集长度 >= 2 的非递减子序列`,
    codeLine: 3,
    stats: { depth: 0, count: 0, pathLen: 0 },
  });

  function traverse(node: BacktrackTreeNode): void {
    // 递归进入：每次 backtrack 调用都先执行 "收集长度>=2 的子序列" 判断（行 9）
    steps.push({
      nodes: allNodes, currentNodeId: node.id,
      visitedNodeIds: [...visitedIds],
      foundPathIds: [...foundIds],
      prunedNodeIds: [...prunedIds],
      path: [...node.path],
      message: node.path.length >= 2
        ? `递归进入：path.size() = ${node.path.length} >= 2 ✓ 满足收集条件`
        : `递归进入：path.size() = ${node.path.length} < 2，继续扩展`,
      codeLine: 9,
      stats: { depth: node.depth, count: foundIds.length, pathLen: node.path.length },
    });

    // Every node with path.length >= 2 is a collected result (found)
    if (node.path.length >= 2) {
      foundIds.push(node.id);
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path],
        message: `收集递增子序列：[${node.path.join(', ')}]`,
        codeLine: 9,
        stats: { depth: node.depth, count: foundIds.length, pathLen: node.path.length },
      });
    }

    for (const child of node.children) {
      if (child.isPruned) {
        visitedIds.push(child.id);
        // Distinguish the two prune reasons by inspecting the parent's path
        const parent = allNodes.find(n => n.id === child.parentId);
        const parentPath = parent?.path as number[] | undefined;
        const isBreakOrder = !!(parentPath && parentPath.length > 0 && Number(child.value) < parentPath[parentPath.length - 1]);
        const reason = isBreakOrder
          ? `破坏递增：${child.value} < ${parentPath![parentPath!.length - 1]}`
          : `同层重复：${child.value} 已在本层出现过`;
        steps.push({
          nodes: allNodes, currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...prunedIds],
          path: [...node.path],
          message: `剪枝（未下潜）· ${reason}`,
          codeLine: isBreakOrder ? 13 : 12,
          stats: { depth: node.depth, count: foundIds.length, pathLen: node.path.length },
        });
        continue;
      }

      // iterate
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path],
        message: `for 循环：i = ${child.value}，检查去重与递增约束`,
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
        codeLine: 14,
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
        codeLine: 15,
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
        codeLine: 16,
        stats: { depth: node.depth, count: foundIds.length, pathLen: node.path.length },
      });
    }
  }

  traverse(root);

  steps.push({
    nodes: allNodes, currentNodeId: 'root',
    visitedNodeIds: [...visitedIds],
    foundPathIds: [...foundIds],
    prunedNodeIds: [...prunedIds],
    path: [],
    message: `完成！共找到 ${foundIds.length} 个递增子序列`,
    codeLine: 4,
    stats: { depth: 0, count: foundIds.length, pathLen: 0 },
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class IncreasingSubsequencesVisualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLines = [
    'public List<List<Integer>> findSubsequences(int[] nums) {',
    '    List<List<Integer>> res = new ArrayList<>();',
    '    backtrack(nums, 0, new ArrayList<>(), res);',
    '    return res;',
    '}',
    '',
    'void backtrack(int[] nums, int start, List<Integer> path,',
    '               List<List<Integer>> res) {',
    '    if (path.size() >= 2) res.add(new ArrayList<>(path));',
    '    Set<Integer> used = new HashSet<>();',
    '    for (int i = start; i < nums.length; i++) {',
    '        if (used.contains(nums[i])) continue; // 同层去重',
    '        if (!path.isEmpty() && nums[i] < path.get(path.size()-1)) continue; // 破坏递增',
    '        used.add(nums[i]);',
    '        path.add(nums[i]);',
    '        backtrack(nums, i + 1, path, res);',
    '        path.remove(path.size() - 1);',
    '    }',
    '}',
  ];
  protected codePanelTitle = '递增子序列 Java 代码';

  private treeDisplay: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#increasing-subsequences-tree-display');
    this.logEl = this.root.querySelector('#is-log');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#is-start')?.addEventListener('click', () => this.start());

    // Example chips
    this.root.querySelectorAll<HTMLButtonElement>('.is-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const numsEl = this.root?.querySelector('#is-nums') as HTMLInputElement | null;
        if (numsEl) numsEl.value = btn.dataset.nums || '';
        this.start();
      });
    });

    // Clear log
    this.root.querySelector('#is-log-clear')?.addEventListener('click', () => {
      if (this.logEl) this.logEl.innerHTML = '';
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const numsEl = this.root?.querySelector('#is-nums') as HTMLInputElement | null;
    const nums = (numsEl?.value || '4,6,7,7')
      .split(/[,，\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => Number.isFinite(n));
    if (nums.length === 0) nums.push(4, 6, 7, 7);
    return buildSteps(nums);
  }

  protected renderStep(step: BacktrackTreeStep): void {
    // Stats
    const depthEl = this.root?.querySelector('#is-depth');
    if (depthEl) depthEl.textContent = String(step.stats?.depth ?? 0);
    const countEl = this.root?.querySelector('#is-count');
    if (countEl) countEl.textContent = String(step.stats?.count ?? 0);
    const pathLenEl = this.root?.querySelector('#is-path-len');
    if (pathLenEl) pathLenEl.textContent = String(step.stats?.pathLen ?? 0);

    // Tree: a node counts as "found" when its path length >= 2
    if (this.treeDisplay) {
      renderBacktrackTree({
        container: this.treeDisplay,
        step,
        cssPrefix: 'is',
        isFoundNode: (nd, st) => nd.path.length >= 2 && st.foundPathIds.includes(nd.id),
      });
    }

    // Log
    renderBacktrackLog(this.logEl, this.steps, this.currentIndex, 'is');
  }

  public reset(): void {
    super.reset();
    if (this.treeDisplay) this.treeDisplay.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'increasing-subsequences',
  name: '递增子序列',
  viewId: 'algo-increasing-subsequences-view',
  category: 'backtracking',
  description: 'LeetCode 491 · 每层 Set 去重，收集长度 >= 2',
  icon: '📈',
  template,
  Visualizer: IncreasingSubsequencesVisualizer,
  difficulty: 2,
  levelOrder: 13,
  learningGoal: '理解递增子序列的去重回溯',
});
