/**
 * 左程云算法通关课 Class 037: 修剪二叉搜索树 (Trim BST / LeetCode 669)
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { Tree036Step } from './tree-036-037-shared';
import { TRIM_BST_037_CODES } from './tree-036-037-stage-codes';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';
import {
  buildTrimBst037Steps,
} from '../../../../core/renderers/adapters/trim-bst-step-compiler';
import {
  TrimBstCanvasAdapter,
  renderTrimBstCanvas,
} from '../../../../core/renderers/adapters/trim-bst-canvas-adapter';

export { buildTrimBst037Steps, renderTrimBstCanvas };

export const trimBst037Visualizer = registerDeclarativeAlgorithm<Tree036Step>({
  id: 'tree-037-trim-bst',
  aliases: ['bst-trim'],
  name: '修剪二叉搜索树 (Class 037)',
  category: 'tree',
  icon: '✂️',
  difficulty: 2,
  levelOrder: 3706,
  learningGoal: '掌握二叉搜索树单侧越界整枝修剪的递归精髓，理解子树提升替代父节点的指针重挂机制',
  problemHtml: TREE_036_037_PROBLEMS.trimBst037.html,
  codeLanguages: TRIM_BST_037_CODES,
  inputs: [
    {
      id: 'tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '3, 0, 4, null, 2, null, null',
      width: '140px',
    },
    {
      id: 'low',
      label: '下界 low',
      type: 'number',
      defaultValue: '1',
      width: '60px',
    },
    {
      id: 'high',
      label: '上界 high',
      type: 'number',
      defaultValue: '3',
      width: '60px',
    },
  ],
  presets: [
    {
      label: '示例 1 (剪裁至 [1, 3])',
      values: { tree: '3, 0, 4, null, 2, null, null', low: '1', high: '3' },
    },
    {
      label: '剪裁全部 (区间无交集)',
      values: { tree: '3, 0, 4', low: '5', high: '10' },
    },
    {
      label: '单节点无修剪',
      values: { tree: '2', low: '1', high: '3' },
    },
  ],
  generateSteps: (inputs) => buildTrimBst037Steps(inputs?.tree, inputs?.low, inputs?.high),
  renderCanvas: (container, step) => TrimBstCanvasAdapter.renderCanvas(container, step),
});
