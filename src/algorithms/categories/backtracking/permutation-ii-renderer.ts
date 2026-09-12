/**
 * 全排列 II 可视化器（回溯算法）— 4-Card 标准现代架构
 * LeetCode 47：输入含重复数字，排序 + used 数组 + 同层去重
 * 核心：树枝去重 (used[i]) + 树层去重 (nums[i] == nums[i-1] && !used[i-1])
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
  renderBacktrackTree,
  resetContainerViewState,
} from './backtracking-tree-helper';
import {
  PERMUTATION_II_PROBLEM_HTML,
  PERMUTATION_II_ANALYSIS_HTML,
  PERMUTATION_II_CODE_LANGUAGES,
} from './permutation-ii-problem-content';

/* ── Build the full decision tree ─────────────────────────── */
export function buildPerm2Tree(sorted: number[]): BacktrackTreeNode {
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
  const n = sorted.length;
  const used = new Array(n).fill(false);

  function dfs(path: number[], parent: BacktrackTreeNode): void {
    if (path.length === n) {
      parent.isLeaf = true;
      return;
    }
    for (let i = 0; i < n; i++) {
      nodeIdCounter++;
      const candidate = sorted[i];
      const childPath = [...path, candidate];
      const childId = `${parent.id}-${candidate}-${nodeIdCounter}`;

      // 1. 树枝去重：used[i] == true（当前路径已选该位置元素）
      if (used[i]) {
        continue; // 树枝已占用的不再生成分支，保持树清晰
      }

      // 2. 树层去重：同层遇到重复元素且前一个已回溯完成 (!used[i-1])
      const isDedupPrune = i > 0 && sorted[i] === sorted[i - 1] && !used[i - 1];

      const node: BacktrackTreeNode = {
        id: childId,
        value: String(candidate),
        path: childPath,
        children: [],
        isLeaf: !isDedupPrune && childPath.length === n,
        isPruned: isDedupPrune,
        isDirectPrune: isDedupPrune,
        parentId: parent.id,
        depth: parent.depth + 1,
      };
      parent.children.push(node);

      if (!isDedupPrune) {
        used[i] = true;
        dfs(childPath, node);
        used[i] = false;
      }
    }
  }

  dfs([], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
export function buildPerm2Steps(nums: number[]): BacktrackTreeStep[] {
  const sorted = [...nums].sort((a, b) => a - b);
  const n = sorted.length;
  const root = buildPerm2Tree(sorted);
  layoutTree(root);
  const allNodes = flattenTree(root);

  const steps: BacktrackTreeStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];
  const dynamicPrunedIds: string[] = [];
  const solutions: number[][] = [];
  const used = new Array(n).fill(false);

  // Start step
  steps.push({
    nodes: allNodes,
    currentNodeId: 'root',
    visitedNodeIds: ['root'],
    foundPathIds: [],
    prunedNodeIds: [],
    path: [],
    message: `开始搜索：已排序 nums = [${sorted.join(', ')}]，树枝去重 (used[i]) + 树层去重 (!used[i-1])`,
    codeLine: 4,
    stats: { remaining: n, depth: 0, count: 0 },
    vars: [
      { name: 'nums', value: `[${sorted.join(', ')}]`, type: 'array' },
      { name: 'used', value: `[${used.map((u) => (u ? 'T' : 'F')).join(', ')}]`, type: 'array' },
      { name: 'path', value: '[]', type: 'array' },
      { name: 'res.size()', value: '0', type: 'number' },
    ],
  });

  function traverse(node: BacktrackTreeNode): void {
    if (node.path.length === n) {
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `递归进入：path.size() == ${n} ✓ 找到唯一排列 [${node.path.join(', ')}]`,
        codeLine: 9,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'path.size()', value: String(n), type: 'number' },
          { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
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
        message: `🎉 收集唯一排列：[${node.path.join(', ')}]，收集并返回`,
        codeLine: 10,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'res.add()', value: `[${node.path.join(', ')}]`, type: 'array' },
          { name: 'res.size()', value: String(solutions.length), type: 'number' },
        ],
      });
      return;
    }

    for (let i = 0; i < n; i++) {
      const candidate = sorted[i];

      // 1. 树枝去重
      if (used[i]) {
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `树枝跳过：used[${i}] 为 true（当前排列已占用元素 ${candidate}），continue`,
          codeLine: 14,
          stats: { remaining: n - node.path.length, depth: node.depth, count: solutions.length },
          vars: [
            { name: `used[${i}]`, value: 'true', type: 'boolean' },
          ],
        });
        continue;
      }

      // 2. 树层去重
      if (i > 0 && sorted[i] === sorted[i - 1] && !used[i - 1]) {
        const prunedChild = node.children.find((c) => parseInt(c.value, 10) === candidate && c.isPruned);
        if (prunedChild && !dynamicPrunedIds.includes(prunedChild.id)) {
          dynamicPrunedIds.push(prunedChild.id);
        }

        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `✂️ 树层去重：nums[${i}] == nums[${i - 1}] (${candidate} == ${sorted[i - 1]}) 且 used[${i - 1}] == false，说明同层已处理过该值，剪枝跳过`,
          codeLine: 16,
          stats: { remaining: n - node.path.length, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'nums[i]==nums[i-1]', value: 'true', type: 'boolean' },
            { name: `!used[${i - 1}]`, value: 'true', type: 'boolean' },
          ],
        });
        continue;
      }

      const childNode = node.children.find((c) => parseInt(c.value, 10) === candidate && !c.isPruned);
      if (!childNode) continue;

      // 3. 做选择
      used[i] = true;
      visitedIds.push(childNode.id);
      steps.push({
        nodes: allNodes,
        currentNodeId: childNode.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...childNode.path],
        message: `做选择：used[${i}]=true, path.add(${candidate})，当前排列: [${childNode.path.join(', ')}]`,
        codeLine: 18,
        stats: { remaining: n - childNode.path.length, depth: childNode.depth, count: solutions.length },
        vars: [
          { name: `used[${i}]`, value: 'true', type: 'boolean' },
          { name: 'path', value: `[${childNode.path.join(', ')}]`, type: 'array' },
        ],
      });

      // 4. 向下递归
      steps.push({
        nodes: allNodes,
        currentNodeId: childNode.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...childNode.path],
        message: `向下递归：backtrack(nums, used, path, res)`,
        codeLine: 19,
        stats: { remaining: n - childNode.path.length, depth: childNode.depth, count: solutions.length },
        vars: [
          { name: 'used', value: `[${used.map((u) => (u ? 'T' : 'F')).join(', ')}]`, type: 'array' },
        ],
      });

      traverse(childNode);

      // 5. 回溯撤销
      used[i] = false;
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🔙 回溯撤销：path.remove(${candidate}), used[${i}]=false，恢复排列: [${node.path.join(', ') || '空'}]`,
        codeLine: 21,
        stats: { remaining: n - node.path.length, depth: node.depth, count: solutions.length },
        vars: [
          { name: `used[${i}]`, value: 'false', type: 'boolean' },
          { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
        ],
      });
    }
  }

  traverse(root);

  // End step
  steps.push({
    nodes: allNodes,
    currentNodeId: 'root',
    visitedNodeIds: [...visitedIds],
    foundPathIds: [...foundIds],
    prunedNodeIds: [...dynamicPrunedIds],
    path: [],
    message: `🎉 搜索完成！共找到 ${solutions.length} 个不重复全排列`,
    codeLine: 5,
    stats: { remaining: 0, depth: 0, count: solutions.length },
    vars: [
      { name: 'nums', value: `[${sorted.join(', ')}]`, type: 'array' },
      { name: 'res.size()', value: String(solutions.length), type: 'number' },
    ],
  });

  return steps;
}


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
export function renderPermutationIICanvas(container: HTMLElement, step: BacktrackTreeStep): void {
  renderBacktrackTree({
    container,
    step,
    cssPrefix: 'pm2',
    nodeLabel: (nd) => (nd.id === 'root' ? '[]' : nd.value),
  });
}

registerDeclarativeAlgorithm({
  id: 'permutation-ii',
  name: '全排列 II',
  category: 'backtracking',
  description: '含重复元素全排列，树层去重 (!used[i-1]) 与树枝标记',
  icon: '🔀',
  difficulty: 2,
  levelOrder: 13,
  learningGoal: '掌握含重复元素排列中的树层去重 (!used[i-1]) 与树枝占用的本质区别',
  inputs: [
    {
      id: 'nums',
      label: '输入数组（含重复）',
      type: 'text',
      defaultValue: '1,1,2',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '1,1,2', values: { nums: '1,1,2' } },
    { label: '1,2,2', values: { nums: '1,2,2' } },
    { label: '1,1,2,2', values: { nums: '1,1,2,2' } },
  ],
  metrics: [
    { id: 'path', label: '当前路径', color: '#2563eb' },
    { id: 'visited', label: '已访问节点', color: '#a855f7' },
    { id: 'results', label: '已收集排列', color: '#10b981' },
    { id: 'pruned', label: '去重剪枝次数', color: '#ef4444' },
  ],
  legend: [
    { label: '当前节点', color: '#2563eb' },
    { label: '已访问', color: '#a855f7' },
    { label: '收集方案', color: '#10b981' },
    { label: '树层去重剪枝', color: '#ef4444' },
  ],
  codeLanguages: PERMUTATION_II_CODE_LANGUAGES,
  problemHtml: PERMUTATION_II_PROBLEM_HTML,
  analysisHtml: PERMUTATION_II_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const nums = String(inputs.nums ?? '1,1,2')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return withMetrics(buildPerm2Steps(nums.length ? nums : [1, 1, 2]));
  },
  renderCanvas: (container, step) => renderPermutationIICanvas(container, step as BacktrackTreeStep),
});
