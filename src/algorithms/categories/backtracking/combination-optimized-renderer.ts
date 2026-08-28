/**
 * 组合（优化）可视化器（回溯）- 回溯决策树版本
 * LeetCode 77：从 1..n 中选 k 个数的所有组合
 * 剪枝优化：i <= n - (k - path.length) + 1，剩余数量不足时直接 break
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
import template from './combination-optimized.html?raw';

/* ── Build the full decision tree ─────────────────────────── */
export function buildOptimizedTree(n: number, k: number): BacktrackTreeNode {
  const root: BacktrackTreeNode = {
    id: 'root', value: '', path: [], children: [],
    isLeaf: false, isPruned: false, parentId: null, depth: 0,
  };

  function dfs(start: number, path: number[], parent: BacktrackTreeNode): void {
    if (path.length === k) {
      if (!parent.isPruned) {
        parent.isLeaf = true;
      }
      return;
    }
    // Upper bound: remaining candidates must be enough to fill k slots.
    const upper = n - (k - path.length) + 1;
    for (let i = start; i <= n; i++) {
      const childPath = [...path, i];
      const childId = `${parent.id}-${i}`;
      const isDirectPrune = !parent.isPruned && (i > upper);
      const isPruned = parent.isPruned || isDirectPrune;

      const node: BacktrackTreeNode = {
        id: childId, value: String(i), path: childPath,
        children: [], isLeaf: false, isPruned, isDirectPrune,
        parentId: parent.id, depth: parent.depth + 1,
      };
      parent.children.push(node);
      if (!isPruned) {
        dfs(i + 1, childPath, node);
      }
    }
  }

  dfs(1, [], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
export function buildOptimizedSteps(n: number, k: number): BacktrackTreeStep[] {
  const root = buildOptimizedTree(n, k);
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
    message: `开始：从 1..${n} 中选 ${k} 个数，剪枝上界 i <= ${n - k + 1}（首层）`,
    codeLine: 3,
    stats: { depth: 0, count: 0, need: k, remain: 0 },
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
        stats: { depth: node.depth, count: foundIds.length, need: 0, remain: node.path.length },
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
        stats: { depth: node.depth, count: foundIds.length, need: 0, remain: node.path.length },
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
      stats: { depth: node.depth, count: foundIds.length, need: k - node.path.length, remain: node.path.length },
    });

    for (const child of node.children) {
      if (child.isPruned) {
        if (child.isDirectPrune) {
          visitedIds.push(child.id);
          const need = k - node.path.length;
          const available = n - Number(child.value) + 1;
          const upper = n - need + 1;
          steps.push({
            nodes: allNodes, currentNodeId: node.id,
            visitedNodeIds: [...visitedIds],
            foundPathIds: [...foundIds],
            prunedNodeIds: [...prunedIds],
            path: [...node.path],
            message: `剪枝（上界限制）：候选 i = ${child.value} 超出剪枝上界 (${upper})，仅剩 ${available} 个候选，还需 ${need} 个（跳过，未下潜）`,
            codeLine: 14,
            stats: { depth: node.depth, count: foundIds.length, need, remain: node.path.length },
          });
        }
        continue;
      }

      // iterate: for 循环取到候选值 i，高亮循环头（含剪枝上界）
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path],
        message: `for 循环：i = ${child.value}，检查剪枝上界后尝试`,
        codeLine: 14,
        stats: { depth: node.depth, count: foundIds.length, need: k - node.path.length, remain: node.path.length },
      });

      // Step A: path.add(i)
      visitedIds.push(child.id);
      const need = k - child.path.length;
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...child.path],
        message: `path.add(${child.value})：当前路径变为 [${child.path.join(', ')}]`,
        codeLine: 15,
        stats: { depth: child.depth, count: foundIds.length, need, remain: child.path.length },
      });
      // Step B: backtrack(i + 1, ...)
      const childStart = parseInt(child.value, 10) + 1;
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...child.path],
        message: `backtrack(${childStart}, ...)：start = i + 1，递归深入`,
        codeLine: 16,
        stats: { depth: child.depth, count: foundIds.length, need, remain: child.path.length },
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
        codeLine: 17,
        stats: { depth: node.depth, count: foundIds.length, need: k - node.path.length, remain: node.path.length },
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
    message: `完成！共找到 ${foundIds.length} 个组合`,
    codeLine: 4,
    stats: { depth: 0, count: foundIds.length, need: 0, remain: 0 },
  });

  return steps;
}

function clampInt(raw: string, def: number, lo: number, hi: number): number {
  const v = parseInt(raw, 10);
  if (!Number.isFinite(v)) return def;
  return Math.max(lo, Math.min(hi, v));
}

/* ── Visualizer class ─────────────────────────────────────── */
export class CombinationOptimizedVisualizer extends StepVisualizer<BacktrackTreeStep> {
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
    '    // 剪枝：i <= n - (k - path.size()) + 1',
    '    for (int i = start; i <= n - (k - path.size()) + 1; i++) {',
    '        path.add(i);',
    '        backtrack(i + 1, path, res, n, k);',
    '        path.remove(path.size() - 1);',
    '    }',
    '}',
  ];
  protected codePanelTitle = '组合（优化）Java 代码';

  private treeDisplay: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#combination-optimized-tree-display');
    this.logEl = this.root.querySelector('#co-log');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#co-start')?.addEventListener('click', () => this.start());

    // Example chips
    this.root.querySelectorAll<HTMLButtonElement>('.co-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const nEl = this.root?.querySelector('#co-n') as HTMLInputElement | null;
        const kEl = this.root?.querySelector('#co-k') as HTMLInputElement | null;
        if (nEl) nEl.value = btn.dataset.n || '';
        if (kEl) kEl.value = btn.dataset.k || '';
        this.start();
      });
    });

    // Clear log
    this.root.querySelector('#co-log-clear')?.addEventListener('click', () => {
      if (this.logEl) this.logEl.innerHTML = '';
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const nEl = this.root?.querySelector('#co-n') as HTMLInputElement | null;
    const kEl = this.root?.querySelector('#co-k') as HTMLInputElement | null;
    const n = clampInt(nEl?.value || '5', 5, 1, 9);
    const k = clampInt(kEl?.value || '3', 3, 1, 9);
    return buildOptimizedSteps(n, k);
  }

  protected renderStep(step: BacktrackTreeStep): void {
    // Stats
    const depthEl = this.root?.querySelector('#co-depth');
    if (depthEl) depthEl.textContent = String(step.stats?.depth ?? 0);
    const countEl = this.root?.querySelector('#co-count');
    if (countEl) countEl.textContent = String(step.stats?.count ?? 0);
    const remainEl = this.root?.querySelector('#co-remain');
    if (remainEl) remainEl.textContent = String(step.path.length);
    const needEl = this.root?.querySelector('#co-need');
    if (needEl) needEl.textContent = String(step.stats?.need ?? 0);

    // Tree
    if (this.treeDisplay) {
      renderBacktrackTree({
        container: this.treeDisplay,
        step,
        cssPrefix: 'co',
      });
    }

    // Log
    renderBacktrackLog(this.logEl, this.steps, this.currentIndex, 'co');
  }

  public reset(): void {
    super.reset();
    if (this.treeDisplay) this.treeDisplay.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'combination-optimized',
  name: '组合（优化）',
  viewId: 'algo-combination-optimized-view',
  category: 'backtracking',
  description: '剪枝优化：i <= n - (k - path.length) + 1',
  icon: '✂️',
  template,
  Visualizer: CombinationOptimizedVisualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '学会用剪枝优化回溯搜索',
});
