/**
 * 路径总和可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * 递归减法回溯、叶子节点精确判定、路径高亮与成功早停
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
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
  found: boolean;
  action: 'enter' | 'check-leaf' | 'match' | 'leave' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildPSSteps(root: TreeNode | null, targetSum: number): PSStep[] {
  const steps: PSStep[] = [];
  const currentPath: number[] = [];
  let found = false;

  steps.push({
    tree: root,
    current: null,
    targetSum,
    currentSum: 0,
    remain: targetSum,
    path: [],
    found: false,
    action: 'enter',
    message: root ? `初始化路径总和搜索：targetSum = ${targetSum}，从根节点 ${root.val} 开始递归。` : '空树，返回 false。',
    log: root ? `开始搜索 targetSum = ${targetSum}` : '空树 -> false',
    codeLine: 2,
  });

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      targetSum,
      currentSum: 0,
      remain: targetSum,
      path: [],
      found: false,
      action: 'done',
      message: '❌ 空树不存在根到叶路径，返回 false。',
      log: '✓ 未找到目标路径 (false)',
      codeLine: 3,
    });
    return steps;
  }

  const dfs = (node: TreeNode | null, remain: number, runningSum: number): boolean => {
    if (!node || found) return false;

    currentPath.push(node.val);
    const newSum = runningSum + node.val;
    const isLeaf = !node.left && !node.right;

    steps.push({
      tree: root,
      current: node.val,
      targetSum,
      currentSum: newSum,
      remain: targetSum - newSum,
      path: [...currentPath],
      found: false,
      action: 'enter',
      message: `进入节点 ${node.val}：当前路径 [${currentPath.join(' -> ')}]，当前累加和 = ${newSum} (目标 ${targetSum})。`,
      log: `进入 ${node.val} (和=${newSum})`,
      codeLine: 4,
    });

    if (isLeaf) {
      const match = node.val === remain;
      steps.push({
        tree: root,
        current: node.val,
        targetSum,
        currentSum: newSum,
        remain: targetSum - newSum,
        path: [...currentPath],
        found: match,
        action: match ? 'match' : 'check-leaf',
        message: match
          ? `🎯 成功到达叶子节点 ${node.val}！路径总和恰好等于 ${targetSum}！`
          : `到达叶子节点 ${node.val}，累加和 ${newSum} != ${targetSum}，回溯。`,
        log: match ? `✓ 找到目标路径: 和=${targetSum}` : `叶子 ${node.val} 和=${newSum} != ${targetSum}`,
        codeLine: [5, 6],
      });

      if (match) {
        found = true;
        return true;
      }
    }

    if (node.left && dfs(node.left, remain - node.val, newSum)) return true;
    if (node.right && dfs(node.right, remain - node.val, newSum)) return true;

    currentPath.pop();

    steps.push({
      tree: root,
      current: node.val,
      targetSum,
      currentSum: runningSum,
      remain: targetSum - runningSum,
      path: [...currentPath],
      found: false,
      action: 'leave',
      message: `回溯：离开节点 ${node.val}，移出路径。当前路径 [${currentPath.join(' -> ')}]。`,
      log: `回溯离开 ${node.val}`,
      codeLine: 8,
    });

    return false;
  };

  const finalFound = dfs(root, targetSum, 0);

  steps.push({
    tree: root,
    current: null,
    targetSum,
    currentSum: finalFound ? targetSum : 0,
    remain: finalFound ? 0 : targetSum,
    path: [...currentPath],
    found: finalFound,
    action: 'done',
    message: finalFound
      ? `🎉 搜索完成！存在根到叶路径总和为 ${targetSum} 的有效路径 (True)。`
      : `❌ 搜索完成！未找到根到叶路径总和为 ${targetSum} 的路径 (False)。`,
    log: finalFound ? '✓ 存在目标路径 (True)' : '✗ 不存在目标路径 (False)',
    codeLine: 9,
  });

  return steps;
}

function parseTreeInput(raw: string): (number | null)[] {
  return (raw || '5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1')
    .split(/[,，\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => (s === 'null' || s === '#' ? null : parseInt(s, 10)))
    .filter((n) => n === null || !isNaN(n));
}

const { template, Visualizer } = createDeclarativeVisualizer<PSStep>({
  id: 'path-sum',
  name: '路径总和',
  category: 'tree',
  icon: '🪜',
  badge: {
    mode: '回溯减法·叶子早停',
    complexity: 'O(n) · O(h)',
  },
  card1Title: '📊 根到叶递归路径沙盘',
  card2Title: '🧭 路径累加和与命中监视器',
  card2Desc: '当前搜索路径、累加总和、剩余差值与命中状态',
  legend: [
    { label: '命中目标路径', color: '#16a34a' },
    { label: '当前探索路径', color: '#fbbf24' },
    { label: '回溯节点', color: '#94a3b8' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1',
      width: '160px',
      placeholder: '5, 4, 8, 11, null, 13, 4...',
    },
    {
      id: 'input-target-sum',
      label: '目标和 targetSum',
      type: 'number',
      defaultValue: 22,
      width: '45px',
    },
  ],
  presets: [
    { label: '示例 1 (sum=22)', values: { 'input-tree': '5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1', 'input-target-sum': 22 } },
    { label: '简单示例 (sum=5)', values: { 'input-tree': '1, 2, 3', 'input-target-sum': 5 } },
    { label: '无匹配 (sum=100)', values: { 'input-tree': '1, 2, 3', 'input-target-sum': 100 } },
  ],
  metrics: [
    { id: 'cur-sum', label: '当前路径累加和', color: '#2563eb' },
    { id: 'remain-diff', label: '剩余所需差值', color: '#f59e0b' },
    { id: 'found-status', label: '路径总和判定', color: '#16a34a' },
  ],
  codeLanguages: PATH_SUM_CODE_LANGUAGES,
  problemHtml: PATH_SUM_PROBLEM_HTML,
  analysisHtml: PATH_SUM_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-tree'] || '5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1';
    const arr = parseTreeInput(raw);
    const root = buildTree(arr);
    const target = parseInt(inputs['input-target-sum'] || '22', 10);
    return buildPSSteps(root, target);
  },
  renderCanvas: (container, step) => {
    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.current,
      secondaryHighlightedNodes: step.path,
      primaryColor: step.found ? '#16a34a' : '#fbbf24',
      secondaryColor: step.found ? '#34d399' : '#93c5fd',
    });

    const root = container.closest('#algo-path-sum-view');
    if (root) {
      const sumEl = root.querySelector('#metric-cur-sum');
      const diffEl = root.querySelector('#metric-remain-diff');
      const foundEl = root.querySelector('#metric-found-status');

      if (sumEl) sumEl.textContent = `${step.currentSum} / ${step.targetSum}`;
      if (diffEl) diffEl.textContent = `${step.remain}`;
      if (foundEl) {
        foundEl.textContent = step.found ? '命中目标路径 (True)' : step.action === 'done' ? '无匹配路径 (False)' : '搜索探索中';
        foundEl.style.color = step.found ? '#16a34a' : step.action === 'done' ? '#ef4444' : '#2563eb';
      }

      // 在 Card 2 中展示当前路径
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; padding: 4px 0;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 10.5px; font-weight: 700; color: #475569;">当前回溯路径:</span>
              <span style="font-size: 10px; color: #64748b; font-family: monospace;">目标和: ${step.targetSum}</span>
            </div>
            <div style="padding: 4px 8px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: ${step.found ? '#16a34a' : '#2563eb'};">
              ${step.path.join(' -> ') || '未开始'}
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'path-sum',
  name: '路径总和',
  viewId: 'algo-path-sum-view',
  category: 'tree',
  description: '递归回溯减法求解根到叶路径总和是否等于目标值 targetSum',
  icon: '🪜',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 7,
  learningGoal: '掌握二叉树递归回溯中累计和与剩余差值的高效比对与叶子节点判决技巧',
});
