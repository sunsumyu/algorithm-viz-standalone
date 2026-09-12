/**
 * 组合总和可视化器（回溯）— 声明式 4-Card 标准架构
 * LeetCode 39：给定无重复元素的整数数组和一个目标整数，找出所有和为目标的组合
 * 元素可以无限重复选取，排序后进行剪枝优化
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { BacktrackStateSpacePresenter } from '../../../core/renderers/backtrack-state-space-presenter';
import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  layoutTree,
  flattenTree,
  renderBacktrackTree,
  resetContainerViewState,
} from './backtracking-tree-helper';
import {
  COMBINATION_SUM_PROBLEM_HTML,
  COMBINATION_SUM_ANALYSIS_HTML,
  COMBINATION_SUM_CODE_LANGUAGES,
} from './combination-sum-problem-content';

/** 决策树步骤 + 目标值与状态监视器指标 */
export type CombinationSumStep = BacktrackTreeStep & {
  target: number;
  metrics?: Record<string, string>;
};

/* ── Build the full decision tree ─────────────────────────── */
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

/** 为每一步附加目标值与状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: BacktrackTreeStep[], target: number): CombinationSumStep[] {
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

/* ── Card 1 主视觉：决策树沙盘 + 底部状态空间条 ─────────────── */
export function renderCombinationSumCanvas(container: HTMLElement, step: CombinationSumStep): void {
  // 骨架仅在切换运行（决策树变化）时重建，保证树视口缩放/平移状态跨步保留
  const skeletonKey = `${step.nodes.length}:${step.nodes[0]?.id ?? ''}`;
  if (container.dataset.combSumSkeletonKey !== skeletonKey) {
    const prevTree = container.querySelector<HTMLElement>('#combination-sum-tree-display');
    resetContainerViewState(prevTree);
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; width: 100%; box-sizing: border-box; gap: 8px;">
        <div id="combination-sum-tree-display" style="flex: 1; min-height: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;"></div>
        <div style="display: flex; gap: 8px; height: 118px; flex-shrink: 0;">
          <div style="flex: 1; min-width: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 10px; box-sizing: border-box; overflow: auto;">
            <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px;">📚 当前路径栈 path</div>
            <div id="cs-path-stack-container" style="min-height: 24px;"></div>
          </div>
          <div style="flex: 1; min-width: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 10px; box-sizing: border-box; overflow: auto;">
            <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px;">∑ 累加和与剪枝监视器</div>
            <div id="cs-sum-monitor-container"></div>
          </div>
          <div style="flex: 1.4; min-width: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 10px; box-sizing: border-box; overflow: auto;">
            <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px;">✅ 解集箱（合法组合）</div>
            <div id="cs-result-collection-container" style="min-height: 24px;"></div>
          </div>
        </div>
      </div>
    `;
    container.dataset.combSumSkeletonKey = skeletonKey;
  }

  // 1. 渲染 SVG 决策树沙盘
  const treeDisplay = container.querySelector<HTMLElement>('#combination-sum-tree-display');
  if (treeDisplay) {
    renderBacktrackTree({
      container: treeDisplay,
      step,
      cssPrefix: 'cs',
      nodeLabel: (nd) => (nd.id === 'root' ? '[]' : nd.value),
    });
  }

  // 2. 渲染当前路径栈
  const pathStackContainer = container.querySelector<HTMLElement>('#cs-path-stack-container');
  if (pathStackContainer) {
    const isPush = step.message.includes('做选择');
    const isPop = step.message.includes('回溯撤销');
    const isCollect = step.message.includes('找到合法组合');
    BacktrackStateSpacePresenter.renderPathStack(pathStackContainer, step.path || [], {
      action: isPush ? 'push' : isPop ? 'pop' : isCollect ? 'collect' : 'idle',
    });
  }

  // 3. 渲染累加和与剪枝不等式监视器
  const sumMonitorContainer = container.querySelector<HTMLElement>('#cs-sum-monitor-container');
  const target = step.target;
  if (sumMonitorContainer) {
    const curSum = (step.path as number[]).reduce((a, b) => a + b, 0);
    const remaining = target - curSum;
    const isOver = curSum > target;
    const isMatch = curSum === target;

    let badgeHtml = '';
    if (isMatch) {
      badgeHtml = `<span style="color:#059669; font-weight:700; background:#ecfdf5; padding:2px 6px; border-radius:4px; border:1px solid #a7f3d0;">✓ sum == target (命中)</span>`;
    } else if (isOver) {
      badgeHtml = `<span style="color:#dc2626; font-weight:700; background:#fef2f2; padding:2px 6px; border-radius:4px; border:1px solid #fecaca;">✕ sum > target (超额)</span>`;
    } else {
      badgeHtml = `<span style="color:#2563eb; font-weight:700; background:#eff6ff; padding:2px 6px; border-radius:4px; border:1px solid #bfdbfe;">探索中: 尚需 ${remaining}</span>`;
    }

    sumMonitorContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>当前累加和: <strong style="color:#0f172a; font-family:monospace; font-size:12px;">${curSum}</strong> / ${target}</span>
          ${badgeHtml}
        </div>
        <div style="background: #f1f5f9; border-radius: 6px; height: 6px; overflow: hidden; position: relative;">
          <div style="background: ${isMatch ? '#10b981' : isOver ? '#ef4444' : '#3b82f6'}; width: ${Math.min(100, (curSum / target) * 100)}%; height: 100%; transition: width 0.2s;"></div>
        </div>
        <div style="font-size: 10.5px; color: #64748b;">剪枝规则: <code style="color:#b45309; font-family:monospace;">sum + c[i] > target => break</code></div>
      </div>
    `;
  }

  // 4. 渲染实时解集箱
  const nodeMap = new Map<string, BacktrackTreeNode>();
  step.nodes.forEach((nd) => nodeMap.set(nd.id, nd));
  const solutionsUpToNow: Array<Array<number | string>> = (step.foundPathIds || [])
    .map((id) => [...(nodeMap.get(id)?.path ?? [])]);

  const resultCollectionContainer = container.querySelector<HTMLElement>(
    '#cs-result-collection-container'
  );
  if (resultCollectionContainer) {
    BacktrackStateSpacePresenter.renderResultCollection(
      resultCollectionContainer,
      solutionsUpToNow,
      -1
    );
  }
}

registerDeclarativeAlgorithm({
  id: 'combination-sum',
  name: '组合总和',
  category: 'backtracking',
  description: '无重复元素，可重复选取，剪枝求目标总和',
  icon: '🎯',
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '掌握元素可重复选取的回溯搜索与累加和剪枝',
  inputs: [
    {
      id: 'candidates',
      label: '候选数组',
      type: 'text',
      defaultValue: '2,3,6,7',
      placeholder: '逗号分隔的无重复正整数',
    },
    { id: 'target', label: '目标值 target', type: 'number', defaultValue: 7, min: 1, max: 20 },
  ],
  presets: [
    { label: '基础示例', values: { candidates: '2,3,6,7', target: 7 } },
    { label: '2,3,5 → 8', values: { candidates: '2,3,5', target: 8 } },
    { label: '2,4,6 → 6', values: { candidates: '2,4,6', target: 6 } },
    { label: '大目标', values: { candidates: '2,3,6,7', target: 12 } },
  ],
  metrics: [
    { id: 'sum', label: '当前累加和 / target', color: '#2563eb' },
    { id: 'remaining', label: '剩余差额', color: '#f59e0b' },
    { id: 'depth', label: '递归深度', color: '#a855f7' },
    { id: 'found', label: '已找到组合', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '📍当前探索', color: '#3b82f6' },
    { label: '✅解集命中', color: '#10b981' },
    { label: '✂️剪枝截断', color: '#ef4444' },
    { label: '🔙已回溯', color: '#94a3b8' },
  ],
  codeLanguages: COMBINATION_SUM_CODE_LANGUAGES,
  problemHtml: COMBINATION_SUM_PROBLEM_HTML,
  analysisHtml: COMBINATION_SUM_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const rawCands = String(inputs.candidates ?? '2,3,6,7')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);

    const sorted = Array.from(new Set(rawCands.length > 0 ? rawCands : [2, 3, 6, 7])).sort((a, b) => a - b);
    let target = parseInt(String(inputs.target ?? 7), 10);
    if (!Number.isFinite(target) || target <= 0) target = 7;
    if (target > 30) target = 30;

    return withMetrics(buildCombinationSumSteps(sorted, target), target);
  },
  renderCanvas: (container, step) => renderCombinationSumCanvas(container, step as CombinationSumStep),
});
