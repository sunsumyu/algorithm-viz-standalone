/**
 * 路径总和可视化器 (Path Sum & Path Sum II · LeetCode 112 & 113 / Class 037 Code03)
 * 采用顶层声明式架构与双版本综合长处整合 (Bi-Version Synthesis)
 * 融合旧版本输入交互/树拓扑高亮与左神 Class 037 名师讲义/回溯路径弹出与全解收集
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { HighlightTarget } from '../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import {
  PATH_SUM_PROBLEM_HTML,
  PATH_SUM_ANALYSIS_HTML,
  PATH_SUM_CODE_LANGUAGES,
} from './path-sum-problem-content';

export interface PSStep {
  tree: TreeNode | null;
  current: number | null;
  targetSum: number;
  currentSum: number;
  remain: number;
  path: number[];
  allPaths: number[][];
  found: boolean;
  decision: string;
  action: 'enter' | 'check-leaf' | 'match' | 'leave' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export const PATH_SUM_CODE_LINES = {
  init: { java: 2, cpp: 3, python: 2, javascript: 1 },
  empty: { java: 3, cpp: 4, python: [3, 4], javascript: 2 },
  enter: { java: 3, cpp: 4, python: 3, javascript: 2 },
  leafCheck: { java: [5, 6], cpp: [5, 6], python: [5, 6], javascript: [3, 4] },
  leave: { java: 9, cpp: 8, python: 7, javascript: 6 },
  done: { java: 9, cpp: 8, python: 7, javascript: 6 },
};

export function buildPSSteps(root: TreeNode | null, targetSum: number): PSStep[] {
  const steps: PSStep[] = [];
  const currentPath: number[] = [];
  const allPaths: number[][] = [];
  let found = false;

  // Step 0: 入口
  steps.push({
    tree: root,
    current: null,
    targetSum,
    currentSum: 0,
    remain: targetSum,
    path: [],
    allPaths: [],
    found: false,
    decision: `算法启动：寻找根到叶总和为 ${targetSum} 的路径`,
    action: 'enter',
    message: root
      ? `初始化路径搜索：目标和 targetSum = ${targetSum}，从根节点 ${root.val} 启动 DFS 回溯。`
      : '空树，直接判定无合法路径，返回 false。',
    log: root ? `pathSum(root: ${root.val}, targetSum: ${targetSum})` : 'root is null -> false',
    metrics: { '目标和 targetSum': targetSum, '已收集路径': 0 },
    codeLine: PATH_SUM_CODE_LINES.init,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      targetSum,
      currentSum: 0,
      remain: targetSum,
      path: [],
      allPaths: [],
      found: false,
      decision: '特判返回：树为空',
      action: 'done',
      message: '树为空，无合法路径。',
      log: 'return false',
      metrics: { '目标和 targetSum': targetSum, '有效路径数': 0 },
      codeLine: PATH_SUM_CODE_LINES.empty,
    });
    return steps;
  }

  function dfs(node: TreeNode | null, curSum: number): void {
    if (!node) return;

    curSum += node.val;
    currentPath.push(node.val);
    const remain = targetSum - curSum;

    // 深入节点并推入路径
    steps.push({
      tree: root,
      current: node.val,
      targetSum,
      currentSum: curSum,
      remain,
      path: [...currentPath],
      allPaths: allPaths.map((p) => [...p]),
      found,
      decision: `访问节点 ${node.val} 并压入回溯路径`,
      action: 'enter',
      message: `节点 ${node.val} 入栈，当前路径和 = ${curSum}，距离目标和尚差 ${remain}。`,
      log: `push ${node.val} -> path: [${currentPath.join(' -> ')}], curSum = ${curSum}`,
      metrics: { '当前节点': node.val, '当前路径累加和': curSum, '剩余差额': remain },
      codeLine: PATH_SUM_CODE_LINES.enter,
    });

    const isLeaf = !node.left && !node.right;

    if (isLeaf) {
      if (curSum === targetSum) {
        found = true;
        allPaths.push([...currentPath]);
        steps.push({
          tree: root,
          current: node.val,
          targetSum,
          currentSum: curSum,
          remain: 0,
          path: [...currentPath],
          allPaths: allPaths.map((p) => [...p]),
          found: true,
          decision: `🎉 到达叶子节点 ${node.val}，累加和恰好等于目标和 ${targetSum}！`,
          action: 'match',
          message: `🎯 命中解！从根到叶路径 [${currentPath.join(' -> ')}] 之和等于 ${targetSum}，成功收录！`,
          log: `⭐ MATCH: [${currentPath.join(' -> ')}] = ${targetSum}`,
          metrics: { '当前节点': node.val, '状态': '命中目标解', '有效路径数': allPaths.length },
          codeLine: PATH_SUM_CODE_LINES.leafCheck,
        });
      } else {
        steps.push({
          tree: root,
          current: node.val,
          targetSum,
          currentSum: curSum,
          remain,
          path: [...currentPath],
          allPaths: allPaths.map((p) => [...p]),
          found,
          decision: `到达叶子节点 ${node.val}，但和为 ${curSum} != ${targetSum}`,
          action: 'check-leaf',
          message: `叶子节点检查不满足：路径和为 ${curSum}，与目标 ${targetSum} 不符，准备回溯。`,
          log: `leaf mismatch: sum ${curSum} != ${targetSum}`,
          metrics: { '当前节点': node.val, '状态': '叶子和不匹配' },
          codeLine: PATH_SUM_CODE_LINES.leafCheck,
        });
      }
    } else {
      if (node.left) dfs(node.left, curSum);
      if (node.right) dfs(node.right, curSum);
    }

    // 回溯清理现场
    currentPath.pop();
    steps.push({
      tree: root,
      current: node.val,
      targetSum,
      currentSum: curSum - node.val,
      remain: targetSum - (curSum - node.val),
      path: [...currentPath],
      allPaths: allPaths.map((p) => [...p]),
      found,
      decision: `回溯：节点 ${node.val} 出栈清理现场`,
      action: 'leave',
      message: `节点 ${node.val} 左右分支探索完毕，执行回溯出栈，恢复现场为 [${currentPath.join(' -> ')}]。`,
      log: `pop ${node.val} -> backtrack`,
      metrics: { '回溯弹出节点': node.val, '现场路径': `[${currentPath.join(' -> ')}]` },
      codeLine: PATH_SUM_CODE_LINES.leave,
    });
  }

  dfs(root, 0);

  steps.push({
    tree: root,
    current: null,
    targetSum,
    currentSum: 0,
    remain: 0,
    path: [],
    allPaths: allPaths.map((p) => [...p]),
    found,
    decision: '全树路径总和探索完成',
    action: 'done',
    message: found
      ? `🎉 搜索全部结束！共找到 ${allPaths.length} 条和为 ${targetSum} 的有效路径: ${JSON.stringify(allPaths)}。`
      : `搜索全部结束，未找到任何和为 ${targetSum} 的根到叶路径。`,
    log: `done pathSum found=${found} count=${allPaths.length}`,
    metrics: { '探索状态': '完成', '有效路径数': allPaths.length },
    codeLine: PATH_SUM_CODE_LINES.done,
  });

  return steps;
}

export const pathSumVisualizer = registerDeclarativeAlgorithm<PSStep>({
  id: 'path-sum',
  aliases: ['tree-037-path-sum-ii'],
  name: '路径总和与收集所有路径',
  category: 'tree',
  icon: '🪜',
  badge: {
    mode: 'DFS 递归回溯与现场恢复',
    complexity: 'O(n) · O(h)',
  },
  card1Title: '📊 二叉树拓扑与当前回溯路径沙盘',
  card2Title: '🧭 路径累加和与解集收集监视器',
  card2Desc: '实时当前路径栈、剩余差额及已收集解集二维看板',
  legend: [
    { label: '当前访问节点', color: '#fbbf24' },
    { label: '当前路径栈', color: '#93c5fd' },
    { label: '命中目标解', color: '#16a34a' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1',
      width: '180px',
      placeholder: '5, 4, 8, 11...',
    },
    {
      id: 'input-target-sum',
      label: '目标和 targetSum',
      type: 'number',
      defaultValue: 22,
      width: '50px',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 1: 经典双解 (sum=22)',
      values: {
        'input-tree': '5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1',
        'input-target-sum': 22,
      },
      description: '两条有效路径 [5,4,11,2] 和 [5,8,4,5]',
    },
    {
      label: '单解路径示例 (sum=18)',
      values: {
        'input-tree': '1, 2, 3, 4, 5, 6, 7',
        'input-target-sum': 10,
      },
      description: '满二叉树路径 [1, 3, 6]',
    },
    {
      label: '无匹配过大目标 (sum=100)',
      values: {
        'input-tree': '1, 2, 3',
        'input-target-sum': 100,
      },
      description: '搜索完全探索但无解',
    },
  ],
  metrics: [
    { id: 'cur-sum', label: '当前路径累加和', color: '#2563eb' },
    { id: 'remain-diff', label: '剩余所需差值', color: '#f59e0b' },
    { id: 'found-status', label: '有效路径数', color: '#16a34a' },
  ],
  codeLanguages: PATH_SUM_CODE_LANGUAGES,
  problemHtml: PATH_SUM_PROBLEM_HTML,
  analysisHtml: PATH_SUM_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const raw = inputs?.['input-tree'] || inputs?.['tree'] || '5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1';
    const arr = parseTreeArray(raw, [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1]);
    const root = buildTree(arr);
    const target = parseInt(String(inputs?.['input-target-sum'] ?? inputs?.['targetSum'] ?? '22'), 10);
    return buildPSSteps(root, target);
  },
  buildSteps: (inputs) => {
    const raw = inputs?.['input-tree'] || inputs?.['tree'] || '5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1';
    const arr = parseTreeArray(raw, [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1]);
    const root = buildTree(arr);
    const target = parseInt(String(inputs?.['input-target-sum'] ?? inputs?.['targetSum'] ?? '22'), 10);
    return buildPSSteps(root, target);
  },
  renderCanvas: (container, step) => {
    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.current,
      secondaryHighlightedNodes: step.path,
      primaryColor: step.found ? '#16a34a' : '#fbbf24',
      secondaryColor: '#93c5fd',
    });

    const root = container.closest('#algo-path-sum-view') || container.parentElement;
    if (root) {
      const sumEl = root.querySelector('#metric-cur-sum');
      const diffEl = root.querySelector('#metric-remain-diff');
      const foundEl = root.querySelector('#metric-found-status') as HTMLElement | null;

      if (sumEl) sumEl.textContent = `${step.currentSum} / ${step.targetSum}`;
      if (diffEl) diffEl.textContent = `${step.remain}`;
      if (foundEl) {
        foundEl.textContent = `${step.allPaths.length} 条已收集`;
        foundEl.style.color = step.allPaths.length > 0 ? '#16a34a' : '#64748b';
      }

      // 在 Card 2 中展示当前路径与全部收集结果
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const pathChips =
          step.path.length > 0
            ? step.path
                .map(
                  (v, idx) => `
                <div style="display: flex; align-items: center;">
                  <span style="padding: 2px 8px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: monospace;">${v}</span>
                  ${idx < step.path.length - 1 ? '<span style="color: #94a3b8; font-size: 10px; margin: 0 4px;">➔</span>' : ''}
                </div>`
                )
                .join('')
            : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">路径为空 (回溯到根节点外)</span>';

        const allPathsHtml =
          step.allPaths.length > 0
            ? step.allPaths
                .map(
                  (p, idx) => `
                <div style="display: flex; align-items: center; gap: 6px; padding: 2px 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
                  <span style="font-size: 10.5px; font-weight: 700; color: #166534;">解 ${idx + 1}:</span>
                  <span style="font-size: 11px; font-family: monospace; color: #15803d; font-weight: 600;">[${p.join(' ➔ ')}]</span>
                </div>`
                )
                .join('')
            : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">等待首条匹配路径...</span>';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #475569; padding: 6px 0;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 11px; font-weight: 700; color: #334155;">当前 DFS 回溯路径栈:</span>
              <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                ${pathChips}
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 4px;">
              <span style="font-size: 11px; font-weight: 700; color: #334155;">已收集有效路径总集 (LC 113):</span>
              <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                ${allPathsHtml}
              </div>
            </div>

            <div style="padding: 8px 10px; background: #f1f5f9; border-radius: 6px; font-size: 11px; color: #475569;">
              <div style="font-weight: 700; color: #1e293b; margin-bottom: 2px;">🧭 决策推演: ${step.decision}</div>
              <div>${step.message}</div>
            </div>
          </div>
        `;
      }
    }
  },
});
