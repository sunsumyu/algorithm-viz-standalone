/**
 * 二叉树的直径 (Diameter of Binary Tree / LeetCode 543 / 左程云 Class 078 Code04)
 * 接入顶层抽象架构：YAML 模型 + TreeDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import { compileTreeDiameter } from '../../../../core/strategies/tree-treediameter';

export {
  compileTreeDiameter,
  UniversalStageVisualizer,
  UniversalStageVisualizer as TreeDiameterVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'tree-diameter',
  name: '二叉树的直径 (LeetCode 543)',
  viewId: 'tree-diameter',
  category: 'dynamic-programming',
  description: '左程云算法讲解078 Code04：LeetCode 543 二叉树的直径，经典树型 DP 单边深度汇聚与拱顶拐点合并：每个节点向父汇报单侧深度，以当前节点为拐点的最长路径边数 = left + right。',
  icon: '📐',
  aliases: ['class078-code04', 'diameter-of-binary-tree', 'leetcode-543'],
  template: '<div id="tree-diameter" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 1,
  levelOrder: 7804,
  learningGoal: '掌握树型 DP 经典单边深度汇报汇聚模式：单边最大延伸 height = max(left, right) + 1，与拱顶全路径 cross = left + right 分离结算。',
});
