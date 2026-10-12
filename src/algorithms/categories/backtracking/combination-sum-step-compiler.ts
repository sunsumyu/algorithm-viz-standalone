/**
 * 组合总和可视化器（回溯）
 * Step Compiler
 */

import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
} from './backtracking-tree-helper';

/** 决策树步骤 + 目标值与状态监视器指标 */
export type CombinationSumStep = BacktrackTreeStep & {
  target: number;
  metrics?: Record<string, string>;
};

export function buildCombinationSumTree(sorted: number[], target: number): BacktrackTreeNode {
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

  function dfs(startIdx: number, remaining: number, path: number[], parent: BacktrackTreeNode): void {
    if (remaining === 0) {
      if (!parent.isPruned) parent.isLeaf = true;
      return;
    }
    for (let i = startIdx; i < sorted.length; i++) {
      nodeIdCounter++;
      const candidate = sorted[i];
      const childPath = [...path, candidate];
      const childId = `${parent.id}-${candidate}-${nodeIdCounter}`;
      const isDirectPrune = !parent.isPruned && candidate > remaining;
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
        dfs(i, remaining - candidate, childPath, node);
      }
    }
  }

  dfs(0, target, [], root);
  return root;
}

export function buildCombinationSumSteps(sorted: number[], target: number): BacktrackTreeStep[] {
  const root = buildCombinationSumTree(sorted, target);
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
    message: `开始搜索：candidates=[${sorted.join(', ')}]，target=${target}，元素可重复选取`,
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

  function traverse(node: BacktrackTreeNode): void {
    const nodeSum = (node.path as number[]).reduce((a, b) => a + b, 0);

    if (node.isLeaf) {
      // 递归进入：先执行 if (sum == target) 判断 —— 成立
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

      // 收集结果并 return
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
        codeLine: 11,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'res.add()', value: `[${node.path.join(', ')}]`, type: 'array' },
          { name: 'res.size()', value: String(solutions.length), type: 'number' },
        ],
      });
      return;
    }

    // 遍历子分支
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const childVal = parseInt(child.value, 10);
      const childSum = nodeSum + childVal;

      // 检查剪枝
      if (child.isDirectPrune) {
        if (!dynamicPrunedIds.includes(child.id)) {
          dynamicPrunedIds.push(child.id);
        }
        steps.push({
          nodes: allNodes,
          currentNodeId: node.id,
          visitedNodeIds: [...visitedIds],
          foundPathIds: [...foundIds],
          prunedNodeIds: [...dynamicPrunedIds],
          path: [...node.path],
          message: `✂️ 剪枝：sum(${nodeSum}) + ${childVal} = ${childSum} > target(${target})，break 本层遍历`,
          codeLine: 15,
          stats: { remaining: target - nodeSum, depth: node.depth, count: solutions.length },
          vars: [
            { name: 'sum + c[i]', value: `${childSum} > ${target}`, type: 'boolean' },
            { name: 'path', value: `[${node.path.join(', ')}]`, type: 'array' },
          ],
        });
        continue;
      }

      // 做选择：path.add(c[i])
      visitedIds.push(child.id);
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `做选择：path.add(${childVal})，当前路径：[${child.path.join(', ')}]，sum = ${childSum}`,
        codeLine: 16,
        stats: { remaining: target - childSum, depth: child.depth, count: solutions.length },
        vars: [
          { name: 'c[i]', value: String(childVal), type: 'number' },
          { name: 'sum', value: String(childSum), type: 'number' },
          { name: 'path', value: `[${child.path.join(', ')}]`, type: 'array' },
        ],
      });

      // 递归深入：backtrack(candidates, target, sum + c[i], i, path, res)
      steps.push({
        nodes: allNodes,
        currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...child.path],
        message: `向下递归：backtrack(target, sum=${childSum}, startIndex=${i})`,
        codeLine: 17,
        stats: { remaining: target - childSum, depth: child.depth, count: solutions.length },
        vars: [
          { name: 'sum', value: String(childSum), type: 'number' },
          { name: 'startIndex', value: String(i), type: 'number' },
        ],
      });

      traverse(child);

      // 撤销选择：path.remove(path.size() - 1)
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...dynamicPrunedIds],
        path: [...node.path],
        message: `🔙 回溯撤销：path.remove(${childVal})，恢复路径至：[${node.path.join(', ') || '空'}]`,
        codeLine: 18,
        stats: { remaining: target - nodeSum, depth: node.depth, count: solutions.length },
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
    message: `🎉 搜索完成！共找到 ${solutions.length} 个满足和为 ${target} 的不同组合`,
    codeLine: 5,
    stats: { remaining: target, depth: 0, count: solutions.length },
    vars: [
      { name: 'target', value: String(target), type: 'number' },
      { name: 'res.size()', value: String(solutions.length), type: 'number' },
    ],
  });

  return steps;
}

export function withMetrics(steps: BacktrackTreeStep[], target: number): CombinationSumStep[] {
  return steps.map((s) => {
    let action = 'backtrack(candidates, target, sum, startIndex, path)';
    if (s.message.includes('剪枝')) action = `sum + c[i] > target(${target}) ⇒ break 剪枝`;
    else if (s.message.includes('做选择')) {
      const m = s.message.match(/path\.add\(([^)]+)\)/);
      const sumMatch = s.message.match(/sum = (\d+)/);
      action = `path.add(${m ? m[1] : '?'})${sumMatch ? ` · sum=${sumMatch[1]}` : ''} 做选择`;
    } else if (s.message.includes('向下递归')) {
      const m = s.message.match(/sum=(\d+), startIndex=(\d+)/);
      action = `backtrack(sum=${m ? m[1] : '?'}, startIndex=${m ? m[2] : '?'}) 深入递归`;
    } else if (s.message.includes('回溯撤销')) {
      const m = s.message.match(/path\.remove\(([^)]+)\)/);
      action = `path.remove(${m ? m[1] : '?'}) 回溯撤销`;
    } else if (s.message.includes('找到合法组合')) {
      action = `res.add([${s.path.join(', ')}]) 收集组合`;
    } else if (s.message.includes('满足终止条件')) {
      action = 'sum == target ✓ 终止判断成立';
    } else if (s.message.includes('搜索完成')) {
      action = '搜索完成';
    }

    const curSum = (s.path as number[]).reduce((a, b) => a + b, 0);

    return {
      ...s,
      target,
      metrics: {
        sum: `${curSum} / ${target}`,
        remaining: String(Math.max(0, target - curSum)),
        depth: String(s.stats?.depth ?? 0),
        found: String(s.foundPathIds.length),
        action,
      },
    };
  });
}
