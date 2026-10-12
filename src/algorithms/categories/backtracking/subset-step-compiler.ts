/**
 * 子集算法步骤编译器
 * 负责构建决策树并推演回溯执行步骤
 */

import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
} from './backtracking-tree-helper';

/** 决策树步骤 + 状态监视器指标 */
export type SubsetStep = BacktrackTreeStep & { metrics?: Record<string, string> };

/* ── Build the full decision tree ─────────────────────────── */
export function buildSubsetTree(nums: number[]): BacktrackTreeNode {
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
    for (let i = startIdx; i < nums.length; i++) {
      nodeIdCounter++;
      const candidate = nums[i];
      const childPath = [...path, candidate];
      const childId = `${parent.id}-${candidate}-${nodeIdCounter}`;

      const node: BacktrackTreeNode = {
        id: childId,
        value: String(candidate),
        path: childPath,
        children: [],
        isLeaf: true,
        isPruned: false,
        parentId: parent.id,
        depth: parent.depth + 1,
      };
      parent.children.push(node);
      dfs(i + 1, childPath, node);
    }
  }

  dfs(0, [], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
export function buildSubsetSteps(nums: number[]): SubsetStep[] {
  const root = buildSubsetTree(nums);
  layoutTree(root);
  const allNodes = flattenTree(root);

  const steps: SubsetStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];
  const solutions: number[][] = [];
  const totalPowerSet = Math.pow(2, nums.length);

  // Start step
  steps.push({
    nodes: allNodes,
    currentNodeId: 'root',
    visitedNodeIds: ['root'],
    foundPathIds: [],
    prunedNodeIds: [],
    path: [],
    message: `开始搜索：nums = [${nums.join(', ')}]，子集问题收集树上的每一个节点（总计 2^${nums.length} = ${totalPowerSet} 个子集）`,
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
    // 1. 子集问题：节点入口处直接无条件收集
    foundIds.push(node.id);
    solutions.push([...(node.path as number[])]);

    steps.push({
      nodes: allNodes,
      currentNodeId: node.id,
      visitedNodeIds: [...visitedIds],
      foundPathIds: [...foundIds],
      prunedNodeIds: [],
      path: [...node.path],
      message: `🎉 收集子集：[${node.path.join(', ')}]（当前进度: ${solutions.length}/${totalPowerSet}）`,
      codeLine: 8,
      stats: { remaining: nums.length - startIndex, depth: node.depth, count: solutions.length },
      vars: [
        { name: 'res.add()', value: `[${node.path.join(', ')}]`, type: 'array' },
        { name: 'res.size()', value: String(solutions.length), type: 'number' },
        { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
      ],
    });

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const childVal = parseInt(child.value, 10);
      const actualIndex = startIndex + i;

      // 做选择
      visitedIds.push(child.id);
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...child.path],
        message: `做选择：path.add(${childVal})，当前子集: [${child.path.join(', ')}]`,
        codeLine: 11,
        stats: { remaining: nums.length - (actualIndex + 1), depth: child.depth, count: solutions.length },
        vars: [
          { name: 'nums[i]', value: String(childVal), type: 'number' },
          { name: 'path', value: `[${child.path.join(', ')}]`, type: 'array' },
        ],
      });

      // 向下递归
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...child.path],
        message: `向下递归：backtrack(nums, startIndex=${actualIndex + 1}, path, res)`,
        codeLine: 12,
        stats: { remaining: nums.length - (actualIndex + 1), depth: child.depth, count: solutions.length },
        vars: [
          { name: 'startIndex', value: String(actualIndex + 1), type: 'number' },
        ],
      });

      traverse(child, actualIndex + 1);

      // 回溯撤销
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        message: `🔙 回溯撤销：path.remove(${childVal})，恢复子集至: [${node.path.join(', ') || '空'}]`,
        codeLine: 13,
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
    prunedNodeIds: [],
    path: [],
    message: `🎉 搜索完成！共找到 2^${nums.length} = ${solutions.length} 个子集`,
    codeLine: 4,
    stats: { remaining: 0, depth: 0, count: solutions.length },
    vars: [
      { name: 'nums', value: `[${nums.join(', ')}]`, type: 'array' },
      { name: 'res.size()', value: String(solutions.length), type: 'number' },
    ],
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withMetrics(steps: SubsetStep[]): SubsetStep[] {
  const rootNode = steps[0]?.nodes.find((n) => n.id === 'root');
  const n = rootNode ? rootNode.children.length : 0;
  const totalPowerSet = Math.pow(2, n);

  return steps.map((s) => {
    let action = 'backtrack(nums, startIndex=0, path, res)';
    if (s.message.includes('做选择')) {
      const m = s.message.match(/path\.add\(([^)]+)\)/);
      action = `path.add(${m ? m[1] : '?'}) 做选择`;
    } else if (s.message.includes('向下递归')) {
      action = 'backtrack(nums, startIndex+1, path, res)';
    } else if (s.message.includes('回溯撤销')) {
      const m = s.message.match(/path\.remove\(([^)]+)\)/);
      action = `path.remove(${m ? m[1] : '?'}) 回溯撤销`;
    } else if (s.message.includes('收集子集')) {
      action = `res.add([${s.path.join(', ')}]) 收集子集`;
    } else if (s.message.includes('搜索完成')) {
      action = '搜索完成';
    }

    return {
      ...s,
      metrics: {
        depth: String(s.stats?.depth ?? 0),
        path: `[${s.path.join(', ')}]`,
        collected: `${s.foundPathIds.length} / ${totalPowerSet}`,
        action,
      },
    };
  });
}
