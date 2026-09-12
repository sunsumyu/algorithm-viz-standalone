/**
 * 分割回文串可视化器（回溯决策树 SVG 版本）— 4-Card 标准现代架构
 * LeetCode 131：把字符串分割成若干子串，要求每个子串都是回文串
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
  PALINDROME_PARTITION_PROBLEM_HTML,
  PALINDROME_PARTITION_ANALYSIS_HTML,
  PALINDROME_PARTITION_CODE_LANGUAGES,
} from './palindrome-partition-problem-content';

/* ── Helpers ────────────────────────────────────────────────── */
export function isPalindrome(text: string): boolean {
  let left = 0;
  let right = text.length - 1;
  while (left < right) {
    if (text[left] !== text[right]) return false;
    left++;
    right--;
  }
  return true;
}

/* ── Build decision tree ──────────────────────────────────── */
export function buildPalTree(s: string): BacktrackTreeNode {
  let nodeIdCounter = 0;
  const root: BacktrackTreeNode = {
    id: 'root',
    value: '""',
    path: [],
    children: [],
    isLeaf: false,
    isPruned: false,
    parentId: null,
    depth: 0,
  };

  function dfs(startIndex: number, path: string[], parent: BacktrackTreeNode): void {
    if (startIndex === s.length) {
      parent.isLeaf = true;
      return;
    }

    for (let end = startIndex; end < s.length; end++) {
      nodeIdCounter++;
      const substring = s.slice(startIndex, end + 1);
      const isPal = isPalindrome(substring);
      const childId = `${parent.id}-${substring}-${nodeIdCounter}`;

      if (!isPal) {
        // Prune: not a palindrome
        const pruneNode: BacktrackTreeNode = {
          id: childId,
          value: `"${substring}"`,
          path: [...path, substring],
          children: [],
          isLeaf: false,
          isPruned: true,
          isDirectPrune: true,
          parentId: parent.id,
          depth: parent.depth + 1,
        };
        parent.children.push(pruneNode);
        continue;
      }

      const childNode: BacktrackTreeNode = {
        id: childId,
        value: `"${substring}"`,
        path: [...path, substring],
        children: [],
        isLeaf: false,
        isPruned: false,
        parentId: parent.id,
        depth: parent.depth + 1,
      };
      parent.children.push(childNode);
      dfs(end + 1, [...path, substring], childNode);
    }
  }

  dfs(0, [], root);
  return root;
}

/* ── Generate steps ───────────────────────────────────────── */
export function buildPalindromePartitionSteps(s: string): BacktrackTreeStep[] {
  const root = buildPalTree(s);
  layoutTree(root);
  const allNodes = flattenTree(root);

  const steps: BacktrackTreeStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];
  const dynamicPrunedIds: string[] = [];
  const solutions: string[][] = [];

  // Start step
  steps.push({
    nodes: allNodes,
    currentNodeId: 'root',
    visitedNodeIds: ['root'],
    foundPathIds: [],
    prunedNodeIds: [],
    path: [],
    message: `开始搜索：分割字符串 s = "${s}"，要求每段子串均为回文串`,
    codeLine: 4,
    stats: { remaining: s.length, depth: 0, count: 0 },
    vars: [
      { name: 's', value: `"${s}"`, type: 'string' },
      { name: 'startIndex', value: '0', type: 'number' },
      { name: 'path', value: '[]', type: 'array' },
      { name: 'res.size()', value: '0', type: 'number' },
    ],
  });

  function traverse(node: BacktrackTreeNode, startIndex: number): void {
    if (startIndex >= s.length) {
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `递归进入：startIndex (${startIndex}) >= s.length (${s.length})，切割线已达末尾 ✓ 找到全回文分割`,
        codeLine: 9,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'startIndex', value: String(startIndex), type: 'number' },
          { name: 'path', value: `[${node.path.map((p) => `"${p}"`).join(', ')}]`, type: 'array' },
        ],
      });

      foundIds.push(node.id);
      solutions.push([...(node.path as string[])]);

      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🎉 收集回文分割方案：[${node.path.map((p) => `"${p}"`).join(', ')}]，收集并返回`,
        codeLine: 10,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'res.add()', value: `[${node.path.map((p) => `"${p}"`).join(', ')}]`, type: 'array' },
          { name: 'res.size()', value: String(solutions.length), type: 'number' },
        ],
      });
      return;
    }

    for (let i = startIndex; i < s.length; i++) {
      const sub = s.slice(startIndex, i + 1);
      const isPal = isPalindrome(sub);
      const childNode = node.children.find((c) => c.value === `"${sub}"`);

      // 1. 判断是否回文
      if (!isPal) {
        if (childNode && !dynamicPrunedIds.includes(childNode.id)) {
          dynamicPrunedIds.push(childNode.id);
        }
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `✂️ 非回文剪枝：子串 s[${startIndex}..${i}] = "${sub}" 不是回文串，continue 跳过该分支`,
          codeLine: 14,
          stats: { remaining: s.length - startIndex, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'sub', value: `"${sub}"`, type: 'string' },
            { name: 'isPalindrome', value: 'false', type: 'boolean' },
          ],
        });
        continue;
      }

      if (!childNode) continue;

      // 2. 做选择
      visitedIds.push(childNode.id);
      steps.push({
        nodes: allNodes,
        currentNodeId: childNode.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...childNode.path],
        message: `做选择：截取回文子串 path.add("${sub}")，当前路径：[${childNode.path.map((p) => `"${p}"`).join(', ')}]`,
        codeLine: 16,
        stats: { remaining: s.length - (i + 1), depth: childNode.depth, count: solutions.length },
        vars: [
          { name: 'str', value: `"${sub}"`, type: 'string' },
          { name: 'path', value: `[${childNode.path.map((p) => `"${p}"`).join(', ')}]`, type: 'array' },
        ],
      });

      // 3. 向下递归
      steps.push({
        nodes: allNodes,
        currentNodeId: childNode.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...childNode.path],
        message: `向下递归：backtrack(s, startIndex=${i + 1}, path, res)`,
        codeLine: 17,
        stats: { remaining: s.length - (i + 1), depth: childNode.depth, count: solutions.length },
        vars: [
          { name: 'startIndex', value: String(i + 1), type: 'number' },
        ],
      });

      traverse(childNode, i + 1);

      // 4. 回溯撤销
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🔙 回溯撤销：path.remove("${sub}")，恢复路径至：[${node.path.map((p) => `"${p}"`).join(', ') || '空'}]`,
        codeLine: 18,
        stats: { remaining: s.length - startIndex, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'path.remove()', value: `"${sub}"`, type: 'string' },
          { name: 'path', value: `[${node.path.map((p) => `"${p}"`).join(', ')}]`, type: 'array' },
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
    message: `🎉 搜索完成！共找到 ${solutions.length} 种全回文分割方案`,
    codeLine: 5,
    stats: { remaining: 0, depth: 0, count: solutions.length },
    vars: [
      { name: 's', value: `"${s}"`, type: 'string' },
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
export function renderPalindromePartitionCanvas(container: HTMLElement, step: BacktrackTreeStep): void {
  renderBacktrackTree({
    container,
    step,
    cssPrefix: 'pp',
    nodeLabel: (nd) => (nd.id === 'root' ? "" : nd.value),
  });
}

registerDeclarativeAlgorithm({
  id: 'palindrome-partition',
  name: '分割回文串',
  category: 'backtracking',
  description: '将字符串分割为若干回文子串，回文判定剪枝',
  icon: '✂️',
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '理解字符串切割问题到树形回溯的建模与即时回文剪枝',
  inputs: [
    { id: 'str', label: '输入字符串', type: 'text', defaultValue: 'aab' },
  ],
  presets: [
    { label: '示例 1', values: { 's': 'aab' } },
    { label: '示例 2', values: { 's': 'efe' } },
    { label: '示例 3', values: { 's': 'cdd' } },
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
  codeLanguages: PALINDROME_PARTITION_CODE_LANGUAGES,
  problemHtml: PALINDROME_PARTITION_PROBLEM_HTML,
  analysisHtml: PALINDROME_PARTITION_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    let s = String(inputs.str ?? 'aab').trim();
    if (!s) s = 'aab';
    if (s.length > 8) s = s.slice(0, 8);
    return withMetrics(buildPalindromePartitionSteps(s));
  },
  renderCanvas: (container, step) => renderPalindromePartitionCanvas(container, step as BacktrackTreeStep),
});
