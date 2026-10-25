/**
 * 左程云算法通关课 Class 037: 二叉搜索树最近公共祖先 (LCA in BST / LeetCode 235)
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)
 * Card 1: 纯净 BST 拓扑与分流沙盘
 * Card 2: 统一标准顶层抽象 RecursiveCallTraceAdapter (Stage 1) / 迭代状态流 (Stage 2)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { Tree036Step } from './tree-036-037-shared';
import {
  LCA_BST_037_STAGE1_CODES,
  LCA_BST_037_STAGE2_CODES,
} from './tree-036-037-stage-codes';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';
import {
  buildLcaBst037Steps,
  buildLcaBstStage1RecursiveSteps,
  buildLcaBstStage2IterativeSteps,
} from '../../../../core/renderers/adapters/lowest-common-ancestor-bst-step-compiler';
import {
  LowestCommonAncestorBstCanvasAdapter,
  renderLcaBstCanvas,
} from '../../../../core/renderers/adapters/lowest-common-ancestor-bst-canvas-adapter';

export {
  buildLcaBst037Steps,
  buildLcaBstStage1RecursiveSteps,
  buildLcaBstStage2IterativeSteps,
  renderLcaBstCanvas,
};

export const lowestCommonAncestorBst037Visualizer = registerDeclarativeAlgorithm<Tree036Step>({
  id: 'tree-037-lowest-common-ancestor-bst',
  aliases: ['bst-lca', 'leetcode-235', '235', 'lowest-common-ancestor-bst'],
  name: '二叉搜索树最近公共祖先 (Class 037)',
  category: 'tree',
  icon: '🔍',
  hasDeductionTree: true,
  difficulty: 1,
  levelOrder: 3702,
  learningGoal: '领会二叉搜索树分叉点定理，利用数值单调性在 O(h) 时间与 O(1) 空间内直接定位 LCA',
  badge: { mode: '多阶段演化: 递归单调分流 · 迭代常数空间', complexity: 'O(H) · O(1)' },
  card1Title: '🌲 BST 拓扑结构与目标点分流沙盘',
  card2Title: '🧭 递归推演树与状态空间监视器',
  card2Desc: '基于 BST 严格单调性的递归栈帧树与迭代指针实时监视',
  problemHtml: TREE_036_037_PROBLEMS.lowestCommonAncestorBst037.html,
  codeLanguages: LCA_BST_037_STAGE1_CODES,
  inputs: [
    {
      id: 'tree',
      label: 'BST 层序',
      type: 'text',
      defaultValue: '6, 2, 8, 0, 4, 7, 9, null, null, 3, 5',
      width: '180px',
    },
    {
      id: 'p',
      label: '节点 p',
      type: 'number',
      defaultValue: '3',
      width: '60px',
    },
    {
      id: 'q',
      label: '节点 q',
      type: 'number',
      defaultValue: '5',
      width: '60px',
    },
  ],
  presets: [
    {
      label: '分叉在深层 (p=3, q=5 -> 4)',
      values: { tree: '6, 2, 8, 0, 4, 7, 9, null, null, 3, 5', p: '3', q: '5' },
    },
    {
      label: '分叉点在根 (p=2, q=8 -> 6)',
      values: { tree: '6, 2, 8, 0, 4, 7, 9, null, null, 3, 5', p: '2', q: '8' },
    },
    {
      label: '分叉在左树 (p=2, q=4 -> 2)',
      values: { tree: '6, 2, 8, 0, 4, 7, 9, null, null, 3, 5', p: '2', q: '4' },
    },
  ],
  metrics: [
    { id: 'lca-val', label: '分叉节点 (LCA)', color: '#10b981' },
    { id: 'cur-val', label: '当前数值', color: '#3b82f6' },
    { id: 'p-val', label: '目标 p', color: '#f59e0b' },
    { id: 'q-val', label: '目标 q', color: '#f59e0b' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 递归自顶向下分叉',
      shortName: '递归分叉',
      card2Desc: '利用 BST 左小右大单调性递归下探，挂载标准 RecursiveCallTrace 递归树',
      codeLanguages: LCA_BST_037_STAGE1_CODES,
      generateSteps: (inputs) => buildLcaBstStage1RecursiveSteps(inputs?.tree, inputs?.p, inputs?.q),
      renderCanvas: (container, step) => LowestCommonAncestorBstCanvasAdapter.renderCanvas(container, step),
      renderCustomMetrics: (c, s) => LowestCommonAncestorBstCanvasAdapter.renderStage1Metrics(c, s),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 迭代常数空间下移',
      shortName: '迭代常数',
      card2Desc: '利用 while 循环指针下移，不消耗递归调用栈，实现空间复杂度 O(1)',
      codeLanguages: LCA_BST_037_STAGE2_CODES,
      generateSteps: (inputs) => buildLcaBstStage2IterativeSteps(inputs?.tree, inputs?.p, inputs?.q),
      renderCanvas: (container, step) => LowestCommonAncestorBstCanvasAdapter.renderCanvas(container, step),
      renderCustomMetrics: (c, s) => LowestCommonAncestorBstCanvasAdapter.renderStage2Metrics(c, s),
    },
  ],
  generateSteps: (inputs) => buildLcaBst037Steps(inputs?.tree, inputs?.p, inputs?.q),
  renderCanvas: (container, step) => LowestCommonAncestorBstCanvasAdapter.renderCanvas(container, step),
  renderCustomMetrics: (c, s) => LowestCommonAncestorBstCanvasAdapter.renderStage1Metrics(c, s),
});
