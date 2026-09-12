/**
 * 递增子序列可视化器（回溯算法）— 4-Card 标准现代架构
 * LeetCode 491：给定整数数组，找出所有长度 >= 2 的非递减子序列
 * 不能排序（要保持原数组顺序）；同层用 Set 去重（未排序无法相邻比较）
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
  INCREASING_SUBSEQUENCES_PROBLEM_HTML,
  INCREASING_SUBSEQUENCES_ANALYSIS_HTML,
  INCREASING_SUBSEQUENCES_CODE_LANGUAGES,
} from './increasing-subsequences-problem-content';

/* ── Build the full decision tree ─────────────────────────── */
export function buildIncSubTree(nums: number[]): BacktrackTreeNode {
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

  function dfs(start: number, path: number[], parent: BacktrackTreeNode): void {
    const levelUsed = new Set<number>();

    for (let i = start; i < nums.length; i++) {
      nodeIdCounter++;
      const candidate = nums[i];
      const childPath = [...path, candidate];
      const childId = `${parent.id}-${candidate}-${nodeIdCounter}`;

      // 剪枝 1：同层 Set 去重
      const isDup = levelUsed.has(candidate);
      // 剪枝 2：破坏非递减性
      const isDecreasing = path.length > 0 && candidate < path[path.length - 1];

      const isDirectPrune = !parent.isPruned && (isDup || isDecreasing);
      const isPruned = parent.isPruned || isDirectPrune;

      const node: BacktrackTreeNode = {
        id: childId,
        value: String(candidate),
        path: childPath,
        children: [],
        isLeaf: !isPruned && childPath.length >= 2,
        isPruned,
        isDirectPrune,
        parentId: parent.id,
        depth: parent.depth + 1,
      };
      parent.children.push(node);

      if (!isPruned) {
        levelUsed.add(candidate);
        dfs(i + 1, childPath, node);
      }
    }
  }

  dfs(0, [], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
export function buildIncSubSteps(nums: number[]): BacktrackTreeStep[] {
  const root = buildIncSubTree(nums);
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
    message: `开始搜索：nums = [${nums.join(', ')}]，保持原数组先后次序，收集所有长度 &ge; 2 的非递减子序列`,
    codeLine: 3,
    stats: { remaining: nums.length, depth: 0, count: 0 },
    vars: [
      { name: 'nums', value: `[${nums.join(', ')}]`, type: 'array' },
      { name: 'startIndex', value: '0', type: 'number' },
      { name: 'path', value: '[]', type: 'array' },
      { name: 'res.size()', value: '0', type: 'number' },
    ],
  });

  function traverse(node: BacktrackTreeNode, startIndex: number): void {
    // 1. 满足长度 >= 2 收集（但不 return）
    if (node.path.length >= 2) {
      foundIds.push(node.id);
      solutions.push([...(node.path as number[])]);

      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🎉 收集递增子序列：[${node.path.join(', ')}]（长度 &ge; 2，继续深入寻找更长子序列）`,
        codeLine: 9,
        stats: { remaining: nums.length - startIndex, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'res.add()', value: `[${node.path.join(', ')}]`, type: 'array' },
          { name: 'res.size()', value: String(solutions.length), type: 'number' },
        ],
      });
    }

    const levelUsed = new Set<number>();

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const childVal = parseInt(child.value, 10);
      const actualIndex = startIndex + i;

      // 2. 剪枝 1：非递减性被破坏
      if (node.path.length > 0 && childVal < (node.path[node.path.length - 1] as number)) {
        if (!dynamicPrunedIds.includes(child.id)) dynamicPrunedIds.push(child.id);
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `✂️ 递减剪枝：nums[${actualIndex}] = ${childVal} < 末尾元素 ${node.path[node.path.length - 1]}，破坏非递减性，跳过`,
          codeLine: 14,
          stats: { remaining: nums.length - startIndex, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'nums[i] < path.last', value: `${childVal} < ${node.path[node.path.length - 1]}`, type: 'boolean' },
          ],
        });
        continue;
      }

      // 3. 剪枝 2：当前层 Set 重复数值
      if (levelUsed.has(childVal)) {
        if (!dynamicPrunedIds.includes(child.id)) dynamicPrunedIds.push(child.id);
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `✂️ 树层 Set 去重：当前递归层已使用过数字 ${childVal}，continue 跳过`,
          codeLine: 15,
          stats: { remaining: nums.length - startIndex, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'used.contains', value: String(childVal), type: 'number' },
          ],
        });
        continue;
      }

      levelUsed.add(childVal);

      // 4. 做选择
      visitedIds.push(child.id);
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `做选择：used.add(${childVal})，path.add(${childVal})，当前子序列: [${child.path.join(', ')}]`,
        codeLine: 17,
        stats: { remaining: nums.length - (actualIndex + 1), depth: child.depth, count: solutions.length },
        vars: [
          { name: 'used.add()', value: String(childVal), type: 'number' },
          { name: 'path', value: `[${child.path.join(', ')}]`, type: 'array' },
        ],
      });

      // 5. 向下递归
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `向下递归：backtrack(nums, startIndex=${actualIndex + 1}, path, res)`,
        codeLine: 18,
        stats: { remaining: nums.length - (actualIndex + 1), depth: child.depth, count: solutions.length },
        vars: [
          { name: 'startIndex', value: String(actualIndex + 1), type: 'number' },
        ],
      });

      traverse(child, actualIndex + 1);

      // 6. 回溯撤销
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🔙 回溯撤销：path.remove(${childVal})（注意：同层 used Set 不回溯），恢复路径至: [${node.path.join(', ') || '空'}]`,
        codeLine: 19,
        stats: { remaining: nums.length - startIndex, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'path.remove()', value: String(childVal), type: 'number' },
          { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
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
    message: `🎉 搜索完成！共找到 ${solutions.length} 个合法递增子序列`,
    codeLine: 5,
    stats: { remaining: 0, depth: 0, count: solutions.length },
    vars: [
      { name: 'nums', value: `[${nums.join(', ')}]`, type: 'array' },
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
export function renderIncreasingSubsequencesCanvas(container: HTMLElement, step: BacktrackTreeStep): void {
  renderBacktrackTree({
    container,
    step,
    cssPrefix: 'is',
    nodeLabel: (nd) => (nd.id === 'root' ? '[]' : nd.value),
  });
}

registerDeclarativeAlgorithm({
  id: 'increasing-subsequences',
  name: '递增子序列',
  category: 'backtracking',
  description: '求数组所有长度 >= 2 的非递减子序列，不能排序，局部 Set 去重',
  icon: '📈',
  difficulty: 2,
  levelOrder: 11,
  learningGoal: '掌握不能排序时的局部 HashSet 树层去重与非终止型全路径状态收集',
  inputs: [
    { id: 'nums', label: '整数数组', type: 'text', defaultValue: '4,6,7,7' },
  ],
  presets: [
    { label: '示例 1', values: { 'nums': '4,6,7,7' } },
    { label: '示例 2', values: { 'nums': '4,4,3,2,1' } },
    { label: '示例 3', values: { 'nums': '4,7,6,7' } },
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
  codeLanguages: INCREASING_SUBSEQUENCES_CODE_LANGUAGES,
  problemHtml: INCREASING_SUBSEQUENCES_PROBLEM_HTML,
  analysisHtml: INCREASING_SUBSEQUENCES_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const nums = parseNumberList(inputs.nums, '4,6,7,7');
    return withMetrics(buildIncSubSteps(nums.length ? nums : [4, 6, 7, 7]));
  },
  renderCanvas: (container, step) => renderIncreasingSubsequencesCanvas(container, step as BacktrackTreeStep),
});
