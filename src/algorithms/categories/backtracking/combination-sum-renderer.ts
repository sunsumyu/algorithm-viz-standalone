/**
 * 组合总和可视化器（回溯）— 回溯决策树版本
 * LeetCode 39：给定无重复元素的整数数组和一个目标整数，找出所有和为目标的组合
 * 元素可以无限重复选取
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
import template from './combination-sum.html?raw';

/* ── Build the full decision tree ─────────────────────────── */
export function buildCombinationSumTree(sorted: number[], target: number): BacktrackTreeNode {
  const root: BacktrackTreeNode = {
    id: 'root', value: '', path: [], children: [],
    isLeaf: false, isPruned: false, parentId: null, depth: 0,
  };

  function dfs(startIdx: number, remaining: number, path: number[], parent: BacktrackTreeNode): void {
    if (remaining === 0) {
      if (!parent.isPruned) parent.isLeaf = true;
      return;
    }
    for (let i = startIdx; i < sorted.length; i++) {
      const candidate = sorted[i];
      const childPath = [...path, candidate];
      const childId = `${parent.id}-${i}`;
      const isDirectPrune = !parent.isPruned && (candidate > remaining);
      const isPruned = parent.isPruned || isDirectPrune;

      const node: BacktrackTreeNode = {
        id: childId, value: String(candidate), path: childPath,
        children: [], isLeaf: false, isPruned, isDirectPrune,
        parentId: parent.id, depth: parent.depth + 1,
      };
      parent.children.push(node);
      if (!isPruned) {
        dfs(i, remaining - candidate, childPath, node);
      }
    }
  }

  dfs(0, target, [], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */

/** 从 node id (如 "root-0-1") 中提取最后一段的索引 i */
function extractIndexFromId(id: string): number {
  const parts = id.split('-');
  return parseInt(parts[parts.length - 1], 10);
}

export function buildCombinationSumSteps(sorted: number[], target: number): BacktrackTreeStep[] {
  const root = buildCombinationSumTree(sorted, target);
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
    message: `开始：candidates=[${sorted.join(',')}]，target=${target}，元素可重复使用`,
    codeLine: 4,
    stats: { remaining: target, depth: 0, count: 0 },
    vars: [
      { name: 'c[]', value: `[${sorted.join(', ')}]`, type: 'array' },
      { name: 'target', value: String(target), type: 'number' },
      { name: 'sum', value: '0', type: 'number' },
      { name: 'start', value: '0', type: 'number' },
      { name: 'path', value: '[]', type: 'array' },
      { name: 'res.size', value: '0', type: 'number' },
    ],
  });

  function traverse(node: BacktrackTreeNode): void {
    const nodeSum = (node.path as number[]).reduce((a, b) => a + b, 0);
    // 当前节点对应的 start 值：根节点 start=0，子节点 start=自身 i（可重复选取）
    const nodeStart = node.id === 'root' ? 0 : extractIndexFromId(node.id);

    if (node.isLeaf) {
      // 递归进入：先执行 if (sum == target) 判断 —— 成立
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path],
        message: `递归进入：sum = ${nodeSum} == target ✓ 满足条件`,
        codeLine: 10,
        stats: { remaining: 0, depth: node.depth, count: foundIds.length },
        vars: [
          { name: 'c[]', value: `[${sorted.join(', ')}]`, type: 'array' },
          { name: 'target', value: String(target), type: 'number' },
          { name: 'sum', value: String(nodeSum), type: 'number' },
          { name: 'start', value: String(nodeStart), type: 'number' },
          { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
          { name: 'res.size', value: String(foundIds.length), type: 'number' },
        ],
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
        codeLine: 10,
        stats: { remaining: 0, depth: node.depth, count: foundIds.length },
        vars: [
          { name: 'c[]', value: `[${sorted.join(', ')}]`, type: 'array' },
          { name: 'target', value: String(target), type: 'number' },
          { name: 'sum', value: String(nodeSum), type: 'number' },
          { name: 'start', value: String(nodeStart), type: 'number' },
          { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
          { name: 'res.size', value: String(foundIds.length), type: 'number' },
        ],
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
      message: `递归进入：sum = ${nodeSum} ≠ target，继续搜索`,
      codeLine: 10,
      stats: { remaining: target - nodeSum, depth: node.depth, count: foundIds.length },
      vars: [
        { name: 'c[]', value: `[${sorted.join(', ')}]`, type: 'array' },
        { name: 'target', value: String(target), type: 'number' },
        { name: 'sum', value: String(nodeSum), type: 'number' },
        { name: 'start', value: String(nodeStart), type: 'number' },
        { name: 'path', value: `[${(node.path as number[]).join(', ')}]`, type: 'array' },
        { name: 'res.size', value: String(foundIds.length), type: 'number' },
      ],
    });

    for (const child of node.children) {
      const childIdx = extractIndexFromId(child.id);
      const childVal = Number(child.value);

      if (child.isPruned) {
        if (child.isDirectPrune) {
          visitedIds.push(child.id);
          steps.push({
            nodes: allNodes, currentNodeId: node.id,
            visitedNodeIds: [...visitedIds],
            foundPathIds: [...foundIds],
            prunedNodeIds: [...prunedIds],
            path: [...node.path],
            message: `剪枝（目标超出）：选 ${child.value} 后 (和=${nodeSum + childVal}) 超过 target (${target})（跳过，未下潜）`,
            codeLine: 12,
            stats: { remaining: target - nodeSum, depth: node.depth, count: foundIds.length },
            vars: [
              { name: 'c[]', value: `[${sorted.join(', ')}]`, type: 'array' },
              { name: 'target', value: String(target), type: 'number' },
              { name: 'i', value: String(childIdx), type: 'number' },
              { name: 'c[i]', value: String(childVal), type: 'number' },
              { name: 'sum', value: String(nodeSum), type: 'number' },
              { name: 'sum+c[i]', value: String(nodeSum + childVal), type: 'number' },
              { name: 'path', value: `[${(node.path as number[]).join(', ')}]`, type: 'array' },
              { name: 'res.size', value: String(foundIds.length), type: 'number' },
            ],
          });
        }
        continue;
      }

      // iterate: for 循环取到候选值 c[i]，高亮循环头
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path],
        message: `for 循环：i = ${childIdx}，尝试加入`,
        codeLine: 11,
        stats: { remaining: target - nodeSum, depth: node.depth, count: foundIds.length },
        vars: [
          { name: 'c[]', value: `[${sorted.join(', ')}]`, type: 'array' },
          { name: 'target', value: String(target), type: 'number' },
          { name: 'i', value: String(childIdx), type: 'number' },
          { name: 'c[i]', value: String(childVal), type: 'number' },
          { name: 'sum', value: String(nodeSum), type: 'number' },
          { name: 'start', value: String(nodeStart), type: 'number' },
          { name: 'path', value: `[${(node.path as number[]).join(', ')}]`, type: 'array' },
          { name: 'res.size', value: String(foundIds.length), type: 'number' },
        ],
      });

      // Step A: path.add(i)
      visitedIds.push(child.id);
      const childSum = (child.path as number[]).reduce((a, b) => a + b, 0);
      const remaining = target - childSum;
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...child.path],
        message: `path.add(${child.value})：当前路径变为 [${child.path.join(', ')}]`,
        codeLine: 13,
        stats: { remaining, depth: child.depth, count: foundIds.length },
        vars: [
          { name: 'c[]', value: `[${sorted.join(', ')}]`, type: 'array' },
          { name: 'target', value: String(target), type: 'number' },
          { name: 'i', value: String(childIdx), type: 'number' },
          { name: 'c[i]', value: String(childVal), type: 'number' },
          { name: 'sum', value: String(childSum), type: 'number' },
          { name: 'start', value: String(nodeStart), type: 'number' },
          { name: 'path', value: `[${(child.path as number[]).join(', ')}]`, type: 'array' },
          { name: 'res.size', value: String(foundIds.length), type: 'number' },
        ],
      });
      // Step B: backtrack(...)
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...child.path],
        message: `backtrack(c, ${childIdx}, path, res, target, ${childSum})：递归深入`,
        codeLine: 14,
        stats: { remaining, depth: child.depth, count: foundIds.length },
        vars: [
          { name: 'c[]', value: `[${sorted.join(', ')}]`, type: 'array' },
          { name: 'target', value: String(target), type: 'number' },
          { name: 'i', value: String(childIdx), type: 'number' },
          { name: 'c[i]', value: String(childVal), type: 'number' },
          { name: 'sum', value: String(childSum), type: 'number' },
          { name: 'start', value: String(childIdx), type: 'number' },
          { name: 'path', value: `[${(child.path as number[]).join(', ')}]`, type: 'array' },
          { name: 'res.size', value: String(foundIds.length), type: 'number' },
        ],
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
        codeLine: 15,
        stats: { remaining: target - nodeSum, depth: node.depth, count: foundIds.length },
        vars: [
          { name: 'c[]', value: `[${sorted.join(', ')}]`, type: 'array' },
          { name: 'target', value: String(target), type: 'number' },
          { name: 'i', value: String(childIdx), type: 'number' },
          { name: 'c[i]', value: String(childVal), type: 'number' },
          { name: 'sum', value: String(nodeSum), type: 'number' },
          { name: 'start', value: String(nodeStart), type: 'number' },
          { name: 'path', value: `[${(node.path as number[]).join(', ')}]`, type: 'array' },
          { name: 'res.size', value: String(foundIds.length), type: 'number' },
        ],
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
    codeLine: 5,
    stats: { remaining: target, depth: 0, count: foundIds.length },
    vars: [
      { name: 'c[]', value: `[${sorted.join(', ')}]`, type: 'array' },
      { name: 'target', value: String(target), type: 'number' },
      { name: 'path', value: '[]', type: 'array' },
      { name: 'res.size', value: String(foundIds.length), type: 'number' },
    ],
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class CombinationSumVisualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLines = [
    'public List<List<Integer>> combinationSum(int[] c, int target) {',
    '    Arrays.sort(c);',
    '    List<List<Integer>> res = new ArrayList<>();',
    '    backtrack(c, 0, new ArrayList<>(), res, target, 0);',
    '    return res;',
    '}',
    '',
    'void backtrack(int[] c, int start, List<Integer> path,',
    '               List<List<Integer>> res, int target, int sum) {',
    '    if (sum == target) { res.add(new ArrayList<>(path)); return; }',
    '    for (int i = start; i < c.length; i++) {',
    '        if (sum + c[i] > target) break; // 剪枝',
    '        path.add(c[i]);',
    '        backtrack(c, i, path, res, target, sum + c[i]); // i 可重复',
    '        path.remove(path.size() - 1);',
    '    }',
    '}',
  ];
  protected codePanelTitle = '组合总和 Java 代码';

  private treeDisplay: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#combination-tree-display');
    this.logEl = this.root.querySelector('#cs-log');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#cs-start')?.addEventListener('click', () => this.start());

    // Example chips
    this.root.querySelectorAll<HTMLButtonElement>('.cs-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const numsEl = this.root?.querySelector('#cs-nums') as HTMLInputElement | null;
        const targetEl = this.root?.querySelector('#cs-target') as HTMLInputElement | null;
        if (numsEl) numsEl.value = btn.dataset.nums || '';
        if (targetEl) targetEl.value = btn.dataset.target || '';
        this.start();
      });
    });

    // Clear log
    this.root.querySelector('#cs-log-clear')?.addEventListener('click', () => {
      if (this.logEl) this.logEl.innerHTML = '';
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const numsEl = this.root?.querySelector('#cs-nums') as HTMLInputElement | null;
    const targetEl = this.root?.querySelector('#cs-target') as HTMLInputElement | null;
    const nums = (numsEl?.value || '2,3,6,7').split(/[,，\s]+/).map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n) && n > 0);
    const target = parseInt(targetEl?.value || '7', 10);
    if (nums.length === 0) nums.push(2, 3, 6, 7);
    const sorted = [...nums].sort((a, b) => a - b);
    return buildCombinationSumSteps(sorted, Number.isFinite(target) ? target : 7);
  }

  protected renderStep(step: BacktrackTreeStep): void {
    // Stats
    const remainingEl = this.root?.querySelector('#cs-remaining');
    if (remainingEl) remainingEl.textContent = String(step.stats?.remaining ?? 0);
    const depthEl = this.root?.querySelector('#cs-depth');
    if (depthEl) depthEl.textContent = String(step.stats?.depth ?? 0);
    const countEl = this.root?.querySelector('#cs-count');
    if (countEl) countEl.textContent = String(step.stats?.count ?? 0);
    const pathLenEl = this.root?.querySelector('#cs-path-len');
    if (pathLenEl) pathLenEl.textContent = String(step.path.length);

    // Tree
    if (this.treeDisplay) {
      renderBacktrackTree({
        container: this.treeDisplay,
        step,
        cssPrefix: 'cs',
      });
    }

    // Log
    renderBacktrackLog(this.logEl, this.steps, this.currentIndex, 'cs');
  }

  public reset(): void {
    super.reset();
    if (this.treeDisplay) this.treeDisplay.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'combination-sum',
  name: '组合总和（回溯）',
  viewId: 'algo-combination-sum-view',
  category: 'backtracking',
  description: '元素可重复使用，回溯 + 剪枝求所有组合',
  icon: '\uD83C\uDFAF',
  template,
  Visualizer: CombinationSumVisualizer,
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '理解无限重复选择的回溯搜索与决策树结构',
});
