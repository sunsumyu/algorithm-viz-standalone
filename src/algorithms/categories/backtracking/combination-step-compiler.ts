/**
 * 组合问题可视化器（回溯算法）
 * Step Compiler
 */

import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
} from './backtracking-tree-helper';

export interface CombinationStep extends BacktrackTreeStep {
  startIndex: number;
  i?: number;
  n: number;
  k: number;
  action: 'push' | 'pop' | 'found' | 'start' | 'end' | 'iterate' | 'check';
  metrics?: Record<string, string>;
}

export function buildCombinationTree(n: number, k: number): BacktrackTreeNode {
  const root: BacktrackTreeNode = {
    id: 'root', value: '', path: [], children: [],
    isLeaf: false, isPruned: false, parentId: null, depth: 0,
  };

  function dfs(start: number, path: number[], parent: BacktrackTreeNode): void {
    if (path.length === k) {
      parent.isLeaf = true;
      return;
    }
    for (let i = start; i <= n; i++) {
      const childPath = [...path, i];
      const childId = `${parent.id}-${i}`;

      const node: BacktrackTreeNode = {
        id: childId, value: String(i), path: childPath,
        children: [], isLeaf: false, isPruned: false,
        parentId: parent.id, depth: parent.depth + 1,
      };
      parent.children.push(node);
      dfs(i + 1, childPath, node);
    }
  }

  dfs(1, [], root);
  return root;
}

export function combinationSteps(n: number, k: number): CombinationStep[] {
  const root = buildCombinationTree(n, k);
  layoutTree(root);
  const allNodes = flattenTree(root);

  const steps: CombinationStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];

  const makeVars = (currentPathLen: number, start: number, iVal?: number) => {
    return [
      { name: 'n', value: String(n), type: 'number' as const },
      { name: 'k', value: String(k), type: 'number' as const },
      { name: 'startIndex', value: String(start), type: 'number' as const },
      { name: '当前 i', value: String(iVal ?? '-'), type: 'number' as const },
      { name: 'path.size()', value: String(currentPathLen), type: 'number' as const },
      { name: '还需元素', value: String(Math.max(0, k - currentPathLen)), type: 'number' as const },
    ];
  };

  steps.push({
    nodes: allNodes, currentNodeId: 'root', visitedNodeIds: ['root'],
    foundPathIds: [], prunedNodeIds: [],
    path: [],
    startIndex: 1, n, k,
    action: 'start',
    message: `开始回溯搜索：从 1..${n} 中选 ${k} 个数，进入根节点`,
    codeLine: 3,
    vars: makeVars(0, 1),
  });

  function traverse(node: BacktrackTreeNode, start: number): void {
    if (node.isLeaf) {
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        startIndex: start, n, k,
        action: 'check',
        message: `递归进入：path.size() == ${k} ✓ 满足终止条件`,
        codeLine: 9,
        vars: makeVars(node.path.length, start),
      });

      foundIds.push(node.id);
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        startIndex: start, n, k,
        action: 'found',
        message: `找到合法组合：[${node.path.join(', ')}]，加入结果集并 return`,
        codeLine: { from: 10, to: 11 },
        vars: makeVars(node.path.length, start),
      });
      return;
    }

    steps.push({
      nodes: allNodes, currentNodeId: node.id,
      visitedNodeIds: [...visitedIds],
      foundPathIds: [...foundIds],
      prunedNodeIds: [],
      path: [...node.path],
      startIndex: start, n, k,
      action: 'check',
      message: `递归进入：path.size() = ${node.path.length} < ${k}，从 startIndex=${start} 开始横向遍历`,
      codeLine: 9,
      vars: makeVars(node.path.length, start),
    });

    for (const child of node.children) {
      const iVal = Number(child.value);
      visitedIds.push(child.id);

      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...child.path],
        startIndex: start, i: iVal, n, k,
        action: 'push',
        message: `做选择：path.add(${iVal}) → [${child.path.join(', ')}]`,
        codeLine: 14,
        vars: makeVars(child.path.length, start, iVal),
      });

      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...child.path],
        startIndex: iVal + 1, i: iVal, n, k,
        action: 'iterate',
        message: `深入递归：backtrack(startIndex = ${iVal + 1}, path)`,
        codeLine: 15,
        vars: makeVars(child.path.length, iVal + 1, iVal),
      });

      traverse(child, iVal + 1);

      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        startIndex: start, i: iVal, n, k,
        action: 'pop',
        message: `回溯撤销：path.remove()，弹出 ${iVal}，恢复路径为 [${node.path.join(', ')}]`,
        codeLine: 16,
        vars: makeVars(node.path.length, start, iVal),
      });
    }
  }

  traverse(root, 1);

  steps.push({
    nodes: allNodes, currentNodeId: 'root',
    visitedNodeIds: [...visitedIds],
    foundPathIds: [...foundIds],
    prunedNodeIds: [],
    path: [],
    startIndex: 1, n, k,
    action: 'end',
    message: `回溯搜索完成：共遍历 ${allNodes.length} 个节点，找到 ${foundIds.length} 个组合解`,
    codeLine: 4,
    vars: makeVars(0, 1),
  });

  return steps;
}

export function withMetrics(steps: CombinationStep[]): CombinationStep[] {
  return steps.map((s) => {
    let action = 'backtrack(startIndex, path, res, n, k)';
    if (s.action === 'start') action = 'backtrack(1, [], res, n, k) 开始搜索';
    else if (s.action === 'check') action = 'path.size() == k ? 终止判断';
    else if (s.action === 'found') action = `res.add([${s.path.join(', ')}]) 收集组合`;
    else if (s.action === 'push') action = `path.add(${s.i}) 做选择`;
    else if (s.action === 'iterate') action = `backtrack(${s.startIndex}, path) 深入递归`;
    else if (s.action === 'pop') action = `path.remove() 弹出 ${s.i} 回溯撤销`;
    else if (s.action === 'end') action = '搜索完成';

    return {
      ...s,
      metrics: {
        start: String(s.startIndex),
        'cur-i': s.i != null ? String(s.i) : '—',
        need: String(Math.max(0, s.k - s.path.length)),
        found: String(s.foundPathIds.length),
        action,
      },
    };
  });
}

export const COMBINATION_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public List<List<Integer>> combine(int n, int k) {',
    '    List<List<Integer>> res = new ArrayList<>();',
    '    backtrack(1, new ArrayList<>(), res, n, k);',
    '    return res;',
    '}',
    '',
    'void backtrack(int startIndex, List<Integer> path,',
    '               List<List<Integer>> res, int n, int k) {',
    '    if (path.size() == k) {',
    '        res.add(new ArrayList<>(path));',
    '        return;',
    '    }',
    '    for (int i = startIndex; i <= n; i++) {',
    '        path.add(i);',
    '        backtrack(i + 1, path, res, n, k);',
    '        path.remove(path.size() - 1);',
    '    }',
    '}',
  ],
  cpp: [
    'vector<vector<int>> combine(int n, int k) {',
    '    vector<vector<int>> res;',
    '    vector<int> path;',
    '    backtrack(1, path, res, n, k);',
    '    return res;',
    '}',
    '',
    'void backtrack(int startIndex, vector<int>& path,',
    '               vector<vector<int>>& res, int n, int k) {',
    '    if (path.size() == k) {',
    '        res.push_back(path);',
    '        return;',
    '    }',
    '    for (int i = startIndex; i <= n; i++) {',
    '        path.push_back(i);',
    '        backtrack(i + 1, path, res, n, k);',
    '        path.pop_back();',
    '    }',
    '}',
  ],
  python: [
    'def combine(n: int, k: int) -> List[List[int]]:',
    '    res = []',
    '    def backtrack(startIndex: int, path: List[int]):',
    '        if len(path) == k:',
    '            res.append(list(path))',
    '            return',
    '        for i in range(startIndex, n + 1):',
    '            path.append(i)',
    '            backtrack(i + 1, path)',
    '            path.pop()',
    '    backtrack(1, [])',
    '    return res',
  ],
  javascript: [
    'function combine(n, k) {',
    '    const res = [];',
    '    const path = [];',
    '    function backtrack(startIndex) {',
    '        if (path.length === k) {',
    '            res.push([...path]);',
    '            return;',
    '        }',
    '        for (let i = startIndex; i <= n; i++) {',
    '            path.push(i);',
    '            backtrack(i + 1);',
    '            path.pop();',
    '        }',
    '    }',
    '    backtrack(1);',
    '    return res;',
    '}',
  ],
};
