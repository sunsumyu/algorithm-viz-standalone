/**
 * 电话号码字母组合可视化器（回溯决策树 SVG 版本）— 4-Card 标准现代架构
 * LeetCode 17：给定数字字符串，返回所有可能的字母组合
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
  PHONE_LETTERS_PROBLEM_HTML,
  PHONE_LETTERS_ANALYSIS_HTML,
  PHONE_LETTERS_CODE_LANGUAGES,
} from './phone-letters-problem-content';

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
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];
  const solutions: string[] = [];

  // Start step
  steps.push({
    nodes: allNodes,
    currentNodeId: 'root',
    visitedNodeIds: ['root'],
    foundPathIds: [],
    prunedNodeIds: [],
    path: [],
    message: `开始搜索：输入 digits = "${digits}"，跨集合展开回溯`,
    codeLine: 8,
    stats: { remaining: digits.length, depth: 0, count: 0 },
    vars: [
      { name: 'digits', value: `"${digits}"`, type: 'string' },
      { name: 'index', value: '0', type: 'number' },
      { name: 'path', value: '""', type: 'string' },
      { name: 'res.size()', value: '0', type: 'number' },
    ],
  });

  function traverse(node: BacktrackTreeNode, index: number): void {
    if (index === digits.length) {
      const combo = (node.path as string[]).join('');
      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        message: `递归进入：index == digits.length (${digits.length}) ✓ 字母组合构造完毕: "${combo}"`,
        codeLine: 13,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'index', value: String(index), type: 'number' },
          { name: 'path', value: `"${combo}"`, type: 'string' },
        ],
      });

      foundIds.push(node.id);
      solutions.push(combo);

      steps.push({
        nodes: allNodes,
        currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...node.path],
        message: `🎉 收集字母组合: "${combo}"，收集并返回`,
        codeLine: 14,
        stats: { remaining: 0, depth: node.depth, count: solutions.length },
        vars: [
          { name: 'res.add()', value: `"${combo}"`, type: 'string' },
          { name: 'res.size()', value: String(solutions.length), type: 'number' },
        ],
      });
      return;
    }

    const curDigit = digits[index];
    const letters = PHONE_MAP[curDigit] || '';

    for (let i = 0; i < letters.length; i++) {
      const char = letters[i];
      const childNode = node.children.find((c) => c.value === char);
      if (!childNode) continue;

      // 做选择
      visitedIds.push(childNode.id);
      const curPathStr = (childNode.path as string[]).join('');
      steps.push({
        nodes: allNodes,
        currentNodeId: childNode.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [],
        path: [...childNode.path],
        message: `做选择：按键 '${curDigit}' 选取字母 '${char}'，当前组合: "${curPathStr}"`,
        codeLine: 18,
        stats: { remaining: digits.length - (index + 1), depth: childNode.depth, count: solutions.length },
        vars: [
          { name: 'digit', value: `'${curDigit}'`, type: 'string' },
          { name: 'letter', value: `'${char}'`, type: 'string' },
          { name: 'path', value: `"${curPathStr}"`, type: 'string' },
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
export function renderPhoneLettersCanvas(container: HTMLElement, step: BacktrackTreeStep): void {
  renderBacktrackTree({
    container,
    step,
    cssPrefix: 'pl',
    nodeLabel: (nd) => (nd.id === 'root' ? "" : nd.value),
  });
}

registerDeclarativeAlgorithm({
  id: 'phone-letters',
  name: '电话号码的字母组合',
  category: 'backtracking',
  description: '经典电话按键九宫格跨集合字母回溯组合',
  icon: '📱',
  difficulty: 2,
  levelOrder: 8,
  learningGoal: '理解跨多个独立集合枚举与深度递进的回溯遍历范式',
  inputs: [
    { id: 'digits', label: '数字串 (2-9)', type: 'text', defaultValue: '23' },
  ],
  presets: [
    { label: '示例 1', values: { 'digits': '23' } },
    { label: '示例 2', values: { 'digits': '2' } },
    { label: '示例 3', values: { 'digits': '79' } },
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
  codeLanguages: PHONE_LETTERS_CODE_LANGUAGES,
  problemHtml: PHONE_LETTERS_PROBLEM_HTML,
  analysisHtml: PHONE_LETTERS_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    let digits = String(inputs.digits ?? '23').trim().replace(/[^2-9]/g, '');
    if (!digits) digits = '23';
    if (digits.length > 4) digits = digits.slice(0, 4);
    return withMetrics(buildPhoneLettersSteps(digits));
  },
  renderCanvas: (container, step) => renderPhoneLettersCanvas(container, step as BacktrackTreeStep),
});
