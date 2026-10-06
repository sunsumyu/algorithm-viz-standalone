/**
 * 左程云算法通关课 Class 037: 判断平衡二叉树 (Balanced Binary Tree · LeetCode 110)
 * Matt Pocock 深模块轻量领域适配器 (<150 LOC)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  type BalancedTree037Step,
  collectTreeValues,
  buildBalancedStage1Steps,
  buildBalancedStage2PruneSteps,
  buildBalancedStage3StackSteps,
  buildBalancedTree037Steps,
  compileBalancedStage1,
  compileBalancedStage2,
  compileBalancedStage3,
} from '../../../../core/renderers/adapters/balanced-binary-tree-step-compiler';
import {
  BalancedBinaryTreeCanvasAdapter,
  renderBalancedTreeCanvas,
  renderBalancedCustomMetrics,
} from '../../../../core/renderers/adapters/balanced-binary-tree-canvas-adapter';
import {
  BALANCED_TREE_037_STAGE1_CODES,
  BALANCED_TREE_037_STAGE2_CODES,
  BALANCED_TREE_037_STAGE3_CODES,
} from './tree-036-037-stage-codes';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';

export type { BalancedTree037Step };
export {
  collectTreeValues,
  buildBalancedStage1Steps,
  buildBalancedStage2PruneSteps,
  buildBalancedStage3StackSteps,
  buildBalancedTree037Steps,
  renderBalancedTreeCanvas,
  renderBalancedCustomMetrics,
};

export const balancedBinaryTree037Visualizer = registerDeclarativeAlgorithm<BalancedTree037Step>({
  id: 'tree-037-balanced-binary-tree',
  aliases: ['balanced', 'leetcode-110', 'balanced-binary-tree'],
  name: '判断平衡二叉树 (Class 037)',
  category: 'tree',
  icon: '⚖️',
  difficulty: 1,
  levelOrder: 3704,
  learningGoal: '掌握左神二叉树递归套路黄金模板，构建 Info 结构体优雅自底向上汇聚高度与平衡性，并对比 -1 剪枝与显式后序栈',
  problemHtml: TREE_036_037_PROBLEMS.balancedBinaryTree037.html,
  codeLanguages: BALANCED_TREE_037_STAGE1_CODES,
  inputs: [
    {
      id: 'tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '3, 9, 20, null, null, 15, 7',
      width: '160px',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 1: 平衡二叉树 (True)',
      values: { tree: '3, 9, 20, null, null, 15, 7' },
      description: '根节点左右子树高度分别为 1 和 2，高度差为 1 <= 1，整树严格平衡',
    },
    {
      label: 'LeetCode 示例 2: 非平衡单侧拉长 (False)',
      values: { tree: '1, 2, 2, 3, 3, null, null, 4, 4' },
      description: '左侧深度为 4，右侧深度为 2，高度差为 2 > 1，触发失衡判定',
    },
    {
      label: 'LeetCode 示例 3: 单节点平衡树 (True)',
      values: { tree: '1' },
      description: '仅包含根节点 1，左右孩子皆为空，自身高度为 1，属于平衡二叉树',
    },
    {
      label: '空树用例 (True)',
      values: { tree: '[]' },
      description: '空树 (null) 深度为 0，定义上满足平衡二叉树条件',
    },
  ],
  metrics: [
    { id: 'cur', label: '当前节点', color: '#fab387' },
    { id: 'diff', label: '高度差', color: '#3b82f6' },
    { id: 'result', label: '平衡判定', color: '#10b981' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 自底向上递归与 Info 二元组套路 (Tree DP Info Model · Class 037)',
      shortName: 'Tree DP Info 套路',
      num: 1,
      codeLanguages: BALANCED_TREE_037_STAGE1_CODES,
      buildSteps: compileBalancedStage1,
      renderCanvas: renderBalancedTreeCanvas,
      renderCustomMetrics: renderBalancedCustomMetrics,
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 剪枝返回值复用优化 (-1 标记失衡 · LC 110 最优解)',
      shortName: '-1 标记失衡剪枝',
      num: 2,
      codeLanguages: BALANCED_TREE_037_STAGE2_CODES,
      buildSteps: compileBalancedStage2,
      renderCanvas: renderBalancedTreeCanvas,
      renderCustomMetrics: renderBalancedCustomMetrics,
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 显式后序遍历与深度表映射 (Iterative Postorder & Height Map · 零递归栈)',
      shortName: '后序显式栈迭代',
      num: 3,
      codeLanguages: BALANCED_TREE_037_STAGE3_CODES,
      buildSteps: compileBalancedStage3,
      renderCanvas: renderBalancedTreeCanvas,
      renderCustomMetrics: renderBalancedCustomMetrics,
    },
  ],
  generateSteps: compileBalancedStage1,
  buildSteps: compileBalancedStage1,
  renderCanvas: renderBalancedTreeCanvas,
  renderCustomMetrics: renderBalancedCustomMetrics,
});
