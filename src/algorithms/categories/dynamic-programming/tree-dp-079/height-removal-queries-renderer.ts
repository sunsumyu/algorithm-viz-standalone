/**
 * 移除子树后的二叉树高度 (Height of Binary Tree After Subtree Removal Queries / LeetCode 2458 / 左程云 Class 079 Code05)
 * 接入顶层抽象架构：YAML 模型 + TreeDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import { compileHeightRemovalQueries } from '../../../../core/strategies/tree-heightremovalqueries';

export {
  compileHeightRemovalQueries,
  UniversalStageVisualizer,
  UniversalStageVisualizer as HeightRemovalQueriesVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'height-removal-queries',
  name: '移除子树后的二叉树高度 (LeetCode 2458)',
  viewId: 'height-removal-queries',
  category: 'dynamic-programming',
  description: '左程云算法讲解079 Code05：LeetCode 2458 移除子树后的二叉树高度。树型 DP 与 DFN 序打平经典技巧：先序遍历映射连续区间 [dfn, dfn+size-1]，结合前后缀最大深度数组 maxLeft 与 maxRight，实现 O(1) 极速查询子树移除后整树高度。',
  icon: '✂️',
  aliases: ['class079-code05', 'height-removal-queries-2458', 'leetcode-2458'],
  template: '<div id="height-removal-queries" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 7905,
  learningGoal: '深入掌握树型 DP 与 DFN 序打平技巧：理解子树节点在先序时间戳中的连续区间分布、掌握前后缀极值预处理技术，以及 O(1) 时间回答子树排除查询的高效算法架构。',
});
