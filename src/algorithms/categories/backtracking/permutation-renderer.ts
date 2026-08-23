/**
 * 全排列可视化器（回溯算法）— 回溯决策树版本
 * LeetCode 46：给定不含重复数字的数组，返回所有可能的排列
 * 支持代码联动高亮演示，使用 SVG 回溯决策树展示递归结构
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './permutation.html?raw';
import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
  renderBacktrackTree,
  renderBacktrackLog,
} from './backtracking-tree-helper';

/* ── Build the full decision tree ─────────────────────────── */
function buildPermutationTree(nums: number[]): BacktrackTreeNode {
  const root: BacktrackTreeNode = {
    id: 'root', value: '', path: [], children: [],
    isLeaf: false, isPruned: false, parentId: null, depth: 0,
  };

  function dfs(used: boolean[], path: number[], parent: BacktrackTreeNode): void {
    if (path.length === nums.length) {
      parent.isLeaf = true;
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      const childId = `${parent.id}-${i}`;
      const childNode: BacktrackTreeNode = {
        id: childId, value: String(nums[i]), path: [...path, nums[i]],
        children: [], isLeaf: false, isPruned: false,
        parentId: parent.id, depth: parent.depth + 1,
      };
      parent.children.push(childNode);
      used[i] = true;
      dfs(used, [...path, nums[i]], childNode);
      used[i] = false;
    }
  }

  dfs(new Array(nums.length).fill(false), [], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
function permutationSteps(nums: number[]): BacktrackTreeStep[] {
  if (nums.length === 0) {
    return [{
      nodes: [], currentNodeId: 'root', visitedNodeIds: [],
      foundPathIds: [], prunedNodeIds: [], path: [],
      message: '输入为空，返回空列表', codeLine: 4,
      stats: {},
    }];
  }

  const root = buildPermutationTree(nums);
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
    message: `开始：生成 [${nums.join(', ')}] 的所有排列`,
    codeLine: 4,
    stats: { '当前长度': 0, '目标长度': nums.length },
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
        message: `递归进入：path.size() == ${nums.length} ✓ 排列完成`,
        codeLine: 9,
        stats: { '当前长度': node.path.length, '已收集': foundIds.length },
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
        codeLine: { from: 10, to: 11 },
        stats: { '当前长度': node.path.length, '已收集': foundIds.length },
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
      message: `递归进入：path.size() = ${node.path.length} < ${nums.length}，继续选择`,
      codeLine: 9,
      stats: { '当前长度': node.path.length, '已收集': foundIds.length },
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
          message: `跳过 ${child.value}（已使用）`,
          codeLine: 14,
          stats: { '当前长度': child.path.length, '已收集': foundIds.length },
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
        stats: { '当前长度': node.path.length, '已收集': foundIds.length },
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
        codeLine: 16,
        stats: { '当前长度': child.path.length, '已收集': foundIds.length },
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
        stats: { '当前长度': child.path.length, '已收集': foundIds.length },
      });

      traverse(child);

      // pop (backtrack)
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path],
        message: `撤销选择 ${child.value}，回溯到：[${node.path.join(', ')}]`,
        codeLine: { from: 18, to: 19 },
        stats: { '当前长度': node.path.length, '已收集': foundIds.length },
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
    message: `完成！共找到 ${foundIds.length} 个排列`,
    codeLine: 5,
    stats: { '当前长度': 0, '已收集': foundIds.length },
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class PermutationVisualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLines = [
    'public List<List<Integer>> permute(int[] nums) {',
    '    List<List<Integer>> result = new ArrayList<>();',
    '    boolean[] used = new boolean[nums.length];',
    '    backtrack(nums, used, new ArrayList<>(), result);',
    '    return result;',
    '}',
    '',
    'void backtrack(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> result) {',
    '    if (path.size() == nums.length) {',
    '        result.add(new ArrayList<>(path));',
    '        return;',
    '    }',
    '    for (int i = 0; i < nums.length; i++) {',
    '        if (used[i]) continue;',
    '        used[i] = true;',
    '        path.add(nums[i]);',
    '        backtrack(nums, used, path, result);',
    '        path.remove(path.size() - 1);',
    '        used[i] = false;',
    '    }',
    '}',
  ];
  protected codePanelTitle = '全排列 Java 代码';

  private inputField: HTMLInputElement | null = null;
  private treeDisplay: HTMLElement | null = null;
  private sourceDisplay: HTMLElement | null = null;
  private pathDisplay: HTMLElement | null = null;
  private resultsDisplay: HTMLElement | null = null;
  private collected: number[][] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputField = this.root.querySelector('#permutation-input');
    this.sourceDisplay = this.root.querySelector('#permutation-source');
    this.pathDisplay = this.root.querySelector('#permutation-path');
    this.resultsDisplay = this.root.querySelector('#permutation-results');
    this.treeDisplay = this.root.querySelector('#permutation-tree-display');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#permutation-start')?.addEventListener('click', () => this.start());

    // Example chips
    this.root.querySelectorAll<HTMLButtonElement>('.cs-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.val;
        if (val && this.inputField) this.inputField.value = val;
        this.start();
      });
    });

    // Clear log
    this.root.querySelector('#perm-log-clear')?.addEventListener('click', () => {
      const logEl = this.root?.querySelector('#perm-log');
      if (logEl) logEl.innerHTML = '';
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const inputArray = [1, 2, 3];
    if (this.inputField) {
      const input = this.inputField.value.trim();
      if (input) {
        const parsed = input.split(',').map((n) => parseInt(n.trim(), 10)).filter((n) => !isNaN(n));
        if (parsed.length > 0) inputArray.splice(0, inputArray.length, ...parsed);
      }
    }
    this.collected = [];
    return permutationSteps(inputArray);
  }

  protected renderStep(step: BacktrackTreeStep): void {
    // Collect found permutations
    if (step.message.startsWith('找到排列')) {
      this.collected.push([...step.path] as number[]);
    }
    if (this.currentIndex === 0) {
      this.collected = step.message.startsWith('找到排列') ? [[...step.path] as number[]] : [];
    }

    // Stats from step.stats
    const stats = step.stats || {};
    const countEl = this.root?.querySelector('#permutation-path');
    if (countEl) countEl.textContent = `[${step.path.join(', ')}]`;
    const usedEl = this.root?.querySelector('#permutation-used');
    if (usedEl) usedEl.textContent = (stats['当前长度'] ?? 0).toString();
    const depthEl = this.root?.querySelector('#permutation-depth');
    if (depthEl) depthEl.textContent = String(step.path.length);
    const totalEl = this.root?.querySelector('#permutation-collected');
    if (totalEl) totalEl.textContent = String(stats['已收集'] ?? this.collected.length);

    // Source array display
    if (this.sourceDisplay && this.steps.length > 0) {
      const firstStep = this.steps[0];
      const nums = (firstStep.path.length === 0 && firstStep.stats) ? [] : [];
      // Extract nums from tree node values at depth 1
      const numsSet = new Set<string>();
      step.nodes.filter(nd => nd.depth === 1).forEach(nd => numsSet.add(nd.value));
      const sortedNums = [...numsSet].map(Number).sort((a, b) => a - b);

      this.sourceDisplay.innerHTML = '';
      sortedNums.forEach((num) => {
        const el = document.createElement('div');
        el.className = 'cs-chip';
        el.textContent = num.toString();
        if (step.path.includes(num)) {
          el.classList.add('used');
        }
        this.sourceDisplay!.appendChild(el);
      });
    }

    // Results display
    if (this.resultsDisplay) {
      this.resultsDisplay.innerHTML = '';
      this.collected.forEach((perm) => {
        const item = document.createElement('div');
        item.className = 'cs-result-chip';
        item.textContent = `[${perm.join(', ')}]`;
        this.resultsDisplay!.appendChild(item);
      });
    }

    this.renderTree(step);
    this.renderLogLine(step);
  }

  private renderTree(step: BacktrackTreeStep): void {
    if (!this.treeDisplay) return;
    renderBacktrackTree({
      container: this.treeDisplay,
      step,
      cssPrefix: 'cs',
    });
  }

  private renderLogLine(step: BacktrackTreeStep): void {
    const logEl = this.root?.querySelector('#perm-log') as HTMLElement | null;
    renderBacktrackLog(logEl, this.steps, this.currentIndex, 'cs');
  }
}

registerAlgorithm({
  id: 'permutation',
  name: '全排列·决策树',
  viewId: 'algo-permutation-view',
  category: 'backtracking',
  description: '决策树视角：可视化回溯生成所有排列',
  icon: '\uD83D\uDD00',
  template,
  Visualizer: PermutationVisualizer,
  difficulty: 1,
  levelOrder: 14,
  learningGoal: '掌握全排列的回溯生成方法',
});
