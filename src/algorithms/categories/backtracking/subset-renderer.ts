/**
 * 子集可视化器（回溯算法）- 回溯决策树版本
 * LeetCode 78：给定不含重复数字的整数数组，返回所有可能的子集
 * 子集问题不剪枝，每条路径都收集，每个节点都是叶子（结果收集点）
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
import template from './subset.html?raw';

/* ── Build the full decision tree ─────────────────────────── */
function buildTree(nums: number[]): BacktrackTreeNode {
  const root: BacktrackTreeNode = {
    id: 'root', value: '', path: [], children: [],
    isLeaf: true, isPruned: false, parentId: null, depth: 0,
  };

  function dfs(startIdx: number, path: number[], parent: BacktrackTreeNode): void {
    for (let i = startIdx; i < nums.length; i++) {
      const candidate = nums[i];
      const childPath = [...path, candidate];
      const childId = `${parent.id}-${i}`;

      const node: BacktrackTreeNode = {
        id: childId, value: String(candidate), path: childPath,
        children: [], isLeaf: true, isPruned: false,
        parentId: parent.id, depth: parent.depth + 1,
      };
      parent.children.push(node);
      // Subset: i+1 (no reuse), no pruning — every path is collected
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

  // Start step
  steps.push({
    nodes: allNodes, currentNodeId: 'root', visitedNodeIds: ['root'],
    foundPathIds: [], prunedNodeIds: [...prunedIds],
    path: [],
    message: `开始：nums=[${nums.join(',')}]，生成所有子集（每个节点都收集）`,
    codeLine: 3,
    stats: { depth: 0, count: 0, pathLen: 0 },
  });

  function traverse(node: BacktrackTreeNode): void {
    // Every node is a collection point (subset problem collects all paths)
    foundIds.push(node.id);
    steps.push({
      nodes: allNodes, currentNodeId: node.id,
      visitedNodeIds: [...visitedIds],
      foundPathIds: [...foundIds],
      prunedNodeIds: [...prunedIds],
      path: [...node.path],
      message: `收集子集：[${node.path.join(', ')}]`,
      codeLine: 8,
      stats: { depth: node.depth, count: foundIds.length, pathLen: node.path.length },
    });

    for (const child of node.children) {
      // iterate: for 循环取到候选值 nums[i]，高亮循环头
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path],
        message: `for 循环：i = ${child.value}，尝试加入子集`,
        codeLine: 9,
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
        codeLine: 10,
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
        codeLine: 11,
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
        codeLine: 12,
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
    message: `完成！共收集 ${foundIds.length} 个子集`,
    codeLine: 4,
    stats: { depth: 0, count: foundIds.length, pathLen: 0 },
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class SubsetVisualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLines = [
    'public List<List<Integer>> subsets(int[] nums) {',
    '    List<List<Integer>> result = new ArrayList<>();',
    '    backtrack(nums, 0, new ArrayList<>(), result);',
    '    return result;',
    '}',
    '',
    'void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> result) {',
    '    result.add(new ArrayList<>(path));',
    '    for (int i = start; i < nums.length; i++) {',
    '        path.add(nums[i]);',
    '        backtrack(nums, i + 1, path, result);',
    '        path.remove(path.size() - 1);',
    '    }',
    '}',
  ];
  protected codePanelTitle = '子集 Java 代码';

  private treeDisplay: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private inputField: HTMLInputElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#subset-tree-display');
    this.logEl = this.root.querySelector('#sub-log');
    this.inputField = this.root.querySelector('#subset-input');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#subset-start')?.addEventListener('click', () => this.start());

    // Clear log
    this.root.querySelector('#sub-log-clear')?.addEventListener('click', () => {
      if (this.logEl) this.logEl.innerHTML = '';
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const inputArray = [1, 2, 3];
    if (this.inputField) {
      const input = this.inputField.value.trim();
      if (input) {
        const parsed = input.split(/[,，\s]+/).map((n) => parseInt(n.trim(), 10)).filter((n) => !isNaN(n));
        if (parsed.length > 0) inputArray.splice(0, inputArray.length, ...parsed);
      }
    }
    return buildSteps(inputArray);
  }

  protected renderStep(step: BacktrackTreeStep): void {
    // Stats
    const depthEl = this.root?.querySelector('#sub-depth');
    if (depthEl) depthEl.textContent = String(step.stats?.depth ?? 0);
    const countEl = this.root?.querySelector('#sub-count');
    if (countEl) countEl.textContent = String(step.stats?.count ?? 0);
    const pathLenEl = this.root?.querySelector('#sub-path-len');
    if (pathLenEl) pathLenEl.textContent = String(step.path.length);

    // Tree
    if (this.treeDisplay) {
      renderBacktrackTree({
        container: this.treeDisplay,
        step,
        cssPrefix: 'sub',
      });
    }

    // Log
    renderBacktrackLog(this.logEl, this.steps, this.currentIndex, 'sub');
  }

  public reset(): void {
    super.reset();
    if (this.treeDisplay) this.treeDisplay.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'subset',
  name: '子集（回溯）',
  viewId: 'algo-subset-view',
  category: 'backtracking',
  description: '使用回溯算法生成所有子集',
  icon: '📦',
  template,
  Visualizer: SubsetVisualizer,
  difficulty: 1,
  levelOrder: 10,
  learningGoal: '理解子集生成的回溯方法（每层都收集）',
});
