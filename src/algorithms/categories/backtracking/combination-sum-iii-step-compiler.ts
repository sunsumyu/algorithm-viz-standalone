/**
 * 组合总和 III 可视化器（回溯决策树版本）
 * Step Compiler
 */

import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
} from './backtracking-tree-helper';

export function buildCombinationSum3Tree(k: number, n: number): BacktrackTreeNode {
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
    if (path.length === k) {
      if (remaining === 0 && !parent.isPruned) {
        parent.isLeaf = true;
      }
      return;
    }
    for (let i = start; i <= 9; i++) {
      nodeIdCounter++;
      const childPath = [...path, i];
      const childId = `${parent.id}-${i}-${nodeIdCounter}`;
      const newRemaining = remaining - i;

      const isSumExceed = newRemaining < 0;
      const isCountInsufficient = 9 - i + 1 < k - path.length;
      const isDirectPrune = !parent.isPruned && (isSumExceed || isCountInsufficient);
      const isPruned = parent.isPruned || isDirectPrune;

      const node: BacktrackTreeNode = {
        id: childId,
        value: String(i),
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
        dfs(i + 1, newRemaining, childPath, node);
      }
    }
  }

  dfs(1, n, [], root);
  return root;
}

export function buildCombinationSum3Steps(k: number, n: number): BacktrackTreeStep[] {
  const root = buildCombinationSum3Tree(k, n);
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
    message: `开始搜索：从 1~9 中选 ${k} 个不重复数字使得总和为 ${n}`,
    codeLine: 4,
    stats: { remaining: n, depth: 0, count: 0 },
    vars: [
      { name: 'k', value: String(k), type: 'number' },
      { name: 'n', value: String(n), type: 'number' },
      { name: 'sum', value: '0', type: 'number' },
      { name: 'path', value: '[]', type: 'array' },
      { name: 'res.size()', value: '0', type: 'number' },
    ],
  });

  function traverse(node: BacktrackTreeNode): void {
    const nodeSum = (node.path as number[]).reduce((a, b) => a + b, 0);

    if (node.path.length === k) {
      if (nodeSum === n) {
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `递归进入：path.size() == ${k} 且 sum == ${n} ✓ 满足目标条件`,
          codeLine: 11,
          stats: { remaining: 0, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'sum', value: String(nodeSum), type: 'number' },
            { name: 'target', value: String(n), type: 'number' },
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
          message: `🎉 找到合法组合：[${node.path.join(', ')}]，收集并返回`,
          codeLine: 12,
          stats: { remaining: 0, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'res.add()', value: `[${node.path.join(', ')}]`, type: 'array' },
            { name: 'res.size()', value: String(solutions.length), type: 'number' },
          ],
        });
      } else {
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `递归终止：path.size() == ${k}，但 sum(${nodeSum}) != n(${n})，直接返回`,
          codeLine: 13,
          stats: { remaining: n - nodeSum, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'sum', value: String(nodeSum), type: 'number' },
            { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
          ],
        });
      }
      return;
    }

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const childVal = parseInt(child.value, 10);
      const childSum = nodeSum + childVal;

      // 剪枝判定
      if (childSum > n) {
        if (!dynamicPrunedIds.includes(child.id)) dynamicPrunedIds.push(child.id);
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `✂️ 和超额剪枝：sum(${nodeSum}) + ${childVal} = ${childSum} > n(${n})，break 终止本层`,
          codeLine: 16,
          stats: { remaining: n - nodeSum, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'sum + i', value: `${childSum} > ${n}`, type: 'boolean' },
            { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
          ],
        });
        continue;
      }

      if (9 - childVal + 1 < k - node.path.length) {
        if (!dynamicPrunedIds.includes(child.id)) dynamicPrunedIds.push(child.id);
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `✂️ 数量不足剪枝：剩余可选元素数量 < 尚需元素数量 (${9 - childVal + 1} < ${k - node.path.length})，终止遍历`,
          codeLine: 15,
          stats: { remaining: n - nodeSum, depth: node.depth, count: solutions.length },
          vars: [
            { name: '剩余可选数', value: String(9 - childVal + 1), type: 'number' },
            { name: '还需元素数', value: String(k - node.path.length), type: 'number' },
          ],
        });
        continue;
      }

      // 做选择
      visitedIds.push(child.id);
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `做选择：path.add(${childVal})，当前路径：[${child.path.join(', ')}]，sum = ${childSum}`,
        codeLine: 17,
        stats: { remaining: n - childSum, depth: child.depth, count: solutions.length },
        vars: [
          { name: 'i', value: String(childVal), type: 'number' },
          { name: 'sum', value: String(childSum), type: 'number' },
          { name: 'path', value: `[${child.path.join(', ')}]`, type: 'array' },
        ],
      });

      // 向下递归
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `向下递归：backtrack(target=${n}, k=${k}, sum=${childSum}, startIndex=${childVal + 1})`,
        codeLine: 18,
        stats: { remaining: n - childSum, depth: child.depth, count: solutions.length },
        vars: [
          { name: 'startIndex', value: String(childVal + 1), type: 'number' },
          { name: 'sum', value: String(childSum), type: 'number' },
        ],
      });

      traverse(child);

      // 回溯撤销
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🔙 回溯撤销：path.remove(${childVal})，恢复路径至：[${node.path.join(', ') || '空'}]`,
        codeLine: 19,
        stats: { remaining: n - nodeSum, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'path.remove()', value: String(childVal), type: 'number' },
          { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
          { name: 'sum', value: String(nodeSum), type: 'number' },
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
    message: `🎉 搜索完成！共找到 ${solutions.length} 个满足和为 ${n} 的 ${k} 元数组合`,
    codeLine: 5,
    stats: { remaining: n, depth: 0, count: solutions.length },
    vars: [
      { name: 'k', value: String(k), type: 'number' },
      { name: 'n', value: String(n), type: 'number' },
      { name: 'res.size()', value: String(solutions.length), type: 'number' },
    ],
  });

  return steps;
}

export function withMetrics(steps: BacktrackTreeStep[]): BacktrackTreeStep[] {
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
