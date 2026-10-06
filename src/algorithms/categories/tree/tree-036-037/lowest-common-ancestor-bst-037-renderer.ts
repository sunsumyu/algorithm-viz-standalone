/**
 * 左程云算法通关课 Class 037: 二叉搜索树最近公共祖先 (LCA in BST / LeetCode 235)
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { Tree036Step } from './tree-036-037-shared';
import { LCA_BST_037_CODES } from './tree-036-037-stage-codes';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';
import {
  buildLcaBst037Steps,
} from '../../../../core/renderers/adapters/lowest-common-ancestor-bst-step-compiler';
import {
  LowestCommonAncestorBstCanvasAdapter,
  renderLcaBstCanvas,
} from '../../../../core/renderers/adapters/lowest-common-ancestor-bst-canvas-adapter';

export { buildLcaBst037Steps, renderLcaBstCanvas };

export const lowestCommonAncestorBst037Visualizer = registerDeclarativeAlgorithm<Tree036Step>({
  id: 'tree-037-lowest-common-ancestor-bst',
  aliases: ['bst-lca'],
  name: '二叉搜索树最近公共祖先 (Class 037)',
  category: 'tree',
  icon: '🔍',
  difficulty: 1,
  levelOrder: 3702,
  learningGoal: '领会二叉搜索树分叉点定理，利用数值单调性在 O(h) 时间与 O(1) 空间内直接定位 LCA',
  problemHtml: TREE_036_037_PROBLEMS.lowestCommonAncestorBst037.html,
  codeLanguages: LCA_BST_037_CODES,
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
  generateSteps: (inputs) => buildLcaBst037Steps(inputs?.tree, inputs?.p, inputs?.q),
  renderCanvas: (container, step) => LowestCommonAncestorBstCanvasAdapter.renderCanvas(container, step),
});
