/**
 * 组合总和 II 可视化器（回溯决策树版本）— 4-Card 标准现代架构
 * LeetCode 40：每个元素只能用一次，排序后同层去重与剪枝
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
  renderBacktrackTree,
  resetContainerViewState,
} from './backtracking-tree-helper';
import {
  COMBINATION_SUM_II_PROBLEM_HTML,
  COMBINATION_SUM_II_ANALYSIS_HTML,
  COMBINATION_SUM_II_CODE_LANGUAGES,
} from './combination-sum-ii-problem-content';

/* ── Build the full decision tree ─────────────────────────── */
export function buildCombinationSum2Tree(nums: number[], target: number): BacktrackTreeNode {
  const sorted = [...nums].sort((a, b) => a - b);
  let nodeIdCounter = 0;
  const root: BacktrackTreeNode = {
    id: 'root',
    value: '[]',
    path: [],
    children: [],
    isLeaf: false,
    isPruned: false,
    parentId: null,
    depth: 0,
  };

  function dfs(start: number, remaining: number, path: number[], parent: BacktrackTreeNode): void {
    if (remaining === 0) {
      if (!parent.isPruned) parent.isLeaf = true;
      return;
    }
    for (let i = start; i < sorted.length; i++) {
      nodeIdCounter++;
      const candidate = sorted[i];
      const childPath = [...path, candidate];
      const childId = `${parent.id}-${candidate}-${nodeIdCounter}`;

      const isDup = i > start && sorted[i] === sorted[i - 1];
      const isExceed = sorted[i] > remaining;
      const isDirectPrune = !parent.isPruned && (isDup || isExceed);
      const isPruned = parent.isPruned || isDirectPrune;

      const node: BacktrackTreeNode = {
        id: childId,
        value: String(candidate),
        path: childPath,
        children: [],
        isLeaf: false,
        isPruned,
        isDirectPrune,
        parentId: parent.id,
        depth: parent.depth + 1,
      };
      parent.children.push(node);
      if (!isPruned) {
        dfs(i + 1, remaining - candidate, childPath, node);
      }
    }
  }

  dfs(0, target, [], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
export function buildCombinationSum2Steps(nums: number[], target: number): BacktrackTreeStep[] {
  const sorted = [...nums].sort((a, b) => a - b);
  const root = buildCombinationSum2Tree(sorted, target);
  layoutTree(root);
  const allNodes = flattenTree(root);

  const steps: BacktrackTreeStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];
  const dynamicPrunedIds: string[] = [];
  const solutions: number[][] = [];

  // Start step
  steps.push({
    nodes: allNodes,
    currentNodeId: 'root',
    visitedNodeIds: ['root'],
    foundPathIds: [],
    prunedNodeIds: [],
    path: [],
    message: `开始搜索：candidates=[${sorted.join(', ')}]，target=${target}，元素不可复用且同层去重`,
    codeLine: 4,
    stats: { remaining: target, depth: 0, count: 0 },
    vars: [
      { name: 'candidates', value: `[${sorted.join(', ')}]`, type: 'array' },
      { name: 'target', value: String(target), type: 'number' },
      { name: 'sum', value: '0', type: 'number' },
      { name: 'path', value: '[]', type: 'array' },
      { name: 'res.size()', value: '0', type: 'number' },
    ],
  });

  function traverse(node: BacktrackTreeNode, start: number): void {
    const nodeSum = (node.path as number[]).reduce((a, b) => a + b, 0);

    if (node.isLeaf) {
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `递归进入：sum = ${nodeSum} == target (${target}) ✓ 满足终止条件`,
        codeLine: 10,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'sum', value: String(nodeSum), type: 'number' },
          { name: 'target', value: String(target), type: 'number' },
          { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
          { name: 'res.size()', value: String(solutions.length), type: 'number' },
        ],
      });

      foundIds.push(node.id);
      solutions.push([...(node.path as number[])]);

      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🎉 找到合法唯一组合：[${node.path.join(', ')}]，收集并返回`,
        codeLine: 11,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'res.add()', value: `[${node.path.join(', ')}]`, type: 'array' },
          { name: 'res.size()', value: String(solutions.length), type: 'number' },
        ],
      });
      return;
    }

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const childVal = parseInt(child.value, 10);
      const childSum = nodeSum + childVal;
      const actualIndex = start + i;

      // 1. 剪枝超额
      if (childSum > target) {
        if (!dynamicPrunedIds.includes(child.id)) dynamicPrunedIds.push(child.id);
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `✂️ 剪枝：sum(${nodeSum}) + ${childVal} = ${childSum} > target(${target})，break 终止本层`,
          codeLine: 15,
          stats: { remaining: target - nodeSum, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'sum + c[i]', value: `${childSum} > ${target}`, type: 'boolean' },
            { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
          ],
        });
        continue;
      }

      // 2. 树层去重判定
      const isDup = i > 0 && childVal === parseInt(node.children[i - 1].value, 10);
      if (isDup) {
        if (!dynamicPrunedIds.includes(child.id)) dynamicPrunedIds.push(child.id);
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `✂️ 树层去重：i > startIndex 且 c[i]==c[i-1] (${childVal}==${childVal})，continue 跳过重复分支`,
          codeLine: 17,
          stats: { remaining: target - nodeSum, depth: node.depth, count: solutions.length },
          vars: [
            { name: '同层去重', value: `c[${actualIndex}]==c[${actualIndex-1}]`, type: 'boolean' },
            { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
          ],
        });
        continue;
      }

      // 3. 做选择
      visitedIds.push(child.id);
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `做选择：path.add(${childVal})，当前路径：[${child.path.join(', ')}]，sum = ${childSum}`,
        codeLine: 18,
        stats: { remaining: target - childSum, depth: child.depth, count: solutions.length },
        vars: [
          { name: 'c[i]', value: String(childVal), type: 'number' },
          { name: 'sum', value: String(childSum), type: 'number' },
          { name: 'path', value: `[${child.path.join(', ')}]`, type: 'array' },
        ],
      });

      // 4. 递归深入：i + 1
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `向下递归：backtrack(target, sum=${childSum}, startIndex=${actualIndex + 1})`,
        codeLine: 19,
        stats: { remaining: target - childSum, depth: child.depth, count: solutions.length },
        vars: [
          { name: 'startIndex', value: String(actualIndex + 1), type: 'number' },
          { name: 'sum', value: String(childSum), type: 'number' },
        ],
      });

      traverse(child, actualIndex + 1);

      // 5. 回溯撤销
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🔙 回溯撤销：path.remove(${childVal})，恢复路径至：[${node.path.join(', ') || '空'}]`,
        codeLine: 20,
        stats: { remaining: target - nodeSum, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'path.remove()', value: String(childVal), type: 'number' },
          { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
          { name: 'sum', value: String(nodeSum), type: 'number' },
        ],
      });
    }
  }

  traverse(root, 0);

  // End step
  steps.push({
    nodes: allNodes,
    currentNodeId: 'root',
    visitedNodeIds: [...visitedIds],
    foundPathIds: [...foundIds],
    prunedNodeIds: [...dynamicPrunedIds],
    path: [],
    message: `🎉 搜索完成！共找到 ${solutions.length} 个不重复组合`,
    codeLine: 5,
    stats: { remaining: target, depth: 0, count: solutions.length },
    vars: [
      { name: 'target', value: String(target), type: 'number' },
      { name: 'res.size()', value: String(solutions.length), type: 'number' },
    ],
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */


/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: BacktrackTreeStep[]): BacktrackTreeStep[] {
  return steps.map((s) => ({
    ...s,
    log: s.message,
    metrics: {
      path: (s.path || []).length ? `[${(s.path || []).join(' → ')}]` : '[]',
      visited: String(s.visitedNodeIds.length),
      results: String(s.foundPathIds.length),
      pruned: String(s.prunedNodeIds.length),
    },
  }));
}

/** 主视觉：SVG 决策树沙盘（backtracking-tree-helper 自注入样式） */
export function renderCombinationSumIiCanvas(container: HTMLElement, step: BacktrackTreeStep): void {
  renderBacktrackTree({
    container,
    step,
    cssPrefix: 'cs2',
    nodeLabel: (nd) => (nd.id === 'root' ? '[]' : nd.value),
  });
}

registerDeclarativeAlgorithm({
  id: 'combination-sum-ii',
  name: '组合总和 II',
  category: 'backtracking',
  description: '含重复元素，每个元素限用一次，同层去重',
  icon: '🎯',
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '掌握经典树层去重 (i > startIndex && c[i]==c[i-1]) 机制',
  inputs: [
    { id: 'candidates', label: '候选数组（可含重复）', type: 'text', defaultValue: '10,1,2,7,6,1,5' },
    { id: 'target', label: '目标和 target', type: 'number', defaultValue: '8' },
  ],
  presets: [
    { label: '示例 1', values: { 'candidates': '10,1,2,7,6,1,5', 'target': '8' } },
    { label: '示例 2', values: { 'candidates': '2,5,2,1,2', 'target': '5' } },
    { label: '示例 3', values: { 'candidates': '1,1,2,2', 'target': '4' } },
  ],
  metrics: [
    { id: 'path', label: '当前路径', color: '#2563eb' },
    { id: 'visited', label: '已访问节点', color: '#a855f7' },
    { id: 'results', label: '已收集方案', color: '#10b981' },
    { id: 'pruned', label: '剪枝次数', color: '#ef4444' },
  ],
  legend: [
    { label: '当前节点', color: '#2563eb' },
    { label: '已访问', color: '#a855f7' },
    { label: '收集方案', color: '#10b981' },
    { label: '剪枝', color: '#ef4444' },
  ],
  codeLanguages: COMBINATION_SUM_II_CODE_LANGUAGES,
  problemHtml: COMBINATION_SUM_II_PROBLEM_HTML,
  analysisHtml: COMBINATION_SUM_II_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const cands = parseNumberList(inputs.candidates, '10,1,2,7,6,1,5');
    let target = parseInt(String(inputs.target ?? '8'), 10);
    if (!Number.isFinite(target)) target = 8;
    return withMetrics(buildCombinationSum2Steps(cands.length ? cands : [10, 1, 2, 7, 6, 1, 5], target));
  },
  renderCanvas: (container, step) => renderCombinationSumIiCanvas(container, step as BacktrackTreeStep),
});
