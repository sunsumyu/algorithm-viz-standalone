/**
 * 电话号码字母组合步骤编译器
 * 负责构建决策树并推演回溯执行步骤
 */

import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
} from './backtracking-tree-helper';

/* ── Phone digit mapping ──────────────────────────────────── */
export const PHONE_MAP: Record<string, string> = {
  '2': 'abc',
  '3': 'def',
  '4': 'ghi',
  '5': 'jkl',
  '6': 'mno',
  '7': 'pqrs',
  '8': 'tuv',
  '9': 'wxyz',
};

/* ── Build decision tree ──────────────────────────────────── */
export function buildPhoneTree(digits: string): BacktrackTreeNode {
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

  function dfs(index: number, path: string[], parent: BacktrackTreeNode): void {
    if (index === digits.length) {
      parent.isLeaf = true;
      return;
    }

    const digit = digits[index];
    const letters = PHONE_MAP[digit] || '';

    for (const letter of letters) {
      nodeIdCounter++;
      const childNode: BacktrackTreeNode = {
        id: `${parent.id}-${letter}-${nodeIdCounter}`,
        value: letter,
        path: [...path, letter],
        children: [],
        isLeaf: false,
        isPruned: false,
        parentId: parent.id,
        depth: parent.depth + 1,
      };
      parent.children.push(childNode);
      dfs(index + 1, [...path, letter], childNode);
    }
  }

  dfs(0, [], root);
  return root;
}

/* ── Generate steps ───────────────────────────────────────── */
export function buildPhoneLettersSteps(digits: string): BacktrackTreeStep[] {
  if (digits.length === 0) {
    return [
      {
        nodes: [],
        currentNodeId: 'root',
        visitedNodeIds: ['root'],
        foundPathIds: [],
        prunedNodeIds: [],
        path: [],
        message: '输入为空，直接返回空组合列表 []',
        codeLine: 7,
        stats: { remaining: 0, depth: 0, count: 0 },
        vars: [
          { name: 'digits', value: '""', type: 'string' },
          { name: 'res', value: '[]', type: 'array' },
        ],
      },
    ];
  }

  const root = buildPhoneTree(digits);
  layoutTree(root);
  const allNodes = flattenTree(root);

  const steps: BacktrackTreeStep[] = [];
  const visitedIds: string[] = [];
  const foundIds: string[] = [];
  const solutions: string[] = [];

  // Initial step
  steps.push({
    nodes: allNodes,
    currentNodeId: 'root',
    visitedNodeIds: ['root'],
    foundPathIds: [],
    prunedNodeIds: [],
    path: [],
    message: `开始回溯搜索：digits = "${digits}"，构建跨集合字母决策树`,
    codeLine: 8,
    stats: { remaining: digits.length, depth: 0, count: 0 },
    vars: [
      { name: 'digits', value: `"${digits}"`, type: 'string' },
      { name: 'res', value: '[]', type: 'array' },
    ],
  });

  visitedIds.push('root');

  function traverse(node: BacktrackTreeNode, index: number): void {
    // 递归终止条件检查
    if (index === digits.length) {
      const sol = (node.path as string[]).join('');
      solutions.push(sol);
      foundIds.push(node.id);

      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        message: `🎯 达到叶节点：index === digits.length() (${index} === ${digits.length})，收集解 "${sol}"`,
        codeLine: 13,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'index', value: String(index), type: 'number' },
          { name: 'digits.length()', value: String(digits.length), type: 'number' },
          { name: 'path', value: `"${sol}"`, type: 'string' },
          { name: 'res.add()', value: `"${sol}"`, type: 'string' },
        ],
      });

      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        message: `↩️ 返回上一层：叶节点处理完毕，准备回溯`,
        codeLine: 14,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'return', value: 'void', type: 'string' },
        ],
      });
      return;
    }

    const currentDigit = digits[index];
    const letters = PHONE_MAP[currentDigit] || '';

    // 取出当前数字映射的字母集合
    steps.push({
      nodes: allNodes,
      currentNodeId: node.id,
      visitedNodeIds: [...visitedIds],
      foundPathIds: [...foundIds],
      prunedNodeIds: [],
      path: [...node.path],
      message: `按键解析：digits[${index}] = '${currentDigit}'，可选字母集合 "${letters}"`,
      codeLine: 16,
      stats: { remaining: digits.length - index, depth: node.depth, count: solutions.length },
      vars: [
        { name: 'digit', value: `'${currentDigit}'`, type: 'string' },
        { name: 'letters', value: `"${letters}"`, type: 'string' },
        { name: 'index', value: String(index), type: 'number' },
      ],
    });

    for (let i = 0; i < node.children.length; i++) {
      const childNode = node.children[i];
      const char = childNode.value;

      // 循环尝试
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        message: `分支循环：尝试字母 '${char}'（第 ${i + 1}/${letters.length} 个选择）`,
        codeLine: 17,
        stats: { remaining: digits.length - index, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'i', value: String(i), type: 'number' },
          { name: 'letters.charAt(i)', value: `'${char}'`, type: 'string' },
        ],
      });

      visitedIds.push(childNode.id);

      // 做选择
      const pathStr = (childNode.path as string[]).join('');
      steps.push({
        nodes: allNodes,
        currentNodeId: childNode.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...childNode.path],
        message: `👉 做出选择：path.append('${char}')，当前路径组合: "${pathStr}"`,
        codeLine: 18,
        stats: { remaining: digits.length - index - 1, depth: childNode.depth, count: solutions.length },
        vars: [
          { name: 'path.append()', value: `'${char}'`, type: 'string' },
          { name: 'path', value: `"${pathStr}"`, type: 'string' },
        ],
      });

      // 递归深入
      steps.push({
        nodes: allNodes,
        currentNodeId: childNode.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...childNode.path],
        message: `向下递归：backtrack(digits, index=${index + 1}, path, res)`,
        codeLine: 19,
        stats: { remaining: digits.length - (index + 1), depth: childNode.depth, count: solutions.length },
        vars: [
          { name: 'index', value: String(index + 1), type: 'number' },
        ],
      });

      traverse(childNode, index + 1);

      // 回溯撤销
      const restoredPathStr = (node.path as string[]).join('');
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        message: `🔙 回溯撤销：path.deleteCharAt('${char}')，恢复组合: "${restoredPathStr || '空'}"`,
        codeLine: 20,
        stats: { remaining: digits.length - index, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'path.delete()', value: `'${char}'`, type: 'string' },
          { name: 'path', value: `"${restoredPathStr}"`, type: 'string' },
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
    message: `🎉 搜索完成！共生成 ${solutions.length} 种字母组合`,
    codeLine: 9,
    stats: { remaining: 0, depth: 0, count: solutions.length },
    vars: [
      { name: 'digits', value: `"${digits}"`, type: 'string' },
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
