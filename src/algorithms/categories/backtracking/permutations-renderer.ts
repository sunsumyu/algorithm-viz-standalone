/**
 * 全排列可视化器（回溯）- 回溯决策树版本
 * LeetCode 46 · 使用 used 标记已选元素，枚举所有排列
 * 本视图以「used 数组剪枝视角」展示决策树，并在树下方附带 used 数组状态条
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
import template from './permutations.html?raw';

/* ── Build the full decision tree ─────────────────────────── */
function buildTree(nums: number[]): BacktrackTreeNode {
  const root: BacktrackTreeNode = {
    id: 'root', value: '', path: [], children: [],
    isLeaf: false, isPruned: false, parentId: null, depth: 0,
  };
  const n = nums.length;
  const used = new Array(n).fill(false);

  function dfs(path: number[], parent: BacktrackTreeNode): void {
    if (path.length === n) {
      parent.isLeaf = true;
      return;
    }
    for (let i = 0; i < n; i++) {
      const childId = `${parent.id}-${i}`;
      const childPath = [...path, nums[i]];

      if (used[i]) {
        // Pruned: this element already used in current path
        parent.children.push({
          id: childId, value: String(nums[i]), path: childPath,
          children: [], isLeaf: false, isPruned: true,
          parentId: parent.id, depth: parent.depth + 1,
        });
        continue;
      }

      const node: BacktrackTreeNode = {
        id: childId, value: String(nums[i]), path: childPath,
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
  const n = nums.length;

  // Start step
  steps.push({
    nodes: allNodes, currentNodeId: 'root', visitedNodeIds: ['root'],
    foundPathIds: [], prunedNodeIds: [...prunedIds],
    path: [],
    message: `开始：nums=[${nums.join(',')}]，共 ${n} 个元素（无重复）`,
    codeLine: 4,
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
        codeLine: 9,
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
        message: `路径完整，收集排列 [${node.path.join(', ')}] 并返回`,
        codeLine: { from: 10, to: 11 },
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
      codeLine: 9,
      stats: { depth: node.depth, used: node.depth, count: foundIds.length, remain: n - node.depth },
    });

    for (const child of node.children) {
      if (child.isPruned) {
        visitedIds.push(child.id);
        steps.push({
          nodes: allNodes, currentNodeId: child.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...prunedIds],
          path: [...node.path],
          message: `剪枝：${child.value} 已在路径中使用`,
          codeLine: 14,
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
        message: `for 循环：i = ${child.value}，检查是否已使用`,
        codeLine: 13,
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
        codeLine: 16,
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
        codeLine: 17,
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
        message: `撤销 ${child.value}，路径回退为 [${node.path.join(', ') || '空'}]`,
        codeLine: { from: 18, to: 19 },
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
    message: `完成！共收集 ${foundIds.length} 个排列`,
    codeLine: 5,
    stats: { depth: 0, used: 0, count: foundIds.length, remain: n },
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class PermutationsVisualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLines = [
    'public List<List<Integer>> permute(int[] nums) {',
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
    '        used[i] = true;',
    '        path.add(nums[i]);',
    '        backtrack(nums, used, path, res);',
    '        path.remove(path.size() - 1);',
    '        used[i] = false;',
    '    }',
    '}',
  ];
  protected codePanelTitle = '全排列 Java 代码';

  private treeDisplay: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private usedBarEl: HTMLElement | null = null;
  private numsCache: number[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#permutations-tree-display');
    this.logEl = this.root.querySelector('#perm2-log');
    this.usedBarEl = this.root.querySelector('#perm2-used-bar');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#perm-start')?.addEventListener('click', () => this.start());

    // Example chips (preserve .perm-example / data-val hook)
    this.root.querySelectorAll<HTMLButtonElement>('.perm-example').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = this.root?.querySelector('#perm-input') as HTMLInputElement | null;
        if (input) input.value = (btn as HTMLButtonElement).dataset.val || '1,2,3';
        this.start();
      });
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const input = this.root?.querySelector('#perm-input') as HTMLInputElement | null;
    const nums = (input?.value || '1,2,3').split(/[,，\s]+/).map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n));
    if (nums.length === 0) nums.push(1, 2, 3);
    this.numsCache = nums;
    return buildSteps(nums);
  }

  protected renderStep(step: BacktrackTreeStep): void {
    // Stats (preserve original stat element ids)
    const pathEl = this.root?.querySelector('#perm-path');
    if (pathEl) pathEl.textContent = `[${step.path.join(', ')}]`;
    const countEl = this.root?.querySelector('#perm-collected');
    if (countEl) countEl.textContent = String(step.stats?.count ?? 0);
    const depthEl = this.root?.querySelector('#perm-depth');
    if (depthEl) depthEl.textContent = String(step.stats?.depth ?? 0);
    const availEl = this.root?.querySelector('#perm-avail');
    if (availEl) availEl.textContent = String(step.stats?.remain ?? 0);

    // Tree
    if (this.treeDisplay) {
      renderBacktrackTree({
        container: this.treeDisplay,
        step,
        cssPrefix: 'perm2',
      });
    }

    // Used array state bar
    this.renderUsedBar(step);

    // Log
    renderBacktrackLog(this.logEl, this.steps, this.currentIndex, 'perm2');
  }

  /** Render the used[] boolean array as a state strip below the tree. */
  private renderUsedBar(step: BacktrackTreeStep): void {
    if (!this.usedBarEl || this.numsCache.length === 0) return;
    // Derive used[] from current step path
    const n = this.numsCache.length;
    const used = new Array(n).fill(false);
    for (const v of step.path) {
      for (let i = 0; i < n; i++) {
        if (this.numsCache[i] === Number(v) && !used[i]) { used[i] = true; break; }
      }
    }
    this.usedBarEl.innerHTML = '';
    const label = document.createElement('span');
    label.className = 'perm2-used-label';
    label.textContent = 'used[]';
    this.usedBarEl.appendChild(label);
    this.numsCache.forEach((v, i) => {
      const chip = document.createElement('span');
      chip.className = `perm2-used-chip ${used[i] ? 'perm2-used-on' : 'perm2-used-off'}`;
      chip.textContent = `${i}:${v}`;
      chip.title = `used[${i}] = ${v} → ${used[i]}`;
      this.usedBarEl!.appendChild(chip);
    });
  }

  public reset(): void {
    super.reset();
    if (this.treeDisplay) this.treeDisplay.innerHTML = '';
    if (this.usedBarEl) this.usedBarEl.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'permutations',
  name: '全排列·used数组',
  viewId: 'algo-permutations-view',
  category: 'backtracking',
  description: '回溯枚举所有排列，used 标记已选元素',
  icon: '🔢',
  template,
  Visualizer: PermutationsVisualizer,
  difficulty: 1,
  levelOrder: 15,
});
