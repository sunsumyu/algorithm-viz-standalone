/**
 * 左程云算法通关课 Class 019: 二叉树高频递归套路 (Tree Recursion Patterns / Tree DP)
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TREE_RECURSION_019_PROBLEM_CONTENT } from './tree-recursion-patterns-019-problem-content';
import {
  TREE_RECURSION_019_CODES,
  TREE_RECURSION_019_CODE_LINES,
  TREE_RECURSION_STAGE2_CODES,
  TREE_RECURSION_STAGE2_LINES,
  TREE_RECURSION_STAGE3_CODES,
  TREE_RECURSION_STAGE3_LINES,
} from './tree-recursion-patterns-019-stage-codes';
import {
  TreeNodeData,
  TreeRecursionStep,
  getTree019PresetNodes,
  generateTreeRecursionSteps,
  generateTreeBstSteps,
  generateTreeMaxDistSteps,
} from '../../../core/renderers/adapters/tree-recursion-019-step-compiler';
import {
  TreeRecursion019CanvasAdapter,
  renderTreeRecursionCanvas,
  renderTreeRecursionCard2,
} from '../../../core/renderers/adapters/tree-recursion-019-canvas-adapter';

// 兼容导出
export type { TreeNodeData, TreeRecursionStep };
export {
  TREE_RECURSION_019_CODES,
  TREE_RECURSION_019_CODE_LINES,
  TREE_RECURSION_STAGE2_CODES,
  TREE_RECURSION_STAGE2_LINES,
  TREE_RECURSION_STAGE3_CODES,
  TREE_RECURSION_STAGE3_LINES,
  generateTreeRecursionSteps,
  generateTreeBstSteps,
  generateTreeMaxDistSteps,
  renderTreeRecursionCanvas,
  renderTreeRecursionCard2,
};

export const treeRecursion019Visualizer = registerDeclarativeAlgorithm<TreeRecursionStep>({
  id: 'tree-recursion-patterns-019',
  name: '二叉树高频递归套路 (Class 019)',
  category: 'tree',
  icon: '🌲',
  difficulty: 2,
  levelOrder: 19,
  aliases: ['class019-code01', 'tree-recursion-patterns-019', 'tree-dp-patterns'],
  learningGoal: '彻底掌握树形 DP 递归套路，学会设计统一 Info 结构体解决平衡树、搜索二叉树与树最大距离等高频考题',
  stages: [
    {
      id: 'stage1',
      name: 'Stage 1: 平衡二叉树判定 (Is Balanced)',
      shortName: '平衡判定',
      card2Title: '平衡树 DP Info 探针面板',
      card2Desc: '后序自底向上搜集 Info(isBalanced, height)',
      codeLanguages: TREE_RECURSION_019_CODES,
      generateSteps: (input) => generateTreeRecursionSteps(getTree019PresetNodes(input?.treeType, 1)),
      renderCanvas: TreeRecursion019CanvasAdapter.renderCanvas,
      renderCustomMetrics: TreeRecursion019CanvasAdapter.renderCustomMetrics,
    },
    {
      id: 'stage2',
      name: 'Stage 2: 搜索二叉树判定 (Is BST)',
      shortName: 'BST判定',
      card2Title: 'BST 递归套路 Info 探针面板',
      card2Desc: '后序自底向上搜集 Info(isBST, min, max)',
      codeLanguages: TREE_RECURSION_STAGE2_CODES,
      generateSteps: (input) => generateTreeBstSteps(getTree019PresetNodes(input?.treeType, 2)),
      renderCanvas: TreeRecursion019CanvasAdapter.renderCanvas,
      renderCustomMetrics: TreeRecursion019CanvasAdapter.renderCustomMetrics,
    },
    {
      id: 'stage3',
      name: 'Stage 3: 二叉树最大节点距离 (Max Distance)',
      shortName: '最大距离',
      card2Title: '二叉树直径与最大距离探针',
      card2Desc: '横向对比左树内、右树内与过根节点三种可能性',
      codeLanguages: TREE_RECURSION_STAGE3_CODES,
      generateSteps: (input) => generateTreeMaxDistSteps(getTree019PresetNodes(input?.treeType, 3)),
      renderCanvas: TreeRecursion019CanvasAdapter.renderCanvas,
      renderCustomMetrics: TreeRecursion019CanvasAdapter.renderCustomMetrics,
    },
  ],
  codeLanguages: TREE_RECURSION_019_CODES,
  inputs: [
    {
      id: 'treeType',
      label: '二叉树测试拓扑',
      type: 'select',
      defaultValue: 'balanced',
      options: [
        { label: '经典多层平衡/对称树', value: 'balanced' },
        { label: '破损/退化单链树', value: 'unbalanced' },
      ],
    },
  ],
  card2Title: '平衡树 DP Info 探针面板',
  card2Desc: '后序自底向上搜集 Info(isBalanced, height)',
  problemHtml: TREE_RECURSION_019_PROBLEM_CONTENT.description + TREE_RECURSION_019_PROBLEM_CONTENT.methodology,
  generateSteps: (input) => generateTreeRecursionSteps(getTree019PresetNodes(input?.treeType, 1)),
  buildSteps: (input) => generateTreeRecursionSteps(getTree019PresetNodes(input?.treeType, 1)),
  renderCanvas: TreeRecursion019CanvasAdapter.renderCanvas,
  renderCustomMetrics: TreeRecursion019CanvasAdapter.renderCustomMetrics,
});
