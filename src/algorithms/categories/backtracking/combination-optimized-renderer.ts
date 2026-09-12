/**
 * 组合（优化）可视化器（回溯）- 100% 对齐 DP 标准模板版本
 * LeetCode 77：从 1..n 中选 k 个数的所有组合
 * 支持阶段演化：阶段 1 (完整决策树) vs 阶段 2 (剪枝优化决策树)
 * 布局：
 *   左侧：Card 1 (N-ary 决策树 SVG) + Scrubber 播放条 + Card 2 (状态空间：路径栈、剪枝监视器、解集箱)
 *   右侧：Card 3 (暗色代码终端：多语言、Tab切换、字号控制) + Card 4 (执行日志流)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepVisualizer } from '../../../core/step-visualizer';
import type { HighlightTarget } from '../../../core/code-panel';
import { registerAlgorithm } from '../../../core/registry';
import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
  renderBacktrackTree,
  resetContainerViewState,
} from './backtracking-tree-helper';
import { buildCombinationTree, combinationSteps } from './combination-renderer';
import {
  COMBINATION_PROBLEM_HTML,
  COMBINATION_ANALYSIS_HTML,
} from './combination-problem-content';

function clampInt(val: string | number, def: number, min: number, max: number): number {
  const n = typeof val === 'number' ? val : parseInt(val, 10);
  if (isNaN(n)) return def;
  return Math.max(min, Math.min(max, n));
}

/* ── Build the pruned decision tree ─────────────────────────── */
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

  const steps: BacktrackTreeStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];
  const dynamicPrunedIds: string[] = [];

  const makeVars = (currentPathLen: number) => {
    const need = Math.max(0, k - currentPathLen);
    const upper = n - need + 1;
    return [
      { name: 'n', value: String(n), type: 'number' as const },
      { name: 'k', value: String(k), type: 'number' as const },
      { name: 'path.size()', value: String(currentPathLen), type: 'number' as const },
      { name: '需补元素', value: String(need), type: 'number' as const },
      { name: '遍历上界', value: String(upper), type: 'number' as const },
    ];
  };

  steps.push({
    nodes: allNodes, currentNodeId: 'root', visitedNodeIds: ['root'],
    foundPathIds: [], prunedNodeIds: [],
    path: [],
    message: `开始：从 1..${n} 中选 ${k} 个数，剪枝上界 i <= ${n - k + 1}（首层）`,
    codeLine: 3,
    stats: { depth: 0, count: 0, need: k, remain: 0 },
    vars: makeVars(0),
  });

  function traverse(node: BacktrackTreeNode): void {
    if (node.isLeaf) {
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `递归进入：path.size() == ${k} ✓ 满足终止条件`,
        codeLine: 9,
        stats: { depth: node.depth, count: foundIds.length, need: 0, remain: node.path.length },
        vars: makeVars(node.path.length),
      });
      foundIds.push(node.id);
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `找到组合：[${node.path.join(', ')}]，收集并返回`,
        codeLine: { from: 10, to: 11 },
        stats: { depth: node.depth, count: foundIds.length, need: 0, remain: node.path.length },
        vars: makeVars(node.path.length),
      });
      return;
    }

    steps.push({
      nodes: allNodes, currentNodeId: node.id,
      visitedNodeIds: [...visitedIds],
      foundPathIds: [...foundIds],
      prunedNodeIds: [...dynamicPrunedIds],
      path: [...node.path],
      message: `递归进入：path.size() = ${node.path.length} < ${k}，进入 for 循环`,
      codeLine: 9,
      stats: { depth: node.depth, count: foundIds.length, need: k - node.path.length, remain: node.path.length },
      vars: makeVars(node.path.length),
    });

    for (const child of node.children) {
      if (child.isPruned) {
        if (child.isDirectPrune) {
          const upper = n - (k - node.path.length) + 1;
          if (!dynamicPrunedIds.includes(child.id)) {
            dynamicPrunedIds.push(child.id);
          }
          steps.push({
            nodes: allNodes, currentNodeId: node.id,
            visitedNodeIds: [...visitedIds],
            foundPathIds: [...foundIds],
            prunedNodeIds: [...dynamicPrunedIds],
            path: [...node.path],
            message: `剪枝：i = ${child.value} > ${upper}（剩余元素不够凑满 ${k} 个），截断循环`,
            codeLine: 13,
            stats: { depth: node.depth, count: foundIds.length, need: k - node.path.length, remain: node.path.length },
            vars: makeVars(node.path.length),
          });
        }
        continue;
      }

      visitedIds.push(child.id);

      // Push path
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `处理节点：path.add(${child.value}) → [${child.path.join(', ')}]`,
        codeLine: 14,
        stats: { depth: child.depth, count: foundIds.length, need: k - child.path.length, remain: child.path.length },
        vars: makeVars(child.path.length),
      });

      // Recurse
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `向下递归：backtrack(${Number(child.value) + 1}, path)`,
        codeLine: 15,
        stats: { depth: child.depth, count: foundIds.length, need: k - child.path.length, remain: child.path.length },
        vars: makeVars(child.path.length),
      });

      traverse(child);

      // Backtrack
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `回溯撤销：path.remove()，弹出 ${child.value}，恢复路径为 [${node.path.join(', ')}]`,
        codeLine: 16,
        stats: { depth: node.depth, count: foundIds.length, need: k - node.path.length, remain: node.path.length },
        vars: makeVars(node.path.length),
      });
    }
  }

  traverse(root);

  steps.push({
    nodes: allNodes, currentNodeId: 'root',
    visitedNodeIds: [...visitedIds],
    foundPathIds: [...foundIds],
    prunedNodeIds: [...dynamicPrunedIds],
    path: [],
    message: `搜索完成：共找到 ${foundIds.length} 个合法组合（剪枝减少了无效递归分支）`,
    codeLine: 4,
    stats: { depth: 0, count: foundIds.length, need: 0, remain: 0 },
    vars: makeVars(0),
  });

  return steps;
}


/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: BacktrackTreeStep[], k: number): BacktrackTreeStep[] {
  return steps.map((s) => ({
    ...s,
    log: s.message,
    metrics: {
      path: (s.path || []).length ? `[${(s.path || []).join(' → ')}]` : '[]',
      'path-len': `${(s.path || []).length} / ${k}`,
      visited: String(s.visitedNodeIds.length),
      results: String(s.foundPathIds.length),
      pruned: String(s.prunedNodeIds.length),
    },
  }));
}

/** 主视觉：SVG 决策树沙盘（backtracking-tree-helper 自注入样式，default nodeLabel） */
export function renderCombinationOptimizedCanvas(container: HTMLElement, step: BacktrackTreeStep): void {
  renderBacktrackTree({
    container,
    step,
    cssPrefix: 'co',
  });
}

registerDeclarativeAlgorithm({
  id: 'combination-optimized',
  name: '组合（优化）',
  category: 'backtracking',
  description: '剪枝优化：i <= n - (k - path.length) + 1',
  icon: '✂️',
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '学会用剪枝优化回溯搜索',
  modes: [
    { id: 'naive', label: '阶段 1 · 完整决策树' },
    { id: 'optimized', label: '阶段 2 · 剪枝优化决策树' },
  ],
  inputs: [
    { id: 'n', label: '范围 1..n', type: 'number', defaultValue: '4' },
    { id: 'k', label: '选取个数 k', type: 'number', defaultValue: '2' },
  ],
  presets: [
    { label: 'n=4, k=2', values: { n: '4', k: '2' } },
    { label: 'n=5, k=3', values: { n: '5', k: '3' } },
    { label: 'n=9, k=2', values: { n: '9', k: '2' } },
  ],
  metrics: [
    { id: 'path', label: '当前路径', color: '#2563eb' },
    { id: 'path-len', label: '路径长度 / k', color: '#a855f7' },
    { id: 'visited', label: '已访问节点', color: '#0f172a' },
    { id: 'results', label: '已收集组合', color: '#10b981' },
    { id: 'pruned', label: '剪枝次数', color: '#ef4444' },
  ],
  legend: [
    { label: '当前节点', color: '#2563eb' },
    { label: '收集方案', color: '#10b981' },
    { label: '剪枝', color: '#ef4444' },
  ],
  problemHtml: COMBINATION_PROBLEM_HTML,
  analysisHtml: COMBINATION_ANALYSIS_HTML,
  generateSteps: (inputs, mode) => {
    let n = parseInt(String(inputs.n ?? '4'), 10);
    let k = parseInt(String(inputs.k ?? '2'), 10);
    if (!Number.isFinite(n)) n = 4;
    if (!Number.isFinite(k)) k = 2;
    n = Math.max(1, Math.min(9, n));
    k = Math.max(1, Math.min(9, k));
    const steps = mode === 'optimized' ? buildOptimizedSteps(n, k) : combinationSteps(n, k);
    return withMetrics(steps, k);
  },
  renderCanvas: (container, step) => renderCombinationOptimizedCanvas(container, step as BacktrackTreeStep),
});
