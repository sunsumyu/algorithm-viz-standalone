/**
 * 组合总和 II 可视化器（回溯决策树版本）
 * LeetCode 40：每个元素只用一次，排序后同层去重
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
import template from './combination-sum-ii.html?raw';

/* ── Build the full decision tree ─────────────────────────── */
function buildTree(nums: number[], target: number): BacktrackTreeNode {
  const sorted = [...nums].sort((a, b) => a - b);
  const root: BacktrackTreeNode = {
    id: 'root', value: '', path: [], children: [],
    isLeaf: false, isPruned: false, parentId: null, depth: 0,
  };

  function dfs(start: number, remaining: number, path: number[], parent: BacktrackTreeNode): void {
    if (remaining === 0) {
      if (!parent.isPruned) parent.isLeaf = true;
      return;
    }
    for (let i = start; i < sorted.length; i++) {
      const childPath = [...path, sorted[i]];
      const childId = `${parent.id}-${i}`;

      const isDup = i > start && sorted[i] === sorted[i - 1];
      const isExceed = sorted[i] > remaining;
      const isDirectPrune = !parent.isPruned && (isDup || isExceed);
      const isPruned = parent.isPruned || isDirectPrune;

      const node: BacktrackTreeNode = {
        id: childId, value: String(sorted[i]), path: childPath,
        children: [], isLeaf: false, isPruned, isDirectPrune,
        parentId: parent.id, depth: parent.depth + 1,
      };
      parent.children.push(node);
      if (!isPruned) {
        dfs(i + 1, remaining - sorted[i], childPath, node);
      }
    }
  }

  dfs(0, target, [], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
function buildSteps(nums: number[], target: number): BacktrackTreeStep[] {
  const root = buildTree(nums, target);
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
    message: `开始：candidates=[${nums.sort((a,b)=>a-b).join(',')}]，target=${target}`,
    codeLine: 4,
    stats: { remaining: target, depth: 0, count: 0 },
  });

  function traverse(node: BacktrackTreeNode): void {
    if (node.isLeaf) {
      // 递归进入：先执行 if (sum == target) 判断 —— 成立
      const nodeSum = (node.path as number[]).reduce((a, b) => a + b, 0);
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path],
        message: `递归进入：sum = ${nodeSum} == target ✓ 满足条件`,
        codeLine: 10,
        stats: { remaining: 0, depth: node.depth, count: foundIds.length },
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
      });
      return;
    }

    // 递归进入非叶子：每次 backtrack 调用都先执行 if 判断 —— 不成立
    const nodeSum2 = (node.path as number[]).reduce((a, b) => a + b, 0);
    steps.push({
      nodes: allNodes, currentNodeId: node.id,
      visitedNodeIds: [...visitedIds],
      foundPathIds: [...foundIds],
      prunedNodeIds: [...prunedIds],
      path: [...node.path],
      message: `递归进入：sum = ${nodeSum2} ≠ target，继续搜索`,
      codeLine: 10,
      stats: { remaining: target - nodeSum2, depth: node.depth, count: foundIds.length },
    });

    for (const child of node.children) {
      if (child.isPruned) {
        if (child.isDirectPrune) {
          visitedIds.push(child.id);
          const nodeSum = (node.path as number[]).reduce((a, b) => a + b, 0);
          const idxInNode = node.children.findIndex(c => c.id === child.id);
          const isDup = idxInNode > 0 && node.children[idxInNode - 1].value === child.value;
          const msg = isDup
            ? `剪枝（同层去重）：数字 ${child.value} 已在同层前一分支尝试，跳过`
            : `剪枝（目标超出）：选 ${child.value} 后 (和=${nodeSum + Number(child.value)}) 超过 target (${target})（跳过，未下潜）`;
          steps.push({
            nodes: allNodes, currentNodeId: node.id,
            visitedNodeIds: [...visitedIds],
            foundPathIds: [...foundIds],
            prunedNodeIds: [...prunedIds],
            path: [...node.path],
            message: msg,
            codeLine: isDup ? 13 : 15,
            stats: { remaining: target - nodeSum, depth: node.depth, count: foundIds.length },
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
        message: `for 循环：i = ${child.value}，检查去重后尝试`,
        codeLine: 11,
        stats: { remaining: target - (node.path as number[]).reduce((a, b) => a + b, 0), depth: node.depth, count: foundIds.length },
      });

      // Step A: path.add(i)
      visitedIds.push(child.id);
      const remaining = target - (child.path as number[]).reduce((a, b) => a + b, 0);
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...child.path],
        message: `path.add(${child.value})：当前路径变为 [${child.path.join(', ')}]`,
        codeLine: 15,
        stats: { remaining, depth: child.depth, count: foundIds.length },
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
        stats: { remaining, depth: child.depth, count: foundIds.length },
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
        stats: { remaining: target - (node.path as number[]).reduce((a, b) => a + b, 0), depth: node.depth, count: foundIds.length },
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
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class CombinationSumIIVisualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLines = [
    'public List<List<Integer>> combinationSum2(int[] c, int target) {',
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
    '        // 同层去重：跳过重复元素',
    '        if (i > start && c[i] == c[i - 1]) continue;',
    '        if (sum + c[i] > target) break;',
    '        path.add(c[i]);',
    '        backtrack(c, i + 1, path, res, target, sum + c[i]);',
    '        path.remove(path.size() - 1);',
    '    }',
    '}',
  ];
  protected codePanelTitle = '组合总和 II Java 代码';

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
        const numsEl = this.root?.querySelector('#bt-nums') as HTMLInputElement | null;
        const targetEl = this.root?.querySelector('#bt-target') as HTMLInputElement | null;
        if (numsEl) numsEl.value = btn.dataset.nums || '';
        if (targetEl) targetEl.value = btn.dataset.target || '';
        this.start();
      });
    });

    // Clear log
    this.root.querySelector('#bt-log-clear')?.addEventListener('click', () => {
      if (this.logEl) this.logEl.innerHTML = '';
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const numsEl = this.root?.querySelector('#bt-nums') as HTMLInputElement | null;
    const targetEl = this.root?.querySelector('#bt-target') as HTMLInputElement | null;
    const nums = (numsEl?.value || '10,1,2,7,6,1,5').split(/[,，\s]+/).map(s => parseInt(s.trim(), 10)).filter(n => Number.isFinite(n));
    const target = parseInt(targetEl?.value || '8', 10);
    if (nums.length === 0) nums.push(10, 1, 2, 7, 6, 1, 5);
    return buildSteps(nums, Number.isFinite(target) ? target : 8);
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
    if (pathLenEl) pathLenEl.textContent = String(step.path.length);

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
  id: 'combination-sum-ii',
  name: '组合总和 II',
  viewId: 'algo-combination-sum-ii-view',
  category: 'backtracking',
  description: 'LeetCode 40 · 排序 + 同层去重，每个元素只用一次',
  icon: '\uD83C\uDFAF',
  template,
  Visualizer: CombinationSumIIVisualizer,
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握含重复元素组合去重的回溯方法与决策树结构',
});
