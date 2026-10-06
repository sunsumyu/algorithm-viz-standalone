/**
 * 删除二叉搜索树中的节点可视化器 (Delete Node in a BST · LeetCode 450)
 * 采用顶层声明式架构与轻量领域适配器 (Thin Domain Adapter)
 *
 * Stage 1: 递归直接嫁接删除 (Recursive Child Grafting · LC 450 优雅指针重连)
 * Stage 2: 递归后继节点值覆盖 (Recursive Successor Replacement · 算法导论经典解法)
 * Stage 3: 双指针显式迭代删除 (Iterative Two-Pointers BST Deletion · O(1) 辅助空间)
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { buildTreeFromArr } from './tree-template';
import { BST_DELETE_PROBLEM_HTML, BST_DELETE_ANALYSIS_HTML } from './bst-delete-problem-content';
import {
  BST_DELETE_STAGE1_GRAFT_CODE,
  BST_DELETE_STAGE2_REPLACE_CODE,
  BST_DELETE_STAGE3_ITERATIVE_CODE,
} from './bst-delete-stage-codes';
import {
  type BSTDeleteStep,
  collectTreeValues,
  buildBstDeleteStage1Steps,
  buildBstDeleteStage2Steps,
  buildBstDeleteStage3Steps,
} from '../../../core/renderers/adapters/bst-delete-step-compiler';
import { BstDeleteCanvasAdapter } from '../../../core/renderers/adapters/bst-delete-canvas-adapter';

export type { BSTDeleteStep };
export { collectTreeValues, buildBstDeleteStage1Steps, buildBstDeleteStage2Steps, buildBstDeleteStage3Steps };
export const renderBstDeleteCustomMetrics = BstDeleteCanvasAdapter.renderCustomMetrics;

const parseInput = (inputs?: Record<string, any>) => {
  const rawTree = parseTreeArray(inputs?.['input-tree'] || '5, 3, 6, 2, 4, null, 7', [5, 3, 6, 2, 4, null, 7]);
  const root = buildTreeFromArr(rawTree);
  const key = Number(inputs?.['input-key'] ?? 3);
  return { root, key };
};

export const bstDeleteVisualizer = registerDeclarativeAlgorithm<BSTDeleteStep>({
  id: 'bst-delete',
  name: '二叉搜索树中的删除',
  category: 'tree',
  aliases: ['leetcode-450', 'delete-node-in-a-bst'],
  icon: '🗑️',
  badge: { mode: '多阶段演化: 递归直接嫁接 · 递归后继值替换 · 双指针迭代', complexity: 'O(H) · O(1)' },
  card1Title: '📊 BST 拓扑重构与节点移除沙盘',
  card2Title: '🧭 五大场景分支决策与调用栈监视器',
  card2Desc: '当前比对节点、命中状态、后继嫁接点与调整前后树形对比',
  legend: [
    { label: '目标被删节点', color: '#ef4444' },
    { label: '后继/替换节点', color: '#10b981' },
    { label: '探查路径节点', color: '#3b82f6' },
  ],
  inputs: [
    { id: 'input-tree', label: 'BST 树层序 (逗号分隔)', type: 'text', defaultValue: '5, 3, 6, 2, 4, null, 7', placeholder: '例如: 5, 3, 6, 2, 4, null, 7' },
    { id: 'input-key', label: '待删除键值 key', type: 'number', defaultValue: 3, placeholder: '例如: 3' },
  ],
  presets: [
    { label: 'LC 450 经典双子树节点 (删 3)', values: { 'input-tree': '5, 3, 6, 2, 4, null, 7', 'input-key': 3 }, description: '目标节点 3 拥有完整左右子树 (2 和 4)，测试双子树嫁接与后继替换' },
    { label: '删除根节点 (删 5)', values: { 'input-tree': '5, 3, 6, 2, 4, null, 7', 'input-key': 5 }, description: '直接删除整棵树的根节点 5，验证新根晋升与整树重构' },
    { label: '删除叶子节点 (删 7)', values: { 'input-tree': '5, 3, 6, 2, 4, null, 7', 'input-key': 7 }, description: '叶子节点无任何子树，测试直接置 null 回退' },
    { label: '删除单子树节点 (删 6)', values: { 'input-tree': '5, 3, 6, 2, 4, null, 7', 'input-key': 6 }, description: '节点 6 仅有右孩子 7，测试单孩子直接上位' },
    { label: '键不存在 (删 0)', values: { 'input-tree': '5, 3, 6, 2, 4, null, 7', 'input-key': 0 }, description: '目标值 0 不在树中，测试未命中安全返回' },
    { label: '单节点树 (删 1)', values: { 'input-tree': '1', 'input-key': 1 }, description: '仅有根节点 1，删除后树彻底变为空树 null' },
  ],
  metrics: [
    { id: 'target-key', label: '待删目标键', color: '#ef4444' },
    { id: 'cur-node', label: '当前探查节点', color: '#3b82f6' },
    { id: 'successor', label: '极小后继节点', color: '#10b981' },
  ],
  codeLanguages: BST_DELETE_STAGE1_GRAFT_CODE,
  problemHtml: BST_DELETE_PROBLEM_HTML,
  analysisHtml: BST_DELETE_ANALYSIS_HTML,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 递归直接嫁接删除 (LC 450 指针重连)',
      shortName: '递归直接嫁接',
      num: 1,
      codeLanguages: BST_DELETE_STAGE1_GRAFT_CODE,
      buildSteps: (inputs) => {
        const { root, key } = parseInput(inputs);
        return buildBstDeleteStage1Steps(root, key);
      },
      renderCanvas: (c, s) => BstDeleteCanvasAdapter.renderCanvas(c, s),
      renderCustomMetrics: (c, s) => BstDeleteCanvasAdapter.renderCustomMetrics(c, s),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 递归后继节点值覆盖 (算法导论经典解法)',
      shortName: '后继值覆盖',
      num: 2,
      codeLanguages: BST_DELETE_STAGE2_REPLACE_CODE,
      buildSteps: (inputs) => {
        const { root, key } = parseInput(inputs);
        return buildBstDeleteStage2Steps(root, key);
      },
      renderCanvas: (c, s) => BstDeleteCanvasAdapter.renderCanvas(c, s),
      renderCustomMetrics: (c, s) => BstDeleteCanvasAdapter.renderCustomMetrics(c, s),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 双指针显式迭代删除 (O(1) 辅助空间)',
      shortName: '双指针迭代',
      num: 3,
      codeLanguages: BST_DELETE_STAGE3_ITERATIVE_CODE,
      buildSteps: (inputs) => {
        const { root, key } = parseInput(inputs);
        return buildBstDeleteStage3Steps(root, key);
      },
      renderCanvas: (c, s) => BstDeleteCanvasAdapter.renderCanvas(c, s),
      renderCustomMetrics: (c, s) => BstDeleteCanvasAdapter.renderCustomMetrics(c, s),
    },
  ],
  generateSteps: (inputs) => {
    const { root, key } = parseInput(inputs);
    return buildBstDeleteStage1Steps(root, key);
  },
  buildSteps: (inputs) => {
    const { root, key } = parseInput(inputs);
    return buildBstDeleteStage1Steps(root, key);
  },
  renderCanvas: (c, s) => BstDeleteCanvasAdapter.renderCanvas(c, s),
  renderCustomMetrics: (c, s) => BstDeleteCanvasAdapter.renderCustomMetrics(c, s),
});
