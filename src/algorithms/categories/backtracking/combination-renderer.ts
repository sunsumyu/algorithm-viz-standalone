/**
 * 组合问题可视化器（回溯算法）— 声明式 4-Card 标准架构
 * LeetCode 77：给定 n 和 k，返回 1...n 中所有可能的 k 个数的组合
 * 基础版：不剪枝，展示回溯搜索决策树的完整结构
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  BacktrackStateSpacePresenter,
} from '../../../core/renderers/backtrack-state-space-presenter';
import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
  renderBacktrackTree,
  resetContainerViewState,
} from './backtracking-tree-helper';
import {
  COMBINATION_PROBLEM_HTML,
  COMBINATION_ANALYSIS_HTML,
} from './combination-problem-content';

/* ── Step ─────────────────────────────────────────────────── */
export interface CombinationStep extends BacktrackTreeStep {
  startIndex: number;
  i?: number;
  n: number;
  k: number;
  action: 'push' | 'pop' | 'found' | 'start' | 'end' | 'iterate' | 'check';
  metrics?: Record<string, string>;
}

/* ── Build the full decision tree ─────────────────────────── */
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

/* ── Generate steps by traversing the tree ────────────────── */
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

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: CombinationStep[]): CombinationStep[] {
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

const COMBINATION_CODE_LANGUAGES: Record<string, string[]> = {
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

/* ── Card 1 主视觉：决策树沙盘 + 底部状态空间条 ─────────────── */
export function renderCombinationCanvas(container: HTMLElement, step: CombinationStep): void {
  // 骨架仅在切换运行（决策树变化）时重建，保证树视口缩放/平移状态跨步保留
  const skeletonKey = `${step.nodes.length}:${step.nodes[0]?.id ?? ''}`;
  if (container.dataset.combinationSkeletonKey !== skeletonKey) {
    const prevTree = container.querySelector<HTMLElement>('#combination-tree-display');
    resetContainerViewState(prevTree);
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; width: 100%; box-sizing: border-box; gap: 8px;">
        <div id="combination-tree-display" style="flex: 1; min-height: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;"></div>
        <div style="display: flex; gap: 8px; height: 112px; flex-shrink: 0;">
          <div style="flex: 1; min-width: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 10px; box-sizing: border-box; overflow: auto;">
            <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px;">📚 当前路径栈 path</div>
            <div id="cs-path-stack-container" style="min-height: 24px;"></div>
          </div>
          <div style="flex: 1; min-width: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 10px; box-sizing: border-box; overflow: auto;">
            <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px;">🔍 搜索状态</div>
            <div id="cs-search-state-container"></div>
          </div>
          <div style="flex: 1.4; min-width: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 10px; box-sizing: border-box; overflow: auto;">
            <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px;">✅ 解集箱（合法组合）</div>
            <div id="cs-result-collection-container" style="min-height: 24px;"></div>
          </div>
        </div>
      </div>
    `;
    container.dataset.combinationSkeletonKey = skeletonKey;
  }

  // 1. 渲染 SVG 决策树沙盘
  const treeDisplay = container.querySelector<HTMLElement>('#combination-tree-display');
  if (treeDisplay) {
    renderBacktrackTree({
      container: treeDisplay,
      step,
      cssPrefix: 'cs',
    });
  }

  // 2. 渲染当前路径栈
  const pathStackContainer = container.querySelector<HTMLElement>('#cs-path-stack-container');
  if (pathStackContainer) {
    BacktrackStateSpacePresenter.renderPathStack(pathStackContainer, step.path, {
      highlightLast: true,
      action: step.action === 'push' ? 'push' : step.action === 'pop' ? 'pop' : step.action === 'found' ? 'collect' : 'idle',
    });
  }

  // 3. 渲染搜索状态
  const searchStateContainer = container.querySelector<HTMLElement>('#cs-search-state-container');
  if (searchStateContainer) {
    BacktrackStateSpacePresenter.renderVariableWatch(searchStateContainer, [
      { label: 'startIndex', value: step.startIndex, highlight: true },
      { label: '当前 i', value: step.i ?? '-' },
      { label: '目标 k', value: step.k },
      { label: '还需元素', value: Math.max(0, step.k - step.path.length), highlight: step.path.length === step.k },
    ]);
  }

  // 4. 渲染实时解集箱
  const results: Array<number[]> = [];
  const foundIds = step.foundPathIds || [];
  const nodeMap = new Map<string, BacktrackTreeNode>();
  step.nodes.forEach((nd) => nodeMap.set(nd.id, nd));

  foundIds.forEach((id) => {
    const nd = nodeMap.get(id);
    if (nd && nd.path.length === step.k) {
      results.push([...nd.path] as number[]);
    }
  });

  const resultCollectionContainer = container.querySelector<HTMLElement>(
    '#cs-result-collection-container'
  );
  if (resultCollectionContainer) {
    BacktrackStateSpacePresenter.renderResultCollection(
      resultCollectionContainer,
      results,
      results.length - 1
    );
  }
}

registerDeclarativeAlgorithm({
  id: 'combination',
  name: '组合问题（回溯）',
  category: 'backtracking',
  description: '使用回溯算法生成所有组合',
  icon: '🎯',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握回溯法的基础框架：选择、递归、撤销，理解决策树结构',
  inputs: [
    { id: 'n', label: 'n (1..n)', type: 'number', defaultValue: 4, min: 1, max: 8 },
    { id: 'k', label: 'k (选 k 个)', type: 'number', defaultValue: 2, min: 1, max: 8 },
  ],
  presets: [
    { label: '基础示例', values: { n: 4, k: 2 } },
    { label: '5 选 3', values: { n: 5, k: 3 } },
    { label: '6 选 2', values: { n: 6, k: 2 } },
    { label: '全选 k=n', values: { n: 4, k: 4 } },
  ],
  metrics: [
    { id: 'start', label: 'startIndex', color: '#2563eb' },
    { id: 'cur-i', label: '当前 i', color: '#a855f7' },
    { id: 'need', label: '还需元素', color: '#f59e0b' },
    { id: 'found', label: '已找到组合', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '📍当前探索', color: '#3b82f6' },
    { label: '✅解集命中', color: '#10b981' },
    { label: '🔙已回溯', color: '#94a3b8' },
  ],
  codeLanguages: COMBINATION_CODE_LANGUAGES,
  problemHtml: COMBINATION_PROBLEM_HTML,
  analysisHtml: COMBINATION_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    let n = parseInt(String(inputs.n ?? 4), 10);
    let k = parseInt(String(inputs.k ?? 2), 10);
    if (!Number.isFinite(n)) n = 4;
    if (!Number.isFinite(k)) k = 2;
    if (k <= 0) k = 1;
    if (n <= 0) n = 1;
    return withMetrics(combinationSteps(n, k));
  },
  renderCanvas: (container, step) => renderCombinationCanvas(container, step as CombinationStep),
});
