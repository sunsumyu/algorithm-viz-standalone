/**
 * 全排列可视化器（回溯算法）— 4-Card 标准现代架构
 * LeetCode 46：给定不含重复数字的数组，返回所有可能的全排列
 * 核心：全循环枚举 + used[] 树枝去重标记
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
  PERMUTATION_PROBLEM_HTML,
  PERMUTATION_ANALYSIS_HTML,
  PERMUTATION_CODE_LANGUAGES,
} from './permutation-problem-content';

/* ── Build the full decision tree ─────────────────────────── */
export function buildPermutationTree(nums: number[]): BacktrackTreeNode {
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

  function dfs(used: boolean[], path: number[], parent: BacktrackTreeNode): void {
    if (path.length === nums.length) {
      parent.isLeaf = true;
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      nodeIdCounter++;
      const candidate = nums[i];
      const childPath = [...path, candidate];
      const childId = `${parent.id}-${candidate}-${nodeIdCounter}`;

      const childNode: BacktrackTreeNode = {
        id: childId,
        value: String(candidate),
        path: childPath,
        children: [],
        isLeaf: childPath.length === nums.length,
        isPruned: false,
        parentId: parent.id,
        depth: parent.depth + 1,
      };
      parent.children.push(childNode);

      used[i] = true;
      dfs(used, childPath, childNode);
      used[i] = false;
    }
  }

  dfs(new Array(nums.length).fill(false), [], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
export function buildPermutationSteps(nums: number[]): BacktrackTreeStep[] {
  if (nums.length === 0) {
    return [
      {
        nodes: [],
        currentNodeId: 'root',
        visitedNodeIds: [],
        foundPathIds: [],
        prunedNodeIds: [],
        path: [],
        message: '输入为空，返回空列表 []',
        codeLine: 2,
        stats: {},
      },
    ];
  }

  const root = buildPermutationTree(nums);
  layoutTree(root);
  const allNodes = flattenTree(root);

  const steps: BacktrackTreeStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];
  const solutions: number[][] = [];
  const used = new Array(nums.length).fill(false);

  // Start step
  steps.push({
    nodes: allNodes,
    currentNodeId: 'root',
    visitedNodeIds: ['root'],
    foundPathIds: [],
    prunedNodeIds: [],
    path: [],
    message: `开始搜索：nums = [${nums.join(', ')}]，全排列使用 used[] 数组进行树枝去重`,
    codeLine: 4,
    stats: { remaining: nums.length, depth: 0, count: 0 },
    vars: [
      { name: 'nums', value: `[${nums.join(', ')}]`, type: 'array' },
      { name: 'used', value: `[${used.map((u) => (u ? 'T' : 'F')).join(', ')}]`, type: 'array' },
      { name: 'path', value: '[]', type: 'array' },
      { name: 'res.size()', value: '0', type: 'number' },
    ],
  });

  function traverse(node: BacktrackTreeNode): void {
    if (node.path.length === nums.length) {
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        message: `递归进入：path.size() == ${nums.length} ✓ 构造完成一个全排列`,
        codeLine: 8,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'path.size()', value: String(nums.length), type: 'number' },
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
        prunedNodeIds: [],
        path: [...node.path],
        message: `🎉 收集排列方案：[${node.path.join(', ')}]，收集并返回`,
        codeLine: 9,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'res.add()', value: `[${node.path.join(', ')}]`, type: 'array' },
          { name: 'res.size()', value: String(solutions.length), type: 'number' },
        ],
      });
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      const candidate = nums[i];

      // 树枝去重检查
      if (used[i]) {
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [],
          path: [...node.path],
          message: `树枝跳过：used[${i}] (元素 ${candidate}) 为 true，已在当前排列分支中，continue`,
          codeLine: 13,
          stats: { remaining: nums.length - node.path.length, depth: node.depth, count: solutions.length },
          vars: [
            { name: `used[${i}]`, value: 'true', type: 'boolean' },
            { name: 'candidate', value: String(candidate), type: 'number' },
          ],
        });
        continue;
      }

      const childNode = node.children.find((c) => parseInt(c.value, 10) === candidate);
      if (!childNode) continue;

      // 做选择
      used[i] = true;
      visitedIds.push(childNode.id);
      steps.push({
        nodes: allNodes,
        currentNodeId: childNode.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...childNode.path],
        message: `做选择：used[${i}]=true, path.add(${candidate})，当前排列: [${childNode.path.join(', ')}]`,
        codeLine: 15,
        stats: { remaining: nums.length - childNode.path.length, depth: childNode.depth, count: solutions.length },
        vars: [
          { name: `used[${i}]`, value: 'true', type: 'boolean' },
          { name: 'path', value: `[${childNode.path.join(', ')}]`, type: 'array' },
        ],
      });

      // 向下递归
      steps.push({
        nodes: allNodes,
        currentNodeId: childNode.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...childNode.path],
        message: `向下递归：backtrack(nums, used, path, res)`,
        codeLine: 16,
        stats: { remaining: nums.length - childNode.path.length, depth: childNode.depth, count: solutions.length },
        vars: [
          { name: 'used', value: `[${used.map((u) => (u ? 'T' : 'F')).join(', ')}]`, type: 'array' },
        ],
      });

      traverse(childNode);

      // 回溯撤销
      used[i] = false;
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        message: `🔙 回溯撤销：path.remove(${candidate}), used[${i}]=false，恢复排列: [${node.path.join(', ') || '空'}]`,
        codeLine: 18,
        stats: { remaining: nums.length - node.path.length, depth: node.depth, count: solutions.length },
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
    prunedNodeIds: [],
    path: [],
    message: `🎉 搜索完成！共找到 ${nums.length}! = ${solutions.length} 个全排列`,
    codeLine: 5,
    stats: { remaining: 0, depth: 0, count: solutions.length },
    vars: [
      { name: 'nums', value: `[${nums.join(', ')}]`, type: 'array' },
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
export function renderPermutationCanvas(container: HTMLElement, step: BacktrackTreeStep): void {
  renderBacktrackTree({
    container,
    step,
    cssPrefix: 'pm',
    nodeLabel: (nd) => (nd.id === 'root' ? '[]' : nd.value),
  });
}

registerDeclarativeAlgorithm({
  id: 'permutation',
  name: '全排列',
  category: 'backtracking',
  description: '无重复元素全排列，used 数组树枝标记与全循环回溯',
  icon: '🔀',
  difficulty: 2,
  levelOrder: 12,
  learningGoal: '掌握排列问题中从 0 开始的全局循环与 used[] 树枝去重标记机制',
  inputs: [
    {
      id: 'nums',
      label: '输入数组（无重复）',
      type: 'text',
      defaultValue: '1,2,3',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '1,2,3', values: { nums: '1,2,3' } },
    { label: '1,2', values: { nums: '1,2' } },
    { label: '1,2,3,4', values: { nums: '1,2,3,4' } },
  ],
  metrics: [
    { id: 'path', label: '当前路径', color: '#2563eb' },
    { id: 'visited', label: '已访问节点', color: '#a855f7' },
    { id: 'results', label: '已收集排列', color: '#10b981' },
    { id: 'pruned', label: '剪枝次数', color: '#ef4444' },
  ],
  legend: [
    { label: '当前节点', color: '#2563eb' },
    { label: '已访问', color: '#a855f7' },
    { label: '收集方案', color: '#10b981' },
    { label: '剪枝', color: '#ef4444' },
  ],
  codeLanguages: PERMUTATION_CODE_LANGUAGES,
  problemHtml: PERMUTATION_PROBLEM_HTML,
  analysisHtml: PERMUTATION_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const nums = String(inputs.nums ?? '1,2,3')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return withMetrics(buildPermutationSteps(nums.length ? nums : [1, 2, 3]));
  },
  renderCanvas: (container, step) => renderPermutationCanvas(container, step as BacktrackTreeStep),
});
