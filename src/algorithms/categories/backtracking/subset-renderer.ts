/**
 * 子集可视化器（回溯算法）— 声明式 4-Card 标准架构
 * LeetCode 78：给定不含重复数字的整数数组，返回所有可能的子集
 * 核心：全树节点收集 (收集树上的每一个状态)
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
  SUBSET_PROBLEM_HTML,
  SUBSET_ANALYSIS_HTML,
  SUBSET_CODE_LANGUAGES,
} from './subset-problem-content';

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
function withMetrics(steps: SubsetStep[]): SubsetStep[] {
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

/* ── Card 1 主视觉：决策树沙盘 + 底部状态空间条 ─────────────── */
export function renderSubsetCanvas(container: HTMLElement, step: SubsetStep): void {
  // 骨架仅在切换运行（决策树变化）时重建，保证树视口缩放/平移状态跨步保留
  const skeletonKey = `${step.nodes.length}:${step.nodes[0]?.id ?? ''}`;
  if (container.dataset.subsetSkeletonKey !== skeletonKey) {
    const prevTree = container.querySelector<HTMLElement>('#subset-tree-display');
    resetContainerViewState(prevTree);
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; width: 100%; box-sizing: border-box; gap: 8px;">
        <div id="subset-tree-display" style="flex: 1; min-height: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;"></div>
        <div style="display: flex; gap: 8px; height: 118px; flex-shrink: 0;">
          <div style="flex: 1; min-width: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 10px; box-sizing: border-box; overflow: auto;">
            <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px;">📚 当前路径栈 path</div>
            <div id="sb-path-stack-container" style="min-height: 24px;"></div>
          </div>
          <div style="flex: 1; min-width: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 10px; box-sizing: border-box; overflow: auto;">
            <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px;">📦 幂集收集监视器</div>
            <div id="sb-collector-monitor-container"></div>
          </div>
          <div style="flex: 1.4; min-width: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 10px; box-sizing: border-box; overflow: auto;">
            <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px;">✅ 解集箱（已收集子集）</div>
            <div id="sb-result-collection-container" style="min-height: 24px;"></div>
          </div>
        </div>
      </div>
    `;
    container.dataset.subsetSkeletonKey = skeletonKey;
  }

  // 1. 渲染 SVG 决策树沙盘
  const treeDisplay = container.querySelector<HTMLElement>('#subset-tree-display');
  if (treeDisplay) {
    renderBacktrackTree({
      container: treeDisplay,
      step,
      cssPrefix: 'sb',
      nodeLabel: (nd) => (nd.id === 'root' ? '[]' : nd.value),
    });
  }

  // 2. 渲染当前路径栈
  const pathStackContainer = container.querySelector<HTMLElement>('#sb-path-stack-container');
  if (pathStackContainer) {
    const isPush = step.message.includes('做选择');
    const isPop = step.message.includes('回溯撤销');
    const isCollect = step.message.includes('收集子集');
    BacktrackStateSpacePresenter.renderPathStack(pathStackContainer, step.path || [], {
      action: isPush ? 'push' : isPop ? 'pop' : isCollect ? 'collect' : 'idle',
    });
  }

  // 3. 渲染全节点收集监视器
  const rootNode = step.nodes.find((n) => n.id === 'root');
  const nums = rootNode ? rootNode.children.map((c) => parseInt(c.value, 10)) : [];
  const totalPowerSet = Math.pow(2, nums.length);

  const nodeMap = new Map(step.nodes.map((n) => [n.id, n]));
  const solutionsUpToNow: number[][] = step.foundPathIds.map(
    (id) => [...((nodeMap.get(id)?.path as number[]) ?? [])]
  );

  const collectorMonitorContainer = container.querySelector<HTMLElement>(
    '#sb-collector-monitor-container'
  );
  if (collectorMonitorContainer) {
    const percent = Math.min(100, (solutionsUpToNow.length / totalPowerSet) * 100);
    collectorMonitorContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>幂集收集: <strong style="color: #0f172a; font-family: monospace; font-size: 12px;">${solutionsUpToNow.length}</strong> / 2^${nums.length} = ${totalPowerSet}</span>
          <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;">
            ${percent.toFixed(0)}% 完成
          </span>
        </div>
        <div style="background: #f1f5f9; border-radius: 6px; height: 6px; overflow: hidden; position: relative;">
          <div style="background: #10b981; width: ${percent}%; height: 100%; transition: width 0.2s;"></div>
        </div>
        <div style="font-size: 10.5px; color: #64748b; line-height: 1.4;">
          <div>• 特征: 每一个节点进入即 <code style="color:#b45309; font-family:monospace;">res.add(path)</code></div>
          <div>• 无需剪枝，全树展开遍历所有路径</div>
        </div>
      </div>
    `;
  }

  // 4. 渲染实时解集箱
  const resultCollectionContainer = container.querySelector<HTMLElement>(
    '#sb-result-collection-container'
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
  id: 'subset',
  name: '子集',
  category: 'backtracking',
  description: '求无重复数组的所有子集（幂集），全节点收集',
  icon: '📦',
  difficulty: 2,
  levelOrder: 9,
  learningGoal: '掌握子集问题的全节点收集特性与 2^N 幂集回溯模型',
  inputs: [
    {
      id: 'nums',
      label: '数组 nums',
      type: 'text',
      defaultValue: '1,2,3',
      placeholder: '逗号分隔的不同元素（≤5 个）',
    },
  ],
  presets: [
    { label: '基础示例', values: { nums: '1,2,3' } },
    { label: '两个元素', values: { nums: '1,2' } },
    { label: '四个元素', values: { nums: '1,2,3,4' } },
    { label: '含较大值', values: { nums: '2,4,6,8' } },
  ],
  metrics: [
    { id: 'depth', label: '递归深度', color: '#2563eb' },
    { id: 'path', label: '路径栈 path', color: '#a855f7' },
    { id: 'collected', label: '已收集子集', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#f59e0b' },
  ],
  legend: [
    { label: '📍当前探索', color: '#3b82f6' },
    { label: '✅子集收集节点', color: '#10b981' },
    { label: '🔙已回溯', color: '#94a3b8' },
  ],
  codeLanguages: SUBSET_CODE_LANGUAGES,
  problemHtml: SUBSET_PROBLEM_HTML,
  analysisHtml: SUBSET_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const rawNums = String(inputs.nums ?? '1,2,3')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const nums = rawNums.length > 0 ? Array.from(new Set(rawNums)) : [1, 2, 3];
    if (nums.length > 5) nums.length = 5; // 防止组合爆炸
    return withMetrics(buildSubsetSteps(nums));
  },
  renderCanvas: (container, step) => renderSubsetCanvas(container, step as SubsetStep),
});
