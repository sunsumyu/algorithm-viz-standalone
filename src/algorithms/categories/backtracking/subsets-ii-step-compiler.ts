/**
 * 子集 II 步骤编译器
 * 负责构建决策树并推演回溯执行步骤
 */

import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
} from './backtracking-tree-helper';

/* ── Build the full decision tree ─────────────────────────── */
export function buildSubsets2Tree(sorted: number[]): BacktrackTreeNode {
  let nodeIdCounter = 0;
  const root: BacktrackTreeNode = {
    id: 'root',
    value: '[]',
    path: [],
    children: [],
    isLeaf: true,
    isPruned: false,
    parentId: null,
    depth: 0,
  };

  function dfs(startIdx: number, path: number[], parent: BacktrackTreeNode): void {
    for (let i = startIdx; i < sorted.length; i++) {
      nodeIdCounter++;
      const candidate = sorted[i];
      const childPath = [...path, candidate];
      const childId = `${parent.id}-${candidate}-${nodeIdCounter}`;

      // 同层去重
      const isDup = i > startIdx && sorted[i] === sorted[i - 1];
      const isDirectPrune = !parent.isPruned && isDup;
      const isPruned = parent.isPruned || isDirectPrune;

      const node: BacktrackTreeNode = {
        id: childId,
        value: String(candidate),
        path: childPath,
        children: [],
        isLeaf: !isPruned,
        isPruned,
        isDirectPrune,
        parentId: parent.id,
        depth: parent.depth + 1,
      };
      parent.children.push(node);

      if (!isPruned) {
        dfs(i + 1, childPath, node);
      }
    }
  }

  dfs(0, [], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
export function buildSubsets2Steps(nums: number[]): BacktrackTreeStep[] {
  const sorted = [...nums].sort((a, b) => a - b);
  const root = buildSubsets2Tree(sorted);
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
    message: `开始搜索：已排序 nums = [${sorted.join(', ')}]，树层去重生成不重复子集`,
    codeLine: 4,
    stats: { remaining: sorted.length, depth: 0, count: 0 },
    vars: [
      { name: 'nums', value: `[${sorted.join(', ')}]`, type: 'array' },
      { name: 'startIndex', value: '0', type: 'number' },
      { name: 'path', value: '[]', type: 'array' },
      { name: 'res.size()', value: '0', type: 'number' },
    ],
  });

  function traverse(node: BacktrackTreeNode, startIndex: number): void {
    // 1. 全节点收集
    foundIds.push(node.id);
    solutions.push([...(node.path as number[])]);

    steps.push({
      nodes: allNodes,
      currentNodeId: node.id,
      visitedNodeIds: [...visitedIds],
      foundPathIds: [...foundIds],
      prunedNodeIds: [...dynamicPrunedIds],
      path: [...node.path],
      message: `🎉 收集唯一子集：[${node.path.join(', ')}]`,
      codeLine: 8,
      stats: { remaining: sorted.length - startIndex, depth: node.depth, count: solutions.length },
      vars: [
        { name: 'res.add()', value: `[${node.path.join(', ')}]`, type: 'array' },
        { name: 'res.size()', value: String(solutions.length), type: 'number' },
      ],
    });

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const childVal = parseInt(child.value, 10);
      const actualIndex = startIndex + i;

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
          message: `✂️ 树层去重：i > startIndex 且 nums[${actualIndex}] == nums[${actualIndex - 1}] (${childVal} == ${childVal})，continue 跳过重复分支`,
          codeLine: 12,
          stats: { remaining: sorted.length - startIndex, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'nums[i]==nums[i-1]', value: 'true', type: 'boolean' },
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
        message: `做选择：path.add(${childVal})，当前子集: [${child.path.join(', ')}]`,
        codeLine: 13,
        stats: { remaining: sorted.length - (actualIndex + 1), depth: child.depth, count: solutions.length },
        vars: [
          { name: 'nums[i]', value: String(childVal), type: 'number' },
          { name: 'path', value: `[${child.path.join(', ')}]`, type: 'array' },
        ],
      });

      // 4. 向下递归
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `向下递归：backtrack(nums, startIndex=${actualIndex + 1}, path, res)`,
        codeLine: 14,
        stats: { remaining: sorted.length - (actualIndex + 1), depth: child.depth, count: solutions.length },
        vars: [
          { name: 'startIndex', value: String(actualIndex + 1), type: 'number' },
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
        message: `🔙 回溯撤销：path.remove(${childVal})，恢复子集至: [${node.path.join(', ') || '空'}]`,
        codeLine: 15,
        stats: { remaining: sorted.length - startIndex, depth: node.depth, count: solutions.length },
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
    message: `🎉 搜索完成！共找到 ${solutions.length} 个不重复子集`,
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
