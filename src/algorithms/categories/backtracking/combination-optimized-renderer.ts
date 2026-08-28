/**
 * 组合（优化）可视化器（回溯）- 回溯决策树版本
 * LeetCode 77：从 1..n 中选 k 个数的所有组合
 * 支持阶段演化：阶段 1 (完整决策树) vs 阶段 2 (剪枝优化决策树)
 * 双卡片联动：Card 1 (SVG 决策树) + Card 2 (回溯路径栈、剪枝监视器、解集箱)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import { BacktrackStateSpacePresenter } from '../../../core/renderers/backtrack-state-space-presenter';
import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
  renderBacktrackTree,
} from './backtracking-tree-helper';
import { buildCombinationTree, combinationSteps } from './combination-renderer';
import template from './combination-optimized.html?raw';

/* ── Build the pruned decision tree ─────────────────────────── */
export function buildOptimizedTree(n: number, k: number): BacktrackTreeNode {
  const root: BacktrackTreeNode = {
    id: 'root', value: '', path: [], children: [],
    isLeaf: false, isPruned: false, parentId: null, depth: 0,
  };

  function dfs(start: number, path: number[], parent: BacktrackTreeNode): void {
    if (path.length === k) {
      if (!parent.isPruned) {
        parent.isLeaf = true;
      }
      return;
    }
    // Upper bound: remaining candidates must be enough to fill k slots.
    const upper = n - (k - path.length) + 1;
    for (let i = start; i <= n; i++) {
      const childPath = [...path, i];
      const childId = `${parent.id}-${i}`;
      const isDirectPrune = !parent.isPruned && (i > upper);
      const isPruned = parent.isPruned || isDirectPrune;

      const node: BacktrackTreeNode = {
        id: childId, value: String(i), path: childPath,
        children: [], isLeaf: false, isPruned, isDirectPrune,
        parentId: parent.id, depth: parent.depth + 1,
      };
      parent.children.push(node);
      if (!isPruned) {
        dfs(i + 1, childPath, node);
      }
    }
  }

  dfs(1, [], root);
  return root;
}

/* ── Generate steps by traversing the tree ────────────────── */
export function buildOptimizedSteps(n: number, k: number): BacktrackTreeStep[] {
  const root = buildOptimizedTree(n, k);
  layoutTree(root);
  const allNodes = flattenTree(root);
  const prunedIds = allNodes.filter(nd => nd.isPruned).map(nd => nd.id);

  const steps: BacktrackTreeStep[] = [];
  const visitedIds: string[] = ['root'];
  const foundIds: string[] = [];

  steps.push({
    nodes: allNodes, currentNodeId: 'root', visitedNodeIds: ['root'],
    foundPathIds: [], prunedNodeIds: [...prunedIds],
    path: [],
    message: `开始：从 1..${n} 中选 ${k} 个数，剪枝上界 i <= ${n - k + 1}（首层）`,
    codeLine: 3,
    stats: { depth: 0, count: 0, need: k, remain: 0 },
  });

  function traverse(node: BacktrackTreeNode): void {
    if (node.isLeaf) {
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path],
        message: `递归进入：path.size() == ${k} ✓ 满足终止条件`,
        codeLine: 9,
        stats: { depth: node.depth, count: foundIds.length, need: 0, remain: node.path.length },
      });
      foundIds.push(node.id);
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path],
        message: `找到组合：[${node.path.join(', ')}]，收集并返回`,
        codeLine: { from: 10, to: 11 },
        stats: { depth: node.depth, count: foundIds.length, need: 0, remain: node.path.length },
      });
      return;
    }

    steps.push({
      nodes: allNodes, currentNodeId: node.id,
      visitedNodeIds: [...visitedIds],
      foundPathIds: [...foundIds],
      prunedNodeIds: [...prunedIds],
      path: [...node.path],
      message: `递归进入：path.size() = ${node.path.length} < ${k}，进入 for 循环`,
      codeLine: 9,
      stats: { depth: node.depth, count: foundIds.length, need: k - node.path.length, remain: node.path.length },
    });

    for (const child of node.children) {
      if (child.isPruned) {
        if (child.isDirectPrune) {
          const upper = n - (k - node.path.length) + 1;
          steps.push({
            nodes: allNodes, currentNodeId: node.id,
            visitedNodeIds: [...visitedIds],
            foundPathIds: [...foundIds],
            prunedNodeIds: [...prunedIds],
            path: [...node.path],
            message: `剪枝：i = ${child.value} > ${upper}（剩余元素不够凑满 ${k} 个），循环终止`,
            codeLine: 13,
            stats: { depth: node.depth, count: foundIds.length, need: k - node.path.length, remain: node.path.length },
          });
        }
        continue;
      }

      visitedIds.push(child.id);

      // Push path
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...child.path],
        message: `处理节点：path.add(${child.value}) → [${child.path.join(', ')}]`,
        codeLine: 15,
        stats: { depth: child.depth, count: foundIds.length, need: k - child.path.length, remain: child.path.length },
      });

      // Recurse
      steps.push({
        nodes: allNodes, currentNodeId: child.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...child.path],
        message: `向下递归：backtrack(${Number(child.value) + 1}, path)`,
        codeLine: 16,
        stats: { depth: child.depth, count: foundIds.length, need: k - child.path.length, remain: child.path.length },
      });

      traverse(child);

      // Backtrack
      steps.push({
        nodes: allNodes, currentNodeId: node.id,
        visitedNodeIds: [...visitedIds],
        foundPathIds: [...foundIds],
        prunedNodeIds: [...prunedIds],
        path: [...node.path],
        message: `回溯撤销：path.remove(${child.value}) 恢复至 [${node.path.join(', ')}]`,
        codeLine: 17,
        stats: { depth: node.depth, count: foundIds.length, need: k - node.path.length, remain: node.path.length },
      });
    }
  }

  traverse(root);

  steps.push({
    nodes: allNodes, currentNodeId: 'root',
    visitedNodeIds: [...visitedIds],
    foundPathIds: [...foundIds],
    prunedNodeIds: [...prunedIds],
    path: [],
    message: `完成！共找到 ${foundIds.length} 个组合`,
    codeLine: 4,
    stats: { depth: 0, count: foundIds.length, need: 0, remain: 0 },
  });

  return steps;
}

function clampInt(raw: string, def: number, lo: number, hi: number): number {
  const v = parseInt(raw, 10);
  if (!Number.isFinite(v)) return def;
  return Math.max(lo, Math.min(hi, v));
}

/* ── Visualizer class ─────────────────────────────────────── */
export class CombinationOptimizedVisualizer extends StepVisualizer<BacktrackTreeStep> {
  protected codeLines = [
    'public List<List<Integer>> combine(int n, int k) {',
    '    List<List<Integer>> res = new ArrayList<>();',
    '    backtrack(1, new ArrayList<>(), res, n, k);',
    '    return res;',
    '}',
    '',
    'void backtrack(int start, List<Integer> path,',
    '               List<List<Integer>> res, int n, int k) {',
    '    if (path.size() == k) {',
    '        res.add(new ArrayList<>(path));',
    '        return;',
    '    }',
    '    // 剪枝：i <= n - (k - path.size()) + 1',
    '    for (int i = start; i <= n - (k - path.size()) + 1; i++) {',
    '        path.add(i);',
    '        backtrack(i + 1, path, res, n, k);',
    '        path.remove(path.size() - 1);',
    '    }',
    '}',
  ];
  protected codePanelTitle = '组合（优化）Java 源码';

  protected lineExplanations = {
    1: '主入口函数：接收总可选范围 1..n 与目标选取数量 k',
    2: '初始化全局二维结果集 res 用于收集所有叶子组合',
    3: '启动首层回溯递归：从数字 1 开始，初始路径为空 ArrayList',
    4: '回溯遍历完成，返回全部合法解集',
    8: '回溯核心递归函数：start 为当前层可选起点，path 维护当前决策栈',
    9: '【终止条件】当前路径已收集满 k 个元素',
    10: '【收集结果】必须深拷贝 new ArrayList<>(path) 并加入结果集',
    11: '递归回退到上一层',
    14: '【剪枝优化循环】：上界计算 i <= n - (k - path.size()) + 1，剩余不足 k 个直接跳出',
    15: '【做选择】：将当前候选数字 i 加入路径栈',
    16: '【向下递归】：进入下一层树，下一轮可选起点为 i + 1',
    17: '【撤销选择】：递归返回后弹出末尾元素，恢复栈现场',
  };

  protected keyPoints = {
    title: '回溯 5 步精讲与剪枝核心',
    summary: '组合问题（LeetCode 77）经典回溯 + 剩余候选剪枝模型',
    points: [
      { label: '1. 递归函数参数', desc: '除了 n, k 和 res，关键是 start 参数控制横向遍历的起始位置，防止出现 [1, 2] 与 [2, 1] 的重复组合。', icon: '📥' },
      { label: '2. 终止条件', desc: '当 path.size() == k 时，说明找到一个合法长度的子集，收集深拷贝后 return。', icon: '🛑' },
      { label: '3. 单层搜索逻辑', desc: 'for 循环横向枚举本层可选数字，递归深入纵向探索，并在递归返回后撤销选择。', icon: '🔁' },
      { label: '4. 剪枝优化原理', desc: '还需 (k - path.size()) 个元素，列表中剩余 (n - i + 1) 个元素。若 n - i + 1 < k - path.size() 则无解，由此推出循环上界 i <= n - (k - path.size()) + 1。', icon: '✂️' },
      { label: '5. 状态撤销回溯', desc: 'path.remove(path.size() - 1) 是回溯法的灵魂，确保深入探索后原路恢复，不污染兄弟分支。', icon: '🔙' },
    ],
  };

  protected problemDetail = {
    title: 'LeetCode 77. 组合 (Combinations)',
    leetcodeId: 77,
    leetcodeUrl: 'https://leetcode.cn/problems/combinations/',
    difficulty: 'medium' as const,
    description: '给定两个整数 n 和 k，返回范围 [1, n] 中所有可能的 k 个数的组合。\n\n你可以按任何顺序返回答案。\n\n**剪枝优化核心**：\n如果后续剩余的元素数量加上当前 path 中的元素数量不足 k 个，即 `(n - i + 1) < (k - path.size())`，则无需继续循环遍历，可直接将循环上界收紧为 `i <= n - (k - path.size()) + 1`。',
    examples: [
      { input: 'n = 4, k = 2', output: '[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]' },
      { input: 'n = 1, k = 1', output: '[[1]]' },
    ],
    constraints: ['1 <= n <= 20', '1 <= k <= n'],
    tags: ['回溯算法', '剪枝优化', '深度优先搜索'],
  };

  private currentStage: 'naive' | 'pruned' = 'pruned';
  private treeDisplay: HTMLElement | null = null;
  private pathStackContainer: HTMLElement | null = null;
  private pruningMonitorContainer: HTMLElement | null = null;
  private resultCollectionContainer: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.treeDisplay = this.root.querySelector('#combination-optimized-tree-display');
    this.pathStackContainer = this.root.querySelector('#co-path-stack-container');
    this.pruningMonitorContainer = this.root.querySelector('#co-pruning-monitor-container');
    this.resultCollectionContainer = this.root.querySelector('#co-result-collection-container');

    this.bindPlaybackControls();
    this.root.querySelector('#co-start')?.addEventListener('click', () => this.start());

    // Stage Tab switching
    const stage1Tab = this.root.querySelector('#co-tab-stage1');
    const stage2Tab = this.root.querySelector('#co-tab-stage2');
    const modeTag = this.root.querySelector('#co-current-mode-tag');

    stage1Tab?.addEventListener('click', () => {
      this.currentStage = 'naive';
      stage1Tab.classList.add('active');
      stage2Tab?.classList.remove('active');
      if (modeTag) modeTag.textContent = '完整决策树 (未剪枝)';
      this.start();
    });

    stage2Tab?.addEventListener('click', () => {
      this.currentStage = 'pruned';
      stage2Tab.classList.add('active');
      stage1Tab?.classList.remove('active');
      if (modeTag) modeTag.textContent = '剪枝优化模式';
      this.start();
    });

    // Example Chips
    this.root.querySelectorAll<HTMLButtonElement>('.co-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const nEl = this.root?.querySelector('#co-n') as HTMLInputElement | null;
        const kEl = this.root?.querySelector('#co-k') as HTMLInputElement | null;
        if (nEl) nEl.value = btn.dataset.n || '';
        if (kEl) kEl.value = btn.dataset.k || '';
        this.start();
      });
    });
  }

  protected buildSteps(): BacktrackTreeStep[] {
    const nEl = this.root?.querySelector('#co-n') as HTMLInputElement | null;
    const kEl = this.root?.querySelector('#co-k') as HTMLInputElement | null;
    const n = clampInt(nEl?.value || '4', 4, 1, 9);
    const k = clampInt(kEl?.value || '2', 2, 1, 9);

    if (this.currentStage === 'naive') {
      return combinationSteps(n, k);
    }
    return buildOptimizedSteps(n, k);
  }

  protected renderStep(step: BacktrackTreeStep): void {
    const nEl = this.root?.querySelector('#co-n') as HTMLInputElement | null;
    const kEl = this.root?.querySelector('#co-k') as HTMLInputElement | null;
    const n = clampInt(nEl?.value || '4', 4, 1, 9);
    const k = clampInt(kEl?.value || '2', 2, 1, 9);

    // 1. Render Tree SVG
    if (this.treeDisplay) {
      renderBacktrackTree({
        container: this.treeDisplay,
        step,
        cssPrefix: 'co',
      });
    }

    // 2. Render Path Stack in Card 2
    if (this.pathStackContainer) {
      BacktrackStateSpacePresenter.renderPathStack(this.pathStackContainer, step.path, {
        highlightLast: true,
        action: step.message.includes('add') ? 'push' : step.message.includes('remove') ? 'pop' : step.message.includes('找到') ? 'collect' : 'idle',
      });
    }

    // 3. Render Pruning Monitor in Card 2
    if (this.pruningMonitorContainer) {
      const need = k - step.path.length;
      const upper = n - need + 1;
      const isPruningEnabled = this.currentStage === 'pruned';
      const lastVal = Number(step.path[step.path.length - 1] ?? 0);
      BacktrackStateSpacePresenter.renderPruningMonitor(this.pruningMonitorContainer, {
        enabled: isPruningEnabled,
        formula: isPruningEnabled ? `i <= ${n} - (${k} - ${step.path.length}) + 1 = ${upper}` : '无剪枝：i <= n (全空间搜索)',
        neededElements: Math.max(0, need),
        remainingCapacity: Math.max(0, n - lastVal),
        conditionMet: isPruningEnabled && step.message.includes('剪枝'),
        message: isPruningEnabled
          ? (step.message.includes('剪枝') ? `⚠️ 触发剪枝：剩余候选不足 ${need} 个` : `当前所需: ${need} 个，遍历上界: ${upper}`)
          : '当前阶段搜索全解空间，不截断任何分支',
      });
    }

    // 4. Render Result Collection in Card 2
    if (this.resultCollectionContainer) {
      const results: Array<number[]> = [];
      const foundIds = step.foundPathIds || [];
      const nodeMap = new Map<string, BacktrackTreeNode>();
      step.nodes.forEach(nd => nodeMap.set(nd.id, nd));
      
      foundIds.forEach(id => {
        const nd = nodeMap.get(id);
        if (nd && nd.path.length === k) {
          results.push([...nd.path] as number[]);
        }
      });

      BacktrackStateSpacePresenter.renderResultCollection(
        this.resultCollectionContainer,
        results,
        results.length - 1
      );
    }
  }

  public reset(): void {
    super.reset();
    if (this.treeDisplay) this.treeDisplay.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'combination-optimized',
  name: '组合（优化）',
  viewId: 'algo-combination-optimized-view',
  category: 'backtracking',
  description: '剪枝优化：i <= n - (k - path.length) + 1',
  icon: '✂️',
  template,
  Visualizer: CombinationOptimizedVisualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '学会用剪枝优化回溯搜索',
});
