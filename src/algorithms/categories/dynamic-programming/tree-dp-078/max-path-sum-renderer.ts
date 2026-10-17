/**
 * 二叉树最大路径和 (Binary Tree Maximum Path Sum / LeetCode 124 / 左程云 Class 078 Code02)
 * 接入顶层抽象架构：YAML 模型 + TreeDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import { compileMaxPathSum } from '../../../../core/strategies/tree-maxpathsum';

export {
  compileMaxPathSum,
  UniversalStageVisualizer,
  UniversalStageVisualizer as MaxPathSumVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'max-path-sum',
  name: '二叉树最大路径和 (LeetCode 124)',
  viewId: 'max-path-sum',
  category: 'dynamic-programming',
  description: '左程云算法讲解078 Code02：LeetCode 124 二叉树中的最大路径和，经典树型 DP 单边增益汇报与拱顶路径合并。',
  icon: '🏔️',
  aliases: ['class078-code02', 'leetcode-124', 'max-path-sum-tree', 'binary-tree-maximum-path-sum'],
  template: '<div id="max-path-sum" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 7802,
  learningGoal: '掌握树型 DP 经典单边增益 maxGain 汇聚模式：单边最大延伸 gain(u) = val + max(0, max(gain(L), gain(R)))，与拱顶全路径合并分离结算。',
});
