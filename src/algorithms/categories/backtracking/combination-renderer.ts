/**
 * 组合问题可视化器（回溯算法）- 回溯决策树版本
 * LeetCode 77：给定 n 和 k，返回 1...n 中所有可能的 k 个数的组合
 * 基础版：不剪枝，展示回溯搜索决策树的完整结构（剪枝优化见 combination-optimized）
 * 支持代码联动高亮演示，使用 SVG 回溯决策树展示递归结构
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
import template from './combination.html?raw';

/* ── Step ─────────────────────────────────────────────────── */
interface CombinationStep extends BacktrackTreeStep {
  startIndex: number;
  i?: number;
  n: number;
  k: number;
  action: 'push' | 'pop' | 'found' | 'start' | 'end' | 'iterate' | 'check';
}

/* ── Build the full decision tree ─────────────────────────── */
function buildTree(n: number, k: number): BacktrackTreeNode {
  const root: BacktrackTreeNode = {
    id: 'root', value: '', path: [], children: [],
    isLeaf: false, isPruned: false, parentId: null, depth: 0,
  };

  function dfs(start: number, path: number[], parent: BacktrackTreeNode): void {
    if (path.length === k) {
      parent.isLeaf = true;
      return;
    }
    for (let i = start; i <= n; i++) {
      const childPath = [...path, i];
      const childId = `${parent.id}-${i}`;

      const node: BacktrackTreeNode = {
        id: childId, value: String(i), path: childPath,
        children: [], isLeaf: false, isPruned: false,
        parentId: parent.id, depth: parent.depth + 1,
      };
      parent.children.push(node);
      dfs(i + 1, childPath, node);
    }
  }

  dfs(1, [], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
function combinationSteps(n: number, k: number): CombinationStep[] {
  const root = buildTree(n, k);
  layoutTree(root);
  const allNodes = flattenTree(root);
  const prunedIds = allNodes.filter(nd => nd.isPruned).map(nd => nd.id);

  const steps: CombinationStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];

  // Start step
  steps.push({
    nodes: allNodes, currentNodeId: 'root', visitedNodeIds: ['root'],
    foundPathIds: [], prunedNodeIds: [...prunedIds],
    path: [], startIndex: 1, n, k,
    action: 'start',
    message: `开始：从 1...${n} 中选择 ${k} 个数的组合`,
    codeLine: 3,
  });

  function traverse(node: BacktrackTreeNode): void {
    const nodeStart = node.id === 'root' ? 1 : Number(node.value) + 1;

    if (node.isLeaf) {
      // 递归进入：先执行 if (path.size() == k) 判断 —— 成立
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path], startIndex: nodeStart, n, k,
        action: 'check',
        message: `递归进入：path.size() == ${k} ✓ 满足终止条件`,
        codeLine: 9,
      });
      // 进入 if 块：收集结果并 return
      foundIds.push(node.id);
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path], startIndex: nodeStart, n, k,
        action: 'found',
        message: `找到组合：[${node.path.join(', ')}]，收集并返回`,
        codeLine: { from: 10, to: 11 },
      });
      return;
    }

    // 递归进入非叶子：每次 backtrack 调用都先执行 if 判断 —— 不成立
    steps.push({
      nodes: allNodes, currentNodeId: node.id,
      visitedNodeIds: [...visitedIds],
      foundPathIds: [...foundIds],
      prunedNodeIds: [...prunedIds],
      path: [...node.path], startIndex: nodeStart, n, k,
      action: 'check',
      message: `递归进入：path.size() = ${node.path.length} < ${k}，进入 for 循环`,
      codeLine: 9,
    });

    for (const child of node.children) {
      const childVal = parseInt(child.value, 10);

      // iterate: for 循环取到本次候选值 i，高亮循环头（行 13），
      // 让"走到下一个节点"时代码联动真实流动 13 -> 14 -> 15 -> 16
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path], startIndex: nodeStart, i: childVal, n, k,
        action: 'iterate',
        message: `for 循环：i = ${child.value}，尝试加入`,
        codeLine: 13,
      });

      // 1) path.add(i)：把 i 加进当前路径，start 尚未变更
      visitedIds.push(child.id);
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...child.path],
        startIndex: nodeStart, i: childVal, n, k,
        action: 'push',
        message: `path.add(${child.value})：当前路径变为 [${child.path.join(', ')}]`,
        codeLine: 14,
      });

      // 2) backtrack(i + 1, ...)：当前层 start 仍为 nodeStart，准备将 i + 1 = childStart 传给下一层
      const childStart = childVal + 1;
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...child.path],
        startIndex: nodeStart, i: childVal, n, k,
        action: 'push',
        message: `调用 backtrack(i + 1)：当前 i = ${childVal}，向下一层传入 start = ${childVal} + 1 = ${childStart}`,
        codeLine: 15,
      });

      traverse(child);

      // pop (backtrack)
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path], startIndex: nodeStart, i: childVal, n, k,
        action: 'pop',
        message: `撤销选择 ${child.value}，回溯到：[${node.path.join(', ')}]`,
        codeLine: 16,
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
    path: [], startIndex: n + 1, n, k,
    action: 'end',
    message: `完成！共找到 ${foundIds.length} 个组合`,
    codeLine: 4,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class CombinationVisualizer extends StepVisualizer<CombinationStep> {
  protected codeLines = [
    'public List<List<Integer>> combine(int n, int k) {',
    '    List<List<Integer>> result = new ArrayList<>();',
    '    backtrack(1, new ArrayList<>(), result, n, k);',
    '    return result;',
    '}',
    '',
    'void backtrack(int start, List<Integer> path,',
    '               List<List<Integer>> result, int n, int k) {',
    '    if (path.size() == k) {',
    '        result.add(new ArrayList<>(path));',
    '        return;',
    '    }',
    '    for (int i = start; i <= n; i++) {',
    '        path.add(i);',
    '        backtrack(i + 1, path, result, n, k);',
    '        path.remove(path.size() - 1);',
    '    }',
    '}',
  ];
  protected codePanelTitle = '组合问题 Java 代码';

  private inputN: HTMLInputElement | null = null;
  private inputK: HTMLInputElement | null = null;
  private treeDisplay: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputN = this.root.querySelector('#combination-n');
    this.inputK = this.root.querySelector('#combination-k');
    this.treeDisplay = this.root.querySelector('#combination-tree-display');
    this.bindPlaybackControls({ message: 'step-message' });
    this.root.querySelector('#combination-start')?.addEventListener('click', () => this.start());

    // Example chips
    this.root.querySelectorAll<HTMLButtonElement>('.cs-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const nVal = btn.dataset.n;
        const kVal = btn.dataset.k;
        if (nVal && this.inputN) this.inputN.value = nVal;
        if (kVal && this.inputK) this.inputK.value = kVal;
        this.start();
      });
    });

    // Clear log
    this.root.querySelector('#cs-log-clear')?.addEventListener('click', () => {
      const logEl = this.root?.querySelector('#cs-log');
      if (logEl) logEl.innerHTML = '';
    });
  }

  protected buildSteps(): CombinationStep[] {
    let n = parseInt(this.inputN?.value || '4', 10);
    let k = parseInt(this.inputK?.value || '2', 10);
    if (!Number.isFinite(n)) n = 4;
    if (!Number.isFinite(k)) k = 2;
    if (k <= 0) k = 1;
    if (n <= 0) n = 1;
    return combinationSteps(n, k);
  }

  protected renderStep(step: CombinationStep): void {
    // Real-time Variables Monitor
    const varIEI = this.root?.querySelector('#combination-var-i');
    if (varIEI) varIEI.textContent = step.i != null ? String(step.i) : '-';

    const startEl = this.root?.querySelector('#combination-start-index');
    if (startEl) startEl.textContent = String(step.startIndex);

    const pathVarEl = this.root?.querySelector('#combination-var-path');
    if (pathVarEl) pathVarEl.textContent = step.path.length > 0 ? `[${step.path.join(', ')}]` : '[]';

    const countEl = this.root?.querySelector('#combination-count');
    if (countEl) countEl.textContent = String(step.path.length);

    const totalEl = this.root?.querySelector('#combination-total');
    if (totalEl) totalEl.textContent = String(step.foundPathIds.length);

    // Tree (复用共享 helper)
    if (this.treeDisplay) {
      renderBacktrackTree({
        container: this.treeDisplay,
        step,
        cssPrefix: 'cs',
      });
    }

    // Log (复用共享 helper)
    const logEl = this.root?.querySelector<HTMLElement>('#cs-log') || null;
    renderBacktrackLog(logEl, this.steps, this.currentIndex, 'cs');
  }
}

registerAlgorithm({
  id: 'combination',
  name: '组合问题（回溯）',
  viewId: 'algo-combination-view',
  category: 'backtracking',
  description: '使用回溯算法生成所有组合',
  icon: '\uD83C\uDFAF',
  template,
  Visualizer: CombinationVisualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握回溯法的基础框架：选择、递归、撤销，理解决策树结构',
});
