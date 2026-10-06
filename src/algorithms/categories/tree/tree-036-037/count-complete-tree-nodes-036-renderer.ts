/**
 * 完全二叉树节点个数 (Count Complete Tree Nodes · LeetCode 222 / Class 036 Code06)
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';
import {
  COUNT_NODES_STAGE1_CODE,
  COUNT_NODES_STAGE2_CODE,
  COUNT_NODES_STAGE3_CODE,
} from './count-complete-tree-nodes-036-stage-codes';
import {
  CountNodes036Step,
  buildCountNodesDfsSteps,
  buildCountNodesZuoshenSteps,
  buildCountNodesBinarySearchSteps,
  buildCountNodes036Steps,
  parseCountNodesInputs,
} from '../../../../core/renderers/adapters/count-complete-tree-nodes-step-compiler';
import {
  CountCompleteTreeNodesCanvasAdapter,
  renderCountNodesCanvasForStep,
} from '../../../../core/renderers/adapters/count-complete-tree-nodes-canvas-adapter';

// 兼容导出
export type { CountNodes036Step };
export {
  buildCountNodesDfsSteps,
  buildCountNodesZuoshenSteps,
  buildCountNodesBinarySearchSteps,
  buildCountNodes036Steps,
  renderCountNodesCanvasForStep,
};

export const countCompleteTreeNodes036Visualizer = registerDeclarativeAlgorithm<CountNodes036Step>({
  id: 'tree-036-count-complete-tree-nodes',
  aliases: ['leetcode-222', 'count-nodes', 'count-complete-tree-nodes', 'tree-036-code06'],
  name: '完全二叉树节点个数 (Class 036)',
  category: 'tree',
  icon: '🧮',
  difficulty: 2,
  levelOrder: 3609,
  learningGoal: '掌握完全二叉树右子树最左探测定界法，利用满树公式 2^k 实现 O((log N)^2) 极致递归剪枝',
  problemHtml: TREE_036_037_PROBLEMS.countCompleteTreeNodes036.html,

  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 朴素递归 DFS 遍历 (O(N) 遍历基准)',
      shortName: '朴素递归',
      num: 1,
      timeBadge: 'O(N) · O(H)',
      theme: 'bg-emerald' as const,
      badge: {
        mode: '深度优先 · 访问整树全部节点基准对照',
        complexity: 'O(N) · O(H) 递归调用',
      },
      card1Title: '🌳 完全二叉树拓扑结构与 DFS 访问沙盘',
      card2Title: '📊 递归调用栈与左右子树汇总看板',
      codeLanguages: COUNT_NODES_STAGE1_CODE,
      buildSteps: (inputs) => buildCountNodesDfsSteps(parseCountNodesInputs(inputs)),
      renderCanvas: (c, s) => CountCompleteTreeNodesCanvasAdapter.renderCanvas(c, s, '#10b981'),
      renderCustomMetrics: CountCompleteTreeNodesCanvasAdapter.renderStage1Metrics,
    },
    {
      id: 'stage-2',
      name: '阶段 2: 左神二分子树定界与公式剪枝 (Class 036 招牌)',
      shortName: '左神子树剪枝',
      num: 2,
      timeBadge: 'O((logN)²) · 极致剪枝',
      theme: 'bg-amber' as const,
      badge: {
        mode: '分治剪枝 · 右子树最左探测与满树公式 2^k',
        complexity: 'O((log N)²) 招牌剪枝',
      },
      card1Title: '⚡ 完全二叉树最左下潜与子树分治沙盘',
      card2Title: '🏎️ 满二叉树 2^k 公式定界与剪枝监视器',
      codeLanguages: COUNT_NODES_STAGE2_CODE,
      buildSteps: (inputs) => buildCountNodesZuoshenSteps(parseCountNodesInputs(inputs)),
      renderCanvas: (c, s) => CountCompleteTreeNodesCanvasAdapter.renderCanvas(c, s, '#f59e0b'),
      renderCustomMetrics: CountCompleteTreeNodesCanvasAdapter.renderStage2Metrics,
    },
    {
      id: 'stage-3',
      name: '阶段 3: 二分叶子编号 + 二进制寻路探测 (高阶二分)',
      shortName: '二进制寻路二分',
      num: 3,
      timeBadge: 'O((logN)²) · 二分查找',
      theme: 'bg-blue' as const,
      badge: {
        mode: '位运算寻路 · 二分底层叶子编号边界',
        complexity: 'O((log N)²) 位运算',
      },
      card1Title: '🔍 二进制寻路路径与叶子存在性探测沙盘',
      card2Title: '🧭 二分搜索区间 [low, high] 与位运算监视器',
      codeLanguages: COUNT_NODES_STAGE3_CODE,
      buildSteps: (inputs) => buildCountNodesBinarySearchSteps(parseCountNodesInputs(inputs)),
      renderCanvas: (c, s) => CountCompleteTreeNodesCanvasAdapter.renderCanvas(c, s, '#3b82f6'),
      renderCustomMetrics: CountCompleteTreeNodesCanvasAdapter.renderStage3Metrics,
    },
  ],

  // Fallback
  codeLanguages: COUNT_NODES_STAGE2_CODE,
  buildSteps: (inputs) => buildCountNodesZuoshenSteps(parseCountNodesInputs(inputs)),
  generateSteps: (inputs) => buildCountNodesZuoshenSteps(parseCountNodesInputs(inputs)),
  renderCanvas: (c, s) => CountCompleteTreeNodesCanvasAdapter.renderCanvas(c, s, '#f59e0b'),
  renderCustomMetrics: CountCompleteTreeNodesCanvasAdapter.renderStage2Metrics,

  inputs: [
    {
      id: 'tree',
      label: '完全二叉树',
      type: 'text',
      defaultValue: '1, 2, 3, 4, 5, 6',
      width: '160px',
    },
  ],
  presets: [
    {
      label: '示例 1 (6 节点)',
      values: { tree: '1, 2, 3, 4, 5, 6' },
      description: '总高度 3，节点数 6',
    },
    {
      label: '满二叉树 (7 节点)',
      values: { tree: '1, 2, 3, 4, 5, 6, 7' },
      description: '左右皆满',
    },
    {
      label: '单节点极限 (1 节点)',
      values: { tree: '1' },
      description: 'h=1',
    },
    {
      label: '4 层完全树 (10 节点)',
      values: { tree: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10' },
      description: 'h=4，底层 3 个叶子',
    },
  ],
});
