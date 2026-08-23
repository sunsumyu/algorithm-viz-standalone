/**
 * 全排列 II 可视化器（回溯）- 回溯决策树版本
 * LeetCode 47 · 输入含重复数字，排序 + used 数组 + 同层去重
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
import template from './permutation-ii.html?raw';

/* ── Build the full decision tree ─────────────────────────── */
type PruneReason = 'used' | 'dedup';

interface BuildTreeResult {
  root: BacktrackTreeNode;
  pruneReasons: Map<string, PruneReason>;
}

function buildTree(sorted: number[]): BuildTreeResult {
  const pruneReasons = new Map<string, PruneReason>();
  const root: BacktrackTreeNode = {
    id: 'root', value: '', path: [], children: [],
    isLeaf: false, isPruned: false, parentId: null, depth: 0,
  };
  const n = sorted.length;
  const used = new Array(n).fill(false);

  function dfs(path: number[], parent: BacktrackTreeNode): void {
    if (path.length === n) {
      parent.isLeaf = true;
      return;
    }
    for (let i = 0; i < n; i++) {
      const childId = `${parent.id}-${i}`;
      const childPath = [...path, sorted[i]];

      if (used[i]) {
        // Pruned: this element already used in current path
        parent.children.push({
          id: childId, value: String(sorted[i]), path: childPath,
          children: [], isLeaf: false, isPruned: true,
          parentId: parent.id, depth: parent.depth + 1,
        });
        pruneReasons.set(childId, 'used');
        continue;
      }
      if (i > 0 && sorted[i] === sorted[i - 1] && !used[i - 1]) {
        // Pruned: same-layer duplicate deduplication
        parent.children.push({
          id: childId, value: String(sorted[i]), path: childPath,
          children: [], isLeaf: false, isPruned: true,
          parentId: parent.id, depth: parent.depth + 1,
        });
        pruneReasons.set(childId, 'dedup');
        continue;
      }

      const node: BacktrackTreeNode = {
        id: childId, value: String(sorted[i]), path: childPath,
        children: [], isLeaf: false, isPruned: false,
        parentId: parent.id, depth: parent.depth + 1,
      };
      parent.children.push(node);
      used[i] = true;
      dfs(childPath, node);
      used[i] = false;
    }
  }

  dfs([], root);
  return { root, pruneReasons };
}

/* ── Generate steps by traversing the tree ────────────────── */
function buildSteps(sorted: number[]): BacktrackTreeStep[] {
  const { root, pruneReasons } = buildTree(sorted);
  layoutTree(root);
  const allNodes = flattenTree(root);
  const prunedIds = allNodes.filter(nd => nd.isPruned).map(nd => nd.id);

  const steps: BacktrackTreeStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];
  const n = sorted.length;

  // Start step
  steps.push({
    nodes: allNodes, currentNodeId: 'root', visitedNodeIds: ['root'],
    foundPathIds: [], prunedNodeIds: [...prunedIds],
    path: [],
    message: `开始：nums=[${sorted.join(',')}]（已排序），共 ${n} 个元素`,
    codeLine: 5,
    stats: { depth: 0, used: 0, count: 0, remain: n },
  });

  function traverse(node: BacktrackTreeNode): void {
    if (node.isLeaf) {
      // 递归进入：先执行 if (path.size() == nums.length) 判断 —— 成立
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path],
        message: `递归进入：path.size() == ${n} ✓ 排列完成`,
        codeLine: 10,
        stats: { depth: node.depth, used: node.depth, count: foundIds.length, remain: 0 },
      });
      // 进入 if 块：收集并 return
      foundIds.push(node.id);
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path],
        message: `找到排列：[${node.path.join(', ')}]，收集并返回`,
        codeLine: { from: 11, to: 12 },
        stats: { depth: node.depth, used: node.depth, count: foundIds.length, remain: 0 },
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
      message: `递归进入：path.size() = ${node.path.length} < ${n}，继续选择`,
      codeLine: 10,
      stats: { depth: node.depth, used: node.depth, count: foundIds.length, remain: n - node.depth },
    });

    for (const child of node.children) {
      if (child.isPruned) {
        visitedIds.push(child.id);
        const reason = pruneReasons.get(child.id);
        const msg = reason === 'dedup'
          ? `同层跳过重复 ${child.value}（与前一分支相同，去重）`
          : `剪枝：${child.value} 已在路径中使用`;
        steps.push({
          nodes: allNodes, currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...prunedIds],
          path: [...node.path],
          message: msg + "（跳过，未下潜）",
          codeLine: reason === 'dedup' ? 17 : 15,
          stats: { depth: node.depth, used: node.depth, count: foundIds.length, remain: n - node.depth },
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
        message: `for 循环：i = ${child.value}，检查使用状态与去重`,
        codeLine: 14,
        stats: { depth: node.depth, used: node.depth, count: foundIds.length, remain: n - node.depth },
      });

      // Step A: path.add(i)
      visitedIds.push(child.id);
      const usedCount = node.depth + 1;
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...child.path],
        message: `path.add(${child.value})：当前路径变为 [${child.path.join(', ')}]`,
        codeLine: { from: 18, to: 19 },
        stats: { depth: child.depth, used: usedCount, count: foundIds.length, remain: n - usedCount },
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
        codeLine: 20,
        stats: { depth: child.depth, used: usedCount, count: foundIds.length, remain: n - usedCount },
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
        codeLine: { from: 21, to: 22 },
        stats: { depth: node.depth, used: node.depth, count: foundIds.length, remain: n - node.depth },
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
    message: `完成！共找到 ${foundIds.length} 个不重复排列`,
    codeLine: 6,
    stats: { depth: 0, used: 0, count: foundIds.length, remain: n },
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class PermutationIIVisualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLines = [
    'public List<List<Integer>> permuteUnique(int[] nums) {',
    '    Arrays.sort(nums);',
    '    List<List<Integer>> res = new ArrayList<>();',
    '    boolean[] used = new boolean[nums.length];',
    '    backtrack(nums, used, new ArrayList<>(), res);',
    '    return res;',
    '}',
    '',
    'void backtrack(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> res) {',
    '    if (path.size() == nums.length) {',
    '        res.add(new ArrayList<>(path));',
    '        return;',
    '    }',
    '    for (int i = 0; i < nums.length; i++) {',
    '        if (used[i]) continue;',
    '        if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;',
    '        used[i] = true;',
    '        path.add(nums[i]);',
    '        backtrack(nums, used, path, res);',
    '        path.remove(path.size() - 1);',
    '        used[i] = false;',
    '    }',
    '}',
  ];
  protected codePanelTitle = '全排列 II Java 代码';

  private treeDisplay: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#permutation-ii-tree-display');
    this.logEl = this.root.querySelector('#pii-log');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#bt-start')?.addEventListener('click', () => this.start());

    // Example chips (preserve original .bt-example / data-nums hook)
    this.root.querySelectorAll<HTMLButtonElement>('.bt-example').forEach(btn => {
      btn.addEventListener('click', () => {
        const numsEl = this.root?.querySelector('#bt-nums') as HTMLInputElement | null;
        if (numsEl) numsEl.value = btn.dataset.nums || '';
        this.start();
      });
    });

    // Clear log
    this.root.querySelector('#pii-log-clear')?.addEventListener('click', () => {
      if (this.logEl) this.logEl.innerHTML = '';
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const numsEl = this.root?.querySelector('#bt-nums') as HTMLInputElement | null;
    const nums = (numsEl?.value || '1,1,2').split(/[,，\s]+/).map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n));
    if (nums.length === 0) nums.push(1, 1, 2);
    const sorted = [...nums].sort((a, b) => a - b);
    return buildSteps(sorted);
  }

  protected renderStep(step: BacktrackTreeStep): void {
    // Stats
    const depthEl = this.root?.querySelector('[data-metric="depth"]');
    if (depthEl) depthEl.textContent = String(step.stats?.depth ?? 0);
    const usedEl = this.root?.querySelector('[data-metric="used"]');
    if (usedEl) usedEl.textContent = String(step.stats?.used ?? 0);
    const countEl = this.root?.querySelector('[data-metric="count"]');
    if (countEl) countEl.textContent = String(step.stats?.count ?? 0);
    const remainEl = this.root?.querySelector('[data-metric="remain"]');
    if (remainEl) remainEl.textContent = String(step.stats?.remain ?? 0);

    // Tree
    if (this.treeDisplay) {
      renderBacktrackTree({
        container: this.treeDisplay,
        step,
        cssPrefix: 'pii',
      });
    }

    // Log
    renderBacktrackLog(this.logEl, this.steps, this.currentIndex, 'pii');
  }

  public reset(): void {
    super.reset();
    if (this.treeDisplay) this.treeDisplay.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'permutation-ii',
  name: '全排列II',
  viewId: 'algo-permutation-ii-view',
  category: 'backtracking',
  description: 'LeetCode 47 · 排序 + used + 同层去重',
  icon: '🔀',
  template,
  Visualizer: PermutationIIVisualizer,
  difficulty: 2,
  levelOrder: 16,
  learningGoal: '理解含重复元素的全排列去重回溯',
});
